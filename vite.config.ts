import { defineConfig, type Plugin } from 'vite';
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * כותב dist/version.json בסוף כל build.
 * ==זה הקובץ שהאפליקציה בודקת בכל פתיחה== (תמיד מהרשת, בלי מטמון) כדי לדעת
 * אם יש גרסה חדשה. הגרסה היא ה-SHA הקצר של הקומיט — ייחודית וקלה למעקב.
 */
function versionFilePlugin(): Plugin {
  return {
    name: 'write-version-json',
    apply: 'build',
    writeBundle(options) {
      let sha = 'dev';
      try {
        sha = execSync('git rev-parse --short HEAD').toString().trim();
      } catch {
        sha = Date.now().toString(36);
      }
      const payload = { version: sha, builtAt: new Date().toISOString() };
      const outDir = options.dir ?? 'dist';
      writeFileSync(resolve(outDir, 'version.json'), JSON.stringify(payload, null, 1));
    },
  };
}

// שם הריפו קובע את הנתיב שבו GitHub Pages מגיש את האתר:
// https://<user>.github.io/<repo>/ — כל נכס באפליקציה חייב להיות יחסי לזה.
const REPO_NAME = 'cpp-oop-course';
const BASE = process.env.GITHUB_PAGES === '1' ? `/${REPO_NAME}/` : '/';

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    versionFilePlugin(),
    VitePWA({
      // 'prompt' = לא מתעדכן לבד. אנחנו שולטים בבאנר ובזמן ההחלפה בעצמנו.
      registerType: 'prompt',
      injectRegister: false, // הרישום נעשה ידנית ב-src/lib/pwa.ts כדי לשלוט בזרימה
      includeAssets: [
        'favicon-32.png',
        'apple-touch-icon.png',
        'icon-192.png',
        'icon-512.png',
        'icon-maskable-512.png',
      ],
      manifest: {
        // יחסי ל-URL של המניפסט עצמו — חייב להיות מוגבל לתיקיית הריפו, אחרת מתנגש עם
        // כל PWA אחר שיישב בשורש david-oved.github.io
        id: BASE,
        name: 'תכנות מתקדם ב-C++',
        short_name: 'C++ מתקדם',
        description: 'אפליקציית לימוד אינטראקטיבית — תכנות מונחה עצמים ב-C++, מכון לב',
        lang: 'he',
        dir: 'rtl',
        theme_color: '#3d4ec7',
        background_color: '#0f1220',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // כל תוכן השיעורים, הסגנון והסקריפטים — כדי שהאפליקציה תיפתח לגמרי בלי רשת.
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        // ספריות ה-worker של Monaco גדולות — מעלים את התקרה כדי שגם הן ייכנסו למטמון.
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        // version.json נבדק תמיד מהרשת ולעולם לא מוגש מהמטמון — הוא מנגנון בדיקת העדכון עצמו.
        navigateFallbackDenylist: [/version\.json$/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('version.json'),
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 5173, open: true },
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor', '@monaco-editor/react'],
          anthropic: ['@anthropic-ai/sdk'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },
});

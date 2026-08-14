import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './lib/monacoSetup';
import './styles/global.css';
import App from './App';
import { LESSONS } from './content';
import { wrapProject, wrapSnippet } from './lib/wrap';
import { runProject } from './lib/compile';
import { initPwa } from './lib/pwa';
import './lib/sync'; // מפעיל את עצמו: מאזין להתחברות/התנתקות ומסנכרן עם Firestore

// נרשם רק ב-build אמיתי — ב-vite dev אין service worker (devOptions.enabled: false)
if (import.meta.env.PROD) initPwa();

// כלי בדיקה לפיתוח בלבד: מאפשר לקמפל את כל בלוקי הקוד של השיעור מהקונסולה
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__dev = {
    LESSONS,
    wrapSnippet,
    wrapProject,
    runProject,
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

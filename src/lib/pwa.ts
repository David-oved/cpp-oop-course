/**
 * PWA: רישום ה-Service Worker, ובדיקת גרסה מפורשת מול version.json.
 *
 * שני מנגנונים משלימים, בכוונה:
 * 1. Workbox (דרך vite-plugin-pwa) מודיע כש-Service Worker חדש **כבר הורד וממתין**.
 * 2. version.json הוא בדיקה שאנחנו שולטים בה לגמרי — תמיד מהרשת, אף פעם לא מהמטמון —
 *    ומאפשרת להציג למשתמש "יש עדכון" גם ביוזמתו (למשל כפתור בהגדרות), לא רק כשה-SW מתעורר.
 *
 * שני המנגנונים מובילים לאותה פעולה בסוף: applyUpdate() — מפעיל את ה-SW החדש ומרענן.
 */
import { registerSW } from 'virtual:pwa-register';
import { getAppVersion, setAppVersion } from './storage';

export type UpdateListener = (info: { available: boolean; version?: string; notes?: string }) => void;
export type OnlineListener = (online: boolean) => void;

const updateListeners = new Set<UpdateListener>();
const onlineListeners = new Set<OnlineListener>();

let updateSW: ((reload?: boolean) => Promise<void>) | null = null;
let latestKnownVersion: string | null = null;
let latestKnownNotes: string | null = null;
let pending = false;
let forcing = false;

/**
 * הודעה רגעית וגסה (DOM ישיר, לא React) — כדי שתעבוד גם אם checkVersion מסתיים
 * לפני שהאפליקציה בכלל עלתה, ולא תלויה בשום קונטקסט של קומפוננטה.
 */
function showForceUpdateNotice() {
  const el = document.createElement('div');
  el.textContent = 'מעדכן גרסה…';
  Object.assign(el.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '99999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(15,18,32,0.92)',
    color: '#fff',
    font: '600 17px/1.4 Heebo, system-ui, sans-serif',
  });
  document.body.appendChild(el);
}

function notifyUpdate() {
  for (const l of updateListeners) {
    l({ available: pending, version: latestKnownVersion ?? undefined, notes: latestKnownNotes ?? undefined });
  }
}

/** נקרא פעם אחת ב-main.tsx. רושם את ה-Service Worker ומתחיל להאזין לחיבור. */
export function initPwa() {
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      // SW חדש כבר הורד וממתין — יש עדכון גם בלי לבדוק version.json
      pending = true;
      notifyUpdate();
    },
    onOfflineReady() {
      // הכול נשמר במטמון — האפליקציה תעבוד גם בלי רשת מכאן והלאה
    },
    onRegisterError(err) {
      console.error('[pwa] service worker registration failed', err);
    },
  });

  window.addEventListener('online', () => onlineListeners.forEach((l) => l(true)));
  window.addEventListener('offline', () => onlineListeners.forEach((l) => l(false)));

  // בדיקה ראשונה עם עליית האפליקציה — בשקט, בלי לחסום את הרינדור
  void checkVersion();
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function onUpdateAvailable(fn: UpdateListener): () => void {
  updateListeners.add(fn);
  fn({ available: pending, version: latestKnownVersion ?? undefined });
  return () => updateListeners.delete(fn);
}

export function onOnlineChange(fn: OnlineListener): () => void {
  onlineListeners.add(fn);
  return () => onlineListeners.delete(fn);
}

/**
 * שולף את version.json מהרשת (בלי מטמון) ומשווה לגרסה שהותקנה בפועל.
 * ==לא נכשל בשקט על רשת מנותקת== — פשוט לא מוצא עדכון, כמו שצריך.
 */
export async function checkVersion(): Promise<{ current: string; latest: string | null; hasUpdate: boolean }> {
  const current = getAppVersion();
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}version.json`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { current, latest: null, hasUpdate: pending };
    const data = (await res.json()) as { version?: string; notes?: string; forceUpdate?: boolean };
    const latest = data.version ?? null;
    latestKnownVersion = latest;
    latestKnownNotes = data.notes ?? null;

    if (!current) {
      // התקנה ראשונה — הגרסה הנוכחית *היא* מה שהורד עכשיו, אין מה להציע לעדכן אליו
      setAppVersion(latest ?? '');
      return { current: latest ?? '', latest, hasUpdate: pending };
    }

    if (latest && latest !== current) {
      pending = true;
      // עדכון כפוי: מנהל הקורס דחף forceUpdate=true ב-release.json — לא מחכים ללחיצה
      if (data.forceUpdate && !forcing) {
        forcing = true;
        showForceUpdateNotice();
        setTimeout(() => void applyUpdate(), 1000);
      }
    }
    notifyUpdate();
    return { current, latest, hasUpdate: pending };
  } catch {
    return { current, latest: null, hasUpdate: pending };
  }
}

/** מפעיל את הגרסה החדשה: מחליף Service Worker ומרענן את הדף. */
export async function applyUpdate(): Promise<void> {
  if (latestKnownVersion) setAppVersion(latestKnownVersion);
  if (updateSW) {
    await updateSW(true); // reload=true — workbox מרענן אחרי ההפעלה
    return;
  }
  // גיבוי: אין Service Worker רשום (למשל בפיתוח מקומי) — רענון רגיל מספיק
  location.reload();
}

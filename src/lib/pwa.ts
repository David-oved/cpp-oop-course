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
 * מסך מותג מלא (DOM ישיר, לא React) — משותף לעדכון ידני ולעדכון כפוי כאחד, כדי שהחוויה
 * תהיה אחידה. DOM ישיר ולא React כי זה צריך לעבוד גם אם checkVersion מסתיים לפני שהאפליקציה
 * בכלל עלתה (עדכון כפוי שמתגלה מוקדם), ולא תלוי בשום קונטקסט של קומפוננטה. משתמש במחלקות
 * CSS מ-global.css (כבר טעון בעמוד) כדי לא לשכפל עיצוב ב-inline styles.
 */
function showUpdateOverlay() {
  const el = document.createElement('div');
  el.className = 'update-overlay';
  el.innerHTML = `
    <div class="update-overlay-mark">C++</div>
    <div class="update-overlay-text">מעדכן גרסה…</div>
  `;
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
      // עדכון כפוי: מנהל הקורס דחף forceUpdate=true ב-release.json — לא מחכים ללחיצה.
      // applyUpdate() בעצמו כבר מציג את מסך הטעינה ומחכה רגע לפני הריענון בפועל.
      if (data.forceUpdate && !forcing) {
        forcing = true;
        void applyUpdate();
      }
    }
    notifyUpdate();
    return { current, latest, hasUpdate: pending };
  } catch {
    return { current, latest: null, hasUpdate: pending };
  }
}

/**
 * מפעיל את הגרסה החדשה: מציג מסך טעינה ממותג לרגע (כדי שהמשתמש "ירגיש" את העדכון),
 * ואז מחליף Service Worker ומרענן את הדף. משותף לעדכון ידני (כפתור בבאנר) ולעדכון כפוי.
 */
export async function applyUpdate(): Promise<void> {
  showUpdateOverlay();
  if (latestKnownVersion) setAppVersion(latestKnownVersion);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  if (updateSW) {
    // updateSW(true) מחכה לאירוע controllerchange לפני שהוא מרענן. אם מסיבה כלשהי אין
    // Service Worker חדש שממתין (לדוגמה אין באמת build חדש), האירוע הזה אף פעם לא יגיע
    // וה-Promise נתקע לנצח — והמשתמש נשאר תקוע על מסך הטעינה. Promise.race עם timeout
    // מבטיח שתמיד יהיה רענון בסוף, גם אם ה-SW לא מגיב.
    await Promise.race([updateSW(true), new Promise((resolve) => setTimeout(resolve, 6000))]);
  }
  location.reload();
}

/**
 * שכבת סנכרון ענן מבוססת Firestore.
 *
 * גבול קריטי (לא לשנות!): מפתחות API, ספק/מודל פעיל, גרסת האפליקציה המותקנת,
 * ובחירת "אורח" — לעולם לא מסונכרנים, נשארים מקומיים בלבד בכל מכשיר.
 * משתמש אורח (לא מחובר עם Google) לא מקבל שום סנכרון ענן — התנאי `if (!user) return`
 * למטה הוא הגבול הזה בפועל.
 *
 * מה כן מסונכרן: התקדמות (עמודים שהושלמו), תשובות לחידונים, קוד שנכתב בתרגילים,
 * פרויקטים וקטעי קוד שמורים בסביבת הפיתוח, וערכת נושא/גודל גופן.
 *
 * מבנה בענן: מסמך יחיד לכל משתמש ב-users/{uid} (ראו firestore.rules — מוגן כך
 * שרק בעל ה-uid יכול לקרוא/לכתוב אליו). כתיבה = דריסה מלאה של המסמך (last-write-wins),
 * כדי שגם הסרות (למשל ביטול השלמה של עמוד, מחיקת פרויקט שמור) יתפשטו נכון בין מכשירים —
 * לא רק תוספות.
 *
 * איך זה מופעל: הקובץ הזה מפעיל את עצמו (initSync() בסוף הקובץ) ברגע שהוא נטען.
 * הטעינה קורית פעם אחת מ-src/main.tsx (`import './lib/sync'`) — לא נגענו ב-App.tsx
 * או בקבצים אחרים שנמצאים באמצע עריכה מקבילה.
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, onAuthChange } from './firebase';
import {
  getCompleted,
  markCompleted,
  toggleCompleted,
  getQuizState,
  getTheme,
  setTheme,
  getFontScale,
  setFontScale,
  setExerciseCode,
  resetAllProgress,
  type QuizState,
  type SavedProject,
  type Snippet,
  type Theme,
} from './storage';

// מפתחות localStorage גולמיים — חייבים להישאר זהים בדיוק לאלה המוגדרים ב-storage.ts
// (K_PROJECTS / K_SCRATCH / K_QUIZ / תחילית K_EX). הם לא מיוצאים משם (קבועים פרטיים), ובכוונה
// לא נוגעים בקובץ storage.ts כדי לא להתנגש עם עריכה מקבילה עליו.
const RAW_PROJECTS_KEY = 'cppcourse.projects';
const RAW_SCRATCH_KEY = 'cppcourse.scratch';
const RAW_QUIZ_KEY = 'cppcourse.quiz';
const RAW_EX_PREFIX = 'cppcourse.exercises.';

interface CloudDoc {
  completed: string[];
  quiz: QuizState;
  exercises: Record<string, string>;
  projects: SavedProject[];
  snippets: Snippet[];
  theme: Theme;
  fontScale: number;
  updatedAt: number;
}

function readRawArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeRawArray(key: string, value: unknown[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* מצב פרטי / אחסון מלא — מתעלמים בשקט, כמו ב-storage.ts */
  }
}

function writeRawValue(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* מצב פרטי / אחסון מלא — מתעלמים בשקט, כמו ב-storage.ts */
  }
}

/** מוחק כל מפתח cppcourse.exercises.* שה-id שלו לא ברשימת ה-id-ים שצריך להשאיר. */
function pruneExerciseCodes(keepIds: Set<string>) {
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(RAW_EX_PREFIX) && !keepIds.has(k.slice(RAW_EX_PREFIX.length))) toRemove.push(k);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}

/** סורק את כל מפתחות cppcourse.exercises.* ב-localStorage. */
function collectExerciseCodes(): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(RAW_EX_PREFIX)) continue;
    const id = k.slice(RAW_EX_PREFIX.length);
    try {
      const raw = localStorage.getItem(k);
      if (raw !== null) out[id] = JSON.parse(raw) as string;
    } catch {
      /* רשומה פגומה — מתעלמים */
    }
  }
  return out;
}

/** אוסף את כל המצב המקומי הניתן לסנכרון (בלי מפתחות API!) לאובייקט אחד. */
function collectLocalState(): CloudDoc {
  return {
    completed: [...getCompleted()],
    quiz: getQuizState(),
    exercises: collectExerciseCodes(),
    projects: readRawArray<SavedProject>(RAW_PROJECTS_KEY),
    snippets: readRawArray<Snippet>(RAW_SCRATCH_KEY),
    theme: getTheme(),
    fontScale: getFontScale(),
    updatedAt: Date.now(),
  };
}

/** כותב מצב שהגיע מהענן חזרה למקומי — דריסה מלאה, כולל הסרות. */
function applyCloudState(data: Partial<CloudDoc>) {
  if (data.completed) {
    const local = getCompleted();
    const cloud = new Set(data.completed);
    for (const id of cloud) if (!local.has(id)) markCompleted(id);
    for (const id of local) if (!cloud.has(id)) toggleCompleted(id);
  }
  if (data.quiz) writeRawValue(RAW_QUIZ_KEY, data.quiz);
  if (data.exercises) {
    pruneExerciseCodes(new Set(Object.keys(data.exercises)));
    for (const [id, code] of Object.entries(data.exercises)) setExerciseCode(id, code);
  }
  if (data.projects) writeRawArray(RAW_PROJECTS_KEY, data.projects);
  if (data.snippets) writeRawArray(RAW_SCRATCH_KEY, data.snippets);
  if (data.theme) setTheme(data.theme);
  if (typeof data.fontScale === 'number') setFontScale(data.fontScale);
}

const docRef = (uid: string) => doc(db, 'users', uid);

/** דוחף את המצב המקומי הנוכחי לענן (דריסה מלאה של מסמך המשתמש). */
export async function pushToCloud(uid: string): Promise<void> {
  await setDoc(docRef(uid), collectLocalState());
}

/**
 * מושך את מסמך המשתמש מהענן ומחיל אותו מקומית.
 * מחזיר false אם עדיין אין מסמך בענן (משתמש חדש שמתחבר לראשונה).
 */
export async function pullFromCloud(uid: string): Promise<boolean> {
  const snap = await getDoc(docRef(uid));
  if (!snap.exists()) return false;
  applyingRemote = true;
  try {
    applyCloudState(snap.data() as Partial<CloudDoc>);
  } finally {
    applyingRemote = false;
  }
  return true;
}

/* ---- הפעלה אוטומטית: מאזין להתחברות/התנתקות, ולשינויים מקומיים ---- */

let currentUid: string | null = null;
let applyingRemote = false; // חוסם לולאת פידבק: משיכה מהענן לא צריכה לגרום מיד לדחיפה בחזרה
let pushTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePush() {
  if (!currentUid || applyingRemote) return;
  if (pushTimer) clearTimeout(pushTimer);
  const uid = currentUid;
  pushTimer = setTimeout(() => {
    pushTimer = null;
    pushToCloud(uid).catch((err) => console.warn('סנכרון לענן נכשל:', err));
  }, 1500);
}

function flushPendingPush() {
  if (!pushTimer || !currentUid) return;
  clearTimeout(pushTimer);
  pushTimer = null;
  pushToCloud(currentUid).catch(() => {});
}

const SYNCED_KEY_PREFIXES = [
  'cppcourse.completed',
  'cppcourse.quiz',
  RAW_EX_PREFIX,
  RAW_PROJECTS_KEY,
  RAW_SCRATCH_KEY,
  'cppcourse.theme',
  'cppcourse.fontScale',
];

let patched = false;
function patchLocalStorage() {
  if (patched) return;
  patched = true;
  const original = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key: string, value: string) {
    original(key, value);
    if (SYNCED_KEY_PREFIXES.some((p) => key === p || key.startsWith(p))) schedulePush();
  };
  window.addEventListener('pagehide', flushPendingPush);
}

let initialized = false;
/** מפעיל את הסנכרון האוטומטי. אידמפוטנטי — קריאה חוזרת לא עושה כלום. */
export function initSync() {
  if (initialized) return;
  initialized = true;
  patchLocalStorage();
  onAuthChange((user) => {
    currentUid = user?.uid ?? null;
    if (!user) {
      // מתנתקים (או אף פעם לא התחברו): מנקים שאריות מהחשבון הקודם מה-localStorage.
      // בלי זה, במכשיר משותף (למשל מחשב בכיתה) חשבון Google הבא שיתחבר היה "יורש" את
      // ההתקדמות/תשובות/קוד של החשבון הקודם ואפילו דוחף אותם כמסמך ההתחלתי שלו בענן —
      // כי isSignedIn() חוזר להיות true ברגע שמישהו אחר מתחבר, והמפתחות עוד קיימים פיזית.
      resetAllProgress();
      return; // אורח (לא מחובר) — בלי סנכרון ענן בכלל, לפי ההחלטה בפרויקט
    }
    pullFromCloud(user.uid)
      .then((found) => {
        if (!found) return pushToCloud(user.uid); // משתמש חדש — יוצרים לו מסמך התחלתי
      })
      .catch((err) => console.warn('סנכרון ראשוני מול הענן נכשל:', err));
  });
}

initSync();

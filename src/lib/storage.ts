/** שמירה מקומית של מפתחות ה-API, התקדמות, ותשובות לתרגילים. */

import type { ProviderId } from './providers/types';
import { auth } from './firebase';

/**
 * רק משתמש מחובר (Google) שומר התקדמות — אורח מתחיל מאפס בכל כניסה, בכוונה: בלי זה
 * "אורח" היה בסך הכול מסך פתיחה קוסמטי, בזמן שהמכשיר בפועל היה זוכר הכול לתמיד.
 * לא חל על מפתחות/ספק/מודל/ערכת נושא/גרסה/בחירת כניסה — אלה הגדרות מכשיר, לא התקדמות.
 */
const isSignedIn = () => Boolean(auth.currentUser);

const K_PROVIDER = 'cppcourse.provider';
const K_KEYS = 'cppcourse.keys';
const K_MODELS = 'cppcourse.models';
const K_PROJECTS = 'cppcourse.projects';
const K_APP_VERSION = 'cppcourse.appVersion';
const K_DONE = 'cppcourse.completed';
const K_QUIZ = 'cppcourse.quiz';
const K_SCRATCH = 'cppcourse.scratch';
const K_EX = 'cppcourse.exercises';
const K_THEME = 'cppcourse.theme';
const K_LAST = 'cppcourse.lastSection';
const K_FONT = 'cppcourse.fontScale';
const K_ENTRY = 'cppcourse.entryChoice';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* מצב פרטי / אחסון מלא — מתעלמים בשקט */
  }
}

/* ---- ספק AI פעיל, מפתחות ומודלים (אחד לכל ספק) ---- */

export const getActiveProvider = () => read<ProviderId>(K_PROVIDER, 'anthropic');
export const setActiveProvider = (v: ProviderId) => write(K_PROVIDER, v);

type KeyMap = Partial<Record<ProviderId, string>>;

export const getAllKeys = () => read<KeyMap>(K_KEYS, {});
export const getKey = (p: ProviderId) => getAllKeys()[p] ?? '';
export function setKey(p: ProviderId, v: string) {
  const m = getAllKeys();
  if (v.trim()) m[p] = v.trim();
  else delete m[p];
  write(K_KEYS, m);
}

type ModelMap = Partial<Record<ProviderId, string>>;
export const getAllModels = () => read<ModelMap>(K_MODELS, {});
export const getModelFor = (p: ProviderId, fallback: string) => getAllModels()[p] ?? fallback;
export function setModelFor(p: ProviderId, v: string) {
  const m = getAllModels();
  m[p] = v;
  write(K_MODELS, m);
}

/** האם יש בכלל מפתח כלשהו מוגדר */
export const hasAnyKey = () => Object.values(getAllKeys()).some((k) => Boolean(k));

/* ---- גרסת האפליקציה המותקנת (ל-PWA) ---- */
export const getAppVersion = () => read<string>(K_APP_VERSION, '');
export const setAppVersion = (v: string) => write(K_APP_VERSION, v);

/* ---- בחירת כניסה במסך הפתיחה: גוגל מזוהה דרך Firebase עצמו, "אורח" נשמר כאן ---- */
export type EntryChoice = 'guest' | null;
export const getEntryChoice = () => read<EntryChoice>(K_ENTRY, null);
export const setEntryChoice = (v: EntryChoice) => write(K_ENTRY, v);

/* ---- פרויקטים שמורים בעורך ---- */
export interface SavedProject {
  id: string;
  name: string;
  files: { name: string; code: string }[];
  savedAt: number;
}
export const getProjects = () => (isSignedIn() ? read<SavedProject[]>(K_PROJECTS, []) : []);
export function saveProject(name: string, files: { name: string; code: string }[]): SavedProject[] {
  if (!isSignedIn()) return [];
  const list = getProjects();
  const existing = list.findIndex((p) => p.name === name);
  const proj: SavedProject = { id: `p${Date.now()}`, name, files, savedAt: Date.now() };
  if (existing >= 0) list[existing] = proj;
  else list.unshift(proj);
  const trimmed = list.slice(0, 40);
  write(K_PROJECTS, trimmed);
  return trimmed;
}
export function deleteProject(id: string): SavedProject[] {
  if (!isSignedIn()) return [];
  const list = getProjects().filter((p) => p.id !== id);
  write(K_PROJECTS, list);
  return list;
}

/* ---- ערכת נושא וגודל גופן ---- */
export type Theme = 'light' | 'dark';
export const getTheme = () => read<Theme>(K_THEME, 'light');
export const setTheme = (v: Theme) => write(K_THEME, v);
export const getFontScale = () => read<number>(K_FONT, 1);
export const setFontScale = (v: number) => write(K_FONT, v);

/* ---- התקדמות: עמודים שהושלמו ---- */
export const getCompleted = () => (isSignedIn() ? new Set(read<string[]>(K_DONE, [])) : new Set<string>());
export function toggleCompleted(sectionKey: string): Set<string> {
  if (!isSignedIn()) return new Set<string>();
  const s = getCompleted();
  if (s.has(sectionKey)) s.delete(sectionKey);
  else s.add(sectionKey);
  write(K_DONE, [...s]);
  return s;
}
export function markCompleted(sectionKey: string): Set<string> {
  if (!isSignedIn()) return new Set<string>();
  const s = getCompleted();
  s.add(sectionKey);
  write(K_DONE, [...s]);
  return s;
}

/* ---- מיקום אחרון ---- */
export const getLastSection = () => (isSignedIn() ? read<string | null>(K_LAST, null) : null);
export const setLastSection = (v: string) => {
  if (isSignedIn()) write(K_LAST, v);
};

/* ---- תוצאות חידונים ---- */
export type QuizState = Record<string, { picked: number[]; revealed: boolean; correct: boolean }>;
export const getQuizState = () => (isSignedIn() ? read<QuizState>(K_QUIZ, {}) : {});
export function saveQuizAnswer(id: string, v: QuizState[string]) {
  if (!isSignedIn()) return;
  const s = getQuizState();
  s[id] = v;
  write(K_QUIZ, s);
}

/* ---- קוד שהמשתמש כתב בתרגילים ---- */
export const getExerciseCode = (id: string) => (isSignedIn() ? read<string | null>(`${K_EX}.${id}`, null) : null);
export const setExerciseCode = (id: string, code: string) => {
  if (isSignedIn()) write(`${K_EX}.${id}`, code);
};

/* ---- קטעי קוד שמורים בסביבת הפיתוח ---- */
export interface Snippet {
  id: string;
  name: string;
  code: string;
  savedAt: number;
}
export const getSnippets = () => (isSignedIn() ? read<Snippet[]>(K_SCRATCH, []) : []);
export function saveSnippet(name: string, code: string): Snippet[] {
  if (!isSignedIn()) return [];
  const list = getSnippets();
  const s: Snippet = { id: `s${Date.now()}`, name, code, savedAt: Date.now() };
  list.unshift(s);
  const trimmed = list.slice(0, 50);
  write(K_SCRATCH, trimmed);
  return trimmed;
}
export function deleteSnippet(id: string): Snippet[] {
  if (!isSignedIn()) return [];
  const list = getSnippets().filter((s) => s.id !== id);
  write(K_SCRATCH, list);
  return list;
}

/* ---- איפוס מלא ---- */
export function resetAllProgress() {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (
      k &&
      k.startsWith('cppcourse.') &&
      k !== K_KEYS &&
      k !== K_PROVIDER &&
      k !== K_MODELS &&
      k !== K_THEME &&
      k !== K_APP_VERSION &&
      k !== K_ENTRY
    )
      keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}

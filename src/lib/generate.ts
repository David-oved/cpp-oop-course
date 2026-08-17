/**
 * "המערכת החכמה" — ייצור שיעור מלא מתוך PDF מצגת, על ידי ה-AI של המשתמש עצמו.
 *
 * זה מימוש של AGENTS.md §13 פריטים 0.7/0.8/0.9 (חלקי — טקסט בלבד, לא תמונות) ו-0.10 (חלקי —
 * ראה LessonBuilder.tsx). ראה §6.5 לסדר הבנייה המלא ו-§6.3 להנחות שהפיצ'ר הזה שובר בכוונה.
 *
 * העיקרון המרכזי (לפי הנחיה מפורשת): **לא** שולחים את כל המצגת ל-AI בבקשה אחת. שולחים
 * בשני שלבים:
 *   1. מניפסט — כל הטקסט הגולמי (קטן יחסית) בבקשה אחת, מחזיר תוכנית עבודה (אילו סעיפים/
 *      פרקים קיימים, ואילו שקפים שייכים לכל אחד).
 *   2. תוכן — סעיף-סעיף (כמה שקפים בכל פעם), בלולאה עם ולידציה ותיקון עצמי (retry) לפני
 *      שממשיכים לסעיף הבא. כך גם אם המצגת ארוכה (70 שקפים), כל קריאה בודדת ל-AI קטנה וזולה,
 *      וכשל בסעיף אחד לא פוגע בכל השאר.
 *
 * זהו נתיב AI **נפרד לגמרי** מהצ'אט האינטראקטיבי (lib/ai.ts) — ראה generatePrompts.ts.
 * זה גם המקום היחיד באפליקציה שמבקש מפלט AI **מבנה JSON** ולא טקסט חופשי/Markdown.
 */

import { activeSetup, resolveWorkingModel } from './ai';
import { setModelFor } from './storage';
import type { Provider } from './providers';
import {
  validateManifest,
  validateSection,
  type SectionManifestEntry,
} from './contentValidate';
import type { Chapter, Lesson, Section } from '../types/content';
import {
  MANIFEST_SYSTEM,
  SECTION_SYSTEM,
  GOALS_SYSTEM,
  buildManifestUser,
  buildSectionUser,
  buildGoalsUser,
  buildRetryNote,
  type LessonMeta,
} from './generatePrompts';

export interface GenerateProgress {
  phase: 'manifest' | 'sections' | 'goals' | 'done';
  message: string;
  sectionIndex?: number;
  sectionTotal?: number;
}

export interface GenerateOptions {
  onProgress?: (p: GenerateProgress) => void;
  signal?: AbortSignal;
  /** כמה ניסיונות (כולל הראשון) לפני שנכשלים על סעיף/מניפסט בודד. ברירת מחדל 3. */
  maxAttempts?: number;
}

export interface GenerateResult {
  lesson: Lesson;
  manifest: SectionManifestEntry[];
  /** סעיפים שנכשלו אחרי כל הניסיונות — השיעור עדיין מוחזר בלעדיהם, עם רשימת הפערים */
  failedSections: { sectionId: string; sectionTitle: string; error: string }[];
}

/**
 * נזרקת כשה-AI קבע שהקובץ שהועלה אינו מצגת/מסמך קורס (ראה "בדיקת סף" ב-generatePrompts.ts).
 * שגיאה **סופית**, לא זמנית — generateValidated לא מנסה שוב עליה, ו-LessonBuilder.tsx
 * מציג אותה כהודעה ייעודית שמפנה את המשתמש לבחור קובץ אחר, לא כשגיאת רשת/ולידציה רגילה.
 */
export class NotAPresentationError extends Error {}

function isNotAPresentation(data: unknown): data is { notAPresentation: true; reason?: string } {
  return typeof data === 'object' && data !== null && (data as { notAPresentation?: unknown }).notAPresentation === true;
}

const MAX_TOKENS_MANIFEST = 8000;
const MAX_TOKENS_SECTION = 8000;
const MAX_TOKENS_GOALS = 1000;

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new Error('הייצור בוטל.');
}

/** קורא ל-AI פעם אחת עם system+user, מחזיר את הטקסט המלא (בלי streaming ל-UI — רק צבירה). */
async function callOnce(
  system: string,
  user: string,
  opts: { maxTokens: number; signal?: AbortSignal }
): Promise<string> {
  const { provider, key } = activeSetup();
  if (!key) {
    throw new Error(`לא הוגדר מפתח עבור ${provider.vendor}. פתח ⚙ הגדרות → בחר ספק → הדבק מפתח.`);
  }

  const model = await ensureModel(provider, key, opts.signal);
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  opts.signal?.addEventListener('abort', onAbort);

  try {
    return await new Promise<string>((resolve, reject) => {
      let full = '';
      void provider.stream(
        {
          apiKey: key,
          model,
          system,
          messages: [{ role: 'user', content: user }],
          signal: controller.signal,
          maxTokens: opts.maxTokens,
        },
        {
          onText: (t) => {
            full += t;
          },
          onDone: (f) => resolve(f || full),
          onError: (m) => reject(new Error(m)),
        }
      );
    });
  } finally {
    opts.signal?.removeEventListener('abort', onAbort);
  }
}

let cachedModel: { providerId: string; model: string } | null = null;

/** מאתר מודל עובד פעם אחת לכל ריצת ייצור, וממשיך להשתמש בו (בלי לבדוק שוב בכל קריאה). */
async function ensureModel(provider: Provider, key: string, signal?: AbortSignal): Promise<string> {
  if (cachedModel?.providerId === provider.id) return cachedModel.model;
  const { model } = activeSetup();
  if (model) {
    cachedModel = { providerId: provider.id, model };
    return model;
  }
  const r = await resolveWorkingModel(provider, key, signal ?? new AbortController().signal);
  setModelFor(provider.id, r.model);
  cachedModel = { providerId: provider.id, model: r.model };
  return r.model;
}

/** מוציא JSON מתשובת AI: מסיר גדרות ```/```json, ומאתר את ה-JSON המאוזן הראשון (אובייקט או מערך). */
export function extractJson(raw: string): unknown {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();

  const start = s.search(/[[{]/);
  if (start === -1) throw new Error('לא נמצא JSON בתשובת ה-AI (התשובה לא הכילה { או [).');
  const open = s[start];
  const close = open === '{' ? '}' : ']';

  let depth = 0;
  let inStr = false;
  let esc = false;
  let end = -1;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      continue;
    }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) {
    throw new Error('ה-JSON בתשובת ה-AI לא נסגר כראוי — כנראה הפלט נחתך (ארוך מדי למגבלת האסימונים).');
  }
  try {
    return JSON.parse(s.slice(start, end + 1));
  } catch (e) {
    throw new Error(`JSON לא תקין: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/** קורא ל-AI ומאמת את הפלט, עם ניסיונות חוזרים שמזינים את שגיאות הולידציה בחזרה למודל. */
async function generateValidated<T>(
  system: string,
  buildUser: (retryNote?: string) => string,
  validate: (data: unknown) => { valid: boolean; errors: string[] },
  opts: { maxTokens: number; signal?: AbortSignal; maxAttempts: number }
): Promise<T> {
  let lastErrors: string[] = [];
  let lastRaw = '';
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    throwIfAborted(opts.signal);
    const user = attempt === 1 ? buildUser() : buildUser(buildRetryNote(lastRaw, lastErrors));
    const raw = await callOnce(system, user, { maxTokens: opts.maxTokens, signal: opts.signal });
    lastRaw = raw;
    try {
      const data = extractJson(raw);
      if (isNotAPresentation(data)) {
        throw new NotAPresentationError(data.reason || 'הקובץ שהועלה לא נראה כמו מצגת/מסמך קורס.');
      }
      const res = validate(data);
      if (res.valid) return data as T;
      lastErrors = res.errors;
    } catch (e) {
      if (e instanceof NotAPresentationError) throw e; // סופי — לא retry, אין טעם לנסות שוב על אותו קובץ
      lastErrors = [e instanceof Error ? e.message : String(e)];
    }
  }
  throw new Error(`נכשל אחרי ${opts.maxAttempts} ניסיונות:\n${lastErrors.map((e) => `• ${e}`).join('\n')}`);
}

/** שלב 1: שולח את כל טקסט המצגת בבקשה אחת, מחזיר תוכנית סעיפים/פרקים מאומתת. */
export async function generateManifest(
  meta: LessonMeta,
  pages: string[],
  opts: GenerateOptions = {}
): Promise<SectionManifestEntry[]> {
  opts.onProgress?.({ phase: 'manifest', message: 'שולח את כל השקפים ל-AI כדי לתכנן פרקים וסעיפים…' });
  const result = await generateValidated<unknown>(
    MANIFEST_SYSTEM,
    () => buildManifestUser(meta, pages),
    (data) => {
      const r = validateManifest(data);
      return { valid: r.valid, errors: r.errors };
    },
    { maxTokens: MAX_TOKENS_MANIFEST, signal: opts.signal, maxAttempts: opts.maxAttempts ?? 3 }
  );
  const { entries } = validateManifest(result);

  const total = pages.length;
  const covered = new Set(entries.flatMap((e) => e.slides ?? []));
  const missing = Array.from({ length: total }, (_, i) => i + 1).filter((n) => !covered.has(n));
  if (missing.length > 0) {
    throw new Error(
      `המניפסט לא כיסה את כל השקפים — חסרים: ${missing.join(', ')}. נסה שוב, ואם זה חוזר — ` +
        'ייתכן שהמצגת ארוכה מדי לבקשה אחת; פנה לפיתוח כדי לפצל את שלב המניפסט.'
    );
  }
  opts.onProgress?.({ phase: 'manifest', message: `המניפסט מוכן: ${entries.length} סעיפים.` });
  return entries;
}

/** שלב 2: מייצר סעיף בודד (עמוד אחד) מהשקפים ששייכים לו, עם ולידציה + retry. */
export async function generateSection(
  meta: LessonMeta,
  entry: SectionManifestEntry,
  pages: string[],
  context: { prevSectionTitle?: string; nextSectionTitle?: string },
  opts: GenerateOptions = {}
): Promise<Section> {
  const slideTexts = (entry.slides ?? []).map((n) => ({ slide: n, text: pages[n - 1] ?? '' }));
  const data = await generateValidated<Section>(
    SECTION_SYSTEM,
    (retryNote) => buildSectionUser(meta, entry, slideTexts, context) + (retryNote ?? ''),
    (d) => {
      const errors: string[] = [];
      const ok = validateSection(d, 'section', errors);
      return { valid: ok, errors };
    },
    { maxTokens: MAX_TOKENS_SECTION, signal: opts.signal, maxAttempts: opts.maxAttempts ?? 3 }
  );
  // מוודאים שה-id/slides נשארים בדיוק כפי שנקבעו במניפסט, גם אם ה-AI "תיקן" אותם
  return { ...data, id: entry.sectionId, slides: entry.slides ?? data.slides };
}

/** שלב 3 (קטן): מטרות למידה לשיעור, מתוך כותרות הפרקים/הסעיפים בלבד. */
export async function generateGoals(
  meta: LessonMeta,
  chapterTitles: string[],
  sectionTitles: string[],
  opts: GenerateOptions = {}
): Promise<string[]> {
  try {
    const raw = await callOnce(GOALS_SYSTEM, buildGoalsUser(meta, chapterTitles, sectionTitles), {
      maxTokens: MAX_TOKENS_GOALS,
      signal: opts.signal,
    });
    const data = extractJson(raw);
    if (Array.isArray(data) && data.every((x) => typeof x === 'string')) return data as string[];
    return [];
  } catch {
    // מטרות הן תוספת נחמדה, לא קריטיות — כישלון כאן לא אמור להפיל את כל הייצור
    return [];
  }
}

/**
 * מריץ את כל התהליך: מניפסט → סעיף-סעיף (ברצף, לא במקביל — כדי לשלוט בקצב ובעלות ולתת
 * לכל סעיף הקשר על הסעיף שלפניו) → מטרות. מחזיר Lesson שלם, גם אם חלק מהסעיפים נכשלו
 * (הם פשוט חסרים מהפרק שלהם, ומדווחים ב-failedSections).
 */
export async function generateLesson(meta: LessonMeta, pages: string[], opts: GenerateOptions = {}): Promise<GenerateResult> {
  cachedModel = null; // ריצה חדשה — לא סומכים על cache ממודל שאולי כבר לא תקף
  const manifest = await generateManifest(meta, pages, opts);

  const chapterOrder: string[] = [];
  const chaptersById = new Map<string, { title: string; sections: Section[] }>();
  for (const e of manifest) {
    if (!chaptersById.has(e.chapterId)) {
      chaptersById.set(e.chapterId, { title: e.chapterTitle, sections: [] });
      chapterOrder.push(e.chapterId);
    }
  }

  const failedSections: GenerateResult['failedSections'] = [];
  for (let i = 0; i < manifest.length; i++) {
    throwIfAborted(opts.signal);
    const entry = manifest[i];
    opts.onProgress?.({
      phase: 'sections',
      message: `כותב סעיף "${entry.sectionTitle}" (${i + 1}/${manifest.length})…`,
      sectionIndex: i + 1,
      sectionTotal: manifest.length,
    });
    try {
      const section = await generateSection(
        meta,
        entry,
        pages,
        { prevSectionTitle: manifest[i - 1]?.sectionTitle, nextSectionTitle: manifest[i + 1]?.sectionTitle },
        opts
      );
      chaptersById.get(entry.chapterId)!.sections.push(section);
    } catch (e) {
      failedSections.push({
        sectionId: entry.sectionId,
        sectionTitle: entry.sectionTitle,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  opts.onProgress?.({ phase: 'goals', message: 'מסכם מטרות למידה…' });
  const goals = await generateGoals(
    meta,
    chapterOrder.map((id) => chaptersById.get(id)!.title),
    manifest.map((e) => e.sectionTitle),
    opts
  );

  const chapters: Chapter[] = chapterOrder
    .map((id) => ({ id, title: chaptersById.get(id)!.title, sections: chaptersById.get(id)!.sections }))
    .filter((c) => c.sections.length > 0);

  const lesson: Lesson = {
    id: `l${String(meta.num).padStart(2, '0')}`,
    num: meta.num,
    title: meta.title,
    subtitle: meta.subtitle,
    source: meta.source,
    slideCount: pages.length,
    goals,
    chapters,
    ready: failedSections.length === 0,
  };

  opts.onProgress?.({
    phase: 'done',
    message:
      failedSections.length === 0
        ? 'הסתיים בהצלחה.'
        : `הסתיים עם ${failedSections.length} סעיפים שנכשלו — ראה פירוט.`,
  });

  return { lesson, manifest, failedSections };
}

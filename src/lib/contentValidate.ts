/**
 * ולידטור זמן-ריצה לסכימת התוכן (`types/content.ts`).
 *
 * התוכן הידני עובר `tsc` בזמן בנייה, אבל תוכן שנוצר על ידי AI (lib/generate.ts) מגיע כ-JSON
 * גולמי בזמן ריצה — בלי שום בדיקת טיפוסים. זה הביטחון היחיד לפני שהוא נכנס לרינדור/לאחסון.
 * (AGENTS.md §13 0.1). לא זורק — תמיד מחזיר רשימת שגיאות קריאה כדי שאפשר להזין אותן בחזרה
 * ל-AI לתיקון עצמי (retry).
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const CALLOUT_VARIANTS = new Set([
  'info', 'tip', 'warn', 'danger', 'exam', 'modern', 'crefresh', 'slide',
]);

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
const isArr = (v: unknown): v is unknown[] => Array.isArray(v);
const isStrArr = (v: unknown): v is string[] => isArr(v) && v.every(isStr);
const isNumArr = (v: unknown): v is number[] => isArr(v) && v.every(isNum);

function need(cond: boolean, path: string, msg: string, errors: string[]): boolean {
  if (!cond) errors.push(`${path}: ${msg}`);
  return cond;
}

/** מוודא שדה md/text קיים (אם הוא אמור להיות מוצג עם renderInline, החוסן שם כבר מבטיח בטיחות). */
function optStr(v: unknown): v is string | undefined {
  return v === undefined || isStr(v);
}

export function validateBlock(b: unknown, path: string, errors: string[]): boolean {
  if (!isObj(b)) return need(false, path, 'הבלוק אינו אובייקט', errors);
  const kind = b.kind;
  if (!isStr(kind)) return need(false, path, 'לבלוק חסר kind', errors);

  switch (kind) {
    case 'heading':
      return (
        need([2, 3, 4].includes(b.level as number), `${path}.level`, 'level חייב להיות 2/3/4', errors) &&
        need(isStr(b.text), `${path}.text`, 'text חסר', errors)
      );
    case 'prose':
      return need(isStr(b.md), `${path}.md`, 'md חסר', errors);
    case 'list':
      return (
        need(isStrArr(b.items), `${path}.items`, 'items חייב להיות מערך מחרוזות', errors) &&
        need(optStr(b.title), `${path}.title`, 'title לא תקין', errors)
      );
    case 'callout':
      return (
        need(CALLOUT_VARIANTS.has(b.variant as string), `${path}.variant`, 'variant לא מוכר', errors) &&
        need(isStr(b.md), `${path}.md`, 'md חסר', errors)
      );
    case 'code': {
      let ok = true;
      if (isArr(b.files)) {
        ok = b.files.every(
          (f, i) => isObj(f) && need(isStr(f.name), `${path}.files[${i}].name`, 'name חסר', errors) &&
            need(isStr(f.code), `${path}.files[${i}].code`, 'code חסר', errors)
        );
      } else if (b.code !== undefined) {
        ok = need(isStr(b.code), `${path}.code`, 'code חייב להיות מחרוזת', errors);
      } else {
        ok = need(false, path, 'חייב code או files', errors);
      }
      if (b.highlight !== undefined) ok = need(isNumArr(b.highlight), `${path}.highlight`, 'highlight חייב להיות מערך מספרים', errors) && ok;
      return ok;
    }
    case 'compare': {
      const side = (s: unknown, p: string) =>
        isObj(s) &&
        need(isStr(s.title), `${p}.title`, 'title חסר', errors) &&
        need(isStr(s.code), `${p}.code`, 'code חסר', errors);
      return (
        need(isObj(b.left), `${path}.left`, 'left חסר', errors) && side(b.left, `${path}.left`) &&
        need(isObj(b.right), `${path}.right`, 'right חסר', errors) && side(b.right, `${path}.right`)
      );
    }
    case 'memory':
      return (
        need(isStr(b.code), `${path}.code`, 'code חסר', errors) &&
        need(isArr(b.steps) && b.steps.every((s) => isObj(s) && isStr(s.caption) && isArr(s.stack)), `${path}.steps`, 'steps לא תקין — כל צעד צריך caption ו-stack', errors)
      );
    case 'quiz':
      return (
        need(isStr(b.question), `${path}.question`, 'question חסר', errors) &&
        need(
          isArr(b.options) && b.options.length > 0 &&
            b.options.every((o) => isObj(o) && isStr(o.text) && isBool(o.correct) && isStr(o.explain)),
          `${path}.options`,
          'options לא תקין — כל אפשרות צריכה text/correct/explain',
          errors
        )
      );
    case 'pitfall':
      return (
        need(isStr(b.title), `${path}.title`, 'title חסר', errors) &&
        need(isStr(b.badCode), `${path}.badCode`, 'badCode חסר', errors) &&
        need(isStr(b.explain), `${path}.explain`, 'explain חסר', errors)
      );
    case 'exercise':
      return (
        need(isStr(b.id), `${path}.id`, 'id חסר', errors) &&
        need(isStr(b.title), `${path}.title`, 'title חסר', errors) &&
        need([1, 2, 3].includes(b.level as number), `${path}.level`, 'level חייב להיות 1/2/3', errors) &&
        need(isStr(b.brief), `${path}.brief`, 'brief חסר', errors) &&
        need(isStr(b.starter), `${path}.starter`, 'starter חסר', errors) &&
        need(isStrArr(b.hints), `${path}.hints`, 'hints חייב להיות מערך מחרוזות', errors) &&
        need(isStr(b.solution), `${path}.solution`, 'solution חסר', errors)
      );
    case 'table':
      return (
        need(isStrArr(b.headers), `${path}.headers`, 'headers חייב להיות מערך מחרוזות', errors) &&
        need(isArr(b.rows) && b.rows.every(isStrArr), `${path}.rows`, 'rows חייב להיות מערך של מערכי מחרוזות', errors)
      );
    case 'terms':
      return need(
        isArr(b.items) && b.items.every((t) => isObj(t) && isStr(t.he) && isStr(t.en)),
        `${path}.items`,
        'items לא תקין — כל מונח צריך he/en',
        errors
      );
    case 'steps':
      return need(
        isArr(b.items) && b.items.every((s) => isObj(s) && isStr(s.title) && isStr(s.md)),
        `${path}.items`,
        'items לא תקין — כל שלב צריך title/md',
        errors
      );
    case 'diagram':
      return need(isStr(b.svg), `${path}.svg`, 'svg חסר', errors);
    case 'divider':
      return true;
    default:
      return need(false, path, `kind לא מוכר: "${kind}"`, errors);
  }
}

export function validateSection(s: unknown, path: string, errors: string[]): boolean {
  if (!isObj(s)) return need(false, path, 'ה-section אינו אובייקט', errors);
  let ok =
    need(isStr(s.id), `${path}.id`, 'id חסר', errors) &&
    need(isStr(s.title), `${path}.title`, 'title חסר', errors) &&
    need(isArr(s.blocks), `${path}.blocks`, 'blocks חייב להיות מערך', errors);
  if (s.slides !== undefined) ok = need(isNumArr(s.slides), `${path}.slides`, 'slides חייב להיות מערך מספרים', errors) && ok;
  if (isArr(s.blocks)) s.blocks.forEach((b, i) => { if (!validateBlock(b, `${path}.blocks[${i}]`, errors)) ok = false; });
  return ok;
}

export function validateChapter(c: unknown, path: string, errors: string[]): boolean {
  if (!isObj(c)) return need(false, path, 'ה-chapter אינו אובייקט', errors);
  let ok =
    need(isStr(c.id), `${path}.id`, 'id חסר', errors) &&
    need(isStr(c.title), `${path}.title`, 'title חסר', errors) &&
    need(isArr(c.sections), `${path}.sections`, 'sections חייב להיות מערך', errors);
  if (isArr(c.sections)) c.sections.forEach((s, i) => { if (!validateSection(s, `${path}.sections[${i}]`, errors)) ok = false; });
  return ok;
}

export function validateLesson(l: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isObj(l)) return { valid: false, errors: ['השיעור אינו אובייקט'] };
  let ok =
    need(isStr(l.id), 'lesson.id', 'id חסר', errors) &&
    need(isStr(l.title), 'lesson.title', 'title חסר', errors) &&
    need(isArr(l.chapters), 'lesson.chapters', 'chapters חייב להיות מערך', errors);
  if (isArr(l.chapters)) l.chapters.forEach((c, i) => { if (!validateChapter(c, `lesson.chapters[${i}]`, errors)) ok = false; });
  return { valid: ok, errors };
}

/* ---------- מניפסט הסעיפים (§ המערכת החכמה) ----------
   ה-AI מייצר את זה לפני/בנפרד מתוכן הבלוקים המלא, כדי שהאפליקציה תדע אילו פרקים/עמודים
   קיימים במצגת עוד לפני שכל נתח נוצר. ראה lib/generate.ts. */

export interface SectionManifestEntry {
  chapterId: string;
  chapterTitle: string;
  sectionId: string;
  sectionTitle: string;
  slides?: number[];
}

export function validateManifest(m: unknown): { valid: boolean; errors: string[]; entries: SectionManifestEntry[] } {
  const errors: string[] = [];
  if (!isArr(m)) return { valid: false, errors: ['המניפסט חייב להיות מערך'], entries: [] };
  const entries: SectionManifestEntry[] = [];
  m.forEach((e, i) => {
    const p = `manifest[${i}]`;
    if (!isObj(e)) { errors.push(`${p}: אינו אובייקט`); return; }
    const ok =
      need(isStr(e.chapterId), `${p}.chapterId`, 'chapterId חסר', errors) &&
      need(isStr(e.chapterTitle), `${p}.chapterTitle`, 'chapterTitle חסר', errors) &&
      need(isStr(e.sectionId), `${p}.sectionId`, 'sectionId חסר', errors) &&
      need(isStr(e.sectionTitle), `${p}.sectionTitle`, 'sectionTitle חסר', errors);
    if (ok) {
      entries.push({
        chapterId: e.chapterId as string,
        chapterTitle: e.chapterTitle as string,
        sectionId: e.sectionId as string,
        sectionTitle: e.sectionTitle as string,
        slides: isNumArr(e.slides) ? e.slides : undefined,
      });
    }
  });
  return { valid: errors.length === 0, errors, entries };
}

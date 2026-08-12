/**
 * סכימת התוכן של האפליקציה.
 * כל שיעור מורכב מפרקים, כל פרק מ"עמודים" (Section), וכל עמוד מבלוקים.
 * הבלוקים הם אבני הבניין שהמשתמש רואה — טקסט, קוד רץ, דיאגרמת זיכרון, חידון וכו'.
 */

/* ---------- דיאגרמת זיכרון מונפשת ---------- */

export interface MemVar {
  /** שם המשתנה/השדה */
  name: string;
  /** הערך המוצג בתא */
  value: string;
  /** טיפוס להצגה (אופציונלי) */
  type?: string;
  /** כתובת מדומה, למשל 0x7ffe10 */
  addr?: string;
  /** מצב ויזואלי בצעד הנוכחי */
  state?: 'new' | 'changed' | 'reading' | 'dead' | 'garbage';
  /** אם המשתנה הוא מצביע — id של אובייקט בערימה שאליו הוא מצביע */
  pointsTo?: string | null;
}

export interface MemFrame {
  /** שם הפריים, למשל "main()" או "Rect::setLength()" */
  label: string;
  vars: MemVar[];
  /** האם זו המסגרת הפעילה כרגע */
  active?: boolean;
}

export interface MemHeapObj {
  id: string;
  label: string;
  fields: MemVar[];
  addr?: string;
  state?: 'new' | 'changed' | 'freed' | 'leaked';
}

export interface MemoryStep {
  /** מספר השורה בקוד שמודגשת בצעד זה (1-based) */
  line?: number;
  /** ההסבר שמלווה את הצעד */
  caption: string;
  /** הסבר מורחב אופציונלי */
  detail?: string;
  stack: MemFrame[];
  heap?: MemHeapObj[];
  /** פלט שנצבר עד כה */
  output?: string;
}

/* ---------- בלוקים ---------- */

export type CalloutVariant =
  | 'info' // מידע כללי
  | 'tip' // טיפ מעשי
  | 'warn' // שימו לב / מלכודת
  | 'danger' // שגיאה נפוצה חמורה
  | 'exam' // מה נוהג להופיע במבחן
  | 'modern' // הערת צד: איך כותבים את זה ב-C++ מודרני
  | 'crefresh' // רענון מהיר: מושג מקורס C
  | 'slide'; // ציטוט/הפניה למצגת המקורית

export interface CodeAnnotation {
  /** מספר שורה 1-based */
  line: number;
  text: string;
}

export interface CodeFile {
  name: string;
  code: string;
}

export type Block =
  /** כותרת בתוך העמוד */
  | { kind: 'heading'; level: 2 | 3 | 4; text: string }
  /** פסקת טקסט. תומכת בסימון מוטבע: **מודגש**, `קוד`, *נטוי*, [[מונח|הסבר]] */
  | { kind: 'prose'; md: string }
  /** רשימה */
  | { kind: 'list'; ordered?: boolean; items: string[]; title?: string }
  /** תיבת הדגשה צבעונית */
  | { kind: 'callout'; variant: CalloutVariant; title?: string; md: string }
  /** בלוק קוד. runnable=true מוסיף כפתור הרצה אמיתי */
  | {
      kind: 'code';
      lang?: 'cpp' | 'text' | 'bash' | 'output';
      title?: string;
      /** הקוד. אופציונלי כשמסופק `files` (פרויקט מרובה קבצים) */
      code?: string;
      /** שורות להדגשה (1-based) */
      highlight?: number[];
      annotations?: CodeAnnotation[];
      /** פלט צפוי שמוצג מתחת לקוד בלי להריץ */
      output?: string;
      /** מאפשר הרצה אמיתית דרך הקומפיילר */
      runnable?: boolean;
      /** קלט סטנדרטי להרצה */
      stdin?: string;
      /** פרויקט מרובה קבצים — יאוחדו לקובץ אחד לצורך הרצה */
      files?: CodeFile[];
      /** האם הקוד אמור להיכשל בקומפילציה (מוצג עם מסגרת אדומה) */
      broken?: boolean;
      /** מבטל עטיפה אוטומטית ב-int main — לקטעים שאמורים להיכשל בכוונה */
      noWrap?: boolean;
      /**
       * הגדרות שהקטע נשען עליהן אך אינן מוצגות בו (למשל מחלקה מעמוד קודם).
       * נוספות בשקט לפני ההרצה, ונראות בלחיצה על "הצג את הקובץ המלא".
       */
      prelude?: string;
      caption?: string;
    }
  /** השוואה של שתי גרסאות קוד זו לצד זו */
  | {
      kind: 'compare';
      title?: string;
      left: { title: string; code: string; note?: string; verdict?: 'good' | 'bad' | 'neutral' };
      right: { title: string; code: string; note?: string; verdict?: 'good' | 'bad' | 'neutral' };
    }
  /** דיאגרמת זיכרון מונפשת עם ניווט צעד-צעד */
  | {
      kind: 'memory';
      title?: string;
      intro?: string;
      code: string;
      steps: MemoryStep[];
    }
  /** חידון רב-ברירה. multi=true לבחירה מרובה */
  | {
      kind: 'quiz';
      question: string;
      /** קוד שמוצג מעל השאלה, למשל "מה יודפס?" */
      code?: string;
      multi?: boolean;
      options: { text: string; correct: boolean; explain: string }[];
    }
  /** מלכודת נפוצה: קוד שבור → שגיאת הקומפיילר → תיקון */
  | {
      kind: 'pitfall';
      title: string;
      badCode: string;
      /** הודעת השגיאה המדויקת של הקומפיילר */
      error?: string;
      explain: string;
      goodCode?: string;
      goodNote?: string;
    }
  /** תרגיל תרגול עם רמזים ופתרון, נפתח בסביבת הפיתוח */
  | {
      kind: 'exercise';
      id: string;
      title: string;
      level: 1 | 2 | 3;
      brief: string;
      /** דרישות ממוספרות */
      requirements?: string[];
      starter: string;
      hints: string[];
      solution: string;
      expectedOutput?: string;
      stdin?: string;
    }
  /** טבלה */
  | { kind: 'table'; title?: string; headers: string[]; rows: string[][]; caption?: string }
  /** מילון מונחים עברית-אנגלית */
  | { kind: 'terms'; title?: string; items: { he: string; en: string; note?: string }[] }
  /** שלבים ממוספרים עם הסבר לכל שלב */
  | { kind: 'steps'; title?: string; items: { title: string; md: string }[] }
  /** דיאגרמת SVG מוטבעת */
  | { kind: 'diagram'; title?: string; svg: string; caption?: string }
  /** קו הפרדה */
  | { kind: 'divider' };

/* ---------- מבנה השיעור ---------- */

export interface Section {
  id: string;
  title: string;
  /** תת-כותרת שמופיעה מתחת לכותרת העמוד */
  subtitle?: string;
  /** מספרי השקפים במצגת המקורית שהעמוד מכסה */
  slides?: number[];
  blocks: Block[];
}

export interface Chapter {
  id: string;
  title: string;
  sections: Section[];
}

export interface Lesson {
  id: string;
  num: number;
  title: string;
  subtitle: string;
  /** שם קובץ המצגת המקורי */
  source: string;
  slideCount: number;
  /** מה נדע בסוף השיעור */
  goals: string[];
  chapters: Chapter[];
  /** true אם התוכן המלא כבר נכתב */
  ready: boolean;
}

/* ---------- עזר לניווט ---------- */

export interface FlatSection {
  lessonId: string;
  lessonNum: number;
  lessonTitle: string;
  chapterId: string;
  chapterTitle: string;
  section: Section;
  /** אינדקס גלובלי בתוך השיעור */
  index: number;
}

export function flattenLesson(lesson: Lesson): FlatSection[] {
  const out: FlatSection[] = [];
  let i = 0;
  for (const ch of lesson.chapters) {
    for (const s of ch.sections) {
      out.push({
        lessonId: lesson.id,
        lessonNum: lesson.num,
        lessonTitle: lesson.title,
        chapterId: ch.id,
        chapterTitle: ch.title,
        section: s,
        index: i++,
      });
    }
  }
  return out;
}

export function countSections(lesson: Lesson): number {
  return lesson.chapters.reduce((n, c) => n + c.sections.length, 0);
}

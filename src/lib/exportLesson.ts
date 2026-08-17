/**
 * ממיר Lesson שנוצר על ידי lib/generate.ts לקובץ טקסט אחד לשילוב ידני בקוד — בכוונה **לא**
 * כותב ישירות ל-content/index.ts. לפי הנחיה מפורשת: הייצור האוטומטי מכין טיוטה; השילוב
 * בפועל נשאר צעד ידני-ואיטי (AGENTS.md §6.5 שלבים 5–7 עדיין לא כוללים שילוב אוטומטי).
 */

import type { Chapter, Lesson } from '../types/content';

function chapterSource(lesson: Lesson, chapter: Chapter, i: number): { filename: string; code: string } {
  const varName = `ch${i}`;
  const filename = `src/content/lesson${String(lesson.num).padStart(2, '0')}/ch${i}.ts`;
  const code = `import type { Chapter } from '../../types/content';

export const ${varName}: Chapter = ${JSON.stringify(chapter, null, 2)} satisfies Chapter;
`;
  return { filename, code };
}

function lessonIndexSource(lesson: Lesson): { filename: string; code: string } {
  const vars = lesson.chapters.map((_, i) => `ch${i}`);
  const filename = `src/content/lesson${String(lesson.num).padStart(2, '0')}/index.ts`;
  const imports = vars.map((v) => `import { ${v} } from './${v}';`).join('\n');
  const code = `import type { Lesson } from '../../types/content';
${imports}

export const lesson${String(lesson.num).padStart(2, '0')}: Lesson = {
  id: ${JSON.stringify(lesson.id)},
  num: ${lesson.num},
  title: ${JSON.stringify(lesson.title)},
  subtitle: ${JSON.stringify(lesson.subtitle)},
  source: ${JSON.stringify(lesson.source)},
  slideCount: ${lesson.slideCount},
  ready: true,
  goals: ${JSON.stringify(lesson.goals, null, 2)},
  chapters: [${vars.join(', ')}],
};
`;
  return { filename, code };
}

/** בונה קובץ טקסט אחד עם כל הקבצים המוצעים, מופרדים בסימוני קובץ ברורים. */
export function buildExportBundle(lesson: Lesson): string {
  const files = [
    ...lesson.chapters.map((c, i) => chapterSource(lesson, c, i)),
    lessonIndexSource(lesson),
  ];

  const header = `/*
 * טיוטת שיעור ${lesson.num} — "${lesson.title}" — נוצרה אוטומטית על ידי מערכת הייצור מ-PDF.
 * זו טיוטה לביקורת ידנית, לא לשילוב עיוור. לפני שמשלבים בקוד:
 *   1. לעבור על התוכן בתצוגה המקדימה באפליקציה ולוודא שהוא נכון ואיכותי.
 *   2. להעתיק כל קובץ למיקום שלו (מצוין בכותרת של כל בלוק למטה) בתוך src/content/lessonNN/.
 *   3. ב-src/content/index.ts: להחליף את שורת ה-stub(${lesson.num}, ...) בייבוא של lesson${String(
    lesson.num
  ).padStart(2, '0')} מ-'./lesson${String(lesson.num).padStart(2, '0')}', ולהחליף אותה במערך LESSONS.
 *   4. npm run build — לוודא טיפוסים תקינים לפני commit.
 */

`;

  return (
    header +
    files
      .map((f) => `/* ============================================================\n   FILE: ${f.filename}\n   ============================================================ */\n\n${f.code}`)
      .join('\n\n')
  );
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

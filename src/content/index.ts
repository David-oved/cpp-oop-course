import type { Lesson } from '../types/content';
import { lesson01 } from './lesson01';

/** שיעורים שעדיין לא נכתבו — מופיעים בתפריט כ"בקרוב". */
function stub(
  num: number,
  title: string,
  subtitle: string,
  source: string,
  slideCount: number
): Lesson {
  return {
    id: `l${String(num).padStart(2, '0')}`,
    num,
    title,
    subtitle,
    source,
    slideCount,
    goals: [],
    chapters: [],
    ready: false,
  };
}

export const LESSONS: Lesson[] = [
  lesson01,
  stub(2, 'בנאים', 'constructors — איך אובייקט נולד עם ערכים תקינים', 'תכנות מתקדם 2 - אפרת עמר - בנאים.pdf', 29),
  stub(3, 'הורס, בנאי העתקה ומחלקה דינאמית', 'ניהול זיכרון בתוך מחלקה: destructor, copy constructor, deep copy', 'תכנות מתקדם 3 - אפרת עמר - הורס בנאי העתקה ומחלקה דינאמית.pdf', 30),
  stub(4, 'חפיפת אופרטורים, הזזות ומחרוזות', 'operator overloading, אופרטורי הזזה, ומחלקת String', 'תכנות מתקדם 4 - אפרת עמר - חפיפת אופרטורים הזזות ומחרוזות.pdf', 70),
  stub(5, 'פונקציה חברה, מחלקה חברה וקבצי טקסט', 'friend, ועבודה עם ifstream / ofstream', 'תכנות מתקדם 5 - אפרת עמר - פונקציה חברה ומחלקה חברה קבצי טקסט.pdf', 56),
  stub(6, 'קבצים בינאריים', 'קריאה וכתיבה של רשומות, גישה ישירה בקובץ', 'תכנות מתקדם 6 - אפרת עמר - קבצים בינאריים.pdf', 39),
  stub(7, 'סטטי וחריגות', 'static members, ו-exception handling', 'תכנות מתקדם 7 - אפרת עמר - סטטי וחריגות.pdf', 31),
  stub(8, 'מחלקה מכילה ומוכלת ורשימה לינארית', 'composition, ובניית רשימה מקושרת', 'תכנות מתקדם 8 - מחלקה מכילה ומוכלת ורשימה לינארית.pdf', 21),
  stub(9, 'ירושה ורשימה לינארית כפולה', 'inheritance, וגרסה דו-כיוונית של הרשימה', 'תכנות מתקדם 9 - ירושה ורשימה לינארית כפולה.pdf', 42),
  stub(10, 'פולימורפיזם', 'virtual, מחלקות אבסטרקטיות וטבלת הפונקציות הווירטואליות', 'תכנות מתקדם 10 - פולימורפיזם.pdf', 47),
  stub(11, 'תבניתיות ומיכלים', 'templates ו-STL containers', 'תכנות מתקדם 11 - תבניתיות ומיכלים.pdf', 53),
  stub(12, 'אלגוריתמים ופונקציות אנונימיות', 'אלגוריתמי STL ו-lambda expressions', 'תכנות מתקדם 12 - אלגוריתמים ופונקציות אנונימיות.pdf', 55),
  stub(13, 'רקורסיה ועצים', 'רקורסיה, עצים בינאריים ועצי חיפוש', 'תכנות מתקדם 13 - רקורסיה ועצים.pdf', 38),
];

export const getLesson = (id: string) => LESSONS.find((l) => l.id === id);

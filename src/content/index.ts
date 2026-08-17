import type { Lesson } from '../types/content';
import { lesson01 } from './lesson01';

/**
 * קטלוג השיעורים הבנויים-מראש. **בכוונה** רק שיעורים שבאמת נכתבו/נוצרו —
 * לא רשימת "בקרוב" של נושאים עתידיים. האפליקציה היא מנוע כללי (README, AGENTS.md §6):
 * היא יודעת לעבוד עם כל מצגת שתעלה אליה, לא "מכירה" מראש מצגות שעוד לא הועלו.
 * טיוטות שנוצרות דרך "בניית שיעור ממצגת" (LessonBuilder.tsx) נשמרות בנפרד
 * (lib/storage.ts — getDraftLessons) ולא נכנסות לכאן אוטומטית.
 */
export const LESSONS: Lesson[] = [lesson01];

export const getLesson = (id: string) => LESSONS.find((l) => l.id === id);

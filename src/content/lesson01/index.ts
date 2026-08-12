import type { Lesson } from '../../types/content';
import { ch0Intro } from './ch0-intro';
import { ch1FromStruct } from './ch1-from-struct';
import { ch2FirstClass } from './ch2-first-class';
import { ch3Lexicon } from './ch3-lexicon';
import { ch4Access } from './ch4-access';
import { ch5Files } from './ch5-files';
import { ch6Rational } from './ch6-rational';
import { ch7Build } from './ch7-build';
import { ch8Guards } from './ch8-guards';
import { ch9Define } from './ch9-define';
import { ch10Encapsulation } from './ch10-encapsulation';
import { ch11Student } from './ch11-student';

export const lesson01: Lesson = {
  id: 'l01',
  num: 1,
  title: 'מחלקות',
  subtitle: 'תכנות מונחה עצמים — מחלקה, עצם, ממשק ומימוש',
  source: 'תכנות מתקדם 1 - אפרת עמר - מחלקות.pdf',
  slideCount: 36,
  ready: true,
  goals: [
    'להגדיר מחלקה עם שדות ומתודות ולהסביר במה היא שונה ממבנה',
    'ליצור אובייקט על ה-Stack ועל ה-Heap ולדעת מתי משתמשים ב-. ומתי ב->',
    'לממש מתודה בתוך המחלקה ומחוצה לה עם ::',
    'להשתמש ב-public ו-private ולכתוב getter/setter שמגן על הנתונים',
    'לפרק מחלקה לשלושה קבצים: ממשק, מימוש ושימוש',
    'לתאר את מסלול הבנייה: קדם-מעבד, מהדר, מקשר',
    'למנוע הכללה מרובה עם include guards או pragma once',
    'להסביר כימוס, הפשטת נתונים והפשטת בקרה',
  ],
  chapters: [
    ch0Intro,
    ch1FromStruct,
    ch2FirstClass,
    ch3Lexicon,
    ch4Access,
    ch5Files,
    ch6Rational,
    ch7Build,
    ch8Guards,
    ch9Define,
    ch10Encapsulation,
    ch11Student,
  ],
};

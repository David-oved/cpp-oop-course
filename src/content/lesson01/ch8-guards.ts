import type { Chapter } from '../../types/content';

export const ch8Guards: Chapter = {
  id: 'ch8',
  title: 'הכללה מרובה',
  sections: [
    /* ============================================================ */
    {
      id: 's45',
      title: 'הבעיה: הכללה מרובה',
      subtitle: 'למה קובץ יכול להיכנס פעמיים בלי שביקשת',
      slides: [30],
      blocks: [
        {
          kind: 'prose',
          md: 'הקדם-מעבד גוזר ומדביק. עכשיו נראה מה קורה כשהוא מדביק את **אותו קובץ פעמיים**.',
        },
        {
          kind: 'prose',
          md: 'המצגת מציגה את התרחיש כך: בדוגמה שראינו, הכללנו לכאורה את `iostream` **פעמיים** במודול ה-`.obj` שנוצר מהתוכנית הראשית: פעם באופן ישיר ב-`main.cpp`, ופעם שנייה כאשר ביצענו `#include` לקובץ `Student.h`, שאף הוא מבצע `#include <iostream>`.',
        },
        {
          kind: 'diagram',
          title: 'איך זה קורה',
          svg: `<svg viewBox="0 0 620 230" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif">
  <defs>
    <marker id="a4" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="currentColor"/>
    </marker>
  </defs>
  <g>
    <rect x="220" y="12" width="180" height="46" rx="9" fill="#d97706" opacity=".13" stroke="#d97706" stroke-width="1.6"/>
    <text x="310" y="33" text-anchor="middle" font-size="13" font-weight="700" font-family="monospace" fill="#d97706">main.cpp</text>
    <text x="310" y="49" text-anchor="middle" font-size="10" fill="currentColor" opacity=".7">מכליל שני קבצים</text>
  </g>
  <g stroke="currentColor" fill="none" stroke-width="1.7" opacity=".55" marker-end="url(#a4)">
    <path d="M262 60 L150 104"/>
    <path d="M358 60 L470 104"/>
  </g>
  <text x="176" y="82" font-size="10" font-family="monospace" fill="currentColor" opacity=".7">#include &lt;iostream&gt;</text>
  <text x="424" y="82" font-size="10" font-family="monospace" fill="currentColor" opacity=".7">#include "Student.h"</text>
  <g>
    <rect x="52" y="108" width="196" height="42" rx="9" fill="#0f6fb5" opacity=".14" stroke="#0f6fb5" stroke-width="1.6"/>
    <text x="150" y="134" text-anchor="middle" font-size="12.5" font-weight="700" font-family="monospace" fill="#0f6fb5">&lt;iostream&gt;</text>
  </g>
  <g>
    <rect x="374" y="108" width="196" height="42" rx="9" fill="#7c3aed" opacity=".13" stroke="#7c3aed" stroke-width="1.6"/>
    <text x="472" y="134" text-anchor="middle" font-size="12.5" font-weight="700" font-family="monospace" fill="#7c3aed">Student.h</text>
  </g>
  <path d="M420 152 L250 184" stroke="#cc2f47" fill="none" stroke-width="1.9" marker-end="url(#a4)" stroke-dasharray="5 3"/>
  <text x="400" y="176" font-size="10" font-family="monospace" fill="#cc2f47" opacity=".9">גם הוא מכליל!</text>
  <g>
    <rect x="52" y="184" width="196" height="42" rx="9" fill="#cc2f47" opacity=".13" stroke="#cc2f47" stroke-width="1.8"/>
    <text x="150" y="203" text-anchor="middle" font-size="12" font-weight="700" font-family="monospace" fill="#cc2f47">&lt;iostream&gt; שוב</text>
    <text x="150" y="218" text-anchor="middle" font-size="10" fill="#cc2f47">הגדרות כפולות ✕</text>
  </g>
</svg>`,
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'איך זה לא גורם לשגיאה עם `<iostream>`?',
          md: 'המצגת שואלת את זה במפורש. התשובה: ==ספריות התקן כבר מוגנות מבפנים==. הן כתובות עם המנגנון שנלמד בעמודים הבאים. אבל **קבצי ה-`.h` שאתה כותב אינם מוגנים אלא אם תגן עליהם בעצמך** — וזו נקודת הכשל.',
        },
        {
          kind: 'prose',
          md: 'המצגת מסכמת: *"בכל פעם שאנו עושים `include` לקובץ header, קדם המעבד מכליל קובץ זה במודול (`*.obj`) שנוצר. בעצם הוא מבצע העתקה-הכנסה של קובץ נוסף לתוך קובץ התוצאה הזמני. **הכללה מרובה גורמת להגדרות כפולות ולכן גורמת לשגיאות קומפילציה.**"*',
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'הכלל שנשבר',
          md: 'ב-C++ יש כלל שנקרא **One Definition Rule** (ODR): לכל ישות מותרת ==הגדרה אחת בלבד== בכל יחידת תרגום. מחלקה שהוגדרה פעמיים — גם אם בדיוק אותה הגדרה מילה במילה — מפרה את הכלל. הקומפיילר לא בודק אם ההגדרות זהות; הוא פשוט רואה `class Rect` פעמיים ועוצר.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's46',
      title: 'הדגמה: השגיאה בפועל',
      subtitle: 'מצא את ההבדלים — מה הם עשו שאנחנו לא',
      slides: [31],
      blocks: [
        {
          kind: 'prose',
          md: 'המצגת מקדישה לזה שקף שלם עם הכותרת **"מצא את ההבדלים — מה הם עשו שאנחנו לא???"**. הנה התשובה, עם הקוד המלא והשגיאה האמיתית.',
        },
        {
          kind: 'code',
          title: 'פרויקט שלא יתקמפל',
          broken: true,
          runnable: true,
          lang: 'cpp',
          caption:
            'לחץ "הרץ" — שלושת הקבצים נשלחים באמת, ותקבל את שגיאת redefinition האמיתית של g++.',
          files: [
            {
              name: 'Rect.h',
              code: `// ← אין שום הגנה כאן!
#include <iostream>
using namespace std;

class Rect
{
private:
    int length;
    int width;
public:
    void setSize(int l, int w) { length = l; width = w; }
    void print() { cout << length << "x" << width << endl; }
};`,
            },
            {
              name: 'Shape.h',
              code: `#include "Rect.h"      // הכללה ראשונה של Rect.h

class Shape
{
private:
    Rect bounds;
public:
    void setBounds(int l, int w) { bounds.setSize(l, w); }
    void print() { bounds.print(); }
};`,
            },
            {
              name: 'main.cpp',
              code: `#include "Rect.h"       // הכללה ראשונה
#include "Shape.h"      // ← Shape.h מכליל שוב את Rect.h!

int main()
{
    Rect r;
    r.setSize(3, 4);
    r.print();
    return 0;
}`,
            },
          ],
        },
        {
          kind: 'pitfall',
          title: 'הודעת השגיאה שתקבל',
          badCode: `// main.cpp אחרי הקדם-מעבד:

class Rect { ... };     // מ-#include "Rect.h"

class Rect { ... };     // מ-#include "Shape.h" → "Rect.h"
                        //  ← הגדרה שנייה!
class Shape { ... };`,
          error: `In file included from Shape.h:1,
                 from main.cpp:2:
Rect.h:5:7: error: redefinition of 'class Rect'
    5 | class Rect
      |       ^~~~
In file included from main.cpp:1:
Rect.h:5:7: note: previous definition of 'class Rect'
    5 | class Rect
      |       ^~~~`,
          explain:
            'הקדם-מעבד הדביק את תוכן `Rect.h` **פעמיים** לתוך הקובץ הזמני של `main.cpp`. המהדר רואה שתי הגדרות של אותה מחלקה, וזו הפרה של ה-One Definition Rule. שים לב שההודעה מראה לך את **שרשרת ההכללה** (`In file included from ... from ...`) — זה בדיוק המידע שאתה צריך כדי למצוא את המסלול הכפול.',
          goodCode: `// Rect.h — עם הגנה
#pragma once
#include <iostream>
using namespace std;

class Rect { /* ... */ };`,
          goodNote:
            'שורה אחת פותרת את הכול. שתי הדרכים לעשות את זה — בשני העמודים הבאים.',
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'איך לקרוא הודעת שגיאה של הכללה מרובה',
          md: 'ההודעה מגיעה בשני חלקים:\n\n1. `error: redefinition of \'class X\'` — עם שרשרת `In file included from...` שמראה **דרך איזה מסלול** ההגדרה השנייה הגיעה.\n2. `note: previous definition` — עם שרשרת נוספת שמראה מאיפה הגיעה **הראשונה**.\n\n==השווה בין שתי השרשראות ותמצא איזה קובץ מוכלל פעמיים.==',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's47',
      title: 'אפשרות 1 — include guards',
      subtitle: 'הפתרון הקלאסי, עובד בכל קומפיילר',
      slides: [32, 33],
      blocks: [
        {
          kind: 'prose',
          md: 'הפתרון הראשון שהמצגת מציגה: נכתוב בראש כל קובץ ממשק `.h` שתי שורות, ובסופו שורה אחת.',
        },
        {
          kind: 'code',
          runnable: true,
          title: 'המבנה',
          lang: 'cpp',
          code: `#ifndef  RATIONAL_H
#define  RATIONAL_H

//Rational.h
#include <iostream>
using namespace std;

class Rational
{
    //...
};

#endif`,
          annotations: [
            { line: 1, text: '"אם RATIONAL_H לא מוגדר" — התחלת הבלוק המותנה' },
            { line: 2, text: 'הגדר אותו מיד — כך שבפעם הבאה התנאי לא יתקיים' },
            { line: 13, text: 'סוף הבלוק המותנה' },
          ],
        },
        {
          kind: 'steps',
          title: 'איך זה עובד — צעד אחר צעד',
          items: [
            {
              title: 'ההכללה הראשונה',
              md: 'הקדם-מעבד מגיע ל-`#ifndef RATIONAL_H`. השם עדיין לא מוגדר בשום מקום, ולכן התנאי **מתקיים** — הבלוק כולו נכנס. השורה הבאה, `#define RATIONAL_H`, **מגדירה** את השם.',
            },
            {
              title: 'ההכללה השנייה',
              md: 'הקדם-מעבד מגיע שוב ל-`#ifndef RATIONAL_H`. הפעם השם **כן** מוגדר (מהפעם הקודמת), ולכן התנאי **לא** מתקיים — ==כל מה שבין ה-`#ifndef` ל-`#endif` מדולג בשקט==.',
            },
            {
              title: 'התוצאה',
              md: 'המחלקה מוגדרת **פעם אחת בלבד** בקובץ הזמני, לא משנה כמה פעמים הקובץ הוכלל. ה-ODR נשמר.',
            },
          ],
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'מה השם צריך להיות',
          md: 'המצגת אומרת: `#ifndef` ואז **שם הקובץ באותיות גדולות** ואחריו `_H`. כלומר `Rational.h` → `RATIONAL_H`, `BankAccount.h` → `BANKACCOUNT_H`. הכלל האמיתי הוא רק ש**השם יהיה ייחודי בפרויקט** — המוסכמה הזו פשוט מבטיחה את זה בקלות.',
        },
        {
          kind: 'code',
          title: 'הדגמה מלאה — הקוד שנשבר, מתוקן',
          runnable: true,
          files: [
            {
              name: 'Rect.h',
              code: `#ifndef RECT_H
#define RECT_H

#include <iostream>
using namespace std;

class Rect
{
private:
    int length;
    int width;
public:
    void setSize(int l, int w) { length = l; width = w; }
    void print() { cout << length << "x" << width << endl; }
};

#endif`,
            },
            {
              name: 'Shape.h',
              code: `#ifndef SHAPE_H
#define SHAPE_H

#include "Rect.h"       // בפעם השנייה — יידולג

class Shape
{
private:
    Rect bounds;
public:
    void setBounds(int l, int w) { bounds.setSize(l, w); }
    void print() { bounds.print(); }
};

#endif`,
            },
            {
              name: 'main.cpp',
              code: `#include "Rect.h"
#include "Shape.h"      // עכשיו זה בסדר

int main()
{
    Rect r;
    r.setSize(3, 4);
    r.print();

    Shape s;
    s.setBounds(10, 20);
    s.print();

    return 0;
}`,
            },
          ],
          caption: 'אותו פרויקט בדיוק, עם 3 שורות הגנה בכל header. עכשיו זה מתקמפל.',
        },
        {
          kind: 'pitfall',
          title: 'העתק-הדבק עם שם משומר',
          badCode: `// Circle.h — נוצר בהעתקה מ-Rect.h
#ifndef RECT_H          // ✕ שכחנו לשנות את השם!
#define RECT_H

class Circle { /* ... */ };

#endif`,
          error: `error: 'Circle' was not declared in this scope
   12 |     Circle c;
      |     ^~~~~~`,
          explain:
            'זו מלכודת אכזרית. אם `Rect.h` הוכלל **לפני** `Circle.h`, אז `RECT_H` כבר מוגדר — ולכן ==כל תוכן `Circle.h` מדולג בשקט==. אין שגיאה בקובץ עצמו! השגיאה מופיעה במקום אחר לגמרי, כ"`Circle` לא מוכר". קשה מאוד לאתר. **תמיד בדוק את שם ההגנה אחרי העתקה של קובץ header.**',
          goodCode: `// Circle.h
#ifndef CIRCLE_H
#define CIRCLE_H

class Circle { /* ... */ };

#endif`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'הרגל טוב: הערה על ה-`#endif`',
          md: 'בקבצים ארוכים, כתוב `#endif // RECT_H` בסוף. כשיש 300 שורות בין ה-`#ifndef` ל-`#endif`, ההערה הזו מסבירה מיד איזה בלוק נסגר.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's48',
      title: 'אפשרות 2 — #pragma once',
      subtitle: 'שורה אחת במקום שלוש',
      slides: [32, 33],
      blocks: [
        {
          kind: 'prose',
          md: 'האפשרות השנייה שהמצגת מציגה: נכתוב בראש כל קובץ ממשק `.h` שורה אחת.',
        },
        {
          kind: 'compare',
          title: 'שתי הדרכים לאותו קובץ',
          left: {
            title: 'אפשרות 1 — include guards',
            code: `#ifndef RATIONAL_H
#define RATIONAL_H

//Rational.h
#include <iostream>
using namespace std;

class Rational
{
    //...
};

#endif`,
            note: 'שלוש שורות. עובד ב-100% מהקומפיילרים, כולל עתיקים ואקזוטיים. חלק מהתקן.',
            verdict: 'good',
          },
          right: {
            title: 'אפשרות 2 — pragma once',
            code: `#pragma once

//Rational.h
#include <iostream>
using namespace std;

class Rational
{
    //...
};`,
            note: 'שורה אחת. קצר, בלי סיכון להתנגשות שמות. נתמך בכל קומפיילר מודרני, אבל **אינו חלק מהתקן הרשמי**.',
            verdict: 'good',
          },
        },
        {
          kind: 'table',
          title: 'השוואה מפורטת',
          headers: ['', '`#ifndef` / `#define` / `#endif`', '`#pragma once`'],
          rows: [
            ['מספר שורות', '3', '1'],
            ['חלק מהתקן', '✅ כן', '❌ לא — אבל נתמך בפועל בכל מקום'],
            ['סיכון להתנגשות שמות', '⚠️ יש — אם שכחת לשנות שם', '✅ אין — הקומפיילר מזהה לפי הקובץ'],
            ['אפשר לשכוח `#endif`', '⚠️ כן', '✅ לא רלוונטי'],
            ['ביצועים', 'הקדם-מעבד קורא את הקובץ בכל פעם', 'הקומפיילר מדלג מיד — מעט מהיר יותר'],
            ['אותו קובץ בשני נתיבים', 'עובד — לפי שם ההגנה', '⚠️ עלול להיכשל — מזוהה לפי נתיב'],
            ['נתמך ב-MSVC / GCC / Clang', '✅✅✅', '✅✅✅'],
          ],
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'מה עושים בפועל',
          md: 'שתי הדרכים מקובלות והמצגת מציגה את שתיהן. **המלצה מעשית:** השתמש ב-`#pragma once` — הוא קצר, אין בו סיכון לטעות בהעתקה, וכל קומפיילר שתפגוש בקורס תומך בו. ==אם המרצה או מטלה דורשים במפורש include guards — כתוב אותם.== חשוב לדעת את שניהם למבחן.',
        },
        {
          kind: 'callout',
          variant: 'exam',
          title: 'שאלה קלאסית במבחן',
          md: '"מה יקרה אם נשמיט את שורות ההגנה מקובץ `.h`?" — התשובה המלאה: ==לא תמיד יקרה משהו==. אם הקובץ מוכלל **פעם אחת בלבד** בכל יחידת תרגום, הכול יעבוד. הבעיה מתעוררת רק כשהוא מוכלל פעמיים באותה יחידה — ישירות ובעקיפין. **ולכן זה באג שמתגלה מאוחר**, כשהפרויקט גדל, ודווקא אז הוא הכי מבלבל.',
        },
        {
          kind: 'quiz',
          question:
            'קובץ `A.h` מכליל את `Common.h`, וגם `B.h` מכליל את `Common.h`. `main.cpp` מכליל את שניהם. אין הגנות בשום מקום. מה קורה?',
          options: [
            {
              text: 'שגיאת קומפילציה — `Common.h` הוכלל פעמיים באותה יחידת תרגום',
              correct: true,
              explain:
                'נכון. אחרי הקדם-מעבד, `main.cpp` מכיל את כל תוכן `Common.h` פעמיים. אם יש בו הגדרת מחלקה — `redefinition of class`.',
            },
            {
              text: 'הכול בסדר — הקומפיילר חכם מספיק לזהות כפילות',
              correct: false,
              explain:
                'הקדם-מעבד לא בודק כלום; הוא מדביק. והמהדר לא משווה הגדרות — הוא רואה שתיים ועוצר.',
            },
            {
              text: 'שגיאת לינקר',
              correct: false,
              explain:
                'לא מגיעים ללינקר. הכפילות נמצאת **בתוך אותה יחידת תרגום**, ולכן המהדר תופס אותה. (הגדרה כפולה בין שתי יחידות תרגום שונות — זו כן שגיאת לינקר.)',
            },
            {
              text: 'רק אזהרה',
              correct: false,
              explain: 'הפרת ה-ODR היא שגיאה קשה, לא אזהרה.',
            },
          ],
        },
        {
          kind: 'exercise',
          id: 'ex-guards',
          title: 'הוסף הגנות לפרויקט שבור',
          level: 1,
          brief:
            'למטה פרויקט שלא מתקמפל בגלל הכללה מרובה. הרץ אותו קודם כדי לראות את השגיאה האמיתית, ואז תקן.',
          requirements: [
            'הרץ את הקוד כמו שהוא וקרא את הודעת השגיאה. שים לב לשרשרת `In file included from`.',
            'הוסף הגנה לכל אחד משלושת קבצי ה-`.h`. ==השתמש ב-include guards, לא ב-pragma once== — כדי להתאמן על התחביר.',
            'ודא שכל שם הגנה **שונה** מהאחרים.',
          ],
          starter: `// ==================== Color.h ====================
// TODO: הוסף הגנה

struct Color
{
    int r, g, b;
};

// ==================== Point.h ====================
// TODO: הוסף הגנה
// (בפרויקט אמיתי כאן היה #include "Color.h")

struct Point
{
    int x, y;
    Color c;
};

// ==================== Shape.h ====================
// TODO: הוסף הגנה
// (בפרויקט אמיתי כאן היו #include "Color.h" ו-#include "Point.h")

struct Shape
{
    Point origin;
    Color fill;
};

// ==================== main.cpp ====================
#include <iostream>
using namespace std;

int main()
{
    Shape s;
    s.origin.x = 10;
    s.origin.y = 20;
    s.fill.r = 255;
    s.fill.g = 0;
    s.fill.b = 0;

    cout << "Shape at (" << s.origin.x << "," << s.origin.y << ")" << endl;
    cout << "Fill RGB: " << s.fill.r << ","
         << s.fill.g << "," << s.fill.b << endl;

    return 0;
}`,
          hints: [
            'התבנית: `#ifndef NAME_H` בשורה הראשונה, `#define NAME_H` בשנייה, `#endif` בסוף הקובץ.',
            'לשלושת הקבצים צריכים להיות שלושה שמות שונים: `COLOR_H`, `POINT_H`, `SHAPE_H`. אם תעתיק את אותו שם לשניים — הקובץ השני יידלג בשקט והקוד לא יתקמפל.',
            'שים לב שבסביבה הזו שלושת ה"קבצים" מאוחדים לקובץ אחד, ולכן ההגנות לא ימנעו כלום בפועל — אבל התחביר חייב להיות נכון והקוד חייב להתקמפל.',
          ],
          solution: `// ==================== Color.h ====================
#ifndef COLOR_H
#define COLOR_H

struct Color
{
    int r, g, b;
};

#endif // COLOR_H

// ==================== Point.h ====================
#ifndef POINT_H
#define POINT_H

struct Point
{
    int x, y;
    Color c;
};

#endif // POINT_H

// ==================== Shape.h ====================
#ifndef SHAPE_H
#define SHAPE_H

struct Shape
{
    Point origin;
    Color fill;
};

#endif // SHAPE_H

// ==================== main.cpp ====================
#include <iostream>
using namespace std;

int main()
{
    Shape s;
    s.origin.x = 10;
    s.origin.y = 20;
    s.fill.r = 255;
    s.fill.g = 0;
    s.fill.b = 0;

    cout << "Shape at (" << s.origin.x << "," << s.origin.y << ")" << endl;
    cout << "Fill RGB: " << s.fill.r << ","
         << s.fill.g << "," << s.fill.b << endl;

    return 0;
}`,
          expectedOutput: `Shape at (10,20)
Fill RGB: 255,0,0`,
        },
      ],
    },
  ],
};

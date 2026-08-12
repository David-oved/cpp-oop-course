import type { Chapter } from '../../types/content';

export const ch10Encapsulation: Chapter = {
  id: 'ch10',
  title: 'כימוס והפשטה',
  sections: [
    /* ============================================================ */
    {
      id: 's52',
      title: 'כימוס נתונים — Data Encapsulation',
      subtitle: 'השם הרשמי לכל מה שעשינו עד עכשיו',
      slides: [35],
      blocks: [
        {
          kind: 'callout',
          variant: 'info',
          title: 'ההגדרה מהמצגת',
          md: 'תכנות מונחה עצמים בעצם עושה **כימוס של הנתונים** — ==אריזת נתונים ופעולות ביחד תוך הסתרה (hiding) של נתונים והסתרה של מימוש הפעולות==.',
        },
        {
          kind: 'prose',
          md: 'שים לב ששלוש המילים בהגדרה מתארות שלושה דברים שכבר עשית בשיעור הזה:',
        },
        {
          kind: 'table',
          headers: ['החלק בהגדרה', 'איפה עשינו את זה', 'איך זה נראה בקוד'],
          rows: [
            [
              '**אריזת נתונים ופעולות ביחד**',
              'פרק 2 — המחלקה הראשונה',
              '`class Rect { int length; void printArea(); };`',
            ],
            [
              '**הסתרת נתונים**',
              'פרק 4 — הרשאות גישה',
              '`private: int length;`',
            ],
            [
              '**הסתרת מימוש הפעולות**',
              'פרק 5 — פיצול ל-`.h` ו-`.cpp`',
              'ההצהרה ב-`.h`, הגוף ב-`.cpp`',
            ],
          ],
        },
        {
          kind: 'prose',
          md: 'המצגת שואלת: **"איך זה מתבטא בפועל?"** ועונה: ==הפשטת נתונים והפשטת בקרה==. שני העמודים הבאים מוקדשים לשתיהן.',
        },
        {
          kind: 'diagram',
          title: 'כימוס — התמונה השלמה',
          svg: `<svg viewBox="0 0 600 250" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif">
  <rect x="150" y="20" width="300" height="210" rx="16" fill="none" stroke="#3d4ec7" stroke-width="2.2"/>
  <text x="300" y="45" text-anchor="middle" font-size="14" font-weight="800" fill="#3d4ec7">class Rect</text>

  <rect x="176" y="60" width="248" height="66" rx="10" fill="#cc2f47" opacity=".1" stroke="#cc2f47" stroke-width="1.5" stroke-dasharray="5 3"/>
  <text x="300" y="80" text-anchor="middle" font-size="11" font-weight="700" fill="#cc2f47">private — מוסתר</text>
  <text x="300" y="99" text-anchor="middle" font-size="11" font-family="monospace" fill="currentColor" opacity=".8">int length; int width;</text>
  <text x="300" y="116" text-anchor="middle" font-size="11" font-family="monospace" fill="currentColor" opacity=".8">int computeInternal();</text>

  <rect x="176" y="140" width="248" height="72" rx="10" fill="#0f8a5f" opacity=".1" stroke="#0f8a5f" stroke-width="1.5"/>
  <text x="300" y="160" text-anchor="middle" font-size="11" font-weight="700" fill="#0f8a5f">public — הממשק</text>
  <text x="300" y="179" text-anchor="middle" font-size="11" font-family="monospace" fill="currentColor" opacity=".8">setLength() · getLength()</text>
  <text x="300" y="196" text-anchor="middle" font-size="11" font-family="monospace" fill="currentColor" opacity=".8">printArea()</text>

  <g opacity=".8">
    <text x="70" y="100" font-size="11.5" fill="#cc2f47" font-weight="600">קוד חיצוני</text>
    <text x="70" y="118" font-size="10.5" fill="currentColor" opacity=".7">חסום ✕</text>
    <path d="M118 95 L172 95" stroke="#cc2f47" stroke-width="1.8" fill="none" stroke-dasharray="4 3"/>
    <path d="M138 86 L152 104 M152 86 L138 104" stroke="#cc2f47" stroke-width="2.2"/>
  </g>
  <g opacity=".85">
    <text x="70" y="176" font-size="11.5" fill="#0f8a5f" font-weight="600">קוד חיצוני</text>
    <text x="70" y="194" font-size="10.5" fill="currentColor" opacity=".7">מותר ✓</text>
    <path d="M118 172 L170 172" stroke="#0f8a5f" stroke-width="1.9" fill="none"/>
    <path d="M164 167 L172 172 L164 177" stroke="#0f8a5f" stroke-width="1.9" fill="none"/>
  </g>
  <path d="M300 126 L300 140" stroke="currentColor" stroke-width="1.4" opacity=".4" fill="none"/>
  <text x="470" y="105" font-size="10" fill="currentColor" opacity=".6">רק מתודות</text>
  <text x="470" y="119" font-size="10" fill="currentColor" opacity=".6">המחלקה נכנסות</text>
  <path d="M424 95 L446 95" stroke="currentColor" stroke-width="1.4" fill="none" opacity=".4"/>
</svg>`,
          caption: 'הקליפה הכחולה היא הכימוס. מה שבפנים מוגן; מה שבירוק הוא החוזה עם העולם.',
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'האנלוגיה שעוזרת',
          md: 'מכונית. יש לך **הגה, דוושות וגיר** — הממשק הציבורי. יש לה **מנוע, תיבת הילוכים ומחשב** — המימוש המוסתר. אתה לא צריך לדעת איך המנוע עובד כדי לנהוג, ==ויצרן המכונית יכול להחליף מנוע בנזין במנוע חשמלי בלי לשנות את ההגה==. זה בדיוק כימוס.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's53',
      title: 'הפשטת נתונים — Data Abstraction',
      subtitle: 'החצי הראשון של הכימוס',
      slides: [35],
      blocks: [
        {
          kind: 'callout',
          variant: 'info',
          title: 'ההגדרה מהמצגת',
          md: '**ייצוג חיצוני של הנתונים תוך הסתרת היישום הפנימי שלהם.**',
        },
        {
          kind: 'list',
          title: 'איך זה מתבטא בפועל — לפי המצגת',
          items: [
            'הרבה פעמים נרצה "להסתיר" תכונות, כלומר — **להגביל גישה** אליהן.',
            'איברי המחלקה יוגדרו כ-`private`.',
            'מתודות יהיו בדרך כלל ציבוריות, **פרט למתודות עזר**.',
            'הגישה לשדות תתבצע באופן מבוקר על ידי **מתודות הצבה (`setter`) ואיחזור (`getter`)**.',
          ],
        },
        {
          kind: 'prose',
          md: 'הביטוי המרכזי כאן הוא **"ייצוג חיצוני"** מול **"יישום פנימי"**. אלה שני דברים שונים, ובזה כל העניין.',
        },
        {
          kind: 'code',
          title: 'אותו ייצוג חיצוני, שני יישומים פנימיים',
          runnable: true,
          files: [
            {
              name: 'RectA.h',
              code: `#pragma once
// גרסה א' — שומרים אורך ורוחב
class RectA
{
private:
    int length;
    int width;

public:
    void setSize(int l, int w) { length = l; width = w; }

    int getLength() { return length; }
    int getWidth()  { return width;  }
    int getArea()   { return length * width; }
};`,
            },
            {
              name: 'RectB.h',
              code: `#pragma once
// גרסה ב' — שומרים שתי פינות
class RectB
{
private:
    int x1, y1;      // פינה שמאלית תחתונה
    int x2, y2;      // פינה ימנית עליונה

public:
    void setSize(int l, int w)
    {
        x1 = 0;  y1 = 0;
        x2 = l;  y2 = w;
    }

    // ===== אותו ממשק בדיוק! =====
    int getLength() { return x2 - x1; }
    int getWidth()  { return y2 - y1; }
    int getArea()   { return (x2 - x1) * (y2 - y1); }
};`,
            },
            {
              name: 'main.cpp',
              code: `#include <iostream>
#include "RectA.h"
#include "RectB.h"
using namespace std;

int main()
{
    // הקוד הזה **זהה** לשתי הגרסאות
    RectA a;
    a.setSize(5, 3);
    cout << "A: " << a.getLength() << "x" << a.getWidth()
         << " area=" << a.getArea() << endl;

    RectB b;
    b.setSize(5, 3);
    cout << "B: " << b.getLength() << "x" << b.getWidth()
         << " area=" << b.getArea() << endl;

    cout << "sizeof(RectA) = " << sizeof(RectA) << endl;
    cout << "sizeof(RectB) = " << sizeof(RectB) << endl;

    return 0;
}`,
            },
          ],
          caption:
            'שני יישומים פנימיים שונים לגמרי — 8 בתים מול 16 — ואותו ממשק חיצוני בדיוק.',
        },
        {
          kind: 'callout',
          variant: 'exam',
          title: 'זו התשובה לשאלה "למה כל הטרחה"',
          md: 'הרץ את הקוד. `RectA` תופסת 8 בתים ו-`RectB` תופסת 16. הן שומרות נתונים **שונים לחלוטין**. ובכל זאת — ==`main` שנכתב לאחת עובד לשנייה בלי שינוי אף תו==. זו הפשטת נתונים. אילו השדות היו `public`, כל שורה ב-`main` הייתה נשברת.',
        },
        {
          kind: 'quiz',
          question: 'מחלקת `Time` שומרת `int hours, minutes, seconds`. משנים אותה לשמור `int totalSeconds` בלבד. מתי הקוד החיצוני יישבר?',
          options: [
            {
              text: 'אם השדות היו `public` והקוד ניגש אליהם ישירות',
              correct: true,
              explain:
                'נכון. `t.hours` פשוט לא קיים יותר — כל שורה כזו לא תתקמפל.',
            },
            {
              text: 'אם היו רק `getHours()`, `getMinutes()`, `getSeconds()` — לא יישבר',
              correct: true,
              explain:
                'נכון! החתימות נשארות; רק המימוש משתנה ל-`return totalSeconds / 3600;` וכו\'. הקוד החיצוני לא מרגיש כלום.',
            },
            {
              text: 'תמיד יישבר — שינוי פנימי תמיד משפיע',
              correct: false,
              explain: 'זה בדיוק מה שהפשטת נתונים מונעת. אם הממשק יציב, השינוי הפנימי בלתי נראה.',
            },
            {
              text: 'רק אם היה `setHours()`',
              correct: false,
              explain:
                'גם `setHours` אפשר לממש מחדש (`totalSeconds = h*3600 + getMinutes()*60 + getSeconds();`). כל עוד החתימה נשמרת — אין שבירה.',
            },
          ],
          multi: true,
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's54',
      title: 'הפשטת בקרה — Control Abstraction',
      subtitle: 'החצי השני של הכימוס',
      slides: [35],
      blocks: [
        {
          kind: 'callout',
          variant: 'info',
          title: 'ההגדרה מהמצגת',
          md: '**הסתרת פרטי היישום תוך חשיפת ממשקים בלבד** — הגדרות (או חתימות) של המתודות. ==מימוש המתודות מוסתר (הפרדה לקובץ `.h` וקובץ `.cpp`).==',
        },
        {
          kind: 'prose',
          md: 'אם הפשטת נתונים עסקה ב**מה** מוסתר (השדות), הפשטת בקרה עוסקת ב**איך** מוסתר (גוף המתודות). והמנגנון שכבר למדנו בפרק 5 הוא בדיוק זה: הפיצול ל-`.h` ו-`.cpp`.',
        },
        {
          kind: 'compare',
          title: 'מה רואה מי שמשתמש במחלקה',
          left: {
            title: 'הוא רואה — Sorter.h',
            code: `#pragma once

class Sorter
{
private:
    int data[100];
    int count;

public:
    void add(int value);
    void sort();
    void print();
    int  getCount();
};`,
            note:
              '**החוזה.** ארבע פעולות. הוא יודע מה אפשר לעשות, ולא יודע — ולא צריך לדעת — איך.',
            verdict: 'good',
          },
          right: {
            title: 'הוא לא רואה — Sorter.cpp',
            code: `#include "Sorter.h"

void Sorter::sort()
{
    // Bubble sort? Quick sort?
    // Merge sort? זה עניין שלי.
    for (int i = 0; i < count - 1; i++)
        for (int j = 0; j < count - 1 - i; j++)
            if (data[j] > data[j + 1])
            {
                int t = data[j];
                data[j] = data[j + 1];
                data[j + 1] = t;
            }
}`,
            note:
              'מחר אחליף ל-quicksort. הממשק זהה, הקוד החיצוני לא משתנה, ==והתוכנית פתאום מהירה פי 100==.',
            verdict: 'good',
          },
        },
        {
          kind: 'code',
          title: 'הדגמה: החלפת אלגוריתם בלי לגעת ב-main',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Sorter
{
private:
    int data[100];
    int count;

    // --- שני אלגוריתמים פרטיים. אף אחד בחוץ לא יודע עליהם ---
    void bubbleSort()
    {
        for (int i = 0; i < count - 1; i++)
            for (int j = 0; j < count - 1 - i; j++)
                if (data[j] > data[j + 1])
                {
                    int t = data[j];
                    data[j] = data[j + 1];
                    data[j + 1] = t;
                }
    }

    void insertionSort()
    {
        for (int i = 1; i < count; i++)
        {
            int key = data[i];
            int j = i - 1;
            while (j >= 0 && data[j] > key)
            {
                data[j + 1] = data[j];
                j--;
            }
            data[j + 1] = key;
        }
    }

public:
    void init() { count = 0; }

    void add(int value)
    {
        if (count < 100)
            data[count++] = value;
    }

    // הממשק הציבורי. אף מילה על איזה אלגוריתם משמש.
    void sort()
    {
        if (count < 20)
            insertionSort();      // יעיל למערכים קטנים
        else
            bubbleSort();
    }

    void print()
    {
        for (int i = 0; i < count; i++)
            cout << data[i] << " ";
        cout << endl;
    }

    int getCount() { return count; }
};

int main()
{
    Sorter s;
    s.init();

    int values[] = {42, 7, 19, 3, 88, 15, 1, 64};
    for (int i = 0; i < 8; i++)
        s.add(values[i]);

    cout << "before: ";  s.print();
    s.sort();
    cout << "after:  ";  s.print();
    cout << "count = " << s.getCount() << endl;

    return 0;
}`,
          caption:
            'שים לב: sort() אפילו בוחרת אלגוריתם דינמית — ו-main לא יודע ולא אכפת לו.',
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'איך לזהות שהפשטת הבקרה נכשלה',
          md: 'אם כדי להשתמש במחלקה שלך צריך **לקרוא את המימוש** כדי להבין מה קורה — ההפשטה נכשלה. ממשק טוב מספר את כל הסיפור בעצמו: שמות מתודות ברורים, פרמטרים מובנים מאליהם, והתנהגות שאפשר לנחש נכון.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's55',
      title: 'מושגים חשובים לסיכום ביניים',
      subtitle: 'שלושת המושגים ביחד — כפי שהם מופיעים בשקף 35',
      slides: [35],
      blocks: [
        {
          kind: 'terms',
          title: 'שלושת המושגים',
          items: [
            {
              he: 'כימוס נתונים',
              en: 'Data Encapsulation',
              note:
                'המושג הכולל: אריזת נתונים ופעולות ביחד, תוך הסתרה של נתונים ושל מימוש הפעולות.',
            },
            {
              he: 'הפשטת נתונים',
              en: 'Data Abstraction',
              note:
                'ייצוג חיצוני של הנתונים תוך הסתרת היישום הפנימי. בפועל: `private` על השדות, גישה דרך `get`/`set`.',
            },
            {
              he: 'הפשטת בקרה',
              en: 'Control Abstraction',
              note:
                'הסתרת פרטי היישום תוך חשיפת ממשקים בלבד. בפועל: חתימות ב-`.h`, גופים ב-`.cpp`.',
            },
          ],
        },
        {
          kind: 'table',
          title: 'איך שלושתם מתחברים',
          headers: ['המושג', 'מסתיר את', 'המנגנון בקוד'],
          rows: [
            ['**כימוס**', 'הכול (מושג-על)', '`class` — האריזה עצמה'],
            ['**הפשטת נתונים**', 'ה**נתונים**', '`private:` + `getter`/`setter`'],
            ['**הפשטת בקרה**', 'ה**מימוש**', 'פיצול ל-`.h` ו-`.cpp`'],
          ],
        },
        {
          kind: 'callout',
          variant: 'exam',
          title: 'ניסוח שכדאי לשנן',
          md: '**כימוס** = לארוז ולהסתיר.\n**הפשטת נתונים** = מסתירים *מה* שמור בפנים.\n**הפשטת בקרה** = מסתירים *איך* זה עובד.\n\n==אם תיתקל בשאלה "הסבר את ההבדל בין הפשטת נתונים להפשטת בקרה" — התשובה היא נתונים מול מימוש.==',
        },
        {
          kind: 'quiz',
          question: 'שייך כל פעולה למושג הנכון',
          multi: true,
          options: [
            {
              text: 'העברת השדה `balance` מ-`public` ל-`private` → הפשטת **נתונים**',
              correct: true,
              explain: 'הסתרנו נתון. זו הפשטת נתונים.',
            },
            {
              text: 'העברת גוף המתודה `calculateInterest` מ-`.h` ל-`.cpp` → הפשטת **בקרה**',
              correct: true,
              explain: 'הסתרנו מימוש. זו הפשטת בקרה.',
            },
            {
              text: 'הוספת `getBalance()` במקום גישה ישירה → הפשטת **נתונים**',
              correct: true,
              explain: 'גישה מבוקרת לנתון במקום גישה ישירה — הפשטת נתונים.',
            },
            {
              text: 'הוספת שדה חדש `public` למחלקה → כימוס',
              correct: false,
              explain:
                'להפך — זה **פוגע** בכימוס. חשפנו נתון נוסף לעולם, והתחייבנו אליו.',
            },
          ],
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'לאן זה ממשיך',
          md: 'שלושת המושגים האלה הם שלושה מתוך ארבעת **עמודי התווך של OOP**. הרביעי, **פולימורפיזם** (polymorphism), מגיע בשיעור 10 — ובדרך יש עוד: **ירושה** (inheritance) בשיעור 9, ו**הכלה** (composition) בשיעור 8. ==כל אחד מהם נשען על מה שלמדת כאן.==',
        },
      ],
    },
  ],
};

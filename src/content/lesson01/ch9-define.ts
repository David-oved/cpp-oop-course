import type { Chapter } from '../../types/content';

export const ch9Define: Chapter = {
  id: 'ch9',
  title: '#define מול const',
  sections: [
    /* ============================================================ */
    {
      id: 's49',
      title: 'ההנחיה #define',
      subtitle: 'החלפת טקסט, לא יותר',
      slides: [34],
      blocks: [
        {
          kind: 'prose',
          md: 'ההנחיה `#define` מורה לקדם המעבד **להחליף את כל הופעה** של מילה מסוימת בטקסט אחר. שוב — עיבוד טקסטואלי בלבד.',
        },
        {
          kind: 'code',
          runnable: true,
          title: 'הדוגמה מהמצגת',
          lang: 'cpp',
          code: `#include <iostream>
#include "A.h"
#define NUM 5

const int COUNT = 10;

int main()
{
    int arr[NUM];
    int arr2[COUNT];
    //...
    int x = COUNT;
    int y = NUM;
}`,
          annotations: [
            { line: 1, text: 'פקודה לקדם המעבד לכלול את הספריות הללו בקוד להידור' },
            { line: 3, text: 'פקודה לקדם המעבד להחליף כל הופעה של המילה NUM במילה 5' },
            { line: 5, text: 'משתנה קבוע — נקבע בשלב הקומפילציה, תופס זיכרון' },
          ],
        },
        {
          kind: 'compare',
          title: 'מה המהדר באמת מקבל',
          left: {
            title: 'מה שכתבת',
            code: `#define NUM 5

int main()
{
    int arr[NUM];
    int y = NUM;
    int z = NUM * 2;
}`,
            verdict: 'neutral',
          },
          right: {
            title: 'אחרי הקדם-מעבד',
            code: `int main()
{
    int arr[5];
    int y = 5;
    int z = 5 * 2;
}`,
            note:
              'המילה `NUM` **לא קיימת** מבחינת המהדר. אם תפתח דיבאגר ותחפש משתנה בשם `NUM`, לא תמצא כלום.',
            verdict: 'neutral',
          },
        },
        {
          kind: 'code',
          title: 'ראה בעצמך',
          runnable: true,
          code: `#include <iostream>
using namespace std;

#define NUM 5
#define GREETING "Hello from a macro"
#define SQUARE(x) ((x) * (x))

const int COUNT = 10;

int main()
{
    int arr[NUM];
    int arr2[COUNT];

    cout << "NUM   = " << NUM   << endl;
    cout << "COUNT = " << COUNT << endl;
    cout << GREETING << endl;
    cout << "SQUARE(4) = " << SQUARE(4) << endl;

    // ההבדל המהותי: ל-COUNT יש כתובת, ל-NUM אין
    cout << "address of COUNT: " << &COUNT << endl;
    // cout << &NUM;      ← לא מתקמפל: &5 חסר משמעות

    cout << "sizeof(COUNT) = " << sizeof(COUNT) << " bytes" << endl;

    for (int i = 0; i < NUM; i++)
        arr[i] = i * i;

    cout << "arr: ";
    for (int i = 0; i < NUM; i++)
        cout << arr[i] << " ";
    cout << endl;

    return 0;
}`,
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's50',
      title: 'במה #define שונה מ-const',
      subtitle: 'התשובה המלאה — שאלה קלאסית במבחן',
      slides: [34],
      blocks: [
        {
          kind: 'callout',
          variant: 'exam',
          title: 'התשובה כפי שהיא במצגת',
          md: '**משתנה שהוגדר קבוע (`const`) תופס זיכרון, ונקבע בשלב הקומפילציה.** מה שהוגדר כ-`#define` ==לא תופס זיכרון== אלא משמש כטקסט שפשוט מוחלף, ו**נקבע בשלב הקדם-מעבד, טרם קומפילציה**. `const` יותר משוכלל מבחינת האפשרויות שהוא מציע.',
        },
        {
          kind: 'table',
          title: 'ההשוואה המלאה',
          headers: ['', '`#define NUM 5`', '`const int COUNT = 10;`'],
          rows: [
            ['מי מטפל בזה', 'הקדם-מעבד', 'המהדר'],
            ['מתי', '**לפני** הקומפילציה', '**בזמן** הקומפילציה'],
            ['תופס זיכרון', '❌ לא — רק טקסט', '✅ כן (אם צריך כתובת)'],
            ['יש לו **טיפוס**', '❌ לא', '✅ כן — `int`'],
            ['בדיקת טיפוסים', '❌ אין', '✅ יש'],
            ['אפשר לקחת כתובת (`&`)', '❌ לא', '✅ כן'],
            ['נראה בדיבאגר', '❌ לא — נעלם', '✅ כן'],
            ['מכבד תחום הכרה (scope)', '❌ לא — גלובלי מנקודת ההגדרה', '✅ כן — כמו כל משתנה'],
            ['אפשר להגדיר בתוך מחלקה', '❌ לא באמת', '✅ כן'],
            ['הודעות שגיאה', '⚠️ מבלבלות — מצביעות על הטקסט המורחב', '✅ ברורות'],
          ],
        },
        {
          kind: 'heading',
          level: 3,
          text: 'שלוש דוגמאות מוחשיות להבדל',
        },
        {
          kind: 'code',
          title: '1. בדיקת טיפוסים',
          runnable: true,
          code: `#include <iostream>
using namespace std;

#define MAX_D 3.7
const int MAX_C = 3.7;      // המהדר חותך ל-3 ומזהיר

int main()
{
    int a[(int)MAX_D];      // צריך cast מפורש
    int b[MAX_C];           // עובד — MAX_C הוא int

    cout << "MAX_D = " << MAX_D << "  (no type — it is just text)" << endl;
    cout << "MAX_C = " << MAX_C << "  (int — truncated!)" << endl;

    return 0;
}`,
          caption: 'ל-const יש טיפוס, ולכן המהדר יכול להזהיר על אובדן דיוק. ל-define אין.',
        },
        {
          kind: 'code',
          title: '2. תחום הכרה',
          runnable: true,
          code: `#include <iostream>
using namespace std;

void foo()
{
    const int local = 100;      // קיים רק כאן
    #define MACRO 200           // "קיים" מכאן ועד סוף הקובץ!
    cout << "in foo: " << local << ", " << MACRO << endl;
}

void bar()
{
    // cout << local;     ← לא מתקמפל, local לא מוכר כאן. וזה טוב.
    cout << "in bar: MACRO is still " << MACRO << endl;   // דולף!
}

int main()
{
    foo();
    bar();
    return 0;
}`,
          caption:
            'ל-const יש תחום הכרה תקין. define דולף החוצה ומזהם את כל הקובץ שאחריו.',
        },
        {
          kind: 'code',
          title: '3. const בתוך מחלקה — משהו ש-define לא יכול',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Circle
{
private:
    static const int MAX_RADIUS = 1000;    // קבוע ששייך למחלקה
    double radius;

public:
    void setRadius(double r)
    {
        if (r > 0 && r <= MAX_RADIUS)
            radius = r;
        else
        {
            cout << "radius must be in (0, " << MAX_RADIUS << "]" << endl;
            radius = 1;
        }
    }
    double getRadius() { return radius; }
};

int main()
{
    Circle c;
    c.setRadius(50);
    cout << "r = " << c.getRadius() << endl;

    c.setRadius(5000);
    cout << "r = " << c.getRadius() << endl;

    return 0;
}`,
          caption:
            'הקבוע שייך למחלקה, מכבד הרשאות גישה, ומופיע בדיבאגר. define לא יכול אף אחד מאלה.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's51',
      title: 'מלכודות של #define',
      subtitle: 'למה `const` הוא ברירת המחדל הנכונה',
      slides: [34],
      blocks: [
        {
          kind: 'prose',
          md: 'המצגת אומרת ש"`const` יותר משוכלל". הנה למה — שלוש מלכודות קלאסיות שקורות **רק** עם `#define`.',
        },
        {
          kind: 'pitfall',
          title: 'מלכודת 1 — נקודה-פסיק בסוף',
          badCode: `#define MAX 100;      // ← ה-; הוא חלק מההחלפה!

int main()
{
    int arr[MAX];          // הופך ל: int arr[100;];
    int x = MAX + 5;       // הופך ל: int x = 100; + 5;
}`,
          error: `error: expected ']' before ';' token
    5 |     int arr[MAX];
      |            ~   ^
error: expected primary-expression before '+' token
    6 |     int x = MAX + 5;
      |                 ^`,
          explain:
            'הקדם-מעבד מחליף את `MAX` בטקסט `100;` — **כולל הנקודה-פסיק**. השגיאה מופיעה בשורה שבה השתמשת, לא בשורת ה-`#define`, ולכן קשה לקשר אותה לסיבה. עם `const int MAX = 100;` הנקודה-פסיק היא חלק תקין מההגדרה ואין בעיה.',
          goodCode: `#define MAX 100        // בלי ;
// או, עדיף:
const int MAX = 100;`,
        },
        {
          kind: 'pitfall',
          title: 'מלכודת 2 — מאקרו עם פרמטרים בלי סוגריים',
          badCode: `#define SQUARE(x) x * x

int main()
{
    cout << SQUARE(3);        // 3 * 3 = 9        ✓
    cout << SQUARE(2 + 1);    // 2 + 1 * 2 + 1 = 5  ✕ ציפינו 9!
}`,
          error: `// אין שגיאת קומפילציה. התוצאה פשוט שגויה: 5 במקום 9.`,
          explain:
            'הקדם-מעבד מחליף טקסט, ולא מבין קדימות אופרטורים. `SQUARE(2 + 1)` הופך ל-`2 + 1 * 2 + 1`, שמחושב כ-`2 + 2 + 1 = 5`. ==זה באג שקט לחלוטין== — הקוד מתקמפל ורץ ומחזיר תשובה שגויה.',
          goodCode: `// אם חייבים מאקרו — סוגריים בכל מקום:
#define SQUARE(x) ((x) * (x))

// אבל עדיף בכלל פונקציה:
inline int square(int x) { return x * x; }`,
          goodNote:
            'לפונקציה יש טיפוסים, בדיקות, ואין בה הפתעות קדימות. הקומפיילר יעשה לה inline בעצמו.',
        },
        {
          kind: 'pitfall',
          title: 'מלכודת 3 — חישוב כפול',
          badCode: `#define MAX(a, b) ((a) > (b) ? (a) : (b))

int i = 5;
int m = MAX(i++, 10);     // i++ מופיע פעמיים בהרחבה!`,
          error: `// אחרי ההרחבה:
// int m = ((i++) > (10) ? (i++) : (10));
// i גדל פעמיים במקום פעם אחת.`,
          explain:
            'המאקרו מזכיר את `a` **פעמיים**. אם `a` הוא ביטוי עם תופעת לוואי (`i++`, קריאה לפונקציה, קלט), התופעה מתרחשת פעמיים. עם פונקציה זה לא יכול לקרות — הארגומנט מחושב פעם אחת ומועבר.',
          goodCode: `inline int maxOf(int a, int b)
{
    return a > b ? a : b;
}

int m = maxOf(i++, 10);   // i++ מחושב פעם אחת בדיוק`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'הכלל המעשי',
          md: '**לקבועים → `const`. לפונקציות קטנות → `inline`. `#define` נשאר רק ל-include guards ולקומפילציה מותנית** (`#ifdef DEBUG`). ==זה הכלל שמקובל בכל קוד C++ מודרני.==',
        },
        {
          kind: 'callout',
          variant: 'modern',
          title: 'ו-`constexpr`',
          md: 'ב-C++11 ואילך יש `constexpr` — קבוע שמובטח להיות מחושב בזמן קומפילציה: `constexpr int MAX = 100;`. זה נותן את כל היתרונות של `const` **בתוספת** ההבטחה שאין עלות בזמן ריצה. ==לא נדרש בקורס, אבל זה מה שתראה בקוד עדכני.==',
        },
        {
          kind: 'quiz',
          question: 'מה יודפס?',
          code: `#define HALF(x) x / 2

int main()
{
    cout << HALF(10) << " ";
    cout << HALF(4 + 6) << endl;
}`,
          options: [
            {
              text: '`5 5`',
              correct: false,
              explain: 'התשובה ה"הגיונית", אבל לא מה שקורה. `HALF(4 + 6)` מתרחב ל-`4 + 6 / 2`.',
            },
            {
              text: '`5 7`',
              correct: true,
              explain:
                'נכון! `HALF(10)` → `10 / 2` = 5. אבל `HALF(4 + 6)` → `4 + 6 / 2` = `4 + 3` = 7, כי החלוקה קודמת לחיבור. ==זו בדיוק מלכודת הסוגריים.== התיקון: `#define HALF(x) ((x) / 2)`.',
            },
            { text: 'שגיאת קומפילציה', correct: false, explain: 'הקוד תקין תחבירית לגמרי — וזו הבעיה. הוא פשוט מחשב את הדבר הלא נכון.' },
            { text: '`5 10`', correct: false, explain: 'בדוק שוב את סדר הפעולות: `4 + 6 / 2` = `4 + 3` = 7.' },
          ],
        },
      ],
    },
  ],
};

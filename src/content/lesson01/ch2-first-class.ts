import type { Chapter } from '../../types/content';

export const ch2FirstClass: Chapter = {
  id: 'ch2',
  title: 'המחלקה הראשונה',
  sections: [
    /* ============================================================ */
    {
      id: 's10',
      title: 'המילה השמורה class',
      subtitle: 'התחביר, שורה אחר שורה',
      slides: [9, 10],
      blocks: [
        {
          kind: 'prose',
          md: 'בדומה למבנה, ניתן להגדיר טיפוס משלנו — **מחלקה** — בעזרת המילה השמורה `class`. ההבדל: כשמגדירים מחלקה אפשר להגדיר עבורה גם את **התכונות** (השדות) וגם את **אוסף הפעולות** שניתן לבצע עליהן.',
        },
        {
          kind: 'code',
          runnable: true,
          title: 'המחלקה הראשונה שלנו',
          code: `class Rect
{
public:
    int length;
    int width;

    void printArea();
};`,
          annotations: [
            { line: 1, text: 'המילה השמורה class ואחריה שם המחלקה — הטיפוס החדש' },
            { line: 3, text: 'הרשאת גישה. נסביר לעומק בפרק 4 — כרגע public = "נגיש מבחוץ"' },
            { line: 4, text: 'תכונה (שדה)' },
            { line: 7, text: 'הצהרה על מתודה — יש חתימה, אין גוף' },
            { line: 8, text: 'נקודה-פסיק! חובה בסוף הגדרת מחלקה' },
          ],
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'הגדרנו טיפוס, לא יצרנו אובייקט',
          md: 'אחרי השורות האלה, ==לא קיים אף מלבן בזיכרון==. הגדרנו רק **טיפוס חדש בשם `Rect`**, בדיוק כמו שהשפה מגדירה טיפוס בשם `int`. כדי שיהיה מלבן אמיתי צריך להגדיר **מופע** (object) מהטיפוס הזה — וזה מה שנעשה בעמוד הבא.',
        },
        {
          kind: 'heading',
          level: 3,
          text: 'למה יש הצהרה בלי גוף?',
        },
        {
          kind: 'prose',
          md: 'שים לב לשורה `void printArea();` — יש שם חתימה של מתודה, אבל אין גוף. זה חוקי לגמרי, והוא נקרא **הצהרה** (declaration). זה אומר לקומפיילר: "קיימת מתודה בשם `printArea` שלא מקבלת פרמטרים ולא מחזירה ערך. את הגוף שלה תמצא במקום אחר."',
        },
        {
          kind: 'prose',
          md: 'שתי הדרכים לספק את הגוף — בתוך המחלקה או מחוץ לה — הן נושא של שני עמודים בהמשך הפרק. אבל צריך לדעת: אם **תצהיר** על מתודה ולעולם לא תספק לה גוף, ותנסה לקרוא לה — תקבל שגיאה. וזו לא שגיאת קומפילציה אלא **שגיאת לינקר**. נחזור לזה בפרק 7.',
        },
        {
          kind: 'callout',
          variant: 'exam',
          title: 'מוסכמת שמות — מופיע בבדיקות',
          md: 'מקובל ש**שם מחלקה מתחיל באות גדולה** וממשיך באותיות קטנות: `Rect`, `Student`, `BankAccount`. שמות שדות ומתודות מתחילים באות **קטנה**: `length`, `printArea`. זו לא דרישה של הקומפיילר — הוא יקבל כל שם — אבל היא מוסכמה שכולם עובדים לפיה, וסטייה ממנה נחשבת שגיאת סגנון.',
        },
        {
          kind: 'code',
          runnable: true,
          title: 'המבנה הכללי — שלד לזכור',
          lang: 'cpp',
          code: `class ClassName
{
    // הרשאות גישה (public / protected / private)
    // תכונות — שדות
    // פעולות — מתודות

};   // ← נקודה-פסיק`,
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's11',
      title: 'יצירת מופע על המחסנית',
      subtitle: 'מהטיפוס אל האובייקט — והגישה בנקודה',
      slides: [11],
      blocks: [
        {
          kind: 'prose',
          md: 'הגדרנו טיפוס. עכשיו נשתמש בו. יצירת מופע נראית **בדיוק כמו הגדרת משתנה רגיל** — כי זה בדיוק מה שזה:',
        },
        {
          kind: 'code',
          runnable: true,
          prelude: `class Rect
{
public:
    int length;
    int width;

    void setLength(int myLength) { length = myLength; }
    void setWidth(int myWidth)   { width  = myWidth;  }
    void printArea() { cout << "Area = " << length * width << endl; }
};`,
          title: 'הגדרת מופע וגישה לשדותיו',
          code: `int main()
{
    Rect rec1;            // מופע מטיפוס מלבן — על המחסנית

    rec1.length = 17;     // גישה לשדה עם נקודה
    rec1.width  = 19;
    rec1.printArea();     // הפעלת מתודה — גם עם נקודה

    return 0;
}`,
          annotations: [
            { line: 3, text: 'כאן מוקצה זיכרון בפועל — 8 בתים (שני int)' },
            { line: 5, text: 'אופרטור הנקודה: אובייקט.שדה' },
            { line: 7, text: 'אותו אופרטור בדיוק גם למתודה' },
          ],
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'כלל פשוט שיחסוך לך שגיאות',
          md: '**אם יש לך אובייקט — נקודה. אם יש לך מצביע לאובייקט — חץ.** זהו. `rec1.length` מול `p->length`. אין חריגים.',
        },
        {
          kind: 'heading',
          level: 3,
          text: 'כמה מקום תופס אובייקט?',
        },
        {
          kind: 'code',
          title: 'נמדוד בפועל',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Rect
{
public:
    int length;
    int width;

    void printArea()
    {
        cout << "Area = " << length * width << endl;
    }
};

int main()
{
    Rect rec1;
    rec1.length = 17;
    rec1.width  = 19;
    rec1.printArea();

    cout << "sizeof(Rect) = " << sizeof(Rect) << " bytes" << endl;
    cout << "sizeof(int)  = " << sizeof(int)  << " bytes" << endl;

    Rect rec2;
    Rect rec3;
    cout << "3 objects = " << sizeof(rec1) + sizeof(rec2) + sizeof(rec3)
         << " bytes total" << endl;

    return 0;
}`,
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'המתודה לא תופסת מקום באובייקט',
          md: 'שים לב לפלט: `sizeof(Rect)` הוא 8 — בדיוק שני `int`. **המתודה `printArea` לא מוסיפה אף בית.** הסיבה: הקוד של המתודה קיים פעם אחת בזיכרון התוכנית, ומשותף לכל האובייקטים. רק ה**נתונים** מוכפלים. אם תיצור 1000 מלבנים, יהיו 1000 עותקים של `length` ו-`width`, אבל עותק אחד בלבד של הקוד של `printArea`.',
        },
        {
          kind: 'quiz',
          question: 'מחלקה מכילה 3 שדות `int` ו-5 מתודות. מה `sizeof` שלה יחזיר (בקירוב, במערכת רגילה)?',
          options: [
            { text: '12', correct: true, explain: 'נכון — 3 × 4 בתים. המתודות לא נספרות; הקוד שלהן משותף לכל האובייקטים ולא יושב בתוכם.' },
            { text: '12 + גודל 5 המתודות', correct: false, explain: 'זו הטעות הנפוצה. מתודות לא תופסות מקום באובייקט.' },
            { text: '0 — מחלקה היא רק הגדרה', correct: false, explain: '`sizeof` של מחלקה מחזיר את גודל **מופע** ממנה, ומופע כן תופס מקום. (מחלקה ריקה לגמרי תחזיר 1, לא 0 — כדי שלשני אובייקטים ריקים יהיו כתובות שונות.)' },
            { text: '20 — 3 שדות ועוד מצביע לכל מתודה', correct: false, explain: 'זה מה שקורה עם **מתודות וירטואליות** (שיעור 10), ואפילו אז נוסף מצביע אחד בלבד לכל האובייקט, לא אחד לכל מתודה.' },
          ],
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's12',
      title: 'יצירת מופע דינמי',
      subtitle: 'new, delete, והחץ',
      slides: [11],
      blocks: [
        {
          kind: 'prose',
          md: 'לפעמים לא רוצים שהאובייקט ימות בסוף הבלוק — למשל כשבונים רשימה מקושרת, או כשמספר האובייקטים נקבע רק בזמן ריצה. בשביל זה יש **הקצאה דינמית**.',
        },
        {
          kind: 'code',
          runnable: true,
          prelude: `class Rect
{
public:
    int length;
    int width;

    void setLength(int myLength) { length = myLength; }
    void setWidth(int myWidth)   { width  = myWidth;  }
    void printArea() { cout << "Area = " << length * width << endl; }
};`,
          title: 'שלושת השלבים',
          code: `Rect* rec3;              // 1. מצביע לטיפוס מלבן — עדיין מצביע לזבל

rec3 = new Rect;         // 2. הקצאה בערימה, הכתובת נשמרת ב-rec3

rec3->length = 17;       // 3. גישה דרך המצביע — עם חץ
rec3->width  = 19;
rec3->printArea();

delete rec3;             // 4. שחרור — חובה!
rec3 = nullptr;`,
          annotations: [
            { line: 1, text: 'הגדרת מצביע. עדיין לא הוקצה שום מלבן!' },
            { line: 3, text: 'כאן נוצר המלבן בפועל, בערימה' },
            { line: 5, text: 'החץ -> כי rec3 הוא מצביע ולא אובייקט' },
            { line: 8, text: 'בלי זה — דליפת זיכרון' },
          ],
        },
        {
          kind: 'pitfall',
          title: 'שכחת את ה-new — המצביע לא מצביע לכלום',
          badCode: `Rect* p;          // מצביע לא מאותחל
p->length = 17;   // ✕ כותבים לכתובת אקראית`,
          error: `warning: 'p' is used uninitialized [-Wuninitialized]
Segmentation fault (core dumped)`,
          explain:
            'הגדרת מצביע **לא** מקצה אובייקט. `Rect* p;` יוצרת משתנה בן 8 בתים שמכיל זבל — כתובת אקראית כלשהי בזיכרון. כשכותבים `p->length = 17` התוכנית הולכת לאותה כתובת אקראית וכותבת שם. בדרך כלל זו כתובת שלא שייכת לנו והמערכת הורגת את התוכנית (Segmentation fault). לפעמים — גרוע יותר — זו כתובת שכן שייכת לנו, והתוכנית ממשיכה לרוץ עם נתון מושחת.',
          goodCode: `Rect* p = new Rect;   // עכשיו p מצביע למלבן אמיתי
p->length = 17;
// ...
delete p;
p = nullptr;`,
          goodNote:
            'הרגל טוב: **תמיד** לאתחל מצביע בשורת ההגדרה — או ל-`new`, או ל-`nullptr`. מצביע לא מאותחל הוא פצצת זמן.',
        },
        {
          kind: 'memory',
          title: 'אובייקט דינמי — הליכה שורה-שורה',
          intro: 'שים לב במיוחד לצעד שבו יש **מצביע בלי אובייקט**, ולצעד שבו יש **אובייקט בלי מצביע**.',
          code: `int main()
{
    Rect* rec3;
    rec3 = new Rect;
    rec3->length = 17;
    rec3->width = 19;
    rec3->printArea();
    delete rec3;
    rec3 = nullptr;
    return 0;
}`,
          steps: [
            {
              line: 3,
              caption: '`Rect* rec3;` — נוצר **מצביע** על המחסנית. הוא מכיל זבל. אין עדיין שום מלבן.',
              detail: 'זה הרגע המסוכן: אם תיגש עכשיו ל-`rec3->length`, התוכנית תיגש לכתובת אקראית.',
              stack: [
                {
                  label: 'main()',
                  active: true,
                  vars: [{ name: 'rec3', type: 'Rect*', value: '0x??????', state: 'garbage' }],
                },
              ],
              heap: [],
            },
            {
              line: 4,
              caption: '`new Rect` — הוקצו 8 בתים בערימה. הכתובת שלהם הושמה ב-`rec3`.',
              detail: 'עכשיו יש חץ אמיתי: המצביע במחסנית → האובייקט בערימה. שדות האובייקט עדיין לא מאותחלים.',
              stack: [
                {
                  label: 'main()',
                  active: true,
                  vars: [{ name: 'rec3', type: 'Rect*', value: '0xa41c00', state: 'changed', pointsTo: 'h1' }],
                },
              ],
              heap: [
                {
                  id: 'h1',
                  label: 'Rect',
                  addr: '0xa41c00',
                  state: 'new',
                  fields: [
                    { name: 'length', type: 'int', value: '?', state: 'garbage' },
                    { name: 'width', type: 'int', value: '?', state: 'garbage' },
                  ],
                },
              ],
            },
            {
              line: 5,
              caption: '`rec3->length = 17;` — עוקבים אחרי הכתובת אל הערימה, וכותבים לשדה `length`.',
              stack: [
                {
                  label: 'main()',
                  active: true,
                  vars: [{ name: 'rec3', type: 'Rect*', value: '0xa41c00', state: 'reading' }],
                },
              ],
              heap: [
                {
                  id: 'h1',
                  label: 'Rect',
                  addr: '0xa41c00',
                  fields: [
                    { name: 'length', type: 'int', value: '17', state: 'changed' },
                    { name: 'width', type: 'int', value: '?', state: 'garbage' },
                  ],
                },
              ],
            },
            {
              line: 6,
              caption: '`rec3->width = 19;` — האובייקט מלא כולו.',
              stack: [
                {
                  label: 'main()',
                  active: true,
                  vars: [{ name: 'rec3', type: 'Rect*', value: '0xa41c00' }],
                },
              ],
              heap: [
                {
                  id: 'h1',
                  label: 'Rect',
                  addr: '0xa41c00',
                  fields: [
                    { name: 'length', type: 'int', value: '17' },
                    { name: 'width', type: 'int', value: '19', state: 'changed' },
                  ],
                },
              ],
            },
            {
              line: 7,
              caption:
                '`rec3->printArea();` — נפתחה **מסגרת חדשה** על המחסנית עבור המתודה. היא מקבלת בסתר את `this` = הכתובת של האובייקט.',
              detail:
                'המתודה כותבת `length * width` ובעצם מתכוונת ל-`this->length * this->width`. זה הפרמטר הנסתר שדיברנו עליו.',
              stack: [
                {
                  label: 'main()',
                  vars: [{ name: 'rec3', type: 'Rect*', value: '0xa41c00' }],
                },
                {
                  label: 'Rect::printArea()',
                  active: true,
                  vars: [{ name: 'this', type: 'Rect*', value: '0xa41c00', state: 'new' }],
                },
              ],
              heap: [
                {
                  id: 'h1',
                  label: 'Rect',
                  addr: '0xa41c00',
                  fields: [
                    { name: 'length', type: 'int', value: '17', state: 'reading' },
                    { name: 'width', type: 'int', value: '19', state: 'reading' },
                  ],
                },
              ],
              output: 'Area = 323',
            },
            {
              line: 8,
              caption:
                '`delete rec3;` — הזיכרון בערימה שוחרר. `rec3` עדיין מחזיק את הכתובת הישנה — **מצביע תלוי**.',
              stack: [
                {
                  label: 'main()',
                  active: true,
                  vars: [{ name: 'rec3', type: 'Rect*', value: '0xa41c00', state: 'garbage' }],
                },
              ],
              heap: [
                {
                  id: 'h1',
                  label: 'Rect',
                  addr: '0xa41c00',
                  state: 'freed',
                  fields: [
                    { name: 'length', type: 'int', value: '✕' },
                    { name: 'width', type: 'int', value: '✕' },
                  ],
                },
              ],
              output: 'Area = 323',
            },
            {
              line: 9,
              caption: '`rec3 = nullptr;` — עכשיו ברור שהמצביע לא מצביע לשום דבר תקף.',
              stack: [
                {
                  label: 'main()',
                  active: true,
                  vars: [{ name: 'rec3', type: 'Rect*', value: 'nullptr', state: 'changed' }],
                },
              ],
              heap: [],
              output: 'Area = 323',
            },
          ],
        },
        {
          kind: 'callout',
          variant: 'modern',
          title: 'איך זה נראה בקוד עדכני',
          md: 'בקוד C++ מודרני כמעט אף פעם לא כותבים `new`/`delete` ידנית. במקום זה משתמשים ב-**smart pointers**: `unique_ptr<Rect> p = make_unique<Rect>();` — האובייקט משתחרר אוטומטית כשהמצביע יוצא מתחום ההכרה, ואי אפשר לשכוח `delete`. ==בקורס הזה עובדים עם `new`/`delete` ידניים, וכך גם יופיע במבחן== — כי בלי להבין את הניהול הידני אי אפשר להבין למה ה-smart pointer עוזר, ולא תוכל לבנות רשימה מקושרת בשיעור 8.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's13',
      title: 'שתי דרכים לממש מתודה — א: בתוך המחלקה',
      subtitle: 'inline function — כשהמתודה קצרה',
      slides: [12],
      blocks: [
        {
          kind: 'prose',
          md: 'עד עכשיו כתבנו `void printArea();` — הצהרה בלי גוף. הדרך הראשונה לספק את הגוף היא פשוט לכתוב אותו **בתוך הגדרת המחלקה**.',
        },
        {
          kind: 'code',
          runnable: true,
          title: 'מימוש בתוך המחלקה',
          code: `class Rect
{
public:
    int length;
    int width;

    void printArea()
    {
        cout << length * width << endl;
    }
};`,
          annotations: [
            { line: 7, text: 'החתימה' },
            { line: 8, text: 'הגוף — כאן, בתוך המחלקה' },
            { line: 9, text: 'שים לב: length ולא rec1.length — המתודה כבר יודעת על מי היא עובדת' },
          ],
        },
        {
          kind: 'prose',
          md: 'מתודה שממומשת בתוך הגדרת המחלקה נקראת **פונקציה מוטבעת** — `inline function`.',
        },
        {
          kind: 'heading',
          level: 3,
          text: 'מה המשמעות של inline בפועל',
        },
        {
          kind: 'prose',
          md: '`inline` היא **בקשה** מהקומפיילר: במקום לייצר קריאה לפונקציה, שתל את גוף הפונקציה ישירות במקום הקריאה. זה חוסך את התקורה של קריאה (דחיפת פרמטרים למחסנית, קפיצה, חזרה). עבור מתודה בת שורה אחת, התקורה הזו יכולה להיות גדולה יותר מהעבודה עצמה.',
        },
        {
          kind: 'compare',
          title: 'מה הקומפיילר עשוי לעשות',
          left: {
            title: 'הקוד שכתבת',
            code: `int Rect::getLength()
{
    return length;
}

// שימוש:
int x = r.getLength();`,
            verdict: 'neutral',
          },
          right: {
            title: 'מה שהקומפיילר עשוי לייצר',
            code: `// אין קריאה בכלל.
// הגוף הושתל במקום:
int x = r.length;`,
            note: 'התוצאה: אפס תקורה. אותה יעילות כמו גישה ישירה לשדה, אבל עם כל היתרונות של כימוס.',
            verdict: 'good',
          },
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: '`inline` היא בקשה, לא פקודה',
          md: 'הקומפיילר רשאי להתעלם. אם המתודה ארוכה, רקורסיבית, או מכילה לולאות מורכבות — הוא כנראה יתעלם וייצר קריאה רגילה. מצד שני, קומפיילרים מודרניים מבצעים inlining גם על פונקציות שלא סומנו, אם הם חושבים שכדאי. ==אל תבנה על זה== — כתוב קוד קריא, ותן לקומפיילר לעשות את עבודתו.',
        },
        {
          kind: 'code',
          title: 'דוגמה שלמה שרצה',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Rect
{
public:
    int length;
    int width;

    void printArea()
    {
        cout << "Area = " << length * width << endl;
    }

    void printPerimeter()
    {
        cout << "Perimeter = " << 2 * (length + width) << endl;
    }
};

int main()
{
    Rect r;
    r.length = 5;
    r.width  = 3;

    r.printArea();
    r.printPerimeter();

    Rect big;
    big.length = 100;
    big.width  = 40;
    big.printArea();      // אותה מתודה, אובייקט אחר

    return 0;
}`,
          caption: 'שים לב: קראנו ל-printArea פעמיים, על שני אובייקטים שונים, וקיבלנו תוצאות שונות.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's14',
      title: 'שתי דרכים לממש מתודה — ב: מחוץ למחלקה',
      subtitle: 'אופרטור טווח ההכרה :: והשיוך למחלקה',
      slides: [12],
      blocks: [
        {
          kind: 'prose',
          md: 'הדרך השנייה: להשאיר בתוך המחלקה **רק את ההצהרה**, ולכתוב את הגוף מחוץ למחלקה. אבל אז נוצרת בעיה — איך הקומפיילר יידע שהפונקציה הזו שייכת ל-`Rect`, ולא סתם פונקציה גלובלית באותו שם?',
        },
        {
          kind: 'prose',
          md: 'התשובה: **אופרטור טווח ההכרה** — `::` (scope resolution operator).',
        },
        {
          kind: 'code',
          runnable: true,
          title: 'מימוש מחוץ למחלקה',
          code: `class Rect
{
public:
    int length;
    int width;

    void printArea();      // רק הצהרה
};

// המימוש, מחוץ למחלקה:
void Rect::printArea()
{
    cout << length * width << endl;
}`,
          annotations: [
            { line: 7, text: 'הצהרה בלבד — אין גוף' },
            { line: 11, text: 'Rect:: מודיע לקומפיילר "המתודה הזו שייכת למחלקה Rect"' },
            { line: 13, text: 'גם כאן — length בלי קידומת. אנחנו בתוך הקשר של המחלקה' },
          ],
        },
        {
          kind: 'callout',
          variant: 'danger',
          title: 'השגיאה הכי נפוצה: שכחת את `Rect::`',
          md: 'אם תכתוב `void printArea()` בלי `Rect::`, יצרת **פונקציה גלובלית חדשה** בשם `printArea`. הקומפיילר לא יתלונן על ההגדרה. אבל הפונקציה הגלובלית לא מכירה את `length` ואת `width` — ותקבל שגיאה מוזרה שנראית קשורה למשתנים ולא למחלקה.',
        },
        {
          kind: 'pitfall',
          title: 'המימוש בלי שם המחלקה',
          badCode: `class Rect
{
public:
    int length;
    int width;
    void printArea();
};

void printArea()          // ✕ חסר Rect::
{
    cout << length * width << endl;
}`,
          error: `error: 'length' was not declared in this scope
   10 |     cout << length * width << endl;
      |             ^~~~~~
error: 'width' was not declared in this scope`,
          explain:
            'בלי `Rect::`, הפונקציה שהגדרנו היא פונקציה **גלובלית** רגילה שלא שייכת לאף מחלקה. לפונקציה גלובלית אין `this`, ולכן `length` הוא סתם שם שלא הוגדר בשום מקום. שים לב שהשגיאה מדברת על המשתנים, לא על המחלקה — וזה מה שמבלבל. **הכלל: אם קיבלת "not declared in this scope" על שם של שדה, בדוק קודם שכתבת את `ClassName::`.**',
          goodCode: `void Rect::printArea()
{
    cout << length * width << endl;
}`,
        },
        {
          kind: 'code',
          title: 'מחלקה מלאה עם מימוש חיצוני — הרץ',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Rect
{
public:
    int length;
    int width;

    void printArea();
    void printPerimeter();
    void scale(int factor);
};

void Rect::printArea()
{
    cout << "Area = " << length * width << endl;
}

void Rect::printPerimeter()
{
    cout << "Perimeter = " << 2 * (length + width) << endl;
}

void Rect::scale(int factor)
{
    length = length * factor;
    width  = width  * factor;
}

int main()
{
    Rect r;
    r.length = 5;
    r.width  = 3;

    r.printArea();
    r.scale(2);
    cout << "-- after scale(2) --" << endl;
    r.printArea();
    r.printPerimeter();

    return 0;
}`,
        },
        {
          kind: 'callout',
          variant: 'exam',
          title: 'תרגיל שכיח במבחן',
          md: 'נותנים לך הגדרת מחלקה ומבקשים לכתוב את המימושים מחוץ לה. שלוש נקודות שמפילות: (1) לזכור `ClassName::` **לפני** שם המתודה ואחרי טיפוס ההחזרה — `void Rect::printArea()`, לא `Rect::void printArea()`; (2) לא לכתוב `;` אחרי גוף המתודה החיצוני; (3) לשמור על **חתימה זהה בדיוק** — כל הבדל בטיפוסי הפרמטרים ייצור עומס-יתר חדש במקום לממש את הקיים.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's15',
      title: 'מתי בוחרים כל דרך',
      subtitle: 'המוסכמה שנהוגה בקורס ובתעשייה',
      slides: [12],
      blocks: [
        {
          kind: 'table',
          title: 'שתי הדרכים זו מול זו',
          headers: ['', 'בתוך המחלקה (inline)', 'מחוץ למחלקה (`::`)'],
          rows: [
            ['מתאים ל', 'מתודות **קצרות** — שורה או שתיים', 'מתודות **ארוכות** או מורכבות'],
            ['דוגמאות טיפוסיות', '`getLength()`, `isEmpty()`, `getX()`', 'אלגוריתמים, לולאות, ולידציה מורכבת'],
            ['קריאוּת הממשק', 'המחלקה מתארכת, קשה לראות את התמונה', 'המחלקה נשארת קצרה כמו "תוכן עניינים"'],
            ['יעילות', 'רמז ל-inlining — ייתכן חיסכון בקריאה', 'קריאה רגילה (הקומפיילר עדיין רשאי לייעל)'],
            ['הפרדה לקבצים', 'הכול ב-`.h`', 'הצהרה ב-`.h`, מימוש ב-`.cpp` ← **הנפוץ בפרויקטים**'],
          ],
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'המוסכמה של הקורס',
          md: 'מקובל ש**מתודות קצרות ימומשו בתוך הגדרת המחלקה**, ו**מתודות ארוכות ימומשו מחוץ למחלקה** בעזרת אופרטור טווח ההכרה `::`. בשני המקרים — ==מתודות של מחלקה יכולות לגשת ולשנות את השדות שלה==, בלי קשר לאיפה הן ממומשות.',
        },
        {
          kind: 'code',
          title: 'שילוב טיפוסי — כך זה נראה בפרויקט אמיתי',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class BankAccount
{
private:
    int    accountNumber;
    double balance;

public:
    // קצרות — בתוך המחלקה
    int    getAccountNumber() { return accountNumber; }
    double getBalance()       { return balance; }
    void   setAccountNumber(int n) { accountNumber = n; }

    // ארוכות — מחוץ למחלקה
    void deposit(double amount);
    bool withdraw(double amount);
    void printStatement();
};

void BankAccount::deposit(double amount)
{
    if (amount <= 0)
    {
        cout << "Deposit must be positive." << endl;
        return;
    }
    balance = balance + amount;
    cout << "Deposited " << amount << ". New balance: " << balance << endl;
}

bool BankAccount::withdraw(double amount)
{
    if (amount <= 0)
    {
        cout << "Withdrawal must be positive." << endl;
        return false;
    }
    if (amount > balance)
    {
        cout << "Insufficient funds. Balance is " << balance << endl;
        return false;
    }
    balance = balance - amount;
    cout << "Withdrew " << amount << ". New balance: " << balance << endl;
    return true;
}

void BankAccount::printStatement()
{
    cout << "--------------------------" << endl;
    cout << "Account: " << accountNumber << endl;
    cout << "Balance: " << balance << endl;
    cout << "--------------------------" << endl;
}

int main()
{
    BankAccount acc;
    acc.setAccountNumber(12345);

    acc.deposit(1000);
    acc.withdraw(250);
    acc.withdraw(5000);      // ייכשל
    acc.printStatement();

    return 0;
}`,
          caption:
            'שים לב: יש כאן באג מכוון! ה-balance לא אותחל. הרץ וראה — הפלט תלוי בזבל שהיה בזיכרון. הפתרון הוא בנאי, בשיעור 2.',
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'הבאג בקוד למעלה — שים לב',
          md: 'הגדרנו `BankAccount acc;` ומיד קראנו ל-`deposit(1000)`. אבל `balance` **מעולם לא אותחל**! הוא מכיל זבל. ולכן `balance + 1000` הוא זבל ועוד 1000. זו בדיוק הבעיה שהבנאי (constructor) בא לפתור — **שיעור 2 כולו מוקדש לה**. לעת עתה, הפתרון הזמני הוא להוסיף מתודה `init()` ולזכור לקרוא לה.',
        },
        {
          kind: 'quiz',
          question: 'איזו מהמתודות הבאות היית ממש **מחוץ** למחלקה?',
          multi: true,
          options: [
            {
              text: '`int getAge() { return age; }`',
              correct: false,
              explain: 'שורה אחת — קלאסי למימוש בתוך המחלקה.',
            },
            {
              text: 'מתודה שמדפיסה טבלה עם לולאה כפולה ופורמט',
              correct: true,
              explain: 'ארוכה ומסורבלת. בתוך המחלקה היא תסתיר את הממשק — נכון להוציא החוצה.',
            },
            {
              text: '`bool isEmpty() { return count == 0; }`',
              correct: false,
              explain: 'ביטוי אחד קצר. בתוך המחלקה.',
            },
            {
              text: 'מתודה שממיינת מערך פנימי עם bubble sort',
              correct: true,
              explain: 'לולאות מקוננות ולוגיקה. מקומה מחוץ למחלקה.',
            },
          ],
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's16',
      title: 'this — המצביע הנסתר',
      subtitle: 'איך המתודה יודעת על איזה אובייקט לעבוד',
      blocks: [
        {
          kind: 'prose',
          md: 'שאלנו את זה כבר פעמיים בחידונים. עכשיו נענה עליה כמו שצריך, כי היא תחזור בכל שיעור מכאן והלאה.',
        },
        {
          kind: 'prose',
          md: 'כשכותבים `r1.printArea()`, הקומפיילר מתרגם את זה בערך ל-`Rect::printArea(&r1)` — כלומר **מעביר את כתובת האובייקט כפרמטר נסתר**. הפרמטר הזה נקרא `this`, והוא מצביע לאובייקט שעליו נקראה המתודה.',
        },
        {
          kind: 'compare',
          title: 'מה שכתבת מול מה שקורה',
          left: {
            title: 'מה שאתה כותב',
            code: `class Rect
{
public:
    int length, width;

    void printArea()
    {
        cout << length * width;
    }
};

r1.printArea();`,
            verdict: 'neutral',
          },
          right: {
            title: 'מה שהקומפיילר מבין',
            code: `class Rect
{
public:
    int length, width;

    void printArea(Rect* this)
    {
        cout << this->length * this->width;
    }
};

Rect::printArea(&r1);`,
            note: 'זה לא תחביר חוקי שאתה יכול לכתוב — זו רק המחשה של מה שקורה מתחת למכסה המנוע.',
            verdict: 'neutral',
          },
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'המסקנה החשובה',
          md: 'בתוך מתודה, ==כל שם של שדה שאתה כותב הוא בעצם `this->field`==. לכן `length` בתוך `printArea` הוא השדה של האובייקט שעליו נקראה המתודה. אם קראת `r1.printArea()` — זה ה-`length` של `r1`. אם קראת `big.printArea()` — זה של `big`. אותו קוד בדיוק, אובייקט אחר.',
        },
        {
          kind: 'heading',
          level: 3,
          text: 'מתי כן כותבים `this` במפורש',
        },
        {
          kind: 'prose',
          md: 'ברוב הזמן אין צורך. אבל יש שני מקרים שבהם `this` הכרחי או שימושי:',
        },
        {
          kind: 'code',
          title: 'מקרה 1: התנגשות שמות בין פרמטר לשדה',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Rect
{
private:
    int length;
    int width;

public:
    // הפרמטר נקרא בדיוק כמו השדה!
    void setLength(int length)
    {
        // length = length;         // ✕ זה משים את הפרמטר בעצמו!
        this->length = length;      // ✓ this->length הוא השדה
    }

    void setWidth(int w) { width = w; }   // אין התנגשות — לא צריך this

    void print()
    {
        cout << "length=" << length << " width=" << width << endl;
    }
};

int main()
{
    Rect r;
    r.setLength(17);
    r.setWidth(19);
    r.print();
    return 0;
}`,
          annotations: [
            { line: 15, text: 'השורה המושבתת — לו הייתה פעילה, השדה לא היה משתנה בכלל' },
            { line: 16, text: 'this-> מבדיל במפורש בין השדה לפרמטר' },
          ],
        },
        {
          kind: 'callout',
          variant: 'danger',
          title: 'הבאג השקט מספר 1 של מתחילים',
          md: 'אם הפרמטר נקרא בדיוק כמו השדה, `length = length;` **מתקמפל בלי שגיאה** ולא עושה כלום — הוא משים את הפרמטר בתוך עצמו. השדה נשאר עם זבל. הקומפיילר עשוי לתת אזהרה `-Wself-assign` אבל לא שגיאה. שתי דרכים להימנע: או `this->length = length;`, או פשוט לתת לפרמטר שם אחר — **בקורס נהוג `myLength`**.',
        },
        {
          kind: 'code',
          title: 'מקרה 2: מתודה שמחזירה את האובייקט עצמו',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Counter
{
private:
    int value;

public:
    void reset() { value = 0; }

    // מחזירה הפניה לאובייקט עצמו — מאפשר שרשור
    Counter& increment()
    {
        value++;
        return *this;        // *this הוא האובייקט, this הוא המצביע אליו
    }

    void print() { cout << "value = " << value << endl; }
};

int main()
{
    Counter c;
    c.reset();

    c.increment().increment().increment();   // שרשור!
    c.print();

    return 0;
}`,
          caption: 'הטכניקה הזו (method chaining) תחזור בשיעור 4 כשנלמד לחפוף אופרטורים.',
        },
        {
          kind: 'quiz',
          question: 'מה יודפס?',
          code: `class Box
{
private:
    int size;
public:
    void setSize(int size) { size = size; }
    int  getSize()         { return size;  }
};

Box b;
b.setSize(42);
cout << b.getSize();`,
          options: [
            {
              text: '42',
              correct: false,
              explain:
                'זו התשובה שכולם נותנים, והיא שגויה. בתוך `setSize`, השם `size` מתייחס ל**פרמטר** (הוא "מסתיר" את השדה), ולכן `size = size` משים את הפרמטר בעצמו. השדה נשאר בלי שינוי.',
            },
            {
              text: 'ערך זבל — השדה מעולם לא נכתב',
              correct: true,
              explain:
                'נכון. ההשמה `size = size` היא השמה עצמית של הפרמטר. השדה `size` של האובייקט נשאר לא מאותחל, ולכן `getSize` מחזיר זבל. התיקון: `this->size = size;` או לשנות את שם הפרמטר.',
            },
            {
              text: '0',
              correct: false,
              explain: 'שדות של אובייקט על המחסנית **אינם** מאותחלים לאפס ב-C++. הם מכילים זבל.',
            },
            {
              text: 'שגיאת קומפילציה',
              correct: false,
              explain:
                'זו בדיוק הבעיה — הקוד מתקמפל בלי שגיאה. לכל היותר אזהרה. זה סוג הבאג שהכי קשה למצוא.',
            },
          ],
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's17',
      title: 'מתודה שקוראת למתודה אחרת',
      subtitle: 'בתוך המחלקה — פשוט קוראים בשם',
      slides: [22],
      blocks: [
        {
          kind: 'prose',
          md: 'בתוך המחלקה, מותר למתודה אחת לזמן מתודה אחרת של **אותה מחלקה** — פשוט לפי שם, בלי נקודה ובלי חץ. הסיבה כבר ברורה: שתיהן מקבלות את אותו `this`.',
        },
        {
          kind: 'code',
          title: 'מתודה שנשענת על אחרות',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Rect
{
private:
    int length;
    int width;

public:
    void setLength(int myLength) { length = myLength; }
    void setWidth(int myWidth)   { width  = myWidth;  }

    int getArea()      { return length * width;      }
    int getPerimeter() { return 2 * (length + width); }

    // מתודה שקוראת לשלוש מתודות אחרות של אותה מחלקה
    void printReport()
    {
        cout << "===== Rect Report =====" << endl;
        cout << "Area:      " << getArea()      << endl;
        cout << "Perimeter: " << getPerimeter() << endl;
        cout << "Square?    " << (isSquare() ? "yes" : "no") << endl;
    }

    bool isSquare() { return length == width; }
};

int main()
{
    Rect a;
    a.setLength(5);
    a.setWidth(3);
    a.printReport();

    cout << endl;

    Rect b;
    b.setLength(4);
    b.setWidth(4);
    b.printReport();

    return 0;
}`,
          annotations: [
            { line: 21, text: 'קריאה למתודה אחרת — בלי נקודה, בלי this. פשוט השם' },
            { line: 23, text: 'isSquare מוגדרת אחרי printReport — וזה עובד!' },
          ],
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'סדר ההגדרה בתוך מחלקה לא משנה',
          md: 'שים לב ש-`printReport` קוראת ל-`isSquare` שמוגדרת **אחריה** בקוד — וזה עובד. בתוך הגדרת מחלקה, הקומפיילר קורא קודם את כל ההצהרות ורק אחר כך את הגופים. זה שונה מפונקציות גלובליות, שבהן חובה להצהיר לפני השימוש. ==בתוך המחלקה — סדר חופשי.==',
        },
        {
          kind: 'callout',
          variant: 'exam',
          title: 'למה זה חשוב מעבר לנוחות',
          md: 'זו הבסיס ל**אי-שכפול קוד**. אם `printReport` הייתה מחשבת `length * width` בעצמה, ומחר היינו משנים את נוסחת השטח — היינו צריכים לזכור לשנות בשני מקומות. כשהיא קוראת ל-`getArea()`, יש **מקור אמת יחיד**. זה אחד מיתרונות ה-OOP: "כל מה שתלוי בישות אחת מאוגד במקום אחד".',
        },
        {
          kind: 'exercise',
          id: 'ex-rect-report',
          title: 'הרחב את דוח המלבן',
          level: 1,
          brief:
            'קח את מחלקת `Rect` שלמעלה והוסף לה שתי מתודות חדשות שנשענות על הקיימות.',
          requirements: [
            'הוסף מתודה `double getDiagonal()` שמחזירה את אורך האלכסון. נוסחה: `sqrt(length*length + width*width)`. תצטרך `#include <cmath>`.',
            'הוסף מתודה `bool isBiggerThan(int area)` שמחזירה האם שטח המלבן גדול מהערך שהתקבל — ==חובה שתשתמש ב-`getArea()`== ולא תחשב מחדש.',
            'עדכן את `printReport` כך שתדפיס גם את האלכסון.',
          ],
          starter: `#include <iostream>
#include <cmath>
using namespace std;

class Rect
{
private:
    int length;
    int width;

public:
    void setLength(int myLength) { length = myLength; }
    void setWidth(int myWidth)   { width  = myWidth;  }

    int getArea()      { return length * width;       }
    int getPerimeter() { return 2 * (length + width); }
    bool isSquare()    { return length == width;      }

    // TODO 1: getDiagonal

    // TODO 2: isBiggerThan

    void printReport()
    {
        cout << "===== Rect Report =====" << endl;
        cout << "Area:      " << getArea()      << endl;
        cout << "Perimeter: " << getPerimeter() << endl;
        cout << "Square?    " << (isSquare() ? "yes" : "no") << endl;
        // TODO 3: הדפס גם את האלכסון
    }
};

int main()
{
    Rect r;
    r.setLength(3);
    r.setWidth(4);
    r.printReport();

    cout << "Bigger than 10? " << (r.isBiggerThan(10) ? "yes" : "no") << endl;
    cout << "Bigger than 20? " << (r.isBiggerThan(20) ? "yes" : "no") << endl;

    return 0;
}`,
          hints: [
            'טיפוס ההחזרה של `getDiagonal` הוא `double`, לא `int` — האלכסון של מלבן 3×4 הוא 5, אבל של 1×1 הוא 1.414…',
            '`sqrt` מקבלת `double`. אם תעביר לה `int` זה יעבוד (המרה אוטומטית), אבל שים לב ש-`length*length` מחושב כ-`int` — למלבנים ענקיים זה עלול לגלוש. לצורך התרגיל זה בסדר.',
            'ב-`isBiggerThan` הפיתוי הוא לכתוב `return length*width > area;`. אל תעשה את זה — הדרישה היא להשתמש ב-`getArea()`. זה מה שהופך את הקוד לתחזיק.',
          ],
          solution: `#include <iostream>
#include <cmath>
using namespace std;

class Rect
{
private:
    int length;
    int width;

public:
    void setLength(int myLength) { length = myLength; }
    void setWidth(int myWidth)   { width  = myWidth;  }

    int getArea()      { return length * width;       }
    int getPerimeter() { return 2 * (length + width); }
    bool isSquare()    { return length == width;      }

    double getDiagonal()
    {
        return sqrt(length * length + width * width);
    }

    bool isBiggerThan(int area)
    {
        return getArea() > area;      // נשען על המתודה הקיימת
    }

    void printReport()
    {
        cout << "===== Rect Report =====" << endl;
        cout << "Area:      " << getArea()      << endl;
        cout << "Perimeter: " << getPerimeter() << endl;
        cout << "Square?    " << (isSquare() ? "yes" : "no") << endl;
        cout << "Diagonal:  " << getDiagonal()  << endl;
    }
};

int main()
{
    Rect r;
    r.setLength(3);
    r.setWidth(4);
    r.printReport();

    cout << "Bigger than 10? " << (r.isBiggerThan(10) ? "yes" : "no") << endl;
    cout << "Bigger than 20? " << (r.isBiggerThan(20) ? "yes" : "no") << endl;

    return 0;
}`,
          expectedOutput: `===== Rect Report =====
Area:      12
Perimeter: 14
Square?    no
Diagonal:  5
Bigger than 10? yes
Bigger than 20? no`,
        },
      ],
    },
  ],
};

import type { Chapter } from '../../types/content';

export const ch1FromStruct: Chapter = {
  id: 'ch1',
  title: 'מטיפוס בסיסי אל המחלקה',
  sections: [
    /* ============================================================ */
    {
      id: 's05',
      title: 'לכל טיפוס יש תכונות ופעולות',
      subtitle: 'התובנה שממנה נולד כל הרעיון של מחלקה',
      slides: [6],
      blocks: [
        {
          kind: 'prose',
          md: 'תסתכל רגע על טיפוס שאתה מכיר מצוין: `int`. מה אתה יודע עליו?',
        },
        {
          kind: 'table',
          headers: ['השאלה', 'התשובה עבור `int`'],
          rows: [
            ['מה הוא **מכיל**?', 'ערך של מספר שלם'],
            ['כמה מקום הוא **תופס**?', '4 בתים (במרבית המערכות המודרניות)'],
            ['מה **מותר לעשות** איתו?', '`+`, `-`, `*`, `/`, `%`, `++`, השוואות, השמה…'],
            ['מה **אסור לעשות** איתו?', 'למשל להצמיד אליו מחרוזת עם `+` — הקומפיילר יסרב'],
          ],
        },
        {
          kind: 'prose',
          md: 'החלוקה הזו — **מה הטיפוס מכיל** מול **מה מותר לעשות איתו** — היא לב העניין. במונחים של הקורס:',
        },
        {
          kind: 'terms',
          items: [
            {
              he: 'תכונות',
              en: 'attributes',
              note: 'מה שהטיפוס **מכיל**. עבור `int` — ערך שלם. עבור מלבן — אורך ורוחב.',
            },
            {
              he: 'פעולות',
              en: 'methods',
              note: 'מה שאפשר **לעשות** עם הטיפוס. עבור `int` — חיבור, כפל. עבור מלבן — חישוב שטח.',
            },
          ],
        },
        {
          kind: 'prose',
          md: 'עכשיו השאלה המעניינת: כשאתה מגדיר טיפוס משלך — האם גם לו יש את שני החלקים האלה? התשובה ב-C היא **חצי**: אפשר להגדיר תכונות (`struct`), אבל אין דרך לחבר אליהן פעולות. ב-C++ אפשר את שניהם, וזה נקרא `class`.',
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
          title: 'הקבלה: טיפוס בנוי מול טיפוס שלנו',
          lang: 'cpp',
          code: `int x;                  // טיפוס מובנה
x = 5;                  // תכונה: הערך
int y = x * 2;          // פעולה: כפל — מוגדרת בשפה עצמה

Rect r;                 // טיפוס שלנו
r.setLength(5);         // תכונה: האורך
r.printArea();          // פעולה: חישוב שטח — מוגדרת על ידינו`,
        },
        {
          kind: 'callout',
          variant: 'crefresh',
          title: 'רענון מ-C — גודל של טיפוס',
          md: 'האופרטור `sizeof` מחזיר את מספר הבתים שהטיפוס תופס. הוא נקבע **בזמן קומפילציה**, לא בזמן ריצה, ולכן אין לו עלות. נשתמש בו הרבה בשיעור הזה כדי לראות כמה מקום מחלקה תופסת בפועל.',
        },
        {
          kind: 'code',
          title: 'כמה מקום תופסים הטיפוסים הבסיסיים אצלך',
          runnable: true,
          code: `#include <iostream>
using namespace std;

int main()
{
    cout << "char   = " << sizeof(char)   << " bytes" << endl;
    cout << "int    = " << sizeof(int)    << " bytes" << endl;
    cout << "long   = " << sizeof(long)   << " bytes" << endl;
    cout << "float  = " << sizeof(float)  << " bytes" << endl;
    cout << "double = " << sizeof(double) << " bytes" << endl;
    cout << "bool   = " << sizeof(bool)   << " bytes" << endl;
    return 0;
}`,
          caption: 'לחץ "הרץ" — הפלט מגיע מ-g++ אמיתי שרץ על מכונת לינוקס 64 ביט.',
        },
        {
          kind: 'callout',
          variant: 'warn',
          md: 'הגדלים **אינם מובטחים בתקן**. התקן מבטיח רק יחסים (`sizeof(char)==1`, ו-`char ≤ short ≤ int ≤ long`). על Windows 64-bit עם MSVC, למשל, `long` הוא 4 בתים ולא 8. לכן קוד שמניח גודל קבוע הוא קוד לא נייד.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's06',
      title: 'תזכורת: מבנה — struct',
      subtitle: 'הצעד הראשון לעבר טיפוס משלנו, ומה שחסר בו',
      slides: [7],
      blocks: [
        {
          kind: 'prose',
          md: 'ב-C, כשרצינו טיפוס משלנו — מעבר לטיפוסים הבסיסיים — הגדרנו **מבנה**. המבנה מאגד כמה שדות מטיפוסים שונים תחת שם אחד.',
        },
        {
          kind: 'code',
          runnable: true,
          title: 'הגדרת מבנה',
          code: `struct Student
{
    int   taz;
    float avg;
    int   year;
};`,
          annotations: [
            { line: 1, text: 'המילה השמורה struct ואחריה שם הטיפוס החדש' },
            { line: 3, text: 'שדה — תכונה. כאן: תעודת זהות' },
            { line: 6, text: 'שים לב לנקודה-פסיק אחרי הסוגר המסולסל. חובה!' },
          ],
        },
        {
          kind: 'callout',
          variant: 'danger',
          title: 'הנקודה-פסיק אחרי `}` — השגיאה שכולם עושים',
          md: 'בהגדרת `struct` ו-`class` **חייבת** להופיע `;` אחרי הסוגר המסולסל. אם תשכח, הודעת השגיאה שתקבל תהיה מבלבלת ותצביע לרוב על **השורה הבאה**, לא על השורה השגויה. אם קיבלת שגיאה מוזרה בשורה שנראית תקינה לגמרי — בדוק את ה-`;` של המחלקה שמעליה.',
        },
        {
          kind: 'prose',
          md: 'אחרי ההגדרה, אפשר להגדיר משתנה מטיפוס המבנה ולשים ערכים בשדותיו. שים לב להבחנה שתלווה אותנו לאורך כל הקורס:',
        },
        {
          kind: 'compare',
          title: 'הגדרה מול יצירה',
          left: {
            title: 'הגדרת הטיפוס — מתכון',
            code: `struct Student
{
    int   taz;
    float avg;
    int   year;
};`,
            note: 'לא תופס זיכרון. זו הוראה לקומפיילר: "טיפוס בשם Student נראה כך". אפשר לכתוב אותה פעם אחת בפרויקט ולהשתמש בה אלף פעם.',
            verdict: 'neutral',
          },
          right: {
            title: 'יצירת מופע — עוגה',
            code: `Student s1;
s1.taz = 324;
s1.avg = 88.5f;
s1.year = 2;`,
            note: 'כאן **כן** מוקצה זיכרון — 12 בתים בערך, על ה-Stack. אפשר ליצור כמה מופעים שרוצים, כל אחד עם ערכים משלו.',
            verdict: 'neutral',
          },
        },
        {
          kind: 'code',
          title: 'שתי דרכים ליצור מופע — סטטי ודינמי',
          lang: 'cpp',
          files: [
            {
              name: 'static.cpp',
              code: `// על ה-Stack — משוחרר אוטומטית בסוף הבלוק
Student s1;
s1.taz = 324;
s1.avg = 88.5f;
// ... שימוש
// אין צורך לשחרר כלום`,
            },
            {
              name: 'dynamic.cpp',
              code: `// על ה-Heap — באחריותנו לשחרר
Student* s2;
s2 = new Student;
s2->taz = 44;
s2->avg = 91.0f;
// ... שימוש
delete s2;      // חובה!
s2 = nullptr;   // הרגל טוב`,
            },
          ],
        },
        {
          kind: 'callout',
          variant: 'crefresh',
          title: 'רענון מ-C — `new`/`delete` מול `malloc`/`free`',
          md: 'ב-C הקצית עם `malloc(sizeof(Student))` ושחררת עם `free`. ב-C++ המקבילות הן `new Student` ו-`delete`. שני הבדלים חשובים: (1) `new` **לא צריך cast** ולא צריך `sizeof` — הוא יודע את הטיפוס; (2) `new` **קורא לבנאי** של האובייקט ו-`delete` **קורא להורס** — בדיוק מה שנלמד בשיעורים 2 ו-3. `malloc` לא עושה את זה, ולכן ==לעולם אל תערבב== `malloc` עם מחלקות C++.',
        },
        {
          kind: 'quiz',
          question: 'מה מודפס? (שים לב לאופרטור בכל שורה)',
          code: `Student a;
Student* b = new Student;

a.taz = 10;
b->taz = 20;

cout << a.taz << " " << b->taz;`,
          options: [
            { text: '`10 20`', correct: true, explain: 'נכון. `a` הוא אובייקט, ולכן ניגשים לשדותיו עם נקודה. `b` הוא **מצביע** לאובייקט, ולכן ניגשים עם חץ `->`.' },
            { text: '`20 10`', correct: false, explain: 'הסדר בפלט הוא הסדר שבו כתבנו — קודם `a.taz` ואז `b->taz`.' },
            { text: 'שגיאת קומפילציה — צריך `b.taz`', correct: false, explain: 'להפך: `b` הוא מצביע, ו-`b.taz` היה נכשל. עבור מצביע חייבים `b->taz` (או `(*b).taz`).' },
            { text: 'שגיאה — לא הוקצה זיכרון ל-`a`', correct: false, explain: 'ל-`a` כן הוקצה זיכרון — אוטומטית, על ה-Stack, ברגע ההגדרה. הקצאה ידנית נדרשת רק ב-Heap.' },
          ],
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's07',
      title: 'איך זה נראה בזיכרון',
      subtitle: 'Stack מול Heap — עקוב צעד-צעד',
      slides: [7],
      blocks: [
        {
          kind: 'prose',
          md: 'זו הדיאגרמה הראשונה מבין רבות. קדם אותה צעד-צעד ותראה בדיוק מה קורה בזיכרון כשמגדירים מבנה על ה-Stack ומקצים אחד על ה-Heap. **נסה לנחש מה ישתנה לפני כל לחיצה.**',
        },
        {
          kind: 'memory',
          title: 'מבנה על המחסנית ומבנה על הערימה',
          intro:
            'שני אזורי זיכרון, שני כללי משחק. ה-**Stack** מנוהל אוטומטית — נכנס בהגדרה, יוצא בסוף הבלוק. ה-**Heap** מנוהל על ידך — נכנס ב-`new`, יוצא רק ב-`delete`.',
          code: `int main()
{
    Student s1;
    s1.taz = 324;

    Student* s2 = new Student;
    s2->taz = 44;

    delete s2;
    s2 = nullptr;

    return 0;
}`,
          steps: [
            {
              line: 1,
              caption: 'נכנסנו ל-`main`. נפתחה **מסגרת** (frame) חדשה על המחסנית, ריקה בינתיים.',
              detail: 'כל קריאה לפונקציה פותחת מסגרת. המסגרת מכילה את המשתנים המקומיים והפרמטרים של אותה קריאה.',
              stack: [{ label: 'main()', active: true, vars: [] }],
              heap: [],
            },
            {
              line: 3,
              caption: '`Student s1;` — הוקצה מקום ל-3 שדות. הערכים הם **זבל** — מה שהיה שם קודם.',
              detail:
                'זו נקודה קריטית: ב-C++ מבנה לא מאותחל לאפס. הערכים שתראה הם שאריות של מה שהתוכנית עשתה קודם בכתובות האלה. בדיוק בשביל זה קיימים **בנאים** — הנושא של שיעור 2.',
              stack: [
                {
                  label: 'main()',
                  active: true,
                  vars: [
                    { name: 's1.taz', type: 'int', value: '?', state: 'garbage' },
                    { name: 's1.avg', type: 'float', value: '?', state: 'garbage' },
                    { name: 's1.year', type: 'int', value: '?', state: 'garbage' },
                  ],
                },
              ],
              heap: [],
            },
            {
              line: 4,
              caption: '`s1.taz = 324;` — כתבנו לשדה הראשון. שני האחרים עדיין זבל.',
              stack: [
                {
                  label: 'main()',
                  active: true,
                  vars: [
                    { name: 's1.taz', type: 'int', value: '324', state: 'changed' },
                    { name: 's1.avg', type: 'float', value: '?', state: 'garbage' },
                    { name: 's1.year', type: 'int', value: '?', state: 'garbage' },
                  ],
                },
              ],
              heap: [],
            },
            {
              line: 6,
              caption:
                '`new Student` הקצה בלוק חדש ב-**Heap** והחזיר את כתובתו. הכתובת נשמרה במצביע `s2`, שיושב על ה-Stack.',
              detail:
                'שים לב שיש כאן **שני** דברים: המצביע `s2` (8 בתים על המחסנית) והאובייקט עצמו (12 בתים בערימה). זו הבחנה שמבלבלת המון סטודנטים — המצביע והאובייקט הם לא אותו דבר.',
              stack: [
                {
                  label: 'main()',
                  active: true,
                  vars: [
                    { name: 's1.taz', type: 'int', value: '324' },
                    { name: 's1.avg', type: 'float', value: '?', state: 'garbage' },
                    { name: 's1.year', type: 'int', value: '?', state: 'garbage' },
                    { name: 's2', type: 'Student*', value: '0x5f2a10', state: 'new' },
                  ],
                },
              ],
              heap: [
                {
                  id: 'h1',
                  label: 'Student',
                  addr: '0x5f2a10',
                  state: 'new',
                  fields: [
                    { name: 'taz', type: 'int', value: '?', state: 'garbage' },
                    { name: 'avg', type: 'float', value: '?', state: 'garbage' },
                    { name: 'year', type: 'int', value: '?', state: 'garbage' },
                  ],
                },
              ],
            },
            {
              line: 7,
              caption:
                '`s2->taz = 44;` — הלכנו לפי הכתובת שב-`s2`, הגענו לערימה, וכתבנו לשדה שם.',
              detail: '`s2->taz` הוא בדיוק קיצור ל-`(*s2).taz`: קודם מפענחים את המצביע, ואז ניגשים לשדה.',
              stack: [
                {
                  label: 'main()',
                  active: true,
                  vars: [
                    { name: 's1.taz', type: 'int', value: '324' },
                    { name: 's1.avg', type: 'float', value: '?', state: 'garbage' },
                    { name: 's1.year', type: 'int', value: '?', state: 'garbage' },
                    { name: 's2', type: 'Student*', value: '0x5f2a10', state: 'reading' },
                  ],
                },
              ],
              heap: [
                {
                  id: 'h1',
                  label: 'Student',
                  addr: '0x5f2a10',
                  fields: [
                    { name: 'taz', type: 'int', value: '44', state: 'changed' },
                    { name: 'avg', type: 'float', value: '?', state: 'garbage' },
                    { name: 'year', type: 'int', value: '?', state: 'garbage' },
                  ],
                },
              ],
            },
            {
              line: 9,
              caption:
                '`delete s2;` — הזיכרון בערימה שוחרר וחזר למערכת. אבל שים לב: `s2` **עדיין מחזיק את הכתובת הישנה**.',
              detail:
                'מצביע שמצביע לזיכרון משוחרר נקרא **dangling pointer**. גישה דרכו היא התנהגות בלתי מוגדרת — לפעמים תקבל זבל, לפעמים קריסה, ולפעמים זה "יעבוד" ויתפוצץ שבוע אחר כך.',
              stack: [
                {
                  label: 'main()',
                  active: true,
                  vars: [
                    { name: 's1.taz', type: 'int', value: '324' },
                    { name: 's1.avg', type: 'float', value: '?', state: 'garbage' },
                    { name: 's1.year', type: 'int', value: '?', state: 'garbage' },
                    { name: 's2', type: 'Student*', value: '0x5f2a10', state: 'garbage' },
                  ],
                },
              ],
              heap: [
                {
                  id: 'h1',
                  label: 'Student',
                  addr: '0x5f2a10',
                  state: 'freed',
                  fields: [
                    { name: 'taz', type: 'int', value: '✕' },
                    { name: 'avg', type: 'float', value: '✕' },
                    { name: 'year', type: 'int', value: '✕' },
                  ],
                },
              ],
            },
            {
              line: 10,
              caption: '`s2 = nullptr;` — אפסנו את המצביע. עכשיו אם מישהו יגש דרכו, התוכנית תקרוס מיד ובבירור.',
              detail:
                'זה נשמע כמו הרעה, אבל זו **שיפור**: קריסה מיידית וברורה עדיפה בהרבה על באג שקט שמופיע רק אצל הלקוח. איפוס אחרי `delete` הוא הרגל שכדאי לאמץ.',
              stack: [
                {
                  label: 'main()',
                  active: true,
                  vars: [
                    { name: 's1.taz', type: 'int', value: '324' },
                    { name: 's1.avg', type: 'float', value: '?', state: 'garbage' },
                    { name: 's1.year', type: 'int', value: '?', state: 'garbage' },
                    { name: 's2', type: 'Student*', value: 'nullptr', state: 'changed' },
                  ],
                },
              ],
              heap: [],
            },
            {
              line: 12,
              caption:
                '`return 0;` — המסגרת של `main` נסגרת. `s1` ו-`s2` נעלמים **אוטומטית**. אין מה לשחרר.',
              detail:
                'זה ההבדל הגדול: משתני Stack משתחררים לבד. משתני Heap — רק אם אתה זוכר. אילו שכחנו את `delete`, 12 הבתים בערימה היו הולכים לאיבוד עד סוף התוכנית. זו **דליפת זיכרון**.',
              stack: [],
              heap: [],
            },
          ],
        },
        {
          kind: 'quiz',
          question: 'בקוד שראית, כמה **בתים** תפסה התוכנית בערימה (Heap) בשיאה?',
          options: [
            { text: '0 — הכל היה על המחסנית', correct: false, explain: '`new Student` מקצה תמיד בערימה. `s1` היה על המחסנית, אבל האובייקט של `s2` לא.' },
            { text: 'בערך 12 — גודל של Student אחד', correct: true, explain: 'נכון. `int + float + int` = 4+4+4 = 12 בתים. הוקצה בלוק אחד בלבד. המצביע `s2` עצמו (8 בתים) יושב על המחסנית, לא בערימה.' },
            { text: 'בערך 20 — Student ועוד המצביע', correct: false, explain: 'המצביע `s2` הוא משתנה מקומי של `main` ולכן יושב על ה-**Stack**. בערימה יש רק את האובייקט.' },
            { text: 'בערך 24 — שני Student', correct: false, explain: 'רק אובייקט אחד הוקצה עם `new`. `s1` הוגדר על המחסנית ולא נגע בערימה בכלל.' },
          ],
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's08',
      title: 'השמה על מבנה — העתקה רדודה',
      subtitle: 'הפעולה היחידה שקיבלנו בחינם, והמלכודת שמסתתרת בה',
      slides: [7],
      blocks: [
        {
          kind: 'prose',
          md: 'שאלנו קודם "איפה הפעולות של המבנה?" — התשובה היא שיש **אחת**, והיא ניתנה בחינם: **ההשמה**. אפשר לכתוב `a = b` בין שני מבנים מאותו טיפוס, בלי להגדיר כלום.',
        },
        {
          kind: 'code',
          title: 'השמה עובדת מעצמה',
          runnable: true,
          code: `#include <iostream>
using namespace std;

struct Student
{
    int   taz;
    float avg;
    int   year;
};

int main()
{
    Student s1;
    s1.taz  = 324;
    s1.avg  = 88.5f;
    s1.year = 2;

    Student s3;
    s3 = s1;              // השמה — עובדת בלי שהגדרנו כלום

    cout << "s3.taz = " << s3.taz << ", avg = " << s3.avg << endl;

    s3.taz = 999;         // משנים את העותק
    cout << "s1.taz = " << s1.taz << " (לא השתנה)" << endl;

    return 0;
}`,
        },
        {
          kind: 'prose',
          md: 'ההשמה מבצעת **העתקה רדודה** (shallow copy): היא מעתיקה בית-בית את תוכן השדות מהמבנה הימני לשמאלי. עבור המבנה שלמעלה — שכולו טיפוסים בסיסיים — זה בדיוק מה שרצינו.',
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'המלכודת מתחילה כשיש מצביע בפנים',
          md: 'העתקה רדודה מעתיקה גם **מצביעים** — כלומר את הכתובת, לא את מה שהיא מצביעה עליו. התוצאה: שני אובייקטים שמצביעים לאותו בלוק זיכרון. כשאחד מהם ישחרר אותו — השני יישאר עם מצביע פגום. זו בעיה אמיתית ומרכזית, ולה מוקדש **שיעור 3** במלואו (בנאי העתקה והעתקה עמוקה). כרגע מספיק שתדע שהיא קיימת.',
        },
        {
          kind: 'compare',
          title: 'העתקה רדודה מול עמוקה — הצצה קדימה',
          left: {
            title: 'רדודה (מה שקורה כברירת מחדל)',
            code: `struct Box { char* name; };

Box a;
a.name = new char[10];
strcpy(a.name, "hello");

Box b = a;   // מעתיק את הכתובת!

// a.name ו-b.name = אותה כתובת
delete[] a.name;
cout << b.name;  // ✕ קריאה מזיכרון משוחרר`,
            note: 'שני האובייקטים חולקים את אותו מערך. שחרור אחד הורס את השני.',
            verdict: 'bad',
          },
          right: {
            title: 'עמוקה (מה שנצטרך לכתוב בעצמנו)',
            code: `Box b;
b.name = new char[10];       // בלוק חדש
strcpy(b.name, a.name);      // מעתיקים את התוכן

// עכשיו לכל אחד מערך משלו
delete[] a.name;
cout << b.name;  // ✓ "hello"`,
            note: 'כל אובייקט מקבל עותק משלו. שיעור 3 יראה איך לגרום לזה לקרות אוטומטית.',
            verdict: 'good',
          },
        },
        {
          kind: 'quiz',
          question: 'מדוע ההשמה `s3 = s1` עובדת בלי שהגדרנו שום פונקציה?',
          options: [
            {
              text: 'הקומפיילר מייצר אופרטור השמה כברירת מחדל שמעתיק שדה-שדה',
              correct: true,
              explain:
                'בדיוק. הקומפיילר מספק אופרטור השמה מרומז שמעתיק כל שדה בנפרד (memberwise copy). בשיעור 4 נלמד לכתוב אופרטור השמה משלנו, ובשיעור 3 נראה מתי חייבים.',
            },
            {
              text: 'כי `struct` הוא טיפוס בסיסי',
              correct: false,
              explain: '`struct` הוא טיפוס מוגדר-משתמש, לא בסיסי. ההשמה עובדת בזכות הקומפיילר, לא בזכות סיווג הטיפוס.',
            },
            {
              text: 'כי כל השדות הם `int` ו-`float`',
              correct: false,
              explain:
                'ההשמה תעבוד גם אם יש מצביעים בפנים — הבעיה היא שהיא תעבוד **לא נכון**. היא תמיד "עובדת" מבחינת קומפילציה.',
            },
            {
              text: 'לא — זו שגיאת קומפילציה',
              correct: false,
              explain: 'הרץ את הקוד למעלה ותראה שהוא מתקמפל ורץ בלי בעיה.',
            },
          ],
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's09',
      title: 'הבעיה: איפה הפעולות?',
      subtitle: 'המבנה נותן חצי תשובה. הנה החצי החסר.',
      slides: [7, 8],
      blocks: [
        {
          kind: 'prose',
          md: 'המבנה נתן לנו **תכונות**. יפה. אבל אם הטיפוס `int` מגיע עם חבילת פעולות שלמה — למה `Student` שלנו לא?',
        },
        {
          kind: 'prose',
          md: 'בואו נראה מה קורה כשמנסים לפתור את זה בגישת C. נניח שאנחנו רוצים לחשב את שטח המלבן.',
        },
        {
          kind: 'code',
          title: 'הפתרון של C — פונקציה גלובלית',
          runnable: true,
          code: `#include <iostream>
using namespace std;

struct Rect
{
    int length;
    int width;
};

// הפונקציה נמצאת מחוץ למבנה. אין ביניהם קשר מחייב.
void printArea(Rect r)
{
    cout << "Area = " << r.length * r.width << endl;
}

int main()
{
    Rect r1;
    r1.length = 17;
    r1.width  = 19;
    printArea(r1);        // הפונקציה והנתונים — שני דברים נפרדים
    return 0;
}`,
        },
        {
          kind: 'prose',
          md: 'זה עובד, אבל תשים לב לארבע חולשות:',
        },
        {
          kind: 'list',
          ordered: true,
          items: [
            '**הקריאה קוראת הפוך.** `printArea(r1)` — פעולה שמקבלת נתון. אנחנו רוצים לחשוב "המלבן, תדפיס את השטח שלך": `r1.printArea()`.',
            '**השם תפוס גלובלית.** אם מחר תגדיר גם `Circle`, לא תוכל לקרוא גם לפונקציה שלו `printArea` — התנגשות שמות. תיאלץ ל-`printRectArea` ו-`printCircleArea`.',
            '**אין הגנה.** `r1.length = -5;` מותר לגמרי. מלבן עם אורך שלילי.',
            '**אין קשר מחייב.** אם תוסיף שדה `height` ותהפוך את זה לתיבה, שום דבר לא יזכיר לך שיש פונקציה `printArea` שצריכה עדכון.',
          ],
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'הפתרון של C++',
          md: 'להכניס את הפעולה **פנימה**, אל תוך הגדרת הטיפוס. אז היא לא פונקציה גלובלית שקורית לקבל מלבן — היא **חלק מהמלבן**. הטיפוס שמאפשר את זה נקרא `class`.',
        },
        {
          kind: 'compare',
          title: 'אותו רעיון, שתי גישות',
          left: {
            title: 'C — נפרד',
            code: `struct Rect
{
    int length;
    int width;
};

void printArea(Rect r)
{
    cout << r.length * r.width;
}

// שימוש:
printArea(r1);`,
            note: 'הפונקציה גלובלית. אפשר לקרוא לה על כל מלבן, ואי אפשר למנוע ממישהו לשנות שדות ישירות.',
            verdict: 'bad',
          },
          right: {
            title: 'C++ — מאוגד',
            code: `class Rect
{
public:
    int length;
    int width;

    void printArea()
    {
        cout << length * width;
    }
};

// שימוש:
r1.printArea();`,
            note: 'הפעולה בתוך הטיפוס. שים לב שבתוך `printArea` כותבים `length` בלי שום קידומת — המתודה כבר יודעת על איזה אובייקט היא עובדת.',
            verdict: 'good',
          },
        },
        {
          kind: 'quiz',
          question:
            'בגרסת ה-C++ מימין, `printArea` כותבת `length * width` בלי לקבל שום פרמטר. איך היא יודעת של איזה מלבן מדובר?',
          options: [
            {
              text: 'המתודה מקבלת בסתר מצביע לאובייקט שעליו נקראה',
              correct: true,
              explain:
                'נכון. הקומפיילר מוסיף פרמטר נסתר בשם `this` — מצביע לאובייקט. `r1.printArea()` מתורגם בפועל למשהו כמו `printArea(&r1)`, ובתוך המתודה `length` הוא בעצם `this->length`. נרחיב על זה בהמשך השיעור.',
            },
            {
              text: 'יש עותק אחד של `printArea` לכל אובייקט',
              correct: false,
              explain:
                'טעות נפוצה. הקוד של המתודה קיים **פעם אחת** בזיכרון התוכנית, ומשותף לכל האובייקטים. רק השדות מוכפלים לכל אובייקט.',
            },
            {
              text: 'המחלקה שומרת משתנה גלובלי של "האובייקט הנוכחי"',
              correct: false,
              explain: 'אין דבר כזה. זה גם היה נשבר מיד ברגע שיש כמה אובייקטים או כמה חוטים.',
            },
            {
              text: 'זו שגיאה — צריך לכתוב `r1.length`',
              correct: false,
              explain:
                'בתוך מתודה של המחלקה, אסור לכתוב `r1.length` (`r1` לא מוכר שם) — כותבים פשוט `length`.',
            },
          ],
        },
      ],
    },
  ],
};

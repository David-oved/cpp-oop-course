import type { Chapter } from '../../types/content';

export const ch7Build: Chapter = {
  id: 'ch7',
  title: 'תהליך הבנייה',
  sections: [
    /* ============================================================ */
    {
      id: 's40',
      title: 'מה קורה כשלוחצים Build',
      subtitle: 'מצד המתכנת — ארבעה שלבים',
      slides: [25],
      blocks: [
        {
          kind: 'steps',
          title: 'תהליך הבנייה מצד המתכנת',
          items: [
            {
              title: 'תכנון',
              md: 'האלגוריתם, המחלקות, מי מכיל את מי. ==השלב שהכי קל לדלג עליו והכי יקר לדלג עליו.== חמש דקות של תכנון חוסכות שעה של תיקונים.',
            },
            {
              title: 'כתיבת קוד',
              md: 'בעורך טקסט פשוט (כגון `notepad`) או בסביבת פיתוח מסודרת (כגון `Visual Studio`). סביבת פיתוח נותנת השלמה אוטומטית, סימון שגיאות בזמן אמת, ודיבאגר.',
            },
            {
              title: 'שמירת הקובץ',
              md: 'נשמע טריוויאלי — אבל אחד התסכולים הנפוצים אצל מתחילים הוא "תיקנתי ועדיין אותה שגיאה", כשבפועל הקובץ לא נשמר.',
            },
            {
              title: 'בנייה — Build',
              md: 'המחשב הופך את קבצי המקור לתוכנה עצמאית. זה השלב שאנחנו מפרקים בעמודים הבאים.',
            },
            {
              title: 'הרצה — Run',
              md: 'הפעלת קובץ ההרצה שנוצר. אם לא בנית מחדש אחרי שינוי — אתה מריץ את הגרסה הישנה.',
            },
          ],
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'למה בכלל צריך "בנייה"',
          md: 'המעבד לא מבין `cout << "hello"`. הוא מבין רק **קוד מכונה** — רצף בייטים שמייצג פקודות. תהליך הבנייה הוא התרגום מהשפה שאנחנו כותבים לשפה שהמעבד מריץ. שפות כמו Python לא עוברות את השלב הזה מראש — הן מתפרשות בזמן ריצה, וזו אחת הסיבות שהן איטיות יותר.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's41',
      title: 'הצינור: קדם-מעבד, מהדר, מקשר',
      subtitle: 'שלושה כלים, שלושה תפקידים — ובמבחן שואלים עליהם',
      slides: [26],
      blocks: [
        {
          kind: 'prose',
          md: 'הפיכת קבצי מקור לתוכנה עצמאית — **להדר ולקשר** את הקבצים השונים, בסדר הנכון. שני שלבים ראשיים:',
        },
        {
          kind: 'list',
          items: [
            '**הידור** (קומפילציה) — על ידי ה-`compiler`. מתרגם קוד מקור לקוד מכונה.',
            '**קישור** (לינקג\') — על ידי ה-`linker`. מחבר את כל חלקי קוד המכונה לקובץ הרצה אחד.',
          ],
        },
        {
          kind: 'diagram',
          title: 'המסלול המלא של קובץ אחד',
          svg: `<svg viewBox="0 0 700 200" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif">
  <defs>
    <marker id="a2" markerWidth="10" markerHeight="10" refX="9" refY="3.2" orient="auto">
      <path d="M0,0 L0,6.4 L9,3.2 z" fill="currentColor"/>
    </marker>
  </defs>
  <g>
    <rect x="12" y="60" width="118" height="58" rx="9" fill="#d97706" opacity=".13" stroke="#d97706" stroke-width="1.6"/>
    <text x="71" y="83" text-anchor="middle" font-size="12.5" font-weight="700" font-family="monospace" fill="#d97706">main.cpp</text>
    <text x="71" y="101" text-anchor="middle" font-size="10.5" fill="currentColor" opacity=".72">קוד מקור</text>
  </g>
  <path d="M132 89 L172 89" stroke="currentColor" fill="none" stroke-width="1.8" marker-end="url(#a2)" opacity=".6"/>
  <text x="152" y="78" text-anchor="middle" font-size="9.5" fill="currentColor" opacity=".65">.h</text>
  <g>
    <rect x="176" y="52" width="120" height="74" rx="9" fill="#7c3aed" opacity=".13" stroke="#7c3aed" stroke-width="1.6"/>
    <text x="236" y="79" text-anchor="middle" font-size="11.5" font-weight="700" fill="#7c3aed">PREPROCESSOR</text>
    <text x="236" y="96" text-anchor="middle" font-size="10" fill="currentColor" opacity=".72">קדם המעבד</text>
    <text x="236" y="112" text-anchor="middle" font-size="9.5" fill="currentColor" opacity=".6" font-family="monospace">temp.cpp</text>
  </g>
  <path d="M298 89 L338 89" stroke="currentColor" fill="none" stroke-width="1.8" marker-end="url(#a2)" opacity=".6"/>
  <g>
    <rect x="342" y="52" width="120" height="74" rx="9" fill="#0f6fb5" opacity=".13" stroke="#0f6fb5" stroke-width="1.6"/>
    <text x="402" y="79" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f6fb5">COMPILER</text>
    <text x="402" y="96" text-anchor="middle" font-size="10" fill="currentColor" opacity=".72">מהדר</text>
    <text x="402" y="112" text-anchor="middle" font-size="9.5" fill="currentColor" opacity=".6" font-family="monospace">main.obj</text>
  </g>
  <path d="M464 89 L504 89" stroke="currentColor" fill="none" stroke-width="1.8" marker-end="url(#a2)" opacity=".6"/>
  <g>
    <rect x="508" y="52" width="120" height="74" rx="9" fill="#0f8a5f" opacity=".13" stroke="#0f8a5f" stroke-width="1.6"/>
    <text x="568" y="79" text-anchor="middle" font-size="11.5" font-weight="700" fill="#0f8a5f">LINKER</text>
    <text x="568" y="96" text-anchor="middle" font-size="10" fill="currentColor" opacity=".72">מקשר</text>
    <text x="568" y="112" text-anchor="middle" font-size="9.5" fill="currentColor" opacity=".6" font-family="monospace">project.exe</text>
  </g>
  <g opacity=".65">
    <rect x="486" y="150" width="164" height="36" rx="7" fill="none" stroke="currentColor" stroke-width="1.3" stroke-dasharray="4 3"/>
    <text x="568" y="167" text-anchor="middle" font-size="10" fill="currentColor">קוד ספרייה</text>
    <text x="568" y="180" text-anchor="middle" font-size="9" fill="currentColor" font-family="monospace" opacity=".8">math.lib · string.lib</text>
    <path d="M568 148 L568 128" stroke="currentColor" fill="none" stroke-width="1.4" marker-end="url(#a2)"/>
  </g>
</svg>`,
        },
        {
          kind: 'table',
          title: 'שלושת הכלים',
          headers: ['הכלי', 'מה מקבל', 'מה עושה', 'מה מוציא'],
          rows: [
            [
              '**קדם-מעבד**',
              '`.cpp` + `.h`',
              'עיבוד טקסטואלי בלבד: מחליף `#include` בתוכן הקובץ, מחליף `#define`, מוחק הערות',
              'קובץ `.cpp` זמני מורחב',
            ],
            [
              '**מהדר**',
              'הקובץ הזמני',
              'בודק תחביר וטיפוסים, מתרגם לקוד מכונה',
              '`main.obj` — קוד מכונה',
            ],
            [
              '**מקשר**',
              'כל קבצי ה-`.obj` + ספריות',
              'מחבר קריאות לפונקציות עם המימושים שלהן, מוסיף קוד אתחול',
              '`project.exe` — קובץ הרצה',
            ],
          ],
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'Bootstrapping — למה `main` היא המיוחדת',
          md: 'המצגת מזכירה **Bootstrapping** — קוד אתחול שהמקשר מוסיף לכל תוכנית. הוא רץ **לפני** `main`, מכין את הסביבה (משתני סביבה, ארגומנטים משורת פקודה, אתחול משתנים גלובליים), ואז קורא ל-`main`. זו הסיבה שדווקא `main` היא נקודת הכניסה: ==המקשר מחפש בשם הזה במפורש==. אם אין `main` בשום קובץ, תקבל שגיאת לינקר.',
        },
        {
          kind: 'callout',
          variant: 'crefresh',
          title: 'רענון מ-C — קוד ספרייה',
          md: 'הפונקציות שאתה משתמש בהן (`printf`, `sqrt`, וגם `cout`) לא נכתבות מחדש בכל תוכנית. הן מהודרות מראש ויושבות בקבצי ספרייה — `math.lib`, `string.lib` על Windows, או `libm.a`, `libstdc++` על לינוקס. ==המקשר מוסיף רק את החלקים שאתה באמת משתמש בהם.==',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's42',
      title: 'פרויקט מרובה קבצים',
      subtitle: 'איך זה מסתדר כשיש חמישה קבצים ולא אחד',
      slides: [27],
      blocks: [
        {
          kind: 'prose',
          md: 'המצגת מציגה את התמונה עבור פרויקט אמיתי: **כמויות קוד אדירות** — מיליוני שורות — הנכתבות על ידי מספר אנשים, במספר קבצים.',
        },
        {
          kind: 'diagram',
          title: 'חמישה קבצים, חמש קומפילציות, קישור אחד',
          svg: `<svg viewBox="0 0 700 300" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif">
  <defs>
    <marker id="a3" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="currentColor"/>
    </marker>
  </defs>
  <text x="80" y="18" text-anchor="middle" font-size="10.5" font-weight="700" fill="currentColor" opacity=".65">קוד מקור</text>
  <text x="300" y="18" text-anchor="middle" font-size="10.5" font-weight="700" fill="currentColor" opacity=".65">COMPILER ×5</text>
  <text x="500" y="18" text-anchor="middle" font-size="10.5" font-weight="700" fill="currentColor" opacity=".65">קוד מכונה</text>
  <g font-family="monospace" font-size="11">
    <g><rect x="14" y="32" width="132" height="34" rx="7" fill="#d97706" opacity=".13" stroke="#d97706" stroke-width="1.4"/><text x="80" y="54" text-anchor="middle" fill="#d97706" font-weight="600">main.cpp</text></g>
    <g><rect x="14" y="76" width="132" height="34" rx="7" fill="#d97706" opacity=".1" stroke="#d97706" stroke-width="1.4"/><text x="80" y="98" text-anchor="middle" fill="#d97706" font-weight="600">file1.cpp</text></g>
    <g><rect x="14" y="120" width="132" height="34" rx="7" fill="#d97706" opacity=".1" stroke="#d97706" stroke-width="1.4"/><text x="80" y="142" text-anchor="middle" fill="#d97706" font-weight="600">file2.cpp</text></g>
    <g><rect x="14" y="164" width="132" height="34" rx="7" fill="#d97706" opacity=".1" stroke="#d97706" stroke-width="1.4"/><text x="80" y="186" text-anchor="middle" fill="#d97706" font-weight="600">file3.cpp</text></g>
    <g><rect x="14" y="208" width="132" height="34" rx="7" fill="#d97706" opacity=".1" stroke="#d97706" stroke-width="1.4"/><text x="80" y="230" text-anchor="middle" fill="#d97706" font-weight="600">file4.cpp</text></g>
  </g>
  <g stroke="currentColor" fill="none" stroke-width="1.5" opacity=".45" marker-end="url(#a3)">
    <path d="M148 49 L246 49"/><path d="M148 93 L246 93"/><path d="M148 137 L246 137"/><path d="M148 181 L246 181"/><path d="M148 225 L246 225"/>
  </g>
  <g font-size="9.5" text-anchor="middle" fill="#0f6fb5">
    <rect x="250" y="35" width="100" height="28" rx="6" fill="#0f6fb5" opacity=".12" stroke="#0f6fb5" stroke-width="1.2"/><text x="300" y="53" font-weight="700">COMPILER</text>
    <rect x="250" y="79" width="100" height="28" rx="6" fill="#0f6fb5" opacity=".12" stroke="#0f6fb5" stroke-width="1.2"/><text x="300" y="97" font-weight="700">COMPILER</text>
    <rect x="250" y="123" width="100" height="28" rx="6" fill="#0f6fb5" opacity=".12" stroke="#0f6fb5" stroke-width="1.2"/><text x="300" y="141" font-weight="700">COMPILER</text>
    <rect x="250" y="167" width="100" height="28" rx="6" fill="#0f6fb5" opacity=".12" stroke="#0f6fb5" stroke-width="1.2"/><text x="300" y="185" font-weight="700">COMPILER</text>
    <rect x="250" y="211" width="100" height="28" rx="6" fill="#0f6fb5" opacity=".12" stroke="#0f6fb5" stroke-width="1.2"/><text x="300" y="229" font-weight="700">COMPILER</text>
  </g>
  <g stroke="currentColor" fill="none" stroke-width="1.5" opacity=".45" marker-end="url(#a3)">
    <path d="M352 49 L436 49"/><path d="M352 93 L436 93"/><path d="M352 137 L436 137"/><path d="M352 181 L436 181"/><path d="M352 225 L436 225"/>
  </g>
  <g font-family="monospace" font-size="10.5" fill="#7c3aed">
    <rect x="440" y="35" width="112" height="28" rx="6" fill="#7c3aed" opacity=".12" stroke="#7c3aed" stroke-width="1.2"/><text x="496" y="53" text-anchor="middle" font-weight="600">main.obj</text>
    <rect x="440" y="79" width="112" height="28" rx="6" fill="#7c3aed" opacity=".1" stroke="#7c3aed" stroke-width="1.2"/><text x="496" y="97" text-anchor="middle" font-weight="600">file1.obj</text>
    <rect x="440" y="123" width="112" height="28" rx="6" fill="#7c3aed" opacity=".1" stroke="#7c3aed" stroke-width="1.2"/><text x="496" y="141" text-anchor="middle" font-weight="600">file2.obj</text>
    <rect x="440" y="167" width="112" height="28" rx="6" fill="#7c3aed" opacity=".1" stroke="#7c3aed" stroke-width="1.2"/><text x="496" y="185" text-anchor="middle" font-weight="600">file3.obj</text>
    <rect x="440" y="211" width="112" height="28" rx="6" fill="#7c3aed" opacity=".1" stroke="#7c3aed" stroke-width="1.2"/><text x="496" y="229" text-anchor="middle" font-weight="600">file4.obj</text>
  </g>
  <g stroke="currentColor" fill="none" stroke-width="1.4" opacity=".4">
    <path d="M556 49 L600 49 L600 130"/><path d="M556 93 L600 93"/><path d="M556 137 L600 137"/><path d="M556 181 L600 181 L600 150"/><path d="M556 225 L600 225 L600 150"/>
  </g>
  <g>
    <rect x="592" y="128" width="98" height="52" rx="8" fill="#0f8a5f" opacity=".14" stroke="#0f8a5f" stroke-width="1.7"/>
    <text x="641" y="150" text-anchor="middle" font-size="11" font-weight="700" fill="#0f8a5f">LINKER</text>
    <text x="641" y="167" text-anchor="middle" font-size="9.5" font-family="monospace" fill="currentColor" opacity=".72">project.exe</text>
  </g>
</svg>`,
          caption:
            'כל קובץ .cpp מתקמפל בנפרד ל-.obj משלו. רק בסוף המקשר מחבר את כולם.',
        },
        {
          kind: 'callout',
          variant: 'exam',
          title: 'המשפט שחוזר במבחן',
          md: '"יש טעויות שמתגלות בזמן ==compilation== ויש טעויות שמתגלות בזמן ==linking==." זהו הרעיון המרכזי של השקף הזה, והעמוד הבא מוקדש כולו להבחנה הזו.',
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'למה זה נקרא "יחידת תרגום"',
          md: 'המונח הרשמי לקובץ `.cpp` **אחרי הקדם-מעבד** הוא **יחידת תרגום** (translation unit). המהדר עובד על יחידת תרגום אחת בכל פעם, ו==אין לו מושג שקיימות אחרות==. זו הסיבה שהוא לא יכול לדעת אם מימוש שהצהרת עליו קיים במקום אחר — רק המקשר יכול.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's43',
      title: 'שגיאת קומפילציה מול שגיאת לינקר',
      subtitle: 'ההבחנה שהכי מבלבלת — ולכן הכי נשאלת',
      slides: [27],
      blocks: [
        {
          kind: 'table',
          title: 'שתי משפחות של שגיאות',
          headers: ['', 'שגיאת קומפילציה', 'שגיאת לינקר'],
          rows: [
            ['מי מגלה', 'המהדר', 'המקשר'],
            ['מתי', 'מוקדם — בבדיקת כל קובץ בנפרד', 'מאוחר — אחרי שכל הקבצים עברו בהצלחה'],
            ['על מה', '**תחביר וטיפוסים**', '**מימושים חסרים או כפולים**'],
            ['הודעה טיפוסית', '`error: expected \';\'`', '`undefined reference to ...`'],
            ['', '`error: \'x\' was not declared`', '`multiple definition of ...`'],
            ['', '`error: cannot convert int to string`', '`undefined reference to \'main\'`'],
            ['מציינת מספר שורה?', '✅ כמעט תמיד', '❌ בדרך כלל לא — רק שם סמל'],
            ['סיבה נפוצה', 'שכחת `;`, שגיאת כתיב, `#include` חסר', 'הצהרת מתודה ולא מימשת אותה'],
          ],
        },
        {
          kind: 'callout',
          variant: 'exam',
          title: 'הכלל שמסביר הכול',
          md: '**המהדר בודק שאתה כותב נכון. המקשר בודק שכל מה שהבטחת — קיים.**\n\nכשאתה כותב `void Rect::rotate();` ב-`.h`, אתה **מבטיח** למהדר שהמימוש קיים איפשהו. הוא מאמין לך ומקמפל. ==רק המקשר, שרואה את כל הקבצים ביחד, יכול לגלות שהבטחת ולא קיימת.==',
        },
        {
          kind: 'compare',
          title: 'שני באגים, שני שלבים',
          left: {
            title: 'שגיאת קומפילציה',
            code: `class Rect
{
public:
    int length
    int width;     // ← חסר ; בשורה מעל
};`,
            note:
              '`error: expected \';\' at end of member declaration` — המהדר עוצר על השורה המדויקת. קל לתקן.',
            verdict: 'bad',
          },
          right: {
            title: 'שגיאת לינקר',
            code: `// Rect.h
class Rect
{
public:
    void rotate();   // הצהרה
};

// Rect.cpp — שכחנו לממש!

// main.cpp
r.rotate();`,
            note:
              '`undefined reference to \'Rect::rotate()\'` — אין מספר שורה, רק שם הסמל. צריך לחפש מה חסר.',
            verdict: 'bad',
          },
        },
        {
          kind: 'code',
          title: 'הרץ ותראה שגיאת קומפילציה אמיתית',
          runnable: true,
          broken: true,
          code: `#include <iostream>
using namespace std;

class Rect
{
public:
    int length
    int width;

    void printArea() { cout << length * width << endl; }
};

int main()
{
    Rect r;
    r.length = 5;
    r.width = 3;
    r.printArea();
    return 0;
}`,
          caption: 'לחץ "הרץ" — תקבל את הודעת השגיאה המדויקת של g++. שים לב לאיזו שורה היא מצביעה.',
        },
        {
          kind: 'code',
          title: 'והנה שגיאת לינקר אמיתית',
          runnable: true,
          broken: true,
          code: `#include <iostream>
using namespace std;

class Rect
{
public:
    int length;
    int width;

    void printArea();       // הצהרה
    void rotate();          // הצהרה — ולא נממש אותה
};

void Rect::printArea()
{
    cout << "Area = " << length * width << endl;
}

// אין מימוש ל-rotate!

int main()
{
    Rect r;
    r.length = 5;
    r.width  = 3;
    r.printArea();
    r.rotate();             // ← המקשר יתלונן על השורה הזו
    return 0;
}`,
          caption:
            'הקומפילציה עוברת! השגיאה מגיעה מהמקשר: undefined reference to Rect::rotate()',
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'איך לזהות מיד באיזה סוג מדובר',
          md: 'הסתכל על **מבנה ההודעה**:\n\n• יש `filename.cpp:12:5:` עם מספר שורה ועמודה → **קומפילציה**.\n• ההודעה מתחילה ב-`/usr/bin/ld:` או מזכירה `undefined reference` / `LNK2019` → **לינקר**.\n\nזה חוסך הרבה זמן: בשגיאת לינקר אין טעם לבהות בשורה שהיא מזכירה — צריך לחפש **מימוש חסר**.',
        },
        {
          kind: 'quiz',
          question: 'איזו שגיאה תתקבל בכל מקרה?',
          multi: true,
          options: [
            {
              text: 'שכחת `;` אחרי `}` של המחלקה → **קומפילציה**',
              correct: true,
              explain: 'תחביר. המהדר תופס את זה מיד, לרוב עם הודעה שמצביעה על השורה הבאה.',
            },
            {
              text: 'הצהרת `void foo();` ב-`.h`, קראת לה, לא מימשת → **לינקר**',
              correct: true,
              explain: 'המהדר האמין להצהרה. רק המקשר גילה שאין מימוש: `undefined reference`.',
            },
            {
              text: 'כתבת `cout` בלי `#include <iostream>` → **קומפילציה**',
              correct: true,
              explain: '`error: \'cout\' was not declared in this scope`. המהדר לא מכיר את השם.',
            },
            {
              text: 'מימשת את אותה פונקציה גלובלית בשני קבצי `.cpp` → **קומפילציה**',
              correct: false,
              explain:
                'זו דווקא שגיאת **לינקר**: `multiple definition of ...`. כל קובץ מתקמפל בסדר גמור בנפרד; רק כשהמקשר מחבר אותם הוא מגלה שני מימושים לאותו סמל.',
            },
          ],
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's44',
      title: 'הקדם-מעבד — מה הוא באמת עושה',
      subtitle: 'העורך האוטומטי שרץ לפני הכול',
      slides: [28, 29],
      blocks: [
        {
          kind: 'prose',
          md: '**קדם המעבד** (preprocessor) הוא יישום שפועל על קבצי התוכנית **לפני** פעולתו של המהדר, ויכול לשנות את הטקסט שאותו מהדרים.',
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'הנקודה החשובה ביותר להבנה',
          md: 'הקדם-מעבד עושה **עיבוד טקסטואלי בלבד**. הוא לא מבין C++, לא מכיר טיפוסים, לא יודע מה זו מחלקה. הוא פשוט **גוזר ומדביק טקסט**. ==זו הסיבה שרוב המלכודות שלו נובעות מהעובדה שהוא "טיפש".==',
        },
        {
          kind: 'list',
          title: 'הכללים התחביריים שלו',
          items: [
            'פקודות לקדם המעבד יופיעו **בתחילת שורה** ומתחילות בתו `#`.',
            'הן מסתיימות **ללא** התו `;` — בשונה מכל שאר C++.',
            'הן פועלות על **שורות**, לא על בלוקים. שורה חדשה מסיימת את ההנחיה.',
          ],
        },
        {
          kind: 'table',
          title: 'הנחיות קדם-מעבד — `preprocessor directives`',
          headers: ['ההנחיה', 'מה היא עושה'],
          rows: [
            ['`#include`', 'מכליל את תוכן הקובץ הנתון במקום השורה הזו'],
            ['`#define`', 'מגדיר החלפה טקסטואלית — כל הופעה של שם תוחלף בערך'],
            ['`#ifndef`', 'התחלת בלוק שיוכלל רק אם השם **לא** הוגדר'],
            ['`#ifdef`', 'התחלת בלוק שיוכלל רק אם השם **כן** הוגדר'],
            ['`#if`', 'התחלת בלוק מותנה לפי תנאי מספרי'],
            ['`#elif`', 'ענף נוסף בתנאי'],
            ['`#else`', 'הענף האחר'],
            ['`#endif`', 'סוף הבלוק המותנה'],
            ['`#pragma`', 'הנחיה ספציפית לקומפיילר — כמו `#pragma once`'],
          ],
        },
        {
          kind: 'heading',
          level: 3,
          text: 'הדגמה: מה קורה ל-#include',
        },
        {
          kind: 'compare',
          title: 'לפני ואחרי הקדם-מעבד',
          left: {
            title: 'מה שכתבת — main.cpp',
            code: `#include "Rect.h"

int main()
{
    Rect r;
    r.setLength(5);
    return 0;
}`,
            note: '8 שורות.',
            verdict: 'neutral',
          },
          right: {
            title: 'מה שהמהדר מקבל — temp.cpp',
            code: `// כל תוכן Rect.h הודבק כאן:
class Rect
{
private:
    int length;
    int width;
public:
    void setLength(int myLength);
    void setWidth(int myWidth);
    void printArea();
};

int main()
{
    Rect r;
    r.setLength(5);
    return 0;
}`,
            note:
              'ואם `Rect.h` הכליל `<iostream>` — גם כל 30,000 השורות שלו נמצאות שם. **הקובץ הזמני של תוכנית "hello world" הוא בערך 50,000 שורות.**',
            verdict: 'neutral',
          },
        },
        {
          kind: 'code',
          title: 'תראה בעצמך כמה גדל הקובץ',
          runnable: true,
          code: `#include <iostream>
using namespace std;

// __LINE__ הוא מאקרו של הקדם-מעבד שמחזיר את מספר השורה
// __FILE__ מחזיר את שם הקובץ

int main()
{
    cout << "This line in the ORIGINAL file: 9" << endl;
    cout << "This line AFTER preprocessing:  " << __LINE__ << endl;
    cout << "File: " << __FILE__ << endl;

    return 0;
}`,
          caption:
            'המספר שיודפס גדול בהרבה מ-10 — כי <iostream> הוסיף אלפי שורות מעל הקוד שלך.',
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'איך לראות את הפלט של הקדם-מעבד בעצמך',
          md: 'בשורת הפקודה: `g++ -E main.cpp -o main.i`\n\nהדגל `-E` אומר "עצור אחרי הקדם-מעבד". הקובץ `main.i` שייווצר הוא בדיוק מה שהמהדר יקבל. ==זה כלי דיבאג מצוין== כשמאקרו מתנהג מוזר — אתה רואה בדיוק למה הוא התרחב.',
        },
        {
          kind: 'quiz',
          question: 'איזו מהאמירות על הקדם-מעבד נכונה?',
          options: [
            {
              text: 'הוא רץ לפני המהדר ומבצע החלפות טקסטואליות',
              correct: true,
              explain:
                'נכון. הוא לא מבין C++ בכלל — רק גוזר ומדביק טקסט לפי הנחיות `#`.',
            },
            {
              text: 'הוא בודק שהטיפוסים בקוד תקינים',
              correct: false,
              explain: 'זה תפקיד המהדר. הקדם-מעבד לא יודע מה זה טיפוס.',
            },
            {
              text: 'הנחיות שלו מסתיימות בנקודה-פסיק',
              correct: false,
              explain: 'להפך — הן מסתיימות **בלי** `;`. `#define MAX 100;` יגרום לבאגים מוזרים כי הנקודה-פסיק תוחלף גם היא.',
            },
            {
              text: 'הוא מקשר את קבצי ה-`.obj`',
              correct: false,
              explain: 'זה תפקיד המקשר, בסוף התהליך.',
            },
          ],
        },
      ],
    },
  ],
};

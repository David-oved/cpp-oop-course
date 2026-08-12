import type { Chapter } from '../../types/content';

export const ch5Files: Chapter = {
  id: 'ch5',
  title: 'ממשק, מימוש, שימוש',
  sections: [
    /* ============================================================ */
    {
      id: 's28',
      title: 'למה מפצלים לשלושה קבצים',
      subtitle: 'ההפרדה שבלעדיה אי אפשר לעבוד בצוות',
      slides: [19, 20],
      blocks: [
        {
          kind: 'prose',
          md: 'עד עכשיו כתבנו הכול בקובץ אחד. זה בסדר לתרגיל של 40 שורות. בפרויקט אמיתי — מיליוני שורות שנכתבות על ידי כמה אנשים — זה בלתי אפשרי. בדרך כלל נפריד ל**שלושה קבצים נפרדים**:',
        },
        {
          kind: 'table',
          headers: ['#', 'הקובץ', 'מה יש בו', 'מי קורא אותו'],
          rows: [
            ['1', '`Rect.h` — **ממשק**', 'הגדרת המחלקה: שדות, וחתימות המתודות', 'כל מי שרוצה **להשתמש** במחלקה'],
            ['2', '`Rect.cpp` — **מימוש**', 'הגוף של כל המתודות', 'רק מי שמתחזק את המחלקה עצמה'],
            ['3', '`main.cpp` — **שימוש**', 'הגדרת מופעים והפעלת מתודות', 'התוכנית שמשתמשת במחלקה'],
          ],
        },
        {
          kind: 'diagram',
          title: 'איך שלושת הקבצים מתחברים',
          svg: `<svg viewBox="0 0 620 260" xmlns="http://www.w3.org/2000/svg" style="font-family:system-ui,sans-serif">
  <defs>
    <marker id="ar" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="currentColor"/>
    </marker>
  </defs>
  <g stroke="currentColor" fill="none" opacity=".55">
    <path d="M300 90 L300 58" marker-end="url(#ar)" stroke-width="1.8"/>
    <path d="M300 172 L300 140" marker-end="url(#ar)" stroke-width="1.8"/>
  </g>
  <g>
    <rect x="200" y="14" width="200" height="46" rx="9" fill="#3d4ec7" opacity=".12" stroke="#3d4ec7" stroke-width="1.6"/>
    <text x="300" y="34" text-anchor="middle" font-size="14" font-weight="700" fill="#3d4ec7" font-family="monospace">Rect.h</text>
    <text x="300" y="50" text-anchor="middle" font-size="11" fill="currentColor" opacity=".75">ממשק — הגדרת המחלקה</text>
  </g>
  <g>
    <rect x="60" y="96" width="200" height="46" rx="9" fill="#0f8a5f" opacity=".12" stroke="#0f8a5f" stroke-width="1.6"/>
    <text x="160" y="116" text-anchor="middle" font-size="14" font-weight="700" fill="#0f8a5f" font-family="monospace">Rect.cpp</text>
    <text x="160" y="132" text-anchor="middle" font-size="11" fill="currentColor" opacity=".75">מימוש המתודות</text>
    <rect x="340" y="96" width="200" height="46" rx="9" fill="#d97706" opacity=".12" stroke="#d97706" stroke-width="1.6"/>
    <text x="440" y="116" text-anchor="middle" font-size="14" font-weight="700" fill="#d97706" font-family="monospace">main.cpp</text>
    <text x="440" y="132" text-anchor="middle" font-size="11" fill="currentColor" opacity=".75">שימוש במחלקה</text>
  </g>
  <g stroke="currentColor" fill="none" opacity=".5" stroke-width="1.6" stroke-dasharray="4 3">
    <path d="M160 96 L160 60 L200 44" marker-end="url(#ar)"/>
    <path d="M440 96 L440 60 L400 44" marker-end="url(#ar)"/>
  </g>
  <text x="120" y="82" font-size="11" fill="currentColor" opacity=".7" font-family="monospace">#include "Rect.h"</text>
  <text x="452" y="82" font-size="11" fill="currentColor" opacity=".7" font-family="monospace">#include "Rect.h"</text>
  <g>
    <rect x="200" y="196" width="200" height="42" rx="9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 4" opacity=".5"/>
    <text x="300" y="222" text-anchor="middle" font-size="12" fill="currentColor" opacity=".8">LINKER → project.exe</text>
  </g>
  <path d="M160 142 L160 176 L280 196" stroke="currentColor" fill="none" opacity=".45" stroke-width="1.6" marker-end="url(#ar)"/>
  <path d="M440 142 L440 176 L320 196" stroke="currentColor" fill="none" opacity=".45" stroke-width="1.6" marker-end="url(#ar)"/>
</svg>`,
          caption: 'שני קבצי ה-cpp מכלילים את אותו .h, מתקמפלים בנפרד, והמקשר מחבר אותם לקובץ הרצה אחד.',
        },
        {
          kind: 'list',
          title: 'למה זה שווה את הטרחה',
          ordered: true,
          items: [
            '**קומפילציה מחדש חלקית.** שינית שורה ב-`Rect.cpp`? רק הוא מתקמפל מחדש. בפרויקט של מיליון שורות זה ההבדל בין 3 שניות ל-20 דקות.',
            '**עבודת צוות.** מפתח אחד עובד על `Rect.cpp`, אחר על `main.cpp`. הם לא נוגעים באותו קובץ ולא מתנגשים ב-git.',
            '**הסתרת המימוש.** אפשר לחלק ספרייה כ-`.h` + קובץ בינארי מהודר, בלי לחשוף את קוד המקור. כך עובדות ספריות מסחריות.',
            '**קריאוּת.** ה-`.h` הוא "תוכן העניינים" של המחלקה. אפשר להבין מה היא עושה ב-20 שניות, בלי לקרוא 400 שורות מימוש.',
          ],
        },
        {
          kind: 'callout',
          variant: 'crefresh',
          title: 'רענון מ-C — זה בדיוק אותו רעיון',
          md: 'זו לא המצאה של C++. ב-C עשית בדיוק את זה: `stack.h` עם `struct Stack` וחתימות הפונקציות, `stack.c` עם המימושים, ו-`main.c` שמכליל את ה-`.h`. ההבדל היחיד: ==עכשיו החתימות הן מתודות בתוך מחלקה במקום פונקציות גלובליות==.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's29',
      title: 'קובץ הממשק — Rect.h',
      subtitle: 'מה נכנס לקובץ הכותרת ומה לא',
      slides: [19],
      blocks: [
        {
          kind: 'code',
          runnable: true,
          title: 'Rect.h — הממשק',
          lang: 'cpp',
          code: `#pragma once
#include <iostream>
using namespace std;

class Rect
{
private:
    int length;
    int width;

public:
    void setLength(int myLength);
    void setWidth(int myWidth);
    int  getLength();
    int  getWidth();
    void printArea();

    // מתודה קצרה — מותר לממש כאן
    bool isSquare() { return length == width; }
};`,
          annotations: [
            { line: 1, text: 'מניעת הכללה מרובה — פרק 8 מסביר לעומק למה זה חובה' },
            { line: 7, text: 'השדות נמצאים ב-.h למרות שהם פרטיים — הקומפיילר חייב לדעת את גודל האובייקט' },
            { line: 12, text: 'רק חתימות. אין גופים' },
            { line: 19, text: 'חריג: מתודה של שורה אחת — מקובל לממש כאן' },
          ],
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'למה השדות הפרטיים בכל זאת ב-`.h`?',
          md: 'שאלה מצוינת שסטודנטים שואלים: אם `length` פרטי, למה שמי שמשתמש במחלקה יראה אותו בכלל? התשובה טכנית: כשהקומפיילר מקמפל את `main.cpp` ורואה `Rect r;`, הוא חייב לדעת **כמה בתים להקצות** על המחסנית. בשביל זה הוא צריך לראות את כל השדות. ה-`private` מונע **גישה**, לא **ראייה**.',
        },
        {
          kind: 'table',
          title: 'מה שם ואיפה',
          headers: ['הפריט', 'ב-`.h`?', 'ב-`.cpp`?'],
          rows: [
            ['הגדרת המחלקה `class Rect { … };`', '✅ כן', '❌ לא'],
            ['השדות (גם הפרטיים)', '✅ כן', '❌ לא'],
            ['חתימות המתודות', '✅ כן', '❌ לא'],
            ['גוף של מתודה **ארוכה**', '❌ לא', '✅ כן'],
            ['גוף של מתודה **קצרה** (שורה)', '✅ מותר', '✅ גם מותר'],
            ['`#include` של ספריות שהממשק צריך', '✅ כן', 'לפי הצורך'],
            ['הגנת הכללה מרובה', '✅ **חובה**', '❌ לא נדרש'],
          ],
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'למה `using namespace std;` בקובץ `.h` הוא הרגל רע',
          md: 'המצגת כותבת אותו, וזה מקובל בקורס — אבל שווה לדעת: ==כל קובץ שמכליל את ה-`.h` שלך יורש את ה-`using`==, בלי לבקש. בפרויקט גדול זה גורם להתנגשויות שמות מסתוריות. הפתרון המקצועי: לכתוב `std::string` במפורש ב-`.h`, ולשמור את `using namespace std;` לקבצי ה-`.cpp` בלבד. ==בקורס אין דרישה כזו== — אבל אם תראה קוד מקצועי בלי `using` ב-`.h`, עכשיו אתה יודע למה.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's30',
      title: 'קובץ המימוש — Rect.cpp',
      subtitle: 'איפה יושבים הגופים',
      slides: [19],
      blocks: [
        {
          kind: 'code',
          runnable: true,
          prelude: `class Rect
{
private:
    int length;
    int width;

public:
    void setLength(int myLength);
    void setWidth(int myWidth);
    int  getLength();
    int  getWidth();
    void printArea();
    bool isSquare() { return length == width; }
};`,
          title: 'Rect.cpp — המימוש',
          lang: 'cpp',
          code: `#include "Rect.h"

void Rect::setLength(int myLength)
{
    if (myLength > 0)
        length = myLength;
    else
        length = 5;
}

void Rect::setWidth(int myWidth)
{
    if (myWidth > 0)
        width = myWidth;
    else
        width = 5;
}

int Rect::getLength()
{
    return length;
}

int Rect::getWidth()
{
    return width;
}

void Rect::printArea()
{
    cout << "Area = " << length * width << endl;
}`,
          annotations: [
            { line: 1, text: 'הכללת הממשק — בלעדיה הקומפיילר לא יידע מהי Rect' },
            { line: 3, text: 'Rect:: לפני כל שם מתודה. חובה!' },
          ],
        },
        {
          kind: 'callout',
          variant: 'danger',
          title: 'שלוש טעויות שחוזרות בקובץ המימוש',
          md: '**1.** שכחת `#include "Rect.h"` → `error: Rect has not been declared`.\n\n**2.** שכחת `Rect::` לפני שם המתודה → יצרת פונקציה גלובלית, והשדות "לא מוכרים".\n\n**3.** כתבת `;` אחרי הגוף של המתודה — `void Rect::foo() { ... };` — בדרך כלל לא שגיאה, אבל מיותר ומבלבל.',
        },
        {
          kind: 'callout',
          variant: 'exam',
          title: 'שגיאת לינקר — הסימן שחסר מימוש',
          md: 'אם תצהיר על `void Rect::rotate();` ב-`.h`, תקרא לה מ-`main`, אבל **לא תממש אותה** ב-`.cpp` — הקומפילציה תעבור! כל קובץ מתקמפל בנפרד, ו-`main.cpp` רק צריך לראות את ההצהרה. השגיאה תגיע רק בשלב ה**קישור**:\n\n`undefined reference to \'Rect::rotate()\'`\n\n==זהו ההבדל המהותי בין שגיאת קומפילציה לשגיאת לינקר==, ופרק 7 מוקדש לו.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's31',
      title: 'קובץ השימוש — main.cpp',
      subtitle: 'הפרויקט השלם, ואיך מריצים אותו כאן',
      slides: [19, 20],
      blocks: [
        {
          kind: 'prose',
          md: 'הנה כל שלושת הקבצים ביחד. עבור בין הלשוניות למעלה כדי לראות כל אחד. **לחיצה על "הרץ" מאחדת אותם אוטומטית** לקובץ אחד ושולחת ל-g++ — בדיוק כמו שהקדם-מעבד עושה בפרויקט אמיתי.',
        },
        {
          kind: 'code',
          title: 'פרויקט שלם בשלושה קבצים',
          runnable: true,
          files: [
            {
              name: 'Rect.h',
              code: `#pragma once
#include <iostream>
using namespace std;

class Rect
{
private:
    int length;
    int width;

public:
    void setLength(int myLength);
    void setWidth(int myWidth);
    int  getLength();
    int  getWidth();
    void printArea();
    bool isSquare() { return length == width; }
};`,
            },
            {
              name: 'Rect.cpp',
              code: `#include "Rect.h"

void Rect::setLength(int myLength)
{
    if (myLength > 0)
        length = myLength;
    else
        length = 5;
}

void Rect::setWidth(int myWidth)
{
    if (myWidth > 0)
        width = myWidth;
    else
        width = 5;
}

int Rect::getLength() { return length; }
int Rect::getWidth()  { return width;  }

void Rect::printArea()
{
    cout << "Area = " << length * width << endl;
}`,
            },
            {
              name: 'main.cpp',
              code: `#include <iostream>
#include "Rect.h"
using namespace std;

int main()
{
    Rect r1;
    r1.setLength(17);
    r1.setWidth(19);
    r1.printArea();

    Rect r2;
    r2.setLength(6);
    r2.setWidth(6);
    r2.printArea();
    cout << "r2 is square? " << (r2.isSquare() ? "yes" : "no") << endl;

    Rect r3;
    r3.setLength(-4);        // ייחסם, יקבל 5
    r3.setWidth(10);
    cout << "r3 length = " << r3.getLength() << endl;
    r3.printArea();

    return 0;
}`,
            },
          ],
          caption:
            'שים לב: main.cpp לא יודע דבר על איך setLength ממומשת. הוא רק צריך את הממשק.',
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'איך זה מתקמפל בפועל',
          md: 'בשורת הפקודה, קומפילציה של פרויקט כזה נראית כך:\n\n`g++ -c Rect.cpp -o Rect.o`\n`g++ -c main.cpp -o main.o`\n`g++ Rect.o main.o -o project`\n\nשתי הפקודות הראשונות הן **הידור** — כל קובץ בנפרד. השלישית היא **קישור**. ב-Visual Studio, לחיצה על Build עושה בדיוק את זה מאחורי הקלעים.',
        },
        {
          kind: 'quiz',
          question:
            'שינית רק את גוף המתודה `printArea` בקובץ `Rect.cpp`. מה צריך להתקמפל מחדש?',
          options: [
            {
              text: 'רק `Rect.cpp`, ואז קישור מחדש',
              correct: true,
              explain:
                'נכון — וזה בדיוק הרווח מההפרדה. `main.cpp` לא השתנה ולא ראה שינוי ב-`Rect.h`, ולכן ה-`main.o` הקיים עדיין תקף. רק המקשר צריך לרוץ שוב.',
            },
            {
              text: 'גם `main.cpp`, כי הוא משתמש במתודה',
              correct: false,
              explain:
                '`main.cpp` מכיר רק את **החתימה** מה-`.h`, וזו לא השתנתה. הוא לא צריך לדעת איך המתודה ממומשת.',
            },
            {
              text: 'הכול, תמיד',
              correct: false,
              explain: 'זה מה שהיה קורה אילו הכול היה בקובץ אחד — וזו בדיוק הבעיה שההפרדה פותרת.',
            },
            {
              text: 'שום דבר — שינוי במימוש לא דורש קומפילציה',
              correct: false,
              explain: 'הקובץ ששונה חייב להתקמפל מחדש כדי לייצר `.o` מעודכן.',
            },
          ],
        },
        {
          kind: 'callout',
          variant: 'exam',
          title: 'המשך של אותה שאלה',
          md: 'ומה אם היית משנה את **`Rect.h`** — למשל מוסיף שדה? אז ==כל קובץ שמכליל אותו== חייב להתקמפל מחדש, כולל `main.cpp`. הסיבה: גודל האובייקט השתנה. זו הסיבה שבפרויקטים גדולים מקפידים לשמור על ה-`.h` יציב ככל האפשר.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's32',
      title: 'ההבדל בין <> לבין ""',
      subtitle: 'איפה הקדם-מעבד מחפש את הקובץ',
      slides: [21],
      blocks: [
        {
          kind: 'compare',
          title: 'שתי צורות של include',
          left: {
            title: '#include <iostream>',
            code: `#include <iostream>
#include <cmath>
#include <string>`,
            note:
              'סוגריים משולשים → מחפש בספריות **המערכת** (system directory). מיועד ל**ספריות התקן** ולספריות חיצוניות מותקנות.',
            verdict: 'neutral',
          },
          right: {
            title: '#include "Rect.h"',
            code: `#include "Rect.h"
#include "Student.h"
#include "utils/Logger.h"`,
            note:
              'מרכאות → מחפש קודם ב**ספרייה הנוכחית** (current directory), ורק אם לא מצא — בספריות המערכת. מיועד ל**קבצים שלך**.',
            verdict: 'neutral',
          },
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'הכלל המעשי',
          md: '**קובץ שכתבת בעצמך → מרכאות. ספרייה של מישהו אחר → משולשים.** זהו. אין מקרי קצה שכדאי להתעסק בהם בשלב הזה.',
        },
        {
          kind: 'table',
          title: 'ספריות תקן שכדאי להכיר',
          headers: ['ההכללה', 'מה יש בה', 'שימוש טיפוסי'],
          rows: [
            ['`<iostream>`', '`cout`, `cin`, `cerr`, `endl`', 'קלט ופלט לקונסולה'],
            ['`<cmath>`', '`sqrt`, `pow`, `abs`, `sin`', 'פונקציות מתמטיות'],
            ['`<string>`', 'מחלקת `string`', 'מחרוזות (שיעור 4)'],
            ['`<fstream>`', '`ifstream`, `ofstream`', 'קבצים (שיעורים 5–6)'],
            ['`<iomanip>`', '`setw`, `setprecision`, `fixed`', 'עיצוב פלט'],
            ['`<cstring>`', '`strcpy`, `strlen`, `strcmp`', 'מחרוזות בסגנון C'],
            ['`<vector>`', 'מחלקת `vector`', 'מערך דינמי (שיעור 11)'],
          ],
        },
        {
          kind: 'code',
          title: 'הכללות בעבודה',
          runnable: true,
          code: `#include <iostream>     // cout, endl
#include <cmath>        // sqrt
#include <iomanip>      // setprecision, fixed
using namespace std;

int main()
{
    double x = 2.0;

    cout << "sqrt(2) = " << sqrt(x) << endl;

    cout << fixed << setprecision(10);
    cout << "with 10 digits: " << sqrt(x) << endl;

    cout << "pow(2,10) = " << pow(2, 10) << endl;

    return 0;
}`,
        },
        {
          kind: 'pitfall',
          title: 'שכחת include של ספרייה',
          badCode: `#include <iostream>
using namespace std;

int main()
{
    cout << sqrt(16.0) << endl;   // ✕ אין cmath
}`,
          error: `error: 'sqrt' was not declared in this scope
    6 |     cout << sqrt(16.0) << endl;
      |             ^~~~
note: suggested alternative: 'short'`,
          explain:
            'הקדם-מעבד לא הכניס את `<cmath>`, ולכן החתימה של `sqrt` לא מוכרת לקומפיילר בשלב הזה. שים לב שהודעת השגיאה זהה בניסוחה לשגיאה שקיבלנו כששכחנו `Rect::` — "was not declared in this scope". זו הודעה גנרית שאומרת "אני לא מכיר את השם הזה", ויש לה כמה סיבות אפשריות. ==כשתקבל אותה, בדוק לפי הסדר: (1) שגיאת כתיב, (2) `#include` חסר, (3) `ClassName::` חסר.==',
          goodCode: `#include <iostream>
#include <cmath>        // ✓ נוסף
using namespace std;

int main()
{
    cout << sqrt(16.0) << endl;
}`,
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'לפעמים זה "עובד" בטעות',
          md: 'לפעמים תשכח `#include <cmath>` והקוד יתקמפל בכל זאת — כי `<iostream>` בעצמו הכליל אותה בעקיפין. ==אל תסמוך על זה!== בקומפיילר אחר או בגרסה אחרת זה יישבר. **כלל: הכלל במפורש כל ספרייה שאתה משתמש בה ישירות.**',
        },
      ],
    },
  ],
};

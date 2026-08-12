import type { Chapter } from '../../types/content';

export const ch4Access: Chapter = {
  id: 'ch4',
  title: 'הרשאות גישה',
  sections: [
    /* ============================================================ */
    {
      id: 's21',
      title: 'למה בכלל להסתיר?',
      subtitle: 'סיפור קצר על מלבן עם אורך שלילי',
      slides: [16],
      blocks: [
        {
          kind: 'prose',
          md: 'עד עכשיו כתבנו `public:` בראש המחלקה בלי להסביר. עכשיו נבין למה זו בעצם **הבחירה הגרועה** ברוב המקרים.',
        },
        {
          kind: 'prose',
          md: 'קח את המחלקה שבנינו. השדות שלה ציבוריים. עכשיו דמיין שהפרויקט גדל ל-30 קבצים ושלושה מפתחים. מישהו, איפשהו, כותב את זה:',
        },
        {
          kind: 'code',
          title: 'הקוד שרץ בלי תלונה — והורס הכול',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Rect
{
public:                        // ← הכל חשוף
    int length;
    int width;

    void printArea()
    {
        cout << "Area = " << length * width << endl;
    }
};

int main()
{
    Rect r;
    r.length = 5;
    r.width  = 3;
    r.printArea();             // Area = 15 — הגיוני

    // ואז, בקובץ אחר, מישהו כותב:
    r.length = -4;
    r.printArea();             // Area = -12 ?! מלבן עם שטח שלילי

    r.width = 0;
    r.printArea();             // Area = 0 — מלבן שהוא לא מלבן

    return 0;
}`,
        },
        {
          kind: 'callout',
          variant: 'danger',
          title: 'זה לא באג בקוד — זה באג בתכנון',
          md: 'שטח שלילי הוא **מצב בלתי חוקי** של מלבן. מלבן כזה לא יכול להתקיים. אבל בתכנון הנוכחי, ==אין שום דבר שמונע אותו==. הקומפיילר מרוצה, התוכנית רצה, והמספר הלא הגיוני יופיע בדוח ללקוח.',
        },
        {
          kind: 'heading',
          level: 3,
          text: 'למה זה כל כך גרוע',
        },
        {
          kind: 'list',
          ordered: true,
          items: [
            '**הבאג מתגלה רחוק מהמקום שיצר אותו.** מישהו כתב `-4` בקובץ A, והטעות מתגלה בדוח שנוצר בקובץ Z. לך תמצא.',
            '**אין נקודה אחת לבדוק בה.** אם 40 מקומות בפרויקט כותבים ל-`length`, יש 40 מקומות שבהם הבאג יכול להיווצר.',
            '**אי אפשר לשנות את הייצוג.** אם תחליט שמלבן יישמר כשתי נקודות פינה במקום אורך ורוחב — כל אותם 40 מקומות יישברו.',
            '**המחלקה לא יכולה לשמור על עצמה.** היא לא יודעת מתי מישהו שינה אותה, ולכן לא יכולה, למשל, לעדכן שדה מטמון של השטח.',
          ],
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'הפתרון',
          md: 'להפוך את השדות ל-**`private`** — ואז ==הקומפיילר עצמו יסרב לקמפל== קוד שמנסה לכתוב `r.length = -4`. לא משמעת, לא תיעוד, לא ביקורת קוד. פשוט לא מתקמפל. ואז לחשוף מתודה `setLength` שבודקת את הערך לפני שהיא מקבלת אותו.',
        },
        {
          kind: 'compare',
          title: 'שתי גישות לאותה מחלקה',
          left: {
            title: 'שדות ציבוריים',
            code: `class Rect
{
public:
    int length;
    int width;
};

Rect r;
r.length = -4;    // ✓ מתקמפל
                  // ✕ הגיוני`,
            note: 'המחלקה היא רק אריזה. אין לה שליטה על עצמה.',
            verdict: 'bad',
          },
          right: {
            title: 'שדות פרטיים + שער כניסה',
            code: `class Rect
{
private:
    int length;
    int width;
public:
    void setLength(int v)
    {
        if (v > 0) length = v;
        else       length = 1;
    }
};

Rect r;
r.length = -4;      // ✕ לא מתקמפל!
r.setLength(-4);    // ✓ מתקמפל
                    // ✓ והשדה יקבל 1`,
            note: 'המחלקה שולטת על מצבה. אין דרך להגיע למצב בלתי חוקי.',
            verdict: 'good',
          },
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's22',
      title: 'שלוש רשויות הגישה',
      subtitle: 'public, protected, private — התחביר והמשמעות',
      slides: [16],
      blocks: [
        {
          kind: 'code',
          runnable: true,
          title: 'המבנה הכללי',
          code: `class ClassName
{
public:
        // public data members
        // public member functions

protected:
        // protected data members
        // protected member functions

private:
        // private data members
        // private member functions
};`,
        },
        {
          kind: 'table',
          title: 'מה מותר לגשת מאיפה',
          headers: ['הרשאה', 'מתוך מתודות המחלקה', 'מחוץ למחלקה (דרך מופע)', 'ממחלקה יורשת'],
          rows: [
            ['`public` — רשות הרבים', '✅ מותר', '✅ מותר', '✅ מותר'],
            ['`protected` — כרמלית', '✅ מותר', '❌ אסור', '✅ מותר'],
            ['`private` — רשות היחיד', '✅ מותר', '❌ אסור', '❌ אסור'],
          ],
          caption: 'העמודה השלישית רלוונטית לשיעור 9 (ירושה). כרגע מספיק להכיר את שתי הראשונות.',
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'המשל מהמצגת',
          md: 'המצגת משתמשת במונחים מדיני שבת: **`public` = רשות הרבים** — כל אחד יכול להיכנס. **`private` = רשות היחיד** — רק בעל הבית. **`protected` = כרמלית** — משהו באמצע, לא רשות הרבים ולא רשות היחיד. הסבר מלא על `protected` יגיע בשיעור 9, כשנלמד ירושה; כרגע ==מספיק לזכור שהיא קיימת ושהיא באמצע==.',
        },
        {
          kind: 'list',
          title: 'שלושה כללי תחביר שכדאי לדעת',
          items: [
            '**ב-`class` הרשאת ברירת המחדל היא `private`.** אם לא כתבת שום דבר, כל מה שמופיע בראש המחלקה — פרטי.',
            '**לא חייבים את שלושת סוגי ההרשאות.** מחלקה יכולה להיות עם `private` בלבד, או עם `public` בלבד.',
            '**ניתן לחזור על הרשאה, והסדר אינו משנה.** אפשר `public:` ואז `private:` ואז שוב `public:`. כל תווית תקפה עד לתווית הבאה.',
          ],
        },
        {
          kind: 'code',
          title: 'כל האפשרויות התחביריות — הכול חוקי',
          lang: 'cpp',
          files: [
            {
              name: 'default.cpp',
              code: `// בלי תווית — הכל private כברירת מחדל
class A
{
    int x;          // private!
    void f();       // private!
};

// לכן זה לא יתקמפל:
// A a;
// a.x = 5;   ✕`,
            },
            {
              name: 'repeated.cpp',
              code: `// חזרה על הרשאה — חוקי לגמרי
class B
{
public:
    void f();
private:
    int x;
public:              // שוב public
    void g();
private:             // שוב private
    int y;
};`,
            },
            {
              name: 'order.cpp',
              code: `// private קודם — גם חוקי
class C
{
private:
    int x;
public:
    void setX(int v) { x = v; }
    int  getX()      { return x; }
};

// המוסכמה הנפוצה:
// private למעלה (הנתונים),
// public למטה (הממשק)`,
            },
          ],
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'כלל אצבע לתכנון',
          md: '**התחל מהכול `private`, וחשוף החוצה רק מה שחייבים.** קל תמיד להוסיף עוד `public` בהמשך; קשה מאוד להסתיר משהו שכבר נחשף, כי חצי מהפרויקט כבר משתמש בו. זה נקרא "עקרון ההרשאה המזערית".',
        },
        {
          kind: 'quiz',
          question: 'מה מתקמפל כאן ומה לא?',
          code: `class Test
{
    int a;           // (1)
public:
    int b;           // (2)
private:
    int c;           // (3)
};

int main()
{
    Test t;
    t.a = 1;         // A
    t.b = 2;         // B
    t.c = 3;         // C
}`,
          options: [
            {
              text: 'רק B מתקמפל',
              correct: true,
              explain:
                'נכון. `a` הוא private כי אין תווית לפניו וברירת המחדל ב-`class` היא private. `b` הוא public. `c` הוא private במפורש. לכן רק `t.b = 2` חוקי.',
            },
            {
              text: 'A ו-B מתקמפלים',
              correct: false,
              explain: 'זו הטעות הנפוצה — להניח שבלי תווית זה public. ב-`class` ברירת המחדל היא **private**. (ב-`struct` היא public — נגיע לזה בעמוד הבא.)',
            },
            { text: 'כולם מתקמפלים', correct: false, explain: 'שני שדות פרטיים כאן. הקומפיילר יסרב לשניהם.' },
            { text: 'אף אחד לא מתקמפל', correct: false, explain: '`b` הוא public במפורש — הגישה אליו חוקית.' },
          ],
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's23',
      title: 'private בפועל — השגיאה שתראה',
      subtitle: 'איך הודעת הקומפיילר נראית, ולמה זו בשורה טובה',
      slides: [17],
      blocks: [
        {
          kind: 'prose',
          md: 'הנה המחלקה מהמצגת, עם השדות מוגנים. שים לב בדיוק מה מותר ומה אסור.',
        },
        {
          kind: 'code',
          runnable: true,
          title: 'Rect עם שדות פרטיים — הגרסה מהמצגת',
          code: `class Rect
{
private:
    int length;
    int width;

public:
    void printArea() { cout << length * width << endl; }

    int  getLength() { return length; }
    void setLength(int myLength)
    {
        if (myLength > 0)
            length = myLength;
        else
            length = 5;      // default value
    }

    int  getWidth()  { return width; }
    void setWidth(int myWidth) { width = myWidth; }
};`,
          annotations: [
            { line: 3, text: 'מכאן והלאה — פרטי. גישה רק מתוך מתודות המחלקה' },
            { line: 8, text: 'printArea היא מתודה של המחלקה, ולכן מותר לה לגשת ל-length' },
            { line: 13, text: 'הולידציה — כאן נחסמים ערכים לא חוקיים' },
            { line: 16, text: 'ערך ברירת מחדל כשהקלט פסול' },
          ],
        },
        {
          kind: 'pitfall',
          title: 'ניסיון גישה לשדה פרטי מבחוץ',
          badCode: `int main()
{
    Rect rect1;
    rect1.length = -4;              // ✕
    cout << rect1.getLength();
}`,
          error: `error: 'int Rect::length' is private within this context
    4 |     rect1.length = -4;
      |           ^~~~~~
note: declared private here
    4 |     int length;
      |         ^~~~~~`,
          explain:
            'הקומפיילר עוצר את התוכנית **בזמן קומפילציה**, לא בזמן ריצה. זה בדיוק מה שרצינו: אי אפשר בכלל לבנות תוכנית שמכילה את הבאג הזה. שים לב שההודעה גם מפנה אותך לשורה שבה השדה הוצהר כפרטי — הקומפיילרים המודרניים די עוזרים כאן.',
          goodCode: `int main()
{
    Rect rect1;
    rect1.setLength(-4);            // ✓ מתקמפל
    cout << rect1.getLength();      // ידפיס 5 — הולידציה עבדה
}`,
          goodNote:
            'שים לב מה קרה: הקוד **כן** ניסה להכניס ערך פסול, אבל המחלקה סירבה וקבעה ברירת מחדל. האובייקט נשאר במצב חוקי בכל רגע.',
        },
        {
          kind: 'code',
          title: 'הרץ ותראה בעצמך',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Rect
{
private:
    int length;
    int width;

public:
    void printArea() { cout << "Area = " << length * width << endl; }

    int  getLength() { return length; }
    void setLength(int myLength)
    {
        if (myLength > 0)
            length = myLength;
        else
        {
            cout << "[Rect] rejected length " << myLength
                 << ", using default 5" << endl;
            length = 5;
        }
    }

    int  getWidth() { return width; }
    void setWidth(int myWidth)
    {
        if (myWidth > 0)
            width = myWidth;
        else
        {
            cout << "[Rect] rejected width " << myWidth
                 << ", using default 5" << endl;
            width = 5;
        }
    }
};

int main()
{
    Rect r;

    r.setLength(17);
    r.setWidth(19);
    r.printArea();

    cout << "--- now trying to break it ---" << endl;
    r.setLength(-4);       // נדחה
    r.setWidth(0);         // נדחה
    r.printArea();         // עדיין מלבן חוקי!

    return 0;
}`,
          caption: 'נסה להוסיף שורה r.length = -4; ולהריץ — תראה את שגיאת הקומפילציה האמיתית.',
        },
        {
          kind: 'callout',
          variant: 'exam',
          title: 'ניסוח שחוזר במבחנים',
          md: '"מחוץ להגדרת המחלקה, ==מותר לגשת רק לתכונות או מתודות שהוגדרו תחת הרשאת `public`==. מותר לגשת לשדות `length`, `width` **רק מתוך מתודות** של המחלקה." — שים לב לניסוח "מתוך מתודות": זה כולל מתודות `public`, `private` ו-`protected` כאחד. ההרשאה של המתודה קובעת מי יכול **לקרוא לה**, לא למה **היא** יכולה לגשת.',
        },
        {
          kind: 'quiz',
          question:
            'מתודה `private` בשם `helper()` מנסה לגשת לשדה `private` בשם `data`. האם זה חוקי?',
          options: [
            {
              text: 'כן — כל מתודה של המחלקה יכולה לגשת לכל שדה שלה',
              correct: true,
              explain:
                'נכון. הרשאת הגישה קובעת מי יכול לגשת **מבחוץ**. בתוך המחלקה, כל מתודה — פרטית, מוגנת או ציבורית — רואה את הכול. זה כלל שקל להתבלבל בו.',
            },
            {
              text: 'לא — מתודה פרטית לא יכולה לגשת לשדה פרטי',
              correct: false,
              explain: 'אין קשר בין הרשאת המתודה להרשאת השדה. שתיהן שייכות לאותה מחלקה ולכן רואות זו את זו.',
            },
            {
              text: 'רק אם `helper` מוגדרת אחרי `data`',
              correct: false,
              explain: 'סדר ההגדרה בתוך מחלקה לא משנה — הקומפיילר קורא את כל ההצהרות לפני הגופים.',
            },
            {
              text: 'רק אם `helper` היא `public`',
              correct: false,
              explain: 'להפך — אין לזה שום קשר. ההרשאה של המתודה קובעת מי רשאי לקרוא לה מבחוץ.',
            },
          ],
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's24',
      title: 'getter ו-setter',
      subtitle: 'השערים המבוקרים אל הנתונים',
      slides: [17],
      blocks: [
        {
          kind: 'callout',
          variant: 'info',
          title: 'המוסכמה',
          md: 'מקובל להגדיר בחלק הציבורי, לכל תכונה, **מתודת `get`** (איחזור) ו**מתודת `set`** (הצבה) — או רק אחת מהן, על פי הצורך.',
        },
        {
          kind: 'table',
          title: 'שתי המתודות',
          headers: ['', 'getter — איחזור', 'setter — הצבה'],
          rows: [
            ['תפקיד', 'להחזיר את ערך השדה', 'לקבוע את ערך השדה'],
            ['שם מקובל', '`getLength()`', '`setLength(int myLength)`'],
            ['טיפוס החזרה', 'טיפוס השדה', '`void` בדרך כלל'],
            ['פרמטרים', 'אין', 'הערך החדש'],
            ['תפקיד נוסף', 'יכול להחזיר ערך מחושב', '**ולידציה** — כאן נחסמים ערכים פסולים'],
          ],
        },
        {
          kind: 'heading',
          level: 3,
          text: 'לא כל תכונה צריכה את שניהם',
        },
        {
          kind: 'prose',
          md: 'זו נקודה שמפספסים הרבה. המטרה **אינה** לעטוף כל שדה בשני מתודות באופן אוטומטי — זה היה חוזר בדיוק לשדות ציבוריים, רק עם יותר הקלדה. המטרה היא **לחשוף בדיוק את מה שצריך**:',
        },
        {
          kind: 'table',
          headers: ['סוג התכונה', 'get?', 'set?', 'דוגמה'],
          rows: [
            ['נתון שקוראים ומשנים', '✅', '✅', 'שם של סטודנט'],
            ['נתון שנקבע פעם אחת', '✅', '❌', 'תעודת זהות — לא משתנה'],
            ['נתון פנימי לגמרי', '❌', '❌', 'שדה מטמון של תוצאת חישוב'],
            ['ערך מחושב', '✅', '❌', 'שטח — נגזר מאורך ורוחב'],
            ['נתון שנשלט אחרת', '✅', '❌', 'יתרה — משתנה רק דרך `deposit`/`withdraw`'],
          ],
        },
        {
          kind: 'code',
          title: 'דוגמה: לא כל שדה מקבל את אותו יחס',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Student
{
private:
    int   id;            // נקבע פעם אחת
    float average;       // נשלט דרך addGrade בלבד
    int   gradeCount;    // פנימי לגמרי
    float gradeSum;      // פנימי לגמרי

public:
    void init(int studentId)
    {
        id         = studentId;
        average    = 0;
        gradeCount = 0;
        gradeSum   = 0;
    }

    int getId() { return id; }           // get בלבד — אין setId!

    void addGrade(float grade)           // הדרך היחידה להשפיע על הממוצע
    {
        if (grade < 0 || grade > 100)
        {
            cout << "Invalid grade: " << grade << endl;
            return;
        }
        gradeSum += grade;
        gradeCount++;
        average = gradeSum / gradeCount;
    }

    float getAverage() { return average; }   // get בלבד

    bool isPassing()   { return average >= 60; }  // ערך מחושב

    // gradeCount ו-gradeSum: אין get ואין set. פנימיים לחלוטין.
};

int main()
{
    Student s;
    s.init(324);

    s.addGrade(90);
    s.addGrade(80);
    cout << "Average: " << s.getAverage() << endl;

    s.addGrade(150);                 // נדחה
    cout << "Average: " << s.getAverage() << " (unchanged)" << endl;

    s.addGrade(40);
    cout << "Average: " << s.getAverage() << endl;
    cout << "Passing? " << (s.isPassing() ? "yes" : "no") << endl;

    return 0;
}`,
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'למה `setAverage` היה רעיון רע כאן',
          md: 'אילו היה `setAverage(float)`, מישהו היה יכול לכתוב `s.setAverage(100)` בלי אף ציון — והמחלקה הייתה משקרת. הממוצע הוא **תוצאה** של הציונים, לא נתון עצמאי. ==כשמתכננים מחלקה, שואלים "מה הפעולות שהגיוני לעשות על העצם הזה", לא "אילו שדות יש לי".==',
        },
        {
          kind: 'callout',
          variant: 'modern',
          title: 'getter ב-C++ מודרני',
          md: 'בקוד עדכני נהוג לכתוב getters כך: `int getLength() const { return length; }` — עם `const` בסוף. זה מבטיח שהמתודה לא משנה את האובייקט, ומאפשר לקרוא לה גם על אובייקט קבוע. ==בקורס זה לא נדרש בשיעור 1==, אבל זה הרגל טוב שכדאי לאמץ.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's25',
      title: 'setter עם ולידציה אמיתית',
      subtitle: 'ההבדל בין setter שמגן לבין setter שרק מעביר',
      slides: [17],
      blocks: [
        {
          kind: 'prose',
          md: 'זהו העמוד שבו נופלת רוב התועלת של כל הפרק. **setter שרק מעתיק ערך לשדה לא מגן על כלום** — הוא בדיוק כמו שדה ציבורי, רק עם שלוש שורות יותר.',
        },
        {
          kind: 'compare',
          title: 'שני setters לאותו שדה',
          left: {
            title: 'setter חסר תועלת',
            code: `void setWidth(int myWidth)
{
    width = myWidth;
}

// מה זה מונע?
r.setWidth(-100);   // ✓ עבר
r.setWidth(0);      // ✓ עבר`,
            note: 'הוא לא בודק כלום. השדה יכול לקבל כל ערך — בדיוק כמו אילו היה `public`. ההגנה כאן היא **אשליה**.',
            verdict: 'bad',
          },
          right: {
            title: 'setter שמגן',
            code: `void setWidth(int myWidth)
{
    if (myWidth > 0)
        width = myWidth;
    else
        width = 5;    // ברירת מחדל
}

r.setWidth(-100);   // נדחה → 5
r.setWidth(0);      // נדחה → 5`,
            note: 'האובייקט לא יכול להגיע למצב בלתי חוקי, ולא משנה מה הקוד החיצוני מנסה.',
            verdict: 'good',
          },
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'שים לב לחוסר העקביות במצגת',
          md: 'בשקף 17 של המצגת המקורית, `setLength` **כן** בודקת (`if (myLength > 0)`), אבל `setWidth` **לא** — היא רק מעתיקה. זה כנראה קיצור דרך לצורך השקף. בקוד אמיתי — ובתרגילים שלך — ==שני ה-setters צריכים לבדוק==.',
        },
        {
          kind: 'heading',
          level: 3,
          text: 'שלוש אסטרטגיות כשהערך פסול',
        },
        {
          kind: 'table',
          headers: ['אסטרטגיה', 'קוד', 'מתי מתאים'],
          rows: [
            [
              'ברירת מחדל',
              '`if (v > 0) x = v; else x = 5;`',
              'הגישה של הקורס. פשוט, אבל **שקט** — הקורא לא יודע שנדחה.',
            ],
            [
              'התעלמות',
              '`if (v > 0) x = v;`',
              'השדה נשאר בערכו הקודם. עדיף כשיש ערך תקין קודם.',
            ],
            [
              'החזרת הצלחה',
              '`bool setX(int v)` שמחזירה `false` בכשל',
              'הקורא יכול לבדוק ולהגיב. גישה טובה.',
            ],
            [
              'זריקת חריגה',
              '`throw invalid_argument("...")`',
              'הדרך הנכונה ביותר. **שיעור 7** בקורס.',
            ],
          ],
        },
        {
          kind: 'code',
          title: 'setter שמחזיר הצלחה — גישה שימושית',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Temperature
{
private:
    double celsius;

public:
    void init() { celsius = 0; }

    // מחזיר האם ההצבה הצליחה
    bool setCelsius(double value)
    {
        if (value < -273.15)          // האפס המוחלט
        {
            return false;
        }
        celsius = value;
        return true;
    }

    double getCelsius()    { return celsius; }
    double getFahrenheit() { return celsius * 9.0 / 5.0 + 32.0; }
};

int main()
{
    Temperature t;
    t.init();

    if (t.setCelsius(25))
        cout << "OK: " << t.getCelsius() << "C = "
             << t.getFahrenheit() << "F" << endl;

    if (!t.setCelsius(-500))
        cout << "Rejected -500C: below absolute zero." << endl;

    cout << "Still: " << t.getCelsius() << "C" << endl;

    return 0;
}`,
          caption:
            'שים לב ש-getFahrenheit הוא ערך **מחושב** — אין שדה כזה. זו דוגמה מושלמת להפשטת נתונים.',
        },
        {
          kind: 'exercise',
          id: 'ex-fix-exposed',
          title: 'תקן מחלקה חשופה',
          level: 2,
          brief:
            'למטה מחלקת `Circle` עם שדות ציבוריים ובלי שום הגנה. הפוך אותה למחלקה שאי אפשר לשבור.',
          requirements: [
            'העבר את `radius` ל-`private`.',
            'הוסף `setRadius(double r)` שדוחה רדיוס שאינו חיובי ומציב 1.0 במקומו — והדפס הודעה כשזה קורה.',
            'הוסף `getRadius()`.',
            'הוסף `getArea()` ו-`getCircumference()` כערכים **מחושבים** — ==אל תשמור אותם בשדות==.',
            'ודא ש-`main` הקיים ממשיך לרוץ אחרי שתתקן אותו לשימוש במתודות.',
          ],
          starter: `#include <iostream>
using namespace std;

const double PI = 3.14159265358979;

class Circle
{
public:
    double radius;         // TODO: להעביר ל-private

    void print()
    {
        cout << "r=" << radius
             << " area=" << PI * radius * radius << endl;
    }
};

int main()
{
    Circle c;
    c.radius = 5;          // TODO: לשנות ל-setRadius
    c.print();

    c.radius = -3;         // ← זה מה שצריך להיחסם
    c.print();

    return 0;
}`,
          hints: [
            'התחל מלהוסיף `private:` לפני `radius` ו-`public:` לפני `print`. הרץ — תראה בדיוק אילו שורות ב-`main` נשברות. אלה השורות שהיו מסוכנות.',
            'שטח = `PI * radius * radius`, היקף = `2 * PI * radius`. שניהם מתודות שמחזירות `double`, בלי שדה מאחוריהן. אם תשמור אותם בשדות, תצטרך לזכור לעדכן אותם בכל שינוי רדיוס — וזה בדיוק סוג הבאג שאנחנו מונעים.',
            'ב-`print` השתמש ב-`getArea()` במקום לחשב מחדש. מקור אמת יחיד.',
          ],
          solution: `#include <iostream>
using namespace std;

const double PI = 3.14159265358979;

class Circle
{
private:
    double radius;

public:
    void setRadius(double r)
    {
        if (r > 0)
        {
            radius = r;
        }
        else
        {
            cout << "[Circle] rejected radius " << r
                 << ", using 1.0" << endl;
            radius = 1.0;
        }
    }

    double getRadius()        { return radius; }
    double getArea()          { return PI * radius * radius; }
    double getCircumference() { return 2 * PI * radius; }

    void print()
    {
        cout << "r=" << getRadius()
             << " area=" << getArea()
             << " circ=" << getCircumference() << endl;
    }
};

int main()
{
    Circle c;
    c.setRadius(5);
    c.print();

    c.setRadius(-3);       // נחסם
    c.print();

    return 0;
}`,
          expectedOutput: `r=5 area=78.5398 circ=31.4159
[Circle] rejected radius -3, using 1.0
r=1 area=3.14159 circ=6.28319`,
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's26',
      title: 'מתודות עזר פרטיות',
      subtitle: 'לא רק שדות יכולים להיות private',
      slides: [17, 23],
      blocks: [
        {
          kind: 'prose',
          md: 'עד עכשיו הפכנו **שדות** ל-`private`. אבל אפשר — ולפעמים חייבים — להפוך גם **מתודות** לפרטיות. מתודה פרטית היא כלי עבודה פנימי של המחלקה, שלא אמור לעניין אף אחד בחוץ.',
        },
        {
          kind: 'prose',
          md: 'דוגמה מהמצגת עצמה: במחלקת `Rational` (שנראה בפרק 6) יש מתודה `int gcd();` שמחשבת מחלק משותף מקסימלי. היא נמצאת ב-`private` — כי היא רק שלב ביניים בצמצום השבר, ואין שום סיבה שקוד חיצוני יקרא לה.',
        },
        {
          kind: 'code',
          title: 'מתודת עזר פרטית בפעולה',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Password
{
private:
    char text[64];
    int  length;

    // --- מתודות עזר פרטיות: כלי עבודה פנימיים ---
    bool hasDigit()
    {
        for (int i = 0; i < length; i++)
            if (text[i] >= '0' && text[i] <= '9')
                return true;
        return false;
    }

    bool hasUpper()
    {
        for (int i = 0; i < length; i++)
            if (text[i] >= 'A' && text[i] <= 'Z')
                return true;
        return false;
    }

    bool longEnough() { return length >= 8; }

public:
    void set(const char* s)
    {
        length = 0;
        while (s[length] != '\\0' && length < 63)
        {
            text[length] = s[length];
            length++;
        }
        text[length] = '\\0';
    }

    // המתודה הציבורית היחידה שמעניינת את העולם
    bool isStrong()
    {
        return longEnough() && hasDigit() && hasUpper();
    }

    void explain()
    {
        cout << "\\"" << text << "\\": ";
        if (!longEnough()) cout << "[too short] ";
        if (!hasDigit())   cout << "[no digit] ";
        if (!hasUpper())   cout << "[no uppercase] ";
        if (isStrong())    cout << "STRONG";
        cout << endl;
    }
};

int main()
{
    Password p;

    p.set("abc");            p.explain();
    p.set("abcdefgh");       p.explain();
    p.set("abcdefg1");       p.explain();
    p.set("Abcdefg1");       p.explain();

    // p.hasDigit();   ← לא יתקמפל. וזה בסדר גמור.

    return 0;
}`,
          annotations: [
            { line: 10, text: 'שלוש מתודות עזר — פרטיות. אף אחד בחוץ לא צריך אותן' },
            { line: 42, text: 'הממשק הציבורי: שאלה אחת ברורה' },
          ],
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'למה לא פשוט לעשות הכול public?',
          md: 'שלוש סיבות: (1) **ממשק קטן = קל להבין.** מי שמשתמש ב-`Password` צריך לדעת על שתי מתודות, לא חמש. (2) **חופש לשנות.** אם מחר תחליף את `hasDigit` באלגוריתם אחר או תמחק אותה — אף קוד חיצוני לא יישבר, כי אף אחד לא היה יכול לקרוא לה. (3) **מניעת שימוש שגוי.** `hasDigit` לבד לא אומרת כלום על חוזק הסיסמה; חשיפתה מזמינה שימוש מטעה.',
        },
        {
          kind: 'callout',
          variant: 'exam',
          title: 'שים לב לניסוח במצגת',
          md: 'המצגת כותבת: "מתודות יהיו בדרך כלל ציבוריות, ==פרט למתודות עזר==". זה בדיוק הכלל: הממשק ציבורי, כלי העבודה הפנימיים פרטיים.',
        },
        {
          kind: 'quiz',
          question: 'מחלקת `Matrix` מכילה מתודה `swapRows(int a, int b)` שמשמשת רק בתוך האלגוריתם `determinant()`. איפה כדאי להגדיר אותה?',
          options: [
            {
              text: '`private` — היא כלי עבודה פנימי',
              correct: true,
              explain:
                'נכון. אף משתמש חיצוני לא צריך להחליף שורות במטריצה כדי לקבל דטרמיננטה. חשיפתה רק מגדילה את הממשק ומקבעת פרט מימוש.',
            },
            {
              text: '`public` — אולי מישהו ירצה להשתמש בה',
              correct: false,
              explain:
                '"אולי מישהו ירצה" הוא הנימוק הכי גרוע לחשיפה. ברגע שחשפת — התחייבת. אם באמת יתעורר צורך, קל להעביר ל-`public` בהמשך.',
            },
            {
              text: 'מחוץ למחלקה, כפונקציה גלובלית',
              correct: false,
              explain:
                'אז היא תזדקק לגישה לשדות הפרטיים של המטריצה — מה שהיא לא תקבל. זה יאלץ אותך לחשוף את הנתונים, בדיוק ההפך ממה שרצינו.',
            },
            {
              text: '`protected` — למקרה שמישהו ירש',
              correct: false,
              explain:
                'זו בחירה סבירה **אם** מתכננים ירושה. אבל בלי צורך מוכח, `private` הוא ברירת המחדל הנכונה.',
            },
          ],
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's27',
      title: 'ההבדל בין class לבין struct',
      subtitle: 'הבדל אחד בלבד — וזה מופיע במבחן',
      slides: [18],
      blocks: [
        {
          kind: 'callout',
          variant: 'exam',
          title: 'התשובה, בשורה אחת',
          md: 'בשפת C++, `class` ו-`struct` הם ==זהים לחלוטין== בכך ששניהם מגדירים טיפוס חדש שמכיל שדות ומתודות. **ההבדל היחיד ביניהם הוא הרשאת ברירת המחדל**: ב-`class` — `private`; ב-`struct` — `public`.',
        },
        {
          kind: 'compare',
          title: 'שתי ההגדרות שקולות בדיוק',
          left: {
            title: 'class עם private מפורש',
            code: `class Rect
{
private:
    int length;
    int width;
public:
    void printArea();
    int  getLength();
    void setLength(int myLength);
};`,
            note: 'התווית `private:` מיותרת — זו כבר ברירת המחדל. אבל כותבים אותה כי היא מבהירה כוונה.',
            verdict: 'neutral',
          },
          right: {
            title: 'אותה מחלקה בלי התווית',
            code: `class Rect
{
    int length;      // private כברירת מחדל
    int width;       // private כברירת מחדל
public:
    void printArea();
    int  getLength();
    void setLength(int myLength);
};`,
            note: '**זהה לחלוטין** לגרסה משמאל. הקומפיילר מייצר בדיוק את אותו קוד.',
            verdict: 'neutral',
          },
        },
        {
          kind: 'compare',
          title: 'ואותו דבר עם struct',
          left: {
            title: 'struct עם public מפורש',
            code: `struct Rect
{
public:
    int length;
    int width;
public:
    void printArea();
    int  getLength();
};`,
            note: 'שתי התוויות `public:` מיותרות — זו ברירת המחדל ב-struct.',
            verdict: 'neutral',
          },
          right: {
            title: 'אותו struct בלי תוויות',
            code: `struct Rect
{
    int length;      // public כברירת מחדל
    int width;       // public כברירת מחדל

    void printArea();
    int  getLength();
};`,
            note: '**זהה לחלוטין**. וזה גם מסביר למה `struct` של C עובד ב-C++: כל שדותיו ציבוריים.',
            verdict: 'neutral',
          },
        },
        {
          kind: 'code',
          title: 'הוכחה: struct עם מתודות — חוקי לגמרי ב-C++',
          runnable: true,
          code: `#include <iostream>
using namespace std;

// struct עם מתודות, הרשאות ולידציה — הכל חוקי ב-C++
struct Point
{
private:                       // אפשר גם private ב-struct!
    int x;
    int y;

public:
    void set(int newX, int newY) { x = newX; y = newY; }
    void print() { cout << "(" << x << ", " << y << ")" << endl; }
    int  getX() { return x; }
};

// ואותו דבר בדיוק כ-class
class Point2
{
    int x;                     // private כברירת מחדל
    int y;

public:
    void set(int newX, int newY) { x = newX; y = newY; }
    void print() { cout << "(" << x << ", " << y << ")" << endl; }
    int  getX() { return x; }
};

int main()
{
    Point  a;  a.set(1, 2);  a.print();
    Point2 b;  b.set(3, 4);  b.print();

    cout << "sizeof(Point)  = " << sizeof(Point)  << endl;
    cout << "sizeof(Point2) = " << sizeof(Point2) << endl;

    return 0;
}`,
          caption: 'שני הטיפוסים זהים לחלוטין — גם בגודל וגם בהתנהגות.',
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'ומה עם C#?',
          md: 'המצגת מציינת שב-**C#** ההבדל בין `class` ל-`struct` הוא ==מהותי יותר==: שם `struct` הוא **טיפוס ערך** (value type) שיושב על המחסנית, ו-`class` הוא **טיפוס הפניה** (reference type) שיושב על הערימה. זה הבדל בסמנטיקה, לא רק בהרשאות. במצגת מצוין שנרחיב על כך בקורס "מיני פרויקט במערכות חלונות". ==ב-C++ אין הבדל כזה== — שני הטיפוסים מתנהגים אותו דבר לחלוטין.',
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'מה נהוג בפועל',
          md: 'למרות שאין הבדל טכני, יש **מוסכמה** בקהילת C++: משתמשים ב-`struct` לאוסף נתונים פשוט וחשוף (נקודה, צבע, זוג ערכים), וב-`class` לכל דבר שיש לו התנהגות והגנה. זה עוזר לקורא לדעת למה לצפות עוד לפני שהוא קורא את התוכן.',
        },
        {
          kind: 'quiz',
          question: 'מה יקרה בקוד הבא?',
          code: `struct A { int x; };
class  B { int x; };

int main()
{
    A a;  a.x = 5;      // שורה 1
    B b;  b.x = 5;      // שורה 2
}`,
          options: [
            {
              text: 'שורה 1 עוברת, שורה 2 לא מתקמפלת',
              correct: true,
              explain:
                'בדיוק. ב-`struct` ברירת המחדל היא `public` ולכן `a.x` נגיש. ב-`class` ברירת המחדל היא `private` ולכן `b.x` נחסם: `error: int B::x is private within this context`.',
            },
            { text: 'שתיהן עוברות', correct: false, explain: 'ב-`class` השדה פרטי כברירת מחדל.' },
            { text: 'אף אחת לא עוברת', correct: false, explain: 'ב-`struct` השדה ציבורי כברירת מחדל, ולכן שורה 1 תקינה.' },
            {
              text: 'שורה 2 עוברת, שורה 1 לא',
              correct: false,
              explain: 'זה בדיוק הפוך. `struct` = public כברירת מחדל, `class` = private.',
            },
          ],
        },
      ],
    },
  ],
};

import type { Chapter } from '../../types/content';

export const ch11Student: Chapter = {
  id: 'ch11',
  title: 'תרגול מסכם',
  sections: [
    /* ============================================================ */
    {
      id: 's56',
      title: 'תרגול כיתה 1 — מחלקת Student',
      subtitle: 'התרגיל של השיעור. קודם נתכנן, ואז נכתוב.',
      slides: [36],
      blocks: [
        {
          kind: 'prose',
          md: 'השקף האחרון במצגת מציג את תרגול הכיתה: **הגדרת מחלקת `Student`**. לפני שקופצים לקוד, נעשה מה שהעמוד הראשון בפרק 7 המליץ — **נתכנן**.',
        },
        {
          kind: 'heading',
          level: 3,
          text: 'שאלה 1: אילו נתונים מתארים סטודנט?',
        },
        {
          kind: 'table',
          headers: ['הנתון', 'טיפוס', 'למה זה'],
          rows: [
            ['תעודת זהות', '`int`', 'מזהה ייחודי. נקבע פעם אחת ולא משתנה.'],
            ['שם', '`char[50]`', 'מחרוזת בסגנון C — עדיין לא למדנו `string` (שיעור 4).'],
            ['ממוצע', '`float`', 'ערך **מחושב** — לא ראוי לקבל `setter` ישיר.'],
            ['שנת לימודים', '`int`', 'בין 1 ל-4. נדרשת ולידציה.'],
          ],
        },
        {
          kind: 'heading',
          level: 3,
          text: 'שאלה 2: מה סטודנט יודע לעשות?',
        },
        {
          kind: 'list',
          items: [
            '`init` — לאתחל את כל השדות (הפתרון הזמני עד שנלמד בנאי בשיעור 2).',
            '`setName`, `getName` — לקרוא ולשנות שם.',
            '`getId` — לקרוא ת"ז. **בלי** `setId` — ת"ז לא משתנה.',
            '`setYear` — עם ולידציה של 1–4.',
            '`addGrade` — להוסיף ציון. **זו הדרך היחידה** שהממוצע משתנה.',
            '`getAverage` — לקרוא את הממוצע.',
            '`isPassing` — האם הממוצע ≥ 60. ערך מחושב.',
            '`print` — להדפיס את כל הפרטים.',
          ],
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'ההחלטה החשובה בתכנון',
          md: '**אין `setAverage`.** הממוצע הוא תוצאה של הציונים, לא נתון עצמאי. אם היה `setAverage`, מישהו היה יכול לכתוב `s.setAverage(100)` בלי אף ציון, והאובייקט היה משקר. ==זה בדיוק מה שהפרק על getter/setter דיבר עליו.==',
        },
        {
          kind: 'heading',
          level: 3,
          text: 'שאלה 3: מה פרטי ומה ציבורי?',
        },
        {
          kind: 'code',
          runnable: true,
          title: 'תוצאת התכנון — Student.h',
          lang: 'cpp',
          code: `#pragma once
#include <iostream>
using namespace std;

class Student
{
private:
    int   id;
    char  name[50];
    float average;
    int   year;

    // שדות פנימיים לגמרי — משרתים את חישוב הממוצע
    int   gradeCount;
    float gradeSum;

    // מתודת עזר פרטית
    void recalcAverage();

public:
    void init(int studentId, const char* studentName, int studentYear);

    int   getId();
    void  setName(const char* newName);
    void  getName(char* buffer);
    void  setYear(int newYear);
    int   getYear();

    void  addGrade(float grade);
    float getAverage();
    bool  isPassing();

    void  print();
};`,
          annotations: [
            { line: 14, text: 'שני שדות שאף אחד בחוץ לא צריך לדעת עליהם' },
            { line: 18, text: 'מתודת עזר — פרטית, כמו gcd במחלקת Rational' },
            { line: 25, text: 'אין setId — ת"ז נקבעת רק ב-init' },
            { line: 31, text: 'אין setAverage — הממוצע נגזר מהציונים' },
          ],
        },
        {
          kind: 'callout',
          variant: 'crefresh',
          title: 'רענון מ-C — מחרוזות',
          md: 'עדיין אין לנו `string`, ולכן שם הוא `char name[50]` — מערך תווים שמסתיים ב-`\\0`. להעתקה משתמשים ב-`strcpy` מ-`<cstring>`, ולאורך ב-`strlen`. ==שים לב: אי אפשר לכתוב `name = newName;` על מערך== — צריך להעתיק תו-תו או להשתמש ב-`strcpy`.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's57',
      title: 'Student — בנייה מודרכת',
      subtitle: 'התרגיל הראשי של השיעור. פתח בעורך והתחל.',
      slides: [36],
      blocks: [
        {
          kind: 'exercise',
          id: 'ex-student-main',
          title: 'בנה את מחלקת Student',
          level: 3,
          brief:
            'זהו התרגיל המסכם של השיעור. הוא משלב **הכול**: שדות פרטיים, ולידציה, מתודות עזר, ערכים מחושבים ומחרוזות בסגנון C. קח את הזמן, השתמש ברמזים אחד-אחד, ונסה לא להציץ בפתרון.',
          requirements: [
            '`init(int id, const char* name, int year)` — מאתחל את **כל** השדות, כולל `gradeCount = 0` ו-`gradeSum = 0`. השתמש ב-`setName` וב-`setYear` כדי לא לשכפל את הולידציה.',
            '`setName(const char* newName)` — מעתיק את השם. ==אל תחרוג מ-49 תווים + `\\0`.==',
            '`getName(char* buffer)` — מעתיק את השם אל תוך המאגר שהתקבל.',
            '`setYear(int y)` — מקבל רק 1–4. ערך אחר → 1, עם הודעה.',
            '`addGrade(float g)` — מקבל רק 0–100. מעדכן את `gradeSum` ו-`gradeCount`, ואז קורא ל-`recalcAverage()`.',
            '`recalcAverage()` — **פרטית**. מחשבת `average = gradeSum / gradeCount`. ==זהירות מחלוקה באפס.==',
            '`isPassing()` — מחזירה האם הממוצע ≥ 60.',
            '`print()` — מדפיסה את כל הפרטים בפורמט שמופיע בפלט הצפוי.',
          ],
          starter: `#include <iostream>
#include <cstring>
using namespace std;

class Student
{
private:
    int   id;
    char  name[50];
    float average;
    int   year;
    int   gradeCount;
    float gradeSum;

    void recalcAverage()
    {
        // TODO: לחשב את הממוצע. זהירות מחלוקה באפס!
    }

public:
    void init(int studentId, const char* studentName, int studentYear)
    {
        id = studentId;
        // TODO: לאתחל את שאר השדות
    }

    int getId() { return id; }

    void setName(const char* newName)
    {
        // TODO: להעתיק בבטחה, עד 49 תווים
    }

    void getName(char* buffer)
    {
        // TODO: להעתיק את השם אל buffer
    }

    void setYear(int newYear)
    {
        // TODO: ולידציה 1-4
    }

    int getYear() { return year; }

    void addGrade(float grade)
    {
        // TODO: ולידציה 0-100, עדכון סכום וספירה, וחישוב מחדש
    }

    float getAverage() { return average; }

    bool isPassing()
    {
        // TODO
        return false;
    }

    void print()
    {
        // TODO: להדפיס לפי הפורמט בפלט הצפוי
    }
};

int main()
{
    Student s;
    s.init(324567, "Yossi Cohen", 2);

    s.addGrade(90);
    s.addGrade(75);
    s.addGrade(88);
    s.print();

    cout << "--- invalid input ---" << endl;
    s.addGrade(150);
    s.setYear(9);
    s.print();

    Student weak;
    weak.init(111222, "Dana Levi", 1);
    weak.addGrade(45);
    weak.addGrade(52);
    weak.print();

    return 0;
}`,
          hints: [
            'התחל מ-`recalcAverage`. שורה אחת של הגנה ואז החישוב: `if (gradeCount == 0) { average = 0; return; } average = gradeSum / gradeCount;`',
            'ל-`setName`: `strncpy(name, newName, 49); name[49] = \'\\0\';` — ה-`strncpy` לא תמיד מוסיף `\\0` בעצמו, ולכן השורה השנייה חשובה. אפשר גם ידנית בלולאה.',
            'ב-`init`, אל תשכפל את הולידציה — קרא ל-`setName(studentName)` ול-`setYear(studentYear)`. **סדר חשוב:** אפס את `gradeCount` ו-`gradeSum` לפני שאתה קורא ל-`recalcAverage`, אחרת תחשב על זבל.',
            'ב-`addGrade`, שים לב לסדר: (1) בדוק תקינות, (2) `gradeSum += grade; gradeCount++;`, (3) `recalcAverage();`. אם תקרא ל-`recalcAverage` לפני העדכון — תקבל את הממוצע הישן.',
            'ל-`print`, המבנה הוא: שורת כותרת עם קווים, ואז שורה לכל שדה. השתמש בפלט הצפוי כדי להתאים בדיוק את הרווחים והטקסט.',
          ],
          solution: `#include <iostream>
#include <cstring>
using namespace std;

class Student
{
private:
    int   id;
    char  name[50];
    float average;
    int   year;
    int   gradeCount;
    float gradeSum;

    void recalcAverage()
    {
        if (gradeCount == 0)
        {
            average = 0;
            return;
        }
        average = gradeSum / gradeCount;
    }

public:
    void init(int studentId, const char* studentName, int studentYear)
    {
        id         = studentId;
        gradeCount = 0;
        gradeSum   = 0;
        average    = 0;
        setName(studentName);
        setYear(studentYear);
    }

    int getId() { return id; }

    void setName(const char* newName)
    {
        int i = 0;
        while (newName[i] != '\\0' && i < 49)
        {
            name[i] = newName[i];
            i++;
        }
        name[i] = '\\0';
    }

    void getName(char* buffer)
    {
        strcpy(buffer, name);
    }

    void setYear(int newYear)
    {
        if (newYear >= 1 && newYear <= 4)
        {
            year = newYear;
        }
        else
        {
            cout << "[Student] invalid year " << newYear << ", using 1" << endl;
            year = 1;
        }
    }

    int getYear() { return year; }

    void addGrade(float grade)
    {
        if (grade < 0 || grade > 100)
        {
            cout << "[Student] invalid grade " << grade << ", ignored" << endl;
            return;
        }
        gradeSum += grade;
        gradeCount++;
        recalcAverage();
    }

    float getAverage() { return average; }

    bool isPassing() { return average >= 60; }

    void print()
    {
        cout << "-----------------------------" << endl;
        cout << "ID:      " << id      << endl;
        cout << "Name:    " << name    << endl;
        cout << "Year:    " << year    << endl;
        cout << "Grades:  " << gradeCount << endl;
        cout << "Average: " << average << endl;
        cout << "Status:  " << (isPassing() ? "PASSING" : "FAILING") << endl;
        cout << "-----------------------------" << endl;
    }
};

int main()
{
    Student s;
    s.init(324567, "Yossi Cohen", 2);

    s.addGrade(90);
    s.addGrade(75);
    s.addGrade(88);
    s.print();

    cout << "--- invalid input ---" << endl;
    s.addGrade(150);
    s.setYear(9);
    s.print();

    Student weak;
    weak.init(111222, "Dana Levi", 1);
    weak.addGrade(45);
    weak.addGrade(52);
    weak.print();

    return 0;
}`,
          expectedOutput: `-----------------------------
ID:      324567
Name:    Yossi Cohen
Year:    2
Grades:  3
Average: 84.3333
Status:  PASSING
-----------------------------
--- invalid input ---
[Student] invalid grade 150, ignored
[Student] invalid year 9, using 1
-----------------------------
ID:      324567
Name:    Yossi Cohen
Year:    1
Grades:  3
Average: 84.3333
Status:  PASSING
-----------------------------
-----------------------------
ID:      111222
Name:    Dana Levi
Year:    1
Grades:  2
Average: 48.5
Status:  FAILING
-----------------------------`,
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's58',
      title: 'Student — הפתרון, מנותח',
      subtitle: 'ארבע החלטות תכנון ששווה לשים לב אליהן',
      slides: [36],
      blocks: [
        {
          kind: 'prose',
          md: 'הפתרון עצמו נמצא בתרגיל בעמוד הקודם. כאן נעצור על ארבע החלטות שהופכות את המחלקה מ"עובדת" ל"נכונה".',
        },
        {
          kind: 'heading',
          level: 3,
          text: '1. `init` קוראת ל-setters במקום להציב ישירות',
        },
        {
          kind: 'compare',
          left: {
            title: 'שכפול ולידציה',
            code: `void init(int i, const char* n, int y)
{
    id = i;
    strcpy(name, n);
    if (y >= 1 && y <= 4)   // שכפול!
        year = y;
    else
        year = 1;
}`,
            note: 'הולידציה מופיעה גם כאן וגם ב-`setYear`. אם מחר נשנה ל-1–5, נצטרך לזכור שני מקומות.',
            verdict: 'bad',
          },
          right: {
            title: 'מקור אמת יחיד',
            code: `void init(int i, const char* n, int y)
{
    id = i;
    gradeCount = 0;
    gradeSum = 0;
    average = 0;
    setName(n);
    setYear(y);        // ← ולידציה במקום אחד
}`,
            note: 'הולידציה חיה ב-`setYear` בלבד. שינוי אחד מספיק.',
            verdict: 'good',
          },
        },
        {
          kind: 'heading',
          level: 3,
          text: '2. `gradeSum` ו-`gradeCount` פרטיים לגמרי',
        },
        {
          kind: 'prose',
          md: 'לשני השדות האלה **אין `getter` ואין `setter`**. הם לא חלק מהמודל של "סטודנט" — הם פרט מימוש של איך אנחנו מחשבים ממוצע. אילו מחר היינו מחליטים לשמור מערך של כל הציונים במקום סכום, ==אף שורת קוד מחוץ למחלקה לא הייתה משתנה==.',
        },
        {
          kind: 'heading',
          level: 3,
          text: '3. `recalcAverage` היא מתודת עזר פרטית',
        },
        {
          kind: 'prose',
          md: 'אין שום סיבה שקוד חיצוני יקרא לה. יתרה מזו — אילו הייתה ציבורית, מישהו היה יכול לשכוח לקרוא לה, או לקרוא לה בזמן הלא נכון. ==בגלל שהיא פרטית ו-`addGrade` קוראת לה תמיד, הממוצע **תמיד** מסונכרן עם הציונים.== זו אינווריאנטה.',
        },
        {
          kind: 'heading',
          level: 3,
          text: '4. `setName` מגבילה ל-49 תווים',
        },
        {
          kind: 'pitfall',
          title: 'מה היה קורה בלי ההגבלה',
          badCode: `void setName(const char* newName)
{
    strcpy(name, newName);     // ✕ בלי הגבלה!
}

// ואז:
s.setName("aaaaaaaaaa...");   // 200 תווים`,
          error: `*** buffer overflow detected ***: terminated
Aborted (core dumped)

// או גרוע יותר: התוכנית ממשיכה לרוץ,
// אבל דרסה את השדות שאחרי name בזיכרון.`,
          explain:
            '`strcpy` מעתיקה עד שהיא פוגשת `\\0`, בלי לבדוק כמה מקום יש ביעד. אם השם ארוך מ-50 תווים, היא תכתוב **מעבר לגבול המערך** — ותדרוס את `average`, `year`, ואולי גם נתונים של אובייקטים אחרים. זו **גלישת חוצץ** (buffer overflow), אחת הפרצות הנפוצות ביותר באבטחת מידע.',
          goodCode: `void setName(const char* newName)
{
    int i = 0;
    while (newName[i] != '\\0' && i < 49)
    {
        name[i] = newName[i];
        i++;
    }
    name[i] = '\\0';        // תמיד מסיימים כראוי
}`,
          goodNote:
            'הלולאה עוצרת בשני תנאים: סוף המחרוזת **או** הגעה למקום ה-49. השורה האחרונה מבטיחה סיום תקין בכל מקרה.',
        },
        {
          kind: 'callout',
          variant: 'modern',
          title: 'בשיעור 4 זה ייעלם',
          md: 'כל הכאב הזה עם `char[50]` נעלם ברגע שעוברים ל-`std::string`: `string name;` ואז פשוט `name = newName;`. אין גבול קבוע, אין גלישה, אין `strcpy`. ==אבל חשוב לעבור דרך הגרסה הידנית== — בשיעור 3 תבנה מחלקה שמנהלת מערך דינמי בעצמה, ובלי להבין את זה אי אפשר.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's59',
      title: 'חידון סיכום השיעור',
      subtitle: 'עשר שאלות על כל מה שלמדנו',
      blocks: [
        {
          kind: 'prose',
          md: 'ענה על כולן לפני שאתה מגלה. אם טעית ביותר משתיים — שווה לחזור על הפרק הרלוונטי.',
        },
        {
          kind: 'quiz',
          question: '1. מה ההבדל **היחיד** בין `class` ל-`struct` ב-C++?',
          options: [
            { text: 'הרשאת ברירת המחדל: `private` ב-class, `public` ב-struct', correct: true, explain: 'נכון. בכל דבר אחר הם זהים לחלוטין.' },
            { text: '`struct` לא יכול להכיל מתודות', correct: false, explain: 'ב-C++ הוא בהחלט יכול. זה נכון רק ב-C.' },
            { text: '`class` יושב על ה-heap, `struct` על ה-stack', correct: false, explain: 'זה נכון ב-C#, לא ב-C++.' },
            { text: '`struct` לא תומך בירושה', correct: false, explain: 'ב-C++ שניהם תומכים בירושה באופן זהה.' },
          ],
        },
        {
          kind: 'quiz',
          question: '2. הצהרת מתודה ב-`.h`, קראת לה ב-`main`, ולא מימשת אותה. איזו שגיאה?',
          options: [
            { text: 'שגיאת לינקר — `undefined reference`', correct: true, explain: 'המהדר האמין להצהרה וקימפל בשמחה. רק המקשר, שרואה את כל הקבצים, גילה שאין מימוש.' },
            { text: 'שגיאת קומפילציה', correct: false, explain: 'כל קובץ מתקמפל בנפרד. `main.cpp` רק ראה את ההצהרה וזה הספיק לו.' },
            { text: 'שגיאת זמן ריצה', correct: false, explain: 'לא מגיעים לזמן ריצה — הקישור נכשל ואין קובץ הרצה.' },
            { text: 'אזהרה בלבד', correct: false, explain: 'זו שגיאה קשה. אין קובץ הרצה.' },
          ],
        },
        {
          kind: 'quiz',
          question: '3. מה יודפס?',
          code: `class A
{
private:
    int x;
public:
    void setX(int x) { x = x; }
    int  getX()      { return x; }
};

A a;
a.setX(7);
cout << a.getX();`,
          options: [
            { text: 'ערך זבל', correct: true, explain: '`x = x` בתוך `setX` הוא השמה עצמית של **הפרמטר** — הוא מסתיר את השדה. השדה נשאר לא מאותחל. התיקון: `this->x = x;`.' },
            { text: '7', correct: false, explain: 'זו הטעות. השם `x` בתוך המתודה מתייחס לפרמטר, לא לשדה.' },
            { text: '0', correct: false, explain: 'שדות אינם מאותחלים לאפס ב-C++.' },
            { text: 'שגיאת קומפילציה', correct: false, explain: 'הקוד מתקמפל — לכל היותר אזהרה. זו בדיוק הבעיה.' },
          ],
        },
        {
          kind: 'quiz',
          question: '4. מתודה של `Box` מקבלת `Box other` ומנסה לגשת ל-`other.privateField`. חוקי?',
          options: [
            { text: 'כן — הרשאות הן ברמת המחלקה, לא ברמת האובייקט', correct: true, explain: 'מתודה של המחלקה רואה את השדות הפרטיים של **כל** אובייקט מאותה מחלקה.' },
            { text: 'לא — `private` חוסם גם בין אובייקטים', correct: false, explain: 'טעות נפוצה. `private` חוסם רק גישה **מחוץ** למחלקה.' },
            { text: 'רק עם `friend`', correct: false, explain: '`friend` נחוץ לפונקציה חיצונית, לא למתודה של המחלקה עצמה.' },
            { text: 'רק אם `other` מועבר בהפניה', correct: false, explain: 'צורת ההעברה לא רלוונטית להרשאות.' },
          ],
        },
        {
          kind: 'quiz',
          question: '5. `#define MAX 10;` (עם נקודה-פסיק) — מה הבעיה?',
          options: [
            {
              text: 'הנקודה-פסיק היא חלק מההחלפה ותיכנס לכל מקום שבו נשתמש ב-MAX',
              correct: true,
              explain: '`int arr[MAX];` הופך ל-`int arr[10;];` — שגיאת תחביר בשורה שנראית תקינה.',
            },
            { text: 'אין בעיה', correct: false, explain: 'יש. הקדם-מעבד מעתיק את כל הטקסט אחרי השם, כולל ה-`;`.' },
            { text: '`#define` לא מקבל מספרים', correct: false, explain: 'הוא מקבל כל טקסט. הבעיה היא ה-`;` העודף.' },
            { text: 'צריך `=` בין השם לערך', correct: false, explain: '`#define NAME value` — בלי `=`. זה לא השמה אלא החלפה טקסטואלית.' },
          ],
        },
        {
          kind: 'quiz',
          question: '6. מה נכון לגבי `sizeof` של מחלקה עם 2 שדות `int` ו-10 מתודות?',
          options: [
            { text: 'בערך 8 — המתודות לא נספרות', correct: true, explain: 'קוד המתודות קיים פעם אחת בזיכרון התוכנית ומשותף לכל האובייקטים. רק הנתונים מוכפלים.' },
            { text: 'בערך 8 + גודל 10 המתודות', correct: false, explain: 'מתודות לא יושבות בתוך האובייקט.' },
            { text: '0 — מחלקה היא רק הגדרה', correct: false, explain: '`sizeof` מחזיר את גודל **מופע**, ולמופע יש שדות.' },
            { text: 'תלוי בכמה אובייקטים יצרנו', correct: false, explain: '`sizeof` נקבע בזמן קומפילציה ולא תלוי בכמות המופעים.' },
          ],
        },
        {
          kind: 'quiz',
          question: '7. מה קורה בלי include guards, כשקובץ `.h` מוכלל פעמיים באותה יחידת תרגום?',
          options: [
            { text: 'שגיאת קומפילציה — `redefinition of class`', correct: true, explain: 'הפרת ה-One Definition Rule. הקדם-מעבד מדביק את התוכן פעמיים והמהדר רואה שתי הגדרות.' },
            { text: 'שגיאת לינקר', correct: false, explain: 'הכפילות בתוך אותה יחידת תרגום — המהדר תופס אותה לפני המקשר.' },
            { text: 'הקומפיילר מזהה כפילות ומתעלם', correct: false, explain: 'הוא לא משווה תוכן. הוא רואה `class X` פעמיים ועוצר.' },
            { text: 'תמיד קורסת בזמן ריצה', correct: false, explain: 'לא מגיעים לזמן ריצה.' },
          ],
        },
        {
          kind: 'quiz',
          question: '8. איזה קוד יוצר **דליפת זיכרון**?',
          code: `void f1() { Rect r; r.setSize(1,2); }

void f2() { Rect* p = new Rect; p->setSize(1,2); }

void f3() { Rect* p = new Rect; delete p; }`,
          options: [
            { text: '`f2` בלבד', correct: true, explain: '`f2` מקצה ב-heap ולא משחררת. כשהפונקציה מסתיימת, המצביע `p` נעלם ואיתו הדרך היחידה להגיע לזיכרון. `f1` על ה-stack (משוחרר אוטומטית), `f3` משחררת כראוי.' },
            { text: '`f1` ו-`f2`', correct: false, explain: '`f1` על ה-stack — משוחרר אוטומטית בסוף הבלוק.' },
            { text: '`f3` בלבד', correct: false, explain: '`f3` עושה בדיוק את הדבר הנכון.' },
            { text: 'אף אחד', correct: false, explain: 'ב-`f2` הזיכרון אבד לתמיד.' },
          ],
        },
        {
          kind: 'quiz',
          question: '9. מה ההבדל בין הפשטת נתונים להפשטת בקרה?',
          options: [
            {
              text: 'נתונים = מסתירים מה שמור בפנים; בקרה = מסתירים איך זה עובד',
              correct: true,
              explain: 'הפשטת נתונים = `private` על השדות. הפשטת בקרה = פיצול ל-`.h`/`.cpp`.',
            },
            { text: 'הפשטת נתונים למשתנים, הפשטת בקרה ללולאות', correct: false, explain: 'הפשטת בקרה לא עוסקת בלולאות אלא בהסתרת המימוש של מתודות.' },
            { text: 'אין הבדל — שני שמות לאותו דבר', correct: false, explain: 'שניהם חלקים של כימוס, אבל מסתירים דברים שונים.' },
            { text: 'הפשטת בקרה היא ירושה', correct: false, explain: 'ירושה היא נושא אחר לגמרי, שיעור 9.' },
          ],
        },
        {
          kind: 'quiz',
          question: '10. איפה צריך `Rect::` ואיפה לא?',
          multi: true,
          options: [
            { text: 'במימוש מתודה **מחוץ** למחלקה — **צריך**', correct: true, explain: '`void Rect::printArea() { ... }` — בלעדיו זו פונקציה גלובלית.' },
            { text: 'במימוש **בתוך** המחלקה — **לא צריך**', correct: false, explain: 'נכון שלא צריך — אבל הסימון כאן מבקש את המקומות שבהם **כן** צריך.' },
            { text: 'בקריאה למתודה מ-`main` — **לא צריך**', correct: false, explain: 'נכון שלא — שם משתמשים ב-`r.printArea()`. אבל שוב, לא זה מה שמסומן.' },
            { text: 'בגישה לשדה `static` של המחלקה מבחוץ — **צריך**', correct: true, explain: '`Rect::MAX_SIZE` — כן. (שדות `static` הם נושא שיעור 7, אבל התחביר זהה.)' },
          ],
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's60',
      title: 'גיליון עזר — שיעור 1',
      subtitle: 'כל התחביר של השיעור בעמוד אחד. שמור אותו.',
      blocks: [
        {
          kind: 'code',
          title: 'כל התחביר של השיעור',
          lang: 'cpp',
          code: `// ==================== הגדרת מחלקה ====================
class Rect                       // אות גדולה!
{
private:                         // ברירת מחדל ב-class
    int length;
    int width;
    int helper();                // מתודת עזר פרטית

protected:                       // נגיש גם ליורשות (שיעור 9)
    int protectedField;

public:                          // הממשק
    void setLength(int myLength);            // הצהרה
    int  getLength() { return length; }      // מימוש inline
};                               // ← ; חובה!

// ==================== מימוש מחוץ למחלקה ====================
void Rect::setLength(int myLength)     // Rect:: חובה!
{
    if (myLength > 0) length = myLength;
    else              length = 5;
}

// ==================== יצירת אובייקטים ====================
Rect r1;                         // על ה-STACK — משוחרר אוטומטית
r1.setLength(5);                 // נקודה

Rect* p = new Rect;              // על ה-HEAP
p->setLength(5);                 // חץ
delete p;                        // חובה!
p = nullptr;                     // הרגל טוב

// ==================== this ====================
void setX(int x)
{
    this->x = x;                 // כשהפרמטר והשדה חולקים שם
}
Rect& grow() { length++; return *this; }   // להחזרת האובייקט

// ==================== שלושה קבצים ====================
// Rect.h    → #pragma once + class Rect { ... };
// Rect.cpp  → #include "Rect.h" + void Rect::foo() { ... }
// main.cpp  → #include "Rect.h" + int main() { ... }

// ==================== קדם-מעבד ====================
#include <iostream>              // ספריות מערכת
#include "Rect.h"                // הקבצים שלך

#pragma once                     // הגנה מהכללה מרובה — אפשרות 1

#ifndef RECT_H                   // אפשרות 2
#define RECT_H
// ... תוכן הקובץ ...
#endif

#define MAX 100                  // ללא ; !
const int COUNT = 100;           // מועדף — יש טיפוס וכתובת`,
        },
        {
          kind: 'table',
          title: 'טבלת החלטות מהירה',
          headers: ['השאלה', 'התשובה'],
          rows: [
            ['אובייקט או מצביע?', 'אובייקט → `.` · מצביע → `->`'],
            ['`new` בלי `delete`?', 'דליפת זיכרון'],
            ['שדה — `public` או `private`?', '`private` כברירת מחדל, תמיד'],
            ['מתודה קצרה או ארוכה?', 'קצרה → בתוך המחלקה · ארוכה → מחוץ עם `::`'],
            ['`get` ו-`set` לכל שדה?', 'לא. רק מה שבאמת צריך להיחשף'],
            ['ערך מחושב — שדה או מתודה?', 'מתודה. אל תשמור מה שאפשר לחשב'],
            ['`#define` או `const`?', '`const`, כמעט תמיד'],
            ['`redefinition of class`?', 'חסרות include guards'],
            ['`undefined reference`?', 'חסר מימוש — שגיאת לינקר'],
            ['`was not declared in this scope`?', 'שגיאת כתיב · `#include` חסר · `ClassName::` חסר'],
          ],
        },
        {
          kind: 'callout',
          variant: 'exam',
          title: 'עשר הנקודות שהכי נשאלות',
          md: '1. `class` מול `struct` — ברירת מחדל של הרשאות.\n2. שגיאת קומפילציה מול שגיאת לינקר.\n3. מה קורה בלי include guards.\n4. מתי בדיוק צריך `ClassName::`.\n5. הפרמטר `this` הנסתר.\n6. `.` מול `->`.\n7. `#define` מול `const`.\n8. מתודה שניגשת לשדה פרטי של אובייקט אחר — חוקי.\n9. הפשטת נתונים מול הפשטת בקרה.\n10. מתודות לא תופסות מקום ב-`sizeof` של האובייקט.',
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'מה בשיעור הבא',
          md: 'בכל השיעור הזה נתקלנו שוב ושוב באותה בעיה: **אובייקט שנוצר עם ערכי זבל**. הוספנו `init()` וקראנו לה ידנית — אבל מה אם שוכחים? **שיעור 2 — בנאים** פותר את זה סופית: מנגנון שהשפה עצמה קוראת לו אוטומטית ברגע יצירת האובייקט, בלי שאפשר לשכוח.',
        },
        {
          kind: 'callout',
          variant: 'tip',
          title: 'לפני שאתה עובר הלאה',
          md: 'אם יש נושא שעדיין לא ברור — ==לחץ על ✦ ליד הקטע הרלוונטי ושאל==. העוזר רואה את העמוד ויכול להסביר אחרת, לתת דוגמה נוספת, או לבנות לך תרגיל ממוקד.',
        },
      ],
    },
  ],
};

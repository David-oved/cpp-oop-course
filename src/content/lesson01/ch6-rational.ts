import type { Chapter } from '../../types/content';

const RATIONAL_H = `//Rational.h
#pragma once
#include <iostream>
using namespace std;

class Rational
{
private:
    int numerator;
    int denominator;
    int gcd();                    // מתודת עזר — פרטית

public:
    void setNumerator(int x);
    void setDenominator(int y);
    int  getNumerator();
    int  getDenominator();
    void print();
    void multiply(Rational num);  // מקבלת עצם מאותה מחלקה
    void reduce();
};`;

export const ch6Rational: Chapter = {
  id: 'ch6',
  title: 'אינטראקציה בין אובייקטים',
  sections: [
    /* ============================================================ */
    {
      id: 's33',
      title: 'מה עוד אפשר לעשות',
      subtitle: 'ארבע יכולות שנציג בפרק הזה',
      slides: [22],
      blocks: [
        {
          kind: 'prose',
          md: 'עד עכשיו כל מחלקה חיה בעולם משלה. עכשיו נראה מה קורה כשעצמים **מדברים זה עם זה**. המצגת מונה ארבע יכולות:',
        },
        {
          kind: 'list',
          ordered: true,
          items: [
            '**מתודה יכולה לקבל כפרמטר עצם ממחלקה אחרת** — ובפרט של אותה מחלקה עצמה.',
            '**בתוך המחלקה, מותר למתודה אחת לזמן מתודה אחרת** של אותה מחלקה. (כבר ראינו את זה בפרק 2.)',
            '**ניתן ליצור עצם חדש בתוך מתודה** — מטיפוס אותה מחלקה או ממחלקה אחרת.',
            '**ניתן ליצור מתודה שמחזירה עצם.**',
          ],
        },
        {
          kind: 'prose',
          md: 'הדוגמה שמלווה את הפרק היא **מחלקת שבר רציונלי** — `Rational`. זו דוגמה מצוינת כי שבר הוא בדיוק סוג הדבר שמתאים למחלקה: שני נתונים שקשורים זה לזה (מונה ומכנה), עם כללי תקינות (המכנה לא יכול להיות אפס) ועם פעולות טבעיות (כפל, צמצום, הדפסה).',
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'למה שבר הוא דוגמה טובה',
          md: 'נסה לחשוב איך היית מייצג שבר בלי מחלקה: שני משתני `int` נפרדים, `num1` ו-`den1`, ופונקציות שמקבלות ארבעה פרמטרים. עכשיו נסה עם שני שברים — שמונה משתנים. ==זו בדיוק הנקודה שבה מחלקה מפסיקה להיות "יופי אקדמי" ומתחילה להיות הכרח מעשי.==',
        },
        {
          kind: 'code',
          runnable: true,
          title: 'Rational.h — הממשק המלא',
          lang: 'cpp',
          code: RATIONAL_H,
          annotations: [
            { line: 9, text: 'שני שדות פרטיים — מונה ומכנה' },
            { line: 11, text: 'gcd פרטית! היא רק כלי עזר של reduce' },
            { line: 20, text: 'multiply מקבלת Rational — עצם מאותה מחלקה' },
          ],
        },
        {
          kind: 'callout',
          variant: 'exam',
          title: 'שים לב איפה `gcd` יושבת',
          md: 'המתודה `int gcd();` נמצאת בחלק ה-`private`. זו החלטת תכנון: היא כלי עזר שמשמש רק את `reduce`, ואין שום סיבה שקוד חיצוני יקרא לה. אם היא הייתה `public`, היינו מתחייבים אליה לנצח. ==זו דוגמה קלאסית ל"מתודת עזר" שהוזכרה בפרק 4.==',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's34',
      title: 'Rational — השימוש',
      subtitle: 'main.cpp והפלט הצפוי',
      slides: [23],
      blocks: [
        {
          kind: 'prose',
          md: 'לפני שנראה את המימוש, נסתכל על איך המחלקה **נראית מבחוץ**. זו הדרך הנכונה לקרוא מחלקה חדשה: קודם הממשק והשימוש, ורק אחר כך המימוש.',
        },
        {
          kind: 'code',
          runnable: true,
          prelude: `class Rational
{
private:
    int numerator;
    int denominator;
    int gcd();

public:
    void setNumerator(int x);
    void setDenominator(int y);
    int  getNumerator();
    int  getDenominator();
    void print();
    void multiply(Rational num);
    void reduce();
};

void Rational::setNumerator(int x) { numerator = x; }
void Rational::setDenominator(int y) { denominator = y ? y : 1; }
int  Rational::getNumerator()   { return numerator; }
int  Rational::getDenominator() { return denominator; }
void Rational::print() { cout << numerator << "/" << denominator << endl; }
void Rational::multiply(Rational num)
{
    numerator   *= num.numerator;
    denominator *= num.denominator;
}
void Rational::reduce()
{
    int d = gcd();
    numerator   /= d;
    denominator /= d;
}
int Rational::gcd()
{
    int a = numerator < 0 ? -numerator : numerator;
    int b = denominator < 0 ? -denominator : denominator;
    if (a == 0) return b ? b : 1;
    if (b == 0) return a;
    int x = a < b ? a : b;
    for (; x >= 1; x--)
        if (a % x == 0 && b % x == 0) return x;
    return 1;
}`,
          title: 'main.cpp',
          lang: 'cpp',
          code: `//main.cpp
#include "Rational.h"

int main()
{
    Rational num1, num2;

    num1.setNumerator(4);
    num1.setDenominator(8);
    cout << "num1 = ";
    num1.print();

    num2.setNumerator(3);
    num2.setDenominator(4);
    cout << "num2 = ";
    num2.print();

    num1.reduce();
    cout << "After reduce: num1 = ";
    num1.print();

    num1.multiply(num2);
    cout << "After multiply num1 = ";
    num1.print();

    return 0;
}`,
          output: `num1 = 4/8
num2 = 3/4
After reduce: num1 = 1/2
After multiply num1 = 3/8`,
        },
        {
          kind: 'prose',
          md: 'שים לב לשורה `Rational num1, num2;` — אפשר להגדיר כמה מופעים בשורה אחת, בדיוק כמו `int a, b;`. **לכל מופע יש עותק משלו של `numerator` ו-`denominator`.**',
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'הבאג הנסתר בקוד הזה',
          md: 'שים לב ל-`num1.multiply(num2)` — היא **משנה את `num1`** במקום להחזיר שבר חדש. אחרי השורה הזו, `num1` כבר לא 1/2. זו החלטת תכנון לגיטימית, אבל היא מפתיעה: בחשבון רגיל, `a * b` לא משנה את `a`. ==בעמוד בהמשך הפרק נראה גרסה שמחזירה עצם חדש במקום.==',
        },
        {
          kind: 'quiz',
          question:
            'לפי הפלט למעלה, מה היה קורה אילו סדר הפעולות היה הפוך — קודם `multiply` ואז `reduce`?',
          options: [
            {
              text: 'התוצאה הייתה זהה: 3/8',
              correct: true,
              explain:
                'נכון. 4/8 × 3/4 = 12/32, ואחרי צמצום ב-4 → 3/8. אותה תשובה. הצמצום הוא פעולה שמשמרת את ערך השבר, ולכן הסדר לא משנה את התוצאה הסופית — רק את הגודל של המספרים בדרך.',
            },
            {
              text: 'התוצאה הייתה 12/32',
              correct: false,
              explain: 'זה מה שהיה מתקבל אילו **לא** היינו קוראים ל-`reduce` בכלל. אבל בשאלה כן קראנו לה, רק אחרי.',
            },
            {
              text: 'שגיאה — אי אפשר לצמצם אחרי כפל',
              correct: false,
              explain: '`reduce` פועלת על מצב השבר הנוכחי, לא משנה איך הגיע לשם.',
            },
            {
              text: 'התוצאה הייתה 6/16',
              correct: false,
              explain: 'זה צמצום חלקי (ב-2 בלבד). `gcd(12,32)` הוא 4, ולכן הצמצום המלא נותן 3/8.',
            },
          ],
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's35',
      title: 'Rational — המימוש: setters ו-getters',
      subtitle: 'ההגנה על המכנה',
      slides: [24],
      blocks: [
        {
          kind: 'code',
          runnable: true,
          prelude: `class Rational
{
private:
    int numerator;
    int denominator;
    int gcd();

public:
    void setNumerator(int x);
    void setDenominator(int y);
    int  getNumerator();
    int  getDenominator();
    void print();
    void multiply(Rational num);
    void reduce();
};`,
          title: 'Rational.cpp — החלק הראשון',
          lang: 'cpp',
          code: `//Rational.cpp
#include "Rational.h"

void Rational::setNumerator(int x)
{
    numerator = x;
}

void Rational::setDenominator(int y)
{
    if (y)
        denominator = y;
    else
        denominator = 1;
}

int Rational::getNumerator()
{
    return numerator;
}

int Rational::getDenominator()
{
    return denominator;
}

void Rational::print()
{
    cout << numerator << "/" << denominator << '\\n';
}`,
          annotations: [
            { line: 4, text: 'המונה יכול להיות כל מספר — כולל שלילי ואפס. אין ולידציה' },
            { line: 11, text: 'if (y) — כלומר "אם y שונה מאפס". ניסוח מקוצר' },
            { line: 14, text: 'המכנה לא יכול להיות 0 — ברירת מחדל 1' },
          ],
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'למה `if (y)` ולא `if (y != 0)`',
          md: 'ב-C++ כל ערך מספרי מומר אוטומטית ל-`bool`: **0 הוא `false`, כל דבר אחר הוא `true`**. לכן `if (y)` שקול בדיוק ל-`if (y != 0)`. זה קיצור מקובל שהגיע מ-C, ותראה אותו הרבה. ==לצורך המבחן: דע לקרוא את שתי הצורות.== מבחינת קריאוּת, `if (y != 0)` ברור יותר לקורא מתחיל.',
        },
        {
          kind: 'code',
          title: 'הגנת המכנה בפעולה — הרץ',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Rational
{
private:
    int numerator;
    int denominator;

public:
    void setNumerator(int x) { numerator = x; }

    void setDenominator(int y)
    {
        if (y)
            denominator = y;
        else
        {
            cout << "  [Rational] denominator 0 rejected, using 1" << endl;
            denominator = 1;
        }
    }

    void print() { cout << numerator << "/" << denominator << endl; }

    double toDouble() { return (double)numerator / denominator; }
};

int main()
{
    Rational r;

    r.setNumerator(3);
    r.setDenominator(4);
    cout << "r = ";  r.print();
    cout << "as double: " << r.toDouble() << endl;

    cout << "--- trying denominator = 0 ---" << endl;
    r.setDenominator(0);
    cout << "r = ";  r.print();
    cout << "as double: " << r.toDouble() << endl;   // לא קורס!

    return 0;
}`,
          caption:
            'בלי ההגנה, השורה האחרונה הייתה גורמת לחלוקה באפס. המחלקה מנעה את זה.',
        },
        {
          kind: 'callout',
          variant: 'exam',
          title: 'זו התשובה לשאלה "למה בכלל setter"',
          md: 'הנה דוגמה מוחשית: השדה `denominator` **לעולם** לא יכול להכיל 0, לא משנה מה הקוד החיצוני מנסה. אין צורך בבדיקה בכל מקום שמחלק — המחלקה כבר הבטיחה זאת. זה נקרא **אינווריאנטה של המחלקה** (class invariant): תכונה שנכונה תמיד, מרגע היצירה ועד ההרס.',
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'חור בהגנה — שווה לשים לב',
          md: 'מה קורה אם יוצרים `Rational r;` ו**לא** קוראים ל-`setDenominator` בכלל? המכנה מכיל **זבל** — ואם הזבל במקרה 0, נקבל חלוקה באפס. הגנת ה-setter מגנה רק ממי שקורא לה. ==זה בדיוק הפער שהבנאי (שיעור 2) סוגר==: הוא מבטיח שכל אובייקט נולד במצב חוקי, בלי תלות במי שיקרא למה.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's36',
      title: 'multiply — מתודה שמקבלת עצם',
      subtitle: 'היכולת הראשונה: פרמטר מטיפוס המחלקה עצמה',
      slides: [23, 24],
      blocks: [
        {
          kind: 'code',
          runnable: true,
          prelude: `class Rational
{
private:
    int numerator;
    int denominator;
    int gcd();

public:
    void setNumerator(int x);
    void setDenominator(int y);
    int  getNumerator();
    int  getDenominator();
    void print();
    void multiply(Rational num);
    void reduce();
};`,
          title: 'המתודה',
          lang: 'cpp',
          code: `void Rational::multiply(Rational num)
{
    numerator   *= num.numerator;
    denominator *= num.denominator;
}`,
          annotations: [
            { line: 1, text: 'הפרמטר הוא Rational — עצם מאותה מחלקה' },
            { line: 3, text: 'numerator בלי קידומת = השדה של האובייקט שעליו נקראנו (this)' },
            { line: 3, text: 'num.numerator = השדה של הפרמטר' },
          ],
        },
        {
          kind: 'callout',
          variant: 'danger',
          title: 'רגע — איך זה חוקי בכלל?',
          md: '`numerator` הוא שדה **פרטי**. אז איך `multiply` ניגשת ל-`num.numerator` של אובייקט **אחר**?\n\nהתשובה: ==הרשאות גישה הן ברמת ה**מחלקה**, לא ברמת ה**אובייקט**.== מתודה של `Rational` רשאית לגשת לשדות הפרטיים של **כל** אובייקט מטיפוס `Rational` — לא רק של עצמה. זה כלל שהרבה סטודנטים מפספסים.',
        },
        {
          kind: 'code',
          title: 'הדגמה מלאה של הכלל',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Money
{
private:
    int amount;

public:
    void set(int a) { amount = a; }
    int  get()      { return amount; }

    // ניגשת לשדה הפרטי של אובייקט אחר — חוקי!
    bool isRicherThan(Money other)
    {
        return amount > other.amount;      // other.amount — פרטי, ומותר
    }

    void takeFrom(Money other)
    {
        amount = amount + other.amount;    // גם כאן
    }
};

int main()
{
    Money a, b;
    a.set(100);
    b.set(250);

    cout << "a richer than b? " << (a.isRicherThan(b) ? "yes" : "no") << endl;
    cout << "b richer than a? " << (b.isRicherThan(a) ? "yes" : "no") << endl;

    a.takeFrom(b);
    cout << "after a.takeFrom(b): a = " << a.get() << endl;
    cout << "b unchanged (passed by value): b = " << b.get() << endl;

    // מחוץ למחלקה זה אסור:
    // cout << a.amount;   ← error: 'int Money::amount' is private

    return 0;
}`,
        },
        {
          kind: 'callout',
          variant: 'warn',
          title: 'שים לב: `multiply(Rational num)` מקבלת **עותק**',
          md: 'הפרמטר מועבר **by value** — נוצר עותק מלא של האובייקט. שתי השלכות: (1) שינויים ל-`num` בתוך המתודה לא משפיעים על המקור; (2) לכל קריאה יש עלות של העתקה. עבור `Rational` עם שני `int` זה זניח. עבור מחלקה עם מערך גדול — זה יקר.',
        },
        {
          kind: 'callout',
          variant: 'modern',
          title: 'הדרך היעילה',
          md: 'בקוד מקצועי היינו כותבים `void multiply(const Rational& num)` — **הפניה קבועה**: בלי העתקה (יעיל), ועם `const` שמבטיח שהמתודה לא תשנה את הפרמטר. ==בקורס עוברים להעברה בהפניה בשיעורים הבאים==; בשיעור 1 מסתפקים בהעברה בערך כדי לא לערבב נושאים.',
        },
        {
          kind: 'quiz',
          question: 'האם הקוד הבא מתקמפל?',
          code: `class Box
{
private:
    int size;
public:
    void copyFrom(Box other)
    {
        size = other.size;    // ← השורה בשאלה
    }
};`,
          options: [
            {
              text: 'כן — מתודה של המחלקה רשאית לגשת לשדות פרטיים של כל אובייקט מאותה מחלקה',
              correct: true,
              explain:
                'נכון. ההרשאה היא ברמת המחלקה. `copyFrom` היא מתודה של `Box`, ולכן היא רואה את `size` של כל `Box` — גם של `this` וגם של `other`.',
            },
            {
              text: 'לא — `other.size` פרטי ולכן חסום',
              correct: false,
              explain:
                'זו הטעות הנפוצה. `private` חוסם גישה **מחוץ למחלקה**. מתודה של המחלקה היא בפנים, בלי קשר לאיזה אובייקט היא ניגשת.',
            },
            {
              text: 'רק אם `other` מועבר בהפניה',
              correct: false,
              explain: 'צורת ההעברה (ערך/הפניה/מצביע) לא משפיעה על הרשאות גישה כלל.',
            },
            {
              text: 'רק אם נוסיף `friend`',
              correct: false,
              explain:
                '`friend` נחוץ כשפונקציה **חיצונית** צריכה גישה. כאן אנחנו בתוך המחלקה. (`friend` הוא נושא שיעור 5.)',
            },
          ],
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's37',
      title: 'reduce ו-gcd — מתודה שקוראת למתודת עזר',
      subtitle: 'וגם: הבאג שנמצא בקוד המצגת',
      slides: [24],
      blocks: [
        {
          kind: 'code',
          runnable: true,
          prelude: `class Rational
{
private:
    int numerator;
    int denominator;
    int gcd();

public:
    void setNumerator(int x);
    void setDenominator(int y);
    int  getNumerator();
    int  getDenominator();
    void print();
    void multiply(Rational num);
    void reduce();
};`,
          title: 'שתי המתודות, כפי שהן במצגת',
          lang: 'cpp',
          code: `void Rational::reduce()
{
    int d = gcd();          // קריאה למתודת העזר הפרטית
    numerator   /= d;
    denominator /= d;
}

int Rational::gcd()
{
    int x = numerator < denominator ? numerator : denominator;
    for (; x >= 1; x--)
        if (numerator % x == 0 && denominator % x == 0)
            return x;
}`,
          annotations: [
            { line: 3, text: 'קריאה בלי נקודה ובלי this — מתודה של אותה מחלקה' },
            { line: 10, text: 'האופרטור המשולש: המינימום מבין השניים' },
            { line: 11, text: 'סורק מלמעלה למטה עד שמוצא מחלק משותף' },
            { line: 13, text: 'אין return אחרי הלולאה! ← הבאג' },
          ],
        },
        {
          kind: 'callout',
          variant: 'crefresh',
          title: 'רענון מ-C — האופרטור המשולש',
          md: '`a ? b : c` — אם `a` אמת, הביטוי שווה ל-`b`, אחרת ל-`c`. השורה `int x = numerator < denominator ? numerator : denominator;` שקולה בדיוק ל:\n\n`int x; if (numerator < denominator) x = numerator; else x = denominator;`\n\nכלומר: `x` מקבל את **המינימום** מבין השניים.',
        },
        {
          kind: 'pitfall',
          title: 'הבאג בקוד של המצגת — `gcd` בלי `return` בסוף',
          badCode: `int Rational::gcd()
{
    int x = numerator < denominator ? numerator : denominator;
    for (; x >= 1; x--)
        if (numerator % x == 0 && denominator % x == 0)
            return x;
    // ← אין return כאן!
}`,
          error: `warning: control reaches end of non-void function [-Wreturn-type]
   14 | }
      | ^`,
          explain:
            'הפונקציה מוצהרת `int` אבל יש מסלול שבו היא מסתיימת **בלי `return`**. בפועל, המסלול הזה כמעט לא נגיע אליו — כי כל שני מספרים שלמים מתחלקים ב-1, והלולאה בטוח תמצא לפחות את 1. **אבל**: אם `numerator` הוא 0, אז `x` מתחיל ב-0 (המינימום), הלולאה לא מתבצעת כלל, ואין `return`. התוצאה: **התנהגות בלתי מוגדרת** — הפונקציה מחזירה זבל, ואז `reduce` מחלקת בזבל. ==זה יכול לגרום לחלוקה באפס ולקריסה.==',
          goodCode: `int Rational::gcd()
{
    int a = numerator   < 0 ? -numerator   : numerator;
    int b = denominator < 0 ? -denominator : denominator;

    if (a == 0) return b ? b : 1;      // מקרה קצה: מונה אפס
    if (b == 0) return a;

    int x = a < b ? a : b;
    for (; x >= 1; x--)
        if (a % x == 0 && b % x == 0)
            return x;

    return 1;                          // ← רשת ביטחון
}`,
          goodNote:
            'שלוש הוספות: טיפול במספרים שליליים (`%` על שלילי מתנהג מוזר), טיפול במקרה `numerator == 0`, ו-`return 1` בסוף כרשת ביטחון. **תמיד ודא שלכל מסלול בפונקציה שאינה `void` יש `return`.**',
        },
        {
          kind: 'code',
          title: 'הרץ ותראה את הבאג בעצמך',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Rational
{
private:
    int numerator;
    int denominator;

    // הגרסה מהמצגת — עם הבאג
    int gcdBuggy()
    {
        int x = numerator < denominator ? numerator : denominator;
        for (; x >= 1; x--)
            if (numerator % x == 0 && denominator % x == 0)
                return x;
        return -999;   // מדמה את הזבל שהיה מוחזר בלי return
    }

public:
    void set(int n, int d) { numerator = n; denominator = d ? d : 1; }
    void print() { cout << numerator << "/" << denominator << endl; }

    void showGcd()
    {
        cout << "gcd(" << numerator << "," << denominator << ") = "
             << gcdBuggy() << endl;
    }
};

int main()
{
    Rational a;  a.set(12, 32);  a.showGcd();   // תקין: 4
    Rational b;  b.set(9, 6);    b.showGcd();   // תקין: 3
    Rational c;  c.set(7, 13);   c.showGcd();   // תקין: 1

    cout << "--- edge case ---" << endl;
    Rational d;  d.set(0, 5);    d.showGcd();   // ✕ הלולאה לא רצה!

    return 0;
}`,
          caption:
            'המקרה האחרון: מונה 0. הלולאה לא מתבצעת ולכן אין return — ובגרסה המקורית זה זבל.',
        },
        {
          kind: 'callout',
          variant: 'modern',
          title: 'האלגוריתם היעיל — אוקלידס',
          md: 'הלולאה במצגת סורקת מ-min כלפי מטה — עד `min` איטרציות. **אלגוריתם אוקלידס** עושה את זה בזמן לוגריתמי:\n\n`int gcd(int a, int b) { while (b) { int t = b; b = a % b; a = t; } return a; }`\n\nעבור 1,000,000 ו-999,999 — הגרסה של המצגת עושה מיליון איטרציות, אוקלידס עושה שתיים. ==בקורס הגרסה של המצגת מקובלת==, אבל שווה להכיר את היעילה.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's38',
      title: 'Rational — הפרויקט השלם',
      subtitle: 'הרץ, שחק, שבור',
      slides: [23, 24],
      blocks: [
        {
          kind: 'prose',
          md: 'הנה כל המחלקה בשלושה קבצים, מתוקנת. **הרץ אותה, ואז פתח בעורך ונסה לשנות דברים.**',
        },
        {
          kind: 'code',
          title: 'Rational — פרויקט מלא',
          runnable: true,
          files: [
            {
              name: 'Rational.h',
              code: RATIONAL_H,
            },
            {
              name: 'Rational.cpp',
              code: `//Rational.cpp
#include "Rational.h"

void Rational::setNumerator(int x)
{
    numerator = x;
}

void Rational::setDenominator(int y)
{
    if (y)
        denominator = y;
    else
        denominator = 1;
}

int Rational::getNumerator()   { return numerator;   }
int Rational::getDenominator() { return denominator; }

void Rational::print()
{
    cout << numerator << "/" << denominator << '\\n';
}

void Rational::multiply(Rational num)
{
    numerator   *= num.numerator;
    denominator *= num.denominator;
}

void Rational::reduce()
{
    int d = gcd();
    numerator   /= d;
    denominator /= d;
}

int Rational::gcd()
{
    int a = numerator   < 0 ? -numerator   : numerator;
    int b = denominator < 0 ? -denominator : denominator;

    if (a == 0) return b ? b : 1;
    if (b == 0) return a;

    int x = a < b ? a : b;
    for (; x >= 1; x--)
        if (a % x == 0 && b % x == 0)
            return x;

    return 1;
}`,
            },
            {
              name: 'main.cpp',
              code: `//main.cpp
#include "Rational.h"

int main()
{
    Rational num1, num2;

    num1.setNumerator(4);
    num1.setDenominator(8);
    cout << "num1 = ";
    num1.print();

    num2.setNumerator(3);
    num2.setDenominator(4);
    cout << "num2 = ";
    num2.print();

    num1.reduce();
    cout << "After reduce: num1 = ";
    num1.print();

    num1.multiply(num2);
    cout << "After multiply num1 = ";
    num1.print();

    return 0;
}`,
            },
          ],
        },
        {
          kind: 'list',
          title: 'דברים שכדאי לנסות בעורך',
          items: [
            'הוסף `num2.print();` **אחרי** `num1.multiply(num2)` — ותראה ש-`num2` לא השתנה (הועבר בערך).',
            'נסה `num1.setDenominator(0);` וראה שהמכנה הופך ל-1 במקום להתרסק.',
            'הוסף `cout << num1.numerator;` ב-`main` — וקבל את שגיאת ה-`private` האמיתית.',
            'קרא ל-`num1.gcd()` מ-`main` — וראה שגם היא חסומה, כי היא פרטית.',
            'הסר את `Rational::` מאחת המתודות ב-`.cpp` — וראה איזו שגיאה מתקבלת.',
          ],
        },
        {
          kind: 'callout',
          variant: 'tip',
          md: 'לחץ "פתח בעורך" בראש בלוק הקוד — שלושת הקבצים יאוחדו אוטומטית לקובץ אחד שאפשר לערוך ולהריץ.',
        },
      ],
    },

    /* ============================================================ */
    {
      id: 's39',
      title: 'מתודה שמחזירה עצם',
      subtitle: 'היכולת השלישית והרביעית: יצירה והחזרה של אובייקטים',
      slides: [22],
      blocks: [
        {
          kind: 'prose',
          md: 'עד עכשיו `multiply` **שינתה** את האובייקט. גישה נקייה יותר: להחזיר עצם **חדש** ולהשאיר את שני המקוריים ללא שינוי — בדיוק כמו ש-`a * b` בחשבון לא משנה את `a`.',
        },
        {
          kind: 'compare',
          title: 'שתי גישות למכפלה',
          left: {
            title: 'משנה את עצמה (mutating)',
            code: `void multiply(Rational num)
{
    numerator   *= num.numerator;
    denominator *= num.denominator;
}

// שימוש:
num1.multiply(num2);
// num1 השתנה`,
            note: 'קצר ויעיל, אבל מפתיע — הקורא לא בהכרח מצפה ש-`num1` ישתנה.',
            verdict: 'neutral',
          },
          right: {
            title: 'מחזירה עצם חדש (functional)',
            code: `Rational times(Rational num)
{
    Rational result;
    result.setNumerator(
        numerator * num.numerator);
    result.setDenominator(
        denominator * num.denominator);
    return result;
}

// שימוש:
Rational num3 = num1.times(num2);
// num1 ו-num2 לא השתנו`,
            note: 'ברור יותר, ומאפשר לשרשר: `a.times(b).times(c)`.',
            verdict: 'good',
          },
        },
        {
          kind: 'prose',
          md: 'שים לב מה קורה בגוף של `times`: **נוצר עצם חדש בתוך מתודה** (`Rational result;`) — זו היכולת השלישית מהרשימה. ואז **מחזירים אותו** — היכולת הרביעית.',
        },
        {
          kind: 'code',
          title: 'שתי הגישות זו לצד זו — הרץ',
          runnable: true,
          code: `#include <iostream>
using namespace std;

class Rational
{
private:
    int numerator;
    int denominator;

    int gcd()
    {
        int a = numerator   < 0 ? -numerator   : numerator;
        int b = denominator < 0 ? -denominator : denominator;
        if (a == 0) return b ? b : 1;
        if (b == 0) return a;
        int x = a < b ? a : b;
        for (; x >= 1; x--)
            if (a % x == 0 && b % x == 0) return x;
        return 1;
    }

public:
    void set(int n, int d)
    {
        numerator   = n;
        denominator = d ? d : 1;
    }

    void print() { cout << numerator << "/" << denominator; }

    void reduce()
    {
        int d = gcd();
        numerator   /= d;
        denominator /= d;
    }

    // גישה 1: משנה את עצמה
    void multiply(Rational num)
    {
        numerator   *= num.numerator;
        denominator *= num.denominator;
    }

    // גישה 2: מחזירה עצם חדש
    Rational times(Rational num)
    {
        Rational result;                       // עצם חדש בתוך מתודה
        result.numerator   = numerator   * num.numerator;
        result.denominator = denominator * num.denominator;
        result.reduce();                       // מצמצם לפני ההחזרה
        return result;                         // מחזירה עצם
    }
};

int main()
{
    Rational a, b;
    a.set(1, 2);
    b.set(3, 4);

    cout << "a = "; a.print(); cout << ", b = "; b.print(); cout << endl;

    // --- גישה 2: לא הורסת כלום ---
    Rational c = a.times(b);
    cout << "c = a.times(b) = "; c.print(); cout << endl;
    cout << "a is still "; a.print(); cout << endl;

    // --- גישה 1: הורסת את a ---
    a.multiply(b);
    cout << "after a.multiply(b), a = "; a.print(); cout << endl;

    // --- שרשור, אפשרי רק בגישה 2 ---
    Rational x, y, z;
    x.set(1, 2);
    y.set(2, 3);
    z.set(3, 4);
    Rational product = x.times(y).times(z);
    cout << "1/2 * 2/3 * 3/4 = "; product.print(); cout << endl;

    return 0;
}`,
        },
        {
          kind: 'callout',
          variant: 'info',
          title: 'שים לב לשורה `result.numerator = ...`',
          md: 'בתוך `times` ניגשנו ישירות לשדה הפרטי של `result` — עצם **אחר**. שוב אותו כלל: מתודה של המחלקה רואה את השדות הפרטיים של כל אובייקט מאותה מחלקה.',
        },
        {
          kind: 'callout',
          variant: 'modern',
          title: 'לאן זה מוביל',
          md: 'הגישה השנייה היא בדיוק הצורה שבה נכתוב **חפיפת אופרטורים** בשיעור 4:\n\n`Rational operator*(Rational num) { ... return result; }`\n\nואז אפשר יהיה לכתוב פשוט `Rational c = a * b;` — ==בדיוק כמו עם `int`==. זה היעד. `times` היא הצעד לפניו.',
        },
        {
          kind: 'exercise',
          id: 'ex-rational-add',
          title: 'הוסף חיבור שברים',
          level: 2,
          brief:
            'הרחב את `Rational` עם פעולת חיבור. תזכורת מתמטית: `a/b + c/d = (a·d + c·b) / (b·d)`.',
          requirements: [
            'הוסף מתודה `Rational plus(Rational other)` שמחזירה שבר **חדש** — הסכום. אל תשנה את `this` ואל תשנה את `other`.',
            'התוצאה צריכה להיות **מצומצמת** — קרא ל-`reduce()` לפני ההחזרה.',
            'הוסף מתודה `bool equals(Rational other)` שבודקת שוויון. ==רמז: 1/2 ו-2/4 שווים!== חשוב על הדרך הנכונה להשוות.',
            'בדוק ש-`1/2 + 1/3` נותן `5/6`, וש-`1/2 + 1/2` נותן `1/1`.',
          ],
          starter: `#include <iostream>
using namespace std;

class Rational
{
private:
    int numerator;
    int denominator;

    int gcd()
    {
        int a = numerator   < 0 ? -numerator   : numerator;
        int b = denominator < 0 ? -denominator : denominator;
        if (a == 0) return b ? b : 1;
        if (b == 0) return a;
        int x = a < b ? a : b;
        for (; x >= 1; x--)
            if (a % x == 0 && b % x == 0) return x;
        return 1;
    }

public:
    void set(int n, int d)
    {
        numerator   = n;
        denominator = d ? d : 1;
    }

    void print() { cout << numerator << "/" << denominator; }

    void reduce()
    {
        int d = gcd();
        numerator   /= d;
        denominator /= d;
    }

    // TODO 1: Rational plus(Rational other)

    // TODO 2: bool equals(Rational other)
};

int main()
{
    Rational a, b;
    a.set(1, 2);
    b.set(1, 3);

    Rational s = a.plus(b);
    cout << "1/2 + 1/3 = "; s.print(); cout << endl;

    Rational c, d;
    c.set(1, 2);
    d.set(1, 2);
    Rational t = c.plus(d);
    cout << "1/2 + 1/2 = "; t.print(); cout << endl;

    Rational half, twoQuarters;
    half.set(1, 2);
    twoQuarters.set(2, 4);
    cout << "1/2 == 2/4 ? "
         << (half.equals(twoQuarters) ? "yes" : "no") << endl;

    return 0;
}`,
          hints: [
            'ב-`plus`, צור `Rational result;` והצב בו את המונה והמכנה המחושבים. מכיוון שאתה בתוך מתודה של `Rational`, מותר לך לגשת ישירות ל-`result.numerator`.',
            'למכנה המשותף אין צורך במכנה המשותף הקטן ביותר — פשוט `denominator * other.denominator` ואז `reduce()` יסדר הכול.',
            'ל-`equals`: השוואה ישירה של מונים ומכנים תיתן `no` עבור 1/2 ו-2/4. הדרך הנכונה היא **הכפלה צולבת**: `a/b == c/d` בדיוק כאשר `a*d == c*b`. זה גם נמנע מבעיות של חלוקה.',
          ],
          solution: `#include <iostream>
using namespace std;

class Rational
{
private:
    int numerator;
    int denominator;

    int gcd()
    {
        int a = numerator   < 0 ? -numerator   : numerator;
        int b = denominator < 0 ? -denominator : denominator;
        if (a == 0) return b ? b : 1;
        if (b == 0) return a;
        int x = a < b ? a : b;
        for (; x >= 1; x--)
            if (a % x == 0 && b % x == 0) return x;
        return 1;
    }

public:
    void set(int n, int d)
    {
        numerator   = n;
        denominator = d ? d : 1;
    }

    void print() { cout << numerator << "/" << denominator; }

    void reduce()
    {
        int d = gcd();
        numerator   /= d;
        denominator /= d;
    }

    Rational plus(Rational other)
    {
        Rational result;
        result.numerator   = numerator * other.denominator
                           + other.numerator * denominator;
        result.denominator = denominator * other.denominator;
        result.reduce();
        return result;
    }

    bool equals(Rational other)
    {
        // הכפלה צולבת — עובד גם לשברים לא מצומצמים
        return numerator * other.denominator == other.numerator * denominator;
    }
};

int main()
{
    Rational a, b;
    a.set(1, 2);
    b.set(1, 3);

    Rational s = a.plus(b);
    cout << "1/2 + 1/3 = "; s.print(); cout << endl;

    Rational c, d;
    c.set(1, 2);
    d.set(1, 2);
    Rational t = c.plus(d);
    cout << "1/2 + 1/2 = "; t.print(); cout << endl;

    Rational half, twoQuarters;
    half.set(1, 2);
    twoQuarters.set(2, 4);
    cout << "1/2 == 2/4 ? "
         << (half.equals(twoQuarters) ? "yes" : "no") << endl;

    return 0;
}`,
          expectedOutput: `1/2 + 1/3 = 5/6
1/2 + 1/2 = 1/1
1/2 == 2/4 ? yes`,
        },
      ],
    },
  ],
};

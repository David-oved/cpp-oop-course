import { stripCommentsAndStrings } from './compile';

/**
 * עטיפה חכמה של קטע קוד מהשיעור לתוכנית שלמה שאפשר להריץ.
 *
 * הרבה שקפים במצגת מציגים רק חלק — הגדרת מחלקה בלי main, או שתי שורות שימוש
 * בלי שום הקשר. כדי שאפשר יהיה להריץ אותם, אנחנו:
 *   1. מפרידים בין הגדרות (מחלקות, פונקציות) לבין פקודות ביצוע
 *   2. שמים הגדרות ב-file scope ופקודות בתוך main
 *   3. מוסיפים את ה-#include וה-using שחסרים
 *
 * התוצאה מוצגת למשתמש — הוא רואה בדיוק מה נשלח לקומפיילר.
 */

export interface WrapResult {
  /** התוכנית המלאה שנשלחת לקומפיילר */
  code: string;
  /** האם שינינו משהו בכלל */
  changed: boolean;
  /** רשימת מה שהוספנו, להצגה למשתמש */
  notes: string[];
}

interface Segment {
  text: string;
  kind: 'directive' | 'declaration' | 'statement';
}

/* ---------- זיהוי ספריות חסרות ---------- */

const LIB_RULES: { lib: string; test: RegExp; why: string }[] = [
  { lib: '<iostream>', test: /\b(cout|cin|cerr|clog|endl)\b/, why: 'פלט/קלט לקונסולה' },
  { lib: '<cmath>', test: /\b(sqrt|pow|fabs|floor|ceil|sin|cos|tan|log|exp)\s*\(/, why: 'פונקציות מתמטיות' },
  { lib: '<cstring>', test: /\b(strcpy|strncpy|strlen|strcmp|strcat|strncat|memset|memcpy)\s*\(/, why: 'מחרוזות בסגנון C' },
  { lib: '<string>', test: /\bstring\b/, why: 'מחלקת string' },
  { lib: '<iomanip>', test: /\b(setw|setprecision|setfill|fixed|scientific)\b/, why: 'עיצוב פלט' },
  { lib: '<fstream>', test: /\b(ifstream|ofstream|fstream)\b/, why: 'עבודה עם קבצים' },
  { lib: '<vector>', test: /\bvector\s*</, why: 'מיכל vector' },
  { lib: '<cstdlib>', test: /\b(rand|srand|atoi|exit|malloc|free)\s*\(/, why: 'פונקציות סטנדרטיות' },
];

/* ---------- פיצול לקטעים ברמה העליונה ---------- */

function splitTopLevel(src: string): Segment[] {
  const clean = stripCommentsAndStrings(src);
  const segs: Segment[] = [];
  let start = 0;
  let depth = 0;
  let parens = 0;
  let angle = 0; // template<...>
  let i = 0;

  const push = (end: number) => {
    const text = src.slice(start, end);
    if (text.trim()) segs.push({ text, kind: classify(text) });
    start = end;
  };

  while (i < clean.length) {
    const c = clean[i];

    // הנחיית קדם-מעבד — שורה שלמה
    if (c === '#' && isLineStart(clean, i) && depth === 0) {
      push(i);
      let j = i;
      while (j < clean.length) {
        if (clean[j] === '\n' && clean[j - 1] !== '\\') break;
        j++;
      }
      const text = src.slice(i, j);
      if (text.trim()) segs.push({ text, kind: 'directive' });
      i = j;
      start = j;
      continue;
    }

    if (c === '(') parens++;
    else if (c === ')') parens = Math.max(0, parens - 1);
    else if (c === '<' && /template\s*$/.test(clean.slice(Math.max(0, i - 12), i))) angle++;
    else if (c === '>' && angle > 0) angle--;
    else if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        // בולעים ; אחרי } (סוף הגדרת מחלקה)
        let j = i + 1;
        while (j < clean.length && /\s/.test(clean[j])) j++;
        if (clean[j] === ';') j++;
        push(j);
        i = j;
        continue;
      }
    } else if (c === ';' && depth === 0 && parens === 0 && angle === 0) {
      push(i + 1);
      i++;
      continue;
    }
    i++;
  }
  push(clean.length);
  return segs;
}

const isLineStart = (s: string, i: number) => {
  for (let j = i - 1; j >= 0; j--) {
    if (s[j] === '\n') return true;
    if (!/\s/.test(s[j])) return false;
  }
  return true;
};

function classify(raw: string): Segment['kind'] {
  const t = stripCommentsAndStrings(raw).trim();
  if (!t) return 'statement';
  if (t.startsWith('#')) return 'directive';

  // מחלקה / מבנה / enum / namespace / template / typedef / using
  if (/^(class|struct|union|enum|namespace|template|typedef)\b/.test(t)) return 'declaration';
  if (/^using\s+namespace\b/.test(t)) return 'directive';
  if (/^using\b/.test(t)) return 'declaration';
  if (/^extern\b/.test(t)) return 'declaration';

  // הגדרת פונקציה: משהו שנגמר ב-} ויש בו סוגריים לפני הסוגר המסולסל הראשון
  if (t.endsWith('}') || /\}\s*;?$/.test(t)) {
    const head = t.slice(0, t.indexOf('{'));
    if (/\)\s*(const)?\s*(noexcept)?\s*$/.test(head.trim())) return 'declaration';
  }

  // אב-טיפוס של פונקציה: "void foo();" — שתי מילים ואז סוגריים ואז ;
  if (/^[A-Za-z_][\w:<>,\s*&]*\s+[A-Za-z_~][\w:]*\s*\([^)]*\)\s*(const)?\s*;$/.test(t))
    return 'declaration';

  return 'statement';
}

/* ---------- העטיפה עצמה ---------- */

/**
 * @param src     הקוד כפי שהוא מוצג בעמוד
 * @param prelude הגדרות שהקטע נשען עליהן ולא מוצגות בו (למשל מחלקה מעמוד קודם)
 */
export function wrapSnippet(src: string, prelude?: string): WrapResult {
  const notes: string[] = [];
  if (prelude?.trim()) {
    notes.push('נוספו ההגדרות שהקטע נשען עליהן (מופיעות מוקדם יותר בשיעור)');
    src = `${prelude.trim()}\n\n${src}`;
  }
  const clean = stripCommentsAndStrings(src);
  const alreadyHasMain = /\bint\s+main\s*\(/.test(clean);

  // אילו ספריות חסרות
  const missingLibs: string[] = [];
  for (const rule of LIB_RULES) {
    if (rule.test.test(clean) && !new RegExp(`#\\s*include\\s*${escapeRe(rule.lib)}`).test(clean)) {
      missingLibs.push(rule.lib);
    }
  }
  // string נדרש רק אם זה באמת std::string ולא char* — נמנעים מרעש
  const filteredLibs = missingLibs.filter(
    (l) => !(l === '<string>' && !/\bstring\s+\w|\bstring\s*\(|\bstring\s*&/.test(clean))
  );

  const needsUsing =
    /\b(cout|cin|cerr|endl|string|vector)\b/.test(clean) &&
    !/using\s+namespace\s+std\s*;/.test(clean) &&
    !/\bstd::/.test(clean);

  /* --- כבר יש main: משלימים כותרות ומסירים הכללות מקומיות --- */
  if (alreadyHasMain) {
    const localIncludes: string[] = [];
    let body = src.replace(/^[ \t]*#\s*include\s*"([^"]+)"[ \t]*\r?\n?/gm, (_m, f: string) => {
      localIncludes.push(f);
      return '';
    });
    if (localIncludes.length) {
      notes.push(
        `הוסר \`#include "${localIncludes.join('", "')}"\` — בהרצת קובץ בודד אין קבצים מקומיים, והתוכן שלהם כבר נמצא כאן`
      );
    }

    const header: string[] = [];
    for (const lib of filteredLibs) {
      header.push(`#include ${lib}`);
      notes.push(`נוסף \`#include ${lib}\``);
    }
    if (needsUsing) {
      header.push('using namespace std;');
      notes.push('נוסף `using namespace std;`');
    }

    if (notes.length === 0) return { code: src, changed: false, notes };
    body = body.replace(/^\n+/, '');
    return {
      code: header.length ? `${header.join('\n')}\n\n${body}` : body,
      changed: true,
      notes,
    };
  }

  /* --- אין main: מפצלים ובונים תוכנית --- */
  const segs = splitTopLevel(src);
  const directives = segs.filter((s) => s.kind === 'directive');
  const decls = segs.filter((s) => s.kind === 'declaration');
  const stmts = segs.filter((s) => s.kind === 'statement');

  const header: string[] = [];
  for (const lib of filteredLibs) {
    header.push(`#include ${lib}`);
    notes.push(`נוסף \`#include ${lib}\``);
  }
  // הכללות בגרשיים מפנות לקבצים מקומיים שלא קיימים כשמריצים קטע בודד —
  // התוכן שלהם ממילא הוזרק ישירות דרך ה-prelude
  const dropped: string[] = [];
  for (const d of directives) {
    const local = d.text.match(/#\s*include\s*"([^"]+)"/);
    if (local) {
      dropped.push(local[1]);
      continue;
    }
    header.push(d.text.trim());
  }
  if (dropped.length) {
    notes.push(
      `הוסר \`#include "${dropped.join('", "')}"\` — בהרצת קובץ בודד אין קבצים מקומיים, והתוכן שלהם כבר נמצא כאן`
    );
  }
  if (needsUsing) {
    header.push('using namespace std;');
    notes.push('נוסף `using namespace std;`');
  }

  const declText = decls.map((d) => d.text.trim()).join('\n\n');
  const bodyLines = stmts
    .map((s) => s.text.trim())
    .filter(Boolean)
    .map((s) =>
      s
        .split('\n')
        .map((l) => '    ' + l.trim())
        .join('\n')
    )
    .join('\n');

  if (decls.length > 0 && stmts.length > 0) {
    notes.push('ההגדרות הושארו ברמת הקובץ, ופקודות הביצוע נעטפו ב-`int main()`');
  } else if (decls.length > 0) {
    notes.push('נוספה `int main()` ריקה — ההגדרה לבדה לא מייצרת פלט');
  } else {
    notes.push('הפקודות נעטפו ב-`int main()`');
  }

  const parts = [header.join('\n'), declText, `int main()\n{\n${bodyLines}\n\n    return 0;\n}`]
    .filter((p) => p.trim())
    .join('\n\n');

  return { code: parts + '\n', changed: true, notes };
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * עוטף פרויקט מרובה קבצים: רק הקובץ הראשי עשוי להזדקק לעטיפה,
 * וגם זה רק אם אין בשום קובץ main.
 */
export function wrapProject(files: { name: string; code: string }[]): {
  files: { name: string; code: string }[];
  changed: boolean;
  notes: string[];
} {
  const anyMain = files.some(
    (f) => /\.(cpp|cc|cxx|c)$/i.test(f.name) && /\bint\s+main\s*\(/.test(stripCommentsAndStrings(f.code))
  );
  if (anyMain) return { files, changed: false, notes: [] };

  // אין main בשום מקום — עוטפים את הקובץ ה"ראשי" ביותר
  const idx = files.findIndex((f) => /main/i.test(f.name)) >= 0
    ? files.findIndex((f) => /main/i.test(f.name))
    : files.findIndex((f) => /\.(cpp|cc|cxx|c)$/i.test(f.name));

  if (idx < 0) {
    // רק קבצי header — מוסיפים main.cpp שמכליל את כולם
    const includes = files.map((f) => `#include "${f.name}"`).join('\n');
    return {
      files: [
        ...files,
        {
          name: 'main.cpp',
          code: `#include <iostream>\n${includes}\nusing namespace std;\n\nint main()\n{\n\n    return 0;\n}\n`,
        },
      ],
      changed: true,
      notes: ['נוסף `main.cpp` שמכליל את קבצי הכותרת — כדי שיהיה מה להריץ'],
    };
  }

  const w = wrapSnippet(files[idx].code);
  return {
    files: files.map((f, i) => (i === idx ? { ...f, code: w.code } : f)),
    changed: w.changed,
    notes: w.notes.map((n) => `בקובץ \`${files[idx].name}\`: ${n}`),
  };
}

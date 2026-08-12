/**
 * הרצת C++ אמיתית דרך Wandbox (g++ בשרת).
 *
 * תומך ב**קומפילציה נפרדת אמיתית**: כל קובץ .cpp נשלח בנפרד ומתקמפל לבד,
 * בדיוק כמו ב-Visual Studio. המשמעות: מקבלים שגיאות לינקר אמיתיות
 * (undefined reference) ושגיאות הכללה מרובה אמיתיות — מה שהשיעור מלמד.
 */

export interface SourceFile {
  name: string;
  code: string;
}

export interface CompileResult {
  status: number;
  compilerMessage: string;
  programOutput: string;
  programError: string;
  /** הקומפילציה או הקישור נכשלו — לא נוצר קובץ הרצה */
  buildFailed: boolean;
  /** הכשל היה בשלב הקישור ולא בהידור */
  linkFailed: boolean;
  elapsedMs: number;
  networkError?: string;
}

const ENDPOINT = 'https://wandbox.org/api/compile.json';
const DEFAULT_COMPILER = 'gcc-13.2.0';
const DEFAULT_OPTIONS = 'warning,gnu++17';
/** Wandbox תמיד קורא לקובץ הראשי כך */
const WANDBOX_MAIN = 'prog.cc';

export interface RunOptions {
  stdin?: string;
  rawOptions?: string;
  compiler?: string;
  signal?: AbortSignal;
}

const isSource = (n: string) => /\.(cpp|cc|cxx|c)$/i.test(n);
const hasMain = (c: string) => /\bint\s+main\s*\(/.test(stripCommentsAndStrings(c));

/** מריץ פרויקט מרובה קבצים עם קומפילציה נפרדת אמיתית. */
export async function runProject(
  files: SourceFile[],
  opts: RunOptions = {}
): Promise<CompileResult> {
  const t0 = performance.now();

  if (files.length === 0) {
    return fail('אין קבצים להרצה.', 0);
  }

  // הקובץ עם main הוא הקובץ הראשי; אם אין — לוקחים את הראשון
  const mainIdx = files.findIndex((f) => isSource(f.name) && hasMain(f.code));
  const idx = mainIdx >= 0 ? mainIdx : files.findIndex((f) => isSource(f.name));
  if (idx < 0) {
    return fail(
      'לא נמצא אף קובץ מקור (.cpp) להרצה. הוסף קובץ .cpp עם פונקציית main.',
      performance.now() - t0
    );
  }

  const mainFile = files[idx];
  const others = files.filter((_, i) => i !== idx);

  // כל קובץ .cpp נוסף חייב להופיע בשורת הפקודה כדי שיתקמפל ויקושר
  const extraSources = others.filter((f) => isSource(f.name)).map((f) => f.name);
  const rawOptions = [opts.rawOptions ?? '-Wall', ...extraSources].join('\n');

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: opts.signal,
      body: JSON.stringify({
        code: mainFile.code,
        codes: others.map((f) => ({ file: f.name, code: f.code })),
        compiler: opts.compiler ?? DEFAULT_COMPILER,
        options: DEFAULT_OPTIONS,
        stdin: opts.stdin ?? '',
        'compiler-option-raw': rawOptions,
        save: false,
      }),
    });

    if (!res.ok) return fail(`השרת החזיר שגיאה ${res.status}`, performance.now() - t0);

    const data = (await res.json()) as {
      status?: string;
      compiler_message?: string;
      compiler_error?: string;
      program_output?: string;
      program_error?: string;
    };

    // Wandbox קורא לקובץ הראשי prog.cc — מחזירים את השם האמיתי בהודעות
    const rename = (s: string) =>
      s.split(WANDBOX_MAIN).join(mainFile.name).replace(/\/tmp\/cc\w+\.o/g, 'main.o');

    const compilerMessage = rename(data.compiler_message ?? data.compiler_error ?? '');
    const programOutput = data.program_output ?? '';
    const linkFailed = /\bld\b.*:|undefined reference|multiple definition|collect2: error/i.test(
      compilerMessage
    );
    const compileFailed = /(^|\n)[^\n]*\berror\b\s*:/i.test(compilerMessage);
    const buildFailed = (compileFailed || linkFailed) && programOutput === '';

    return {
      status: Number(data.status ?? 0),
      compilerMessage,
      programOutput,
      programError: data.program_error ?? '',
      buildFailed,
      linkFailed: linkFailed && buildFailed,
      elapsedMs: Math.round(performance.now() - t0),
    };
  } catch (e) {
    if (opts.signal?.aborted) return fail('ההרצה בוטלה', performance.now() - t0);
    return fail(
      'לא ניתן להתחבר לשרת ההרצה. בדוק את חיבור האינטרנט ונסה שוב.',
      performance.now() - t0
    );
  }
}

/** קיצור לקובץ בודד. */
export function runCpp(code: string, opts: RunOptions = {}): Promise<CompileResult> {
  return runProject([{ name: 'main.cpp', code }], opts);
}

function fail(message: string, elapsed: number): CompileResult {
  return {
    status: -1,
    compilerMessage: '',
    programOutput: '',
    programError: '',
    buildFailed: false,
    linkFailed: false,
    elapsedMs: Math.round(elapsed),
    networkError: message,
  };
}

/**
 * מנטרל הערות ומחרוזות כדי שזיהוי דפוסים לא ייפול עליהן.
 *
 * ==התוצאה שומרת בדיוק על אותו אורך ועל אותם מעברי שורה כמו המקור==,
 * כך שאפשר להשתמש באינדקסים שהתקבלו מהסריקה כדי לחתוך מהמקור עצמו.
 * בלי זה כל הערה הייתה מזיזה את כל האינדקסים שאחריה.
 */
export function stripCommentsAndStrings(src: string): string {
  const out = src.split('');
  const blank = (from: number, to: number) => {
    for (let k = from; k < to && k < out.length; k++) {
      if (out[k] !== '\n') out[k] = ' ';
    }
  };

  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];

    // הערת שורה
    if (c === '/' && src[i + 1] === '/') {
      let j = i;
      while (j < n && src[j] !== '\n') j++;
      blank(i, j);
      i = j;
      continue;
    }

    // הערת בלוק
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      const j = end === -1 ? n : end + 2;
      blank(i, j);
      i = j;
      continue;
    }

    // מחרוזת או תו — הגרשיים נשמרים, התוכן מנוטרל
    if (c === '"' || c === "'") {
      const q = c;
      let j = i + 1;
      while (j < n) {
        if (src[j] === '\\') j += 2;
        else if (src[j] === q) { j++; break; }
        else if (src[j] === '\n') break;
        else j++;
      }
      blank(i + 1, Math.max(i + 1, j - 1));
      i = j;
      continue;
    }

    i++;
  }
  return out.join('');
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { defineThemes } from '../lib/monacoSetup';
import { runProject, type CompileResult } from '../lib/compile';
import { wrapProject } from '../lib/wrap';
import { highlightCompilerLog } from '../lib/highlight';
import {
  getExerciseCode,
  setExerciseCode,
  getProjects,
  saveProject,
  deleteProject,
  getTheme,
  type SavedProject,
} from '../lib/storage';
import { useApp, type IdeFile, type IdeRequest } from '../AppContext';
import { CodeSurface } from './CodeBlock';
import {
  IClose, IPlay, ISave, ITrash, ITerminal, IReset, IEye, ICheck,
} from './Icons';

/* ============================================================
   תבניות
   ============================================================ */

const BLANK_MAIN = `#include <iostream>
using namespace std;

int main()
{

    return 0;
}
`;

function classProject(name: string): IdeFile[] {
  const guard = name.toUpperCase() + '_H';
  return [
    {
      name: `${name}.h`,
      code: `#ifndef ${guard}
#define ${guard}

#include <iostream>
using namespace std;

class ${name}
{
private:
    // תכונות — שדות פרטיים


public:
    // הצהרות על המתודות (המימוש ב-${name}.cpp)
    void print();
};

#endif // ${guard}
`,
    },
    {
      name: `${name}.cpp`,
      code: `#include "${name}.h"

void ${name}::print()
{
    cout << "${name} object" << endl;
}
`,
    },
    {
      name: 'main.cpp',
      code: `#include <iostream>
#include "${name}.h"
using namespace std;

int main()
{
    ${name} obj;
    obj.print();

    return 0;
}
`,
    },
  ];
}

const TEMPLATES: { name: string; build: () => IdeFile[] }[] = [
  { name: 'תוכנית ריקה (קובץ אחד)', build: () => [{ name: 'main.cpp', code: BLANK_MAIN }] },
  { name: 'פרויקט מחלקה — h / cpp / main', build: () => classProject('MyClass') },
  { name: 'פרויקט Rect לדוגמה', build: () => classProject('Rect') },
  {
    name: 'מחלקה בקובץ אחד',
    build: () => [
      {
        name: 'main.cpp',
        code: `#include <iostream>
using namespace std;

class MyClass
{
private:
    int value;

public:
    void setValue(int v)
    {
        if (v >= 0) value = v;
        else        value = 0;
    }

    int  getValue() { return value; }
    void print()    { cout << "value = " << value << endl; }
};

int main()
{
    MyClass obj;
    obj.setValue(42);
    obj.print();
    return 0;
}
`,
      },
    ],
  },
];

/* ============================================================
   הרכיב
   ============================================================ */

export default function Ide({ req, onClose }: { req: IdeRequest; onClose: () => void }) {
  const app = useApp();

  const initial = useMemo<IdeFile[]>(() => {
    if (req.exerciseId) {
      const saved = getExerciseCode(req.exerciseId);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as IdeFile[];
          if (Array.isArray(parsed) && parsed.length) return parsed;
        } catch {
          // גרסה ישנה שמרה מחרוזת אחת
          return [{ name: 'main.cpp', code: saved }];
        }
      }
    }
    return req.files.length ? req.files : [{ name: 'main.cpp', code: BLANK_MAIN }];
  }, [req]);

  const [files, setFiles] = useState<IdeFile[]>(initial);
  const [activeIdx, setActiveIdx] = useState(0);
  const [stdin, setStdin] = useState(req.stdin ?? '');
  const [tab, setTab] = useState<'out' | 'in' | 'snips' | 'sol'>('out');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CompileResult | null>(null);
  const [projects, setProjects] = useState<SavedProject[]>(getProjects);
  const [renaming, setRenaming] = useState<number | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  /** אישור מוטבע — במקום confirm() שחוסם את הדפדפן */
  const [ask, setAsk] = useState<{ text: string; onYes: () => void } | null>(null);
  /** שורת שמירה מוטבעת — במקום prompt() */
  const [saveName, setSaveName] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const runRef = useRef<() => void>(() => {});

  const active = files[Math.min(activeIdx, files.length - 1)];

  useEffect(() => {
    defineThemes();
  }, []);

  // שמירה אוטומטית של עבודת התרגיל
  useEffect(() => {
    if (!req.exerciseId) return;
    const t = setTimeout(() => setExerciseCode(req.exerciseId!, JSON.stringify(files)), 700);
    return () => clearTimeout(t);
  }, [files, req.exerciseId]);

  const updateActive = useCallback(
    (code: string) => {
      setFiles((fs) => fs.map((f, i) => (i === activeIdx ? { ...f, code } : f)));
    },
    [activeIdx]
  );

  /* ---------- ניהול קבצים ---------- */

  const uniqueName = (base: string) => {
    let n = base;
    let i = 2;
    while (files.some((f) => f.name.toLowerCase() === n.toLowerCase())) {
      const m = base.match(/^(.*?)(\.[^.]+)?$/);
      n = `${m?.[1] ?? base}${i}${m?.[2] ?? ''}`;
      i++;
    }
    return n;
  };

  const addFile = (kind: 'h' | 'cpp') => {
    const base = kind === 'h' ? 'NewClass.h' : 'NewFile.cpp';
    const name = uniqueName(base);
    const stem = name.replace(/\.[^.]+$/, '');
    const guard = stem.toUpperCase() + '_H';
    const code =
      kind === 'h'
        ? `#ifndef ${guard}\n#define ${guard}\n\n\n\n#endif // ${guard}\n`
        : `#include "${stem}.h"\n\n`;
    setFiles([...files, { name, code }]);
    setActiveIdx(files.length);
  };

  const removeFile = (i: number) => {
    if (files.length === 1) {
      app.toast('חייב להישאר לפחות קובץ אחד');
      return;
    }
    setAsk({
      text: `למחוק את ${files[i].name}?`,
      onYes: () => {
        const next = files.filter((_, k) => k !== i);
        setFiles(next);
        setActiveIdx(Math.max(0, Math.min(activeIdx, next.length - 1)));
      },
    });
  };

  const commitRename = (i: number) => {
    const raw = renameDraft.trim();
    setRenaming(null);
    if (!raw || raw === files[i].name) return;
    if (!/^[\w.\-]+\.(h|hpp|cpp|cc|cxx|c)$/i.test(raw)) {
      app.toast('שם לא תקין — נדרשת סיומת .h או .cpp');
      return;
    }
    if (files.some((f, k) => k !== i && f.name.toLowerCase() === raw.toLowerCase())) {
      app.toast('כבר קיים קובץ בשם הזה');
      return;
    }
    setFiles(files.map((f, k) => (k === i ? { ...f, name: raw } : f)));
  };

  /* ---------- הרצה ---------- */

  const run = async () => {
    if (running) return;
    setRunning(true);
    setResult(null);
    setTab('out');
    abortRef.current = new AbortController();
    const prepared = wrapProject(files);
    const r = await runProject(prepared.files, { stdin, signal: abortRef.current.signal });
    setResult(r);
    setRunning(false);
  };
  runRef.current = run;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && renaming === null) onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, renaming]);

  const outputMatches =
    req.expectedOutput !== undefined &&
    result !== null &&
    !result.buildFailed &&
    normalize(result.programOutput) === normalize(req.expectedOutput);

  const cppCount = files.filter((f) => /\.(cpp|cc|cxx|c)$/i.test(f.name)).length;

  return (
    <div className="ide-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ide" onMouseDown={(e) => e.stopPropagation()}>
        {/* ---------- סרגל עליון ---------- */}
        <div className="ide-head">
          <div className="ide-title">
            <ITerminal size={17} />
            <span>{req.title ?? 'סביבת הפיתוח'}</span>
            {cppCount > 1 && (
              <span className="ide-badge" title="כל קובץ cpp מתקמפל בנפרד ואז מקושר">
                {cppCount} יחידות תרגום
              </span>
            )}
          </div>

          <select
            className="btn btn-sm"
            value=""
            onChange={(e) => {
              const t = TEMPLATES.find((x) => x.name === e.target.value);
              e.target.value = '';
              if (!t) return;
              setAsk({
                text: `לטעון את "${t.name}"? הקבצים הנוכחיים יוחלפו.`,
                onYes: () => {
                  setFiles(t.build());
                  setActiveIdx(0);
                  setResult(null);
                },
              });
            }}
          >
            <option value="">תבניות…</option>
            {TEMPLATES.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            className="btn btn-sm"
            onClick={() => setSaveName(req.title ?? 'הפרויקט שלי')}
          >
            <ISave size={14} /> שמור
          </button>

          <button
            className="btn btn-sm"
            onClick={() =>
              app.askAi(
                files.map((f) => `// ===== ${f.name} =====\n${f.code}`).join('\n\n') +
                  (result
                    ? `\n\n--- מה שקרה כשהרצתי ---\nהודעות הקומפיילר: ${result.compilerMessage || '(אין)'}\nפלט: ${result.programOutput || '(אין)'}`
                    : ''),
                `הפרויקט בעורך (${files.length} קבצים)`
              )
            }
          >
            ✦ שאל על הקוד
          </button>

          <button
            className="btn btn-sm btn-ghost"
            onClick={() =>
              setAsk({
                text: 'לשחזר את הקוד המקורי? כל השינויים שלך יימחקו.',
                onYes: () => {
                  setFiles(req.files);
                  setActiveIdx(0);
                  setResult(null);
                },
              })
            }
            title="החזר לקוד המקורי"
          >
            <IReset size={14} />
          </button>

          <button className="btn btn-primary btn-sm" onClick={run} disabled={running}>
            {running ? <span className="spinner" /> : <IPlay size={13} />}{' '}
            {running ? 'מריץ…' : 'הרץ'}
          </button>

          <button className="icon-btn" onClick={onClose} title="סגור (Esc)">
            <IClose size={18} />
          </button>
        </div>

        {/* ---------- אישור מוטבע ---------- */}
        {ask && (
          <div className="ide-bar warn">
            <span>{ask.text}</span>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                ask.onYes();
                setAsk(null);
              }}
            >
              כן, המשך
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => setAsk(null)}>
              ביטול
            </button>
          </div>
        )}

        {/* ---------- שמירת פרויקט ---------- */}
        {saveName !== null && (
          <div className="ide-bar">
            <span>שם הפרויקט:</span>
            <input
              className="ide-bar-input"
              autoFocus
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSaveName(null);
                if (e.key === 'Enter' && saveName.trim()) {
                  setProjects(saveProject(saveName.trim(), files));
                  setSaveName(null);
                  app.toast('הפרויקט נשמר');
                }
              }}
            />
            <button
              className="btn btn-sm btn-primary"
              disabled={!saveName.trim()}
              onClick={() => {
                setProjects(saveProject(saveName.trim(), files));
                setSaveName(null);
                app.toast('הפרויקט נשמר');
              }}
            >
              שמור
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => setSaveName(null)}>
              ביטול
            </button>
          </div>
        )}

        {/* ---------- לשוניות קבצים ---------- */}
        <div className="file-bar">
          {files.map((f, i) => (
            <div
              key={i}
              className={`file-tab${i === activeIdx ? ' active' : ''}${
                /\.(h|hpp)$/i.test(f.name) ? ' hdr' : ''
              }`}
              onClick={() => setActiveIdx(i)}
              onDoubleClick={() => {
                setRenaming(i);
                setRenameDraft(f.name);
              }}
              title="לחיצה כפולה לשינוי שם"
            >
              {renaming === i ? (
                <input
                  className="file-rename"
                  dir="ltr"
                  autoFocus
                  value={renameDraft}
                  onChange={(e) => setRenameDraft(e.target.value)}
                  onBlur={() => commitRename(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename(i);
                    if (e.key === 'Escape') setRenaming(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="file-name">{f.name}</span>
                  {files.length > 1 && (
                    <button
                      className="file-x"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      title="מחק קובץ"
                    >
                      ✕
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
          <div className="file-add">
            <button onClick={() => addFile('h')} title="הוסף קובץ כותרת">
              + .h
            </button>
            <button onClick={() => addFile('cpp')} title="הוסף קובץ מימוש">
              + .cpp
            </button>
          </div>
        </div>

        {/* ---------- גוף ---------- */}
        <div className="ide-body">
          <div className="ide-editor">
            <Editor
              key={active.name}
              height="100%"
              defaultLanguage="cpp"
              path={active.name}
              value={active.code}
              onChange={(v) => updateActive(v ?? '')}
              theme={getTheme() === 'dark' ? 'cpp-dark' : 'cpp-light'}
              onMount={(editor, monaco) => {
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
                  runRef.current()
                );
                editor.focus();
              }}
              options={{
                fontFamily: "'JetBrains Mono', Consolas, monospace",
                fontSize: 14,
                lineHeight: 1.65,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                renderWhitespace: 'selection',
                smoothScrolling: true,
                padding: { top: 14, bottom: 14 },
                bracketPairColorization: { enabled: true },
                cursorBlinking: 'smooth',
                quickSuggestions: true,
              }}
            />
          </div>

          <div className="ide-side">
            <div className="ide-tabs">
              <button className={`ide-tab${tab === 'out' ? ' active' : ''}`} onClick={() => setTab('out')}>
                פלט
              </button>
              <button className={`ide-tab${tab === 'in' ? ' active' : ''}`} onClick={() => setTab('in')}>
                קלט
              </button>
              {req.solution && (
                <button className={`ide-tab${tab === 'sol' ? ' active' : ''}`} onClick={() => setTab('sol')}>
                  פתרון
                </button>
              )}
              <button className={`ide-tab${tab === 'snips' ? ' active' : ''}`} onClick={() => setTab('snips')}>
                שמורים
              </button>
            </div>

            <div className="ide-pane">
              {tab === 'out' && (
                <OutputPane
                  running={running}
                  result={result}
                  expected={req.expectedOutput}
                  matches={outputMatches}
                  fileCount={cppCount}
                />
              )}

              {tab === 'in' && (
                <div>
                  <div className="console-label">
                    הטקסט כאן יוזן לתוכנית דרך <code style={{ direction: 'ltr' }}>cin</code>
                  </div>
                  <textarea
                    className="ide-stdin"
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder={'למשל:\n5\n3'}
                    dir="ltr"
                  />
                  <div style={{ fontSize: '.82rem', color: 'var(--fg-faint)', marginTop: 9, lineHeight: 1.65 }}>
                    כל שורה כאן מתאימה לקריאה אחת עם <code>cin &gt;&gt;</code> או <code>getline</code>.
                  </div>
                </div>
              )}

              {tab === 'sol' && req.solution && (
                <div>
                  <div className="console-label" style={{ color: 'var(--ok)' }}>
                    ✓ פתרון לדוגמה
                  </div>
                  <div className="codeblock">
                    <CodeSurface code={req.solution} />
                  </div>
                  <button
                    className="btn btn-sm btn-ghost"
                    style={{ marginTop: 10 }}
                    onClick={() => {
                      setFiles([{ name: 'main.cpp', code: req.solution! }]);
                      setActiveIdx(0);
                    }}
                  >
                    <IEye size={13} /> טען את הפתרון לעורך
                  </button>
                </div>
              )}

              {tab === 'snips' && (
                <div>
                  {projects.length === 0 ? (
                    <div className="console-empty">
                      עוד לא שמרת פרויקטים. לחץ "שמור" למעלה כדי לשמור את כל הקבצים יחד.
                    </div>
                  ) : (
                    projects.map((s) => (
                      <div className="snip-row" key={s.id}>
                        <span className="snip-name">
                          {s.name}
                          <span className="snip-files">{s.files.length} קבצים</span>
                        </span>
                        <span className="snip-date">
                          {new Date(s.savedAt).toLocaleDateString('he-IL')}
                        </span>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => {
                            setFiles(s.files);
                            setActiveIdx(0);
                            setResult(null);
                            app.toast('נטען לעורך');
                          }}
                        >
                          טען
                        </button>
                        <button
                          className="icon-btn"
                          style={{ width: 28, height: 28 }}
                          onClick={() => setProjects(deleteProject(s.id))}
                        >
                          <ITrash size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="ide-foot">
              <span className="kbd">Ctrl</span> + <span className="kbd">Enter</span> להרצה ·{' '}
              <span className="kbd">Esc</span> לסגירה · לחיצה כפולה על לשונית = שינוי שם
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   פאנל הפלט
   ============================================================ */

function OutputPane({
  running,
  result,
  expected,
  matches,
  fileCount,
}: {
  running: boolean;
  result: CompileResult | null;
  expected?: string;
  matches: boolean;
  fileCount: number;
}) {
  if (running) {
    return (
      <div className="console-empty">
        <span className="spinner" />{' '}
        {fileCount > 1
          ? `מקמפל ${fileCount} קבצים בנפרד ומקשר…`
          : 'שולח ל-g++ בשרת, מקמפל ומריץ…'}
      </div>
    );
  }
  if (!result) {
    return (
      <div className="console-empty">
        לחץ על <b>הרץ</b> כדי לקמפל את הקוד עם g++ ולראות את הפלט האמיתי.
        {fileCount > 1 && (
          <div style={{ marginTop: 10 }}>
            יש כאן {fileCount} קבצי <code>.cpp</code> — כל אחד יתקמפל <b>בנפרד</b> ואז יקושר, בדיוק
            כמו ב-Visual Studio.
          </div>
        )}
      </div>
    );
  }
  if (result.networkError) {
    return (
      <div className="console-section">
        <span className="status-pill status-bad">✕ שגיאת חיבור</span>
        <div className="console-out log" style={{ marginTop: 9 }}>
          {result.networkError}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="console-section">
        {result.linkFailed ? (
          <span className="status-pill status-bad">✕ שגיאת קישור (Linker)</span>
        ) : result.buildFailed ? (
          <span className="status-pill status-bad">✕ שגיאת קומפילציה</span>
        ) : result.status === 0 ? (
          <span className="status-pill status-ok">✓ רץ בהצלחה · exit 0</span>
        ) : (
          <span className="status-pill status-warn">⚠ הסתיים עם קוד {result.status}</span>
        )}
        <span style={{ marginInlineStart: 8, fontSize: '.74rem', color: 'var(--fg-faint)' }}>
          {result.elapsedMs} ms
        </span>
      </div>

      {result.linkFailed && (
        <div className="link-hint">
          <b>שגיאת לינקר, לא קומפילציה.</b> כל הקבצים התקמפלו בסדר — אבל המקשר לא מצא מימוש
          למשהו שהוצהר עליו. בדוק: (1) האם המימוש קיים בקובץ <code>.cpp</code> כלשהו? (2) האם
          כתבת <code>ClassName::</code> לפני שם המתודה?
        </div>
      )}

      {result.compilerMessage.trim() && (
        <div className="console-section">
          <div className="console-label">הודעות הקומפיילר / המקשר</div>
          <div
            className="console-out log ide-console"
            dangerouslySetInnerHTML={{ __html: highlightCompilerLog(result.compilerMessage) }}
          />
        </div>
      )}

      {!result.buildFailed && (
        <div className="console-section">
          <div className="console-label">פלט התוכנית (stdout)</div>
          <div className="console-out ide-console">{result.programOutput || '(ריק)'}</div>
        </div>
      )}

      {result.programError && (
        <div className="console-section">
          <div className="console-label">שגיאות זמן ריצה (stderr)</div>
          <div className="console-out ide-console" style={{ color: '#ffb3c0' }}>
            {result.programError}
          </div>
        </div>
      )}

      {expected !== undefined && !result.buildFailed && (
        <div className="console-section">
          <div className="console-label">
            {matches ? (
              <span className="status-pill status-ok">
                <ICheck size={12} /> הפלט תואם למצופה
              </span>
            ) : (
              <span className="status-pill status-warn">⚠ הפלט שונה מהמצופה</span>
            )}
          </div>
          {!matches && (
            <>
              <div className="console-label" style={{ marginTop: 8 }}>
                פלט צפוי
              </div>
              <div className="console-out ide-console">{expected}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const normalize = (s: string) =>
  s.replace(/\r/g, '').split('\n').map((l) => l.trimEnd()).join('\n').trim();

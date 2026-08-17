import { useMemo, useState } from 'react';
import { highlightCpp, highlightCompilerLog } from '../lib/highlight';
import { runProject, type CompileResult, type SourceFile } from '../lib/compile';
import { wrapProject, wrapSnippet } from '../lib/wrap';
import { renderInline } from '../lib/markdown';
import { useApp } from '../AppContext';
import { ICopy, ICheck, IPlay, ITerminal, IEye } from './Icons';
import CodeFileModal from './CodeFileModal';
import type { CodeAnnotation, CodeFile } from '../types/content';

/** רינדור קוד מודגש עם מספרי שורות ואפשרות להדגיש שורות מסוימות. */
export function CodeSurface({
  code,
  lang = 'cpp',
  highlight,
  currentLine,
  showLines = true,
}: {
  code: string;
  lang?: string;
  highlight?: number[];
  currentLine?: number;
  showLines?: boolean;
}) {
  const lines = useMemo(() => {
    const src = code.replace(/\n$/, '');
    const html = lang === 'cpp' ? highlightCpp(src) : escapeHtml(src);
    return html.split('\n');
  }, [code, lang]);

  const hl = new Set(highlight ?? []);

  return (
    <pre className={`code${showLines ? '' : ' code-nolines'}`}>
      <code>
        {lines.map((l, i) => {
          const n = i + 1;
          const cls = ['cl'];
          if (hl.has(n)) cls.push('hl');
          if (currentLine === n) cls.push('cur');
          return (
            <span key={n} className={cls.join(' ')}>
              <span className="ln">{n}</span>
              <span dangerouslySetInnerHTML={{ __html: l || ' ' }} />
            </span>
          );
        })}
      </code>
    </pre>
  );
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export interface CodeBlockProps {
  code?: string;
  files?: CodeFile[];
  lang?: 'cpp' | 'text' | 'bash' | 'output';
  title?: string;
  highlight?: number[];
  annotations?: CodeAnnotation[];
  output?: string;
  runnable?: boolean;
  stdin?: string;
  broken?: boolean;
  caption?: string;
  /** מבטל עטיפה אוטומטית — לקטעים שאמורים להיכשל בכוונה */
  noWrap?: boolean;
  /** הגדרות שהקטע נשען עליהן ולא מוצגות בו */
  prelude?: string;
}

export default function CodeBlock(p: CodeBlockProps) {
  const app = useApp();
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<CompileResult | null>(null);
  const [showSent, setShowSent] = useState(false);
  const [showFile, setShowFile] = useState(false);
  /* קלט (stdin) שהתלמיד עצמו כותב לפני הרצה מהירה בעמוד — בלי זה כפתור "הרץ" רק
     מפעיל את ה-stdin הקבוע שהמחבר הגדיר (אם בכלל) והתלמיד לא "מרגיש" תוכנית
     אינטראקטיבית עם cin. סביבת הפיתוח המלאה כבר תומכת בזה; זה משלים את זה גם
     בהרצה המהירה בתוך השיעור. */
  const [stdinOpen, setStdinOpen] = useState(false);
  const [stdin, setStdin] = useState(p.stdin ?? '');

  const files = p.files;
  const active = files ? files[Math.min(tab, files.length - 1)] : null;
  const shown = active ? active.code : (p.code ?? '');

  /** מה באמת נשלח לקומפיילר, אחרי עטיפה חכמה */
  const prepared = useMemo(() => {
    if (p.noWrap) {
      return {
        files: files ?? [{ name: 'main.cpp', code: p.code ?? '' }],
        changed: false,
        notes: [] as string[],
      };
    }
    if (files && files.length > 0) return wrapProject(files);
    const w = wrapSnippet(p.code ?? '', p.prelude);
    return { files: [{ name: 'main.cpp', code: w.code }], changed: w.changed, notes: w.notes };
  }, [files, p.code, p.noWrap, p.prelude]);

  const copy = () => {
    navigator.clipboard.writeText(shown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  const run = async () => {
    setRunning(true);
    setResult(null);
    const r = await runProject(prepared.files as SourceFile[], { stdin });
    setResult(r);
    setRunning(false);
  };

  const isCpp = (p.lang ?? 'cpp') === 'cpp';

  return (
    <div>
      <div className={`codeblock${p.broken ? ' broken' : ''}`}>
        {(p.title || !files) && (
          <div className="code-head">
            {p.broken && <span style={{ color: '#ff8095' }}>✕</span>}
            <span className="code-file">{p.title ?? (isCpp ? 'C++' : p.lang)}</span>
            <div className="code-head-actions">
              <button className="code-act" onClick={copy}>
                {copied ? <ICheck size={12} /> : <ICopy size={12} />} {copied ? 'הועתק' : 'העתק'}
              </button>
              {/* עורך קוד/הרצה (Wandbox) — דסקטופ בלבד. במובייל אין סביבת הרצה כלל */}
              {isCpp && (
                <span className="code-desktop-actions">
                  <button
                    className="code-act"
                    onClick={() =>
                      app.openIde({
                        files: prepared.files,
                        title: p.title ?? 'קוד מהשיעור',
                        stdin,
                      })
                    }
                  >
                    <ITerminal size={12} /> פתח בעורך
                  </button>
                  {p.runnable && (
                    <button
                      className={`code-act${stdinOpen ? ' on' : ''}`}
                      onClick={() => setStdinOpen((s) => !s)}
                      title="כתבו קלט שהתוכנית תקרא עם cin לפני ההרצה"
                    >
                      <IEye size={12} /> קלט{stdin.trim() ? ' •' : ''}
                    </button>
                  )}
                  {p.runnable && (
                    <button className="code-act run" onClick={run} disabled={running}>
                      {running ? <span className="spinner" /> : <IPlay size={11} />}{' '}
                      {running ? 'מריץ…' : 'הרץ'}
                    </button>
                  )}
                </span>
              )}
              {/* צפייה בקובץ המלא בחלון גלילה במרכז המסך — מובייל בלבד */}
              {isCpp && (
                <button className="code-act code-mobile-actions" onClick={() => setShowFile(true)}>
                  <IEye size={12} /> הצג קובץ מלא
                </button>
              )}
            </div>
          </div>
        )}

        {files && files.length > 1 && (
          <div className="code-tabs">
            {files.map((f, i) => (
              <button
                key={f.name}
                className={`code-tab${i === tab ? ' active' : ''}`}
                onClick={() => setTab(i)}
              >
                {f.name}
              </button>
            ))}
          </div>
        )}

        <CodeSurface code={shown} lang={isCpp ? 'cpp' : 'text'} highlight={p.highlight} />

        {p.annotations && p.annotations.length > 0 && (
          <div className="code-annots">
            {p.annotations.map((a, i) => (
              <div className="annot-line" key={i}>
                <span className="annot-num">{a.line}</span>
                <span>{a.text}</span>
              </div>
            ))}
          </div>
        )}

        {p.runnable && stdinOpen && (
          <div className="inline-stdin">
            <div className="console-label">
              קלט לתוכנית — הטקסט כאן יוזן דרך <code style={{ direction: 'ltr' }}>cin</code> לפני
              ההרצה
            </div>
            <textarea
              className="ide-stdin"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder={'למשל:\n5\n3'}
              dir="ltr"
            />
          </div>
        )}

        {/* --- הודעת עטיפה: מה הוספנו כדי שזה ירוץ --- */}
        {p.runnable && prepared.changed && (
          <WrapNotice
            notes={prepared.notes}
            files={prepared.files}
            open={showSent}
            onToggle={() => setShowSent((s) => !s)}
          />
        )}

        {p.output && !result && (
          <div className="output">
            <div className="output-head">▸ פלט התוכנית</div>
            <pre className="output-body">{p.output}</pre>
          </div>
        )}

        {running && (
          <div className="output">
            <div className="output-head">
              <span className="spinner" /> מקמפל עם g++ ומריץ…
            </div>
          </div>
        )}

        {result && <RunResult r={result} />}
      </div>
      {p.caption && <div className="code-caption">{p.caption}</div>}

      {showFile && (
        <CodeFileModal
          files={files ?? [{ name: p.title ?? 'main.cpp', code: p.code ?? '' }]}
          title={p.title}
          annotations={p.annotations}
          caption={p.caption}
          onClose={() => setShowFile(false)}
        />
      )}
    </div>
  );
}

function WrapNotice({
  notes,
  files,
  open,
  onToggle,
}: {
  notes: string[];
  files: { name: string; code: string }[];
  open: boolean;
  onToggle: () => void;
}) {
  const [tab, setTab] = useState(0);
  const f = files[Math.min(tab, files.length - 1)];
  return (
    <div className="wrap-notice">
      <div className="wrap-head">
        <span className="wrap-icon">⚙</span>
        <div className="wrap-notes">
          <b>הקטע במצגת אינו תוכנית שלמה — הושלם אוטומטית כדי שיוכל לרוץ:</b>
          <ul>
            {notes.map((n, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(n) }} />
            ))}
          </ul>
        </div>
        <button className="code-act" onClick={onToggle}>
          <IEye size={12} /> {open ? 'הסתר' : 'הצג את הקובץ המלא'}
        </button>
      </div>
      {open && (
        <div className="wrap-body">
          {files.length > 1 && (
            <div className="code-tabs">
              {files.map((x, i) => (
                <button
                  key={x.name}
                  className={`code-tab${i === tab ? ' active' : ''}`}
                  onClick={() => setTab(i)}
                >
                  {x.name}
                </button>
              ))}
            </div>
          )}
          <CodeSurface code={f.code} />
        </div>
      )}
    </div>
  );
}

export function RunResult({ r }: { r: CompileResult }) {
  if (r.networkError) {
    return (
      <div className="output">
        <div className="output-head">✕ שגיאת חיבור</div>
        <pre className="output-body err">{r.networkError}</pre>
      </div>
    );
  }
  const hasLog = r.compilerMessage.trim().length > 0;
  return (
    <div className="output">
      <div className="output-head">
        {r.buildFailed
          ? r.linkFailed
            ? '✕ שגיאת קישור (Linker)'
            : '✕ שגיאת קומפילציה'
          : `▸ פלט התוכנית · קוד יציאה ${r.status}`}
        <span style={{ marginInlineStart: 'auto', opacity: 0.6 }}>{r.elapsedMs} ms</span>
      </div>
      {hasLog && (
        <pre
          className="output-body err"
          style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}
          dangerouslySetInnerHTML={{ __html: highlightCompilerLog(r.compilerMessage) }}
        />
      )}
      {!r.buildFailed && (
        <pre className="output-body">{r.programOutput || r.programError || '(אין פלט)'}</pre>
      )}
    </div>
  );
}

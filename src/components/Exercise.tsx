import { useState } from 'react';
import { useApp } from '../AppContext';
import { renderInline } from '../lib/markdown';
import CodeBlock from './CodeBlock';
import { IBulb, IEye, ITerminal } from './Icons';

const LEVEL_LABEL = { 1: 'קל', 2: 'בינוני', 3: 'מאתגר' } as const;

export default function Exercise({
  id,
  title,
  level,
  brief,
  requirements,
  starter,
  hints,
  solution,
  expectedOutput,
  stdin,
}: {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  brief: string;
  requirements?: string[];
  starter: string;
  hints: string[];
  solution: string;
  expectedOutput?: string;
  stdin?: string;
}) {
  const app = useApp();
  const [shownHints, setShownHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="exercise">
      <div className="ex-head">
        <div className="ex-top">
          <span className={`lvl lvl-${level}`}>
            {'●'.repeat(level)}
            {'○'.repeat(3 - level)} {LEVEL_LABEL[level]}
          </span>
          <div className="ex-title">{title}</div>
        </div>
        <div className="ex-brief" dangerouslySetInnerHTML={{ __html: renderInline(brief) }} />
        {requirements && requirements.length > 0 && (
          <ol className="ex-reqs">
            {requirements.map((r, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(r) }} />
            ))}
          </ol>
        )}
      </div>

      <div className="ex-body">
        <div className="ex-actions">
          {/* סביבת פיתוח/הרצה — דסקטופ בלבד, אין עורך קוד במובייל */}
          <button
            className="btn btn-primary btn-sm ide-desktop-only"
            onClick={() =>
              app.openIde({
                files: [{ name: 'main.cpp', code: starter }],
                title: `תרגיל: ${title}`,
                exerciseId: id,
                solution,
                expectedOutput,
                stdin,
              })
            }
          >
            <ITerminal size={14} /> פתח בסביבת הפיתוח
          </button>
          <span className="ex-mobile-note">
            תרגול אינטראקטיבי (כתיבה והרצה) זמין בגרסת דסקטופ. במובייל אפשר לקרוא את הרמזים,
            לצפות בפתרון ולשאול את ה-AI.
          </span>

          {shownHints < hints.length && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setShownHints((n) => n + 1)}
            >
              <IBulb size={14} /> רמז {shownHints + 1} מתוך {hints.length}
            </button>
          )}

          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setShowSolution((s) => !s)}
          >
            <IEye size={14} /> {showSolution ? 'הסתר פתרון' : 'הצג פתרון'}
          </button>

          <button
            className="btn btn-sm btn-ghost"
            onClick={() =>
              app.askAi(
                `תרגיל: ${title}\n${brief}\nקוד פתיחה:\n${starter}`,
                `התרגיל "${title}"`,
                'תכוון אותי לפתרון בלי לתת לי את הקוד המלא'
              )
            }
          >
            ✦ תכוון אותי
          </button>
        </div>

        {hints.slice(0, shownHints).map((h, i) => (
          <div className="hint-box" key={i}>
            <span className="hint-num">רמז {i + 1}</span>
            <span dangerouslySetInnerHTML={{ __html: renderInline(h) }} />
          </div>
        ))}

        {expectedOutput && (
          <div style={{ marginTop: 14 }}>
            <div className="pitfall-label">פלט צפוי</div>
            <div className="codeblock">
              <div className="output" style={{ borderTop: 'none' }}>
                <pre className="output-body">{expectedOutput}</pre>
              </div>
            </div>
          </div>
        )}

        {showSolution && (
          <div style={{ marginTop: 14 }}>
            <div className="pitfall-label" style={{ color: 'var(--ok)' }}>
              ✓ פתרון מלא
            </div>
            <CodeBlock code={solution} title="פתרון" runnable stdin={stdin} />
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { CodeSurface } from './CodeBlock';
import { useApp } from '../AppContext';
import { IClose, ISparkle } from './Icons';
import type { CodeAnnotation, CodeFile } from '../types/content';

/**
 * תצוגת "קובץ מלא" למובייל: אין עורך קוד/סביבת הרצה במובייל בכלל (ראו MOBILE_UX_SPEC.md),
 * אז כשמשתמש רוצה לראות קובץ שלם — נפתח חלון גלילה במרכז המסך עם הקוד וההסברים הרלוונטיים
 * (כמו בשיעור עצמו), במקום "לפתוח בעורך". לא ניתן להריץ מכאן — רק לקרוא ולשלוח ל-AI.
 */
export default function CodeFileModal({
  files,
  title,
  annotations,
  caption,
  onClose,
}: {
  files: CodeFile[];
  title?: string;
  annotations?: CodeAnnotation[];
  caption?: string;
  onClose: () => void;
}) {
  const app = useApp();
  const [tab, setTab] = useState(0);
  const active = files[Math.min(tab, files.length - 1)];

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-code" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">{title ?? 'הקובץ המלא'}</div>
          <button
            className="btn btn-sm"
            onClick={() =>
              app.askAi(
                files.map((f) => `// ===== ${f.name} =====\n${f.code}`).join('\n\n'),
                title ?? 'הקובץ המלא'
              )
            }
          >
            <ISparkle size={13} /> שאל את ה-AI
          </button>
          <button className="icon-btn" onClick={onClose} title="סגור">
            <IClose size={17} />
          </button>
        </div>

        {files.length > 1 && (
          <div className="code-tabs modal-code-tabs">
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

        <div className="modal-body modal-code-body">
          <div className="codeblock">
            <CodeSurface code={active.code} />
          </div>

          {annotations && annotations.length > 0 && (
            <div className="code-annots">
              {annotations.map((a, i) => (
                <div className="annot-line" key={i}>
                  <span className="annot-num">{a.line}</span>
                  <span>{a.text}</span>
                </div>
              ))}
            </div>
          )}

          {caption && <div className="code-caption">{caption}</div>}
        </div>
      </div>
    </div>
  );
}

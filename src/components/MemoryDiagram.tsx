import { useEffect, useRef, useState } from 'react';
import { CodeSurface } from './CodeBlock';
import { renderInline } from '../lib/markdown';
import { IChevRight, IChevLeft, IPlay, IReset, IStack } from './Icons';
import type { MemFrame, MemHeapObj, MemVar, MemoryStep } from '../types/content';

export default function MemoryDiagram({
  title,
  intro,
  code,
  steps,
}: {
  title?: string;
  intro?: string;
  code: string;
  steps: MemoryStep[];
}) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);

  const step = steps[i];
  const last = i >= steps.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (last) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => setI((x) => x + 1), 1700);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, i, last]);

  // ניווט במקלדת כשהרכיב במיקוד
  const onKey = (e: React.KeyboardEvent) => {
    // ב-RTL: חץ שמאל = קדימה
    if (e.key === 'ArrowLeft') { e.preventDefault(); setI((x) => Math.min(x + 1, steps.length - 1)); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setI((x) => Math.max(x - 1, 0)); }
  };

  return (
    <div className="mem" tabIndex={0} onKeyDown={onKey}>
      <div className="mem-head">
        <div className="mem-title">
          <IStack size={17} /> {title ?? 'מה קורה בזיכרון'}
        </div>
        {intro && (
          <div className="mem-intro" dangerouslySetInnerHTML={{ __html: renderInline(intro) }} />
        )}
      </div>

      <div className="mem-body">
        <div className="mem-code">
          <CodeSurface code={code} currentLine={step.line} />
        </div>

        <div className="mem-viz">
          <div className="mem-region">
            <div className="mem-region-label">
              STACK <span style={{ opacity: 0.6, fontWeight: 400 }}>· מחסנית</span>
            </div>
            {step.stack.length === 0 ? (
              <div className="mem-empty">ריקה</div>
            ) : (
              // המסגרת האחרונה שנקראה מוצגת למעלה, כמו מחסנית אמיתית
              [...step.stack].reverse().map((f, k) => <Frame key={f.label + k} f={f} />)
            )}
          </div>

          <div className="mem-region">
            <div className="mem-region-label">
              HEAP <span style={{ opacity: 0.6, fontWeight: 400 }}>· ערימה</span>
            </div>
            {!step.heap || step.heap.length === 0 ? (
              <div className="mem-empty">ריקה — לא הוקצה כלום עם new</div>
            ) : (
              step.heap.map((o) => <HeapObj key={o.id} o={o} />)
            )}
          </div>
        </div>
      </div>

      {step.output !== undefined && step.output !== '' && (
        <div className="mem-out">{step.output}</div>
      )}

      <div className="mem-caption">
        <span dangerouslySetInnerHTML={{ __html: renderInline(step.caption) }} />
        {step.detail && (
          <div
            className="mem-detail"
            dangerouslySetInnerHTML={{ __html: renderInline(step.detail) }}
          />
        )}
      </div>

      <div className="mem-ctrl">
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => setI((x) => Math.max(x - 1, 0))}
          disabled={i === 0}
        >
          <IChevRight size={14} /> קודם
        </button>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => setI((x) => Math.min(x + 1, steps.length - 1))}
          disabled={last}
        >
          הבא <IChevLeft size={14} />
        </button>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => {
            if (last) { setI(0); setPlaying(true); }
            else setPlaying((p) => !p);
          }}
          title="הרצה אוטומטית"
        >
          {playing ? '⏸' : <IPlay size={12} />}
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => { setI(0); setPlaying(false); }} title="התחל מחדש">
          <IReset size={13} />
        </button>

        <div className="mem-steps-dots">
          {steps.map((_, k) => (
            <button
              key={k}
              className={`mem-dot${k === i ? ' cur' : k < i ? ' done' : ''}`}
              onClick={() => { setI(k); setPlaying(false); }}
              aria-label={`צעד ${k + 1}`}
            />
          ))}
        </div>
        <span className="mem-counter">
          {i + 1} / {steps.length}
        </span>
      </div>
    </div>
  );
}

function Frame({ f }: { f: MemFrame }) {
  return (
    <div className={`mem-frame${f.active ? ' active' : ''}`}>
      <div className="mem-frame-label">{f.label}</div>
      <div className="mem-vars">
        {f.vars.length === 0 ? (
          <div className="mem-empty" style={{ padding: '6px 10px' }}>
            (אין משתנים מקומיים עדיין)
          </div>
        ) : (
          f.vars.map((v, i) => <Var key={v.name + i} v={v} />)
        )}
      </div>
    </div>
  );
}

function HeapObj({ o }: { o: MemHeapObj }) {
  return (
    <div className={`mem-heap-obj${o.state ? ' s-' + o.state : ''}`}>
      <div className="mem-heap-label">
        <span>{o.label}</span>
        {o.addr && <span className="mem-addr">{o.addr}</span>}
      </div>
      <div className="mem-vars">
        {o.fields.map((v, i) => (
          <Var key={v.name + i} v={v} />
        ))}
      </div>
      {o.state === 'freed' && (
        <div style={{ padding: '4px 10px', fontSize: '.72rem', color: 'var(--err)' }}>
          שוחרר ב-delete — הזיכרון כבר לא שלנו
        </div>
      )}
      {o.state === 'leaked' && (
        <div style={{ padding: '4px 10px', fontSize: '.72rem', color: 'var(--err)', fontWeight: 700 }}>
          ⚠ דליפת זיכרון — אין יותר מצביע שמגיע לכאן
        </div>
      )}
    </div>
  );
}

function Var({ v }: { v: MemVar }) {
  return (
    <div className={`mem-var${v.state ? ' s-' + v.state : ''}`}>
      <span className="mem-var-name">
        {v.type && <span className="mem-var-type">{v.type} </span>}
        {v.name}
        {v.addr && <span className="mem-addr"> @{v.addr}</span>}
      </span>
      <span className="mem-var-val">{v.value}</span>
    </div>
  );
}

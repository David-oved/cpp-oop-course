import { renderInline } from '../lib/markdown';
import { blockLabel, blockToText } from '../lib/sectionText';
import { useApp } from '../AppContext';
import CodeBlock, { CodeSurface } from './CodeBlock';
import MemoryDiagram from './MemoryDiagram';
import Quiz from './Quiz';
import Exercise from './Exercise';
import { ISparkle } from './Icons';
import type { Block, CalloutVariant } from '../types/content';
import { sanitizeSvg } from '../lib/sanitize';

const CALLOUT_META: Record<CalloutVariant, { icon: string; label: string }> = {
  info: { icon: 'ℹ', label: 'שים לב' },
  tip: { icon: '✓', label: 'טיפ' },
  warn: { icon: '⚠', label: 'זהירות' },
  danger: { icon: '✕', label: 'שגיאה נפוצה' },
  exam: { icon: '★', label: 'רלוונטי למבחן' },
  modern: { icon: '⟳', label: 'C++ מודרני' },
  crefresh: { icon: '↺', label: 'רענון מ-C' },
  slide: { icon: '▤', label: 'מהמצגת' },
};

export default function BlockRenderer({
  block,
  index,
  sectionId,
}: {
  block: Block;
  index: number;
  sectionId: string;
}) {
  const app = useApp();
  const askable = block.kind !== 'divider' && block.kind !== 'heading';

  return (
    <div className="block">
      {askable && (
        <button
          className="block-ask"
          title="שאל את ה-AI על הקטע הזה"
          onClick={() => app.askAi(blockToText(block), blockLabel(block))}
        >
          <ISparkle size={15} />
        </button>
      )}
      <Inner block={block} index={index} sectionId={sectionId} />
    </div>
  );
}

function Inner({
  block: b,
  index,
  sectionId,
}: {
  block: Block;
  index: number;
  sectionId: string;
}) {
  switch (b.kind) {
    case 'heading': {
      const Tag = (`h${b.level}` as unknown) as 'h2';
      return <Tag className="b-h">{b.text}</Tag>;
    }

    case 'prose':
      return (
        <p className="prose" dangerouslySetInnerHTML={{ __html: renderInline(b.md) }} />
      );

    case 'list': {
      const Tag = b.ordered ? 'ol' : 'ul';
      return (
        <div>
          {b.title && <div className="b-list-title">{b.title}</div>}
          <Tag className="b-list">
            {b.items.map((it, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(it) }} />
            ))}
          </Tag>
        </div>
      );
    }

    case 'callout': {
      const m = CALLOUT_META[b.variant];
      return (
        <div className={`callout c-${b.variant}`}>
          <div className="callout-head">
            <span className="callout-icon">{m.icon}</span>
            {b.title ?? m.label}
          </div>
          <div dangerouslySetInnerHTML={{ __html: renderInline(b.md) }} />
        </div>
      );
    }

    case 'code':
      return (
        <CodeBlock
          code={b.code}
          files={b.files}
          lang={b.lang}
          title={b.title}
          highlight={b.highlight}
          annotations={b.annotations}
          output={b.output}
          runnable={b.runnable}
          stdin={b.stdin}
          broken={b.broken}
          noWrap={b.noWrap}
          prelude={b.prelude}
          caption={b.caption}
        />
      );

    case 'compare':
      return (
        <div>
          {b.title && <div className="compare-title">{b.title}</div>}
          <div className="compare">
            {[b.left, b.right].map((side, i) => (
              <div className="cmp-col" key={i}>
                <div className={`cmp-head cmp-${side.verdict ?? 'neutral'}`}>
                  <span>
                    {side.verdict === 'good' ? '✓' : side.verdict === 'bad' ? '✕' : '•'}
                  </span>
                  {side.title}
                </div>
                <div className="codeblock">
                  <CodeSurface code={side.code} />
                </div>
                {side.note && (
                  <div
                    className="cmp-note"
                    dangerouslySetInnerHTML={{ __html: renderInline(side.note) }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'memory':
      return (
        <MemoryDiagram title={b.title} intro={b.intro} code={b.code} steps={b.steps} />
      );

    case 'quiz':
      return (
        <Quiz
          id={`${sectionId}.q${index}`}
          question={b.question}
          code={b.code}
          multi={b.multi}
          options={b.options}
        />
      );

    case 'pitfall':
      return (
        <div className="pitfall">
          <div className="pitfall-head">
            <span>⚠</span> {b.title}
          </div>
          <div className="pitfall-body">
            <div>
              <div className="pitfall-label">הקוד הבעייתי</div>
              <div className="codeblock broken">
                <CodeSurface code={b.badCode} />
              </div>
            </div>
            {b.error && (
              <div>
                <div className="pitfall-label">מה הקומפיילר אומר</div>
                <div className="pitfall-err">{b.error}</div>
              </div>
            )}
            <div>
              <div className="pitfall-label">למה זה קורה</div>
              <div
                className="pitfall-explain"
                dangerouslySetInnerHTML={{ __html: renderInline(b.explain) }}
              />
            </div>
            {b.goodCode && (
              <div>
                <div className="pitfall-label" style={{ color: 'var(--ok)' }}>
                  ✓ התיקון
                </div>
                <div className="codeblock">
                  <CodeSurface code={b.goodCode} />
                </div>
                {b.goodNote && (
                  <div
                    className="cmp-note"
                    style={{ marginTop: 8 }}
                    dangerouslySetInnerHTML={{ __html: renderInline(b.goodNote) }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      );

    case 'exercise':
      return (
        <Exercise
          id={b.id}
          title={b.title}
          level={b.level}
          brief={b.brief}
          requirements={b.requirements}
          starter={b.starter}
          hints={b.hints}
          solution={b.solution}
          expectedOutput={b.expectedOutput}
          stdin={b.stdin}
        />
      );

    case 'table':
      return (
        <div>
          {b.title && <div className="tbl-title">{b.title}</div>}
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  {b.headers.map((h, i) => (
                    <th key={i} dangerouslySetInnerHTML={{ __html: renderInline(h) }} />
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j} dangerouslySetInnerHTML={{ __html: renderInline(c) }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {b.caption && <div className="tbl-caption">{b.caption}</div>}
        </div>
      );

    case 'terms':
      return (
        <div>
          {b.title && <div className="tbl-title">{b.title}</div>}
          <div className="terms-grid">
            {b.items.map((t, i) => (
              <div className="term-card" key={i}>
                <div className="term-he">{t.he}</div>
                <div className="term-en">{t.en}</div>
                {t.note && (
                  <div
                    className="term-note"
                    dangerouslySetInnerHTML={{ __html: renderInline(t.note) }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'steps':
      return (
        <div>
          {b.title && <div className="tbl-title">{b.title}</div>}
          <div className="steps">
            {b.items.map((s, i) => (
              <div className="step" key={i}>
                <div className="step-num">{i + 1}</div>
                <div className="step-content">
                  <div className="step-title">{s.title}</div>
                  <div
                    className="step-md"
                    dangerouslySetInnerHTML={{ __html: renderInline(s.md) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'diagram':
      return (
        <div className="diagram">
          {b.title && <div className="diagram-title">{b.title}</div>}
          <div dangerouslySetInnerHTML={{ __html: sanitizeSvg(b.svg) }} />
          {b.caption && <div className="diagram-cap">{b.caption}</div>}
        </div>
      );

    case 'divider':
      return <hr className="divider" />;

    /* בלוק מסוג לא מוכר (למשל תוכן שנוצר על ידי AI עם kind עתידי/שגוי) —
       לא נזרקת שגיאה ולא "נעלם בשקט" (ה-switch הזה נשען על exhaustiveness
       של TypeScript שלא קיימת בזמן ריצה על תוכן חיצוני). ראה AGENTS.md §13 0.2. */
    default: {
      const kind = (b as { kind?: unknown }).kind;
      return (
        <div className="callout c-warn">
          <div className="callout-head">
            <span className="callout-icon">⚠</span> בלוק לא נתמך
          </div>
          <div>
            סוג התוכן{kind ? ` "${String(kind)}"` : ''} אינו מוכר לגרסה הזו של האפליקציה ולכן
            לא הוצג.
          </div>
        </div>
      );
    }
  }
}

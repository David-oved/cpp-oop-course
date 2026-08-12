import { useState } from 'react';
import { CodeSurface } from './CodeBlock';
import { renderInline } from '../lib/markdown';
import { getQuizState, saveQuizAnswer } from '../lib/storage';
import { useApp } from '../AppContext';

const KEYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו'];

export default function Quiz({
  id,
  question,
  code,
  multi,
  options,
}: {
  id: string;
  question: string;
  code?: string;
  multi?: boolean;
  options: { text: string; correct: boolean; explain: string }[];
}) {
  const app = useApp();
  const saved = getQuizState()[id];
  const [picked, setPicked] = useState<number[]>(saved?.picked ?? []);
  const [revealed, setRevealed] = useState<boolean>(saved?.revealed ?? false);

  const correctIdx = options.map((o, i) => (o.correct ? i : -1)).filter((i) => i >= 0);
  const isRight =
    picked.length === correctIdx.length && picked.every((p) => correctIdx.includes(p));

  const pick = (i: number) => {
    if (revealed) return;
    if (multi) {
      setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
    } else {
      setPicked([i]);
      const ok = options[i].correct;
      setRevealed(true);
      saveQuizAnswer(id, { picked: [i], revealed: true, correct: ok });
    }
  };

  const check = () => {
    setRevealed(true);
    saveQuizAnswer(id, { picked, revealed: true, correct: isRight });
  };

  const retry = () => {
    setPicked([]);
    setRevealed(false);
    saveQuizAnswer(id, { picked: [], revealed: false, correct: false });
  };

  return (
    <div className="quiz">
      <div className="quiz-tag">? בדיקת הבנה{multi ? ' · בחירה מרובה' : ''}</div>
      <div className="quiz-q" dangerouslySetInnerHTML={{ __html: renderInline(question) }} />
      {code && (
        <div className="codeblock" style={{ marginBottom: 13 }}>
          <CodeSurface code={code} />
        </div>
      )}
      <div className="quiz-opts">
        {options.map((o, i) => {
          const sel = picked.includes(i);
          const cls = ['quiz-opt'];
          if (revealed) {
            if (o.correct) cls.push('right');
            else if (sel) cls.push('wrong');
          } else if (sel) cls.push('picked');
          return (
            <button
              key={i}
              className={cls.join(' ')}
              onClick={() => pick(i)}
              disabled={revealed}
            >
              <span className="opt-key">{KEYS[i] ?? i + 1}</span>
              <span className="opt-body">
                <span dangerouslySetInnerHTML={{ __html: renderInline(o.text) }} />
                {revealed && (sel || o.correct) && (
                  <span
                    className="opt-explain"
                    dangerouslySetInnerHTML={{ __html: renderInline(o.explain) }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="quiz-actions">
        {multi && !revealed && (
          <button className="btn btn-sm btn-primary" onClick={check} disabled={picked.length === 0}>
            בדוק תשובה
          </button>
        )}
        {revealed && (
          <>
            <span className={`quiz-verdict ${isRight ? 'ok' : 'no'}`}>
              {isRight ? '✓ נכון!' : '✕ לא מדויק'}
            </span>
            <button className="btn btn-sm btn-ghost" onClick={retry}>
              נסה שוב
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() =>
                app.askAi(
                  `שאלה: ${question}\n${code ?? ''}\nהאפשרויות:\n${options
                    .map((o, i) => `${KEYS[i]}. ${o.text}${o.correct ? ' (הנכונה)' : ''}`)
                    .join('\n')}\nבחרתי: ${picked.map((p) => KEYS[p]).join(', ') || '—'}`,
                  'שאלת החידון',
                  'תסביר לי למה זו התשובה הנכונה, ולמה מה שבחרתי לא נכון'
                )
              }
            >
              ✦ תסביר לי
            </button>
          </>
        )}
      </div>
    </div>
  );
}

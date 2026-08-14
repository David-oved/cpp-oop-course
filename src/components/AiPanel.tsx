import { useEffect, useRef, useState } from 'react';
import { activeSetup, suggestedQuestions, type AskContext, type ChatTurn } from '../lib/ai';
import { renderMarkdown } from '../lib/markdown';
import { IClose, ISend, ISparkle, ISettings } from './Icons';

export interface AiFocus {
  text: string;
  label: string;
}

export default function AiPanel({
  ctx,
  focus,
  clearFocus,
  pendingQuestion,
  clearPending,
  onClose,
  onOpenSettings,
  turns,
  streaming,
  busy,
  error,
  send: sendChat,
  stop: stopChat,
  reset: resetChat,
}: {
  ctx: AskContext;
  focus: AiFocus | null;
  clearFocus: () => void;
  pendingQuestion: string | null;
  clearPending: () => void;
  onClose: () => void;
  onOpenSettings: () => void;
  /** state ומתודות השיחה — חיים ב-App כדי לשרוד סגירה/פתיחה מחדש של הפאנל וניווט בין עמודים */
  turns: ChatTurn[];
  streaming: string;
  busy: boolean;
  error: string | null;
  send: (text: string, ctx: AskContext) => void;
  stop: () => void;
  reset: () => void;
}) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const setup = activeSetup();
  const hasKey = Boolean(setup.key);

  // גלילה אוטומטית למטה
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, streaming, error]);

  // שאלה מוכנה שהגיעה מכפתור בעמוד
  useEffect(() => {
    if (pendingQuestion) {
      setDraft(pendingQuestion);
      clearPending();
      setTimeout(() => taRef.current?.focus(), 60);
    }
  }, [pendingQuestion, clearPending]);

  // העתקה מבלוקי קוד בתשובות
  useEffect(() => {
    const h = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.classList.contains('md-copy')) {
        const c = t.getAttribute('data-code');
        if (c) {
          const tmp = document.createElement('textarea');
          tmp.innerHTML = c;
          navigator.clipboard.writeText(tmp.value);
          t.textContent = 'הועתק ✓';
          setTimeout(() => (t.textContent = 'העתק'), 1400);
        }
      }
    };
    const el = scrollRef.current;
    el?.addEventListener('click', h);
    return () => el?.removeEventListener('click', h);
  }, []);

  const [localError, setLocalError] = useState<string | null>(null);
  const shownError = localError ?? error;

  const send = (text?: string) => {
    const q = (text ?? draft).trim();
    if (!q || busy) return;
    if (!hasKey) {
      setLocalError(`לא הוגדר מפתח עבור ${setup.provider.vendor}. פתח את ההגדרות ובחר ספק.`);
      return;
    }

    setLocalError(null);
    setDraft('');

    const fullCtx: AskContext = {
      ...ctx,
      focus: focus?.text,
      focusLabel: focus?.label,
    };

    sendChat(q, fullCtx);
  };

  return (
    <aside className={`ai-panel${focus ? ' ai-panel-popup' : ''}`}>
      <div className="ai-head">
        <div className="ai-avatar">
          <ISparkle size={16} />
        </div>
        <div className="ai-titles">
          <div className="ai-title">
            עוזר הלימוד
            <span
              className="ai-model"
              title={`${setup.provider.vendor}${setup.model ? ' · ' + setup.model : ' · המודל ייבחר אוטומטית'}`}
            >
              {setup.provider.mark} {setup.model || setup.provider.name}
            </span>
          </div>
          <div className="ai-ctx" title={ctx.sectionTitle}>
            {ctx.sectionTitle}
          </div>
        </div>
        {turns.length > 0 && (
          <button className="btn btn-sm btn-ghost" onClick={resetChat}>
            שיחה חדשה
          </button>
        )}
        <button className="icon-btn" onClick={onClose} title="סגור">
          <IClose size={17} />
        </button>
      </div>

      <div className="ai-scroll" ref={scrollRef}>
        {focus && (
          <div className="ai-focus-chip">
            ממוקד ב: {focus.label}
            <button onClick={clearFocus} title="הסר מיקוד">
              ✕
            </button>
          </div>
        )}

        {!hasKey && (
          <div className="ai-error">
            כדי להשתמש בעוזר צריך מפתח API. אפשר לבחור בין <b>Claude</b>, <b>ChatGPT</b> ו-
            <b>Gemini</b> — ל-Gemini יש רמה חינמית בלי כרטיס אשראי.
            <button
              className="btn btn-sm"
              style={{ marginTop: 9, display: 'flex' }}
              onClick={onOpenSettings}
            >
              <ISettings size={14} /> בחר ספק והוסף מפתח
            </button>
          </div>
        )}

        {turns.length === 0 && !streaming && hasKey && (
          <div className="ai-empty">
            <div className="ai-empty-icon">✦</div>
            שאל אותי כל דבר על העמוד הזה — אני רואה בדיוק מה כתוב בו.
            <div className="ai-sugg">
              {suggestedQuestions({ ...ctx, focus: focus?.text }).map((q) => (
                <button key={q} className="ai-sugg-btn" onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((t, i) =>
          t.role === 'user' ? (
            <div className="msg" key={i}>
              <div className="msg-user">{t.content}</div>
            </div>
          ) : (
            <div className="msg" key={i}>
              <div
                className="msg-ai"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(t.content) }}
              />
            </div>
          )
        )}

        {streaming && (
          <div className="msg">
            <div
              className="msg-ai"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(streaming) }}
            />
          </div>
        )}

        {busy && !streaming && (
          <div className="msg-ai">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}

        {shownError && <div className="ai-error">{shownError}</div>}
      </div>

      <div className="ai-input-wrap">
        <div className="ai-input-box">
          <textarea
            ref={taRef}
            className="ai-input"
            rows={1}
            value={draft}
            placeholder="שאל שאלה על העמוד הזה…"
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <div className="ai-input-actions">
            <span className="ai-hint">
              <span className="kbd">Enter</span> לשליחה · <span className="kbd">Shift+Enter</span>{' '}
              לשורה חדשה
            </span>
            {busy ? (
              <button className="btn btn-sm btn-ghost" onClick={stopChat}>
                עצור
              </button>
            ) : (
              <button className="ai-send" onClick={() => send()} disabled={!draft.trim()}>
                <ISend size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

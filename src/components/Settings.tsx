import { useState } from 'react';
import {
  getActiveProvider,
  setActiveProvider,
  getKey,
  setKey,
  getModelFor,
  setModelFor,
  getFontScale,
  setFontScale,
  resetAllProgress,
} from '../lib/storage';
import { checkProvider } from '../lib/ai';
import { PROVIDERS, looksLikeValidKey, type ProviderId } from '../lib/providers';
import { renderInline } from '../lib/markdown';
import { IClose, ISettings, ICheck, IEye } from './Icons';

export default function Settings({
  onClose,
  onChanged,
}: {
  onClose: () => void;
  onChanged: () => void;
}) {
  const [active, setActive] = useState<ProviderId>(getActiveProvider);
  // טיוטות מקומיות — נשמרות רק בלחיצה על "שמור"
  const [keys, setKeys] = useState<Record<string, string>>(() =>
    Object.fromEntries(PROVIDERS.map((p) => [p.id, getKey(p.id)]))
  );
  // המודל נבחר אוטומטית לפי מה שהמפתח באמת מורשה להריץ — לא ניתן לבחירה ידנית
  const [models, setModels] = useState<Record<string, string>>(() =>
    Object.fromEntries(PROVIDERS.map((p) => [p.id, getModelFor(p.id, '')]))
  );
  const [available, setAvailable] = useState<Record<string, string[]>>({});
  const [scale, setScale] = useState(getFontScale);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [guideOpen, setGuideOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const provider = PROVIDERS.find((p) => p.id === active)!;
  const key = keys[active] ?? '';
  const model = models[active] ?? '';
  const shapeIssue = key.trim() ? looksLikeValidKey(provider, key) : null;

  const save = () => {
    setActiveProvider(active);
    for (const p of PROVIDERS) {
      setKey(p.id, keys[p.id] ?? '');
      setModelFor(p.id, models[p.id] ?? '');
    }
    setFontScale(scale);
    document.documentElement.style.setProperty('--fs', String(scale));
    onChanged();
    onClose();
  };

  const test = async () => {
    setTesting(true);
    setTestMsg(null);
    setShowAll(false);
    const res = await checkProvider(active, key);
    setTesting(false);

    if (res.available) setAvailable({ ...available, [active]: res.available });
    if (res.model) setModels({ ...models, [active]: res.model });

    setTestMsg(
      res.ok
        ? {
            ok: true,
            text: `✓ המפתח עובד. נבחר אוטומטית המודל ${res.model} מתוך ${res.available?.length ?? 1} מודלים שזמינים לך.`,
          }
        : { ok: false, text: res.error ?? 'הבדיקה נכשלה.' }
    );
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-wide" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <ISettings size={19} />
          <div className="modal-title">הגדרות</div>
          <button className="icon-btn" onClick={onClose}>
            <IClose size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* ---------- בחירת ספק ---------- */}
          <div className="field">
            <label>ספק ה-AI</label>
            <div className="help">
              עוזר הלימוד יכול לעבוד מול כל אחד מהשלושה. אפשר לשמור מפתח לכל אחד ולהחליף ביניהם
              בכל רגע. <b>כל שאר האפליקציה — כולל הרצת הקוד — עובדת גם בלי אף מפתח.</b>
            </div>
            <div className="prov-grid">
              {PROVIDERS.map((p) => {
                const has = Boolean((keys[p.id] ?? '').trim());
                return (
                  <button
                    key={p.id}
                    className={`prov-card${p.id === active ? ' on' : ''}`}
                    onClick={() => {
                      setActive(p.id);
                      setTestMsg(null);
                      setShowKey(false);
                    }}
                    style={{ ['--brand-c' as string]: p.color }}
                  >
                    <span className="prov-mark">{p.mark}</span>
                    <span className="prov-names">
                      <b>{p.name}</b>
                      <span>{p.vendor}</span>
                    </span>
                    {has && (
                      <span className="prov-ok" title="יש מפתח שמור">
                        <ICheck size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className={`prov-pricing${provider.pricingNote.startsWith('✓') ? ' free' : ''}`}>
              {provider.pricingNote}
            </div>
          </div>

          {/* ---------- מפתח ---------- */}
          <div className="field">
            <label>מפתח API של {provider.vendor}</label>
            <div className="help">
              נשמר <b>רק בדפדפן שלך</b> (localStorage) ונשלח ישירות אל {provider.vendor}. אין שרת
              ביניים ואף אחד אחר לא רואה אותו.
            </div>
            <div className="key-row">
              <input
                type={showKey ? 'text' : 'password'}
                dir="ltr"
                value={key}
                onChange={(e) => {
                  setKeys({ ...keys, [active]: e.target.value });
                  setTestMsg(null);
                }}
                placeholder={provider.keyPlaceholder}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                className="icon-btn"
                onClick={() => setShowKey((s) => !s)}
                title={showKey ? 'הסתר' : 'הצג'}
              >
                <IEye size={16} />
              </button>
            </div>

            {shapeIssue && <div className="note-warn">⚠ {shapeIssue}</div>}

            <div className="row-actions">
              <button className="btn btn-sm" onClick={test} disabled={!key.trim() || testing}>
                {testing && <span className="spinner" />} בדוק מפתח
              </button>
              {key && (
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    setKeys({ ...keys, [active]: '' });
                    setTestMsg(null);
                  }}
                >
                  מחק
                </button>
              )}
              <a className="btn btn-sm btn-ghost" href={provider.consoleUrl} target="_blank" rel="noreferrer">
                פתח את עמוד המפתחות ↗
              </a>
            </div>

            {testMsg && (
              <div className={testMsg.ok ? 'note-ok' : 'note-bad'} style={{ whiteSpace: 'pre-wrap' }}>
                {testMsg.text}
              </div>
            )}
          </div>

          {/* ---------- מדריך ---------- */}
          <div className="field">
            <button className="guide-toggle" onClick={() => setGuideOpen((g) => !g)}>
              <span className="guide-chev" style={{ transform: guideOpen ? 'rotate(90deg)' : '' }}>
                ▸
              </span>
              איך משיגים מפתח של {provider.vendor}?
            </button>
            {guideOpen && (
              <div className="guide">
                <ol className="guide-steps">
                  {provider.setup.map((s, i) => (
                    <li key={i}>
                      <span dangerouslySetInnerHTML={{ __html: renderInline(s.text) }} />
                      {s.href && (
                        <>
                          {' '}
                          <a href={s.href} target="_blank" rel="noreferrer">
                            {s.linkLabel ?? s.href} ↗
                          </a>
                        </>
                      )}
                    </li>
                  ))}
                </ol>
                {provider.caveats && provider.caveats.length > 0 && (
                  <div className="guide-caveats">
                    {provider.caveats.map((c, i) => (
                      <div key={i} className="guide-caveat">
                        <span>•</span>
                        <span dangerouslySetInnerHTML={{ __html: renderInline(c) }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ---------- מודל (אוטומטי) ---------- */}
          <div className="field">
            <label>מודל</label>
            <div className="help">
              נבחר <b>אוטומטית</b> — האפליקציה שואלת את {provider.vendor} אילו מודלים המפתח שלך
              מורשה להריץ, ובוחרת את הטוב ביותר מביניהם. כך אי אפשר לבחור בטעות מודל שהמפתח לא
              תומך בו.
            </div>
            {model ? (
              <div className="model-auto">
                <span className="model-auto-badge">נבחר</span>
                <code dir="ltr">{model}</code>
                {available[active] && available[active].length > 1 && (
                  <button className="model-auto-more" onClick={() => setShowAll((s) => !s)}>
                    {showAll ? 'הסתר' : `עוד ${available[active].length - 1} זמינים`}
                  </button>
                )}
              </div>
            ) : (
              <div className="model-auto empty">
                עדיין לא זוהה מודל. הדבק מפתח ולחץ <b>בדוק מפתח</b>.
              </div>
            )}
            {showAll && available[active] && (
              <div className="model-list" dir="ltr">
                {available[active].map((m) => (
                  <span key={m} className={m === model ? 'on' : ''}>
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ---------- גופן ---------- */}
          <div className="field">
            <label>גודל טקסט</label>
            <div className="seg">
              {[
                { v: 0.9, l: 'קטן' },
                { v: 1, l: 'רגיל' },
                { v: 1.12, l: 'גדול' },
                { v: 1.25, l: 'ענק' },
              ].map((o) => (
                <button
                  key={o.v}
                  className={Math.abs(scale - o.v) < 0.01 ? 'on' : ''}
                  onClick={() => {
                    setScale(o.v);
                    document.documentElement.style.setProperty('--fs', String(o.v));
                  }}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          {/* ---------- איפוס ---------- */}
          <div className="field">
            <label>איפוס התקדמות</label>
            <div className="help">
              מוחק סימוני "סיימתי", תשובות לחידונים, קוד שמור בתרגילים ופרויקטים בעורך. המפתחות
              נשארים.
            </div>
            <button
              className="btn btn-sm btn-ghost btn-danger"
              onClick={() => {
                if (confirm('לאפס את כל ההתקדמות? אי אפשר לבטל.')) {
                  resetAllProgress();
                  onChanged();
                  location.reload();
                }
              }}
            >
              אפס הכול
            </button>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-primary" onClick={save}>
            שמור
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

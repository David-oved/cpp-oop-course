import { useEffect, useState } from 'react';
import {
  getActiveProvider,
  setActiveProvider,
  getKey,
  setKey,
  getModelFor,
  setModelFor,
  getFontScale,
  setFontScale,
  setEntryChoice,
  resetAllProgress,
} from '../lib/storage';
import { checkProvider } from '../lib/ai';
import { PROVIDERS, looksLikeValidKey, type ProviderId } from '../lib/providers';
import { renderInline } from '../lib/markdown';
import { auth, onAuthChange, signIn, signOutUser, type User } from '../lib/firebase';
import { checkVersion } from '../lib/pwa';
import { IClose, ISettings, ICheck, IEye, IChevRight, IChevLeft, IUser, IGoogle, ISparkle, ISun, IReset } from './Icons';

// TODO: להדביק כאן קישור טופס Google Forms אמיתי לאיסוף משוב
const FEEDBACK_FORM_URL = '';

type Screen = 'root' | 'account' | 'ai' | 'display' | 'system';

export default function Settings({
  onClose,
  onChanged,
}: {
  onClose: () => void;
  onChanged: () => void;
}) {
  const [screen, setScreen] = useState<Screen>('root');

  /* ---------- חשבון ---------- */
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  useEffect(() => onAuthChange(setUser), []);

  const doSignIn = async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      await signIn();
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : 'ההתחברות נכשלה, נסה שוב.');
    } finally {
      setAuthBusy(false);
    }
  };
  const doSignOut = async () => {
    await signOutUser();
    setEntryChoice(null); // בפתיחה הבאה יראה שוב את מסך הבחירה (גוגל/אורח)
    onChanged();
  };

  /* ---------- הגדרות AI (טיוטה מקומית — נשמרת רק בלחיצה על "שמור") ---------- */
  const [active, setActive] = useState<ProviderId>(getActiveProvider);
  const [keys, setKeys] = useState<Record<string, string>>(() =>
    Object.fromEntries(PROVIDERS.map((p) => [p.id, getKey(p.id)]))
  );
  const [models, setModels] = useState<Record<string, string>>(() =>
    Object.fromEntries(PROVIDERS.map((p) => [p.id, getModelFor(p.id, '')]))
  );
  const [available, setAvailable] = useState<Record<string, string[]>>({});
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [guideOpen, setGuideOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const provider = PROVIDERS.find((p) => p.id === active)!;
  const key = keys[active] ?? '';
  const model = models[active] ?? '';
  const shapeIssue = key.trim() ? looksLikeValidKey(provider, key) : null;
  const hasAnyKey = PROVIDERS.some((p) => (keys[p.id] ?? '').trim());

  const saveAi = () => {
    setActiveProvider(active);
    for (const p of PROVIDERS) {
      setKey(p.id, keys[p.id] ?? '');
      setModelFor(p.id, models[p.id] ?? '');
    }
    onChanged();
    setScreen('root');
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

  /* ---------- תצוגה — מוחל ונשמר מיידית, בלי כפתור שמירה ---------- */
  const [scale, setScale] = useState(getFontScale);
  const applyScale = (v: number) => {
    setScale(v);
    setFontScale(v);
    document.documentElement.style.setProperty('--fs', String(v));
  };

  /* ---------- מערכת ---------- */
  const [versionMsg, setVersionMsg] = useState<string | null>(null);
  const [checkingVersion, setCheckingVersion] = useState(false);
  const doCheckVersion = async () => {
    setCheckingVersion(true);
    setVersionMsg(null);
    const res = await checkVersion();
    setCheckingVersion(false);
    setVersionMsg(
      res.hasUpdate ? 'נמצאה גרסה חדשה — היא תוצע בבאנר בתחתית המסך.' : 'אתה כבר על הגרסה העדכנית.'
    );
  };

  const titles: Record<Screen, string> = {
    root: 'הגדרות',
    account: 'חשבון',
    ai: 'הגדרות AI',
    display: 'תצוגה',
    system: 'מערכת',
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-wide" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          {screen !== 'root' ? (
            <button className="icon-btn" onClick={() => setScreen('root')} title="חזרה">
              <IChevRight size={18} />
            </button>
          ) : (
            <ISettings size={19} />
          )}
          <div className="modal-title">{titles[screen]}</div>
          <button className="icon-btn" onClick={onClose}>
            <IClose size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* ============ רשימה ראשית ============ */}
          {screen === 'root' && (
            <div className="settings-list">
              <button className="settings-row settings-row-account" onClick={() => setScreen('account')}>
                {user?.photoURL ? (
                  <img className="acct-avatar sm" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <span className="settings-row-icon">
                    <IUser size={19} />
                  </span>
                )}
                <span className="settings-row-text">
                  <b>{user ? user.displayName ?? 'החשבון שלי' : 'אורח'}</b>
                  <span>{user ? user.email : 'לחץ כדי להתחבר עם Google'}</span>
                </span>
                <IChevLeft size={14} className="settings-row-chev" />
              </button>

              <div className="settings-group">
                <button className="settings-row" onClick={() => setScreen('ai')}>
                  <span className="settings-row-icon">
                    <ISparkle size={17} />
                  </span>
                  <span className="settings-row-text">
                    <b>הגדרות AI</b>
                    <span>
                      {provider.name} · {hasAnyKey ? 'מפתח מוגדר' : 'לא הוגדר מפתח'}
                    </span>
                  </span>
                  <IChevLeft size={14} className="settings-row-chev" />
                </button>
                <button className="settings-row" onClick={() => setScreen('display')}>
                  <span className="settings-row-icon">
                    <ISun size={17} />
                  </span>
                  <span className="settings-row-text">
                    <b>תצוגה</b>
                    <span>גודל טקסט</span>
                  </span>
                  <IChevLeft size={14} className="settings-row-chev" />
                </button>
                <button className="settings-row" onClick={() => setScreen('system')}>
                  <span className="settings-row-icon">
                    <IReset size={17} />
                  </span>
                  <span className="settings-row-text">
                    <b>מערכת</b>
                    <span>עדכון גרסה, משוב, איפוס</span>
                  </span>
                  <IChevLeft size={14} className="settings-row-chev" />
                </button>
              </div>
            </div>
          )}

          {/* ============ חשבון ============ */}
          {screen === 'account' && (
            <div className="acct-screen">
              {user ? (
                <>
                  <div className="acct-card">
                    {user.photoURL ? (
                      <img className="acct-avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <IUser size={26} />
                    )}
                    <div className="acct-info">
                      <b>{user.displayName ?? 'משתמש'}</b>
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <div className="help">ההתחברות משמשת לסנכרון בין מכשירים (בקרוב). לא נדרשת כדי להשתמש בתוכן.</div>
                  <button className="btn btn-sm btn-ghost btn-danger" onClick={doSignOut}>
                    התנתקות
                  </button>
                </>
              ) : (
                <>
                  <div className="acct-card acct-guest">
                    <IUser size={26} />
                    <div className="acct-info">
                      <b>אורח</b>
                      <span>לא מחובר</span>
                    </div>
                  </div>
                  <div className="help">
                    כרגע אתה משתמש כאורח — כל התוכן זמין לך. התחברות עם Google תאפשר בעתיד סנכרון
                    התקדמות בין מכשירים.
                  </div>
                  <button className="btn btn-primary" onClick={doSignIn} disabled={authBusy}>
                    <IGoogle size={16} /> {authBusy ? 'מתחבר…' : 'התחברות עם Google'}
                  </button>
                  {authError && <div className="note-bad">{authError}</div>}
                </>
              )}
            </div>
          )}

          {/* ============ הגדרות AI ============ */}
          {screen === 'ai' && (
            <>
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
            </>
          )}

          {/* ============ תצוגה ============ */}
          {screen === 'display' && (
            <div className="field">
              <label>גודל טקסט</label>
              <div className="help">משתנה ונשמר מיד — אין צורך לשמור בנפרד.</div>
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
                    onClick={() => applyScale(o.v)}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ============ מערכת ============ */}
          {screen === 'system' && (
            <>
              <div className="field">
                <label>עדכון גרסה</label>
                <div className="help">בודק מול השרת אם קיימת גרסה חדשה מזו שמותקנת אצלך כרגע.</div>
                <button className="btn btn-sm" onClick={doCheckVersion} disabled={checkingVersion}>
                  {checkingVersion && <span className="spinner" />} בדוק עדכון גרסה
                </button>
                {versionMsg && <div className="note-ok">{versionMsg}</div>}
              </div>

              <div className="field">
                <label>משוב</label>
                <div className="help">נתקלת בבאג, או יש לך רעיון לשיפור? נשמח לשמוע.</div>
                {FEEDBACK_FORM_URL ? (
                  <a className="btn btn-sm" href={FEEDBACK_FORM_URL} target="_blank" rel="noreferrer">
                    שליחת משוב ↗
                  </a>
                ) : (
                  <button className="btn btn-sm" disabled title="יתווסף בקרוב">
                    שליחת משוב (יתווסף בקרוב)
                  </button>
                )}
              </div>

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
            </>
          )}
        </div>

        {screen === 'ai' && (
          <div className="modal-foot">
            <button className="btn btn-primary" onClick={saveAi}>
              שמור
            </button>
            <button className="btn btn-ghost" onClick={() => setScreen('root')}>
              ביטול
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

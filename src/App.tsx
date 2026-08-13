import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LESSONS, getLesson } from './content';
import { flattenLesson } from './types/content';
import { sectionToText } from './lib/sectionText';
import {
  getCompleted,
  toggleCompleted,
  getTheme,
  setTheme as persistTheme,
  getFontScale,
  getLastSection,
  setLastSection,
  type Theme,
} from './lib/storage';
import { AppCtx, type IdeRequest } from './AppContext';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import BlockRenderer from './components/BlockRenderer';
import AiPanel, { type AiFocus } from './components/AiPanel';
import Settings from './components/Settings';
import Ide from './components/Ide';
import {
  IMenu, ISparkle, ISettings, ISun, IMoon, ICheck,
  IChevRight, IChevLeft, IHome, ITerminal, IReset, IWifiOff,
} from './components/Icons';
import { onUpdateAvailable, onOnlineChange, applyUpdate, checkVersion, isOnline } from './lib/pwa';
import { consumeRedirectResult } from './lib/firebase';
import AuthButton from './components/AuthButton';

const BLANK_MAIN = `#include <iostream>
using namespace std;

int main()
{

    return 0;
}
`;

export default function App() {
  /* ---------- ניווט ---------- */
  const [route, setRoute] = useState<{ lessonId: string; sectionId: string } | null>(() => {
    const last = getLastSection();
    if (last) {
      const [l, s] = last.split('/');
      const lesson = getLesson(l);
      if (lesson?.chapters.some((c) => c.sections.some((x) => x.id === s))) {
        return { lessonId: l, sectionId: s };
      }
    }
    return null;
  });

  /* ---------- מצב ממשק ---------- */
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 980);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiFocus, setAiFocus] = useState<AiFocus | null>(null);
  const [aiPending, setAiPending] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ide, setIde] = useState<IdeRequest | null>(null);
  const [theme, setThemeState] = useState<Theme>(getTheme());
  const [completed, setCompleted] = useState<Set<string>>(getCompleted);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ---------- PWA: עדכון גרסה + מצב חיבור ---------- */
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [online, setOnline] = useState(isOnline);

  useEffect(() => {
    const offUpdate = onUpdateAvailable((info) => setUpdateAvailable(info.available));
    const offOnline = onOnlineChange(setOnline);
    // כשחוזרים לאפליקציה (למשל פותחים אותה מחדש מהמסך הראשי) — בדיקת גרסה נוספת
    const onVisible = () => {
      if (document.visibilityState === 'visible') void checkVersion();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      offUpdate();
      offOnline();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  useEffect(() => {
    // תופס משתמש שחזר זה עתה מהתחברות Google ב-redirect (מצב PWA מותקן)
    void consumeRedirectResult();
  }, []);

  const doUpdate = useCallback(async () => {
    setUpdating(true);
    try {
      await applyUpdate();
    } catch {
      setUpdating(false);
    }
  }, []);

  /* ---------- ערכת נושא + גודל גופן ---------- */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--fs', String(getFontScale()));
  }, []);

  /* ---------- פתרון המסלול הנוכחי ---------- */
  const lesson = route ? getLesson(route.lessonId) : null;
  const flat = useMemo(() => (lesson ? flattenLesson(lesson) : []), [lesson]);
  const idx = route ? flat.findIndex((f) => f.section.id === route.sectionId) : -1;
  const current = idx >= 0 ? flat[idx] : null;
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  const navigate = useCallback((lessonId: string, sectionId: string) => {
    setRoute({ lessonId, sectionId });
    setLastSection(`${lessonId}/${sectionId}`);
    setAiFocus(null);
    if (window.innerWidth <= 980) setSidebarOpen(false);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' }));
  }, []);

  const goHome = useCallback(() => {
    setRoute(null);
    setAiFocus(null);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0 }));
  }, []);

  /* ---------- API לרכיבים ---------- */
  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2200);
  }, []);

  const askAi = useCallback((focus?: string, label?: string, question?: string) => {
    if (focus) setAiFocus({ text: focus, label: label ?? 'הקטע שנבחר' });
    else setAiFocus(null);
    if (question) setAiPending(question);
    setAiOpen(true);
  }, []);

  const openIde = useCallback((req: IdeRequest) => setIde(req), []);

  const api = useMemo(() => ({ askAi, openIde, toast }), [askAi, openIde, toast]);

  /* ---------- קיצורי מקלדת ---------- */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      if (ide || settingsOpen) return;
      // RTL: חץ שמאל = העמוד הבא
      if (e.key === 'ArrowLeft' && next) navigate(next.lessonId, next.section.id);
      if (e.key === 'ArrowRight' && prev) navigate(prev.lessonId, prev.section.id);
      if (e.key === '/') { e.preventDefault(); setAiOpen(true); }
      if (e.key === 'b') setSidebarOpen((s) => !s);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [next, prev, navigate, ide, settingsOpen]);

  /* ---------- הקשר לעוזר ה-AI ---------- */
  const aiCtx = useMemo(() => {
    if (!current) {
      return {
        lessonTitle: 'כללי',
        chapterTitle: '—',
        sectionTitle: 'מסך הבית',
        sectionText: 'הסטודנט נמצא במסך הבית של הקורס ועדיין לא פתח שיעור.',
      };
    }
    return {
      lessonTitle: `${current.lessonNum}. ${current.lessonTitle}`,
      chapterTitle: current.chapterTitle,
      sectionTitle: current.section.title,
      sectionText: sectionToText(current.section),
    };
  }, [current]);

  const sectionKey = current ? `${current.lessonId}/${current.section.id}` : '';
  const isDone = completed.has(sectionKey);

  const cls = [
    'app',
    aiOpen ? 'ai-open' : '',
    sidebarOpen ? '' : 'sidebar-closed',
  ].filter(Boolean).join(' ');

  return (
    <AppCtx.Provider value={api}>
      <div className={cls}>
        <Sidebar
          lessonId={route?.lessonId ?? null}
          sectionId={route?.sectionId ?? null}
          completed={completed}
          onNavigate={navigate}
          onHome={goHome}
        />

        <main className="main">
          <header className="topbar">
            <button className="icon-btn" onClick={() => setSidebarOpen((s) => !s)} title="תפריט (B)">
              <IMenu size={19} />
            </button>
            <button className="icon-btn" onClick={goHome} title="מסך הבית">
              <IHome size={18} />
            </button>

            {!online && (
              <span className="offline-pill" title="אין חיבור לאינטרנט — עובדים על התוכן השמור">
                <IWifiOff size={13} /> אופליין
              </span>
            )}

            <div className="crumbs">
              {current ? (
                <>
                  <b>{current.lessonNum}. {current.lessonTitle}</b>
                  <span className="crumb-sep">›</span>
                  <span>{current.chapterTitle}</span>
                  <span className="crumb-sep">›</span>
                  <b>{current.section.title}</b>
                </>
              ) : (
                <b>מסך הבית</b>
              )}
            </div>

            <button
              className="icon-btn"
              onClick={() =>
                openIde({
                  files: [{ name: 'main.cpp', code: BLANK_MAIN }],
                  title: 'סביבת תרגול חופשית',
                })
              }
              title="פתח סביבת פיתוח"
            >
              <ITerminal size={18} />
            </button>
            <button
              className="icon-btn"
              onClick={() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))}
              title="מצב כהה/בהיר"
            >
              {theme === 'dark' ? <ISun size={18} /> : <IMoon size={18} />}
            </button>
            <AuthButton />
            <button className="icon-btn" onClick={() => setSettingsOpen(true)} title="הגדרות">
              <ISettings size={18} />
            </button>
            <button
              className={`icon-btn${aiOpen ? ' on' : ''}`}
              onClick={() => setAiOpen((o) => !o)}
              title="עוזר AI (/)"
            >
              <ISparkle size={18} />
            </button>
          </header>

          <div className="content-scroll" ref={scrollRef}>
            {!current ? (
              <Home completed={completed} onOpen={navigate} />
            ) : (
              <article className="page">
                <div className="page-head">
                  <div className="page-kicker">
                    <span>{current.chapterTitle}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>עמוד {idx + 1} מתוך {flat.length}</span>
                    {current.section.slides && current.section.slides.length > 0 && (
                      <span className="slide-ref">
                        מצגת: שקף {current.section.slides.join(', ')}
                      </span>
                    )}
                  </div>
                  <h1 className="page-title">{current.section.title}</h1>
                  {current.section.subtitle && (
                    <p className="page-sub">{current.section.subtitle}</p>
                  )}
                </div>

                <div className="blocks">
                  {current.section.blocks.map((b, i) => (
                    <BlockRenderer
                      key={i}
                      block={b}
                      index={i}
                      sectionId={`${current.lessonId}.${current.section.id}`}
                    />
                  ))}
                </div>

                <div className="done-bar">
                  <button
                    className={`done-btn${isDone ? ' on' : ''}`}
                    onClick={() => {
                      setCompleted(new Set(toggleCompleted(sectionKey)));
                      forceUpdate((x) => x + 1);
                    }}
                  >
                    <ICheck size={16} /> {isDone ? 'סומן כנלמד' : 'סמן שסיימתי את העמוד'}
                  </button>
                </div>

                <div className="pager">
                  <button
                    className="pager-btn"
                    disabled={!prev}
                    onClick={() => prev && navigate(prev.lessonId, prev.section.id)}
                  >
                    <div className="pager-dir">
                      <IChevRight size={12} /> הקודם
                    </div>
                    <div className="pager-title">{prev?.section.title ?? '—'}</div>
                  </button>
                  <button
                    className="pager-btn pager-next"
                    disabled={!next}
                    onClick={() => {
                      if (next) {
                        setCompleted(new Set(toggleCompleted(sectionKey).add(sectionKey)));
                        navigate(next.lessonId, next.section.id);
                      }
                    }}
                  >
                    <div className="pager-dir">
                      הבא <IChevLeft size={12} />
                    </div>
                    <div className="pager-title">{next?.section.title ?? 'סוף השיעור'}</div>
                  </button>
                </div>
              </article>
            )}
          </div>
        </main>

        {aiOpen && (
          <AiPanel
            ctx={aiCtx}
            focus={aiFocus}
            clearFocus={() => setAiFocus(null)}
            pendingQuestion={aiPending}
            clearPending={() => setAiPending(null)}
            onClose={() => setAiOpen(false)}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
      </div>

      {!aiOpen && (
        <button className="ai-fab" onClick={() => setAiOpen(true)} title="שאל את ה-AI (/)">
          <ISparkle size={22} />
        </button>
      )}

      {settingsOpen && (
        <Settings onClose={() => setSettingsOpen(false)} onChanged={() => forceUpdate((x) => x + 1)} />
      )}

      {ide && <Ide req={ide} onClose={() => setIde(null)} />}

      {toastMsg && <div className="toast">{toastMsg}</div>}

      {updateAvailable && (
        <div className="update-banner">
          <IReset size={17} className={updating ? 'spin' : ''} />
          <div className="update-text">
            <b>גרסה חדשה זמינה</b>
            <span>עדכנו את השיעורים ותוקנו באגים. לוחצים על "עדכן" כדי לטעון את הגרסה החדשה.</span>
          </div>
          <button className="update-btn" onClick={doUpdate} disabled={updating}>
            {updating ? 'מעדכן…' : 'עדכן עכשיו'}
          </button>
          <button className="update-dismiss" onClick={() => setUpdateAvailable(false)} disabled={updating}>
            לא עכשיו
          </button>
        </div>
      )}
    </AppCtx.Provider>
  );
}

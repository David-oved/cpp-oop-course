/**
 * "בניית שיעור ממצגת" — ה-UI ל"מערכת החכמה" (AGENTS.md §13 0.7–0.10, חלקי).
 *
 * כלי למחבר/מרצה (לא לתלמידים), זמין גם בדסקטופ וגם במובייל: מעלים PDF/Word של מצגת
 * כלשהי (כותרת/מספר שיעור מוקלדים ידנית — אין רשימה מוכרת-מראש של נושאים, ראה
 * content/index.ts), האפליקציה מחלצת טקסט מכל עמוד בדפדפן (lib/presentationExtract.ts),
 * שולחת אותו בשני שלבים ל-AI של המשתמש עצמו (lib/generate.ts — מניפסט ואז סעיף-סעיף),
 * ומציגה תוצאה לביקורת. **לא** משלבת אוטומטית ל-content/index.ts — זה נשאר צעד ידני
 * מכוון (lib/exportLesson.ts).
 *
 * טיוטות שנוצרות נשמרות אוטומטית (`saveDraftLesson`, lib/storage.ts — אותו מקום שסנכרון
 * הענן ב-lib/sync.ts קורא ממנו) כדי שאפשר יהיה לחזור אליהן או למחוק אותן מאוחר יותר.
 *
 * דורש התחברות (Google) — כמו כל שמירת נתונים אחרת באפליקציה, אורח לא שומר כלום
 * (AGENTS.md §9). בלי זה, טיוטה שנוצרה על מכשיר משותף "תדלוף" לכל אורח הבא בו
 * (ראה גם התיקון ל-sign-out ב-lib/sync.ts).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { extractPresentationText } from '../lib/presentationExtract';
import { generateLesson, generateSection, NotAPresentationError, type GenerateProgress, type GenerateResult } from '../lib/generate';
import { buildExportBundle, downloadTextFile } from '../lib/exportLesson';
import { getDraftLessons, saveDraftLesson, deleteDraftLesson, DRAFT_ID_PREFIX } from '../lib/storage';
import { auth, onAuthChange, signIn, type User } from '../lib/firebase';
import { flattenLesson, type Lesson } from '../types/content';
import BlockRenderer from './BlockRenderer';
import { IClose, IDownload, IChevRight, IChevLeft, ISparkle, ITrash, IEye, IGoogle } from './Icons';

type Stage = 'setup' | 'extracting' | 'ready-to-generate' | 'generating' | 'done';

export default function LessonBuilder({ onClose }: { onClose: () => void }) {
  /* דורש התחברות — אורח לא שומר כלום באפליקציה הזו (AGENTS.md §9), וטיוטות
     מיוצרות בהחלט "נשמרות". ראה גם התיקון ל-sign-out ב-lib/sync.ts. */
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

  /* מטא-דאטה של השיעור — מוקלדת ידנית, לא מרשימה קבועה מראש. האפליקציה היא מנוע כללי
     (README, AGENTS.md §6): היא לא "מכירה" נושאים/מספרי שיעור עתידיים לפני שהם הועלו. */
  const [num, setNum] = useState(2);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [source, setSource] = useState('');
  const meta = useMemo(() => ({ num, title, subtitle, source }), [num, title, subtitle, source]);

  const [stage, setStage] = useState<Stage>('setup');
  const [pages, setPages] = useState<string[] | null>(null);
  const [extractProgress, setExtractProgress] = useState<{ done: number; total: number } | null>(null);
  const [log, setLog] = useState<GenerateProgress[]>([]);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [drafts, setDrafts] = useState<Lesson[]>(getDraftLessons);
  /** id של טיוטה שמורה שנפתחה לצפייה (במקום תוצאת ייצור טרייה ב-result) */
  const [viewingDraftId, setViewingDraftId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = async (file: File) => {
    setError(null);
    setStage('extracting');
    setPages(null);
    setExtractProgress(null);
    setSource(file.name);
    try {
      const extracted = await extractPresentationText(file, (done, total) => setExtractProgress({ done, total }));
      setPages(extracted.pages);
      setStage('ready-to-generate');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStage('setup');
    }
  };

  const startGenerate = async () => {
    if (!pages || !title.trim()) return;
    setError(null);
    setResult(null);
    setLog([]);
    setStage('generating');
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const r = await generateLesson(meta, pages, {
        signal: controller.signal,
        onProgress: (p) => setLog((prev) => [...prev, p]),
      });
      setResult(r);
      setViewingDraftId(null);
      setStage('done');
      setDrafts(saveDraftLesson(r.lesson));
    } catch (e) {
      if (e instanceof NotAPresentationError) {
        setError(`הקובץ שהעלית לא מתאים ליצירת שיעור: ${e.message} נסה קובץ אחר.`);
        setPages(null);
        setStage('setup');
      } else {
        setError(e instanceof Error ? e.message : String(e));
        setStage('ready-to-generate');
      }
    } finally {
      abortRef.current = null;
    }
  };

  const cancel = () => abortRef.current?.abort();

  const retrySection = async (sectionId: string, sectionTitle: string) => {
    if (!result || !pages) return;
    const entry = result.manifest.find((m) => m.sectionId === sectionId);
    if (!entry) return;
    setRetrying(sectionId);
    setError(null);
    try {
      const idx = result.manifest.findIndex((m) => m.sectionId === sectionId);
      const section = await generateSection(
        meta,
        entry,
        pages,
        {
          prevSectionTitle: result.manifest[idx - 1]?.sectionTitle,
          nextSectionTitle: result.manifest[idx + 1]?.sectionTitle,
        },
        {}
      );
      const chapters = result.lesson.chapters.map((c) =>
        c.id === entry.chapterId
          ? {
              ...c,
              sections: [...c.sections.filter((s) => s.id !== sectionId), section].sort(
                (a, b) =>
                  result.manifest.findIndex((m) => m.sectionId === a.id) -
                  result.manifest.findIndex((m) => m.sectionId === b.id)
              ),
            }
          : c
      );
      const stillFailed = result.failedSections.filter((f) => f.sectionId !== sectionId);
      const updated = { ...result, lesson: { ...result.lesson, chapters, ready: stillFailed.length === 0 }, failedSections: stillFailed };
      setResult(updated);
      setDrafts(saveDraftLesson(updated.lesson));
    } catch (e) {
      setError(`ניסיון חוזר לסעיף "${sectionTitle}" נכשל: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setRetrying(null);
    }
  };

  const draftIdFor = (lesson: Lesson) => (lesson.id.startsWith(DRAFT_ID_PREFIX) ? lesson.id : `${DRAFT_ID_PREFIX}${lesson.id}`);

  /** הטיוטה המוצגת כרגע: או תוצאת ייצור טרייה בסשן הזה, או טיוטה שמורה שנפתחה לצפייה */
  const activeLesson: Lesson | null = viewingDraftId
    ? drafts.find((d) => d.id === viewingDraftId) ?? null
    : (result?.lesson ?? null);

  const exportBundle = () => {
    if (!activeLesson) return;
    downloadTextFile(`lesson${String(activeLesson.num).padStart(2, '0')}-draft.ts.txt`, buildExportBundle(activeLesson));
  };

  const loadDraft = (id: string) => {
    setResult(null);
    setViewingDraftId(id);
    setPreviewIndex(0);
    setStage('done');
  };

  const removeDraft = (id: string) => {
    setDrafts(deleteDraftLesson(id));
    if (viewingDraftId === id) {
      setViewingDraftId(null);
      setStage('setup');
    }
    if (result && draftIdFor(result.lesson) === id) setResult(null);
  };

  const flat = useMemo(() => (activeLesson ? flattenLesson(activeLesson) : []), [activeLesson]);
  const current = flat[previewIndex];

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-wide builder-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <ISparkle size={19} />
          <div className="modal-title">בניית שיעור ממצגת (בטא)</div>
          <button className="icon-btn" onClick={onClose}>
            <IClose size={18} />
          </button>
        </div>

        <div className="modal-body builder-body">
          {!user ? (
            <div className="field">
              <div className="note-warn">
                בניית שיעור דורשת התחברות עם Google — הטיוטות שלך נשמרות למכשיר שלך, ובלי
                חשבון אין למה לשייך אותן (בדיוק כמו התקדמות וחידונים באפליקציה).
              </div>
              <button className="btn btn-primary" onClick={doSignIn} disabled={authBusy}>
                <IGoogle size={16} /> {authBusy ? 'מתחבר…' : 'התחברות עם Google'}
              </button>
              {authError && <div className="note-bad">{authError}</div>}
            </div>
          ) : (
            <>
          <div className="note-warn">
            כלי למחבר/מרצה, לא לתלמידים. משתמש במפתח ה-AI שהוגדר ב⚙ הגדרות (Claude, ChatGPT
            או Gemini — מה שכבר מוגדר לצ'אט האישי) — העלות על חשבונך. התוצאה היא <b>טיוטה</b>{' '}
            לביקורת, לא שילוב אוטומטי בקוד.
          </div>

          {stage === 'setup' && (
            <>
              <div className="field">
                <label>כותרת השיעור</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="למשל: בנאים"
                />
              </div>

              <div className="field">
                <label>תת-כותרת (אופציונלי)</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="למשל: constructors — איך אובייקט נולד עם ערכים תקינים"
                />
              </div>

              <div className="field">
                <label>מספר שיעור</label>
                <input
                  type="number"
                  min={1}
                  value={num}
                  onChange={(e) => setNum(Number(e.target.value) || 1)}
                  style={{ width: 90 }}
                  dir="ltr"
                />
                <div className="help">משפיע רק על סימון הטיוטה — לא נבדק מול שיעורים קיימים.</div>
              </div>

              <div className="field">
                <label>קובץ המצגת (PDF או Word)</label>
                <div className="help">כל מצגת/מסמך קורס — לא צריך להיות מנושא מסוים.</div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void pickFile(f);
                  }}
                />
              </div>

              {drafts.length > 0 && (
                <div className="field">
                  <label>טיוטות שמורות</label>
                  <ul className="builder-drafts">
                    {drafts.map((d) => (
                      <li key={d.id}>
                        <span>
                          שיעור {d.num} — {d.title}
                          <span className="help"> · {d.chapters.reduce((n, c) => n + c.sections.length, 0)} סעיפים</span>
                        </span>
                        <span className="builder-drafts-actions">
                          <button className="icon-btn" title="פתח לתצוגה מקדימה" onClick={() => loadDraft(d.id)}>
                            <IEye size={15} />
                          </button>
                          <button
                            className="icon-btn"
                            title="מחק טיוטה"
                            onClick={() => confirm(`למחוק את הטיוטה "${d.title}"? אי אפשר לבטל.`) && removeDraft(d.id)}
                          >
                            <ITrash size={15} />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {stage === 'extracting' && (
            <div className="field">
              <div className="spinner" /> מחלץ טקסט מה-PDF…
              {extractProgress && (
                <div className="help">
                  עמוד {extractProgress.done} מתוך {extractProgress.total}
                </div>
              )}
            </div>
          )}

          {(stage === 'ready-to-generate' || stage === 'generating') && pages && (
            <div className="field">
              <div className="note-ok">חולצו {pages.length} שקפים מהקובץ.</div>
              {stage === 'ready-to-generate' && (
                <>
                  {!title.trim() && <div className="note-warn">צריך למלא כותרת שיעור לפני שמתחילים.</div>}
                  <div className="row-actions">
                    <button className="btn btn-primary" onClick={startGenerate} disabled={!title.trim()}>
                      התחל ייצור
                    </button>
                    <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
                      בחר קובץ אחר
                    </button>
                  </div>
                </>
              )}
              {stage === 'generating' && (
                <>
                  <div className="builder-log">
                    {log.map((p, i) => (
                      <div key={i} className="builder-log-row">
                        {p.message}
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-ghost btn-danger" onClick={cancel}>
                    בטל
                  </button>
                </>
              )}
            </div>
          )}

          {error && <div className="note-bad">{error}</div>}

          {stage === 'done' && activeLesson && (
            <div className="field">
              {viewingDraftId && (
                <div className="note-ok">צופה בטיוטה שמורה: "{activeLesson.title}".</div>
              )}

              {result && (
                <>
                  <div className={result.failedSections.length ? 'note-warn' : 'note-ok'}>
                    הושלם: {result.lesson.chapters.reduce((n, c) => n + c.sections.length, 0)} סעיפים
                    ב-{result.lesson.chapters.length} פרקים.
                    {result.failedSections.length > 0 && ` ${result.failedSections.length} סעיפים נכשלו — ראה למטה.`}
                  </div>

                  {result.failedSections.length > 0 && (
                    <ul className="builder-failed">
                      {result.failedSections.map((f) => (
                        <li key={f.sectionId}>
                          <b>{f.sectionTitle}</b> — {f.error}
                          <button
                            className="btn btn-sm"
                            disabled={retrying === f.sectionId}
                            onClick={() => retrySection(f.sectionId, f.sectionTitle)}
                          >
                            {retrying === f.sectionId ? <span className="spinner" /> : null} נסה שוב
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              <div className="row-actions">
                <button className="btn btn-primary" onClick={exportBundle}>
                  <IDownload size={14} /> הורד טיוטה לשילוב
                </button>
                <button
                  className="btn btn-ghost btn-danger"
                  onClick={() => confirm(`למחוק את הטיוטה "${activeLesson.title}"? אי אפשר לבטל.`) && removeDraft(draftIdFor(activeLesson))}
                >
                  <ITrash size={14} /> מחק טיוטה
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setViewingDraftId(null);
                    setResult(null);
                    setPages(null);
                    setTitle('');
                    setSubtitle('');
                    setSource('');
                    setStage('setup');
                  }}
                >
                  שיעור נוסף
                </button>
              </div>

              {current && (
                <div className="builder-preview">
                  <div className="builder-preview-nav">
                    <button
                      className="icon-btn"
                      disabled={previewIndex === 0}
                      onClick={() => setPreviewIndex((i) => i - 1)}
                    >
                      <IChevRight size={16} />
                    </button>
                    <span>
                      תצוגה מקדימה — {current.section.title} ({previewIndex + 1}/{flat.length})
                    </span>
                    <button
                      className="icon-btn"
                      disabled={previewIndex === flat.length - 1}
                      onClick={() => setPreviewIndex((i) => i + 1)}
                    >
                      <IChevLeft size={16} />
                    </button>
                  </div>
                  <div className="blocks builder-preview-blocks">
                    {current.section.blocks.map((b, i) => (
                      <BlockRenderer key={i} block={b} index={i} sectionId={current.section.id} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

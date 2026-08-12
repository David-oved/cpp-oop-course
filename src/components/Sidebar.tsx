import { useMemo, useState } from 'react';
import { LESSONS } from '../content';
import { countSections } from '../types/content';
import { ICheck, ISearch } from './Icons';

export default function Sidebar({
  lessonId,
  sectionId,
  completed,
  onNavigate,
  onHome,
}: {
  lessonId: string | null;
  sectionId: string | null;
  completed: Set<string>;
  onNavigate: (lessonId: string, sectionId: string) => void;
  onHome: () => void;
}) {
  const [open, setOpen] = useState<Set<string>>(new Set(lessonId ? [lessonId] : ['l01']));
  const [q, setQ] = useState('');

  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const totals = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const l of LESSONS) {
      for (const ch of l.chapters) {
        for (const s of ch.sections) {
          total++;
          if (completed.has(`${l.id}/${s.id}`)) done++;
        }
      }
    }
    return { total, done };
  }, [completed]);

  const query = q.trim().toLowerCase();

  return (
    <nav className="sidebar">
      <div className="sidebar-head">
        <button className="brand" onClick={onHome} style={{ width: '100%', textAlign: 'start' }}>
          <span className="brand-mark">C++</span>
          <span>
            תכנות מתקדם
            <span className="brand-sub">מכון לב · על בסיס מצגות אפרת עמר</span>
          </span>
        </button>
        <div className="progress-wrap">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: totals.total ? `${(totals.done / totals.total) * 100}%` : '0%' }}
            />
          </div>
          <div className="progress-label">
            <span>התקדמות</span>
            <span>
              {totals.done} / {totals.total}
            </span>
          </div>
        </div>
      </div>

      <div className="sidebar-search">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍  חיפוש נושא…"
        />
      </div>

      <div className="sidebar-scroll">
        {LESSONS.map((l) => {
          const n = countSections(l);
          const isOpen = open.has(l.id) || Boolean(query);

          // סינון לפי חיפוש
          const chapters = query
            ? l.chapters
                .map((ch) => ({
                  ...ch,
                  sections: ch.sections.filter(
                    (s) =>
                      s.title.toLowerCase().includes(query) ||
                      (s.subtitle ?? '').toLowerCase().includes(query) ||
                      ch.title.toLowerCase().includes(query)
                  ),
                }))
                .filter((ch) => ch.sections.length > 0)
            : l.chapters;

          const lessonMatches = l.title.toLowerCase().includes(query) || l.subtitle.toLowerCase().includes(query);
          if (query && chapters.length === 0 && !lessonMatches) return null;

          const doneCount = l.chapters.reduce(
            (acc, ch) => acc + ch.sections.filter((s) => completed.has(`${l.id}/${s.id}`)).length,
            0
          );

          return (
            <div className="lesson-group" key={l.id}>
              <button
                className={`lesson-btn${l.id === lessonId ? ' active' : ''}${isOpen ? ' open' : ''}${
                  !l.ready ? ' locked' : ''
                }`}
                onClick={() => {
                  if (!l.ready) return;
                  toggle(l.id);
                }}
                disabled={!l.ready}
              >
                <span className="lesson-num">{l.num}</span>
                <span className="lesson-title-txt" title={l.title}>
                  {l.title}
                </span>
                {l.ready ? (
                  <>
                    <span style={{ fontSize: '.68rem', color: 'var(--fg-faint)', fontFamily: 'var(--font-code)' }}>
                      {doneCount}/{n}
                    </span>
                    <span className="lesson-chev">▸</span>
                  </>
                ) : (
                  <span className="badge-soon">בקרוב</span>
                )}
              </button>

              {isOpen && l.ready && (
                <div className="chapter-list">
                  {chapters.map((ch) => (
                    <div key={ch.id}>
                      <div className="chapter-name">{ch.title}</div>
                      {ch.sections.map((s) => {
                        const key = `${l.id}/${s.id}`;
                        return (
                          <button
                            key={s.id}
                            className={`section-btn${s.id === sectionId && l.id === lessonId ? ' active' : ''}${
                              completed.has(key) ? ' done' : ''
                            }`}
                            onClick={() => onNavigate(l.id, s.id)}
                          >
                            <span className="sec-dot">
                              <ICheck size={9} />
                            </span>
                            <span className="sec-label">{s.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

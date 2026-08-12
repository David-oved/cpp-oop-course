import { LESSONS } from '../content';
import { countSections } from '../types/content';

export default function Home({
  completed,
  onOpen,
}: {
  completed: Set<string>;
  onOpen: (lessonId: string, sectionId: string) => void;
}) {
  const readyLessons = LESSONS.filter((l) => l.ready);
  const totalSections = readyLessons.reduce((n, l) => n + countSections(l), 0);
  const totalSlides = LESSONS.reduce((n, l) => n + l.slideCount, 0);

  return (
    <div className="home">
      <div className="home-hero">
        <h1>תכנות מתקדם ב-C++</h1>
        <p>
          כל חומר הקורס, פרוס לעמודים קצרים שאפשר באמת ללמוד מהם: הסבר ברור, קוד שרץ בלחיצה,
          דיאגרמות זיכרון מונפשות, מלכודות נפוצות ותרגול — ועוזר AI שרואה בדיוק את העמוד שאתה
          קורא.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <b>{LESSONS.length}</b>
            <span>שיעורים</span>
          </div>
          <div className="hero-stat">
            <b>{totalSlides}</b>
            <span>שקפי מקור</span>
          </div>
          <div className="hero-stat">
            <b>{totalSections}</b>
            <span>עמודי לימוד</span>
          </div>
          <div className="hero-stat">
            <b>g++ 13</b>
            <span>קומפילציה אמיתית</span>
          </div>
        </div>
      </div>

      <div className="feature-grid">
        <div className="feature">
          <div className="feature-ic">▶</div>
          <b>הקוד באמת רץ</b>
          <span>כל דוגמה נשלחת ל-g++ אמיתי ומחזירה פלט אמיתי — כולל שגיאות הקומפיילר.</span>
        </div>
        <div className="feature">
          <div className="feature-ic">🧠</div>
          <b>רואים את הזיכרון</b>
          <span>Stack ו-Heap מונפשים שורה-שורה. סוף סוף ברור מה קורה עם מצביעים ואובייקטים.</span>
        </div>
        <div className="feature">
          <div className="feature-ic">✦</div>
          <b>AI שמכיר את העמוד</b>
          <span>לוחצים על ✦ ליד כל קטע ושואלים עליו ישירות. הוא רואה בדיוק מה כתוב שם.</span>
        </div>
        <div className="feature">
          <div className="feature-ic">⌨</div>
          <b>סביבת פיתוח מובנית</b>
          <span>עורך קוד מלא עם הדגשת תחביר, stdin, שמירת קטעים ובדיקת פלט מול המצופה.</span>
        </div>
      </div>

      <h2 className="home-h2">השיעורים</h2>
      <div className="lesson-cards">
        {LESSONS.map((l) => {
          const n = countSections(l);
          const done = l.chapters.reduce(
            (acc, ch) => acc + ch.sections.filter((s) => completed.has(`${l.id}/${s.id}`)).length,
            0
          );
          const first = l.chapters[0]?.sections[0];
          return (
            <button
              key={l.id}
              className={`lesson-card${l.ready ? '' : ' dim'}`}
              onClick={() => l.ready && first && onOpen(l.id, first.id)}
              disabled={!l.ready}
            >
              <div className="lc-top">
                <span className="lc-num">{l.num}</span>
                <span className="lc-title">{l.title}</span>
              </div>
              <div className="lc-sub">{l.subtitle}</div>
              {l.ready ? (
                <>
                  <div className="lc-prog">
                    <i style={{ width: n ? `${(done / n) * 100}%` : '0%' }} />
                  </div>
                  <div className="lc-meta">
                    <span>
                      {done}/{n} עמודים
                    </span>
                    <span>{l.slideCount} שקפים במקור</span>
                  </div>
                </>
              ) : (
                <div className="lc-meta">
                  <span className="badge-soon">בקרוב</span>
                  <span>{l.slideCount} שקפים במקור</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

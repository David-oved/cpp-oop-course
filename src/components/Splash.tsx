import { useEffect, useState } from 'react';
import { consumeRedirectResult, onAuthChange, signIn, type User } from '../lib/firebase';
import { getEntryChoice, setEntryChoice } from '../lib/storage';
import { IGoogle } from './Icons';

/**
 * מסך פתיחה: אנימציית לוגו קצרה, ואז — רק אם המשתמש לא כבר "בפנים" (מחובר עם גוגל, או
 * שכבר בחר להיכנס כאורח בעבר) — מסך בחירה בין Google לאורח. משתמש שכבר בחר פעם רואה
 * רק את האנימציה בכל פתיחה עתידית, לא את מסך הבחירה שוב.
 */
export default function Splash({ onDone }: { onDone: () => void }) {
  const [showChoice, setShowChoice] = useState(false);
  const [animDone, setAnimDone] = useState(false);
  const [authKnown, setAuthKnown] = useState(false);
  const [authedUser, setAuthedUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* תופס משתמש שחזר זה עתה מהתחברות Google ב-redirect (מצב PWA מותקן, בעיקר אייפון).
     ==חייב להסתיים (redirectChecked) לפני שמחליטים אם להציג את מסך הבחירה== — אחרת יש
     מרוץ: onAuthChange עלול לירות ראשון עם user=null לפני שתוצאת ה-redirect באמת נטענה,
     ומראה למשתמש את מסך הבחירה שוב באמצע התחברות אמיתית. אם ה-redirect עצמו נכשל
     (למשל storage חסום בספארי) — מציגים שגיאה במפורש, לא נעלמים לו למסך שחור בלי הסבר. */
  const [redirectChecked, setRedirectChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    consumeRedirectResult()
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'ההתחברות נכשלה, נסה שוב.');
      })
      .finally(() => {
        if (!cancelled) setRedirectChecked(true);
      });
    const off = onAuthChange((u) => {
      setAuthedUser(u);
      setAuthKnown(true);
    });
    return () => {
      cancelled = true;
      off();
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setAnimDone(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!animDone || !authKnown || !redirectChecked) return;
    if (authedUser || getEntryChoice() === 'guest') {
      onDone();
    } else {
      setShowChoice(true);
    }
  }, [animDone, authKnown, redirectChecked, authedUser, onDone]);

  const doGoogle = async () => {
    setBusy(true);
    setError(null);
    try {
      await signIn();
      // אם זה redirect (PWA מותקן) — הדף עומד לנווט משם והלאה, אין מה לחכות כאן.
      // אם זה popup — onAuthChange כבר יעדכן authedUser וה-effect למעלה יסיים בעצמו.
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : 'ההתחברות נכשלה, נסה שוב.');
    }
  };

  const doGuest = () => {
    setEntryChoice('guest');
    onDone();
  };

  return (
    <div className="splash">
      <div className={`splash-mark${animDone ? ' settled' : ''}`}>C++</div>
      <div className={`splash-title${animDone ? ' in' : ''}`}>תכנות מתקדם ב-C++</div>

      {showChoice && (
        <div className="splash-choice">
          <button className="splash-btn splash-btn-google" onClick={doGoogle} disabled={busy}>
            <IGoogle size={18} />
            {busy ? 'מתחבר…' : 'התחברות עם Google'}
          </button>
          <button className="splash-btn splash-btn-guest" onClick={doGuest} disabled={busy}>
            המשך כאורח
          </button>
          {error && <div className="splash-error">{error}</div>}
          <p className="splash-note">
            התחברות משמשת לסנכרון בין מכשירים בעתיד — אפשר להשתמש בכל התוכן גם כאורח.
          </p>
        </div>
      )}
    </div>
  );
}

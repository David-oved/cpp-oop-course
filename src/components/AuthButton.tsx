import { useEffect, useRef, useState } from 'react';
import { auth, onAuthChange, signIn, signOutUser, type User } from '../lib/firebase';
import { IUser, IGoogle } from './Icons';
import { useApp } from '../AppContext';

/** כפתור התחברות/משתמש בסרגל העליון. התחברות אופציונלית — רק לסנכרון, לא חוסמת תוכן. */
export default function AuthButton() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { toast } = useApp();

  useEffect(() => onAuthChange(setUser), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const doSignIn = async () => {
    setBusy(true);
    try {
      await signIn();
    } catch (e) {
      toast(e instanceof Error ? `שגיאת התחברות: ${e.message}` : 'שגיאת התחברות');
    } finally {
      setBusy(false);
    }
  };

  const doSignOut = async () => {
    setMenuOpen(false);
    await signOutUser();
    toast('התנתקת בהצלחה');
  };

  if (!user) {
    return (
      <button className="icon-btn login-btn" onClick={doSignIn} disabled={busy} title="התחברות עם Google — לסנכרון בין מכשירים">
        <IGoogle size={16} />
        <span className="login-label">{busy ? 'מתחבר…' : 'התחברות'}</span>
      </button>
    );
  }

  return (
    <div className="auth-wrap" ref={wrapRef}>
      <button className="icon-btn user-btn" onClick={() => setMenuOpen((o) => !o)} title={user.email ?? 'המשתמש שלי'}>
        {user.photoURL ? (
          <img className="user-avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
        ) : (
          <IUser size={17} />
        )}
      </button>
      {menuOpen && (
        <div className="user-menu">
          <div className="user-menu-head">
            {user.photoURL && <img className="user-avatar lg" src={user.photoURL} alt="" referrerPolicy="no-referrer" />}
            <div className="user-menu-info">
              <b>{user.displayName ?? 'משתמש'}</b>
              <span>{user.email}</span>
            </div>
          </div>
          <div className="user-menu-note">מחובר/ת בהצלחה. התקדמות, תרגילים ופרויקטים שמורים מסונכרנים אוטומטית בין המכשירים שלך.</div>
          <button className="user-menu-signout" onClick={doSignOut}>
            התנתקות
          </button>
        </div>
      )}
    </div>
  );
}

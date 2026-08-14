/**
 * Firebase: התחברות עם Google + (בהמשך) סנכרון Firestore.
 *
 * ה-apiKey כאן אינו סוד — זהו מזהה קליינט ציבורי לפי המודל של Firebase Web
 * (ההגנה האמיתית היא ב-Authentication וב-Firestore Security Rules, לא בהסתרת המפתח).
 */
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD6SeGxELCf0NUWtF_mkz-wHr3gLViN9tk',
  authDomain: 'cpp-oop-course.firebaseapp.com',
  projectId: 'cpp-oop-course',
  storageBucket: 'cpp-oop-course.firebasestorage.app',
  messagingSenderId: '315741106216',
  appId: '1:315741106216:web:8be99859fec494ec5cc51d',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();

/**
 * PWA מותקן (standalone) — התנהגות ה-popup שם לא אחידה בין גרסאות iOS. ==redirect כברירת
 * מחדל ל-standalone נוסה בעבר וגרם לתקלה קשה יותר==: ניווט מלא מחוץ ל-scope של ה-PWA
 * גורם ל-iOS "להרוג" את תהליך ה-WKWebView, וכשהוא חוזר מ-Google הוא עולה מאתחול קר —
 * כל מצב ה-SPA (כולל ה-sessionStorage שבו Firebase שומר את בקשת ה-redirect הממתינה) אבד,
 * וזה נראה למשתמש כמו "האפליקציה קרסה והתאפסה". לכן מנסים קודם popup גם ב-standalone;
 * רק אם הוא נכשל לגמרי להיפתח (חלון לא נפתח בכלל — לא ביטול מכוון של המשתמש) נופלים
 * חזרה ל-redirect כרשת ביטחון.
 */
export function isStandalone(): boolean {
  const mq = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
  return mq || iosStandalone;
}

export async function signIn(): Promise<User | null> {
  try {
    const res = await signInWithPopup(auth, provider);
    return res.user;
  } catch (e) {
    const code = e instanceof Object && 'code' in e ? String((e as { code: unknown }).code) : '';
    // כישלון פתיחה בפועל (החלון לא נפתח/לא נתמך בסביבה) — לא ביטול מכוון של המשתמש
    const popupCouldNotOpen = code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment';
    if (isStandalone() && popupCouldNotOpen) {
      await signInWithRedirect(auth, provider);
      return null; // התוצאה תתקבל אחרי החזרה מגוגל, דרך consumeRedirectResult
    }
    throw e;
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}

/**
 * נקרא פעם אחת בעליית האפליקציה (מתוך Splash) — תופס משתמש שחזר זה עתה מהתחברות
 * ב-redirect. ==לא בולע שגיאות== — קורא ל-Splash חייב להציג אותן למשתמש, אחרת כישלון
 * התחברות באייפון (redirect שנכשל) נראה כמו "המסך פשוט נהיה שחור" בלי שום הסבר.
 */
export async function consumeRedirectResult(): Promise<User | null> {
  const res = await getRedirectResult(auth);
  return res?.user ?? null;
}

export type { User };

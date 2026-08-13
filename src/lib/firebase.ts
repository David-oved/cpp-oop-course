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
 * PWA מותקן (standalone) — ב-iOS בפרט, popup להתחברות נחסם/מתנהג לא אמין בתוך
 * מצב standalone, ולכן משתמשים ב-redirect שם. בדפדפן רגיל popup נוח יותר (לא עוזב את הדף).
 */
export function isStandalone(): boolean {
  const mq = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
  return mq || iosStandalone;
}

export async function signIn(): Promise<User | null> {
  if (isStandalone()) {
    await signInWithRedirect(auth, provider);
    return null; // התוצאה תתקבל אחרי החזרה מגוגל, דרך consumeRedirectResult
  }
  const res = await signInWithPopup(auth, provider);
  return res.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}

/** נקרא פעם אחת בעליית האפליקציה — תופס משתמש שחזר זה עתה מהתחברות ב-redirect. */
export async function consumeRedirectResult(): Promise<User | null> {
  try {
    const res = await getRedirectResult(auth);
    return res?.user ?? null;
  } catch {
    return null;
  }
}

export type { User };

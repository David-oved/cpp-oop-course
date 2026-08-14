import { useEffect, useState } from 'react';
import { isStandalone } from '../lib/firebase';
import { getInstallDismissedAt, setInstallDismissedAt } from '../lib/storage';
import { IDownload } from './Icons';

/**
 * באנר המלצת התקנה — מוצג רק למי שעדיין לא התקין את האפליקציה על המכשיר (לא standalone),
 * ורק בטלפון (iOS/Android; בדסקטופ לא רלוונטי לבקשה הזו). ההסבר "איך מתקינים" משתנה
 * לפי פלטפורמה ודפדפן, כי בכל שילוב הפעולה נראית אחרת (ובחלק מהדפדפנים באייפון אי אפשר
 * בכלל להתקין — צריך לעבור לספארי). באנדרואיד עם דפדפן שתומך ב-beforeinstallprompt
 * (כרום/Edge/Samsung Internet) יש כפתור התקנה אמיתי במקום טקסט הסבר.
 */

type Platform = 'ios' | 'android' | 'other';
type Browser = 'safari' | 'chrome' | 'firefox' | 'edge' | 'samsung' | 'opera' | 'other';

const DISMISS_MS = 14 * 24 * 60 * 60 * 1000; // אחרי דחייה — לא מציקים שוב במשך שבועיים

function detectPlatform(ua: string): Platform {
  if (/iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

function detectBrowser(ua: string, platform: Platform): Browser {
  if (platform === 'ios') {
    // ==כל דפדפן ב-iOS רץ על מנוע ספארי (WebKit)==, אבל רק מספארי עצמו אפשר להתקין —
    // בדפדפנים אחרים ה-UA כולל סימון ייחודי (CriOS/FxiOS/EdgiOS) שמבדיל אותם מספארי.
    if (/CriOS/.test(ua)) return 'chrome';
    if (/FxiOS/.test(ua)) return 'firefox';
    if (/EdgiOS/.test(ua)) return 'edge';
    if (/OPiOS|OPT\//.test(ua)) return 'opera';
    return 'safari';
  }
  if (/SamsungBrowser/.test(ua)) return 'samsung';
  if (/EdgA/.test(ua)) return 'edge';
  if (/OPR\//.test(ua)) return 'opera';
  if (/Firefox/.test(ua)) return 'firefox';
  if (/Chrome/.test(ua)) return 'chrome';
  return 'other';
}

function instructionsFor(platform: Platform, browser: Browser): string {
  if (platform === 'ios') {
    if (browser === 'safari') {
      return 'הקישו על כפתור השיתוף (הריבוע עם החץ כלפי מעלה) בסרגל התחתון או העליון, ואז על "הוסף למסך הבית".';
    }
    return 'בדפדפן הזה אי אפשר להתקין על אייפון. פתחו את הקישור בספארי (Safari), ומשם: כפתור השיתוף ← "הוסף למסך הבית".';
  }
  switch (browser) {
    case 'firefox':
      return 'פתחו את התפריט (שלוש הנקודות) ובחרו "התקנה" או "הוספה למסך הבית".';
    default:
      return 'פתחו את התפריט (שלוש הנקודות בפינה) ובחרו "התקנת אפליקציה" או "הוספה למסך הבית".';
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallBanner() {
  const [dismissed, setDismissed] = useState(() => Date.now() - getInstallDismissedAt() < DISMISS_MS);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (isStandalone() || dismissed || installed) return null;

  const ua = navigator.userAgent;
  const platform = detectPlatform(ua);
  if (platform === 'other') return null; // דסקטופ — ההמלצה הזו מיועדת לטלפון בלבד
  const browser = detectBrowser(ua, platform);

  const dismiss = () => {
    setInstallDismissedAt(Date.now());
    setDismissed(true);
  };

  const doNativeInstall = async () => {
    if (!deferredPrompt) return;
    setBusy(true);
    try {
      const choice = await deferredPrompt.prompt().then(() => deferredPrompt.userChoice);
      if (choice.outcome === 'accepted') setInstalled(true);
    } finally {
      setDeferredPrompt(null);
      setBusy(false);
    }
  };

  const hasNativePrompt = platform === 'android' && deferredPrompt;

  return (
    <div className="install-banner">
      <div className="install-banner-head">
        <IDownload size={16} />
        <b>התקינו את האפליקציה על הטלפון</b>
      </div>
      <p className="install-banner-notes">
        {hasNativePrompt
          ? 'התקנה נותנת גישה מהירה ממסך הבית, עובדת גם בלי אינטרנט, ומיידעת אתכם כשיש עדכון.'
          : instructionsFor(platform, browser)}
      </p>
      <div className="install-banner-actions">
        <button className="update-dismiss" onClick={dismiss} disabled={busy}>
          {hasNativePrompt ? 'לא עכשיו' : 'הבנתי, תודה'}
        </button>
        {hasNativePrompt && (
          <button className="update-btn" onClick={doNativeInstall} disabled={busy}>
            {busy ? 'מתקין…' : 'התקן עכשיו'}
          </button>
        )}
      </div>
    </div>
  );
}

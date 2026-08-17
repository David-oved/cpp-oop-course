/** ממשק אחיד לכל ספקי ה-AI. */

export type ProviderId = 'anthropic' | 'openai' | 'gemini';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamHandlers {
  onText: (chunk: string) => void;
  onDone: (full: string) => void;
  onError: (message: string) => void;
}

export interface ChatRequest {
  apiKey: string;
  model: string;
  system: string;
  messages: ChatTurn[];
  signal: AbortSignal;
  /** ברירת מחדל 4000 (מספיק לתשובת צ'אט). מוגדל ל-lib/generate.ts שמבקש JSON גדול. */
  maxTokens?: number;
}

export interface ModelOption {
  id: string;
  label: string;
  /** תיאור קצר להצגה בבורר */
  note?: string;
}

/**
 * מדרג רשימת מודלים לפי סדר העדפה.
 * התאמה מדויקת קודמת, אחר כך מודל שמתחיל באותו שם, ואז השאר.
 */
export function rankModels(available: string[], prefs: string[]): string[] {
  const score = (id: string): number => {
    const exact = prefs.indexOf(id);
    if (exact >= 0) return exact;
    for (let i = 0; i < prefs.length; i++) {
      if (id.startsWith(prefs[i])) return prefs.length + i;
    }
    return prefs.length * 2;
  };
  return [...available].sort((a, b) => score(a) - score(b) || a.localeCompare(b));
}

export interface SetupStep {
  text: string;
  /** קישור שמצורף לצעד */
  href?: string;
  linkLabel?: string;
}

export interface Provider {
  id: ProviderId;
  /** שם להצגה */
  name: string;
  /** שם החברה */
  vendor: string;
  /** אימוג'י/סימן לזיהוי מהיר */
  mark: string;
  /** צבע מותג לכרטיס */
  color: string;
  /** סדר העדפה לבחירה אוטומטית מתוך המודלים שהמפתח באמת יכול להריץ */
  modelPrefs: string[];
  /** גיבוי אם רשימת המודלים לא זמינה */
  defaultModel: string;
  /**
   * התחלה טיפוסית של המפתח. נבדק רק כרמז רך.
   * ==לא מוגדר עבור ספקים שמשנים את פורמט המפתח== (למשל Google).
   */
  keyPrefix?: string;
  keyPlaceholder: string;
  /** דף ניהול המפתחות */
  consoleUrl: string;
  /** תמצית בשורה אחת: עלות/חינם */
  pricingNote: string;
  /** מדריך השגת מפתח */
  setup: SetupStep[];
  /** אזהרות ומגבלות שכדאי לדעת */
  caveats?: string[];
  /** שולח בקשה ומזרים תשובה. */
  stream: (req: ChatRequest, h: StreamHandlers) => Promise<void>;
  /**
   * שואל את ה-API אילו מודלים המפתח הזה באמת יכול להריץ,
   * ומחזיר אותם מדורגים — המועדף ראשון.
   * זורק שגיאה עם הודעה בעברית אם המפתח לא תקין.
   */
  listModels: (apiKey: string, signal?: AbortSignal) => Promise<string[]>;
}

/** קורא זרם SSE ומעביר כל אירוע ל-callback. משותף ל-OpenAI ול-Gemini. */
export async function readSSE(
  res: Response,
  onEvent: (data: string) => void,
  signal: AbortSignal
): Promise<void> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error('לא התקבל גוף תשובה מהשרת');
  const decoder = new TextDecoder();
  let buffer = '';

  while (!signal.aborted) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // אירועים מופרדים בשורה ריקה
    let sep: number;
    while ((sep = buffer.search(/\r?\n\r?\n/)) !== -1) {
      const raw = buffer.slice(0, sep);
      buffer = buffer.slice(sep + (buffer[sep] === '\r' ? 4 : 2));
      for (const line of raw.split(/\r?\n/)) {
        if (line.startsWith('data:')) onEvent(line.slice(5).trim());
      }
    }
  }
  if (signal.aborted) await reader.cancel().catch(() => {});
}

/** ממיר תשובת שגיאה של API להודעה קריאה בעברית. */
export async function describeHttpError(res: Response, providerName: string): Promise<string> {
  let detail = '';
  let reason = '';
  try {
    const body = await res.json();
    detail =
      body?.error?.message ??
      body?.error?.[0]?.message ??
      body?.message ??
      JSON.stringify(body).slice(0, 200);
    reason = String(body?.error?.status ?? body?.error?.type ?? '');
    const info = body?.error?.details?.find?.(
      (d: { reason?: string }) => typeof d?.reason === 'string'
    );
    if (info?.reason) reason = info.reason;
  } catch {
    detail = await res.text().catch(() => '');
  }

  const blob = `${reason} ${detail}`;
  const base = `${providerName} החזיר שגיאה ${res.status}`;

  // ==Google מחזירה 400 על מפתח לא תקין, לא 401== — לכן מזהים לפי התוכן ולא לפי הקוד
  if (/API_KEY_INVALID|api key not valid|invalid[_ ]api[_ ]key|incorrect api key/i.test(blob)) {
    return `המפתח לא תקין. ודא שהעתקת אותו במלואו מהעמוד של ${providerName}, בלי רווחים בהתחלה או בסוף.\n\n(${detail})`;
  }
  if (/SERVICE_DISABLED|has not been used in project|is disabled/i.test(blob)) {
    return `ה-API אינו מופעל בפרויקט הזה. פתח את הקישור שבהודעה למטה, הפעל את השירות, והמתן דקה.\n\n(${detail})`;
  }
  if (/insufficient_quota|billing|credit balance/i.test(blob)) {
    return `אין קרדיט בחשבון ${providerName}. המפתח תקין, אבל צריך לטעון קרדיט לפני שאפשר להשתמש בו.\n\n(${detail})`;
  }
  if (/PERMISSION_DENIED|location is not supported|user location/i.test(blob)) {
    return `ל-${providerName} אין הרשאה לבקשה הזו — ייתכן שהשירות לא זמין במדינה שלך.\n\n(${detail})`;
  }

  switch (res.status) {
    case 401:
    case 403:
      return `${base}: המפתח לא תקין או שאין לו הרשאה. בדוק אותו בהגדרות.\n${detail}`;
    case 404:
      return `${base}: המודל שנבחר לא נמצא או שאינו זמין למפתח שלך.\n${detail}`;
    case 429:
      return `${base}: חרגת ממגבלת הקצב או שנגמר הקרדיט. המתן דקה ונסה שוב.\n${detail}`;
    case 400:
      return `${base}: הבקשה נדחתה.\n${detail}`;
    default:
      return res.status >= 500
        ? `${base}: תקלה זמנית בשרת. נסה שוב בעוד רגע.`
        : `${base}\n${detail}`;
  }
}

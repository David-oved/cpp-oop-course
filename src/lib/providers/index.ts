import { anthropicProvider } from './anthropic';
import { openaiProvider } from './openai';
import { geminiProvider } from './gemini';
import type { Provider, ProviderId } from './types';

export * from './types';

export const PROVIDERS: Provider[] = [anthropicProvider, openaiProvider, geminiProvider];

export const getProvider = (id: ProviderId): Provider =>
  PROVIDERS.find((p) => p.id === id) ?? anthropicProvider;

/**
 * בדיקה מקומית מהירה של צורת המפתח — רק כדי לתפוס העתקה חלקית.
 * ==לא חוסמת כלום==: הבדיקה האמיתית היא קריאה ל-API.
 * בדיקת קידומת מתבצעת רק לספקים שהפורמט שלהם יציב.
 */
export function looksLikeValidKey(p: Provider, key: string): string | null {
  const k = key.trim();
  if (!k) return 'לא הוזן מפתח.';
  if (/\s/.test(k)) return 'המפתח מכיל רווח. ודא שהעתקת אותו במלואו ובלי תווים נוספים.';
  if (k.length < 15) return 'המפתח קצר מדי — כנראה הועתק חלקית.';
  if (p.keyPrefix && !k.startsWith(p.keyPrefix))
    return `מפתחות של ${p.vendor} מתחילים בדרך כלל ב-${p.keyPrefix}. אם זה בכל זאת המפתח שקיבלת — פשוט לחץ "בדוק מפתח".`;
  return null;
}

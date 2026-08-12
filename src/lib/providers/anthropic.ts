import Anthropic from '@anthropic-ai/sdk';
import { rankModels, type Provider } from './types';

let cached: { key: string; client: Anthropic } | null = null;

function client(apiKey: string): Anthropic {
  if (!cached || cached.key !== apiKey) {
    cached = { key: apiKey, client: new Anthropic({ apiKey, dangerouslyAllowBrowser: true }) };
  }
  return cached.client;
}

export const anthropicProvider: Provider = {
  id: 'anthropic',
  name: 'Claude',
  vendor: 'Anthropic',
  mark: '✳',
  color: '#c96442',
  modelPrefs: [
    'claude-opus-5',
    'claude-sonnet-5',
    'claude-opus-4-8',
    'claude-sonnet-4-6',
    'claude-haiku-4-5',
  ],
  defaultModel: 'claude-opus-5',
  keyPrefix: 'sk-ant-',
  keyPlaceholder: 'sk-ant-api03-…',
  consoleUrl: 'https://console.anthropic.com/settings/keys',
  pricingNote: 'בתשלום לפי שימוש · נדרשת טעינת קרדיט מראש',
  setup: [
    { text: 'היכנס ל-Anthropic Console והירשם או התחבר.', href: 'https://console.anthropic.com', linkLabel: 'console.anthropic.com' },
    { text: 'בתפריט הצד בחר Settings ואז API Keys.', href: 'https://console.anthropic.com/settings/keys', linkLabel: 'עמוד המפתחות' },
    { text: 'לפני שאפשר להשתמש — טען קרדיט תחת Plans & Billing. מינימום 5$.', href: 'https://console.anthropic.com/settings/billing', linkLabel: 'עמוד החיוב' },
    { text: 'לחץ Create Key, תן לו שם (למשל "קורס C++"), וצור.' },
    { text: 'העתק את המפתח מיד — הוא מוצג פעם אחת בלבד — והדבק כאן למעלה.' },
  ],
  caveats: [
    'המפתח מוצג **פעם אחת בלבד** ביצירה. אם איבדת אותו, צור חדש.',
    'ללא טעינת קרדיט מראש כל בקשה תיכשל עם שגיאת 400.',
    'המודל נבחר אוטומטית מתוך אלה שהמפתח שלך מורשה להריץ.',
  ],

  async listModels(apiKey, signal) {
    try {
      const page = await client(apiKey.trim()).models.list({ limit: 100 }, { signal });
      const ids: string[] = [];
      for await (const m of page) ids.push(m.id);
      if (ids.length === 0) {
        throw new Error('המפתח תקין אבל לא הוחזר אף מודל. בדוק את ההרשאות בחשבון Anthropic.');
      }
      return rankModels(ids, this.modelPrefs);
    } catch (e) {
      throw new Error(describe(e));
    }
  },

  async stream(req, h) {
    let full = '';
    try {
      const s = client(req.apiKey).messages.stream(
        {
          model: req.model,
          max_tokens: 4000,
          system: req.system,
          thinking: { type: 'adaptive' },
          output_config: { effort: 'medium' },
          messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
        },
        { signal: req.signal }
      );

      s.on('text', (delta) => {
        full += delta;
        h.onText(delta);
      });

      const final = await s.finalMessage();
      if (final.stop_reason === 'refusal') {
        h.onError('המודל סירב לענות על הבקשה הזו. נסח את השאלה אחרת.');
        return;
      }
      h.onDone(full);
    } catch (e) {
      if (req.signal.aborted) {
        h.onDone(full);
        return;
      }
      h.onError(describe(e));
    }
  },
};

function describe(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return 'המפתח של Anthropic לא תקין. בדוק אותו בהגדרות.';
  if (e instanceof Anthropic.PermissionDeniedError) return 'למפתח אין הרשאה למודל הזה. נסה מודל אחר.';
  if (e instanceof Anthropic.RateLimitError) return 'חרגת ממגבלת הקצב. המתן כמה שניות ונסה שוב.';
  if (e instanceof Anthropic.NotFoundError) return 'המודל שנבחר לא נמצא. בחר מודל אחר בהגדרות.';
  if (e instanceof Anthropic.BadRequestError)
    return `הבקשה נדחתה: ${e.message}\nאם ההודעה מזכירה credit — צריך לטעון קרדיט בחשבון Anthropic.`;
  if (e instanceof Anthropic.APIConnectionError) return 'אין חיבור ל-Anthropic. בדוק את האינטרנט.';
  if (e instanceof Anthropic.APIError) return `שגיאת שרת (${e.status ?? '?'}): ${e.message}`;
  return e instanceof Error ? e.message : 'שגיאה לא צפויה.';
}

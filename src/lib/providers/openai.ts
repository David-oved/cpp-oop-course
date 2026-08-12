import { describeHttpError, rankModels, readSSE, type Provider } from './types';

const ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const MODELS_URL = 'https://api.openai.com/v1/models';

/** מודלים שאינם מודלי שיחה */
const NOT_CHAT =
  /embedding|whisper|tts|dall-e|moderation|realtime|audio|image|transcribe|sora|babbage|davinci|instruct|search|computer-use/i;

export const openaiProvider: Provider = {
  id: 'openai',
  name: 'ChatGPT',
  vendor: 'OpenAI',
  mark: '◍',
  color: '#10a37f',
  modelPrefs: ['gpt-5', 'gpt-5-mini', 'gpt-4.1', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4o-mini', 'o4-mini'],
  defaultModel: 'gpt-4o',
  keyPrefix: 'sk-',
  keyPlaceholder: 'sk-proj-…',
  consoleUrl: 'https://platform.openai.com/api-keys',
  pricingNote: 'בתשלום לפי שימוש · נדרשת טעינת קרדיט מראש',
  setup: [
    { text: 'היכנס ל-OpenAI Platform. שים לב — זה **לא** אותו אתר של ChatGPT, וגם מנוי ChatGPT Plus לא כולל גישת API.', href: 'https://platform.openai.com', linkLabel: 'platform.openai.com' },
    { text: 'טען קרדיט תחת Settings → Billing. בלי זה כל בקשה תיכשל.', href: 'https://platform.openai.com/settings/organization/billing/overview', linkLabel: 'עמוד החיוב' },
    { text: 'עבור ל-API keys ולחץ Create new secret key.', href: 'https://platform.openai.com/api-keys', linkLabel: 'עמוד המפתחות' },
    { text: 'תן שם למפתח, השאר את ההרשאות על All, וצור.' },
    { text: 'העתק את המפתח מיד — הוא מוצג פעם אחת בלבד — והדבק כאן למעלה.' },
  ],
  caveats: [
    'מנוי **ChatGPT Plus אינו כולל** גישת API. זה חיוב נפרד לגמרי.',
    'ללא טעינת קרדיט תקבל שגיאה `insufficient_quota` גם אם המפתח תקין.',
    'המודל נבחר אוטומטית מתוך אלה שהמפתח שלך מורשה להריץ.',
  ],

  async listModels(apiKey, signal) {
    const res = await fetch(MODELS_URL, {
      signal,
      headers: { Authorization: `Bearer ${apiKey.trim()}` },
    });
    if (!res.ok) throw new Error(await describeHttpError(res, 'OpenAI'));

    const data = (await res.json()) as { data?: { id?: string }[] };
    const ids = (data.data ?? [])
      .map((m) => m.id ?? '')
      .filter((id) => (/^(gpt-|o\d)/.test(id)) && !NOT_CHAT.test(id));

    if (ids.length === 0) {
      throw new Error('המפתח תקין אבל אין לו גישה לאף מודל שיחה. בדוק את ההרשאות בחשבון OpenAI.');
    }
    return rankModels(ids, this.modelPrefs);
  },

  async stream(req, h) {
    let full = '';
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        signal: req.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${req.apiKey}`,
        },
        body: JSON.stringify({
          model: req.model,
          stream: true,
          max_completion_tokens: 4000,
          messages: [
            { role: 'system', content: req.system },
            ...req.messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!res.ok) {
        h.onError(await describeHttpError(res, 'OpenAI'));
        return;
      }

      await readSSE(
        res,
        (data) => {
          if (data === '[DONE]') return;
          try {
            const j = JSON.parse(data);
            const delta: string | undefined = j?.choices?.[0]?.delta?.content;
            if (delta) {
              full += delta;
              h.onText(delta);
            }
          } catch {
            /* פיסת SSE חלקית — מתעלמים */
          }
        },
        req.signal
      );

      h.onDone(full);
    } catch (e) {
      if (req.signal.aborted) {
        h.onDone(full);
        return;
      }
      h.onError(
        e instanceof TypeError
          ? 'לא ניתן להתחבר ל-OpenAI. בדוק את חיבור האינטרנט.'
          : e instanceof Error
            ? e.message
            : 'שגיאה לא צפויה מול OpenAI.'
      );
    }
  },
};

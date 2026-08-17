import { describeHttpError, rankModels, readSSE, type Provider } from './types';

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

/** מודלים שלא מתאימים לשיחת טקסט — נסננים גם אם הם תומכים ב-generateContent */
const NOT_CHAT = /embedding|aqa|imagen|veo|-tts|-image|image-generation|learnlm|gemma|nano-banana/i;

export const geminiProvider: Provider = {
  id: 'gemini',
  name: 'Gemini',
  vendor: 'Google',
  mark: '◆',
  color: '#4285f4',
  modelPrefs: [
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-pro-latest',
    'gemini-2.5-pro',
    'gemini-1.5-flash',
  ],
  defaultModel: 'gemini-2.5-flash',
  // ==אין בדיקת קידומת==: Google שינתה את פורמט המפתחות, ולא כל מפתח תקין מתחיל ב-AIza
  keyPlaceholder: 'הדבק כאן את המפתח מ-Google AI Studio',
  consoleUrl: 'https://aistudio.google.com/api-keys',
  pricingNote: '✓ יש רמה חינמית — לא נדרש כרטיס אשראי',
  setup: [
    {
      text: 'היכנס ל-Google AI Studio עם חשבון Google רגיל.',
      href: 'https://aistudio.google.com/api-keys',
      linkLabel: 'aistudio.google.com/api-keys',
    },
    { text: 'לחץ על **Create API key** (או "Get API key" אם זו הפעם הראשונה).' },
    { text: 'בחר פרויקט קיים, או תן ל-Google ליצור פרויקט חדש עבורך.' },
    { text: 'העתק את המפתח והדבק כאן למעלה. אפשר לחזור ולראות אותו שוב בהמשך.' },
    { text: 'לחץ **בדוק מפתח** — האפליקציה תשאל את Google אילו מודלים המפתח שלך יכול להריץ, ותבחר את הטוב ביותר אוטומטית.' },
  ],
  caveats: [
    'זו האפשרות **הכי נוחה לסטודנטים** — יש רמת שימוש חינמית ואין צורך בכרטיס אשראי.',
    'מפתחות חדשים של Google **לא בהכרח מתחילים ב-`AIza`** — כל פורמט מתקבל כאן.',
    'ברמה החינמית יש מגבלת בקשות לדקה. אם תקבל שגיאת 429 — המתן דקה.',
    'שירות ה-API אינו זמין בכל המדינות. אם מתקבלת שגיאת הרשאה — ייתכן שזו הסיבה.',
  ],

  async listModels(apiKey, signal) {
    const res = await fetch(`${BASE}/models?key=${encodeURIComponent(apiKey.trim())}&pageSize=200`, {
      signal,
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(await describeHttpError(res, 'Gemini'));

    const data = (await res.json()) as {
      models?: { name?: string; supportedGenerationMethods?: string[] }[];
    };

    const ids = (data.models ?? [])
      .filter((m) => (m.supportedGenerationMethods ?? []).includes('generateContent'))
      .map((m) => (m.name ?? '').replace(/^models\//, ''))
      .filter((id) => id && !NOT_CHAT.test(id));

    if (ids.length === 0) {
      throw new Error(
        'המפתח תקין אבל לא נמצא אף מודל שיחה שזמין לו. ייתכן שהשירות לא זמין באזור שלך.'
      );
    }
    return rankModels(ids, this.modelPrefs);
  },

  async stream(req, h) {
    let full = '';
    try {
      const url =
        `${BASE}/models/${encodeURIComponent(req.model)}:streamGenerateContent` +
        `?alt=sse&key=${encodeURIComponent(req.apiKey)}`;

      const res = await fetch(url, {
        method: 'POST',
        signal: req.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: req.system }] },
          contents: req.messages.map((m) => ({
            // Gemini קורא לתפקיד של המודל "model" ולא "assistant"
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          generationConfig: { maxOutputTokens: req.maxTokens ?? 4000 },
        }),
      });

      if (!res.ok) {
        const msg = await describeHttpError(res, 'Gemini');
        h.onError(
          res.status === 404
            ? `${msg}\n\nלחץ "בדוק מפתח" בהגדרות — האפליקציה תבחר מחדש מודל שזמין למפתח שלך.`
            : msg
        );
        return;
      }

      await readSSE(
        res,
        (data) => {
          try {
            const j = JSON.parse(data);
            const parts = j?.candidates?.[0]?.content?.parts;
            if (Array.isArray(parts)) {
              for (const p of parts) {
                if (typeof p?.text === 'string' && p.text) {
                  full += p.text;
                  h.onText(p.text);
                }
              }
            }
            const blocked = j?.promptFeedback?.blockReason;
            if (blocked) h.onError(`Gemini חסם את הבקשה (${blocked}). נסח את השאלה אחרת.`);
          } catch {
            /* פיסת SSE חלקית */
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
          ? 'לא ניתן להתחבר ל-Google. בדוק את חיבור האינטרנט.'
          : e instanceof Error
            ? e.message
            : 'שגיאה לא צפויה מול Gemini.'
      );
    }
  },
};

import { getProvider, PROVIDERS, type ChatTurn, type Provider, type StreamHandlers } from './providers';
import { getActiveProvider, getKey, getModelFor, setModelFor } from './storage';

export type { ChatTurn, StreamHandlers } from './providers';

export interface AskContext {
  lessonTitle: string;
  chapterTitle: string;
  sectionTitle: string;
  /** תמצית טקסטואלית של כל מה שמופיע בעמוד */
  sectionText: string;
  /** ההקשר הצר — הבלוק המדויק שעליו נלחץ "שאל את ה-AI" */
  focus?: string;
  focusLabel?: string;
}

const SYSTEM = `אתה מתרגל בקורס "תכנות מתקדם ב-C++" במרכז האקדמי לב (מבוסס על מצגות של אפרת עמר).

הקהל: סטודנטים בשנה א' שסיימו קורס מבוא במדעי המחשב בשפת C. הם מכירים מצביעים, מערכים, פונקציות, malloc/free ומחרוזות בסגנון C. הם לא מכירים עדיין OOP.

איך אתה עונה:
- בעברית, בגוף שני, בטון ידידותי וישיר. בלי הקדמות מנומסות ובלי "שאלה מצוינת!".
- מונחים מקצועיים באנגלית נשארים באנגלית (class, constructor, heap), עם התרגום העברי בסוגריים בפעם הראשונה.
- קוד תמיד באנגלית, בבלוק \`\`\`cpp.
- קצר וממוקד. אם השאלה קטנה — תשובה של שתי שורות מספיקה. אל תכתוב חיבור.
- כשמסבירים מה קורה בזיכרון, תאר במפורש מה יושב על ה-stack ומה על ה-heap.
- אם הסטודנט טועה בהנחת יסוד, תקן את זה במפורש לפני שאתה ממשיך.
- כשיש הבדל בין הסגנון שמלמדים בקורס לבין C++ מודרני — הסבר קודם את הסגנון של הקורס (זה מה שיהיה במבחן), ואז ציין בקצרה את הגרסה המודרנית.
- אל תמציא. אם משהו לא מופיע בחומר ואתה לא בטוח — תגיד את זה.

אתה מקבל את תוכן העמוד שהסטודנט קורא כרגע. התייחס אליו — אל תיתן תשובה גנרית כשיש הקשר ספציפי.`;

function buildContextBlock(ctx: AskContext): string {
  const parts = [
    `שיעור: ${ctx.lessonTitle}`,
    `פרק: ${ctx.chapterTitle}`,
    `עמוד: ${ctx.sectionTitle}`,
    '',
    '--- תוכן העמוד שהסטודנט רואה כרגע ---',
    ctx.sectionText.slice(0, 12000),
    '--- סוף תוכן העמוד ---',
  ];
  if (ctx.focus) {
    parts.push(
      '',
      `--- הסטודנט שאל ספציפית על ${ctx.focusLabel ?? 'הקטע הבא'} ---`,
      ctx.focus.slice(0, 4000),
      '--- סוף ---'
    );
  }
  return parts.join('\n');
}

/** הספק והמודל שפעילים כרגע לפי ההגדרות. model ריק = עוד לא זוהה. */
export function activeSetup(): { provider: Provider; model: string; key: string } {
  const provider = getProvider(getActiveProvider());
  return {
    provider,
    model: getModelFor(provider.id, ''),
    key: getKey(provider.id),
  };
}

export function askAI(
  question: string,
  ctx: AskContext,
  history: ChatTurn[],
  handlers: StreamHandlers
): () => void {
  const controller = new AbortController();
  const { provider, key } = activeSetup();

  if (!key) {
    handlers.onError(
      `לא הוגדר מפתח עבור ${provider.vendor}. פתח את ההגדרות (⚙ למעלה), בחר ספק והדבק מפתח.`
    );
    return () => {};
  }

  // ההקשר נשלח פעם אחת בתחילת השיחה; המשך השיחה נשען עליו
  const messages: ChatTurn[] = [];
  if (history.length === 0) {
    messages.push({ role: 'user', content: `${buildContextBlock(ctx)}\n\nהשאלה שלי: ${question}` });
  } else {
    messages.push({
      role: 'user',
      content: `${buildContextBlock(ctx)}\n\nהשאלה שלי: ${history[0].content}`,
    });
    for (const t of history.slice(1)) messages.push(t);
    messages.push({ role: 'user', content: question });
  }

  void (async () => {
    // אם עוד לא נבחר מודל למפתח הזה — מאתרים אוטומטית מודל שבאמת עובד
    let model = getModelFor(provider.id, '');
    if (!model) {
      try {
        const r = await resolveWorkingModel(provider, key, controller.signal);
        model = r.model;
        setModelFor(provider.id, model);
      } catch (e) {
        if (controller.signal.aborted) return;
        handlers.onError(e instanceof Error ? e.message : 'לא ניתן לאתר מודל זמין למפתח הזה.');
        return;
      }
    }
    if (controller.signal.aborted) return;

    // כשל שמצביע על מודל שהוצא משימוש — מאתרים מודל חדש ומנסים שוב פעם אחת
    const isStaleModel = (msg: string) =>
      /no longer available|not found|לא נמצא|does not exist|deprecated|model_not_found/i.test(msg);

    let retried = false;
    const guard: StreamHandlers = {
      onText: handlers.onText,
      onDone: handlers.onDone,
      onError: (msg) => {
        if (retried || !isStaleModel(msg) || controller.signal.aborted) {
          handlers.onError(msg);
          return;
        }
        retried = true;
        setModelFor(provider.id, '');
        void (async () => {
          try {
            const r = await resolveWorkingModel(provider, key, controller.signal);
            setModelFor(provider.id, r.model);
            await provider.stream(
              { apiKey: key, model: r.model, system: SYSTEM, messages, signal: controller.signal },
              handlers
            );
          } catch (e) {
            handlers.onError(e instanceof Error ? e.message : msg);
          }
        })();
      },
    };

    await provider.stream(
      { apiKey: key, model, system: SYSTEM, messages, signal: controller.signal },
      guard
    );
  })();

  return () => controller.abort();
}

export interface ProviderCheck {
  ok: boolean;
  /** המודל שנבחר אוטומטית */
  model?: string;
  /** כל המודלים שהמפתח יכול להריץ, מהמועדף לפחות */
  available?: string[];
  /** מודלים שהופיעו ברשימה אבל נכשלו בפועל */
  rejected?: { model: string; why: string }[];
  error?: string;
}

/** שולח בקשת בדיקה זעירה. מחזיר null בהצלחה, או הודעת שגיאה. */
function probe(
  provider: Provider,
  key: string,
  model: string,
  signal: AbortSignal
): Promise<string | null> {
  return new Promise((resolve) => {
    let got = false;
    void provider.stream(
      {
        apiKey: key,
        model,
        system: 'ענה במילה אחת בלבד.',
        messages: [{ role: 'user', content: 'אמור "אוקיי" ותו לא.' }],
        signal,
      },
      {
        onText: () => { got = true; },
        onDone: () => resolve(got ? null : 'המודל החזיר תשובה ריקה.'),
        onError: (m) => resolve(m),
      }
    );
  });
}

/** כמה מודלים לנסות לפני שמוותרים */
const MAX_CANDIDATES = 6;

/**
 * מאתר מודל ש**באמת עובד** עם המפתח.
 *
 * לא מספיק לקחת את הראשון מרשימת המודלים: ספקים משאירים ברשימה מודלים
 * שהוצאו משימוש (Google מחזירה עליהם 404 "no longer available to new users").
 * לכן מנסים אחד-אחד לפי סדר העדפה עד שאחד עונה בפועל.
 */
export async function resolveWorkingModel(
  provider: Provider,
  key: string,
  signal: AbortSignal
): Promise<{ model: string; available: string[]; rejected: { model: string; why: string }[] }> {
  const available = await provider.listModels(key, signal);
  const rejected: { model: string; why: string }[] = [];

  for (const candidate of available.slice(0, MAX_CANDIDATES)) {
    if (signal.aborted) throw new Error('הבדיקה בוטלה.');
    const err = await probe(provider, key, candidate, signal);
    if (!err) return { model: candidate, available, rejected };
    rejected.push({ model: candidate, why: err.split('\n')[0] });
  }

  throw new Error(
    `המפתח תקין ו-${provider.vendor} מחזיר ${available.length} מודלים, ` +
      `אבל אף אחד מ-${rejected.length} הראשונים לא הצליח לענות.\n\n` +
      rejected.map((r) => `• ${r.model}: ${r.why}`).join('\n')
  );
}

/**
 * בודק מפתח מול הספק: מאתר את המודלים הזמינים, מנסה אותם לפי סדר,
 * ומחזיר את הראשון שבאמת עונה.
 */
export async function checkProvider(
  providerId: Provider['id'],
  key: string
): Promise<ProviderCheck> {
  const provider = getProvider(providerId);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);

  try {
    const r = await resolveWorkingModel(provider, key.trim(), controller.signal);
    clearTimeout(timer);
    return { ok: true, model: r.model, available: r.available, rejected: r.rejected };
  } catch (e) {
    clearTimeout(timer);
    if (controller.signal.aborted) {
      return { ok: false, error: 'הבקשה לא הוחזרה בתוך 60 שניות. בדוק את החיבור לאינטרנט.' };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'שגיאה לא צפויה.' };
  }
}

export function suggestedQuestions(ctx: AskContext): string[] {
  const base = ['תסביר לי את זה שוב, פשוט יותר', 'תן לי דוגמה נוספת', 'מה הטעות הכי נפוצה כאן?'];
  if (ctx.focus?.includes('class') || ctx.sectionText.includes('class ')) {
    base.push('מה קורה בזיכרון בקוד הזה, שורה-שורה?');
  }
  base.push('איך זה עשוי להופיע במבחן?');
  return base;
}

export { PROVIDERS };

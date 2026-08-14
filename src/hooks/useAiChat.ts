import { useRef, useState } from 'react';
import { askAI, type AskContext, type ChatTurn } from '../lib/ai';

/**
 * שיחת ה-AI חייבת להתמיד בין ניווטים בתוך האפליקציה (פתיחה/סגירה של הפאנל, מעבר בין
 * שיעורים) ולהתאפס רק כשהאפליקציה עצמה נסגרת (רענון/סגירת הדף). לכן ה-state של השיחה
 * גר כאן, ב-hook שנקרא מ-App (רכיב שנשאר קיים לאורך כל חיי האפליקציה) — ולא בתוך
 * AiPanel שממוסגר-מחדש (unmount/mount) בכל פעם שהפאנל נסגר ונפתח.
 */
export function useAiChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [streaming, setStreaming] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const send = (text: string, ctx: AskContext) => {
    const q = text.trim();
    if (!q || busy) return;

    setError(null);
    setStreaming('');
    setBusy(true);

    const history = [...turns];
    setTurns([...history, { role: 'user', content: q }]);

    stopRef.current = askAI(q, ctx, history, {
      onText: (chunk) => setStreaming((s) => s + chunk),
      onDone: (full) => {
        setTurns((t) => [...t, { role: 'assistant', content: full }]);
        setStreaming('');
        setBusy(false);
      },
      onError: (msg) => {
        setError(msg);
        setStreaming('');
        setBusy(false);
        setTurns((t) => t.slice(0, -1));
      },
    });
  };

  const stop = () => stopRef.current?.();

  const reset = () => {
    stopRef.current?.();
    setTurns([]);
    setStreaming('');
    setError(null);
    setBusy(false);
  };

  return { turns, streaming, busy, error, send, stop, reset };
}

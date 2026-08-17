/**
 * חילוץ טקסט מקובץ Word (.docx), בדפדפן בלבד (mammoth), בשביל "המערכת החכמה" (lib/generate.ts).
 *
 * ל-PDF יש מושג טבעי של "עמוד/שקף" (pdfExtract.ts); ל-Word אין — זה מסמך זורם אחד. כדי
 * שאותו pipeline מבוסס-שקפים ימשיך לעבוד, מחלקים את המסמך ל"עמודים מלאכותיים": גבול חדש
 * בכל כותרת (Heading 1/2/3), ואם יש מעט מדי כותרות (מסמך כמעט-שטוח) — חלוקה גסה לפי
 * מספר מילים קבוע. זה קירוב, לא חלוקת שקפים אמיתית — ראה ExtractedPdf.pages בכל מקרה.
 */

import mammoth from 'mammoth';
import type { ExtractedPdf } from './pdfExtract';

const WORDS_PER_FALLBACK_PAGE = 130;
/** מתחת לכמות הזו של כותרות-חלוקה, המסמך נחשב "כמעט שטוח" ומפוצל מחדש לפי מילים */
const MIN_HEADING_CHUNKS = 4;

function splitByWords(text: string, wordsPerChunk: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    out.push(words.slice(i, i + wordsPerChunk).join(' '));
  }
  return out.length ? out : [''];
}

export async function extractDocxText(file: File, onPage?: (done: number, total: number) => void): Promise<ExtractedPdf> {
  const arrayBuffer = await file.arrayBuffer();

  let html: string;
  try {
    html = (await mammoth.convertToHtml({ arrayBuffer })).value;
  } catch (e) {
    throw new Error(
      `לא הצלחתי לקרוא את הקובץ כ-Word תקין (.docx). ודא שזה קובץ Word ולא PDF/PPTX, ושהוא לא פגום.\n(${
        e instanceof Error ? e.message : String(e)
      })`
    );
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const chunks: string[] = [];
  let current: string[] = [];
  const flush = () => {
    const text = current.join('\n').trim();
    if (text) chunks.push(text);
    current = [];
  };
  for (const el of Array.from(doc.body.children)) {
    const text = el.textContent?.trim() ?? '';
    if (!text) continue;
    if (/^h[1-3]$/i.test(el.tagName)) {
      flush();
      current.push(text);
    } else {
      current.push(text);
    }
  }
  flush();

  const pages = chunks.length >= MIN_HEADING_CHUNKS ? chunks : splitByWords(chunks.join('\n\n'), WORDS_PER_FALLBACK_PAGE);

  if (pages.every((p) => !p.trim())) {
    throw new Error('הקובץ נפתח אבל לא נמצא בו טקסט כלל (ייתכן שהוא מכיל רק תמונות/טבלאות).');
  }

  pages.forEach((_, i) => onPage?.(i + 1, pages.length));
  return { pageCount: pages.length, pages };
}

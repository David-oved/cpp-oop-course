/**
 * חילוץ טקסט גולמי מ-PDF, עמוד-עמוד, בדפדפן בלבד (pdfjs-dist) — בלי שרת.
 * חלק מ"המערכת החכמה" לייצור שיעורים; ראה AGENTS.md §6 ו-lib/generate.ts.
 *
 * ==מגבלה ידועה: סדר תווים בעברית.== אנחנו לא ממיינים מחדש לפי גיאומטריה (x/y) אלא
 * שומרים על סדר הזרימה הטבעי של תוכן ה-PDF (item order + hasEOL), כי מיון גיאומטרי
 * לפי x גורם להיפוך מילים בטקסט RTL שמקורו במצגת PowerPoint. הפלט עלול להכיל שבירות
 * שורה לא מושלמות בפריסות מרובות-עמודות — הפרומפט ב-generate.ts מודע לזה ומונחה
 * להתעלם מארטיפקטים ולשחזר את הכוונה, לא להעתיק פיסוק/פריסה מילולית.
 */

import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export interface ExtractedPdf {
  pageCount: number;
  /** טקסט גולמי לכל עמוד — אינדקס 0 = שקף 1 */
  pages: string[];
}

/** גודל מרבי סביר לקובץ מצגת (100MB) — הגנה מפני קובץ שגוי בטעות */
const MAX_BYTES = 100 * 1024 * 1024;

function itemsToPageText(items: { str?: string; hasEOL?: boolean; transform?: number[] }[]): string {
  let out = '';
  let lastY: number | null = null;
  for (const it of items) {
    const str = it.str ?? '';
    const y = it.transform?.[5] ?? null;
    if (lastY !== null && y !== null && Math.abs(y - lastY) > 14 && out && !out.endsWith('\n')) {
      out += '\n';
    }
    out += str;
    if (it.hasEOL) out += '\n';
    lastY = y ?? lastY;
  }
  return out.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** מחלץ טקסט מכל עמודי ה-PDF. זורק שגיאה קריאה בעברית אם הקובץ פגום/לא PDF. */
export async function extractPdfText(
  file: File,
  onPage?: (done: number, total: number) => void
): Promise<ExtractedPdf> {
  if (file.size > MAX_BYTES) {
    throw new Error('הקובץ גדול מדי (מעל 100MB). ודא שזה קובץ המצגת הנכון.');
  }
  const data = await file.arrayBuffer();

  let doc;
  try {
    doc = await pdfjsLib.getDocument({ data }).promise;
  } catch (e) {
    throw new Error(
      `לא הצלחתי לפתוח את הקובץ כ-PDF תקין. ודא שזה קובץ PDF (לא PPTX) ושהוא לא פגום.\n(${
        e instanceof Error ? e.message : String(e)
      })`
    );
  }

  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(itemsToPageText(content.items as { str?: string; hasEOL?: boolean; transform?: number[] }[]));
    onPage?.(i, doc.numPages);
  }
  return { pageCount: doc.numPages, pages };
}

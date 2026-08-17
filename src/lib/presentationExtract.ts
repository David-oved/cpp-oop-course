/**
 * נקודת כניסה יחידה לחילוץ טקסט ממסמך מקור ל"המערכת החכמה" — מפנה לפי סוג הקובץ
 * ל-pdfExtract.ts (PDF) או docxExtract.ts (Word). PPTX עדיין לא נתמך (AGENTS.md §13 0.9).
 */

import { extractPdfText, type ExtractedPdf } from './pdfExtract';
import { extractDocxText } from './docxExtract';

export type { ExtractedPdf };

export function isSupportedPresentationFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.pdf') || name.endsWith('.docx');
}

export async function extractPresentationText(
  file: File,
  onPage?: (done: number, total: number) => void
): Promise<ExtractedPdf> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return extractPdfText(file, onPage);
  if (name.endsWith('.docx')) return extractDocxText(file, onPage);
  if (name.endsWith('.pptx') || name.endsWith('.ppt')) {
    throw new Error('קובצי PowerPoint (.pptx/.ppt) עדיין לא נתמכים. המר ל-PDF (File → Save As → PDF) והעלה אותו.');
  }
  if (name.endsWith('.doc')) {
    throw new Error('קובץ Word ישן (.doc) לא נתמך. שמור מחדש כ-.docx (File → Save As) והעלה אותו.');
  }
  throw new Error('סוג קובץ לא נתמך. העלה PDF (.pdf) או Word (.docx).');
}

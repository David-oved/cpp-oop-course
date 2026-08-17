/**
 * Sanitizer ל-SVG גולמי בבלוק `diagram`.
 *
 * שאר הנתיבים שמזריקים HTML (`renderInline`/`renderMarkdown` ב-markdown.ts, ו-`highlightCpp`
 * ב-highlight.ts) כבר בטוחים בעצמם — הם מריצים `esc()` (בריחת &/</>) על כל טקסט חופשי *לפני*
 * שמזריקים תגיות משלהם, כך שקלט שמכיל HTML גולמי (כולל תוכן שנוצר על ידי AI) לעולם לא הופך
 * לתגית אמיתית. בלוק ה-diagram שונה: `b.svg` מוזרק כמו שהוא, בלי שום עיבוד — זה וקטור ההזרקה
 * האמיתי היחיד בקוד (AGENTS.md §6.3 שורה E). זה הפונקציה שסוגרת אותו.
 */

const ALLOWED_TAGS = new Set([
  'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
  'text', 'tspan', 'defs', 'marker', 'linearGradient', 'radialGradient', 'stop',
  'clipPath', 'title', 'desc',
]);

// כל attribute שמתחיל ב-on (onload, onclick…) נחסם תמיד, בלי קשר לרשימה הזו.
const ALLOWED_ATTRS = new Set([
  'viewbox', 'width', 'height', 'xmlns', 'fill', 'stroke', 'stroke-width', 'stroke-linecap',
  'stroke-linejoin', 'stroke-dasharray', 'opacity', 'fill-opacity', 'stroke-opacity',
  'd', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'points',
  'transform', 'class', 'id', 'font-size', 'font-family', 'font-weight', 'text-anchor',
  'offset', 'stop-color', 'stop-opacity', 'gradientunits', 'gradienttransform',
  'markerwidth', 'markerheight', 'refx', 'refy', 'orient', 'marker-end', 'marker-start',
]);

function cleanNode(node: Element): boolean {
  const tag = node.tagName.toLowerCase();
  if (!ALLOWED_TAGS.has(tag)) {
    node.remove();
    return false;
  }
  for (const attr of [...node.attributes]) {
    const name = attr.name.toLowerCase();
    const value = attr.value;
    // eslint: אירועים (onload/onclick/...) וכתובות שמריצות קוד (javascript:)
    if (name.startsWith('on') || /^\s*javascript:/i.test(value)) {
      node.removeAttribute(attr.name);
      continue;
    }
    if (!ALLOWED_ATTRS.has(name)) node.removeAttribute(attr.name);
  }
  for (const child of [...node.children]) cleanNode(child);
  return true;
}

/** מנקה SVG גולמי לרשימת תגיות/attributes בטוחה. מחזיר מחרוזת ריקה אם הקלט לא SVG תקין. */
export function sanitizeSvg(raw: string): string {
  try {
    const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
    const root = doc.documentElement;
    if (!root || root.tagName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) {
      return '';
    }
    cleanNode(root);
    return root.outerHTML;
  } catch {
    return '';
  }
}

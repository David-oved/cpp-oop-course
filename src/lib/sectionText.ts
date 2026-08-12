import type { Block, Section } from '../types/content';

/** ממיר בלוק לטקסט פשוט — משמש כהקשר לעוזר ה-AI. */
export function blockToText(b: Block): string {
  switch (b.kind) {
    case 'heading':
      return `\n## ${b.text}`;
    case 'prose':
      return b.md;
    case 'list':
      return (b.title ? b.title + '\n' : '') + b.items.map((x) => `• ${x}`).join('\n');
    case 'callout':
      return `[${b.variant.toUpperCase()}${b.title ? ' — ' + b.title : ''}] ${b.md}`;
    case 'code': {
      const parts: string[] = [];
      if (b.title) parts.push(`קוד — ${b.title}:`);
      if (b.files) for (const f of b.files) parts.push(`// ${f.name}\n${f.code}`);
      else parts.push(b.code ?? '');
      if (b.annotations?.length)
        parts.push('הערות: ' + b.annotations.map((a) => `שורה ${a.line}: ${a.text}`).join('; '));
      if (b.output) parts.push(`פלט:\n${b.output}`);
      return parts.join('\n');
    }
    case 'compare':
      return [
        b.title ? `השוואה — ${b.title}` : 'השוואה',
        `${b.left.title}:\n${b.left.code}${b.left.note ? '\n(' + b.left.note + ')' : ''}`,
        `${b.right.title}:\n${b.right.code}${b.right.note ? '\n(' + b.right.note + ')' : ''}`,
      ].join('\n\n');
    case 'memory':
      return [
        `דיאגרמת זיכרון${b.title ? ' — ' + b.title : ''}`,
        b.intro ?? '',
        b.code,
        'צעדים: ' + b.steps.map((s, i) => `${i + 1}. ${s.caption}`).join(' '),
      ].join('\n');
    case 'quiz':
      return [
        `שאלה: ${b.question}`,
        b.code ?? '',
        ...b.options.map((o, i) => `${i + 1}. ${o.text}${o.correct ? '  ← נכון' : ''}`),
      ].join('\n');
    case 'pitfall':
      return [
        `מלכודת: ${b.title}`,
        `קוד בעייתי:\n${b.badCode}`,
        b.error ? `שגיאה: ${b.error}` : '',
        `הסבר: ${b.explain}`,
        b.goodCode ? `תיקון:\n${b.goodCode}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    case 'exercise':
      return [
        `תרגיל (רמה ${b.level}): ${b.title}`,
        b.brief,
        ...(b.requirements ?? []).map((r, i) => `${i + 1}. ${r}`),
        `קוד פתיחה:\n${b.starter}`,
        b.expectedOutput ? `פלט צפוי:\n${b.expectedOutput}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    case 'table':
      return [
        b.title ?? '',
        b.headers.join(' | '),
        ...b.rows.map((r) => r.join(' | ')),
      ]
        .filter(Boolean)
        .join('\n');
    case 'terms':
      return (b.title ? b.title + '\n' : '') + b.items.map((t) => `${t.he} = ${t.en}${t.note ? ' (' + t.note + ')' : ''}`).join('\n');
    case 'steps':
      return (b.title ? b.title + '\n' : '') + b.items.map((s, i) => `${i + 1}. ${s.title}: ${s.md}`).join('\n');
    case 'diagram':
      return `[דיאגרמה${b.title ? ' — ' + b.title : ''}]${b.caption ? ' ' + b.caption : ''}`;
    case 'divider':
      return '';
  }
}

export function sectionToText(s: Section): string {
  return [`# ${s.title}`, s.subtitle ?? '', ...s.blocks.map(blockToText)]
    .filter(Boolean)
    .join('\n\n');
}

/** תווית קצרה לבלוק — מוצגת בכפתור "שאל את ה-AI" */
export function blockLabel(b: Block): string {
  switch (b.kind) {
    case 'code':
      return b.title ? `בלוק הקוד "${b.title}"` : 'בלוק הקוד';
    case 'memory':
      return 'דיאגרמת הזיכרון';
    case 'quiz':
      return 'שאלת החידון';
    case 'pitfall':
      return `המלכודת "${b.title}"`;
    case 'exercise':
      return `התרגיל "${b.title}"`;
    case 'compare':
      return 'ההשוואה';
    case 'callout':
      return b.title ? `ההערה "${b.title}"` : 'ההערה';
    case 'table':
      return 'הטבלה';
    default:
      return 'הקטע';
  }
}

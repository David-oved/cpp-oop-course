/** מדגיש תחביר C++ קליל. מחזיר HTML בטוח (כל תו מיוחד מנוטרל). */

const KEYWORDS = new Set([
  'alignas','alignof','and','asm','auto','bool','break','case','catch','char','char8_t','char16_t',
  'char32_t','class','const','consteval','constexpr','constinit','const_cast','continue','co_await',
  'co_return','co_yield','decltype','default','delete','do','double','dynamic_cast','else','enum',
  'explicit','export','extern','false','float','for','friend','goto','if','inline','int','long',
  'mutable','namespace','new','noexcept','not','nullptr','operator','or','private','protected',
  'public','register','reinterpret_cast','return','short','signed','sizeof','static','static_assert',
  'static_cast','struct','switch','template','this','thread_local','throw','true','try','typedef',
  'typeid','typename','union','unsigned','using','virtual','void','volatile','wchar_t','while','xor',
]);

const TYPES = new Set([
  'string','vector','map','set','list','pair','ostream','istream','ifstream','ofstream','fstream',
  'stringstream','ostringstream','istringstream','size_t','shared_ptr','unique_ptr','exception',
  'runtime_error','invalid_argument','out_of_range','initializer_list','array','deque','stack',
  'queue','priority_queue','unordered_map','unordered_set','iterator','const_iterator','nullptr_t',
]);

const BUILTINS = new Set(['cout','cin','cerr','endl','std','npos','nullptr']);

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const span = (cls: string, text: string) => `<span class="tk-${cls}">${esc(text)}</span>`;

export function highlightCpp(src: string): string {
  let out = '';
  let i = 0;
  const n = src.length;

  while (i < n) {
    const c = src[i];

    // הנחיית קדם-מעבד: מתחילה ב-# בתחילת שורה
    if (c === '#' && (i === 0 || src[i - 1] === '\n')) {
      let j = i;
      while (j < n && src[j] !== '\n') j++;
      const line = src.slice(i, j);
      // מפרידים את <...> או "..." שאחרי include
      const m = line.match(/^(\s*#\s*\w+)(\s*)(.*)$/);
      if (m) {
        out += span('pre', m[1]) + esc(m[2]);
        const rest = m[3];
        const inc = rest.match(/^([<"][^>"]*[>"])(.*)$/);
        if (inc) out += span('str', inc[1]) + span('pre', inc[2]);
        else out += span('pre', rest);
      } else {
        out += span('pre', line);
      }
      i = j;
      continue;
    }

    // הערת שורה
    if (c === '/' && src[i + 1] === '/') {
      let j = i;
      while (j < n && src[j] !== '\n') j++;
      out += span('com', src.slice(i, j));
      i = j;
      continue;
    }

    // הערת בלוק
    if (c === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      const j = end === -1 ? n : end + 2;
      out += span('com', src.slice(i, j));
      i = j;
      continue;
    }

    // מחרוזת או תו
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n) {
        if (src[j] === '\\') j += 2;
        else if (src[j] === c) { j++; break; }
        else if (src[j] === '\n') break;
        else j++;
      }
      out += span('str', src.slice(i, j));
      i = j;
      continue;
    }

    // מספר
    if (/[0-9]/.test(c) && !/[A-Za-z_]/.test(src[i - 1] ?? '')) {
      let j = i;
      while (j < n && /[0-9a-fA-FxXuUlLbB.']/.test(src[j])) j++;
      out += span('num', src.slice(i, j));
      i = j;
      continue;
    }

    // מזהה / מילה שמורה
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      // מדלגים על רווחים כדי לבדוק אם אחריו סוגריים -> קריאה לפונקציה
      let k = j;
      while (k < n && (src[k] === ' ' || src[k] === '\t')) k++;

      if (KEYWORDS.has(word)) out += span('kw', word);
      else if (TYPES.has(word)) out += span('type', word);
      else if (BUILTINS.has(word)) out += span('bi', word);
      else if (src[k] === '(') out += span('fn', word);
      else if (/^[A-Z]/.test(word)) out += span('type', word);
      else out += esc(word);
      i = j;
      continue;
    }

    // אופרטורים
    if ('+-*/%=<>!&|^~?:'.includes(c)) {
      let j = i;
      while (j < n && '+-*/%=<>!&|^~?:'.includes(src[j])) j++;
      out += span('op', src.slice(i, j));
      i = j;
      continue;
    }

    // סוגריים ופיסוק
    if ('{}()[];,.'.includes(c)) {
      out += span('punc', c);
      i++;
      continue;
    }

    out += esc(c);
    i++;
  }

  return out;
}

/** הדגשה לפלט של הקומפיילר — שגיאות באדום, אזהרות בכתום */
export function highlightCompilerLog(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const e = esc(line);
      if (/\berror\b/i.test(line)) return `<span class="log-err">${e}</span>`;
      if (/\bwarning\b/i.test(line)) return `<span class="log-warn">${e}</span>`;
      if (/\bnote\b/i.test(line)) return `<span class="log-note">${e}</span>`;
      return e;
    })
    .join('\n');
}

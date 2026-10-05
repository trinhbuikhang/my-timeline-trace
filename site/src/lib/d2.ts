import type { Lang } from '../i18n/ui';

// The D2 markup is written once, bilingual: Vietnamese in the element, English in data-en
// (and data-en-aria for aria-label). At build time each page keeps one language and drops the rest.
// data-en elements are never nested, so a same-tag depth count finds each one's end.

const decode = (s: string) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

export function localize(html: string, lang: Lang): string {
  const open = /<([a-zA-Z][\w-]*)\b([^>]*?)\sdata-en="([^"]*)"([^>]*)>/g;
  let out = '';
  let from = 0;
  for (let m = open.exec(html); m; m = open.exec(html)) {
    const [whole, tag, before, en, after] = m;
    const start = m.index + whole.length;
    const tags = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
    tags.lastIndex = start;
    let depth = 1;
    let close: RegExpExecArray | null = null;
    while (depth && (close = tags.exec(html))) depth += close[1] ? -1 : 1;
    if (!close) throw new Error(`localize: <${tag} data-en> is never closed`);
    out += html.slice(from, m.index) + `<${tag}${before}${after}>` + (lang === 'en' ? decode(en) : html.slice(start, close.index)) + `</${tag}>`;
    from = open.lastIndex = close.index + close[0].length;
  }
  out += html.slice(from);
  return out.replace(/(\saria-label=")[^"]*("[^>]*?)\sdata-en-aria="([^"]*)"/g, (_, a: string, rest: string, en: string) =>
    lang === 'en' ? a + en + rest : _.replace(/\sdata-en-aria="[^"]*"/, ''),
  );
}

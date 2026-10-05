export interface Text { vi: Record<string, string>; en: Record<string, string>; where: Record<string, string> }
export function parseText(files: Record<string, string>): Text;
export function inline(s: string): string;
export function plain(s: string): string;
export function fill(html: string, text: Text, report?: { missing: string[]; unused: string[] }): string;
export function storyCards(
  stories: { slug: string; vi: { title: string; category: string; placeholder?: boolean }; en?: { title: string } | null }[],
  text: Text,
  linkFor: (s: { slug: string; vi: { placeholder?: boolean } }) => string,
): string;
export function frontMatter(src: string): Record<string, any>;

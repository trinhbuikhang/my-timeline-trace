export const LANGS = ['vi', 'en'] as const;
export type Lang = (typeof LANGS)[number];

const vi = {
  'meta.description': 'Kho lưu trữ cá nhân của Khang — những vấn đề đã giải, hệ thống đã dựng, câu chuyện để lại.',
  'skip': 'Bỏ qua đến nội dung',
  'toc': 'Mục lục',
  'placeholder': 'Chờ nội dung',
  'tbw': '[Chờ Khang viết]',
  'wip.title': 'Phần này đang được viết',
  'wip.body': 'Mục này của tài liệu chưa phát hành. Nó đang được xây.',
  'wip.back': 'Về trang đầu',
  'foot.revising': 'Tài liệu này vẫn đang được sửa đổi.',
  'stats.stories': 'câu chuyện',
  'stats.systems': 'hệ thống',
  'stats.capsules': 'capsule',
} as const;

type Key = keyof typeof vi;

const en: Record<Key, string> = {
  'meta.description': "Khang's personal archive — problems solved, systems built, stories left behind.",
  'skip': 'Skip to content',
  'toc': 'Contents',
  'placeholder': 'Placeholder',
  'tbw': '[To be written]',
  'wip.title': 'This part is still being written',
  'wip.body': 'This section of the document has not been released yet. It is being built.',
  'wip.back': 'Back to the front page',
  'foot.revising': 'This document is still being revised.',
  'stats.stories': 'stories',
  'stats.systems': 'systems',
  'stats.capsules': 'capsules',
};

const dict: Record<Lang, Record<Key, string>> = { vi, en };

export const useT = (lang: Lang) => (key: Key) => dict[lang][key];

/** Inline copy for one-off strings: tx(lang)('Tiếng Việt', 'English'). */
export const tx = (lang: Lang) => (viText: string, enText: string) => (lang === 'en' ? enText : viText);

/** Localized YAML text: English falls back to Vietnamese. */
export const pick = (text: { vi: string; en?: string }, lang: Lang) => (lang === 'en' ? (text.en ?? text.vi) : text.vi);

export const PRIMARY_NAV = ['solve', 'systems', 'stories', 'lab', 'trace', 'now'] as const;
export const SECONDARY_NAV = ['about', 'dream', 'support'] as const;
export const SECTIONS = [...PRIMARY_NAV, ...SECONDARY_NAV] as const;
export type Section = (typeof SECTIONS)[number];

export const href = (lang: Lang, path = '') => `/${lang}/${path ? `${path.replace(/^\/|\/$/g, '')}/` : ''}`;

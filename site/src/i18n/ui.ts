export const LANGS = ['vi', 'en'] as const;
export type Lang = (typeof LANGS)[number];

const vi = {
  'meta.description': 'Kho lưu trữ cá nhân của Khang — những vấn đề đã giải, hệ thống đã dựng, câu chuyện để lại.',
  'skip': 'Bỏ qua đến nội dung',
  'menu': 'Menu',
  'menu.close': 'Đóng',
  'tagline.1': 'Vấn đề được giải.',
  'tagline.2': 'Hệ thống được dựng.',
  'tagline.3': 'Câu chuyện còn ở lại.',
  'identity': 'Tôi giải quyết vấn đề bằng cách xây dựng hệ thống.',
  'enter': 'Bước vào',
  'recording': 'Đang ghi',
  'now.updated': 'Cập nhật',
  'now.building': 'Đang xây',
  'now.exploring': 'Đang khám phá',
  'now.thinking': 'Đang nghĩ về',
  'now.question': 'Câu hỏi hiện tại',
  'now.view': 'Xem NOW',
  'systems.personal': 'Hệ thống cá nhân',
  'systems.professional': 'Công việc chuyên môn',
  'systems.professional.note': 'Một chương của sự nghiệp. Chi tiết được giữ kín.',
  'systems.all': 'Tất cả hệ thống',
  'systems.next': 'Hệ thống tiếp theo',
  'systems.problem': 'Vấn đề',
  'stories.all': 'Tất cả câu chuyện',
  'stories.min': 'phút đọc',
  'stories.empty': 'Chưa có câu chuyện nào — đang ghi',
  'trace.follow': 'Theo dấu vết',
  'trace.capsule': 'Capsule',
  'support.title': 'Fuel the lab',
  'support.line': 'Pharaoh Alone là một dự án độc lập. Nếu điều gì đó ở đây giúp bạn nghĩ, học hay xây — bạn có thể giúp phòng lab tiếp tục chạy.',
  'support.cta': 'Ủng hộ',
  'globe.label': 'Quả địa cầu tương tác: những nơi trong hành trình của Khang. Kéo để xoay.',
  'globe.drag': 'Kéo để xoay',
  'placeholder': 'Chờ nội dung',
  'vionly': 'Chỉ tiếng Việt',
  'stats.stories': 'câu chuyện',
  'stats.systems': 'hệ thống',
  'stats.capsules': 'capsule',
  'stats.updated': 'cập nhật',
  'wip.title': 'Đang được ghi lại',
  'wip.body': 'Phần này của kho lưu trữ chưa mở. Nó đang được xây.',
  'wip.back': 'Về trang chủ',
} as const;

type Key = keyof typeof vi;

const en: Record<Key, string> = {
  'meta.description': "Khang's personal archive — problems solved, systems built, stories left behind.",
  'skip': 'Skip to content',
  'menu': 'Menu',
  'menu.close': 'Close',
  'tagline.1': 'Problems solved.',
  'tagline.2': 'Systems built.',
  'tagline.3': 'Stories left behind.',
  'identity': 'I solve problems by building systems.',
  'enter': 'Enter',
  'recording': 'Recording',
  'now.updated': 'Updated',
  'now.building': 'Building',
  'now.exploring': 'Exploring',
  'now.thinking': 'Thinking about',
  'now.question': 'Current question',
  'now.view': 'View now',
  'systems.personal': 'Personal systems',
  'systems.professional': 'Selected professional work',
  'systems.professional.note': 'A chapter of the career. Details stay private.',
  'systems.all': 'All systems',
  'systems.next': 'Next system',
  'systems.problem': 'Problem',
  'stories.all': 'All stories',
  'stories.min': 'min read',
  'stories.empty': 'No stories yet — recording',
  'trace.follow': 'Follow the trace',
  'trace.capsule': 'Capsule',
  'support.title': 'Fuel the lab',
  'support.line': 'Pharaoh Alone is an independent project. If something here helped you think, learn or build, you can help keep the lab running.',
  'support.cta': 'Support',
  'globe.label': "Interactive globe: places in Khang's journey. Drag to rotate.",
  'globe.drag': 'Drag to rotate',
  'placeholder': 'Awaiting content',
  'vionly': 'Vietnamese only',
  'stats.stories': 'stories',
  'stats.systems': 'systems',
  'stats.capsules': 'capsules',
  'stats.updated': 'updated',
  'wip.title': 'Still being recorded',
  'wip.body': 'This part of the archive is not open yet. It is being built.',
  'wip.back': 'Back home',
};

const dict: Record<Lang, Record<Key, string>> = { vi, en };

export const useT = (lang: Lang) => (key: Key) => dict[lang][key];

/** Localized YAML text: English falls back to Vietnamese. */
export const pick = (text: { vi: string; en?: string }, lang: Lang) => (lang === 'en' ? (text.en ?? text.vi) : text.vi);

export const PRIMARY_NAV = ['solve', 'systems', 'stories', 'lab', 'trace', 'now'] as const;
export const SECONDARY_NAV = ['about', 'dream', 'support'] as const;
export const SECTIONS = [...PRIMARY_NAV, ...SECONDARY_NAV] as const;
export type Section = (typeof SECTIONS)[number];

export const href = (lang: Lang, path = '') => `/${lang}/${path ? `${path.replace(/^\/|\/$/g, '')}/` : ''}`;

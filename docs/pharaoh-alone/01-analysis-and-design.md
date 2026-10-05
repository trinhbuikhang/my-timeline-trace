# PHARAOH ALONE — Phân tích & Nền tảng thiết kế

> Problems solved. Systems built. Stories left behind.

Tài liệu này trả lời phần **21. A–F** của brief (site map, wireframe, visual direction, component inventory, concept directions, đề xuất một hướng). Mục **G** (homepage prototype hi-fi) là milestone code đầu tiên trong [`02-backlog.md`](02-backlog.md).

---

## 0. Phân tích brief

### 0.1 Brief thực sự yêu cầu gì

| Lớp | Nội dung | Ghi chú |
|---|---|---|
| Danh tính | "Problem solver first, builder second" | Mọi trang phải trả lời: *vấn đề gì → hệ thống gì → câu chuyện gì* |
| Giá trị theo thời gian | TRACE, NOW, STORIES, LAB lớn dần theo năm | Kiến trúc nội dung quan trọng hơn hiệu ứng |
| Song ngữ | VI là giọng chính, EN là bản chuyển thể | Không bắt buộc mọi bài có EN |
| Phạm vi giai đoạn này | Prototype hi-fi | **Không** auth, DB, CMS, payment, analytics, deploy production |
| Trung thực | Placeholder khi chưa có nội dung | **Không** bịa thành tích, số liệu, project, testimonial |

### 0.2 Liên hệ với repo hiện tại (`my-timeline-trace`)

Repo này đã là một **time capsule** — `years/*.md`, giọng văn *"I was here… leave something behind"*. Đây chính là hạt giống của phần **TRACE** và tinh thần "Pharaoh" (thời gian, di sản). Đề xuất:

- Website sống trong thư mục `site/` của repo này để đọc trực tiếp `years/*.md` khi build.
- **Không** đổi format `years/*.md` (workflow hiện tại sinh README và sync lên GitHub profile — giữ nguyên).
- ⚠️ **Quyền riêng tư:** capsule có nội dung gia đình rất riêng tư. Website **không tự publish** capsule. Chỉ những năm được liệt kê trong `site/src/config/trace.ts → publicCapsules` mới hiện ra (mặc định: rỗng).

### 0.3 Rủi ro chính

| Rủi ro | Cách giảm |
|---|---|
| Biến thành "portfolio dark-mode generic" | Một concept duy nhất (Archive), hệ thống mã lưu trữ, không dùng card bo góc |
| Hiệu ứng lấn át nội dung | Motion budget: chỉ 3 animation có nghĩa (boot, trace, hover reveal); tôn trọng `prefers-reduced-motion` |
| Font không hỗ trợ dấu tiếng Việt | Mọi font phải qua kiểm tra glyph tiếng Việt (ă â đ ê ô ơ ư + 5 dấu thanh, chồng dấu ở chữ hoa) |
| Nội dung trống làm site trông "chết" | Thiết kế trạng thái rỗng có chủ ý (`????`, `NO ENTRIES YET — RECORDING`) |
| Lộ thông tin công ty (GeoSolve) | Professional work là dữ liệu tĩnh 2–5 dòng, không ảnh, không kiến trúc nội bộ; checklist review trước khi publish |
| Song ngữ lệch nhau | Một `translationKey` nối cặp bài; nút VI/EN luôn có đích hợp lệ |

### 0.4 Quyết định kỹ thuật (đề xuất)

| Hạng mục | Chọn | Lý do |
|---|---|---|
| Framework | **Astro 5** (static output) | Content-first, Markdown/MDX, i18n routing có sẵn, ~0 KB JS mặc định |
| Nội dung | Astro Content Collections + Zod schema | Không cần CMS/DB; schema bắt lỗi quan hệ (story ↔ system ↔ trace) lúc build |
| Styling | CSS thuần + custom properties (design tokens) | Kiểm soát tuyệt đối, không "mùi template" |
| JS | Island nhỏ, vanilla TS | Boot sequence, mobile nav, language switch |
| Chuyển trang | View Transitions API (Astro `<ClientRouter />`) | Chuyển trang mềm, fallback tự nhiên |
| Font | Self-host (`@fontsource`) | Không phụ thuộc CDN, kiểm soát subset tiếng Việt |
| Package manager | pnpm | Nhanh, lockfile rõ ràng |
| Deploy | *Ngoài phạm vi* — sau này: Cloudflare Pages / Netlify / Vercel | Static nên deploy đâu cũng được |

### 0.5 Mô hình nội dung

```
content/
├─ stories/   {vi,en}/<slug>.mdx   title, date, category, summary, learned[], related{systems,trace,stories}, translationKey, location?
├─ systems/   {vi,en}/<slug>.mdx   title, status, year, problem, stack[], links{github,demo}, featured, order, translationKey
├─ lab/       {vi,en}/<slug>.mdx   title, status(IDEA|EXPERIMENT|PROTOTYPE|WORKING|PAUSED|ABANDONED), started, updated, translationKey
├─ trace/     milestones.yaml      year, title{vi,en}, kind(life|work|place|turning-point|future), links{story,system,capsule}
├─ now/       <YYYY-MM>.yaml       building[], learning[], thinking[], question{vi,en}   (giữ lịch sử → /now/archive)
├─ dream/     items.yaml           title{vi,en}, state(open|in-progress|done|unknown)
└─ professional/ items.yaml        title{vi,en}, summary{vi,en} (2–5 dòng)
```

- **Mã lưu trữ** tự sinh từ collection + thứ tự: `PA·SYS·001`, `PA·STR·014`, `PA·LAB·007`, `PA·TRC·2019`.
- **Fallback ngôn ngữ:** bài chỉ có VI vẫn hiện ở danh sách `/en/…` với nhãn `VI ONLY`, link sang bản VI. `hreflang` chỉ sinh khi có cặp.
- **Các con số trên site** (số stories, systems…) luôn **đếm từ nội dung thật**, không nhập tay → không có số liệu bịa.

---

## A. Site map

```
pharaohalone.com
│
├─ /                    → redirect /vi/   (ngôn ngữ chính)
│
├─ /{vi|en}/            HOME
│   ├─ solve/           SOLVE        — cách tiếp cận vấn đề
│   ├─ systems/         SYSTEMS      — personal systems + selected professional work
│   │   └─ [slug]/      Problem → Idea → Build → Result → Lessons
│   ├─ stories/         STORIES      — lọc theo LIFE · ENGINEERING · BUILDING · THOUGHTS · PEOPLE
│   │   ├─ [slug]/      story page
│   │   └─ c/[category]/
│   ├─ lab/             LAB          — lọc theo status
│   │   └─ [slug]/
│   ├─ trace/           TRACE        — timeline 1992 → ?
│   │   └─ [year]/      capsule năm (chỉ năm đã opt-in public)
│   ├─ now/             NOW          — snapshot hiện tại
│   │   └─ archive/     các phiên bản NOW trước
│   ├─ about/           ABOUT        (secondary)
│   ├─ dream/           DREAM        (secondary)
│   └─ support/         FUEL THE LAB (secondary)
│
├─ /{vi|en}/rss.xml     stories feed
├─ /sitemap-index.xml
└─ /404
```

**Quan hệ giữa các trang (đây là "mạng lưới" làm site có chiều sâu):**

```
        ┌──────────── related ────────────┐
   STORY ◄──────────► SYSTEM ◄──────────► LAB
     ▲                  ▲     (lab "graduates"
     │                  │      thành system)
     └──── TRACE node ──┘
             ▲
   NOW ──────┘ (NOW cũ được lưu trữ → trở thành dấu vết)
```

**Navigation:** Primary `SOLVE · SYSTEMS · STORIES · LAB · TRACE · NOW` + `VI | EN`. Secondary (`ABOUT · DREAM · SUPPORT`) nằm ở footer và trong menu mobile.

---

## B. Homepage wireframe

### Desktop (≥ 1024px, lưới 12 cột)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ PHARAOH ALONE      SOLVE  SYSTEMS  STORIES  LAB  TRACE  NOW        VI | EN │  ← nav 64px, đường kẻ 1px
├────────────────────────────────────────────────────────────────────────────┤
│ ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │
│                                                                            │
│  ARCHIVE № 001 · SINCE 1992 · [LAT, LON — placeholder]         ▮ RECORDING │  ← mono, muted
│                                                                            │
│  PHARAOH                                                                   │
│  ALONE                                                                     │  ← display, rất lớn
│                                                                            │
│  Problems solved.                                                          │
│  Systems built.                                                            │
│  Stories left behind._                                                     │  ← con trỏ nhấp nháy chậm
│                                                                            │
│  ENGINEERING × DATA × GIS × SOFTWARE × AI                 [ ENTER ↓ ]      │
│ ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  · │
├──────────────────────────┬─────────────────────────────────────────────────┤
│ 01 / NOW                 │ BUILDING        EXPLORING          THINKING     │
│ UPDATED 2026-10          │ GeoNote         AI · Data          Independent  │
│                          │ Personal sw     Rust · Geospatial  products     │
│                          │                                                 │
│                          │ CURRENT QUESTION                                │
│                          │ "What should I build next?"         VIEW NOW →  │
├──────────────────────────┼─────────────────────────────────────────────────┤
│ 02 / SYSTEMS             │ PA·SYS·001  GeoNote          [WORKING]  2026  → │
│                          │ ─────────────────────────────────────────────── │
│ I solve problems by      │ PA·SYS·002  PaveVision       [·······]  ····  → │  ← hàng (row), không card
│ building systems.        │ ─────────────────────────────────────────────── │    hover: lộ "PROBLEM: …"
│                          │ PA·SYS·003  PaveFlow         [·······]  ····  → │
│                          │                                    ALL SYSTEMS →│
├──────────────────────────┼─────────────────────────────────────────────────┤
│ 03 / STORIES             │ 2026-xx · LIFE · 8 MIN                          │
│                          │ The Things I Never Put on My CV       [placeh.] │
│                          │ ─────────────────────────────────────────────── │
│                          │ 2026-xx · ENGINEERING · 6 MIN                   │
│                          │ How a Mechanical Engineer Ended Up…   [placeh.] │
│                          │                                    ALL STORIES →│
├──────────────────────────┴─────────────────────────────────────────────────┤
│ 04 / TRACE                                                                 │
│                                                                            │
│  1992 ────────── 2019 ────────── 2024 ──── 2025 ──── 2026 ──── ? ───→      │  ← vẽ dần khi vào viewport
│  born            turning point   NZ        data/GIS  sw/AI     ????        │
│                                                              FOLLOW TRACE →│
├────────────────────────────────────────────────────────────────────────────┤
│ FUEL THE LAB ☕   Independent project. If something here helped…  SUPPORT →│  ← 1 dòng, nhỏ
├────────────────────────────────────────────────────────────────────────────┤
│ ABOUT · DREAM · SUPPORT · RSS          PHARAOH ALONE · 1992 → ∞ · VI | EN  │
│ archive: N stories · N systems · N lab entries · last update 2026-10-05    │  ← đếm từ nội dung thật
└────────────────────────────────────────────────────────────────────────────┘
```

### Mobile (< 640px, lưới 4 cột) — thiết kế riêng, không chỉ "co lại"

```
┌──────────────────────┐
│ PHARAOH ALONE    ☰   │  ← ☰ mở menu toàn màn hình
├──────────────────────┤
│ № 001 · SINCE 1992   │
│                      │
│ PHARAOH              │
│ ALONE                │
│                      │
│ Problems solved.     │
│ Systems built.       │
│ Stories left behind._│
│                      │
│ ENG × DATA × AI × SW │
│ [ ENTER ↓ ]          │
├──────────────────────┤
│ 01 / NOW             │
│ BUILDING  GeoNote    │  ← dạng key/value dọc
│ EXPLORING AI, Rust…  │
│ THINKING  Indep. …   │
│ VIEW NOW →           │
├──────────────────────┤
│ 02 / SYSTEMS         │
│ 001 GeoNote        → │
│ 002 PaveVision     → │
├──────────────────────┤
│ 03 / STORIES         │
│ ...                  │
├──────────────────────┤
│ 04 / TRACE           │
│ 1992 ●               │  ← timeline DỌC trên mobile
│      │               │
│ 2019 ●               │
│      │               │
│ 2024 ●  …            │
│      ┆               │
│  ?   ○               │
├──────────────────────┤
│ FUEL THE LAB ☕   →  │
└──────────────────────┘

Menu mobile (full-screen, overlay đen):
  SOLVE / SYSTEMS / STORIES / LAB / TRACE / NOW   ← cỡ lớn, dễ chạm (≥ 48px)
  ── ABOUT · DREAM · SUPPORT
  ── VI | EN
```

---

## C. Visual direction

### Typography

| Vai trò | Font (đề xuất) | Dùng cho |
|---|---|---|
| Display / UI | **Inter Tight** (600–800) | Tên brand, tiêu đề, nav |
| Đọc dài | **Source Serif 4** (400/600, italic) | Nội dung Stories, About, Dream |
| Kỹ thuật | **JetBrains Mono** (400/500) | Metadata, mã lưu trữ, ngày, status, tọa độ |

Cả ba đều có bộ glyph tiếng Việt — vẫn phải kiểm tra thực tế (story F-03).

Thang chữ (fluid, `clamp()`):

| Token | Mobile → Desktop | |
|---|---|---|
| `--fs-display` | 56 → 160px | Chỉ hero |
| `--fs-h1` | 36 → 64px | Tiêu đề trang |
| `--fs-h2` | 24 → 36px | |
| `--fs-body` | 18 → 20px | Đọc story (line-height 1.7, tối đa 66ch) |
| `--fs-ui` | 15 → 16px | |
| `--fs-meta` | 12 → 13px | Mono, uppercase, letter-spacing 0.08em |

### Màu (dark-only ở MVP)

| Token | Giá trị | Ý nghĩa |
|---|---|---|
| `--bg` | `#0B0B0A` | Gần đen, hơi ấm |
| `--bg-raised` | `#131312` | Vùng nổi (menu, code block) |
| `--line` | `#2A2926` | Đường kẻ 1px, lưới |
| `--text` | `#E9E6DF` | Chữ chính (tương phản ~16:1) |
| `--text-muted` | `#8C887F` | Metadata (≥ 4.5:1 trên `--bg`) |
| `--signal` | `#C9A46A` | **Màu nhấn duy nhất** — "cát / thời gian". Dùng < 5% diện tích: con trỏ, node TRACE hiện tại, focus ring |
| `--signal-dim` | `#6E5A3B` | Trạng thái phụ |

Status trong LAB **không** dùng cầu vồng màu — phân biệt bằng ký hiệu mono: `○ IDEA` `◐ EXPERIMENT` `◑ PROTOTYPE` `● WORKING` `‖ PAUSED` `✕ ABANDONED`.

> Liên hệ "Pharaoh" một cách kín đáo: màu cát + câu trong `trace.md` — *"Tôi từng là một hạt cát trong dòng chảy vô tận của thời gian"*. Không kim tự tháp, không chữ tượng hình.

### Spacing & Grid

- Thang spacing (base 4px): `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 192`
- Grid: 12 cột (≥1024px, max-width 1280px, gutter 24px) · 8 cột (640–1023px) · 4 cột (<640px, lề 20px)
- Bố cục section chuẩn: **cột nhãn 4/12** (`02 / SYSTEMS`) + **cột nội dung 8/12**. Trên mobile nhãn nằm trên.
- Nền lưới chấm 24px ở hero, opacity rất thấp.

### UI elements

- **Không card, không bo góc** (`border-radius: 0`, trừ pill status 2px). Phân tách bằng đường kẻ 1px.
- Link: gạch chân 1px offset 4px; hover → `--signal`.
- Nút: chữ mono trong ngoặc vuông `[ ENTER ]`, viền 1px.
- Focus ring: 2px `--signal`, offset 3px — luôn hiển thị khi điều hướng bằng bàn phím.
- Ảnh: grayscale nhẹ (`filter: grayscale(.3)`), không bo góc, có caption mono.

### Motion principles

1. **Có nghĩa hoặc không có.** Mỗi animation phải diễn đạt: khởi động hệ thống, thời gian trôi, hoặc lộ thông tin.
2. **Chậm & tiết chế:** 200ms (hover) · 400ms (reveal) · 800–1200ms (trace vẽ). Easing `cubic-bezier(.2,.7,.2,1)`.
3. **Chỉ animate `transform` / `opacity` / `stroke-dashoffset`.**
4. **Boot sequence chỉ chạy 1 lần mỗi session**, < 1.6s, bấm/phím bất kỳ để bỏ qua, không chặn nội dung (nội dung đã render sẵn bên dưới).
5. `prefers-reduced-motion: reduce` → tắt hết, hiện trạng thái cuối.
6. Không scroll-jacking, không parallax.

---

## D. Component inventory

| Component | Mô tả / Props chính | Dùng ở |
|---|---|---|
| `SiteHeader` | brand, nav primary, `LangSwitch`, trạng thái active | Mọi trang |
| `MobileNav` | overlay full-screen, focus trap, Esc để đóng | Mobile |
| `LangSwitch` | `currentLang`, `alternateHref?` → nếu không có bản dịch: về index section + ghi chú | Header, footer |
| `SiteFooter` | links phụ, `ArchiveStats` | Mọi trang |
| `ArchiveStats` | đếm entries thật từ collections, ngày cập nhật cuối | Footer, hero |
| `SectionLabel` | `index` ("02"), `title`, `meta?` | Mọi section |
| `MetaLine` | danh sách `{label, value}` dạng mono `2026-10 · LIFE · 8 MIN` | Story, system, lab |
| `ArchiveId` | `collection`, `n` → `PA·SYS·001` | Rows, trang chi tiết |
| `StatusBadge` | `IDEA…ABANDONED`, `WORKING`, `VI ONLY`, `PLACEHOLDER` | Lab, systems, list |
| `HeroBoot` | dòng boot mono + typing tagline + con trỏ | Home |
| `CoordGrid` | nền lưới chấm + toạ độ (tuỳ chọn) | Hero, 404 |
| `NowSnapshot` | `compact` \| `full`, dữ liệu từ `now/*.yaml` | Home, /now |
| `SystemRow` | id, title, status, year, `problem` (lộ khi hover/focus) | Home, /systems |
| `ProfessionalItem` | title + 2–5 dòng, không link | /systems |
| `StoryRow` | date, category, reading time, title, summary, `VI ONLY?` | Home, /stories |
| `StoryLayout` | tiêu đề, meta, prose, `LearnedBlock`, `RelatedEntries` | /stories/[slug] |
| `LearnedBlock` | "What I learned" — danh sách ngắn | Story, system |
| `RelatedEntries` | story/system/trace/lab liên quan | Chi tiết |
| `CaseSection` | `PROBLEM / IDEA / BUILD / RESULT / LESSONS` | System detail |
| `TraceStrip` | timeline ngang compact | Home |
| `TraceNode` | year, title, kind, links, `future?` | /trace |
| `TraceTimeline` | ngang (desktop) / dọc (mobile), nhóm theo thập kỷ | /trace |
| `ProcessFlow` | OBSERVE → … → ITERATE | /solve |
| `FilterBar` | category / status, dựa trên URL (không JS bắt buộc) | Stories, Lab |
| `SupportCTA` | `inline` \| `full`, các mức ☕ | Home, /support, cuối story |
| `DreamItem` | title, state, `????` | /dream |
| `Placeholder` | khối đánh dấu nội dung chưa có — hiện rõ ở prototype | Mọi nơi |
| `Prose` | style cho MDX: h2, quote, code, figure, footnote | Story, about |

---

## E. Ba hướng concept

### Concept A — Digital Archive *(Kho lưu trữ số)*

Site là một **kho lưu trữ cá nhân đang được ghi**. Mỗi thứ (story, system, thí nghiệm, mốc thời gian) là một *entry* có mã lưu trữ, ngày, toạ độ, trạng thái. Serif cho phần đọc, mono cho metadata, đường kẻ mảnh như phiếu lưu trữ.

- ✅ Khớp hoàn hảo với "Stories left behind", "Pharaoh = di sản", và repo time capsule đã có.
- ✅ Giá trị tăng theo thời gian — đúng mục tiêu "website càng cũ càng quý".
- ✅ Đọc dài tốt nhất (Stories là phần quan trọng nhất).
- ⚠️ Có thể quá tĩnh, giống bảo tàng → cần các tín hiệu "đang sống" (`▮ RECORDING`, NOW, `?` ở cuối timeline).
- ⚠️ Ít thể hiện "builder" nếu không cẩn thận → SYSTEMS phải có diagram/kỹ thuật thật.

### Concept B — Engineering Terminal *(Terminal kỹ thuật)*

Site là một **hệ điều hành / CLI**: boot log, prompt `$`, lệnh `cd /stories`, mọi chữ là monospace.

- ✅ Rất "kỹ thuật", ấn tượng ngay giây đầu.
- ❌ Là cliché "hacker portfolio" — trái nguyên tắc *distinctive, not impressive*.
- ❌ Monospace cho văn xuôi tiếng Việt dài rất khó đọc (dấu chồng, chữ rộng).
- ❌ Gimmick hết hay sau lần thứ hai; người không kỹ thuật cảm thấy bị loại.

### Concept C — Minimalist Laboratory *(Phòng thí nghiệm tối giản)*

Site là một **phòng lab sạch sẽ**: nhiều khoảng trắng, nhãn mẫu vật, sơ đồ quy trình, trạng thái thí nghiệm.

- ✅ Bình tĩnh, trưởng thành, làm nổi bật LAB và SOLVE.
- ❌ Dễ trôi thành "minimal portfolio" chung chung — mất sự bí ẩn và chiều sâu cá nhân.
- ❌ Không có chỗ tự nhiên cho STORIES đời tư, TRACE, DREAM.

---

## F. Đề xuất: **Concept A — Digital Archive**

**Lý do:**

1. Brief nói site là *"a website about what he has solved, built, lived through… and is trying to become"* — đó là định nghĩa của một kho lưu trữ, không phải terminal hay lab.
2. "Pharaoh" = thứ tồn tại vượt thời điểm → archive là ẩn dụ trung thực nhất, không cần bất kỳ biểu tượng Ai Cập nào.
3. Repo `my-timeline-trace` đã chạy đúng tinh thần này — site là bước tiến tự nhiên, cùng một giọng.
4. Stories là phần quan trọng nhất → chỉ concept A ưu tiên đọc dài.

**Cách giữ concept sạch (không trộn lẫn):**

- Ngôn ngữ terminal chỉ xuất hiện **như kiểu chữ metadata** (mono, con trỏ, boot 1 lần) — không có prompt `$`, không lệnh giả.
- LAB dùng chính hệ thống *entry + status* của archive — không cần visual "phòng lab" riêng.
- Tín hiệu "đang sống": `▮ RECORDING` ở hero, ngày cập nhật ở footer, node `?` cuối TRACE, DREAM có các mục `????`.

**Tên làm việc của hệ thống thiết kế:** `ARCHIVE OF ONE`.

---

## Quyết định đã chốt (05/10/2026)

| # | Câu hỏi | Quyết định |
|---|---|---|
| 1 | Website đặt ở đâu | `site/` trong repo này (đọc trực tiếp `years/*.md`) |
| 2 | PaveVision / PaveFlow | **Dự án công ty** → chỉ nằm trong *Selected professional work*, mô tả theo lĩnh vực, **không nêu tên sản phẩm** |
| 3 | Mốc TRACE | Chỉ mốc chính, đều công khai |
| 4 | Toạ độ thật trên hero | Được. Hiện đang dùng tâm quốc gia (`≈`) cho tới khi Khang cho toạ độ thành phố |
| 5 | Capsule năm công khai | Có → `/trace/[year]` (ẩn các mục còn `_Write here._`) |

### Bổ sung hướng thiết kế

**1. Hero = quả địa cầu GIS.** Phép chiếu orthographic vẽ bằng canvas; đất liền là ma trận điểm tính sẵn lúc build (`site/scripts/build-land-dots.mjs`, 4.661 điểm, ~16 KB gzip tính cả code). Lưới kinh vĩ 15°, các địa điểm là *survey point* hình vuông, kèm đường cong hành trình giữa các nơi. Góc hero có bảng đọc số kiểu GIS: `CENTER` (cập nhật trực tiếp), `PROJ ORTHOGRAPHIC · WGS84`, `LAND n PTS`. Kéo chuột/vuốt để xoay, phím mũi tên để xoay, có quán tính, tự quay chậm (2,4°/s), dừng khi ra khỏi màn hình. Dữ liệu: `site/src/content/places.yaml`, có thể thêm vị trí dự án.

**2. Hai giọng (two voices).** Thay cho một motion system chung:

| | Story voice | System voice |
|---|---|---|
| Dùng cho | Stories, Trace, Dream, About | Systems, Lab, code |
| Font | Serif (Source Serif 4) | Sans 800 uppercase + mono |
| Motion | Chậm, mềm: 700–1100ms, ease-out | Nhanh, gắt: 120–180ms, ease-snap |
| Hover | Nền đổi dần sang *mood* riêng của câu chuyện | Hàng đảo màu tức thì (quét trái → phải) |
| Bố cục | Thoáng, chữ lớn | Dày, dạng bảng, mã lưu trữ |

**3. Mỗi câu chuyện một thế giới (story moods).** Frontmatter `mood: ink | dusk | paper | field | ember` (+ `accent` tuỳ chọn). Mood định nghĩa nền, màu chữ, màu nhấn, texture (`site/src/styles/moods.css`). Trang chủ cho xem trước mood khi hover; trang story (M2) dùng toàn bộ mood, kể cả mood sáng `paper`.

---

## Câu hỏi còn mở

1. Toạ độ thành phố (Việt Nam, New Zealand) và vị trí các dự án muốn hiện trên globe — mỗi điểm: tên, lat/lon, năm.
2. Nội dung trong bảng EC của backlog (About, GeoNote, story đầu tiên…).
3. Nền tảng nhận support (Ko-fi, Buy Me a Coffee, GitHub Sponsors…).

<details><summary>Câu hỏi ban đầu (đã trả lời)</summary>


Cần trả lời trước hoặc trong Milestone 1 (không chặn việc dựng prototype — sẽ dùng placeholder):

1. Website nằm trong `site/` của repo này (đề xuất) hay repo riêng `pharaohalone`?
2. Danh sách 3–4 **personal systems** thật để show (GeoNote + …?). PaveVision / PaveFlow là dự án cá nhân hay của công ty?
3. Các mốc TRACE thật (năm + 1 dòng) từ 1992 → 2026, và mốc nào được công khai.
4. Có muốn hiện toạ độ thật (thành phố) trên hero không, hay chỉ toạ độ "trừu tượng"?
5. Có capsule năm nào (`years/*.md`) được phép công khai trên web không? (mặc định: không)
6. Nền tảng nhận support sau này (Ko-fi, Buy Me a Coffee, GitHub Sponsors…)? Prototype chỉ dùng link placeholder.

</details>

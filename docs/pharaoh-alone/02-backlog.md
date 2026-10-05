# PHARAOH ALONE — Backlog (Epics & Stories)

Dựa trên [`01-analysis-and-design.md`](01-analysis-and-design.md). Concept đã chọn: **Digital Archive**. Stack: **Astro 5 + MDX + CSS tokens**, static, trong `site/`.

**Quy ước**

- Size: **S** ≤ ½ ngày · **M** ~1 ngày · **L** 2–3 ngày
- `Dep:` = story phải xong trước
- **Definition of Done chung** (áp dụng mọi story code):
  - `pnpm build` không lỗi, không cảnh báo schema
  - Hiển thị đúng ở 360px, 768px, 1280px, 1920px
  - Điều hướng được bằng bàn phím, focus ring nhìn thấy
  - `prefers-reduced-motion` được tôn trọng
  - Không có nội dung bịa — chỗ chưa có nội dung dùng `<Placeholder>`
  - Chữ tiếng Việt hiển thị đúng dấu (kiểm tra với chuỗi `Ẩn Ở Ữ Ặ Ỡ ẵ ỗ đ`)

---

## Trạng thái (05/10/2026)

**M1 — Homepage prototype: đã dựng xong bản đầu** (`site/`, chạy `pnpm dev`).
Đã xong: F-01, F-02, F-03, F-04, I-01, I-03, N-01, N-02, N-03, H-01, H-02, H-03, H-04, H-05, H-06, H-07, H-09, S-05 (phần trang chủ). Có trang tạm "đang được ghi lại" cho các section chưa làm.
Còn lại của M1: I-02 (fallback đầy đủ + test), H-08 (Lighthouse, ảnh chụp chuẩn).

## Lộ trình

| Milestone | Mục tiêu | Epics | Kết quả |
|---|---|---|---|
| **M1 — Homepage prototype** | Deliverable **G** của brief | E1, E2, E3 | Trang chủ hi-fi, responsive, VI/EN với placeholder |
| **M2 — Archive core** | Nội dung thật bắt đầu sống được | E4, E5, E6 | Stories, Systems, Trace, Now đầy đủ |
| **M3 — Complete map** | Mọi trang trong site map | E7, E8 | Lab, Solve, About, Dream, Support |
| **M4 — Polish** | Sẵn sàng deploy (deploy để sau) | E9 | SEO, RSS, OG, perf, a11y |
| **Song song** | Nội dung | EC | Khang viết / cung cấp nội dung |

```
E1 Foundation ──► E2 Shell & i18n ──► E3 Homepage ═══► [M1 DEMO]
                         │
                         ├──► E4 Stories ──┐
                         ├──► E5 Systems ──┼──► E6 Trace & Now ═══► [M2]
                         │                 │
                         └──► E7 Lab ──────┴──► E8 Secondary pages ═══► [M3] ──► E9 Polish ═══► [M4]
```

---

## E1 — Foundation

### F-01 · Khởi tạo project Astro trong `site/` — **S**
Là developer, tôi muốn một project Astro sạch để bắt đầu code.
- [ ] `site/` với Astro 5, TypeScript strict, MDX, pnpm
- [ ] Scripts: `dev`, `build`, `preview`, `check` (astro check), `lint` (prettier)
- [ ] `.gitignore` cho `node_modules`, `dist`, `.astro`
- [ ] Workflow `main.yml` hiện tại **không** bị kích hoạt khi sửa `site/` (đã kiểm tra `paths`)
- [ ] `site/README.md` ghi cách chạy

### F-02 · Design tokens — **S** · Dep: F-01
- [ ] `src/styles/tokens.css`: màu, thang chữ fluid, spacing, grid, motion (theo mục C)
- [ ] `src/styles/base.css`: reset, `body` nền `--bg`, link, focus ring, selection màu `--signal`
- [ ] Trang `/_dev/tokens` (chỉ ở dev) hiển thị toàn bộ token để soát

### F-03 · Font tự host + kiểm tra tiếng Việt — **S** · Dep: F-01
- [ ] Inter Tight, Source Serif 4, JetBrains Mono qua `@fontsource`, chỉ subset `latin` + `latin-ext` + `vietnamese`
- [ ] `font-display: swap`, preload font hero
- [ ] Trang `/_dev/type` hiển thị đoạn văn tiếng Việt dài + chữ hoa có dấu ở cả 3 font — xác nhận không vỡ dấu, line-height không cắt dấu
- [ ] Nếu font nào lỗi → thay và ghi lại quyết định

### F-04 · Layout grid & primitives — **M** · Dep: F-02
- [ ] `BaseLayout.astro`: `<html lang>`, meta viewport, theme-color, skip-link "Bỏ qua đến nội dung"
- [ ] `Container`, `Section` (cột nhãn 4/12 + nội dung 8/12; xếp chồng < 1024px)
- [ ] `SectionLabel`, `MetaLine`, `ArchiveId`, `StatusBadge`, `Placeholder`
- [ ] Không có `border-radius` > 2px trong toàn bộ CSS

---

## E2 — Shell & i18n

### I-01 · i18n routing — **M** · Dep: F-01
- [ ] Astro i18n: locales `vi` (default) và `en`, `prefixDefaultLocale: true` → `/vi/...`, `/en/...`
- [ ] `/` redirect 302 → `/vi/`
- [ ] Từ điển UI `src/i18n/{vi,en}.ts` (nav, nhãn section, ngày tháng, "phút đọc"…), helper `t(lang, key)` có kiểm tra kiểu: thiếu key → lỗi build
- [ ] Định dạng ngày theo ngôn ngữ (`05/10/2026` vs `5 Oct 2026`); metadata mono dùng ISO `2026-10-05` ở cả hai

### I-02 · Bản dịch & fallback — **M** · Dep: I-01, S-01
- [ ] Mọi entry có `translationKey`; helper `getAlternate(entry)` trả bản ngôn ngữ kia nếu có
- [ ] Danh sách EN hiện cả bài chỉ có VI, gắn `VI ONLY`, link sang `/vi/...`
- [ ] `hreflang` chỉ sinh khi có cặp
- [ ] Unit test (vitest) cho `getAlternate` và logic fallback

### I-03 · `LangSwitch` — **S** · Dep: I-02
- [ ] Hiển thị `VI | EN`, ngôn ngữ hiện tại đậm, `aria-current`
- [ ] Bấm → trang tương ứng; nếu không có bản dịch → về index của section + thông báo nhỏ "This story is only available in Vietnamese"
- [ ] Ghi nhớ lựa chọn (localStorage, bọc try/catch) — chỉ dùng cho redirect ở `/`

### N-01 · `SiteHeader` desktop — **S** · Dep: F-04, I-01
- [ ] Brand `PHARAOH ALONE` → home; nav 6 mục; `LangSwitch` bên phải
- [ ] Mục active có gạch chân `--signal`
- [ ] Header không sticky trên trang story (tối đa diện tích đọc); sticky mỏng ở các trang khác

### N-02 · `MobileNav` — **M** · Dep: N-01
- [ ] < 1024px: brand + nút `MENU` (không chỉ icon) mở overlay full-screen
- [ ] Mục nav cỡ lớn, vùng chạm ≥ 48px, nhóm phụ ABOUT · DREAM · SUPPORT, `LangSwitch`
- [ ] Focus trap, `Esc` đóng, khoá cuộn nền, `aria-expanded`
- [ ] Hoạt động không cần JS ở mức cơ bản (fallback: link tới footer nav)

### N-03 · `SiteFooter` + `ArchiveStats` — **S** · Dep: F-04
- [ ] Links phụ, RSS, `PHARAOH ALONE · 1992 → ∞`
- [ ] `ArchiveStats` đếm thật số stories / systems / lab entries + ngày cập nhật gần nhất (lấy từ nội dung, không nhập tay)

---

## E3 — Homepage (Milestone 1 = Deliverable G)

> Mục tiêu nghiệm thu M1: một người lạ xem trang chủ ~30 giây hiểu được *người này giải quyết vấn đề, xây hệ thống, suy nghĩ sâu, có câu chuyện, và vẫn đang trở thành*.

### H-01 · Hero tĩnh — **M** · Dep: F-04, N-01
- [ ] `PHARAOH ALONE` cỡ display, 3 dòng tagline, dòng `ENGINEERING × DATA × GIS × SOFTWARE × AI`, nút `[ ENTER ↓ ]` cuộn tới section 01
- [ ] Dòng meta mono: `ARCHIVE № 001 · SINCE 1992 · <toạ độ placeholder> · ▮ RECORDING`
- [ ] `CoordGrid` nền lưới chấm, opacity thấp, thuần CSS
- [ ] Hero ≤ 100svh, không layout shift khi font tải
- [ ] Bản EN dùng tagline EN; bản VI dùng bản dịch tiếng Việt **do Khang duyệt** (đến lúc đó là placeholder)

### H-02 · Boot sequence & con trỏ — **M** · Dep: H-01
- [ ] Lần đầu mỗi session: 3–5 dòng boot mono xuất hiện tuần tự (< 1.6s tổng), rồi tagline gõ ra từng dòng
- [ ] Nội dung boot dùng dữ liệu thật (vd. `entries: <n> stories · <n> systems`, `last trace: 2026`)
- [ ] Bấm/phím bất kỳ → bỏ qua; `prefers-reduced-motion` → hiện ngay trạng thái cuối
- [ ] HTML đầy đủ đã có sẵn (SEO, không JS vẫn đọc được); JS < 3 KB
- [ ] Con trỏ `_` nhấp nháy chậm (1.2s), dừng sau 10s

### H-03 · Section `01 / NOW` compact — **S** · Dep: F-04, NW-01 (hoặc dữ liệu tạm)
- [ ] Ba cột BUILDING / EXPLORING / THINKING ABOUT + CURRENT QUESTION, nhãn `UPDATED 2026-10`
- [ ] Mobile: danh sách key/value dọc
- [ ] Link `VIEW NOW →` tới `/now`

### H-04 · Section `02 / SYSTEMS` — **M** · Dep: F-04
- [ ] 3–4 `SystemRow` có `featured: true`, sắp theo `order`
- [ ] Hover/focus một hàng → lộ dòng `PROBLEM: …` (height transition 400ms); trên mobile luôn hiện
- [ ] Cột nhãn chứa câu "I solve problems by building systems."
- [ ] Link `ALL SYSTEMS →`

### H-05 · Section `03 / STORIES` — **S** · Dep: F-04
- [ ] 2–3 story mới nhất theo ngôn ngữ hiện tại (EN fallback có `VI ONLY`)
- [ ] Meta: ngày · category · phút đọc (tính tự động, ~200 từ/phút)
- [ ] Trạng thái rỗng: `NO STORIES YET — RECORDING`

### H-06 · Section `04 / TRACE` strip — **M** · Dep: F-04
- [ ] `TraceStrip` ngang (desktop) / dọc (mobile) từ `milestones.yaml`
- [ ] Node cuối luôn là `?` (tương lai), node năm hiện tại tô `--signal`
- [ ] Khi vào viewport: đường vẽ dần (`stroke-dashoffset`, 1s) — một lần, IntersectionObserver
- [ ] Link `FOLLOW TRACE →`

### H-07 · Support CTA inline — **S** · Dep: F-04
- [ ] Một dòng: `FUEL THE LAB ☕` + câu ngắn + `SUPPORT →`; cỡ chữ nhỏ, không màu nổi
- [ ] Không popup, không sticky

### H-09 · Quả địa cầu GIS trên hero — **L** · Dep: H-01
- [x] Canvas orthographic, ma trận điểm đất liền tính sẵn lúc build (không có thư viện bản đồ phía client)
- [x] Địa điểm từ `places.yaml`: điểm vuông + vòng pulse + nhãn toạ độ; đường cong hành trình có xung sáng chạy dọc
- [x] Kéo/vuốt/phím mũi tên để xoay, quán tính, tự quay chậm; nhãn tự lật để không bị cắt mép màn hình
- [x] Intro: đất liền hiện dần từ bắc xuống nam + boot log dùng số liệu thật, chỉ chạy lần đầu mỗi session
- [x] Dừng vẽ khi ra khỏi viewport / tab ẩn; reduced-motion → khung tĩnh, chỉ vẽ khi người dùng kéo
- [ ] Toạ độ thành phố + địa điểm dự án thật (EC-11)
- [ ] Bấm vào một địa điểm → bay tới và mở story/system liên quan (M2)

### H-08 · Responsive & QA homepage — **M** · Dep: H-01..H-07, N-02
- [ ] Soát riêng layout mobile theo wireframe mục B (không chỉ co desktop)
- [ ] Lighthouse mobile: Performance ≥ 95, Accessibility 100, CLS < 0.05, JS trang chủ < 25 KB gzip (globe + dữ liệu đất liền ≈ 16 KB)
- [ ] Chụp screenshot 360 / 768 / 1280 / 1920 (Playwright) lưu vào `docs/pharaoh-alone/screens/`
- [ ] Bản VI và EN đều hoàn chỉnh

**→ [M1 DEMO]** — review cùng Khang, chỉnh visual trước khi làm tiếp.

---

## E4 — Stories

### S-01 · Schema collection `stories` — **S** · Dep: F-01
- [ ] Zod: `title, date, category (LIFE|ENGINEERING|BUILDING|THOUGHTS|PEOPLE), summary, learned: string[], related: {systems, stories, trace}, translationKey, draft, location?`
- [ ] `related` dùng `reference()` → link hỏng là lỗi build
- [ ] `draft: true` không xuất hiện ở production build
- [ ] 2 story mẫu đánh dấu rõ `[PLACEHOLDER]` (không phải nội dung bịa)

### S-02 · Trang danh sách `/stories` — **M** · Dep: S-01, I-02
- [ ] Danh sách `StoryRow` nhóm theo năm (mốc năm mono lớn bên trái)
- [ ] `FilterBar` category dạng link `/stories/c/[category]` (không cần JS)
- [ ] Trang không bao giờ dùng chữ "Blog"

### S-03 · Trang story `StoryLayout` — **L** · Dep: S-01
- [ ] TITLE · ngày · phút đọc · category · `ArchiveId` · (location nếu có)
- [ ] Prose serif 18–20px, line-height 1.7, tối đa 66ch, lề mobile 20px; quote, ảnh có caption, chú thích, code block
- [ ] Ngăn cách `────` → `LearnedBlock` "What I learned" → `RelatedEntries`
- [ ] Thanh tiến độ đọc mảnh 1px (tuỳ chọn, tắt khi reduced-motion)
- [ ] Mobile: thử đọc một bài ≥ 2.000 chữ tiếng Việt trên điện thoại thật — dễ chịu, không zoom ngang
- [ ] `SupportCTA inline` cuối bài, rất kín đáo

### S-05 · Story moods — mỗi câu chuyện một thế giới — **M** · Dep: S-03
- [x] Frontmatter `mood` (`ink | dusk | paper | field | ember`) + `accent` tuỳ chọn; preset trong `moods.css`
- [x] Trang chủ: hover/focus chuyển dần nền sang mood (story voice, 1.1s); màn hình cảm ứng hiện dải màu mood
- [ ] Trang story áp dụng toàn bộ mood: nền, chữ, màu nhấn, texture, ảnh bìa; chuyển mood mượt khi vào trang
- [ ] Mood sáng `paper` đạt tương phản AA
- [ ] Cho phép một story tự định nghĩa mood riêng (CSS variables trong frontmatter)

### S-04 · Typography cho prose tiếng Việt — **S** · Dep: S-03
- [ ] Kiểm tra `hyphens`, `text-wrap: pretty`, khoảng cách dấu câu, trích dẫn `“ ”`
- [ ] Chữ hoa có dấu ở heading không bị cắt

---

## E5 — Systems

### SY-01 · Schema `systems` + `professional` — **S** · Dep: F-01
- [ ] `systems`: `title, status, year, problem, stack[], links{github?, demo?}, featured, order, cover?, translationKey`
- [ ] `professional/items.yaml`: `title{vi,en}, summary{vi,en}` — validate summary ≤ 5 dòng / ~400 ký tự

### SY-02 · Trang `/systems` — **M** · Dep: SY-01
- [ ] Phần 1 `PERSONAL SYSTEMS`: danh sách `SystemRow`
- [ ] Phần 2 `SELECTED PROFESSIONAL WORK`: `ProfessionalItem`, chữ nhỏ hơn, không link, không ảnh
- [ ] Dòng ghi chú: professional work là một chương của sự nghiệp, chi tiết được giữ kín vì bảo mật

### SY-03 · Trang chi tiết system — **L** · Dep: SY-01
- [ ] Các `CaseSection`: PROBLEM → IDEA → BUILD → RESULT → LESSONS, đánh số mono
- [ ] Sidebar (desktop) / khối đầu (mobile): status, năm, stack, GitHub, demo
- [ ] Hỗ trợ ảnh chụp màn hình, sơ đồ kiến trúc (SVG/MDX), video demo
- [ ] `RelatedEntries` (stories, lab, trace)

### SY-04 · Checklist bảo mật professional work — **S**
- [ ] File `docs/pharaoh-alone/professional-review.md`: checklist (không dữ liệu khách hàng, không mã nguồn, không kiến trúc nội bộ, không screenshot nội bộ, không tên khách hàng)
- [ ] Mỗi mục professional phải được tick trước khi `draft: false`

---

## E6 — Trace & Now

### T-01 · Dữ liệu `trace/milestones.yaml` — **S** · Dep: F-01
- [ ] Schema: `year, title{vi,en}, note?{vi,en}, kind, links{story?, system?, capsule?}`
- [ ] Hỗ trợ mốc tương lai `kind: future` với tiêu đề `?`

### T-02 · Trang `/trace` — **L** · Dep: T-01
- [ ] Desktop: timeline ngang cuộn được bằng bàn phím/chuột (không scroll-jacking); Mobile: timeline dọc
- [ ] `TraceNode` hiện năm, tiêu đề, loại, links tới story/system/capsule
- [ ] Khoảng cách giữa node tỉ lệ (log) với số năm — khoảng trống 1992→2019 có cảm giác thời gian
- [ ] Kết thúc bằng `2027 → ?` và câu "The machine keeps the clock. The human provides the meaning."
- [ ] Thiết kế chịu được 50+ mốc (gom theo thập kỷ)

### T-03 · Tích hợp capsule `years/*.md` — **M** · Dep: T-02
> Khang đã đồng ý công khai capsule. Đã có collection `capsules` (đọc `../years`); trang tạo ở M2.
- [ ] Đọc `../years/*.md` lúc build bằng glob loader
- [ ] Chỉ render `/trace/[year]` cho năm có trong `publicCapsules` (mặc định rỗng)
- [ ] Các mục còn `_Write here._` bị ẩn tự động
- [ ] Không sửa `years/*.md` và không ảnh hưởng `scripts/build_timeline.py`

### NW-01 · `/now` + lưu trữ — **M** · Dep: F-01
- [ ] `now/<YYYY-MM>.yaml`, bản mới nhất = trang `/now` với tiêu đề `NOW — OCTOBER 2026`
- [ ] `/now/archive` liệt kê các bản trước (README của các "phiên bản Khang")
- [ ] Cập nhật = thêm 1 file YAML; hướng dẫn 5 dòng trong `site/README.md`

---

## E7 — Lab

### L-01 · Schema `lab` — **S** · Dep: F-01
- [ ] `status: IDEA|EXPERIMENT|PROTOTYPE|WORKING|PAUSED|ABANDONED`, `started, updated, why?`, `graduatedTo?: reference(systems)`
- [ ] ABANDONED bắt buộc có trường `why` (lý do bỏ) — vì đó là giá trị của nó

### L-02 · Trang `/lab` + chi tiết — **M** · Dep: L-01
- [ ] Danh sách nhóm theo status với ký hiệu `○ ◐ ◑ ● ‖ ✕`, lọc qua URL
- [ ] ABANDONED hiển thị ngang hàng, không bị làm mờ/giấu
- [ ] Chi tiết: log ngắn theo ngày (MDX), link `graduatedTo` nếu đã thành system

---

## E8 — Trang phụ

### P-01 · `/solve` — **M** · Dep: F-04
- [ ] Mở đầu "I don't start with technology. I start with problems."
- [ ] `ProcessFlow` OBSERVE → UNDERSTAND → SIMPLIFY → BUILD → MEASURE → ITERATE (dọc mobile, ngang desktop; mỗi bước 1–2 câu)
- [ ] 5 lĩnh vực Engineering · Data · Geospatial · Software · AI — mỗi lĩnh vực link tới systems/stories liên quan (không liệt kê công nghệ)

### P-02 · `/about` — **S** · Dep: S-03 (dùng `Prose`)
- [ ] Mở đầu "I'm Khang…", thân bài văn xuôi; danh sách kỹ năng gọn ở cuối
- [ ] Nội dung do Khang viết (EC-02)

### P-03 · `/dream` — **S** · Dep: F-04
- [ ] Tiêu đề "Things I Want to Build Before I Die"
- [ ] `DreamItem` từ `dream/items.yaml`, state `open|in-progress|done|unknown`; mục `unknown` hiện `????`
- [ ] Trang kết thúc mở — cảm giác "chưa xong" có chủ ý

### P-04 · `/support` — **S** · Dep: F-04
- [ ] Văn bản theo mục 15 của brief, các mức `☕ $5 · ☕☕ $10 · ☕☕☕ $25 · CUSTOM`
- [ ] Nút trỏ tới link ngoài **placeholder** (chưa tích hợp thanh toán)
- [ ] Không xuất hiện trong nav chính

### P-05 · Trang 404 — **S**
- [ ] `ENTRY NOT FOUND · PA·???·404` + `CoordGrid`, link về home/trace, có bản VI/EN

---

## E9 — Polish (Milestone 4)

### X-01 · Page transitions — **S** · Dep: M2
- [ ] Astro `<ClientRouter />`, fade 200ms + header giữ nguyên; tắt khi reduced-motion
- [ ] Boot sequence không chạy lại khi chuyển trang

### X-02 · SEO & metadata — **M**
- [ ] Title/description theo ngôn ngữ, canonical, `hreflang`, sitemap, robots
- [ ] OG image tự sinh lúc build (satori) theo style archive: tiêu đề + `ArchiveId` + meta

### X-03 · RSS theo ngôn ngữ — **S** · Dep: S-01
- [ ] `/vi/rss.xml`, `/en/rss.xml` (EN chỉ gồm bài có bản EN)

### X-04 · Accessibility audit — **M**
- [ ] axe không lỗi trên mọi template; landmark, heading order, alt text bắt buộc trong schema ảnh
- [ ] Tương phản `--text-muted` ≥ 4.5:1 được kiểm chứng

### X-05 · Performance budget trong CI — **M**
- [ ] GitHub Action riêng (`site.yml`, chỉ chạy khi `site/**` đổi): `astro check`, build, Lighthouse CI với budget ở H-08
- [ ] Không đụng tới workflow `main.yml`

---

## EC — Nội dung (Khang làm, song song)

Không story nào trong code được phép tự viết các nội dung này.

| ID | Nội dung | Cần cho |
|---|---|---|
| EC-01 | Bản tiếng Việt của tagline + câu "I solve problems by building systems." | H-01 |
| EC-02 | About (VI trước) | P-02 |
| EC-03 | 3–4 personal systems: tên, vấn đề 1 câu, status, năm, link | H-04, SY-03 |
| EC-04 | Mốc TRACE thật 1992 → 2026 (năm + 1 dòng), chọn mốc công khai | H-06, T-01 |
| EC-05 | NOW tháng 10/2026 | H-03, NW-01 |
| EC-06 | 2 story đầu tiên (VI) | H-05, S-03 |
| EC-07 | 4 mục professional work (2–5 dòng, đã qua checklist SY-04) | SY-02 |
| EC-08 | Danh sách DREAM (kể cả các mục `????`) | P-03 |
| EC-09 | 3–5 lab entries, ít nhất 1 ABANDONED | L-02 |
| EC-11 | Toạ độ thành phố + các địa điểm dự án cho globe | H-09 |
| EC-10 | 6 bước SOLVE — mỗi bước 1–2 câu bằng giọng của Khang | P-01 |

---

## Ngoài phạm vi (theo brief §18)

Auth · Database · CMS · Payment thật · Analytics · Deploy production · Comment · Newsletter.
Ghi lại ở đây để không ai vô tình làm.

---

## Thứ tự làm đề xuất cho Milestone 1 (≈ 8–10 ngày công)

```
F-01 → F-02 → F-03 → F-04 → I-01 → N-01 → N-03
     → H-01 → H-03 → H-04 → H-05 → H-06 → H-07
     → H-02 → N-02 → I-02* → I-03 → H-08
```
\* I-02 ở M1 chỉ cần ở mức tối thiểu (dữ liệu mẫu), hoàn thiện cùng S-01.

# Spec · Màu theo quy tắc điện ảnh, chủ đạo nâu vàng (10/10/2026)

> Trạng thái: **Khang đã duyệt (10/10/2026). Đã làm M-1, M-2, M-3, M-4, M-6**; M-5 (grade ảnh) chờ ảnh thật. Câu hỏi mục 10 chưa trả lời nên đang dùng mặc định: nâu vàng ở giữa (hue ~36°), giữ bút đỏ, 2019 lạnh, giữ nền tối.
> Giá trị cuối cùng nằm trong `site/src/d2/d2.css`; bảng dưới là bản đề xuất, vài màu đã chỉnh nhẹ cho đạt AA (ghi ở mục 9).
> Phạm vi: toàn bộ giao diện D2 (`site/src/d2/`), trang story, bản xem thử `themes/d2-workbench.html`.
> Đi cùng: `05-spec-am-thanh.md`. Hai spec dùng chung một ý: **ấm, analog, có hạt**.

## 1. Mục tiêu

1. Cả site trông như **cùng một cuộn phim**: một bảng màu, một cách "chỉnh màu" (grade), từ trang chủ tới từng story.
2. **Nâu vàng là chủ đạo.** Giấy, mực, đường kẻ, ánh sáng đều nghiêng về hổ phách. Màu này nối với quyết định cũ "cát / thời gian" (`01-analysis-and-design.md`, mục C) mà không cần biểu tượng Ai Cập.
3. Màu **kể chuyện theo chương** (color script): mỗi chương có nhiệt độ màu riêng, nhưng lệch rất ít quanh trục nâu vàng, nên vẫn nhất quán.
4. Không phá những gì đang tốt của D2: giấy có hạt, bút chì, bút đỏ, băng dính, mono cho số đọc, serif cho lời kể.

Không làm: phong cách "teal & orange" bão hoà kiểu phim bom tấn, gradient phát sáng, dark mode neon (các dấu hiệu "AI slop" đã ghi trong `03-theme-directions.md`).

## 2. Hiện trạng (đã khảo sát)

| Chỗ | Hiện tại | Vấn đề so với mục tiêu |
|---|---|---|
| Token `:root` trong `d2.css` | Giấy xám ấm `#f5f3ee`, mực `#161616`, màu nhấn đồng `#b5532a`, bút đỏ `#c62f24` | Giấy gần trung tính, mực đen tuyền; đồng nghiêng đỏ cam, chưa phải nâu vàng |
| Nền tối | `#161513` / chữ `#ecebe6` | Gần xám, thiếu chiều ấm |
| Chương 2019 (`.ch.dark`) | Nền `--scope #0f1513` xanh rêu, chữ `#d3dcd6`, link vàng chanh `#f2d21b` | Tông lạnh duy nhất trên trang, nhưng xanh rêu và vàng chanh lệch hẳn khỏi bảng màu |
| Giấy tờ đạo cụ (`.pass`, `.aar`, `.clip`) | Mã màu viết cứng: `#1d1b17`, `#6c665d`, mực xanh `#1f3a8a`, giấy báo `#ece5d3` | Không theo token; nền tối không đổi theo |
| Canvas (`main.js`) | `readColors()` đọc 9 token CSS: tốt. Máy hiện sóng viết cứng hồng `#e64aa9`, xanh `#25c4e6`, vàng `#f2d21b`, xanh lá `#7be0a0`, cam `#f2a33a`, lưới `rgba(190,220,210,…)` | Kênh dao động ký mang màu "phosphor RGB", lạc tông nhất trên trang |
| Story mood (`ink · dusk · paper · field · ember`) | Mới dùng để chọn dạng sóng; trang story chưa áp màu (S-05 còn mở) | Cơ hội: định nghĩa mood bằng *grade* trong cùng bảng màu |
| Ảnh polaroid | Còn trống, chờ ảnh thật | Cần quy tắc chỉnh màu ảnh trước khi có ảnh |

## 3. Quy tắc điện ảnh áp dụng

Những quy tắc colorist dùng, chuyển sang web:

1. **Một bảng màu giới hạn.** Một hue chủ đạo (hổ phách, khoảng 35–42°), một màu bổ sung lạnh dùng rất ít (xanh đá phiến, khoảng 185°), một màu "cảnh báo" (bút đỏ). Mọi màu khác là sáng/tối của ba màu đó.
2. **Tỷ lệ 60 · 30 · 10.** Khoảng 60% là giấy và vùng nền ấm, 30% là mực nâu, tối đa 10% là màu nhấn (vàng hổ phách, bút đỏ, xanh đá phiến cộng lại). Màu nhấn chỉ đặt chỗ mắt cần nhìn.
3. **Ấm ở vùng sáng, lạnh nhẹ ở vùng tối.** Đây là cách grade cổ điển (split-toning): highlight ngả hổ phách, shadow ngả về xanh đá phiến cực nhẹ. Nhờ đó vùng tối có chiều sâu mà vẫn không ra "teal & orange".
4. **Không đen tuyệt đối, không trắng tuyệt đối.** Điểm đen nâng lên (mực nâu `#211a12` chứ không `#000`), điểm trắng cuộn mềm (giấy kem chứ không `#fff`). Đây là cảm giác phim nhựa.
5. **Giá trị (độ sáng) dẫn mắt trước, màu sau.** Thứ bậc thị giác dựa vào tương phản sáng tối; màu chỉ củng cố. Trang vẫn phải đọc được khi chuyển sang thang xám.
6. **Ánh sáng có nguồn (motivated light).** Bóng, quầng sáng, vệt sáng đều đến từ một hướng thống nhất: đèn bàn ấm phía trên bên trái, khớp với vector sáng `LT` của người máy và bóng đổ của UAV.
7. **Color script theo chương.** Như storyboard màu của phim hoạt hình: mỗi chương được phép lệch nhiệt độ màu một khoảng nhỏ, tạo nhịp cảm xúc (mục 5).
8. **Hạt phim thống nhất.** Lớp hạt giấy hiện có (`body::after`) chính là film grain. Giữ một lớp, một cường độ cho cả site, đổi màu hạt sang nâu.

## 4. Bảng màu đề xuất

Đã đo tương phản WCAG (script ở mục 9). "Chữ" nghĩa là được dùng cho văn bản (≥ 4.5:1); "đồ hoạ" là nét, icon, viền mang nghĩa (≥ 3:1); "trang trí" thì không mang thông tin.

### 4.1 Nền sáng: "giấy dưới đèn bàn"

| Token | Giá trị | Trên `--paper` | Dùng cho |
|---|---|---|---|
| `--paper` | `#f3ece0` | – | Nền trang, giấy kem ngả vàng |
| `--sheet` | `#faf6ee` | 1.09 | Tờ datasheet, thẻ nổi |
| `--band` | `#e9dfcc` | 1.13 | Dải bảng, vùng nhóm |
| `--rule` | `#d9ccb5` | trang trí | Đường kẻ 1px |
| `--ink` | `#211a12` | 14.6 · chữ | Chữ chính, nâu gần đen |
| `--ink-2` | `#5e5243` | 6.5 · chữ | Chú thích, mono phụ |
| `--pencil` | `#5a4f42` | 6.8 · chữ | Ghi chú tay, nét phác |
| `--accent` | `#865716` | 5.3 · chữ | **Nâu vàng chủ đạo**: link, số mục, nút đang chọn (thay đồng `#b5532a`) |
| `--gold` (mới) | `#a9771f` | 3.35 · đồ hoạ | Nét sáng, vệt đèn LED, tiến độ, đường tín hiệu |
| `--glow` (mới) | `#e6c27a` | trang trí | Quầng sáng, highlight lớn; chữ `--ink` trên nền này đạt 9+ |
| `--pen` | `#a8321f` | 5.7 · chữ | Bút đỏ: vòng tròn, cảnh báo, đếm ngược dừng |
| `--cool` (mới) | `#3d5a5c` | 6.4 · chữ | Màu bổ sung lạnh: shadow tint, chương 2019, kênh phụ |
| `--tape` | `rgb(226 205 150 / .6)` | trang trí | Băng dính |

### 4.2 Nền tối: "phòng chiếu"

| Token | Giá trị | Trên `--paper` |
|---|---|---|
| `--paper` | `#14100b` | – |
| `--sheet` | `#1b1610` | 1.05 |
| `--band` | `#241d15` | 1.14 |
| `--rule` | `#3a3126` | trang trí |
| `--ink` | `#efe5d3` | 15.2 · chữ |
| `--ink-2` | `#b2a48c` | 7.7 · chữ |
| `--pencil` | `#c1b29a` | 9.1 · chữ |
| `--accent` | `#d6a04a` | 8.1 · chữ |
| `--gold` | `#e2b25c` | 9.7 |
| `--glow` | `#5a4220` | trang trí (quầng tối, không làm chữ) |
| `--pen` | `#ff7b5e` | 7.4 · chữ |
| `--cool` | `#8fb0ad` | 8.1 · chữ |

Nền tối **không phát sáng**: không `box-shadow` màu, không `text-shadow` neon. Sáng chỉ đến từ giấy/màn hình trong cảnh (máy hiện sóng), như phòng chiếu chỉ có ánh màn.

### 4.3 Máy hiện sóng: phosphor hổ phách

Thay phosphor RGB bằng **màn hình hổ phách đơn sắc** (như dao động ký và terminal P3 đời cũ). Đúng nghề, đúng tông:

| Vai trò | Thay cho | Giá trị đề xuất |
|---|---|---|
| Nền màn (`--scope`) | `#0f1513` | `#16120c` |
| Lưới | `rgba(190,220,210,.14)` | `rgb(232 200 140 / .14)` |
| Kênh 1 (chính) | `#f2d21b` | `#f3cf7a` hổ phách sáng |
| Kênh 2 | `#25c4e6` | `#86b3ad` xanh đá phiến (màu bổ sung) |
| Kênh 3 | `#e64aa9` | `#e0a440` hổ phách đậm, **nét đứt** |
| TRIG'D / AUTO… | `#7be0a0` / `#f2a33a` | `#f3cf7a` / `#a8987c` (trạng thái bằng chữ, không chỉ bằng màu) |

Các kênh phân biệt bằng **độ sáng + kiểu nét** (liền / chấm / đứt), không chỉ bằng hue, nên người mù màu vẫn đọc được.

### 4.4 Story mood thành "grade"

Mỗi mood là một **phép chỉnh màu** trên cùng bảng màu, không phải bảng màu mới:

| Mood | Cảm giác | Grade (so với nền) | Dạng sóng (giữ nguyên) |
|---|---|---|---|
| `paper` | Ban ngày, kể thẳng | Nền gốc, không lệch | vuông |
| `dusk` | Hoàng hôn, hồi tưởng | Hue +6° về cam, highlight ấm hơn, shadow tím nâu nhẹ | sin |
| `ember` | Than hồng, đau, cháy | Nền tối, accent ngả đỏ hổ phách, tương phản cao | tắt dần |
| `field` | Ngoài trời, hiện trường | Bão hoà thấp, shadow ngả `--cool`, như phim âm bản bạc màu | tam giác |
| `ink` | Đêm, nghĩ một mình | Nền tối gần đơn sắc, chỉ còn `--ink` và một vệt `--gold` | răng cưa |

`accent` tuỳ chọn trong frontmatter vẫn được giữ, nhưng chỉ được nhận khi hue nằm trong dải 20–50° (nâu vàng tới đỏ đất) **và** đạt 4.5:1 trên giấy sáng (`site/src/lib/color.mjs`). Không đạt thì build cảnh báo và bỏ qua màu đó, để không story nào phá tông chung. Màu riêng chỉ áp trên nền sáng; nền tối và mood `ember`/`ink` giữ accent của mình.

Mood mặc định khi bỏ trống đổi từ `ink` sang `paper`, vì `ink` giờ là trang nền tối.

## 5. Color script cho trang chủ

Trục chính là nâu vàng; mỗi chương lệch nhiệt độ màu trong biên độ hẹp. Đường cong cảm xúc: ấm hoài niệm → lạnh, lặng → ấm dần → sáng, mơ.

| Chương (`id`) | Nhiệt độ | Grade | Lý do |
|---|---|---|---|
| Hero `#top` | Trung tính ấm | Nền gốc | Mở đầu, chưa kể gì |
| `#pitch` | Trung tính ấm | Nền gốc | |
| `#ch-student`, `#ch-uav` | **Ấm nhất, vàng đèn sợi đốt** | Giấy ngả vàng hơn (+2% bão hoà), `--glow` rõ hơn | Hoài niệm, phòng lab sinh viên |
| `#ch-2019` | **Lạnh duy nhất** | Nền `--scope` tối, chữ kem, shadow `--cool`; link `--gold` thay vàng chanh | Chương lặng nhất; lạnh để tương phản với cả trang |
| `#ch-2022` | Ấm dần | Nền gốc, accent đậm lại | Đứng dậy |
| `#ch-2024` | **Giờ vàng** | Highlight cam vàng, như ánh chiều trên bản đồ hành trình | Đi xa |
| `#ch-work` | Trung tính, tiết chế nhất | Bão hoà thấp nhất, gần như chỉ còn mực | Giọng hệ thống, không kể chuyện; cũng hợp quy tắc công việc công ty chỉ ở mức chung |
| `#now` | Ấm hiện tại | Nền gốc | |
| `#someday` | **Sáng, mơ** | Highlight `--glow` loang nhẹ (bloom), giấy sáng hơn một bậc | Ước mơ người máy |
| `#together` … `#support` | Trở về | Nền gốc | Kết phim, trở về tông chủ |

Chuyển giữa các chương bằng **chuyển màu mềm theo vị trí cuộn** (mục 6.2), không cắt cứng, trừ 2019 vốn là một dải tối có viền riêng.

## 6. Cách làm (kỹ thuật)

### 6.1 Token là nguồn duy nhất

- Thay giá trị trong `:root` và hai khối nền tối của `d2.css`. Thêm `--gold`, `--glow`, `--cool`, `--scope-*`.
- **Bỏ mọi mã màu viết cứng** trong `.pass`, `.aar`, `.clip`, `.draftnote`, `.ch.dark`. Đạo cụ giấy có token riêng (`--prop-paper`, `--prop-ink`, `--prop-blue` cho mực bút bi), có bản tối.
- `main.js`: thêm `gold`, `glow`, `cool`, `scope` vào danh sách `readColors()`; bỏ `CH = {…}` và các `rgba(190,220,210,…)` viết cứng. `readColors()` đã chạy lại khi hệ điều hành đổi sáng/tối (`main.js:9`), nên canvas tự đổi theo; nếu sau này có nút đổi theme thì gọi lại nó ở đó.
- Mực xanh bút bi (`#1f3a8a`) là ngoại lệ có chủ đích (chữ ký thật): giữ, nhưng giảm bão hoà sang `#2b3f73` để không chói giữa trang nâu.

### 6.2 Grade theo chương

- Mỗi `section.ch` mang `data-grade="warm|cold|golden|neutral|dream"`. CSS định nghĩa một bộ biến nhỏ cho mỗi grade: `--g-tint` (màu phủ), `--g-sat`, `--g-lift`.
- Một lớp phủ cố định `body::before` dùng `mix-blend-mode: soft-light` với `background: var(--g-tint)`; chỉ đổi `--g-tint` khi chương vào giữa màn hình. Cần một IntersectionObserver riêng: observer hiện có (`main.js:45`) bỏ theo dõi chương ngay sau lần hiện đầu tiên. Chuyển màu bằng `transition` 900 ms (giọng "story", chậm, mềm).
- Lớp phủ nằm trên mọi thứ, kể cả canvas (một lớp `fixed` không thể loại trừ phần tử bên dưới). Vì vậy tint giữ rất nhẹ (10–16%), và ảnh đã grade lúc build (M-5) phải tính đến lớp này.
- `prefers-reduced-motion`: đổi grade tức thì, không chuyển dần. `prefers-contrast: more` và `forced-colors: active`: tắt lớp phủ, tắt hạt.

### 6.3 Hạt phim và vignette

- Giữ `body::after`, đổi ma trận màu hạt sang nâu (`.45 .38 .28`).
- Vignette rất nhẹ ở mép viewport (radial-gradient, độ mờ ≤ 6%), **chỉ trên desktop**, tắt ở `prefers-contrast: more`. Vignette không được làm tối chữ ở mép xuống dưới mức AA.

### 6.4 Ảnh

Mọi ảnh thật (polaroid, ảnh story) đi qua **cùng một grade** khi build, không chỉnh bằng tay từng ảnh:

- Bước build bằng `sharp` (thư viện ảnh Astro dùng; sẽ thêm vào dependencies khi làm M-5): nâng điểm đen nhẹ, cuộn highlight, split-tone (highlight hổ phách, shadow đá phiến), giảm bão hoà ~10%, thêm hạt nhẹ. Tham số lưu một chỗ (ví dụ `site/src/lib/grade.mjs`) để ảnh mới luôn khớp.
- Ảnh gốc giữ nguyên; chỉ bản xuất ra web là bản đã grade.
- Ảnh vẫn phải qua kiểm tra quy tắc công ty: không màn hình, logo, dữ liệu, khách hàng của nơi làm việc.

## 7. Tiêu chí nghiệm thu

- [x] Chụp toàn trang (sáng + tối), chuyển thang xám: thứ bậc chữ vẫn rõ.
- [x] Mọi cặp chữ/nền đạt AA (4.5:1), nét đồ hoạ mang nghĩa đạt 3:1, kiểm bằng `pnpm colors` cho nền sáng, nền tối và các mood đổi token (`field`, `ember`, `ink`).
- [x] `grep` không còn mã màu hex/rgb viết cứng trong `d2.css` ngoài khối token (trừ bóng đổ nâu và vignette), và trong `main.js` ngoài màu trắng/đen thuần cho mặt nạ.
- [x] Diện tích màu nhấn trên một màn hình ≤ 10% (ước lượng bằng ảnh chụp).
- [x] 2019 vẫn là chương tối, lạnh; các chương khác đọc rõ là "cùng một phim".
- [x] `prefers-reduced-motion`, `prefers-contrast: more`, `forced-colors` hoạt động như mục 6 (kiểm bằng Playwright).
- [x] `pnpm check`, `pnpm build` qua; dựng lại `themes/d2-workbench.html`; chụp lại `docs/pharaoh-alone/screens/`.

## 8. Thứ tự làm

| Bước | Nội dung | Cỡ |
|---|---|---|
| M-1 | Token mới cho nền sáng/tối, bỏ màu viết cứng ở CSS đạo cụ và 2019 | S |
| M-2 | Canvas: `readColors()` mở rộng, máy hiện sóng phosphor hổ phách | S |
| M-3 | Grade theo chương (`data-grade`, lớp phủ, chuyển mềm) | M |
| M-4 | Mood thành grade trên trang story (đóng phần còn mở của S-05) | M |
| M-5 | Grade ảnh lúc build | M, chờ có ảnh thật |
| M-6 | Script kiểm tương phản (`pnpm colors`), chạy được trong `pnpm build` | S |

Bước M-1 và M-2 cho kết quả nhìn thấy ngay, đảo ngược dễ, nên làm trước rồi Khang xem trên trang.

## 9. Ghi chú kiểm tra

Số tương phản trong mục 4 tính theo công thức độ chói tương đối của WCAG 2.x. Ví dụ: `#c08a2c` chỉ đạt 2.59 nên bị loại khỏi vai trò đồ hoạ và đổi sang `--gold #a9771f` (3.35). `pnpm colors` (`site/scripts/colors.mjs`) đọc thẳng token từ `d2.css`, in từng cặp và chạy trước `astro build`: một cặp dưới ngưỡng là build dừng.

Chỉnh khi làm: `--accent` `#8a5a17` → `#865716` (bản cũ chỉ đạt 4.47 trên `--band`); thêm `--prop-pen #922c1a` cho dấu mộc trên giấy đạo cụ (bút đỏ nền tối đọc không rõ trên giấy kem); `--prop-ink-2` nền tối `#574b3c`.

## 10. Câu hỏi cho Khang

1. Nâu vàng nghiêng **mật ong** (sáng, ngọt, hue ~40°) hay **cà phê sữa / da thuộc** (trầm, hue ~30°)? Bảng trên đang ở giữa.
2. Có giữ bút đỏ không, hay đổi sang đỏ đất cho êm hơn?
3. Chương 2019 lạnh như đề xuất, hay muốn cả trang đều ấm?
4. Nền tối có cần không, hay site chỉ một chế độ sáng "dưới đèn bàn" cho đúng chất phim?

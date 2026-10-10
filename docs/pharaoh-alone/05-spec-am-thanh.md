# Spec · Âm thanh theo phần, theo story, theo nguồn (10/10/2026)

> Trạng thái: **bản đề xuất, chờ Khang duyệt.** Site hiện chưa có dòng âm thanh nào.
> Đi cùng: `04-spec-mau-dien-anh.md`. Âm thanh nối với màu ở cùng một chất: **ấm, analog, có hạt**. Nghe như băng từ, bút chì, rơ-le, không nghe như "bíp" điện tử.

## 1. Mục tiêu và nguyên tắc

1. **Tắt mặc định.** Người đọc tự bật. Không phát gì trước khi họ bấm.
2. **Có nghĩa hoặc không có**, giống nguyên tắc chuyển động (`01-analysis-and-design.md`, Motion principles). Mỗi âm thanh phải phản hồi một hành động, kể một chương, hoặc đặt người đọc vào một nơi chốn.
3. **Ba lớp, ba nguồn**, vì độ phức tạp khác nhau:
   - **Lớp tương tác** (mô phỏng, nút): tổng hợp bằng Web Audio, không cần file.
   - **Lớp không gian** (nền của chương, của story): bản ghi môi trường, nhỏ và lặp.
   - **Lớp giọng** (Khang đọc story): bản ghi giọng nói, có văn bản đi kèm.
4. **Không mang thông tin chỉ bằng âm thanh.** Mọi thứ nghe được đều đã thấy được trên trang (chữ "dừng", vòng đếm ngược, TRIG'D…).
5. **Nhẹ.** Bật âm thanh mới tải file. Người không bật không tốn một byte nào.
6. **Quy tắc công ty áp dụng cho cả tai.** Không tiếng văn phòng, cuộc họp, giọng đồng nghiệp hay âm thanh máy móc nhận ra được của nơi làm việc.

## 2. Hiện trạng (đã khảo sát)

- Không có `<audio>`, `AudioContext` hay file âm thanh nào trong `site/`.
- `main.js` là ES5 thuần, không import (bản xem thử nhúng thẳng file). Mọi mã âm thanh phải theo cùng ràng buộc.
- `main.js` đã có sẵn những điểm móc cần thiết: vòng `tick` chung (bỏ qua khi `document.hidden`), cờ `reduce`, IntersectionObserver theo chương, trạng thái mô phỏng (tốc độ xe `spd`, vạch dừng `onBar/stopT`, `fanSpin` của quạt UAV, khớp người máy, `lock` của máy hiện sóng).
- Story có `mood` (`ink · dusk · paper · field · ember`) nhưng chưa có trường nào cho âm thanh.

## 3. Ràng buộc trình duyệt và trợ năng

| Ràng buộc | Hệ quả |
|---|---|
| Chính sách autoplay (Chrome, Safari, Firefox): `AudioContext` khởi tạo ở trạng thái `suspended` cho tới khi có thao tác người dùng | Tạo và `resume()` context **trong** sự kiện bấm nút bật âm thanh |
| iOS: Web Audio bị nút gạt im lặng tắt tiếng | Ghi rõ trong tooltip; Safari mới có `navigator.audioSession.type = 'playback'`, dùng nếu có, không dựa vào |
| WCAG 1.4.2 (Audio Control): âm thanh tự phát quá 3 giây phải dừng được | Tắt mặc định + nút tắt luôn thấy ở header → đạt |
| WCAG 1.2.1 (chỉ có âm thanh): bản ghi giọng phải có văn bản tương đương | Story có giọng đọc thì bản chữ chính là transcript, đồng bộ đoạn đang đọc |
| Tab ẩn | `visibilitychange` → giảm dần về 0 trong 300 ms rồi `suspend()` |
| `prefers-reduced-motion` | Không phải cài đặt âm thanh, nhưng người bật nó thường muốn yên: chỉ còn lớp tương tác, bỏ lớp không gian, không có âm thanh "trang trí" khi cuộn |
| Định dạng | Opus trong `.webm` (nhỏ nhất) + AAC `.m4a` dự phòng cho Safari cũ; chọn bằng `canPlayType` |

## 4. Kiến trúc

```
                 ┌ bus "ui"    (nút, chuyển trang)        ┐
nguồn ──────────►├ bus "sim"   (xe, UAV, người máy, scope) ├─► master ─► limiter ─► loa
                 ├ bus "bed"   (nền chương / story)        │     ▲
                 └ bus "voice" (giọng đọc)  ── ducking ────┘     └ nút âm lượng / tắt
```

- **Một file `site/src/d2/sound.js`**, ES5, không import, gắn `window.snd`. `main.js` chỉ gọi `snd.emit('lf.stop')`, `snd.set('uav.rotor', 0.7)`… Khi âm thanh tắt, `snd` là một đối tượng rỗng, các lời gọi không làm gì. Build (`text.mjs`, `build.mjs`) nhúng file này như `main.js`.
- **Bus và mức chuẩn** (gain tương đối, trước limiter):

  | Bus | Mức | Ghi chú |
  |---|---|---|
  | voice | 0 dB | Chuẩn hoá −16 LUFS khi xuất file |
  | sim | −10 dB | Ngắn, theo thao tác |
  | ui | −14 dB | Rất ngắn (< 120 ms) |
  | bed | −22 dB | Dưới ngưỡng chú ý; **giảm thêm 9 dB khi voice đang phát** (ducking 250 ms) |

- **Limiter** (`DynamicsCompressorNode`, ngưỡng −6 dB, ratio 12) ở cuối, để nhiều mô phỏng chạy cùng lúc không bị vỡ tiếng.
- **Chỉ nghe chương đang xem.** Âm thanh mô phỏng gắn vào `job.on` hiện có (canvas trong khung nhìn). Nền chương đổi theo chương ở giữa màn hình, chuyển chéo (crossfade) 2.5 s.
- **Tải lười.** File nền và giọng chỉ tải khi âm thanh đã bật **và** chương/story gần tới (`rootMargin` 1 màn hình). Âm thanh tổng hợp không tải gì.
- **Ghi nhớ lựa chọn**: `localStorage['pa.sound'] = 'on'|'off'`, bọc `try/catch`. Lần sau vẫn cần một cú bấm để `resume()` (luật autoplay), nên nút hiện trạng thái "bấm để tiếp tục".

### 4.1 Nút điều khiển

- Ở header, cạnh nút ngôn ngữ: một icon loa vẽ nét như logo, `aria-pressed`, nhãn `data-ta` (`chung.nut-am-thanh`).
- Khi bật: một đường sóng nhỏ trong icon chạy theo mức âm tổng (đọc từ `AnalyserNode`), cùng phong cách máy hiện sóng.
- Phím tắt `M` bật/tắt (không bắt khi đang gõ trong ô nhập).
- Trang story có thêm thanh đọc riêng nếu story có giọng (mục 6.3).

## 5. Lớp tương tác: tổng hợp bằng Web Audio

Không dùng file: âm thanh **đi theo tham số thật** của mô phỏng, nên khớp từng khung hình và gần như không tốn dung lượng. Chất âm: lọc thông thấp, bão hoà nhẹ (`WaveShaperNode`) cho giống băng từ, không có sóng vuông trần.

| Chỗ (`id`) | Âm thanh | Tham số lái |
|---|---|---|
| Hero `#globe` | Gió rất nhẹ (nhiễu hồng qua bộ lọc dải) khi kéo, theo quán tính | Tốc độ quay |
| `#lf` xe dò đường | Động cơ DC: hai sóng răng cưa lệch nhau + nhiễu, qua low-pass | Cao độ và âm lượng theo `spd`; Kp cao thì rung (tremolo) theo sai số |
| | Tới vạch ngang: "tách" rơ-le khi dừng, tiếng động cơ tắt dần, ba tiếng tích nhỏ theo vòng đếm ngược, rồi khởi động lại | `onBar`, `stopT`, `STOP` |
| | Lạc đường: tiếng động cơ hụt, một nốt trầm | `hd-lac` |
| `#uav` | Cánh quạt: nhiễu qua bộ lọc cộng hưởng ở tần số lướt cánh (vòng quay × số cánh), bốn rotor lệch pha nhẹ | Lực đẩy, độ cao (càng gần đất càng có tiếng "dội") |
| | Con trỏ quạt mini: "vù" theo tốc độ rê chuột | `fanSpin`, vận tốc con trỏ |
| | Chạm đất | Tiếng bịch trầm, ngắn |
| `#ch-2019` `#settle` | Gần như im lặng: tiếng ù phòng rất nhỏ, có thể một tiếng ù điện 50 Hz | Không có tương tác |
| `#err` (2022) | Tiếng bút chì cào khi đồ thị đang vẽ | Tốc độ nét |
| `#route` (2024) | Không tổng hợp; dùng nền chương (mục 6) | |
| `#hu` người máy | Servo: tiếng rít cao độ theo vận tốc khớp, mỗi khớp một cao độ | `armZ`, vận tốc góc |
| | Xoay mô hình: tiếng ma sát nhỏ theo `yv` | Kéo ngang |
| | Hoàn thành một nhiệm vụ: hai nốt chuông gỗ ấm; xong cả chuỗi: ba nốt | `quest` |
| `#mate` (cùng làm) | Cắm đầu nối khớp: tiếng "cạch" cơ khí | `hd-da-khop` |
| Máy hiện sóng (stories) | Nhiễu trắng nhỏ khi AUTO…, một tiếng "tích" khi TRIG'D | `lock` |
| `#timing` (dấu vết) | Tích nhỏ khi rê qua từng năm, như máy phân tích logic | Năm dưới con trỏ |
| `#support` | Pin sạc: một âm tăng dần khi rê vào gói | Mức pin |
| Nút, link `golink` | Không có âm. Chỉ nút bật/tắt âm thanh có một tiếng "tách" xác nhận | |

Nguyên tắc chung: **một hành động, nhiều nhất một âm thanh**; âm lặp lại (tích, cạch) thay đổi ngẫu nhiên ±3% cao độ để không máy móc.

## 6. Lớp không gian: theo chương và theo story

### 6.1 Nền chương trên trang chủ

Một bản lặp 30–60 s cho mỗi chương có lý do để có, **không phải chương nào cũng có**:

| Chương | Nền đề xuất | Nguồn |
|---|---|---|
| `#ch-student`, `#ch-uav` | Phòng lab, quạt máy tính, tiếng mỏ hàn, xa xa tiếng sân trường | Khang ghi, hoặc CC0 |
| `#ch-2019` | Im lặng, chỉ ù phòng | Tổng hợp |
| `#ch-2024` | Sân bay / khoang máy bay rất nhỏ, chuyển dần sang tiếng chim New Zealand | Khang ghi |
| `#now` | Tiếng phòng làm việc ở nhà, mưa nhẹ nếu Khang muốn | Khang ghi |
| `#someday` | Một nốt nền kéo dài (pad), ấm, hơi mơ | Tổng hợp |
| Các chương còn lại | Không có nền | |

### 6.2 Story: mood thành "khung âm thanh"

Story không có trường âm thanh nào vẫn có không gian, lấy từ mood (song song với grade màu trong spec màu):

| Mood | Khung âm thanh mặc định |
|---|---|
| `paper` | Gần im lặng, tiếng lật giấy khi sang phần mới |
| `dusk` | Ù chiều, côn trùng xa, rất nhỏ |
| `ember` | Lửa lách tách, tiếng gió thấp |
| `field` | Ngoài trời: gió, chim, bước chân trên sỏi |
| `ink` | Đêm: đồng hồ tích tắc, tiếng thành phố xa |

### 6.3 Story tự định nghĩa âm thanh

Thêm trường **tuỳ chọn** `sound` vào schema `stories` (`site/src/content.config.ts`). Khang viết trong frontmatter tiếng Việt; tên file dùng chung cho hai ngôn ngữ, trừ giọng đọc:

```yaml
sound:
  nen: ga-xe-lua-1998        # site/public/audio/nen/ga-xe-lua-1998.webm (+ .m4a)
  giong: true                # có giọng đọc: audio/giong/<slug>.vi.webm, .en.webm nếu có
  diem:                      # đổi âm thanh khi người đọc tới một tiêu đề
    - tai: "## Năm 2019"
      nen: mua-dem
    - tai: "## Bây giờ"
      nen: null              # tắt nền
```

- `nen` thay khung âm thanh của mood. `null` là im lặng có chủ đích.
- `giong`: khi có, trang hiện thanh đọc (phát/dừng, tốc độ 1× / 1.25×, tua theo đoạn). Đoạn đang đọc được tô nhạt bằng `--glow`. Bản en thiếu giọng thì không hiện thanh đọc, không phát giọng tiếng Việt trên trang tiếng Anh.
- `diem`: neo theo tiêu đề có sẵn trong bài, để Khang không phải ghi giây. Đồng bộ giọng–đoạn dùng một file nhãn thời gian (`<slug>.vi.json`) do script tạo, không bắt Khang viết.
- Thiếu file → build **cảnh báo**, không lỗi (khác với key chữ tiếng Việt thiếu thì lỗi), vì âm thanh là phần thêm.
- Cập nhật `HUONG-DAN.md` cùng lúc khi thêm trường này (theo `CLAUDE.md`).

## 7. Nguồn âm thanh và bản quyền

Repo công khai, nên mọi file đẩy lên là phát hành.

| Nguồn | Được dùng | Ghi chú |
|---|---|---|
| Khang tự ghi | Có, ưu tiên | Kiểm tra không có giọng người khác, không có âm thanh nơi làm việc |
| Tổng hợp trong `sound.js` | Có | Không cần ghi công |
| CC0 (ví dụ Freesound lọc CC0) | Có | Ghi nguồn trong `site/public/audio/NGUON.md` dù CC0 không bắt buộc |
| CC-BY | Có, kèm ghi công | Ghi công trong `NGUON.md` và trang credits ở footer |
| CC-BY-NC, CC-BY-ND, "royalty free" không rõ giấy phép, nhạc thương mại | **Không** | Site có trang ủng hộ, nên không chắc là "phi thương mại" |
| Nhạc có lời | Không ở MVP | |

Mỗi file có một dòng trong `NGUON.md`: tên file, nguồn, tác giả, giấy phép, ngày tải, chỉnh sửa gì.

## 8. Quy chuẩn file

| | Nền (bed) | Giọng | Hiệu ứng (nếu có file) |
|---|---|---|---|
| Độ dài | 30–60 s, lặp liền | Theo bài | < 1 s |
| Kênh | Stereo | Mono | Mono |
| Mã hoá | Opus 64 kbps / AAC 96 kbps | Opus 32 kbps / AAC 64 kbps | Opus 64 kbps |
| Độ to | −30 LUFS (để nằm dưới) | −16 LUFS, đỉnh −1 dBTP | Đỉnh −6 dBFS |
| Đầu/cuối | Cắt tại điểm 0, crossfade vòng lặp 500 ms | 300 ms im lặng | |

Ngân sách: một chương nền ≤ 400 KB, trang chủ tổng ≤ 2 MB **chỉ khi đã bật** và cuộn hết trang. Script `pnpm audio` (về sau) chuẩn hoá độ to và xuất hai định dạng bằng `ffmpeg`.

## 9. Tiêu chí nghiệm thu

- [ ] Tải trang lần đầu: 0 request âm thanh, không `AudioContext` nào được tạo (kiểm trong Playwright).
- [ ] Bật âm thanh → các mô phỏng phát theo tham số; tắt → im trong ≤ 300 ms.
- [ ] Rời tab → âm tắt dần; quay lại → tiếp tục.
- [ ] Ba mô phỏng chạy cùng lúc không vỡ tiếng (limiter).
- [ ] Mọi thông tin vẫn đọc được khi tắt tiếng.
- [ ] Bàn phím: nút âm thanh focus được, `M` hoạt động, thanh đọc story dùng được hoàn toàn bằng phím.
- [ ] `NGUON.md` có đủ dòng cho mọi file trong `site/public/audio/`.
- [ ] `pnpm check`, `pnpm build` qua; bản xem thử dựng lại vẫn chạy (sound.js nhúng được).

## 10. Thứ tự làm

| Bước | Nội dung | Cỡ | Cần Khang |
|---|---|---|---|
| A-0 | `sound.js` + nút bật/tắt + bus/limiter + nhớ lựa chọn | S | Duyệt icon |
| A-1 | Âm thanh tổng hợp cho xe dò đường, UAV/quạt, người máy | M | Nghe thử, chỉnh |
| A-2 | Phần tương tác còn lại (globe, scope, mate, timing, support) | S | |
| A-3 | Nền chương trang chủ | M | Bản ghi |
| A-4 | Mood → khung âm thanh trên trang story | S | |
| A-5 | Trường `sound` trong schema story + `HUONG-DAN.md` | M | |
| A-6 | Giọng đọc + thanh đọc + đồng bộ đoạn | L | Bản ghi giọng |

A-0 và A-1 không cần file nào, làm được ngay; các bước sau chờ nguồn âm thanh.

## 11. Câu hỏi cho Khang

1. Có muốn tự đọc story không? Đọc cả bản tiếng Anh, hay chỉ tiếng Việt?
2. Có sẵn bản ghi nào (lab hồi sinh viên, sân bay, New Zealand, nhà) không, hay bắt đầu bằng tổng hợp + CC0?
3. Có muốn nhạc nền không, hay chỉ âm thanh môi trường? (Đề xuất: không nhạc ở MVP.)
4. Âm thanh tắt mặc định ở mọi trang, hay trang story có giọng đọc thì hiện lời mời "nghe bài này"?

# Hướng dẫn sửa chữ trên pharaohalone.com

Bạn chỉ viết **tiếng Việt**. Bản tiếng Anh nằm ở thư mục `en/` song song, do Claude dịch. Bạn không cần đụng vào.

```
site/src/content/
├── home/
│   ├── vi/            ← BẠN SỬA Ở ĐÂY: chữ trên trang chủ, mỗi phần một file
│   │   ├── 00-chung.md            (ghi chú vàng đầu trang, chân trang)
│   │   ├── 01-mo-dau.md           (tiêu đề lớn, cạnh quả địa cầu)
│   │   ├── 02-ban-30-giay.md
│   │   ├── 03-sinh-vien-robot.md
│   │   ├── 04-sinh-vien-uav.md
│   │   ├── 05-2019.md
│   │   ├── 06-2022.md
│   │   ├── 07-2024.md
│   │   ├── 08-cong-viec.md
│   │   ├── 09-bay-gio.md
│   │   ├── 10-mot-ngay-nao-do.md  (cả lời con robot nói)
│   │   ├── 11-cung-lam.md
│   │   ├── 12-cau-chuyen.md
│   │   ├── 13-dau-vet.md          (các mốc trên giản đồ thời gian)
│   │   └── 14-ung-ho.md
│   └── en/            ← bản tiếng Anh (Claude dịch)
└── stories/
    ├── vi/            ← BẠN VIẾT BÀI MỚI Ở ĐÂY
    └── en/            ← bản tiếng Anh (Claude dịch)
```

## 1. Sửa chữ trang chủ

Mỗi file chia thành từng mục. Mỗi mục bắt đầu bằng một dòng `## tên-mục`:

```md
## tieu-de
Sai số lớn nhất

## doan-van
> Hệ thống không hỏng vì có sai số. Nó hỏng khi người ta giả vờ **sai số bằng không**.

Năm 2022, sai số của tôi không còn giấu được nữa. …

Tôi cởi quân phục trong hoàn cảnh đó.
```

- Sửa thoải mái phần chữ **bên dưới** dòng `## …`.
- **Đừng đổi tên sau `##`.** Trang web dùng tên đó để biết chữ đặt ở đâu.
- **Đừng xoá cả một mục.** Muốn một mục biến mất thì nhắn Claude, vì phải sửa cả khung trang.
- Mục tên `doan-van` có thể có nhiều đoạn. Các đoạn cách nhau bằng **một dòng trống**. Thêm hay bớt đoạn đều được.
- Các mục khác chỉ chứa một dòng chữ (tiêu đề, nhãn, nút bấm…).
- Mục bắt đầu bằng `mo-ta-` là lời đọc cho người khiếm thị dùng trình đọc màn hình. Nó không hiện trên trang, nhưng nên sửa theo nếu bạn đổi nội dung hình.
- Mục bắt đầu bằng `hd-` là chữ bên trong hình động (lời con robot, nhãn trên đồ thị…). Nên giữ ngắn, vì khung vẽ nhỏ.
- Dòng nằm giữa `<!--` và `-->` là ghi chú cho người sửa. Trang web bỏ qua những dòng này.

### Cách viết

| Bạn gõ | Trên trang hiện ra |
|---|---|
| `**chữ**` | chữ được **khoanh tròn** bằng bút đỏ |
| `_chữ_` | chữ được **gạch chân** bằng bút đỏ |
| `> ` ở đầu đoạn | đoạn đó **in to** (câu nhấn) |
| `[chữ](#ch-2022)` | đường link |
| `___` | ô trống `?` (trong "Sổ sửa sai") |
| `- ` ở đầu dòng | một dòng trong danh sách (phần "Bây giờ", "Dấu vết") |
| `{khoang-cach}` | con số km tự tính (phần 2024), giữ nguyên |

Trong danh sách ở phần "Bây giờ", `- **GeoNote**` nghĩa là việc đang làm, có vạch chéo màu.

Ở phần "Dấu vết", mỗi mốc có dạng `- 2024: New Zealand`. Thêm dòng là thêm mốc. Mốc cuối cùng sẽ có chữ "mình đang ở đây".

## 2. Viết bài mới (Câu chuyện)

Tạo một file mới trong `stories/vi/`. Tên file viết không dấu, nối bằng gạch ngang, ví dụ `nam-2022.md`. Tên file sẽ thành đường dẫn: `pharaohalone.com/vi/stories/nam-2022/`.

```md
---
title: "Tiêu đề bài viết"
date: 2026-10-20
category: LIFE
summary: "Một câu tóm tắt, hiện trong danh sách bài."
---

Đoạn mở đầu…

## Một tiêu đề nhỏ

Viết tiếp. Cách nhau một dòng trống là sang đoạn mới.

> Một câu trích dẫn.
```

- **`category`** chọn một trong: `LIFE`, `ENGINEERING`, `BUILDING`, `THOUGHTS`, `PEOPLE`.
- **Bản nháp chưa muốn đăng:** thêm dòng `draft: true`. Bài vẫn hiện khi bạn xem trên máy (`pnpm dev`), nhưng không lên site thật.
- **Trong bài**, `**chữ**` là chữ đậm bình thường, không khoanh tròn như trang chủ.
- **Trang chủ** tự hiện 3 bài mới nhất. Trang `/vi/stories/` liệt kê tất cả.
- **Đổi tiêu đề bài mẫu thành bài thật:** mở file đó, xoá dòng `placeholder: true`, rồi viết nội dung bên dưới dấu `---`.

## 3. Xem trên máy và gửi lên

```bash
cd site
pnpm dev          # mở http://localhost:4321/vi/ – lưu file là trang tự cập nhật
```

Xong thì commit và push (hoặc dùng tab Source Control trong VS Code). Sau đó nhắn Claude **"dịch giúp"**.

Claude sẽ chạy `pnpm text`. Lệnh này liệt kê chính xác mục nào bạn vừa sửa, mục nào chưa có tiếng Anh, và mục nào bị gõ sai tên. Claude dịch xong sẽ chạy `pnpm text:mark` để ghi nhớ.

Nếu chưa kịp dịch, trang tiếng Anh tạm hiện chữ tiếng Việt ở những chỗ đó. Site vẫn chạy bình thường.

## Khi có lỗi

Nếu `pnpm dev` báo kiểu `Thiếu mục "## tieu-de" trong file vi/…-2022.md`, nghĩa là một dòng `## …` đã bị xoá hoặc đổi tên. Gõ lại cho đúng là hết lỗi.

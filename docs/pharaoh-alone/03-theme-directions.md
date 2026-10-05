# Bốn hướng giao diện thay thế (05/10/2026)

> **Đã chọn: D · Datasheet cơ điện tử.** Site `site/` được dựng lại theo D. A, B, C giữ lại để tham khảo và có thể đổi sau.
> **D2 · Datasheet trên bàn làm việc** (`themes/d2-workbench.html`, đang chờ Khang duyệt): giữ khung D nhưng viết cho người đọc chứ không phải cho máy —
> kể theo chương có thật (sinh viên → 2019 → 2024 → 2025 → bây giờ → một ngày nào đó) thay cho mục đánh số; demo tự tay chỉnh được (Kp của robot dò đường, thổi gió vào UAV, người máy nhìn theo con trỏ và vẫy tay);
> "bẩn" có chủ đích: hạt giấy, ghi chú viết tay (Patrick Hand), vòng bút đỏ, băng dính, vết cà phê, thẻ lên máy bay, thông tin công ty bị bôi đen; văn xuôi dùng serif Newsreader; khung ảnh polaroid chờ ảnh thật.
> Lời kể trong D2 là bản nháp dựa trên các mốc Khang đã đưa, Khang sẽ viết lại.
> Bổ sung cho D: mục **4 · Dòng sản phẩm — tiến hoá** (robot dò đường → UAV → robot hình người + AI), logo tự vẽ lại theo ba thế hệ, và chuyển động riêng cho từng mục (chi tiết ở `02-backlog.md`, H-10 và H-11).

> Nghề ban đầu của Khang là **kỹ sư cơ điện tử** (không phải cơ khí).

Bản prototype đầu (nền gần đen + màu nhấn vàng cát + nhãn mono viết hoa + chữ serif nghiêng) rơi đúng vào kiểu "AI slop": dark mode, màu nhấn phát sáng, font sans mặc định.
Bốn mẫu dưới đây lấy hình ảnh từ chính nghề của Khang, thay vì từ "website portfolio":

| Mẫu | Ý tưởng | Lấy từ | File |
|---|---|---|---|
| **A · Bản vẽ** | Cả trang là một tờ bản vẽ kỹ thuật: khung, vùng A–F, khung tên, bảng kê chi tiết (systems), mây sửa đổi đỏ (NOW), mặt cắt với vật liệu riêng (stories), bảng sửa đổi + thước tỷ lệ (trace), ghi chú chung "Không đo trên bản vẽ". Nền sáng = in diazo; nền tối = blueprint. | Bản vẽ kỹ thuật (khung tên ISO 7200, đường tâm, đường phantom, ký hiệu hình chiếu) | `themes/a-drawing.html` |
| **B · GIS Workspace** | Trang chủ là một dự án GIS đang mở: bảng lớp = điều hướng, bản đồ = hero, thuộc tính dự án = NOW, bảng thuộc tính = systems/stories/trace, thanh trạng thái hiện toạ độ con trỏ, tỷ lệ, EPSG. Màu chọn vàng như QGIS. | Phần mềm GIS desktop (QGIS/ArcGIS), nhãn có viền halo | `themes/b-gis.html` |
| **C · Sổ hiện trường** | Cuốn sổ đo đạc chống nước: bìa vàng có nhãn viết tay, trang trái kẻ cột, trang phải ô lưới có phác hoạ, systems là băng nhãn in dập, mỗi story là một tờ giấy và màu mực riêng, trace là cây mia đo. | Sổ hiện trường của kỹ sư đo đạc, mia thuỷ chuẩn | `themes/c-fieldbook.html` |
| **D · Datasheet cơ điện tử** | Trang chủ là datasheet của linh kiện PA-001: mặt trước có Đặc điểm / Ứng dụng / Mô tả, dòng sản phẩm tiến hoá (robot dò đường → UAV → người máy + AI), sơ đồ chân DIP-10 làm menu (VCC ☕ = support, GND = gốc rễ, DREAM = người máy), sơ đồ khối vòng kín = cách giải quyết vấn đề, bảng đặc tính = NOW, bảng so sánh thiết bị = systems, mỗi story là một ghi chú ứng dụng với dạng sóng oscilloscope riêng, trace là giản đồ thời gian dạng bus (tương lai gạch chéo = chưa xác định). | Datasheet linh kiện điện tử, sơ đồ điều khiển vòng kín, oscilloscope | `themes/d-datasheet.html` |

 song ngữ VI/EN, quả địa cầu kéo xoay được, nội dung thật (không bịa), font đều có glyph tiếng Việt.

Nguồn mã: `themes/src/` (chạy `node docs/pharaoh-alone/themes/src/build.mjs` để ghép dữ liệu đất liền + engine globe vào từng trang).

Tham khảo: quy ước bản vẽ kỹ thuật/khung tên; thiết kế tiện dụng của McMaster-Carr (nhanh, gọn) cho phần Systems; phong cách bản đồ Thuỵ Sĩ (Imhof/swisstopo) cho cách dùng màu bản đồ; các bài viết về dấu hiệu "AI slop" (dark mode phát sáng, Inter, gradient tím).

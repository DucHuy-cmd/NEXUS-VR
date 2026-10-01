# NEXUS VR — Nội dung trang chủ (nguồn sự thật duy nhất)

> Dữ liệu sản phẩm là **hư cấu cho đồ án**, đồng bộ với `assets/js/data/products-data.js` và với 3 ảnh hero đang có.
> AI chỉ được dùng số liệu trong file này. Chỗ nào ghi `[CẦN ĐIỀN]` thì để trống, không tự bịa.
> Đặt file này tại `docs/home-content.md`.

---

## 0. Bảng sự thật sản phẩm

Đã chốt các chỗ mâu thuẫn cũ: **trọng lượng = 420 g** (theo `products-data.js`, bỏ "285 g"), **thân bọc vải dệt** (đúng với ảnh, bỏ "khung Titanium" vì ảnh không có), **bỏ "3.840 ppi" và "pin 4KWh"** vì sai.

| Mục | Giá trị |
|---|---|
| Tên | NEXUS Vision Pro 8K (id: `vr-001`) |
| Màn hình | 8K, 7680 × 3840 mỗi mắt |
| Tần số quét | 120 Hz |
| Trường nhìn (FOV) | 130° |
| Trọng lượng | 420 g |
| Thời lượng pin | 3,5 giờ liên tục |
| Kết nối | USB-C 3.2, Wi-Fi 6E, Bluetooth 5.3 |
| Chất liệu | Thân bọc vải dệt, dây đeo vải, khóa kim loại |
| Giá bán | 24.990.000₫ |
| Giá gốc | 28.500.000₫ (giảm 12%) |
| Kính so sánh | NEXUS Air Lite (`vr-002`): 12.490.000₫ — thông số còn lại lấy từ `products-data.js` |

**Giọng văn:** điềm tĩnh, chính xác, ngắn. Mỗi câu nói một sự thật cụ thể.
**Từ cấm:** kiệt tác, tuyệt tác, đỉnh cao, siêu, đột phá, thượng hạng, thế hệ mới, "không thể phân biệt với thực tại".

---

## 1. Ảnh: đã có gì

| File | Kích thước | Nền | Dùng cho |
|---|---|---|---|
| `assets/images/hero/hero-vr-headset-xam.webp` | 1400×931 | trong suốt | Hero, màu Xám |
| `assets/images/hero/hero-vr-headset-trangnau.webp` | 1440×954 | trong suốt | Màu Trắng Nâu |
| `assets/images/hero/hero-vr-headset-xanhcam.webp` | 1440×948 | trong suốt | Màu Xanh Cam |
| `assets/images/hero/person-vr.jpg` | 1024×1024 | ảnh người đeo | Phần "Đeo cả buổi" (nếu dùng) |

Cả 3 ảnh kính **cùng góc 3/4, cùng khung, nền trong suốt**: đã là một bộ đồng bộ, đổi qua lại không bị nhảy.

**Không cần chụp thêm ảnh cận cảnh** cho bản đầu. Dùng `object-fit: cover` + `object-position` để cắt từ ảnh hero:
- Chi tiết vải dệt: cắt vùng mặt trước (khoảng 60–100% ngang, 30–90% dọc).
- Chi tiết khóa dây: cắt vùng khóa kim loại (khoảng 40–55% ngang, 50–75% dọc).
- Chi tiết đường cong dây đeo: cắt vùng dây phía trên bên trái.

Hạn chế: ảnh 1440 px chỉ đủ nét ở khung không quá ~720 CSS px khi màn hình retina. Nếu muốn nét hơn, chạy Upscayl / Real-ESRGAN lên 2880 px rồi xuất WebP.

---

## 2. Nội dung từng phần (7 phần, đúng thứ tự này, không thêm)

### Phần 1 — Hero
- H1: `NEXUS Vision Pro`
- Câu phụ: `8K cho mỗi mắt. Thân bọc vải dệt. 420 g.`
- Nút chính: `Khám phá cửa hàng` → `shop.html`
- Nút phụ: `Đặt lịch trải nghiệm` → `contact.html`
- Ảnh: `hero-vr-headset-xam.webp` (nền trang: `--bg-primary`), kính đặt giữa, cao ~55vh
- Alt: `Kính NEXUS Vision Pro màu xám nhìn chếch 3/4`
- Hành vi: kính hiện dần + trượt lên ≤ 24px khi tải trang. Không preloader.

### Phần 2 — Tuyên bố
- Một dòng chữ rất lớn: `7680 × 3840 điểm ảnh cho mỗi mắt.`
- Dòng nhỏ bên dưới: `Chữ nhỏ vẫn đọc được. Đường thẳng vẫn thẳng.`
- Không có ảnh, không có khung, nền phẳng.

### Phần 3 — Ba điểm nổi bật (bố cục lệch, không phải 3 thẻ giống nhau)
| # | Số lớn | Nhãn | Câu mô tả | Ảnh (cắt từ) |
|---|---|---|---|---|
| 1 | `8K` | Màn hình | `7680 × 3840 mỗi mắt, cho chữ và đường nét sắc.` | mặt trước, `xam.webp` |
| 2 | `120 Hz` | Tần số quét | `Chuyển động mượt, giảm cảm giác chóng mặt khi quay đầu.` | dây đeo, `xam.webp` |
| 3 | `130°` | Trường nhìn | `Nhìn rộng tới mép, không thấy viền kính.` | khóa dây, `xam.webp` |

### Phần 4 — Khoảnh khắc cuộn (DUY NHẤT của cả trang)
- Kính ghim giữa màn hình. Khi cuộn, **đổi lần lượt Xám → Trắng Nâu → Xanh Cam** bằng cross-fade + scale 1 → 1,04.
- Chữ bên cạnh đổi theo: `Xám Than` / `Trắng Nâu` / `Xanh Cam`.
- Chỉ dùng 3 ảnh hero có sẵn. Chiều dài ghim: 250vh. Mobile: bỏ ghim, xếp dọc 3 ảnh.

### Phần 5 — Chọn màu
| Tên | Ảnh | Màu chấm (lấy từ ảnh) |
|---|---|---|
| Xám Than | `hero-vr-headset-xam.webp` | `#9F9FA1` |
| Trắng Nâu | `hero-vr-headset-trangnau.webp` | `#EFEBE5` |
| Xanh Cam | `hero-vr-headset-xanhcam.webp` | `#D9E0E9` |

- Ba chấm màu bấm được (có `aria-label`, điều khiển bằng phím mũi tên). Bấm thì ảnh đổi bằng cross-fade 350ms.
- Giá không đổi theo màu: `24.990.000₫`.

### Phần 6 — So sánh
Bảng 2 cột, các hàng giống nhau. Dữ liệu lấy từ `products-data.js` (vr-001, vr-002), **không gõ tay số vào HTML**.
Hàng: Màn hình, Tần số quét, FOV, Trọng lượng, Pin, Giá.

### Phần 7 — Sản phẩm + kêu gọi
- Tiêu đề: `Phụ kiện đi kèm`
- Lưới sản phẩm lấy từ `PRODUCTS` (không tạo card riêng).
- Nút cuối: `Xem toàn bộ cửa hàng` → `shop.html`

---

## 3. Ghép ảnh phụ kiện vào `products-data.js`

`products-data.js` đang trỏ tên file không tồn tại. Đổi sang file thật:

| Sản phẩm | images |
|---|---|
| `vr-001` | `hero-vr-headset-xam.webp`, `hero-vr-headset-trangnau.webp`, `hero-vr-headset-xanhcam.webp`, `person-vr.jpg` |
| `ctrl-001` | `ctrl-titanium.jpg`, `ctrl-champagne.jpg`, `ctrl-sport.jpg` |
| `acc-001` | `dock-titanium.jpg`, `dock-champagne.jpg`, `dock-silver.jpg` |
| (thêm nếu muốn) | `strap-*.jpg` (3 màu), `case-*.jpg` (3 màu) |

Đường dẫn tiền tố: `assets/images/products/`. Xóa các bản trùng ở thư mục gốc và `assets/images/hero/` trùng với `products/`.

---

## 4. Nguồn ảnh nếu muốn thêm

| Nhu cầu | Nguồn | Lưu ý |
|---|---|---|
| Model 3D kính VR để tự render | Sketchfab / Fab (lọc "Downloadable") | Giấy phép CC-BY bắt buộc ghi credit; chỉ CC0 thì không cần |
| Ánh sáng/HDRI khi render | Poly Haven | CC0 |
| Render ảnh | Blender (miễn phí) | Xuất PNG nền trong suốt, cùng góc 3/4 để khớp bộ hiện có |
| Nâng độ phân giải | Upscayl, Real-ESRGAN | Chạy trên ảnh hero hiện có |
| Ảnh người dùng | Ảnh tự chụp hoặc ảnh tạo bằng AI | Ghi rõ trong báo cáo đây là ảnh minh họa |

Nếu tạo thêm ảnh bằng AI: **dùng ảnh hero hiện có làm ảnh tham chiếu** và giữ cùng góc máy, cùng ánh sáng, nền trắng, để đồng bộ với bộ ảnh sẵn.

---

## 5. Quy tắc cho AI (dán cùng prompt)

1. Chỉ sửa `index.html`, `assets/css/pages/home.css`, `assets/js/controllers/home-controller.js`. Không sửa file khác.
2. Bỏ Three.js, canvas WebGL, preloader, HUD `[ ... // ... ]`, pill-badge, emoji.
3. Chỉ làm đúng 7 phần ở mục 2. Không thêm phần, không thêm số liệu.
4. Dùng token màu/easing/thời lượng trong `variables.css`, không hardcode.
5. Mọi trạng thái ẩn ban đầu chỉ áp dụng khi `<html>` có `fx-on`. Nội dung không bao giờ kẹt ẩn.
6. Tôn trọng `prefers-reduced-motion`: tắt ghim và cross-fade, hiện tĩnh.
7. Ảnh có `alt`, `width`/`height`, `loading="lazy"` (trừ ảnh hero), khung có `aspect-ratio`.
8. Xong phải chụp ảnh ở 390 px và 1440 px để báo cáo, và liệt kê file đã sửa.

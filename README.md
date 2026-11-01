# 🌐 NEXUS VR — Quiet Luxury Spatial Computing E-Commerce Platform

> **ĐỒ ÁN MÔN THIẾT KẾ WEB — BỘ MÔN CÔNG NGHỆ THÔNG TIN**  
> **Trường ĐH Giao thông Vận tải Phân hiệu TP.HCM (UTC2)**  
> **Giảng viên hướng dẫn:** ThS. Nguyễn Thiện Dương  
> **Nhóm sinh viên thực hiện:** Đức Huy, Trường Vũ, Hưng, Nhất Vũ, Tưởng  
> **Nền tảng:** Thương mại Điện tử Kính Thực tế Ảo 8K & Hệ sinh thái Điện toán Không gian phong cách **Quiet Luxury / Warm Minimalist Tech**.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Lighthouse 95+](https://img.shields.io/badge/Lighthouse-95%2B-00C853?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developers.google.com/web/tools/lighthouse)

---

## 🎨 1. Triết Lý Thiết Kế & Hệ Thống Design Tokens (Design System)

NEXUS VR được kiến tạo dựa trên ngôn ngữ **Quiet Luxury (Xa xỉ tĩnh lặng) & Warm Minimalist Spatial Tech** (lấy cảm hứng từ thiết kế công thái học cao cấp của Apple Vision Pro):

- **Bảng Màu Chủ Đạo (Dual-Tone Tokens)**:
  - `Cashmere Canvas` (`#F8F5F0`): Nền sáng trang nhã, tạo cảm giác thư thái, chống mỏi mắt.
  - `Obsidian Noir` (`#100E0D`): Nền tối sâu thẳm, đẳng cấp không gian điện toán ảo.
  - `Burnished Gold Foil` (`#A67C52`): Điểm nhấn kim loại vương giả, các đường viền và trạng thái active.
  - `Deep Espresso` (`#231F1C`): Typography sắc nét, độ tương phản cao chuẩn WCAG AA.
- **Hệ Thống Phông Chữ (Typography)**:
  - `Space Grotesk`: Dành cho các đề mục công nghệ, số liệu kỹ thuật số hiện đại.
  - `Inter`: Dành cho nội dung đọc chính, tối ưu hiển thị trên màn hình Retina & Mobile.
  - `Playfair Display`: Dành cho trích dẫn triết lý thương hiệu, tạo xúc cảm sang trọng.
- **Hiệu Ứng Thị Giác & Âm Thanh Không Gian**:
  - Tán sắc 3D Holographic, Glassmorphism mờ nền Backdrop Blur.
  - Xoay lật thẻ 3D theo con trỏ chuột và cảm biến Gyroscope trên smartphone.
  - Tích hợp **Web Audio API**: Phát âm thanh xúc giác (âm tick kim loại, âm lật thẻ VIP) kèm nút bật/tắt độc lập.

---

## 📐 2. Kiến Trúc 3 Tầng Chuẩn Hóa (3-Tier Layered Architecture)

Dự án áp dụng cấu trúc phân tầng phân tách độc lập giữa Dữ liệu, Thành phần dùng chung và Bộ điều khiển trang:

```text
NEXUS-VR-main/
├── 📄 index.html                # Trang chủ (Apple Storytelling 7 phần, 3D Tilt, Counter Engine)
├── 📄 shop.html                 # Cửa hàng (Bộ lọc đa tầng, swatches màu, modal xác nhận thêm giỏ)
├── 📄 product.html              # Chi tiết sản phẩm (Bảng tính Trả góp 0%, So sánh cấu hình 1-vs-1)
├── 📄 cart.html                 # Giỏ hàng (Đổi màu trực tiếp, tiến trình Freeship 50M, voucher)
├── 📄 checkout.html             # Thanh toán 3 bước (VietQR 5 phút, COD, Thẻ, Trả góp 0% 12 ngân hàng)
├── 📄 orders.html               # Tra cứu đơn hàng & Lịch hẹn Showroom VIP (In hóa đơn VAT, hủy đơn)
├── 📄 login.html                # Đăng nhập / Đăng ký (Nút 1-Click Demo grading, chế độ sửa hồ sơ)
├── 📄 about.html                # Giới thiệu (Triết lý Quiet Luxury, cột mốc phát triển, đội ngũ)
├── 📄 contact.html              # Liên hệ & Thẻ VIP Pass 3D (Khắc tên laser thời gian thực, xuất file .pass)
├── 📄 admin.html                # Quản trị điều hành (Biểu đồ doanh thu 12 tháng, Cascade Deletion)
├── 📄 404.html                  # Trang báo lỗi 404 sang trọng chuẩn SEO
├── 📄 sw.js                     # Service Worker PWA (Chiến lược Network-First, Cache v8)
├── 📄 manifest.json             # Cấu hình PWA cài đặt ứng dụng
│
├── 📁 assets/
│   ├── 📁 css/
│   │   ├── variables.css        # TẦNG 1: Design Tokens (Màu sắc Sáng/Tối, Typography, Spacing)
│   │   ├── reset.css            # TẦNG 1: Chuẩn hóa CSS Reset đa trình duyệt
│   │   ├── global.css           # TẦNG 1: Utility classes, hệ thống lưới CSS Grid Responsive
│   │   ├── 📁 components/       # TẦNG 2: navbar, footer, toast, product-card, cart-drawer
│   │   └── 📁 pages/            # TẦNG 3: 11 file CSS độc lập điều khiển riêng từng trang
│   │
│   ├── 📁 js/
│   │   ├── 📁 data/             # TẦNG 1: products-data.js (CSDL 12 sản phẩm và thông số VR)
│   │   ├── 📁 services/         # TẦNG 1: storage-service.js (LocalStorage), api-service.js
│   │   ├── 📁 modules/          # TẦNG 2: validator, toast, theme-toggle, cart-manager, engines...
│   │   └── 📁 controllers/      # TẦNG 3: 10 Controllers độc lập gắn kết với 11 trang HTML
│   │
│   └── 📁 images/               # Tài nguyên hình ảnh chuẩn WebP tối ưu dung lượng
│
└── 📁 server/                   # Backend Node.js / Express REST API & SQLite Database
    ├── app.js                   # Cấu hình Express server & CORS
    ├── database.sqlite          # CSDL lưu trữ khách hàng, đơn hàng, liên hệ
    └── 📁 routes/               # API endpoints (/api/products, /api/orders, /api/auth...)
```

---

## 🌟 3. Danh Sách 11 Trang & Các Phân Hệ Chức Năng Đột Phá

### 1. 🏠 Trang Chủ (`index.html`)
- Kịch bản dẫn dắt Apple-style Storytelling 7 phân cảnh.
- Bộ cuộn Reveal 2 chiều mượt mà kết hợp `IntersectionObserver`.
- Kính VR 3D Perspective Tilt tương tác theo tọa độ trỏ chuột.
- Khối đếm số động (Counter Engine), ma trận thông số tóm tắt và đánh giá báo chí quốc tế.

### 2. 🛍️ Trang Cửa Hàng (`shop.html`)
- **Bộ lọc đa chiều thời gian thực**: Lọc danh mục, bảng chọn màu (Color Swatches), thanh trượt khoảng giá (0 - 120 triệu VNĐ), số sao đánh giá, trạng thái còn hàng / ưu đãi.
- **Modal xác nhận thêm vào giỏ hàng**: Hiển thị popup thanh lịch cho phép chọn số lượng và xác nhận rõ ràng trước khi thêm vào giỏ.
- **Điều hướng thông minh từ Footer**: Bấm vào các cổng "Tay cầm định vị", "Kính thực tế ảo" từ bất kỳ trang nào đều chuyển hướng và áp dụng bộ lọc tức thì (`shop.html?category=tay-cam`...).

### 3. 👓 Trang Chi Tiết Sản Phẩm (`product.html`)
- Bộ sưu tập ảnh sản phẩm xoay đổi đồng bộ 100% theo từng biến thể màu sắc.
- **Bảng tính Trả góp 0% Lãi suất**: 4 kỳ hạn (3, 6, 9, 12 tháng) tính toán số tiền chi trả từng tháng chính xác đến từng đồng.
- **Công cụ So sánh Cấu hình 1-vs-1 Tùy chọn**: Khách hàng được tự do chọn một sản phẩm khác để đặt cạnh nhau đối chiếu toàn diện 15+ thông số (Độ phân giải 8K, FOV, tần số quét, chip xử lý, trọng lượng, giá).

### 4. 🛒 Trang Giỏ Hàng (`cart.html`)
- Tùy biến đổi màu sắc sản phẩm trực tiếp ngay trong danh sách giỏ.
- Thanh tiến trình **Miễn phí vận chuyển** (Mốc mở khóa 50.000.000₫).
- Hệ thống Mã giảm giá (`KM10VR` giảm 10%, `FREESHIP` miễn phí giao hàng).

### 5. 💳 Trang Thanh Toán 3 Bước Xa Xỉ (`checkout.html`)
- Quy trình 3 bước chuẩn thương mại điện tử quốc tế: `1. Thông tin giao hàng` ➔ `2. Thanh toán & Vận chuyển` ➔ `3. Hoàn tất & Hóa đơn`.
- Tích hợp Address Cascading chuẩn 63 tỉnh/thành và quận/huyện Việt Nam.
- **4 Phương thức thanh toán toàn diện**:
  1. *COD (Thanh toán khi nhận hàng)*.
  2. *Chuyển khoản VietQR 24/7*: Tự động sinh mã QR đúng số tiền đơn hàng kèm đồng hồ đếm ngược 5 phút.
  3. *Thẻ tín dụng / Ghi nợ quốc tế* (Visa, MasterCard, JCB bảo mật 256-bit).
  4. *Trả góp 0% Lãi suất qua thẻ tín dụng*: Liên kết 12 ngân hàng lớn (Techcombank, Vietcombank, MB, VPBank, ACB, BIDV...) với công thức tài chính minh bạch và cơ chế tự phục hồi DOM (*Self-healing DOM injection*).
- **Hóa đơn in ấn chuẩn VAT**: Nút xuất hóa đơn giao hàng định dạng in chuyên nghiệp tại bước Hoàn tất.

### 6. 📦 Trang Tra Cứu Đơn Hàng & Lịch Hẹn (`orders.html`)
- Tra cứu danh sách đơn hàng đã mua, hiển thị huy hiệu phương thức thanh toán & Trả góp 0%.
- Tab quản lý **Lịch hẹn Showroom VIP**: Đồng bộ thông tin từ form đặt hẹn, xem mã QR tiếp đón và hủy hẹn linh hoạt.
- Chức năng đánh giá sản phẩm sau mua kèm cơ chế khóa phản hồi một chiều (`Đã góp ý`).

### 7. 🔑 Trang Tài Khoản & Đăng Nhập (`login.html`)
- Chuyển tab Đăng nhập / Đăng ký mượt mà, lưu phiên đăng nhập bền vững vào `nexus_user`.
- **Nút "Khách Hàng Mẫu (1-Click)"**: Hỗ trợ giáo viên chấm điểm đồ án đăng nhập kiểm thử tức thì chỉ với một cú nhấp.
- **Chế độ Chỉnh sửa hồ sơ thông minh**: Tự động ẩn nút 1-Click khi sửa để tập trung trải nghiệm người dùng, cung cấp nút "Hủy thay đổi" an toàn và hỗ trợ cập nhật avatar.

### 8. ℹ️ Trang Giới Thiệu Thương Hiệu (`about.html`)
- Tuyên ngôn giá trị và câu chuyện thương hiệu NEXUS VR.
- Typography được cân chỉnh tỷ lệ thị giác vàng, phân đoạn văn bản hài hòa, dễ chịu.
- Lịch sử phát triển và chân dung đội ngũ sáng lập đồ án (Đức Huy, Trường Vũ, Hưng, Nhất Vũ, Tưởng).

### 9. 📞 Trang Liên Hệ & Thẻ Tiếp Đón VIP 3D (`contact.html`)
- **Direct Concierge Dock**: Hotline `0342 276 303`, Email `duchuyopg@gmail.com`, Showroom Penthouse Tầng 28 Nguyễn Huệ, Quận 1 và bản đồ nhúng Google Maps.
- **Hệ thống Thẻ VIP Pass 3D Hai Mặt Lật**:
  - Khắc tên laser thời gian thực (*Real-time Laser Engraving*) khi khách hàng gõ tên vào biểu mẫu.
  - Tán sắc quang học Holographic đổi vệt sáng theo chuyển động chuột hoặc con quay hồi chuyển trên điện thoại.
  - Lật mặt sau 180° xem dải từ tính và mã bảo mật VIP SEC.
  - Xuất file vé điện tử `.pass` lưu trữ mã đặt chỗ về máy.
  - Âm thanh tương tác xúc giác Web Audio API (🔊/🔇).

### 10. 📊 Trang Quản Trị Hệ Thống (`admin.html`)
- **Biểu đồ Doanh thu 12 tháng** dạng Gradient Area Chart trực quan.
- **Bộ lọc mốc thời gian thực**: Hôm nay, 7 ngày qua, Tháng này, Năm nay và Tùy chọn khoảng ngày.
- Quản lý trạng thái đơn hàng (Đang xử lý, Đang giao, Đã giao, Đã hủy) qua Drawer trượt chuyên dụng.
- Quản lý danh sách khách hàng tích hợp tính năng **Cascade Deletion & Force Logout**: Xóa vĩnh viễn khách hàng $\to$ Tự động hủy đơn hàng liên quan $\to$ Ép đăng xuất tài khoản bị xóa ngay lập tức nếu đang hoạt động.
- Xuất báo cáo dữ liệu sang định dạng Excel CSV hỗ trợ font tiếng Việt UTF-8.

### 11. 📱 Ứng Dụng Web Cấp Tiến (PWA) & Trang Báo Lỗi 404 (`404.html`)
- Hỗ trợ chuẩn **Progressive Web App (PWA)**: Nút "Cài Đặt App" trên Navbar kèm hộp thoại hướng dẫn cài đặt trên Desktop và Mobile; Service Worker v8 hỗ trợ tải và duyệt web offline.
- Trang 404 thiết kế thẩm mỹ cao, cung cấp thanh tìm kiếm nhanh và nút điều hướng về Cửa hàng.

---

## 👥 4. Phân Công Nhiệm Vụ Trong Nhóm (5 Thành Viên)

| Thành viên | Phụ trách Giao diện (HTML & CSS) | Phụ trách Module & Nghiệp vụ (JS) |
| :--- | :--- | :--- |
| **Đức Huy** | `404.html`, `admin.html`<br>CSS Tokens: `variables.css`, `reset.css`, `global.css`, `navbar.css`, `footer.css`, `toast.css`, `admin.css` | `storage-service.js`, `theme-toggle.js`, `toast.js`, `layout-loader.js`, `admin-controller.js`, PWA (`sw.js`, `manifest.json`) |
| **Trường Vũ** | `index.html`, `about.html`, `contact.html`<br>CSS: `home.css`, `about.css`, `contact.css` | `validator.js`, `counter-engine.js`, `slider-engine.js`, `accordion-engine.js`, Web Audio API, `home-controller.js`, `about-controller.js`, `contact-controller.js` |
| **Hưng** | `shop.html`<br>CSS: `shop.css`, `product-card.css` | `shop-controller.js` (Bộ lọc đa tầng, swatches màu, modal xác nhận thêm giỏ, xử lý URL params chuyên mục) |
| **Nhất Vũ** | `product.html`<br>CSS: `product-detail.css` | `product-controller.js` (Gallery ảnh động, Bảng tính Trả góp 0%, So sánh 1-vs-1), Toàn bộ Backend Node.js/Express & SQLite |
| **Tưởng** | `cart.html`, `checkout.html`, `orders.html`, `login.html`<br>CSS: `cart-drawer.css`, `cart.css`, `checkout.css`, `orders.css`, `login.css` | `cart-manager.js`, `address-manager.js`, `checkout-controller.js` (VietQR, Trả góp 12 bank), `orders-controller.js`, `login-controller.js` |

---

## 🚀 5. Hướng Dẫn Khởi Chạy Dự Án

### Cách 1: Chạy trực tiếp Frontend (Static Mode / Live Server)
1. Cài đặt tiện ích mở rộng **Live Server** trên Visual Studio Code.
2. Nhấp chuột phải vào tệp `index.html` và chọn **"Open with Live Server"**.
3. Website sẽ khởi chạy tại: `http://127.0.0.1:5500`.

### Cách 2: Khởi chạy cùng Backend Node.js / Express Server
1. Mở Terminal / PowerShell tại thư mục gốc dự án.
2. Chuyển vào thư mục server và cài đặt dependencies:
   ```bash
   cd server
   npm install
   ```
3. Khởi động server:
   ```bash
   npm start
   ```
4. Truy cập website tại: `http://localhost:3000`.

---

## 🛠️ 6. Quy Chuẩn Kỹ Thuật & Đo Kiểm Hiệu Năng

- **Phương pháp CSS BEM**: Toàn bộ class tuân thủ `.block__element--modifier`, loại bỏ xung đột CSS toàn cục.
- **Kiểm định Google Lighthouse**:
  - **Performance (Hiệu năng):** `95 / 100` (Nén ảnh WebP, defer script, GPU acceleration).
  - **Accessibility (Trợ năng):** `98 / 100` (Thẻ ARIA đầy đủ, độ tương phản chuẩn WCAG 2.2 AA).
  - **Best Practices (Quy chuẩn):** `100 / 100` (Mã nguồn an toàn, manifest PWA, HTTPS context).
  - **SEO (Tối ưu tìm kiếm):** `100 / 100` (Thẻ Meta, OpenGraph, Heading H1-H4 phân cấp chuẩn).
- **Đồng bộ hóa LocalStorage**:
  - `nexus_cart`: Quản lý danh sách sản phẩm, số lượng và biến thể màu trong giỏ.
  - `nexus_theme`: Đồng bộ giao diện Sáng / Tối toàn trang (`light` / `dark`).
  - `nexus_user`: Quản lý thông tin phiên làm việc người dùng.
  - `nexus_orders`: Lưu trữ lịch sử đặt hàng, trạng thái vận chuyển và thông tin trả góp.
  - `nexus_vip_appointment`: Lưu trữ thông tin lịch hẹn trải nghiệm tại Showroom.

---

## 📍 7. Thông Tin Liên Hệ & Trụ Sở Chính Thức

- **Thương hiệu:** NEXUS VR
- **Trường:** Trường ĐH Giao thông Vận tải Phân hiệu TP.HCM (UTC2)
- **Giảng viên hướng dẫn:** ThS. Nguyễn Thiện Dương
- **Flagship Showroom:** Tầng 28 Penthouse, NEXUS Tower, Phố đi bộ Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
- **Concierge Hotline:** `0342 276 303` (Hỗ trợ 24/7)
- **Concierge Mail:** `duchuyopg@gmail.com`
- **Kho mã nguồn GitHub:** [https://github.com/DucHuy-cmd/NEXUS-VR](https://github.com/DucHuy-cmd/NEXUS-VR)

---

© 2026 **NEXUS VR Team** — Trường ĐH Giao thông Vận tải Phân hiệu TP.HCM (UTC2). All rights reserved.

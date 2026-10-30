# 🌐 NEXUS VR — Quiet Luxury Spatial Computing E-Commerce Platform

> **Đồ Án Môn Thiết Kế Web**  
> Website Thương mại Điện tử Kính Thực tế Ảo 8K & Thiết bị Điện toán Không gian mang phong cách **Quiet Luxury / Warm Minimalist Tech**.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

---

## 🎨 1. Triết Lý Thiết Kế & Thẩm Mỹ (Design System)

NEXUS VR được thiết kế dựa trên ngôn ngữ **Quiet Luxury / Warm Minimalist Tech** (lấy cảm hứng từ Apple Vision Pro & kiến trúc cao cấp):

- **Bảng Màu Chủ Đạo (Color Palette)**:
  - `Warm Beige` (`#F9F6F0`): Nền canvas trang nhã, giảm mỏi mắt.
  - `Deep Espresso` (`#231F1C`): Màu chữ chính & thẻ nổi bật.
  - `Bronze Gold` (`#A67C52`): Điểm nhấn sang trọng, nút bấm & chỉ số.
  - `Cashmere & Off-white`: Các mảng phân tách nội dung mềm mại.
- **Phông Chữ (Typography)**:
  - `Space Grotesk`: Dành cho các tiêu đề (Headings), mang nét hiện đại, công nghệ cao.
  - `Inter`: Dành cho văn bản nội dung (Body text), tối ưu khả năng đọc trên màn hình retina.
- **Hiệu Ứng Thị Giác (Visual Effects)**:
  - Glassmorphism (Kính mờ bóng bẩy), 3D Mouse Perspective Tilt, Web Audio API Sound Synthesis (Âm thanh xúc giác khi lật thẻ VIP).
  - Reveal-on-scroll (Cuộn 2 chiều: hiện khi cuộn xuống, ẩn nhẹ khi cuộn ngược).

---

## 📐 2. Kiến Trúc 3 Tầng (3-Tier Layered Architecture)

Dự án áp dụng mô hình phân tầng chặt chẽ, tách biệt giữa dữ liệu, thành phần dùng chung và điều khiển trang:

```text
BT_LON_WEB/
├── 📄 index.html                # Trang chủ (Apple Style 7 phần storytelling)
├── 📄 shop.html                 # Trang Cửa hàng (Bộ lọc đa năng & chọn màu trực tiếp)
├── 📄 product.html              # Trang Chi tiết sản phẩm (Dynamic gallery & tabs thông số)
├── 📄 cart.html                 # Trang Giỏ hàng (Đổi màu sản phẩm, tiến trình freeship, voucher)
├── 📄 checkout.html             # Trang Thanh toán 3 bước (VietQR, COD, Credit Card)
├── 📄 login.html                # Trang Đăng nhập / Đăng ký tài khoản
├── 📄 about.html                # Trang Giới thiệu (Hành trình, triết lý thiết kế & đội ngũ)
├── 📄 contact.html              # Trang Liên hệ (Showroom Map & Thẻ VIP Pass 3D 2 mặt)
├── 📄 404.html                  # Trang báo lỗi 404 chuẩn SEO
│
├── 📁 assets/
│   ├── 📁 css/
│   │   ├── variables.css        # TẦNG 1: Design Tokens (Biến màu, phông chữ, khoảng cách)
│   │   ├── reset.css            # TẦNG 1: Chuẩn hóa CSS Reset
│   │   ├── global.css           # TẦNG 1: Quy tắc chung & Utilities
│   │   ├── 📁 components/       # TẦNG 2: navbar, footer, toast, product-card, cart-drawer
│   │   └── 📁 pages/            # TẦNG 3: CSS riêng biệt cho từng trang
│   │
│   ├── 📁 js/
│   │   ├── 📁 data/             # TẦNG 1: products-data.js (Dữ liệu sản phẩm & màu sắc chuẩn)
│   │   ├── 📁 services/         # TẦNG 1: storage-service.js, api-service.js
│   │   ├── 📁 modules/          # TẦNG 2: validator, counter, slider, accordion, cart-manager, layout-loader
│   │   ├── 📁 vendors/          # Vendors offline fallback (GSAP, ScrollTrigger)
│   │   └── 📁 controllers/      # TẦNG 3: Logic điều khiển riêng từng trang
│   │
│   └── 📁 images/               # Kho tài nguyên ảnh WebP/JPG sản phẩm & không gian
│
└── 📁 server/                   # Backend Node.js / Express REST API Server
    ├── app.js                   # Server khởi tạo Express & middleware
    └── 📁 routes/               # API endpoints (Sản phẩm, Giỏ hàng, Đơn hàng, Liên hệ)
```

---

## 🌟 3. Các Trang & Tính Năng Nổi Bật

### 🏠 1. Trang Chủ (`index.html`)
- Dựng 7 phần chuẩn Apple Storytelling.
- Bộ cuộn Reveal 2 chiều tích hợp `IntersectionObserver` & GSAP Fallback.
- Trình xem kính 3D Tilt theo tọa độ con trỏ chuột.
- Bảng so sánh thông số kĩ thuật trực quan & Hệ sinh thái phụ kiện cao cấp.

### 🛍️ 2. Trang Cửa Hàng (`shop.html`)
- Bộ lọc đa tiêu chí thời gian thực: Danh mục, Tùy chọn màu sắc (Color chips), Thanh trượt khoảng giá (0 - 100M VND), Đánh giá sao, Tình trạng còn hàng / Sale.
- Tìm kiếm theo từ khóa tên & mô tả sản phẩm.
- **Interactive Product Card Swatches**: Click đổi màu trực tiếp trên thẻ sản phẩm (tự đổi ảnh xem trước & truyền đúng biến thể màu vào giỏ hàng).

### 👓 3. Trang Chi Tiết Sản Phẩm (`product.html`)
- Bộ sưu tập ảnh sản phẩm liên kết 1-1 với từng biến thể màu sắc.
- Hệ thống Tab thông số kỹ thuật chi tiết, đánh giá người dùng & đề xuất sản phẩm liên quan.

### 🛒 4. Trang Giỏ Hàng (`cart.html`)
- Cho phép đổi biến thể màu sắc trực tiếp ngay trong danh sách giỏ hàng.
- Thanh tiến trình **Miễn phí vận chuyển** (Mốc 50.000.000₫).
- Hệ thống Mã giảm giá (`KM10VR`, `FREESHIP`) tính toán chiết khấu tự động.
- Đề xuất phụ kiện mua kèm một chạm.

### 💳 5. Trang Thanh Toán (`checkout.html`)
- Quy trình 3 bước chuẩn E-commerce: `1. Giao hàng` ➔ `2. Thanh toán` ➔ `3. Hoàn tất`.
- Tích hợp 3 phương thức: **VietQR** (Mã QR động có số tiền), COD (Tiền mặt), Thẻ quốc tế.
- Tóm tắt đơn hàng & hiển thị đúng biến thể màu sắc đã chọn.

### 🔑 6. Trang Đăng Nhập / Đăng Ký (`login.html`)
- Chuyển tab Đăng nhập / Đăng ký mượt mà.
- Lưu phiên làm việc người dùng (`nexus_user`) và đồng bộ trạng thái trên Navbar.

### ℹ️ 7. Trang Giới Thiệu (`about.html`)
- Câu chuyện thương hiệu NEXUS VR.
- Timeline 3 cột mốc lịch sử phát triển (2024, 2025, 2026).
- 3 Nguyên tắc thiết kế Quiet Luxury & Thẻ thông tin đội ngũ thực hiện đồ án.

### 📞 8. Trang Liên Hệ (`contact.html`)
- Concierge Header & Direct Contact Dock (Hotline, Email, Showroom Address + Google Maps Embed).
- Form đặt lịch trải nghiệm tích hợp bộ kiểm định `validator.js`.
- **Thẻ VIP Pass 3D 2 mặt lật**: Mô phỏng khắc tên laser thời gian thực khi gõ tên + Âm thanh lật thẻ báo chí chân thực qua Web Audio API.

---

## 👥 4. Phân Công Nhiệm Vụ Trong Nhóm

| Thành viên | Phụ trách Trang (HTML) | Phụ trách Giao diện (CSS) | Phụ trách Logic & Module (JS) |
|---|---|---|---|
| **Đức Huy** | `404.html` | `variables.css`, `reset.css`, `global.css`, `navbar.css`, `footer.css`, `toast.css` | `storage-service.js`, `theme-toggle.js`, `toast.js`, `layout-loader.js` |
| **Trường Vũ** | `index.html`, `about.html`, `contact.html` | `home.css`, `about.css`, `contact.css` | `validator.js`, `counter-engine.js`, `slider-engine.js`, `accordion-engine.js`, các Controllers tương ứng |
| **Hưng** | `shop.html` | `shop.css`, `product-card.css` (Chủ trì) | `shop-controller.js` (Bộ lọc & chọn màu thẻ) |
| **Nhất Vũ** | `product.html` | `product-detail.css` | `api-service.js`, `product-controller.js`, Toàn bộ Backend Node.js/Express (`server/`) |
| **Tường** | `cart.html`, `checkout.html`, `login.html` | `cart-drawer.css`, `cart.css`, `checkout.css`, `login.css` | `cart-manager.js`, `cart-controller.js`, `checkout-controller.js`, `login-controller.js` |

---

## 🚀 5. Hướng Dẫn Khởi Chạy Dự Án

### Cách 1: Chạy trực tiếp Frontend (Static Mode)
1. Cài đặt Extension **Live Server** trong Visual Studio Code.
2. Nhấp chuột phải vào file `index.html` chọn **"Open with Live Server"**.
3. Ứng dụng sẽ chạy tại địa chỉ: `http://127.0.0.1:5500`.

### Cách 2: Khởi chạy cùng Backend Node.js / Express Server
1. Mở cửa sổ Terminal / CMD tại thư mục gốc của dự án.
2. Di chuyển vào thư mục server và cài đặt phụ thuộc:
   ```bash
   cd server
   npm install
   ```
3. Khởi chạy Server:
   ```bash
   npm start
   ```
4. Mở trình duyệt và truy cập: `http://localhost:3000`.

---

## 🛠️ 6. Quy Chuẩn Kỹ Thuật (Coding Standards)

- **CSS**: Tuân thủ đặt tên theo phương pháp **BEM** (`.block__element--modifier`), sử dụng 100% CSS Variables từ `variables.css`.
- **JavaScript**: Viết theo chuẩn ES6+, Modular Pattern, đặt tên `camelCase`, không sử dụng `alert()` (thay bằng Toast Notification), tương thích Accessibility (WCAG AA).
- **LocalStorage Keys**:
  - `nexus_cart`: Lưu trữ danh sách giỏ hàng & biến thể màu.
  - `nexus_wishlist`: Lưu danh sách sản phẩm yêu thích.
  - `nexus_theme`: Lưu chế độ giao diện Sáng/Tối.
  - `nexus_user`: Lưu thông tin phiên đăng nhập.

---

© 2026 **NEXUS VR Team**. All rights reserved.

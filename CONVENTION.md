# NEXUS VR — Quy chuẩn code chung (đọc trước khi code)

## 1. Cấu trúc thư mục

```
BT_LON_WEB/
├── index.html  shop.html  product.html  cart.html  checkout.html
├── about.html  contact.html  login.html  404.html
├── README.md  CONVENTION.md
├── .agent/rules/nexus.md
├── docs/  ROADMAP.md  home-content.md  STATE.md  AUDIT-JS.md
├── assets/
│   ├── css/
│   │   ├── variables.css, reset.css, global.css
│   │   ├── components/ (navbar, footer, toast, product-card, cart-drawer)
│   │   └── pages/ (home, shop, product-detail, cart, checkout, login, about, contact, 404)
│   ├── js/
│   │   ├── data/ (products-data.js)
│   │   ├── services/ (storage-service.js, api-service.js)
│   │   ├── modules/ (layout-loader.js, toast.js, validator.js, cart-manager.js...)
│   │   ├── controllers/ (home-controller.js, shop-controller.js, product-controller.js...)
│   │   └── vendors/ (gsap.min.js, ScrollTrigger.min.js)
│   └── images/
└── server/ (app.js, routes/api-contact.js)
```

## 2. Thư viện & Công nghệ
- **Công nghệ**: HTML5, CSS thuần, JavaScript thuần (script thường, không bundler).
- **Thư viện được phép**: GSAP + ScrollTrigger (đặt offline tại `assets/js/vendors/`). Tuyệt đối không nạp script từ CDN bên ngoài (trừ Google Fonts).
- **Cấm**: TailwindCSS, Bootstrap, React, Vue, Three.js, Barba.js, Lenis ngoại trừ khi có yêu cầu đặc biệt.

## 3. Quy ước Đặt tên
- **Class CSS**: theo chuẩn BEM — `.block__element--modifier`
  - Đúng: `.product-card__title`, `.btn-primary--disabled`
  - Sai: `.productCardTitle`, `.box1`, `.left-side-thing`
- **Biến/hàm JavaScript**: camelCase
  - Đúng: `getCartCount()`, `isLoggedIn`, `productList`
  - Sai: `get_cart_count()`, `IsLoggedIn`, `list1`
- **File**: kebab-case — `product-detail.css`, `home-controller.js`

## 4. Mỗi trang HTML nhúng theo đúng thứ tự

```html
<head>
  <link rel="stylesheet" href="assets/css/variables.css">
  <link rel="stylesheet" href="assets/css/reset.css">
  <link rel="stylesheet" href="assets/css/global.css">
  <link rel="stylesheet" href="assets/css/components/navbar.css">
  <link rel="stylesheet" href="assets/css/components/footer.css">
  <link rel="stylesheet" href="assets/css/pages/ten-trang.css">
</head>
<body data-page="home">
  <div id="navbar-root"></div>

  <!-- nội dung trang -->

  <div id="footer-root"></div>

  <script src="assets/js/data/products-data.js"></script>
  <script src="assets/js/services/storage-service.js"></script>
  <script src="assets/js/modules/toast.js"></script>
  <script src="assets/js/modules/layout-loader.js"></script>
  <script src="assets/js/controllers/ten-trang-controller.js"></script>
</body>
```

`data-page` tương ứng: `home`, `shop`, `product`, `cart`, `checkout`, `login`, `about`, `contact`, `404`.

## 5. Quy tắc không được vi phạm

- Không hardcode mã màu — luôn dùng biến `var(--bg-primary)`, `var(--text-primary)...` khai báo trong `variables.css`.
- Không dùng `alert()` — dùng `showToast("nội dung", "success" | "error" | "info")`.
- Không tự đổi field trong `products-data.js` khi chưa thống nhất.
- Không tự đặt key `localStorage` khác — chỉ dùng: `nexus_cart`, `nexus_wishlist`, `nexus_theme`, `nexus_user`.
- Mọi thẻ `<img>` phải có `alt`, `width`/`height` và fallback `onerror`.

## 6. Trước khi nghiệm thu code

- [ ] Đã test trên trình duyệt
- [ ] Không còn `console.log()` thừa
- [ ] Không còn `alert()`
- [ ] Ảnh có `onerror` fallback
- [ ] Đặt tên class/biến đúng chuẩn ở mục 3


# NEXUS VR — Quy chuẩn code chung (đọc trước khi code)

## 1. Cấu trúc thư mục

```
nexus-vr/
├── index.html
├── shop.html
├── product.html
├── cart.html
├── checkout.html
├── about.html
├── blog.html
├── blog-post.html
├── contact.html
├── login.html
├── 404.html
├── css/
│   ├── style.css        ← dùng chung, KHÔNG sửa nếu không phải Huy
│   ├── shop.css          ← CSS riêng cho từng trang, người phụ trách tự tạo
│   ├── product.css
│   └── ...
├── js/
│   ├── data.js           ← dùng chung, KHÔNG sửa cấu trúc nếu chưa thống nhất
│   ├── toast.js           ← dùng chung
│   ├── shared.js          ← dùng chung (Navbar/Footer/theme/search)
│   ├── shop.js             ← JS riêng từng trang
│   ├── product.js
│   └── ...
├── images/
│   ├── products/
│   ├── blog/
│   └── placeholder.svg
├── server/                ← Backend của Nhất Vũ (Node/Express/SQLite)
├── .env                   ← KHÔNG push lên Git
└── .gitignore
```

## 2. Đặt tên

- **Class CSS**: theo chuẩn BEM — `.block__element--modifier`
  - Đúng: `.product-card__title`, `.btn-primary--disabled`
  - Sai: `.productCardTitle`, `.box1`, `.left-side-thing`
- **Biến/hàm JavaScript**: camelCase
  - Đúng: `getCartCount()`, `isLoggedIn`, `productList`
  - Sai: `get_cart_count()`, `IsLoggedIn`, `list1`
- **File**: kebab-case — `blog-post.html`, `product-card.js`

## 3. Mỗi trang HTML nhúng theo đúng thứ tự

```html
<head>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/ten-trang.css">  <!-- nếu có -->
</head>
<body data-page="shop">
  <div id="navbar-root"></div>

  <!-- nội dung trang -->

  <div id="footer-root"></div>

  <script src="js/data.js"></script>
  <script src="js/toast.js"></script>
  <script src="js/shared.js"></script>
  <script src="js/ten-trang.js"></script>  <!-- nếu có -->
</body>
```

`data-page` phải khớp với `data-nav` trong `shared.js`: `home`, `shop`, `about`, `blog`, `contact`.

## 4. Không được làm

- Không hardcode mã màu (`#0a0a0f`...) — luôn dùng biến `var(--bg-primary)` khai báo trong `css/style.css`
- Không dùng `alert()` — dùng `showToast("nội dung", "success" | "error" | "info")`
- Không tự thêm/đổi field trong `data.js` khi chưa báo cả nhóm
- Không tự đặt tên key `localStorage` khác — chỉ dùng `nexus_cart`, `nexus_wishlist`, `nexus_theme`, `nexus_user`
- Mọi thẻ `<img>` phải có fallback:
  ```html
  <img src="images/products/vr-001-1.jpg"
       onerror="this.onerror=null; this.src='images/placeholder.svg';"
       alt="Tên sản phẩm">
  ```

## 5. Comment code

Với đoạn logic phức tạp (tính tiền giỏ hàng, validate form, xử lý API...), bắt buộc có comment giải thích, ví dụ:

```js
// Tính tổng tiền sau khi áp mã giảm giá NEXUS2026 (-10%)
function calculateTotal(cart, couponCode) {
  let subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (couponCode === "NEXUS2026") subtotal *= 0.9;
  return subtotal;
}
```

## 6. Trước khi merge code lên nhánh chính

- [ ] Đã test trên Chrome ít nhất
- [ ] Không còn `console.log()` thừa
- [ ] Không còn `alert()`
- [ ] Ảnh có `onerror` fallback
- [ ] Đặt tên class/biến đúng chuẩn ở mục 2

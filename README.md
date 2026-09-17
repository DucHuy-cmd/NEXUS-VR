# NEXUS VR — Đồ án môn Thiết Kế Web

Website thương mại điện tử kính thực tế ảo, phong cách "Futuristic Luxury".

## Cấu trúc dự án (kiến trúc 3 tầng)

```
├── index.html / about.html / contact.html      [Trường Vũ]
├── shop.html                                    [Hưng]
├── product.html                                 [Nhất Vũ]
├── cart.html / checkout.html / login.html        [Tường]
├── 404.html                                      [Đức Huy]
│
├── assets/css/
│   ├── variables.css, reset.css, global.css      TẦNG 1 — [Đức Huy]
│   ├── components/                                TẦNG 2 — navbar/footer/toast [Đức Huy],
│   │                                                        product-card [Hưng], cart-drawer [Tường]
│   └── pages/                                      TẦNG 3 — CSS riêng từng trang
│
├── assets/js/
│   ├── data/products-data.js                      TẦNG 1 — [Đức Huy + Nhất Vũ]
│   ├── services/                                   TẦNG 1 — storage [Đức Huy], api [Nhất Vũ]
│   ├── modules/                                    TẦNG 2 — theme/toast/layout [Đức Huy],
│   │                                                        validator/counter/slider/accordion [Trường Vũ],
│   │                                                        cart-manager [Tường]
│   └── controllers/                                TẦNG 3 — điều khiển riêng từng trang
│
└── server/                                         [Nhất Vũ] Backend Node.js/Express
```

## Bảng phân công

| Người | HTML | CSS | JS |
|---|---|---|---|
| Đức Huy | 404.html | variables, reset, global, navbar, footer, toast | data (chung), storage-service, theme-toggle, toast, layout-loader |
| Trường Vũ | index, about, contact | home, about, contact | validator, counter-engine, slider-engine, accordion-engine, home/about/contact-controller |
| Hưng | shop | shop, product-card (chủ trì) | shop-controller |
| Nhất Vũ | product | product-detail | data (chung), api-service, product-controller, toàn bộ server/ |
| Tường | cart, checkout, login | cart-drawer, cart, checkout, login | cart-manager, cart/checkout/login-controller |

## ⚠️ Cần xác nhận lại với thầy / cả nhóm

1. **Thiếu `blog.html` và `blog-post.html`** — 2 trang này có trong tài liệu đặc tả gốc (10 trang + 404) nhưng KHÔNG có trong sơ đồ file mới nhất. Nếu vẫn cần 2 trang này, bổ sung vào phần của Hưng (đã phụ trách shop, mảng nội dung gần nhất).
2. `modules/layout-loader.js` là file **mới thêm** (không có trong sơ đồ gốc) — bắt buộc phải có thì Navbar/Footer mới tự render ra được. Đã gán cho Đức Huy.
3. `pages/cart.css`, `pages/checkout.css`, `pages/login.css` cũng là 3 file **mới thêm** cho đủ bộ (sơ đồ gốc chỉ liệt kê home/about/contact/shop/product-detail).

## Cách chạy thử (trước khi có backend)

Dùng VS Code + extension **Live Server** → chuột phải vào `index.html` → "Open with Live Server". Chỉ chuyển sang `npm start` (localhost:3000) khi backend của Nhất Vũ đã sẵn sàng (Ngày 8-9).

## Quy chuẩn code

Xem chi tiết trong `CONVENTION.md` (đã gửi trước đó) — class CSS theo BEM, biến JS camelCase, không hardcode màu, không dùng `alert()`, 4 key localStorage cố định: `nexus_cart`, `nexus_wishlist`, `nexus_theme`, `nexus_user`.

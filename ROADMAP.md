# NEXUS VR — Lộ trình v3 (sửa lỗi → dựng lại trang chủ kiểu Apple → hoàn thiện)

Đặt tại `docs/ROADMAP.md`. Đi kèm `docs/home-content.md` (nội dung và số liệu trang chủ).
Thay thế mọi lộ trình cũ (`PRIORITY_ROADMAP.md`, `KE_HOACH_NANG_CAP_10_PHAN_TRAM.txt`, `docs/implementation_plan.md`).

---

## 0. Quyết định đã chốt (AI không được tự đổi)

| Chủ đề | Quyết định | Lý do |
|---|---|---|
| Hướng thiết kế | Đơn giản, tinh xảo kiểu Apple: nền phẳng, chữ lớn, ít chữ, ảnh thật | Cork/WebGL nặng, cần model thật mà chưa có |
| Trang chủ | Dựng lại từ đầu theo `home-content.md` (7 phần) | Bản hiện tại hỏng ở nền tảng |
| Three.js / canvas WebGL | **Bỏ** | Kính hiện là hình khối thủ tục, không đạt chất lượng |
| Barba (SPA) | **Bỏ** | Chỉ 2 trang có container, làm điều hướng bật ngược về trang chủ |
| Lenis | **Bỏ** (dùng cuộn gốc) | Giảm rủi ro xung đột với pin |
| GSAP + ScrollTrigger | **Giữ**, đặt offline trong `assets/js/vendors/`, ghim phiên bản | Chỉ dùng cho phần 4 (cuộn đặc biệt) và hiện dần |
| Chuyển trang | Liên kết thường. Tùy chọn: `@view-transition { navigation: auto; }` | Không cần JS |
| Chế độ giao diện | Một chế độ sáng (kem `--bg-primary`) cho toàn site | Đã có; tối chỉ thêm khi mọi thứ xong |
| Dữ liệu sản phẩm | Duy nhất `products-data.js` | Tránh mâu thuẫn số liệu |

**Vùng sửa file** (theo người phụ trách trong README). Prompt nào cần sửa vùng C phải ghi rõ `PHẠM_VI = A+B+C`, mỗi trang một commit.

| Vùng | Gồm |
|---|---|
| A | `index.html`, `about.html`, `contact.html`, `home.css`, `about.css`, `contact.css`, `home-controller.js`, `about-controller.js`, `contact-controller.js`, `core/`, `animations/`, `vendors/` |
| B (chỉ thêm, báo cáo) | `variables.css`, `reset.css`, `global.css`, `navbar.css`, `footer.css`, `toast.css`, `layout-loader.js`, `storage-service.js`, `products-data.js` |
| C | `shop`, `product`, `cart`, `checkout`, `login`, `404`, `product-card.css`, `cart-drawer.css`, `cart-manager.js`, `api-service.js`, `server/` |

---

## 1. Thứ tự làm

```
P0 Dọn repo & luật AI  →  P1 Sửa lỗi nền tảng  →  P2 Trang chủ mới  →  P3 Hoàn thiện trang còn lại  →  P4 QA & bàn giao  →  P5 (tùy chọn)
```

Mỗi giai đoạn xong mới sang giai đoạn sau. Mỗi task một commit riêng.

---

## P0 — Dọn repo và bộ luật AI (nửa ngày, làm thủ công hoặc nhờ AI)

| ID | Việc | File | Xong khi |
|---|---|---|---|
| P0-1 | Xóa bản trùng `assets/js/data/controllers/product-controller.js`. Xóa 3 ảnh `hero-vr-*.webp` ở thư mục gốc. Xóa ảnh hero/`person-vr` bị lặp trong `assets/images/products/` | — | `find` không còn file trùng; shop/product vẫn chạy |
| P0-2 | Xóa `astryx-architecture.md` (trùng `.agent/rules/`). Gộp `Bao quat dự án.txt` và `BAO_QUAT_DU_AN_V2.txt` thành một | — | Còn 1 file báo cáo |
| P0-3 | Chuyển `*.doc` và `server/database.sqlite` ra khỏi git (`git rm --cached`), giữ trong `.gitignore` | `.gitignore` | `git status` sạch |
| P0-4 | Đổi tên thư mục "Các hướng đi và công nghệ" thành `docs/`, gộp các file cũ vào `docs/archive/` | — | Không còn tên có dấu/khoảng trắng |
| P0-5 | **Một file luật duy nhất** `.agent/rules/nexus.md` (≤ 80 dòng) theo mục 4 dưới. Xóa `.cursorrules` và `astryx.rule.md` (cú pháp Tailwind/React không dùng được) | `.agent/rules/` | Chỉ còn một file luật, không mâu thuẫn |
| P0-6 | Sửa `CONVENTION.md` cho khớp cây `assets/` thật; sửa dòng "CẤM thư viện" thành danh sách thư viện được phép | `CONVENTION.md` | Cây thư mục trong file khớp thực tế |
| P0-7 | Tạo `docs/STATE.md` (bảng trang nào xong / stub / lỗi đã biết) và cập nhật sau mỗi task | `docs/STATE.md` | File tồn tại |

---

## P1 — Sửa lỗi nền tảng (1 ngày)

Đây là các lỗi đã kiểm chứng. Làm trước khi dựng gì mới.

| ID | Lỗi | Việc | Vùng | Xong khi |
|---|---|---|---|---|
| P1-1 | Điều hướng bật ngược về trang chủ | Gỡ Barba khỏi `index.html`, `contact.html`. Xóa `router.js`, `page-transitions.js`, thuộc tính `data-barba`. Cập nhật `app.js` | A | Từ mọi trang bấm mọi mục navbar đều tới đúng trang |
| P1-2 | Ảnh sản phẩm 404 | Sửa `images` trong `products-data.js` theo bảng mục 3 của `home-content.md`. Chuyển ảnh JPG sang WebP (giữ bản gốc trong `_src/`) | B | Không còn request 4xx ở shop/product/index |
| P1-3 | `blog.html` không tồn tại | Tạm gỡ "Tin tức" khỏi navbar và footer (làm lại ở P5) | B | Không còn link chết |
| P1-4 | Footer link giả | "Kính VR / Tay cầm / Phụ kiện" → `shop.html?category=...`; "Chính sách / Bảo hành / FAQ" → `contact.html#faq`. Cần `shop-controller` đọc query `category` | B+C | Bấm footer thấy đúng danh mục |
| P1-5 | Tương phản logo/nhãn vàng trên nền kem (~2:1) | Logo và chữ nhấn nhỏ dùng `--accent-bronze-deep` | B | Tương phản chữ nhỏ ≥ 4,5:1 |
| P1-6 | Emoji làm icon (🛒 👤) | Thay bằng SVG inline, có `aria-label` | B | Không còn emoji trong navbar |
| P1-7 | XSS: `user.name` chèn vào `innerHTML` không escape | Dùng `textContent` | B | Tên có `<script>` không chạy |
| P1-8 | Navbar chèn bằng JS → nhảy bố cục khi tải | Đặt chiều cao `#navbar-root` cố định bằng CSS | B | CLS < 0,1 |
| P1-9 | `alert()` (contact-controller dòng ~659, ~1282), `console.log` | Thay bằng `showToast`; xóa log | A | `grep` không còn `alert(` và `console.log` |
| P1-10 | `contact.html` thiếu meta description; các trang thiếu favicon, meta | Thêm `<meta description>`, favicon SVG, `theme-color` cho mọi trang | A/B/C | Mỗi trang có đủ |
| P1-11 | 404 không có `<h1>`, `<main>`, dùng CSS nhúng và màu cứng | Sửa cấu trúc, chuyển CSS vào `assets/css/pages/404.css` | C | Có h1, main, dùng token |
| P1-12 | Thư viện nạp từ CDN | Tải GSAP + ScrollTrigger (≥ 3.13) vào `assets/js/vendors/`, kèm giấy phép, cập nhật `README-VENDORS.txt` | A | Không còn `<script src="https://...">` (trừ Google Fonts) |
| P1-13 | Font: mỗi trang nạp một kiểu | Thống nhất: Space Grotesk + Inter (subset `vietnamese`). Bỏ Playfair, Cormorant, Dancing Script, Caveat nếu không dùng | B | Mọi trang cùng một link font |
| P1-14 | **Chưa đọc kỹ** `shop-controller`, `product-controller`, `cart-manager`, `server/app.js`, `api-service.js` | Agent đọc và báo cáo lỗi/lỗ hổng (không sửa). Lưu kết quả `docs/AUDIT-JS.md` | — | Có báo cáo |

**Prompt mẫu P1** (dán nguyên):

```
Đọc .agent/rules/nexus.md, docs/ROADMAP.md (mục 0 và P1), docs/STATE.md.
Chỉ làm task P1-<ID>. PHẠM_VI = <A|A+B|A+B+C>.
Không sửa file ngoài danh sách. Không thêm thư viện.
Sau khi xong: chạy `python3 -m http.server 5500`, mở các trang liên quan bằng Playwright,
chụp ảnh 390px và 1440px, kiểm tra console và Network không có lỗi,
liệt kê file đã sửa và cập nhật docs/STATE.md.
```

---

## P2 — Trang chủ mới kiểu Apple (2–3 ngày)

Điều kiện: đã xong P1-1, P1-2, P1-12 và đã đặt `docs/home-content.md`.
Chỉ sửa `index.html`, `home.css`, `home-controller.js`. Xóa `nexus-3d-scene.js`, `smooth-scroll.js`, `motion-effects.js` (nếu không còn dùng).

| ID | Việc | Xong khi |
|---|---|---|
| P2-1 | **Bộ khung**: xóa toàn bộ nội dung cũ của `index.html`. Dựng 7 phần rỗng đúng thứ tự, đúng token, đúng `<h1>` một lần | Trang hiện đủ 7 khối, không lỗi |
| P2-2 | **Phần 1 + 2**: hero, tuyên bố. Kính hiện dần khi tải | LCP < 2,5s; ảnh hero có `fetchpriority="high"` |
| P2-3 | **Phần 3**: ba điểm nổi bật, bố cục lệch, ảnh cắt bằng CSS | Không có 3 thẻ giống nhau; không tràn ngang 360–1920px |
| P2-4 | **Phần 5**: chọn màu (chấm màu, cross-fade 350ms, điều khiển bằng phím) | Bấm/phím đều đổi được; `aria-pressed` đúng |
| P2-5 | **Phần 6 + 7**: bảng so sánh và lưới sản phẩm sinh từ `PRODUCTS` | Không gõ tay số liệu trong HTML |
| P2-6 | **Phần 4**: cuộn đặc biệt duy nhất (ghim, đổi 3 màu theo cuộn). Chỉ chạy khi có `fx-on`, không reduced-motion, không mobile | Tắt JS/GSAP vẫn thấy đủ 3 ảnh xếp dọc |
| P2-7 | **Đánh bóng**: hiện dần (`data-fx="reveal"`, ≤ 24px, một lần), trạng thái `:hover/:active/:focus-visible` cho mọi nút | Không có fade-up ở mọi section |
| P2-8 | **Dọn**: xóa CSS/JS thừa của trang chủ cũ, `home.css` mục tiêu < 400 dòng, `home-controller.js` < 150 dòng | Đạt mục tiêu dòng |

**Prompt mẫu P2:**

```
Đọc .agent/rules/nexus.md, docs/ROADMAP.md (P2), docs/home-content.md.
Làm task P2-<ID>. Chỉ sửa index.html, assets/css/pages/home.css, assets/js/controllers/home-controller.js.
Nội dung, số liệu, ảnh: chỉ lấy từ docs/home-content.md. Chỗ [CẦN ĐIỀN] để trống có nhãn, không tự điền.
Không thêm phần, không thêm số liệu, không dùng nhãn [ ... // ... ], pill-badge, emoji.
Mọi trạng thái ẩn chỉ áp dụng khi <html> có class fx-on.
Kiểm tra ở 360/390/768/1024/1440/1920px, bật prefers-reduced-motion, chặn script GSAP thử.
Chụp ảnh trước/sau, liệt kê file đã sửa, cập nhật docs/STATE.md.
```

---

## P3 — Hoàn thiện các trang còn lại (3–5 ngày, vùng C: cần nhóm đồng ý)

| ID | Trang | Việc chính | Xong khi |
|---|---|---|---|
| P3-1 | `cart.html` + `cart-manager.js` | Danh sách, tăng/giảm, xóa (có hoàn tác), tổng tiền, mã giảm giá `NEXUS2026` (-10%), giỏ trống | Thêm ở product → cart hiện đúng, tải lại vẫn còn (`nexus_cart`) |
| P3-2 | `cart-drawer` | Trượt từ phải, dùng cùng `cart-manager` | Mở/đóng bằng phím; `Esc` đóng |
| P3-3 | `checkout.html` | Form giao hàng + thanh toán (giả lập), dùng `validator.js`, kiểm tra tại ô, màn hình thành công + mã đơn | Không gửi được khi sai; đúng thì xóa giỏ |
| P3-4 | `login.html` | Đăng nhập/Đăng ký chuyển tab, kiểm tra hợp lệ, lưu `nexus_user`; **không lưu mật khẩu ở localStorage** | Đăng nhập xong navbar hiện tên (đã escape) |
| P3-5 | `about.html` | Câu chuyện thương hiệu ngắn, mốc thời gian, đội ngũ (cần ảnh 3:4, để placeholder nếu chưa có) | Có h1, đủ nội dung, đúng token |
| P3-6 | `product.html` | Nối ảnh thật, đổi màu đổi ảnh, thanh mua dính khi nút chính ra khỏi màn hình | Đổi màu không nhảy bố cục |
| P3-7 | `shop.html` | Đọc `?category=`, bộ lọc đồng bộ URL, skeleton khi tải, nối đủ sản phẩm | Chia sẻ URL vẫn giữ bộ lọc |
| P3-8 | `contact.html` | Giữ nguyên bố cục. Giảm CSS/JS (61KB/50KB), thay màu cứng bằng token (115 chỗ), bỏ `!important` | CSS < 1.200 dòng, JS < 25KB |
| P3-9 | `server/` | Xem kết quả `docs/AUDIT-JS.md`; thêm giới hạn tần suất và kiểm tra đầu vào cho `api-contact.js`; không đưa email/SĐT thật vào repo | Không lộ thông tin cá nhân |

Mỗi trang một commit. Không đổi tên/cấu trúc field trong `products-data.js`.

---

## P4 — QA và bàn giao (1 ngày)

- Lighthouse ≥ 90 (Accessibility, Best Practices, SEO); Performance ≥ 90 trên trang chủ.
- axe: 0 lỗi critical/serious.
- Chụp ảnh 360/390/768/1024/1440/1920px cho mọi trang.
- Chỉ dùng bàn phím đi hết luồng: trang chủ → shop → sản phẩm → giỏ → thanh toán.
- Bật `prefers-reduced-motion`; chặn script GSAP; kiểm tra nội dung không kẹt ẩn.
- Không lỗi console, không request 4xx, không tràn ngang.
- Cập nhật `README.md`, `docs/STATE.md`, chuẩn bị ảnh chụp cho báo cáo.

---

## P5 — Tùy chọn (chỉ khi có tài nguyên)

| Việc | Cần |
|---|---|
| Kính xoay 360° bằng chuỗi ảnh vẽ lên canvas | 60–120 ảnh render từ Blender |
| Trang `blog.html` + `blog-post.html` | Nội dung bài viết, ảnh |
| Chế độ tối | Bộ token màu tối đã kiểm tương phản |
| `<model-viewer>` + AR | File `.glb` thật |
| Tăng ảnh 2× cho retina | Ảnh gốc độ phân giải cao hoặc Upscayl |

---

## 4. Nội dung file luật `.agent/rules/nexus.md` (dán nguyên)

```markdown
---
name: nexus-vr-rules
alwaysApply: true
---
# NEXUS VR — luật cho AI

## Công nghệ
- HTML, CSS thuần, JavaScript thuần (script thường, không module, không bundler).
- Không React/Vue/Tailwind/Bootstrap. Bỏ mọi cú pháp Tailwind/React.
- Thư viện: chỉ GSAP + ScrollTrigger, đặt trong assets/js/vendors/, không nạp từ CDN.
- Không Three.js, Barba, Lenis trừ khi được yêu cầu rõ.

## Quy ước (theo CONVENTION.md)
- CSS: BEM. JS: camelCase. Tên file: kebab-case.
- Không hardcode màu, khoảng cách, easing, thời lượng: dùng var(--...) trong variables.css. Chỉ thêm token, không đổi tên/xóa.
- Không alert(), không console.log. Dùng showToast().
- localStorage chỉ 4 key: nexus_cart, nexus_wishlist, nexus_theme, nexus_user.
- <img> luôn có alt, width/height, onerror fallback.

## Thiết kế
- Kiểu Apple: nền phẳng, chữ lớn, ít chữ, ảnh thật. Mỗi trang MỘT khoảnh khắc đặc trưng.
- Cấm: nhãn [ ... // ... ], pill-badge, emoji làm icon, thẻ giống nhau lặp, fade-up mọi section, chữ HOA hàng loạt.
- Ảnh/khung: có aspect-ratio + object-fit; ảnh không tự quyết định chiều cao.
- Tiếng Việt có dấu; câu chữ cụ thể theo thông số. Không dùng: kiệt tác, tuyệt tác, đỉnh cao, siêu, đột phá.

## Chuyển động
- Chỉ animate transform/opacity/clip-path. Không animate top/left/margin/padding.
- Trạng thái ẩn ban đầu CHỈ áp dụng khi <html> có class fx-on. Nội dung không bao giờ kẹt ẩn.
- Tôn trọng prefers-reduced-motion. Nút có đủ :hover :active :focus-visible :disabled.

## Nội dung và dữ liệu
- Số liệu sản phẩm chỉ lấy từ products-data.js và docs/home-content.md.
- Không bịa giá, thông số, đánh giá. Thiếu thì ghi [CẦN ĐIỀN] và hỏi.

## Khi làm việc
- Một task một lần; chỉ sửa file trong danh sách phạm vi của prompt.
- Chạy bằng http://, không file://.
- Xong phải: chụp ảnh 390px + 1440px, kiểm console/Network, liệt kê file đã sửa, cập nhật docs/STATE.md.
```

---

## 5. Cây thư mục mục tiêu

```
BT_LON_WEB/
├── index.html  shop.html  product.html  cart.html  checkout.html
├── about.html  contact.html  login.html  404.html
├── README.md  CONVENTION.md
├── .agent/rules/nexus.md
├── docs/  ROADMAP.md  home-content.md  STATE.md  AUDIT-JS.md  archive/
├── assets/
│   ├── css/  variables.css reset.css global.css
│   │         components/ (navbar footer toast fx product-card cart-drawer)
│   │         pages/ (home shop product-detail cart checkout login about contact 404)
│   ├── js/   data/products-data.js
│   │         services/ (storage-service api-service)
│   │         modules/ (layout-loader toast validator cart-manager ...)
│   │         controllers/ (home shop product cart checkout login about contact)
│   │         animations/fx-registry.js
│   │         vendors/ (gsap.min.js ScrollTrigger.min.js + LICENSE)
│   └── images/ hero/  home/  products/  team/
└── server/  app.js  routes/api-contact.js   (database.sqlite: không đưa vào git)
```

# Trang chủ — hợp đồng triển khai

**Phụ trách:** Trường Vũ  
**File được sửa:** `index.html`, `assets/css/pages/home.css`, `assets/js/controllers/home-controller.js`  
**Nguồn nội dung và số liệu:** `home-content.md` (chỉ nguồn này) và `assets/js/data/products-data.js` (chỉ để render bảng/lưới).

## Mục tiêu

Giới thiệu một sản phẩm chủ lực theo phong cách tối giản, tinh xảo: ảnh kính là trung tâm, chữ lớn, ít câu và mỗi vùng chỉ trả lời một câu hỏi của khách hàng. Đây không phải trang landing có hiệu ứng dày đặc.

## Thứ tự và nội dung bắt buộc

1. **Hero:** H1 `NEXUS Vision Pro`, câu phụ, hai CTA đến Shop và Contact, ảnh hero màu xám.
2. **Tuyên bố:** một câu lớn về `7680 × 3840` và một dòng giải thích ngắn.
3. **Ba điểm nổi bật:** 8K, 120 Hz, 130°; bố cục lệch, ảnh cắt từ asset hero, không tạo ba card giống nhau.
4. **Khoảnh khắc cuộn:** chỉ hiệu ứng lớn duy nhất; ba ảnh Xám/Trắng Nâu/Xanh Cam. Desktop có thể pin bằng GSAP; mobile và reduced motion phải xếp ảnh tĩnh.
5. **Chọn màu:** radio button điều khiển bằng click và mũi tên; đổi ảnh cross-fade 350 ms; giá không đổi.
6. **So sánh:** render từ `PRODUCTS`, không gõ tay thông số sản phẩm vào HTML.
7. **Phụ kiện:** render từ `PRODUCTS`, CTA đến `shop.html`.

## Ràng buộc thiết kế

- Nền sáng, typography Space Grotesk + Inter, một accent bronze trầm.
- Không thêm section, số liệu, badge pill, emoji icon, neon, glassmorphism hoặc hiệu ứng chuột/tilt.
- Ảnh có `alt`, kích thước và fallback; chỉ ảnh hero dùng ưu tiên tải cao.
- Không tự sửa `products-data.js`, navbar, footer, token dùng chung hay component của thành viên khác.

## Hợp đồng DOM

Giữ nguyên các hook: `#hero`, `#statement`, `#scroll-colors`, `#scroll-pin-track`, `#colorway-current-img`, `#comparison-mount`, `#accessories-mount`, `.color-dot`.

## Điều kiện hoàn thành

- Một `h1`; không tràn ngang ở 360, 390, 768, 1024, 1440 và 1920 px.
- Không lỗi console/request ảnh 4xx.
- Tắt JavaScript, GSAP hoặc bật `prefers-reduced-motion` vẫn đọc được toàn bộ nội dung.
- Chỉ sửa đúng ba file được giao và cập nhật `docs/STATE.md` khi file đó được tạo.

# NEXUS VR — Trạng Thái Dự Án (STATE.md)

Cập nhật lần cuối: 2026-10-01 (Hoàn thành Phase P0, P1, P2, P3 & P4)

---

## 1. Trạng thái các trang Web

| Trang | File HTML | Phụ trách | Trạng thái hiện tại | Ghi chú |
|---|---|---|---|---|
| Trang chủ | `index.html` | Trường Vũ | 🟢 Hoàn thành P2 | Apple Style 7 phần, cuộn Reveal 2 chiều, chọn màu 3D tilt, bảng so sánh & hệ sinh thái phụ kiện |
| Cửa hàng | `shop.html` | Hưng | 🟢 Hoàn thành P3 | Lọc danh mục, tùy chọn màu sắc, khoảng giá 100M, từ khóa tìm kiếm & đổi màu trực tiếp trên thẻ |
| Chi tiết sản phẩm | `product.html` | Nhất Vũ | 🟢 Hoàn thành P4 | Đã liên kết chọn màu swatch với ảnh gallery chính, tabs thông số, đánh giá & giỏ hàng |
| Giỏ hàng | `cart.html` | Tường | 🟢 Hoàn thành P3 | Đổi màu trực tiếp tại dòng sản phẩm, thanh tiến trình Miễn phí ship, mã giảm giá & phụ kiện gợi ý |
| Thanh toán | `checkout.html` | Tường | 🟢 Hoàn thành P4 | Quy trình 3 bước (Giao hàng, Thanh toán, Hoàn tất), VietQR, COD, Thẻ quốc tế |
| Đăng nhập / Đăng ký | `login.html` | Tường | 🟢 Hoàn thành P1 | Chuẩn hóa font, tab Đăng nhập/Đăng ký & lưu phiên `nexus_user` |
| Giới thiệu | `about.html` | Trường Vũ | 🟢 Hoàn thành P1 | Triết lý thiết kế Quiet Luxury, kỹ nghệ chế tác & đội ngũ |
| Liên hệ | `contact.html` | Trường Vũ | 🟢 Hoàn thành P1 | Form liên hệ, đặt lịch trải nghiệm & hỗ trợ Concierge |
| Trang 404 | `404.html` | Đức Huy | 🟢 Hoàn thành P1 | Cấu trúc chuẩn `<main>`, `<h1>`, token CSS & `404.css` |

---

## 2. Nhật Ký Tiến Độ Chi Tiết

- [x] **Phase P0**: Khởi tạo quy tắc `.agent/rules/nexus.md`, dọn dẹp `.gitignore` và `CONVENTION.md`.
- [x] **Phase P1**: Gỡ bỏ Barba.js SPA, sửa đường dẫn ảnh 404, thay emoji bằng SVG, khắc phục XSS và CLS.
- [x] **Phase P2**: Dựng lại Trang chủ Apple Style 7 phần với engine GSAP / ScrollTrigger offline & IntersectionObserver 2 chiều.
- [x] **Phase P3**: Gom nhóm dữ liệu sản phẩm theo tùy chọn màu, nâng cấp bộ lọc Cửa hàng và tối ưu giao diện Giỏ hàng.
- [x] **Phase P4**: Liên kết màu sắc trang Chi tiết sản phẩm và hoàn thiện quy trình Thanh toán 3 bước.
- [x] **UI Polish**: Sửa nút Yêu thích (nút Tim) thành dạng Glassmorphic tinh tế với hiệu ứng tim đỏ & thông báo Toast; tinh chỉnh layout trang Cửa hàng đẩy nội dung lên cao gọn gàng.

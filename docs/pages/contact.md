# Liên hệ — hợp đồng triển khai

**Phụ trách:** Trường Vũ  
**File được sửa:** `contact.html`, `assets/css/pages/contact.css`, `assets/js/controllers/contact-controller.js`.  
**Phụ thuộc chỉ đọc:** `toast.js`, `validator.js`, `api-service.js`, `layout-loader.js`.

## Mục tiêu

Giúp khách hàng thực hiện nhanh một trong ba việc: gọi/tạo email, tìm showroom, hoặc gửi yêu cầu tư vấn. Thiết kế có thể mang cảm giác premium nhưng ưu tiên rõ ràng, đáng tin và riêng tư hơn hiệu ứng.

## Bố cục chuẩn

1. **Tiêu đề:** H1 `Liên hệ và đặt lịch trải nghiệm`; một câu mô tả ngắn, không dùng nhãn HUD/"quantum"/"concierge 24/7" nếu không có dịch vụ thật.
2. **Ba kênh chính:** hotline, email thương hiệu, showroom; mỗi kênh có một CTA rõ và giờ mở cửa thật.
3. **Bản đồ:** địa chỉ phải khớp với link Maps. Bản đồ iframe có tiêu đề; luôn có link chỉ đường thay thế.
4. **Form yêu cầu tư vấn:** họ tên, email, số điện thoại, nhu cầu, khung giờ, lời nhắn. Nếu gọi là "đặt lịch", phải có ngày hẹn và backend xác nhận; nếu chưa có backend, dùng nhãn `Gửi yêu cầu tư vấn`.
5. **FAQ:** tối đa năm câu hỏi thật, có cấu trúc accordion dùng button/aria.

## Luồng form và trạng thái

- Kiểm tra từng trường bằng `validator.js` hoặc logic tương đương, thông báo lỗi bằng text có `aria-live`.
- Không lưu tên, email, số điện thoại vào localStorage. Khi API chưa sẵn sàng, chỉ mô phỏng thành công với thông báo minh bạch: `Yêu cầu đã được ghi nhận trong bản demo; chưa gửi tới hệ thống.`
- Chỉ dùng `showToast`; không `alert`, không `console.log`.
- Không hứa phản hồi trong 15 phút, bảo hành, đặc quyền hoặc xác nhận đặt chỗ nếu không có quy trình vận hành/backend hỗ trợ.

## Những phần không được mở rộng

- Không thêm 3D flip/tilt thẻ VIP, hologram, download `.PASS`, modal vé, custom cursor, Lenis, Barba, canvas hoặc animation magnetic.
- Không emoji làm icon; icon phải là SVG và có nhãn truy cập khi không có text.
- Không thêm font ngoài Space Grotesk và Inter; không thêm dark mode, màu hard-code hoặc `!important`.

## Hợp đồng DOM hiện hữu

Giữ các hook cho đến khi refactor cùng lúc HTML/CSS/JS: `#contact-form`, `#contact-name`, `#contact-email`, `#contact-phone`, `#contact-service`, `#contact-time-slot`, `#contact-message`, `#contact-submit-btn`, `#contact-faq-accordion`.

## Điều kiện hoàn thành

- Một H1; thứ bậc heading đúng; form thao tác bằng bàn phím; modal (nếu còn) đóng bằng Esc và trả focus.
- Responsive 390/768/1440 px, không tràn ngang; không lỗi console, link/chỉ đường/ảnh 4xx.
- Không chứa email hoặc số điện thoại cá nhân khi xuất bản công khai; dùng thông tin demo hoặc thông tin thương hiệu được nhóm phê duyệt.

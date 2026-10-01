# Giới thiệu — hợp đồng triển khai

**Phụ trách:** Trường Vũ  
**File được sửa:** `about.html`, `assets/css/pages/about.css`, `assets/js/controllers/about-controller.js`.

## Mục tiêu

Giải thích ngắn gọn NEXUS VR là ai, sản phẩm được thiết kế cho ai và vì sao thương hiệu đáng tin. Trang không được biến thành hồ sơ công ty hư cấu dài hoặc gallery hiệu ứng 3D.

## Bố cục bắt buộc

1. **Hero:** một H1, lời giới thiệu thương hiệu ngắn và một ảnh/đồ họa có chủ đích.
2. **Câu chuyện:** tối đa ba mốc thời gian; mỗi mốc một sự thật có thể giải thích được.
3. **Nguyên tắc thiết kế:** ba ý ngắn về trải nghiệm, độ thoải mái và hệ sinh thái; không dùng card lặp khuôn mẫu.
4. **Đội ngũ:** chỉ hiện khi có ảnh chân dung và thông tin thật/được nhóm chấp thuận; chưa có thì dùng placeholder trung thực.
5. **CTA:** một liên kết về Shop hoặc Contact.

## Ràng buộc

- Dùng nền sáng, ảnh thật/placeholder, typography chung của site.
- Không flip 3D, custom cursor, canvas, mô tả khoa trương hoặc thông tin nhân sự cá nhân không được nhóm đồng ý.
- Không chỉnh navbar/footer/global CSS, product data hay các trang ngoài phạm vi.

## Hợp đồng DOM

Khi triển khai, controller chỉ được gắn vào các phần tử trong `about.html`; phải có guard để không lỗi khi một khối chưa tồn tại. Không thêm dữ liệu đội ngũ trong JS nếu HTML/asset chưa sẵn sàng.

## Điều kiện hoàn thành

- Một H1, thứ bậc heading tuần tự, ảnh có alt, layout không tràn ngang ở 390/768/1440 px.
- Không có link giả, ảnh 404 hoặc animation bắt buộc để đọc nội dung.

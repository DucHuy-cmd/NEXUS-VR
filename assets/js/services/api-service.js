/* =========================================================
   NEXUS VR — services/api-service.js   [PHỤ TRÁCH: Nhất Vũ]
   TẦNG 1 - DATA & SERVICES

   TRẠNG THÁI HIỆN TẠI: Không có hàm fetch() nào tới backend.

   Lý do: dự án deploy trên Vercel ở chế độ site tĩnh (static
   hosting) — không chạy được Node.js/Express thật, nên phần
   server Express (routes/api-contact.js...) đã được loại bỏ
   thay vì giữ lại dưới dạng code chết (hàm rỗng/stub) gây
   hiểu lầm là đã triển khai.

   Thay vào đó, các chức năng liên quan đã được xử lý trực
   tiếp bằng localStorage ngay trong từng controller, không
   qua lớp API này:
   - Đăng nhập / Đăng ký / Đăng xuất: xử lý trong
     controllers/login-controller.js, dùng
     saveCurrentUser()/clearCurrentUser() của
     services/storage-service.js (key "nexus_user").
   - Form liên hệ: controllers/contact-controller.js CHỦ Ý
     không lưu localStorage và không báo "đã gửi thành công"
     khi chưa có backend thật (xem comment đầu file đó) — chỉ
     hiển thị thông báo demo.

   File này được GIỮ LẠI (không xóa) vì vẫn đang được include
   bằng <script> ở about.html, login.html, checkout.html — xóa
   file sẽ gây lỗi 404 tải script ở các trang đó. Khi dự án có
   backend thật chạy được trên hạ tầng phù hợp (không phải
   static hosting), các hàm fetch() thật sẽ được viết lại ở
   đây, và API_BASE bên dưới sẽ trỏ đúng origin backend.
   ========================================================= */

const API_BASE = "";

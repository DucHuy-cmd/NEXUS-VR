/* =========================================================
   NEXUS VR — services/api-service.js   [PHỤ TRÁCH: Nhất Vũ]
   TẦNG 1 - DATA & SERVICES
   Chứa các hàm fetch() gọi Backend Express (Auth, Contact,
   Newsletter). Hoàn thiện ở Ngày 8-9, sau khi server/ chạy được.

   Các file controller khác (contact-controller.js,
   login-controller.js) gọi qua các hàm ở đây — KHÔNG tự viết
   fetch() rải rác trong controller.
   ========================================================= */

const API_BASE = ""; // để trống nếu frontend/backend chạy chung origin (localhost:3000)

/* TODO (Nhất Vũ): hoàn thiện các hàm bên dưới khi server/ đã có route thật */

async function apiRegister(name, email, password) {
  // POST /api/auth/register
}

async function apiLogin(email, password) {
  // POST /api/auth/login
}

async function apiLogout() {
  // POST /api/auth/logout
}

async function apiGetCurrentUser() {
  // GET /api/auth/me — dùng để thay storage-service.getCurrentUser()
  // bằng dữ liệu thật từ session một khi backend sẵn sàng
}

async function apiSendContactForm(formData) {
  // POST /api/contact — formData: { name, email, message }
}

async function apiSubscribeNewsletter(email) {
  // POST /api/newsletter
}

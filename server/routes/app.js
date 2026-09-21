/* =========================================================
   NEXUS VR — server/app.js   [PHỤ TRÁCH: Nhất Vũ]
   Backend Node.js / Express — phạm vi hiện tại: phục vụ
   API Contact (routes/api-contact.js) + serve toàn bộ site
   tĩnh, thay thế Live Server khi chạy `npm start`.

   Gộp thẳng phần khởi tạo SQLite vào đây (thay vì tách
   server/db.js riêng) để đúng khớp 3 file được giao:
   app.js / database.sqlite / routes/api-contact.js.
   ========================================================= */

require("dotenv").config();

const path = require("path");
const express = require("express");
const Database = require("better-sqlite3");

const PROJECT_ROOT = path.join(__dirname, ".."); // thư mục gốc chứa index.html, product.html...
const PORT = process.env.PORT || 3000;

/* ---------- SQLite ----------
   Chỉ tạo đúng bảng `contacts` — chức năng duy nhất backend
   đang đảm nhiệm ở phạm vi này. Không tự thêm bảng users/
   newsletter vì chưa được giao trong nhiệm vụ hiện tại. */
const db = new Database(path.join(__dirname, "database.sqlite"));
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    message    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const app = express();

app.use(express.json());

// Gắn db vào app để routes/api-contact.js lấy qua req.app.get("db")
// — tránh phải tạo thêm file db.js riêng.
app.set("db", db);

/* ---------- API ROUTES ---------- */
const contactRoutes = require("./routes/api-contact");
app.use("/api/contact", contactRoutes);

/* ---------- PHỤC VỤ FRONTEND TĨNH ----------
   Toàn bộ index.html/shop.html/product.html/assets/... nằm ngay
   thư mục gốc project -> serve tĩnh để `npm start` thay thế
   Live Server, đúng ghi chú trong README.md. */
app.use(express.static(PROJECT_ROOT));

// Route không khớp file tĩnh nào và không phải /api/* -> trả 404.html
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  // Bug 3 fix: sendFile cần callback lỗi — nếu vì lý do nào đó
  // 404.html không tồn tại đúng vị trí PROJECT_ROOT, vẫn phải trả về
  // response JSON nhất quán thay vì để Express tự xử lý không kiểm soát.
  res.status(404).sendFile(path.join(PROJECT_ROOT, "404.html"), (err) => {
    if (err) {
      res.status(404).json({ success: false, message: "Không tìm thấy trang." });
    }
  });
});

// Bug 2 fix: global error-handling middleware (4 tham số) — bắt các
// lỗi "lọt lưới" chưa được xử lý ở tầng route, đặc biệt lỗi parse JSON
// từ express.json() khi client gửi body không phải JSON hợp lệ, để
// luôn trả về JSON {success, message} nhất quán thay vì HTML error
// page mặc định của Express (tránh làm api-service.js ở frontend lỗi
// khi gọi response.json()). Không đổi các response lỗi đã có sẵn
// trong từng route — middleware này chỉ là lưới an toàn cuối cùng.
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return res.status(400).json({ success: false, message: "Dữ liệu gửi lên không hợp lệ." });
  }
  console.error("[app] Lỗi chưa được xử lý:", err);
  const status = err.status || err.statusCode || 500;
  return res.status(status).json({ success: false, message: "Lỗi máy chủ, vui lòng thử lại." });
});

app.listen(PORT, () => {
  console.log(`NEXUS VR backend đang chạy tại http://localhost:${PORT}`);
});

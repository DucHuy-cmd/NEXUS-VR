/* NEXUS VR — server/routes/api-contact.js   [PHỤ TRÁCH: Nhất Vũ]
   API tiếp nhận form liên hệ từ contact.html (Trường Vũ), lưu
   SQLite và gửi mail qua Nodemailer. Transporter được khai báo
   thẳng trong file này (thay vì tách server/mailer.js riêng)
   để đúng khớp phạm vi 3 file được giao. */

const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Transporter dùng chung cho cả module — đọc từ .env, KHÔNG
   hardcode email/mật khẩu trong source code. */
function createTransporter() {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    // Thiếu cấu hình .env -> không tạo transporter; route bên dưới
    // sẽ tự phát hiện qua biến `transporter === null` và vẫn lưu DB
    // bình thường, chỉ bỏ qua bước gửi mail thay vì làm sập server.
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD }
  });
}

const transporter = createTransporter();

/* POST /api/contact — { name, email, message } */
router.post("/", async (req, res) => {
  const db = req.app.get("db");
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ họ tên, email và nội dung." });
  }
  // Bug 1 fix: name/email/message có thể "truthy" mà không phải string
  // (VD: number, array, object đều lọt qua check ở trên) -> chặn cứng
  // kiểu dữ liệu TRƯỚC khi chạy EMAIL_REGEX/độ dài, tránh lỗi kiểu ngầm.
  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return res.status(400).json({ success: false, message: "Dữ liệu gửi lên không hợp lệ." });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: "Email không hợp lệ." });
  }
  if (String(message).trim().length < 5) {
    return res.status(400).json({ success: false, message: "Nội dung liên hệ quá ngắn." });
  }

  try {
    db.prepare(
      "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)"
    ).run(name, email, message);
  } catch (err) {
    console.error("[api-contact] lưu DB thất bại:", err);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ, vui lòng thử lại." });
  }

  // Dữ liệu đã lưu DB an toàn dù gửi mail thất bại (thiếu .env, mất
  // mạng...) — không để lỗi Nodemailer làm hỏng cả request.
  if (!transporter) {
    return res.json({
      success: true,
      emailSent: false,
      message: "Đã ghi nhận liên hệ (chưa cấu hình gửi email trên server)."
    });
  }

  try {
    await transporter.sendMail({
      from: `"NEXUS VR — Form liên hệ" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `[Liên hệ website] Tin nhắn mới từ ${name}`,
      text: `Họ tên: ${name}\nEmail: ${email}\n\nNội dung:\n${message}`
    });
    return res.json({ success: true, emailSent: true, message: "Đã gửi liên hệ thành công." });
  } catch (err) {
    console.error("[api-contact] gửi mail thất bại:", err);
    return res.json({
      success: true,
      emailSent: false,
      message: "Đã ghi nhận liên hệ nhưng gửi email thất bại, đội ngũ sẽ kiểm tra thủ công."
    });
  }
});

module.exports = router;

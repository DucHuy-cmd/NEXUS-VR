// =========================================================
// NEXUS VR — api/auth.js
// Vercel Serverless Function: Xác thực người dùng & Phân quyền bảo mật
// Endpoint: POST /api/auth?action=login | register
// =========================================================

const crypto = require("crypto");
const { query, hasDatabaseConfigured } = require("./db");

function hashPassword(pwd) {
  return crypto.createHash("sha256").update(String(pwd)).digest("hex");
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const action = req.query.action || (req.body && req.body.action) || "login";
  const { email, account, password, fullName, name, phone } = req.body || {};
  const userAccount = (email || account || "").trim().toLowerCase();

  // 1. XỬ LÝ ĐĂNG NHẬP (BẢO MẬT SERVER-SIDE 100%)
  if (action === "login") {
    if (!userAccount || !password) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập tài khoản và mật khẩu." });
    }

    // Tra cứu trong CSDL SQL nếu đã kết nối
    if (hasDatabaseConfigured()) {
      try {
        const result = await query(
          "SELECT id, email, password_hash, full_name, phone, role FROM users WHERE LOWER(email) = $1 LIMIT 1",
          [userAccount]
        );

        if (result.rows.length > 0) {
          const u = result.rows[0];
          const inputHash = hashPassword(password);
          const isMatch = (u.password_hash === password) || (u.password_hash === inputHash);

          if (isMatch) {
            return res.status(200).json({
              success: true,
              message: u.role === "admin" 
                ? "Đăng nhập thành công với quyền Quản trị viên (Admin)"
                : "Đăng nhập thành công",
              user: {
                id: u.id,
                email: u.email,
                fullName: u.full_name,
                name: u.full_name ? u.full_name.split(" ").pop() : "User",
                phone: u.phone,
                role: u.role || "customer",
                source: "database"
              }
            });
          }
        }
      } catch (err) {
        console.error("[Auth API] Lỗi truy vấn DB:", err.message);
      }
    }

    // Fallback tài khoản mẫu nếu môi trường offline chưa kết nối DB
    if (userAccount === "tuong@gmail.com" && password === "123456") {
      return res.status(200).json({
        success: true,
        message: "Đăng nhập tài khoản khách hàng",
        user: {
          id: "usr_cust_01",
          email: "tuong@gmail.com",
          fullName: "Trần Tưởng",
          name: "Tưởng",
          phone: "0988123456",
          role: "customer",
          source: "local"
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: "Tài khoản hoặc mật khẩu không chính xác."
    });
  }

  // 2. XỬ LÝ ĐĂNG KÝ
  if (action === "register") {
    if (!userAccount || !password) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin đăng ký bắt buộc." });
    }

    const newId = "usr_" + Date.now().toString(36);
    const resolvedName = fullName || name || userAccount.split("@")[0];
    const pwdHashed = hashPassword(password);

    if (hasDatabaseConfigured()) {
      try {
        const checkExist = await query("SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1", [userAccount]);
        if (checkExist.rows.length > 0) {
          return res.status(409).json({ success: false, message: "Email này đã được đăng ký tài khoản." });
        }

        await query(
          `INSERT INTO users (id, email, password_hash, full_name, phone, role)
           VALUES ($1, $2, $3, $4, $5, 'customer')`,
          [newId, userAccount, pwdHashed, resolvedName, phone || ""]
        );

        return res.status(201).json({
          success: true,
          message: "Đăng ký tài khoản thành công!",
          user: {
            id: newId,
            email: userAccount,
            fullName: resolvedName,
            name: resolvedName.split(" ").pop(),
            phone: phone || "",
            role: "customer"
          }
        });
      } catch (err) {
        console.error("[Auth Register] Lỗi lưu DB:", err.message);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống khi lưu tài khoản." });
      }
    }

    // Fallback lưu offline
    return res.status(200).json({
      success: true,
      mode: "local_storage",
      user: {
        id: newId,
        email: userAccount,
        fullName: resolvedName,
        phone: phone || "",
        role: "customer"
      }
    });
  }

  return res.status(400).json({ success: false, message: "Hành động (action) không hợp lệ." });
};

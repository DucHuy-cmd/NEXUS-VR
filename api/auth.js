// =========================================================
// NEXUS VR — api/auth.js
// Vercel Serverless Function: Xác thực người dùng & Phân quyền
// Endpoint: POST /api/auth?action=login | register
// =========================================================

const { query, hasDatabaseConfigured } = require("./db");

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

  // 1. XỬ LÝ ĐĂNG NHẬP
  if (action === "login") {
    // Tài khoản Admin Root chuẩn mực
    if (userAccount === "admin@nexusvr.vn" && password === "admin123") {
      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công với quyền Quản trị viên (Admin)",
        user: {
          id: "usr_admin_01",
          email: "admin@nexusvr.vn",
          fullName: "Quản Trị Viên NEXUS",
          name: "Quản Trị Viên",
          phone: "0901234567",
          role: "admin",
          source: "root"
        }
      });
    }

    // Tra cứu trong CSDL SQL nếu đã kết nối
    if (hasDatabaseConfigured()) {
      try {
        const result = await query(
          "SELECT id, email, password_hash, full_name, phone, role FROM users WHERE email = $1 LIMIT 1",
          [userAccount]
        );

        if (result.rows.length > 0) {
          const u = result.rows[0];
          if (u.password_hash === password) {
            return res.status(200).json({
              success: true,
              message: "Đăng nhập CSDL thành công",
              user: {
                id: u.id,
                email: u.email,
                fullName: u.full_name,
                name: u.full_name.split(" ").pop(),
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

    // Fallback tài khoản mẫu nếu chưa có DB hoặc tài khoản mẫu test
    if (userAccount === "tuong@gmail.com" && password === "123456") {
      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công tài khoản khách hàng mẫu",
        user: {
          id: "usr_cust_01",
          email: "tuong@gmail.com",
          fullName: "Trần Tưởng",
          name: "Tưởng",
          phone: "0988123456",
          role: "customer",
          source: "mock"
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

    if (hasDatabaseConfigured()) {
      try {
        await query(
          "INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES ($1, $2, $3, $4, $5, 'customer') ON CONFLICT (email) DO NOTHING",
          [newId, userAccount, password, resolvedName, phone || ""]
        );
      } catch (err) {
        console.error("[Auth Register] Lỗi ghi DB:", err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      user: {
        id: newId,
        email: userAccount,
        fullName: resolvedName,
        name: resolvedName,
        phone: phone || "",
        role: "customer"
      }
    });
  }

  return res.status(400).json({ success: false, message: "Hành động không hợp lệ." });
};

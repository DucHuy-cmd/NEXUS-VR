// =========================================================
// NEXUS VR — api/users.js
// Vercel Serverless Function: Quản lý Tài khoản Khách hàng & Phân quyền
// Endpoint: GET / PATCH / DELETE /api/users
// =========================================================

const { query, hasDatabaseConfigured } = require("./db");

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 1. GET: LẤY DANH SÁCH TÀI KHOẢN (BẢO MẬT: KHÔNG TRẢ VỀ PASSWORD_HASH)
  if (req.method === "GET") {
    if (hasDatabaseConfigured()) {
      try {
        const result = await query(
          "SELECT id, email, full_name, phone, role, created_at FROM users ORDER BY created_at DESC"
        );
        const mappedUsers = result.rows.map((row) => ({
          id: row.id,
          email: row.email,
          fullName: row.full_name,
          name: row.full_name ? row.full_name.split(" ").pop() : "Khách",
          phone: row.phone || "Chưa cập nhật",
          role: row.role || "customer",
          createdAt: new Date(row.created_at).toLocaleString("vi-VN")
        }));

        return res.status(200).json({
          success: true,
          count: mappedUsers.length,
          users: mappedUsers
        });
      } catch (err) {
        console.error("[Users GET API] Lỗi truy vấn DB:", err.message);
      }
    }

    // Fallback nếu chưa có kết nối DB
    return res.status(200).json({
      success: true,
      count: 2,
      isFallback: true,
      users: [
        {
          id: "usr_admin_01",
          email: "admin@nexusvr.vn",
          fullName: "Quản Trị Viên NEXUS",
          name: "Quản Trị Viên",
          phone: "0901234567",
          role: "admin",
          createdAt: "31/10/2026, 14:00:00"
        },
        {
          id: "usr_cust_01",
          email: "khachhang@nexusvr.vn",
          fullName: "Trần Hoàng Nam",
          name: "Nam",
          phone: "0988123456",
          role: "customer",
          createdAt: "31/10/2026, 14:30:00"
        }
      ]
    });
  }

  // 2. PATCH: CẬP NHẬT VAI TRÒ (PHÂN QUYỀN ADMIN / CUSTOMER)
  if (req.method === "PATCH") {
    const { id, role } = req.body || {};
    if (!id || !role || !["customer", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Dữ liệu cập nhật không hợp lệ." });
    }

    if (hasDatabaseConfigured()) {
      try {
        await query(
          "UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
          [role, id]
        );
        return res.status(200).json({
          success: true,
          message: `Đã cập nhật vai trò người dùng thành '${role}'.`
        });
      } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    return res.status(200).json({ success: true, mode: "local_storage" });
  }

  // 3. DELETE: XÓA TÀI KHOẢN KHÁCH HÀNG (BẢO VỆ ADMIN GỐC KHÔNG THỂ BỊ XÓA)
  if (req.method === "DELETE") {
    const { id } = req.body || req.query || {};
    if (!id) {
      return res.status(400).json({ success: false, message: "Thiếu ID người dùng cần xóa." });
    }

    if (id === "usr_admin_01") {
      return res.status(403).json({ success: false, message: "Không thể xóa tài khoản Quản trị viên tối cao." });
    }

    if (hasDatabaseConfigured()) {
      try {
        await query("DELETE FROM users WHERE id = $1 AND role != 'admin'", [id]);
        return res.status(200).json({ success: true, message: "Đã xóa tài khoản người dùng thành công." });
      } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }

    return res.status(200).json({ success: true, mode: "local_storage" });
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
};

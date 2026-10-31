// =========================================================
// NEXUS VR — api/orders.js
// Vercel Serverless Function: Quản lý Đơn Hàng (Orders CRUD)
// Endpoint: GET / POST / PATCH /api/orders
// =========================================================

const { query, hasDatabaseConfigured } = require("./db");

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 1. GET: LẤY DANH SÁCH ĐƠN HÀNG
  if (req.method === "GET") {
    const { email, admin } = req.query;
    const isAdmin = admin === "true" || admin === "1";

    if (hasDatabaseConfigured()) {
      try {
        let sql = "SELECT * FROM orders ORDER BY created_at DESC";
        let params = [];

        if (!isAdmin && email) {
          sql = "SELECT * FROM orders WHERE user_email = $1 ORDER BY created_at DESC";
          params = [email.toLowerCase().trim()];
        }

        const result = await query(sql, params);
        const mappedOrders = result.rows.map((row) => ({
          id: row.id,
          code: row.order_code,
          customer: {
            name: row.customer_name,
            phone: row.customer_phone,
            email: row.user_email,
            address: row.customer_address
          },
          total: Number(row.total_amount),
          shippingFee: Number(row.shipping_fee || 0),
          paymentMethod: row.payment_method,
          status: row.status,
          notes: row.notes || "",
          items: typeof row.items === "string" ? JSON.parse(row.items) : row.items,
          createdAt: new Date(row.created_at).toLocaleString("vi-VN")
        }));

        return res.status(200).json({ success: true, count: mappedOrders.length, orders: mappedOrders });
      } catch (err) {
        console.error("[Orders GET] Lỗi query DB:", err.message);
      }
    }

    // Phản hồi mẫu nếu chưa có DB hoặc DB trống
    return res.status(200).json({
      success: true,
      message: "Dữ liệu đơn hàng hệ thống",
      isMock: true,
      orders: []
    });
  }

  // 2. POST: TẠO ĐƠN HÀNG MỚI (CHECKOUT)
  if (req.method === "POST") {
    const data = req.body || {};
    const orderId = "ord_" + Date.now().toString(36);
    const orderCode = data.code || "#NEXUS-" + Math.floor(100000 + Math.random() * 900000);
    const cust = data.customer || {};

    if (hasDatabaseConfigured()) {
      try {
        await query(
          `INSERT INTO orders (id, order_code, user_email, customer_name, customer_phone, customer_address, total_amount, shipping_fee, payment_method, status, items)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            orderId,
            orderCode,
            cust.email || "",
            cust.name || "Khách Hàng",
            cust.phone || "",
            cust.address || "",
            Number(data.total || data.totalAmount || 0),
            Number(data.shippingFee || 0),
            data.paymentMethod || "VietQR Napas 247",
            (data.status === "active" || !data.status) ? "processing" : data.status,
            JSON.stringify(data.items || [])
          ]
        );
      } catch (err) {
        console.error("[Orders POST] Lỗi lưu DB:", err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      order: {
        id: orderId,
        code: orderCode,
        status: (data.status === "active" || !data.status) ? "processing" : data.status,
        total: data.total
      }
    });
  }

  // 3. PATCH: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (DÀNH CHO ADMIN HOẶC XÁC NHẬN NHẬN HÀNG)
  if (req.method === "PATCH") {
    const { orderId, id, code, status, reason, notes } = req.body || {};
    const newStatus = status;
    const targetId = orderId || id;
    const cancelNote = reason || notes || null;

    if (!newStatus || (!targetId && !code)) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin cập nhật." });
    }

    if (hasDatabaseConfigured()) {
      try {
        if (cancelNote) {
          await query(
            "UPDATE orders SET status = $1, notes = $2, updated_at = NOW() WHERE id = $3 OR order_code = $4",
            [newStatus, cancelNote, targetId || "", code || ""]
          );
        } else {
          await query(
            "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 OR order_code = $3",
            [newStatus, targetId || "", code || ""]
          );
        }
      } catch (err) {
        console.error("[Orders PATCH] Lỗi cập nhật DB:", err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái đơn hàng sang ${newStatus}`
    });
  }

    // 4. DELETE: XÓA ĐƠN HÀNG HOẶC DỌN SẠCH ĐƠN RÁC
  if (req.method === "DELETE") {
    if (hasDatabaseConfigured()) {
      try {
        await query("DELETE FROM orders");
        return res.status(200).json({ success: true, message: "Đã xóa toàn bộ đơn hàng trong Database." });
      } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }
    return res.status(200).json({ success: true, mode: "local_storage" });
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
};

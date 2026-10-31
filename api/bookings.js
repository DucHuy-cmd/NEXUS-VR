// =========================================================
// NEXUS VR — api/bookings.js
// Vercel Serverless Function: Đặt lịch Showroom Flagship & Thẻ VIP
// Endpoint: GET / POST / PATCH /api/bookings
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

  // 1. GET: LẤY DANH SÁCH LỊCH HẸN CHO ADMIN CONSOLE
  if (req.method === "GET") {
    if (hasDatabaseConfigured()) {
      try {
        const result = await query("SELECT * FROM bookings ORDER BY created_at DESC");
        const mapped = result.rows.map((row) => ({
          id: row.id,
          name: row.customer_name,
          email: row.customer_email,
          phone: row.customer_phone,
          service: row.service_type,
          timeSlot: row.time_slot,
          bookingDate: row.booking_date,
          message: row.message,
          status: row.status,
          createdAt: new Date(row.created_at).toLocaleString("vi-VN")
        }));
        return res.status(200).json({ success: true, count: mapped.length, bookings: mapped });
      } catch (err) {
        console.error("[Bookings GET] Lỗi query DB:", err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Danh sách lịch hẹn showroom",
      bookings: []
    });
  }

  // 2. POST: ĐĂNG KÝ LỊCH HẸN MỚI (TỪ FORM THẺ VIP TRANG CONTACT)
  if (req.method === "POST") {
    const data = req.body || {};
    const bookingId = "bkg_" + Date.now().toString(36);

    if (hasDatabaseConfigured()) {
      try {
        await query(
          `INSERT INTO bookings (id, customer_name, customer_email, customer_phone, service_type, time_slot, booking_date, message, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            bookingId,
            data.name || "Quý Khách",
            data.email || "",
            data.phone || "",
            data.service || "Trải nghiệm NEXUS Vision Pro 1:1",
            data.timeSlot || "10:00 - 11:30",
            data.bookingDate || new Date().toLocaleDateString("vi-VN"),
            data.message || "",
            data.status || "pending"
          ]
        );
      } catch (err) {
        console.error("[Bookings POST] Lỗi lưu DB:", err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Đặt lịch trải nghiệm Showroom VIP thành công",
      booking: {
        id: bookingId,
        name: data.name,
        service: data.service,
        status: "pending"
      }
    });
  }

  // 3. PATCH: DUYỆT / XÁC NHẬN LỊCH HẸN (DÀNH CHO ADMIN)
  if (req.method === "PATCH") {
    const { bookingId, id, status, reason } = req.body || {};
    const targetId = bookingId || id;

    if (!targetId || !status) {
      return res.status(400).json({ success: false, message: "Thiếu mã lịch hẹn hoặc trạng thái mới." });
    }

    if (hasDatabaseConfigured()) {
      try {
        if (reason) {
          await query(
            "UPDATE bookings SET status = $1, message = CASE WHEN message IS NULL OR message = '' THEN ('Lý do: ' || $3) ELSE (message || ' | Lý do: ' || $3) END WHERE id = $2",
            [status, targetId, reason]
          );
        } else {
          await query("UPDATE bookings SET status = $1 WHERE id = $2", [status, targetId]);
        }
      } catch (err) {
        console.error("[Bookings PATCH] Lỗi cập nhật DB:", err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật lịch hẹn sang trạng thái "${status}"`
    });
  }

    // 4. DELETE: XÓA LỊCH HẸN HOẶC DỌN SẠCH LỊCH RÁC
  if (req.method === "DELETE") {
    if (hasDatabaseConfigured()) {
      try {
        await query("DELETE FROM bookings");
        return res.status(200).json({ success: true, message: "Đã xóa toàn bộ lịch hẹn trong Database." });
      } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
    }
    return res.status(200).json({ success: true, mode: "local_storage" });
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
};

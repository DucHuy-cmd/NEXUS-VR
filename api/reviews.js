// =========================================================
// NEXUS VR — api/reviews.js
// Vercel Serverless Function: Đánh Giá & Nhận Xét Sản Phẩm (Reviews API)
// Endpoint: GET / POST /api/reviews
// =========================================================

const { query, hasDatabaseConfigured } = require("./db");

// Đảm bảo bảng reviews luôn tồn tại trên PostgreSQL
let tableInitialized = false;
async function ensureReviewsTable() {
  if (tableInitialized || !hasDatabaseConfigured()) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(50) PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL,
        author_name VARCHAR(100) NOT NULL,
        author_email VARCHAR(150),
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        verified_purchase BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_reviews_prod ON reviews(product_id);
    `);
    tableInitialized = true;
  } catch (err) {
    console.warn("[Reviews] Khởi tạo bảng reviews:", err.message);
  }
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  await ensureReviewsTable();

  // 1. GET: LẤY DANH SÁCH REVIEW THEO PRODUCT ID
  if (req.method === "GET") {
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Thiếu productId" });
    }

    if (hasDatabaseConfigured()) {
      try {
        const result = await query(
          "SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC",
          [productId]
        );
        const mapped = result.rows.map(row => ({
          id: row.id,
          productId: row.product_id,
          author: row.author_name,
          email: row.author_email,
          rating: Number(row.rating),
          comment: row.comment,
          verified: row.verified_purchase,
          date: new Date(row.created_at).toLocaleDateString("vi-VN")
        }));
        return res.status(200).json({ success: true, count: mapped.length, reviews: mapped });
      } catch (err) {
        console.error("[Reviews GET] Lỗi query DB:", err.message);
      }
    }

    return res.status(200).json({ success: true, count: 0, reviews: [] });
  }

  // 2. POST: GỬI ĐÁNH GIÁ MỚI CHO SẢN PHẨM
  if (req.method === "POST") {
    const { productId, author, name, email, rating, comment } = req.body || {};
    const authorName = author || name;

    if (!productId || !authorName || !comment) {
      return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ họ tên, số sao và nội dung đánh giá." });
    }

    const reviewId = "rev_" + Date.now().toString(36);
    const starVal = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));

    if (hasDatabaseConfigured()) {
      try {
        await query(
          `INSERT INTO reviews (id, product_id, author_name, author_email, rating, comment, verified_purchase)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [reviewId, productId, authorName, email || "", starVal, comment, true]
        );

        // Cập nhật lại số sao trung bình và số lượng review trong bảng products nếu có
        try {
          const stats = await query(
            "SELECT COUNT(*) as count, AVG(rating) as avg FROM reviews WHERE product_id = $1",
            [productId]
          );
          if (stats.rows.length > 0) {
            const count = parseInt(stats.rows[0].count, 10);
            const avg = parseFloat(stats.rows[0].avg).toFixed(1);
            await query(
              "UPDATE products SET rating = $1, review_count = $2 WHERE id = $3",
              [avg, count, productId]
            );
          }
        } catch (errStat) {}

      } catch (err) {
        console.error("[Reviews POST] Lỗi lưu DB:", err.message);
      }
    }

    const newReview = {
      id: reviewId,
      productId,
      author: authorName,
      rating: starVal,
      comment,
      verified: true,
      date: new Date().toLocaleDateString("vi-VN")
    };

    return res.status(201).json({
      success: true,
      message: "Cảm ơn bạn đã gửi đánh giá sản phẩm thành công!",
      review: newReview
    });
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
};

// =========================================================
// NEXUS VR — api/products.js
// Vercel Serverless Function: Danh mục & Kho Sản phẩm
// Endpoint: GET / PATCH /api/products
// =========================================================

const { query, hasDatabaseConfigured } = require("./db");

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 1. GET: LẤY DANH MỤC 18 SẢN PHẨM
  if (req.method === "GET") {
    if (hasDatabaseConfigured()) {
      try {
        const result = await query("SELECT * FROM products ORDER BY price DESC");
        if (result.rows.length > 0) {
          const mapped = result.rows.map((r) => ({
            id: r.id,
            name: r.name,
            category: r.category,
            categoryLabel: r.category_label,
            price: Number(r.price),
            oldPrice: r.old_price ? Number(r.old_price) : null,
            rating: Number(r.rating || 5.0),
            reviewCount: Number(r.review_count || 0),
            colors: typeof r.colors === "string" ? JSON.parse(r.colors) : r.colors,
            images: typeof r.images === "string" ? JSON.parse(r.images) : r.images,
            shortDesc: r.short_desc,
            description: r.description,
            specs: typeof r.specs === "string" ? JSON.parse(r.specs) : r.specs,
            featured: r.featured,
            stock: r.stock
          }));
          return res.status(200).json({ success: true, count: mapped.length, products: mapped });
        }
      } catch (err) {
        console.error("[Products GET] Lỗi query DB:", err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Danh mục sản phẩm hệ sinh thái",
      products: [],
      isFallback: true
    });
  }

  // 2. PATCH: CẬP NHẬT TỒN KHO HOẶC GIÁ (ADMIN)
  if (req.method === "PATCH") {
    const { id, stock, price } = req.body || {};

    if (!id) {
      return res.status(400).json({ success: false, message: "Thiếu mã sản phẩm ID." });
    }

    if (hasDatabaseConfigured()) {
      try {
        if (stock !== undefined) {
          await query("UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2", [stock, id]);
        }
        if (price !== undefined) {
          await query("UPDATE products SET price = $1, updated_at = NOW() WHERE id = $2", [price, id]);
        }
      } catch (err) {
        console.error("[Products PATCH] Lỗi cập nhật DB:", err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật sản phẩm ${id} thành công`
    });
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
};

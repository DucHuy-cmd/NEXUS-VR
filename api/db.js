// =========================================================
// NEXUS VR — api/db.js
// Quản lý kết nối Cơ sở Dữ liệu PostgreSQL / Vercel Postgres
// Hỗ trợ chế độ Hybrid: Kết nối SQL thật & Fallback tự động
// =========================================================

let pool = null;

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  if (!pool) {
    try {
      const { Pool } = require("pg");
      pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false
        },
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });

      pool.on("error", (err) => {
        console.error("[PostgreSQL] Lỗi kết nối Pool ngoài ý muốn:", err);
      });
    } catch (e) {
      console.warn("[PostgreSQL] Thư viện pg chưa sẵn sàng hoặc môi trường offline:", e.message);
      return null;
    }
  }

  return pool;
}

async function query(text, params) {
  const p = getPool();
  if (!p) {
    return { rows: [], isMock: true };
  }

  const start = Date.now();
  const res = await p.query(text, params);
  const duration = Date.now() - start;
  // console.log('[SQL Executed]', { text: text.slice(0, 50), duration, rows: res.rowCount });
  return res;
}

module.exports = {
  getPool,
  query,
  hasDatabaseConfigured: () => Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL)
};

// =========================================================
// NEXUS VR — api/health.js
// Vercel Serverless Function: Kiểm tra trạng thái máy chủ & CSDL
// Endpoint: GET /api/health
// =========================================================

const { query, hasDatabaseConfigured } = require("./db");

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  let dbConnected = false;
  let dbVersion = null;

  if (hasDatabaseConfigured()) {
    try {
      const result = await query("SELECT version() as ver, NOW() as current_time");
      if (result && result.rows && result.rows.length > 0) {
        dbConnected = true;
        dbVersion = result.rows[0].ver;
      }
    } catch (e) {
      dbConnected = false;
    }
  }

  return res.status(200).json({
    status: "online",
    system: "NEXUS VR Spatial E-Commerce Platform",
    environment: process.env.NODE_ENV || "production",
    database: {
      configured: hasDatabaseConfigured(),
      connected: dbConnected,
      engine: dbConnected ? "PostgreSQL (Vercel Postgres / Neon)" : "Mock Storage Fallback",
      version: dbVersion
    },
    timestamp: new Date().toISOString()
  });
};

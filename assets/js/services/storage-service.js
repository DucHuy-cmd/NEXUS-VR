/* =========================================================
   NEXUS VR — services/storage-service.js   [PHỤ TRÁCH: Đức Huy]
   TẦNG 1 - DATA & SERVICES
   Quản lý tập trung việc đọc/ghi localStorage. Các trang khác
   (Hưng, Nhất Vũ, Tường) KHÔNG tự gọi localStorage.getItem()
   trực tiếp — luôn gọi qua các hàm dưới đây để tránh sai key
   hoặc sai định dạng dữ liệu.

   4 KEY DÙNG CHUNG TOÀN SITE (không tự đặt tên khác):
   - nexus_cart     : [{ id, qty, color }, ...]
   - nexus_wishlist : ["vr-001", "vr-002", ...]
   - nexus_theme    : "dark" | "light"
   - nexus_user     : { name, email } | null
   ========================================================= */

/* ---------- GIỎ HÀNG ---------- */
function getCart() {
  try { return JSON.parse(localStorage.getItem("nexus_cart")) || []; }
  catch (e) { return []; }
}
function saveCart(cart) {
  localStorage.setItem("nexus_cart", JSON.stringify(cart));
}
function getCartCount() {
  return getCart().reduce((sum, item) => sum + (item.qty || 1), 0);
}

/* ---------- YÊU THÍCH (WISHLIST) ---------- */
function getWishlist() {
  try { return JSON.parse(localStorage.getItem("nexus_wishlist")) || []; }
  catch (e) { return []; }
}
function saveWishlist(list) {
  localStorage.setItem("nexus_wishlist", JSON.stringify(list));
}

/* ---------- NGƯỜI DÙNG ĐĂNG NHẬP ---------- */
function getCurrentUser() {
  // Nhất Vũ: sau khi có API /api/auth/me thật (Ngày 8-9), có thể
  // thay hàm này bằng bản gọi fetch() — nhưng giữ nguyên TÊN HÀM
  // getCurrentUser() để các trang khác không phải sửa gì thêm.
  try { return JSON.parse(localStorage.getItem("nexus_user")); }
  catch (e) { return null; }
}
function saveCurrentUser(user) {
  localStorage.setItem("nexus_user", JSON.stringify(user));
}
function clearCurrentUser() {
  localStorage.removeItem("nexus_user");
}

/* ---------- THEME ---------- */
// [FIX #1] Giao diện MẶC ĐỊNH (không lưu gì / không có class) là bản
// SÁNG (Warm Cream) — nên giá trị fallback đúng phải là "light",
// không phải "dark" như trước (lúc đó bảng màu còn là Neon/Dark).
function getSavedTheme() {
  return localStorage.getItem("nexus_theme") || "light";
}
function saveTheme(mode) {
  localStorage.setItem("nexus_theme", mode);
}
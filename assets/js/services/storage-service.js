/* ==========================================================================
NEXUS VR — services/storage-service.js
QUẢN LÝ DỮ LIỆU PHÂN LẬP THEO TÀI KHOẢN (USER-SCOPED STORAGE)
========================================================================== */
(function () {
  "use strict";

  const REGISTERED_USERS_KEY = "nexus_registered_users";
  const CURRENT_USER_KEY = "nexus_user";

  // Lấy đuôi key lưu trữ riêng theo Email hoặc Username của tài khoản hiện tại
  function getUserKeySuffix() {
    try {
      const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
      if (user && (user.email || user.account)) {
        return "_" + (user.email || user.account).toLowerCase().replace(/[^a-z0-9]/g, "_");
      }
    } catch (e) {}
    return "_guest";
  }

  /* --------------------------------------------------------------------------
  1. QUẢN LÝ GIỎ HÀNG THUỘC TÀI KHOẢN
  -------------------------------------------------------------------------- */
  function getCart() {
    const key = "nexus_cart" + getUserKeySuffix();
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    const key = "nexus_cart" + getUserKeySuffix();
    localStorage.setItem(key, JSON.stringify(cart || []));
    window.dispatchEvent(new CustomEvent("nexus:cart-updated"));
  }

  function clearCart() {
    saveCart([]);
  }

  /* --------------------------------------------------------------------------
  2. QUẢN LÝ ĐƠN HÀNG THUỘC TÀI KHOẢN
  -------------------------------------------------------------------------- */
  function getOrders() {
    const key = "nexus_orders" + getUserKeySuffix();
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveOrders(orders) {
    const key = "nexus_orders" + getUserKeySuffix();
    localStorage.setItem(key, JSON.stringify(orders || []));
  }

  /* --------------------------------------------------------------------------
  3. QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG & DANH SÁCH ĐĂNG KÝ
  -------------------------------------------------------------------------- */
  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch (e) {
      return null;
    }
  }

  function saveCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("nexus:user-updated"));
  }

  function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.dispatchEvent(new CustomEvent("nexus:user-updated"));
  }

  function getRegisteredUsers() {
    try {
      return JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveRegisteredUsers(users) {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users || []));
  }

  // Export toàn bộ dịch vụ ra window
  window.storageService = {
    getUserKeySuffix,
    getCart,
    saveCart,
    clearCart,
    getOrders,
    saveOrders,
    getCurrentUser,
    saveCurrentUser,
    clearCurrentUser,
    getRegisteredUsers,
    saveRegisteredUsers
  };

  // Tạo sẵn các hàm fallback toàn cục
  window.getCurrentUser = getCurrentUser;
  window.saveCurrentUser = saveCurrentUser;
  window.clearCurrentUser = clearCurrentUser;
})();
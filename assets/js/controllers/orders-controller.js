/* ==========================================================================
NEXUS VR — controllers/orders-controller.js
QUẢN LÝ ĐƠN HÀNG PHÂN LẬP THEO TÀI KHOẢN (USER-SCOPED ORDERS)
========================================================================== */
(function () {
  "use strict";

  let currentTab = "active";

  const formatVND = (num) => (num || 0).toLocaleString("vi-VN") + " ₫";

  document.addEventListener("DOMContentLoaded", initOrdersController);

  function initOrdersController() {
    initTabs();
    renderOrders();
  }

  function getUserKeySuffix() {
    if (window.storageService && typeof window.storageService.getUserKeySuffix === "function") {
      return window.storageService.getUserKeySuffix();
    }
    try {
      const user = typeof window.getCurrentUser === "function"
        ? window.getCurrentUser()
        : JSON.parse(localStorage.getItem("nexus_user") || "null");

      if (user && (user.email || user.account)) {
        return "_" + (user.email || user.account).toLowerCase().replace(/[^a-z0-9]/g, "_");
      }
    } catch (e) {}
    return "_guest";
  }

  function getOrders() {
    if (window.storageService && typeof window.storageService.getOrders === "function") {
      return window.storageService.getOrders();
    }
    const key = "nexus_orders" + getUserKeySuffix();
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveOrders(orders) {
    if (window.storageService && typeof window.storageService.saveOrders === "function") {
      window.storageService.saveOrders(orders);
      return;
    }
    const key = "nexus_orders" + getUserKeySuffix();
    localStorage.setItem(key, JSON.stringify(orders || []));
  }

  function initTabs() {
    const tabBtns = document.querySelectorAll(".orders-tab-btn");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        tabBtns.forEach((b) => b.classList.remove("is-active"));
        this.classList.add("is-active");
        currentTab = this.getAttribute("data-tab");
        renderOrders();
      });
    });
  }

  function renderOrders() {
    const container = document.getElementById("ordersListContainer");
    if (!container) return;

    const orders = getOrders();
    const filteredOrders = orders.filter((o) => o.status === currentTab);

    // TÀI KHOẢN CHƯA ĐẶT HÀNG HOẶC TRỐNG -> HIỂN THỊ MÀN HÌNH TRỐNG SẠCH SẼ
    if (filteredOrders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; background: #fff; border-radius: 16px; border: 1px solid var(--border, #E5DECE); box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--bg-secondary, #F2ECE4); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--accent, #A67C52); font-size: 1.5rem;">📦</div>
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 6px; color: var(--text-primary, #231F1C);">Chưa có đơn hàng nào</h3>
          <p style="color: var(--text-secondary, #726657); font-size: 0.9rem; margin-bottom: 20px;">Bạn chưa thực hiện giao dịch nào trong mục này.</p>
          <a href="shop.html" style="display: inline-block; padding: 10px 24px; background: var(--accent, #A67C52); color: #fff; border-radius: 999px; font-weight: 600; text-decoration: none; font-size: 0.875rem;">Khám phá cửa hàng ngay</a>
        </div>
      `;
      return;
    }

    container.innerHTML = "";

    filteredOrders.forEach((order) => {
      const card = document.createElement("div");
      card.className = "order-card";

      let badgeClass = "active";
      if (order.status === "completed") badgeClass = "completed";
      if (order.status === "cancelled") badgeClass = "cancelled";

      let productsHTML = "";
      (order.items || []).forEach((item) => {
        productsHTML += `
          <div class="order-product-item" style="display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--border, #E5DECE); align-items: center;">
            <img src="${item.image || 'assets/images/placeholder.svg'}" class="order-product-img" alt="${item.name || 'Sản phẩm'}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 8px;">
            <div style="flex: 1;">
              <strong style="display: block; font-size: 0.95rem; color: var(--text-primary, #231F1C);">${item.name || 'Sản phẩm NEXUS VR'}</strong>
              <span style="font-size: 0.8rem; color: var(--text-secondary, #726657);">${item.selectedColor ? 'Màu: ' + item.selectedColor + ' • ' : ''}Số lượng: ${item.qty || 1}</span>
            </div>
            <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary, #231F1C);">${formatVND((item.price || 0) * (item.qty || 1))}</div>
          </div>
        `;
      });

      let actionsHTML = "";
      if (order.status === "active") {
        actionsHTML = `
          <div class="btn-action-group" style="display: flex; gap: 10px;">
            <button type="button" class="btn-cancel" data-id="${order.id}" style="padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border, #E5DECE); background: #fff; color: #d32f2f; font-weight: 600; cursor: pointer; font-size: 0.85rem;">Hủy đơn</button>
            <button type="button" class="btn-received" data-id="${order.id}" style="padding: 8px 16px; border-radius: 8px; border: none; background: #2e7d32; color: #fff; font-weight: 600; cursor: pointer; font-size: 0.85rem;">Đã nhận</button>
          </div>
        `;
      } else if (order.status === "completed") {
        actionsHTML = `<div style="font-size: 0.85rem; color: #2e7d32; font-weight: 600;">✓ Giao hàng thành công</div>`;
      } else if (order.status === "cancelled") {
        actionsHTML = `<div style="font-size: 0.85rem; color: #d32f2f; font-weight: 600;">✕ Đã hủy đơn hàng</div>`;
      }

      card.innerHTML = `
        <div class="order-card-header" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--border, #E5DECE); margin-bottom: 12px;">
          <div>
            <span class="order-code" style="font-weight: 700; color: var(--accent, #A67C52); font-size: 1.05rem;">${order.code || '#NX-000000'}</span>
            <span style="font-size: 0.8rem; color: var(--text-secondary, #726657); margin-left: 8px;">(${order.createdAt || ''})</span>
          </div>
          <span class="order-status-badge ${badgeClass}" style="padding: 4px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 600;">${order.statusText || 'Đơn hàng'}</span>
        </div>

        <div class="order-products-list">${productsHTML}</div>

        <div class="order-card-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; margin-top: 8px;">
          <div>
            <div style="font-size: 0.825rem; color: var(--text-secondary, #726657); margin-bottom: 2px;">Phương thức: ${order.paymentMethod || 'COD'}</div>
            <div class="order-total-price" style="font-size: 1.1rem; font-weight: 700; color: var(--accent, #A67C52);">Tổng cộng: ${formatVND(order.totalAmount)}</div>
          </div>
          ${actionsHTML}
        </div>
      `;

      container.appendChild(card);
    });

    bindOrderActionEvents();
  }

  function bindOrderActionEvents() {
    // HỦY ĐƠN HÀNG
    document.querySelectorAll(".btn-cancel").forEach((btn) => {
      btn.addEventListener("click", function () {
        const orderId = this.getAttribute("data-id");
        if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
          const orders = getOrders();
          const target = orders.find((o) => o.id === orderId);
          if (target) {
            target.status = "cancelled";
            target.statusText = "Đã hủy đơn hàng";
            saveOrders(orders);
            renderOrders();
            if (typeof window.showToast === "function") window.showToast("Đã hủy đơn hàng thành công.", "info");
          }
        }
      });
    });

    // BẤM "ĐÃ NHẬN" -> CHUYỂN SANG ĐÃ MUA
    document.querySelectorAll(".btn-received").forEach((btn) => {
      btn.addEventListener("click", function () {
        const orderId = this.getAttribute("data-id");
        if (confirm("Xác nhận bạn đã nhận được sản phẩm?")) {
          const orders = getOrders();
          const target = orders.find((o) => o.id === orderId);
          if (target) {
            target.status = "completed";
            target.statusText = "Giao hàng thành công";
            saveOrders(orders);
            renderOrders();
            if (typeof window.showToast === "function") window.showToast("Xác nhận đã nhận hàng thành công!", "success");
          }
        }
      });
    });
  }
})();
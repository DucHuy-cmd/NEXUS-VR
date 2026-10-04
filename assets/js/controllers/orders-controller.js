/* ==========================================================================
NEXUS VR — controllers/orders-controller.js
QUẢN LÝ ĐƠN HÀNG: ĐANG XỬ LÝ, ĐÃ NHẬN VÀ HỦY ĐƠN HÀNG
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

  function getOrders() {
    try {
      return JSON.parse(localStorage.getItem("nexus_orders") || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveOrders(orders) {
    localStorage.setItem("nexus_orders", JSON.stringify(orders));
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

    if (filteredOrders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; background: #fff; border-radius: 16px; border: 1px solid var(--border, #E5DECE);">
          <p style="color: var(--text-secondary, #726657); font-size: 1.05rem;">Không có đơn hàng nào trong mục này.</p>
          <a href="shop.html" style="display: inline-block; margin-top: 12px; color: var(--accent, #A67C52); font-weight: 600; text-decoration: none;">Khám phá sản phẩm ngay →</a>
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
          <div class="order-product-item">
            <img src="${item.image || 'assets/images/placeholder.svg'}" class="order-product-img" alt="${item.name || 'Sản phẩm'}">
            <div style="flex: 1;">
              <strong style="display: block; font-size: 0.95rem;">${item.name || 'Sản phẩm NEXUS VR'}</strong>
              <span style="font-size: 0.8rem; color: var(--text-secondary, #726657);">Màu: ${item.selectedColor || 'Chuẩn'} | Số lượng: ${item.qty || 1}</span>
            </div>
            <div style="font-weight: 600; font-size: 0.9rem;">${formatVND((item.price || 0) * (item.qty || 1))}</div>
          </div>
        `;
      });

      let actionsHTML = "";
      if (order.status === "active") {
        actionsHTML = `
          <div class="btn-action-group">
            <button type="button" class="btn-cancel" data-id="${order.id}">Hủy đơn</button>
            <button type="button" class="btn-received" data-id="${order.id}">Đã nhận</button>
          </div>
        `;
      } else if (order.status === "completed") {
        actionsHTML = `<div style="font-size: 0.85rem; color: #2e7d32; font-weight: 600;">✓ Giao hàng thành công</div>`;
      }

      card.innerHTML = `
        <div class="order-card-header">
          <div>
            <span class="order-code">${order.code || '#NX-000000'}</span>
            <span style="font-size: 0.8rem; color: var(--text-secondary, #726657); margin-left: 8px;">(${order.createdAt || ''})</span>
          </div>
          <span class="order-status-badge ${badgeClass}">${order.statusText || 'Đơn hàng'}</span>
        </div>

        <div class="order-products-list">${productsHTML}</div>

        <div class="order-card-footer">
          <div>
            <span style="font-size: 0.85rem; color: var(--text-secondary, #726657);">Thanh toán: ${order.paymentMethod || 'COD'}</span>
            <div class="order-total-price">Tổng thanh toán: ${formatVND(order.totalAmount)}</div>
          </div>
          ${actionsHTML}
        </div>
      `;

      container.appendChild(card);
    });

    bindOrderActionEvents();
  }

  function bindOrderActionEvents() {
    // 1. HỦY ĐƠN HÀNG
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

    // 2. BẤM "ĐÃ NHẬN" -> XÁC NHẬN & CHUYỂN NGAY SANG "LỊCH SỬ ĐÃ MUA"
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
/* ==========================================================================
NEXUS VR — controllers/orders-controller.js
QUẢN LÝ ĐƠN HÀNG PHÂN LẬP THEO TÀI KHOẢN (USER-SCOPED ORDERS)
XÁC NHẬN "ĐÃ NHẬN" VÀ "HỦY ĐƠN" QUA BẢNG MODAL APPLE GLASSMORPHISM
========================================================================== */
(function () {
  "use strict";

  let currentTab = "active";
  let pendingOrderIdToConfirm = null; // Lưu ID đơn hàng chờ xác nhận "Đã nhận"
  let pendingOrderIdToCancel = null;  // Lưu ID đơn hàng chờ xác nhận "Hủy đơn"

  const formatVND = (num) => (num || 0).toLocaleString("vi-VN") + " ₫";

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  document.addEventListener("DOMContentLoaded", initOrdersController);

  function initOrdersController() {
    initTabs();
    initConfirmReceivedModal();
    initConfirmCancelModal();
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

      // THANH TIẾN ĐỘ VẬN CHUYỂN 3 CHẶNG CHO ĐƠN ĐANG XỬ LÝ
      let stepperHTML = "";
      if (order.status === "active") {
        stepperHTML = `
          <div class="order-stepper-bar">
            <div class="order-stepper-node is-done">
              <span>✓</span>
              <span>Đã xác nhận</span>
            </div>
            <div class="order-stepper-divider is-done"></div>
            <div class="order-stepper-node is-active">
              <span>🚚</span>
              <span>Đang vận chuyển</span>
            </div>
            <div class="order-stepper-divider"></div>
            <div class="order-stepper-node">
              <span>📦</span>
              <span>Dự kiến giao 1-3 ngày</span>
            </div>
          </div>
        `;
      }

      // HỘP THÔNG TIN LÝ DO HỦY ĐƠN (CHUẨN SHOPEE)
      let cancelReasonHTML = "";
      if (order.status === "cancelled") {
        cancelReasonHTML = `
          <div class="order-cancel-reason-box">
            <div><strong>Lý do hủy:</strong> ${escapeHtml(order.cancelReason || 'Đổi ý, tạm thời chưa có nhu cầu mua thiết bị này')}</div>
            ${order.cancelNote ? `<div style="font-size: 0.8rem; margin-top: 3px; color: #7f1d1d;">Chi tiết: ${escapeHtml(order.cancelNote)}</div>` : ''}
            <div style="font-size: 0.75rem; color: #b91c1c; margin-top: 3px;">Thời gian hủy: ${escapeHtml(order.cancelledAt || order.createdAt || '')}</div>
          </div>
        `;
      }

      let productsHTML = "";
      (order.items || []).forEach((item) => {
        productsHTML += `
          <div class="order-product-item" style="display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--border, #E5DECE); align-items: center;">
            <img src="${item.image || 'assets/images/placeholder.svg'}" class="order-product-img" alt="${item.name || 'Sản phẩm'}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 8px;">
            <div style="flex: 1;">
              <strong style="display: block; font-size: 0.95rem; color: var(--text-primary, #231F1C);">${escapeHtml(item.name || 'Sản phẩm NEXUS VR')}</strong>
              <span style="font-size: 0.8rem; color: var(--text-secondary, #726657);">${item.selectedColor ? 'Màu: ' + escapeHtml(item.selectedColor) + ' • ' : ''}Số lượng: ${item.qty || 1}</span>
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
        actionsHTML = `
          <div class="btn-action-group" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 0.85rem; color: #2e7d32; font-weight: 600;">✓ Giao hàng thành công</span>
            <button type="button" class="btn-reorder" data-id="${order.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
              Mua lại
            </button>
          </div>
        `;
      } else if (order.status === "cancelled") {
        actionsHTML = `
          <div class="btn-action-group" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 0.85rem; color: #d32f2f; font-weight: 600;">✕ Đã hủy đơn</span>
            <button type="button" class="btn-reorder" data-id="${order.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
              Mua lại
            </button>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="order-card-header" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--border, #E5DECE); margin-bottom: 12px;">
          <div>
            <span class="order-code" style="font-weight: 700; color: var(--accent, #A67C52); font-size: 1.05rem;">${escapeHtml(order.code || '#NX-000000')}</span>
            <span style="font-size: 0.8rem; color: var(--text-secondary, #726657); margin-left: 8px;">(${escapeHtml(order.createdAt || '')})</span>
          </div>
          <span class="order-status-badge ${badgeClass}" style="padding: 4px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 600;">${escapeHtml(order.statusText || 'Đơn hàng')}</span>
        </div>

        ${stepperHTML}

        <div class="order-products-list">${productsHTML}</div>

        ${cancelReasonHTML}

        <div class="order-card-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; margin-top: 8px; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-size: 0.825rem; color: var(--text-secondary, #726657); margin-bottom: 2px;">Phương thức: ${escapeHtml(order.paymentMethod || 'COD')}</div>
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
    // 1. BẤM "HỦY ĐƠN" -> MỞ MODAL XÁC NHẬN HỦY ĐƠN APPLE GLASSMORPHISM
    document.querySelectorAll(".btn-cancel").forEach((btn) => {
      btn.addEventListener("click", function () {
        pendingOrderIdToCancel = this.getAttribute("data-id");
        openConfirmCancelModal();
      });
    });

    // 2. BẤM "ĐÃ NHẬN" -> MỞ MODAL XÁC NHẬN ĐÃ NHẬN APPLE GLASSMORPHISM
    document.querySelectorAll(".btn-received").forEach((btn) => {
      btn.addEventListener("click", function () {
        pendingOrderIdToConfirm = this.getAttribute("data-id");
        openConfirmReceivedModal();
      });
    });

    // 3. BẤM "MUA LẠI" -> NẠP LẠI SẢN PHẨM VÀO GIỎ & CHUYỂN SANG CART.HTML
    bindReorderEvents();
  }

  function bindReorderEvents() {
    document.querySelectorAll(".btn-reorder").forEach((btn) => {
      btn.addEventListener("click", function () {
        const orderId = this.getAttribute("data-id");
        const orders = getOrders();
        const order = orders.find((o) => o.id === orderId);
        if (!order || !order.items || order.items.length === 0) return;

        let addedCount = 0;
        order.items.forEach((item) => {
          if (window.cartManager && typeof window.cartManager.add === "function") {
            window.cartManager.add(item.id, Number(item.qty) || 1, item.selectedColor || null);
            addedCount++;
          } else {
            const userKey = getUserKeySuffix();
            const cartKey = "nexus_cart" + userKey;
            let cart = [];
            try {
              cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
            } catch (e) { cart = []; }
            cart.push(item);
            localStorage.setItem(cartKey, JSON.stringify(cart));
            localStorage.setItem("nexus_cart", JSON.stringify(cart));
            addedCount++;
          }
        });

        if (typeof window.showToast === "function") {
          window.showToast(`Đã thêm lại các sản phẩm từ đơn ${order.code} vào giỏ hàng!`, "success");
        }

        setTimeout(() => {
          window.location.href = "cart.html";
        }, 700);
      });
    });
  }

  /* --------------------------------------------------------------------------
  3. BỘ ĐIỀU KHIỂN MODAL XÁC NHẬN "ĐÃ NHẬN HÀNG" (APPLE STYLE)
  -------------------------------------------------------------------------- */
  function openConfirmReceivedModal() {
    const modal = document.getElementById("confirmReceivedModal");
    if (modal) modal.hidden = false;
  }

  function closeConfirmReceivedModal() {
    const modal = document.getElementById("confirmReceivedModal");
    if (modal) modal.hidden = true;
    pendingOrderIdToConfirm = null;
  }

  function initConfirmReceivedModal() {
    const modal = document.getElementById("confirmReceivedModal");
    const cancelBtn = document.getElementById("btnCancelReceivedModal");
    const confirmBtn = document.getElementById("btnConfirmReceivedModal");

    // Bấm "Hủy" -> Đóng modal, giữ nguyên đơn hàng, KHÔNG thông báo
    cancelBtn?.addEventListener("click", closeConfirmReceivedModal);

    // Bấm "Xác nhận" -> Đổi trạng thái đơn sang "completed" + Hiện Toast thành công
    confirmBtn?.addEventListener("click", () => {
      if (!pendingOrderIdToConfirm) return;

      const orders = getOrders();
      const target = orders.find((o) => o.id === pendingOrderIdToConfirm);

      if (target) {
        target.status = "completed";
        target.statusText = "Giao hàng thành công";
        saveOrders(orders);
        closeConfirmReceivedModal();
        renderOrders();

        if (typeof window.showToast === "function") {
          window.showToast("Xác nhận đã nhận hàng thành công!", "success");
        }
      }
    });

    // Bấm ra vùng mờ bên ngoài -> Đóng modal
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeConfirmReceivedModal();
    });

    // Nhấn ESC -> Đóng modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && !modal.hidden) {
        closeConfirmReceivedModal();
      }
    });
  }

  /* --------------------------------------------------------------------------
  4. BỘ ĐIỀU KHIỂN MODAL XÁC NHẬN "HỦY ĐƠN HÀNG" CÓ LÝ DO (CHUẨN SHOPEE)
  -------------------------------------------------------------------------- */
  function openConfirmCancelModal() {
    const modal = document.getElementById("confirmCancelModal");
    if (modal) modal.hidden = false;
  }

  function closeConfirmCancelModal() {
    const modal = document.getElementById("confirmCancelModal");
    if (modal) modal.hidden = true;
    pendingOrderIdToCancel = null;
  }

  function initConfirmCancelModal() {
    const modal = document.getElementById("confirmCancelModal");
    const closeBtn = document.getElementById("btnCloseCancelModal");
    const confirmBtn = document.getElementById("btnConfirmCancelModal");
    const radioInputs = document.querySelectorAll('input[name="cancelReasonRadio"]');
    const otherWrap = document.getElementById("cancelOtherInputWrap");
    const otherText = document.getElementById("cancelOtherText");

    // Lắng nghe thay đổi chọn lý do hủy
    radioInputs.forEach((radio) => {
      radio.addEventListener("change", function () {
        document.querySelectorAll(".cancel-reason-label").forEach((lbl) => lbl.classList.remove("is-selected"));
        this.closest(".cancel-reason-label")?.classList.add("is-selected");

        if (otherWrap) {
          otherWrap.style.display = this.value === "other" ? "block" : "none";
          if (this.value === "other" && otherText) {
            otherText.focus();
          }
        }
      });
    });

    // Bấm "Hủy" -> Đóng modal, giữ nguyên đơn hàng, KHÔNG thông báo
    closeBtn?.addEventListener("click", closeConfirmCancelModal);

    // Bấm "Xác nhận hủy" -> Ghi nhận lý do + Đổi trạng thái đơn sang "cancelled" + Hiện Toast
    confirmBtn?.addEventListener("click", () => {
      if (!pendingOrderIdToCancel) return;

      const orders = getOrders();
      const target = orders.find((o) => o.id === pendingOrderIdToCancel);

      if (target) {
        const selectedRadio = document.querySelector('input[name="cancelReasonRadio"]:checked');
        let chosenReason = selectedRadio ? selectedRadio.value : "Đổi ý, tạm thời chưa có nhu cầu mua thiết bị này";
        let customNote = "";

        if (chosenReason === "other") {
          const detail = otherText ? otherText.value.trim() : "";
          chosenReason = detail ? `Khác: ${detail}` : "Lý do cá nhân khác";
          customNote = detail;
        }

        target.status = "cancelled";
        target.statusText = "Đã hủy đơn hàng";
        target.cancelReason = chosenReason;
        target.cancelNote = customNote;
        target.cancelledAt = new Date().toLocaleString("vi-VN");

        saveOrders(orders);
        closeConfirmCancelModal();

        // Reset form
        if (otherText) otherText.value = "";
        const firstRadio = document.querySelector('input[name="cancelReasonRadio"][value="Muốn thay đổi địa chỉ nhận hàng hoặc số điện thoại"]');
        if (firstRadio) {
          firstRadio.checked = true;
          document.querySelectorAll(".cancel-reason-label").forEach((lbl) => lbl.classList.remove("is-selected"));
          firstRadio.closest(".cancel-reason-label")?.classList.add("is-selected");
        }
        if (otherWrap) otherWrap.style.display = "none";

        // Tự động chuyển mượt mà sang tab "cancelled" để người dùng xem kết quả ngay
        currentTab = "cancelled";
        document.querySelectorAll(".orders-tab-btn").forEach((btn) => {
          btn.classList.toggle("is-active", btn.getAttribute("data-tab") === "cancelled");
        });

        renderOrders();

        if (typeof window.showToast === "function") {
          window.showToast(`Đã hủy đơn ${target.code} thành công.`, "info");
        }
      }
    });

    // Bấm ra vùng mờ bên ngoài -> Đóng modal
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeConfirmCancelModal();
    });

    // Nhấn ESC -> Đóng modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && !modal.hidden) {
        closeConfirmCancelModal();
      }
    });
  }
})();
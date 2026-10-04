/* ==========================================================================
NEXUS VR — controllers/cart-controller.js
TẦNG 3 - CONTROLLERS: QUẢN LÝ GIỎ HÀNG, TÍNH PHÍ SHIP & MÃ GIẢM GIÁ
========================================================================== */
(function () {
  "use strict";

  const FREE_SHIPPING_THRESHOLD = 50000000; // Ngưỡng 50.000.000 ₫ để nhận Freeship
  const DEFAULT_SHIPPING_FEE = 30000;     // Phí giao hàng tiêu chuẩn: 30.000 ₫ khi chưa đủ chỉ tiêu

  const COUPONS = {
    'KM10VR': { type: 'percent', rate: 0.10, label: 'Giảm 10%' },
    'FREESHIP': { type: 'freeship', rate: 0, label: 'Miễn phí vận chuyển' }
  };

  let activeCoupon = null;

  const formatVND = (num) => (num || 0).toLocaleString("vi-VN") + " ₫";

  document.addEventListener("DOMContentLoaded", initCartController);
  if (document.readyState === "interactive" || document.readyState === "complete") {
    initCartController();
  }

  function initCartController() {
    if (window.__nexusCartInitialized) return;
    window.__nexusCartInitialized = true;

    renderCart();
    bindEvents();
  }

  /* --------------------------------------------------------------------------
  1. ĐỌC VÀ LƯU DỮ LIỆU GIỎ HÀNG
  -------------------------------------------------------------------------- */
  function getCart() {
    if (window.cartManager && typeof window.cartManager.getCart === "function") {
      return window.cartManager.getCart();
    }
    if (window.storageService && typeof window.storageService.getCart === "function") {
      return window.storageService.getCart();
    }
    try {
      return JSON.parse(localStorage.getItem("nexus_cart") || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    if (window.cartManager && typeof window.cartManager.saveCart === "function") {
      window.cartManager.saveCart(cart);
    } else if (window.storageService && typeof window.storageService.saveCart === "function") {
      window.storageService.saveCart(cart);
    } else {
      localStorage.setItem("nexus_cart", JSON.stringify(cart));
    }
    window.dispatchEvent(new CustomEvent("nexus:cart-updated"));
  }

  /* --------------------------------------------------------------------------
  2. HIỂN THỊ BẢNG SẢN PHẨM VÀ TÍNH TOÁN DỮ LIỆU
  -------------------------------------------------------------------------- */
  function renderCart() {
    const cart = getCart();
    const tableBody = document.getElementById("cartTableBody");
    const tableWrap = document.getElementById("cartTableWrap");
    const emptyNotice = document.getElementById("emptyCartNotice");
    const clearBtn = document.getElementById("clearCartBtn");

    if (!tableBody) return;

    if (!cart || cart.length === 0) {
      if (tableWrap) tableWrap.hidden = true;
      if (emptyNotice) emptyNotice.hidden = false;
      if (clearBtn) clearBtn.style.display = "none";
      renderFreeShippingProgress(0);
      renderSummary(0);
      return;
    }

    if (tableWrap) tableWrap.hidden = false;
    if (emptyNotice) emptyNotice.hidden = true;
    if (clearBtn) clearBtn.style.display = "inline-block";

    tableBody.innerHTML = "";
    let subtotal = 0;

    cart.forEach((item, index) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 1;
      const lineTotal = price * qty;
      subtotal += lineTotal;

      const name = item.name || "Sản phẩm NEXUS VR";
      const img = item.image || "assets/images/placeholder.svg";
      const color = item.selectedColor || "Xám Than";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="cart-product-cell">
          <div class="cart-product-info" style="display: flex; align-items: center; gap: 16px;">
            <img src="${img}" alt="${name}" class="cart-product-img" style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px;" onerror="this.onerror=null; this.src='assets/images/placeholder.svg';">
            <div>
              <strong class="cart-product-name" style="display: block; font-size: 0.95rem;">${name}</strong>
              <span class="cart-product-meta" style="font-size: 0.825rem; color: var(--text-secondary);">Màu: ${color}</span>
            </div>
          </div>
        </td>
        <td class="cart-price-cell"><strong>${formatVND(price)}</strong></td>
        <td class="cart-qty-cell">
          <div class="cart-qty-control" style="display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: 6px;">
            <button type="button" class="btn-qty-minus" data-index="${index}" style="padding: 4px 10px; cursor: pointer; background: none; border: none;">-</button>
            <span style="padding: 0 10px; font-weight: 600;">${qty}</span>
            <button type="button" class="btn-qty-plus" data-index="${index}" style="padding: 4px 10px; cursor: pointer; background: none; border: none;">+</button>
          </div>
        </td>
        <td class="cart-subtotal-cell"><strong style="color: var(--accent);">${formatVND(lineTotal)}</strong></td>
        <td class="cart-action-cell">
          <button type="button" class="btn-remove-item" data-index="${index}" title="Xóa sản phẩm" style="background: none; border: none; cursor: pointer; color: var(--text-secondary); font-size: 1.2rem;">&times;</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    renderFreeShippingProgress(subtotal);
    renderSummary(subtotal);
    bindTableActions();
  }

  /* --------------------------------------------------------------------------
  3. TIẾN TRÌNH MIỄN PHÍ VẬN CHUYỂN
  -------------------------------------------------------------------------- */
  function renderFreeShippingProgress(subtotal) {
    const progressFill = document.getElementById('freeShipProgressFill');
    const statusText = document.getElementById('freeShipStatusText');
    if (!progressFill || !statusText) return;

    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      progressFill.style.width = '100%';
      statusText.innerHTML = `<strong>Chúc mừng!</strong> Bạn đã đạt chỉ tiêu và được <strong>Miễn phí vận chuyển</strong>.`;
    } else {
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      progressFill.style.width = `${percent}%`;
      statusText.innerHTML = `Mua thêm <strong>${formatVND(remaining)}</strong> để nhận <strong>Miễn phí vận chuyển</strong>!`;
    }
  }

  /* --------------------------------------------------------------------------
  4. CẬP NHẬT TÓM TẮT ĐƠN HÀNG & TÍNH PHÍ VẬN CHUYỂN MỚI
  -------------------------------------------------------------------------- */
  function renderSummary(subtotal) {
    const subTotalEl = document.getElementById('subTotal');
    const discountRow = document.getElementById('discountRow');
    const couponCodeLabel = document.getElementById('couponCodeLabel');
    const discountAmountEl = document.getElementById('discountAmount');
    const shippingEl = document.querySelector('.shipping-free') || document.getElementById('shippingFeeDisplay');
    const originalTotalEl = document.getElementById('originalTotal');
    const finalTotalEl = document.getElementById('finalTotal');

    if (subTotalEl) subTotalEl.textContent = formatVND(subtotal);

    // 1. Tính số tiền Giảm giá từ Coupon
    let discountVal = 0;
    if (activeCoupon) {
      if (activeCoupon.type === 'percent') {
        discountVal = Math.round(subtotal * activeCoupon.rate);
      }
      if (discountRow) discountRow.hidden = false;
      if (couponCodeLabel) couponCodeLabel.textContent = `(${activeCoupon.code || ''})`;
      if (discountAmountEl) discountAmountEl.textContent = `- ${formatVND(discountVal)}`;
    } else {
      if (discountRow) discountRow.hidden = true;
    }

    // 2. Phí vận chuyển: Đủ chỉ tiêu >= 50 triệu HOẶC dùng mã FREESHIP => Miễn phí (0 ₫), Ngược lại => 30.000 ₫
    const isFreeshipEligible = (subtotal >= FREE_SHIPPING_THRESHOLD) || (activeCoupon && activeCoupon.type === 'freeship');
    const actualShippingFee = (subtotal > 0 && !isFreeshipEligible) ? DEFAULT_SHIPPING_FEE : 0;

    if (shippingEl) {
      if (subtotal === 0) {
        shippingEl.textContent = "0 ₫";
        shippingEl.style.color = "var(--text-primary)";
      } else if (actualShippingFee === 0) {
        shippingEl.textContent = "Miễn phí";
        shippingEl.style.color = "var(--success, #2e7d32)";
      } else {
        shippingEl.textContent = formatVND(actualShippingFee);
        shippingEl.style.color = "var(--text-primary)";
      }
    }

    // 3. Tính Tổng cộng = Tạm tính - Giảm giá + Phí vận chuyển
    const finalTotal = subtotal === 0 ? 0 : Math.max(0, subtotal - discountVal + actualShippingFee);

    if (originalTotalEl) {
      if (discountVal > 0) {
        originalTotalEl.hidden = false;
        originalTotalEl.textContent = formatVND(subtotal + actualShippingFee);
      } else {
        originalTotalEl.hidden = true;
      }
    }

    if (finalTotalEl) {
      finalTotalEl.textContent = formatVND(finalTotal);
    }
  }

  /* --------------------------------------------------------------------------
  5. XỬ LÝ TƯƠNG TÁC SỐ LƯỢNG & NÚT BẤM GIỎ HÀNG
  -------------------------------------------------------------------------- */
  function bindTableActions() {
    const cart = getCart();

    document.querySelectorAll(".btn-qty-minus").forEach((btn) => {
      btn.addEventListener("click", function () {
        const idx = Number(this.getAttribute("data-index"));
        if (cart[idx]) {
          if (cart[idx].qty > 1) {
            cart[idx].qty--;
          } else {
            cart.splice(idx, 1);
          }
          saveCart(cart);
          renderCart();
        }
      });
    });

    document.querySelectorAll(".btn-qty-plus").forEach((btn) => {
      btn.addEventListener("click", function () {
        const idx = Number(this.getAttribute("data-index"));
        if (cart[idx]) {
          cart[idx].qty = (Number(cart[idx].qty) || 1) + 1;
          saveCart(cart);
          renderCart();
        }
      });
    });

    document.querySelectorAll(".btn-remove-item").forEach((btn) => {
      btn.addEventListener("click", function () {
        const idx = Number(this.getAttribute("data-index"));
        if (cart[idx]) {
          cart.splice(idx, 1);
          saveCart(cart);
          renderCart();
          if (typeof window.showToast === "function") window.showToast("Đã xóa sản phẩm khỏi giỏ hàng", "info");
        }
      });
    });
  }

  function bindEvents() {
    // Xóa tất cả sản phẩm
    const clearBtn = document.getElementById("clearCartBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")) {
          saveCart([]);
          renderCart();
          if (typeof window.showToast === "function") window.showToast("Đã xóa toàn bộ giỏ hàng", "info");
        }
      });
    }

    // Áp dụng Mã giảm giá
    const applyBtn = document.getElementById("btnApplyCoupon");
    const couponInput = document.getElementById("couponInput");
    const couponMessage = document.getElementById("couponMessage");

    if (applyBtn && couponInput) {
      applyBtn.addEventListener("click", function () {
        const code = couponInput.value.trim().toUpperCase();
        if (!code) return;

        if (COUPONS[code]) {
          activeCoupon = { ...COUPONS[code], code };
          if (couponMessage) {
            couponMessage.textContent = `Đã áp dụng mã ${code} thành công!`;
            couponMessage.style.color = "var(--success, #2e7d32)";
          }
          if (typeof window.showToast === "function") window.showToast(`Áp dụng mã ${code} thành công!`, "success");
        } else {
          if (couponMessage) {
            couponMessage.textContent = "Mã không hợp lệ. Thử mã KM10VR hoặc FREESHIP.";
            couponMessage.style.color = "var(--error, #d32f2f)";
          }
          if (typeof window.showToast === "function") window.showToast("Mã giảm giá không hợp lệ!", "error");
        }
        renderCart();
      });
    }

    // Chuyển sang bước Thanh toán
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", function () {
        const cart = getCart();
        if (!cart || cart.length === 0) {
          if (typeof window.showToast === "function") window.showToast("Giỏ hàng của bạn đang trống!", "warning");
          return;
        }
        window.location.href = "checkout.html";
      });
    }
  }
})();
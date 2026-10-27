/* ==========================================================================
NEXUS VR — controllers/cart-controller.js
TẦNG 3 - CONTROLLERS: ĐIỀU KHIỂN HOÀN CHỈNH GIAO DIỆN GIỎ HÀNG & LƯU VOUCHER
========================================================================== */
(function () {
  "use strict";

  const FREE_SHIPPING_THRESHOLD = 50000000; // Ngưỡng 50.000.000 ₫ để Miễn phí vận chuyển
  const DEFAULT_SHIPPING_FEE = 30000;     // Phí giao hàng tiêu chuẩn: 30.000 ₫

  const COUPONS = {
    'KM10VR': { type: 'percent', rate: 0.10, label: 'Giảm 10%' },
    'NEXUS10': { type: 'percent', rate: 0.10, label: 'Giảm 10%' },
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

    activeCoupon = getAppliedCoupon(); // Đọc mã giảm giá đã lưu nếu có

    renderCart();
    bindEvents();

    window.addEventListener("nexus:cart-updated", renderCart);
  }

  /* --------------------------------------------------------------------------
  1. QUẢN LÝ DỮ LIỆU PHÂN LẬP THEO TÀI KHOẢN
  -------------------------------------------------------------------------- */
  function getUserKeySuffix() {
    try {
      if (window.storageService && typeof window.storageService.getUserKeySuffix === "function") {
        return window.storageService.getUserKeySuffix();
      }
      const user = typeof window.getCurrentUser === "function"
        ? window.getCurrentUser()
        : JSON.parse(localStorage.getItem("nexus_user") || "null");

      if (user && (user.email || user.account)) {
        return "_" + (user.email || user.account).toLowerCase().replace(/[^a-z0-9]/g, "_");
      }
    } catch (e) {}
    return "_guest";
  }

  function getCartData() {
    if (window.cartManager && typeof window.cartManager.getCart === "function") {
      return window.cartManager.getCart();
    }
    if (window.storageService && typeof window.storageService.getCart === "function") {
      return window.storageService.getCart();
    }
    const userKey = getUserKeySuffix();
    try {
      return JSON.parse(localStorage.getItem("nexus_cart" + userKey) || localStorage.getItem("nexus_cart") || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveCartData(cart) {
    if (window.cartManager && typeof window.cartManager.saveCart === "function") {
      window.cartManager.saveCart(cart);
    } else if (window.storageService && typeof window.storageService.saveCart === "function") {
      window.storageService.saveCart(cart);
    } else {
      const userKey = getUserKeySuffix();
      localStorage.setItem("nexus_cart" + userKey, JSON.stringify(cart || []));
      localStorage.setItem("nexus_cart", JSON.stringify(cart || []));
    }
    window.dispatchEvent(new CustomEvent("nexus:cart-updated"));
  }

  function getAppliedCoupon() {
    const userKey = getUserKeySuffix();
    try {
      const raw = localStorage.getItem("nexus_coupon" + userKey) || localStorage.getItem("nexus_coupon");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveAppliedCoupon(coupon) {
    const userKey = getUserKeySuffix();
    if (coupon) {
      localStorage.setItem("nexus_coupon" + userKey, JSON.stringify(coupon));
      localStorage.setItem("nexus_coupon", JSON.stringify(coupon));
    } else {
      localStorage.removeItem("nexus_coupon" + userKey);
      localStorage.removeItem("nexus_coupon");
    }
  }

  /* --------------------------------------------------------------------------
  2. RENDER BẢNG SẢN PHẨM GIỎ HÀNG
  -------------------------------------------------------------------------- */
  function renderCart() {
    const cart = getCartData();
    const tableWrap = document.getElementById("cartTableWrap");
    const tableBody = document.getElementById("cartTableBody");
    const emptyNotice = document.getElementById("emptyCartNotice");
    const clearBtn = document.getElementById("clearCartBtn");

    if (!tableBody || !tableWrap || !emptyNotice) return;

    if (!cart || cart.length === 0) {
      tableWrap.hidden = true;
      emptyNotice.hidden = false;
      if (clearBtn) clearBtn.style.display = "none";
      renderFreeShippingProgress(0);
      renderSummary(0);
      return;
    }

    tableWrap.hidden = false;
    emptyNotice.hidden = true;
    if (clearBtn) clearBtn.style.display = "inline-block";
    tableBody.innerHTML = "";

    let subtotal = 0;

    cart.forEach((item, index) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 1;
      const lineTotal = price * qty;
      subtotal += lineTotal;

      const tr = document.createElement("tr");
      tr.className = "cart-item-row";
      tr.innerHTML = `
        <td class="cart-product-cell">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="${item.image || 'assets/images/placeholder.svg'}" 
                 alt="${item.name || 'Sản phẩm NEXUS VR'}" 
                 style="width: 64px; height: 64px; object-fit: cover; border-radius: 8px; background: #f5f5f5;"
                 onerror="this.onerror=null; this.src='assets/images/placeholder.svg';">
            <div>
              <strong style="display: block; font-size: 0.95rem; color: var(--text-primary, #231F1C);">${item.name || 'Sản phẩm NEXUS VR'}</strong>
              <span style="font-size: 0.825rem; color: var(--text-secondary, #726657);">Màu: ${item.selectedColor || 'Tiêu chuẩn'}</span>
            </div>
          </div>
        </td>
        <td class="cart-price-cell"><strong>${formatVND(price)}</strong></td>
        <td class="cart-qty-cell">
          <div style="display: inline-flex; align-items: center; border: 1px solid var(--border, #E5DECE); border-radius: 6px; overflow: hidden; background: #fff;">
            <button type="button" class="btn-qty-minus" data-index="${index}" style="padding: 4px 10px; cursor: pointer; background: none; border: none; font-weight: 600;">-</button>
            <input type="number" class="input-qty" data-index="${index}" value="${qty}" min="1" max="99" style="width: 38px; text-align: center; border: none; font-weight: 600; -moz-appearance: textfield;">
            <button type="button" class="btn-qty-plus" data-index="${index}" style="padding: 4px 10px; cursor: pointer; background: none; border: none; font-weight: 600;">+</button>
          </div>
        </td>
        <td class="cart-subtotal-cell"><strong style="color: var(--accent, #A67C52);">${formatVND(lineTotal)}</strong></td>
        <td class="cart-action-cell">
          <button type="button" class="btn-remove-item" data-index="${index}" title="Xóa sản phẩm" style="background: none; border: none; cursor: pointer; color: var(--text-secondary, #726657); font-size: 1.2rem; padding: 4px 8px;">&times;</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    renderFreeShippingProgress(subtotal);
    renderSummary(subtotal);
    bindTableActions();
  }

  /* --------------------------------------------------------------------------
  3. CẬP NHẬT TIẾN TRÌNH MIỄN PHÍ VẬN CHUYỂN
  -------------------------------------------------------------------------- */
  function renderFreeShippingProgress(subtotal) {
    const progressFill = document.getElementById("freeShipProgressFill");
    const statusText = document.getElementById("freeShipStatusText");
    if (!progressFill || !statusText) return;

    if (subtotal === 0) {
      statusText.textContent = "Thêm sản phẩm vào giỏ để nhận ưu đãi miễn phí vận chuyển!";
      progressFill.style.width = "0%";
      return;
    }

    const isFreeshipCoupon = activeCoupon && activeCoupon.type === "freeship";

    if (subtotal >= FREE_SHIPPING_THRESHOLD || isFreeshipCoupon) {
      progressFill.style.width = "100%";
      statusText.innerHTML = `🎉 <strong>Chúc mừng!</strong> Bạn đã đạt chỉ tiêu và được <strong>Miễn phí vận chuyển</strong>.`;
    } else {
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      progressFill.style.width = `${percent}%`;
      statusText.innerHTML = `Mua thêm <strong>${formatVND(remaining)}</strong> để nhận <strong>Miễn phí vận chuyển</strong>!`;
    }
  }

  /* --------------------------------------------------------------------------
  4. BẢNG TÓM TẮT ĐƠN HÀNG (SỬ DỤNG VOUCHER THỜI GIAN THỰC)
  -------------------------------------------------------------------------- */
  function renderSummary(subtotal) {
    const subTotalEl = document.getElementById("subTotal");
    const discountRow = document.getElementById("discountRow");
    const couponCodeLabel = document.getElementById("couponCodeLabel");
    const discountAmountEl = document.getElementById("discountAmount");
    const shippingEl = document.getElementById("shippingFeeDisplay") || document.querySelector(".shipping-free");
    const originalTotalEl = document.getElementById("originalTotal");
    const finalTotalEl = document.getElementById("finalTotal");

    if (subTotalEl) subTotalEl.textContent = formatVND(subtotal);

    let discountVal = 0;
    if (activeCoupon) {
      if (activeCoupon.type === "percent") {
        discountVal = Math.round(subtotal * activeCoupon.rate);
      }
      if (discountRow) discountRow.hidden = false;
      if (couponCodeLabel) couponCodeLabel.textContent = `(${activeCoupon.code})`;
      if (discountAmountEl) discountAmountEl.textContent = `- ${formatVND(discountVal)}`;
    } else {
      if (discountRow) discountRow.hidden = true;
    }

    const isFreeshipEligible = (subtotal >= FREE_SHIPPING_THRESHOLD) || (activeCoupon && activeCoupon.type === "freeship");
    const actualShippingFee = (subtotal > 0 && !isFreeshipEligible) ? DEFAULT_SHIPPING_FEE : 0;

    if (shippingEl) {
      if (subtotal === 0) {
        shippingEl.textContent = "0 ₫";
        shippingEl.style.color = "var(--text-primary, #231F1C)";
        shippingEl.classList.remove("shipping-free");
      } else if (actualShippingFee === 0) {
        shippingEl.textContent = "Miễn phí";
        shippingEl.style.color = "var(--success, #2e7d32)";
        shippingEl.classList.add("shipping-free");
      } else {
        shippingEl.textContent = formatVND(actualShippingFee);
        shippingEl.style.color = "var(--text-primary, #231F1C)";
        shippingEl.classList.remove("shipping-free");
      }
    }

    const finalTotal = subtotal === 0 ? 0 : Math.max(0, subtotal - discountVal + actualShippingFee);

    if (originalTotalEl) {
      if (discountVal > 0 || (subtotal > 0 && actualShippingFee === 0 && subtotal < FREE_SHIPPING_THRESHOLD)) {
        originalTotalEl.hidden = false;
        originalTotalEl.textContent = formatVND(subtotal + DEFAULT_SHIPPING_FEE);
      } else {
        originalTotalEl.hidden = true;
      }
    }

    if (finalTotalEl) {
      finalTotalEl.textContent = formatVND(finalTotal);
    }
  }

  /* --------------------------------------------------------------------------
  5. SỰ KIỆN TĂNG/GIẢM/XÓA SẢN PHẨM IN-LINE
  -------------------------------------------------------------------------- */
  function bindTableActions() {
    const cart = getCartData();

    document.querySelectorAll(".btn-qty-minus").forEach((btn) => {
      btn.addEventListener("click", function () {
        const idx = Number(this.getAttribute("data-index"));
        if (cart[idx]) {
          if (cart[idx].qty > 1) {
            cart[idx].qty--;
          } else {
            cart.splice(idx, 1);
          }
          saveCartData(cart);
          renderCart();
        }
      });
    });

    document.querySelectorAll(".btn-qty-plus").forEach((btn) => {
      btn.addEventListener("click", function () {
        const idx = Number(this.getAttribute("data-index"));
        if (cart[idx]) {
          cart[idx].qty = (Number(cart[idx].qty) || 1) + 1;
          saveCartData(cart);
          renderCart();
        }
      });
    });

    document.querySelectorAll(".input-qty").forEach((input) => {
      input.addEventListener("change", function () {
        const idx = Number(this.getAttribute("data-index"));
        let newQty = parseInt(this.value, 10);
        if (isNaN(newQty) || newQty < 1) newQty = 1;
        if (cart[idx]) {
          cart[idx].qty = newQty;
          saveCartData(cart);
          renderCart();
        }
      });
    });

    document.querySelectorAll(".btn-remove-item").forEach((btn) => {
      btn.addEventListener("click", function () {
        const idx = Number(this.getAttribute("data-index"));
        if (cart[idx]) {
          cart.splice(idx, 1);
          saveCartData(cart);
          renderCart();
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
  6. ÁP DỤNG MÃ GIẢM GIÁ VÀ LƯU VÀO STORAGE CHO CHECKOUT
  -------------------------------------------------------------------------- */
  function bindEvents() {
    const clearBtn = document.getElementById("clearCartBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        const cart = getCartData();
        if (!cart || cart.length === 0) return;
        activeCoupon = null;
        saveAppliedCoupon(null);
        saveCartData([]);
        renderCart();
      });
    }

    const applyBtn = document.getElementById("btnApplyCoupon");
    const couponInput = document.getElementById("couponInput");
    const couponMessage = document.getElementById("couponMessage");

    function handleApplyCoupon() {
      if (!couponInput) return;
      const code = couponInput.value.trim().toUpperCase();

      if (!code) {
        activeCoupon = null;
        saveAppliedCoupon(null);
        if (couponMessage) {
          couponMessage.textContent = "Vui lòng nhập mã khuyến mãi.";
          couponMessage.style.color = "var(--error, #d32f2f)";
        }
        renderCart();
        return;
      }

      let couponData = COUPONS[code];
      if (!couponData && window.cartManager && typeof window.cartManager.applyCoupon === "function") {
        const res = window.cartManager.applyCoupon(code);
        if (res && res.valid) {
          couponData = { type: res.type || 'percent', rate: res.rate || 0.1, label: res.label || 'Giảm giá' };
        }
      }

      if (couponData) {
        activeCoupon = { ...couponData, code };
        saveAppliedCoupon(activeCoupon); // Lưu mã để checkout.html đọc được!

        if (couponMessage) {
          couponMessage.textContent = `Áp dụng mã ${code} thành công! (${couponData.label})`;
          couponMessage.style.color = "var(--success, #2e7d32)";
        }
        if (typeof window.showToast === "function") {
          window.showToast(`Áp dụng mã ${code} thành công!`, "success");
        }
      } else {
        activeCoupon = null;
        saveAppliedCoupon(null);
        if (couponMessage) {
          couponMessage.textContent = "Mã không hợp lệ!";
          couponMessage.style.color = "var(--error, #d32f2f)";
        }
        if (typeof window.showToast === "function") {
          window.showToast("Mã giảm giá không hợp lệ!", "error");
        }
      }
      renderCart();
    }

    if (applyBtn) {
      applyBtn.addEventListener("click", handleApplyCoupon);
    }

    if (couponInput) {
      // Nếu đã có mã giảm giá áp dụng trước đó, hiển thị sẵn lên ô input
      const savedCoupon = getAppliedCoupon();
      if (savedCoupon && savedCoupon.code) {
        couponInput.value = savedCoupon.code;
      }

      couponInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleApplyCoupon();
        }
      });
    }

    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", function () {
        const cart = getCartData();
        if (!cart || cart.length === 0) {
          if (typeof window.showToast === "function") {
            window.showToast("Giỏ hàng của bạn đang trống!", "warning");
          }
          return;
        }
        window.location.href = "checkout.html";
      });
    }
  }
})();
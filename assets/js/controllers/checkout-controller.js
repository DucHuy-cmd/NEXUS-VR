/* ==========================================================================
   NEXUS VR — controllers/checkout-controller.js
   TẦNG 3 - CONTROLLERS: ĐIỀU KHIỂN QUY TRÌNH THANH TOÁN 3 BƯỚC
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", initCheckoutController);
  if (document.readyState === "interactive" || document.readyState === "complete") {
    initCheckoutController();
  }

  let currentStep = 1;
  let shippingFee = 0;
  let orderCustomerData = {};

  const formatVND = (num) => (num || 0).toLocaleString("vi-VN") + " ₫";

  function initCheckoutController() {
    if (window.__nexusCheckoutInitialized) return;
    window.__nexusCheckoutInitialized = true;

    renderOrderSummary();
    initStepNavigation();
    initShippingAndPaymentOptions();
  }

  /* 1. RENDER SIDEBAR TÓM TẮT ĐƠN HÀNG */
  function renderOrderSummary() {
    const listEl = document.getElementById("summaryItemsList");
    const subtotalEl = document.getElementById("summarySubtotal");
    const shippingEl = document.getElementById("summaryShipping");
    const totalEl = document.getElementById("summaryTotal");
    const emptyNotice = document.getElementById("checkoutEmptyNotice");
    const mainLayout = document.getElementById("checkoutMainLayout");

    if (!listEl || !subtotalEl || !totalEl) return;

    const cart = typeof window.cartManager !== "undefined" && typeof window.cartManager.getCart === "function"
      ? window.cartManager.getCart()
      : (typeof getCart === "function" ? getCart() : []);

    if (cart.length === 0 && currentStep !== 3) {
      if (emptyNotice) emptyNotice.hidden = false;
      if (mainLayout) mainLayout.hidden = true;
      return;
    }

    if (emptyNotice) emptyNotice.hidden = true;
    if (mainLayout) mainLayout.hidden = false;

    let subtotal = 0;
    listEl.innerHTML = "";

    cart.forEach(item => {
      const product = (typeof PRODUCTS !== "undefined")
        ? PRODUCTS.find(p => p.id === item.id)
        : null;

      const name = item.name || (product ? product.name : "NEXUS VR Device");
      const price = item.price || (product ? product.price : 0);
      const qty = item.qty || 1;
      const color = item.selectedColor || item.color || (product && product.colors ? product.colors[0].name : "");
      const img = item.image || (product && product.images && product.images[0] ? product.images[0] : "assets/images/placeholder.svg");

      const lineTotal = price * qty;
      subtotal += lineTotal;

      const itemEl = document.createElement("div");
      itemEl.className = "summary-item";
      itemEl.innerHTML = `
        <img src="${img}" alt="${name}" class="summary-item__img" onerror="this.onerror=null; this.src='assets/images/placeholder.svg';">
        <div class="summary-item__info">
          <div class="summary-item__title">${name}</div>
          <div class="summary-item__meta">${color ? 'Màu: ' + color + ' • ' : ''}SL: ${qty}</div>
        </div>
        <div class="summary-item__price">${formatVND(lineTotal)}</div>
      `;
      listEl.appendChild(itemEl);
    });

    subtotalEl.textContent = formatVND(subtotal);
    if (shippingEl) shippingEl.textContent = shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee);
    totalEl.textContent = formatVND(subtotal + shippingFee);
  }

  /* 2. ĐIỀU HƯỚNG BƯỚC */
  function setStep(step) {
    currentStep = step;

    const step1Pill = document.getElementById("stepPill1");
    const step2Pill = document.getElementById("stepPill2");
    const step3Pill = document.getElementById("stepPill3");
    const lineFill = document.getElementById("stepperLineFill");

    if (step1Pill && step2Pill && step3Pill && lineFill) {
      step1Pill.classList.toggle("is-active", step === 1);
      step1Pill.classList.toggle("is-completed", step > 1);

      step2Pill.classList.toggle("is-active", step === 2);
      step2Pill.classList.toggle("is-completed", step > 2);

      step3Pill.classList.toggle("is-active", step === 3);

      lineFill.style.width = step === 1 ? "0%" : (step === 2 ? "50%" : "100%");
    }

    const step1Content = document.getElementById("checkoutStep1");
    const step2Content = document.getElementById("checkoutStep2");
    const step3Content = document.getElementById("checkoutStep3");
    const sidebar = document.getElementById("checkoutSidebar");

    if (step1Content) step1Content.hidden = (step !== 1);
    if (step2Content) step2Content.hidden = (step !== 2);
    if (step3Content) step3Content.hidden = (step !== 3);

    if (sidebar) sidebar.hidden = (step === 3);

    window.scrollTo({ top: 120, behavior: "smooth" });
  }

  function initStepNavigation() {
    const toStep2Btn = document.getElementById("toStep2Btn");
    if (toStep2Btn) {
      toStep2Btn.addEventListener("click", () => {
        if (validateStep1()) {
          setStep(2);
        }
      });
    }

    const backToStep1Btn = document.getElementById("backToStep1Btn");
    if (backToStep1Btn) {
      backToStep1Btn.addEventListener("click", () => {
        setStep(1);
      });
    }

    const placeOrderBtn = document.getElementById("placeOrderBtn");
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener("click", () => {
        completeOrder();
      });
    }
  }

  /* 3. VALIDATE STEP 1 */
  function validateStep1() {
    const name = document.getElementById("orderName").value.trim();
    const phone = document.getElementById("orderPhone").value.trim();
    const email = document.getElementById("orderEmail").value.trim();
    const address = document.getElementById("orderAddress").value.trim();
    const city = document.getElementById("orderCity").value;

    const nameErr = document.getElementById("orderNameError");
    const phoneErr = document.getElementById("orderPhoneError");
    const emailErr = document.getElementById("orderEmailError");
    const addressErr = document.getElementById("orderAddressError");

    let isValid = true;
    if (nameErr) nameErr.textContent = "";
    if (phoneErr) phoneErr.textContent = "";
    if (emailErr) emailErr.textContent = "";
    if (addressErr) addressErr.textContent = "";

    if (!name) {
      if (nameErr) nameErr.textContent = "Vui lòng nhập họ và tên người nhận.";
      isValid = false;
    } else if (typeof isValidName === "function" && !isValidName(name)) {
      if (nameErr) nameErr.textContent = "Họ tên tiếng Việt cần ít nhất 2 từ.";
      isValid = false;
    }

    if (!phone) {
      if (phoneErr) phoneErr.textContent = "Vui lòng nhập số điện thoại.";
      isValid = false;
    } else if (typeof isValidPhoneVN === "function" && !isValidPhoneVN(phone)) {
      if (phoneErr) phoneErr.textContent = "Số điện thoại Việt Nam không hợp lệ (10 số).";
      isValid = false;
    }

    if (!email) {
      if (emailErr) emailErr.textContent = "Vui lòng nhập email nhận thông báo.";
      isValid = false;
    } else if (typeof isValidEmail === "function" && !isValidEmail(email)) {
      if (emailErr) emailErr.textContent = "Email không đúng định dạng.";
      isValid = false;
    }

    if (!address) {
      if (addressErr) addressErr.textContent = "Vui lòng nhập địa chỉ nhận hàng.";
      isValid = false;
    }

    if (isValid) {
      orderCustomerData = {
        name,
        phone,
        email,
        address: `${address}, ${city}`,
        note: document.getElementById("orderNote").value.trim()
      };
    }

    return isValid;
  }

  /* 4. SHIPPING & PAYMENT OPTIONS */
  function initShippingAndPaymentOptions() {
    const shipOptions = document.querySelectorAll('input[name="shippingMethod"]');
    shipOptions.forEach(opt => {
      opt.addEventListener("change", (e) => {
        shippingFee = (e.target.value === "express") ? 150000 : 0;
        document.querySelectorAll(".shipping-card").forEach(c => c.classList.remove("is-selected"));
        e.target.closest(".option-card").classList.add("is-selected");
        renderOrderSummary();
      });
    });

    const payOptions = document.querySelectorAll('input[name="paymentMethod"]');
    const qrBlock = document.getElementById("bankTransferQrBlock");
    const cardBlock = document.getElementById("creditCardBlock");

    payOptions.forEach(opt => {
      opt.addEventListener("change", (e) => {
        document.querySelectorAll(".payment-card").forEach(c => c.classList.remove("is-selected"));
        e.target.closest(".option-card").classList.add("is-selected");

        const val = e.target.value;
        if (qrBlock) qrBlock.hidden = (val !== "bank");
        if (cardBlock) cardBlock.hidden = (val !== "card");
      });
    });
  }

  /* 5. COMPLETE ORDER */
  function completeOrder() {
    const orderCode = "#NX-" + Math.floor(100000 + Math.random() * 900000);
    const codeEl = document.getElementById("confirmedOrderCode");
    const nameEl = document.getElementById("confirmedCustomerName");
    const addrEl = document.getElementById("confirmedCustomerAddress");
    const payEl = document.getElementById("confirmedPaymentMethod");
    const totalEl = document.getElementById("confirmedTotalAmount");

    const selectedPay = document.querySelector('input[name="paymentMethod"]:checked');
    let payLabel = "Thanh toán khi nhận hàng (COD)";
    if (selectedPay) {
      if (selectedPay.value === "bank") payLabel = "Chuyển khoản VietQR";
      if (selectedPay.value === "card") payLabel = "Thẻ Quốc Tế Visa/Mastercard";
    }

    if (codeEl) codeEl.textContent = orderCode;
    if (nameEl) nameEl.textContent = orderCustomerData.name || "Quý khách";
    if (addrEl) addrEl.textContent = orderCustomerData.address || "Địa chỉ mặc định";
    if (payEl) payEl.textContent = payLabel;

    const summaryTotal = document.getElementById("summaryTotal");
    if (totalEl && summaryTotal) {
      totalEl.textContent = summaryTotal.textContent;
    }

    if (window.cartManager && typeof window.cartManager.clear === "function") {
      window.cartManager.clear();
    } else if (typeof saveCart === "function") {
      saveCart([]);
    } else {
      localStorage.setItem("nexus_cart", JSON.stringify([]));
    }

    if (typeof updateCartBadge === "function") {
      updateCartBadge();
    }

    if (typeof showToast === "function") {
      showToast(`Đơn hàng ${orderCode} đã được tạo thành công!`, "success");
    }

    setStep(3);
  }
})();

/* ==========================================================================
NEXUS VR — controllers/checkout-controller.js   [PHỤ TRÁCH: Tưởng]
TẦNG 3 - CONTROLLERS: ĐIỀU KHIỂN QUY TRÌNH THANH TOÁN 3 BƯỚC, AUTOFILL USER & 2 CẤP ĐỊA CHÍNH
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

    initAddressCascading();
    renderOrderSummary();
    initStepNavigation();
    initShippingAndPaymentOptions();
    initAccountAutofillOptions();
  }

  /* --------------------------------------------------------------------------
  1. KHỞI TẠO NẠP ĐỊA CHÍNH 2 CẤP CHO BẢNG THANH TOÁN
  -------------------------------------------------------------------------- */
  function initAddressCascading() {
    if (window.AddressManager && typeof window.AddressManager.initAddressCascade === "function") {
      window.AddressManager.initAddressCascade("orderCity", "orderWard");
    }
  }

  /* --------------------------------------------------------------------------
  2. TỰ ĐỘNG ĐỌC THÔNG TIN TÀI KHOẢN VÀ XỬ LÝ 2 TÙY CHỌN GIAO HÀNG
  -------------------------------------------------------------------------- */
  function initAccountAutofillOptions() {
    const user = typeof window.getCurrentUser === "function"
      ? window.getCurrentUser()
      : JSON.parse(localStorage.getItem("nexus_user") || "null");

    const selectionBox = document.getElementById("accountInfoSelection");
    const previewText = document.getElementById("savedInfoPreviewText");
    const savedRadio = document.getElementById("useSavedInfoRadio");
    const customRadio = document.getElementById("useCustomInfoRadio");
    const savedLabel = document.getElementById("optSavedLabel");
    const customLabel = document.getElementById("optCustomLabel");

    if (!user || (!user.name && !user.account)) {
      if (selectionBox) selectionBox.style.display = "none";
      return;
    }

    if (selectionBox) selectionBox.style.display = "block";

    if (previewText) {
      const phoneStr = user.phone ? ` • SĐT: ${user.phone}` : "";
      const addrStr = [user.address, user.ward, user.province].filter(Boolean).join(", ");
      const addrFormatted = addrStr ? ` • Địa chỉ: ${addrStr}` : "";
      previewText.textContent = `${user.name || user.account}${phoneStr}${addrFormatted}`;
    }

    function fillSavedData() {
      if (!user) return;
      const nameInput = document.getElementById("orderName");
      const phoneInput = document.getElementById("orderPhone");
      const emailInput = document.getElementById("orderEmail");
      const citySelect = document.getElementById("orderCity");
      const wardSelect = document.getElementById("orderWard");
      const addressInput = document.getElementById("orderAddress");

      if (nameInput) nameInput.value = user.name || "";
      if (phoneInput) phoneInput.value = user.phone || "";
      if (emailInput) emailInput.value = user.email || "";
      if (addressInput) addressInput.value = user.address || "";

      if (window.AddressManager && citySelect && wardSelect) {
        window.AddressManager.populateProvinceSelect(citySelect, user.province);
        if (user.province) {
          window.AddressManager.populateWardSelect(wardSelect, user.province, user.ward);
        }
      }
    }

    function clearFormFields() {
      const nameInput = document.getElementById("orderName");
      const phoneInput = document.getElementById("orderPhone");
      const emailInput = document.getElementById("orderEmail");
      const citySelect = document.getElementById("orderCity");
      const wardSelect = document.getElementById("orderWard");
      const addressInput = document.getElementById("orderAddress");

      if (nameInput) nameInput.value = "";
      if (phoneInput) phoneInput.value = "";
      if (emailInput) emailInput.value = "";
      if (addressInput) addressInput.value = "";

      if (window.AddressManager && citySelect && wardSelect) {
        window.AddressManager.populateProvinceSelect(citySelect, "");
        window.AddressManager.populateWardSelect(wardSelect, "", "");
      }
    }

    fillSavedData();

    if (savedRadio && customRadio) {
      savedRadio.addEventListener("change", () => {
        if (savedRadio.checked) {
          fillSavedData();
          if (savedLabel) {
            savedLabel.style.borderColor = "var(--accent)";
            savedLabel.classList.add("is-selected");
          }
          if (customLabel) {
            customLabel.style.borderColor = "var(--border)";
            customLabel.classList.remove("is-selected");
          }
        }
      });

      customRadio.addEventListener("change", () => {
        if (customRadio.checked) {
          clearFormFields();
          if (customLabel) {
            customLabel.style.borderColor = "var(--accent)";
            customLabel.classList.add("is-selected");
          }
          if (savedLabel) {
            savedLabel.style.borderColor = "var(--border)";
            savedLabel.classList.remove("is-selected");
          }
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
  3. RENDER SIDEBAR TÓM TẮT ĐƠN HÀNG
  -------------------------------------------------------------------------- */
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
      : (typeof window.getCart === "function" ? window.getCart() : JSON.parse(localStorage.getItem("nexus_cart") || "[]"));

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
      const product = (typeof window.PRODUCTS !== "undefined")
        ? window.PRODUCTS.find(p => p.id === item.id)
        : null;

      const name = item.name || (product ? product.name : "NEXUS VR Device");
      const img = item.image || (product && product.images ? product.images[0] : "assets/images/placeholder.svg");
      const color = item.selectedColor || "";
      const qty = item.qty || 1;
      const lineTotal = (item.price || 0) * qty;
      subtotal += lineTotal;

      const itemEl = document.createElement("div");
      itemEl.className = "summary-item";
      itemEl.style.display = "flex";
      itemEl.style.gap = "12px";
      itemEl.style.marginBottom = "12px";
      itemEl.style.alignItems = "center";

      itemEl.innerHTML = `
        <img src="${img}" alt="${name}" class="summary-item__img" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" onerror="this.onerror=null; this.src='assets/images/placeholder.svg';">
        <div class="summary-item__info" style="flex: 1;">
          <div class="summary-item__title" style="font-weight: 600; font-size: 0.875rem;">${name}</div>
          <div class="summary-item__meta" style="font-size: 0.775rem; color: var(--text-secondary);">${color ? 'Màu: ' + color + ' • ' : ''}SL: ${qty}</div>
        </div>
        <div class="summary-item__price" style="font-weight: 600; font-size: 0.875rem;">${formatVND(lineTotal)}</div>
      `;
      listEl.appendChild(itemEl);
    });

    subtotalEl.textContent = formatVND(subtotal);
    if (shippingEl) shippingEl.textContent = shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee);
    totalEl.textContent = formatVND(subtotal + shippingFee);
  }

  /* --------------------------------------------------------------------------
  4. ĐIỀU HƯỚNG BƯỚC THANH TOÁN
  -------------------------------------------------------------------------- */
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

  /* --------------------------------------------------------------------------
  5. VALIDATE STEP 1 (THÔNG TIN NGƯỜI NHẬN)
  -------------------------------------------------------------------------- */
  function validateStep1() {
    const name = document.getElementById("orderName").value.trim();
    const phone = document.getElementById("orderPhone").value.trim();
    const email = document.getElementById("orderEmail").value.trim();
    const city = document.getElementById("orderCity").value;
    const ward = document.getElementById("orderWard").value;
    const address = document.getElementById("orderAddress").value.trim();

    const nameErr = document.getElementById("orderNameError");
    const phoneErr = document.getElementById("orderPhoneError");
    const emailErr = document.getElementById("orderEmailError");
    const cityErr = document.getElementById("orderCityError");
    const wardErr = document.getElementById("orderWardError");
    const addressErr = document.getElementById("orderAddressError");

    let isValid = true;

    if (nameErr) nameErr.textContent = "";
    if (phoneErr) phoneErr.textContent = "";
    if (emailErr) emailErr.textContent = "";
    if (cityErr) cityErr.textContent = "";
    if (wardErr) wardErr.textContent = "";
    if (addressErr) addressErr.textContent = "";

    if (!name) {
      if (nameErr) nameErr.textContent = "Vui lòng nhập họ và tên người nhận.";
      isValid = false;
    }

    if (!phone) {
      if (phoneErr) phoneErr.textContent = "Vui lòng nhập số điện thoại.";
      isValid = false;
    }

    if (!email) {
      if (emailErr) emailErr.textContent = "Vui lòng nhập email nhận thông báo.";
      isValid = false;
    }

    if (!city) {
      if (cityErr) cityErr.textContent = "Vui lòng chọn Tỉnh / Thành phố.";
      isValid = false;
    }

    if (!ward) {
      if (wardErr) wardErr.textContent = "Vui lòng chọn Phường / Xã.";
      isValid = false;
    }

    if (!address) {
      if (addressErr) addressErr.textContent = "Vui lòng nhập địa chỉ nhận hàng chi tiết.";
      isValid = false;
    }

    if (isValid) {
      const fullAddrStr = `${address}, ${ward}, ${city}`;
      orderCustomerData = {
        name,
        phone,
        email,
        address: fullAddrStr,
        note: document.getElementById("orderNote") ? document.getElementById("orderNote").value.trim() : ""
      };
    }

    return isValid;
  }

  /* --------------------------------------------------------------------------
  6. PHƯƠNG THỨC VẬN CHUYỂN VÀ THANH TOÁN
  -------------------------------------------------------------------------- */
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

  /* --------------------------------------------------------------------------
  7. HOÀN TẤT ĐƠN HÀNG
  -------------------------------------------------------------------------- */
  function completeOrder() {
    const orderCode = "#NX-" + Math.floor(100000 + Math.random() * 900000);

    const codeEl = document.getElementById("confirmedOrderCode");
    const nameEl = document.getElementById("confirmedCustomerName");
    const nameDisplayEl = document.getElementById("confirmedCustomerNameDisplay");
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
    if (nameDisplayEl) nameDisplayEl.textContent = orderCustomerData.name || "Quý khách";
    if (addrEl) addrEl.textContent = orderCustomerData.address || "Địa chỉ mặc định";
    if (payEl) payEl.textContent = payLabel;

    const summaryTotal = document.getElementById("summaryTotal");
    if (totalEl && summaryTotal) {
      totalEl.textContent = summaryTotal.textContent;
    }

    if (window.cartManager && typeof window.cartManager.clear === "function") {
      window.cartManager.clear();
    } else if (typeof window.saveCart === "function") {
      window.saveCart([]);
    } else {
      localStorage.setItem("nexus_cart", JSON.stringify([]));
    }

    if (typeof window.updateCartBadge === "function") {
      window.updateCartBadge();
    }

    if (typeof window.showToast === "function") {
      window.showToast(`Đơn hàng ${orderCode} đã được khởi tạo thành công!`, "success");
    }

    setStep(3);
  }
})();
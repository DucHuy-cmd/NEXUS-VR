/* ==========================================================================
NEXUS VR — controllers/checkout-controller.js
TẦNG 3 - CONTROLLERS: ĐIỀU KHIỂN LUỒNG THANH TOÁN 3 BƯỚC & KÊ KHAI VOUCHER GIẢM GIÁ
========================================================================== */
(function () {
  "use strict";

  const FREE_SHIPPING_THRESHOLD = 50000000;
  const DEFAULT_SHIPPING_FEE = 30000;
  const EXPRESS_SHIPPING_FEE = 150000;

  let currentStep = 1;
  let selectedShippingMethod = "0";
  let shippingFee = 0;
  let orderCustomerData = {};
  let qrTimerInterval = null;
  let remainingSeconds = 300;
  let isBankTransferConfirmed = false;

  const formatVND = (num) => (num || 0).toLocaleString("vi-VN") + " ₫";

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

  function getAppliedCoupon() {
    const userKey = getUserKeySuffix();
    try {
      const raw = localStorage.getItem("nexus_coupon" + userKey) || localStorage.getItem("nexus_coupon");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearAppliedCoupon() {
    const userKey = getUserKeySuffix();
    try {
      localStorage.removeItem("nexus_coupon" + userKey);
      localStorage.removeItem("nexus_coupon");
    } catch (e) {}
  }

  document.addEventListener("DOMContentLoaded", initCheckoutController);
  if (document.readyState === "interactive" || document.readyState === "complete") {
    initCheckoutController();
  }

  function initCheckoutController() {
    if (window.__nexusCheckoutInitialized) return;
    window.__nexusCheckoutInitialized = true;

    initAddressCascading();
    initRealtimeInputFormatting();
    initCreditCardInputs();
    renderOrderSummary();
    initStepNavigation();
    initShippingAndPaymentOptions();
    initAccountAutofillOptions();
    initQrButtons();
  }

  /* --------------------------------------------------------------------------
  1. RÀNG BUỘC NHẬP LIỆU THỜI GIAN THỰC (HỌ TÊN & SỐ ĐIỆN THOẠI)
  -------------------------------------------------------------------------- */
  function initRealtimeInputFormatting() {
    const nameInput = document.getElementById("orderName");
    if (nameInput && !nameInput.dataset.bound) {
      nameInput.dataset.bound = "true";
      nameInput.addEventListener("input", function () {
        const start = this.selectionStart;
        const end = this.selectionEnd;
        this.value = this.value.replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
        this.setSelectionRange(start, end);
      });
    }

    const phoneInput = document.getElementById("orderPhone");
    if (phoneInput && !phoneInput.dataset.bound) {
      phoneInput.dataset.bound = "true";
      phoneInput.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "");
        if (this.value.length > 10) {
          this.value = this.value.slice(0, 10);
        }
      });
    }
  }

  /* --------------------------------------------------------------------------
  2. NHẬP VÀ XÁC THỰC THẺ TÍN DỤNG (TÊN IN HOA KHÔNG DẤU, 16 SỐ, MM/YY, CVV)
  -------------------------------------------------------------------------- */
  function initCreditCardInputs() {
    const cardHolderInput = document.getElementById("creditCardHolderName") || document.getElementById("cardHolderInput");
    const cardNumberInput = document.getElementById("creditCardNumber") || document.getElementById("cardNumInput");
    const expMonthInput = document.getElementById("creditCardExpMonth");
    const expYearInput = document.getElementById("creditCardExpYear");
    const cardCvvInput = document.getElementById("creditCardCvv") || document.getElementById("cardCvvInput");

    const cardHolderError = document.getElementById("creditCardHolderNameError") || document.getElementById("cardHolderError");
    const cardNumberError = document.getElementById("creditCardNumberError") || document.getElementById("cardNumError");
    const cardExpiryError = document.getElementById("creditCardExpiryError") || document.getElementById("cardExpError");
    const cardCvvError = document.getElementById("creditCardCvvError") || document.getElementById("cardCvvError");

    // 1. Ô TÊN CHỦ THẺ IN HOA KHÔNG DẤU
    if (cardHolderInput && !cardHolderInput.dataset.bound) {
      cardHolderInput.dataset.bound = "true";
      cardHolderInput.addEventListener("input", function () {
        if (cardHolderError) cardHolderError.textContent = "";
        let val = this.value
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .replace(/[^a-zA-Z\s]/g, "");
        this.value = val.toUpperCase();
      });
      cardHolderInput.addEventListener("blur", validateCreditCardHolderName);
    }

    // 2. Ô SỐ THẺ TÍN DỤNG (16 SỐ)
    if (cardNumberInput && !cardNumberInput.dataset.bound) {
      cardNumberInput.dataset.bound = "true";
      cardNumberInput.setAttribute("maxlength", "16");
      cardNumberInput.addEventListener("input", function () {
        if (cardNumberError) cardNumberError.textContent = "";
        this.value = this.value.replace(/\D/g, "").slice(0, 16);
      });
      cardNumberInput.addEventListener("blur", validateCreditCardNumber);
    }

    // 3. Ô THÁNG HẾT HẠN (MM: 01-12)
    if (expMonthInput && !expMonthInput.dataset.bound) {
      expMonthInput.dataset.bound = "true";
      expMonthInput.setAttribute("maxlength", "2");
      expMonthInput.addEventListener("input", function () {
        if (cardExpiryError) cardExpiryError.textContent = "";
        let val = this.value.replace(/\D/g, "").slice(0, 2);
        if (val.length === 2) {
          let mm = parseInt(val, 10);
          if (mm > 12) val = "12";
          if (mm === 0) val = "01";
        }
        this.value = val;
      });
      expMonthInput.addEventListener("blur", function () {
        if (this.value.length === 1) {
          let mm = parseInt(this.value, 10);
          this.value = mm === 0 ? "01" : "0" + mm;
        }
        validateCreditCardExpiry();
      });
    }

    // 4. Ô NĂM HẾT HẠN (YY: 00-99)
    if (expYearInput && !expYearInput.dataset.bound) {
      expYearInput.dataset.bound = "true";
      expYearInput.setAttribute("maxlength", "2");
      expYearInput.addEventListener("input", function () {
        if (cardExpiryError) cardExpiryError.textContent = "";
        this.value = this.value.replace(/\D/g, "").slice(0, 2);
      });
      expYearInput.addEventListener("blur", function () {
        if (this.value.length === 1) {
          this.value = "0" + this.value;
        }
        validateCreditCardExpiry();
      });
    }

    // 5. Ô MÃ CVV (3 SỐ)
    if (cardCvvInput && !cardCvvInput.dataset.bound) {
      cardCvvInput.dataset.bound = "true";
      cardCvvInput.setAttribute("maxlength", "3");
      cardCvvInput.addEventListener("input", function () {
        if (cardCvvError) cardCvvError.textContent = "";
        this.value = this.value.replace(/\D/g, "").slice(0, 3);
      });
      cardCvvInput.addEventListener("blur", validateCreditCardCvv);
    }
  }

  function validateCreditCardHolderName() {
    const input = document.getElementById("creditCardHolderName") || document.getElementById("cardHolderInput");
    const errorEl = document.getElementById("creditCardHolderNameError") || document.getElementById("cardHolderError");
    if (!input || !errorEl) return true;
    const val = input.value.trim();
    if (!val) {
      errorEl.textContent = "Vui lòng nhập tên chủ thẻ tín dụng.";
      return false;
    }
    errorEl.textContent = "";
    return true;
  }

  function validateCreditCardNumber() {
    const input = document.getElementById("creditCardNumber") || document.getElementById("cardNumInput");
    const errorEl = document.getElementById("creditCardNumberError") || document.getElementById("cardNumError");
    if (!input || !errorEl) return true;
    const rawDigits = input.value.replace(/\D/g, "");
    if (!rawDigits || rawDigits.length !== 16) {
      errorEl.textContent = "Số thẻ tín dụng phải bao gồm đúng và đủ 16 chữ số.";
      return false;
    }
    errorEl.textContent = "";
    return true;
  }

  function validateCreditCardExpiry() {
    const monthInput = document.getElementById("creditCardExpMonth");
    const yearInput = document.getElementById("creditCardExpYear");
    const errorEl = document.getElementById("creditCardExpiryError") || document.getElementById("cardExpError");
    if (!monthInput || !yearInput || !errorEl) return true;

    const mmStr = monthInput.value.trim();
    const yyStr = yearInput.value.trim();
    if (!mmStr || !yyStr || mmStr.length !== 2 || yyStr.length !== 2) {
      errorEl.textContent = "Ngày hết hạn phải gồm 2 số tháng (MM) và 2 số năm (YY).";
      return false;
    }

    const expMonth = parseInt(mmStr, 10);
    const expYear = parseInt(yyStr, 10);
    if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
      errorEl.textContent = "Tháng hết hạn phải từ 01 đến 12.";
      return false;
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear() % 100;

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      errorEl.textContent = "Thẻ của quý khách đã hết hạn!";
      return false;
    }
    errorEl.textContent = "";
    return true;
  }

  function validateCreditCardCvv() {
    const input = document.getElementById("creditCardCvv") || document.getElementById("cardCvvInput");
    const errorEl = document.getElementById("creditCardCvvError") || document.getElementById("cardCvvError");
    if (!input || !errorEl) return true;
    const rawDigits = input.value.replace(/\D/g, "");
    if (!rawDigits || rawDigits.length !== 3) {
      errorEl.textContent = "Mã CVV phải gồm đúng 3 chữ số.";
      return false;
    }
    errorEl.textContent = "";
    return true;
  }

  function validateCreditCardForm() {
    const selectedPay = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    if (selectedPay !== "card") return true;
    return validateCreditCardHolderName() && validateCreditCardNumber() && validateCreditCardExpiry() && validateCreditCardCvv();
  }

  /* --------------------------------------------------------------------------
  3. VALIDATE BƯỚC 1 (THÔNG TIN KHÁCH HÀNG)
  -------------------------------------------------------------------------- */
  function isValidGmail(email) {
    return !!email && /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email.trim().toLowerCase());
  }

  function isValidPhone10Digits(phone) {
    return !!phone && /^0\d{9}$/.test(phone.trim());
  }

  function initAddressCascading() {
    if (window.AddressManager && typeof window.AddressManager.initAddressCascade === "function") {
      window.AddressManager.initAddressCascade("orderCity", "orderWard");
    }
  }

  /* --------------------------------------------------------------------------
  4. AUTOFILL THÔNG TIN TÀI KHOẢN
  -------------------------------------------------------------------------- */
  function initAccountAutofillOptions() {
    const user = typeof window.getCurrentUser === "function"
      ? window.getCurrentUser()
      : (window.storageService && typeof window.storageService.getCurrentUser === "function"
          ? window.storageService.getCurrentUser()
          : JSON.parse(localStorage.getItem("nexus_user") || "null"));

    const selectionBox = document.getElementById("accountInfoSelection");
    const previewText = document.getElementById("savedInfoPreviewText");
    const savedRadio = document.getElementById("useSavedInfoRadio");
    const customRadio = document.getElementById("useCustomInfoRadio");

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
        if (savedRadio.checked) fillSavedData();
      });

      customRadio.addEventListener("change", () => {
        if (customRadio.checked) clearFormFields();
      });
    }
  }

  /* --------------------------------------------------------------------------
  5. RENDER SIDEBAR TÓM TẮT ĐƠN HÀNG (ĐỌC VOUCHER & KÊ KHAI GIẢM TRỪ)
  -------------------------------------------------------------------------- */
  function renderOrderSummary() {
    const listEl = document.getElementById("summaryItemsList");
    const subtotalEl = document.getElementById("summarySubtotal");
    const shippingEl = document.getElementById("summaryShipping");
    const totalEl = document.getElementById("summaryTotal");
    const emptyNotice = document.getElementById("checkoutEmptyNotice");
    const mainLayout = document.getElementById("checkoutMainLayout");

    if (!listEl || !subtotalEl || !totalEl) return;

    const cart = getCartData();

    if (cart.length === 0 && currentStep !== 3) {
      if (emptyNotice) emptyNotice.hidden = false;
      if (mainLayout) mainLayout.hidden = true;
      return;
    }

    if (emptyNotice) emptyNotice.hidden = true;
    if (mainLayout) mainLayout.hidden = false;

    let subtotal = 0;
    listEl.innerHTML = "";

    cart.forEach((item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 1;
      const lineTotal = price * qty;
      subtotal += lineTotal;

      const itemEl = document.createElement("div");
      itemEl.className = "summary-item";

      itemEl.innerHTML = `
        <img src="${item.image || 'assets/images/placeholder.svg'}" alt="${item.name || 'Sản phẩm'}" class="summary-item__img" onerror="this.onerror=null; this.src='assets/images/placeholder.svg';">
        <div style="flex: 1;">
          <div class="summary-item__title">${item.name || 'NEXUS VR Device'}</div>
          <div class="summary-item__meta">${item.selectedColor ? 'Màu: ' + item.selectedColor + ' • ' : ''}SL: ${qty}</div>
        </div>
        <div class="summary-item__price">${formatVND(lineTotal)}</div>
      `;
      listEl.appendChild(itemEl);
    });

    // 1. Đọc mã giảm giá đã áp dụng
    const coupon = getAppliedCoupon();
    let discountFee = 0;

    if (coupon) {
      if (coupon.type === "percent") {
        discountFee = Math.round(subtotal * (coupon.rate || 0.10));
      }
    }

    // 2. Tính phí vận chuyển
    const isFreeshipCoupon = coupon && coupon.type === "freeship";
    if (selectedShippingMethod === "express" || selectedShippingMethod === "150000") {
      shippingFee = EXPRESS_SHIPPING_FEE;
    } else if (subtotal >= FREE_SHIPPING_THRESHOLD || isFreeshipCoupon) {
      shippingFee = 0;
    } else {
      shippingFee = DEFAULT_SHIPPING_FEE;
    }

    subtotalEl.textContent = formatVND(subtotal);

    // 3. Tự động hiển thị/tạo dòng Giảm giá Voucher kê khai trong Sidebar Checkout
    let discountRow = document.getElementById("summaryDiscountRow");
    if (!discountRow && subtotalEl && subtotalEl.parentElement) {
      discountRow = document.createElement("div");
      discountRow.id = "summaryDiscountRow";
      discountRow.className = "summary-line summary-discount";
      discountRow.style.cssText = "display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; color: #2e7d32;";
      discountRow.innerHTML = `<span>Giảm giá <b id="summaryCouponCode"></b></span><span id="summaryDiscountAmount" style="font-weight: 600;">-0 ₫</span>`;
      subtotalEl.parentElement.insertAdjacentElement("afterend", discountRow);
    }

    if (discountRow) {
      const couponCodeEl = document.getElementById("summaryCouponCode");
      const discountAmtEl = document.getElementById("summaryDiscountAmount");

      if (discountFee > 0) {
        discountRow.style.display = "flex";
        discountRow.hidden = false;
        if (couponCodeEl) couponCodeEl.textContent = `(${coupon.code})`;
        if (discountAmtEl) discountAmtEl.textContent = `- ${formatVND(discountFee)}`;
      } else if (isFreeshipCoupon) {
        discountRow.style.display = "flex";
        discountRow.hidden = false;
        if (couponCodeEl) couponCodeEl.textContent = `(FREESHIP)`;
        if (discountAmtEl) discountAmtEl.textContent = `Miễn phí ship`;
      } else {
        discountRow.style.display = "none";
        discountRow.hidden = true;
      }
    }

    // 4. Cập nhật hiển thị phí vận chuyển
    if (shippingEl) {
      shippingEl.textContent = shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee);
    }

    // 5. Tính Tổng cộng = Tạm tính - Giảm giá + Phí vận chuyển
    const grandTotal = Math.max(0, subtotal - discountFee + shippingFee);
    totalEl.textContent = formatVND(grandTotal);
  }

  /* --------------------------------------------------------------------------
  6. XỬ LÝ VIETQR & ĐẾM NGƯỢC 5 PHÚT
  -------------------------------------------------------------------------- */
  function startQrTimer() {
    clearInterval(qrTimerInterval);
    remainingSeconds = 300;

    const qrBlock = document.getElementById("bankTransferQrBlock");
    const qrImg = document.getElementById("qrCodeImg");
    const qrTimerCountdown = document.getElementById("qrTimerCountdown");
    const qrSuccessBox = document.getElementById("qrSuccessSuccessBox");
    const confirmBtn = document.getElementById("confirmQrPaidBtn");
    const memoText = document.getElementById("qrMemoText");

    if (qrTimerCountdown) qrTimerCountdown.style.display = "block";
    if (qrImg) qrImg.style.display = "block";
    if (qrSuccessBox) qrSuccessBox.style.display = "none";

    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.style.background = "#2e7d32";
      confirmBtn.style.color = "#ffffff";
      confirmBtn.style.cursor = "pointer";
      confirmBtn.textContent = "Đã chuyển khoản";
    }

    const cart = getCartData();
    let subtotal = 0;
    cart.forEach((i) => (subtotal += (Number(i.price) || 0) * (Number(i.qty) || 1)));

    const coupon = getAppliedCoupon();
    let discountVal = (coupon && coupon.type === "percent") ? Math.round(subtotal * (coupon.rate || 0.10)) : 0;
    const isFreeshipCoupon = coupon && coupon.type === "freeship";

    let calcShipping = shippingFee;
    if (selectedShippingMethod === "express" || selectedShippingMethod === "150000") {
      calcShipping = EXPRESS_SHIPPING_FEE;
    } else if (subtotal >= FREE_SHIPPING_THRESHOLD || isFreeshipCoupon) {
      calcShipping = 0;
    } else {
      calcShipping = DEFAULT_SHIPPING_FEE;
    }

    const total = Math.max(0, subtotal - discountVal + calcShipping);

    const phone = orderCustomerData.phone || "0988123456";
    if (memoText) memoText.textContent = `NEXUS ${phone}`;

    if (qrImg) {
      qrImg.src = `https://api.vietqr.io/image/970422-0399887766-compact2.png?amount=${total}&addInfo=NEXUS%20${phone}`;
    }

    if (qrBlock) qrBlock.hidden = false;

    updateTimerDisplay();

    qrTimerInterval = setInterval(() => {
      remainingSeconds--;
      updateTimerDisplay();

      if (remainingSeconds <= 0) {
        clearInterval(qrTimerInterval);
        if (qrBlock) qrBlock.hidden = true;

        const codRadio = document.querySelector('input[name="paymentMethod"][value="cod"]');
        if (codRadio) {
          codRadio.checked = true;
          codRadio.dispatchEvent(new Event("change"));
        }

        if (typeof window.showToast === "function") {
          window.showToast("Mã QR đã hết hạn! Vui lòng chọn lại VietQR để tạo mã mới.", "warning");
        }
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const timerEl = document.getElementById("qrTimerCountdown");
    if (!timerEl) return;
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerEl.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function stopQrTimer() {
    clearInterval(qrTimerInterval);
    const qrBlock = document.getElementById("bankTransferQrBlock");
    if (qrBlock) qrBlock.hidden = true;
  }

  /* --------------------------------------------------------------------------
  7. NÚT "ĐÃ CHUYỂN KHOẢN": KHÓA PHƯƠNG THỨC -> LƯU ĐƠN & CHUYỂN TRANG ORDERS.HTML
  -------------------------------------------------------------------------- */
  function initQrButtons() {
    const cancelBtn = document.getElementById("cancelQrBtn");
    const confirmBtn = document.getElementById("confirmQrPaidBtn");

    cancelBtn?.addEventListener("click", () => {
      stopQrTimer();
      const codRadio = document.querySelector('input[name="paymentMethod"][value="cod"]');
      if (codRadio) {
        codRadio.checked = true;
        codRadio.dispatchEvent(new Event("change"));
      }
    });

    confirmBtn?.addEventListener("click", () => {
      clearInterval(qrTimerInterval);

      const qrTimerCountdown = document.getElementById("qrTimerCountdown");
      const qrImg = document.getElementById("qrCodeImg");
      const qrSuccessBox = document.getElementById("qrSuccessSuccessBox");

      if (qrTimerCountdown) qrTimerCountdown.style.display = "none";
      if (qrImg) qrImg.style.display = "none";
      if (qrSuccessBox) qrSuccessBox.style.display = "flex";

      confirmBtn.disabled = true;
      confirmBtn.style.background = "#9e9e9e";
      confirmBtn.style.color = "#ffffff";
      confirmBtn.style.cursor = "not-allowed";

      isBankTransferConfirmed = true;

      // KHÓA TẤT CẢ PHƯƠNG THỨC THANH TOÁN & VẬN CHUYỂN
      document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
        radio.disabled = true;
        const parentCard = radio.closest(".payment-card, .option-card");
        if (parentCard) {
          parentCard.style.opacity = "0.5";
          parentCard.style.cursor = "not-allowed";
          parentCard.style.pointerEvents = "none";
        }
      });

      document.querySelectorAll('input[name="shippingMethod"]').forEach((radio) => {
        radio.disabled = true;
        const parentCard = radio.closest(".shipping-card, .option-card");
        if (parentCard) {
          parentCard.style.opacity = "0.5";
          parentCard.style.cursor = "not-allowed";
          parentCard.style.pointerEvents = "none";
        }
      });

      if (typeof window.showToast === "function") {
        window.showToast("Xác nhận chuyển khoản thành công! Đang chuyển đến đơn hàng đã đặt...", "success");
      }

      setTimeout(() => {
        completeOrder("bank");
      }, 1000);
    });
  }

  /* --------------------------------------------------------------------------
  8. ĐIỀU HƯỚNG BƯỚC & TẠO ĐƠN HÀNG
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
      step3Pill.classList.toggle("is-completed", step === 3);
      lineFill.style.width = step === 1 ? "0%" : step === 2 ? "50%" : "100%";
    }

    const step1Content = document.getElementById("checkoutStep1");
    const step2Content = document.getElementById("checkoutStep2");
    const step3Content = document.getElementById("checkoutStep3");
    const sidebar = document.getElementById("checkoutSidebar");
    const layout = document.querySelector(".checkout-layout");

    if (step1Content) step1Content.hidden = step !== 1;
    if (step2Content) step2Content.hidden = step !== 2;
    if (step3Content) step3Content.hidden = step !== 3;
    if (sidebar) sidebar.hidden = step === 3;
    if (layout) {
      if (step === 3) {
        layout.classList.add("checkout-layout--receipt");
      } else {
        layout.classList.remove("checkout-layout--receipt");
      }
    }

    window.scrollTo({ top: 120, behavior: "smooth" });
  }

  function initStepNavigation() {
    const toStep2Btn = document.getElementById("toStep2Btn");
    if (toStep2Btn) {
      toStep2Btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (validateStep1()) {
          setStep(2);
        }
      });
    }

    const backToStep1Btn = document.getElementById("backToStep1Btn");
    if (backToStep1Btn) {
      backToStep1Btn.addEventListener("click", (e) => {
        e.preventDefault();
        stopQrTimer();
        setStep(1);
      });
    }

    const placeOrderBtn = document.getElementById("placeOrderBtn");
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const selectedPay = document.querySelector('input[name="paymentMethod"]:checked')?.value || "cod";

        if (selectedPay === "card") {
          if (!validateCreditCardForm()) {
            if (typeof window.showToast === "function") {
              window.showToast("Thông tin thẻ tín dụng không hợp lệ hoặc đã hết hạn!", "error");
            }
            return;
          }
        }

        if (selectedPay === "bank" && !isBankTransferConfirmed) {
          if (typeof window.showToast === "function") {
            window.showToast("Vui lòng quét mã QR và bấm 'Đã chuyển khoản' trước khi xác nhận!", "warning");
          } else {
            alert("Vui lòng quét mã QR và bấm 'Đã chuyển khoản' trước khi xác nhận!");
          }
          return;
        }

        completeOrder(selectedPay);
      });
    }
  }

  function validateStep1() {
    const name = document.getElementById("orderName")?.value.trim() || "";
    const phone = document.getElementById("orderPhone")?.value.trim() || "";
    const email = document.getElementById("orderEmail")?.value.trim() || "";
    const city = document.getElementById("orderCity")?.value || "";
    const ward = document.getElementById("orderWard")?.value || "";
    const address = document.getElementById("orderAddress")?.value.trim() || "";

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
    } else if (!isValidPhone10Digits(phone)) {
      if (phoneErr) phoneErr.textContent = "Số điện thoại phải nhập đúng và đủ 10 chữ số (bắt đầu bằng số 0).";
      isValid = false;
    }

    if (!email) {
      if (emailErr) emailErr.textContent = "Vui lòng nhập địa chỉ email nhận thông báo.";
      isValid = false;
    } else if (!isValidGmail(email)) {
      if (emailErr) emailErr.textContent = "Địa chỉ email bắt buộc phải có đuôi @gmail.com.";
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
      orderCustomerData = {
        name,
        phone,
        email,
        address: `${address}, ${ward}, ${city}`
      };
    }

    return isValid;
  }

  function initShippingAndPaymentOptions() {
    const shipOptions = document.querySelectorAll('input[name="shippingMethod"]');
    shipOptions.forEach((opt) => {
      opt.addEventListener("change", (e) => {
        if (isBankTransferConfirmed) return;
        selectedShippingMethod = e.target.value;
        document.querySelectorAll(".shipping-card").forEach((c) => c.classList.remove("is-selected"));
        e.target.closest(".option-card")?.classList.add("is-selected");
        renderOrderSummary();
      });
    });

    const payOptions = document.querySelectorAll('input[name="paymentMethod"]');
    payOptions.forEach((opt) => {
      opt.addEventListener("change", (e) => {
        if (isBankTransferConfirmed) return;

        document.querySelectorAll(".payment-card").forEach((c) => c.classList.remove("is-selected"));
        e.target.closest(".option-card")?.classList.add("is-selected");

        const val = e.target.value;
        const cardBlock = document.getElementById("creditCardBlock");

        if (val === "bank") {
          startQrTimer();
        } else {
          stopQrTimer();
        }

        if (cardBlock) cardBlock.hidden = val !== "card";
      });
    });
  }

  /* --------------------------------------------------------------------------
  9. LƯU ĐƠN HÀNG THÀNH CÔNG, HIỂN THỊ HÓA ĐƠN TIẾP ĐÓN ĐIỆN TỬ & VIETQR
  -------------------------------------------------------------------------- */
  let isOrderSubmitting = false;

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function playSuccessChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, now + 0.1);
      gain2.gain.setValueAtTime(0.1, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.45);
    } catch (e) {}
  }

  function renderOrderReceipt(order) {
    const container = document.getElementById("orderReceiptCard");
    if (!container) return;

    const items = order.items || [];
    const customer = order.customer || {};
    const formatReceiptVND = (num) => (Number(num) || 0).toLocaleString("vi-VN") + " ₫";

    let itemsHtml = "";
    items.forEach((item) => {
      const itemPrice = Number(item.price) || 0;
      const itemQty = Number(item.qty) || 1;
      const itemSubtotal = itemPrice * itemQty;
      const imgSrc = item.image || "assets/images/products/vr-vision-pro.png";
      const colorText = item.selectedColor
        ? `<span class="receipt-item-color-pill">${escapeHtml(item.selectedColor)}</span>`
        : "";

      itemsHtml += `
        <div class="receipt-item-row">
          <img class="receipt-item-thumb" src="${escapeHtml(imgSrc)}" alt="${escapeHtml(item.name || 'Sản phẩm')}">
          <div class="receipt-item-info">
            <div class="receipt-item-name">${escapeHtml(item.name || 'Thiết bị NEXUS VR')}</div>
            <div class="receipt-item-meta">
              ${colorText}
              <span>Số lượng: <strong>x${itemQty}</strong></span>
            </div>
          </div>
          <div class="receipt-item-price-col">
            <div class="receipt-item-subtotal">${formatReceiptVND(itemSubtotal)}</div>
            <div class="receipt-item-unitprice">${formatReceiptVND(itemPrice)} / chiếc</div>
          </div>
        </div>
      `;
    });

    let paymentBoxHtml = "";
    if (order.paymentCode === "bank") {
      const qrPhone = customer.phone || "0988123456";
      const qrTotal = order.totalAmount || 0;
      const qrUrl = `https://api.vietqr.io/image/970422-0399887766-compact2.png?amount=${qrTotal}&addInfo=NEXUS%20${qrPhone}`;

      paymentBoxHtml = `
        <div class="receipt-payment-box--bank">
          <img class="receipt-payment-qr" src="${qrUrl}" alt="Mã VietQR thanh toán">
          <div class="receipt-payment-bankinfo">
            <div class="receipt-bank-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              XÁC NHẬN THANH TOÁN VIETQR
            </div>
            <div>Ngân hàng: <strong>MB BANK (Ngân hàng Quân Đội)</strong></div>
            <div>Số tài khoản: <strong>0399887766</strong></div>
            <div>Chủ tài khoản: <strong>CONG TY NEXUS VR VIET NAM</strong></div>
            <div>Cú pháp chuyển khoản: <strong>NEXUS ${escapeHtml(qrPhone)}</strong></div>
            <div style="font-size: 0.825rem; color: #2e7d32; margin-top: 4px; font-weight: 600;">✓ Giao dịch đã được ghi nhận trên cổng thanh toán thông minh</div>
          </div>
        </div>
      `;
    } else if (order.paymentCode === "card") {
      paymentBoxHtml = `
        <div class="receipt-payment-box--card">
          <div class="receipt-shield-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">THANH TOÁN THẺ TÍN DỤNG ĐÃ ĐƯỢC BẢO MẬT</div>
            <div style="font-size: 0.83rem; color: var(--text-secondary);">Giao dịch được mã hóa 256-bit SSL tiêu chuẩn quốc tế PCI DSS. Hóa đơn đã được gửi qua email.</div>
          </div>
        </div>
      `;
    } else {
      paymentBoxHtml = `
        <div class="receipt-payment-box--cod">
          <div class="receipt-shield-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          </div>
          <div>
            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">THANH TOÁN TIỀN MẶT KHI NHẬN HÀNG (COD)</div>
            <div style="font-size: 0.83rem; color: var(--text-secondary);">Quý khách có quyền mở bưu phẩm đồng kiểm tra đúng thiết bị và phụ kiện trước khi thanh toán cho nhân viên giao hàng.</div>
          </div>
        </div>
      `;
    }

    const discountVal = Number(order.discountFee) || 0;
    const shippingVal = Number(order.shippingFee) || 0;

    container.innerHTML = `
      <div class="receipt-header">
        <div class="receipt-success-badge">
          <div class="receipt-success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <span class="receipt-emblem-tag">NEXUS LUXURY ORDER CONFIRMATION</span>
            <h2 class="receipt-title">Đặt hàng thành công!</h2>
          </div>
        </div>
        <div class="receipt-code-box">
          <span class="receipt-code-label">MÃ ĐƠN HÀNG</span>
          <div class="receipt-code-val">
            <span id="receiptOrderCodeVal">${escapeHtml(order.code)}</span>
            <button type="button" class="receipt-copy-btn" id="receiptCopyCodeBtn" title="Sao chép mã đơn hàng">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>
          <div class="receipt-timestamp">${escapeHtml(order.createdAt)}</div>
        </div>
      </div>

      <div class="receipt-info-grid">
        <div class="receipt-info-block">
          <h4 class="receipt-block-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Thông tin người nhận
          </h4>
          <div class="receipt-info-row"><span>Họ và tên:</span> <strong>${escapeHtml(customer.name || 'Quý khách')}</strong></div>
          <div class="receipt-info-row"><span>Số điện thoại:</span> <strong>${escapeHtml(customer.phone || '---')}</strong></div>
          <div class="receipt-info-row"><span>Email nhận tin:</span> <strong>${escapeHtml(customer.email || '---')}</strong></div>
          <div class="receipt-info-row"><span>Địa chỉ giao hàng:</span> <strong>${escapeHtml(customer.address || 'Chưa cung cấp')}</strong></div>
        </div>

        <div class="receipt-info-block">
          <h4 class="receipt-block-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            Phương thức & Vận chuyển
          </h4>
          <div class="receipt-info-row"><span>Vận chuyển:</span> <strong>${shippingVal === 150000 ? 'Hỏa tốc SafeExpress 24h' : 'Giao hàng tiêu chuẩn NEXUS SafeExpress'}</strong></div>
          <div class="receipt-info-row"><span>Phương thức:</span> <strong>${escapeHtml(order.paymentMethod || 'COD')}</strong></div>
          <div class="receipt-info-row"><span>Trạng thái:</span> <span class="receipt-status-pill">✓ Đã xác nhận & Đang chuẩn bị</span></div>
        </div>
      </div>

      <div class="receipt-items-section">
        <h4 class="receipt-block-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          Chi tiết danh mục thiết bị đã đặt
        </h4>
        <div class="receipt-items-table">
          ${itemsHtml}
        </div>
      </div>

      <div class="receipt-payment-status-box">
        ${paymentBoxHtml}
      </div>

      <div class="receipt-summary-tally">
        <div class="receipt-tally-line">
          <span>Tạm tính hàng hóa:</span>
          <span>${formatReceiptVND(order.subtotal)}</span>
        </div>
        ${discountVal > 0 ? `
          <div class="receipt-tally-line">
            <span>Khuyến mãi Voucher (${escapeHtml(order.couponCode || 'NEXUS')}):</span>
            <span style="color: #2e7d32; font-weight: 700;">-${formatReceiptVND(discountVal)}</span>
          </div>
        ` : ''}
        <div class="receipt-tally-line">
          <span>Thuế GTGT (VAT 10%):</span>
          <span>Đã bao gồm trong niêm yết</span>
        </div>
        <div class="receipt-tally-line">
          <span>Phí bảo hiểm vận chuyển:</span>
          <span>${shippingVal > 0 ? formatReceiptVND(shippingVal) : 'Miễn phí'}</span>
        </div>
        <div class="receipt-tally-total">
          <span>TỔNG CỘNG THANH TOÁN:</span>
          <span class="receipt-total-amount">${formatReceiptVND(order.totalAmount)}</span>
        </div>
      </div>

      <div class="receipt-actions-bar">
        <button type="button" class="btn-receipt-action btn-receipt-print" id="receiptPrintBtn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          In / Lưu Hóa Đơn (PDF)
        </button>
        <a href="orders.html" class="btn-receipt-action btn-receipt-orders">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          Quản Lý Đơn Hàng
        </a>
        <a href="shop.html" class="btn-receipt-action btn-receipt-shop">
          Tiếp Tục Mua Sắm →
        </a>
      </div>
    `;

    // Gắn sự kiện sao chép mã đơn hàng
    const copyBtn = document.getElementById("receiptCopyCodeBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(order.code).then(() => {
            if (typeof window.showToast === "function") {
              window.showToast(`Đã sao chép mã đơn hàng: ${order.code}`, "success");
            }
          });
        }
      });
    }

    // Gắn sự kiện in hóa đơn
    const printBtn = document.getElementById("receiptPrintBtn");
    if (printBtn) {
      printBtn.addEventListener("click", () => {
        window.print();
      });
    }
  }

  function completeOrder(paymentType) {
    if (isOrderSubmitting) return;

    const cart = getCartData();

    if (!cart || cart.length === 0) {
      if (typeof window.showToast === "function") {
        window.showToast("Giỏ hàng trống, không thể tạo đơn!", "warning");
      }
      return;
    }

    isOrderSubmitting = true;

    let subtotal = 0;
    cart.forEach((i) => (subtotal += (Number(i.price) || 0) * (Number(i.qty) || 1)));

    const coupon = getAppliedCoupon();
    let discountFee = (coupon && coupon.type === "percent") ? Math.round(subtotal * (coupon.rate || 0.10)) : 0;
    const isFreeshipCoupon = coupon && coupon.type === "freeship";

    let calcShipping = shippingFee;
    if (selectedShippingMethod === "express" || selectedShippingMethod === "150000") {
      calcShipping = EXPRESS_SHIPPING_FEE;
    } else if (subtotal >= FREE_SHIPPING_THRESHOLD || isFreeshipCoupon) {
      calcShipping = 0;
    } else {
      calcShipping = DEFAULT_SHIPPING_FEE;
    }

    const finalTotal = Math.max(0, subtotal - discountFee + calcShipping);
    const orderCode = "#NX-" + Math.floor(100000 + Math.random() * 900000);

    let cleanPaymentLabel = "Thanh toán khi nhận hàng (COD)";
    if (paymentType === "bank") {
      cleanPaymentLabel = "Chuyển khoản VietQR";
    } else if (paymentType === "card") {
      cleanPaymentLabel = "Thẻ tín dụng / Quốc tế";
    }

    // Sao chép an toàn dữ liệu giỏ hàng để tránh mất mát khi xóa bộ nhớ
    const savedItems = JSON.parse(JSON.stringify(cart));

    const newOrder = {
      id: "ORD_" + Date.now(),
      code: orderCode,
      createdAt: new Date().toLocaleString("vi-VN"),
      customer: Object.assign({}, orderCustomerData),
      items: savedItems,
      subtotal: subtotal,
      discountFee: discountFee,
      couponCode: coupon ? coupon.code : null,
      shippingFee: calcShipping,
      totalAmount: finalTotal,
      paymentMethod: cleanPaymentLabel,
      paymentCode: paymentType,
      status: "active",
      statusText: "Đơn hàng đã được xác nhận và vận chuyển"
    };

    let user = null;
    try {
      user = typeof window.getCurrentUser === "function"
        ? window.getCurrentUser()
        : JSON.parse(localStorage.getItem("nexus_user") || "{}");
    } catch (e) {
      user = {};
    }

    const userKey = user && (user.email || user.account)
      ? "_" + (user.email || user.account).toLowerCase().replace(/[^a-z0-9]/g, "_")
      : "_guest";

    const orderKey = "nexus_orders" + userKey;
    let existingOrders = [];
    try {
      existingOrders = JSON.parse(localStorage.getItem(orderKey) || "[]");
    } catch (e) {
      existingOrders = [];
    }

    existingOrders.unshift(newOrder);
    localStorage.setItem(orderKey, JSON.stringify(existingOrders));

    // Dừng bộ đếm thời gian QR
    stopQrTimer();

    // Xóa giỏ hàng và voucher đã sử dụng
    if (window.cartManager && typeof window.cartManager.clear === "function") {
      window.cartManager.clear();
    } else if (window.storageService && typeof window.storageService.clearCart === "function") {
      window.storageService.clearCart();
    } else {
      localStorage.removeItem("nexus_cart" + userKey);
      localStorage.setItem("nexus_cart", JSON.stringify([]));
    }

    clearAppliedCoupon();

    // Phát âm thanh xác nhận sang trọng
    playSuccessChime();

    // Hiển thị hóa đơn điện tử tại Bước 3
    renderOrderReceipt(newOrder);
    setStep(3);

    if (typeof window.showToast === "function") {
      window.showToast(`Đơn hàng ${orderCode} đã được khởi tạo thành công!`, "success");
    }

    isOrderSubmitting = false;
  }
})();
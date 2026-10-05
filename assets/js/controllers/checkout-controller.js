/* ==========================================================================
NEXUS VR — controllers/checkout-controller.js
TẦNG 3 - CONTROLLERS: QUẢN LÝ LUỒNG THANH TOÁN 3 BƯỚC, KHÓA VẬN CHUYỂN & THANH TOÁN
TỰ ĐỘNG LƯU ĐƠN HÀNG VÀ CHUYỂN HƯỚNG TỚI TRANG ORDERS.HTML KHI BẤM "ĐÃ CHUYỂN KHOẢN"
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
  let remainingSeconds = 300; // 5 phút đếm ngược
  let isBankTransferConfirmed = false;

  const formatVND = (num) => (num || 0).toLocaleString("vi-VN") + " ₫";

  // Hàm hỗ trợ lấy giỏ hàng chính xác theo tài khoản đang đăng nhập
  function getCartData() {
    if (window.cartManager && typeof window.cartManager.getCart === "function") {
      return window.cartManager.getCart();
    }
    if (window.storageService && typeof window.storageService.getCart === "function") {
      return window.storageService.getCart();
    }
    try {
      const user = typeof window.getCurrentUser === "function"
        ? window.getCurrentUser()
        : JSON.parse(localStorage.getItem("nexus_user") || "null");
      const userKey = user && (user.email || user.account)
        ? "_" + (user.email || user.account).toLowerCase().replace(/[^a-z0-9]/g, "_")
        : "_guest";
      return JSON.parse(localStorage.getItem("nexus_cart" + userKey) || localStorage.getItem("nexus_cart") || "[]");
    } catch (e) {
      return JSON.parse(localStorage.getItem("nexus_cart") || "[]");
    }
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
  2. NHẬP VÀ XÁC THỰC THẺ TÍN DỤNG (KHÓA 16 SỐ & TỰ BÙ SỐ 0 NẾU NHẬP 1 SỐ)
  -------------------------------------------------------------------------- */
  function initCreditCardInputs() {
    const cardNumberInput = document.getElementById("creditCardNumber") || document.getElementById("cardNumInput");
    const expMonthInput = document.getElementById("creditCardExpMonth");
    const expYearInput = document.getElementById("creditCardExpYear");
    const cardCvvInput = document.getElementById("creditCardCvv") || document.getElementById("cardCvvInput");

    const cardNumberError = document.getElementById("creditCardNumberError") || document.getElementById("cardNumError");
    const cardExpiryError = document.getElementById("creditCardExpiryError") || document.getElementById("cardExpError");
    const cardCvvError = document.getElementById("creditCardCvvError") || document.getElementById("cardCvvError");

    // 1. Ô SỐ THẺ TÍN DỤNG (KHÓA TỐI ĐA 16 SỐ)
    if (cardNumberInput && !cardNumberInput.dataset.bound) {
      cardNumberInput.dataset.bound = "true";
      cardNumberInput.setAttribute("maxlength", "16");

      cardNumberInput.addEventListener("input", function () {
        if (cardNumberError) cardNumberError.textContent = "";
        let digits = this.value.replace(/\D/g, "").slice(0, 16);
        this.value = digits;
      });

      cardNumberInput.addEventListener("blur", validateCreditCardNumber);
    }

    // 2. Ô THÁNG HẾT HẠN (MM: 01-12)
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

    // 3. Ô NĂM HẾT HẠN (YY: 00-99)
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

    // 4. Ô MÃ CVV (3 SỐ)
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

  function validateCreditCardNumber() {
    const input = document.getElementById("creditCardNumber") || document.getElementById("cardNumInput");
    const errorEl = document.getElementById("creditCardNumberError") || document.getElementById("cardNumError");
    if (!input || !errorEl) return true;

    const rawDigits = input.value.replace(/\D/g, "");
    if (!rawDigits) {
      errorEl.textContent = "Vui lòng nhập số thẻ tín dụng.";
      return false;
    }
    if (rawDigits.length !== 16) {
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

    if (monthInput.value.length === 1) {
      let mm = parseInt(monthInput.value, 10);
      monthInput.value = mm === 0 ? "01" : "0" + mm;
    }
    if (yearInput.value.length === 1) {
      yearInput.value = "0" + yearInput.value;
    }

    const mmStr = monthInput.value.trim();
    const yyStr = yearInput.value.trim();

    if (!mmStr || !yyStr) {
      errorEl.textContent = "Vui lòng nhập đầy đủ tháng và năm hết hạn.";
      return false;
    }

    if (mmStr.length !== 2 || yyStr.length !== 2) {
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
    if (!rawDigits) {
      errorEl.textContent = "Vui lòng nhập mã CVV.";
      return false;
    }
    if (rawDigits.length !== 3) {
      errorEl.textContent = "Mã CVV phải gồm đúng 3 chữ số.";
      return false;
    }

    errorEl.textContent = "";
    return true;
  }

  function validateCreditCardForm() {
    const selectedPay = document.querySelector('input[name="paymentMethod"]:checked')?.value;
    if (selectedPay !== "card") return true;

    const isNumValid = validateCreditCardNumber();
    const isExpValid = validateCreditCardExpiry();
    const isCvvValid = validateCreditCardCvv();

    return isNumValid && isExpValid && isCvvValid;
  }

  /* --------------------------------------------------------------------------
  3. VALIDATE BƯỚC 1 (THÔNG TIN KHÁCH HÀNG)
  -------------------------------------------------------------------------- */
  function isValidGmail(email) {
    if (!email) return false;
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email.trim().toLowerCase());
  }

  function isValidPhone10Digits(phone) {
    if (!phone) return false;
    return /^0\d{9}$/.test(phone.trim());
  }

  function initAddressCascading() {
    if (window.AddressManager && typeof window.AddressManager.initAddressCascade === "function") {
      window.AddressManager.initAddressCascade("orderCity", "orderWard");
    }
  }

  function calculateShippingFee(subtotal) {
    if (selectedShippingMethod === "150000" || selectedShippingMethod === "express") {
      return EXPRESS_SHIPPING_FEE;
    }
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return 0;
    }
    return DEFAULT_SHIPPING_FEE;
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
  5. RENDER SIDEBAR TÓM TẮT ĐƠN HÀNG
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

    shippingFee = calculateShippingFee(subtotal);

    subtotalEl.textContent = formatVND(subtotal);
    if (shippingEl) {
      shippingEl.textContent = shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee);
    }

    const grandTotal = subtotal + shippingFee;
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
    const total = subtotal + shippingFee;

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
  7. NÚT "ĐÃ CHUYỂN KHOẢN": KHÓA THANH TOÁN + VẬN CHUYỂN -> TẠO ĐƠN & CHUYỂN SANG ORDERS.HTML
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

      // A. KHÓA TẤT CẢ PHƯƠNG THỨC THANH TOÁN
      document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
        radio.disabled = true;
        const parentCard = radio.closest(".payment-card, .option-card");
        if (parentCard) {
          parentCard.style.opacity = "0.5";
          parentCard.style.cursor = "not-allowed";
          parentCard.style.pointerEvents = "none";
        }
      });

      // B. KHÓA TẤT CẢ PHƯƠNG THỨC VẬN CHUYỂN
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

      // C. TỰ ĐỘNG KHỞI TẠO ĐƠN HÀNG VÀ CHUYỂN THẲNG TỚI TRANG ORDERS.HTML
      setTimeout(() => {
        completeOrder("bank");
      }, 1000);
    });
  }

  /* --------------------------------------------------------------------------
  8. ĐIỀU HƯỚNG BƯỚC VÀ HOÀN TẤT ĐẶT HÀNG
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
      lineFill.style.width = step === 1 ? "0%" : step === 2 ? "50%" : "100%";
    }

    const step1Content = document.getElementById("checkoutStep1");
    const step2Content = document.getElementById("checkoutStep2");
    const step3Content = document.getElementById("checkoutStep3");
    const sidebar = document.getElementById("checkoutSidebar");

    if (step1Content) step1Content.hidden = step !== 1;
    if (step2Content) step2Content.hidden = step !== 2;
    if (step3Content) step3Content.hidden = step !== 3;
    if (sidebar) sidebar.hidden = step === 3;

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
        if (isBankTransferConfirmed) return; // Nếu đã khóa thì không cho chọn
        selectedShippingMethod = e.target.value;
        document.querySelectorAll(".shipping-card").forEach((c) => c.classList.remove("is-selected"));
        e.target.closest(".option-card")?.classList.add("is-selected");
        renderOrderSummary();
      });
    });

    const payOptions = document.querySelectorAll('input[name="paymentMethod"]');
    payOptions.forEach((opt) => {
      opt.addEventListener("change", (e) => {
        if (isBankTransferConfirmed) return; // Nếu đã khóa thì không cho chọn

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
  9. LƯU ĐƠN HÀNG THÀNH CÔNG VÀ TỰ ĐỘNG CHUYỂN HƯỚNG TỚI ORDERS.HTML
  -------------------------------------------------------------------------- */
  function completeOrder(paymentType) {
    const cart = getCartData();

    if (!cart || cart.length === 0) {
      if (typeof window.showToast === "function") {
        window.showToast("Giỏ hàng trống, không thể tạo đơn!", "warning");
      }
      return;
    }

    let subtotal = 0;
    cart.forEach((i) => (subtotal += (Number(i.price) || 0) * (Number(i.qty) || 1)));
    const finalTotal = subtotal + shippingFee;
    const orderCode = "#NX-" + Math.floor(100000 + Math.random() * 900000);

    let cleanPaymentLabel = "Thanh toán khi nhận hàng (COD)";
    if (paymentType === "bank") {
      cleanPaymentLabel = "Chuyển khoản VietQR";
    } else if (paymentType === "card") {
      cleanPaymentLabel = "Thẻ tín dụng / Quốc tế";
    }

    const newOrder = {
      id: "ORD_" + Date.now(),
      code: orderCode,
      createdAt: new Date().toLocaleString("vi-VN"),
      customer: orderCustomerData,
      items: cart,
      shippingFee: shippingFee,
      totalAmount: finalTotal,
      paymentMethod: cleanPaymentLabel,
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

    // Xóa giỏ hàng chuẩn theo tài khoản đang đăng nhập
    if (window.cartManager && typeof window.cartManager.clear === "function") {
      window.cartManager.clear();
    } else if (window.storageService && typeof window.storageService.clearCart === "function") {
      window.storageService.clearCart();
    } else {
      localStorage.removeItem("nexus_cart" + userKey);
      localStorage.setItem("nexus_cart", JSON.stringify([]));
    }

    if (typeof window.showToast === "function") {
      window.showToast(`Đặt hàng ${orderCode} thành công! Đang chuyển tới trang đơn hàng đã đặt...`, "success");
    }

    setTimeout(() => {
      window.location.href = "orders.html";
    }, 1000);
  }
})();
/* ==========================================================================
NEXUS VR — controllers/checkout-controller.js
TẦNG 3 - CONTROLLERS: QUY TRÌNH THANH TOÁN 3 BƯỚC & XỬ LÝ VIETQR
========================================================================== */
(function () {
  "use strict";

  let currentStep = 1;
  let shippingFee = 0;
  let orderCustomerData = {};
  let qrTimerInterval = null;
  let remainingSeconds = 300; // 5 phút = 300 giây

  const formatVND = (num) => (num || 0).toLocaleString("vi-VN") + " ₫";

  document.addEventListener("DOMContentLoaded", initCheckoutController);
  if (document.readyState === "interactive" || document.readyState === "complete") {
    initCheckoutController();
  }

  function initCheckoutController() {
    if (window.__nexusCheckoutInitialized) return;
    window.__nexusCheckoutInitialized = true;

    initAddressCascading();
    renderOrderSummary();
    initStepNavigation();
    initShippingAndPaymentOptions();
    initAccountAutofillOptions();
    initQrButtons();
  }

  function initAddressCascading() {
    if (window.AddressManager && typeof window.AddressManager.initAddressCascade === "function") {
      window.AddressManager.initAddressCascade("orderCity", "orderWard");
    }
  }

  function getCartItems() {
    try {
      return JSON.parse(localStorage.getItem("nexus_cart") || "[]");
    } catch (e) {
      return [];
    }
  }

  function renderOrderSummary() {
    const listEl = document.getElementById("summaryItemsList");
    const subtotalEl = document.getElementById("summarySubtotal");
    const shippingEl = document.getElementById("summaryShipping");
    const totalEl = document.getElementById("summaryTotal");
    const emptyNotice = document.getElementById("checkoutEmptyNotice");
    const mainLayout = document.getElementById("checkoutMainLayout");

    if (!listEl || !subtotalEl || !totalEl) return;

    const cart = getCartItems();

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
      const price = Number(item.price) || 0;
      const qty = Number(item.qty) || 1;
      const lineTotal = price * qty;
      subtotal += lineTotal;

      const itemEl = document.createElement("div");
      itemEl.style.cssText = "display: flex; gap: 12px; margin-bottom: 12px; align-items: center;";
      itemEl.innerHTML = `
        <img src="${item.image || 'assets/images/placeholder.svg'}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px;">
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 0.85rem;">${item.name || 'NEXUS VR'}</div>
          <div style="font-size: 0.775rem; color: var(--text-secondary);">Màu: ${item.selectedColor || 'Chuẩn'} • SL: ${qty}</div>
        </div>
        <div style="font-weight: 600; font-size: 0.85rem;">${formatVND(lineTotal)}</div>
      `;
      listEl.appendChild(itemEl);
    });

    subtotalEl.textContent = formatVND(subtotal);
    shippingEl.textContent = shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee);
    totalEl.textContent = formatVND(subtotal + shippingFee);
  }

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

    document.getElementById("checkoutStep1").hidden = (step !== 1);
    document.getElementById("checkoutStep2").hidden = (step !== 2);
    document.getElementById("checkoutStep3").hidden = (step !== 3);
    document.getElementById("checkoutSidebar").hidden = (step === 3);

    window.scrollTo({ top: 100, behavior: "smooth" });
  }

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
      previewText.textContent = `${user.name || user.account}${phoneStr}${addrStr ? ' • Địa chỉ: ' + addrStr : ''}`;
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

    fillSavedData();

    if (savedRadio && customRadio) {
      savedRadio.addEventListener("change", () => {
        if (savedRadio.checked) {
          fillSavedData();
          if (savedLabel) savedLabel.classList.add("is-selected");
          if (customLabel) customLabel.classList.remove("is-selected");
        }
      });

      customRadio.addEventListener("change", () => {
        if (customRadio.checked) {
          const nameInput = document.getElementById("orderName");
          const phoneInput = document.getElementById("orderPhone");
          const emailInput = document.getElementById("orderEmail");
          const addressInput = document.getElementById("orderAddress");
          if (nameInput) nameInput.value = "";
          if (phoneInput) phoneInput.value = "";
          if (emailInput) emailInput.value = "";
          if (addressInput) addressInput.value = "";
          if (customLabel) customLabel.classList.add("is-selected");
          if (savedLabel) savedLabel.classList.remove("is-selected");
        }
      });
    }
  }

  function validateStep1() {
    const name = document.getElementById("orderName").value.trim();
    const phone = document.getElementById("orderPhone").value.trim();
    const email = document.getElementById("orderEmail").value.trim();
    const city = document.getElementById("orderCity").value;
    const ward = document.getElementById("orderWard").value;
    const address = document.getElementById("orderAddress").value.trim();

    document.getElementById("orderNameError").textContent = name ? "" : "Vui lòng nhập họ tên.";
    document.getElementById("orderPhoneError").textContent = phone ? "" : "Vui lòng nhập SĐT.";
    document.getElementById("orderEmailError").textContent = email ? "" : "Vui lòng nhập email.";
    document.getElementById("orderCityError").textContent = city ? "" : "Chọn Tỉnh/Thành.";
    document.getElementById("orderWardError").textContent = ward ? "" : "Chọn Phường/Xã.";
    document.getElementById("orderAddressError").textContent = address ? "" : "Vui lòng nhập địa chỉ.";

    if (!name || !phone || !email || !city || !ward || !address) return false;

    orderCustomerData = {
      name, phone, email,
      address: `${address}, ${ward}, ${city}`
    };
    return true;
  }

  function validateCreditCard() {
    const num = document.getElementById("cardNumInput")?.value.replace(/\s+/g, '') || '';
    const exp = document.getElementById("cardExpInput")?.value.trim() || '';
    const cvv = document.getElementById("cardCvvInput")?.value.trim() || '';

    let valid = true;
    if (num.length < 15) {
      document.getElementById("cardNumError").textContent = "Số thẻ gồm 16 chữ số.";
      valid = false;
    } else document.getElementById("cardNumError").textContent = "";

    if (!/^\d{2}\/\d{2}$/.test(exp)) {
      document.getElementById("cardExpError").textContent = "Định dạng MM/YY.";
      valid = false;
    } else document.getElementById("cardExpError").textContent = "";

    if (cvv.length < 3) {
      document.getElementById("cardCvvError").textContent = "CVV gồm 3-4 số.";
      valid = false;
    } else document.getElementById("cardCvvError").textContent = "";

    return valid;
  }

  /* --------------------------------------------------------------------------
  KHỞI TẠO BỘ ĐẾM VÀ MÃ QR CHUYỂN KHOẢN
  -------------------------------------------------------------------------- */
  function startQrTimer() {
    clearInterval(qrTimerInterval);
    remainingSeconds = 300; // Reset về 5 phút

    const qrBlock = document.getElementById("bankTransferQrBlock");
    const qrImg = document.getElementById("qrCodeImg");
    const qrTimerCountdown = document.getElementById("qrTimerCountdown");
    const qrSuccessBox = document.getElementById("qrSuccessSuccessBox");
    const confirmBtn = document.getElementById("confirmQrPaidBtn");
    const memoText = document.getElementById("qrMemoText");

    // Khôi phục giao diện mở lại QR
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

    const cart = getCartItems();
    let total = 0;
    cart.forEach(i => total += (Number(i.price) || 0) * (Number(i.qty) || 1));
    total += shippingFee;

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
          window.showToast("Mã QR đã hết hạn! Vui lòng tích chọn lại VietQR nếu muốn tạo mã mới.", "warning");
        }
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const timerEl = document.getElementById("qrTimerCountdown");
    if (!timerEl) return;
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function stopQrTimer() {
    clearInterval(qrTimerInterval);
    const qrBlock = document.getElementById("bankTransferQrBlock");
    if (qrBlock) qrBlock.hidden = true;
  }

  /* --------------------------------------------------------------------------
  XỬ LÝ NÚT BẤM TRONG KHỐI VIETQR
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
      // 1. Dừng ngay bộ đếm thời gian
      clearInterval(qrTimerInterval);

      // 2. Ẩn bộ đếm thời gian và Mã QR
      const qrTimerCountdown = document.getElementById("qrTimerCountdown");
      const qrImg = document.getElementById("qrCodeImg");
      const qrSuccessBox = document.getElementById("qrSuccessSuccessBox");

      if (qrTimerCountdown) qrTimerCountdown.style.display = "none";
      if (qrImg) qrImg.style.display = "none";

      // 3. Hiện Dấu tích xanh cùng dòng chữ "Chuyển khoản thành công"
      if (qrSuccessBox) qrSuccessBox.style.display = "flex";

      // 4. Đổi nút "Đã chuyển khoản" thành màu xám và vô hiệu hóa không cho bấm nữa
      confirmBtn.disabled = true;
      confirmBtn.style.background = "#9e9e9e";
      confirmBtn.style.color = "#ffffff";
      confirmBtn.style.cursor = "not-allowed";

      if (typeof window.showToast === "function") {
        window.showToast("Xác nhận chuyển khoản thành công!", "success");
      }

      // LƯU Ý: Trang web vẫn giữ nguyên ở đây, KHÔNG chuyển trang!
    });
  }

  function initShippingAndPaymentOptions() {
    document.querySelectorAll('input[name="shippingMethod"]').forEach(opt => {
      opt.addEventListener("change", (e) => {
        shippingFee = Number(e.target.value) || 0;
        document.querySelectorAll(".shipping-card").forEach(c => c.classList.remove("is-selected"));
        e.target.closest(".option-card")?.classList.add("is-selected");
        renderOrderSummary();
      });
    });

    document.querySelectorAll('input[name="paymentMethod"]').forEach(opt => {
      opt.addEventListener("change", (e) => {
        document.querySelectorAll(".payment-card").forEach(c => c.classList.remove("is-selected"));
        e.target.closest(".option-card")?.classList.add("is-selected");

        const val = e.target.value;
        const cardBlock = document.getElementById("creditCardBlock");

        if (val === "bank") {
          startQrTimer();
        } else {
          stopQrTimer();
        }

        if (cardBlock) cardBlock.hidden = (val !== "card");
      });
    });
  }

  function initStepNavigation() {
    document.getElementById("toStep2Btn")?.addEventListener("click", () => {
      if (validateStep1()) setStep(2);
    });

    document.getElementById("backToStep1Btn")?.addEventListener("click", () => {
      stopQrTimer();
      setStep(1);
    });

    // BẤM NÚT "XÁC NHẬN ĐẶT HÀNG" -> LÚC NÀY MỚI HOÀN TẤT VÀ CHUYỂN TRANG
    document.getElementById("placeOrderBtn")?.addEventListener("click", () => {
      const selectedPay = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cod';

      if (selectedPay === "cod") {
        completeOrder("Thanh toán khi nhận hàng (COD)");
      } else if (selectedPay === "bank") {
        stopQrTimer();
        completeOrder("Chuyển khoản VietQR");
      } else if (selectedPay === "card") {
        if (validateCreditCard()) {
          completeOrder("Thẻ tín dụng / Quốc tế");
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
  HOÀN TẤT ĐƠN HÀNG -> CHUYỂN HƯỚNG TỚI ORDERS.HTML
  -------------------------------------------------------------------------- */
  function completeOrder(payLabel) {
    const cart = getCartItems();
    let subtotal = 0;
    cart.forEach(i => subtotal += (Number(i.price) || 0) * (Number(i.qty) || 1));
    const finalTotal = subtotal + shippingFee;

    const orderCode = "#NX-" + Math.floor(100000 + Math.random() * 900000);

    const newOrder = {
      id: "ORD_" + Date.now(),
      code: orderCode,
      createdAt: new Date().toLocaleString("vi-VN"),
      customer: orderCustomerData,
      items: cart,
      shippingFee: shippingFee,
      totalAmount: finalTotal,
      paymentMethod: payLabel,
      status: "active",
      statusText: "Đơn hàng đã được xác nhận và vận chuyển"
    };

    try {
      const existingOrders = JSON.parse(localStorage.getItem("nexus_orders") || "[]");
      existingOrders.unshift(newOrder);
      localStorage.setItem("nexus_orders", JSON.stringify(existingOrders));
    } catch (e) {
      console.error("Lỗi lưu đơn hàng:", e);
    }

    localStorage.removeItem("nexus_cart");
    window.dispatchEvent(new CustomEvent("nexus:cart-updated"));

    setStep(3);

    if (typeof window.showToast === "function") {
      window.showToast(`Khởi tạo đơn hàng ${orderCode} thành công!`, "success");
    }

    setTimeout(() => {
      window.location.href = "orders.html";
    }, 1000);
  }
})();
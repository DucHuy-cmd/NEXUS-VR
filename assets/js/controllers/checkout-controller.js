/* =========================================================
   NEXUS VR — CHECKOUT CONTROLLER
   File: assets/js/controllers/checkout-controller.js
   ========================================================= */

(function () {
  'use strict';

  const COUPON_CODE = 'KM10VR';
  const COUPON_RATE = 0.10;
  const QR_IMAGE = 'assets/images/payment/mb-qr.jpg';

  const WARDS = {
    'TP. Hồ Chí Minh': [
      'Phường Bến Nghé',
      'Phường Đa Kao',
      'Phường Nguyễn Thái Bình',
      'Phường Thảo Điền',
      'Phường Linh Trung'
    ],
    'Hà Nội': [
      'Phường Hoàn Kiếm',
      'Phường Cửa Nam',
      'Phường Ba Đình',
      'Phường Giảng Võ',
      'Phường Láng'
    ],
    'Đà Nẵng': [
      'Phường Hải Châu',
      'Phường Thanh Khê',
      'Phường An Hải',
      'Phường Sơn Trà',
      'Phường Ngũ Hành Sơn'
    ],
    'Cần Thơ': [
      'Phường Ninh Kiều',
      'Phường Cái Khế',
      'Phường Tân An',
      'Phường An Khánh'
    ],
    'Hải Phòng': [
      'Phường Hồng Bàng',
      'Phường Lê Chân',
      'Phường Ngô Quyền',
      'Phường Gia Viên'
    ],
    'Đồng Nai': [
      'Phường Biên Hòa',
      'Phường Long Bình',
      'Phường Tam Hiệp',
      'Phường Trấn Biên'
    ],
    'Bình Dương': [
      'Phường Thủ Dầu Một',
      'Phường Phú Cường',
      'Phường Phú Lợi',
      'Phường Hiệp Thành'
    ]
  };

  function getCartManager() {
    return window.cartManager && typeof window.cartManager.getCart === 'function'
      ? window.cartManager
      : null;
  }

  function getCart() {
    const manager = getCartManager();

    if (manager) {
      const cart = manager.getCart();
      return Array.isArray(cart) ? cart : [];
    }

    try {
      const raw = localStorage.getItem('nexus_cart');
      const cart = raw ? JSON.parse(raw) : [];
      return Array.isArray(cart) ? cart : [];
    } catch (error) {
      console.warn('[checkout] Không đọc được nexus_cart:', error);
      return [];
    }
  }

  function formatVND(amount) {
    const manager = getCartManager();

    if (manager && typeof manager.formatVND === 'function') {
      return manager.formatVND(amount);
    }

    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(Math.max(0, Number(amount) || 0));
  }

  function getSubtotal(cart) {
    return cart.reduce((sum, item) => {
      return sum + (Number(item.price) || 0) * Math.max(1, Number(item.qty) || 1);
    }, 0);
  }

  function getCouponState() {
    /*
     * cart-manager.js hiện giữ voucher trong biến runtime.
     * Checkout đọc thêm ô coupon ở cart.html nếu người dùng đã nhập KM10VR.
     * Nếu sau này team lưu coupon vào localStorage, controller này cũng đọc được.
     */
    try {
      const stored = localStorage.getItem('nexus_coupon');
      if (stored && stored.toUpperCase() === COUPON_CODE) {
        return COUPON_CODE;
      }
    } catch (error) {
      // Bỏ qua, dùng mặc định không voucher.
    }

    return null;
  }

  function calculateSummary(cart) {
    const subtotal = getSubtotal(cart);
    const coupon = getCouponState();
    const discount = coupon === COUPON_CODE
      ? Math.round(subtotal * COUPON_RATE)
      : 0;
    const finalTotal = Math.max(0, subtotal - discount);

    return {
      subtotal,
      coupon,
      discount,
      finalTotal
    };
  }

  function renderItems(cart, summary) {
    const container = document.getElementById('checkoutItems');
    if (!container) return;

    container.innerHTML = '';

    if (!cart.length) {
      container.innerHTML = '<div class="checkout-empty">Giỏ hàng đang trống. Vui lòng quay lại giỏ hàng.</div>';
      return;
    }

    cart.forEach((item) => {
      const qty = Math.max(1, Number(item.qty) || 1);
      const oldLineTotal = (Number(item.price) || 0) * qty;
      const lineDiscount = summary.coupon === COUPON_CODE
        ? Math.round(oldLineTotal * COUPON_RATE)
        : 0;
      const newLineTotal = Math.max(0, oldLineTotal - lineDiscount);

      const row = document.createElement('article');
      row.className = 'checkout-item';

      const image = document.createElement('img');
      image.className = 'checkout-item__image';
      image.src = item.image || 'assets/images/placeholder.svg';
      image.alt = item.name || 'Sản phẩm NEXUS VR';
      image.loading = 'lazy';
      image.onerror = function () {
        this.onerror = null;
        this.src = 'assets/images/placeholder.svg';
      };

      const info = document.createElement('div');
      info.className = 'checkout-item__info';

      const name = document.createElement('span');
      name.className = 'checkout-item__name';
      name.textContent = item.name || 'Sản phẩm NEXUS VR';

      const qtyText = document.createElement('span');
      qtyText.className = 'checkout-item__qty';
      qtyText.textContent = `Số lượng: ${qty}`;

      info.append(name, qtyText);

      const price = document.createElement('div');
      price.className = 'checkout-item__price';

      if (summary.coupon === COUPON_CODE) {
        const oldPrice = document.createElement('span');
        oldPrice.className = 'checkout-item__old';
        oldPrice.textContent = formatVND(oldLineTotal);

        const newPrice = document.createElement('span');
        newPrice.className = 'checkout-item__new';
        newPrice.textContent = formatVND(newLineTotal);

        price.append(oldPrice, newPrice);
      } else {
        const newPrice = document.createElement('span');
        newPrice.className = 'checkout-item__new';
        newPrice.textContent = formatVND(oldLineTotal);
        price.appendChild(newPrice);
      }

      row.append(image, info, price);
      container.appendChild(row);
    });
  }

  function renderSummary(summary) {
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const discountRow = document.getElementById('checkoutDiscountRow');
    const couponLabel = document.getElementById('checkoutCouponLabel');
    const discountEl = document.getElementById('checkoutDiscount');
    const originalTotal = document.getElementById('checkoutOriginalTotal');
    const finalTotal = document.getElementById('checkoutFinalTotal');

    if (subtotalEl) subtotalEl.textContent = formatVND(summary.subtotal);
    if (finalTotal) finalTotal.textContent = formatVND(summary.finalTotal);

    if (summary.discount > 0) {
      if (discountRow) discountRow.hidden = false;
      if (couponLabel) couponLabel.textContent = `(${COUPON_CODE})`;
      if (discountEl) discountEl.textContent = `-${formatVND(summary.discount)}`;

      if (originalTotal) {
        originalTotal.hidden = false;
        originalTotal.textContent = formatVND(summary.subtotal);
      }
    } else {
      if (discountRow) discountRow.hidden = true;
      if (originalTotal) originalTotal.hidden = true;
    }
  }

  function populateWards() {
    const province = document.getElementById('customerProvince');
    const ward = document.getElementById('customerWard');

    if (!province || !ward) return;

    province.addEventListener('change', () => {
      const list = WARDS[province.value] || [];

      ward.innerHTML = '';

      if (!list.length) {
        ward.disabled = true;
        ward.innerHTML = '<option value="">Chọn tỉnh / thành phố trước</option>';
        return;
      }

      ward.disabled = false;

      const first = document.createElement('option');
      first.value = '';
      first.textContent = 'Chọn xã / phường';
      ward.appendChild(first);

      list.forEach((name) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        ward.appendChild(option);
      });

      clearFieldError('customerProvince');
      clearFieldError('customerWard');
    });
  }

  function setFieldError(id, message) {
    const field = document.getElementById(id);
    const error = document.querySelector(`[data-error-for="${id}"]`);

    if (field) {
      field.closest('.checkout-field')?.classList.add('is-invalid');
    }

    if (error) error.textContent = message;
  }

  function clearFieldError(id) {
    const field = document.getElementById(id);
    const error = document.querySelector(`[data-error-for="${id}"]`);

    if (field) {
      field.closest('.checkout-field')?.classList.remove('is-invalid');
    }

    if (error) error.textContent = '';
  }

  function clearAllErrors() {
    [
      'customerName',
      'customerPhone',
      'customerProvince',
      'customerWard',
      'customerAddress'
    ].forEach(clearFieldError);
  }

  function validateCheckoutForm() {
    clearAllErrors();

    const name = document.getElementById('customerName')?.value.trim() || '';
    const phone = document.getElementById('customerPhone')?.value.trim() || '';
    const province = document.getElementById('customerProvince')?.value || '';
    const ward = document.getElementById('customerWard')?.value || '';
    const address = document.getElementById('customerAddress')?.value.trim() || '';

    let valid = true;

    if (name.length < 2) {
      setFieldError('customerName', 'Vui lòng nhập họ và tên.');
      valid = false;
    }

    if (!/^(0|\+84)\d{9,10}$/.test(phone.replace(/[\s.-]/g, ''))) {
      setFieldError('customerPhone', 'Số điện thoại không hợp lệ.');
      valid = false;
    }

    if (!province) {
      setFieldError('customerProvince', 'Vui lòng chọn tỉnh / thành phố.');
      valid = false;
    }

    if (!ward) {
      setFieldError('customerWard', 'Vui lòng chọn xã / phường.');
      valid = false;
    }

    if (address.length < 5) {
      setFieldError('customerAddress', 'Vui lòng nhập địa chỉ cụ thể.');
      valid = false;
    }

    /*
     * Tích hợp validator.js của project:
     * Nếu validator.js của nhóm expose một trong các API phổ biến dưới đây,
     * controller sẽ gọi nó trước khi submit. Nếu chưa expose API, phần
     * validation nội bộ phía trên vẫn bảo vệ form.
     */
    if (valid && window.validator) {
      try {
        if (typeof window.validator.validateForm === 'function') {
          const result = window.validator.validateForm(document.getElementById('checkoutForm'));
          if (result === false) valid = false;
        } else if (typeof window.validator.validate === 'function') {
          const result = window.validator.validate(document.getElementById('checkoutForm'));
          if (result === false) valid = false;
        }
      } catch (error) {
        console.warn('[checkout] validator.js không tương thích API hiện tại:', error);
      }
    }

    return valid;
  }

  function setupQrLightbox() {
    const lightbox = document.getElementById('qrLightbox');
    const imageButton = document.getElementById('qrImageButton');
    const closeButton = document.getElementById('closeQrButton');

    if (!lightbox || !imageButton) return;

    const open = () => {
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    };

    imageButton.addEventListener('click', open);
    closeButton?.addEventListener('click', close);
    lightbox.querySelector('[data-close-qr]')?.addEventListener('click', close);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !lightbox.hidden) close();
    });
  }

  function setupPaymentConfirmation() {
    const button = document.getElementById('confirmPaymentBtn');
    const success = document.getElementById('paymentSuccess');

    if (!button || !success) return;

    button.addEventListener('click', () => {
      button.disabled = true;
      button.textContent = 'ĐÃ XÁC NHẬN';

      success.hidden = false;
    });
  }

  function setupSubmit(cart, summary) {
    const form = document.getElementById('checkoutForm');
    const button = document.getElementById('placeOrderBtn');

    if (!form || !button) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!cart.length) {
        window.alert('Giỏ hàng đang trống. Vui lòng quay lại giỏ hàng.');
        return;
      }

      if (!validateCheckoutForm()) {
        const firstInvalid = form.querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea');
        firstInvalid?.focus();
        return;
      }

      const paymentConfirmed = !document.getElementById('paymentSuccess')?.hidden;

      if (!paymentConfirmed) {
        window.alert('Vui lòng xác nhận đã thanh toán bằng QR trước khi đặt hàng.');
        document.getElementById('confirmPaymentBtn')?.focus();
        return;
      }

      button.disabled = true;
      button.textContent = 'ĐANG XỬ LÝ...';

      const order = {
        id: `NEXUS-${Date.now()}`,
        createdAt: new Date().toISOString(),
        customer: {
          name: document.getElementById('customerName').value.trim(),
          phone: document.getElementById('customerPhone').value.trim(),
          province: document.getElementById('customerProvince').value,
          ward: document.getElementById('customerWard').value,
          address: document.getElementById('customerAddress').value.trim(),
          note: document.getElementById('orderNote').value.trim()
        },
        paymentMethod: 'QR',
        items: cart,
        subtotal: summary.subtotal,
        discount: summary.discount,
        total: summary.finalTotal
      };

      try {
        localStorage.setItem('nexus_last_order', JSON.stringify(order));
      } catch (error) {
        console.warn('[checkout] Không lưu được đơn hàng:', error);
      }

      window.alert('Thanh toán thành công! Đơn hàng của bạn đã được ghi nhận.');

      /*
       * Chưa tự xóa cart ở bước này để người dùng vẫn có thể kiểm tra
       * đơn hàng. Khi nhóm làm trang success/order history, có thể chuyển
       * logic xóa cart sang bước đó.
       */
      button.textContent = 'ĐẶT HÀNG THÀNH CÔNG';
    });
  }

  function init() {
    const cart = getCart();
    const summary = calculateSummary(cart);

    renderItems(cart, summary);
    renderSummary(summary);
    populateWards();
    setupQrLightbox();
    setupPaymentConfirmation();
    setupSubmit(cart, summary);

    const qrImage = document.getElementById('qrImage');
    if (qrImage) qrImage.src = QR_IMAGE;
  }

  document.addEventListener('DOMContentLoaded', init);
})();

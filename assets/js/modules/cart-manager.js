/* =========================================================
   NEXUS VR — CART MANAGER
   File: assets/js/modules/cart-manager.js

   API mà shop-controller.js của Hưng đang gọi:
     window.cartManager.add(id, qty)

   Storage dùng chung:
     localStorage key: "nexus_cart"

   Item chuẩn:
     {
       id: String,
       name: String,
       price: Number,
       image: String,
       qty: Number
     }

   KM10VR:
     giảm 10% — phần voucher được xử lý riêng trên cart.html.
   ========================================================= */

(function () {
  'use strict';

  const CART_KEY = 'nexus_cart';
  const COUPON_CODE = 'KM10VR';
  const COUPON_RATE = 0.10;

  let activeCouponCode = null;

  function getStorageService() {
    return (
      window.storageService &&
      typeof window.storageService.getCart === 'function' &&
      typeof window.storageService.saveCart === 'function'
    )
      ? window.storageService
      : null;
  }

  function readCart() {
    const storageService = getStorageService();

    try {
      if (storageService) {
        const cart = storageService.getCart();
        return Array.isArray(cart) ? cart : [];
      }

      const raw = localStorage.getItem(CART_KEY);
      const cart = raw ? JSON.parse(raw) : [];
      return Array.isArray(cart) ? cart : [];
    } catch (error) {
      console.warn('[cart-manager] Không đọc được giỏ hàng:', error);
      return [];
    }
  }

  function writeCart(cart) {
    const safeCart = Array.isArray(cart) ? cart : [];
    const storageService = getStorageService();

    try {
      if (storageService) {
        storageService.saveCart(safeCart);
      } else {
        localStorage.setItem(CART_KEY, JSON.stringify(safeCart));
      }
    } catch (error) {
      console.error('[cart-manager] Không lưu được giỏ hàng:', error);
      return false;
    }

    notifyCartChanged(safeCart);
    return true;
  }

  function normalizeQuantity(value) {
    const qty = Number(value);
    if (!Number.isFinite(qty)) return 1;
    return Math.max(1, Math.floor(qty));
  }

  function normalizeCartItem(item) {
    if (!item || typeof item !== 'object') return null;

    const id = String(item.id ?? '').trim();
    if (!id) return null;

    const price = Number(item.price);
    const qty = normalizeQuantity(item.qty);

    return {
      id,
      name: String(item.name ?? 'Sản phẩm NEXUS VR'),
      price: Number.isFinite(price) ? price : 0,
      image: String(item.image ?? item.img ?? ''),
      qty
    };
  }

  function cleanCart(cart) {
    const source = Array.isArray(cart) ? cart : [];
    const result = [];

    source.forEach((item) => {
      const normalized = normalizeCartItem(item);
      if (!normalized) return;

      const existing = result.find((cartItem) => cartItem.id === normalized.id);

      if (existing) {
        existing.qty += normalized.qty;
      } else {
        result.push(normalized);
      }
    });

    return result;
  }

  function getProductById(id) {
    const products = typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)
      ? PRODUCTS
      : [];

    return products.find((product) => String(product.id) === String(id)) || null;
  }

  function buildCartItemFromProduct(product, qty) {
    if (!product) return null;

    return {
      id: String(product.id),
      name: String(product.name ?? 'Sản phẩm NEXUS VR'),
      price: Number(product.price) || 0,
      image: product.images && product.images[0]
        ? String(product.images[0])
        : '',
      qty: normalizeQuantity(qty)
    };
  }

  function getCart() {
    return cleanCart(readCart());
  }

  function getTotalQuantity(cart = getCart()) {
    return cart.reduce((total, item) => {
      return total + normalizeQuantity(item.qty);
    }, 0);
  }

  function getSubtotal(cart = getCart()) {
    return cart.reduce((total, item) => {
      return total + (Number(item.price) || 0) * normalizeQuantity(item.qty);
    }, 0);
  }

  function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(Math.max(0, Number(amount) || 0));
  }

  function updateBadge(count = getTotalQuantity()) {
    const badges = document.querySelectorAll('#cartBadge, #cart-badge, .cart-badge');

    badges.forEach((badge) => {
      badge.textContent = String(count);
      badge.hidden = count <= 0;
    });
  }

  function notifyCartChanged(cart = getCart()) {
    const detail = {
      cart: cleanCart(cart),
      totalQuantity: getTotalQuantity(cart)
    };

    updateBadge(detail.totalQuantity);

    window.dispatchEvent(new CustomEvent('nexus:cart-updated', {
      detail
    }));
  }

  function add(id, qty = 1) {
    const product = getProductById(id);

    if (!product) {
      console.warn(
        `[cart-manager] Không tìm thấy sản phẩm id="${id}" trong PRODUCTS.`
      );
      return false;
    }

    const amount = normalizeQuantity(qty);
    const newItem = buildCartItemFromProduct(product, amount);

    if (!newItem) return false;

    const cart = getCart();
    const existing = cart.find((item) => item.id === newItem.id);

    if (existing) {
      existing.qty += amount;

      /*
       * Đồng bộ lại dữ liệu sản phẩm từ PRODUCTS.
       * Nhờ vậy tên, giá và ảnh trong cart luôn lấy cùng nguồn
       * với shop-controller.js.
       */
      existing.name = newItem.name;
      existing.price = newItem.price;
      existing.image = newItem.image;
    } else {
      cart.push(newItem);
    }

    const saved = writeCart(cart);

    if (saved) {
      notifyCartChanged(cart);
    }

    return saved;
  }

  function remove(index) {
    const cart = getCart();
    const numericIndex = Number(index);

    if (!Number.isInteger(numericIndex) || !cart[numericIndex]) {
      return false;
    }

    cart.splice(numericIndex, 1);
    return writeCart(cart);
  }

  function updateQuantity(index, change) {
    const cart = getCart();
    const numericIndex = Number(index);

    if (!Number.isInteger(numericIndex) || !cart[numericIndex]) {
      return false;
    }

    const nextQty = normalizeQuantity(cart[numericIndex].qty) + Number(change || 0);

    if (nextQty <= 0) {
      cart.splice(numericIndex, 1);
    } else {
      cart[numericIndex].qty = Math.floor(nextQty);
    }

    return writeCart(cart);
  }

  function setQuantity(index, quantity) {
    const cart = getCart();
    const numericIndex = Number(index);

    if (!Number.isInteger(numericIndex) || !cart[numericIndex]) {
      return false;
    }

    const nextQty = Math.floor(Number(quantity));

    if (!Number.isFinite(nextQty) || nextQty <= 0) {
      cart.splice(numericIndex, 1);
    } else {
      cart[numericIndex].qty = nextQty;
    }

    return writeCart(cart);
  }

  function clear() {
    return writeCart([]);
  }

  function applyCoupon(code) {
    const normalized = String(code || '').trim().toUpperCase();

    if (normalized === COUPON_CODE) {
      activeCouponCode = COUPON_CODE;
      return {
        valid: true,
        code: COUPON_CODE,
        rate: COUPON_RATE
      };
    }

    activeCouponCode = null;

    return {
      valid: false,
      code: null,
      rate: 0
    };
  }

  function getDiscount(subtotal = getSubtotal()) {
    if (activeCouponCode !== COUPON_CODE) return 0;
    return Math.round(subtotal * COUPON_RATE);
  }

  function getFinalTotal(subtotal = getSubtotal()) {
    return Math.max(0, subtotal - getDiscount(subtotal));
  }

  function renderCartTable() {
    const tbody = document.getElementById('cartTableBody');
    const tableWrap = document.getElementById('cartTableWrap');
    const emptyNotice = document.getElementById('emptyCartNotice');

    if (!tbody) return;

    const cart = getCart();

    tbody.innerHTML = '';

    if (cart.length === 0) {
      if (tableWrap) tableWrap.hidden = true;
      if (emptyNotice) emptyNotice.hidden = false;
      updateBadge(0);
      renderSummary(0);
      return;
    }

    if (tableWrap) tableWrap.hidden = false;
    if (emptyNotice) emptyNotice.hidden = true;

    cart.forEach((item, index) => {
      const row = document.createElement('tr');

      const productCell = document.createElement('td');
      const product = document.createElement('div');
      product.className = 'cart-product';

      const image = document.createElement('img');
      image.className = 'cart-product__image';
      image.src = item.image || 'assets/images/placeholder.svg';
      image.alt = item.name;
      image.loading = 'lazy';
      image.onerror = function () {
        this.onerror = null;
        this.src = 'assets/images/placeholder.svg';
      };

      const info = document.createElement('div');
      info.className = 'cart-product__info';

      const name = document.createElement('span');
      name.className = 'cart-product__name';
      name.textContent = item.name;

      const id = document.createElement('span');
      id.className = 'cart-product__id';
      id.textContent = `Mã SP: ${item.id}`;

      info.append(name, id);
      product.append(image, info);
      productCell.appendChild(product);

      const priceCell = document.createElement('td');
      const price = document.createElement('span');
      price.className = 'cart-price';
      price.textContent = formatVND(item.price);
      priceCell.appendChild(price);

      const qtyCell = document.createElement('td');
      const qtyBox = document.createElement('div');
      qtyBox.className = 'cart-qty';

      const minus = document.createElement('button');
      minus.type = 'button';
      minus.textContent = '−';
      minus.setAttribute('aria-label', `Giảm số lượng ${item.name}`);
      minus.addEventListener('click', () => updateQuantity(index, -1));

      const qtyText = document.createElement('span');
      qtyText.textContent = String(item.qty);

      const plus = document.createElement('button');
      plus.type = 'button';
      plus.textContent = '+';
      plus.setAttribute('aria-label', `Tăng số lượng ${item.name}`);
      plus.addEventListener('click', () => updateQuantity(index, 1));

      qtyBox.append(minus, qtyText, plus);
      qtyCell.appendChild(qtyBox);

      const totalCell = document.createElement('td');
      const total = document.createElement('span');
      total.className = 'cart-item-total';
      total.textContent = formatVND(item.price * item.qty);
      totalCell.appendChild(total);

      const removeCell = document.createElement('td');
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'cart-remove-btn';
      removeBtn.textContent = '×';
      removeBtn.title = 'Xóa sản phẩm';
      removeBtn.setAttribute('aria-label', `Xóa ${item.name}`);
      removeBtn.addEventListener('click', () => remove(index));
      removeCell.appendChild(removeBtn);

      row.append(
        productCell,
        priceCell,
        qtyCell,
        totalCell,
        removeCell
      );

      tbody.appendChild(row);
    });

    updateBadge(getTotalQuantity(cart));
    renderSummary(getSubtotal(cart));
  }

  function renderSummary(subtotal) {
    const subTotalEl = document.getElementById('subTotal');
    const discountRow = document.getElementById('discountRow');
    const couponCodeLabel = document.getElementById('couponCodeLabel');
    const discountAmount = document.getElementById('discountAmount');
    const originalTotal = document.getElementById('originalTotal');
    const finalTotal = document.getElementById('finalTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (!subTotalEl || !finalTotal) return;

    const discount = getDiscount(subtotal);
    const final = Math.max(0, subtotal - discount);

    subTotalEl.textContent = formatVND(subtotal);
    finalTotal.textContent = formatVND(final);

    if (discount > 0) {
      if (discountRow) discountRow.hidden = false;
      if (couponCodeLabel) couponCodeLabel.textContent = `(${COUPON_CODE})`;
      if (discountAmount) discountAmount.textContent = `-${formatVND(discount)}`;

      /*
       * Đúng yêu cầu giao diện:
       * giá gốc nằm trên + gạch ngang,
       * giá mới nằm dưới.
       */
      if (originalTotal) {
        originalTotal.hidden = false;
        originalTotal.textContent = formatVND(subtotal);
      }
    } else {
      if (discountRow) discountRow.hidden = true;
      if (originalTotal) originalTotal.hidden = true;
    }

    if (checkoutBtn) {
      checkoutBtn.disabled = subtotal <= 0;
    }
  }

  function showCouponMessage(message, type) {
    const messageEl = document.getElementById('couponMessage');
    if (!messageEl) return;

    messageEl.textContent = message;

    if (type === 'success') {
      messageEl.style.color = 'var(--cart-success, #2B7A4B)';
    } else if (type === 'error') {
      messageEl.style.color = 'var(--cart-danger, #B54747)';
    } else {
      messageEl.style.color = 'var(--cart-muted, #726657)';
    }
  }

  function handleApplyCoupon() {
    const input = document.getElementById('couponInput');
    if (!input) return;

    const code = input.value.trim().toUpperCase();

    if (!code) {
      activeCouponCode = null;
      showCouponMessage('Vui lòng nhập mã khuyến mãi.', 'error');
      renderCartTable();
      return;
    }

    const result = applyCoupon(code);

    if (result.valid) {
      input.value = COUPON_CODE;
      showCouponMessage('Áp dụng KM10VR thành công — giảm 10%.', 'success');
    } else {
      showCouponMessage('Mã không hợp lệ. Mã hiện có: KM10VR.', 'error');
    }

    renderCartTable();
  }

  function proceedToCheckout() {
    const cart = getCart();

    if (cart.length === 0) {
      showCouponMessage('Giỏ hàng đang trống.', 'error');
      return;
    }

    /*
     * Chuyển sang checkout.html khi trang thanh toán của Tường đã sẵn sàng.
     * Giữ coupon/cart trong localStorage để checkout có thể đọc lại.
     */
    window.location.href = 'checkout.html';
  }

  function bindEvents() {
    document.getElementById('clearCartBtn')?.addEventListener('click', () => {
      const cart = getCart();

      if (cart.length === 0) return;

      if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng không?')) {
        activeCouponCode = null;
        const input = document.getElementById('couponInput');
        if (input) input.value = '';
        showCouponMessage('', 'normal');
        clear();
        renderCartTable();
      }
    });

    document.getElementById('btnApplyCoupon')?.addEventListener(
      'click',
      handleApplyCoupon
    );

    document.getElementById('couponInput')?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleApplyCoupon();
      }
    });

    document.getElementById('checkoutBtn')?.addEventListener(
      'click',
      proceedToCheckout
    );

    /*
     * Cùng tab:
     * shop-controller.js / product-controller.js có thể thay đổi cart
     * rồi phát event này.
     */
    window.addEventListener('nexus:cart-updated', () => {
      renderCartTable();
    });

    /*
     * Khác tab:
     * localStorage phát storage event ở tab còn lại.
     */
    window.addEventListener('storage', (event) => {
      if (event.key === CART_KEY) {
        renderCartTable();
      }
    });
  }

  function init() {
    bindEvents();

    /*
     * Không tự tạo sản phẩm mẫu.
     * Giỏ hàng trống thật sự thì phải hiện empty state.
     */
    const cleaned = cleanCart(readCart());

    if (JSON.stringify(cleaned) !== JSON.stringify(readCart())) {
      writeCart(cleaned);
    }

    updateBadge(getTotalQuantity(cleaned));
    renderCartTable();
  }

  window.cartManager = {
    add,
    remove,
    updateQuantity,
    setQuantity,
    clear,
    getCart,
    getTotalQuantity,
    getSubtotal,
    formatVND,
    applyCoupon,
    getDiscount,
    getFinalTotal,
    renderCartTable
  };

  document.addEventListener('DOMContentLoaded', init);
})();

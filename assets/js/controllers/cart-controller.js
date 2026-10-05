/* =========================================================
   NEXUS VR — CART MANAGER
   File: assets/js/modules/cart-manager.js
   Manages cart state, color variants, free shipping threshold,
   promo vouchers, and UI updates across all pages.
   ========================================================= */

(function (global) {
  'use strict';

  const CART_KEY = 'nexus_cart';
  const FREE_SHIPPING_THRESHOLD = 50000000; // 50.000.000đ
  const VALID_COUPONS = {
    'KM10VR': { type: 'percent', rate: 0.10, label: 'Giảm 10%' },
    'NEXUS10': { type: 'percent', rate: 0.10, label: 'Giảm 10%' },
    'FREESHIP': { type: 'freeship', rate: 0, label: 'Miễn phí vận chuyển' }
  };

  let activeCoupon = null;

  function getUserKeySuffix() {
    if (window.storageService && typeof window.storageService.getUserKeySuffix === 'function') {
      return window.storageService.getUserKeySuffix();
    }
    try {
      const user = typeof window.getCurrentUser === 'function'
        ? window.getCurrentUser()
        : JSON.parse(localStorage.getItem('nexus_user') || 'null');

      if (user && (user.email || user.account)) {
        return '_' + (user.email || user.account).toLowerCase().replace(/[^a-z0-9]/g, '_');
      }
    } catch (e) {}
    return '_guest';
  }

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
      const key = CART_KEY + getUserKeySuffix();
      const raw = localStorage.getItem(key) || localStorage.getItem(CART_KEY);
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
        const key = CART_KEY + getUserKeySuffix();
        localStorage.setItem(key, JSON.stringify(safeCart));
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
      selectedColor: String(item.selectedColor || ''),
      selectedColorHex: String(item.selectedColorHex || ''),
      colorIndex: Number.isFinite(Number(item.colorIndex)) ? Number(item.colorIndex) : 0,
      qty
    };
  }

  function cleanCart(cart) {
    const source = Array.isArray(cart) ? cart : [];
    const result = [];

    source.forEach((item) => {
      const normalized = normalizeCartItem(item);
      if (!normalized) return;

      const existing = result.find(
        (cartItem) => cartItem.id === normalized.id && cartItem.selectedColor === normalized.selectedColor
      );

      if (existing) {
        existing.qty += normalized.qty;
      } else {
        result.push(normalized);
      }
    });

    return result;
  }

  function getProductById(id) {
    const products = (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS))
      ? PRODUCTS
      : (window.PRODUCTS && Array.isArray(window.PRODUCTS) ? window.PRODUCTS : []);

    return products.find((product) => String(product.id) === String(id)) || null;
  }

  function buildCartItemFromProduct(product, qty, colorNameOrIndex) {
    if (!product) return null;

    let chosenColor = null;
    let chosenIndex = 0;

    if (product.colors && product.colors.length > 0) {
      if (typeof colorNameOrIndex === 'number' && product.colors[colorNameOrIndex]) {
        chosenColor = product.colors[colorNameOrIndex];
        chosenIndex = colorNameOrIndex;
      } else if (typeof colorNameOrIndex === 'string' && colorNameOrIndex.trim()) {
        const queryColor = colorNameOrIndex.trim().toLowerCase();
        const foundIdx = product.colors.findIndex(
          (c) => c && c.name && c.name.toLowerCase() === queryColor
        );
        if (foundIdx > -1) {
          chosenColor = product.colors[foundIdx];
          chosenIndex = foundIdx;
        } else {
          chosenColor = product.colors[0];
          chosenIndex = 0;
        }
      } else {
        chosenColor = product.colors[0];
        chosenIndex = 0;
      }
    }

    const imageSrc = chosenColor && chosenColor.image 
      ? chosenColor.image 
      : (product.images && product.images[0] ? product.images[0] : (product.image || 'assets/images/placeholder.svg'));

    return {
      id: String(product.id),
      name: String(product.name ?? 'Sản phẩm NEXUS VR'),
      price: Number(product.price) || 0,
      image: imageSrc,
      selectedColor: chosenColor ? (chosenColor.name || '') : '',
      selectedColorHex: chosenColor ? (chosenColor.hex || '') : '',
      colorIndex: chosenIndex,
      qty: normalizeQuantity(qty)
    };
  }

  function getCart() {
    return cleanCart(readCart());
  }

  function getTotalQuantity(cart = getCart()) {
    return cart.reduce((total, item) => total + normalizeQuantity(item.qty), 0);
  }

  function getSubtotal(cart = getCart()) {
    return cart.reduce((total, item) => total + (Number(item.price) || 0) * normalizeQuantity(item.qty), 0);
  }

  function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(Math.max(0, Number(amount) || 0));
  }

  function updateBadge(count = getTotalQuantity()) {
    const badges = document.querySelectorAll('#cartBadge, #cart-badge, .cart-badge, .navbar-cart-count, #navCartCount, [data-cart-count]');
    badges.forEach((badge) => {
      badge.textContent = String(count);
      badge.hidden = count <= 0;
      if (count > 0) {
        badge.style.display = 'inline-flex';
      }
    });
  }

  function notifyCartChanged(cart = getCart()) {
    const detail = {
      cart: cleanCart(cart),
      totalQuantity: getTotalQuantity(cart)
    };

    updateBadge(detail.totalQuantity);
    window.dispatchEvent(new CustomEvent('nexus:cart-updated', { detail }));
  }

  function add(id, qty = 1, colorNameOrIndex = null) {
    const product = getProductById(id);

    if (!product) {
      console.warn(`[cart-manager] Không tìm thấy sản phẩm id="${id}" trong PRODUCTS.`);
      return false;
    }

    const amount = normalizeQuantity(qty);
    const newItem = buildCartItemFromProduct(product, amount, colorNameOrIndex);

    if (!newItem) return false;

    const cart = getCart();
    const existing = cart.find(
      (item) => String(item.id) === String(newItem.id) && item.selectedColor === newItem.selectedColor
    );

    if (existing) {
      existing.qty += amount;
    } else {
      cart.push(newItem);
    }

    const saved = writeCart(cart);

    if (saved) {
      notifyCartChanged(cart);
      const colorLabel = newItem.selectedColor ? ` (${newItem.selectedColor})` : '';
      if (typeof window.showToast === 'function') {
        window.showToast(`Đã thêm ${amount} ${newItem.name}${colorLabel} vào giỏ hàng`, 'success');
      }
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
      return remove(numericIndex);
    } else {
      cart[numericIndex].qty = Math.floor(nextQty);
    }

    return writeCart(cart);
  }

  function updateItemColor(index, newColorIndex) {
    const cart = getCart();
    const numericIndex = Number(index);

    if (!Number.isInteger(numericIndex) || !cart[numericIndex]) return false;

    const item = cart[numericIndex];
    const product = getProductById(item.id);
    if (!product || !product.colors || !product.colors[newColorIndex]) return false;

    const chosenColor = product.colors[newColorIndex];
    item.selectedColor = chosenColor.name;
    item.selectedColorHex = chosenColor.hex;
    item.colorIndex = newColorIndex;
    item.image = chosenColor.image || (product.images && product.images[0] ? product.images[0] : item.image);

    const saved = writeCart(cart);
    if (saved && typeof window.showToast === 'function') {
      window.showToast(`Đã đổi màu sản phẩm thành ${chosenColor.name}`, 'info');
    }
    return saved;
  }

  function setQuantity(index, quantity) {
    const cart = getCart();
    const numericIndex = Number(index);

    if (!Number.isInteger(numericIndex) || !cart[numericIndex]) {
      return false;
    }

    const nextQty = Math.floor(Number(quantity));

    if (!Number.isFinite(nextQty) || nextQty <= 0) {
      return remove(numericIndex);
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

    if (VALID_COUPONS[normalized]) {
      activeCoupon = {
        code: normalized,
        ...VALID_COUPONS[normalized]
      };
      return {
        valid: true,
        code: normalized,
        label: activeCoupon.label,
        rate: activeCoupon.rate
      };
    }

    activeCoupon = null;
    return { valid: false, code: null, rate: 0 };
  }

  function getDiscount(subtotal = getSubtotal()) {
    if (!activeCoupon) return 0;
    if (activeCoupon.type === 'percent') {
      return Math.round(subtotal * activeCoupon.rate);
    }
    return 0;
  }

  function getFinalTotal(subtotal = getSubtotal()) {
    return Math.max(0, subtotal - getDiscount(subtotal));
  }

  function renderCartTable() {
    const tbody = document.getElementById('cartTableBody');
    const tableWrap = document.getElementById('cartTableWrap');
    const emptyNotice = document.getElementById('emptyCartNotice');
    const crossSellMount = document.getElementById('cartCrossSellMount');

    if (!tbody) return;

    const cart = getCart();
    tbody.innerHTML = '';

    if (cart.length === 0) {
      if (tableWrap) tableWrap.hidden = true;
      if (emptyNotice) emptyNotice.hidden = false;
      if (crossSellMount) renderCrossSell([]);
      updateBadge(0);
      renderSummary(0);
      renderFreeShippingProgress(0);
      return;
    }

    if (tableWrap) tableWrap.hidden = false;
    if (emptyNotice) emptyNotice.hidden = true;

    cart.forEach((item, index) => {
      const product = getProductById(item.id);
      const row = document.createElement('tr');

      const productCell = document.createElement('td');
      const productBox = document.createElement('div');
      productBox.className = 'cart-product';

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

      const name = document.createElement('a');
      name.className = 'cart-product__name';
      name.href = `product.html?id=${encodeURIComponent(item.id)}`;
      name.textContent = item.name;

      const colorWrap = document.createElement('div');
      colorWrap.className = 'cart-product__color-selector';

      if (product && product.colors && product.colors.length > 0) {
        const select = document.createElement('select');
        select.className = 'cart-color-select';
        select.ariaLabel = `Chọn màu cho ${item.name}`;

        product.colors.forEach((c, cIdx) => {
          const opt = document.createElement('option');
          opt.value = cIdx;
          opt.textContent = `Màu: ${c.name}`;
          if (c.name === item.selectedColor || cIdx === item.colorIndex) {
            opt.selected = true;
          }
          select.appendChild(opt);
        });

        select.addEventListener('change', (e) => {
          updateItemColor(index, Number(e.target.value));
        });

        const colorDot = document.createElement('span');
        colorDot.className = 'cart-color-dot';
        colorDot.style.backgroundColor = item.selectedColorHex || '#9F9FA1';

        colorWrap.append(colorDot, select);
      } else {
        colorWrap.textContent = item.selectedColor ? `Màu: ${item.selectedColor}` : '';
      }

      info.append(name, colorWrap);
      productBox.append(image, info);
      productCell.appendChild(productBox);

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
      minus.addEventListener('click', () => updateQuantity(index, -1));

      const qtyText = document.createElement('span');
      qtyText.textContent = String(item.qty);

      const plus = document.createElement('button');
      plus.type = 'button';
      plus.textContent = '+';
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
      removeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      removeBtn.title = 'Xóa sản phẩm';
      removeBtn.addEventListener('click', () => remove(index));
      removeCell.appendChild(removeBtn);

      row.append(productCell, priceCell, qtyCell, totalCell, removeCell);
      tbody.appendChild(row);
    });

    const subtotal = getSubtotal(cart);
    updateBadge(getTotalQuantity(cart));
    renderSummary(subtotal);
    renderFreeShippingProgress(subtotal);
    if (crossSellMount) renderCrossSell(cart);
  }

  function renderFreeShippingProgress(subtotal) {
    const progressFill = document.getElementById('freeShipProgressFill');
    const statusText = document.getElementById('freeShipStatusText');
    if (!progressFill || !statusText) return;

    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      progressFill.style.width = '100%';
      statusText.innerHTML = `<strong>Chúc mừng!</strong> Bạn đã được <strong>Miễn phí vận chuyển</strong> cho đơn hàng này.`;
    } else {
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      progressFill.style.width = `${percent}%`;
      statusText.innerHTML = `Mua thêm <strong>${formatVND(remaining)}</strong> để nhận <strong>Miễn phí vận chuyển</strong>!`;
    }
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
      if (couponCodeLabel) couponCodeLabel.textContent = `(${activeCoupon ? activeCoupon.code : ''})`;
      if (discountAmount) discountAmount.textContent = `-${formatVND(discount)}`;
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

  function renderCrossSell(cart) {
    const container = document.getElementById('cartCrossSellMount');
    if (!container || typeof PRODUCTS === 'undefined') return;

    const cartIds = cart.map((i) => i.id);
    const suggestions = PRODUCTS.filter((p) => !cartIds.includes(String(p.id))).slice(0, 3);

    if (suggestions.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="cart-cross-sell">
        <h3 class="cart-cross-sell__title">Có thể bạn cũng thích</h3>
        <div class="cart-cross-sell__grid">
          ${suggestions
            .map((p) => {
              const img = p.images && p.images[0] ? p.images[0] : 'assets/images/placeholder.svg';
              return `
                <div class="cross-sell-item">
                  <img src="${img}" alt="${p.name}" class="cross-sell-item__img" loading="lazy">
                  <div class="cross-sell-item__info">
                    <h4 class="cross-sell-item__name">${p.name}</h4>
                    <span class="cross-sell-item__price">${formatVND(p.price)}</span>
                  </div>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="window.cartManager.add('${p.id}', 1)">
                    + Thêm
                  </button>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  function bindEvents() {
    window.addEventListener('nexus:cart-updated', () => {
      renderCartTable();
      updateBadge();
    });

    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith(CART_KEY)) {
        renderCartTable();
        updateBadge();
      }
    });

    // CHUYỂN TRANG SANG CHECKOUT KHI BẤM NÚT THANH TOÁN TẠI CART.HTML
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#checkoutBtn, .btn-checkout, [data-action="checkout"]');
      if (btn) {
        e.preventDefault();
        const cart = getCart();
        if (cart.length > 0) {
          window.location.href = 'checkout.html';
        } else {
          if (typeof window.showToast === 'function') {
            window.showToast('Giỏ hàng của bạn đang trống!', 'warning');
          }
        }
      }
    });

    document.addEventListener('DOMContentLoaded', () => updateBadge());
    document.addEventListener('nexus:navbar-loaded', () => updateBadge());
    window.addEventListener('pageshow', () => updateBadge());
    window.addEventListener('load', () => updateBadge());
  }

  function init() {
    bindEvents();
    const cleaned = cleanCart(readCart());

    if (JSON.stringify(cleaned) !== JSON.stringify(readCart())) {
      writeCart(cleaned);
    }

    updateBadge(getTotalQuantity(cleaned));
    renderCartTable();
  }

  // EXPORT TOÀN CỤC
  global.cartManager = {
    add,
    remove,
    updateQuantity,
    updateItemColor,
    setQuantity,
    clear,
    clearCart: clear,
    getCart,
    getTotalQuantity,
    getSubtotal,
    formatVND,
    applyCoupon,
    getDiscount,
    getFinalTotal,
    renderCartTable,
    updateBadge
  };

  global.addToCart = function (id, qty = 1, colorNameOrIndex = null) {
    return add(id, qty, colorNameOrIndex);
  };

  global.addProductToCart = function (id, qty = 1, colorNameOrIndex = null) {
    return add(id, qty, colorNameOrIndex);
  };

  document.addEventListener('DOMContentLoaded', init);
})(typeof window !== 'undefined' ? window : this);
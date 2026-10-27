/* =========================================================
   assets/js/controllers/shop-controller.js
   Logic riêng cho trang Cửa hàng (shop.html)
   Handles filters (category, color swatches, price, rating, sale/stock, search),
   interactive card color selection, sorting, pagination, and adding color variants to cart.
   ========================================================= */

(function () {
  const PAGE_SIZE = 6;
  let currentPage = 1;

  const grid = document.getElementById('productGrid');
  const emptyState = document.getElementById('shopEmpty');
  const resultCount = document.getElementById('resultCount');
  const pagination = document.getElementById('pagination');
  const sortSelect = document.getElementById('sortSelect');
  const priceRange = document.getElementById('priceRange');
  const priceRangeValue = document.getElementById('priceRangeValue');
  const inStockOnly = document.getElementById('inStockOnly');
  const categoryInputs = document.querySelectorAll('input[name="category"]');
  const ratingInputs = document.querySelectorAll('input[name="rating"]');
  const resetFilterBtn = document.getElementById('resetFilterBtn');
  const searchInput = document.getElementById('shopSearchInput');

  const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

  function getSaleCheckbox() {
    return document.getElementById('filter-sale');
  }

  function isOnSale(product) {
    return Number(product.oldPrice) > Number(product.price)
      && product.oldPrice !== null
      && product.oldPrice !== undefined;
  }

  function renderStars(rating) {
    const full = Math.round(rating);
    return '★★★★★☆☆☆☆☆'.slice(5 - full, 10 - full);
  }

  function getActiveColorFilters() {
    const colorInputs = document.querySelectorAll('input[name="color"]:checked');
    const values = Array.from(colorInputs).map(cb => cb.value);
    if (values.includes('all') || values.length === 0) return null;
    return values;
  }

  function getFilteredProducts() {
    const source = typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];

    const activeCategories = Array.from(categoryInputs)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    const activeColors = getActiveColorFilters();
    const maxPrice = Number(priceRange.value);
    const minRating = Number(document.querySelector('input[name="rating"]:checked').value);
    const stockOnly = inStockOnly.checked;
    const isSaleOnly = getSaleCheckbox()?.checked ?? false;
    const searchTerm = (searchInput ? searchInput.value : '').trim().toLowerCase();

    let list = source.filter(p => {
      const matchCat = activeCategories.includes(p.category);
      const matchPrice = p.price <= maxPrice;
      const matchRating = p.rating >= minRating;
      const matchStock = !stockOnly || p.stock > 0;
      const matchSale = !isSaleOnly || isOnSale(p);
      const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm) || (p.shortDesc && p.shortDesc.toLowerCase().includes(searchTerm));

      let matchColor = true;
      if (activeColors && activeColors.length > 0) {
        matchColor = p.colors && p.colors.some(c => activeColors.includes(c.name));
      }

      return matchCat && matchPrice && matchRating && matchStock && matchSale && matchSearch && matchColor;
    });

    switch (sortSelect.value) {
      case 'price-asc':
        list = list.slice().sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = list.slice().sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        list = list.slice().sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        list = list.slice().sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return list;
  }

  /* WISHLIST HELPER */
  const WISHLIST_KEY = 'nexus_wishlist';
  const hasStorageService = () =>
    typeof window.storageService === 'object' &&
    typeof window.storageService.getWishlist === 'function' &&
    typeof window.storageService.saveWishlist === 'function';

  function getWishlist() {
    if (hasStorageService()) {
      return window.storageService.getWishlist() || [];
    }
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveWishlist(list) {
    if (hasStorageService()) {
      window.storageService.saveWishlist(list);
      return;
    }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  }

  function isInWishlist(id) {
    return getWishlist().includes(id);
  }

  function toggleWishlist(id, btn) {
    const list = getWishlist();
    const idx = list.indexOf(id);
    if (idx > -1) {
      list.splice(idx, 1);
      btn.classList.remove('is-active');
      btn.setAttribute('aria-pressed', 'false');
      notify('Đã xóa khỏi danh sách yêu thích');
    } else {
      list.push(id);
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      notify('Đã thêm vào danh sách yêu thích');
    }
    saveWishlist(list);
  }

  function notify(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message, 'success');
    }
  }

  function getProductById(id) {
    const source = typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
    return source.find(p => p.id === id) || null;
  }

  function addToCart(id, qty = 1, colorIndex = 0) {
    const product = getProductById(id);
    if (!product) return;

    if (window.cartManager && typeof window.cartManager.add === 'function') {
      window.cartManager.add(id, qty, colorIndex);
    } else if (hasStorageService() && typeof window.storageService.saveCart === 'function') {
      const cart = window.storageService.getCart() || [];
      const chosenColor = (product.colors && product.colors[colorIndex]) ? product.colors[colorIndex] : null;
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: chosenColor ? chosenColor.image : (product.images[0] || ''),
        selectedColor: chosenColor ? chosenColor.name : '',
        selectedColorHex: chosenColor ? chosenColor.hex : '',
        colorIndex: colorIndex,
        qty
      };
      cart.push(cartItem);
      window.storageService.saveCart(cart);
      notify('Đã thêm sản phẩm vào giỏ hàng');
    }
  }

  function handleProductGridClick(e) {
    const addBtn = e.target.closest('.product-card__add-btn');
    if (addBtn) {
      if (addBtn.disabled) return;
      const card = addBtn.closest('.product-card');
      const selectedColorIndex = card ? Number(card.dataset.selectedColorIndex || 0) : 0;
      addToCart(addBtn.dataset.id, 1, selectedColorIndex);
      return;
    }

    const wishlistBtn = e.target.closest('.product-card__wishlist-btn');
    if (wishlistBtn) {
      toggleWishlist(wishlistBtn.dataset.id, wishlistBtn);
      return;
    }

    // Color dot click on product card
    const colorDot = e.target.closest('.card-color-dot');
    if (colorDot) {
      const card = colorDot.closest('.product-card');
      if (!card) return;
      const colorIndex = Number(colorDot.dataset.colorIndex);
      const imgPath = colorDot.dataset.image;

      const imgEl = card.querySelector('.product-card__image');
      if (imgEl && imgPath) {
        imgEl.style.opacity = '0.5';
        setTimeout(() => {
          imgEl.src = imgPath;
          imgEl.style.opacity = '1';
        }, 120);
      }

      card.querySelectorAll('.card-color-dot').forEach(dot => dot.classList.remove('is-active'));
      colorDot.classList.add('is-active');
      card.dataset.selectedColorIndex = colorIndex;
    }
  }

  function renderProductCard(p) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.id = p.id;
    card.dataset.selectedColorIndex = "0";

    const onSale = isOnSale(p);
    const discount = onSale ? Math.round((1 - p.price / p.oldPrice) * 100) : null;
    const initialImg = (p.colors && p.colors[0] && p.colors[0].image) ? p.colors[0].image : (p.images[0] || 'assets/images/placeholder.svg');

    let colorSwatchesHtml = '';
    if (p.colors && p.colors.length > 0) {
      colorSwatchesHtml = `
        <div class="card-color-swatches" aria-label="Tùy chọn màu sắc">
          ${p.colors.map((c, idx) => `
            <button
              type="button"
              class="card-color-dot ${idx === 0 ? 'is-active' : ''}"
              style="background-color: ${c.hex};"
              title="Màu ${c.name}"
              aria-label="Chọn màu ${c.name}"
              data-color-index="${idx}"
              data-image="${c.image || p.images[idx] || p.images[0]}"
            ></button>
          `).join('')}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="product-card__media">
        <a href="product.html?id=${encodeURIComponent(p.id)}">
          <img class="product-card__image" src="${initialImg}" alt="${p.name}"
               onerror="this.onerror=null; this.src='assets/images/placeholder.svg';">
        </a>
        ${onSale ? `<span class="product-card__badge">-${discount}%</span>` : ''}
        <button type="button" class="product-card__wishlist-btn${isInWishlist(p.id) ? ' is-active' : ''}" aria-label="Thêm vào yêu thích" aria-pressed="${isInWishlist(p.id)}" data-id="${p.id}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        </button>
      </div>
      <div class="product-card__body">
        <span class="product-card__category">${p.categoryLabel}</span>
        <h3 class="product-card__title">
          <a href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a>
        </h3>
        ${colorSwatchesHtml}
        <div class="product-card__rating">
          <span class="stars" aria-hidden="true">${renderStars(p.rating)}</span>
          <span class="product-card__rating-count">(${p.reviewCount})</span>
        </div>
        <div class="product-card__price">
          <span class="product-card__price-current">${formatVND(p.price)}</span>
          ${p.oldPrice ? `<span class="product-card__price-old">${formatVND(p.oldPrice)}</span>` : ''}
        </div>
        <button type="button" class="product-card__add-btn" data-id="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>
          ${p.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </button>
      </div>
    `;
    return card;
  }

  function renderPagination(totalItems) {
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    const makeBtn = (label, page, opts = {}) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pagination__btn' + (opts.active ? ' is-active' : '');
      btn.textContent = label;
      btn.disabled = !!opts.disabled;
      btn.addEventListener('click', () => {
        currentPage = page;
        update();
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return btn;
    };

    pagination.appendChild(makeBtn('‹ Trước', currentPage - 1, { disabled: currentPage === 1 }));
    for (let i = 1; i <= totalPages; i++) {
      pagination.appendChild(makeBtn(String(i), i, { active: i === currentPage }));
    }
    pagination.appendChild(makeBtn('Sau ›', currentPage + 1, { disabled: currentPage === totalPages }));
  }

  function update() {
    const filtered = getFilteredProducts();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    grid.innerHTML = '';
    pageItems.forEach(p => grid.appendChild(renderProductCard(p)));

    resultCount.textContent = filtered.length;
    emptyState.hidden = filtered.length !== 0;
    grid.hidden = filtered.length === 0;

    renderPagination(filtered.length);
  }

  // Bind color chip events in sidebar
  document.querySelectorAll('input[name="color"]').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const chip = e.target.closest('.color-filter-chip');
      if (chip) {
        if (e.target.value === 'all') {
          document.querySelectorAll('input[name="color"]').forEach(c => {
            if (c.value !== 'all') {
              c.checked = false;
              c.closest('.color-filter-chip')?.classList.remove('is-active');
            }
          });
          e.target.checked = true;
          chip.classList.add('is-active');
        } else {
          const allCb = document.querySelector('input[name="color"][value="all"]');
          if (allCb) {
            allCb.checked = false;
            allCb.closest('.color-filter-chip')?.classList.remove('is-active');
          }
          if (e.target.checked) chip.classList.add('is-active');
          else chip.classList.remove('is-active');
        }
      }
      currentPage = 1;
      update();
    });
  });

  categoryInputs.forEach(cb => cb.addEventListener('change', () => { currentPage = 1; update(); }));
  ratingInputs.forEach(rb => rb.addEventListener('change', () => { currentPage = 1; update(); }));
  inStockOnly.addEventListener('change', () => { currentPage = 1; update(); });

  document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'filter-sale') {
      currentPage = 1;
      update();
    }
  });

  sortSelect.addEventListener('change', () => { currentPage = 1; update(); });

  priceRange.addEventListener('input', () => {
    priceRangeValue.textContent = formatVND(Number(priceRange.value));
    currentPage = 1;
    update();
  });

  searchInput?.addEventListener('input', () => {
    currentPage = 1;
    update();
  });

  resetFilterBtn.addEventListener('click', resetFilters);
  document.querySelector('[data-empty-reset]').addEventListener('click', resetFilters);

  function resetFilters() {
    categoryInputs.forEach(cb => cb.checked = true);
    document.querySelectorAll('input[name="color"]').forEach(c => {
      c.checked = c.value === 'all';
      c.closest('.color-filter-chip')?.classList.toggle('is-active', c.value === 'all');
    });
    document.querySelector('input[name="rating"][value="0"]').checked = true;
    inStockOnly.checked = false;
    const saleCheckbox = getSaleCheckbox();
    if (saleCheckbox) saleCheckbox.checked = false;
    priceRange.value = priceRange.max;
    priceRangeValue.textContent = formatVND(Number(priceRange.max));
    sortSelect.value = 'popular';
    if (searchInput) searchInput.value = '';
    currentPage = 1;
    update();
  }

  // Mobile sidebar drawer
  const sidebar = document.getElementById('shopSidebar');
  const filterToggleBtn = document.getElementById('filterToggleBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    sidebar.classList.add('is-open');
    filterToggleBtn.setAttribute('aria-expanded', 'true');
  }
  function closeSidebar() {
    sidebar.classList.remove('is-open');
    filterToggleBtn.setAttribute('aria-expanded', 'false');
  }

  filterToggleBtn.addEventListener('click', openSidebar);
  sidebarCloseBtn.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  grid.addEventListener('click', handleProductGridClick);

  priceRangeValue.textContent = formatVND(Number(priceRange.value));
  update();
})();

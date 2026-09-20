/* =========================================================
   assets/js/controllers/shop-controller.js
   Logic riêng cho trang Cửa hàng (shop.html) — phần việc của Hưng.
   (filter, sort, pagination, empty state, wishlist, add-to-cart,
   quickview TODO)

   Phụ thuộc:
   - PRODUCTS (biến toàn cục) từ assets/js/data/products-data.js
     — file này PHẢI được nhúng bằng <script> TRƯỚC file này.
   - Các ID/class HTML tương ứng phải tồn tại trong shop.html
     (#productGrid, #shopEmpty, #resultCount, #pagination,
     #sortSelect, #priceRange, #priceRangeValue, #inStockOnly,
     input[name="category"], input[name="rating"], #resetFilterBtn,
     #shopSidebar, #filterToggleBtn, #sidebarCloseBtn,
     #sidebarOverlay).
   - Tuỳ chọn, dùng nếu đã được nhóm nạp trước file này:
     window.storageService.{getWishlist,saveWishlist,getCart,saveCart}
     (assets/js/services/storage-service.js), window.cartManager.add
     (assets/js/modules/cart-manager.js), window.showToast
     (assets/js/modules/toast.js). Nếu chưa có, controller tự dùng
     phương án dự phòng bên dưới để trang không bao giờ bị vỡ/crash.

   ---------------------------------------------------------
   FIX (theo góp ý rà soát của Vũ sau khi ghép vào dự án chung):
   1) #siteHeader không còn tồn tại cố định trong shop.html (đã
      chuyển sang <div id="navbar-root"> do layout-loader.js nạp
      Navbar chuẩn vào runtime) → không cache header 1 lần lúc
      script chạy nữa, mà tra cứu lại mỗi lần scroll bằng optional
      chaining, tránh Uncaught TypeError khi phần tử null.
   2) Wishlist/Cart ưu tiên gọi API dùng chung của dự án
      (storage-service.js, cart-manager.js) thay vì tự ý gọi
      localStorage trực tiếp — chỉ fallback về localStorage nội bộ
      khi các module dùng chung CHƯA được nạp (ví dụ khi mở
      shop.html độc lập để test riêng).
   3) Toast ưu tiên window.showToast() dùng chung, fallback về
      toast nội bộ nếu chưa có.
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
  // Ô tìm kiếm trên Header (Hưng bổ sung) — dùng optional chaining khi đọc
  // .value để không crash nếu header thật (do layout-loader.js nạp) chưa
  // có phần tử #shopSearchInput này.
  const searchInput = document.getElementById('shopSearchInput');

  const formatVND = (n) => n.toLocaleString('vi-VN') + '₫';

  function renderStars(rating) {
    const full = Math.round(rating);
    return '★★★★★☆☆☆☆☆'.slice(5 - full, 10 - full);
  }

  function getFilteredProducts() {
    // PRODUCTS được nhúng từ assets/js/data/products-data.js.
    // Nếu file dữ liệu chưa sẵn sàng, tránh crash toàn trang.
    const source = typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];

    const activeCategories = Array.from(categoryInputs)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    const maxPrice = Number(priceRange.value);
    const minRating = Number(document.querySelector('input[name="rating"]:checked').value);
    const stockOnly = inStockOnly.checked;
    // Từ khóa tìm kiếm (Hưng bổ sung) — rỗng/không có ô tìm kiếm thì bỏ qua điều kiện này
    const searchTerm = (searchInput ? searchInput.value : '').trim().toLowerCase();

    let list = source.filter(p =>
      activeCategories.includes(p.category) &&
      p.price <= maxPrice &&
      p.rating >= minRating &&
      (!stockOnly || p.stock > 0) &&
      (!searchTerm || p.name.toLowerCase().includes(searchTerm))
    );

    switch (sortSelect.value) {
      case 'price-asc':
        list = list.slice().sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = list.slice().sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // Ghi chú cho Đức Huy: PRODUCTS hiện chưa có field ngày
        // (vd. dateAdded). Tạm sort theo id giảm dần cho đến khi
        // có field ngày thật để sort chính xác.
        list = list.slice().sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        // Phổ biến nhất — dựa trên reviewCount
        list = list.slice().sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return list;
  }

  /* =========================================================
     WISHLIST — ưu tiên storage-service.js dùng chung của dự án.
     API kỳ vọng (theo quy ước CONVENTION.md của nhóm):
       window.storageService.getWishlist() -> string[]
       window.storageService.saveWishlist(list: string[]) -> void
     Nếu storage-service.js CHƯA được nạp (vd. mở file độc lập để
     test), fallback về localStorage nội bộ với cùng key
     'nexus_wishlist' để hành vi không đổi.
     ========================================================= */

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
    } else {
      list.push(id);
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
    }
    saveWishlist(list);
  }

  // Fallback toast thuần JS khi module toast.js dùng chung chưa có
  // trên window — không dùng alert(), tự biến mất sau 2s.
  function showFallbackToast(message) {
    const toast = document.createElement('div');
    toast.className = 'nexus-fallback-toast';
    toast.textContent = message;
    toast.style.cssText = [
      'position:fixed', 'left:50%', 'bottom:32px',
      'transform:translateX(-50%)',
      'background:var(--text-primary, #231F1C)',
      'color:#fff', 'padding:12px 22px', 'border-radius:999px',
      'font-size:0.88rem', 'z-index:9999',
      'box-shadow:0 8px 24px rgba(0,0,0,0.18)',
      'opacity:0', 'transition:opacity 0.25s ease',
      'pointer-events:none'
    ].join(';');
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 2000);
  }

  function notify(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message, 'success');
    } else {
      showFallbackToast(message);
    }
  }

  /* =========================================================
     GIỎ HÀNG — ưu tiên cart-manager.js dùng chung của dự án.
     Thứ tự ưu tiên:
       1) window.cartManager.add(id) — module chuẩn của Tường.
       2) window.storageService.getCart()/saveCart() — nếu
          cart-manager.js chưa nạp nhưng storage-service.js đã có.
       3) Fallback nội bộ: chỉ tăng số hiển thị trên badge, KHÔNG
          ghi localStorage (tránh ghi sai định dạng cart thật của
          dự án) — chỉ dùng khi test shop.html độc lập.

     Lưu ý ID badge: bản cũ dùng #cartBadge (camelCase) do Hưng tự
     đặt trên header hardcode. Navbar chuẩn do layout-loader.js nạp
     có thể dùng id khác (#cart-badge, kebab-case, theo ghi chú của
     Vũ) — cần XÁC NHẬN LẠI với Đức Huy/Tường. Hàm dưới đây dò cả
     2 id để không phụ thuộc vào việc chốt tên chưa xong. ========================================================= */

  function getCartBadgeEl() {
    return document.getElementById('cartBadge') || document.getElementById('cart-badge');
  }

  function addToCart(id) {
    if (window.cartManager && typeof window.cartManager.add === 'function') {
      window.cartManager.add(id);
    } else if (hasStorageService() && typeof window.storageService.getCart === 'function'
      && typeof window.storageService.saveCart === 'function') {
      const cart = window.storageService.getCart() || [];
      cart.push({ id, qty: 1 });
      window.storageService.saveCart(cart);
      const badge = getCartBadgeEl();
      if (badge) {
        const current = parseInt(badge.textContent, 10) || 0;
        badge.textContent = String(current + 1);
      }
    } else {
      // Fallback tạm thời khi chưa có module dùng chung nào —
      // chỉ log + cập nhật badge hiển thị, không đụng localStorage
      // giỏ hàng thật để tránh xung đột định dạng với cart-manager.js.
      console.warn('[shop-controller] cartManager/storageService chưa sẵn sàng — chỉ cập nhật badge tạm thời.');
      const badge = getCartBadgeEl();
      if (badge) {
        const current = parseInt(badge.textContent, 10) || 0;
        badge.textContent = String(current + 1);
      }
    }

    notify('Đã thêm vào giỏ hàng');
  }

  function handleProductGridClick(e) {
    const addBtn = e.target.closest('.product-card__add-btn');
    if (addBtn) {
      if (addBtn.disabled) return;
      addToCart(addBtn.dataset.id);
      return;
    }

    const wishlistBtn = e.target.closest('.product-card__wishlist-btn');
    if (wishlistBtn) {
      toggleWishlist(wishlistBtn.dataset.id, wishlistBtn);
      return;
    }

    const quickviewBtn = e.target.closest('.product-card__quickview-btn');
    if (quickviewBtn) {
      // Quick View Modal component dùng chung chưa tồn tại —
      // log rõ ràng thay vì im lặng không phản hồi.
      console.log('TODO: kết nối Quick View Modal component (shared)');
      return;
    }
  }

  function renderProductCard(p) {
    const card = document.createElement('article');
    card.className = 'product-card';
    const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : null;

    card.innerHTML = `
      <div class="product-card__media">
        <a href="product.html?id=${encodeURIComponent(p.id)}">
          <img class="product-card__image" src="${p.images[0]}" alt="${p.name}"
               onerror="this.onerror=null; this.src='assets/images/placeholder.svg';">
        </a>
        ${discount ? `<span class="product-card__badge">-${discount}%</span>` : ''}
        <button type="button" class="product-card__wishlist-btn${isInWishlist(p.id) ? ' is-active' : ''}" aria-label="Thêm vào yêu thích" aria-pressed="${isInWishlist(p.id)}" data-id="${p.id}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        </button>
        <button type="button" class="product-card__quickview-btn" data-id="${p.id}" title="Sắp ra mắt" style="cursor:not-allowed;">Xem nhanh</button>
      </div>
      <div class="product-card__body">
        <span class="product-card__category">${p.categoryLabel}</span>
        <h3 class="product-card__title">
          <a href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a>
        </h3>
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

  // ---- Sự kiện bộ lọc ----
  categoryInputs.forEach(cb => cb.addEventListener('change', () => { currentPage = 1; update(); }));
  ratingInputs.forEach(rb => rb.addEventListener('change', () => { currentPage = 1; update(); }));
  inStockOnly.addEventListener('change', () => { currentPage = 1; update(); });
  sortSelect.addEventListener('change', () => { currentPage = 1; update(); });

  priceRange.addEventListener('input', () => {
    priceRangeValue.textContent = formatVND(Number(priceRange.value));
    currentPage = 1;
    update();
  });

  // Tìm kiếm realtime theo tên sản phẩm (Hưng bổ sung) — optional chaining
  // vì #shopSearchInput chỉ tồn tại trong header fallback tĩnh, có thể
  // không có nếu Navbar thật (do layout-loader.js nạp) chưa có ô này.
  searchInput?.addEventListener('input', () => {
    currentPage = 1;
    update();
  });

  resetFilterBtn.addEventListener('click', resetFilters);
  document.querySelector('[data-empty-reset]').addEventListener('click', resetFilters);

  function resetFilters() {
    categoryInputs.forEach(cb => cb.checked = true);
    document.querySelector('input[name="rating"][value="0"]').checked = true;
    inStockOnly.checked = false;
    priceRange.value = priceRange.max;
    priceRangeValue.textContent = formatVND(Number(priceRange.max));
    sortSelect.value = 'popular';
    if (searchInput) searchInput.value = '';
    currentPage = 1;
    update();
  }

  // ---- Sidebar dạng drawer trên mobile/tablet ----
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

  /* ---- FIX: Header scroll effect ----
     #siteHeader không còn cố định trong DOM lúc script này chạy
     (Navbar giờ do layout-loader.js nạp bất đồng bộ vào
     #navbar-root). Trước đây code cache `header` 1 lần rồi gọi
     header.classList mỗi lần scroll → header === null →
     Uncaught TypeError, crash liên tục khi cuộn trang.
     Fix: tra cứu lại phần tử NGAY TRONG listener bằng optional
     chaining — không throw dù phần tử chưa tồn tại hoặc tồn tại
     dưới id khác (#siteHeader hay id do layout-loader.js đặt). */
  window.addEventListener('scroll', () => {
    document.getElementById('siteHeader')?.classList.toggle('scrolled', window.scrollY > 50);
  });

  // ---- FIX-01: 1 listener duy nhất trên #productGrid (event delegation) ----
  grid.addEventListener('click', handleProductGridClick);

  // Khởi tạo giá trị hiển thị mức giá + render lần đầu
  priceRangeValue.textContent = formatVND(Number(priceRange.value));
  update();
})();

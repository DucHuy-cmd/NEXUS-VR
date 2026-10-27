/* =========================================================
   NEXUS VR — modules/layout-loader.js
   TẦNG 2 - REUSABLE MODULES
   Render Navbar + Footer dùng chung toàn site.
   Concept: Quiet Luxury / Warm Minimalist Tech
   ========================================================= */

const NAVBAR_HTML = `
<header class="navbar" id="navbar">
  <div class="wrap navbar__inner">
    
    <!-- BRAND LOGO -->
    <a class="navbar__logo" href="index.html" aria-label="NEXUS VR Trang chủ">
      <span class="navbar__logo-dot" aria-hidden="true"></span>
      <span class="navbar__logo-text">NEXUS</span>
      <span class="navbar__logo-sub">VR</span>
    </a>

    <!-- DESKTOP NAVIGATION -->
    <nav class="navbar__nav" aria-label="Điều hướng chính">
      <ul class="navbar__links" id="navbar-links">
        <li><a href="index.html" data-nav="home">Trang chủ</a></li>
        <li><a href="about.html" data-nav="about">Giới thiệu</a></li>
        <li><a href="shop.html" data-nav="shop">Cửa hàng</a></li>
        <li><a href="contact.html" data-nav="contact">Liên hệ</a></li>
      </ul>
    </nav>

    <!-- ACTIONS & TOOLS -->
    <div class="navbar__actions">
      
      <!-- LIVE SEARCH -->
      <div class="navbar__search" role="search">
        <svg class="navbar__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" id="live-search-input" placeholder="Tìm kiếm..." autocomplete="off" aria-label="Tìm kiếm sản phẩm">
        <div class="search-dropdown" id="search-dropdown" role="listbox" aria-label="Kết quả tìm kiếm"></div>
      </div>

      <!-- WISHLIST BUTTON -->
      <button type="button" class="navbar__icon-btn navbar__wishlist-btn" id="navbar-wishlist-btn" title="Danh sách yêu thích" aria-label="Xem danh sách yêu thích">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span class="navbar__wishlist-badge" id="wishlist-badge" hidden style="display: none;">0</span>
      </button>

      <!-- CART BUTTON -->
      <a class="navbar__icon-btn navbar__cart-btn" href="cart.html" title="Giỏ hàng" aria-label="Xem giỏ hàng">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <span class="navbar__cart-badge" id="cart-badge" hidden style="display: none;">0</span>
      </a>

      <!-- USER PROFILE SLOT -->
      <div id="user-slot" class="navbar__user-slot"></div>

      <!-- MOBILE HAMBURGER BUTTON -->
      <button type="button" class="navbar__hamburger" id="navbar-hamburger"
        aria-label="Mở menu điều hướng" aria-expanded="false" aria-controls="navbar-links">
        <span class="bar bar-1"></span>
        <span class="bar bar-2"></span>
      </button>

    </div>

  </div>
</header>`;

const FOOTER_HTML = `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer__top">
      <div class="footer__brand">
        <a class="footer__logo" href="index.html">
          <span class="footer__logo-dot" aria-hidden="true"></span>
          <span>NEXUS VR</span>
        </a>
        <p class="footer__tagline">
          Không gian điện toán đỉnh cao. Định hình tương lai tương tác thị giác với chuẩn hiển thị 8K và công thái học tĩnh lặng.
        </p>
      </div>

      <div class="footer__nav-group">
        <h4 class="footer__heading">Sản phẩm</h4>
        <ul class="footer__links">
          <li><a href="shop.html?category=kinh-vr">Kính thực tế ảo</a></li>
          <li><a href="shop.html?category=tay-cam">Tay cầm định vị</a></li>
          <li><a href="shop.html?category=phu-kien">Phụ kiện & Đế sạc</a></li>
          <li><a href="product.html?id=vr-001">NEXUS Vision Pro</a></li>
        </ul>
      </div>

      <div class="footer__nav-group">
        <h4 class="footer__heading">Thương hiệu</h4>
        <ul class="footer__links">
          <li><a href="about.html">Triết lý thiết kế</a></li>
          <li><a href="about.html#craftsmanship">Kỹ nghệ chế tác</a></li>
          <li><a href="contact.html">Không gian trải nghiệm</a></li>
          <li><a href="contact.html#concierge">Dịch vụ Concierge</a></li>
        </ul>
      </div>

      <div class="footer__nav-group">
        <h4 class="footer__heading">Hỗ trợ</h4>
        <ul class="footer__links">
          <li><a href="contact.html">Câu hỏi thường gặp</a></li>
          <li><a href="contact.html">Đặt lịch trực tiếp</a></li>
          <li><a href="cart.html">Tra cứu giỏ hàng</a></li>
          <li><a href="shop.html">Chính sách bảo hành</a></li>
        </ul>
      </div>
    </div>

    <div class="footer__bottom">
      <p class="footer__copyright">
        © 2026 NEXUS VR. Dự án đồ án Thiết kế Web cao cấp. Thiết kế theo phong cách Quiet Luxury.
      </p>
      <div class="footer__bottom-links">
        <span>Bảo mật dữ liệu</span>
        <span>Điều khoản dịch vụ</span>
        <span>Tiêu chuẩn WCAG AA</span>
      </div>
    </div>
  </div>
</footer>`;

function renderLayout() {
  const navRoot = document.getElementById("navbar-root");
  const footerRoot = document.getElementById("footer-root");
  if (navRoot) navRoot.innerHTML = NAVBAR_HTML;
  if (footerRoot) footerRoot.innerHTML = FOOTER_HTML;

  const page = document.body ? document.body.dataset.page : "";
  if (page) {
    const link = document.querySelector(`.navbar__links a[data-nav="${page}"]`);
    if (link) link.classList.add("is-active");
  }

  document.dispatchEvent(new CustomEvent("nexus:navbar-loaded"));
  document.dispatchEvent(new CustomEvent("nexus:layout-loaded"));

  updateCartBadge();
  updateWishlistBadge();
  updateUserState();
}

function initScrollGlass() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;
  
  let isTicking = false;
  window.addEventListener("scroll", () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        navbar.classList.toggle("scrolled", window.scrollY > 25);
        isTicking = false;
      });
      isTicking = true;
    }
  }, { passive: true });
}

function initMobileMenu() {
  const burger = document.getElementById("navbar-hamburger");
  const panel = document.getElementById("navbar-links");
  if (!burger || !panel) return;

  function closeMenu() {
    panel.classList.remove("is-open");
    burger.classList.remove("is-active");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-locked");
  }

  burger.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("is-open");
    burger.classList.toggle("is-active", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-locked", isOpen);
  });

  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) closeMenu();
  });
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  
  let count = 0;
  if (window.cartManager && typeof window.cartManager.getTotalQuantity === "function") {
    count = window.cartManager.getTotalQuantity();
  } else if (typeof getCartCount === "function") {
    count = getCartCount();
  }
  
  const strCount = String(count);
  if (badge.textContent !== strCount) {
    badge.textContent = strCount;
  }
  
  if (count > 0) {
    badge.hidden = false;
    badge.style.display = "inline-flex";
    badge.classList.add("has-items");
  } else {
    badge.hidden = true;
    badge.style.display = "none";
    badge.classList.remove("has-items");
  }
}

function updateUserState() {
  const slot = document.getElementById("user-slot");
  if (!slot) return;
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  
  if (user && user.name) {
    slot.innerHTML = `
      <div class="navbar__user-pill-wrap">
        <a href="login.html" class="navbar__user-pill" aria-label="Tài khoản cá nhân">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span class="navbar__user-name"></span>
        </a>
        <div class="navbar__user-dropdown">
          <a href="login.html">Hồ sơ cá nhân</a>
          <a href="#" id="navbar-logout-btn">Đăng xuất</a>
        </div>
      </div>
    `;
    const nameEl = slot.querySelector(".navbar__user-name");
    if (nameEl) {
      nameEl.textContent = String(user.name).split(' ')[0];
    }
    const logoutBtn = document.getElementById('navbar-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof clearCurrentUser === "function") clearCurrentUser();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('nexus_user');
        updateUserState();
      });
    }
  } else {
    slot.innerHTML = `
      <div class="navbar__user-pill-wrap">
        <a href="login.html" class="navbar__icon-btn" title="Đăng nhập / Tài khoản" aria-label="Tài khoản">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </a>
      </div>
    `;
  }
}

function initLiveSearch() {
  const input = document.getElementById("live-search-input");
  const dropdown = document.getElementById("search-dropdown");
  if (!input || !dropdown || typeof PRODUCTS === "undefined") return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { dropdown.classList.remove("is-open"); return; }

    const results = PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || (p.shortDesc && p.shortDesc.toLowerCase().includes(q))).slice(0, 4);
    dropdown.innerHTML = results.length === 0
      ? `<div class="search-dropdown__empty">Không tìm thấy sản phẩm phù hợp</div>`
      : results.map(p => `
          <a href="product.html?id=${p.id}" class="search-dropdown__item">
            <img src="${p.images[0]}" alt="${p.name}" class="search-dropdown__thumb" onerror="this.onerror=null; this.src='assets/images/placeholder.svg';">
            <div class="search-dropdown__info">
              <span class="search-dropdown__name">${p.name}</span>
              <span class="search-dropdown__price">${p.price.toLocaleString("vi-VN")}₫</span>
            </div>
          </a>
        `).join("");
    dropdown.classList.add("is-open");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".navbar__search")) dropdown.classList.remove("is-open");
  });
}

// =========================================================
// WISHLIST MANAGER & DRAWER (GIAO DIỆN DANH SÁCH YÊU THÍCH)
// Concept: Quiet Luxury Slide-over Drawer
// =========================================================

function getWishlistItems() {
  try {
    let list = [];
    if (window.storageService && typeof window.storageService.getWishlist === "function") {
      list = window.storageService.getWishlist() || [];
    } else {
      const raw = localStorage.getItem("nexus_wishlist");
      list = raw ? JSON.parse(raw) : [];
    }
    if (!Array.isArray(list)) return [];
    // Hỗ trợ cả item dạng id string lẫn object có thuộc tính id
    return [...new Set(list.map((item) => {
      if (item && typeof item === "object" && item.id) return String(item.id).trim();
      return item !== null && item !== undefined ? String(item).trim() : "";
    }).filter((id) => id !== ""))];
  } catch (e) {
    return [];
  }
}

function saveWishlistItems(list) {
  try {
    const cleanList = Array.isArray(list)
      ? [...new Set(list.filter((id) => id !== null && id !== undefined && String(id).trim() !== ""))]
      : [];
    localStorage.setItem("nexus_wishlist", JSON.stringify(cleanList));
    if (window.storageService && typeof window.storageService.saveWishlist === "function") {
      window.storageService.saveWishlist(cleanList);
    } else {
      window.dispatchEvent(new CustomEvent("nexus:wishlist-updated", { detail: { wishlist: cleanList } }));
    }
  } catch (e) {
    console.error("Lỗi khi lưu danh sách yêu thích:", e);
  }
}

function updateWishlistBadge() {
  const badges = document.querySelectorAll("#wishlist-badge, .navbar__wishlist-badge, [data-wishlist-count]");
  if (!badges.length) return;
  const items = getWishlistItems();
  const count = items.length;
  const strCount = String(count);

  badges.forEach((badge) => {
    if (badge.textContent !== strCount) {
      badge.textContent = strCount;
    }
    if (count > 0) {
      badge.hidden = false;
      badge.style.display = "inline-flex";
      badge.classList.add("has-items");
    } else {
      badge.hidden = true;
      badge.style.display = "none";
      badge.classList.remove("has-items");
    }
  });
}

function ensureWishlistDrawerElements() {
  if (document.getElementById("wishlist-drawer")) return;

  const overlay = document.createElement("div");
  overlay.className = "wishlist-drawer-overlay";
  overlay.id = "wishlist-drawer-overlay";
  overlay.setAttribute("aria-hidden", "true");

  const aside = document.createElement("aside");
  aside.className = "wishlist-drawer";
  aside.id = "wishlist-drawer";
  aside.setAttribute("role", "dialog");
  aside.setAttribute("aria-modal", "true");
  aside.setAttribute("aria-label", "Danh sách sản phẩm yêu thích");
  aside.setAttribute("aria-hidden", "true");
  aside.innerHTML = `
    <div class="wishlist-drawer__header">
      <div class="wishlist-drawer__title-wrap">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <h3 class="wishlist-drawer__title">Sản Phẩm Yêu Thích</h3>
        <span class="wishlist-drawer__count" id="wishlist-drawer-count">(0)</span>
      </div>
      <button type="button" class="wishlist-drawer__close" id="wishlist-drawer-close" aria-label="Đóng danh sách yêu thích" title="Đóng (Esc)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="wishlist-drawer__body" id="wishlist-drawer-body"></div>
    <div class="wishlist-drawer__footer" id="wishlist-drawer-footer"></div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(aside);
}

function renderWishlistDrawerContent() {
  ensureWishlistDrawerElements();
  const body = document.getElementById("wishlist-drawer-body");
  const footer = document.getElementById("wishlist-drawer-footer");
  const countEl = document.getElementById("wishlist-drawer-count");
  if (!body) return;

  const list = getWishlistItems();
  const count = Array.isArray(list) ? list.length : 0;
  if (countEl) countEl.textContent = `(${count})`;

  // TRƯỜNG HỢP DANH SÁCH TRỐNG: Hiển thị màn hình thân thiện
  if (count === 0) {
    body.innerHTML = `
      <div class="wishlist-drawer__empty">
        <div class="wishlist-drawer__empty-icon-wrap" aria-hidden="true">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
        <h4 class="wishlist-drawer__empty-title">Chưa có sản phẩm yêu thích nào</h4>
        <p class="wishlist-drawer__empty-sub">Hãy lưu lại các thiết bị không gian và phụ kiện công nghệ bạn quan tâm để dễ dàng theo dõi và mua sắm sau.</p>
        <a href="shop.html" class="btn btn-primary wishlist-drawer__empty-cta" id="wishlist-drawer-empty-btn">
          <span>Khám phá ngay</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    `;
    if (footer) {
      footer.hidden = true;
      footer.style.display = "none";
      footer.innerHTML = "";
    }
    return;
  }

  // TRƯỜNG HỢP CÓ SẢN PHẨM: Hiển thị danh sách sản phẩm
  const catalog = (typeof PRODUCTS !== "undefined" && Array.isArray(PRODUCTS))
    ? PRODUCTS
    : ((window.PRODUCTS && Array.isArray(window.PRODUCTS)) ? window.PRODUCTS : []);

  const itemsHtml = list.map((id) => {
    const p = catalog.find((item) => String(item.id) === String(id));
    if (!p) {
      return `
        <div class="wishlist-drawer__item" data-id="${id}">
          <div class="wishlist-drawer__item-thumb">
            <img src="assets/images/placeholder.svg" alt="Sản phẩm" width="74" height="74" loading="lazy">
          </div>
          <div class="wishlist-drawer__item-info">
            <span class="wishlist-drawer__item-category">Sản phẩm</span>
            <span class="wishlist-drawer__item-name">Sản phẩm #${id}</span>
            <div class="wishlist-drawer__item-actions">
              <button type="button" class="wishlist-drawer__btn-remove wishlist-drawer__item-remove" data-id="${id}" title="Xóa khỏi yêu thích" aria-label="Bỏ thích sản phẩm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>Bỏ thích</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    const img = (p.images && p.images[0]) || p.image || "assets/images/placeholder.svg";
    const priceFormatted = (Number(p.price) || 0).toLocaleString("vi-VN") + "₫";
    const oldPriceFormatted = p.oldPrice ? (Number(p.oldPrice) || 0).toLocaleString("vi-VN") + "₫" : null;
    const categoryLabel = p.categoryLabel || "Phụ kiện";

    return `
      <div class="wishlist-drawer__item" data-id="${p.id}" id="wishlist-item-${p.id}">
        <a href="product.html?id=${encodeURIComponent(p.id)}" class="wishlist-drawer__item-thumb" title="${p.name}">
          <img src="${img}" alt="${p.name}" width="74" height="74" loading="lazy" onerror="this.onerror=null; this.src='assets/images/placeholder.svg';">
        </a>
        <div class="wishlist-drawer__item-info">
          <span class="wishlist-drawer__item-category">${categoryLabel}</span>
          <a href="product.html?id=${encodeURIComponent(p.id)}" class="wishlist-drawer__item-name" title="${p.name}">${p.name}</a>
          <div class="wishlist-drawer__item-price-wrap">
            <span class="wishlist-drawer__item-price">${priceFormatted}</span>
            ${oldPriceFormatted ? `<span class="wishlist-drawer__item-old-price">${oldPriceFormatted}</span>` : ""}
          </div>
          <div class="wishlist-drawer__item-actions">
            <button type="button" class="wishlist-drawer__btn-add wishlist-drawer__item-add" data-id="${p.id}" title="Thêm vào giỏ hàng" aria-label="Thêm ${p.name} vào giỏ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Thêm vào giỏ</span>
            </button>
            <button type="button" class="wishlist-drawer__btn-remove wishlist-drawer__item-remove" data-id="${p.id}" title="Bỏ thích sản phẩm này" aria-label="Bỏ thích ${p.name}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              <span>Bỏ thích</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  body.innerHTML = `<div class="wishlist-drawer__list">${itemsHtml}</div>`;

  // Render Drawer Footer
  if (footer) {
    footer.hidden = false;
    footer.style.display = "flex";
    footer.innerHTML = `
      <div class="wishlist-drawer__footer-info">
        <span>Đang lưu: <strong>${count}</strong> sản phẩm</span>
        <button type="button" class="wishlist-drawer__clear-btn" id="wishlist-drawer-clear-btn" title="Xóa toàn bộ sản phẩm khỏi danh sách yêu thích">Xóa tất cả</button>
      </div>
      <div class="wishlist-drawer__footer-actions">
        <button type="button" class="btn btn-primary wishlist-drawer__add-all-btn" id="wishlist-add-all-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span>Thêm tất cả vào giỏ</span>
        </button>
        <a href="shop.html" class="btn btn-secondary wishlist-drawer__shop-btn" id="wishlist-footer-shop-btn">Xem cửa hàng</a>
      </div>
    `;
  }
}

// Thêm sản phẩm từ wishlist vào giỏ hàng an toàn trên toàn bộ các trang
function addProductToCartFromWishlist(id, btnElement, skipToast = false) {
  const catalog = (typeof PRODUCTS !== "undefined" && Array.isArray(PRODUCTS))
    ? PRODUCTS
    : ((window.PRODUCTS && Array.isArray(window.PRODUCTS)) ? window.PRODUCTS : []);
  const product = catalog.find((item) => String(item.id) === String(id));
  const productName = product ? product.name : ("Sản phẩm #" + id);
  const hasCartManager = Boolean(window.cartManager && typeof window.cartManager.add === "function");

  if (hasCartManager) {
    window.cartManager.add(id, 1);
  } else {
    try {
      let cart = [];
      if (window.storageService && typeof window.storageService.getCart === "function") {
        cart = window.storageService.getCart() || [];
      } else {
        const suffix = (window.storageService && window.storageService.getUserKeySuffix)
          ? window.storageService.getUserKeySuffix()
          : "_guest";
        const raw = localStorage.getItem("nexus_cart" + suffix) || localStorage.getItem("nexus_cart");
        cart = raw ? JSON.parse(raw) : [];
      }

      const existing = cart.find((item) => String(item.id) === String(id));
      if (existing) {
        existing.qty = (existing.qty || existing.quantity || 1) + 1;
      } else if (product) {
        const img = (product.colors && product.colors[0] && product.colors[0].image)
          || (product.images && product.images[0])
          || product.image
          || "assets/images/placeholder.svg";
        cart.push({
          id: String(product.id),
          name: product.name,
          price: Number(product.price) || 0,
          image: img,
          selectedColor: (product.colors && product.colors[0] && product.colors[0].name) || "",
          selectedColorHex: (product.colors && product.colors[0] && product.colors[0].hex) || "",
          colorIndex: 0,
          qty: 1
        });
      }

      if (window.storageService && typeof window.storageService.saveCart === "function") {
        window.storageService.saveCart(cart);
      } else {
        const suffix = (window.storageService && window.storageService.getUserKeySuffix)
          ? window.storageService.getUserKeySuffix()
          : "_guest";
        localStorage.setItem("nexus_cart" + suffix, JSON.stringify(cart));
        localStorage.setItem("nexus_cart", JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent("nexus:cart-updated", { detail: { cart, totalQuantity: cart.reduce((t, i) => t + (i.qty || 1), 0) } }));
      }

      if (!skipToast && typeof window.showToast === "function") {
        window.showToast(`Đã thêm ${productName} vào giỏ hàng`, "success");
      }
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", err);
    }
  }

  updateCartBadge();

  if (btnElement) {
    btnElement.classList.add("is-added");
    const span = btnElement.querySelector("span");
    const origText = span ? span.textContent : "Thêm vào giỏ";
    if (span) span.textContent = "Đã thêm ✓";
    setTimeout(() => {
      btnElement.classList.remove("is-added");
      if (span) span.textContent = origText;
    }, 1200);
  }
}

// Bỏ sản phẩm khỏi danh sách yêu thích và kích hoạt hoạt ảnh mượt
function removeProductFromWishlist(id) {
  const catalog = (typeof PRODUCTS !== "undefined" && Array.isArray(PRODUCTS))
    ? PRODUCTS
    : ((window.PRODUCTS && Array.isArray(window.PRODUCTS)) ? window.PRODUCTS : []);
  const product = catalog.find((item) => String(item.id) === String(id));
  const productName = product ? product.name : ("Sản phẩm #" + id);

  const itemEl = document.querySelector(`.wishlist-drawer__item[data-id="${id}"]`);
  if (itemEl) {
    itemEl.classList.add("is-removing");
  }

  setTimeout(() => {
    const list = getWishlistItems().filter((item) => String(item) !== String(id));
    saveWishlistItems(list);
    updateWishlistBadge();
    renderWishlistDrawerContent();

    // Đồng bộ nút yêu thích trên trang hiện tại
    syncPageWishlistState(id, false);

    if (typeof window.showToast === "function") {
      window.showToast(`Đã bỏ ${productName} khỏi danh sách yêu thích`, "info");
    }
  }, itemEl ? 220 : 0);
}

// Đồng bộ trạng thái nút tim trên trang
function syncPageWishlistState(id, isActive) {
  document.querySelectorAll(`.product-card__wishlist-btn[data-id="${id}"]`).forEach((btn) => {
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });

  const pdBtn = document.getElementById("pd-wishlist-btn");
  if (pdBtn) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("id") === String(id)) {
      pdBtn.classList.toggle("is-active", isActive);
      pdBtn.setAttribute("aria-pressed", String(isActive));
      pdBtn.textContent = isActive ? "♥ Đã yêu thích" : "♡ Yêu thích";
    }
  }
}

function openWishlistDrawer() {
  ensureWishlistDrawerElements();
  renderWishlistDrawerContent();
  const drawer = document.getElementById("wishlist-drawer");
  const overlay = document.getElementById("wishlist-drawer-overlay");
  if (drawer && overlay) {
    drawer.classList.add("is-open");
    overlay.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-locked");
  }
}

function closeWishlistDrawer() {
  const drawer = document.getElementById("wishlist-drawer");
  const overlay = document.getElementById("wishlist-drawer-overlay");
  if (drawer && overlay) {
    drawer.classList.remove("is-open");
    overlay.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-locked");
  }
}

function initWishlistDrawer() {
  ensureWishlistDrawerElements();

  document.addEventListener("click", (e) => {
    // 1. Mở drawer từ nút yêu thích trên Navbar hoặc các liên kết có data-open-wishlist
    const openBtn = e.target.closest("#navbar-wishlist-btn, [data-open-wishlist], .js-open-wishlist");
    if (openBtn) {
      e.preventDefault();
      openWishlistDrawer();
      return;
    }

    // 2. Đóng drawer khi click nút Đóng (X) hoặc bấm ra overlay nền mờ
    if (e.target.closest("#wishlist-drawer-close") || e.target.id === "wishlist-drawer-overlay") {
      e.preventDefault();
      closeWishlistDrawer();
      return;
    }

    // 3. Xử lý nút "Khám phá ngay" hoặc "Xem cửa hàng" khi chuyển sang shop.html
    const exploreBtn = e.target.closest("#wishlist-drawer-empty-btn, .wishlist-drawer__empty-cta, #wishlist-footer-shop-btn, .wishlist-drawer__shop-btn");
    if (exploreBtn) {
      const isShopPage = window.location.pathname.endsWith("shop.html") || (document.body && document.body.dataset.page === "shop");
      if (isShopPage) {
        e.preventDefault();
        closeWishlistDrawer();
        const shopTarget = document.getElementById("shop-grid") || document.getElementById("main-content") || document.querySelector("main");
        if (shopTarget) {
          shopTarget.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }
      // Nếu ở trang khác, để link tự chuyển hướng sang shop.html
    }

    // 4. Xử lý nút "Bỏ thích (Xóa)"
    const removeBtn = e.target.closest(".wishlist-drawer__btn-remove, .wishlist-drawer__item-remove");
    if (removeBtn) {
      e.preventDefault();
      const id = removeBtn.dataset.id;
      if (id) removeProductFromWishlist(id);
      return;
    }

    // 5. Xử lý nút "Thêm vào giỏ"
    const addBtn = e.target.closest(".wishlist-drawer__btn-add, .wishlist-drawer__item-add");
    if (addBtn) {
      e.preventDefault();
      const id = addBtn.dataset.id;
      if (id) addProductToCartFromWishlist(id, addBtn);
      return;
    }

    // 6. Xử lý nút "Xóa tất cả" trong Footer
    if (e.target.closest("#wishlist-drawer-clear-btn")) {
      e.preventDefault();
      const list = getWishlistItems();
      if (!list.length) return;
      saveWishlistItems([]);
      updateWishlistBadge();
      renderWishlistDrawerContent();
      document.querySelectorAll(".product-card__wishlist-btn").forEach((btn) => {
        btn.classList.remove("is-active");
        btn.setAttribute("aria-pressed", "false");
      });
      const pdBtn = document.getElementById("pd-wishlist-btn");
      if (pdBtn) {
        pdBtn.classList.remove("is-active");
        pdBtn.setAttribute("aria-pressed", "false");
        pdBtn.textContent = "♡ Yêu thích";
      }
      if (typeof window.showToast === "function") {
        window.showToast("Đã xóa toàn bộ sản phẩm yêu thích", "info");
      }
      return;
    }

    // 7. Xử lý nút "Thêm tất cả vào giỏ" trong Footer
    if (e.target.closest("#wishlist-add-all-btn")) {
      e.preventDefault();
      const list = getWishlistItems();
      if (!list.length) return;
      list.forEach((id) => addProductToCartFromWishlist(id, null, true));
      if (typeof window.showToast === "function") {
        window.showToast(`Đã thêm toàn bộ ${list.length} sản phẩm yêu thích vào giỏ hàng!`, "success");
      }
      return;
    }

    // 8. Tương tác với nút tim trên các Product Card ngoài trang (ngoại trừ trang Shop nếu shop-controller đã quản lý)
    const cardHeartBtn = e.target.closest(".product-card__wishlist-btn");
    if (cardHeartBtn && document.body && document.body.dataset.page !== "shop") {
      e.preventDefault();
      const id = cardHeartBtn.dataset.id;
      if (!id) return;
      const list = getWishlistItems();
      const isSaved = list.includes(String(id));
      let nextList;
      if (isSaved) {
        nextList = list.filter((item) => String(item) !== String(id));
        syncPageWishlistState(id, false);
        if (typeof window.showToast === "function") {
          window.showToast("Đã bỏ khỏi danh sách yêu thích", "info");
        }
      } else {
        nextList = [...list, String(id)];
        syncPageWishlistState(id, true);
        if (typeof window.showToast === "function") {
          window.showToast("Đã thêm vào danh sách yêu thích", "success");
        }
      }
      saveWishlistItems(nextList);
      updateWishlistBadge();
      const drawer = document.getElementById("wishlist-drawer");
      if (drawer && drawer.classList.contains("is-open")) {
        renderWishlistDrawerContent();
      }
      return;
    }
  });

  // Hỗ trợ phím Escape để đóng Drawer
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const drawer = document.getElementById("wishlist-drawer");
      if (drawer && drawer.classList.contains("is-open")) {
        closeWishlistDrawer();
      }
    }
  });
}

// Global helpers
window.updateCartBadge = updateCartBadge;
window.updateWishlistBadge = updateWishlistBadge;
window.openWishlistDrawer = openWishlistDrawer;
window.closeWishlistDrawer = closeWishlistDrawer;
window.updateUserState = updateUserState;

window.addEventListener("storage", (e) => {
  if (e.key && (e.key.startsWith("nexus_cart") || e.key === "nexus_cart")) updateCartBadge();
  if (e.key === "nexus_user" || e.key === "currentUser") updateUserState();
  if (e.key === "nexus_wishlist") {
    updateWishlistBadge();
    const drawer = document.getElementById("wishlist-drawer");
    if (drawer && drawer.classList.contains("is-open")) {
      renderWishlistDrawerContent();
    }
  }
});

window.addEventListener("nexus:wishlist-updated", () => {
  updateWishlistBadge();
  const drawer = document.getElementById("wishlist-drawer");
  if (drawer && drawer.classList.contains("is-open")) {
    renderWishlistDrawerContent();
  }
});

window.addEventListener("pageshow", () => {
  updateCartBadge();
  updateWishlistBadge();
});

window.addEventListener("load", () => {
  updateCartBadge();
  updateWishlistBadge();
});

function initAllLayout() {
  renderLayout();
  initScrollGlass();
  initMobileMenu();
  updateCartBadge();
  updateWishlistBadge();
  initWishlistDrawer();
  updateUserState();
  initLiveSearch();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAllLayout);
} else {
  initAllLayout();
}
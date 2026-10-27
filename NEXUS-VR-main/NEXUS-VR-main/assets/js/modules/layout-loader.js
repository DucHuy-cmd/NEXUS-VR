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
        <span class="navbar__wishlist-badge" id="wishlist-badge">0</span>
      </button>

      <!-- CART BUTTON -->
      <a class="navbar__icon-btn navbar__cart-btn" href="cart.html" title="Giỏ hàng" aria-label="Xem giỏ hàng">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <span class="navbar__cart-badge" id="cart-badge">0</span>
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

// Wishlist Manager & Drawer
function getWishlistItems() {
  try {
    let list = [];
    if (window.storageService && typeof window.storageService.getWishlist === "function") {
      list = window.storageService.getWishlist() || [];
    } else {
      list = JSON.parse(localStorage.getItem("nexus_wishlist")) || [];
    }
    if (!Array.isArray(list)) return [];
    return [...new Set(list.filter((id) => id !== null && id !== undefined && String(id).trim() !== ""))];
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
  const badge = document.getElementById("wishlist-badge");
  if (!badge) return;
  const items = getWishlistItems();
  const count = items.length;
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color: var(--accent, #A67C52);">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <h3 class="wishlist-drawer__title">Sản Phẩm Yêu Thích</h3>
        <span class="wishlist-drawer__count" id="wishlist-drawer-count">(0)</span>
      </div>
      <button type="button" class="wishlist-drawer__close" id="wishlist-drawer-close" aria-label="Đóng danh sách yêu thích">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="wishlist-drawer__body" id="wishlist-drawer-body"></div>
    <div class="wishlist-drawer__footer">
      <a href="shop.html" class="btn btn-primary wishlist-drawer__shop-btn">Khám phá cửa hàng</a>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(aside);
}

function renderWishlistDrawerContent() {
  ensureWishlistDrawerElements();
  const body = document.getElementById("wishlist-drawer-body");
  const countEl = document.getElementById("wishlist-drawer-count");
  if (!body) return;

  const list = getWishlistItems();
  const count = Array.isArray(list) ? list.length : 0;
  if (countEl) countEl.textContent = `(${count})`;

  if (count === 0) {
    body.innerHTML = `
      <div class="wishlist-drawer__empty">
        <div class="wishlist-drawer__empty-icon">♡</div>
        <p class="wishlist-drawer__empty-text">Chưa có sản phẩm yêu thích</p>
        <p class="wishlist-drawer__empty-sub">Hãy lưu lại các thiết bị và phụ kiện công nghệ không gian bạn quan tâm.</p>
      </div>
    `;
    return;
  }

  const catalog = (typeof PRODUCTS !== "undefined" && Array.isArray(PRODUCTS))
    ? PRODUCTS
    : ((window.PRODUCTS && Array.isArray(window.PRODUCTS)) ? window.PRODUCTS : []);

  const itemsHtml = list.map((id) => {
    const p = catalog.find((item) => String(item.id) === String(id));
    if (!p) {
      return `
        <div class="wishlist-drawer__item" data-id="${id}">
          <div class="wishlist-drawer__item-thumb">
            <img src="assets/images/placeholder.svg" alt="Sản phẩm">
          </div>
          <div class="wishlist-drawer__item-info">
            <span class="wishlist-drawer__item-name">Sản phẩm #${id}</span>
          </div>
          <div class="wishlist-drawer__item-actions">
            <button type="button" class="wishlist-drawer__item-remove" data-id="${id}" title="Xóa khỏi yêu thích" aria-label="Xóa">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      `;
    }

    const img = (p.images && p.images[0]) || p.image || "assets/images/placeholder.svg";
    const priceFormatted = (p.price || 0).toLocaleString("vi-VN") + "₫";

    return `
      <div class="wishlist-drawer__item" data-id="${p.id}">
        <a href="product.html?id=${encodeURIComponent(p.id)}" class="wishlist-drawer__item-thumb">
          <img src="${img}" alt="${p.name}" onerror="this.onerror=null; this.src='assets/images/placeholder.svg';">
        </a>
        <div class="wishlist-drawer__item-info">
          <a href="product.html?id=${encodeURIComponent(p.id)}" class="wishlist-drawer__item-name">${p.name}</a>
          <span class="wishlist-drawer__item-price">${priceFormatted}</span>
        </div>
        <div class="wishlist-drawer__item-actions">
          <button type="button" class="wishlist-drawer__item-add" data-id="${p.id}" title="Thêm vào giỏ hàng" aria-label="Thêm vào giỏ hàng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          </button>
          <button type="button" class="wishlist-drawer__item-remove" data-id="${p.id}" title="Xóa khỏi yêu thích" aria-label="Xóa">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
    `;
  }).join("");

  body.innerHTML = `<div class="wishlist-drawer__list">${itemsHtml}</div>`;
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
    const btn = e.target.closest("#navbar-wishlist-btn");
    if (btn) {
      e.preventDefault();
      openWishlistDrawer();
      return;
    }

    if (e.target.closest("#wishlist-drawer-close") || e.target.id === "wishlist-drawer-overlay") {
      e.preventDefault();
      closeWishlistDrawer();
      return;
    }

    const removeBtn = e.target.closest(".wishlist-drawer__item-remove");
    if (removeBtn) {
      e.preventDefault();
      const id = removeBtn.dataset.id;
      const list = getWishlistItems().filter((item) => String(item) !== String(id));
      saveWishlistItems(list);
      updateWishlistBadge();
      renderWishlistDrawerContent();
      const pageBtn = document.querySelector(`.product-card__wishlist-btn[data-id="${id}"], #pd-wishlist-btn`);
      if (pageBtn) {
        pageBtn.classList.remove("is-active");
        pageBtn.setAttribute("aria-pressed", "false");
        if (pageBtn.id === "pd-wishlist-btn") {
          pageBtn.textContent = "♡ Yêu thích";
        }
      }
      if (typeof window.showToast === "function") {
        window.showToast("Đã xóa khỏi danh sách yêu thích", "info");
      }
      return;
    }

    const addBtn = e.target.closest(".wishlist-drawer__item-add");
    if (addBtn) {
      e.preventDefault();
      const id = addBtn.dataset.id;
      if (window.cartManager && typeof window.cartManager.add === "function") {
        window.cartManager.add(id, 1);
      } else {
        if (typeof window.showToast === "function") {
          window.showToast("Đã thêm sản phẩm vào giỏ hàng", "success");
        }
      }
      updateCartBadge();
      return;
    }

    if (e.target.closest(".product-card__wishlist-btn, #pd-wishlist-btn, [data-wishlist-btn]")) {
      setTimeout(() => {
        updateWishlistBadge();
        const drawer = document.getElementById("wishlist-drawer");
        if (drawer && drawer.classList.contains("is-open")) {
          renderWishlistDrawerContent();
        }
      }, 40);
    }
  });

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
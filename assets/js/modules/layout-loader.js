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

// Global helpers
window.updateCartBadge = updateCartBadge;
window.updateUserState = updateUserState;

window.addEventListener("storage", (e) => {
  if (e.key && (e.key.startsWith("nexus_cart") || e.key === "nexus_cart")) updateCartBadge();
  if (e.key === "nexus_user" || e.key === "currentUser") updateUserState();
});

document.addEventListener("DOMContentLoaded", () => {
  renderLayout();
  initScrollGlass();
  initMobileMenu();
  updateCartBadge();
  updateUserState();
  initLiveSearch();
});
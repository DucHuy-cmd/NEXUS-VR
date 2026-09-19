/* =========================================================
   NEXUS VR — modules/layout-loader.js   [PHỤ TRÁCH: Đức Huy]
   TẦNG 2 - REUSABLE MODULES
   *** FILE BỔ SUNG *** (không có trong sơ đồ gốc, nhưng bắt
   buộc phải có thì Navbar/Footer mới tự hiện ra được).

   Render Navbar + Footer vào <div id="navbar-root"></div> và
   <div id="footer-root"></div>. Mỗi trang đặt data-page="ten-trang"
   trên thẻ <body> để tự active đúng link, ví dụ:
     <body data-page="shop">
   Giá trị hợp lệ: home, shop, about, blog, contact

   [FIX #3] Thêm nút Hamburger (#navbar-hamburger) + logic mở/đóng
   menu mobile (initMobileMenu) — trước đây .navbar__links bị ẩn
   hoàn toàn dưới 900px mà không có cách nào mở lại.
   [FIX #4] Đổi nút đổi theme từ <div> sang <button type="button">
   kèm aria-label/aria-pressed để bấm được bằng bàn phím và
   trình đọc màn hình hiểu đúng vai trò.
   ========================================================= */

const NAVBAR_HTML = `
<nav class="navbar" id="navbar">
  <div class="wrap navbar__inner">
    <a class="navbar__logo" href="index.html"><span class="navbar__logo-dot"></span>NEXUS VR</a>

    <button type="button" class="navbar__hamburger" id="navbar-hamburger"
      aria-label="Mở menu điều hướng" aria-expanded="false" aria-controls="navbar-links">
      <span></span><span></span><span></span>
    </button>

    <ul class="navbar__links" id="navbar-links">
      <li><a href="index.html" data-nav="home">Trang chủ</a></li>
      <li><a href="shop.html" data-nav="shop">Cửa hàng</a></li>
      <li><a href="about.html" data-nav="about">Giới thiệu</a></li>
      <li><a href="blog.html" data-nav="blog">Tin tức</a></li>
      <li><a href="contact.html" data-nav="contact">Liên hệ</a></li>
    </ul>

    <div class="navbar__search">
      <input type="text" id="live-search-input" placeholder="Tìm sản phẩm..." autocomplete="off">
      <div class="search-dropdown" id="search-dropdown"></div>
    </div>

    <div class="navbar__actions">
      <button type="button" class="navbar__icon-btn navbar__theme-btn" id="theme-toggle"
        aria-label="Đổi giao diện sáng/tối" aria-pressed="false" title="Đổi giao diện sáng/tối">
        <span class="theme-icon-box" aria-hidden="true">
          <svg class="theme-icon theme-icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4.5"></circle>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
          </svg>
          <svg class="theme-icon theme-icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            <circle cx="17" cy="7" r="0.8" fill="currentColor" stroke="none" class="theme-star theme-star--1"></circle>
            <circle cx="19" cy="11" r="0.6" fill="currentColor" stroke="none" class="theme-star theme-star--2"></circle>
          </svg>
        </span>
      </button>
      <a class="navbar__icon-btn" href="cart.html" title="Giỏ hàng" aria-label="Giỏ hàng">
        🛒<span class="navbar__cart-badge" id="cart-badge">0</span>
      </a>
      <div id="user-slot"></div>
    </div>
  </div>
</nav>`;

const FOOTER_HTML = `
<footer>
  <div class="wrap">
    <div class="footer__grid">
      <div>
        <a class="navbar__logo" href="index.html"><span class="navbar__logo-dot"></span>NEXUS VR</a>
        <p style="font-size:13.5px; margin-top:16px; max-width:260px;">Next-Gen Virtual Reality Ecosystem — mang tương lai thực tế ảo đến gần hơn với mọi người.</p>
      </div>
      <div><h4>Sản phẩm</h4><ul>
        <li><a href="shop.html">Kính VR</a></li>
        <li><a href="shop.html">Tay cầm</a></li>
        <li><a href="shop.html">Phụ kiện</a></li>
      </ul></div>
      <div><h4>Công ty</h4><ul>
        <li><a href="about.html">Giới thiệu</a></li>
        <li><a href="blog.html">Tin tức</a></li>
        <li><a href="contact.html">Liên hệ</a></li>
      </ul></div>
      <div><h4>Hỗ trợ</h4><ul>
        <li><a href="contact.html">Chính sách</a></li>
        <li><a href="contact.html">Bảo hành</a></li>
        <li><a href="contact.html">FAQ</a></li>
      </ul></div>
    </div>
    <div class="footer__bottom">
      <span>© 2026 NEXUS VR. Đồ án môn Thiết Kế Web.</span>
      <span class="footer__credit">Dự án phát triển bởi Nguyễn Trường Vũ</span>
    </div>
  </div>
</footer>`;

function renderLayout() {
  const navRoot = document.getElementById("navbar-root");
  const footerRoot = document.getElementById("footer-root");
  if (navRoot) navRoot.innerHTML = NAVBAR_HTML;
  if (footerRoot) footerRoot.innerHTML = FOOTER_HTML;

  const page = document.body.dataset.page;
  if (page) {
    const link = document.querySelector(`.navbar__links a[data-nav="${page}"]`);
    if (link) link.classList.add("is-active");
  }
}

function initScrollGlass() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  });
}

/* [FIX #3] Mở/đóng panel .navbar__links trên mobile bằng nút hamburger. */
function initMobileMenu() {
  const burger = document.getElementById("navbar-hamburger");
  const panel = document.getElementById("navbar-links");
  if (!burger || !panel) return;

  function closeMenu() {
    panel.classList.remove("is-open");
    burger.classList.remove("is-active");
    burger.setAttribute("aria-expanded", "false");
  }

  burger.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("is-open");
    burger.classList.toggle("is-active", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  // Bấm chọn 1 mục điều hướng thì tự đóng menu lại
  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  // Nếu xoay ngang / kéo cửa sổ rộng ra desktop thì tự đóng, tránh
  // panel bị kẹt "is-open" khi quay lại layout mobile lần sau
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (badge) badge.textContent = getCartCount();
}

function updateUserState() {
  const slot = document.getElementById("user-slot");
  if (!slot) return;
  const user = getCurrentUser();
  if (user && user.name) {
    slot.innerHTML = `<a href="login.html" class="navbar__user-pill">👤 Xin chào, ${user.name}</a>`;
  } else {
    slot.innerHTML = `<a href="login.html" class="navbar__icon-btn" title="Đăng nhập">👤</a>`;
  }
}

function initLiveSearch() {
  const input = document.getElementById("live-search-input");
  const dropdown = document.getElementById("search-dropdown");
  if (!input || !dropdown || typeof PRODUCTS === "undefined") return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { dropdown.classList.remove("is-open"); return; }

    const results = PRODUCTS.filter(p => p.name.toLowerCase().includes(q)).slice(0, 3);
    dropdown.innerHTML = results.length === 0
      ? `<div class="empty">Không tìm thấy sản phẩm phù hợp</div>`
      : results.map(p => `
          <a href="product.html?id=${p.id}">
            <div class="thumb"></div>
            <div>
              <div class="name">${p.name}</div>
              <div class="price">${p.price.toLocaleString("vi-VN")}₫</div>
            </div>
          </a>
        `).join("");
    dropdown.classList.add("is-open");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".navbar__search")) dropdown.classList.remove("is-open");
  });
}

// Đồng bộ giỏ hàng giữa nhiều tab
window.addEventListener("storage", (e) => {
  if (e.key === "nexus_cart") updateCartBadge();
});

document.addEventListener("DOMContentLoaded", () => {
  renderLayout();
  initScrollGlass();
  initMobileMenu();
  initThemeToggle();
  updateCartBadge();
  updateUserState();
  initLiveSearch();
});

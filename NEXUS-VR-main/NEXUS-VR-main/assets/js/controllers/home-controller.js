/* =========================================================
   NEXUS VR — controllers/home-controller.js
   TẦNG 3 - CONTROLLERS: HOME PAGE CONTROLLER
   Apple-Style Quiet Luxury Motion Engine & Interactive UI
   ========================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", initHomePage);

  if (document.readyState === "interactive" || document.readyState === "complete") {
    initHomePage();
  }

  function initHomePage() {
    if (window.__homePageInitialized) return;
    window.__homePageInitialized = true;

    setupMotionClass();
    initScrollRevealEngine();
    initHeroTiltEffect();
    initColorwaySelector();
    initPinnedScrollStory();
    renderComparisonTable();
    renderAccessoriesGrid();
  }

  /* --------------------------------------------------------------------------
     1. ACTIVATING MOTION CLASS (html.fx-on)
     -------------------------------------------------------------------------- */
  function setupMotionClass() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion) {
      document.documentElement.classList.add("fx-on");
    }
  }

  /* --------------------------------------------------------------------------
     2. 2-WAY INTERSECTION OBSERVER SCROLL REVEAL ENGINE
     (Hiển thị khi cuộn xuống, ẩn dần khi cuộn lên ra khỏi tầm nhìn)
     -------------------------------------------------------------------------- */
  function initScrollRevealEngine() {
    const isFxOn = document.documentElement.classList.contains("fx-on");
    const revealElements = document.querySelectorAll('[data-fx="reveal"]');

    if (!revealElements.length) return;

    if (!isFxOn) {
      revealElements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    let lastScrollY = window.scrollY;

    const observer = new IntersectionObserver(
      (entries) => {
        const currentScrollY = window.scrollY;
        const isScrollingDown = currentScrollY >= lastScrollY;
        lastScrollY = currentScrollY;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            // Khi phần tử đi ra khỏi tầm nhìn:
            // Nếu cuộn ngược lên (hoặc ra khỏi viewport), ẩn lại để tạo hiệu ứng 2 chiều
            const bounds = entry.boundingClientRect;
            if (bounds.top > window.innerHeight || bounds.bottom < 0) {
              entry.target.classList.remove("is-visible");
            }
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  /* --------------------------------------------------------------------------
     3. INTERACTIVE HERO 3D TILT EFFECT
     -------------------------------------------------------------------------- */
  function initHeroTiltEffect() {
    const wrapper = document.querySelector(".home-hero__media-wrapper");
    const media = document.querySelector(".home-hero__media");

    if (!wrapper || !media) return;

    wrapper.addEventListener("mousemove", (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      media.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    wrapper.addEventListener("mouseleave", () => {
      media.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    });
  }

  /* --------------------------------------------------------------------------
     4. INTERACTIVE COLORWAY SELECTOR (Phần 5)
     -------------------------------------------------------------------------- */
  function initColorwaySelector() {
    const dots = document.querySelectorAll(".color-dot");
    const imgEl = document.getElementById("colorway-current-img");
    const labelEl = document.getElementById("colorway-active-label");

    if (!dots.length || !imgEl) return;

    function selectColor(dot) {
      dots.forEach((d) => {
        d.classList.remove("is-active");
        d.setAttribute("aria-checked", "false");
      });

      dot.classList.add("is-active");
      dot.setAttribute("aria-checked", "true");

      const name = dot.getAttribute("data-name");
      const imgSrc = dot.getAttribute("data-img");

      if (labelEl) labelEl.textContent = name;

      // Cross-fade image 350ms
      imgEl.style.opacity = "0";
      imgEl.style.transform = "scale(0.96)";

      setTimeout(() => {
        imgEl.src = imgSrc;
        imgEl.alt = `NEXUS Vision Pro ${name}`;
        imgEl.style.opacity = "1";
        imgEl.style.transform = "scale(1)";
      }, 180);
    }

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => selectColor(dot));

      dot.addEventListener("keydown", (e) => {
        let targetIndex = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          targetIndex = (index + 1) % dots.length;
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          targetIndex = (index - 1 + dots.length) % dots.length;
        } else if (e.key === "Home") {
          targetIndex = 0;
        } else if (e.key === "End") {
          targetIndex = dots.length - 1;
        }

        if (targetIndex !== null) {
          e.preventDefault();
          dots[targetIndex].focus();
          selectColor(dots[targetIndex]);
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     5. PINNED SCROLL STORY (Phần 4 - Headset Color Story Showcase)
     -------------------------------------------------------------------------- */
  function initPinnedScrollStory() {
    const section = document.getElementById("scroll-pin");
    const titleEl = document.getElementById("scroll-pin-title");
    const chapterEl = document.getElementById("scroll-pin-chapter");
    const descEl = document.getElementById("scroll-pin-desc");

    const imgXam = document.getElementById("pin-img-xam");
    const imgTrangNau = document.getElementById("pin-img-trangnau");
    const imgXanhCam = document.getElementById("pin-img-xanhcam");

    const dot0 = document.getElementById("dot-0");
    const dot1 = document.getElementById("dot-1");
    const dot2 = document.getElementById("dot-2");

    if (!section) return;

    const chapters = [
      {
        chapter: "01 — XÁM THAN",
        title: "Xám Than",
        desc: "Thân bọc vải dệt tối màu, tĩnh lặng và thanh lịch trong mọi không gian làm việc.",
        activeImg: imgXam,
        activeDot: dot0,
      },
      {
        chapter: "02 — TRẮNG NÂU",
        title: "Trắng Nâu",
        desc: "Sắc thái ấm áp hòa quyện với phong cách kiến trúc kem hiện đại.",
        activeImg: imgTrangNau,
        activeDot: dot1,
      },
      {
        chapter: "03 — XANH CAM",
        title: "Xanh Cam",
        desc: "Điểm nhấn năng động với dải quai thể thao cá tính và nổi bật.",
        activeImg: imgXanhCam,
        activeDot: dot2,
      },
    ];

    function setChapter(index) {
      const item = chapters[index];
      if (!item) return;

      if (chapterEl) chapterEl.textContent = item.chapter;
      if (titleEl) titleEl.textContent = item.title;
      if (descEl) descEl.textContent = item.desc;

      [imgXam, imgTrangNau, imgXanhCam].forEach((img) => img && img.classList.remove("is-active"));
      if (item.activeImg) item.activeImg.classList.add("is-active");

      [dot0, dot1, dot2].forEach((dot) => dot && dot.classList.remove("is-active"));
      if (item.activeDot) item.activeDot.classList.add("is-active");
    }

    // Dot click support
    [dot0, dot1, dot2].forEach((dot, idx) => {
      if (dot) {
        dot.addEventListener("click", () => setChapter(idx));
      }
    });

    // Scroll trigger update
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=180%",
        onUpdate: (self) => {
          const p = self.progress;
          if (p < 0.33) {
            setChapter(0);
          } else if (p < 0.66) {
            setChapter(1);
          } else {
            setChapter(2);
          }
        },
      });
    }
  }

  /* --------------------------------------------------------------------------
     6. DYNAMIC EDITORIAL COMPARISON TABLE (Phần 6)
     -------------------------------------------------------------------------- */
  function renderComparisonTable() {
    const container = document.getElementById("comparison-mount");
    if (!container || typeof PRODUCTS === "undefined") return;

    const vr001 = PRODUCTS.find((p) => p.id === "vr-001");
    const vr002 = PRODUCTS.find((p) => p.id === "vr-002");

    if (!vr001 || !vr002) return;

    const specsRows = [
      { label: "Màn hình", key: "Độ phân giải" },
      { label: "Tần số quét", key: "Tần số quét" },
      { label: "Trường nhìn (FOV)", key: "Trường nhìn (FOV)" },
      { label: "Trọng lượng", key: "Trọng lượng" },
      { label: "Pin sử dụng", key: "Thời lượng pin" },
      { label: "Giá bán bán lẻ", isPrice: true },
    ];

    function getSpecVal(product, specKey) {
      if (!product.specs) return "—";
      const found = product.specs.find((s) => s.label === specKey);
      return found ? found.value : "—";
    }

    const html = `
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Thông số kĩ thuật</th>
              <th>${vr001.name} (Flagship)</th>
              <th>${vr002.name}</th>
            </tr>
          </thead>
          <tbody>
            ${specsRows
              .map((row) => {
                const val1 = row.isPrice ? `${vr001.price.toLocaleString("vi-VN")}₫` : getSpecVal(vr001, row.key);
                const val2 = row.isPrice ? `${vr002.price.toLocaleString("vi-VN")}₫` : getSpecVal(vr002, row.key);
                return `
                  <tr>
                    <td>${row.label}</td>
                    <td><strong>${val1}</strong></td>
                    <td>${val2}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  }

  /* --------------------------------------------------------------------------
     7. DYNAMIC CURATED ACCESSORIES GRID (Phần 7)
     -------------------------------------------------------------------------- */
  function renderAccessoriesGrid() {
    const container = document.getElementById("accessories-mount");
    if (!container || typeof PRODUCTS === "undefined") return;

    // Lấy 4 phụ kiện đi kèm tiêu biểu
    const accessories = PRODUCTS.filter((p) => p.id !== "vr-001").slice(0, 4);

    container.innerHTML = accessories
      .map((p) => {
        const imageSrc = p.images && p.images[0] ? p.images[0] : "assets/images/placeholder.svg";
        return `
          <article class="product-card">
            <div class="product-card__media">
              <a href="product.html?id=${encodeURIComponent(p.id)}">
                <img 
                  class="product-card__image" 
                  src="${imageSrc}" 
                  alt="${p.name}"
                  loading="lazy"
                  width="400"
                  height="300"
                  onerror="this.onerror=null; this.src='assets/images/placeholder.svg';"
                >
              </a>
            </div>
            <div class="product-card__body">
              <span class="product-card__category">${p.categoryLabel}</span>
              <h3 class="product-card__title">
                <a href="product.html?id=${encodeURIComponent(p.id)}">${p.name}</a>
              </h3>
              <p class="product-card__short-desc" style="font-size:0.85rem; color:var(--text-secondary); margin:6px 0 12px; line-height:1.4;">${p.shortDesc || ''}</p>
              <div class="product-card__price">
                <span class="product-card__price-current">${p.price.toLocaleString("vi-VN")}₫</span>
              </div>
              <button 
                type="button" 
                class="product-card__add-btn" 
                onclick="if(typeof addToCart === 'function'){ addToCart('${p.id}'); } else if(typeof window.showToast==='function'){ window.showToast('Đã thêm ${p.name} vào giỏ hàng', 'success'); }"
              >
                Thêm vào giỏ
              </button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  // Toàn cục helper cho Add To Cart
  window.addToCart = function (productId) {
    if (typeof StorageService !== "undefined" && StorageService.getCart) {
      const cart = StorageService.getCart() || [];
      const existing = cart.find((item) => item.id === productId);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        const prod = PRODUCTS.find((p) => p.id === productId);
        if (prod) {
          cart.push({
            id: prod.id,
            name: prod.name,
            price: prod.price,
            image: prod.images[0],
            quantity: 1,
          });
        }
      }
      StorageService.saveCart(cart);
      if (typeof window.updateCartBadge === "function") window.updateCartBadge();
    }

    const item = PRODUCTS.find((p) => p.id === productId);
    const itemName = item ? item.name : "Sản phẩm";
    if (typeof window.showToast === "function") {
      window.showToast(`Đã thêm ${itemName} vào giỏ hàng!`, "success");
    }
  };
})();

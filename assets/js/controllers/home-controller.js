/* ==========================================================================
   NEXUS VR — controllers/home-controller.js
   TẦNG 3 - CONTROLLER: HOMEPAGE INTERACTION & STORYTELLING
   Concept: Quiet Luxury / Intentional Motion / Rock-solid Fallback
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", initHome);
  if (document.readyState === "interactive" || document.readyState === "complete") initHome();

  function initHome() {
    if (window.__nexusHomeInitialized) return;
    window.__nexusHomeInitialized = true;

    // Kích hoạt thẻ hiệu ứng an toàn
    document.documentElement.classList.add("fx-on");

    // Khởi tạo GSAP Plugins nếu có
    if (typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined") {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }

    initProgressBar();
    initScrollReveal();
    initStatementShimmer();
    // initHeroAmbientMouse() đã vô hiệu hóa theo chuẩn Premium Minimalist
    initPinnedProductStory();
    initColorwaySelector();
    renderComparisonTable();
    renderEcosystemGrid();
  }

  /* --------------------------------------------------------------------------
     1. THANH TIẾN ĐỘ ĐỌC TRANG (SCROLL PROGRESS BAR)
     -------------------------------------------------------------------------- */
  function initProgressBar() {
    const bar = document.getElementById("scroll-progress");
    if (!bar) return;

    window.addEventListener("scroll", () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const progress = (window.scrollY / docHeight) * 100;
      bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     2. HIỆU ỨNG HIỆN DẦN CÓ CHỦ ĐÍCH (SCROLL REVEAL / SLIDE-UP)
     -------------------------------------------------------------------------- */
  function initScrollReveal() {
    const items = document.querySelectorAll('[data-fx="slide-up"], [data-fx="reveal"]');
    if (!items.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(el => el.classList.add("is-revealed"));
      return;
    }

    if (window.ScrollTrigger) {
      items.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
          setTimeout(() => el.classList.add("is-revealed"), idx * 60);
        }
        window.ScrollTrigger.create({
          trigger: el,
          start: "top 92%",
          onEnter: () => el.classList.add("is-revealed")
        });
      });
    } else if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      items.forEach(el => observer.observe(el));
    } else {
      items.forEach(el => el.classList.add("is-revealed"));
    }
  }

  /* --------------------------------------------------------------------------
     3. STATEMENT SHIMMER (CHỮ SÁNG THEO NHỊP CUỘN)
     -------------------------------------------------------------------------- */
  function initStatementShimmer() {
    const words = document.querySelectorAll(".shimmer-word, .shimmer-sub-word");
    if (!words.length) return;

    if (!window.ScrollTrigger || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      words.forEach(w => w.classList.add("is-lit"));
      return;
    }

    window.ScrollTrigger.create({
      trigger: "#statement",
      start: "top 75%",
      end: "bottom 40%",
      scrub: 0.35,
      onUpdate: (self) => {
        const targetIdx = Math.floor(self.progress * (words.length + 1));
        words.forEach((w, i) => w.classList.toggle("is-lit", i < targetIdx));
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. HERO AMBIENT TILT (TINH TẾ & ĐIỀM TĨNH)
     -------------------------------------------------------------------------- */
  function initHeroAmbientMouse() {
    if (window.innerWidth < 1024 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hero = document.getElementById("hero");
    const halo = document.getElementById("hero-ambient-halo");
    const heroImg = document.getElementById("hero-main-img");
    if (!hero || !halo) return;

    let rafId = null;

    hero.addEventListener("mousemove", (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        halo.style.transform = `translate(${x * 32}px, ${y * 24}px)`;
        if (heroImg) heroImg.style.transform = `translate(${x * 8}px, ${y * 6}px) scale(1.008)`;
      });
    });

    hero.addEventListener("mouseleave", () => {
      halo.style.transform = "translate(0, 0)";
      if (heroImg) heroImg.style.transform = "translate(0, 0) scale(1)";
    });
  }

  /* --------------------------------------------------------------------------
     5. SECTION 04: PINNED PRODUCT STORY (01 IMMERSIVE, 02 PRECISE, 03 PERSONAL)
     -------------------------------------------------------------------------- */
  function initPinnedProductStory() {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!window.ScrollTrigger || window.innerWidth < 768 || isReduced) return;

    const stages = [
      {
        chapter: "01 — IMMERSIVE",
        title: "Thị giác thuần khiết",
        desc: "Màn hình 8K kép tái hiện chi tiết sống động đến từng milimet, xóa nhòa ranh giới giữa thế giới thực và không gian số.",
        id: "scroll-img-front",
        tone: "gray"
      },
      {
        chapter: "02 — PRECISE",
        title: "Định vị 6-DoF siêu nhạy",
        desc: "Hệ thống cảm biến quang học bắt trọn từng chuyển động vi mô của mắt và bàn tay với độ trễ chuyển động triệt tiêu.",
        id: "scroll-img-top",
        tone: "warm"
      },
      {
        chapter: "03 — PERSONAL",
        title: "Thiết kế may đo riêng bạn",
        desc: "Vải dệt thoáng khí 3D cùng cơ chế phân bổ trọng lượng công thái học 420g cho cảm giác đeo tĩnh lặng cả ngày dài.",
        id: "scroll-img-side",
        tone: "blue"
      }
    ];

    const chapterEl = document.getElementById("scroll-story-chapter");
    const nameEl = document.getElementById("scroll-color-name");
    const descEl = document.getElementById("scroll-story-desc");
    const halo = document.getElementById("scroll-ambient-halo");
    const imgs = stages.map(s => document.getElementById(s.id));
    const dots = document.querySelectorAll(".story-dot");

    let currentIdx = -1;

    window.ScrollTrigger.create({
      trigger: "#scroll-colors",
      start: "top top",
      end: "+=240%",
      pin: "#scroll-pin-track",
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress;
        const activeIdx = p < 0.36 ? 0 : (p < 0.72 ? 1 : 2);

        if (activeIdx !== currentIdx) {
          currentIdx = activeIdx;
          const stage = stages[activeIdx];

          if (chapterEl) chapterEl.textContent = stage.chapter;
          if (nameEl) nameEl.textContent = stage.title;
          if (descEl) descEl.textContent = stage.desc;
          if (halo) halo.setAttribute("data-tone", stage.tone);

          imgs.forEach((img, idx) => {
            if (img) img.classList.toggle("is-active", idx === activeIdx);
          });

          dots.forEach((dot, idx) => {
            dot.classList.toggle("is-active", idx === activeIdx);
          });
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     6. SECTION 05: COLORWAY SELECTOR (INTERACTIVE & ACCESSIBLE)
     -------------------------------------------------------------------------- */
  function initColorwaySelector() {
    const dots = Array.from(document.querySelectorAll(".color-dot"));
    const mainImg = document.getElementById("colorway-current-img");
    const label = document.getElementById("colorway-active-label");
    const halo = document.getElementById("colorway-ambient-halo");
    if (!dots.length || !mainImg) return;

    function selectColor(btn) {
      dots.forEach(d => {
        d.classList.remove("is-active");
        d.setAttribute("aria-checked", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-checked", "true");

      const name = btn.getAttribute("data-name");
      const src = btn.getAttribute("data-img");
      const tone = btn.getAttribute("data-color-tone") || "gray";

      if (label && name) label.textContent = name;
      if (halo) halo.setAttribute("data-tone", tone);

      mainImg.classList.add("is-fading");
      setTimeout(() => {
        if (src) mainImg.src = src;
        mainImg.classList.remove("is-fading");
      }, 160);
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => selectColor(dot));
      dot.addEventListener("keydown", (e) => {
        let next = idx;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % dots.length;
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + dots.length) % dots.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = dots.length - 1;

        if (next !== idx) {
          e.preventDefault();
          dots[next].focus();
          selectColor(dots[next]);
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     7. SECTION 06: SPECIFICATIONS (EDITORIAL COMPARISON TABLE)
     -------------------------------------------------------------------------- */
  function renderComparisonTable() {
    const mount = document.getElementById("comparison-mount");
    if (!mount || typeof PRODUCTS === "undefined") return;

    const p1 = PRODUCTS.find(p => p.id === "vr-001");
    const p2 = PRODUCTS.find(p => p.id === "vr-002");
    if (!p1 || !p2) return;

    const fmt = (v) => v ? v.toLocaleString("vi-VN") + "₫" : "—";
    const getSpec = (p, keyword) => {
      if (!p.specs) return "—";
      const match = p.specs.find(item => item.label.toLowerCase().includes(keyword.toLowerCase()));
      return match ? match.value : "—";
    };

    mount.innerHTML = `
      <table class="comparison-table comparison-table--editorial" aria-label="Bảng so sánh cấu hình NEXUS Vision Pro và NEXUS Air Lite">
        <thead>
          <tr>
            <th class="comparison-row-label">Cấu hình</th>
            <th class="is-featured">${p1.name} (Flagship)</th>
            <th>${p2.name} (Lite)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="comparison-row-label">Màn hình kép</td>
            <td class="comparison-row-val is-featured" data-label="Màn hình kép (${p1.name})">${getSpec(p1, "Độ phân giải")}</td>
            <td class="comparison-row-val" data-label="Màn hình kép (${p2.name})">${getSpec(p2, "Độ phân giải")}</td>
          </tr>
          <tr>
            <td class="comparison-row-label">Tần số làm tươi</td>
            <td class="comparison-row-val is-featured" data-label="Tần số làm tươi (${p1.name})">${getSpec(p1, "Tần số")}</td>
            <td class="comparison-row-val" data-label="Tần số làm tươi (${p2.name})">${getSpec(p2, "Tần số")}</td>
          </tr>
          <tr>
            <td class="comparison-row-label">Trường nhìn (FOV)</td>
            <td class="comparison-row-val is-featured" data-label="Trường nhìn FOV (${p1.name})">${getSpec(p1, "Trường nhìn")}</td>
            <td class="comparison-row-val" data-label="Trường nhìn FOV (${p2.name})">${getSpec(p2, "Trường nhìn")}</td>
          </tr>
          <tr>
            <td class="comparison-row-label">Trọng lượng thân kính</td>
            <td class="comparison-row-val is-featured" data-label="Trọng lượng thân kính (${p1.name})">${getSpec(p1, "Trọng lượng")}</td>
            <td class="comparison-row-val" data-label="Trọng lượng thân kính (${p2.name})">${getSpec(p2, "Trọng lượng")}</td>
          </tr>
          <tr>
            <td class="comparison-row-label">Thời lượng pin</td>
            <td class="comparison-row-val is-featured" data-label="Thời lượng pin (${p1.name})">${getSpec(p1, "pin")}</td>
            <td class="comparison-row-val" data-label="Thời lượng pin (${p2.name})">${getSpec(p2, "pin")}</td>
          </tr>
          <tr>
            <td class="comparison-row-label">Kết nối không dây</td>
            <td class="comparison-row-val is-featured" data-label="Kết nối không dây (${p1.name})">${getSpec(p1, "Kết nối")}</td>
            <td class="comparison-row-val" data-label="Kết nối không dây (${p2.name})">${getSpec(p2, "Kết nối")}</td>
          </tr>
          <tr>
            <td class="comparison-row-label">Giá niêm yết</td>
            <td class="comparison-row-val is-featured comparison-row-val--price" data-label="Giá niêm yết (${p1.name})">${fmt(p1.price)}</td>
            <td class="comparison-row-val comparison-row-val--price" data-label="Giá niêm yết (${p2.name})">${fmt(p2.price)}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  /* --------------------------------------------------------------------------
     8. SECTION 07: ECOSYSTEM (4 FEATURED ACCESSORIES CURATED EDITORIAL GRID)
     -------------------------------------------------------------------------- */
  function renderEcosystemGrid() {
    const mount = document.getElementById("accessories-mount");
    if (!mount) return;

    const source = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
    const accessoryIds = ["ctrl-001", "acc-001", "acc-002", "acc-003"];
    const items = accessoryIds
      .map(id => source.find(p => p.id === id))
      .filter(Boolean);

    const fmt = (v) => v ? v.toLocaleString("vi-VN") + "₫" : "";
    
    // Curated role map:
    // ctrl-001 -> anchor (large feature card)
    // acc-001  -> companion (medium top card)
    // acc-002  -> compact (bottom left)
    // acc-003  -> compact (bottom right)
    const roleClasses = {
      "ctrl-001": "product-card--anchor",
      "acc-001": "product-card--companion",
      "acc-002": "product-card--compact",
      "acc-003": "product-card--compact"
    };

    mount.innerHTML = items.map(p => {
      const extraClass = roleClasses[p.id] || "";
      const isAnchor = p.id === "ctrl-001";
      return `
      <article class="product-card ${extraClass}" data-id="${p.id}" data-fx="slide-up">
        <div class="product-card__thumb">
          <a href="product.html?id=${p.id}" aria-label="${p.name}">
            <img 
              src="${p.images[0]}" 
              alt="${p.name}" 
              class="product-card__image" 
              loading="lazy" 
              width="${isAnchor ? 640 : 400}" 
              height="${isAnchor ? 480 : 300}"
              onerror="this.onerror=null; this.src='assets/images/placeholder.svg';"
            >
          </a>
          ${isAnchor ? `<span class="product-card__curated-badge">Tâm Điểm Hệ Sinh Thái</span>` : ''}
        </div>
        <div class="product-card__body">
          <span class="product-card__category">${p.categoryLabel || "Phụ kiện"}</span>
          <h3 class="product-card__title">
            <a href="product.html?id=${p.id}">${p.name}</a>
          </h3>
          <p class="product-card__desc">${p.shortDesc || ""}</p>
          <div class="product-card__footer">
            <div class="product-card__price-group">
              <span class="product-card__price">${fmt(p.price)}</span>
            </div>
            <a href="product.html?id=${p.id}" class="product-card__btn">Chi tiết</a>
          </div>
        </div>
      </article>
      `;
    }).join("");
  }

})();

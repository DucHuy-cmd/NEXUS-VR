/* =========================================================
   NEXUS VR — modules/slider-engine.js   [PHỤ TRÁCH: Trường Vũ]
   TẦNG 2 - REUSABLE MODULES
   Bộ trượt Slide đa năng (Touch / Drag / Autoplay Slider Engine)

   TÍNH NĂNG KỸ THUẬT:
   - Kiến trúc Reusable Module độc lập, nhận tham số động, không hardcode DOM
   - Hỗ trợ vuốt cảm ứng đa điểm (Touch Events) trên Mobile & Kéo chuột (Mouse Drag) trên Desktop
   - Tự động chuyển slide (Autoplay) thông minh: tự dừng khi rê chuột (Hover) hoặc mất Focus
   - Đường cong chuyển động gia tốc Quiet Luxury: cubic-bezier(0.25, 1, 0.5, 1) siêu mượt 60fps
   - Chuẩn tiếp cận A11y: Điều hướng phím mũi tên (Arrow Left/Right), nhận diện prefers-reduced-motion
   - Cung cấp API linh hoạt: next(), prev(), goTo(index), pause(), play(), destroy()
   ========================================================= */

(function (global) {
  "use strict";

  /**
   * Cấu hình mặc định cho Slider
   */
  const DEFAULT_OPTIONS = {
    slideSelector: ".slider-slide",
    trackSelector: ".slider-track",
    prevBtnSelector: ".slider-prev",
    nextBtnSelector: ".slider-next",
    dotsSelector: ".slider-dots",
    autoplay: false,
    interval: 5000,
    loop: true,
    speed: 500, // ms
    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    threshold: 40, // Khoảng cách vuốt tối thiểu (px) để kích hoạt chuyển slide
    keyboard: true
  };

  /**
   * Khởi tạo Slider Engine trên một container cụ thể
   * @param {string|HTMLElement} container - Bộ chọn CSS hoặc phần tử DOM của Slider
   * @param {Object} userOptions - Tùy chọn cấu hình ghi đè
   * @returns {Object|null} - Instance chứa các hàm điều khiển slider
   */
  function initSlider(container, userOptions = {}) {
    const root = typeof container === "string" ? document.querySelector(container) : container;
    if (!root) {
      console.warn(`[SliderEngine] Không tìm thấy phần tử: ${container}`);
      return null;
    }

    const opts = Object.assign({}, DEFAULT_OPTIONS, userOptions);
    const track = root.querySelector(opts.trackSelector);
    const slides = Array.from(root.querySelectorAll(opts.slideSelector));

    if (!track || slides.length === 0) {
      console.warn("[SliderEngine] Thiếu .slider-track hoặc không có .slider-slide nào.");
      return null;
    }

    // Các biến trạng thái nội bộ
    let currentIndex = 0;
    const totalSlides = slides.length;
    let timer = null;
    let isTransitioning = false;

    // Trạng thái thao tác vuốt / kéo (Touch & Drag)
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let hasMoved = false;

    // Các phần tử điều khiển ngoại vi (nếu có trong HTML)
    const prevBtn = root.querySelector(opts.prevBtnSelector);
    const nextBtn = root.querySelector(opts.nextBtnSelector);
    const dotsContainer = root.querySelector(opts.dotsSelector);
    let dots = [];

    // Nhận diện chế độ giảm chuyển động của hệ điều hành
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const effectiveSpeed = prefersReducedMotion ? 0 : opts.speed;

    /* =========================================================
       1. THIẾT LẬP GIAO DIỆN & TRẠNG THÁI BAN ĐẦU
       ========================================================= */
    function setupLayout() {
      root.style.overflow = "hidden";
      root.setAttribute("role", "region");
      root.setAttribute("aria-label", root.dataset.sliderLabel || "Carousel trình diễn");

      track.style.display = "flex";
      track.style.width = "100%";
      track.style.transitionProperty = "transform";
      track.style.transitionTimingFunction = opts.easing;
      track.style.willChange = "transform";

      slides.forEach((slide, idx) => {
        slide.style.flex = "0 0 100%";
        slide.style.width = "100%";
        slide.setAttribute("role", "group");
        slide.setAttribute("aria-roledescription", "slide");
        slide.setAttribute("aria-label", `${idx + 1} trên ${totalSlides}`);
      });

      renderDots();
      updateClassesAndAria();
      applyTransform(0, false);
    }

    /* =========================================================
       2. TẠO & ĐỒNG BỘ NÚT CHẤM TRANG (DOTS PAGINATION)
       ========================================================= */
    function renderDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = "";
      dots = [];

      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "slider-dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", `Chuyển tới slide ${i + 1}`);
        dot.addEventListener("click", () => {
          goTo(i);
          resetAutoplay();
        });
        dotsContainer.appendChild(dot);
        dots.push(dot);
      }
    }

    /* =========================================================
       3. CẬP NHẬT TRẠNG THÁI ACTIVE & ARIA ATTRIBUTES
       ========================================================= */
    function updateClassesAndAria() {
      slides.forEach((slide, idx) => {
        const isActive = idx === currentIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });

      if (dots.length > 0) {
        dots.forEach((dot, idx) => {
          const isActive = idx === currentIndex;
          dot.classList.toggle("is-active", isActive);
          dot.setAttribute("aria-current", isActive ? "true" : "false");
        });
      }

      // Cập nhật trạng thái disabled của nút bấm nếu không bật loop
      if (!opts.loop) {
        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex === totalSlides - 1;
      }
    }

    /* =========================================================
       4. ÁP DỤNG BIẾN ĐỔI TRANSFORM TRÊN TRACK
       ========================================================= */
    function applyTransform(percentageOffset, animate = true) {
      track.style.transitionDuration = animate ? `${effectiveSpeed}ms` : "0ms";
      track.style.transform = `translate3d(${percentageOffset}%, 0, 0)`;
    }

    /* =========================================================
       5. ĐIỀU HƯỚNG SLIDE (GOTO / NEXT / PREV)
       ========================================================= */
    function goTo(targetIndex) {
      if (isTransitioning || targetIndex === currentIndex) return;

      let nextIndex = targetIndex;
      if (nextIndex < 0) {
        nextIndex = opts.loop ? totalSlides - 1 : 0;
      } else if (nextIndex >= totalSlides) {
        nextIndex = opts.loop ? 0 : totalSlides - 1;
      }

      if (nextIndex === currentIndex) return;

      isTransitioning = true;
      currentIndex = nextIndex;
      updateClassesAndAria();
      applyTransform(-currentIndex * 100, true);

      // Kích hoạt custom event cho controller lắng nghe (nếu cần)
      root.dispatchEvent(new CustomEvent("slider:change", {
        detail: { index: currentIndex, total: totalSlides, slide: slides[currentIndex] }
      }));

      setTimeout(() => {
        isTransitioning = false;
      }, effectiveSpeed);
    }

    function next() {
      if (!opts.loop && currentIndex >= totalSlides - 1) return;
      goTo(currentIndex + 1);
    }

    function prev() {
      if (!opts.loop && currentIndex <= 0) return;
      goTo(currentIndex - 1);
    }

    /* =========================================================
       6. CƠ CHẾ TỰ ĐỘNG CHẠY (AUTOPLAY ENGINE)
       ========================================================= */
    function startAutoplay() {
      if (!opts.autoplay || timer !== null || totalSlides <= 1) return;
      timer = setInterval(() => {
        next();
      }, opts.interval);
    }

    function stopAutoplay() {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    /* =========================================================
       7. XỬ LÝ VUỐT CẢM ỨNG & KÉO CHUỘT (TOUCH & DRAG)
       ========================================================= */
    function onTouchStart(e) {
      if (isTransitioning) return;
      isDragging = true;
      hasMoved = false;
      startX = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
      currentX = startX;
      stopAutoplay();
    }

    function onTouchMove(e) {
      if (!isDragging) return;
      currentX = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
      const diffX = currentX - startX;

      if (Math.abs(diffX) > 5) {
        hasMoved = true;
      }

      // Kháng cự kéo mép (elastic rubber-band) nếu không cho phép loop
      let dragOffset = diffX;
      if (!opts.loop) {
        if ((currentIndex === 0 && diffX > 0) || (currentIndex === totalSlides - 1 && diffX < 0)) {
          dragOffset = diffX * 0.3; // Giảm biên độ kéo khi chạm giới hạn
        }
      }

      const containerWidth = root.offsetWidth || 1;
      const percentageMoved = (dragOffset / containerWidth) * 100;
      const currentOffset = -currentIndex * 100 + percentageMoved;

      applyTransform(currentOffset, false);
    }

    function onTouchEnd() {
      if (!isDragging) return;
      isDragging = false;

      const diffX = currentX - startX;
      if (hasMoved && Math.abs(diffX) > opts.threshold) {
        if (diffX < 0) {
          next();
        } else {
          prev();
        }
      } else {
        // Hoàn vị trí cũ nếu vuốt chưa đủ khoảng cách threshold
        applyTransform(-currentIndex * 100, true);
      }

      startAutoplay();
    }

    /* =========================================================
       8. GẮN SỰ KIỆN LẮNG NGHE (EVENT LISTENERS)
       ========================================================= */
    function attachEvents() {
      // Nút Next / Prev
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          prev();
          resetAutoplay();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          next();
          resetAutoplay();
        });
      }

      // Tạm dừng khi rê chuột hoặc Focus vào slider (Chuẩn A11y)
      root.addEventListener("mouseenter", stopAutoplay);
      root.addEventListener("mouseleave", startAutoplay);
      root.addEventListener("focusin", stopAutoplay);
      root.addEventListener("focusout", startAutoplay);

      // Phím mũi tên
      if (opts.keyboard) {
        root.tabIndex = root.tabIndex >= 0 ? root.tabIndex : 0;
        root.addEventListener("keydown", (e) => {
          if (e.key === "ArrowLeft") {
            prev();
            resetAutoplay();
          } else if (e.key === "ArrowRight") {
            next();
            resetAutoplay();
          }
        });
      }

      // Vuốt chạm cảm ứng (Mobile Touch)
      root.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("touchend", onTouchEnd);

      // Kéo thả chuột (Desktop Mouse Drag)
      root.addEventListener("mousedown", onTouchStart);
      window.addEventListener("mousemove", onTouchMove);
      window.addEventListener("mouseup", onTouchEnd);

      // Tránh mở kéo ảnh mặc định của trình duyệt
      root.addEventListener("dragstart", (e) => e.preventDefault());
    }

    /* =========================================================
       9. KHỞI CHẠY ENGINE
       ========================================================= */
    setupLayout();
    attachEvents();
    startAutoplay();

    // Trả về API điều khiển đối tượng
    return {
      next,
      prev,
      goTo,
      play: startAutoplay,
      pause: stopAutoplay,
      getCurrentIndex: () => currentIndex,
      getTotalSlides: () => totalSlides,
      destroy: () => {
        stopAutoplay();
        // Hủy bỏ các style inline khi dọn dẹp
        track.style.transform = "";
        track.style.transition = "";
      }
    };
  }

  // Đăng ký toàn cục
  global.initSlider = initSlider;

})(typeof window !== "undefined" ? window : this);

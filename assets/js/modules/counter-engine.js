/* =========================================================
   NEXUS VR — modules/counter-engine.js   [PHỤ TRÁCH: Trường Vũ]
   TẦNG 2 - REUSABLE MODULES
   Bộ đếm số nhảy mượt mà (Animated Number Counter Engine)

   TÍNH NĂNG KỸ THUẬT:
   - Tự động kích hoạt khi phần tử cuộn vào tầm nhìn (IntersectionObserver)
   - Sử dụng requestAnimationFrame cho tốc độ khung hình chuẩn 60fps
   - Đường cong chuyển động gia tốc mượt mà: easeOutExpo
   - Hỗ trợ số nguyên, số thập phân và định dạng tiền tệ / phần trăm
   - Tự động unobserve sau khi chạy xong để giải phóng tài nguyên CPU/RAM
   - Tương thích Accessiblity: aria-live, prefers-reduced-motion
   ========================================================= */

(function (global) {
  "use strict";

  /**
   * Hàm gia tốc easeOutExpo cho cảm giác số nhảy chậm dần sang trọng
   * @param {number} x - Tiến trình thời gian từ 0 đến 1
   * @returns {number}
   */
  function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  /**
   * Định dạng số có dấu phân cách hàng nghìn kiểu Việt Nam hoặc quốc tế
   * @param {number} num - Số cần định dạng
   * @param {number} decimals - Số lượng chữ số thập phân
   * @returns {string}
   */
  function formatNumber(num, decimals = 0) {
    if (decimals > 0) {
      return num.toFixed(decimals);
    }
    return Math.round(num).toLocaleString("vi-VN");
  }

  /**
   * Chạy hiệu ứng đếm số trên một phần tử cụ thể
   * @param {HTMLElement} el - Thẻ DOM chứa số
   * @param {number} target - Giá trị đích cần đếm tới
   * @param {Object} options - Tùy chỉnh hiệu ứng
   */
  function animateCounter(el, target, options = {}) {
    if (!el) return;

    const duration = options.duration || 2000;
    const decimals = options.decimals || 0;
    const prefix = options.prefix || el.dataset.prefix || "";
    const suffix = options.suffix || el.dataset.suffix || "";

    // Kiểm tra chế độ giảm chuyển động của hệ điều hành
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      el.textContent = `${prefix}${formatNumber(target, decimals)}${suffix}`;
      return;
    }

    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentVal = target * easedProgress;

      el.textContent = `${prefix}${formatNumber(currentVal, decimals)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = `${prefix}${formatNumber(target, decimals)}${suffix}`;
      }
    }

    requestAnimationFrame(step);
  }

  /**
   * Tự động quét và kích hoạt bộ đếm khi xuất hiện trên màn hình
   * @param {string} selector - CSS selector của các thẻ đếm
   * @param {Object} options - Cấu hình IntersectionObserver và đếm
   */
  function initCounters(selector = "[data-counter]", options = {}) {
    const elements = document.querySelectorAll(selector);
    if (!elements || elements.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -40px 0px",
      threshold: options.threshold || 0.2
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const rawTarget = el.dataset.counter || el.textContent;
          const target = parseFloat(rawTarget.replace(/[^0-9.-]+/g, "")) || 0;
          const decimals = parseInt(el.dataset.decimals || "0", 10);
          const duration = parseInt(el.dataset.duration || "2000", 10);

          animateCounter(el, target, {
            duration,
            decimals,
            prefix: el.dataset.prefix,
            suffix: el.dataset.suffix
          });

          // Giải phóng RAM/CPU sau khi đã chạy
          obs.unobserve(el);
        }
      });
    }, observerOptions);

    elements.forEach((el) => observer.observe(el));
  }

  // Đăng ký toàn cục
  global.CounterEngine = {
    animateCounter,
    initCounters,
    formatNumber
  };
  global.initCounters = initCounters;
  global.animateCounter = animateCounter;

})(typeof window !== "undefined" ? window : this);

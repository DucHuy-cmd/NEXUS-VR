/* [10% SÁNG TẠO - NGUYỄN TRƯỜNG VŨ]
 * File: gsap-registry.js
 * Nhiệm vụ: Đăng ký GSAP plugins và đồng bộ Ticker với Lenis.
 */

const NexusGSAP = (function () {
  function init() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      console.warn("NexusGSAP: Thiếu thư viện GSAP hoặc ScrollTrigger.");
      return;
    }

    // Đăng ký Plugin
    gsap.registerPlugin(ScrollTrigger);

    // Đồng bộ Ticker của GSAP với Lenis để chống giật (Jittering)
    if (window.NexusScroll) {
      const lenis = window.NexusScroll.getInstance();
      if (lenis) {
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });

        // Tắt tính năng raf tự động của GSAP lag smoothing để tránh xung đột
        gsap.ticker.lagSmoothing(0);
        console.log("Nexus Core: Đã đồng bộ GSAP Ticker với Lenis thành công.");
      }
    }
  }

  // Hàm tiện ích: Tái tính toán lại các trigger khi chuyển trang
  function refresh() {
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  }

  return {
    init,
    refresh
  };
})();

window.NexusGSAP = NexusGSAP;

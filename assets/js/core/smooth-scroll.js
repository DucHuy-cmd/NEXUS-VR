/* [10% SÁNG TẠO - NGUYỄN TRƯỜNG VŨ]
 * File: smooth-scroll.js
 * Nhiệm vụ: Thiết lập vật lý cuộn trang mượt (Smooth Scrolling) bằng Lenis.
 * Easing được tinh chỉnh riêng biệt cho cảm giác Quiet Luxury (đầm, phản hồi chính xác).
 */

const NexusScroll = (function () {
  let lenisInstance = null;

  function init() {
    // Nếu hệ thống hoặc người dùng ưu tiên giảm chuyển động, không khởi tạo
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReducedMotion) {
      console.log("Lenis: Đã vô hiệu hóa theo tùy chọn prefers-reduced-motion.");
      return;
    }

    // Khởi tạo Lenis với bộ tham số nhạy bén, không bị trễ (delay)
    lenisInstance = new Lenis({
      lerp: 0.25, // [FIX DELAY] Tăng lên 0.25 để chuột phản hồi sắc lẹm, không bị độ trễ "bơ"
      wheelMultiplier: 1.1, // Tăng nhẹ tốc độ lăn
      syncTouch: false,
      smoothWheel: true
    });

    // BỎ QUA vòng lặp requestAnimationFrame nội bộ ở đây.
    // Lenis sẽ được điều khiển bởi gsap.ticker trong gsap-registry.js để tránh double-RAF gây giật.

    console.log("Nexus Core: Lenis Smooth Scroll đã kích hoạt với lerp 0.15.");
  }

  function getInstance() {
    return lenisInstance;
  }

  // Tạm dừng cuộn (dùng khi mở Modal, Giỏ hàng)
  function stop() {
    if (lenisInstance) lenisInstance.stop();
  }

  // Khôi phục cuộn
  function start() {
    if (lenisInstance) lenisInstance.start();
  }

  return {
    init,
    getInstance,
    stop,
    start
  };
})();

// Gắn toàn cục để Barba hoặc GSAP có thể giao tiếp
window.NexusScroll = NexusScroll;

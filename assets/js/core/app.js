/* [10% SÁNG TẠO - NGUYỄN TRƯỜNG VŨ]
 * File: app.js
 * Nhiệm vụ: Động cơ cốt lõi (Core Engine). Khởi tạo tất cả hệ thống khi DOM sẵn sàng.
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("===============================================");
  console.log("NEXUS VR CORE ENGINE INITIALIZED BY TRUONG VU");
  console.log("===============================================");
  // 0. Khởi động Cơ chế Đường Lui (Fallback Mechanism)
  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof gsap !== "undefined" && !isReducedMotion) {
    document.documentElement.classList.add("fx-on");
    console.log("Nexus Core: Cấp thẻ xanh fx-on. GSAP và Hiệu ứng động sẵn sàng.");
  } else {
    console.warn("Nexus Core: Máy yếu hoặc GSAP lỗi. Chạy chế độ Fallback tĩnh.");
    // Ẩn cửa preloader nếu fallback
    const door = document.getElementById("ignition-door");
    if(door) door.style.display = "none";
  }

  // 1. Khởi tạo cuộn mượt (Lenis)
  if (window.NexusScroll) {
    window.NexusScroll.init();
  }

  // 2. Đăng ký & Đồng bộ GSAP (ScrollTrigger)
  if (window.NexusGSAP) {
    window.NexusGSAP.init();
  }

  // 3. Khởi tạo điều hướng SPA (Barba)
  if (window.NexusRouter) {
    window.NexusRouter.init();
  }

  // 4. Khởi tạo Hiệu ứng không gian (3D Tilt)
  if (window.NexusMotion) {
    window.NexusMotion.init();
  }
});

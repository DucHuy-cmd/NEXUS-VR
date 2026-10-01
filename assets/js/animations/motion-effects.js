/* [10% SÁNG TẠO - NGUYỄN TRƯỜNG VŨ]
 * File: motion-effects.js
 * Nhiệm vụ: Xử lý vật lý không gian, tạo cảm giác 3D từ ảnh 2D tĩnh.
 * Giải pháp thay thế Spline 3D Model nặng nề để đảm bảo tính Sang trọng (Quiet Luxury).
 */

const NexusMotion = (function() {
  function initHero3DTilt() {
    const canvas = document.getElementById('hero-headset-canvas');
    if (!canvas) return;

    // Chỉ bật hiệu ứng này trên máy tính (có chuột), tắt trên điện thoại
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouchDevice) return;

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Toán học: Tính toán góc nghiêng tối đa là 15 độ theo trục X và Y
      const rotateX = ((y - centerY) / centerY) * -15; 
      const rotateY = ((x - centerX) / centerX) * 15;

      // Áp dụng ma trận biến đổi 3D vào layer ảnh đang active
      const activeLayer = canvas.querySelector('.hero-view-layer.is-active');
      if (activeLayer) {
        activeLayer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05) translateZ(30px)`;
        activeLayer.style.transition = 'none'; // Phản hồi chuột ngay lập tức
      }
    });

    canvas.addEventListener('mouseleave', () => {
      // Khi rời chuột, trả vật thể về vị trí cân bằng với hiệu ứng đàn hồi (Spring)
      const activeLayer = canvas.querySelector('.hero-view-layer.is-active');
      if (activeLayer) {
        activeLayer.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        activeLayer.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)`;
      }
    });
  }

  function init() {
    initHero3DTilt();
  }

  return { init };
})();

window.NexusMotion = NexusMotion;

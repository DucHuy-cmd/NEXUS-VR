/* [10% SÁNG TẠO - NGUYỄN TRƯỜNG VŨ]
 * File: page-transitions.js
 * Nhiệm vụ: Hoạt ảnh mờ vào/bay ra chuẩn Luxury khi chuyển trang (Không nháy trắng).
 */

const NexusTransitions = (function() {
  function leave(container) {
    // Kịch bản: Fade to Black. Màn hình tối sầm lại.
    return gsap.to(container, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.inOut"
    });
  }

  function enter(container) {
    // Kịch bản: Kéo bức màn đen lên. Trang mới hiện ra từ bóng tối
    return gsap.fromTo(container, 
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 0.8, 
        ease: "power3.out",
        clearProps: "all"
      }
    );
  }

  return { leave, enter };
})();

window.NexusTransitions = NexusTransitions;

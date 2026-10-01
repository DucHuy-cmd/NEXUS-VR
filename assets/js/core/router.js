/* [10% SÁNG TẠO - NGUYỄN TRƯỜNG VŨ]
 * File: router.js
 * Nhiệm vụ: Barba.js Router - Quản lý vòng đời SPA (Single Page Application).
 */

const NexusRouter = (function() {
  function init() {
    if (typeof barba === "undefined") {
      console.warn("NexusRouter: Thiếu thư viện Barba.js");
      return;
    }
    barba.init({
      sync: false, // Dùng Curtain Transition nên không cần sync song song, đợi trang cũ out rồi mới in trang mới
      transitions: [{
        name: 'luxury-curtain',
        leave(data) {
          return window.NexusTransitions.leave(data.current.container);
        },
        enter(data) {
          return window.NexusTransitions.enter(data.next.container);
        }
      }]
    });

    // Sau khi trang mới load xong, khởi tạo lại các module JS (Vì Barba không tải lại trang)
    barba.hooks.after((data) => {
      // 1. Reset cuộn chuột về đầu trang bằng Lenis thay vì window.scrollTo
      if (window.NexusScroll && window.NexusScroll.getInstance()) {
        window.NexusScroll.getInstance().scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }

      // 2. Refresh lại bộ đo đạc của ScrollTrigger
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      
      // 3. Khởi tạo lại Logic FX Engine
      if (window.NexusFX) window.NexusFX.scan(document.body);
      
      // 4. Khởi tạo lại Logic của các trang tương ứng
      const namespace = data.next.namespace;
      
      if (namespace === "home") {
        window.__homeCinematicInitialized = false; 
        if (typeof initHomeCinematic === "function") initHomeCinematic();
      }
      
      if (namespace === "contact") {
        // Cần đảm bảo form/3D card bên trang contact được tái khởi động
        // Tương tự home, cờ khởi tạo sẽ nằm bên contact-controller
      }
    });
    
    console.log("Nexus Core: Barba Router SPA đã kích hoạt.");
  }
  
  return { init };
})();

window.NexusRouter = NexusRouter;

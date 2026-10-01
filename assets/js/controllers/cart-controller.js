/* ==========================================================================
   NEXUS VR — controllers/cart-controller.js   [PHỤ TRÁCH: Tường]
   TẦNG 3 - CONTROLLERS: ĐIỀU KHIỂN GIAO DIỆN GIỎ HÀNG
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", initCartController);
  if (document.readyState === "interactive" || document.readyState === "complete") {
    initCartController();
  }

  function initCartController() {
    // Đảm bảo đồng bộ với window.cartManager từ modules/cart-manager.js
    if (window.cartManager && typeof window.cartManager.renderCartTable === "function") {
      window.cartManager.renderCartTable();
    }
  }

  window.cartController = {
    init: initCartController
  };
})();

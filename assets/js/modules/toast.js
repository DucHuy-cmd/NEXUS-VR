/* =========================================================
   NEXUS VR — modules/toast.js   [PHỤ TRÁCH: Đức Huy]
   TẦNG 2 - REUSABLE MODULES
   Hàm bắn popup showToast(msg, type) — thay thế HOÀN TOÀN
   alert() ở mọi trang.

   Cách dùng: showToast("Đã thêm vào giỏ hàng", "success");
   type: "success" | "error" | "info" (mặc định "info")
   ========================================================= */

(function () {
  let container = null;

  function getContainer() {
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    return container;
  }

  const ICONS = { success: "✓", error: "✕", info: "ℹ" };

  window.showToast = function (message, type = "info", duration = 3000) {
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.innerHTML = `
      <span class="toast__icon">${ICONS[type] || ICONS.info}</span>
      <span class="toast__msg">${message}</span>
      <span class="toast__bar" style="animation-duration:${duration}ms"></span>
    `;
    getContainer().appendChild(el);

    setTimeout(() => {
      el.classList.add("is-leaving");
      // [FIX #2] .toast__bar cũng có animation riêng (toast-shrink) kết thúc
      // gần như CÙNG LÚC với thời điểm này, và sự kiện animationend của nó
      // sẽ NỔI BONG BÓNG (bubble) lên tới el. Nếu không kiểm tra e.target,
      // listener có thể bị "cướp" bởi animationend của thanh progress bar,
      // xoá toast NGAY LẬP TỨC trước khi animation toast-out (trượt ra) kịp
      // chạy xong → hiệu ứng bị giật cụt thay vì mượt.
      el.addEventListener("animationend", (e) => {
        if (e.target !== el) return; // bỏ qua animationend nổi lên từ con (toast__bar)
        el.remove();
      }, { once: true });
    }, duration);
  };
})();

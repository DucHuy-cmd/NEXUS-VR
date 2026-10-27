/* =========================================================
   NEXUS VR — modules/toast.js
   TẦNG 2 - REUSABLE MODULES
   Hệ thống thông báo Toast popup chuẩn mực (SVG Icons, không dùng emoji)
   ========================================================= */

(function () {
  let container = null;

  function getContainer() {
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }
    return container;
  }

  const SVG_ICONS = {
    success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
  };

  window.showToast = function (message, type = "info", duration = 3500, options = null) {
    const el = document.createElement("div");
    const container = getContainer();

    if (options && options.image) {
      el.className = `toast toast--rich toast--${type}`;
      el.setAttribute("role", "status");

      const thumbHtml = `<div class="toast__thumb"><img src="${options.image}" alt=""></div>`;
      const titleText = options.title || message;
      const metaBadge = options.color ? `<span class="toast__meta-badge">${options.color}</span>` : '';
      const actionBtn = options.actionText 
        ? `<button type="button" class="toast__action-btn" id="toast-action-btn">${options.actionText}</button>`
        : '';

      el.innerHTML = `
        ${thumbHtml}
        <div class="toast__details">
          <span class="toast__product-name">${titleText}</span>
          <div class="toast__product-meta">
            ${metaBadge}
            <span>Đã thêm vào giỏ hàng</span>
          </div>
        </div>
        ${actionBtn}
        <span class="toast__bar" style="animation-duration:${duration}ms"></span>
      `;

      if (options.actionText && typeof options.onAction === 'function') {
        const btn = el.querySelector('#toast-action-btn');
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            options.onAction();
          });
        }
      }
    } else {
      el.className = `toast toast--${type}`;
      el.setAttribute("role", "status");
      el.innerHTML = `
        <span class="toast__icon" aria-hidden="true">${SVG_ICONS[type] || SVG_ICONS.info}</span>
        <span class="toast__msg">${message}</span>
        <span class="toast__bar" style="animation-duration:${duration}ms"></span>
      `;
    }

    container.appendChild(el);

    setTimeout(() => {
      el.classList.add("is-leaving");
      el.addEventListener("animationend", (e) => {
        if (e.target !== el) return;
        el.remove();
      }, { once: true });
    }, duration);
  };
})();

/* =========================================================
   NEXUS VR — modules/accordion-engine.js   [PHỤ TRÁCH: Trường Vũ]
   TẦNG 2 - REUSABLE MODULES
   Bộ trượt mở câu hỏi / nội dung thả xuống (Accordion Engine)

   TÍNH NĂNG KỸ THUẬT:
   - Tính toán chiều cao thực tế bằng scrollHeight mượt mà, không bị giật layout
   - Hỗ trợ 2 chế độ: Đóng các mục khác (Single Mode) hoặc Cho phép mở nhiều mục (Multiple Mode)
   - Hoàn toàn tự động gán nhãn WAI-ARIA (aria-expanded, aria-controls, role="region")
   - Hỗ trợ bàn phím đầy đủ theo chuẩn W3C: Arrow Up/Down, Home, End, Enter, Space
   - Tự động chuyển height sang 'auto' sau khi mở xong để tương thích 100% responsive
   ========================================================= */

(function (global) {
  "use strict";

  /**
   * Cấu hình mặc định cho Accordion
   */
  const DEFAULT_OPTIONS = {
    itemSelector: ".accordion-item",
    headerSelector: ".accordion-header",
    contentSelector: ".accordion-content",
    allowMultiple: false, // Mặc định: mở câu này thì đóng câu khác
    openFirst: false,     // Tự động mở câu đầu tiên khi tải trang
    speed: 350,           // ms
    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    activeClass: "is-open"
  };

  /**
   * Khởi tạo Accordion Engine trên một container
   * @param {string|HTMLElement} container - Bộ chọn CSS hoặc phần tử DOM của Accordion
   * @param {Object} userOptions - Tùy chọn cấu hình ghi đè
   * @returns {Object|null} - Instance điều khiển Accordion
   */
  function initAccordion(container, userOptions = {}) {
    const root = typeof container === "string" ? document.querySelector(container) : container;
    if (!root) {
      console.warn(`[AccordionEngine] Không tìm thấy phần tử: ${container}`);
      return null;
    }

    const opts = Object.assign({}, DEFAULT_OPTIONS, userOptions);
    const items = Array.from(root.querySelectorAll(opts.itemSelector));

    if (items.length === 0) {
      console.warn("[AccordionEngine] Không tìm thấy phần tử accordion-item nào.");
      return null;
    }

    // Nhận diện prefers-reduced-motion của OS
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const effectiveSpeed = prefersReducedMotion ? 0 : opts.speed;

    /* =========================================================
       1. THIẾT LẬP WAI-ARIA & KHỞI TẠO DOM
       ========================================================= */
    const accordionId = root.id || `acc-${Math.random().toString(36).substring(2, 9)}`;

    items.forEach((item, index) => {
      const header = item.querySelector(opts.headerSelector);
      const content = item.querySelector(opts.contentSelector);

      if (!header || !content) return;

      const headerId = `${accordionId}-header-${index}`;
      const contentId = `${accordionId}-content-${index}`;

      // Đảm bảo header có thẻ button để đạt chuẩn tương tác A11y
      let button = header.querySelector("button");
      if (!button) {
        // Nếu người dùng viết tiêu đề không có button, ta bọc hoặc dùng trực tiếp header
        button = header;
      }

      button.id = headerId;
      button.setAttribute("type", "button");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", contentId);

      content.id = contentId;
      content.setAttribute("role", "region");
      content.setAttribute("aria-labelledby", headerId);

      // Cấu hình style ban đầu cho content
      content.style.overflow = "hidden";
      content.style.height = "0px";
      content.style.transitionProperty = "height, opacity";
      content.style.transitionDuration = `${effectiveSpeed}ms`;
      content.style.transitionTimingFunction = opts.easing;
      content.style.opacity = "0";

      // Đóng trạng thái ban đầu
      item.classList.remove(opts.activeClass);
    });

    /* =========================================================
       2. HÀM MỞ MỤC (EXPAND)
       ========================================================= */
    function openItem(item, animate = true) {
      const header = item.querySelector(opts.headerSelector);
      const button = header ? (header.querySelector("button") || header) : null;
      const content = item.querySelector(opts.contentSelector);

      if (!content || item.classList.contains(opts.activeClass)) return;

      // Nếu không cho phép mở nhiều mục, đóng tất cả các mục khác trước
      if (!opts.allowMultiple) {
        items.forEach((otherItem) => {
          if (otherItem !== item && otherItem.classList.contains(opts.activeClass)) {
            closeItem(otherItem, animate);
          }
        });
      }

      item.classList.add(opts.activeClass);
      if (button) button.setAttribute("aria-expanded", "true");

      if (animate && effectiveSpeed > 0) {
        // Kỹ thuật scrollHeight mượt mà
        content.style.display = "block";
        const targetHeight = content.scrollHeight;
        content.style.height = "0px";
        content.style.opacity = "0";

        // Buộc trình duyệt Reflow để nhận diện mốc bắt đầu
        void content.offsetHeight;

        content.style.height = `${targetHeight}px`;
        content.style.opacity = "1";

        const onEnd = () => {
          content.removeEventListener("transitionend", onEnd);
          // Chuyển sang height: auto để tránh lỗi vỡ layout khi resize màn hình
          if (item.classList.contains(opts.activeClass)) {
            content.style.height = "auto";
          }
        };
        content.addEventListener("transitionend", onEnd);
      } else {
        content.style.height = "auto";
        content.style.opacity = "1";
      }

      root.dispatchEvent(new CustomEvent("accordion:open", { detail: { item } }));
    }

    /* =========================================================
       3. HÀM ĐÓNG MỤC (COLLAPSE)
       ========================================================= */
    function closeItem(item, animate = true) {
      const header = item.querySelector(opts.headerSelector);
      const button = header ? (header.querySelector("button") || header) : null;
      const content = item.querySelector(opts.contentSelector);

      if (!content || !item.classList.contains(opts.activeClass)) return;

      item.classList.remove(opts.activeClass);
      if (button) button.setAttribute("aria-expanded", "false");

      if (animate && effectiveSpeed > 0) {
        // Đang là height: auto -> chuyển về số pixel cụ thể trước khi co lại 0
        content.style.height = `${content.scrollHeight}px`;
        void content.offsetHeight; // Buộc reflow

        content.style.height = "0px";
        content.style.opacity = "0";
      } else {
        content.style.height = "0px";
        content.style.opacity = "0";
      }

      root.dispatchEvent(new CustomEvent("accordion:close", { detail: { item } }));
    }

    /* =========================================================
       4. HÀM CHUYỂN ĐỔI (TOGGLE)
       ========================================================= */
    function toggleItem(item) {
      if (item.classList.contains(opts.activeClass)) {
        closeItem(item, true);
      } else {
        openItem(item, true);
      }
    }

    /* =========================================================
       5. SỰ KIỆN CLICK & BÀN PHÍM (EVENT LISTENERS)
       ========================================================= */
    function attachEvents() {
      items.forEach((item, index) => {
        const header = item.querySelector(opts.headerSelector);
        const button = header ? (header.querySelector("button") || header) : null;
        if (!button) return;

        // Click để đóng/mở
        button.addEventListener("click", () => {
          toggleItem(item);
        });

        // Điều hướng bàn phím A11y
        button.addEventListener("keydown", (e) => {
          const key = e.key;

          if (key === "ArrowDown") {
            e.preventDefault();
            const nextIndex = (index + 1) % items.length;
            focusButton(nextIndex);
          } else if (key === "ArrowUp") {
            e.preventDefault();
            const prevIndex = (index - 1 + items.length) % items.length;
            focusButton(prevIndex);
          } else if (key === "Home") {
            e.preventDefault();
            focusButton(0);
          } else if (key === "End") {
            e.preventDefault();
            focusButton(items.length - 1);
          }
        });
      });
    }

    function focusButton(index) {
      const targetItem = items[index];
      if (!targetItem) return;
      const header = targetItem.querySelector(opts.headerSelector);
      const button = header ? (header.querySelector("button") || header) : null;
      if (button) button.focus();
    }

    /* =========================================================
       6. KHỞI ĐỘNG TRẠNG THÁI BAN ĐẦU
       ========================================================= */
    attachEvents();

    if (opts.openFirst && items.length > 0) {
      openItem(items[0], false);
    }

    // Trả về API điều khiển đối tượng
    return {
      open: (idx) => items[idx] && openItem(items[idx], true),
      close: (idx) => items[idx] && closeItem(items[idx], true),
      toggle: (idx) => items[idx] && toggleItem(items[idx]),
      closeAll: () => items.forEach((it) => closeItem(it, true)),
      openAll: () => items.forEach((it) => openItem(it, true)),
      destroy: () => {
        items.forEach((item) => {
          const content = item.querySelector(opts.contentSelector);
          if (content) {
            content.style.height = "";
            content.style.opacity = "";
            content.style.transition = "";
          }
        });
      }
    };
  }

  // Đăng ký toàn cục
  global.initAccordion = initAccordion;

})(typeof window !== "undefined" ? window : this);

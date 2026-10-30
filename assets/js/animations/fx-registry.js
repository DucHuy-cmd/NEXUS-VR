/* ==========================================================================
   NEXUS VR — fx-registry.js
   CORE FX ENGINE (Declarative Animations)
   ========================================================================== */

(function () {
  "use strict";

  window.NexusFX = {
    scan: function (container = document.body) {
      if (!document.documentElement.classList.contains("fx-on")) {
        // Dự phòng: tự động bật FX nếu chưa có, trừ khi người dùng tắt motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
          document.documentElement.classList.add("fx-on");
        } else {
          return; // Tôn trọng reduced motion, không chạy FX
        }
      }

      this.initReveal(container);
      this.initSpotlight(container);
      this.initMagnetic(container);
      this.initSplit(container);
      this.initMask(container);
      this.initSmartCursor(container);
    },

    /* 1. REVEAL (Trượt lên & Hiện rõ) */
    initReveal: function (container) {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
      const elements = container.querySelectorAll('[data-fx="reveal"]');
      
      elements.forEach(el => {
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        });
      });
    },

    /* 2. SPOTLIGHT (Hắt sáng theo tọa độ chuột) */
    initSpotlight: function (container) {
      const elements = container.querySelectorAll('[data-fx="spotlight"]');
      if (window.matchMedia("(pointer: coarse)").matches) return; // Bỏ qua cảm ứng

      elements.forEach(el => {
        el.addEventListener("mousemove", (e) => {
          const rect = el.getBoundingClientRect();
          // Tính % X, Y
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          
          // Dùng requestAnimationFrame ngầm để CSS tự động update mượt mà
          el.style.setProperty('--mx', `${x}%`);
          el.style.setProperty('--my', `${y}%`);
        });
      });
    },

    /* 3. MAGNETIC (Từ tính cho Nút bấm) */
    initMagnetic: function (container) {
      if (typeof gsap === "undefined") return;
      if (window.matchMedia("(pointer: coarse)").matches) return; // Bỏ qua cảm ứng

      const elements = container.querySelectorAll('[data-fx="magnetic"]');
      
      elements.forEach(el => {
        // Tạo GSAP quickTo để update X, Y mượt mà ko reflow
        const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
        
        el.addEventListener("mousemove", (e) => {
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          // Khoảng cách từ chuột đến tâm
          const deltaX = e.clientX - centerX;
          const deltaY = e.clientY - centerY;
          
          // Cường độ hút: 0.3
          xTo(deltaX * 0.3);
          yTo(deltaY * 0.3);
        });

        el.addEventListener("mouseleave", () => {
          // Trả về vị trí cũ
          xTo(0);
          yTo(0);
        });
      });
    },

    /* 4. SPLIT TEXT (Tách dòng & Reveal) */
    initSplit: function (container) {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
      const elements = container.querySelectorAll('[data-fx="split"]');
      
      elements.forEach(el => {
        // Tạm thời ngắt span cơ bản (SplitLines fallback)
        // Trong thực tế sẽ dùng thư viện như SplitText, ở đây viết logic cơ bản chia từ
        const words = el.innerText.split(' ');
        el.innerHTML = '';
        
        // Gói tạm vào 1 block, có thể mở rộng thuật toán bẻ dòng bằng JS đo width
        // Demo đơn giản: gói toàn bộ thành 1 line để test animation trượt
        const lineWrap = document.createElement("span");
        lineWrap.className = "fx-line-wrapper";
        
        const lineInner = document.createElement("span");
        lineInner.className = "fx-line";
        lineInner.innerText = words.join(' ');
        
        lineWrap.appendChild(lineInner);
        el.appendChild(lineWrap);
        
        gsap.to(lineInner, {
          y: "0%",
          opacity: 1,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%"
          }
        });
      });
    },

    /* 5. MASK (Clip-path Reveal & Scale down) */
    initMask: function (container) {
      if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
      const elements = container.querySelectorAll('[data-fx="mask"]');
      
      elements.forEach(el => {
        gsap.to(el, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          scale: 1,
          duration: 1.2,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: el,
            start: "top 85%"
          }
        });
      });
    },

    /* 6. SMART CURSOR (Con trỏ chuột nhận dạng ngữ cảnh) */
    initSmartCursor: function (container) {
      // Bỏ qua, không hiện dấu chấm tròn nếu đang ở trang Liên hệ
      if (document.body.dataset.page === "contact") return;
      if (window.matchMedia("(pointer: coarse)").matches) return;
      
      // Tạo cursor DOM nếu chưa có
      let cursor = document.getElementById("nexus-smart-cursor");
      if (!cursor) {
        cursor = document.createElement("div");
        cursor.id = "nexus-smart-cursor";
        cursor.innerHTML = `<span class="cursor-text"></span>`;
        document.body.appendChild(cursor);
      }
      
      const cursorText = cursor.querySelector(".cursor-text");
      const cursorX = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power2.out" });
      const cursorY = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power2.out" });
      
      window.addEventListener("mousemove", (e) => {
        cursorX(e.clientX);
        cursorY(e.clientY);
      });

      // Lắng nghe các phần tử có data-cursor
      const triggers = container.querySelectorAll('[data-cursor]');
      triggers.forEach(el => {
        el.addEventListener("mouseenter", () => {
          const action = el.getAttribute("data-cursor");
          
          let text = "";
          if (action === "view") text = "XEM";
          else if (action === "drag") text = "KÉO";
          else if (action === "add") text = "THÊM";
          else text = action;
          
          cursorText.innerText = text;
          cursor.classList.add("is-active");
        });
        
        el.addEventListener("mouseleave", () => {
          cursor.classList.remove("is-active");
          cursorText.innerText = "";
        });
      });
    }
  };

  // Khởi động chạy FX quét toàn bộ body khi DOM tải xong
  document.addEventListener("DOMContentLoaded", () => {
    window.NexusFX.scan();
  });

})();

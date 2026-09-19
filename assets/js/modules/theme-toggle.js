/* =========================================================
   NEXUS VR — modules/theme-toggle.js   [PHỤ TRÁCH: Đức Huy]
   TẦNG 2 - REUSABLE MODULES
   Logic bấm nút đổi sáng/tối với hiệu ứng sóng chuyển cảnh
   điện ảnh siêu mượt chuẩn 60/120 FPS (View Transitions API).
   Cần storage-service.js nhúng trước.
   ========================================================= */

function initThemeToggle() {
  var btn = document.getElementById("theme-toggle");
  var root = document.documentElement;

  var isDark = getSavedTheme() === "dark";
  root.classList.toggle("dark-mode", isDark);
  if (btn) btn.setAttribute("aria-pressed", String(isDark));

  var isTransitioning = false;

  if (btn) {
    btn.addEventListener("click", function (e) {
      // Chặn spam click liên tục gây gián đoạn luồng render của trình duyệt
      if (isTransitioning) return;
      isTransitioning = true;

      var rect = btn.getBoundingClientRect();
      var clickX = (e && typeof e.clientX === "number" && e.clientX > 0) ? e.clientX : (rect.left + rect.width / 2);
      var clickY = (e && typeof e.clientY === "number" && e.clientY > 0) ? e.clientY : (rect.top + rect.height / 2);

      // Thêm class xoay nảy nhẹ nhàng cho icon
      btn.classList.add("is-animating");
      setTimeout(function () {
        btn.classList.remove("is-animating");
      }, 550);

      // 1. Kiểm tra hỗ trợ View Transitions API (Chrome 111+, Edge, Safari 18+)
      if (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // Đóng băng tạm thời CSS transitions trên DOM để snapshot không bị giật khung hình
        root.classList.add("theme-switching-instant");

        var transition = document.startViewTransition(function () {
          var nowDark = root.classList.toggle("dark-mode");
          saveTheme(nowDark ? "dark" : "light");
          btn.setAttribute("aria-pressed", String(nowDark));
          window.dispatchEvent(new CustomEvent("nexus:themechange", { detail: { isDark: nowDark } }));
        });

        transition.ready.then(function () {
          // Bỏ đóng băng ngay khi trình duyệt đã chụp xong snapshot chất lượng cao
          root.classList.remove("theme-switching-instant");

          var endRadius = Math.hypot(
            Math.max(clickX, window.innerWidth - clickX),
            Math.max(clickY, window.innerHeight - clickY)
          );

          var anim = document.documentElement.animate(
            {
              clipPath: [
                "circle(0px at " + clickX + "px " + clickY + "px)",
                "circle(" + (Math.ceil(endRadius) + 24) + "px at " + clickX + "px " + clickY + "px)"
              ]
            },
            {
              duration: 460,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              pseudoElement: "::view-transition-new(root)"
            }
          );

          anim.finished.then(function () {
            isTransitioning = false;
          }).catch(function () {
            isTransitioning = false;
          });
        }).catch(function () {
          root.classList.remove("theme-switching-instant");
          isTransitioning = false;
        });

        transition.finished.catch(function () {
          isTransitioning = false;
        });

      } else {
        // 2. Fallback siêu mượt cho trình duyệt khác (Firefox): Transition nhẹ nhàng trên các bề mặt chính
        root.classList.add("theme-fallback-fade");

        var nowDark = root.classList.toggle("dark-mode");
        saveTheme(nowDark ? "dark" : "light");
        btn.setAttribute("aria-pressed", String(nowDark));
        window.dispatchEvent(new CustomEvent("nexus:themechange", { detail: { isDark: nowDark } }));

        setTimeout(function () {
          root.classList.remove("theme-fallback-fade");
          isTransitioning = false;
        }, 350);
      }
    });
  }
}

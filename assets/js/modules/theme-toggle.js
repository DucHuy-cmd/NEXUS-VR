/* =========================================================
   NEXUS VR — modules/theme-toggle.js   [PHỤ TRÁCH: Đức Huy]
   TẦNG 2 - REUSABLE MODULES
   Logic bấm nút đổi sáng/tối. Cần storage-service.js nhúng trước.
   ========================================================= */

function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  const root = document.documentElement;

  // Đồng bộ lại trạng thái nút/class theo theme đã lưu — script
  // chống FOUC trong <head> chỉ set sẵn class để tránh nháy màu,
  // còn việc gắn sự kiện + đồng bộ đầy đủ vẫn do file này đảm nhiệm.
  const isDark = getSavedTheme() === "dark";
  root.classList.toggle("dark-mode", isDark);
  if (btn) btn.setAttribute("aria-pressed", String(isDark));

  if (btn) {
    btn.addEventListener("click", () => {
      const nowDark = root.classList.toggle("dark-mode");
      saveTheme(nowDark ? "dark" : "light");
      btn.setAttribute("aria-pressed", String(nowDark));
    });
  }
}

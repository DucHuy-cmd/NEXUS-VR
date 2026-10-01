/* ==========================================================================
   NEXUS VR — controllers/login-controller.js   [PHỤ TRÁCH: Tường]
   TẦNG 3 - CONTROLLERS: ĐĂNG NHẬP / ĐĂNG KÝ / TÀI KHOẢN
   ========================================================================== */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", initLoginController);
  if (document.readyState === "interactive" || document.readyState === "complete") {
    initLoginController();
  }

  function initLoginController() {
    if (window.__nexusLoginInitialized) return;
    window.__nexusLoginInitialized = true;

    initAuthTabs();
    initPasswordToggles();
    initDemoAccountFiller();
    initLoginForm();
    initRegisterForm();
    initProfileState();
  }

  /* --------------------------------------------------------------------------
     1. CHUYỂN ĐỔI TAB ĐĂNG NHẬP / ĐĂNG KÝ
     -------------------------------------------------------------------------- */
  function initAuthTabs() {
    const tabLogin = document.getElementById("tabLoginBtn");
    const tabRegister = document.getElementById("tabRegisterBtn");
    const formLogin = document.getElementById("loginForm");
    const formRegister = document.getElementById("registerForm");
    const title = document.getElementById("authTitle");
    const subtitle = document.getElementById("authSubtitle");

    if (!tabLogin || !tabRegister || !formLogin || !formRegister) return;

    tabLogin.addEventListener("click", () => {
      tabLogin.classList.add("is-active");
      tabRegister.classList.remove("is-active");
      formLogin.hidden = false;
      formRegister.hidden = true;
      if (title) title.textContent = "Đăng Nhập";
      if (subtitle) subtitle.textContent = "Chào mừng bạn quay lại với không gian NEXUS.";
    });

    tabRegister.addEventListener("click", () => {
      tabRegister.classList.add("is-active");
      tabLogin.classList.remove("is-active");
      formRegister.hidden = false;
      formLogin.hidden = true;
      if (title) title.textContent = "Tạo Tài Khoản";
      if (subtitle) subtitle.textContent = "Trải nghiệm đặc quyền điện toán không gian cao cấp.";
    });
  }

  /* --------------------------------------------------------------------------
     2. BẬT / TẮT XEM MẬT KHẨU
     -------------------------------------------------------------------------- */
  function initPasswordToggles() {
    const toggleBtns = document.querySelectorAll(".auth-toggle-pwd");
    toggleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        const input = document.getElementById(targetId);
        if (!input) return;

        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        btn.setAttribute("aria-label", isPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu");
        
        // Icon toggle
        const svg = btn.querySelector("svg");
        if (svg) {
          svg.innerHTML = isPassword
            ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`
            : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     3. ĐIỀN TÀI KHOẢN TEST (1-CLICK DEMO)
     -------------------------------------------------------------------------- */
  function initDemoAccountFiller() {
    const demoBtn = document.getElementById("fillDemoBtn");
    if (!demoBtn) return;

    demoBtn.addEventListener("click", () => {
      // Đảm bảo đang mở tab đăng nhập
      const tabLogin = document.getElementById("tabLoginBtn");
      if (tabLogin) tabLogin.click();

      const emailInput = document.getElementById("loginEmail");
      const pwdInput = document.getElementById("loginPassword");
      if (emailInput && pwdInput) {
        emailInput.value = "demo@nexus.com";
        pwdInput.value = "123456";
        if (typeof showToast === "function") {
          showToast("Đã điền tài khoản trải nghiệm demo@nexus.com", "info");
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. XỬ LÝ ĐĂNG NHẬP
     -------------------------------------------------------------------------- */
  function initLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      const emailError = document.getElementById("loginEmailError");
      const pwdError = document.getElementById("loginPasswordError");

      let hasError = false;
      emailError.textContent = "";
      pwdError.textContent = "";

      // Validate email
      if (!email) {
        emailError.textContent = "Vui lòng nhập địa chỉ email.";
        hasError = true;
      } else if (typeof isValidEmail === "function" && !isValidEmail(email)) {
        emailError.textContent = "Email không đúng định dạng.";
        hasError = true;
      }

      // Validate password
      if (!password) {
        pwdError.textContent = "Vui lòng nhập mật khẩu.";
        hasError = true;
      } else if (password.length < 6) {
        pwdError.textContent = "Mật khẩu phải có ít nhất 6 ký tự.";
        hasError = true;
      }

      if (hasError) return;

      // Xử lý đăng nhập thành công
      const displayName = email.includes("demo") ? "Khách Hàng VIP" : email.split("@")[0];
      const userData = {
        name: displayName,
        email: email,
        joinedDate: "10/2026"
      };

      if (typeof saveCurrentUser === "function") {
        saveCurrentUser(userData);
      } else {
        localStorage.setItem("nexus_user", JSON.stringify(userData));
      }

      if (typeof showToast === "function") {
        showToast(`Đăng nhập thành công! Chào mừng ${displayName}.`, "success");
      }

      if (typeof updateUserState === "function") {
        updateUserState();
      }

      initProfileState();
    });
  }

  /* --------------------------------------------------------------------------
     5. XỬ LÝ ĐĂNG KÝ
     -------------------------------------------------------------------------- */
  function initRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("registerName").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value;
      const confirmPwd = document.getElementById("registerConfirmPassword").value;
      const termsCheck = document.getElementById("registerTerms").checked;

      const nameError = document.getElementById("registerNameError");
      const emailError = document.getElementById("registerEmailError");
      const pwdError = document.getElementById("registerPasswordError");
      const confirmError = document.getElementById("registerConfirmError");

      let hasError = false;
      nameError.textContent = "";
      emailError.textContent = "";
      pwdError.textContent = "";
      confirmError.textContent = "";

      if (!name) {
        nameError.textContent = "Vui lòng nhập họ và tên.";
        hasError = true;
      } else if (typeof isValidName === "function" && !isValidName(name)) {
        nameError.textContent = "Vui lòng nhập họ tên tiếng Việt hợp lệ (ít nhất 2 từ).";
        hasError = true;
      }

      if (!email) {
        emailError.textContent = "Vui lòng nhập địa chỉ email.";
        hasError = true;
      } else if (typeof isValidEmail === "function" && !isValidEmail(email)) {
        emailError.textContent = "Email không đúng định dạng.";
        hasError = true;
      }

      if (!password || password.length < 6) {
        pwdError.textContent = "Mật khẩu tối thiểu 6 ký tự.";
        hasError = true;
      }

      if (password !== confirmPwd) {
        confirmError.textContent = "Mật khẩu xác nhận không khớp.";
        hasError = true;
      }

      if (!termsCheck) {
        if (typeof showToast === "function") {
          showToast("Vui lòng đồng ý với Điều khoản dịch vụ.", "warning");
        }
        return;
      }

      if (hasError) return;

      const userData = {
        name: name,
        email: email,
        joinedDate: "10/2026"
      };

      if (typeof saveCurrentUser === "function") {
        saveCurrentUser(userData);
      } else {
        localStorage.setItem("nexus_user", JSON.stringify(userData));
      }

      if (typeof showToast === "function") {
        showToast("Tạo tài khoản thành công! Chào mừng bạn gia nhập NEXUS.", "success");
      }

      if (typeof updateUserState === "function") {
        updateUserState();
      }

      initProfileState();
    });
  }

  /* --------------------------------------------------------------------------
     6. TRẠNG THÁI PROFILE KHI ĐÃ ĐĂNG NHẬP
     -------------------------------------------------------------------------- */
  function initProfileState() {
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : JSON.parse(localStorage.getItem("nexus_user"));
    const formsCluster = document.getElementById("authFormsCluster");
    const profileCluster = document.getElementById("authProfileCluster");
    const tabsCluster = document.getElementById("authTabsCluster");

    if (!formsCluster || !profileCluster) return;

    if (user && user.name) {
      if (tabsCluster) tabsCluster.hidden = true;
      formsCluster.hidden = true;
      profileCluster.hidden = false;

      const nameEl = document.getElementById("profileName");
      const emailEl = document.getElementById("profileEmail");
      const avatarEl = document.getElementById("profileAvatar");

      if (nameEl) nameEl.textContent = user.name;
      if (emailEl) emailEl.textContent = user.email;
      if (avatarEl) {
        const initials = user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
        avatarEl.textContent = initials || "VR";
      }

      // Đăng xuất
      const logoutBtn = document.getElementById("profileLogoutBtn");
      if (logoutBtn) {
        logoutBtn.onclick = () => {
          if (typeof clearCurrentUser === "function") {
            clearCurrentUser();
          } else {
            localStorage.removeItem("nexus_user");
          }
          if (typeof updateUserState === "function") updateUserState();
          if (typeof showToast === "function") showToast("Đã đăng xuất tài khoản.", "info");

          profileCluster.hidden = true;
          formsCluster.hidden = false;
          if (tabsCluster) tabsCluster.hidden = false;
          const tabLogin = document.getElementById("tabLoginBtn");
          if (tabLogin) tabLogin.click();
        };
      }
    } else {
      if (tabsCluster) tabsCluster.hidden = false;
      formsCluster.hidden = false;
      profileCluster.hidden = true;
    }
  }
})();

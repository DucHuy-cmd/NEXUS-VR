/* ==========================================================================
NEXUS VR — controllers/login-controller.js   [PHỤ TRÁCH: Tưởng]
TẦNG 3 - CONTROLLERS: ĐĂNG NHẬP / ĐĂNG KÝ / QUẢN LÝ HỒ SƠ TÀI KHOẢN
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
    initProfileDetailsForm();
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
    const formDetails = document.getElementById("profileDetailsForm");
    const title = document.getElementById("authTitle");
    const subtitle = document.getElementById("authSubtitle");

    if (!tabLogin || !tabRegister || !formLogin || !formRegister) return;

    tabLogin.addEventListener("click", () => {
      tabLogin.classList.add("is-active");
      tabRegister.classList.remove("is-active");
      tabLogin.setAttribute("aria-selected", "true");
      tabRegister.setAttribute("aria-selected", "false");
      formLogin.hidden = false;
      formRegister.hidden = true;
      if (formDetails) formDetails.hidden = true;
      if (title) title.textContent = "Đăng Nhập";
      if (subtitle) subtitle.textContent = "Chào mừng bạn quay lại với không gian điện toán NEXUS.";
    });

    tabRegister.addEventListener("click", () => {
      tabRegister.classList.add("is-active");
      tabLogin.classList.remove("is-active");
      tabRegister.setAttribute("aria-selected", "true");
      tabLogin.setAttribute("aria-selected", "false");
      formRegister.hidden = false;
      formLogin.hidden = true;
      if (formDetails) formDetails.hidden = true;
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
  3. ĐIỀN TÀI KHOẢN TEST DEMO (1-CLICK)
  -------------------------------------------------------------------------- */
  function initDemoAccountFiller() {
    const demoBtn = document.getElementById("fillDemoBtn");
    if (!demoBtn) return;

    demoBtn.addEventListener("click", () => {
      const tabLogin = document.getElementById("tabLoginBtn");
      if (tabLogin) tabLogin.click();

      const emailInput = document.getElementById("loginEmail");
      const pwdInput = document.getElementById("loginPassword");

      if (emailInput && pwdInput) {
        emailInput.value = "tuong@nexus.com";
        pwdInput.value = "123456";

        const demoUserData = {
          name: "Trần Tưởng",
          email: "tuong@nexus.com",
          phone: "0988123456",
          city: "TP. Hồ Chí Minh",
          district: "Quận 1",
          address: "Số 123 Phố đi bộ Nguyễn Huệ, Phường Bến Nghé",
          joinedDate: "10/2026"
        };

        saveUserData(demoUserData);

        if (typeof showToast === "function") {
          showToast("Đã điền tài khoản mẫu Tưởng (tuong@nexus.com)", "info");
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
  4. HÀM DÙNG CHUNG: LƯU VÀ PHÁT SỰ KIỆN CẬP NHẬT TÀI KHOẢN
  -------------------------------------------------------------------------- */
  function saveUserData(userData) {
    if (typeof saveCurrentUser === "function") {
      saveCurrentUser(userData);
    } else {
      localStorage.setItem("nexus_user", JSON.stringify(userData));
    }
    if (typeof updateUserState === "function") {
      updateUserState();
    }
    window.dispatchEvent(new CustomEvent("nexus:user-updated"));
  }

  /* --------------------------------------------------------------------------
  5. XỬ LÝ ĐĂNG NHẬP
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

      if (emailError) emailError.textContent = "";
      if (pwdError) pwdError.textContent = "";

      if (!email) {
        if (emailError) emailError.textContent = "Vui lòng nhập địa chỉ email.";
        hasError = true;
      } else if (typeof isValidEmail === "function" && !isValidEmail(email)) {
        if (emailError) emailError.textContent = "Email không đúng định dạng.";
        hasError = true;
      }

      if (!password) {
        if (pwdError) pwdError.textContent = "Vui lòng nhập mật khẩu.";
        hasError = true;
      } else if (password.length < 6) {
        if (pwdError) pwdError.textContent = "Mật khẩu phải có ít nhất 6 ký tự.";
        hasError = true;
      }

      if (hasError) return;

      const existingUser = typeof getCurrentUser === "function"
        ? getCurrentUser()
        : JSON.parse(localStorage.getItem("nexus_user"));

      const displayName = existingUser?.name || (email.includes("tuong") ? "Trần Tưởng" : email.split("@")[0]);

      const userData = {
        name: displayName,
        email: email,
        phone: existingUser?.phone || "",
        city: existingUser?.city || "TP. Hồ Chí Minh",
        district: existingUser?.district || "",
        address: existingUser?.address || "",
        joinedDate: existingUser?.joinedDate || "10/2026"
      };

      saveUserData(userData);

      if (typeof showToast === "function") {
        showToast(`Đăng nhập thành công! Chào mừng ${displayName}.`, "success");
      }

      initProfileState();
    });
  }

  /* --------------------------------------------------------------------------
  6. XỬ LÝ ĐĂNG KÝ ➔ CHUYỂN MÀN HÌNH NHẬP HỒ SƠ CHI TIẾT
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
      if (nameError) nameError.textContent = "";
      if (emailError) emailError.textContent = "";
      if (pwdError) pwdError.textContent = "";
      if (confirmError) confirmError.textContent = "";

      if (!name) {
        if (nameError) nameError.textContent = "Vui lòng nhập họ và tên.";
        hasError = true;
      } else if (typeof isValidName === "function" && !isValidName(name)) {
        if (nameError) nameError.textContent = "Họ tên cần ít nhất 2 từ tiếng Việt hợp lệ.";
        hasError = true;
      }

      if (!email) {
        if (emailError) emailError.textContent = "Vui lòng nhập địa chỉ email.";
        hasError = true;
      } else if (typeof isValidEmail === "function" && !isValidEmail(email)) {
        if (emailError) emailError.textContent = "Email không đúng định dạng.";
        hasError = true;
      }

      if (!password || password.length < 6) {
        if (pwdError) pwdError.textContent = "Mật khẩu tối thiểu 6 ký tự.";
        hasError = true;
      }

      if (password !== confirmPwd) {
        if (confirmError) confirmError.textContent = "Mật khẩu xác nhận không khớp.";
        hasError = true;
      }

      if (!termsCheck) {
        if (typeof showToast === "function") {
          showToast("Vui lòng đồng ý với Điều khoản dịch vụ.", "warning");
        }
        return;
      }

      if (hasError) return;

      const initialUser = {
        name: name,
        email: email,
        phone: "",
        city: "TP. Hồ Chí Minh",
        district: "",
        address: "",
        joinedDate: "10/2026"
      };

      saveUserData(initialUser);

      if (typeof showToast === "function") {
        showToast("Tạo tài khoản thành công! Vui lòng hoàn tất thông tin giao hàng.", "success");
      }

      form.hidden = true;
      const profileDetailsForm = document.getElementById("profileDetailsForm");
      if (profileDetailsForm) {
        profileDetailsForm.hidden = false;
        const detailName = document.getElementById("detailName");
        const detailEmail = document.getElementById("detailEmail");
        if (detailName) detailName.value = name;
        if (detailEmail) detailEmail.value = email;
      }

      const title = document.getElementById("authTitle");
      const subtitle = document.getElementById("authSubtitle");
      if (title) title.textContent = "Hoàn Tất Hồ Sơ";
      if (subtitle) subtitle.textContent = "Cung cấp thông tin nhận hàng để tối ưu thời gian khi thanh toán.";
    });
  }

  /* --------------------------------------------------------------------------
  7. XỬ LÝ FORM HOÀN TẤT HỒ SƠ CHI TIẾT
  -------------------------------------------------------------------------- */
  function initProfileDetailsForm() {
    const form = document.getElementById("profileDetailsForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("detailName").value.trim();
      const email = document.getElementById("detailEmail").value.trim();
      const phone = document.getElementById("detailPhone").value.trim();
      const city = document.getElementById("detailCity").value;
      const district = document.getElementById("detailDistrict").value.trim();
      const address = document.getElementById("detailAddress").value.trim();

      const phoneError = document.getElementById("detailPhoneError");
      const addressError = document.getElementById("detailAddressError");
      let hasError = false;

      if (phoneError) phoneError.textContent = "";
      if (addressError) addressError.textContent = "";

      if (!phone) {
        if (phoneError) phoneError.textContent = "Vui lòng nhập số điện thoại.";
        hasError = true;
      } else if (typeof isValidPhoneVN === "function" && !isValidPhoneVN(phone)) {
        if (phoneError) phoneError.textContent = "Số điện thoại Việt Nam không hợp lệ (10 số).";
        hasError = true;
      }

      if (!address) {
        if (addressError) addressError.textContent = "Vui lòng nhập địa chỉ nhận hàng.";
        hasError = true;
      }

      if (hasError) return;

      const fullUserData = {
        name: name,
        email: email,
        phone: phone,
        city: city,
        district: district,
        address: address,
        joinedDate: "10/2026"
      };

      saveUserData(fullUserData);

      if (typeof showToast === "function") {
        showToast("Đã lưu hồ sơ cá nhân thành công!", "success");
      }

      window.location.href = "index.html";
    });
  }

  /* --------------------------------------------------------------------------
  8. TRẠNG THÁI PROFILE KHI ĐÃ ĐĂNG NHẬP
  -------------------------------------------------------------------------- */
  function initProfileState() {
    const user = typeof getCurrentUser === "function"
      ? getCurrentUser()
      : JSON.parse(localStorage.getItem("nexus_user"));

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
      const phoneEl = document.getElementById("profilePhoneDisplay");
      const addressEl = document.getElementById("profileAddressDisplay");
      const avatarEl = document.getElementById("profileAvatar");

      if (nameEl) nameEl.textContent = user.name;
      if (emailEl) emailEl.textContent = user.email;
      if (phoneEl) phoneEl.textContent = user.phone ? `SĐT: ${user.phone}` : "Chưa cập nhật SĐT";
      if (addressEl) addressEl.textContent = user.address ? `Địa chỉ: ${user.address}, ${user.city}` : "Chưa cập nhật địa chỉ";

      if (avatarEl) {
        const initials = user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
        avatarEl.textContent = initials || "VR";
      }

      const editBtn = document.getElementById("profileEditBtn");
      if (editBtn) {
        editBtn.onclick = () => {
          profileCluster.hidden = true;
          formsCluster.hidden = false;
          const profileDetailsForm = document.getElementById("profileDetailsForm");
          const loginForm = document.getElementById("loginForm");
          const registerForm = document.getElementById("registerForm");

          if (loginForm) loginForm.hidden = true;
          if (registerForm) registerForm.hidden = true;
          if (profileDetailsForm) {
            profileDetailsForm.hidden = false;
            document.getElementById("detailName").value = user.name || "";
            document.getElementById("detailEmail").value = user.email || "";
            document.getElementById("detailPhone").value = user.phone || "";
            document.getElementById("detailCity").value = user.city || "TP. Hồ Chí Minh";
            document.getElementById("detailDistrict").value = user.district || "";
            document.getElementById("detailAddress").value = user.address || "";
          }

          const title = document.getElementById("authTitle");
          const subtitle = document.getElementById("authSubtitle");
          if (title) title.textContent = "Cập Nhật Hồ Sơ";
          if (subtitle) subtitle.textContent = "Thay đổi thông tin liên hệ và địa chỉ giao hàng của bạn.";
        };
      }

      const logoutBtn = document.getElementById("profileLogoutBtn");
      if (logoutBtn) {
        logoutBtn.onclick = () => {
          if (typeof clearCurrentUser === "function") {
            clearCurrentUser();
          } else {
            localStorage.removeItem("nexus_user");
          }
          if (typeof updateUserState === "function") updateUserState();
          window.dispatchEvent(new CustomEvent("nexus:user-updated"));

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
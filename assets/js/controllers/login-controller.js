/* ==========================================================================
NEXUS VR — controllers/login-controller.js   [PHỤ TRÁCH: Tưởng]
TẦNG 3 - CONTROLLERS: ĐĂNG NHẬP / ĐĂNG KÝ / QUẢN LÝ HỒ SƠ TÀI KHOẢN
========================================================================== */
(function () {
  "use strict";

  const REGISTERED_USERS_KEY = "nexus_registered_users";
  let currentUploadedAvatar = "";

  document.addEventListener("DOMContentLoaded", initLoginController);
  if (document.readyState === "interactive" || document.readyState === "complete") {
    initLoginController();
  }

  function initLoginController() {
    if (window.__nexusLoginInitialized) return;
    window.__nexusLoginInitialized = true;

    initAuthTabs();
    initPasswordToggles();
    initAvatarUploader();
    initAddressCascading();
    initDemoAccountFiller();
    initLoginForm();
    initRegisterForm();
    initProfileDetailsForm();
    initProfileState();
  }

  function getRegisteredUsers() {
    try {
      return JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveRegisteredUsers(users) {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  }

  function initAuthTabs() {
    const tabLogin = document.getElementById("tabLoginBtn");
    const tabRegister = document.getElementById("tabRegisterBtn");
    const formLogin = document.getElementById("loginForm");
    const formRegister = document.getElementById("registerForm");
    const formDetails = document.getElementById("profileDetailsForm");
    const tabsCluster = document.getElementById("authTabsCluster");
    const title = document.getElementById("authTitle");
    const subtitle = document.getElementById("authSubtitle");

    if (!tabLogin || !tabRegister || !formLogin || !formRegister) return;

    tabLogin.addEventListener("click", () => {
      tabLogin.classList.add("is-active");
      tabRegister.classList.remove("is-active");

      formLogin.hidden = false;
      formRegister.hidden = true;
      if (formDetails) formDetails.hidden = true;
      if (tabsCluster) tabsCluster.hidden = false;

      if (title) title.textContent = "Đăng Nhập";
      if (subtitle) subtitle.textContent = "Chào mừng bạn quay lại với không gian điện toán NEXUS.";
    });

    tabRegister.addEventListener("click", () => {
      tabRegister.classList.add("is-active");
      tabLogin.classList.remove("is-active");

      formRegister.hidden = false;
      formLogin.hidden = true;
      if (formDetails) formDetails.hidden = true;
      if (tabsCluster) tabsCluster.hidden = false;

      if (title) title.textContent = "Tạo Tài Khoản";
      if (subtitle) subtitle.textContent = "Trải nghiệm đặc quyền điện toán không gian cao cấp.";
    });
  }

  function initPasswordToggles() {
    const toggleBtns = document.querySelectorAll(".auth-toggle-pwd");
    toggleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        const input = document.getElementById(targetId);
        if (!input) return;

        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";

        const svg = btn.querySelector("svg");
        if (svg) {
          svg.innerHTML = isPassword
            ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`
            : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
        }
      });
    });
  }

  function initAvatarUploader() {
    const fileInput = document.getElementById("avatarFileInput");
    const previewImg = document.getElementById("avatarPreviewImg");

    if (!fileInput || !previewImg) return;

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        if (typeof window.showToast === "function") window.showToast("Vui lòng chọn file hình ảnh hợp lệ.", "warning");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        currentUploadedAvatar = event.target.result;
        previewImg.src = currentUploadedAvatar;
        if (typeof window.showToast === "function") window.showToast("Đã chọn ảnh đại diện!", "info");
      };
      reader.readAsDataURL(file);
    });
  }

  function initAddressCascading() {
    if (window.AddressManager && typeof window.AddressManager.initAddressCascade === "function") {
      window.AddressManager.initAddressCascade("detailProvince", "detailWard");
    }
  }

  function initDemoAccountFiller() {
    const demoBtn = document.getElementById("fillDemoBtn");
    if (!demoBtn) return;

    demoBtn.addEventListener("click", () => {
      const tabLogin = document.getElementById("tabLoginBtn");
      if (tabLogin) tabLogin.click();

      const demoUser = {
        account: "tuong@nexus.com",
        password: "123456",
        name: "Trần Tưởng",
        email: "tuong@nexus.com",
        phone: "0379732971",
        province: "Tỉnh Vĩnh Long",
        ward: "Phường 2",
        address: "hihih",
        avatar: "",
        joinedDate: "10/2026"
      };

      const registeredUsers = getRegisteredUsers();
      if (!registeredUsers.some(u => u.account === demoUser.account)) {
        registeredUsers.push(demoUser);
        saveRegisteredUsers(registeredUsers);
      }

      const accountInput = document.getElementById("loginAccount");
      const pwdInput = document.getElementById("loginPassword");
      if (accountInput && pwdInput) {
        accountInput.value = demoUser.account;
        pwdInput.value = demoUser.password;
      }

      if (typeof window.showToast === "function") {
        window.showToast("Đã nạp tài khoản mẫu: tuong@nexus.com / 123456", "info");
      }
    });
  }

  function saveCurrentSession(userData) {
    if (typeof window.saveCurrentUser === "function") {
      window.saveCurrentUser(userData);
    } else {
      localStorage.setItem("nexus_user", JSON.stringify(userData));
    }
    if (typeof window.updateUserState === "function") window.updateUserState();
    window.dispatchEvent(new CustomEvent("nexus:user-updated"));
  }

  function initLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const accountInput = document.getElementById("loginAccount");
      const pwdInput = document.getElementById("loginPassword");
      if (!accountInput || !pwdInput) return;

      const accountVal = accountInput.value.trim();
      const passwordVal = pwdInput.value;
      const accountError = document.getElementById("loginAccountError");
      const pwdError = document.getElementById("loginPasswordError");

      if (accountError) accountError.textContent = "";
      if (pwdError) pwdError.textContent = "";

      let hasError = false;
      if (!accountVal) {
        if (accountError) accountError.textContent = "Vui lòng nhập tài khoản.";
        hasError = true;
      }
      if (!passwordVal) {
        if (pwdError) pwdError.textContent = "Vui lòng nhập mật khẩu.";
        hasError = true;
      }

      if (hasError) return;

      const registeredUsers = getRegisteredUsers();
      const matchedUser = registeredUsers.find(
        (u) => (u.account === accountVal || u.email === accountVal || u.phone === accountVal) && u.password === passwordVal
      );

      if (!matchedUser) {
        if (accountError) accountError.textContent = "Tài khoản hoặc mật khẩu không chính xác.";
        if (typeof window.showToast === "function") window.showToast("Tài khoản chưa đăng ký hoặc sai mật khẩu!", "error");
        return;
      }

      saveCurrentSession(matchedUser);

      if (typeof window.showToast === "function") {
        window.showToast(`Đăng nhập thành công! Chào mừng ${matchedUser.name}.`, "success");
      }

      initProfileState();
    });
  }

  function initRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const accountInput = document.getElementById("registerAccount");
      const pwdInput = document.getElementById("registerPassword");
      const confirmInput = document.getElementById("registerConfirmPassword");

      if (!accountInput || !pwdInput || !confirmInput) return;

      const accountVal = accountInput.value.trim();
      const passwordVal = pwdInput.value;
      const confirmVal = confirmInput.value;

      const accountError = document.getElementById("registerAccountError");
      const pwdError = document.getElementById("registerPasswordError");
      const confirmError = document.getElementById("registerConfirmError");

      if (accountError) accountError.textContent = "";
      if (pwdError) pwdError.textContent = "";
      if (confirmError) confirmError.textContent = "";

      let hasError = false;
      if (!accountVal) {
        if (accountError) accountError.textContent = "Vui lòng nhập tài khoản.";
        hasError = true;
      }
      if (!passwordVal || passwordVal.length < 6) {
        if (pwdError) pwdError.textContent = "Mật khẩu tối thiểu 6 ký tự.";
        hasError = true;
      }
      if (passwordVal !== confirmVal) {
        if (confirmError) confirmError.textContent = "Mật khẩu xác nhận không khớp.";
        hasError = true;
      }

      if (hasError) return;

      const registeredUsers = getRegisteredUsers();
      if (registeredUsers.some((u) => u.account === accountVal || u.email === accountVal || u.phone === accountVal)) {
        if (accountError) accountError.textContent = "Tài khoản này đã được đăng ký.";
        return;
      }

      const isEmail = accountVal.includes("@");
      const isPhone = /^[0-9]{9,11}$/.test(accountVal);

      const newUser = {
        account: accountVal,
        password: passwordVal,
        name: isEmail ? accountVal.split("@")[0] : accountVal,
        email: isEmail ? accountVal : "",
        phone: isPhone ? accountVal : "",
        gender: "Nam",
        province: "",
        ward: "",
        address: "",
        avatar: "",
        joinedDate: "10/2026"
      };

      registeredUsers.push(newUser);
      saveRegisteredUsers(registeredUsers);
      saveCurrentSession(newUser);

      if (typeof window.showToast === "function") window.showToast("Đăng ký tài khoản thành công! Hãy hoàn tất thông tin cá nhân.", "success");

      form.hidden = true;
      const tabsCluster = document.getElementById("authTabsCluster");
      if (tabsCluster) tabsCluster.hidden = true;

      const profileDetailsForm = document.getElementById("profileDetailsForm");
      if (profileDetailsForm) {
        profileDetailsForm.hidden = false;
        const nameEl = document.getElementById("detailName");
        const emailEl = document.getElementById("detailEmail");
        const phoneEl = document.getElementById("detailPhone");

        if (nameEl) nameEl.value = newUser.name;
        if (emailEl && isEmail) emailEl.value = accountVal;
        if (phoneEl && isPhone) phoneEl.value = accountVal;
      }

      const title = document.getElementById("authTitle");
      const subtitle = document.getElementById("authSubtitle");
      if (title) title.textContent = "Hoàn Tất Hồ Sơ";
      if (subtitle) subtitle.textContent = "Cập nhật địa chỉ nhận hàng và thông tin cá nhân.";
    });
  }

  function initProfileDetailsForm() {
    const form = document.getElementById("profileDetailsForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("detailName")?.value.trim() || "";
      const phone = document.getElementById("detailPhone")?.value.trim() || "";
      const email = document.getElementById("detailEmail")?.value.trim() || "";
      const gender = document.getElementById("detailGender")?.value || "Nam";
      const province = document.getElementById("detailProvince")?.value || "";
      const ward = document.getElementById("detailWard")?.value || "";
      const address = document.getElementById("detailAddress")?.value.trim() || "";

      const nameErr = document.getElementById("detailNameError");
      const phoneErr = document.getElementById("detailPhoneError");
      const provinceErr = document.getElementById("detailProvinceError");
      const addressErr = document.getElementById("detailAddressError");

      if (nameErr) nameErr.textContent = "";
      if (phoneErr) phoneErr.textContent = "";
      if (provinceErr) provinceErr.textContent = "";
      if (addressErr) addressErr.textContent = "";

      let hasError = false;
      if (!name) {
        if (nameErr) nameErr.textContent = "Vui lòng nhập họ và tên.";
        hasError = true;
      }
      if (!phone) {
        if (phoneErr) phoneErr.textContent = "Vui lòng nhập số điện thoại.";
        hasError = true;
      }
      if (!province) {
        if (provinceErr) provinceErr.textContent = "Vui lòng chọn Tỉnh / Thành phố.";
        hasError = true;
      }
      if (!address) {
        if (addressErr) addressErr.textContent = "Vui lòng nhập địa chỉ chi tiết.";
        hasError = true;
      }

      if (hasError) return;

      const currentSession = typeof window.getCurrentUser === "function"
        ? window.getCurrentUser()
        : JSON.parse(localStorage.getItem("nexus_user") || "{}");

      const updatedUser = {
        ...currentSession,
        name: name,
        phone: phone,
        email: email,
        gender: gender,
        province: province,
        ward: ward,
        address: address,
        avatar: currentUploadedAvatar || currentSession.avatar || ""
      };

      const registeredUsers = getRegisteredUsers();
      const idx = registeredUsers.findIndex(u => u.account === updatedUser.account || u.email === updatedUser.email);
      if (idx !== -1) {
        registeredUsers[idx] = updatedUser;
        saveRegisteredUsers(registeredUsers);
      }

      saveCurrentSession(updatedUser);

      if (typeof window.showToast === "function") window.showToast("Đã lưu hồ sơ cá nhân thành công!", "success");

      initProfileState();
    });
  }

  function initProfileState() {
    const user = typeof window.getCurrentUser === "function"
      ? window.getCurrentUser()
      : JSON.parse(localStorage.getItem("nexus_user") || "null");

    const formsCluster = document.getElementById("authFormsCluster");
    const profileCluster = document.getElementById("authProfileCluster");
    const tabsCluster = document.getElementById("authTabsCluster");
    const profileDetailsForm = document.getElementById("profileDetailsForm");

    if (!formsCluster || !profileCluster) return;

    // Kiểm tra xem Form Cập nhật hồ sơ có đang mở hay không
    const isEditingProfile = profileDetailsForm && !profileDetailsForm.hidden;

    // Ẩn lập tức cụm tab Đăng nhập / Đăng ký nếu đang mở form Hồ sơ
    if (isEditingProfile) {
      if (tabsCluster) tabsCluster.hidden = true;
    }

    if (user && (user.name || user.account || user.email)) {
      formsCluster.hidden = true;
      profileCluster.hidden = false;
      if (tabsCluster) tabsCluster.hidden = true;

      const title = document.getElementById("authTitle");
      const subtitle = document.getElementById("authSubtitle");
      if (title) title.textContent = "Hồ Sơ Cá Nhân";
      if (subtitle) subtitle.textContent = "Thông tin tài khoản và địa chỉ giao hàng mặc định.";

      const greetingEl = document.getElementById("profileGreetingHeader");
      const emailEl = document.getElementById("profileEmail");
      const phoneEl = document.getElementById("profilePhoneDisplay");
      const addressEl = document.getElementById("profileAddressDisplay");
      const avatarImgEl = document.getElementById("profileAvatarImg");
      const avatarTextEl = document.getElementById("profileAvatarText");

      if (greetingEl) greetingEl.textContent = `Hi, ${user.name || user.account}`;
      if (emailEl) emailEl.textContent = user.email || user.account;
      if (phoneEl) phoneEl.textContent = user.phone ? `SĐT: ${user.phone}` : "";

      const fullAddr = [user.address, user.ward, user.province].filter(Boolean).join(", ");
      if (addressEl) addressEl.textContent = fullAddr ? `Địa chỉ: ${fullAddr}` : "";

      if (user.avatar) {
        if (avatarImgEl) {
          avatarImgEl.src = user.avatar;
          avatarImgEl.hidden = false;
        }
        if (avatarTextEl) avatarTextEl.hidden = true;
      } else {
        if (avatarImgEl) avatarImgEl.hidden = true;
        if (avatarTextEl) {
          avatarTextEl.hidden = false;
          const initials = (user.name || "VR").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
          avatarTextEl.textContent = initials;
        }
      }

      const editBtn = document.getElementById("profileEditBtn");
      if (editBtn) {
        editBtn.onclick = () => {
          profileCluster.hidden = true;
          formsCluster.hidden = false;
          if (tabsCluster) tabsCluster.hidden = true; // ẨN KHÓA TAB

          const loginForm = document.getElementById("loginForm");
          const registerForm = document.getElementById("registerForm");

          if (loginForm) loginForm.hidden = true;
          if (registerForm) registerForm.hidden = true;
          if (profileDetailsForm) {
            profileDetailsForm.hidden = false;
            document.getElementById("detailName").value = user.name || "";
            document.getElementById("detailPhone").value = user.phone || "";
            document.getElementById("detailEmail").value = user.email || "";
            document.getElementById("detailGender").value = user.gender || "Nam";
            document.getElementById("detailAddress").value = user.address || "";

            if (window.AddressManager) {
              window.AddressManager.populateProvinceSelect(document.getElementById("detailProvince"), user.province);
              if (user.province) {
                window.AddressManager.populateWardSelect(document.getElementById("detailWard"), user.province, user.ward);
              }
            }
          }

          if (title) title.textContent = "Cập Nhật Hồ Sơ";
          if (subtitle) subtitle.textContent = "Thay đổi thông tin liên hệ và địa chỉ giao hàng.";
        };
      }

      const logoutBtn = document.getElementById("profileLogoutBtn");
      if (logoutBtn) {
        logoutBtn.onclick = () => {
          if (typeof window.clearCurrentUser === "function") {
            window.clearCurrentUser();
          } else {
            localStorage.removeItem("nexus_user");
          }
          if (typeof window.updateUserState === "function") window.updateUserState();
          window.dispatchEvent(new CustomEvent("nexus:user-updated"));

          if (typeof window.showToast === "function") window.showToast("Đã đăng xuất tài khoản.", "info");

          profileCluster.hidden = true;
          formsCluster.hidden = false;
          if (tabsCluster) tabsCluster.hidden = false;

          const tabLogin = document.getElementById("tabLoginBtn");
          if (tabLogin) tabLogin.click();
        };
      }
    } else {
      if (isEditingProfile) {
        if (tabsCluster) tabsCluster.hidden = true;
      } else {
        formsCluster.hidden = false;
        profileCluster.hidden = true;
        if (tabsCluster) tabsCluster.hidden = false;

        const title = document.getElementById("authTitle");
        const subtitle = document.getElementById("authSubtitle");
        if (title) title.textContent = "Đăng Nhập";
        if (subtitle) subtitle.textContent = "Chào mừng bạn quay lại với không gian điện toán NEXUS.";

        const tabLogin = document.getElementById("tabLoginBtn");
        if (tabLogin) tabLogin.click();
      }
    }
  }
})();
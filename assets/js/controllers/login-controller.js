/* ==========================================================================
NEXUS VR — controllers/login-controller.js   [PHỤ TRÁCH: Tưởng]
TẦNG 3 - CONTROLLERS: ĐĂNG NHẬP / ĐĂNG KÝ / UPLOAD AVATAR / CẬP NHẬT HỒ SƠ 2 CẤP
========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", initLoginController);
  if (document.readyState === "interactive" || document.readyState === "complete") {
    initLoginController();
  }

  let currentUploadedAvatar = "";

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
    toggleBtns.forEach((btn) => {
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
  3. UPLOAD ÁNH ĐẠI DIỆN TỪ THIẾT BỊ (READ AS DATA URL)
  -------------------------------------------------------------------------- */
  function initAvatarUploader() {
    const fileInput = document.getElementById("avatarFileInput");
    const previewImg = document.getElementById("avatarPreviewImg");

    if (!fileInput || !previewImg) return;

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        if (typeof window.showToast === "function") {
          window.showToast("Vui lòng chọn file hình ảnh hợp lệ.", "warning");
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        currentUploadedAvatar = event.target.result;
        previewImg.src = currentUploadedAvatar;
        if (typeof window.showToast === "function") {
          window.showToast("Đã chọn ảnh đại diện mới!", "info");
        }
      };
      reader.readAsDataURL(file);
    });
  }

  /* --------------------------------------------------------------------------
  4. KHỞI TẠO ĐỊA CHÍNH 2 CẤP (34 TỈNH THÀNH -> PHƯỜNG XÃ)
  -------------------------------------------------------------------------- */
  function initAddressCascading() {
    if (window.AddressManager && typeof window.AddressManager.initAddressCascade === "function") {
      window.AddressManager.initAddressCascade("detailProvince", "detailWard");
    }
  }

  /* --------------------------------------------------------------------------
  5. ĐIỀN TÀI KHOẢN TEST DEMO (1-CLICK)
  -------------------------------------------------------------------------- */
  function initDemoAccountFiller() {
    const demoBtn = document.getElementById("fillDemoBtn");
    if (!demoBtn) return;

    demoBtn.addEventListener("click", () => {
      const tabLogin = document.getElementById("tabLoginBtn");
      if (tabLogin) tabLogin.click();

      const accountInput = document.getElementById("loginAccount");
      const pwdInput = document.getElementById("loginPassword");

      if (accountInput && pwdInput) {
        accountInput.value = "tuong@nexus.com";
        pwdInput.value = "123456";

        const demoUserData = {
          name: "Trần Tưởng",
          account: "tuong@nexus.com",
          email: "tuong@nexus.com",
          phone: "0988123456",
          gender: "Nam",
          province: "TP. Hồ Chí Minh",
          ward: "Phường Bến Nghé",
          address: "Số 123 Nguyễn Huệ",
          avatar: "",
          joinedDate: "10/2026"
        };

        saveUserData(demoUserData);

        if (typeof window.showToast === "function") {
          window.showToast("Đã điền tài khoản mẫu Tưởng (tuong@nexus.com)", "info");
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
  6. HÀM LƯU DỮ LIỆU & BẮT SỰ KIỆN CẬP NHẬT HEADER NAVBAR
  -------------------------------------------------------------------------- */
  function saveUserData(userData) {
    if (typeof window.saveCurrentUser === "function") {
      window.saveCurrentUser(userData);
    } else {
      localStorage.setItem("nexus_user", JSON.stringify(userData));
    }
    if (typeof window.updateUserState === "function") {
      window.updateUserState();
    }
    window.dispatchEvent(new CustomEvent("nexus:user-updated"));
  }

  /* --------------------------------------------------------------------------
  7. XỬ LÝ ĐĂNG NHẬP
  -------------------------------------------------------------------------- */
  function initLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const accountInput = document.getElementById("loginAccount");
      const pwdInput = document.getElementById("loginPassword");
      if (!accountInput || !pwdInput) return;

      const account = accountInput.value.trim();
      const password = pwdInput.value;
      const accountError = document.getElementById("loginAccountError");
      const pwdError = document.getElementById("loginPasswordError");
      let hasError = false;

      if (accountError) accountError.textContent = "";
      if (pwdError) pwdError.textContent = "";

      if (!account) {
        if (accountError) accountError.textContent = "Vui lòng nhập Email, SĐT hoặc Tên tài khoản.";
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

      const existingUser = typeof window.getCurrentUser === "function"
        ? window.getCurrentUser()
        : JSON.parse(localStorage.getItem("nexus_user") || "null");

      const displayName = existingUser?.name || (account.includes("tuong") ? "Trần Tưởng" : account.split("@")[0]);

      const userData = {
        name: displayName,
        account: account,
        email: existingUser?.email || (account.includes("@") ? account : `${account}@nexus.com`),
        phone: existingUser?.phone || (!account.includes("@") ? account : ""),
        gender: existingUser?.gender || "Nam",
        province: existingUser?.province || "TP. Hồ Chí Minh",
        ward: existingUser?.ward || "Phường Bến Nghé",
        address: existingUser?.address || "Số 123 Nguyễn Huệ",
        avatar: existingUser?.avatar || "",
        joinedDate: existingUser?.joinedDate || "10/2026"
      };

      saveUserData(userData);

      if (typeof window.showToast === "function") {
        window.showToast(`Đăng nhập thành công! Chào mừng ${displayName}.`, "success");
      }

      initProfileState();
    });
  }

  /* --------------------------------------------------------------------------
  8. XỬ LÝ ĐĂNG KÝ -> TỰ ĐỘNG CHUYỂN SANG ĐIỀN HỒ SƠ CHI TIẾT
  -------------------------------------------------------------------------- */
  function initRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const accountInput = document.getElementById("registerAccount");
      const pwdInput = document.getElementById("registerPassword");
      const confirmInput = document.getElementById("registerConfirmPassword");
      const termsInput = document.getElementById("registerTerms");

      if (!accountInput || !pwdInput || !confirmInput) return;

      const account = accountInput.value.trim();
      const password = pwdInput.value;
      const confirmPwd = confirmInput.value;
      const termsCheck = termsInput ? termsInput.checked : true;

      const accountError = document.getElementById("registerAccountError");
      const pwdError = document.getElementById("registerPasswordError");
      const confirmError = document.getElementById("registerConfirmError");

      let hasError = false;
      if (accountError) accountError.textContent = "";
      if (pwdError) pwdError.textContent = "";
      if (confirmError) confirmError.textContent = "";

      if (!account) {
        if (accountError) accountError.textContent = "Vui lòng nhập Email, SĐT hoặc Tên tài khoản.";
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
        if (typeof window.showToast === "function") {
          window.showToast("Vui lòng đồng ý với Điều khoản dịch vụ.", "warning");
        }
        return;
      }

      if (hasError) return;

      // Phân loại tự động thông tin nhập
      const isEmail = account.includes("@");
      const isPhone = /^[0-9]{9,11}$/.test(account);

      const initialUser = {
        name: isEmail ? account.split("@")[0] : account,
        account: account,
        email: isEmail ? account : "",
        phone: isPhone ? account : "",
        gender: "Nam",
        province: "",
        ward: "",
        address: "",
        avatar: "",
        joinedDate: "10/2026"
      };

      saveUserData(initialUser);

      if (typeof window.showToast === "function") {
        window.showToast("Tạo tài khoản thành công! Vui lòng hoàn tất thông tin cá nhân.", "success");
      }

      // Chuyển sang Form nhập Hồ sơ chi tiết
      form.hidden = true;
      const profileDetailsForm = document.getElementById("profileDetailsForm");
      if (profileDetailsForm) {
        profileDetailsForm.hidden = false;

        const emailEl = document.getElementById("detailEmail");
        const phoneEl = document.getElementById("detailPhone");
        const nameEl = document.getElementById("detailName");

        if (emailEl && isEmail) emailEl.value = account;
        if (phoneEl && isPhone) phoneEl.value = account;
        if (nameEl) nameEl.value = initialUser.name;
      }

      const title = document.getElementById("authTitle");
      const subtitle = document.getElementById("authSubtitle");
      if (title) title.textContent = "Hoàn Tất Hồ Sơ";
      if (subtitle) subtitle.textContent = "Cập nhật ảnh đại diện và địa chỉ nhận hàng để trải nghiệm mua sắm nhanh chóng.";
    });
  }

  /* --------------------------------------------------------------------------
  9. XỬ LÝ FORM HOÀN TẤT HỒ SƠ CHI TIẾT
  -------------------------------------------------------------------------- */
  function initProfileDetailsForm() {
    const form = document.getElementById("profileDetailsForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("detailName");
      const phoneInput = document.getElementById("detailPhone");
      const emailInput = document.getElementById("detailEmail");
      const genderInput = document.getElementById("detailGender");
      const provinceInput = document.getElementById("detailProvince");
      const wardInput = document.getElementById("detailWard");
      const addressInput = document.getElementById("detailAddress");

      const name = nameInput ? nameInput.value.trim() : "";
      const phone = phoneInput ? phoneInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const gender = genderInput ? genderInput.value : "Nam";
      const province = provinceInput ? provinceInput.value : "";
      const ward = wardInput ? wardInput.value : "";
      const address = addressInput ? addressInput.value.trim() : "";

      const nameErr = document.getElementById("detailNameError");
      const phoneErr = document.getElementById("detailPhoneError");
      const provinceErr = document.getElementById("detailProvinceError");
      const wardErr = document.getElementById("detailWardError");
      const addressErr = document.getElementById("detailAddressError");

      let hasError = false;
      if (nameErr) nameErr.textContent = "";
      if (phoneErr) phoneErr.textContent = "";
      if (provinceErr) provinceErr.textContent = "";
      if (wardErr) wardErr.textContent = "";
      if (addressErr) addressErr.textContent = "";

      if (!name) {
        if (nameErr) nameErr.textContent = "Vui lòng nhập họ và tên.";
        hasError = true;
      }

      if (!phone) {
        if (phoneErr) phoneErr.textContent = "Vui lòng nhập số điện thoại giao hàng.";
        hasError = true;
      }

      if (!province) {
        if (provinceErr) provinceErr.textContent = "Vui lòng chọn Tỉnh / Thành phố.";
        hasError = true;
      }

      if (!ward) {
        if (wardErr) wardErr.textContent = "Vui lòng chọn Phường / Xã.";
        hasError = true;
      }

      if (!address) {
        if (addressErr) addressErr.textContent = "Vui lòng nhập địa chỉ chi tiết.";
        hasError = true;
      }

      if (hasError) return;

      const existingUser = typeof window.getCurrentUser === "function"
        ? window.getCurrentUser()
        : JSON.parse(localStorage.getItem("nexus_user") || "{}");

      const fullUserData = {
        ...existingUser,
        name: name,
        phone: phone,
        email: email,
        gender: gender,
        province: province,
        ward: ward,
        address: address,
        avatar: currentUploadedAvatar || existingUser.avatar || ""
      };

      saveUserData(fullUserData);

      if (typeof window.showToast === "function") {
        window.showToast("Cập nhật hồ sơ cá nhân thành công!", "success");
      }

      initProfileState();
    });
  }

  /* --------------------------------------------------------------------------
  10. HIỂN THỊ TRẠNG THÁI PROFILE KHI ĐÃ ĐĂNG NHẬP
  -------------------------------------------------------------------------- */
  function initProfileState() {
    const user = typeof window.getCurrentUser === "function"
      ? window.getCurrentUser()
      : JSON.parse(localStorage.getItem("nexus_user") || "null");

    const formsCluster = document.getElementById("authFormsCluster");
    const profileCluster = document.getElementById("authProfileCluster");
    const tabsCluster = document.getElementById("authTabsCluster");

    if (!formsCluster || !profileCluster) return;

    if (user && (user.name || user.account)) {
      if (tabsCluster) tabsCluster.hidden = true;
      formsCluster.hidden = true;
      profileCluster.hidden = false;

      const greetingEl = document.getElementById("profileGreetingHeader");
      const emailEl = document.getElementById("profileEmail");
      const phoneEl = document.getElementById("profilePhoneDisplay");
      const addressEl = document.getElementById("profileAddressDisplay");
      const avatarImgEl = document.getElementById("profileAvatarImg");
      const avatarTextEl = document.getElementById("profileAvatarText");

      if (greetingEl) greetingEl.textContent = `Hi, ${user.name || user.account}`;
      if (emailEl) emailEl.textContent = user.email || user.account || "";
      if (phoneEl) phoneEl.textContent = user.phone ? `SĐT: ${user.phone}` : "Chưa cập nhật SĐT";

      const fullAddr = [user.address, user.ward, user.province].filter(Boolean).join(", ");
      if (addressEl) addressEl.textContent = fullAddr ? `Địa chỉ: ${fullAddr}` : "Chưa cập nhật địa chỉ giao hàng";

      // Hiển thị Avatar ảnh upload hoặc chữ cái initials
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
          const initials = (user.name || user.account || "VR")
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          avatarTextEl.textContent = initials || "VR";
        }
      }

      // Nút Chỉnh sửa thông tin
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

            const nameEl = document.getElementById("detailName");
            const phoneEl = document.getElementById("detailPhone");
            const emailEl = document.getElementById("detailEmail");
            const genderEl = document.getElementById("detailGender");
            const provinceEl = document.getElementById("detailProvince");
            const wardEl = document.getElementById("detailWard");
            const addressEl = document.getElementById("detailAddress");
            const previewImg = document.getElementById("avatarPreviewImg");

            if (nameEl) nameEl.value = user.name || "";
            if (phoneEl) phoneEl.value = user.phone || "";
            if (emailEl) emailEl.value = user.email || "";
            if (genderEl) genderEl.value = user.gender || "Nam";
            if (addressEl) addressEl.value = user.address || "";

            if (user.avatar && previewImg) {
              previewImg.src = user.avatar;
              currentUploadedAvatar = user.avatar;
            }

            if (window.AddressManager && provinceEl && wardEl) {
              window.AddressManager.populateProvinceSelect(provinceEl, user.province);
              if (user.province) {
                window.AddressManager.populateWardSelect(wardEl, user.province, user.ward);
              }
            }
          }

          const title = document.getElementById("authTitle");
          const subtitle = document.getElementById("authSubtitle");
          if (title) title.textContent = "Cập Nhật Hồ Sơ";
          if (subtitle) subtitle.textContent = "Thay đổi thông tin liên hệ, địa chỉ giao hàng và ảnh đại diện.";
        };
      }

      // Nút Đăng xuất
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
      if (tabsCluster) tabsCluster.hidden = false;
      formsCluster.hidden = false;
      profileCluster.hidden = true;
    }
  }
})();
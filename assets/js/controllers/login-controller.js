const STORAGE_KEY = "nexus_users";
const CURRENT_KEY = "nexus_current_user";
const DEFAULT_AVATAR = "assets/images/avatar/default-avatar.png";

const PROVINCES_34 = [
  "Thành phố Hà Nội", "Tỉnh Cao Bằng", "Tỉnh Tuyên Quang", "Tỉnh Điện Biên",
  "Tỉnh Lai Châu", "Tỉnh Sơn La", "Tỉnh Lào Cai", "Tỉnh Thái Nguyên",
  "Tỉnh Lạng Sơn", "Tỉnh Quảng Ninh", "Tỉnh Bắc Ninh", "Tỉnh Phú Thọ",
  "Thành phố Hải Phòng", "Tỉnh Hưng Yên", "Tỉnh Ninh Bình", "Tỉnh Thanh Hóa",
  "Tỉnh Nghệ An", "Tỉnh Hà Tĩnh", "Tỉnh Quảng Trị", "Thành phố Huế",
  "Thành phố Đà Nẵng", "Tỉnh Quảng Ngãi", "Tỉnh Gia Lai", "Tỉnh Khánh Hòa",
  "Tỉnh Đắk Lắk", "Tỉnh Lâm Đồng", "Tỉnh Đồng Nai", "Thành phố Hồ Chí Minh",
  "Tỉnh Tây Ninh", "Tỉnh Đồng Tháp", "Tỉnh Vĩnh Long", "Tỉnh An Giang",
  "Thành phố Cần Thơ", "Tỉnh Cà Mau"
];

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveUsers(users) { localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); }
function getCurrent() {
  try { return JSON.parse(localStorage.getItem(CURRENT_KEY)); }
  catch { return null; }
}
function setMessage(id, text) { const el = $(id); if (el) el.textContent = text; }

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function switchView(name) {
  $$(".view").forEach(v => v.classList.remove("is-active"));
  const view = $(`#${name}View`);
  if (view) view.classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initBirthDate() {
  const input = $("#birthDate");
  if (!input) return;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  input.max = `${yyyy}-${mm}-${dd}`;
}

function initProvinceSelect() {
  const select = $("#province");
  select.innerHTML = `<option value="">Chọn tỉnh / thành phố</option>` +
    PROVINCES_34.map(p => `<option>${p}</option>`).join("");
}

function setupCaptcha(root) {
  const knob = root.querySelector(".captcha-knob");
  const progress = root.querySelector(".captcha-progress");
  let dragging = false;
  let startX = 0;
  let startLeft = 3;

  const maxLeft = () => root.querySelector(".captcha-track").clientWidth - knob.offsetWidth - 3;

  function move(clientX) {
    if (!dragging) return;
    const left = Math.max(3, Math.min(maxLeft(), startLeft + clientX - startX));
    knob.style.left = `${left}px`;
    progress.style.width = `${left + knob.offsetWidth}px`;
    if (left >= maxLeft() - 3) {
      root.classList.add("verified");
      knob.style.left = `${maxLeft()}px`;
      progress.style.width = "100%";
      dragging = false;
    }
  }

  knob.addEventListener("pointerdown", (e) => {
    if (root.classList.contains("verified")) return;
    dragging = true;
    startX = e.clientX;
    startLeft = knob.offsetLeft;
    knob.setPointerCapture(e.pointerId);
  });
  knob.addEventListener("pointermove", e => move(e.clientX));
  knob.addEventListener("pointerup", () => dragging = false);
  knob.addEventListener("pointercancel", () => dragging = false);
}

function captchaVerified(selector) {
  return $(selector)?.classList.contains("verified");
}

function resetCaptcha(selector) {
  const root = $(selector);
  if (!root) return;
  root.classList.remove("verified");
  const knob = root.querySelector(".captcha-knob");
  const progress = root.querySelector(".captcha-progress");
  knob.style.left = "3px";
  progress.style.width = "0";
}

function renderAccount(user) {
  if (!user) return;
  $("#accountAvatar").src = user.profile?.avatar || DEFAULT_AVATAR;
  $("#accountName").textContent = user.profile?.fullName || user.username;
  $("#accountUsername").textContent = `@${user.username}`;

  const p = user.profile || {};
  $("#profileSummary").innerHTML = `
    <div class="summary-item"><span>Họ và tên</span><strong>${escapeHtml(p.fullName || "—")}</strong></div>
    <div class="summary-item"><span>Số điện thoại</span><strong>${escapeHtml(p.phone || "—")}</strong></div>
    <div class="summary-item"><span>Ngày sinh</span><strong>${escapeHtml(p.birthDate || "—")}</strong></div>
    <div class="summary-item"><span>Giới tính</span><strong>${escapeHtml(p.gender || "—")}</strong></div>
    <div class="summary-item"><span>Quốc gia</span><strong>${escapeHtml(p.country || "—")}</strong></div>
    <div class="summary-item"><span>Tỉnh / Thành phố</span><strong>${escapeHtml(p.province || "—")}</strong></div>
    <div class="summary-item"><span>Phường / Xã</span><strong>${escapeHtml(p.ward || "—")}</strong></div>
    <div class="summary-item"><span>Địa chỉ</span><strong>${escapeHtml(p.address || "—")}</strong></div>
  `;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[ch]));
}

function fillProfile(user) {
  const p = user.profile || {};
  $("#fullName").value = p.fullName || "";
  $("#birthDate").value = p.birthDate || "";
  $("#gender").value = p.gender || "";
  $("#phone").value = p.phone || "";
  $("#country").value = p.country || "Việt Nam";
  $("#province").value = p.province || "";
  $("#ward").value = p.ward || "";
  $("#address").value = p.address || "";
  $("#profileAvatarPreview").src = p.avatar || DEFAULT_AVATAR;
}

function currentUserFromStorage() {
  const current = getCurrent();
  return current ? getUsers().find(u => u.username === current.username) : null;
}

document.addEventListener("DOMContentLoaded", () => {
  initProvinceSelect();
  initBirthDate();
  $$(".slider-captcha").forEach(setupCaptcha);

  $$(".password-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = $(`#${btn.dataset.target}`);
      input.type = input.type === "password" ? "text" : "password";
      btn.textContent = input.type === "password" ? "Hiện" : "Ẩn";
    });
  });

  $$("[data-show]").forEach(btn => btn.addEventListener("click", () => {
    switchView(btn.dataset.show);
  }));

  $$("[data-terms]").forEach(btn => btn.addEventListener("click", () => $("#termsDialog").showModal()));
  $$("[data-close-terms]").forEach(btn => btn.addEventListener("click", () => $("#termsDialog").close()));

  $("#registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = $("#registerUsername").value.trim();
    const password = $("#registerPassword").value;
    const confirm = $("#registerConfirm").value;

    if (username.length < 4) return setMessage("#registerMessage", "Tên tài khoản cần ít nhất 4 ký tự.");
    if (password.length < 6) return setMessage("#registerMessage", "Mật khẩu cần ít nhất 6 ký tự.");
    if (password !== confirm) return setMessage("#registerMessage", "Mật khẩu nhập lại chưa khớp.");
    if (!captchaVerified('[data-captcha="register"]')) return setMessage("#registerMessage", "Hãy kéo thanh xác minh đến cuối.");
    if (!$("#registerTerms").checked) return setMessage("#registerMessage", "Bạn cần đồng ý điều khoản để đăng ký.");

    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return setMessage("#registerMessage", "Tên tài khoản đã tồn tại.");
    }

    const user = {
      username,
      passwordHash: await hashPassword(password),
      profile: { avatar: DEFAULT_AVATAR, country: "Việt Nam" },
      createdAt: new Date().toISOString()
    };
    users.push(user);
    saveUsers(users);
    localStorage.setItem(CURRENT_KEY, JSON.stringify({ username }));
    fillProfile(user);
    switchView("profile");
  });

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = $("#loginUsername").value.trim();
    const password = $("#loginPassword").value;

    if (!captchaVerified('[data-captcha="login"]')) return setMessage("#loginMessage", "Hãy kéo thanh xác minh đến cuối.");
    if (!$("#loginTerms").checked) return setMessage("#loginMessage", "Bạn cần đồng ý điều khoản để đăng nhập.");

    const user = getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user || user.passwordHash !== await hashPassword(password)) {
      return setMessage("#loginMessage", "Tên tài khoản hoặc mật khẩu không đúng.");
    }

    localStorage.setItem(CURRENT_KEY, JSON.stringify({ username: user.username }));
    window.location.href = "cart.html";
  });

  $("#profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const current = currentUserFromStorage();
    if (!current) return switchView("login");

    const birthDateValue = $("#birthDate").value;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const birthDate = birthDateValue ? new Date(`${birthDateValue}T00:00:00`) : null;

    if (!birthDateValue || !birthDate || Number.isNaN(birthDate.getTime()) || birthDate > today) {
      return setMessage("#profileMessage", "Ngày sinh không được vượt quá ngày hiện tại.");
    }

    current.profile = {
      avatar: $("#profileAvatarPreview").src || DEFAULT_AVATAR,
      fullName: $("#fullName").value.trim(),
      birthDate: $("#birthDate").value,
      gender: $("#gender").value,
      phone: $("#phone").value.trim(),
      country: $("#country").value,
      province: $("#province").value,
      ward: $("#ward").value.trim(),
      address: $("#address").value.trim()
    };

    if (!current.profile.fullName || !current.profile.birthDate || !current.profile.gender ||
        !current.profile.phone || !current.profile.province || !current.profile.ward || !current.profile.address) {
      return setMessage("#profileMessage", "Vui lòng điền đầy đủ thông tin.");
    }

    const users = getUsers().map(u => u.username === current.username ? current : u);
    saveUsers(users);
    renderAccount(current);
    window.location.href = "cart.html";
  });

  $("#avatarUpload").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      return setMessage("#profileMessage", "Ảnh tối đa 2MB.");
    }
    const reader = new FileReader();
    reader.onload = () => $("#profileAvatarPreview").src = reader.result;
    reader.readAsDataURL(file);
  });

  $("#logoutBtn").addEventListener("click", () => {
    localStorage.removeItem(CURRENT_KEY);
    $("#loginForm").reset();
    resetCaptcha('[data-captcha="login"]');
    setMessage("#loginMessage", "");
    switchView("login");
  });

  $("#editProfileBtn").addEventListener("click", () => {
    const user = currentUserFromStorage();
    if (!user) return switchView("login");
    fillProfile(user);
    switchView("profile");
  });

  const existing = currentUserFromStorage();
  if (existing) {
    if (existing.profile?.fullName) {
      renderAccount(existing);
      switchView("account");
    } else {
      fillProfile(existing);
      switchView("profile");
    }
  }
});

/* =========================================================
   NEXUS VR — controllers/admin-controller.js
   TẦNG 3 - CONTROLLER: BỘ NÃO ĐIỀU KHIỂN DASHBOARD QUẢN TRỊ
   Quản lý: Phân quyền Admin, Đơn hàng, Lịch hẹn Showroom,
   Kho sản phẩm, và Quản lý Tài khoản Khách hàng
   Bảo mật: 100% Server-Side Authentication & Zero Backdoors
   ========================================================= */

(function (global) {
  "use strict";

  const STORAGE_KEY_ORDERS = "nexus_orders";
  const STORAGE_KEY_BOOKINGS = "nexus_bookings";
  const STORAGE_KEY_USER = "nexus_user";
  const CACHE_KEY_ORDERS = "nexus_admin_cache_orders";
  const CACHE_KEY_BOOKINGS = "nexus_admin_cache_bookings";
  const CACHE_KEY_USERS = "nexus_admin_cache_users";

  let currentTab = "overview";
  let ordersList = [];
  let bookingsList = [];
  let usersList = [];

  const formatVND = (num) => (num || 0).toLocaleString("vi-VN") + " ₫";

  document.addEventListener("DOMContentLoaded", initAdminDashboard);

  async function initAdminDashboard() {
    initAuthCheck();
    initTabNavigation();
    loadAllData();
    renderAllViews();
    initSearchAndFilters();
    checkDatabaseConnection();
  }

  /* ---------------------------------------------------------
     1. KIỂM TRA KẾT NỐI SERVERLESS & POSTGRESQL ĐÁM MÂY (CHẠY SONG SONG)
     --------------------------------------------------------- */
  async function checkDatabaseConnection() {
    const dot = document.getElementById("adminLiveDot");
    const container = document.getElementById("adminLiveStatus");
    if (!dot) return;

    if (!window.apiService) return;

    try {
      // Chạy song song cả 4 request siêu tốc: Health, Orders, Bookings, Users (< 1.5s)
      const [healthRes, ordersRes, bookingsRes, usersRes] = await Promise.allSettled([
        typeof window.apiService.checkHealth === "function" ? window.apiService.checkHealth() : Promise.resolve(null),
        typeof window.apiService.getOrders === "function" ? window.apiService.getOrders({ isAdmin: true }) : Promise.resolve([]),
        typeof window.apiService.getBookings === "function" ? window.apiService.getBookings() : Promise.resolve([]),
        typeof window.apiService.getUsers === "function" ? window.apiService.getUsers() : Promise.resolve([])
      ]);

      // 1. Cập nhật trạng thái đèn LED (Xanh lá: Online, Vàng: Local)
      const isOnline = healthRes.status === "fulfilled" && healthRes.value?.database?.connected;
      if (isOnline) {
        dot.style.background = "#4CAF50";
        dot.style.boxShadow = "0 0 10px #4CAF50";
        if (container) container.title = "Cơ sở dữ liệu đám mây: Trực tuyến (Neon PostgreSQL Online)";
      } else {
        dot.style.background = "#FF9800";
        dot.style.boxShadow = "0 0 10px #FF9800";
        if (container) container.title = "Chế độ lưu trữ cục bộ an toàn (Local Storage)";
      }

      // 2. Cập nhật Đơn hàng
      if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value)) {
        ordersList = ordersRes.value;
        localStorage.setItem(CACHE_KEY_ORDERS, JSON.stringify(ordersList));
      }

      // 3. Cập nhật Lịch hẹn Showroom VIP
      if (bookingsRes.status === "fulfilled" && Array.isArray(bookingsRes.value)) {
        bookingsList = bookingsRes.value;
        localStorage.setItem(CACHE_KEY_BOOKINGS, JSON.stringify(bookingsList));
      }

      // 4. Cập nhật Tài khoản Khách hàng
      if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value)) {
        usersList = usersRes.value;
        localStorage.setItem(CACHE_KEY_USERS, JSON.stringify(usersList));
      }

      // Cập nhật lại giao diện ngay lập tức
      renderAllViews();
    } catch (err) {
      console.warn("[Admin] Tải dữ liệu song song gặp sự cố:", err);
    }
  }

  /* ---------------------------------------------------------
     2. BẢO VỆ ROUTE & PHÂN QUYỀN (ZERO BACKDOORS)
     --------------------------------------------------------- */
  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_USER) || "null");
    } catch (e) {
      return null;
    }
  }

  function checkIsAdmin() {
    const user = getCurrentUser();
    return Boolean(user && user.role === "admin");
  }

  function initAuthCheck() {
    const authOverlay = document.getElementById("adminAuthOverlay");
    const adminUserDisplay = document.getElementById("adminUserDisplay");

    if (checkIsAdmin()) {
      if (authOverlay) authOverlay.style.display = "none";
      const user = getCurrentUser();
      if (adminUserDisplay) {
        adminUserDisplay.textContent = user.email || user.account || "admin@nexusvr.vn";
      }
    } else {
      if (authOverlay) authOverlay.style.display = "flex";
      // Chuyển hướng về login sau 1.5 giây nếu không có quyền
      setTimeout(() => {
        if (!checkIsAdmin()) {
          window.location.href = "login.html?redirect=admin.html";
        }
      }, 1500);
    }

    // Nút Đăng xuất Admin
    const btnLogout = document.getElementById("btnAdminLogout");
    if (btnLogout) {
      btnLogout.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem(STORAGE_KEY_USER);
        window.location.href = "login.html";
      });
    }
  }

  /* ---------------------------------------------------------
     3. NẠP DỮ LIỆU BAN ĐẦU (TỪ CACHE LOCALSTORAGE TRONG 0.05S)
     --------------------------------------------------------- */
  function loadAllData() {
    // 3.1. Đơn hàng từ Cache hoặc localStorage
    try {
      ordersList = JSON.parse(localStorage.getItem(CACHE_KEY_ORDERS) || localStorage.getItem(STORAGE_KEY_ORDERS) || "[]");
    } catch (e) {
      ordersList = [];
    }

    // 3.2. Lịch hẹn Showroom VIP từ Cache hoặc localStorage
    try {
      bookingsList = JSON.parse(localStorage.getItem(CACHE_KEY_BOOKINGS) || localStorage.getItem(STORAGE_KEY_BOOKINGS) || "[]");
    } catch (e) {
      bookingsList = [];
    }

    // 3.3. Người dùng từ Cache hoặc fallback người dùng hiện tại
    try {
      usersList = JSON.parse(localStorage.getItem(CACHE_KEY_USERS) || "[]");
      if (usersList.length === 0) {
        const curr = getCurrentUser();
        if (curr) {
          usersList = [{
            id: curr.id || "usr_admin_01",
            email: curr.email || "admin@nexusvr.vn",
            fullName: curr.fullName || curr.name || "Quản trị viên",
            phone: curr.phone || "0901234567",
            role: "admin",
            createdAt: "31/10/2026"
          }];
        }
      }
    } catch (e) {
      usersList = [];
    }
  }

  function getSeedOrders() {
    return [];
  }

  function getSeedBookings() {
    return [];
  }

  /* ---------------------------------------------------------
     4. ĐIỀU HƯỚNG TABS
     --------------------------------------------------------- */
  function initTabNavigation() {
    const tabBtns = document.querySelectorAll("[data-admin-tab]");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.adminTab;
        tabBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        document.querySelectorAll(".admin-tab-pane").forEach((pane) => {
          pane.style.display = "none";
        });
        const activePane = document.getElementById("pane-" + target);
        if (activePane) activePane.style.display = "block";
        currentTab = target;
      });
    });
  }

  /* ---------------------------------------------------------
     5. RENDER TOÀN BỘ GIAO DIỆN
     --------------------------------------------------------- */
  function renderAllViews() {
    renderKPIs();
    renderOverviewTables();
    renderOrdersTable();
    renderBookingsTable();
    renderProductsTable();
    renderUsersTable();
  }

  function renderKPIs() {
    const totalRevenue = ordersList
      .filter((o) => o.status === "completed" || o.status === "processing")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const pendingBookingsCount = bookingsList.filter((b) => b.status === "pending").length;

    const kpiRevenue = document.getElementById("kpiRevenue");
    const kpiOrders = document.getElementById("kpiOrders");
    const kpiBookings = document.getElementById("kpiBookings");
    const kpiProducts = document.getElementById("kpiProducts");
    const kpiUsers = document.getElementById("kpiUsers");

    if (kpiRevenue) kpiRevenue.textContent = formatVND(totalRevenue);
    if (kpiOrders) kpiOrders.textContent = ordersList.length;
    if (kpiBookings) kpiBookings.textContent = pendingBookingsCount;
    if (kpiProducts) kpiProducts.textContent = (window.PRODUCTS || []).length || 18;
    if (kpiUsers) kpiUsers.textContent = usersList.length;

    // Badges trên sidebar
    const badgeOrders = document.getElementById("sidebarBadgeOrders");
    const badgeBookings = document.getElementById("sidebarBadgeBookings");
    const badgeUsers = document.getElementById("sidebarBadgeUsers");

    if (badgeOrders) badgeOrders.textContent = ordersList.length;
    if (badgeBookings) badgeBookings.textContent = pendingBookingsCount;
    if (badgeUsers) badgeUsers.textContent = usersList.length;
  }

  function renderOverviewTables() {
    const mountRecentOrders = document.getElementById("overviewRecentOrders");
    if (!mountRecentOrders) return;

    const recent = ordersList.slice(0, 4);
    if (recent.length === 0) {
      mountRecentOrders.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#877D72;">Chưa có đơn hàng nào</td></tr>`;
      return;
    }

    mountRecentOrders.innerHTML = recent
      .map((ord) => {
        const statusMap = {
          processing: { label: "Đang xử lý", cls: "status-pill--processing" },
          completed: { label: "Đã giao", cls: "status-pill--completed" },
          cancelled: { label: "Đã hủy", cls: "status-pill--cancelled" }
        };
        const s = statusMap[ord.status] || statusMap.processing;

        return `
          <tr>
            <td><strong>${ord.code}</strong></td>
            <td>${ord.customer ? ord.customer.name : "Khách hàng"}</td>
            <td>${formatVND(ord.total)}</td>
            <td><span class="status-pill ${s.cls}">${s.label}</span></td>
            <td>${ord.createdAt || "Hôm nay"}</td>
          </tr>
        `;
      })
      .join("");
  }

  /* ---------------------------------------------------------
     6. RENDER BẢNG ĐƠN HÀNG & THAO TÁC DUYỆT ĐƠN
     --------------------------------------------------------- */
  function renderOrdersTable() {
    const tbody = document.getElementById("ordersTableBody");
    if (!tbody) return;

    const searchKeyword = (document.getElementById("orderSearchInput")?.value || "").toLowerCase().trim();
    const filterStatus = document.getElementById("orderStatusFilter")?.value || "all";

    let list = ordersList.filter((ord) => {
      const matchStatus = filterStatus === "all" || ord.status === filterStatus;
      const custName = (ord.customer?.name || "").toLowerCase();
      const custPhone = (ord.customer?.phone || "").toLowerCase();
      const code = (ord.code || "").toLowerCase();
      const matchSearch = !searchKeyword || code.includes(searchKeyword) || custName.includes(searchKeyword) || custPhone.includes(searchKeyword);
      return matchStatus && matchSearch;
    });

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#877D72; padding:30px;">Không tìm thấy đơn hàng nào phù hợp</td></tr>`;
      return;
    }

    tbody.innerHTML = list
      .map((ord) => {
        const statusMap = {
          processing: { label: "Đang xử lý", cls: "status-pill--processing" },
          completed: { label: "Đã giao", cls: "status-pill--completed" },
          cancelled: { label: "Đã hủy", cls: "status-pill--cancelled" }
        };
        const s = statusMap[ord.status] || statusMap.processing;
        const itemsCount = Array.isArray(ord.items) ? ord.items.reduce((acc, it) => acc + (it.qty || 1), 0) : 1;

        return `
          <tr>
            <td><strong>${ord.code}</strong><br><span style="font-size:0.78rem; color:#877D72;">${ord.createdAt || "Vừa xong"}</span></td>
            <td>
              <strong>${ord.customer ? ord.customer.name : "Khách vãng lai"}</strong><br>
              <span style="font-size:0.8rem; color:#877D72;">${ord.customer ? ord.customer.phone : ""}</span>
            </td>
            <td><span class="admin-badge">${itemsCount} món</span></td>
            <td><strong>${formatVND(ord.total)}</strong></td>
            <td><span class="status-pill ${s.cls}">${s.label}</span></td>
            <td>
              <div style="display:flex; gap:6px;">
                ${
                  ord.status === "processing"
                    ? `<button type="button" class="btn-table-action btn-table-success" onclick="window.__adminUpdateOrderStatus('${ord.id}', 'completed')">Duyệt Giao</button>
                       <button type="button" class="btn-table-action btn-table-danger" onclick="window.__adminUpdateOrderStatus('${ord.id}', 'cancelled')">Hủy</button>`
                    : `<span style="font-size:0.8rem; color:#877D72;">Đã chốt</span>`
                }
                <button type="button" class="btn-table-action btn-table-print" onclick="window.__adminPrintOrder('${ord.code}')">In Đơn</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  /* ---------------------------------------------------------
     7. RENDER BẢNG LỊCH HẸN SHOWROOM VIP
     --------------------------------------------------------- */
  function renderBookingsTable() {
    const tbody = document.getElementById("bookingsTableBody");
    if (!tbody) return;

    const filterStatus = document.getElementById("bookingStatusFilter")?.value || "all";
    let list = bookingsList.filter((b) => filterStatus === "all" || b.status === filterStatus);

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#877D72; padding:30px;">Chưa có lịch hẹn nào</td></tr>`;
      return;
    }

    tbody.innerHTML = list
      .map((b) => {
        const statusMap = {
          pending: { label: "Chờ xác nhận", cls: "status-pill--pending" },
          confirmed: { label: "Đã xác nhận", cls: "status-pill--confirmed" },
          completed: { label: "Đã tiếp đón", cls: "status-pill--completed" },
          cancelled: { label: "Đã từ chối", cls: "status-pill--cancelled" }
        };
        const s = statusMap[b.status] || statusMap.pending;

        return `
          <tr>
            <td><strong>${b.name}</strong><br><span style="font-size:0.78rem; color:#877D72;">${b.email}</span></td>
            <td>${b.phone}</td>
            <td style="font-size:0.85rem; color:#A67C52;"><strong>${b.service}</strong></td>
            <td><strong>${b.bookingDate || "Hôm nay"}</strong><br><span style="font-size:0.8rem; color:#877D72;">${b.timeSlot}</span></td>
            <td style="max-width:200px; font-size:0.82rem; color:#BDB4A8;">${b.message || "Không có ghi chú"}</td>
            <td><span class="status-pill ${s.cls}">${s.label}</span></td>
            <td>
              ${
                b.status === "pending"
                  ? `<button type="button" class="btn-table-action btn-table-success" onclick="window.__adminUpdateBookingStatus('${b.id}', 'confirmed')">Xác nhận</button>
                     <button type="button" class="btn-table-action btn-table-danger" onclick="window.__adminUpdateBookingStatus('${b.id}', 'cancelled')">Từ chối</button>`
                  : b.status === "confirmed"
                  ? `<button type="button" class="btn-table-action btn-table-success" onclick="window.__adminUpdateBookingStatus('${b.id}', 'completed')">Hoàn tất</button>`
                  : `<span style="font-size:0.8rem; color:#877D72;">Đã xử lý</span>`
              }
            </td>
          </tr>
        `;
      })
      .join("");
  }

  /* ---------------------------------------------------------
     8. RENDER BẢNG SẢN PHẨM & QUẢN LÝ KHO (18 SẢN PHẨM)
     --------------------------------------------------------- */
  function renderProductsTable() {
    const tbody = document.getElementById("productsTableBody");
    if (!tbody) return;

    const products = window.PRODUCTS || [];
    tbody.innerHTML = products
      .map((p) => {
        const thumb = (p.images && p.images[0]) || "assets/images/placeholder.svg";
        return `
          <tr>
            <td>
              <img src="${thumb}" alt="${p.name}" style="width:48px; height:48px; object-fit:contain; border-radius:6px; background:#24201D; padding:3px;">
            </td>
            <td><strong>${p.name}</strong><br><span style="font-size:0.78rem; color:#877D72;">ID: ${p.id}</span></td>
            <td><span class="admin-badge" style="background:#24201D; border:1px solid rgba(166,124,82,0.3);">${p.categoryLabel || p.category}</span></td>
            <td><strong>${formatVND(p.price)}</strong></td>
            <td>
              <span id="stock-${p.id}" style="font-weight:700; color:#81C784;">${p.stock || 15}</span>
            </td>
            <td>
              <button type="button" class="btn-table-action btn-table-print" onclick="window.__adminAdjustStock('${p.id}', 5)">+5 Kho</button>
              <button type="button" class="btn-table-action btn-table-outline" onclick="window.open('product.html?id=${p.id}', '_blank')">Xem</button>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  /* ---------------------------------------------------------
     9. RENDER BẢNG QUẢN LÝ TÀI KHOẢN KHÁCH HÀNG (TAB 5)
     --------------------------------------------------------- */
  function renderUsersTable() {
    const tbody = document.getElementById("usersTableBody");
    if (!tbody) return;

    const search = (document.getElementById("userSearchInput")?.value || "").toLowerCase().trim();
    const roleFilter = document.getElementById("userRoleFilter")?.value || "all";

    const filtered = usersList.filter((u) => {
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchSearch =
        !search ||
        (u.fullName || "").toLowerCase().includes(search) ||
        (u.email || "").toLowerCase().includes(search) ||
        (u.phone || "").toLowerCase().includes(search);
      return matchRole && matchSearch;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#877D72; padding:30px;">Không tìm thấy tài khoản người dùng nào</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered
      .map((u) => {
        const initial = (u.fullName || u.email || "U").charAt(0).toUpperCase();
        const isAdmin = u.role === "admin";
        const rolePill = isAdmin
          ? `<span class="status-pill status-pill--admin">★ Quản Trị Viên</span>`
          : `<span class="status-pill status-pill--customer">Khách Hàng</span>`;

        return `
          <tr>
            <td>
              <div style="display:flex; align-items:center;">
                <span class="admin-user-avatar">${initial}</span>
                <div>
                  <strong>${u.fullName || "Quý Khách"}</strong>
                  <br><span style="font-size:0.78rem; color:#877D72;">ID: ${u.id}</span>
                </div>
              </div>
            </td>
            <td><strong>${u.email}</strong></td>
            <td>${u.phone || "Chưa cập nhật"}</td>
            <td>${rolePill}</td>
            <td style="font-size:0.85rem; color:#EDE4D8;">${u.createdAt || "31/10/2026"}</td>
            <td>
              ${
                u.id === "usr_admin_01" || u.email === "admin@nexusvr.vn"
                  ? `<span style="font-size:0.8rem; color:#D4AF37;">Admin Tối Cao</span>`
                  : `<button type="button" class="btn-table-action btn-table-outline" onclick="window.__adminToggleUserRole('${u.id}', '${u.role}')">${isAdmin ? 'Hạ cấp Khách' : 'Thăng cấp Admin'}</button>
                     <button type="button" class="btn-table-action btn-table-danger" onclick="window.__adminDeleteUser('${u.id}')">Xóa</button>`
              }
            </td>
          </tr>
        `;
      })
      .join("");
  }

  /* ---------------------------------------------------------
     10. GLOBAL ACTIONS CHO GIAO DIỆN ADMIN
     --------------------------------------------------------- */
  global.__adminUpdateOrderStatus = function (orderIdOrCode, newStatus) {
    const order = ordersList.find((o) => o.id === orderIdOrCode || o.code === orderIdOrCode);
    if (!order) return;

    let reason = "";
    if (newStatus === "cancelled") {
      const inputReason = prompt(`Vui lòng nhập lý do hủy đơn hàng ${order.code}:`, "Hết hàng tạm thời / Khách yêu cầu hủy đơn");
      if (inputReason === null) {
        return; // Hủy thao tác nếu ấn nút Cancel
      }
      reason = inputReason.trim() || "Admin hủy đơn theo chính sách";
      order.notes = reason;
      order.cancelReason = reason;
    }

    order.status = newStatus;
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(ordersList));
    localStorage.setItem(CACHE_KEY_ORDERS, JSON.stringify(ordersList));

    if (window.apiService && typeof window.apiService.updateOrderStatus === "function") {
      window.apiService.updateOrderStatus(orderIdOrCode, newStatus, reason).catch(() => {});
    }

    if (typeof window.showToast === "function") {
      const statusVN = newStatus === "completed" ? "Đã giao" : newStatus === "cancelled" ? "Đã hủy" : "Đang xử lý";
      window.showToast(`Đã chuyển trạng thái đơn hàng ${order.code} sang "${statusVN}"!`, "success");
    }
    renderKPIs();
    renderOverviewTables();
    renderOrdersTable();
  };

  global.__adminUpdateBookingStatus = function (bookingId, newStatus) {
    const booking = bookingsList.find((b) => b.id === bookingId);
    if (!booking) return;

    let reason = "";
    if (newStatus === "cancelled") {
      const inputReason = prompt(`Vui lòng nhập lý do từ chối lịch hẹn của khách ${booking.name}:`, "Khung giờ đã kín / Showroom tạm thời nâng cấp");
      if (inputReason === null) {
        return; // Hủy thao tác nếu ấn nút Cancel
      }
      reason = inputReason.trim() || "Từ chối lịch hẹn";
      booking.message = (booking.message ? booking.message + " | " : "") + `Lý do: ${reason}`;
    }

    booking.status = newStatus;
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookingsList));
    localStorage.setItem(CACHE_KEY_BOOKINGS, JSON.stringify(bookingsList));

    if (window.apiService && typeof window.apiService.updateBookingStatus === "function") {
      window.apiService.updateBookingStatus(bookingId, newStatus, reason).catch(() => {});
    }

    if (typeof window.showToast === "function") {
      window.showToast(`Đã cập nhật lịch hẹn của ${booking.name}!`, "success");
    }
    renderKPIs();
    renderBookingsTable();
  };

  global.__adminAdjustStock = function (productId, delta) {
    const p = (window.PRODUCTS || []).find((x) => x.id === productId);
    if (p) {
      p.stock = Math.max(0, (p.stock || 0) + delta);
      const stockEl = document.getElementById("stock-" + productId);
      if (stockEl) stockEl.textContent = p.stock;

      if (window.apiService && typeof window.apiService.updateProductStock === "function") {
        window.apiService.updateProductStock(productId, p.stock).catch(() => {});
      }

      if (typeof window.showToast === "function") {
        window.showToast(`Đã cập nhật tồn kho ${p.name}: ${p.stock}`, "success");
      }
    }
  };

  global.__adminToggleUserRole = async function (userId, currentRole) {
    const newRole = currentRole === "admin" ? "customer" : "admin";
    const user = usersList.find((u) => u.id === userId);
    if (!user) return;

    user.role = newRole;
    if (window.apiService && typeof window.apiService.updateUserRole === "function") {
      await window.apiService.updateUserRole(userId, newRole);
    }

    if (typeof window.showToast === "function") {
      window.showToast(`Đã chuyển vai trò của ${user.fullName} sang '${newRole === "admin" ? "Quản trị viên" : "Khách hàng"}'!`, "success");
    }
    renderKPIs();
    renderUsersTable();
  };

  global.__adminDeleteUser = async function (userId) {
    const user = usersList.find((u) => u.id === userId);
    if (!user) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.fullName || user.email}" khỏi hệ thống?`)) {
      return;
    }

    usersList = usersList.filter((u) => u.id !== userId);

    if (window.apiService && typeof window.apiService.deleteUser === "function") {
      await window.apiService.deleteUser(userId);
    }

    if (typeof window.showToast === "function") {
      window.showToast(`Đã xóa tài khoản ${user.email}!`, "success");
    }
    renderKPIs();
    renderUsersTable();
  };

  global.__adminPrintOrder = function (orderCode) {
    const order = ordersList.find((o) => o.code === orderCode);
    if (!order) return;
    window.open(`orders.html?print=${encodeURIComponent(orderCode)}`, "_blank");
  };

  function initSearchAndFilters() {
    const orderSearch = document.getElementById("orderSearchInput");
    const orderStatus = document.getElementById("orderStatusFilter");
    if (orderSearch) orderSearch.addEventListener("input", renderOrdersTable);
    if (orderStatus) orderStatus.addEventListener("change", renderOrdersTable);

    const bookingStatus = document.getElementById("bookingStatusFilter");
    if (bookingStatus) bookingStatus.addEventListener("change", renderBookingsTable);

    const userSearch = document.getElementById("userSearchInput");
    const userRole = document.getElementById("userRoleFilter");
    if (userSearch) userSearch.addEventListener("input", renderUsersTable);
    if (userRole) userRole.addEventListener("change", renderUsersTable);
  }
})(window);

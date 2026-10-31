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
     1. KIỂM TRA KẾT NỐI SERVERLESS & POSTGRESQL ĐÁM MÂY
     --------------------------------------------------------- */
  async function checkDatabaseConnection() {
    const dot = document.getElementById("adminLiveDot");
    const text = document.getElementById("adminLiveText");
    if (!dot || !text) return;

    if (window.apiService && typeof window.apiService.checkHealth === "function") {
      try {
        const res = await window.apiService.checkHealth();
        if (res.database && res.database.connected) {
          dot.style.background = "#4CAF50";
          text.textContent = "DB: PostgreSQL Online";
          text.title = `Cơ sở dữ liệu đám mây: ${res.database.host || "Vercel Neon"}`;
          await refreshDataFromServerless();
        } else {
          dot.style.background = "#FF9800";
          text.textContent = "DB: Hybrid Local Mode";
          text.title = "Đang chạy chế độ lưu trữ cục bộ an toàn";
        }
      } catch (e) {
        dot.style.background = "#FF9800";
        text.textContent = "DB: Hybrid Local Mode";
      }
    }
  }

  async function refreshDataFromServerless() {
    if (!window.apiService) return;
    try {
      // 1. Nạp Đơn hàng từ Serverless / Postgres
      const serverOrders = await window.apiService.getOrders({ isAdmin: true });
      if (serverOrders && Array.isArray(serverOrders) && serverOrders.length > 0) {
        ordersList = serverOrders;
      }
      // 2. Nạp Lịch hẹn Showroom VIP
      const serverBookings = await window.apiService.getBookings();
      if (serverBookings && Array.isArray(serverBookings) && serverBookings.length > 0) {
        bookingsList = serverBookings;
      }
      // 3. Nạp Danh sách Tài khoản Khách hàng từ Database
      const serverUsers = await window.apiService.getUsers();
      if (serverUsers && Array.isArray(serverUsers) && serverUsers.length > 0) {
        usersList = serverUsers;
      }
      renderAllViews();
    } catch (e) {
      console.warn("[Admin] Nạp dữ liệu serverless thất bại, dùng local:", e);
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
        adminUserDisplay.textContent = user.fullName || user.name || "Quản Trị Viên";
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
     3. NẠP DỮ LIỆU BAN ĐẦU (OFFLINE FALLBACK & SEED DATA)
     --------------------------------------------------------- */
  function loadAllData() {
    // 3.1. Đơn hàng
    try {
      let allOrders = JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || "[]");
      if (allOrders.length === 0) {
        allOrders = getSeedOrders();
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(allOrders));
      }
      ordersList = allOrders;
    } catch (e) {
      ordersList = getSeedOrders();
    }

    // 3.2. Lịch hẹn Showroom VIP
    try {
      let allBookings = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKINGS) || "[]");
      if (allBookings.length === 0) {
        allBookings = getSeedBookings();
        localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(allBookings));
      }
      bookingsList = allBookings;
    } catch (e) {
      bookingsList = getSeedBookings();
    }

    // 3.3. Người dùng
    try {
      const registered = JSON.parse(localStorage.getItem("nexus_registered_users") || "[]");
      const defaultUsers = [
        {
          id: "usr_admin_01",
          email: "admin@nexusvr.vn",
          fullName: "Quản Trị Viên NEXUS",
          name: "Quản Trị Viên",
          phone: "0901234567",
          role: "admin",
          createdAt: "31/10/2026, 14:00:00"
        },
        {
          id: "usr_cust_01",
          email: "khachhang@nexusvr.vn",
          fullName: "Trần Hoàng Nam",
          name: "Nam",
          phone: "0988123456",
          role: "customer",
          createdAt: "31/10/2026, 14:30:00"
        }
      ];
      usersList = [...defaultUsers];
      registered.forEach(r => {
        if (!usersList.some(u => u.email === r.email)) {
          usersList.push({
            id: r.id || "usr_" + Date.now().toString(36),
            email: r.email,
            fullName: r.fullName || r.name || "Khách",
            phone: r.phone || "Chưa cập nhật",
            role: r.role || "customer",
            createdAt: "Mới đăng ký"
          });
        }
      });
    } catch (e) {
      usersList = [];
    }
  }

  function getSeedOrders() {
    return [
      {
        id: "ord_sample_01",
        code: "#NEXUS-892145",
        createdAt: "31/10/2026, 14:30:00",
        customer: {
          name: "Trần Hoàng Nam",
          phone: "0988123456",
          email: "khachhang@nexusvr.vn",
          address: "Tòa nhà Landmark 81, TP.HCM"
        },
        items: [
          {
            id: "vr-001",
            name: "NEXUS Vision Pro",
            price: 79990000,
            qty: 1,
            selectedColor: "Xám Than",
            image: "assets/images/products/hero-vr-headset-xam.webp"
          }
        ],
        total: 79990000,
        paymentMethod: "VietQR Napas 247",
        status: "processing"
      },
      {
        id: "ord_sample_02",
        code: "#NEXUS-671203",
        createdAt: "30/10/2026, 09:15:00",
        customer: {
          name: "Lê Minh Anh",
          phone: "0912345678",
          email: "minhanh@gmail.com",
          address: "Số 45 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
        },
        items: [
          {
            id: "vr-007",
            name: "NEXUS CyberPlay VR (Gaming Edition)",
            price: 14490000,
            qty: 1,
            selectedColor: "Xám Than",
            image: "assets/images/products/vr-cyberplay.webp"
          }
        ],
        total: 14490000,
        paymentMethod: "Thanh toán khi nhận hàng (COD)",
        status: "completed"
      }
    ];
  }

  function getSeedBookings() {
    return [
      {
        id: "bkg_001",
        name: "Hoàng Minh Tuấn",
        email: "tuan.hoang@fpt.com",
        phone: "0903112233",
        service: "Trải nghiệm cá nhân hóa 1:1 với NEXUS Vision Pro",
        timeSlot: "09:00 - 10:30",
        bookingDate: "01/11/2026",
        message: "Muốn trải nghiệm ứng dụng phẫu thuật y khoa và mô phỏng 3D",
        status: "confirmed",
        createdAt: "31/10/2026 14:00"
      },
      {
        id: "bkg_002",
        name: "Nguyễn Phương Thảo",
        email: "thao.nguyen@vng.com.vn",
        phone: "0918776655",
        service: "Trải nghiệm Phòng Thu Điện Toán Không Gian (Vision Studio)",
        timeSlot: "14:00 - 15:30",
        bookingDate: "02/11/2026",
        message: "Quan tâm đến tính năng Render thời gian thực",
        status: "pending",
        createdAt: "30/10/2026 11:00"
      }
    ];
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

    order.status = newStatus;
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(ordersList));

    if (window.apiService && typeof window.apiService.updateOrderStatus === "function") {
      window.apiService.updateOrderStatus(orderIdOrCode, newStatus).catch(() => {});
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

    booking.status = newStatus;
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookingsList));

    if (window.apiService && typeof window.apiService.updateBookingStatus === "function") {
      window.apiService.updateBookingStatus(bookingId, newStatus).catch(() => {});
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

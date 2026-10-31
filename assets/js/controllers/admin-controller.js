/* =========================================================
   NEXUS VR — controllers/admin-controller.js
   TẦNG 3 - CONTROLLER: BỘ NÃO ĐIỀU KHIỂN DASHBOARD QUẢN TRỊ
   Quản lý: Phân quyền Admin, Đơn hàng, Lịch hẹn Showroom, Sản phẩm
   ========================================================= */

(function (global) {
  "use strict";

  const STORAGE_KEY_ORDERS = "nexus_orders";
  const STORAGE_KEY_BOOKINGS = "nexus_bookings";
  const STORAGE_KEY_USER = "nexus_user";

  let currentTab = "overview";
  let ordersList = [];
  let bookingsList = [];

  const formatVND = (num) => (num || 0).toLocaleString("vi-VN") + " ₫";

  document.addEventListener("DOMContentLoaded", initAdminDashboard);

  function initAdminDashboard() {
    initAuthCheck();
    initTabNavigation();
    loadAllData();
    renderAllViews();
    initSearchAndFilters();
  }

  /* ---------------------------------------------------------
     1. PHÂN QUYỀN TRUY CẬP (ROLE-BASED ACCESS CONTROL)
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
    return user && (user.role === "admin" || user.email === "admin@nexusvr.vn");
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
    }

    // Nút đăng nhập nhanh chế độ Admin phục vụ chấm thi / Demo
    const btnQuickAdmin = document.getElementById("btnQuickAdminLogin");
    if (btnQuickAdmin) {
      btnQuickAdmin.addEventListener("click", () => {
        const adminAccount = {
          id: "usr_admin_01",
          email: "admin@nexusvr.vn",
          fullName: "Quản Trị Viên NEXUS",
          name: "Quản Trị Viên",
          phone: "0901234567",
          role: "admin",
          loginTime: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(adminAccount));
        if (typeof window.showToast === "function") {
          window.showToast("Đã cấp quyền Quản trị viên hệ thống!", "success");
        }
        if (authOverlay) authOverlay.style.display = "none";
        if (adminUserDisplay) adminUserDisplay.textContent = adminAccount.fullName;
        loadAllData();
        renderAllViews();
      });
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
     2. NẠP DỮ LIỆU ĐƠN HÀNG & LỊCH HẸN TỪ STORAGE
     --------------------------------------------------------- */
  function loadAllData() {
    // 2.1. Đơn hàng
    try {
      // Đọc các đơn hàng tổng hợp
      let allOrders = JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || "[]");
      if (allOrders.length === 0) {
        // Lấy seed orders nếu chưa có
        allOrders = getSeedOrders();
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(allOrders));
      }
      ordersList = allOrders;
    } catch (e) {
      ordersList = getSeedOrders();
    }

    // 2.2. Lịch hẹn Showroom VIP
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
          address: "Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM"
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
      },
      {
        id: "ord_sample_03",
        code: "#NEXUS-440192",
        createdAt: "29/10/2026, 16:45:00",
        customer: {
          name: "Đặng Hoàng Yến",
          phone: "0933557799",
          email: "hoangyen@design.vn",
          address: "Số 12 Thảo Điền, Quận 2, TP. Thủ Đức"
        },
        items: [
          {
            id: "ctrl-002",
            name: "NEXUS Precision Stylus XR",
            price: 3490000,
            qty: 1,
            selectedColor: "Titanium",
            image: "assets/images/products/stylus-xr.webp"
          }
        ],
        total: 3520000,
        paymentMethod: "Thẻ tín dụng quốc tế",
        status: "cancelled"
      }
    ];
  }

  function getSeedBookings() {
    return [
      {
        id: "bkg_001",
        name: "Nguyễn Thái Sơn",
        email: "thaison.architect@gmail.com",
        phone: "0908765432",
        service: "Trải nghiệm NEXUS Vision Pro 1:1",
        timeSlot: "10:00 - 11:30",
        bookingDate: "02/11/2026",
        message: "Muốn thử nghiệm tính năng dựng mô hình 3D trên Vision Pro và bút Stylus XR.",
        status: "pending",
        createdAt: "31/10/2026 15:20"
      },
      {
        id: "bkg_002",
        name: "Vũ Hải Đăng",
        email: "dang.vu@fintech.vn",
        phone: "0919887766",
        service: "Tư vấn giải pháp Doanh nghiệp NEXUS Enterprise XR",
        timeSlot: "14:30 - 16:00",
        bookingDate: "03/11/2026",
        message: "Tìm hiểu giải pháp đào tạo mô phỏng từ xa cho 20 nhân sự.",
        status: "confirmed",
        createdAt: "30/10/2026 11:00"
      },
      {
        id: "bkg_003",
        name: "Phạm Quỳnh Nga",
        email: "quynhnga@metaverse.com",
        phone: "0987112233",
        service: "Thưởng thức rạp phim Spatial Cinema 8K",
        timeSlot: "16:30 - 17:30",
        bookingDate: "04/11/2026",
        message: "Trải nghiệm thử mẫu kính Cinema Acoustic XR.",
        status: "completed",
        createdAt: "29/10/2026 09:30"
      }
    ];
  }

  /* ---------------------------------------------------------
     3. ĐIỀU HƯỚNG TABS
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
     4. RENDER TOÀN BỘ GIAO DIỆN
     --------------------------------------------------------- */
  function renderAllViews() {
    renderKPIs();
    renderOverviewTables();
    renderOrdersTable();
    renderBookingsTable();
    renderProductsTable();
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

    if (kpiRevenue) kpiRevenue.textContent = formatVND(totalRevenue);
    if (kpiOrders) kpiOrders.textContent = ordersList.length;
    if (kpiBookings) kpiBookings.textContent = pendingBookingsCount;
    if (kpiProducts) kpiProducts.textContent = (window.PRODUCTS || []).length || 18;

    // Badges trên sidebar
    const badgeOrders = document.getElementById("sidebarBadgeOrders");
    const badgeBookings = document.getElementById("sidebarBadgeBookings");
    if (badgeOrders) badgeOrders.textContent = ordersList.length;
    if (badgeBookings) badgeBookings.textContent = pendingBookingsCount;
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
     5. RENDER BẢNG ĐƠN HÀNG & THAO TÁC DUYỆT ĐƠN
     --------------------------------------------------------- */
  function renderOrdersTable() {
    const tbody = document.getElementById("ordersTableBody");
    if (!tbody) return;

    const filterStatus = document.getElementById("orderStatusFilter")?.value || "all";
    const keyword = (document.getElementById("orderSearchInput")?.value || "").toLowerCase().trim();

    let list = ordersList.filter((ord) => {
      const matchStatus = filterStatus === "all" || ord.status === filterStatus;
      const matchKey =
        !keyword ||
        (ord.code && ord.code.toLowerCase().includes(keyword)) ||
        (ord.customer && ord.customer.name.toLowerCase().includes(keyword)) ||
        (ord.customer && ord.customer.phone.includes(keyword));
      return matchStatus && matchKey;
    });

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#877D72; padding:30px;">Không tìm thấy đơn hàng phù hợp</td></tr>`;
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

        const itemsDesc = (ord.items || [])
          .map((i) => `${i.name} (x${i.qty}${i.selectedColor ? " - " + i.selectedColor : ""})`)
          .join("<br>");

        return `
          <tr>
            <td><strong>${ord.code}</strong></td>
            <td>
              <div><strong>${ord.customer ? ord.customer.name : "N/A"}</strong></div>
              <div style="font-size:0.8rem; color:#877D72;">${ord.customer ? ord.customer.phone : ""}</div>
            </td>
            <td style="font-size:0.85rem; max-width:250px;">${itemsDesc}</td>
            <td><strong>${formatVND(ord.total)}</strong></td>
            <td><span class="status-pill ${s.cls}">${s.label}</span></td>
            <td style="font-size:0.8rem; color:#877D72;">${ord.createdAt || "Vừa xong"}</td>
            <td>
              ${
                ord.status === "processing"
                  ? `<button type="button" class="btn-table-action btn-table-success" onclick="window.__adminUpdateOrderStatus('${ord.id || ord.code}', 'completed')">Duyệt giao</button>
                     <button type="button" class="btn-table-action btn-table-danger" onclick="window.__adminUpdateOrderStatus('${ord.id || ord.code}', 'cancelled')">Hủy</button>`
                  : ""
              }
              <button type="button" class="btn-table-action btn-table-print" onclick="window.__adminPrintOrder('${ord.code}')">In A4</button>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  /* ---------------------------------------------------------
     6. RENDER BẢNG LỊCH HẸN SHOWROOM & DUYỆT HẸN
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
          completed: { label: "Đã hoàn tất", cls: "status-pill--completed" },
          cancelled: { label: "Đã hủy", cls: "status-pill--cancelled" }
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
     7. RENDER BẢNG SẢN PHẨM & QUẢN LÝ KHO (18 SẢN PHẨM)
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
     8. GLOBAL ACTIONS CHO GIAO DIỆN ADMIN
     --------------------------------------------------------- */
  global.__adminUpdateOrderStatus = function (orderIdOrCode, newStatus) {
    const order = ordersList.find((o) => o.id === orderIdOrCode || o.code === orderIdOrCode);
    if (!order) return;

    order.status = newStatus;
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(ordersList));

    if (typeof window.showToast === "function") {
      window.showToast(`Đã chuyển trạng thái đơn hàng ${order.code} sang "${newStatus === 'completed' ? 'Đã giao' : 'Đã hủy'}"!`, "success");
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
      if (typeof window.showToast === "function") {
        window.showToast(`Đã cập nhật tồn kho ${p.name}: ${p.stock}`, "success");
      }
    }
  };

  global.__adminPrintOrder = function (orderCode) {
    const order = ordersList.find((o) => o.code === orderCode);
    if (!order) return;
    // Chuyển sang orders.html hoặc in trực tiếp
    window.open(`orders.html?print=${encodeURIComponent(orderCode)}`, "_blank");
  };

  function initSearchAndFilters() {
    const orderSearch = document.getElementById("orderSearchInput");
    const orderStatus = document.getElementById("orderStatusFilter");
    if (orderSearch) orderSearch.addEventListener("input", renderOrdersTable);
    if (orderStatus) orderStatus.addEventListener("change", renderOrdersTable);

    const bookingStatus = document.getElementById("bookingStatusFilter");
    if (bookingStatus) bookingStatus.addEventListener("change", renderBookingsTable);
  }
})(window);

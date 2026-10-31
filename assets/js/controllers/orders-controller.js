/* ==========================================================================
   NEXUS VR — controllers/orders-controller.js
   TẦNG 3 - CONTROLLER: QUẢN LÝ ĐƠN HÀNG, TÌM KIẾM THỜI GIAN THỰC,
   HUY HIỆU SỐ LƯỢNG TAB & IN / XUẤT HÓA ĐƠN ĐIỆN TỬ KHỔ A4 (window.print())
   ========================================================================== */
(function () {
  "use strict";

  let currentTab = "active";
  let searchKeyword = "";
  let pendingOrderIdToConfirm = null; // Lưu ID đơn hàng chờ xác nhận "Đã nhận"
  let pendingOrderIdToCancel = null;  // Lưu ID đơn hàng chờ xác nhận "Hủy đơn"

  const formatVND = (num) => (num || 0).toLocaleString("vi-VN") + " ₫";

  // Hàm loại bỏ dấu tiếng Việt hỗ trợ tìm kiếm không dấu
  function removeVietnameseTones(str) {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  }

  document.addEventListener("DOMContentLoaded", initOrdersController);

  function initOrdersController() {
    ensureSeedOrders();
    initTabs();
    initSearch();
    initConfirmReceivedModal();
    initConfirmCancelModal();
    updateTabBadges();
    renderOrders();

    // HỖ TRỢ IN HÓA ĐƠN TỰ ĐỘNG TỪ ADMIN CONSOLE (?print=#NEXUS-...)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const printCode = urlParams.get("print");
      if (printCode) {
        const allOrders = getOrders();
        const targetOrder = allOrders.find(o => o.code === printCode || o.id === printCode);
        if (targetOrder) {
          setTimeout(() => {
            printSingleOrderInvoice(targetOrder.id);
          }, 600);
        }
      }
    } catch (e) {}
  }

  /* --------------------------------------------------------------------------
     1. KHỞI TẠO ĐƠN HÀNG MẪU NẾU TRỐNG (2 ĐANG XỬ LÝ, 1 ĐÃ GIAO, 0 ĐÃ HỦY)
     Đúng chuẩn yêu cầu kiểm tra ban đầu: Đang xử lý (2), Đã giao (1), Đã hủy (0)
     -------------------------------------------------------------------------- */
  function ensureSeedOrders() {
    const userSuffix = getUserKeySuffix();
    const seedFlag = "nexus_orders_seeded" + userSuffix;
    const orders = getOrders();
    if (orders.length > 0 || localStorage.getItem(seedFlag)) return;
    localStorage.setItem(seedFlag, "true");

    // Lấy thông tin user hiện tại nếu có
    let userName = "Trường Vũ";
    let userPhone = "0988123456";
    let userEmail = "truongvu@nexusvr.vn";
    try {
      const user = JSON.parse(localStorage.getItem("nexus_user") || "null");
      if (user) {
        if (user.fullName || user.name) userName = user.fullName || user.name;
        if (user.phone) userPhone = user.phone;
        if (user.email) userEmail = user.email;
      }
    } catch (e) {}

    const seedOrders = [
      {
        id: "ORD_SEED_01",
        code: "#NEXUS-892145",
        createdAt: "28/10/2026, 14:30:00",
        customer: {
          name: userName,
          phone: userPhone,
          email: userEmail,
          address: "Số 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
        },
        items: [
          {
            id: "nexus-pro",
            name: "Kính thực tế không gian NEXUS Vision Pro",
            price: 24990000,
            qty: 1,
            selectedColor: "Obsidian Black",
            image: "assets/images/placeholder.svg"
          }
        ],
        subtotal: 24990000,
        discountFee: 1000000,
        couponCode: "NEXUSVIP",
        shippingFee: 0,
        totalAmount: 23990000,
        paymentMethod: "Thanh toán khi nhận hàng (COD)",
        status: "active",
        statusText: "Đang xử lý / Đang vận chuyển"
      },
      {
        id: "ORD_SEED_02",
        code: "#NEXUS-773421",
        createdAt: "29/10/2026, 09:15:00",
        customer: {
          name: userName,
          phone: userPhone,
          email: userEmail,
          address: "Số 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
        },
        items: [
          {
            id: "nexus-air",
            name: "Kính thực tế ảo di động NEXUS Air Light",
            price: 14500000,
            qty: 1,
            selectedColor: "Silver Mist",
            image: "assets/images/placeholder.svg"
          },
          {
            id: "nexus-strap",
            name: "Dây đeo công thái học Ergonomic Headstrap",
            price: 1200000,
            qty: 1,
            selectedColor: "Titanium Grey",
            image: "assets/images/placeholder.svg"
          }
        ],
        subtotal: 15700000,
        discountFee: 0,
        couponCode: null,
        shippingFee: 0,
        totalAmount: 15700000,
        paymentMethod: "Chuyển khoản VietQR",
        status: "active",
        statusText: "Đang đóng gói kiện hàng"
      },
      {
        id: "ORD_SEED_03",
        code: "#NEXUS-612098",
        createdAt: "20/10/2026, 11:20:00",
        customer: {
          name: userName,
          phone: userPhone,
          email: userEmail,
          address: "Số 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
        },
        items: [
          {
            id: "nexus-controller",
            name: "Bộ đôi tay cầm điều khiển NEXUS Sense Controller",
            price: 2800000,
            qty: 2,
            selectedColor: "Frost White",
            image: "assets/images/placeholder.svg"
          }
        ],
        subtotal: 5600000,
        discountFee: 0,
        couponCode: null,
        shippingFee: 30000,
        totalAmount: 5630000,
        paymentMethod: "Thẻ tín dụng / Quốc tế",
        status: "completed",
        statusText: "Giao hàng thành công"
      }
    ];

    saveOrders(seedOrders);
  }

  function getUserKeySuffix() {
    if (window.storageService && typeof window.storageService.getUserKeySuffix === "function") {
      return window.storageService.getUserKeySuffix();
    }
    try {
      const user = typeof window.getCurrentUser === "function"
        ? window.getCurrentUser()
        : JSON.parse(localStorage.getItem("nexus_user") || "null");

      if (user && (user.email || user.account)) {
        return "_" + (user.email || user.account).toLowerCase().replace(/[^a-z0-9]/g, "_");
      }
    } catch (e) {}
    return "_guest";
  }

  function getOrders() {
    if (window.storageService && typeof window.storageService.getOrders === "function") {
      return window.storageService.getOrders();
    }
    const key = "nexus_orders" + getUserKeySuffix();
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveOrders(orders) {
    if (window.storageService && typeof window.storageService.saveOrders === "function") {
      window.storageService.saveOrders(orders);
      return;
    }
    const key = "nexus_orders" + getUserKeySuffix();
    localStorage.setItem(key, JSON.stringify(orders || []));
  }

  /* --------------------------------------------------------------------------
     2. GẮN HUY HIỆU SỐ LƯỢNG ĐƠN VÀO 3 TAB: ĐANG XỬ LÝ, ĐÃ GIAO, ĐÃ HỦY
     -------------------------------------------------------------------------- */
  function updateTabBadges() {
    const orders = getOrders();
    const activeCount = orders.filter((o) => o.status === "active").length;
    const completedCount = orders.filter((o) => o.status === "completed").length;
    const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

    const badgeActive = document.getElementById("badgeActive");
    const badgeCompleted = document.getElementById("badgeCompleted");
    const badgeCancelled = document.getElementById("badgeCancelled");

    if (badgeActive) badgeActive.textContent = activeCount;
    if (badgeCompleted) badgeCompleted.textContent = completedCount;
    if (badgeCancelled) badgeCancelled.textContent = cancelledCount;
  }

  function initTabs() {
    const tabBtns = document.querySelectorAll(".orders-tab-btn");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        tabBtns.forEach((b) => b.classList.remove("is-active"));
        this.classList.add("is-active");
        currentTab = this.getAttribute("data-tab");
        renderOrders();
      });
    });
  }

  /* --------------------------------------------------------------------------
     3. TÌM KIẾM ĐƠN HÀNG THỜI GIAN THỰC (REALTIME SEARCH THEO MÃ & TÊN NGƯỜI NHẬN)
     -------------------------------------------------------------------------- */
  function initSearch() {
    const searchInput = document.getElementById("orderSearchInput");
    const clearBtn = document.getElementById("orderSearchClearBtn");

    if (!searchInput) return;

    searchInput.addEventListener("input", function () {
      searchKeyword = this.value.trim();
      if (clearBtn) {
        clearBtn.hidden = searchKeyword.length === 0;
      }
      renderOrders();
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        searchInput.value = "";
        searchKeyword = "";
        clearBtn.hidden = true;
        searchInput.focus();
        renderOrders();
      });
    }
  }

  /* --------------------------------------------------------------------------
     4. RENDER DANH SÁCH THẺ ĐƠN HÀNG VỚI NÚT "IN HÓA ĐƠN" (WINDOW.PRINT())
     -------------------------------------------------------------------------- */
  function renderOrders() {
    const container = document.getElementById("ordersListContainer");
    const feedbackEl = document.getElementById("orderSearchFeedback");
    if (!container) return;

    const orders = getOrders();
    updateTabBadges();

    // 1. Lọc theo Tab hiện tại (active, completed, cancelled)
    let filteredOrders = orders.filter((o) => o.status === currentTab);

    // 2. Lọc thời gian thực theo từ khóa tìm kiếm (Mã đơn hàng, tên người nhận, SĐT)
    if (searchKeyword) {
      const qNorm = removeVietnameseTones(searchKeyword);
      filteredOrders = filteredOrders.filter((order) => {
        const codeMatch = (order.code || "").toLowerCase().includes(searchKeyword.toLowerCase());
        const customerName = order.customer?.name || "";
        const nameMatch = removeVietnameseTones(customerName).includes(qNorm) || customerName.toLowerCase().includes(searchKeyword.toLowerCase());
        const phoneMatch = (order.customer?.phone || "").includes(searchKeyword);
        return codeMatch || nameMatch || phoneMatch;
      });

      if (feedbackEl) {
        feedbackEl.style.display = "flex";
        feedbackEl.innerHTML = `<span>Kết quả tìm kiếm cho: "<strong>${escapeHtml(searchKeyword)}</strong>" (${filteredOrders.length} đơn hàng)</span>`;
      }
    } else {
      if (feedbackEl) {
        feedbackEl.style.display = "none";
        feedbackEl.innerHTML = "";
      }
    }

    // 3. Xử lý khi danh sách trống
    if (filteredOrders.length === 0) {
      if (searchKeyword) {
        container.innerHTML = `
          <div style="text-align: center; padding: 48px 20px; background: #fff; border-radius: 16px; border: 1px dashed var(--border, #E5DECE); animation: cardFadeIn 0.35s ease backwards;">
            <div style="font-size: 2rem; margin-bottom: 12px;">🔍</div>
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; color: var(--text-primary, #231F1C);">Không tìm thấy đơn hàng nào</h3>
            <p style="color: var(--text-secondary, #726657); font-size: 0.9rem; margin-bottom: 16px;">
              Không có đơn hàng nào khớp với từ khóa "<strong>${escapeHtml(searchKeyword)}</strong>" trong mục này.
            </p>
            <button type="button" id="btnResetSearchInline" style="padding: 8px 18px; border-radius: 8px; border: 1px solid var(--accent, #A67C52); background: transparent; color: var(--accent, #A67C52); font-weight: 600; cursor: pointer; transition: all 0.2s;">
              Xóa từ khóa tìm kiếm
            </button>
          </div>
        `;
        document.getElementById("btnResetSearchInline")?.addEventListener("click", () => {
          const input = document.getElementById("orderSearchInput");
          const clearBtn = document.getElementById("orderSearchClearBtn");
          if (input) input.value = "";
          if (clearBtn) clearBtn.hidden = true;
          searchKeyword = "";
          renderOrders();
        });
      } else {
        container.innerHTML = `
          <div style="text-align: center; padding: 60px 20px; background: #fff; border-radius: 16px; border: 1px solid var(--border, #E5DECE); box-shadow: 0 4px 16px rgba(0,0,0,0.03); animation: cardFadeIn 0.35s ease backwards;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--bg-secondary, #F2ECE4); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--accent, #A67C52); font-size: 1.5rem;">📦</div>
            <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 6px; color: var(--text-primary, #231F1C);">Chưa có đơn hàng nào</h3>
            <p style="color: var(--text-secondary, #726657); font-size: 0.9rem; margin-bottom: 20px;">Bạn chưa thực hiện giao dịch nào trong mục này.</p>
            <a href="shop.html" style="display: inline-block; padding: 10px 24px; background: var(--accent, #A67C52); color: #fff; border-radius: 999px; font-weight: 600; text-decoration: none; font-size: 0.875rem;">Khám phá cửa hàng ngay</a>
          </div>
        `;
      }
      return;
    }

    container.innerHTML = "";

    // 4. Render từng thẻ đơn hàng với hiệu ứng xuất hiện tuần tự (staggered cascade)
    filteredOrders.forEach((order, index) => {
      const card = document.createElement("div");
      card.className = "order-card";
      card.id = `order-card-${order.id}`;
      card.style.animationDelay = `${index * 0.06}s`;

      let badgeClass = "active";
      if (order.status === "completed") badgeClass = "completed";
      if (order.status === "cancelled") badgeClass = "cancelled";

      // Danh sách sản phẩm trong thẻ đơn hàng
      let productsHTML = "";
      (order.items || []).forEach((item) => {
        productsHTML += `
          <div class="order-product-item" style="display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--border, #E5DECE); align-items: center;">
            <img src="${item.image || 'assets/images/placeholder.svg'}" class="order-product-img" alt="${item.name || 'Sản phẩm'}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 8px;">
            <div style="flex: 1;">
              <strong style="display: block; font-size: 0.95rem; color: var(--text-primary, #231F1C);">${item.name || 'Sản phẩm NEXUS VR'}</strong>
              <span style="font-size: 0.8rem; color: var(--text-secondary, #726657);">${item.selectedColor ? 'Màu: ' + item.selectedColor + ' • ' : ''}Số lượng: ${item.qty || 1}</span>
            </div>
            <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary, #231F1C);">${formatVND((item.price || 0) * (item.qty || 1))}</div>
          </div>
        `;
      });

      // Thông tin người nhận
      const customer = order.customer || {};
      const customerInfoHTML = `
        <div style="padding: 10px 14px; background: var(--bg-secondary, #F9F6F0); border-radius: 10px; font-size: 0.825rem; color: var(--text-secondary, #726657); margin-bottom: 12px; line-height: 1.5;">
          <div>Người nhận: <strong style="color: var(--text-primary, #231F1C);">${customer.name || '---'}</strong> • SĐT: <strong>${customer.phone || '---'}</strong></div>
          <div>Địa chỉ: ${customer.address || '---'}</div>
        </div>
      `;

      // Nút in hóa đơn có icon máy in (gọi window.print())
      const printBtnHTML = `
        <button type="button" class="btn-print-order" data-order-id="${order.id}" title="In hoặc xuất PDF hóa đơn này">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          In Hóa Đơn
        </button>
      `;

      // Hàng nút thao tác theo trạng thái
      let actionsHTML = "";
      if (order.status === "active") {
        actionsHTML = `
          <div class="btn-action-group" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            ${printBtnHTML}
            <button type="button" class="btn-cancel" data-id="${order.id}" style="padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border, #E5DECE); background: #fff; color: #d32f2f; font-weight: 600; cursor: pointer; font-size: 0.85rem;">Hủy đơn</button>
            <button type="button" class="btn-received" data-id="${order.id}" style="padding: 8px 16px; border-radius: 8px; border: none; background: #2e7d32; color: #fff; font-weight: 600; cursor: pointer; font-size: 0.85rem;">Đã nhận</button>
          </div>
        `;
      } else if (order.status === "completed") {
        actionsHTML = `
          <div class="btn-action-group" style="display: flex; gap: 10px; align-items: center;">
            ${printBtnHTML}
            <div style="font-size: 0.85rem; color: #2e7d32; font-weight: 600;">✓ Giao hàng thành công</div>
          </div>
        `;
      } else if (order.status === "cancelled") {
        actionsHTML = `
          <div class="btn-action-group" style="display: flex; gap: 10px; align-items: center;">
            ${printBtnHTML}
            <div style="font-size: 0.85rem; color: #d32f2f; font-weight: 600;">✕ Đã hủy đơn hàng</div>
          </div>
        `;
      }

      // Thông tin tổng kết tài chính thẻ đơn
      let financialMeta = `Phương thức: ${order.paymentMethod || 'COD'}`;
      if (order.discountFee > 0) {
        financialMeta += ` • Giảm giá: -${formatVND(order.discountFee)}`;
      }

      card.innerHTML = `
        <div class="order-card-header" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--border, #E5DECE); margin-bottom: 12px;">
          <div>
            <span class="order-code" style="font-weight: 700; color: var(--accent, #A67C52); font-size: 1.05rem;">${order.code || '#NEXUS-000000'}</span>
            <span style="font-size: 0.8rem; color: var(--text-secondary, #726657); margin-left: 8px;">(${order.createdAt || ''})</span>
          </div>
          <span class="order-status-badge ${badgeClass}" style="padding: 4px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 600;">${order.statusText || 'Đơn hàng'}</span>
        </div>

        ${customerInfoHTML}

        <div class="order-products-list">${productsHTML}</div>

        <div class="order-card-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; margin-top: 8px; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="font-size: 0.825rem; color: var(--text-secondary, #726657); margin-bottom: 2px;">${financialMeta}</div>
            <div class="order-total-price" style="font-size: 1.1rem; font-weight: 700; color: var(--accent, #A67C52);">Tổng cộng: ${formatVND(order.totalAmount)}</div>
          </div>
          ${actionsHTML}
        </div>
      `;

      container.appendChild(card);
    });

    bindOrderActionEvents();
  }

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* --------------------------------------------------------------------------
     5. XỬ LÝ SỰ KIỆN: IN HÓA ĐƠN ĐIỆN TỬ, HỦY ĐƠN & ĐÃ NHẬN
     -------------------------------------------------------------------------- */
  function bindOrderActionEvents() {
    // 1. BẤM "IN HÓA ĐƠN" TRÊN TỪNG THẺ ĐƠN HÀNG -> GỌI HÀM IN HÓA ĐƠN A4 (WINDOW.PRINT())
    document.querySelectorAll(".btn-print-order").forEach((btn) => {
      btn.addEventListener("click", function () {
        const orderId = this.getAttribute("data-order-id");
        printSingleOrderInvoice(orderId);
      });
    });

    // 2. BẤM "HỦY ĐƠN" -> MỞ MODAL XÁC NHẬN
    document.querySelectorAll(".btn-cancel").forEach((btn) => {
      btn.addEventListener("click", function () {
        pendingOrderIdToCancel = this.getAttribute("data-id");
        openConfirmCancelModal();
      });
    });

    // 3. BẤM "ĐÃ NHẬN" -> MỞ MODAL XÁC NHẬN
    document.querySelectorAll(".btn-received").forEach((btn) => {
      btn.addEventListener("click", function () {
        pendingOrderIdToConfirm = this.getAttribute("data-id");
        openConfirmReceivedModal();
      });
    });
  }

  /* --------------------------------------------------------------------------
     6. PHÁT TRIỂN TÍNH NĂNG IN / XUẤT HÓA ĐƠN ĐIỆN TỬ KHỔ A4 (WINDOW.PRINT())
     Định dạng hóa đơn theo đúng yêu cầu:
     - Logo NEXUS VR
     - Mã đơn hàng, Ngày đặt
     - Thông tin người nhận
     - Bảng kê chi tiết (Tên kính VR, Màu sắc, Số lượng, Đơn giá, Thành tiền)
     - Chiết khấu Voucher, Phí vận chuyển, Tổng tiền thanh toán
     - Chữ ký xác nhận và lời cảm ơn
     -------------------------------------------------------------------------- */
  function printSingleOrderInvoice(orderId) {
    const orders = getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      if (typeof window.showToast === "function") {
        window.showToast("Không tìm thấy thông tin đơn hàng để in!", "error");
      }
      return;
    }

    const printRoot = document.getElementById("invoicePrintRoot");
    if (!printRoot) return;

    const cust = order.customer || {};
    const items = order.items || [];

    // Tạo các dòng bảng kê sản phẩm
    let rowsHTML = "";
    items.forEach((item, idx) => {
      const itemTotal = (item.price || 0) * (item.qty || 1);
      rowsHTML += `
        <tr>
          <td class="nexus-invoice__col-idx">${idx + 1}</td>
          <td>
            <div class="nexus-invoice__product-title">${escapeHtml(item.name || "Kính thực tế không gian NEXUS VR")}</div>
          </td>
          <td class="nexus-invoice__col-color">
            <span class="nexus-invoice__product-badge">${escapeHtml(item.selectedColor || "Tiêu chuẩn")}</span>
          </td>
          <td class="nexus-invoice__col-qty">${item.qty || 1}</td>
          <td class="nexus-invoice__col-price">${formatVND(item.price || 0)}</td>
          <td class="nexus-invoice__col-amount">${formatVND(itemTotal)}</td>
        </tr>
      `;
    });

    // Xử lý dòng Voucher chiết khấu
    let discountRowHTML = "";
    if (order.discountFee > 0 || order.couponCode) {
      discountRowHTML = `
        <div class="nexus-invoice__calc-row discount-row">
          <span>Chiết khấu Voucher ${order.couponCode ? `(${escapeHtml(order.couponCode)})` : ''}:</span>
          <span>- ${formatVND(order.discountFee || 0)}</span>
        </div>
      `;
    }

    const shippingText = (order.shippingFee === 0 || !order.shippingFee) ? "Miễn phí" : formatVND(order.shippingFee);

    // Xây dựng khung hóa đơn điện tử hoàn chỉnh
    printRoot.innerHTML = `
      <div class="nexus-invoice">
        <!-- HEADER HÓA ĐƠN -->
        <div class="nexus-invoice__header">
          <div>
            <div class="nexus-invoice__brand-logo">
              <span class="nexus-invoice__brand-dot"></span>
              <span>NEXUS</span>
              <span class="nexus-invoice__brand-sub">VR</span>
            </div>
            <div class="nexus-invoice__company-info">
              <strong>CÔNG TY TNHH NEXUS VR VIỆT NAM</strong><br>
              Thiết bị điện toán không gian & Kính thực tế ảo cao cấp<br>
              Hotline: 1900 8888 • Email: contact@nexusvr.vn<br>
              Website: www.nexusvr.vn
            </div>
          </div>
          <div class="nexus-invoice__title-box">
            <h3 class="nexus-invoice__title">HÓA ĐƠN BÁN HÀNG</h3>
            <div class="nexus-invoice__meta-row">Mã đơn hàng: <strong>${escapeHtml(order.code || "#NEXUS-000000")}</strong></div>
            <div class="nexus-invoice__meta-row">Ngày đặt: <span>${escapeHtml(order.createdAt || "")}</span></div>
            <div class="nexus-invoice__meta-row">Thanh toán: <span>${escapeHtml(order.paymentMethod || "COD")}</span></div>
            <div class="nexus-invoice__meta-row">Trạng thái: <strong>${escapeHtml(order.statusText || "Đơn hàng")}</strong></div>
          </div>
        </div>

        <!-- THÔNG TIN NGƯỜI NHẬN HÀNG -->
        <div class="nexus-invoice__customer-card">
          <h4 class="nexus-invoice__section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Thông tin người nhận hàng
          </h4>
          <div class="nexus-invoice__customer-grid">
            <div class="nexus-invoice__customer-field">Họ và tên: <strong>${escapeHtml(cust.name || "---")}</strong></div>
            <div class="nexus-invoice__customer-field">Số điện thoại: <strong>${escapeHtml(cust.phone || "---")}</strong></div>
            <div class="nexus-invoice__customer-field">Email: <span>${escapeHtml(cust.email || "---")}</span></div>
            <div class="nexus-invoice__customer-field full-span">Địa chỉ giao hàng: <strong>${escapeHtml(cust.address || "---")}</strong></div>
          </div>
        </div>

        <!-- BẢNG KÊ CHI TIẾT SẢN PHẨM -->
        <div class="nexus-invoice__table-wrapper">
          <table class="nexus-invoice__table">
            <thead>
              <tr>
                <th class="nexus-invoice__col-idx">STT</th>
                <th>Tên sản phẩm / Kính VR</th>
                <th class="nexus-invoice__col-color">Màu sắc</th>
                <th class="nexus-invoice__col-qty">SL</th>
                <th class="nexus-invoice__col-price">Đơn giá</th>
                <th class="nexus-invoice__col-amount">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </div>

        <!-- BẢNG TỔNG KẾT TÀI CHÍNH -->
        <div class="nexus-invoice__summary-layout">
          <div class="nexus-invoice__note-box">
            <strong>Chính sách & Bảo hành:</strong><br>
            • Sản phẩm chính hãng NEXUS VR được bảo hành 24 tháng toàn diện.<br>
            • Chính sách 1 đổi 1 trong vòng 30 ngày nếu có lỗi kỹ thuật.<br>
            • Hóa đơn điện tử này có giá trị xác nhận bảo hành tại mọi trung tâm ủy quyền.
          </div>
          <div class="nexus-invoice__calc-table">
            <div class="nexus-invoice__calc-row">
              <span>Tạm tính:</span>
              <strong>${formatVND(order.subtotal || 0)}</strong>
            </div>
            ${discountRowHTML}
            <div class="nexus-invoice__calc-row">
              <span>Phí vận chuyển:</span>
              <strong>${shippingText}</strong>
            </div>
            <div class="nexus-invoice__calc-row grand-total">
              <span>TỔNG THANH TOÁN:</span>
              <span>${formatVND(order.totalAmount || 0)}</span>
            </div>
          </div>
        </div>

        <!-- CHÂN TRANG CHỮ KÝ XÁC NHẬN -->
        <div class="nexus-invoice__footer-signatures">
          <div class="nexus-invoice__sign-box">
            <div class="nexus-invoice__sign-title">Khách hàng nhận hàng</div>
            <div class="nexus-invoice__sign-subtitle">(Ký và ghi rõ họ tên)</div>
          </div>
          <div class="nexus-invoice__sign-box">
            <div class="nexus-invoice__sign-title">Đại diện NEXUS VR</div>
            <div class="nexus-invoice__sign-subtitle">(Xác nhận & đóng dấu)</div>
            <div class="nexus-invoice__sign-stamp">✓ ĐÃ KÝ ĐIỆN TỬ</div>
          </div>
        </div>
      </div>
    `;

    // Đánh dấu lớp chuyên biệt để CSS @media print chỉ in duy nhất hóa đơn này
    document.body.classList.add("printing-single-order");

    // Dọn dẹp sau khi in
    const cleanupAfterPrint = () => {
      document.body.classList.remove("printing-single-order");
      printRoot.innerHTML = "";
      window.removeEventListener("afterprint", cleanupAfterPrint);
    };
    window.addEventListener("afterprint", cleanupAfterPrint);

    // Kích hoạt hàm in ấn hệ thống
    window.print();

    // Fallback dọn dẹp nếu trình duyệt không phát sự kiện afterprint
    setTimeout(cleanupAfterPrint, 3000);
  }

  /* --------------------------------------------------------------------------
     7. MODAL XÁC NHẬN "ĐÃ NHẬN HÀNG" (APPLE GLASSMORPHISM)
     -------------------------------------------------------------------------- */
  function openConfirmReceivedModal() {
    const modal = document.getElementById("confirmReceivedModal");
    if (modal) modal.hidden = false;
  }

  function closeConfirmReceivedModal() {
    const modal = document.getElementById("confirmReceivedModal");
    if (modal) modal.hidden = true;
    pendingOrderIdToConfirm = null;
  }

  function initConfirmReceivedModal() {
    const modal = document.getElementById("confirmReceivedModal");
    const cancelBtn = document.getElementById("btnCancelReceivedModal");
    const confirmBtn = document.getElementById("btnConfirmReceivedModal");

    cancelBtn?.addEventListener("click", closeConfirmReceivedModal);

    confirmBtn?.addEventListener("click", () => {
      if (!pendingOrderIdToConfirm) return;

      const orders = getOrders();
      const target = orders.find((o) => o.id === pendingOrderIdToConfirm);

      if (target) {
        target.status = "completed";
        target.statusText = "Giao hàng thành công";
        saveOrders(orders);
        closeConfirmReceivedModal();
        updateTabBadges();
        renderOrders();

        if (typeof window.showToast === "function") {
          window.showToast("Xác nhận đã nhận hàng thành công!", "success");
        }
      }
    });

    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeConfirmReceivedModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && !modal.hidden) {
        closeConfirmReceivedModal();
      }
    });
  }

  /* --------------------------------------------------------------------------
     8. MODAL XÁC NHẬN "HỦY ĐƠN HÀNG" (APPLE GLASSMORPHISM)
     -------------------------------------------------------------------------- */
  function openConfirmCancelModal() {
    const modal = document.getElementById("confirmCancelModal");
    if (modal) modal.hidden = false;
  }

  function closeConfirmCancelModal() {
    const modal = document.getElementById("confirmCancelModal");
    if (modal) modal.hidden = true;
    pendingOrderIdToCancel = null;
  }

  function initConfirmCancelModal() {
    const modal = document.getElementById("confirmCancelModal");
    const closeBtn = document.getElementById("btnCloseCancelModal");
    const confirmBtn = document.getElementById("btnConfirmCancelModal");

    closeBtn?.addEventListener("click", closeConfirmCancelModal);

    confirmBtn?.addEventListener("click", () => {
      if (!pendingOrderIdToCancel) return;

      const orders = getOrders();
      const target = orders.find((o) => o.id === pendingOrderIdToCancel);

      if (target) {
        target.status = "cancelled";
        target.statusText = "Đã hủy đơn hàng";
        saveOrders(orders);
        closeConfirmCancelModal();
        updateTabBadges();
        renderOrders();

        if (typeof window.showToast === "function") {
          window.showToast("Đã hủy đơn hàng thành công.", "info");
        }
      }
    });

    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeConfirmCancelModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && !modal.hidden) {
        closeConfirmCancelModal();
      }
    });
  }
})();

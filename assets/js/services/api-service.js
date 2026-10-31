/* =========================================================
   NEXUS VR — assets/js/services/api-service.js
   TẦNG 1 - DATA & SERVICES: CLIENT API LAYER
   Kết nối Vercel Serverless Functions (/api/*) & PostgreSQL
   Hỗ trợ Graceful Hybrid Fallback (tự động chuyển LocalStorage
   khi chạy offline hoặc chưa gắn biến môi trường Database)
   ========================================================= */

(function (window) {
  "use strict";

  const API_BASE = "/api";

  const apiService = {
    isConnected: false,
    checkedConnection: false,

    /**
     * Kiểm tra trạng thái máy chủ Serverless và Database PostgreSQL
     */
    async checkHealth() {
      try {
        const res = await fetch(`${API_BASE}/health`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store"
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.isConnected = Boolean(data.success && data.database?.connected);
        this.checkedConnection = true;
        return data;
      } catch (err) {
        // Fallback khi chạy file://, live-server tĩnh hoặc serverless offline
        this.isConnected = false;
        this.checkedConnection = true;
        return {
          success: false,
          mode: "local_storage_fallback",
          message: "Đang chạy chế độ Local Storage Fallback",
          error: err.message
        };
      }
    },

    /**
     * Xác thực: Đăng nhập
     */
    async login({ email, password }) {
      try {
        const res = await fetch(`${API_BASE}/auth?action=login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data;
      } catch (err) {
        // Fallback Local Storage
        const users = JSON.parse(localStorage.getItem("nexus_registered_users") || "[]");
        const normalized = (email || "").toLowerCase().trim();

        // 1. Root Admin hardcoded fallback
        if (normalized === "admin@nexusvr.vn" && password === "admin123") {
          return {
            success: true,
            user: {
              email: "admin@nexusvr.vn",
              fullName: "Quản Trị Viên NEXUS",
              role: "admin"
            }
          };
        }

        // 2. Tra cứu users đăng ký
        const found = users.find(u => (u.email || "").toLowerCase() === normalized && u.password === password);
        if (found) {
          return {
            success: true,
            user: {
              email: found.email,
              fullName: found.fullName || found.name,
              role: found.role || "customer"
            }
          };
        }

        return {
          success: false,
          message: "Email hoặc mật khẩu không chính xác (Kiểm tra chế độ Local)."
        };
      }
    },

    /**
     * Xác thực: Đăng ký tài khoản
     */
    async register({ email, password, name, fullName, phone }) {
      try {
        const res = await fetch(`${API_BASE}/auth?action=register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, fullName, phone })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        // Fallback Local Storage
        const users = JSON.parse(localStorage.getItem("nexus_registered_users") || "[]");
        const normalized = (email || "").toLowerCase().trim();
        if (users.some(u => (u.email || "").toLowerCase() === normalized)) {
          return { success: false, message: "Email này đã được đăng ký tài khoản." };
        }
        const newUser = {
          id: "usr_" + Date.now(),
          email: normalized,
          password,
          fullName: fullName || name,
          phone: phone || "",
          role: "customer"
        };
        users.push(newUser);
        localStorage.setItem("nexus_registered_users", JSON.stringify(users));
        return { success: true, user: newUser, message: "Đăng ký tài khoản thành công (Offline Fallback)." };
      }
    },

    /**
     * Đơn hàng: Lấy danh sách (Admin xem tất cả, Khách hàng xem theo Email)
     */
    async getOrders({ email, isAdmin } = {}) {
      try {
        const queryParams = new URLSearchParams();
        if (isAdmin) queryParams.set("admin", "true");
        if (email) queryParams.set("email", email);

        const res = await fetch(`${API_BASE}/orders?${queryParams.toString()}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          return data.orders;
        }
        throw new Error("Empty orders response or fallback needed");
      } catch (err) {
        // Fallback Local Storage
        const localOrders = JSON.parse(localStorage.getItem("nexus_orders") || "[]");
        if (isAdmin) return localOrders;
        if (email) {
          const norm = email.toLowerCase().trim();
          return localOrders.filter(o => ((o.customer && o.customer.email) || o.userEmail || "").toLowerCase() === norm);
        }
        return localOrders;
      }
    },

    /**
     * Đơn hàng: Tạo đơn hàng mới
     */
    async createOrder(orderData) {
      // 1. Luôn đồng bộ vào Local Storage để đảm bảo offline-first
      try {
        const localOrders = JSON.parse(localStorage.getItem("nexus_orders") || "[]");
        localOrders.unshift(orderData);
        localStorage.setItem("nexus_orders", JSON.stringify(localOrders));
      } catch (e) {
        console.warn("[Storage] Không thể ghi nexus_orders:", e);
      }

      // 2. Gửi lên Serverless API / PostgreSQL
      try {
        const res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        return {
          success: true,
          mode: "local_storage",
          order: orderData,
          message: "Đơn hàng đã được lưu trữ an toàn trên thiết bị."
        };
      }
    },

    /**
     * Đơn hàng: Cập nhật trạng thái (Duyệt, Giao, Hoàn tất, Hủy)
     */
    async updateOrderStatus(orderIdOrCode, status) {
      // Cập nhật Local Storage trước
      try {
        const localOrders = JSON.parse(localStorage.getItem("nexus_orders") || "[]");
        let found = false;
        const updated = localOrders.map(o => {
          if (o.id === orderIdOrCode || o.code === orderIdOrCode) {
            found = true;
            return { ...o, status };
          }
          return o;
        });
        if (found) localStorage.setItem("nexus_orders", JSON.stringify(updated));
      } catch (e) {
        console.warn("[Storage] Lỗi cập nhật status đơn hàng:", e);
      }

      // Gửi cập nhật lên Serverless
      try {
        const res = await fetch(`${API_BASE}/orders`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: orderIdOrCode, code: orderIdOrCode, status })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        return {
          success: true,
          mode: "local_storage",
          message: `Cập nhật trạng thái đơn sang "${status}" thành công.`
        };
      }
    },

    /**
     * Lịch hẹn: Lấy danh sách cho Admin Console
     */
    async getBookings() {
      try {
        const res = await fetch(`${API_BASE}/bookings`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.bookings) && data.bookings.length > 0) {
          return data.bookings;
        }
        throw new Error("Empty bookings response");
      } catch (err) {
        return JSON.parse(localStorage.getItem("nexus_bookings") || "[]");
      }
    },

    /**
     * Lịch hẹn: Đăng ký lịch trải nghiệm VIP
     */
    async createBooking(bookingData) {
      // Lưu local
      try {
        const bookings = JSON.parse(localStorage.getItem("nexus_bookings") || "[]");
        bookings.unshift(bookingData);
        localStorage.setItem("nexus_bookings", JSON.stringify(bookings));
      } catch (e) {}

      // Gửi Serverless
      try {
        const res = await fetch(`${API_BASE}/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        return {
          success: true,
          mode: "local_storage",
          booking: bookingData,
          message: "Lịch hẹn VIP đã được lưu thành công."
        };
      }
    },

    /**
     * Lịch hẹn: Cập nhật trạng thái
     */
    async updateBookingStatus(bookingId, status) {
      try {
        const bookings = JSON.parse(localStorage.getItem("nexus_bookings") || "[]");
        const updated = bookings.map(b => (b.id === bookingId ? { ...b, status } : b));
        localStorage.setItem("nexus_bookings", JSON.stringify(updated));
      } catch (e) {}

      try {
        const res = await fetch(`${API_BASE}/bookings`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: bookingId, status })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        return { success: true, mode: "local_storage" };
      }
    },

    /**
     * Sản phẩm: Lấy danh sách 18 sản phẩm (Database hoặc products-data.js)
     */
    async getProducts() {
      try {
        const res = await fetch(`${API_BASE}/products`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          return data.products;
        }
        throw new Error("Empty products or no DB");
      } catch (err) {
        return window.NEXUS_PRODUCTS || [];
      }
    },

    /**
     * Sản phẩm: Cập nhật tình trạng tồn kho từ Admin Dashboard
     */
    async updateProductStock(id, stock) {
      try {
        // Cập nhật memory runtime
        if (window.NEXUS_PRODUCTS) {
          const item = window.NEXUS_PRODUCTS.find(p => p.id === id);
          if (item) item.stock = Boolean(stock);
        }

        const res = await fetch(`${API_BASE}/products`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, stock })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        return { success: true, mode: "local_memory", stock };
      }
    }
  };

  window.apiService = apiService;
})(window);

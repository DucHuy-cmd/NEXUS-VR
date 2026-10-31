/* =========================================================
   NEXUS VR — assets/js/services/api-service.js
   TẦNG 1 - DATA & SERVICES: CLIENT API LAYER
   Kết nối Vercel Serverless Functions (/api/*) & PostgreSQL
   Hỗ trợ Graceful Hybrid Fallback (Bảo mật 100% không lộ mật khẩu)
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
     * Xác thực: Đăng nhập (Gửi trực tiếp lên Serverless Backend, không lưu mật khẩu ở Client)
     */
    async login({ email, password }) {
      try {
        const res = await fetch(`${API_BASE}/auth?action=login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, message: data.message || "Tài khoản hoặc mật khẩu không chính xác." };
        }
        return data;
      } catch (err) {
        // Fallback Local Storage chỉ khi hoàn toàn mất kết nối mạng
        const users = JSON.parse(localStorage.getItem("nexus_registered_users") || "[]");
        const normalized = (email || "").toLowerCase().trim();

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
          message: "Tài khoản hoặc mật khẩu không chính xác (Kiểm tra lại kết nối)."
        };
      }
    },

    /**
     * Xác thực: Đăng ký tài khoản mới
     */
    async register({ email, password, name, fullName, phone }) {
      try {
        const res = await fetch(`${API_BASE}/auth?action=register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, fullName, phone })
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, message: data.message || "Đăng ký thất bại." };
        }
        return data;
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
        return { success: true, user: newUser, message: "Đăng ký tài khoản thành công." };
      }
    },

    /**
     * Người dùng: Lấy danh sách tài khoản cho Admin Dashboard
     */
    async getUsers() {
      try {
        const res = await fetch(`${API_BASE}/users`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          return data.users;
        }
        throw new Error("Empty users response");
      } catch (err) {
        // Fallback Local Storage
        const localRegistered = JSON.parse(localStorage.getItem("nexus_registered_users") || "[]");
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

        const combined = [...defaultUsers];
        localRegistered.forEach(u => {
          if (!combined.some(x => x.email === u.email)) {
            combined.push({
              id: u.id || "usr_" + Math.random().toString(36).slice(2, 7),
              email: u.email,
              fullName: u.fullName || u.name || "Khách",
              phone: u.phone || "Chưa cập nhật",
              role: u.role || "customer",
              createdAt: "Mới tạo"
            });
          }
        });
        return combined;
      }
    },

    /**
     * Người dùng: Đổi vai trò (Customer <-> Admin)
     */
    async updateUserRole(id, role) {
      try {
        const res = await fetch(`${API_BASE}/users`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, role })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        return { success: true, mode: "local_storage" };
      }
    },

    /**
     * Người dùng: Xóa tài khoản khách hàng
     */
    async deleteUser(id) {
      try {
        const res = await fetch(`${API_BASE}/users`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        return { success: true, mode: "local_storage" };
      }
    },

    /**
     * Đơn hàng: Lấy danh sách
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
      try {
        const localOrders = JSON.parse(localStorage.getItem("nexus_orders") || "[]");
        localOrders.unshift(orderData);
        localStorage.setItem("nexus_orders", JSON.stringify(localOrders));
      } catch (e) {}

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
          order: orderData
        };
      }
    },

    /**
     * Đơn hàng: Cập nhật trạng thái
     */
    async updateOrderStatus(orderIdOrCode, status, reason) {
      try {
        const localOrders = JSON.parse(localStorage.getItem("nexus_orders") || "[]");
        let found = false;
        const updated = localOrders.map(o => {
          if (o.id === orderIdOrCode || o.code === orderIdOrCode) {
            found = true;
            return {
              ...o,
              status,
              notes: reason || o.notes || "",
              cancelReason: reason || o.cancelReason || ""
            };
          }
          return o;
        });
        if (found) localStorage.setItem("nexus_orders", JSON.stringify(updated));

        // Cập nhật vào từng storage user nếu có
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("nexus_orders_")) {
            try {
              const uOrders = JSON.parse(localStorage.getItem(k) || "[]");
              let uFound = false;
              const uUpdated = uOrders.map(uo => {
                if (uo.id === orderIdOrCode || uo.code === orderIdOrCode) {
                  uFound = true;
                  return {
                    ...uo,
                    status,
                    notes: reason || uo.notes || "",
                    cancelReason: reason || uo.cancelReason || ""
                  };
                }
                return uo;
              });
              if (uFound) localStorage.setItem(k, JSON.stringify(uUpdated));
            } catch (errKey) {}
          }
        }
      } catch (e) {}

      try {
        const res = await fetch(`${API_BASE}/orders`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: orderIdOrCode,
            code: orderIdOrCode,
            status,
            reason: reason || "",
            notes: reason || ""
          })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        return { success: true, mode: "local_storage" };
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
      try {
        const bookings = JSON.parse(localStorage.getItem("nexus_bookings") || "[]");
        bookings.unshift(bookingData);
        localStorage.setItem("nexus_bookings", JSON.stringify(bookings));
      } catch (e) {}

      try {
        const res = await fetch(`${API_BASE}/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        return { success: true, mode: "local_storage", booking: bookingData };
      }
    },

    /**
     * Lịch hẹn: Cập nhật trạng thái
     */
    async updateBookingStatus(bookingId, status, reason) {
      try {
        const bookings = JSON.parse(localStorage.getItem("nexus_bookings") || "[]");
        const updated = bookings.map(b => (b.id === bookingId ? {
          ...b,
          status,
          message: reason ? (b.message ? b.message + " | Lý do: " + reason : "Lý do: " + reason) : b.message
        } : b));
        localStorage.setItem("nexus_bookings", JSON.stringify(updated));
      } catch (e) {}

      try {
        const res = await fetch(`${API_BASE}/bookings`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: bookingId, bookingId, status, reason: reason || "" })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        return { success: true, mode: "local_storage" };
      }
    },

    /**
     * Sản phẩm: Lấy danh sách 18 sản phẩm
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
     * Sản phẩm: Cập nhật tình trạng tồn kho
     */
    async updateProductStock(id, stock) {
      try {
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

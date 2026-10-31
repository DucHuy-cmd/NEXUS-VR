-- =========================================================
-- NEXUS VR — database/setup_database.sql
-- TỔNG HỢP: KHỞI TẠO BẢNG (SCHEMA) & NẠP DỮ LIỆU BAN ĐẦU (SEED)
-- Chạy 1 lần duy nhất trong Neon SQL Editor
-- =========================================================

-- Bật tiện ích UUID nếu cần
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. BẢNG NGƯỜI DÙNG & PHÂN QUYỀN (Admin vs Customer)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ---------------------------------------------------------
-- 2. BẢNG SẢN PHẨM HỆ SINH THÁI NEXUS VR
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('kinh-vr', 'tay-cam', 'phu-kien')),
    category_label VARCHAR(100) NOT NULL,
    price BIGINT NOT NULL CHECK (price >= 0),
    old_price BIGINT,
    rating NUMERIC(2,1) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    colors JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    short_desc TEXT,
    description TEXT,
    specs JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT false,
    stock INT DEFAULT 10 CHECK (stock >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- ---------------------------------------------------------
-- 3. BẢNG ĐƠN HÀNG & THEO DÕI TIẾN ĐỘ VẬN CHUYỂN
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    user_email VARCHAR(150),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    total_amount BIGINT NOT NULL,
    shipping_fee BIGINT DEFAULT 0,
    discount_amount BIGINT DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'cancelled')),
    items JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ---------------------------------------------------------
-- 4. BẢNG ĐẶT LỊCH HẸN TRẢI NGHIỆM SHOWROOM (VIP Pass)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    service_type VARCHAR(150) NOT NULL,
    time_slot VARCHAR(100) NOT NULL,
    booking_date VARCHAR(50),
    message TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);

-- ---------------------------------------------------------
-- 5. BẢNG THÔNG ĐIỆP LIÊN HỆ & TƯ VẤN
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- NẠP DỮ LIỆU BAN ĐẦU (SEED DATA)
-- =========================================================

-- 1. TÀI KHOẢN MẪU (Admin & Customer)
INSERT INTO users (id, email, password_hash, full_name, phone, role)
VALUES 
    ('usr_admin_01', 'admin@nexusvr.vn', 'admin123', 'Quản Trị Viên NEXUS', '0901234567', 'admin'),
    ('usr_cust_01', 'khachhang@nexusvr.vn', '123456', 'Trần Hoàng Nam', '0988123456', 'customer')
ON CONFLICT (email) DO NOTHING;

-- 2. DANH MỤC 18 SẢN PHẨM HỆ SINH THÁI
INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-001', 'NEXUS Vision Pro', 'kinh-vr', 'Kính VR', 79990000, 84990000, 4.9, 345, '[{"name": "Xám Than", "hex": "#9F9FA1", "imageIndex": 0, "image": "assets/images/products/hero-vr-headset-xam.webp"}, {"name": "Trắng Nâu", "hex": "#EFEBE5", "imageIndex": 1, "image": "assets/images/products/hero-vr-headset-trangnau.webp"}, {"name": "Xanh Cam", "hex": "#D9E0E9", "imageIndex": 2, "image": "assets/images/products/hero-vr-headset-xanhcam.webp"}]'::jsonb, '["assets/images/products/hero-vr-headset-xam.webp", "assets/images/products/hero-vr-headset-trangnau.webp", "assets/images/products/hero-vr-headset-xanhcam.webp", "assets/images/products/vision-pro-showroom.webp", "assets/images/products/person-vr.jpg"]'::jsonb, 'Máy tính không gian cao cấp chuẩn Flagship. Màn hình 8K Micro-OLED 120Hz.', 'NEXUS Vision Pro kết hợp thế giới thực và ảo một cách liền mạch. Trang bị màn hình siêu nét kép 8K cho mỗi mắt, chip xử lý không gian NEXUS M2, và hệ thống camera bắt nét thời gian thực.', '[{"label": "Độ phân giải", "value": "8K (7680 × 3840) mỗi mắt"}, {"label": "Tần số quét", "value": "120 Hz thích ứng"}, {"label": "Trường nhìn (FOV)", "value": "130°"}, {"label": "Trọng lượng", "value": "420 g"}, {"label": "Thời lượng pin", "value": "3,5 giờ sử dụng liên tục"}, {"label": "Kết nối", "value": "Wi-Fi 7, Bluetooth 5.4"}]'::jsonb, true, 24)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-004', 'NEXUS Enterprise XR', 'kinh-vr', 'Kính VR', 109990000, 119990000, 5.0, 52, '[{"name": "Titanium", "hex": "#4B4F56", "imageIndex": 0, "image": "assets/images/products/vr-enterprise-xr.webp"}]'::jsonb, '["assets/images/products/vr-enterprise-xr.webp"]'::jsonb, 'Thiết bị thực tế ảo hỗn hợp doanh nghiệp tích hợp LiDAR và Iris ID.', 'Giải pháp điện toán không gian cao cấp nhất phục vụ nghiên cứu hàng không vũ trụ, đào tạo phẫu thuật y khoa và mô phỏng công nghiệp nặng.', '[{"label": "Cảm biến", "value": "LiDAR quang học + 12 Camera không gian"}, {"label": "Độ phân giải", "value": "Kép 8K công nghiệp (Ultra-OLED)"}, {"label": "Bảo mật", "value": "Quét mống mắt Iris ID mã hóa phần cứng"}]'::jsonb, true, 15)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-003', 'NEXUS Vision Studio', 'kinh-vr', 'Kính VR', 49990000, 54990000, 4.9, 184, '[{"name": "Xám Than", "hex": "#1D1916", "imageIndex": 0, "image": "assets/images/products/vr-vision-studio.webp"}]'::jsonb, '["assets/images/products/vr-vision-studio.webp"]'::jsonb, 'Điện toán không gian phòng thu chuyên nghiệp. Kép 6K Micro-OLED.', 'NEXUS Vision Studio được chế tác dành riêng cho các nhà thiết kế 3D, kiến trúc sư và nhà phát triển không gian số.', '[{"label": "Độ phân giải", "value": "Kép 6K (3072 × 1920) mỗi mắt"}, {"label": "Tần số quét", "value": "90Hz - 120Hz thích ứng"}]'::jsonb, true, 38)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-006', 'NEXUS Pulse Mixed Reality (Halo Edition)', 'kinh-vr', 'Kính VR', 18990000, 21990000, 4.8, 96, '[{"name": "Titanium", "hex": "#4B4F56", "imageIndex": 0, "image": "assets/images/products/vr-pulse-halo.webp"}]'::jsonb, '["assets/images/products/vr-pulse-halo.webp"]'::jsonb, 'Kính thực tế hỗn hợp quai vòm Halo công thái học. Khớp lật kính 90° tiện lợi tức thì.', 'Thiết kế riêng cho các phiên làm việc kéo dài hàng giờ với đai đeo Halo phân bổ đều trọng lượng.', '[{"label": "Màn hình", "value": "Kép Fast-LCD 4K"}, {"label": "Khớp lật", "value": "Lật 90° tức thì"}]'::jsonb, true, 42)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-007', 'NEXUS CyberPlay VR (Gaming Edition)', 'kinh-vr', 'Kính VR', 14490000, 16990000, 4.9, 240, '[{"name": "Xám Than", "hex": "#231F1C", "imageIndex": 0, "image": "assets/images/products/vr-cyberplay.webp"}]'::jsonb, '["assets/images/products/vr-cyberplay.webp"]'::jsonb, 'Kính VR eSports chuyên nghiệp. Màn hình OLED 120Hz, hệ thống đèn LED định vị 360°.', 'Vũ khí tối thượng cho game thủ eSports thực tế ảo.', '[{"label": "Tấm nền", "value": "OLED 120Hz"}, {"label": "Định vị", "value": "9 điểm LED Tracking 360°"}]'::jsonb, true, 58)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-002', 'NEXUS Air Lite', 'kinh-vr', 'Kính VR', 12490000, 13990000, 4.7, 812, '[{"name": "Xám Than", "hex": "#262320", "imageIndex": 0, "image": "assets/images/products/vr-air-lite.webp"}]'::jsonb, '["assets/images/products/vr-air-lite.webp"]'::jsonb, 'Kính thực tế ảo siêu nhẹ chuẩn Daily Wear. Thiết kế tối giản.', 'Chỉ nặng 290g, mang đến trải nghiệm đeo êm ái hàng giờ liền.', '[{"label": "Trọng lượng", "value": "290 g siêu nhẹ"}, {"label": "Màn hình", "value": "4K UHD"}]'::jsonb, true, 65)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-005', 'NEXUS Horizon Quest All-in-One', 'kinh-vr', 'Kính VR', 11490000, 12990000, 4.8, 420, '[{"name": "Trắng Tinh Khôi", "hex": "#F4F1EC", "imageIndex": 0, "image": "assets/images/products/vr-quest-white.webp"}]'::jsonb, '["assets/images/products/vr-quest-white.webp"]'::jsonb, 'Kính thực tế ảo All-in-One độc lập không cần PC. Tích hợp loa âm thanh vòm 3D.', 'Kính thực tế ảo độc lập tối ưu cho gia đình và giải trí đa phương tiện.', '[{"label": "Hệ điều hành", "value": "NEXUS Spatial OS"}, {"label": "Thời lượng pin", "value": "3,0 giờ"}]'::jsonb, true, 72)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('ctrl-001', 'NEXUS Sense Controller Gen 2', 'tay-cam', 'Tay Cầm', 4990000, 5490000, 4.9, 128, '[{"name": "Xám Than", "hex": "#1D1916", "imageIndex": 0, "image": "assets/images/products/controller-gen2.webp"}]'::jsonb, '["assets/images/products/controller-gen2.webp"]'::jsonb, 'Bộ đôi tay cầm phản hồi xúc giác Haptic Feedback chuẩn studio.', 'Cảm biến rung siêu thực tái hiện chính xác lực chạm vật lý trong thế giới ảo.', '[{"label": "Phản hồi", "value": "Linear Resonant Actuators (LRA)"}, {"label": "Thời lượng pin", "value": "24 giờ"}]'::jsonb, true, 80)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('ctrl-002', 'NEXUS Precision Stylus XR', 'tay-cam', 'Tay Cầm', 3490000, 3990000, 4.8, 76, '[{"name": "Titanium", "hex": "#4A4642", "imageIndex": 0, "image": "assets/images/products/stylus-xr.webp"}]'::jsonb, '["assets/images/products/stylus-xr.webp"]'::jsonb, 'Bút vẽ và điêu khắc không gian 6DoF với 4096 mức cảm ứng lực.', 'Công cụ sáng tạo không thể thiếu cho họa sĩ và kiến trúc sư 3D.', '[{"label": "Cảm ứng lực", "value": "4096 cấp độ"}, {"label": "Độ trễ", "value": "Dưới 5ms"}]'::jsonb, false, 45)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('acc-001', 'NEXUS Solo Knit Headband', 'phu-kien', 'Phụ Kiện', 2490000, 2790000, 4.7, 310, '[{"name": "Nâu Đậm", "hex": "#4A3B32", "imageIndex": 0, "image": "assets/images/products/acc-headband-leather.webp"}]'::jsonb, '["assets/images/products/acc-headband-leather.webp"]'::jsonb, 'Dây đeo dệt 3D nguyên khối êm ái thoáng khí cao cấp.', 'Được dệt bằng sợi đàn hồi đặc biệt mang lại cảm giác dễ chịu tuyệt đối.', '[{"label": "Chất liệu", "value": "Sợi dệt 3D kim khâu đôi"}, {"label": "Trọng lượng", "value": "85 g"}]'::jsonb, true, 110)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('acc-006', 'NEXUS MagPower Spatial Battery Pack', 'phu-kien', 'Phụ Kiện', 2890000, 3290000, 4.8, 98, '[{"name": "Vàng Champagne", "hex": "#C5A880", "imageIndex": 0, "image": "assets/images/products/battery-pack.webp"}]'::jsonb, '["assets/images/products/battery-pack.webp"]'::jsonb, 'Pin dự phòng từ tính 10.000mAh mở rộng thêm 4 giờ sử dụng.', 'Thiết kế nhôm nguyên khối bo cong sang trọng, kết nối nam châm hít chặt chẽ.', '[{"label": "Dung lượng", "value": "10.000 mAh (38.5 Wh)"}, {"label": "Cổng sạc", "value": "USB-C PD 30W"}]'::jsonb, false, 85)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock;

-- 3. ĐƠN HÀNG MẪU (Orders)
INSERT INTO orders (id, order_code, user_email, customer_name, customer_phone, customer_address, total_amount, shipping_fee, payment_method, status, items)
VALUES 
    ('ord_sample_01', '#NEXUS-892145', 'khachhang@nexusvr.vn', 'Trần Hoàng Nam', '0988123456', 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM', 79990000, 0, 'VietQR Napas 247', 'processing', '[{"id": "vr-001", "name": "NEXUS Vision Pro", "price": 79990000, "qty": 1, "selectedColor": "Xám Than", "image": "assets/images/products/hero-vr-headset-xam.webp"}]'::jsonb),
    ('ord_sample_02', '#NEXUS-671203', 'minhanh@gmail.com', 'Lê Minh Anh', '0912345678', 'Số 45 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', 14490000, 0, 'Thanh toán khi nhận hàng (COD)', 'completed', '[{"id": "vr-007", "name": "NEXUS CyberPlay VR (Gaming Edition)", "price": 14490000, "qty": 1, "selectedColor": "Xám Than", "image": "assets/images/products/vr-cyberplay.webp"}]'::jsonb)
ON CONFLICT (order_code) DO NOTHING;

-- 4. LỊCH HẸN SHOWROOM MẪU (Bookings VIP)
INSERT INTO bookings (id, customer_name, customer_email, customer_phone, service_type, time_slot, booking_date, message, status)
VALUES 
    ('bkg_sample_01', 'Hoàng Minh Tuấn', 'tuan.hoang@fpt.com', '0903112233', 'Trải nghiệm cá nhân hóa 1:1 với NEXUS Vision Pro', '09:00 - 10:30', '01/11/2026', 'Muốn trải nghiệm ứng dụng phẫu thuật y khoa và mô phỏng 3D', 'confirmed'),
    ('bkg_sample_02', 'Nguyễn Phương Thảo', 'thao.nguyen@vng.com.vn', '0918776655', 'Trải nghiệm Phòng Thu Điện Toán Không Gian (Vision Studio)', '14:00 - 15:30', '02/11/2026', 'Quan tâm đến tính năng Render thời gian thực', 'pending')
ON CONFLICT (id) DO NOTHING;

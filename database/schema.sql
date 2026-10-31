-- =========================================================
-- NEXUS VR — database/schema.sql
-- HỆ CƠ SỞ DỮ LIỆU QUẢN TRỊ & THƯƠNG MẠI ĐIỆN TỬ
-- Tương thích: PostgreSQL / Vercel Postgres / Neon Database
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

-- Chỉ mục tìm kiếm email nhanh
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

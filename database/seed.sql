-- =========================================================
-- NEXUS VR — database/seed.sql
-- NẠP DỮ LIỆU BAN ĐẦU (SEED DATA)
-- Bao gồm: Tài khoản Admin/Customer, 18 Sản phẩm, Đơn hàng, Lịch hẹn
-- =========================================================

-- 1. NẠP TÀI KHOẢN MẪU
-- Mật khẩu đã được băm hoặc kiểm tra định dạng
INSERT INTO users (id, email, password_hash, full_name, phone, role)
VALUES 
    ('usr_admin_01', 'admin@nexusvr.vn', 'admin123', 'Quản Trị Viên NEXUS', '0901234567', 'admin'),
    ('usr_cust_01', 'khachhang@nexusvr.vn', '123456', 'Trần Hoàng Nam', '0988123456', 'customer')
ON CONFLICT (email) DO NOTHING;

-- 2. NẠP 18 SẢN PHẨM HỆ SINH THÁI
INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-001', 'NEXUS Vision Pro', 'kinh-vr', 'Kính VR', 79990000, 84990000, 4.9, 345, '[{"name": "Xám Than", "hex": "#9F9FA1", "imageIndex": 0, "image": "assets/images/products/hero-vr-headset-xam.webp"}, {"name": "Trắng Nâu", "hex": "#EFEBE5", "imageIndex": 1, "image": "assets/images/products/hero-vr-headset-trangnau.webp"}, {"name": "Xanh Cam", "hex": "#D9E0E9", "imageIndex": 2, "image": "assets/images/products/hero-vr-headset-xanhcam.webp"}]'::jsonb, '["assets/images/products/hero-vr-headset-xam.webp", "assets/images/products/hero-vr-headset-trangnau.webp", "assets/images/products/hero-vr-headset-xanhcam.webp", "assets/images/products/vision-pro-showroom.webp", "assets/images/products/person-vr.jpg"]'::jsonb, 'Máy tính không gian cao cấp chuẩn Flagship. Màn hình 8K Micro-OLED 120Hz.', 'NEXUS Vision Pro kết hợp thế giới thực và ảo một cách liền mạch. Trang bị màn hình siêu nét kép 8K cho mỗi mắt, chip xử lý không gian NEXUS M2, và hệ thống camera bắt nét thời gian thực.', '[{"label": "Độ phân giải", "value": "8K (7680 × 3840) mỗi mắt"}, {"label": "Tần số quét", "value": "120 Hz thích ứng"}, {"label": "Trường nhìn (FOV)", "value": "130°"}, {"label": "Trọng lượng", "value": "420 g"}, {"label": "Thời lượng pin", "value": "3,5 giờ sử dụng liên tục"}, {"label": "Kết nối", "value": "Wi-Fi 7, Bluetooth 5.4"}]'::jsonb, true, 24)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-004', 'NEXUS Enterprise XR', 'kinh-vr', 'Kính VR', 109990000, 119990000, 5.0, 52, '[{"name": "Titanium", "hex": "#4B4F56", "imageIndex": 0, "image": "assets/images/products/vr-enterprise-xr.webp"}]'::jsonb, '["assets/images/products/vr-enterprise-xr.webp"]'::jsonb, 'Thiết bị thực tế ảo hỗn hợp doanh nghiệp tích hợp LiDAR và Iris ID.', 'Giải pháp điện toán không gian cao cấp nhất phục vụ nghiên cứu hàng không vũ trụ, đào tạo phẫu thuật y khoa và mô phỏng công nghiệp nặng. Cảm biến LiDAR định vị không gian thời gian thực chuẩn milimet.', '[{"label": "Cảm biến", "value": "LiDAR quang học + 12 Camera không gian"}, {"label": "Độ phân giải", "value": "Kép 8K công nghiệp (Ultra-OLED)"}, {"label": "Bảo mật", "value": "Quét mống mắt Iris ID mã hóa phần cứng"}, {"label": "Băng thông", "value": "5G Private Network & Wi-Fi 7 Enterprise"}, {"label": "Quai đeo", "value": "Halo Strap công thái học có núm xoay kim loại"}, {"label": "Thời lượng pin", "value": "4,5 giờ sử dụng liên tục"}]'::jsonb, true, 15)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-003', 'NEXUS Vision Studio', 'kinh-vr', 'Kính VR', 49990000, 54990000, 4.9, 184, '[{"name": "Xám Than", "hex": "#1D1916", "imageIndex": 0, "image": "assets/images/products/vr-vision-studio.webp"}]'::jsonb, '["assets/images/products/vr-vision-studio.webp"]'::jsonb, 'Điện toán không gian phòng thu chuyên nghiệp. Kép 6K Micro-OLED.', 'NEXUS Vision Studio được chế tác dành riêng cho các nhà thiết kế 3D, kiến trúc sư và nhà phát triển không gian số. Trang bị vi xử lý chuyên dụng NEXUS R1 cùng thấu kính 6K siêu nét không độ trễ.', '[{"label": "Độ phân giải", "value": "Kép 6K (3072 × 1920) mỗi mắt"}, {"label": "Tần số quét", "value": "90Hz - 120Hz thích ứng"}, {"label": "Trường nhìn (FOV)", "value": "115° trường nhìn rộng"}, {"label": "Trọng lượng", "value": "410 g (Hợp kim ma-giê nguyên khối)"}, {"label": "Thời lượng pin", "value": "3,0 giờ sử dụng liên tục"}, {"label": "Kết nối", "value": "Wi-Fi 7, Thunderbolt 4 không dây"}]'::jsonb, true, 38)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-006', 'NEXUS Pulse Mixed Reality (Halo Edition)', 'kinh-vr', 'Kính VR', 18990000, 21990000, 4.8, 96, '[{"name": "Titanium", "hex": "#4B4F56", "imageIndex": 0, "image": "assets/images/products/vr-pulse-halo.webp"}]'::jsonb, '["assets/images/products/vr-pulse-halo.webp"]'::jsonb, 'Kính thực tế hỗn hợp quai vòm Halo công thái học. Khớp lật kính 90° tiện lợi tức thì.', 'Được thiết kế riêng cho các phiên làm việc và sáng tạo kéo dài hàng giờ. Đai đeo Halo phân bổ đều trọng lượng lên trán thay vì tì vào khuôn mặt. Bản lề xoay thông minh cho phép bạn lật cụm kính lên 90 độ để quan sát thế giới thực mà không cần tháo quai.', '[{"label": "Màn hình", "value": "Kép Fast-LCD 4K (2160 × 2160 mỗi mắt)"}, {"label": "Tần số quét", "value": "90Hz / 120Hz mượt mà"}, {"label": "Trường nhìn (FOV)", "value": "110° góc nhìn tự nhiên"}, {"label": "Cơ chế quai", "value": "Halo Ring công thái học có đệm thoát nhiệt"}, {"label": "Trọng lượng", "value": "480 g (Cân bằng đối trọng hoàn hảo)"}, {"label": "Thời lượng pin", "value": "Cấp nguồn trực tiếp hoặc 3 giờ pin rời"}]'::jsonb, true, 42)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-007', 'NEXUS CyberPlay VR (Gaming Edition)', 'kinh-vr', 'Kính VR', 14490000, 16990000, 4.9, 240, '[{"name": "Xám Than", "hex": "#231F1C", "imageIndex": 0, "image": "assets/images/products/vr-cyberplay.webp"}]'::jsonb, '["assets/images/products/vr-cyberplay.webp"]'::jsonb, 'Kính VR eSports chuyên nghiệp. Màn hình OLED 120Hz, hệ thống đèn LED định vị 360°.', 'Vũ khí tối thượng cho game thủ eSports thực tế ảo. Màn hình OLED độ tương phản vô cực với tần số quét 120Hz giúp loại bỏ hoàn toàn hiện tượng bóng ma. Hệ thống đèn LED định vị quang học chính xác cùng micro chống ồn lọc tạp âm môi trường khi giao tiếp đồng đội.', '[{"label": "Tấm nền", "value": "OLED Custom RGB Subpixel cho Gaming"}, {"label": "Tần số quét", "value": "120Hz (Độ trễ phản hồi < 18ms)"}, {"label": "Trường nhìn (FOV)", "value": "100° không góc chết"}, {"label": "Định vị", "value": "9 điểm LED Tracking quang học 360°"}, {"label": "Microphone", "value": "Mic vòm định hướng có chip khử tạp âm"}, {"label": "Trọng lượng", "value": "595 g"}]'::jsonb, true, 58)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-002', 'NEXUS Air Lite', 'kinh-vr', 'Kính VR', 12490000, 13990000, 4.7, 812, '[{"name": "Xám Than", "hex": "#9F9FA1", "imageIndex": 0, "image": "assets/images/products/hero-vr-headset-xam.webp"}]'::jsonb, '["assets/images/products/hero-vr-headset-xam.webp"]'::jsonb, 'Lựa chọn thực tế ảo di động, gọn nhẹ và đa dụng. Thiết kế tối giản.', 'NEXUS Air Lite mang đến trải nghiệm VR mượt mà với mức giá dễ tiếp cận. Thiết kế siêu nhẹ 295g, không cần kết nối dây rườm rà, tối ưu cho nhu cầu giải trí và làm việc văn phòng không gian.', '[{"label": "Độ phân giải", "value": "4K mỗi mắt"}, {"label": "Tần số quét", "value": "90 Hz"}, {"label": "Trường nhìn (FOV)", "value": "110°"}, {"label": "Trọng lượng", "value": "295 g"}, {"label": "Thời lượng pin", "value": "2,5 giờ sử dụng liên tục"}, {"label": "Kết nối", "value": "Wi-Fi 6E, Bluetooth 5.2"}]'::jsonb, true, 154)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-005', 'NEXUS Horizon Quest All-in-One', 'kinh-vr', 'Kính VR', 11490000, 12990000, 4.9, 420, '[{"name": "Trắng Nâu", "hex": "#EFEBE5", "imageIndex": 0, "image": "assets/images/products/vr-horizon-quest.webp"}]'::jsonb, '["assets/images/products/vr-horizon-quest.webp"]'::jsonb, 'Kính thực tế ảo độc lập thế hệ mới. Tự do chuyển động không dây, chip Snapdragon XR2.', 'NEXUS Horizon Quest định nghĩa lại sự tự do trong không gian ảo. Hoạt động hoàn toàn độc lập không cần dây nối hay PC, tích hợp 4 camera góc rộng theo dõi chuyển động 6DoF Inside-Out chuẩn xác từng milimet cùng kho ứng dụng phong phú.', '[{"label": "Vi xử lý", "value": "Qualcomm Snapdragon XR2 Gen 1 (AI 6DoF)"}, {"label": "Độ phân giải", "value": "Fast-Switch LCD 1832 × 1920 mỗi mắt"}, {"label": "Tần số quét", "value": "120Hz mượt mà"}, {"label": "Trường nhìn (FOV)", "value": "100° trường nhìn mở rộng"}, {"label": "Trọng lượng", "value": "503 g"}, {"label": "Thời lượng pin", "value": "2,5 - 3,0 giờ liên tục"}]'::jsonb, true, 85)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-008', 'NEXUS Loom Touch Spatial (Fabric Edition)', 'kinh-vr', 'Kính VR', 4890000, 5490000, 4.8, 118, '[{"name": "Xám Than", "hex": "#6E6D70", "imageIndex": 0, "image": "assets/images/products/vr-loom-touch.webp"}]'::jsonb, '["assets/images/products/vr-loom-touch.webp"]'::jsonb, 'Kính thực tế ảo bọc vải dệt hữu cơ siêu nhẹ. Đi kèm remote điều khiển cảm ứng không gian.', 'Tuyệt tác giao thoa giữa thời trang may đo cao cấp và công nghệ quang học. Thân kính bọc vải nỉ cao cấp thoáng khí, trọng lượng siêu nhẹ mang lại cảm giác dễ chịu tuyệt đối khi đeo lâu. Đi kèm bộ điều khiển cử chỉ 3DoF nhỏ gọn với touchpad cảm ứng từ tính.', '[{"label": "Chất liệu", "value": "Vải dệt hữu cơ cao cấp & Đệm thoáng khí"}, {"label": "Trường nhìn (FOV)", "value": "105° chuẩn góc nhìn điện ảnh"}, {"label": "Trọng lượng", "value": "Siêu nhẹ 261 g (Không gây mỏi cổ)"}, {"label": "Điều khiển", "value": "Remote cảm ứng 3DoF con quay 9 trục"}, {"label": "Thấu kính", "value": "Quang học phi cầu góc rộng chống lóa"}, {"label": "Tương thích", "value": "NEXUS Spatial Hub & Smartphone 5.5 - 6.8 inch"}]'::jsonb, false, 60)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-009', 'NEXUS Cinema Acoustic XR (Hi-Fi Edition)', 'kinh-vr', 'Kính VR', 1490000, 1890000, 4.7, 165, '[{"name": "Trắng Nâu", "hex": "#EFEBE5", "imageIndex": 0, "image": "assets/images/products/vr-cinema-acoustic.webp"}]'::jsonb, '["assets/images/products/vr-cinema-acoustic.webp"]'::jsonb, 'Rạp phim thực tế ảo cá nhân tích hợp cụm tai nghe vòm Stereo Sound 360° sống động.', 'Biến mọi góc phòng thành phòng chiếu phim IMAX 800 inch. Kính tích hợp sẵn củ tai nghe bọc da đệm êm ái với dải bass sâu trầm, phím cứng tăng giảm âm lượng và nhận cuộc gọi rảnh tay. Cơ chế điều chỉnh khoảng cách đồng tử (IPD) và tiêu cự độc lập cho từng mắt.', '[{"label": "Cụm âm thanh", "value": "Tai nghe Hi-Fi Stereo Dynamic 40mm Composite"}, {"label": "Thấu kính", "value": "PMMA quang học Nhật Bản 42mm chống ánh sáng xanh"}, {"label": "Trường nhìn (FOV)", "value": "120° bao quát trường nhìn tự nhiên"}, {"label": "Điều chỉnh", "value": "Chỉnh tiêu cự độc lập (Hỗ trợ cận thị đến 6.0 độ)"}, {"label": "Phím bấm", "value": "Cụm nút volume và điều khiển media trên thân"}, {"label": "Kích thước thiết bị", "value": "Tương thích smartphone 4.7 đến 6.7 inch"}]'::jsonb, false, 120)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-010', 'NEXUS GeoExplorer (World Edition)', 'kinh-vr', 'Kính VR', 790000, 990000, 4.6, 88, '[{"name": "Titanium", "hex": "#1A1A1A", "imageIndex": 0, "image": "assets/images/products/vr-geo-explorer.webp"}]'::jsonb, '["assets/images/products/vr-geo-explorer.webp"]'::jsonb, 'Kính VR du lịch không gian và giáo dục thực tế ảo. Hoa văn địa cầu chìm tinh tế.', 'Khám phá các kỳ quan thế giới, lặn xuống đáy đại dương hay du hành vũ trụ ngay tại bàn học. Mặt trước in laser họa tiết bản đồ thế giới chìm sang trọng, thấu kính quang học phủ nano chống bám bụi và vân tay, hỗ trợ điều chỉnh khoảng cách đồng tử dễ dàng.', '[{"label": "Mặt trước", "value": "Họa tiết bản đồ thế giới khắc chìm laser"}, {"label": "Thấu kính", "value": "Resin quang học phủ nano chống phản quang"}, {"label": "Trường nhìn (FOV)", "value": "95° - 100°"}, {"label": "Hỗ trợ khúc xạ", "value": "Người cận dưới 5.0 độ không cần đeo kính"}, {"label": "Dây đeo", "value": "Dây chữ T co giãn 3 chiều ôm sát vòm đầu"}, {"label": "Tương thích", "value": "Mọi dòng smartphone từ 4.7 - 7.0 inch"}]'::jsonb, false, 95)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('vr-011', 'NEXUS Mobile View Box (Gen 2)', 'kinh-vr', 'Kính VR', 490000, 690000, 4.5, 310, '[{"name": "Trắng Nâu", "hex": "#F2F2F2", "imageIndex": 0, "image": "assets/images/products/vr-mobile-box.webp"}]'::jsonb, '["assets/images/products/vr-mobile-box.webp"]'::jsonb, 'Kính VR cơ học thông minh giá nhập môn. Cửa trượt tản nhiệt thông minh, thấu kính HD.', 'Lựa chọn hoàn hảo để bắt đầu bước chân vào thế giới thực tế ảo và video 360 độ. Nắp trượt phía trước hỗ trợ tản nhiệt cho điện thoại khi xem lâu, khay gắn điện thoại dạng trượt tiện lợi, đệm mút bọc vải êm ái chống kích ứng da mặt.', '[{"label": "Thấu kính", "value": "Quang học phi cầu đường kính 40mm"}, {"label": "Cơ chế", "value": "Khay trượt tháo lắp điện thoại một chạm"}, {"label": "Tản nhiệt", "value": "Cửa thông gió đối lưu khí chống nóng máy"}, {"label": "Trường nhìn (FOV)", "value": "85° - 90°"}, {"label": "Trọng lượng", "value": "330 g gọn nhẹ"}, {"label": "Tương thích", "value": "Thiết bị Android & iPhone 4.5 - 6.5 inch"}]'::jsonb, false, 200)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('ctrl-001', 'NEXUS Motion Controller Pro', 'tay-cam', 'Tay cầm', 6490000, 6990000, 4.8, 156, '[{"name": "Titanium", "hex": "#4B4F56", "imageIndex": 0, "image": "assets/images/products/ctrl-titanium.webp"}, {"name": "Champagne", "hex": "#C8B29B", "imageIndex": 1, "image": "assets/images/products/ctrl-champagne.webp"}, {"name": "Sport Cam", "hex": "#E65C00", "imageIndex": 2, "image": "assets/images/products/ctrl-sport.webp"}]'::jsonb, '["assets/images/products/ctrl-titanium.webp", "assets/images/products/ctrl-champagne.webp", "assets/images/products/ctrl-sport.webp"]'::jsonb, 'Điều khiển chuẩn xác với phản hồi xúc giác Haptic Feedback tiên tiến.', 'Cặp tay cầm NEXUS Motion Controller tích hợp camera theo dõi độc lập, không bị giới hạn tầm nhìn, kèm mô-tơ rung Haptic mang lại cảm giác chân thực nhất.', '[{"label": "Công nghệ", "value": "Theo dõi Inside-Out độc lập 6DoF"}, {"label": "Phản hồi xúc giác", "value": "Haptic Actuator độ trễ siêu thấp"}, {"label": "Cảm biến lực", "value": "Trigger cảm ứng biến thiên độ nhạy"}, {"label": "Thời lượng pin", "value": "Pin sạc tích hợp (Dùng liên tục 10 giờ)"}, {"label": "Kết nối", "value": "Không dây NEXUS Link 2.4GHz siêu tốc"}, {"label": "Trọng lượng", "value": "160 g mỗi bên"}]'::jsonb, true, 89)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('ctrl-002', 'NEXUS Precision Stylus XR', 'tay-cam', 'Tay cầm', 3490000, 3990000, 4.9, 76, '[{"name": "Titanium", "hex": "#4B4F56", "imageIndex": 0, "image": "assets/images/products/stylus-xr.webp"}]'::jsonb, '["assets/images/products/stylus-xr.webp"]'::jsonb, 'Bút vẽ không gian 3D với 4096 mức cảm ứng lực và rung xúc giác.', 'Thiết bị vẽ và phác thảo mô hình 3D trong không gian thực với độ chính xác dưới milimet. Thân bút bằng titanium satin kết hợp gốm đen mờ và đầu rung xúc giác mạ vàng tinh xảo.', '[{"label": "Độ nhạy áp lực", "value": "4096 mức cảm ứng lực vi mô"}, {"label": "Góc nghiêng", "value": "Nhận diện độ nghiêng 60 độ"}, {"label": "Thời lượng pin", "value": "14 giờ sáng tạo liên tục"}, {"label": "Đế sạc", "value": "Đế sạc từ tính titanium nguyên khối đi kèm"}, {"label": "Ngòi bút", "value": "3 ngòi thay thế phủ gốm siêu bền"}, {"label": "Trọng lượng", "value": "28 g"}]'::jsonb, false, 64)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('acc-001', 'NEXUS Magnetic Charging Dock', 'phu-kien', 'Phụ kiện', 2990000, 3490000, 4.6, 92, '[{"name": "Titanium", "hex": "#4B4F56", "imageIndex": 0, "image": "assets/images/products/dock-titanium.webp"}, {"name": "Champagne", "hex": "#C8B29B", "imageIndex": 1, "image": "assets/images/products/dock-champagne.webp"}, {"name": "Trắng Nâu", "hex": "#D8D8D8", "imageIndex": 2, "image": "assets/images/products/dock-silver.webp"}]'::jsonb, '["assets/images/products/dock-titanium.webp", "assets/images/products/dock-champagne.webp", "assets/images/products/dock-silver.webp"]'::jsonb, 'Đế sạc từ tính đa năng cho kính và tay cầm. Nhôm nguyên khối.', 'Giải pháp sạc thanh lịch giúp không gian làm việc luôn gọn gàng. Sạc đồng thời NEXUS Vision Pro và hai tay cầm chỉ với một điểm chạm từ tính.', '[{"label": "Công suất", "value": "100W Fast Charge GaN III"}, {"label": "Chất liệu", "value": "Hợp kim nhôm Anodized nguyên khối"}, {"label": "Đèn LED", "value": "Đèn trạng thái sạc ẩn vi mô"}, {"label": "Tương thích", "value": "Toàn bộ hệ sinh thái kính và tay cầm NEXUS"}, {"label": "Bảo vệ", "value": "Chống quá nhiệt, quá dòng thông minh"}, {"label": "Cáp đi kèm", "value": "Cáp Type-C bọc dù 2 mét cao cấp"}]'::jsonb, true, 45)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('acc-002', 'NEXUS Solo Knit Band', 'phu-kien', 'Phụ kiện', 2490000, 2690000, 4.9, 134, '[{"name": "Trắng Nâu", "hex": "#EFEBE5", "imageIndex": 0, "image": "assets/images/products/strap-cream.webp"}, {"name": "Titanium", "hex": "#4B4F56", "imageIndex": 1, "image": "assets/images/products/strap-titanium.webp"}, {"name": "Sport Cam", "hex": "#E65C00", "imageIndex": 2, "image": "assets/images/products/strap-sport.webp"}]'::jsonb, '["assets/images/products/strap-cream.webp", "assets/images/products/strap-titanium.webp", "assets/images/products/strap-sport.webp"]'::jsonb, 'Dây đeo đan 3D êm ái, co giãn và thoáng khí tuyệt đối.', 'Được đan 3D từ hàng nghìn sợi vi sinh, Solo Knit Band phân bổ đều trọng lượng của kính, giúp bạn luôn thoải mái kể cả khi đeo cả ngày dài.', '[{"label": "Chất liệu", "value": "Sợi dệt 3D sinh học thân thiện môi trường"}, {"label": "Cơ chế vặn", "value": "Vòng xoay tinh chỉnh vi mô Fit Dial"}, {"label": "Kích cỡ", "value": "S, M, L dễ dàng hoán đổi"}, {"label": "Vệ sinh", "value": "Có thể giặt tay không xơ sợi"}, {"label": "Ngàm gắn", "value": "Khóa từ tính tháo lắp nhanh 1 chạm"}, {"label": "Tương thích", "value": "NEXUS Vision Pro & Vision Studio"}]'::jsonb, true, 210)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('acc-003', 'NEXUS Leather Travel Case', 'phu-kien', 'Phụ kiện', 4490000, 4990000, 4.8, 67, '[{"name": "Caramel", "hex": "#A67C52", "imageIndex": 0, "image": "assets/images/products/case-caramel.webp"}, {"name": "Trắng Nâu", "hex": "#EFEBE5", "imageIndex": 1, "image": "assets/images/products/case-cream.webp"}, {"name": "Xám Than", "hex": "#231F1C", "imageIndex": 2, "image": "assets/images/products/case-espresso.webp"}]'::jsonb, '["assets/images/products/case-caramel.webp", "assets/images/products/case-cream.webp", "assets/images/products/case-espresso.webp"]'::jsonb, 'Hộp bảo vệ cao cấp chống sốc bọc da sang trọng đẳng cấp doanh nhân.', 'Được thiết kế riêng cho NEXUS Vision Pro. Vỏ ngoài bằng vật liệu dệt cao cấp chống nước, lót trong bằng vải sợi siêu nhỏ bảo vệ thấu kính tuyệt đối.', '[{"label": "Vỏ ngoài", "value": "Polycarbonate định hình nhiệt bọc da thủ công"}, {"label": "Lớp lót", "value": "Sợi Microfiber cao cấp chống trầy xước"}, {"label": "Khóa kéo", "value": "Khóa chống thấm nước YKK Metal"}, {"label": "Ngăn chứa", "value": "Đủ chỗ cho Kính, Pin ngoài và 2 Cáp sạc"}, {"label": "Tay xách", "value": "Da thuộc dập chìm logo NEXUS"}, {"label": "Trọng lượng", "value": "480 g"}]'::jsonb, false, 55)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('acc-005', 'NEXUS Optical Inserts by ZEISS', 'phu-kien', 'Phụ kiện', 2990000, 3290000, 4.9, 215, '[{"name": "Titanium", "hex": "#4B4F56", "imageIndex": 0, "image": "assets/images/products/lens-inserts.webp"}]'::jsonb, '["assets/images/products/lens-inserts.webp"]'::jsonb, 'Tròng kính thuốc quang học từ tính hiệu chuẩn theo toa cá nhân.', 'Hợp tác độc quyền cùng ZEISS để mang lại độ trong suốt quang học tuyệt hảo cho người cận, viễn hoặc loạn thị. Ngàm hít từ tính siêu nhạy, tự động kết nối và hiệu chuẩn với màn hình thấu kính trong 1 giây.', '[{"label": "Công nghệ thấu kính", "value": "ZEISS DuraVision Lenses chống chói"}, {"label": "Ngàm gắn", "value": "Khung hợp kim titan hít từ tính tự động"}, {"label": "Phụ kiện kèm theo", "value": "Hộp nhung bảo vệ bọc kim loại sang trọng"}, {"label": "Độ khúc xạ", "value": "Gia công theo toa thuốc cá nhân (-8.0D đến +4.0D)"}, {"label": "Kháng nước", "value": "Lớp phủ kỵ nước Oleophobic chống bám mồ hôi"}, {"label": "Trọng lượng", "value": "12 g mỗi bên"}]'::jsonb, false, 140)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

INSERT INTO products (id, name, category, category_label, price, old_price, rating, review_count, colors, images, short_desc, description, specs, featured, stock)
VALUES ('acc-006', 'NEXUS MagPower Spatial Battery Pack', 'phu-kien', 'Phụ kiện', 2890000, 3290000, 4.7, 98, '[{"name": "Champagne", "hex": "#C8B29B", "imageIndex": 0, "image": "assets/images/products/battery-pack.webp"}]'::jsonb, '["assets/images/products/battery-pack.webp"]'::jsonb, 'Pin dự phòng từ tính vỏ nhôm nguyên khối, nâng thời lượng thêm 6 giờ.', 'Bộ pin ngoài bằng nhôm champagne bo cong mềm mại với dây cáp dệt dù cao cấp chống đứt gãy. Cung cấp năng lượng ổn định giúp bạn thoải mái xem phim, hội họp hoặc du ngoạn metaverse suốt cả ngày dài.', '[{"label": "Dung lượng", "value": "20.000 mAh (Công suất ra 65W PD)"}, {"label": "Thời lượng bổ sung", "value": "Thêm 5,5 đến 6 giờ sử dụng liên tục"}, {"label": "Đèn báo", "value": "Thanh LED vi mô hiển thị phần trăm pin"}, {"label": "Chất liệu", "value": "Nhôm Anodized xử lý phun cát mịn màng"}, {"label": "Cổng kết nối", "value": "2x USB-C Power Delivery 3.0"}, {"label": "Trọng lượng", "value": "320 g"}]'::jsonb, false, 75)
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    description = EXCLUDED.description;

-- 3. NẠP ĐƠN HÀNG MẪU (3 ĐƠN: ĐANG XỬ LÝ, ĐÃ GIAO, ĐÃ HỦY)
INSERT INTO orders (id, order_code, user_email, customer_name, customer_phone, customer_address, total_amount, shipping_fee, payment_method, status, items)
VALUES
    ('ord_sample_01', '#NEXUS-892145', 'khachhang@nexusvr.vn', 'Trần Hoàng Nam', '0988123456', 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM', 79990000, 0, 'VietQR Napas 247', 'processing', '[{"id":"vr-001","name":"NEXUS Vision Pro","price":79990000,"qty":1,"selectedColor":"Xám Than"}]'::jsonb),
    ('ord_sample_02', '#NEXUS-671203', 'minhanh@gmail.com', 'Lê Minh Anh', '0912345678', 'Số 45 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', 14490000, 0, 'Thanh toán khi nhận hàng (COD)', 'completed', '[{"id":"vr-007","name":"NEXUS CyberPlay VR (Gaming Edition)","price":14490000,"qty":1,"selectedColor":"Xám Than"}]'::jsonb),
    ('ord_sample_03', '#NEXUS-440192', 'hoangyen@design.vn', 'Đặng Hoàng Yến', '0933557799', 'Số 12 Thảo Điền, Quận 2, TP. Thủ Đức', 3490000, 30000, 'Thẻ tín dụng quốc tế', 'cancelled', '[{"id":"ctrl-002","name":"NEXUS Precision Stylus XR","price":3490000,"qty":1,"selectedColor":"Titanium"}]'::jsonb)
ON CONFLICT (order_code) DO NOTHING;

-- 4. NẠP LỊCH HẸN TRẢI NGHIỆM SHOWROOM FLAGSHIP MẪU (VIP PASS)
INSERT INTO bookings (id, customer_name, customer_email, customer_phone, service_type, time_slot, booking_date, message, status)
VALUES
    ('bkg_001', 'Nguyễn Thái Sơn', 'thaison.architect@gmail.com', '0908765432', 'Trải nghiệm NEXUS Vision Pro 1:1', '10:00 - 11:30', '02/11/2026', 'Muốn thử nghiệm tính năng dựng mô hình 3D trên Vision Pro và bút Stylus XR.', 'pending'),
    ('bkg_002', 'Vũ Hải Đăng', 'dang.vu@fintech.vn', '0919887766', 'Tư vấn giải pháp Doanh nghiệp NEXUS Enterprise XR', '14:30 - 16:00', '03/11/2026', 'Tìm hiểu giải pháp đào tạo mô phỏng từ xa cho 20 nhân sự.', 'confirmed'),
    ('bkg_003', 'Phạm Quỳnh Nga', 'quynhnga@metaverse.com', '0987112233', 'Thưởng thức rạp phim Spatial Cinema 8K', '16:30 - 17:30', '04/11/2026', 'Trải nghiệm thử mẫu kính Cinema Acoustic XR.', 'completed')
ON CONFLICT (id) DO NOTHING;

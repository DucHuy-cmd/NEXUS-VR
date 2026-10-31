/* =========================================================
   NEXUS VR — data/products-data.js
   TẦNG 1 - DATA & SERVICES: PRODUCT CATALOG & POSTS
   Catalog chuẩn 18 sản phẩm (11 Kính VR, 2 Tay cầm, 5 Phụ kiện)
   Đã tối ưu 100% ánh xạ màu sắc & hình ảnh thực tế (1-to-1 Swatches)
   ========================================================= */

const PRODUCTS = [
  {
    "id": "vr-001",
    "name": "NEXUS Vision Pro",
    "category": "kinh-vr",
    "categoryLabel": "Kính VR",
    "price": 79990000,
    "oldPrice": 84990000,
    "rating": 4.9,
    "reviewCount": 345,
    "colors": [
      {
        "name": "Xám Than",
        "hex": "#9F9FA1",
        "imageIndex": 0,
        "image": "assets/images/products/hero-vr-headset-xam.webp"
      },
      {
        "name": "Trắng Nâu",
        "hex": "#EFEBE5",
        "imageIndex": 1,
        "image": "assets/images/products/hero-vr-headset-trangnau.webp"
      },
      {
        "name": "Xanh Cam",
        "hex": "#D9E0E9",
        "imageIndex": 2,
        "image": "assets/images/products/hero-vr-headset-xanhcam.webp"
      }
    ],
    "images": [
      "assets/images/products/hero-vr-headset-xam.webp",
      "assets/images/products/hero-vr-headset-trangnau.webp",
      "assets/images/products/hero-vr-headset-xanhcam.webp",
      "assets/images/products/vision-pro-showroom.webp",
      "assets/images/products/person-vr.jpg"
    ],
    "shortDesc": "Máy tính không gian cao cấp chuẩn Flagship. Màn hình 8K Micro-OLED 120Hz.",
    "description": "NEXUS Vision Pro kết hợp thế giới thực và ảo một cách liền mạch. Trang bị màn hình siêu nét kép 8K cho mỗi mắt, chip xử lý không gian NEXUS M2, và hệ thống camera bắt nét thời gian thực.",
    "specs": [
      {
        "label": "Độ phân giải",
        "value": "8K (7680 × 3840) mỗi mắt"
      },
      {
        "label": "Tần số quét",
        "value": "120 Hz thích ứng"
      },
      {
        "label": "Trường nhìn (FOV)",
        "value": "130°"
      },
      {
        "label": "Trọng lượng",
        "value": "420 g"
      },
      {
        "label": "Thời lượng pin",
        "value": "3,5 giờ sử dụng liên tục"
      },
      {
        "label": "Kết nối",
        "value": "Wi-Fi 7, Bluetooth 5.4"
      }
    ],
    "reviews": [
      {
        "author": "Minh Anh",
        "rating": 5,
        "comment": "Kỷ nguyên mới của điện toán cá nhân. Vượt xa mọi kỳ vọng.",
        "date": "2026-08-12"
      },
      {
        "author": "Quốc Bảo",
        "rating": 5,
        "comment": "Độ nét kinh ngạc, không thể nhận ra điểm ảnh. Xứng đáng với giá tiền.",
        "date": "2026-07-30"
      },
      {
        "author": "Thu Trang",
        "rating": 4,
        "comment": "Phần mềm mượt mà, nhưng giá vẫn hơi cao với số đông.",
        "date": "2026-07-02"
      }
    ],
    "featured": true,
    "stock": 24
  },
  {
    "id": "vr-004",
    "name": "NEXUS Enterprise XR",
    "category": "kinh-vr",
    "categoryLabel": "Kính VR",
    "price": 109990000,
    "oldPrice": 119990000,
    "rating": 5.0,
    "reviewCount": 52,
    "colors": [
      {
        "name": "Titanium",
        "hex": "#4B4F56",
        "imageIndex": 0,
        "image": "assets/images/products/vr-enterprise-xr.webp"
      }
    ],
    "images": [
      "assets/images/products/vr-enterprise-xr.webp"
    ],
    "shortDesc": "Thiết bị thực tế ảo hỗn hợp doanh nghiệp tích hợp LiDAR và Iris ID.",
    "description": "Giải pháp điện toán không gian cao cấp nhất phục vụ nghiên cứu hàng không vũ trụ, đào tạo phẫu thuật y khoa và mô phỏng công nghiệp nặng. Cảm biến LiDAR định vị không gian thời gian thực chuẩn milimet.",
    "specs": [
      {
        "label": "Cảm biến",
        "value": "LiDAR quang học + 12 Camera không gian"
      },
      {
        "label": "Độ phân giải",
        "value": "Kép 8K công nghiệp (Ultra-OLED)"
      },
      {
        "label": "Bảo mật",
        "value": "Quét mống mắt Iris ID mã hóa phần cứng"
      },
      {
        "label": "Băng thông",
        "value": "5G Private Network & Wi-Fi 7 Enterprise"
      },
      {
        "label": "Quai đeo",
        "value": "Halo Strap công thái học có núm xoay kim loại"
      },
      {
        "label": "Thời lượng pin",
        "value": "4,5 giờ sử dụng liên tục"
      }
    ],
    "reviews": [
      {
        "author": "GS. Hoàng Nam",
        "rating": 5,
        "comment": "Độ chính xác cảm biến tuyệt vời cho các mô phỏng giải phẫu phức tạp.",
        "date": "2026-09-02"
      }
    ],
    "featured": true,
    "stock": 15
  },
  {
    "id": "vr-003",
    "name": "NEXUS Vision Studio",
    "category": "kinh-vr",
    "categoryLabel": "Kính VR",
    "price": 49990000,
    "oldPrice": 54990000,
    "rating": 4.9,
    "reviewCount": 184,
    "colors": [
      {
        "name": "Xám Than",
        "hex": "#1D1916",
        "imageIndex": 0,
        "image": "assets/images/products/vr-vision-studio.webp"
      }
    ],
    "images": [
      "assets/images/products/vr-vision-studio.webp"
    ],
    "shortDesc": "Điện toán không gian phòng thu chuyên nghiệp. Kép 6K Micro-OLED.",
    "description": "NEXUS Vision Studio được chế tác dành riêng cho các nhà thiết kế 3D, kiến trúc sư và nhà phát triển không gian số. Trang bị vi xử lý chuyên dụng NEXUS R1 cùng thấu kính 6K siêu nét không độ trễ.",
    "specs": [
      {
        "label": "Độ phân giải",
        "value": "Kép 6K (3072 × 1920) mỗi mắt"
      },
      {
        "label": "Tần số quét",
        "value": "90Hz - 120Hz thích ứng"
      },
      {
        "label": "Trường nhìn (FOV)",
        "value": "115° trường nhìn rộng"
      },
      {
        "label": "Trọng lượng",
        "value": "410 g (Hợp kim ma-giê nguyên khối)"
      },
      {
        "label": "Thời lượng pin",
        "value": "3,0 giờ sử dụng liên tục"
      },
      {
        "label": "Kết nối",
        "value": "Wi-Fi 7, Thunderbolt 4 không dây"
      }
    ],
    "reviews": [
      {
        "author": "Tuấn Hùng",
        "rating": 5,
        "comment": "Công cụ thiết kế 3D tuyệt đỉnh. Màu đen Midnight Obsidian cực kỳ sang trọng.",
        "date": "2026-09-14"
      }
    ],
    "featured": true,
    "stock": 38
  },
  {
    "id": "vr-006",
    "name": "NEXUS Pulse Mixed Reality (Halo Edition)",
    "category": "kinh-vr",
    "categoryLabel": "Kính VR",
    "price": 18990000,
    "oldPrice": 21990000,
    "rating": 4.8,
    "reviewCount": 96,
    "colors": [
      {
        "name": "Titanium",
        "hex": "#4B4F56",
        "imageIndex": 0,
        "image": "assets/images/products/vr-pulse-halo.webp"
      }
    ],
    "images": [
      "assets/images/products/vr-pulse-halo.webp"
    ],
    "shortDesc": "Kính thực tế hỗn hợp quai vòm Halo công thái học. Khớp lật kính 90° tiện lợi tức thì.",
    "description": "Được thiết kế riêng cho các phiên làm việc và sáng tạo kéo dài hàng giờ. Đai đeo Halo phân bổ đều trọng lượng lên trán thay vì tì vào khuôn mặt. Bản lề xoay thông minh cho phép bạn lật cụm kính lên 90 độ để quan sát thế giới thực mà không cần tháo quai.",
    "specs": [
      {
        "label": "Màn hình",
        "value": "Kép Fast-LCD 4K (2160 × 2160 mỗi mắt)"
      },
      {
        "label": "Tần số quét",
        "value": "90Hz / 120Hz mượt mà"
      },
      {
        "label": "Trường nhìn (FOV)",
        "value": "110° góc nhìn tự nhiên"
      },
      {
        "label": "Cơ chế quai",
        "value": "Halo Ring công thái học có đệm thoát nhiệt"
      },
      {
        "label": "Trọng lượng",
        "value": "480 g (Cân bằng đối trọng hoàn hảo)"
      },
      {
        "label": "Thời lượng pin",
        "value": "Cấp nguồn trực tiếp hoặc 3 giờ pin rời"
      }
    ],
    "reviews": [
      {
        "author": "Trần Hào",
        "rating": 5,
        "comment": "Khớp lật 90 độ cực kỳ hữu dụng khi vừa làm việc máy tính vừa test VR.",
        "date": "2026-10-05"
      }
    ],
    "featured": true,
    "stock": 42
  },
  {
    "id": "vr-007",
    "name": "NEXUS CyberPlay VR (Gaming Edition)",
    "category": "kinh-vr",
    "categoryLabel": "Kính VR",
    "price": 14490000,
    "oldPrice": 16990000,
    "rating": 4.9,
    "reviewCount": 240,
    "colors": [
      {
        "name": "Xám Than",
        "hex": "#231F1C",
        "imageIndex": 0,
        "image": "assets/images/products/vr-cyberplay.webp"
      }
    ],
    "images": [
      "assets/images/products/vr-cyberplay.webp"
    ],
    "shortDesc": "Kính VR eSports chuyên nghiệp. Màn hình OLED 120Hz, hệ thống đèn LED định vị 360°.",
    "description": "Vũ khí tối thượng cho game thủ eSports thực tế ảo. Màn hình OLED độ tương phản vô cực với tần số quét 120Hz giúp loại bỏ hoàn toàn hiện tượng bóng ma. Hệ thống đèn LED định vị quang học chính xác cùng micro chống ồn lọc tạp âm môi trường khi giao tiếp đồng đội.",
    "specs": [
      {
        "label": "Tấm nền",
        "value": "OLED Custom RGB Subpixel cho Gaming"
      },
      {
        "label": "Tần số quét",
        "value": "120Hz (Độ trễ phản hồi < 18ms)"
      },
      {
        "label": "Trường nhìn (FOV)",
        "value": "100° không góc chết"
      },
      {
        "label": "Định vị",
        "value": "9 điểm LED Tracking quang học 360°"
      },
      {
        "label": "Microphone",
        "value": "Mic vòm định hướng có chip khử tạp âm"
      },
      {
        "label": "Trọng lượng",
        "value": "595 g"
      }
    ],
    "reviews": [
      {
        "author": "Duy Long Gamer",
        "rating": 5,
        "comment": "Chơi Beat Saber và Half-Life Alyx cực sướng, tần số quét 120Hz mượt kinh khủng!",
        "date": "2026-09-28"
      }
    ],
    "featured": true,
    "stock": 58
  },
  {
    "id": "vr-002",
    "name": "NEXUS Air Lite",
    "category": "kinh-vr",
    "categoryLabel": "Kính VR",
    "price": 12490000,
    "oldPrice": 13990000,
    "rating": 4.7,
    "reviewCount": 812,
    "colors": [
      {
        "name": "Xám Than",
        "hex": "#9F9FA1",
        "imageIndex": 0,
        "image": "assets/images/products/hero-vr-headset-xam.webp"
      }
    ],
    "images": [
      "assets/images/products/hero-vr-headset-xam.webp"
    ],
    "shortDesc": "Lựa chọn thực tế ảo di động, gọn nhẹ và đa dụng. Thiết kế tối giản.",
    "description": "NEXUS Air Lite mang đến trải nghiệm VR mượt mà với mức giá dễ tiếp cận. Thiết kế siêu nhẹ 295g, không cần kết nối dây rườm rà, tối ưu cho nhu cầu giải trí và làm việc văn phòng không gian.",
    "specs": [
      {
        "label": "Độ phân giải",
        "value": "4K mỗi mắt"
      },
      {
        "label": "Tần số quét",
        "value": "90 Hz"
      },
      {
        "label": "Trường nhìn (FOV)",
        "value": "110°"
      },
      {
        "label": "Trọng lượng",
        "value": "295 g"
      },
      {
        "label": "Thời lượng pin",
        "value": "2,5 giờ sử dụng liên tục"
      },
      {
        "label": "Kết nối",
        "value": "Wi-Fi 6E, Bluetooth 5.2"
      }
    ],
    "reviews": [
      {
        "author": "Hải Đăng",
        "rating": 5,
        "comment": "Giá quá tốt cho một hệ sinh thái mạnh mẽ như NEXUS.",
        "date": "2026-06-18"
      }
    ],
    "featured": true,
    "stock": 154
  },
  {
    "id": "vr-005",
    "name": "NEXUS Horizon Quest All-in-One",
    "category": "kinh-vr",
    "categoryLabel": "Kính VR",
    "price": 11490000,
    "oldPrice": 12990000,
    "rating": 4.9,
    "reviewCount": 420,
    "colors": [
      {
        "name": "Trắng Nâu",
        "hex": "#EFEBE5",
        "imageIndex": 0,
        "image": "assets/images/products/vr-horizon-quest.webp"
      }
    ],
    "images": [
      "assets/images/products/vr-horizon-quest.webp"
    ],
    "shortDesc": "Kính thực tế ảo độc lập thế hệ mới. Tự do chuyển động không dây, chip Snapdragon XR2.",
    "description": "NEXUS Horizon Quest định nghĩa lại sự tự do trong không gian ảo. Hoạt động hoàn toàn độc lập không cần dây nối hay PC, tích hợp 4 camera góc rộng theo dõi chuyển động 6DoF Inside-Out chuẩn xác từng milimet cùng kho ứng dụng phong phú.",
    "specs": [
      {
        "label": "Vi xử lý",
        "value": "Qualcomm Snapdragon XR2 Gen 1 (AI 6DoF)"
      },
      {
        "label": "Độ phân giải",
        "value": "Fast-Switch LCD 1832 × 1920 mỗi mắt"
      },
      {
        "label": "Tần số quét",
        "value": "120Hz mượt mà"
      },
      {
        "label": "Trường nhìn (FOV)",
        "value": "100° trường nhìn mở rộng"
      },
      {
        "label": "Trọng lượng",
        "value": "503 g"
      },
      {
        "label": "Thời lượng pin",
        "value": "2,5 - 3,0 giờ liên tục"
      }
    ],
    "reviews": [
      {
        "author": "Bảo Nam",
        "rating": 5,
        "comment": "Kính chạy độc lập không dây rất tiện, chơi game thể thao trong phòng khách tuyệt vời.",
        "date": "2026-10-12"
      }
    ],
    "featured": true,
    "stock": 85
  },
  {
    "id": "vr-008",
    "name": "NEXUS Loom Touch Spatial (Fabric Edition)",
    "category": "kinh-vr",
    "categoryLabel": "Kính VR",
    "price": 4890000,
    "oldPrice": 5490000,
    "rating": 4.8,
    "reviewCount": 118,
    "colors": [
      {
        "name": "Xám Than",
        "hex": "#6E6D70",
        "imageIndex": 0,
        "image": "assets/images/products/vr-loom-touch.webp"
      }
    ],
    "images": [
      "assets/images/products/vr-loom-touch.webp"
    ],
    "shortDesc": "Kính thực tế ảo bọc vải dệt hữu cơ siêu nhẹ. Đi kèm remote điều khiển cảm ứng không gian.",
    "description": "Tuyệt tác giao thoa giữa thời trang may đo cao cấp và công nghệ quang học. Thân kính bọc vải nỉ cao cấp thoáng khí, trọng lượng siêu nhẹ mang lại cảm giác dễ chịu tuyệt đối khi đeo lâu. Đi kèm bộ điều khiển cử chỉ 3DoF nhỏ gọn với touchpad cảm ứng từ tính.",
    "specs": [
      {
        "label": "Chất liệu",
        "value": "Vải dệt hữu cơ cao cấp & Đệm thoáng khí"
      },
      {
        "label": "Trường nhìn (FOV)",
        "value": "105° chuẩn góc nhìn điện ảnh"
      },
      {
        "label": "Trọng lượng",
        "value": "Siêu nhẹ 261 g (Không gây mỏi cổ)"
      },
      {
        "label": "Điều khiển",
        "value": "Remote cảm ứng 3DoF con quay 9 trục"
      },
      {
        "label": "Thấu kính",
        "value": "Quang học phi cầu góc rộng chống lóa"
      },
      {
        "label": "Tương thích",
        "value": "NEXUS Spatial Hub & Smartphone 5.5 - 6.8 inch"
      }
    ],
    "reviews": [
      {
        "author": "Phương Thảo",
        "rating": 5,
        "comment": "Chất liệu vải nỉ cực kỳ êm ái, đeo nằm xem phim trên trần nhà rất thích.",
        "date": "2026-09-19"
      }
    ],
    "featured": false,
    "stock": 60
  },
  {
    "id": "vr-009",
    "name": "NEXUS Cinema Acoustic XR (Hi-Fi Edition)",
    "category": "kinh-vr",
    "categoryLabel": "Kính VR",
    "price": 1490000,
    "oldPrice": 1890000,
    "rating": 4.7,
    "reviewCount": 165,
    "colors": [
      {
        "name": "Trắng Nâu",
        "hex": "#EFEBE5",
        "imageIndex": 0,
        "image": "assets/images/products/vr-cinema-acoustic.webp"
      }
    ],
    "images": [
      "assets/images/products/vr-cinema-acoustic.webp"
    ],
    "shortDesc": "Rạp phim thực tế ảo cá nhân tích hợp cụm tai nghe vòm Stereo Sound 360° sống động.",
    "description": "Biến mọi góc phòng thành phòng chiếu phim IMAX 800 inch. Kính tích hợp sẵn củ tai nghe bọc da đệm êm ái với dải bass sâu trầm, phím cứng tăng giảm âm lượng và nhận cuộc gọi rảnh tay. Cơ chế điều chỉnh khoảng cách đồng tử (IPD) và tiêu cự độc lập cho từng mắt.",
    "specs": [
      {
        "label": "Cụm âm thanh",
        "value": "Tai nghe Hi-Fi Stereo Dynamic 40mm Composite"
      },
      {
        "label": "Thấu kính",
        "value": "PMMA quang học Nhật Bản 42mm chống ánh sáng xanh"
      },
      {
        "label": "Trường nhìn (FOV)",
        "value": "120° bao quát trường nhìn tự nhiên"
      },
      {
        "label": "Điều chỉnh",
        "value": "Chỉnh tiêu cự độc lập (Hỗ trợ cận thị đến 6.0 độ)"
      },
      {
        "label": "Phím bấm",
        "value": "Cụm nút volume và điều khiển media trên thân"
      },
      {
        "label": "Kích thước thiết bị",
        "value": "Tương thích smartphone 4.7 đến 6.7 inch"
      }
    ],
    "reviews": [
      {
        "author": "Văn Toàn",
        "rating": 5,
        "comment": "Âm thanh tai nghe đập rất chắc, xem phim 3D cảm giác như ngồi rạp chiếu phim thực thụ.",
        "date": "2026-08-30"
      }
    ],
    "featured": false,
    "stock": 120
  },
  {
    "id": "vr-010",
    "name": "NEXUS GeoExplorer (World Edition)",
    "category": "kinh-vr",
    "categoryLabel": "Kính VR",
    "price": 790000,
    "oldPrice": 990000,
    "rating": 4.6,
    "reviewCount": 88,
    "colors": [
      {
        "name": "Titanium",
        "hex": "#1A1A1A",
        "imageIndex": 0,
        "image": "assets/images/products/vr-geo-explorer.webp"
      }
    ],
    "images": [
      "assets/images/products/vr-geo-explorer.webp"
    ],
    "shortDesc": "Kính VR du lịch không gian và giáo dục thực tế ảo. Hoa văn địa cầu chìm tinh tế.",
    "description": "Khám phá các kỳ quan thế giới, lặn xuống đáy đại dương hay du hành vũ trụ ngay tại bàn học. Mặt trước in laser họa tiết bản đồ thế giới chìm sang trọng, thấu kính quang học phủ nano chống bám bụi và vân tay, hỗ trợ điều chỉnh khoảng cách đồng tử dễ dàng.",
    "specs": [
      {
        "label": "Mặt trước",
        "value": "Họa tiết bản đồ thế giới khắc chìm laser"
      },
      {
        "label": "Thấu kính",
        "value": "Resin quang học phủ nano chống phản quang"
      },
      {
        "label": "Trường nhìn (FOV)",
        "value": "95° - 100°"
      },
      {
        "label": "Hỗ trợ khúc xạ",
        "value": "Người cận dưới 5.0 độ không cần đeo kính"
      },
      {
        "label": "Dây đeo",
        "value": "Dây chữ T co giãn 3 chiều ôm sát vòm đầu"
      },
      {
        "label": "Tương thích",
        "value": "Mọi dòng smartphone từ 4.7 - 7.0 inch"
      }
    ],
    "reviews": [
      {
        "author": "Khánh Linh",
        "rating": 5,
        "comment": "Mua cho em trai học khám phá thế giới 3D, họa tiết bản đồ nhìn rất ngầu.",
        "date": "2026-07-15"
      }
    ],
    "featured": false,
    "stock": 95
  },
  {
    "id": "vr-011",
    "name": "NEXUS Mobile View Box (Gen 2)",
    "category": "kinh-vr",
    "categoryLabel": "Kính VR",
    "price": 490000,
    "oldPrice": 690000,
    "rating": 4.5,
    "reviewCount": 310,
    "colors": [
      {
        "name": "Trắng Nâu",
        "hex": "#F2F2F2",
        "imageIndex": 0,
        "image": "assets/images/products/vr-mobile-box.webp"
      }
    ],
    "images": [
      "assets/images/products/vr-mobile-box.webp"
    ],
    "shortDesc": "Kính VR cơ học thông minh giá nhập môn. Cửa trượt tản nhiệt thông minh, thấu kính HD.",
    "description": "Lựa chọn hoàn hảo để bắt đầu bước chân vào thế giới thực tế ảo và video 360 độ. Nắp trượt phía trước hỗ trợ tản nhiệt cho điện thoại khi xem lâu, khay gắn điện thoại dạng trượt tiện lợi, đệm mút bọc vải êm ái chống kích ứng da mặt.",
    "specs": [
      {
        "label": "Thấu kính",
        "value": "Quang học phi cầu đường kính 40mm"
      },
      {
        "label": "Cơ chế",
        "value": "Khay trượt tháo lắp điện thoại một chạm"
      },
      {
        "label": "Tản nhiệt",
        "value": "Cửa thông gió đối lưu khí chống nóng máy"
      },
      {
        "label": "Trường nhìn (FOV)",
        "value": "85° - 90°"
      },
      {
        "label": "Trọng lượng",
        "value": "330 g gọn nhẹ"
      },
      {
        "label": "Tương thích",
        "value": "Thiết bị Android & iPhone 4.5 - 6.5 inch"
      }
    ],
    "reviews": [
      {
        "author": "Hồng Quân",
        "rating": 4,
        "comment": "Giá sinh viên rất rẻ, xem video thực tế ảo trên Youtube rất ổn áp.",
        "date": "2026-06-22"
      }
    ],
    "featured": false,
    "stock": 200
  },
  {
    "id": "ctrl-001",
    "name": "NEXUS Motion Controller Pro",
    "category": "tay-cam",
    "categoryLabel": "Tay cầm",
    "price": 6490000,
    "oldPrice": 6990000,
    "rating": 4.8,
    "reviewCount": 156,
    "colors": [
      {
        "name": "Titanium",
        "hex": "#4B4F56",
        "imageIndex": 0,
        "image": "assets/images/products/ctrl-titanium.webp"
      },
      {
        "name": "Champagne",
        "hex": "#C8B29B",
        "imageIndex": 1,
        "image": "assets/images/products/ctrl-champagne.webp"
      },
      {
        "name": "Sport Cam",
        "hex": "#E65C00",
        "imageIndex": 2,
        "image": "assets/images/products/ctrl-sport.webp"
      }
    ],
    "images": [
      "assets/images/products/ctrl-titanium.webp",
      "assets/images/products/ctrl-champagne.webp",
      "assets/images/products/ctrl-sport.webp"
    ],
    "shortDesc": "Điều khiển chuẩn xác với phản hồi xúc giác Haptic Feedback tiên tiến.",
    "description": "Cặp tay cầm NEXUS Motion Controller tích hợp camera theo dõi độc lập, không bị giới hạn tầm nhìn, kèm mô-tơ rung Haptic mang lại cảm giác chân thực nhất.",
    "specs": [
      {
        "label": "Công nghệ",
        "value": "Theo dõi Inside-Out độc lập 6DoF"
      },
      {
        "label": "Phản hồi xúc giác",
        "value": "Haptic Actuator độ trễ siêu thấp"
      },
      {
        "label": "Cảm biến lực",
        "value": "Trigger cảm ứng biến thiên độ nhạy"
      },
      {
        "label": "Thời lượng pin",
        "value": "Pin sạc tích hợp (Dùng liên tục 10 giờ)"
      },
      {
        "label": "Kết nối",
        "value": "Không dây NEXUS Link 2.4GHz siêu tốc"
      },
      {
        "label": "Trọng lượng",
        "value": "160 g mỗi bên"
      }
    ],
    "reviews": [],
    "featured": true,
    "stock": 89
  },
  {
    "id": "ctrl-002",
    "name": "NEXUS Precision Stylus XR",
    "category": "tay-cam",
    "categoryLabel": "Tay cầm",
    "price": 3490000,
    "oldPrice": 3990000,
    "rating": 4.9,
    "reviewCount": 76,
    "colors": [
      {
        "name": "Titanium",
        "hex": "#4B4F56",
        "imageIndex": 0,
        "image": "assets/images/products/stylus-xr.webp"
      }
    ],
    "images": [
      "assets/images/products/stylus-xr.webp"
    ],
    "shortDesc": "Bút vẽ không gian 3D với 4096 mức cảm ứng lực và rung xúc giác.",
    "description": "Thiết bị vẽ và phác thảo mô hình 3D trong không gian thực với độ chính xác dưới milimet. Thân bút bằng titanium satin kết hợp gốm đen mờ và đầu rung xúc giác mạ vàng tinh xảo.",
    "specs": [
      {
        "label": "Độ nhạy áp lực",
        "value": "4096 mức cảm ứng lực vi mô"
      },
      {
        "label": "Góc nghiêng",
        "value": "Nhận diện độ nghiêng 60 độ"
      },
      {
        "label": "Thời lượng pin",
        "value": "14 giờ sáng tạo liên tục"
      },
      {
        "label": "Đế sạc",
        "value": "Đế sạc từ tính titanium nguyên khối đi kèm"
      },
      {
        "label": "Ngòi bút",
        "value": "3 ngòi thay thế phủ gốm siêu bền"
      },
      {
        "label": "Trọng lượng",
        "value": "28 g"
      }
    ],
    "reviews": [
      {
        "author": "Hoàng Yến",
        "rating": 5,
        "comment": "Cảm giác vẽ trong không gian 3D mượt mà tự nhiên như cầm bút vẽ thật.",
        "date": "2026-08-25"
      }
    ],
    "featured": false,
    "stock": 64
  },
  {
    "id": "acc-001",
    "name": "NEXUS Magnetic Charging Dock",
    "category": "phu-kien",
    "categoryLabel": "Phụ kiện",
    "price": 2990000,
    "oldPrice": 3490000,
    "rating": 4.6,
    "reviewCount": 92,
    "colors": [
      {
        "name": "Titanium",
        "hex": "#4B4F56",
        "imageIndex": 0,
        "image": "assets/images/products/dock-titanium.webp"
      },
      {
        "name": "Champagne",
        "hex": "#C8B29B",
        "imageIndex": 1,
        "image": "assets/images/products/dock-champagne.webp"
      },
      {
        "name": "Trắng Nâu",
        "hex": "#D8D8D8",
        "imageIndex": 2,
        "image": "assets/images/products/dock-silver.webp"
      }
    ],
    "images": [
      "assets/images/products/dock-titanium.webp",
      "assets/images/products/dock-champagne.webp",
      "assets/images/products/dock-silver.webp"
    ],
    "shortDesc": "Đế sạc từ tính đa năng cho kính và tay cầm. Nhôm nguyên khối.",
    "description": "Giải pháp sạc thanh lịch giúp không gian làm việc luôn gọn gàng. Sạc đồng thời NEXUS Vision Pro và hai tay cầm chỉ với một điểm chạm từ tính.",
    "specs": [
      {
        "label": "Công suất",
        "value": "100W Fast Charge GaN III"
      },
      {
        "label": "Chất liệu",
        "value": "Hợp kim nhôm Anodized nguyên khối"
      },
      {
        "label": "Đèn LED",
        "value": "Đèn trạng thái sạc ẩn vi mô"
      },
      {
        "label": "Tương thích",
        "value": "Toàn bộ hệ sinh thái kính và tay cầm NEXUS"
      },
      {
        "label": "Bảo vệ",
        "value": "Chống quá nhiệt, quá dòng thông minh"
      },
      {
        "label": "Cáp đi kèm",
        "value": "Cáp Type-C bọc dù 2 mét cao cấp"
      }
    ],
    "reviews": [],
    "featured": true,
    "stock": 45
  },
  {
    "id": "acc-002",
    "name": "NEXUS Solo Knit Band",
    "category": "phu-kien",
    "categoryLabel": "Phụ kiện",
    "price": 2490000,
    "oldPrice": 2690000,
    "rating": 4.9,
    "reviewCount": 134,
    "colors": [
      {
        "name": "Trắng Nâu",
        "hex": "#EFEBE5",
        "imageIndex": 0,
        "image": "assets/images/products/strap-cream.webp"
      },
      {
        "name": "Titanium",
        "hex": "#4B4F56",
        "imageIndex": 1,
        "image": "assets/images/products/strap-titanium.webp"
      },
      {
        "name": "Sport Cam",
        "hex": "#E65C00",
        "imageIndex": 2,
        "image": "assets/images/products/strap-sport.webp"
      }
    ],
    "images": [
      "assets/images/products/strap-cream.webp",
      "assets/images/products/strap-titanium.webp",
      "assets/images/products/strap-sport.webp"
    ],
    "shortDesc": "Dây đeo đan 3D êm ái, co giãn và thoáng khí tuyệt đối.",
    "description": "Được đan 3D từ hàng nghìn sợi vi sinh, Solo Knit Band phân bổ đều trọng lượng của kính, giúp bạn luôn thoải mái kể cả khi đeo cả ngày dài.",
    "specs": [
      {
        "label": "Chất liệu",
        "value": "Sợi dệt 3D sinh học thân thiện môi trường"
      },
      {
        "label": "Cơ chế vặn",
        "value": "Vòng xoay tinh chỉnh vi mô Fit Dial"
      },
      {
        "label": "Kích cỡ",
        "value": "S, M, L dễ dàng hoán đổi"
      },
      {
        "label": "Vệ sinh",
        "value": "Có thể giặt tay không xơ sợi"
      },
      {
        "label": "Ngàm gắn",
        "value": "Khóa từ tính tháo lắp nhanh 1 chạm"
      },
      {
        "label": "Tương thích",
        "value": "NEXUS Vision Pro & Vision Studio"
      }
    ],
    "reviews": [],
    "featured": true,
    "stock": 210
  },
  {
    "id": "acc-003",
    "name": "NEXUS Leather Travel Case",
    "category": "phu-kien",
    "categoryLabel": "Phụ kiện",
    "price": 4490000,
    "oldPrice": 4990000,
    "rating": 4.8,
    "reviewCount": 67,
    "colors": [
      {
        "name": "Caramel",
        "hex": "#A67C52",
        "imageIndex": 0,
        "image": "assets/images/products/case-caramel.webp"
      },
      {
        "name": "Trắng Nâu",
        "hex": "#EFEBE5",
        "imageIndex": 1,
        "image": "assets/images/products/case-cream.webp"
      },
      {
        "name": "Xám Than",
        "hex": "#231F1C",
        "imageIndex": 2,
        "image": "assets/images/products/case-espresso.webp"
      }
    ],
    "images": [
      "assets/images/products/case-caramel.webp",
      "assets/images/products/case-cream.webp",
      "assets/images/products/case-espresso.webp"
    ],
    "shortDesc": "Hộp bảo vệ cao cấp chống sốc bọc da sang trọng đẳng cấp doanh nhân.",
    "description": "Được thiết kế riêng cho NEXUS Vision Pro. Vỏ ngoài bằng vật liệu dệt cao cấp chống nước, lót trong bằng vải sợi siêu nhỏ bảo vệ thấu kính tuyệt đối.",
    "specs": [
      {
        "label": "Vỏ ngoài",
        "value": "Polycarbonate định hình nhiệt bọc da thủ công"
      },
      {
        "label": "Lớp lót",
        "value": "Sợi Microfiber cao cấp chống trầy xước"
      },
      {
        "label": "Khóa kéo",
        "value": "Khóa chống thấm nước YKK Metal"
      },
      {
        "label": "Ngăn chứa",
        "value": "Đủ chỗ cho Kính, Pin ngoài và 2 Cáp sạc"
      },
      {
        "label": "Tay xách",
        "value": "Da thuộc dập chìm logo NEXUS"
      },
      {
        "label": "Trọng lượng",
        "value": "480 g"
      }
    ],
    "reviews": [],
    "featured": false,
    "stock": 55
  },
  {
    "id": "acc-005",
    "name": "NEXUS Optical Inserts by ZEISS",
    "category": "phu-kien",
    "categoryLabel": "Phụ kiện",
    "price": 2990000,
    "oldPrice": 3290000,
    "rating": 4.9,
    "reviewCount": 215,
    "colors": [
      {
        "name": "Titanium",
        "hex": "#4B4F56",
        "imageIndex": 0,
        "image": "assets/images/products/lens-inserts.webp"
      }
    ],
    "images": [
      "assets/images/products/lens-inserts.webp"
    ],
    "shortDesc": "Tròng kính thuốc quang học từ tính hiệu chuẩn theo toa cá nhân.",
    "description": "Hợp tác độc quyền cùng ZEISS để mang lại độ trong suốt quang học tuyệt hảo cho người cận, viễn hoặc loạn thị. Ngàm hít từ tính siêu nhạy, tự động kết nối và hiệu chuẩn với màn hình thấu kính trong 1 giây.",
    "specs": [
      {
        "label": "Công nghệ thấu kính",
        "value": "ZEISS DuraVision Lenses chống chói"
      },
      {
        "label": "Ngàm gắn",
        "value": "Khung hợp kim titan hít từ tính tự động"
      },
      {
        "label": "Phụ kiện kèm theo",
        "value": "Hộp nhung bảo vệ bọc kim loại sang trọng"
      },
      {
        "label": "Độ khúc xạ",
        "value": "Gia công theo toa thuốc cá nhân (-8.0D đến +4.0D)"
      },
      {
        "label": "Kháng nước",
        "value": "Lớp phủ kỵ nước Oleophobic chống bám mồ hôi"
      },
      {
        "label": "Trọng lượng",
        "value": "12 g mỗi bên"
      }
    ],
    "reviews": [
      {
        "author": "Đức Thành",
        "rating": 5,
        "comment": "Đeo kính cận vẫn dùng VR thoải mái, tháo lắp từ tính cực kỳ tiện dụng.",
        "date": "2026-09-08"
      }
    ],
    "featured": false,
    "stock": 140
  },
  {
    "id": "acc-006",
    "name": "NEXUS MagPower Spatial Battery Pack",
    "category": "phu-kien",
    "categoryLabel": "Phụ kiện",
    "price": 2890000,
    "oldPrice": 3290000,
    "rating": 4.7,
    "reviewCount": 98,
    "colors": [
      {
        "name": "Champagne",
        "hex": "#C8B29B",
        "imageIndex": 0,
        "image": "assets/images/products/battery-pack.webp"
      }
    ],
    "images": [
      "assets/images/products/battery-pack.webp"
    ],
    "shortDesc": "Pin dự phòng từ tính vỏ nhôm nguyên khối, nâng thời lượng thêm 6 giờ.",
    "description": "Bộ pin ngoài bằng nhôm champagne bo cong mềm mại với dây cáp dệt dù cao cấp chống đứt gãy. Cung cấp năng lượng ổn định giúp bạn thoải mái xem phim, hội họp hoặc du ngoạn metaverse suốt cả ngày dài.",
    "specs": [
      {
        "label": "Dung lượng",
        "value": "20.000 mAh (Công suất ra 65W PD)"
      },
      {
        "label": "Thời lượng bổ sung",
        "value": "Thêm 5,5 đến 6 giờ sử dụng liên tục"
      },
      {
        "label": "Đèn báo",
        "value": "Thanh LED vi mô hiển thị phần trăm pin"
      },
      {
        "label": "Chất liệu",
        "value": "Nhôm Anodized xử lý phun cát mịn màng"
      },
      {
        "label": "Cổng kết nối",
        "value": "2x USB-C Power Delivery 3.0"
      },
      {
        "label": "Trọng lượng",
        "value": "320 g"
      }
    ],
    "reviews": [],
    "featured": false,
    "stock": 75
  }
];

const POSTS = [
  {
    id: "post-001",
    title: "AI Eye Tracking thay đổi trải nghiệm VR như thế nào?",
    category: "cong-nghe",
    categoryLabel: "Công nghệ",
    excerpt: "Tìm hiểu cách công nghệ theo dõi mắt bằng AI giúp tối ưu độ nét và tiết kiệm pin trên kính VR thế hệ mới.",
    content: [
      "Công nghệ AI Eye Tracking không còn là khái niệm xa lạ trong ngành thực tế ảo. Bằng cách theo dõi chính xác vị trí đồng tử theo thời gian thực, hệ thống có thể tập trung tài nguyên xử lý vào đúng vùng mắt đang nhìn.",
      "Kỹ thuật này gọi là Foveated Rendering — chỉ vùng trung tâm tầm nhìn được render ở độ phân giải tối đa, phần ngoại vi được giảm chi tiết mà mắt người gần như không nhận ra sự khác biệt.",
      "Kết quả là hiệu năng xử lý tăng đáng kể trong khi mức tiêu thụ pin giảm xuống, cho phép các phiên chơi kéo dài hơn mà không cần nâng cấp phần cứng đồ họa."
    ],
    image: "assets/images/hero/hero-highlight-front.jpg",
    author: "Đội ngũ NEXUS",
    date: "2026-08-01",
    readTime: 5,
    featured: true
  },
  {
    id: "post-002",
    title: "5 tựa game VR đáng chơi nhất năm 2026",
    category: "game-vr",
    categoryLabel: "Game VR",
    excerpt: "Danh sách những tựa game thực tế ảo được đánh giá cao nhất trong năm nay, từ hành động đến giải đố.",
    content: [
      "Năm 2026 chứng kiến sự bùng nổ của các tựa game VR với đồ họa và gameplay được đầu tư kỹ lưỡng hơn bao giờ hết.",
      "Từ thể loại hành động nhịp độ nhanh đến giải đố trầm lắng, người chơi có vô số lựa chọn phù hợp với sở thích cá nhân.",
      "Bài viết tổng hợp 5 tựa game nổi bật nhất, kèm đánh giá chi tiết về thời lượng chơi và mức độ tương thích với các dòng kính NEXUS."
    ],
    image: "assets/images/hero/hero-highlight-side.jpg",
    author: "Trường Vũ",
    date: "2026-07-20",
    readTime: 7,
    featured: false
  },
  {
    id: "post-003",
    title: "Hướng dẫn thiết lập NEXUS Vision Pro lần đầu trong 5 phút",
    category: "huong-dan",
    categoryLabel: "Hướng dẫn",
    excerpt: "Các bước thiết lập nhanh gọn giúp bạn bắt đầu trải nghiệm ngay sau khi mở hộp.",
    content: [
      "Sau khi mở hộp, việc đầu tiên là sạc đầy pin và tải ứng dụng đồng hành NEXUS Companion trên điện thoại.",
      "Kết nối kính với Wi-Fi, đăng nhập tài khoản, và làm theo hướng dẫn thiết lập không gian chơi (Play Area) trong ứng dụng.",
      "Sau bước hiệu chỉnh tay cầm, bạn đã sẵn sàng trải nghiệm toàn bộ thư viện nội dung NEXUS."
    ],
    image: "assets/images/hero/hero-highlight-top.jpg",
    author: "Đội ngũ NEXUS",
    date: "2026-06-15",
    readTime: 4,
    featured: false
  }
];

window.PRODUCTS = PRODUCTS;
window.POSTS = POSTS;

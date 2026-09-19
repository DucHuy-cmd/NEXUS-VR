/* =========================================================
   NEXUS VR — data/products-data.js
   [PHỤ TRÁCH: Đức Huy dựng khung ban đầu, Nhất Vũ bổ sung
   thêm sản phẩm/thông số kỹ thuật chi tiết cho product.html]
   TẦNG 1 - DATA & SERVICES

   Nhúng bằng script THƯỜNG (không phải type="module"), TRƯỚC
   mọi file JS khác đọc PRODUCTS/POSTS:
     <script src="assets/js/data/products-data.js"></script>

   Khi thêm sản phẩm/bài viết mới, giữ đúng cấu trúc field bên
   dưới — không tự đổi tên field khi chưa báo cả nhóm.
   ========================================================= */

const PRODUCTS = [
  {
    id: "vr-001",
    name: "NEXUS Vision Pro 8K",
    category: "kinh-vr",
    categoryLabel: "Kính VR",
    price: 24990000,
    oldPrice: 28500000,
    rating: 4.8,
    reviewCount: 214,
    colors: [
      { name: "Đen Vũ Trụ", hex: "#12121a" },
      { name: "Trắng Bạc", hex: "#e8e9ee" }
    ],
    images: [
      "assets/images/products/vr-001-1.webp",
      "assets/images/products/vr-001-2.webp",
      "assets/images/products/vr-001-3.webp",
      "assets/images/products/vr-001-4.webp"
    ],
    shortDesc: "Màn hình 8K, AI Eye Tracking, âm thanh 360°.",
    description: "NEXUS Vision Pro 8K là flagship cao cấp nhất của dòng NEXUS, tích hợp màn hình 8K cho từng mắt, công nghệ AI Eye Tracking theo dõi chuyển động mắt theo thời gian thực, và hệ thống âm thanh không gian 360° tái tạo chính xác vị trí âm thanh trong không gian ảo.",
    specs: [
      { label: "Độ phân giải", value: "8K (7680 x 3840) mỗi mắt" },
      { label: "Tần số quét", value: "120Hz" },
      { label: "Trường nhìn (FOV)", value: "130°" },
      { label: "Trọng lượng", value: "420g" },
      { label: "Thời lượng pin", value: "3.5 giờ sử dụng liên tục" },
      { label: "Kết nối", value: "USB-C 3.2, Wi-Fi 6E, Bluetooth 5.3" }
    ],
    reviews: [
      { author: "Minh Anh", rating: 5, comment: "Độ trễ gần như bằng không, trải nghiệm tuyệt vời.", date: "2026-08-12" },
      { author: "Quốc Bảo", rating: 5, comment: "Đeo cả buổi không mỏi, âm thanh 360° rất sống động.", date: "2026-07-30" },
      { author: "Thu Trang", rating: 4, comment: "Sản phẩm tốt nhưng giá hơi cao so với mặt bằng chung.", date: "2026-07-02" }
    ],
    featured: true,
    stock: 42
  },
  {
    id: "vr-002",
    name: "NEXUS Air Lite",
    category: "kinh-vr",
    categoryLabel: "Kính VR",
    price: 12490000,
    oldPrice: null,
    rating: 4.5,
    reviewCount: 132,
    colors: [{ name: "Đen Vũ Trụ", hex: "#12121a" }],
    images: [
      "assets/images/products/vr-002-1.webp",
      "assets/images/products/vr-002-2.webp",
      "assets/images/products/vr-002-3.webp"
    ],
    shortDesc: "Nhẹ, gọn, phù hợp người mới bắt đầu.",
    description: "NEXUS Air Lite là lựa chọn nhập môn lý tưởng — trọng lượng nhẹ hơn 30% so với dòng Pro, vẫn giữ độ phân giải sắc nét và thiết lập nhanh trong 2 phút.",
    specs: [
      { label: "Độ phân giải", value: "4K mỗi mắt" },
      { label: "Tần số quét", value: "90Hz" },
      { label: "Trường nhìn (FOV)", value: "110°" },
      { label: "Trọng lượng", value: "295g" },
      { label: "Thời lượng pin", value: "2.5 giờ sử dụng liên tục" }
    ],
    reviews: [
      { author: "Hải Đăng", rating: 4, comment: "Nhẹ và dễ dùng, hợp cho người mới.", date: "2026-06-18" }
    ],
    featured: true,
    stock: 78
  },
  {
    id: "ctrl-001",
    name: "NEXUS Motion Controller",
    category: "tay-cam",
    categoryLabel: "Tay cầm",
    price: 3290000,
    oldPrice: null,
    rating: 4.7,
    reviewCount: 89,
    colors: [
      { name: "Đen Vũ Trụ", hex: "#12121a" },
      { name: "Tím Neon", hex: "#7b2fff" }
    ],
    images: [
      "assets/images/products/ctrl-001-1.webp",
      "assets/images/products/ctrl-001-2.webp"
    ],
    shortDesc: "Cặp tay cầm theo dõi chuyển động độ chính xác cao.",
    description: "Cặp tay cầm NEXUS Motion Controller sử dụng cảm biến 6-DOF, phản hồi haptic chi tiết, tương thích toàn bộ dòng kính NEXUS.",
    specs: [
      { label: "Loại cảm biến", value: "6-DOF Motion Tracking" },
      { label: "Phản hồi", value: "Haptic Feedback đa cấp độ" },
      { label: "Pin", value: "AA x2, dùng được 30 giờ" }
    ],
    reviews: [],
    featured: true,
    stock: 156
  },
  {
    id: "acc-001",
    name: "NEXUS Comfort Strap",
    category: "phu-kien",
    categoryLabel: "Phụ kiện",
    price: 890000,
    oldPrice: 1090000,
    rating: 4.3,
    reviewCount: 41,
    colors: [{ name: "Đen Vũ Trụ", hex: "#12121a" }],
    images: ["assets/images/products/acc-001-1.webp"],
    shortDesc: "Dây đeo đầu êm ái, giảm áp lực khi dùng lâu.",
    description: "Dây đeo thay thế bằng chất liệu đệm mút hoạt tính, phân bổ đều trọng lượng kính lên toàn bộ đầu thay vì dồn vào mặt.",
    specs: [
      { label: "Chất liệu", value: "Mút hoạt tính + vải thoáng khí" },
      { label: "Tương thích", value: "Toàn bộ dòng NEXUS Vision & Air" }
    ],
    reviews: [],
    featured: false,
    stock: 210
  },
  {
    id: "vr-003",
    name: "NEXUS Vision SE",
    category: "kinh-vr",
    categoryLabel: "Kính VR",
    price: 17990000,
    oldPrice: 19990000,
    rating: 4.6,
    reviewCount: 97,
    colors: [
      { name: "Đen Vũ Trụ", hex: "#12121a" },
      { name: "Xám Titan", hex: "#5a5f6b" }
    ],
    images: [
      "assets/images/products/vr-003-1.webp",
      "assets/images/products/vr-003-2.webp",
      "assets/images/products/vr-003-3.webp"
    ],
    shortDesc: "Bản cân bằng giữa Pro và Air — 6K, FOV rộng, giá hợp lý.",
    description: "NEXUS Vision SE lấp khoảng trống giữa Air Lite và Vision Pro 8K — vẫn giữ độ phân giải 6K sắc nét, trường nhìn rộng 120°, nhưng lược bớt AI Eye Tracking để tối ưu chi phí cho người dùng phổ thông muốn trải nghiệm cao cấp.",
    specs: [
      { label: "Độ phân giải", value: "6K (5760 x 2880) mỗi mắt" },
      { label: "Tần số quét", value: "100Hz" },
      { label: "Trường nhìn (FOV)", value: "120°" },
      { label: "Trọng lượng", value: "360g" },
      { label: "Thời lượng pin", value: "3 giờ sử dụng liên tục" },
      { label: "Kết nối", value: "USB-C 3.2, Wi-Fi 6, Bluetooth 5.2" }
    ],
    reviews: [
      { author: "Ngọc Hân", rating: 5, comment: "Giá tốt mà chất lượng hình ảnh gần bằng bản Pro.", date: "2026-08-05" },
      { author: "Anh Dũng", rating: 4, comment: "Ổn trong tầm giá, chỉ tiếc thiếu Eye Tracking.", date: "2026-07-22" }
    ],
    featured: false,
    stock: 63
  },
  {
    id: "ctrl-002",
    name: "NEXUS Precision Grip",
    category: "tay-cam",
    categoryLabel: "Tay cầm",
    price: 3990000,
    oldPrice: null,
    rating: 4.6,
    reviewCount: 54,
    colors: [{ name: "Đen Vũ Trụ", hex: "#12121a" }],
    images: [
      "assets/images/products/ctrl-002-1.webp",
      "assets/images/products/ctrl-002-2.webp"
    ],
    shortDesc: "Tay cầm cảm biến lực bóp, dành cho game bắn súng/thể thao.",
    description: "NEXUS Precision Grip bổ sung cảm biến lực bóp (grip pressure sensor) cho các thao tác cầm nắm vật thể ảo mượt mà hơn, kèm dải đeo cổ tay điều chỉnh được, phù hợp các tựa game cường độ cao.",
    specs: [
      { label: "Loại cảm biến", value: "6-DOF Motion Tracking + Grip Pressure" },
      { label: "Phản hồi", value: "Haptic Feedback đa cấp độ" },
      { label: "Pin", value: "Sạc trong, dùng được 20 giờ" }
    ],
    reviews: [
      { author: "Việt Hoàng", rating: 5, comment: "Cảm biến lực bóp rất nhạy, chơi game bắn súng đã hơn hẳn.", date: "2026-08-20" }
    ],
    featured: false,
    stock: 89
  },
  {
    id: "acc-002",
    name: "NEXUS Lens Protector",
    category: "phu-kien",
    categoryLabel: "Phụ kiện",
    price: 350000,
    oldPrice: null,
    rating: 4.1,
    reviewCount: 26,
    colors: [{ name: "Trong Suốt", hex: "#f0f4f8" }],
    images: ["assets/images/products/acc-002-1.webp"],
    shortDesc: "Miếng dán bảo vệ thấu kính, chống trầy xước.",
    description: "Bộ 2 miếng dán bảo vệ thấu kính trong suốt độ trong 99.5%, không ảnh hưởng chất lượng hình ảnh, dễ dán và tháo không để lại keo dư.",
    specs: [
      { label: "Chất liệu", value: "PET quang học độ trong 99.5%" },
      { label: "Số lượng", value: "2 miếng/bộ" },
      { label: "Tương thích", value: "NEXUS Vision Pro 8K, Vision SE, Air Lite" }
    ],
    reviews: [],
    featured: false,
    stock: 340
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
    image: "assets/images/blog/post-001.webp",
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
    image: "assets/images/blog/post-002.webp",
    author: "Trường Vũ",
    date: "2026-07-20",
    readTime: 7,
    featured: false
  },
  {
    id: "post-003",
    title: "Hướng dẫn thiết lập NEXUS VR lần đầu trong 5 phút",
    category: "huong-dan",
    categoryLabel: "Hướng dẫn",
    excerpt: "Các bước thiết lập nhanh gọn giúp bạn bắt đầu trải nghiệm ngay sau khi mở hộp.",
    content: [
      "Sau khi mở hộp, việc đầu tiên là sạc đầy pin và tải ứng dụng đồng hành NEXUS Companion trên điện thoại.",
      "Kết nối kính với Wi-Fi, đăng nhập tài khoản, và làm theo hướng dẫn thiết lập không gian chơi (Play Area) trong ứng dụng.",
      "Sau bước hiệu chỉnh tay cầm, bạn đã sẵn sàng trải nghiệm toàn bộ thư viện nội dung NEXUS."
    ],
    image: "assets/images/blog/post-003.webp",
    author: "Đội ngũ NEXUS",
    date: "2026-06-15",
    readTime: 4,
    featured: false
  }
];



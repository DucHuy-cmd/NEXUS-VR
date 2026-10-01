/* =========================================================
   NEXUS VR — data/products-data.js
   TẦNG 1 - DATA & SERVICES: PRODUCT CATALOG & POSTS
   ========================================================= */

const PRODUCTS = [
  {
    id: "vr-001",
    name: "NEXUS Vision Pro",
    category: "kinh-vr",
    categoryLabel: "Kính VR",
    price: 89990000,
    oldPrice: 94990000,
    rating: 4.9,
    reviewCount: 345,
    colors: [
      { name: "Xám Than", hex: "#9F9FA1", imageIndex: 0, image: "assets/images/products/hero-vr-headset-xam.webp" },
      { name: "Trắng Nâu", hex: "#EFEBE5", imageIndex: 1, image: "assets/images/products/hero-vr-headset-trangnau.webp" },
      { name: "Xanh Cam", hex: "#D9E0E9", imageIndex: 2, image: "assets/images/products/hero-vr-headset-xanhcam.webp" }
    ],
    images: [
      "assets/images/products/hero-vr-headset-xam.webp",
      "assets/images/products/hero-vr-headset-trangnau.webp",
      "assets/images/products/hero-vr-headset-xanhcam.webp",
      "assets/images/products/person-vr.jpg"
    ],
    shortDesc: "Máy tính không gian cao cấp. Màn hình 8K, 120Hz.",
    description: "NEXUS Vision Pro kết hợp thế giới thực và ảo một cách liền mạch. Trang bị màn hình siêu nét 8K cho mỗi mắt, chip xử lý không gian NEXUS M2, và hệ thống camera bắt nét thời gian thực.",
    specs: [
      { label: "Độ phân giải", value: "8K (7680 × 3840) mỗi mắt" },
      { label: "Tần số quét", value: "120 Hz" },
      { label: "Trường nhìn (FOV)", value: "130°" },
      { label: "Trọng lượng", value: "420 g" },
      { label: "Thời lượng pin", value: "3,5 giờ sử dụng liên tục" },
      { label: "Kết nối", value: "Wi-Fi 7, Bluetooth 5.4" }
    ],
    reviews: [
      { author: "Minh Anh", rating: 5, comment: "Kỷ nguyên mới của điện toán cá nhân. Vượt xa mọi kỳ vọng.", date: "2026-08-12" },
      { author: "Quốc Bảo", rating: 5, comment: "Độ nét kinh ngạc, không thể nhận ra điểm ảnh. Xứng đáng với giá tiền.", date: "2026-07-30" },
      { author: "Thu Trang", rating: 4, comment: "Phần mềm mượt mà, nhưng giá vẫn hơi cao với số đông.", date: "2026-07-02" }
    ],
    featured: true,
    stock: 24
  },
  {
    id: "vr-002",
    name: "NEXUS Air Lite",
    category: "kinh-vr",
    categoryLabel: "Kính VR",
    price: 12490000,
    oldPrice: null,
    rating: 4.7,
    reviewCount: 812,
    colors: [
      { name: "Xám Than", hex: "#9F9FA1", imageIndex: 0, image: "assets/images/products/hero-vr-headset-xam.webp" }
    ],
    images: [
      "assets/images/products/hero-vr-headset-xam.webp"
    ],
    shortDesc: "Lựa chọn thực tế ảo di động, gọn nhẹ và đa dụng.",
    description: "NEXUS Air Lite mang đến trải nghiệm VR mượt mà với mức giá dễ tiếp cận. Thiết kế siêu nhẹ 295g, không cần kết nối dây rườm rà.",
    specs: [
      { label: "Độ phân giải", value: "4K mỗi mắt" },
      { label: "Tần số quét", value: "90 Hz" },
      { label: "Trường nhìn (FOV)", value: "110°" },
      { label: "Trọng lượng", value: "295 g" },
      { label: "Thời lượng pin", value: "2,5 giờ sử dụng liên tục" },
      { label: "Kết nối", value: "Wi-Fi 6E, Bluetooth 5.2" }
    ],
    reviews: [
      { author: "Hải Đăng", rating: 5, comment: "Giá quá tốt cho một hệ sinh thái mạnh mẽ như NEXUS.", date: "2026-06-18" }
    ],
    featured: true,
    stock: 154
  },
  {
    id: "ctrl-001",
    name: "NEXUS Motion Controller Pro",
    category: "tay-cam",
    categoryLabel: "Tay cầm",
    price: 6990000,
    oldPrice: null,
    rating: 4.8,
    reviewCount: 156,
    colors: [
      { name: "Titanium", hex: "#4B4F56", imageIndex: 0, image: "assets/images/products/ctrl-titanium.jpg" },
      { name: "Champagne", hex: "#C8B29B", imageIndex: 1, image: "assets/images/products/ctrl-champagne.jpg" },
      { name: "Sport Cam", hex: "#E65C00", imageIndex: 2, image: "assets/images/products/ctrl-sport.jpg" }
    ],
    images: [
      "assets/images/products/ctrl-titanium.jpg",
      "assets/images/products/ctrl-champagne.jpg",
      "assets/images/products/ctrl-sport.jpg"
    ],
    shortDesc: "Điều khiển chuẩn xác với phản hồi xúc giác tiên tiến.",
    description: "Cặp tay cầm NEXUS Motion Controller tích hợp camera theo dõi độc lập, không bị giới hạn tầm nhìn, kèm mô-tơ rung Haptic mang lại cảm giác chân thực nhất.",
    specs: [
      { label: "Công nghệ", value: "Theo dõi Inside-Out độc lập" },
      { label: "Phản hồi", value: "Haptic Feedback độ trễ siêu thấp" },
      { label: "Pin", value: "Pin sạc tích hợp (Dùng 10 giờ)" }
    ],
    reviews: [],
    featured: true,
    stock: 89
  },
  {
    id: "acc-001",
    name: "NEXUS Magnetic Charging Dock",
    category: "phu-kien",
    categoryLabel: "Phụ kiện",
    price: 3990000,
    oldPrice: null,
    rating: 4.6,
    reviewCount: 92,
    colors: [
      { name: "Titanium", hex: "#4B4F56", imageIndex: 0, image: "assets/images/products/dock-titanium.jpg" },
      { name: "Champagne", hex: "#C8B29B", imageIndex: 1, image: "assets/images/products/dock-champagne.jpg" },
      { name: "Silver", hex: "#D8D8D8", imageIndex: 2, image: "assets/images/products/dock-silver.jpg" }
    ],
    images: [
      "assets/images/products/dock-titanium.jpg",
      "assets/images/products/dock-champagne.jpg",
      "assets/images/products/dock-silver.jpg"
    ],
    shortDesc: "Đế sạc từ tính đa năng cho kính và tay cầm.",
    description: "Giải pháp sạc thanh lịch giúp không gian làm việc luôn gọn gàng. Sạc đồng thời NEXUS Vision Pro và hai tay cầm chỉ với một điểm chạm từ tính.",
    specs: [
      { label: "Công suất", value: "100W Fast Charge" },
      { label: "Chất liệu", value: "Hợp kim nhôm Anodized nguyên khối" },
      { label: "Tương thích", value: "Toàn bộ hệ sinh thái NEXUS" }
    ],
    reviews: [],
    featured: true,
    stock: 45
  },
  {
    id: "acc-002",
    name: "NEXUS Solo Knit Band",
    category: "phu-kien",
    categoryLabel: "Phụ kiện",
    price: 2490000,
    oldPrice: null,
    rating: 4.9,
    reviewCount: 134,
    colors: [
      { name: "Cream", hex: "#EFEBE5", imageIndex: 0, image: "assets/images/products/strap-cream.jpg" },
      { name: "Titanium", hex: "#4B4F56", imageIndex: 1, image: "assets/images/products/strap-titanium.jpg" },
      { name: "Sport Cam", hex: "#E65C00", imageIndex: 2, image: "assets/images/products/strap-sport.jpg" }
    ],
    images: [
      "assets/images/products/strap-cream.jpg",
      "assets/images/products/strap-titanium.jpg",
      "assets/images/products/strap-sport.jpg"
    ],
    shortDesc: "Dây đeo đan 3D êm ái, co giãn và thoáng khí.",
    description: "Được đan 3D từ hàng nghìn sợi vi sinh, Solo Knit Band phân bổ đều trọng lượng của kính, giúp bạn luôn thoải mái kể cả khi đeo cả ngày dài.",
    specs: [
      { label: "Chất liệu", value: "Sợi dệt 3D sinh học thân thiện môi trường" },
      { label: "Cơ chế", value: "Vòng xoay tinh chỉnh vi mô" }
    ],
    reviews: [],
    featured: true,
    stock: 210
  },
  {
    id: "acc-003",
    name: "NEXUS Leather Travel Case",
    category: "phu-kien",
    categoryLabel: "Phụ kiện",
    price: 4990000,
    oldPrice: null,
    rating: 4.8,
    reviewCount: 67,
    colors: [
      { name: "Caramel", hex: "#A67C52", imageIndex: 0, image: "assets/images/products/case-caramel.jpg" },
      { name: "Cream", hex: "#EFEBE5", imageIndex: 1, image: "assets/images/products/case-cream.jpg" },
      { name: "Espresso", hex: "#231F1C", imageIndex: 2, image: "assets/images/products/case-espresso.jpg" }
    ],
    images: [
      "assets/images/products/case-caramel.jpg",
      "assets/images/products/case-cream.jpg",
      "assets/images/products/case-espresso.jpg"
    ],
    shortDesc: "Hộp bảo vệ cao cấp chống sốc.",
    description: "Được thiết kế riêng cho NEXUS Vision Pro. Vỏ ngoài bằng vật liệu dệt cao cấp chống nước, lót trong bằng vải sợi siêu nhỏ bảo vệ thấu kính tuyệt đối.",
    specs: [
      { label: "Vỏ ngoài", value: "Polycarbonate định hình nhiệt bọc vải" },
      { label: "Lớp lót", value: "Sợi Microfiber cao cấp chống trầy" }
    ],
    reviews: [],
    featured: false,
    stock: 55
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
    title: "Hướng dẫn thiết lập NEXUS Vision Pro lần đầu trong 5 phút",
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

window.PRODUCTS = PRODUCTS;
window.POSTS = POSTS;

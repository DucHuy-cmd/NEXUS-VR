/* ==========================================================================
NEXUS VR — modules/address-manager.js
TẦNG 2 - MODULES: QUẢN LÝ DỮ LIỆU ĐỊA CHÍNH 2 CẤP (34 TỈNH/THÀNH -> PHƯỜNG/XÃ)
========================================================================== */
(function () {
  "use strict";

  // Danh sách 34 Tỉnh / Thành phố sau sáp nhập & các Phường / Xã tiêu biểu
  const VIETNAM_ADDRESS_DATA = {
    "TP. Hồ Chí Minh": [
      "Phường Bến Nghé", "Phường Bến Thành", "Phường Phạm Ngũ Lão", "Phường Tân Định",
      "Phường Võ Thị Sáu", "Phường Thảo Điền", "Phường An Phú", "Phường Thủ Thiêm",
      "Phường Hiệp Bình Chánh", "Phường Tân Phong", "Phường Tân Quy", "Phường Bến Nghé",
      "Phường 1 (Quận 3)", "Phường 2 (Quận 5)", "Phường 12 (Quận 10)", "Xã Bình Hưng", "Xã Tân Nhựt"
    ],
    "Hà Nội": [
      "Phường Tràng Tiền", "Phường Hàng Bạc", "Phường Lý Thái Tổ", "Phường Điện Biên",
      "Phường Phan Chu Trinh", "Phường Kim Liên", "Phường Văn Miếu", "Phường Dịch Vọng",
      "Phường Yên Hòa", "Phường Mỹ Đình 1", "Phường Mỹ Đình 2", "Phường Nhật Tân",
      "Phường Tây Mỗ", "Xã Đông Hội", "Xã Kim Chung"
    ],
    "Đà Nẵng": [
      "Phường Hải Châu I", "Phường Hải Châu II", "Phường Thạch Thang", "Phường Phước Ninh",
      "Phường Mỹ An", "Phường Khuê Mỹ", "Phường An Hải Bắc", "Phường Hòa Hiệp Bắc", "Xã Hòa Vang"
    ],
    "Hải Phòng": [
      "Phường Minh Khai", "Phường Hoàng Văn Thụ", "Phường Đằng Hải", "Phường Lạch Tray",
      "Phường Quán Toan", "Phường Thủy Nguyên", "Xã An Đồng"
    ],
    "Cần Thơ": [
      "Phường Tân An", "Phường An Cư", "Phường An Khánh", "Phường Hưng Lợi",
      "Phường Cái Khế", "Phường Phước Thới", "Xã Mỹ Khánh"
    ],
    "An Giang": [
      "Phường Mỹ Long", "Phường Mỹ Bình", "Phường Mỹ Phước", "Phường Châu Phú A",
      "Phường Nút Sam", "Thị trấn Phú Mỹ", "Xã Vĩnh Tế"
    ],
    "Bắc Ninh": [
      "Phường Suối Hoa", "Phường Tiền An", "Phường Ninh Xá", "Phường Võ Cường",
      "Phường Đồng Kỵ", "Phường Trang Hạ", "Xã Yên Trung"
    ],
    "Cà Mau": [
      "Phường 1", "Phường 2", "Phường 5", "Phường 9", "Phường Tân Xuyên", "Thị trấn Sông Đốc"
    ],
    "Cao Bằng": [
      "Phường Sông Hiến", "Phường Đề Thám", "Phường Hợp Giang", "Phường Tân Giang", "Xã Bộc Tuyền"
    ],
    "Đắk Lắk": [
      "Phường Tự An", "Phường Tân Lập", "Phường Thắng Lợi", "Phường Tân An", "Xã Cư Ebur"
    ],
    "Điện Biên": [
      "Phường Mường Thanh", "Phường Nam Thanh", "Phường Tân Thanh", "Phường Him Lam", "Xã Thanh Luông"
    ],
    "Đồng Nai": [
      "Phường Trấn Biên", "Phường Bửu Long", "Phường Tân Phong", "Phường Hố Nai",
      "Phường Long Bình", "Phường An Bình", "Xã Long Hưng"
    ],
    "Đồng Tháp": [
      "Phường 1 (Cao Lãnh)", "Phường 2 (Cao Lãnh)", "Phường An Thạnh", "Phường An Lộc", "Xã Tân Thuận Đông"
    ],
    "Gia Lai": [
      "Phường Diên Hồng", "Phường Hoa Lư", "Phường Tây Sơn", "Phường Thống Nhất", "Xã Biển Hồ"
    ],
    "Hà Tĩnh": [
      "Phường Bắc Hà", "Phường Nam Hà", "Phường Trần Phú", "Phường Hà Huy Tập", "Xã Thạch Trung"
    ],
    "Hưng Yên": [
      "Phường Hiến Nam", "Phường Lam Sơn", "Phường An Tảo", "Phường Bần Yên Nhân", "Xã Nghĩa Hiệp"
    ],
    "Khánh Hòa": [
      "Phường Lộc Thọ", "Phường Vĩnh Nguyên", "Phường Phước Tiến", "Phường Phước Hải", "Xã Vĩnh Ngọc"
    ],
    "Lai Châu": [
      "Phường Quyết Thắng", "Phường Tân Phong", "Phường Đoàn Kết", "Xã San Thàng"
    ],
    "Lâm Đồng": [
      "Phường 1 (Đà Lạt)", "Phường 2 (Đà Lạt)", "Phường 10 (Đà Lạt)", "Phường Lộc Phát", "Xã Xuân Thọ"
    ],
    "Lạng Sơn": [
      "Phường Chi Lăng", "Phường Tam Thanh", "Phường Vĩnh Trại", "Phường Đông Kinh", "Xã Hoàng Văn Thụ"
    ],
    "Lào Cai": [
      "Phường Kim Tân", "Phường Bắc Cường", "Phường Duyên Hải", "Phường Sa Pa", "Xã Tả Van"
    ],
    "Nghệ An": [
      "Phường Quang Trung", "Phường Bến Thủy", "Phường Trường Thi", "Phường Cửa Nam", "Xã Nghi Phú"
    ],
    "Ninh Bình": [
      "Phường Vân Giang", "Phường Bích Đào", "Phường Nam Thành", "Phường Tây Sơn", "Xã Ninh Tiến"
    ],
    "Phú Thọ": [
      "Phường Gia Cẩm", "Phường Tiên Cát", "Phường Nông Trang", "Phường Hùng Vương", "Xã Hy Cương"
    ],
    "Quảng Ngãi": [
      "Phường Trần Phú", "Phường Lê Hồng Phong", "Phường Quảng Phú", "Phường Trương Quang Trọng"
    ],
    "Quảng Ninh": [
      "Phường Hồng Gai", "Phường Bãi Cháy", "Phường Cao Xanh", "Phường Cẩm Trung", "Phường Trà Cổ"
    ],
    "Quảng Trị": [
      "Phường 1 (Đông Hà)", "Phường 2 (Đông Hà)", "Phường An Đôn", "Thị trấn Cửa Tùng"
    ],
    "Sơn La": [
      "Phường Quyết Thắng", "Phường Tô Hiệu", "Phường Chiềng Lề", "Xã Chiềng An"
    ],
    "Tây Ninh": [
      "Phường 1", "Phường 2", "Phường 3", "Phường Hiệp Ninh", "Xã Trà Vong"
    ],
    "Thái Nguyên": [
      "Phường Hoàng Văn Thụ", "Phường Phan Đình Phùng", "Phường Quán Triều", "Phường Tân Lập"
    ],
    "Thanh Hóa": [
      "Phường Ba Đình", "Phường Điện Biên", "Phường Ngọc Trạo", "Phường Hạc Thành", "Xã Đông Lĩnh"
    ],
    "Tuyên Quang": [
      "Phường Tân Quang", "Phường Phan Thiết", "Phường Minh Xuân", "Xã Tràng Đà"
    ],
    "Vĩnh Long": [
      "Phường 1", "Phường 2", "Phường 8", "Phường Tân Ngãi", "Xã Thanh Đức"
    ],
    "Thừa Thiên Huế": [
      "Phường Phú Hội", "Phường Vĩnh Ninh", "Phường Thuận Thành", "Phường Hương Sơ", "Xã Thủy Bằng"
    ]
  };

  /**
   * Nạp danh sách 34 Tỉnh / Thành phố vào thẻ select
   */
  function populateProvinceSelect(selectEl, selectedProvince) {
    if (!selectEl) return;
    selectEl.innerHTML = `<option value="">-- Chọn Tỉnh / Thành phố (1/34) --</option>`;

    Object.keys(VIETNAM_ADDRESS_DATA).forEach((province) => {
      const opt = document.createElement("option");
      opt.value = province;
      opt.textContent = province;
      if (selectedProvince && selectedProvince === province) {
        opt.selected = true;
      }
      selectEl.appendChild(opt);
    });
  }

  /**
   * Nạp danh sách Phường / Xã tương ứng theo Tỉnh / Thành phố
   */
  function populateWardSelect(wardSelectEl, provinceName, selectedWard) {
    if (!wardSelectEl) return;

    if (!provinceName || !VIETNAM_ADDRESS_DATA[provinceName]) {
      wardSelectEl.innerHTML = `<option value="">-- Vui lòng chọn Tỉnh / Thành trước --</option>`;
      wardSelectEl.disabled = true;
      return;
    }

    const wards = VIETNAM_ADDRESS_DATA[provinceName];
    wardSelectEl.innerHTML = `<option value="">-- Chọn Phường / Xã --</option>`;
    wardSelectEl.disabled = false;

    wards.forEach((ward) => {
      const opt = document.createElement("option");
      opt.value = ward;
      opt.textContent = ward;
      if (selectedWard && selectedWard === ward) {
        opt.selected = true;
      }
      wardSelectEl.appendChild(opt);
    });
  }

  /**
   * Khởi tạo kết nối 2 cấp Tỉnh / Thành -> Phường / Xã
   */
  function initAddressCascade(provinceSelectId, wardSelectId) {
    const provinceEl = document.getElementById(provinceSelectId);
    const wardEl = document.getElementById(wardSelectId);

    if (!provinceEl || !wardEl) return;

    populateProvinceSelect(provinceEl);

    provinceEl.addEventListener("change", (e) => {
      const chosenProvince = e.target.value;
      populateWardSelect(wardEl, chosenProvince);
    });
  }

  // Export các hàm toàn cục
  window.AddressManager = {
    populateProvinceSelect,
    populateWardSelect,
    initAddressCascade,
    data: VIETNAM_ADDRESS_DATA
  };
})();
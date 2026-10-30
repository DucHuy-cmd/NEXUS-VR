/* =========================================================
   NEXUS VR — modules/validator.js   [PHỤ TRÁCH: Trường Vũ]
   TẦNG 2 - REUSABLE MODULES
   Bộ kiểm định Form & Regex đa năng (Form Validator Engine)

   TÍNH NĂNG KỸ THUẬT:
   - Kiểm tra họ tên Tiếng Việt có dấu đầy đủ (bắt buộc ít nhất 2 từ, không chứa số/ký tự lạ)
   - Kiểm tra Email chuẩn RFC 5322, ngăn chặn các ký tự độc hại
   - Kiểm tra Số điện thoại Việt Nam chuẩn 10 số (đầu số 03, 05, 07, 08, 09 hoặc +84)
   - Hỗ trợ kiểm tra thời gian thực (Real-time on input/blur) tự động hiển thị/xóa thông báo lỗi
   - DÙNG CHUNG TOÀN HỆ THỐNG: Cung cấp sẵn cho cả Form Liên hệ (Vũ) và Form Thanh toán Checkout (Tường)
   ========================================================= */

(function (global) {
  "use strict";

  /* =========================================================
     1. BẢNG MẪU REGEX TIÊU CHUẨN QUỐC TẾ & VIỆT NAM
     ========================================================= */
  // Regex hỗ trợ trọn bộ ký tự Tiếng Việt Unicode cả hoa lẫn thường
  const VIETNAMESE_LETTERS = "a-zA-ZàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ";

  // Họ tên: Ít nhất 2 từ, chỉ gồm chữ cái tiếng Việt và khoảng trắng, từ 2 đến 60 ký tự
  const REGEX_NAME = new RegExp(`^[${VIETNAMESE_LETTERS}]+(\\s+[${VIETNAMESE_LETTERS}]+)+$`);

  // Email chuẩn RFC 5322 đơn giản hóa, ngăn chặn dấu chấm liên tiếp, bắt buộc có đuôi tên miền
  const REGEX_EMAIL = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  // Số điện thoại Việt Nam 10 chữ số (hoặc định dạng quốc tế +84)
  const REGEX_PHONE_VN = /^(?:\+84|0084|0)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-46-9])[0-9]{7}$/;

  /* =========================================================
     2. CÁC HÀM KIỂM ĐỊNH ĐƠN LẺ (ATOMIC VALIDATORS)
     ========================================================= */

  /**
   * Kiểm tra chuỗi bắt buộc không được để trống
   * @param {*} value - Giá trị cần kiểm tra
   * @returns {boolean}
   */
  function isValidRequired(value) {
    if (value === null || value === undefined) return false;
    return String(value).trim().length > 0;
  }

  /**
   * Kiểm tra họ tên đầy đủ tiếng Việt (ít nhất 2 từ)
   * @param {string} name - Họ và tên
   * @returns {boolean}
   */
  function isValidName(name) {
    if (!isValidRequired(name)) return false;
    const cleanName = String(name).trim().replace(/\s+/g, " ");
    return cleanName.length >= 2 && cleanName.length <= 60 && REGEX_NAME.test(cleanName);
  }

  /**
   * Kiểm tra Email hợp lệ
   * @param {string} email - Địa chỉ email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    if (!isValidRequired(email)) return false;
    const cleanEmail = String(email).trim();
    return cleanEmail.length <= 254 && REGEX_EMAIL.test(cleanEmail);
  }

  /**
   * Kiểm tra Số điện thoại Việt Nam (10 số, đầu số nhà mạng VN)
   * Tự động loại bỏ dấu cách, dấu gạch ngang, dấu chấm trước khi kiểm tra
   * @param {string} phone - Số điện thoại
   * @returns {boolean}
   */
  function isValidPhoneVN(phone) {
    if (!isValidRequired(phone)) return false;
    const cleanPhone = String(phone).replace(/[\s\-\.\(\)]/g, "");
    return REGEX_PHONE_VN.test(cleanPhone);
  }

  /**
   * Kiểm tra độ dài tối thiểu của chuỗi
   * @param {string} str - Chuỗi cần kiểm tra
   * @param {number} minLength - Độ dài tối thiểu
   * @returns {boolean}
   */
  function isValidMinLength(str, minLength) {
    if (!str) return false;
    return String(str).trim().length >= minLength;
  }

  /**
   * Kiểm tra độ dài tối đa của chuỗi
   * @param {string} str - Chuỗi cần kiểm tra
   * @param {number} maxLength - Độ dài tối đa
   * @returns {boolean}
   */
  function isValidMaxLength(str, maxLength) {
    if (!str) return true;
    return String(str).trim().length <= maxLength;
  }

  /* =========================================================
     3. BỘ TIỆN ÍCH QUẢN LÝ GIAO DIỆN FORM (FORM UI HELPER)
     ========================================================= */

  /**
   * Hiển thị thông báo lỗi dưới ô nhập liệu
   * @param {HTMLElement} inputEl - Phần tử input/textarea
   * @param {string} message - Nội dung lỗi
   */
  function showFieldError(inputEl, message) {
    if (!inputEl) return;
    inputEl.classList.add("is-invalid");
    inputEl.classList.remove("is-valid");

    // Tìm thẻ hiển thị lỗi tương ứng (có class .form-error hoặc nằm cùng .form-group)
    const formGroup = inputEl.closest(".form-group") || inputEl.parentElement;
    let errorEl = formGroup ? formGroup.querySelector(".form-error") : null;

    if (!errorEl && formGroup) {
      errorEl = document.createElement("span");
      errorEl.className = "form-error";
      errorEl.setAttribute("aria-live", "polite");
      formGroup.appendChild(errorEl);
    }

    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = "block";
    }
  }

  /**
   * Xóa thông báo lỗi và đánh dấu ô nhập hợp lệ
   * @param {HTMLElement} inputEl - Phần tử input/textarea
   */
  function clearFieldError(inputEl) {
    if (!inputEl) return;
    inputEl.classList.remove("is-invalid");
    inputEl.classList.add("is-valid");

    const formGroup = inputEl.closest(".form-group") || inputEl.parentElement;
    const errorEl = formGroup ? formGroup.querySelector(".form-error") : null;
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.style.display = "none";
    }
  }

  /**
   * Thiết lập hệ thống kiểm định tự động cho một Form
   * @param {HTMLFormElement|string} formTarget - Form cần kiểm định
   * @param {Object} rules - Bản đồ quy tắc cho từng trường { fieldName: { required: true, validator: fn, errorMsg: string } }
   * @param {Function} onSuccess - Callback được gọi khi toàn bộ form hợp lệ
   */
  function setupFormValidation(formTarget, rules, onSuccess) {
    const form = typeof formTarget === "string" ? document.querySelector(formTarget) : formTarget;
    if (!form) return null;

    // Tắt kiểm tra mặc định của trình duyệt để dùng giao diện Quiet Luxury của dự án
    form.setAttribute("novalidate", "true");

    function validateSingleField(name) {
      const fieldRule = rules[name];
      const inputEl = form.querySelector(`[name="${name}"]`);
      if (!fieldRule || !inputEl) return true;

      const value = inputEl.value;

      // 1. Kiểm tra trường bắt buộc
      if (fieldRule.required && !isValidRequired(value)) {
        showFieldError(inputEl, fieldRule.requiredMsg || "Vui lòng không để trống trường này.");
        return false;
      }

      // 2. Nếu có dữ liệu, chạy hàm kiểm định chuyên biệt
      if (isValidRequired(value) && typeof fieldRule.validator === "function") {
        const isValid = fieldRule.validator(value);
        if (!isValid) {
          showFieldError(inputEl, fieldRule.errorMsg || "Dữ liệu nhập vào chưa hợp lệ.");
          return false;
        }
      }

      clearFieldError(inputEl);
      return true;
    }

    // Gắn sự kiện kiểm tra thời gian thực (Real-time Validation)
    Object.keys(rules).forEach((fieldName) => {
      const inputEl = form.querySelector(`[name="${fieldName}"]`);
      if (inputEl) {
        inputEl.addEventListener("input", () => {
          if (inputEl.classList.contains("is-invalid")) {
            validateSingleField(fieldName);
          }
        });
        inputEl.addEventListener("blur", () => {
          validateSingleField(fieldName);
        });
      }
    });

    // Bắt sự kiện Submit form
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      let isFormValid = true;
      let firstInvalidInput = null;

      Object.keys(rules).forEach((fieldName) => {
        const isFieldValid = validateSingleField(fieldName);
        if (!isFieldValid) {
          isFormValid = false;
          if (!firstInvalidInput) {
            firstInvalidInput = form.querySelector(`[name="${fieldName}"]`);
          }
        }
      });

      if (!isFormValid) {
        if (firstInvalidInput) firstInvalidInput.focus();
        return;
      }

      // Khi toàn bộ dữ liệu hợp lệ, thu thập dữ liệu và gọi onSuccess
      if (typeof onSuccess === "function") {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        onSuccess(data, form);
      }
    });

    return {
      validateAll: () => Object.keys(rules).every(validateSingleField),
      resetForm: () => {
        form.reset();
        form.querySelectorAll(".is-invalid, .is-valid").forEach((el) => {
          el.classList.remove("is-invalid", "is-valid");
        });
        form.querySelectorAll(".form-error").forEach((el) => {
          el.textContent = "";
          el.style.display = "none";
        });
      }
    };
  }

  /* =========================================================
     4. XUẤT ĐỐI TƯỢNG TOÀN CỤC (GLOBAL EXPORTS)
     ========================================================= */
  const Validator = {
    // Các hàm kiểm định giá trị
    isValidRequired,
    isValidName,
    isValidEmail,
    isValidPhoneVN,
    isValidMinLength,
    isValidMaxLength,

    // Các hàm tương tác UI
    showFieldError,
    clearFieldError,
    setupFormValidation
  };

  // Đăng ký toàn cục dạng Namespace và hàm độc lập
  global.Validator = Validator;
  global.isValidEmail = isValidEmail;
  global.isValidPhoneVN = isValidPhoneVN;
  global.isValidName = isValidName;

})(typeof window !== "undefined" ? window : this);

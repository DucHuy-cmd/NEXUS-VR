/* NEXUS VR — controllers/product-controller.js
   TẦNG 3 - CONTROLLERS: PRODUCT DETAIL PAGE CONTROLLER
   ========================================================= */

const PLACEHOLDER_IMG = "assets/images/placeholder.svg";

let selectedColorIndex = 0;

document.addEventListener("DOMContentLoaded", initProductDetailPage);

function initProductDetailPage() {
  const root = document.getElementById("product-detail-root");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  const product = Array.isArray(window.PRODUCTS)
    ? window.PRODUCTS.find((p) => p.id === productId)
    : null;

  if (!productId || !product) {
    window.location.replace("404.html");
    return;
  }

  renderBreadcrumb(product);
  renderGallery(product);
  renderInfo(product);
  renderTabs(product);
  renderRelated(product);

  initTabSwitching();
  initQtyControls(product);
  initWishlistButton(product);
  initAddToCart(product);
  initInstallmentPlan(product);
  initDynamicComparison(product);

  root.hidden = false;
}

function renderBreadcrumb(product) {
  const el = document.getElementById("pd-breadcrumb-current");
  if (el) el.textContent = product.name;
  document.title = `NEXUS VR — ${product.name}`;
}

function renderGallery(product) {
  const thumbsWrap = document.getElementById("pd-thumbs");
  const badge = document.getElementById("pd-discount-badge");

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [PLACEHOLDER_IMG];

  setMainImage(images[0], product.name);

  thumbsWrap.innerHTML = "";
  if (images.length > 1) {
    thumbsWrap.hidden = false;
    images.forEach((src, index) => {
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "product-detail__thumb" + (index === 0 ? " is-active" : "");
      thumb.setAttribute("aria-label", `Xem ảnh ${index + 1} của ${product.name}`);

      const img = document.createElement("img");
      img.src = src;
      img.alt = `${product.name} — ảnh ${index + 1}`;
      attachImgFallback(img);

      thumb.appendChild(img);
      thumb.addEventListener("click", () => {
        setMainImage(src, product.name);
        thumbsWrap.querySelectorAll(".product-detail__thumb").forEach((t) => t.classList.remove("is-active"));
        thumb.classList.add("is-active");
      });
      thumbsWrap.appendChild(thumb);
    });
  } else {
    thumbsWrap.hidden = true;
  }

  if (typeof product.oldPrice === "number" && product.oldPrice > product.price) {
    badge.textContent = `-${Math.round((1 - product.price / product.oldPrice) * 100)}%`;
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

function setMainImage(src, productName) {
  const mainImg = document.getElementById("pd-main-img");
  if (!mainImg) return;
  mainImg.src = src || PLACEHOLDER_IMG;
  mainImg.alt = productName || "Ảnh sản phẩm";
  attachImgFallback(mainImg);
}

function attachImgFallback(imgEl) {
  if (!imgEl) return;
  imgEl.setAttribute("onerror", "this.onerror=null; this.src='assets/images/placeholder.svg';");
  imgEl.onerror = function handleImgError() {
    imgEl.onerror = null;
    imgEl.src = PLACEHOLDER_IMG;
  };
}

function renderInfo(product) {
  document.getElementById("pd-category").textContent = product.categoryLabel || "";
  document.getElementById("pd-title").textContent = product.name || "";

  const rating = typeof product.rating === "number" ? product.rating : 0;
  document.getElementById("pd-stars").textContent = renderStars(rating);
  document.getElementById("pd-rating-value").textContent = rating.toFixed(1);
  document.getElementById("pd-review-count").textContent = `(${product.reviewCount || 0} đánh giá)`;

  document.getElementById("pd-price-now").textContent = formatVND(product.price);

  const oldPriceEl = document.getElementById("pd-price-old");
  const pctEl = document.getElementById("pd-discount-pct");
  if (typeof product.oldPrice === "number" && product.oldPrice > product.price) {
    oldPriceEl.textContent = formatVND(product.oldPrice);
    oldPriceEl.hidden = false;
    pctEl.textContent = `-${Math.round((1 - product.price / product.oldPrice) * 100)}%`;
    pctEl.hidden = false;
  } else {
    oldPriceEl.hidden = true;
    pctEl.hidden = true;
  }

  document.getElementById("pd-short-desc").textContent = product.shortDesc || "";

  renderColorSwatches(product);
  renderStock(product);
}

function renderStars(rating) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function formatVND(amount) {
  return (typeof amount === "number" ? amount : 0).toLocaleString("vi-VN") + "₫";
}

function renderColorSwatches(product) {
  const wrap = document.getElementById("pd-colors");
  const swatchWrap = document.getElementById("pd-color-swatches");
  const nameEl = document.getElementById("pd-color-selected-name");

  selectedColorIndex = 0;

  if (!Array.isArray(product.colors) || product.colors.length === 0) {
    wrap.hidden = true;
    return;
  }

  wrap.hidden = false;
  nameEl.textContent = product.colors[0].name;
  swatchWrap.innerHTML = "";

  product.colors.forEach((color, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "product-detail__swatch" + (index === 0 ? " is-active" : "");
    btn.style.background = color.hex || "#ccc";
    btn.setAttribute("aria-label", color.name);
    btn.title = color.name;
    btn.addEventListener("click", () => {
      selectedColorIndex = index;
      nameEl.textContent = color.name;
      swatchWrap.querySelectorAll(".product-detail__swatch").forEach((s) => s.classList.remove("is-active"));
      btn.classList.add("is-active");

      // Swap main gallery image to selected color image
      if (color.image) {
        setMainImage(color.image, product.name);
      } else if (product.images && product.images[index]) {
        setMainImage(product.images[index], product.name);
      }
    });
    swatchWrap.appendChild(btn);
  });
}

function renderStock(product) {
  const el = document.getElementById("pd-stock");
  const stock = typeof product.stock === "number" ? product.stock : 0;

  if (stock <= 0) {
    el.textContent = "Hết hàng";
    el.className = "product-detail__stock is-out";
  } else if (stock <= 10) {
    el.textContent = `Chỉ còn ${stock} sản phẩm — sắp hết hàng`;
    el.className = "product-detail__stock is-low";
  } else {
    el.textContent = "Còn hàng";
    el.className = "product-detail__stock is-in";
  }
}

function renderTabs(product) {
  document.getElementById("pd-description").textContent =
    product.description || product.shortDesc || "Đang cập nhật mô tả sản phẩm.";

  renderSpecsTable(product);
  renderReviews(product);
}

function renderSpecsTable(product) {
  const table = document.getElementById("pd-specs-table");
  table.innerHTML = "";

  if (!Array.isArray(product.specs) || product.specs.length === 0) {
    table.innerHTML = `<tr><td colspan="2">Đang cập nhật thông số kỹ thuật.</td></tr>`;
    return;
  }

  product.specs.forEach((spec) => {
    const row = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = spec.label || "";
    const td = document.createElement("td");
    td.textContent = spec.value || "";
    row.appendChild(th);
    row.appendChild(td);
    table.appendChild(row);
  });
}

let currentProductReviews = [];

function drawReviewsUI(reviews, product) {
  const list = document.getElementById("pd-reviews-list");
  const countBadge = document.getElementById("pd-tab-review-count");
  const avgNumEl = document.getElementById("pd-reviews-avg");
  const avgStarsEl = document.getElementById("pd-reviews-stars");
  const countTextEl = document.getElementById("pd-reviews-count-text");

  if (!list) return;

  currentProductReviews = reviews;

  // Tính điểm đánh giá trung bình
  const totalCount = reviews.length;
  let avgRating = 5.0;
  if (totalCount > 0) {
    const totalStars = reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    avgRating = (totalStars / totalCount).toFixed(1);
  }

  if (countBadge) countBadge.textContent = totalCount;
  if (countTextEl) countTextEl.textContent = totalCount;
  if (avgNumEl) avgNumEl.textContent = avgRating;
  if (avgStarsEl) avgStarsEl.textContent = renderStars(parseFloat(avgRating));

  // Render danh sách thẻ review
  list.innerHTML = "";

  if (totalCount === 0) {
    list.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; background: #fff; border-radius: 12px; border: 1px dashed var(--glass-border);">
        <p style="color: var(--text-secondary); margin-bottom: 10px;">Chưa có đánh giá nào cho sản phẩm này.</p>
        <span style="font-size: 0.85rem; color: #A67C52;">Hãy là người đầu tiên chia sẻ cảm nhận trải nghiệm thực tế!</span>
      </div>
    `;
  } else {
    reviews.forEach((review) => {
      const initial = (review.author || "K").charAt(0).toUpperCase();
      const item = document.createElement("div");
      item.className = "review-item-card";

      item.innerHTML = `
        <div class="review-item-header">
          <div class="review-author-wrap">
            <div class="review-avatar">${initial}</div>
            <div>
              <div style="font-weight: 700; color: #231F1C; font-size: 0.95rem;">
                ${review.author || "Khách Hàng NEXUS"}
                ${review.verified !== false ? '<span class="review-verified-badge">✓ Đã mua hàng</span>' : ''}
              </div>
              <div class="review-item-stars">${renderStars(review.rating || 5)}</div>
            </div>
          </div>
          <div class="review-item-date">${review.date || "Gần đây"}</div>
        </div>
        <div class="review-item-body">${escapeReviewText(review.comment || "")}</div>
      `;
      list.appendChild(item);
    });
  }

  initReviewForm(product);
}

function renderReviews(product) {
  // 1. Tải tức thì 0ms từ product data gốc và LocalStorage Cache (Stale-While-Revalidate)
  let reviews = Array.isArray(product.reviews) ? [...product.reviews] : [];
  try {
    const cached = localStorage.getItem("nexus_cached_reviews_" + product.id);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed.forEach(sr => {
          if (!reviews.some(r => r.id === sr.id || (r.comment === sr.comment && r.author === sr.author))) {
            reviews.unshift(sr);
          }
        });
      }
    }
  } catch (e) {}

  // Vẽ giao diện ngay lập tức trong 0 mili-giây
  drawReviewsUI(reviews, product);

  // 2. Chạy ngầm đồng bộ từ Serverless API / Cloud Database
  if (window.apiService && typeof window.apiService.getProductReviews === "function") {
    window.apiService.getProductReviews(product.id).then(serverReviews => {
      if (Array.isArray(serverReviews) && serverReviews.length > 0) {
        let hasNew = false;
        serverReviews.forEach(sr => {
          if (!reviews.some(r => r.id === sr.id || (r.comment === sr.comment && r.author === sr.author))) {
            reviews.unshift(sr);
            hasNew = true;
          }
        });
        if (hasNew) {
          drawReviewsUI(reviews, product);
        }
      }
    }).catch(() => {});
  }
}

function escapeReviewText(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function initReviewForm(product) {
  const toggleBtn = document.getElementById("btn-toggle-review-form");
  const form = document.getElementById("pd-review-form");
  const cancelBtn = document.getElementById("btn-cancel-review");
  const starButtons = document.querySelectorAll("#starRatingInputs .star-item");
  const ratingInput = document.getElementById("reviewRatingVal");
  const nameInput = document.getElementById("reviewAuthorName");
  const emailInput = document.getElementById("reviewAuthorEmail");

  if (!form || form.dataset.bound) return;
  form.dataset.bound = "true";

  // Tự động điền thông tin nếu đã đăng nhập
  try {
    const user = typeof window.getCurrentUser === "function"
      ? window.getCurrentUser()
      : JSON.parse(localStorage.getItem("nexus_user") || "null");
    if (user) {
      if (nameInput && !nameInput.value) nameInput.value = user.fullName || user.name || "";
      if (emailInput && !emailInput.value) emailInput.value = user.email || "";
    }
  } catch (e) {}

  // Toggle form
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isHidden = form.style.display === "none";
      form.style.display = isHidden ? "block" : "none";
      if (isHidden) {
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      form.style.display = "none";
    });
  }

  // Chọn số sao (1-5 sao)
  starButtons.forEach((star) => {
    star.addEventListener("click", () => {
      const val = parseInt(star.dataset.val, 10);
      if (ratingInput) ratingInput.value = String(val);

      starButtons.forEach((s) => {
        const sVal = parseInt(s.dataset.val, 10);
        s.classList.toggle("is-selected", sVal <= val);
      });
    });
  });

  // Submit form đánh giá
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById("btn-submit-review");
    const authorName = (nameInput?.value || "").trim();
    const authorEmail = (emailInput?.value || "").trim();
    const comment = (document.getElementById("reviewComment")?.value || "").trim();
    const rating = parseInt(ratingInput?.value || "5", 10);

    if (!authorName || !comment) {
      if (typeof window.showToast === "function") {
        window.showToast("Vui lòng điền đầy đủ họ tên và cảm nhận của bạn!", "error");
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Đang gửi...";
    }

    const newReview = {
      id: "rev_" + Date.now().toString(36),
      productId: product.id,
      author: authorName,
      email: authorEmail,
      rating: rating,
      comment: comment,
      verified: true,
      date: new Date().toLocaleDateString("vi-VN")
    };

    // 1. Thêm ngay vào UI tại chỗ (Realtime Feedback)
    currentProductReviews.unshift(newReview);
    renderReviews(product);

    // 2. Gửi lên Cloud Database
    if (window.apiService && typeof window.apiService.submitProductReview === "function") {
      try {
        await window.apiService.submitProductReview(newReview);
      } catch (err) {
        console.warn("[Reviews] Gửi API review:", err);
      }
    }

    if (typeof window.showToast === "function") {
      window.showToast("Cảm ơn bạn đã gửi đánh giá sản phẩm thành công!", "success");
    }

    // Reset form
    document.getElementById("reviewComment").value = "";
    form.style.display = "none";
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Gửi Đánh Giá Ngay";
    }
  });
}

function initTabSwitching() {
  const tabBtns = document.querySelectorAll(".product-detail__tab-btn");
  const panels = document.querySelectorAll(".product-detail__tab-panel");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      tabBtns.forEach((b) => {
        const isTarget = b === btn;
        b.classList.toggle("is-active", isTarget);
        b.setAttribute("aria-selected", String(isTarget));
      });
      panels.forEach((p) => {
        const isTarget = p.dataset.tabPanel === target;
        p.classList.toggle("is-active", isTarget);
        p.hidden = !isTarget;
      });
    });
  });
}

function initQtyControls(product) {
  const input = document.getElementById("pd-qty-input");
  const minusBtn = document.getElementById("pd-qty-minus");
  const plusBtn = document.getElementById("pd-qty-plus");
  const maxQty = typeof product.stock === "number" && product.stock > 0 ? product.stock : 99;

  input.max = String(maxQty);

  minusBtn.addEventListener("click", () => {
    input.value = Math.max(1, (parseInt(input.value, 10) || 1) - 1);
  });
  plusBtn.addEventListener("click", () => {
    input.value = Math.min(maxQty, (parseInt(input.value, 10) || 1) + 1);
  });
  input.addEventListener("change", () => {
    let val = parseInt(input.value, 10);
    if (Number.isNaN(val) || val < 1) val = 1;
    if (val > maxQty) val = maxQty;
    input.value = val;
  });
}

function initAddToCart(product) {
  const btn = document.getElementById("pd-add-to-cart");

  if (typeof product.stock === "number" && product.stock <= 0) {
    btn.disabled = true;
    btn.textContent = "Hết hàng";
    return;
  }

  btn.addEventListener("click", () => {
    const qty = parseInt(document.getElementById("pd-qty-input").value, 10) || 1;
    addProductToCart(product.id, qty, selectedColorIndex);
  });
}

function addProductToCart(productId, qty, colorIndex) {
  if (window.cartManager && typeof window.cartManager.add === "function") {
    window.cartManager.add(productId, qty, colorIndex);
  } else if (typeof window.addToCart === "function") {
    window.addToCart(productId, qty, colorIndex);
  } else if (typeof window.showToast === "function") {
    window.showToast("Chức năng giỏ hàng đang được hoàn thiện", "info");
  }
}

function initWishlistButton(product) {
  const btn = document.getElementById("pd-wishlist-btn");
  if (!btn) return;
  btn.dataset.id = String(product.id);

  const getWishlist = window.storageService && typeof window.storageService.getWishlist === "function"
    ? () => window.storageService.getWishlist()
    : (typeof window.getWishlist === "function" ? window.getWishlist : () => []);

  const saveWishlist = window.storageService && typeof window.storageService.saveWishlist === "function"
    ? (list) => window.storageService.saveWishlist(list)
    : (typeof window.saveWishlist === "function" ? window.saveWishlist : (list) => {
        localStorage.setItem("nexus_wishlist", JSON.stringify(list));
      });

  function syncState() {
    const list = (getWishlist() || []).map(String);
    const isSaved = list.includes(String(product.id));
    btn.classList.toggle("is-active", isSaved);
    btn.setAttribute("aria-pressed", String(isSaved));
    const txt = document.getElementById("pd-wishlist-text");
    if (txt) {
      txt.textContent = isSaved ? "Đã yêu thích" : "Yêu thích";
    }
    btn.title = isSaved ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích";
  }

  btn.addEventListener("click", () => {
    const list = (getWishlist() || []).map(String);
    const productIdStr = String(product.id);
    const index = list.indexOf(productIdStr);
    let isAdded = false;
    if (index === -1) {
      list.push(productIdStr);
      isAdded = true;
      if (typeof window.showToast === "function") window.showToast("Đã thêm vào yêu thích", "success");
    } else {
      list.splice(index, 1);
      if (typeof window.showToast === "function") window.showToast("Đã bỏ khỏi yêu thích", "info");
    }
    saveWishlist(list);
    syncState();
    window.dispatchEvent(new CustomEvent("nexus:wishlist-updated", {
      detail: { wishlist: list, id: productIdStr, action: isAdded ? "add" : "remove" }
    }));
  });

  window.addEventListener("nexus:wishlist-updated", () => {
    syncState();
    const list = (getWishlist() || []).map(String);
    document.querySelectorAll(".product-card__wishlist-btn").forEach((cardBtn) => {
      const active = list.includes(String(cardBtn.dataset.id));
      cardBtn.classList.toggle("is-active", active);
      cardBtn.setAttribute("aria-pressed", String(active));
      cardBtn.title = active ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích";
    });
  });

  syncState();
}

function renderRelated(product) {
  const grid = document.getElementById("pd-related-grid");
  const section = document.querySelector(".product-detail__related");
  if (!grid || !section) return;
  grid.innerHTML = "";

  const productsSource = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  const sameCategory = productsSource.filter(
    (p) => p.id !== product.id && p.category === product.category
  );
  const related = sameCategory.length > 0
    ? sameCategory.slice(0, 4)
    : productsSource.filter((p) => p.id !== product.id).slice(0, 4);

  if (related.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  related.forEach((p) => grid.appendChild(buildRelatedProductCard(p)));
}

function buildRelatedProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const thumb = document.createElement("div");
  thumb.className = "product-card__thumb";

  const getWishlist = window.storageService && typeof window.storageService.getWishlist === "function"
    ? () => window.storageService.getWishlist()
    : (typeof window.getWishlist === "function" ? window.getWishlist : () => []);
  const isFav = (getWishlist() || []).map(String).includes(String(product.id));

  const favBtn = document.createElement("button");
  favBtn.type = "button";
  favBtn.className = `product-card__wishlist-btn${isFav ? " is-active" : ""}`;
  favBtn.setAttribute("aria-label", "Thêm vào yêu thích");
  favBtn.setAttribute("aria-pressed", String(isFav));
  favBtn.dataset.id = product.id;
  favBtn.title = isFav ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích";
  favBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  `;
  thumb.appendChild(favBtn);

  const link = document.createElement("a");
  link.href = `product.html?id=${encodeURIComponent(product.id)}`;
  const img = document.createElement("img");
  img.src = Array.isArray(product.images) && product.images[0] ? product.images[0] : PLACEHOLDER_IMG;
  img.alt = product.name;
  attachImgFallback(img);
  link.appendChild(img);
  thumb.appendChild(link);

  const body = document.createElement("div");
  body.className = "product-card__body";

  const tag = document.createElement("span");
  tag.className = "product-card__category";
  tag.textContent = product.categoryLabel || "";

  const title = document.createElement("h3");
  title.className = "product-card__title";
  const titleLink = document.createElement("a");
  titleLink.href = `product.html?id=${encodeURIComponent(product.id)}`;
  titleLink.textContent = product.name;
  title.appendChild(titleLink);

  const priceRow = document.createElement("div");
  priceRow.className = "product-card__price";
  const priceNow = document.createElement("span");
  priceNow.className = "product-card__price-current";
  priceNow.textContent = formatVND(product.price);
  priceRow.appendChild(priceNow);

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "product-card__add-btn";
  addBtn.textContent = "Thêm vào giỏ";
  addBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    addProductToCart(product.id, 1, 0);
  });

  body.appendChild(tag);
  body.appendChild(title);
  body.appendChild(priceRow);
  body.appendChild(addBtn);

  card.appendChild(thumb);
  card.appendChild(body);
  return card;
}

function initInstallmentPlan(product) {
  const badgeMonthly = document.getElementById("pd-installment-monthly");
  const modal = document.getElementById("installmentModalOverlay");
  const btnOpen = document.getElementById("btnOpenInstallment");
  const btnClose = document.getElementById("btnCloseInstallmentModal");
  const btnApply = document.getElementById("btnApplyInstallmentPlan");

  const minMonthly = Math.round(product.price / 12);
  if (badgeMonthly) {
    badgeMonthly.textContent = minMonthly.toLocaleString("vi-VN") + " ₫/tháng";
  }

  const modalImg = document.getElementById("instModalImg");
  const modalName = document.getElementById("instModalName");
  const modalPrice = document.getElementById("instModalPrice");

  if (modalImg && product.images && product.images[0]) {
    modalImg.src = product.images[0];
  }
  if (modalName) modalName.textContent = product.name;
  if (modalPrice) modalPrice.textContent = formatVND(product.price);

  let currentTerm = 3;
  function updateCalc(term) {
    currentTerm = term;
    const monthly = Math.round(product.price / term);
    const monthlyEl = document.getElementById("instMonthlyPay");
    const termLabel = document.getElementById("instTermLabel");
    const totalEl = document.getElementById("instTotalPay");

    if (monthlyEl) monthlyEl.textContent = monthly.toLocaleString("vi-VN") + " ₫/tháng";
    if (termLabel) termLabel.textContent = String(term);
    if (totalEl) totalEl.textContent = formatVND(product.price);
  }

  updateCalc(3);

  const termBtns = document.querySelectorAll("#installmentTermsNav .btn-term");
  termBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      termBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const term = Number(btn.dataset.term) || 3;
      updateCalc(term);
    });
  });

  const openModal = () => {
    if (modal) modal.style.display = "flex";
  };
  const closeModal = () => {
    if (modal) modal.style.display = "none";
  };

  if (btnOpen) btnOpen.addEventListener("click", openModal);
  if (btnClose) btnClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (btnApply) {
    btnApply.addEventListener("click", () => {
      closeModal();
      const qty = parseInt(document.getElementById("pd-qty-input")?.value, 10) || 1;
      addProductToCart(product.id, qty, selectedColorIndex);

      // Lưu thông tin gói trả góp đã chọn để tự kích hoạt bên trang Checkout
      const installmentData = {
        productId: product.id,
        productName: product.name,
        term: currentTerm,
        monthlyPay: Math.round(product.price / currentTerm),
        total: product.price,
        bank: "Techcombank"
      };
      localStorage.setItem("nexus_selected_installment", JSON.stringify(installmentData));

      if (typeof window.showToast === "function") {
        window.showToast(`Đã chọn gói trả góp 0% (${currentTerm} tháng) & thêm vào giỏ hàng!`, "success");
      }

      // Tự động chuyển hướng nhanh sang trang Thanh toán với gói trả góp đã chọn
      setTimeout(() => {
        window.location.href = "checkout.html";
      }, 650);
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

/* --------------------------------------------------------------------------
   DYNAMIC PRODUCT COMPARISON (ĐỐI CHIẾU 1-VS-1 THÔNG MINH)
   -------------------------------------------------------------------------- */
function initDynamicComparison(baseProduct) {
  const selectEl = document.getElementById("compareTargetSelect");
  const mountEl = document.getElementById("compareDynamicMount");
  if (!selectEl || !mountEl || !Array.isArray(window.PRODUCTS)) return;

  // Lọc danh sách thiết bị khác
  const otherProducts = window.PRODUCTS.filter((p) => String(p.id) !== String(baseProduct.id));

  // Đổ dữ liệu vào Dropdown
  selectEl.innerHTML = otherProducts
    .map((p) => `<option value="${p.id}">${p.name} — ${formatVND(p.price)}</option>`)
    .join("");

  // Chọn sản phẩm đối chiếu mặc định
  let defaultTargetId = otherProducts[0]?.id;
  // Ưu tiên so sánh với Flagship nếu sản phẩm hiện tại không phải Flagship
  const flagship = otherProducts.find((p) => p.id === "nexus-vision-pro" || p.id === "NEXUS-01");
  if (flagship) defaultTargetId = flagship.id;

  if (defaultTargetId) {
    selectEl.value = defaultTargetId;
  }

  // Helper trích xuất spec từ mảng specs
  function getSpecValue(prod, keyword, fallback = "Chuẩn không gian") {
    if (!prod || !Array.isArray(prod.specs)) return fallback;
    const found = prod.specs.find(
      (s) => s.label.toLowerCase().includes(keyword.toLowerCase())
    );
    return found ? found.value : fallback;
  }

  function getNumericWeight(prod) {
    const raw = getSpecValue(prod, "trọng lượng", "400g");
    const m = raw.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 400;
  }

  // Hàm render đối chiếu 2 cột
  function renderCompareView(targetId) {
    const targetProduct = window.PRODUCTS.find((p) => String(p.id) === String(targetId)) || otherProducts[0];
    if (!targetProduct) return;

    const baseWeight = getNumericWeight(baseProduct);
    const targetWeight = getNumericWeight(targetProduct);

    const baseRes = getSpecValue(baseProduct, "độ phân giải", "Micro-OLED Kép 4K");
    const targetRes = getSpecValue(targetProduct, "độ phân giải", "Micro-OLED Kép 4K");

    const baseHz = getSpecValue(baseProduct, "tần số", "90Hz - 120Hz");
    const targetHz = getSpecValue(targetProduct, "tần số", "90Hz - 120Hz");

    const baseBattery = getSpecValue(baseProduct, "pin", "3.5 giờ");
    const targetBattery = getSpecValue(targetProduct, "pin", "3.5 giờ");

    const baseFov = getSpecValue(baseProduct, "trường nhìn", getSpecValue(baseProduct, "cảm biến", "LiDAR 3D"));
    const targetFov = getSpecValue(targetProduct, "trường nhìn", getSpecValue(targetProduct, "cảm biến", "LiDAR 3D"));

    const baseImg = baseProduct.images && baseProduct.images[0] ? baseProduct.images[0] : "assets/images/placeholder.svg";
    const targetImg = targetProduct.images && targetProduct.images[0] ? targetProduct.images[0] : "assets/images/placeholder.svg";

    const baseIsLighter = baseWeight < targetWeight;
    const targetIsLighter = targetWeight < baseWeight;
    const baseIsCheaper = baseProduct.price < targetProduct.price;
    const targetIsCheaper = targetProduct.price < baseProduct.price;

    mountEl.innerHTML = `
      <div class="compare-card-grid">
        <!-- CỘT 1: SẢN PHẨM HIỆN TẠI -->
        <div class="compare-prod-column is-base">
          <div class="compare-prod-hero">
            <span class="compare-role-tag current-tag">Thiết Bị Đang Xem</span>
            <img src="${baseImg}" alt="${baseProduct.name}" class="compare-hero-thumb">
            <h4 class="compare-hero-name">${baseProduct.name}</h4>
            <div class="compare-hero-price">${formatVND(baseProduct.price)}</div>
            <div class="compare-hero-rating">★ ${(baseProduct.rating || 5.0).toFixed(1)} (${baseProduct.reviewCount || 0} đánh giá)</div>
          </div>
        </div>

        <!-- CỘT 2: SẢN PHẨM ĐỐI CHIẾU -->
        <div class="compare-prod-column is-target">
          <div class="compare-prod-hero">
            <span class="compare-role-tag compare-tag">Thiết Bị Đối Chiếu</span>
            <img src="${targetImg}" alt="${targetProduct.name}" class="compare-hero-thumb">
            <h4 class="compare-hero-name">${targetProduct.name}</h4>
            <div class="compare-hero-price">${formatVND(targetProduct.price)}</div>
            <div class="compare-hero-action">
              <a href="product.html?id=${targetProduct.id}" class="btn-compare-switch">Xem Chi Tiết Kính Này ›</a>
            </div>
          </div>
        </div>
      </div>

      <!-- BẢNG ĐỐI CHIẾU THÔNG SỐ -->
      <div class="compare-scroll-hint">← Vuốt sang ngang để đối chiếu chi tiết 15+ thông số →</div>
      <div class="compare-table-responsive">
        <table class="compare-dynamic-table">
        <thead>
          <tr>
            <th style="width: 28%;">Thông Số Kỹ Thuật</th>
            <th style="width: 36%;">${baseProduct.name}</th>
            <th style="width: 36%;">${targetProduct.name}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="spec-name"><strong>Màn hình &amp; Độ phân giải</strong></td>
            <td>${baseRes}</td>
            <td>${targetRes}</td>
          </tr>
          <tr>
            <td class="spec-name"><strong>Tần số quét thích ứng</strong></td>
            <td>${baseHz}</td>
            <td>${targetHz}</td>
          </tr>
          <tr>
            <td class="spec-name"><strong>Trọng lượng thân kính</strong></td>
            <td>
              <strong>${baseWeight}g</strong>
              ${baseIsLighter ? '<span class="spec-win-badge">✓ Siêu nhẹ hơn</span>' : ''}
            </td>
            <td>
              <strong>${targetWeight}g</strong>
              ${targetIsLighter ? '<span class="spec-win-badge">✓ Siêu nhẹ hơn</span>' : ''}
            </td>
          </tr>
          <tr>
            <td class="spec-name"><strong>Thời lượng pin liên tục</strong></td>
            <td>${baseBattery}</td>
            <td>${targetBattery}</td>
          </tr>
          <tr>
            <td class="spec-name"><strong>Cảm biến &amp; Góc nhìn</strong></td>
            <td>${baseFov}</td>
            <td>${targetFov}</td>
          </tr>
          <tr>
            <td class="spec-name"><strong>Màu sắc tùy chọn</strong></td>
            <td>${Array.isArray(baseProduct.colors) ? baseProduct.colors.map(c => c.name).join(", ") : "Tiêu chuẩn"}</td>
            <td>${Array.isArray(targetProduct.colors) ? targetProduct.colors.map(c => c.name).join(", ") : "Tiêu chuẩn"}</td>
          </tr>
          <tr>
            <td class="spec-name"><strong>Tình trạng hàng &amp; Bảo hành</strong></td>
            <td>${baseProduct.stock > 0 ? '<span style="color:#2E7D32; font-weight:600;">● Còn hàng sẵn</span>' : 'Tạm hết'} • 24 Tháng VIP</td>
            <td>${targetProduct.stock > 0 ? '<span style="color:#2E7D32; font-weight:600;">● Còn hàng sẵn</span>' : 'Tạm hết'} • 24 Tháng VIP</td>
          </tr>
          <tr>
            <td class="spec-name"><strong>Mức giá niêm yết</strong></td>
            <td>
              <strong style="font-size:1.05rem; color:var(--accent-deep, #A67C52);">${formatVND(baseProduct.price)}</strong>
              ${baseIsCheaper ? '<span class="spec-win-badge spec-win-price">★ Giá tốt hơn</span>' : ''}
            </td>
            <td>
              <strong style="font-size:1.05rem; color:var(--accent-deep, #A67C52);">${formatVND(targetProduct.price)}</strong>
              ${targetIsCheaper ? '<span class="spec-win-badge spec-win-price">★ Giá tốt hơn</span>' : ''}
            </td>
          </tr>
        </tbody>
        </table>
      </div>
    `;
  }

  // Render lần đầu
  renderCompareView(selectEl.value);

  // Lắng nghe khi người dùng đổi sản phẩm
  selectEl.addEventListener("change", (e) => {
    renderCompareView(e.target.value);
  });
}


/* ==========================================================================
   TÍNH NĂNG ĐỘT PHÁ: KÍNH LÚP PHÓNG TO & TRÌNH XOAY 360 ĐỘ KHÔNG GIAN
   ========================================================================== */
let is360ModeActive = false;
let current360Angle = 0;
let is360AutoSpinning = false;
let autoSpinAnimationId = null;
let isDragging360 = false;
let dragStartX = 0;
let angleStartDrag = 0;
let currentLightboxIndex = 0;
let lightboxZoomLevel = 1.0;
let currentProductGalleryImages = [];

function playSpatial360Tick() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!window._spatialAudioCtx) window._spatialAudioCtx = new AudioCtx();
    const ctx = window._spatialAudioCtx;
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.035);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  } catch (e) {}
}

function initHoverMagnifier() {
  const container = document.getElementById("pd-main-image");
  const img = document.getElementById("pd-main-img");
  if (!container || !img) return;

  container.addEventListener("mousemove", (e) => {
    if (is360ModeActive) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const originX = (x / rect.width) * 100;
    const originY = (y / rect.height) * 100;
    img.style.transformOrigin = `${originX}% ${originY}%`;
  });

  container.addEventListener("mouseleave", () => {
    if (is360ModeActive) return;
    img.style.transformOrigin = "center center";
  });

  // Nhấp vào ảnh để mở Lightbox nếu không phải đang trong chế độ 360
  container.addEventListener("click", (e) => {
    if (is360ModeActive) return;
    if (e.target.closest(".gallery-action-pod") || e.target.closest("#pd-discount-badge")) return;
    openLuxuryLightbox();
  });
}

function getAngleDescription(angle) {
  const normalized = ((angle % 360) + 360) % 360;
  if (normalized >= 315 || normalized < 45) return `${Math.round(normalized)}° • Mặt trước chính diện`;
  if (normalized >= 45 && normalized < 135) return `${Math.round(normalized)}° • Cạnh phải thân kính`;
  if (normalized >= 135 && normalized < 225) return `${Math.round(normalized)}° • Quai đeo sau & Đệm mắt`;
  return `${Math.round(normalized)}° • Cạnh trái thân kính`;
}

function update360Visual(angle) {
  const stage = document.getElementById("pd3dStage");
  const badge = document.getElementById("spatial360AngleBadge");
  const slider = document.getElementById("spatial360Slider");

  current360Angle = ((angle % 360) + 360) % 360;

  if (stage) {
    const tiltX = Math.sin((current360Angle * Math.PI) / 180) * 4;
    const shadowOffset = Math.sin((current360Angle * Math.PI) / 180) * 18;
    stage.style.transform = `perspective(1200px) rotateY(${current360Angle}deg) rotateX(${tiltX}deg)`;
    const img = stage.querySelector("img");
    if (img) {
      img.style.filter = `drop-shadow(${shadowOffset}px 20px 24px rgba(0, 0, 0, 0.22))`;
    }
  }

  if (badge) {
    badge.textContent = getAngleDescription(current360Angle);
  }

  if (slider && Number(slider.value) !== Math.round(current360Angle)) {
    slider.value = Math.round(current360Angle);
  }
}

function runAutoSpinLoop() {
  if (!is360AutoSpinning || !is360ModeActive) return;
  const prevAngle = current360Angle;
  current360Angle = (current360Angle + 0.45) % 360;

  // Phát tick âm thanh khi qua các góc chuẩn
  if (Math.floor(prevAngle / 90) !== Math.floor(current360Angle / 90)) {
    playSpatial360Tick();
  }

  update360Visual(current360Angle);
  autoSpinAnimationId = requestAnimationFrame(runAutoSpinLoop);
}

function start360AutoSpin() {
  is360AutoSpinning = true;
  const btn = document.getElementById("btn360AutoSpin");
  if (btn) {
    btn.classList.add("is-spinning");
    btn.innerHTML = '<span class="spin-icon">⏸</span><span class="spin-text">Tạm dừng</span>';
  }
  cancelAnimationFrame(autoSpinAnimationId);
  autoSpinAnimationId = requestAnimationFrame(runAutoSpinLoop);
}

function stop360AutoSpin() {
  is360AutoSpinning = false;
  cancelAnimationFrame(autoSpinAnimationId);
  const btn = document.getElementById("btn360AutoSpin");
  if (btn) {
    btn.classList.remove("is-spinning");
    btn.innerHTML = '<span class="spin-icon">▶</span><span class="spin-text">Tự động xoay</span>';
  }
}

function enable360Mode() {
  is360ModeActive = true;
  const container = document.getElementById("pd-main-image");
  const controlBar = document.getElementById("spatial360ControlBar");
  const hint = document.getElementById("spatial360Hint");
  const btn = document.getElementById("btnToggle360");
  const img = document.getElementById("pd-main-img");

  if (container) container.classList.add("is-360-active");
  if (controlBar) controlBar.style.display = "flex";
  if (hint) hint.style.display = "inline-flex";
  if (btn) btn.classList.add("is-active");

  if (img) {
    img.style.transform = "scale(1)";
    img.style.transformOrigin = "center center";
  }

  update360Visual(current360Angle);
  start360AutoSpin();
  playSpatial360Tick();
}

function disable360Mode() {
  is360ModeActive = false;
  stop360AutoSpin();

  const container = document.getElementById("pd-main-image");
  const controlBar = document.getElementById("spatial360ControlBar");
  const hint = document.getElementById("spatial360Hint");
  const btn = document.getElementById("btnToggle360");
  const stage = document.getElementById("pd3dStage");

  if (container) container.classList.remove("is-360-active");
  if (controlBar) controlBar.style.display = "none";
  if (hint) hint.style.display = "none";
  if (btn) btn.classList.remove("is-active");

  if (stage) {
    stage.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg)";
    const img = stage.querySelector("img");
    if (img) img.style.filter = "drop-shadow(0 14px 28px rgba(0, 0, 0, 0.12))";
  }
}

function init360SpatialStudioEvents() {
  const container = document.getElementById("pd-main-image");
  const btnToggle = document.getElementById("btnToggle360");
  const btnClose = document.getElementById("btn360Close");
  const btnReset = document.getElementById("btn360Reset");
  const btnAuto = document.getElementById("btn360AutoSpin");
  const slider = document.getElementById("spatial360Slider");

  if (btnToggle) {
    btnToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (is360ModeActive) {
        disable360Mode();
      } else {
        enable360Mode();
      }
    });
  }

  if (btnClose) {
    btnClose.addEventListener("click", (e) => {
      e.stopPropagation();
      disable360Mode();
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", (e) => {
      e.stopPropagation();
      stop360AutoSpin();
      update360Visual(0);
      playSpatial360Tick();
    });
  }

  if (btnAuto) {
    btnAuto.addEventListener("click", (e) => {
      e.stopPropagation();
      if (is360AutoSpinning) {
        stop360AutoSpin();
      } else {
        start360AutoSpin();
      }
    });
  }

  if (slider) {
    slider.addEventListener("input", (e) => {
      stop360AutoSpin();
      update360Visual(Number(e.target.value));
    });
  }

  if (container) {
    // DRAG CHUỘT
    container.addEventListener("mousedown", (e) => {
      if (!is360ModeActive) return;
      isDragging360 = true;
      dragStartX = e.clientX;
      angleStartDrag = current360Angle;
      stop360AutoSpin();
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging360 || !is360ModeActive) return;
      const deltaX = e.clientX - dragStartX;
      const newAngle = angleStartDrag + deltaX * 0.85;
      update360Visual(newAngle);
    });

    window.addEventListener("mouseup", () => {
      if (isDragging360) {
        isDragging360 = false;
        playSpatial360Tick();
      }
    });

    // VUỐT CẢM ỨNG TRÊN MOBILE / IPAD
    container.addEventListener("touchstart", (e) => {
      if (!is360ModeActive || !e.touches[0]) return;
      isDragging360 = true;
      dragStartX = e.touches[0].clientX;
      angleStartDrag = current360Angle;
      stop360AutoSpin();
    }, { passive: true });

    container.addEventListener("touchmove", (e) => {
      if (!isDragging360 || !is360ModeActive || !e.touches[0]) return;
      const deltaX = e.touches[0].clientX - dragStartX;
      const newAngle = angleStartDrag + deltaX * 0.9;
      update360Visual(newAngle);
    }, { passive: true });

    container.addEventListener("touchend", () => {
      if (isDragging360) {
        isDragging360 = false;
        playSpatial360Tick();
      }
    });
  }
}

function openLuxuryLightbox() {
  const overlay = document.getElementById("luxuryLightboxOverlay");
  const mainImg = document.getElementById("lightboxMainImg");
  const title = document.getElementById("lightboxProductTitle");
  const thumbsWrap = document.getElementById("lightboxThumbs");

  if (!overlay || !mainImg) return;

  const currentMainSrc = document.getElementById("pd-main-img")?.src || "";
  const productTitle = document.getElementById("pd-title")?.textContent || "NEXUS VR";

  if (title) title.textContent = productTitle;

  // Lấy danh sách ảnh hiện hành
  const thumbs = document.querySelectorAll("#pd-thumbs .product-detail__thumb img");
  currentProductGalleryImages = [];
  thumbs.forEach((t) => {
    if (t.src) currentProductGalleryImages.push(t.src);
  });
  if (currentProductGalleryImages.length === 0 && currentMainSrc) {
    currentProductGalleryImages.push(currentMainSrc);
  }

  currentLightboxIndex = currentProductGalleryImages.indexOf(currentMainSrc);
  if (currentLightboxIndex === -1) currentLightboxIndex = 0;

  lightboxZoomLevel = 1.0;
  updateLightboxImage();

  // Render thumbnails trong lightbox
  if (thumbsWrap) {
    thumbsWrap.innerHTML = "";
    currentProductGalleryImages.forEach((src, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lb-thumb" + (idx === currentLightboxIndex ? " is-active" : "");
      btn.innerHTML = `<img src="${src}" alt="Thumb ${idx + 1}">`;
      btn.addEventListener("click", () => {
        currentLightboxIndex = idx;
        lightboxZoomLevel = 1.0;
        updateLightboxImage();
      });
      thumbsWrap.appendChild(btn);
    });
  }

  overlay.style.display = "flex";
  requestAnimationFrame(() => overlay.classList.add("is-open"));
  document.body.style.overflow = "hidden";
}

function closeLuxuryLightbox() {
  const overlay = document.getElementById("luxuryLightboxOverlay");
  if (!overlay) return;
  overlay.classList.remove("is-open");
  setTimeout(() => {
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }, 250);
}

function updateLightboxImage() {
  const mainImg = document.getElementById("lightboxMainImg");
  const thumbsWrap = document.getElementById("lightboxThumbs");
  if (!mainImg) return;

  const src = currentProductGalleryImages[currentLightboxIndex] || "";
  mainImg.src = src;
  mainImg.style.transform = `scale(${lightboxZoomLevel})`;

  if (thumbsWrap) {
    thumbsWrap.querySelectorAll(".lb-thumb").forEach((t, i) => {
      if (i === currentLightboxIndex) t.classList.add("is-active");
      else t.classList.remove("is-active");
    });
  }
}

function initLightboxEvents() {
  const btnOpen = document.getElementById("btnOpenLightbox");
  const btnClose = document.getElementById("btnLbClose");
  const btnZoomIn = document.getElementById("btnLbZoomIn");
  const btnZoomOut = document.getElementById("btnLbZoomOut");
  const btnReset = document.getElementById("btnLbReset");
  const btnPrev = document.getElementById("btnLbPrev");
  const btnNext = document.getElementById("btnLbNext");
  const overlay = document.getElementById("luxuryLightboxOverlay");

  if (btnOpen) btnOpen.addEventListener("click", openLuxuryLightbox);
  if (btnClose) btnClose.addEventListener("click", closeLuxuryLightbox);

  if (btnZoomIn) {
    btnZoomIn.addEventListener("click", () => {
      lightboxZoomLevel = Math.min(3.5, lightboxZoomLevel + 0.35);
      updateLightboxImage();
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener("click", () => {
      lightboxZoomLevel = Math.max(0.7, lightboxZoomLevel - 0.35);
      updateLightboxImage();
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      lightboxZoomLevel = 1.0;
      updateLightboxImage();
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      if (currentProductGalleryImages.length <= 1) return;
      currentLightboxIndex = (currentLightboxIndex - 1 + currentProductGalleryImages.length) % currentProductGalleryImages.length;
      lightboxZoomLevel = 1.0;
      updateLightboxImage();
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", () => {
      if (currentProductGalleryImages.length <= 1) return;
      currentLightboxIndex = (currentLightboxIndex + 1) % currentProductGalleryImages.length;
      lightboxZoomLevel = 1.0;
      updateLightboxImage();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target.id === "luxuryLightboxBody" || e.target.id === "luxuryLightboxCanvas") {
        closeLuxuryLightbox();
      }
    });
  }

  window.addEventListener("keydown", (e) => {
    const isOverlayOpen = overlay && overlay.classList.contains("is-open");
    if (!isOverlayOpen) return;
    if (e.key === "Escape") closeLuxuryLightbox();
    else if (e.key === "ArrowLeft") btnPrev && btnPrev.click();
    else if (e.key === "ArrowRight") btnNext && btnNext.click();
  });
}

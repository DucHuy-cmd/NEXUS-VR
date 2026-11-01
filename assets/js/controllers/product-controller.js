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
      if (window.CartManager && typeof window.CartManager.addItem === "function") {
        const colorName = product.colors && product.colors[selectedColorIndex]
          ? product.colors[selectedColorIndex].name
          : "Mặc định";
        window.CartManager.addItem(product.id, 1, colorName);
      } else if (window.cartManager && typeof window.cartManager.addItem === "function") {
        window.cartManager.addItem(product.id, 1);
      }
      if (typeof window.showToast === "function") {
        window.showToast(`Đã chọn gói trả góp 0% (${currentTerm} tháng) & thêm vào giỏ hàng!`, "success");
      }
      if (window.CartManager && typeof window.CartManager.openDrawer === "function") {
        window.CartManager.openDrawer();
      }
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

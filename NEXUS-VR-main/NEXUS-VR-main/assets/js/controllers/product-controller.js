/* NEXUS VR — controllers/product-controller.js
   TẦNG 3 - CONTROLLERS: PRODUCT DETAIL PAGE CONTROLLER
   ========================================================= */

const PLACEHOLDER_IMG = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">' +
  '<rect width="600" height="600" fill="#EDE4D8"/>' +
  '<g fill="none" stroke="#A67C52" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">' +
  '<rect x="150" y="220" width="300" height="200" rx="16"/>' +
  '<circle cx="300" cy="320" r="55"/>' +
  '<path d="M230 220 L260 180 L340 180 L370 220"/>' +
  '</g></svg>'
);

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

function renderReviews(product) {
  const list = document.getElementById("pd-reviews-list");
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];

  document.getElementById("pd-tab-review-count").textContent = reviews.length;
  list.innerHTML = "";

  if (reviews.length === 0) {
    const empty = document.createElement("p");
    empty.className = "product-detail__no-review";
    empty.textContent = "Chưa có đánh giá nào cho sản phẩm này.";
    list.appendChild(empty);
    return;
  }

  reviews.forEach((review) => {
    const item = document.createElement("div");
    item.className = "product-detail__review";

    const head = document.createElement("div");
    head.className = "product-detail__review-head";

    const author = document.createElement("strong");
    author.textContent = review.author || "Ẩn danh";

    const stars = document.createElement("span");
    stars.className = "product-detail__review-stars";
    stars.textContent = renderStars(review.rating || 0);

    const date = document.createElement("span");
    date.className = "product-detail__review-date";
    date.textContent = review.date || "";

    head.appendChild(author);
    head.appendChild(stars);
    head.appendChild(date);

    const comment = document.createElement("p");
    comment.textContent = review.comment || "";

    item.appendChild(head);
    item.appendChild(comment);
    list.appendChild(item);
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

  const getWishlist = window.storageService && typeof window.storageService.getWishlist === "function"
    ? () => window.storageService.getWishlist()
    : (typeof window.getWishlist === "function" ? window.getWishlist : () => []);

  const saveWishlist = window.storageService && typeof window.storageService.saveWishlist === "function"
    ? (list) => window.storageService.saveWishlist(list)
    : (typeof window.saveWishlist === "function" ? window.saveWishlist : () => {});

  function syncState() {
    const isSaved = getWishlist().includes(product.id);
    btn.classList.toggle("is-active", isSaved);
    btn.setAttribute("aria-pressed", String(isSaved));
    btn.textContent = isSaved ? "♥ Đã yêu thích" : "♡ Yêu thích";
  }

  btn.addEventListener("click", () => {
    const list = getWishlist();
    const index = list.indexOf(product.id);
    if (index === -1) {
      list.push(product.id);
      if (typeof window.showToast === "function") window.showToast("Đã thêm vào yêu thích", "success");
    } else {
      list.splice(index, 1);
      if (typeof window.showToast === "function") window.showToast("Đã bỏ khỏi yêu thích", "info");
    }
    saveWishlist(list);
    syncState();
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

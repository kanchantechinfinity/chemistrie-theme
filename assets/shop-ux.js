/* ───── Chemistrie shop UX: cart drawer + localStorage wishlist ───── */
(function () {
  "use strict";

  function money(cents) {
    return "$" + (Number(cents) / 100).toFixed(2);
  }

  function lockBody() { document.body.classList.add("drawer-locked"); }
  function maybeUnlock() {
    var anyOpen = document.querySelector(".drawer.is-open");
    if (!anyOpen) document.body.classList.remove("drawer-locked");
  }

  /* ============ CART DRAWER ============ */
  var cartDrawer = document.getElementById("cartDrawer");
  var cartBackdrop = document.getElementById("cartDrawerBackdrop");
  var cartItemsEl = document.getElementById("cartDrawerItems");
  var cartEmptyEl = document.getElementById("cartDrawerEmpty");
  var cartFootEl = document.getElementById("cartDrawerFoot");
  var cartSubtotalEl = document.getElementById("cartDrawerSubtotal");
  var cartShippingEl = document.getElementById("cartDrawerShipping");

  var freeShip = cartDrawer ? parseFloat(cartDrawer.getAttribute("data-free-shipping") || "120") : 120;

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add("is-open");
    if (cartBackdrop) cartBackdrop.classList.add("is-open");
    lockBody();
  }
  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove("is-open");
    if (cartBackdrop) cartBackdrop.classList.remove("is-open");
    maybeUnlock();
  }

  function updateBagCount(count) {
    document.querySelectorAll(".nav__bag-count").forEach(function (el) {
      el.textContent = count;
    });
  }

  function renderCart(cart) {
    if (!cartItemsEl) return;
    updateBagCount(cart.item_count);

    if (!cart.items || cart.items.length === 0) {
      cartItemsEl.innerHTML = "";
      if (cartEmptyEl) cartEmptyEl.hidden = false;
      if (cartFootEl) cartFootEl.style.display = "none";
      return;
    }
    if (cartEmptyEl) cartEmptyEl.hidden = true;
    if (cartFootEl) cartFootEl.style.display = "";

    var html = "";
    cart.items.forEach(function (item) {
      var img = item.image
        ? '<img class="drawer-item__img" src="' + item.image + '" alt="' + escapeHtml(item.title) + '">'
        : '<span class="drawer-item__img"></span>';
      var variant = item.variant_title && item.variant_title !== "Default Title"
        ? '<span class="drawer-item__variant">' + escapeHtml(item.variant_title) + "</span>"
        : "";
      html +=
        '<div class="drawer-item">' +
          img +
          '<div class="drawer-item__info">' +
            '<span class="drawer-item__title">' + escapeHtml(item.product_title || item.title) + "</span>" +
            variant +
            '<span class="drawer-item__qty">Qty ' + item.quantity + "</span>" +
          "</div>" +
          '<div class="drawer-item__right">' +
            '<span class="drawer-item__price">' + money(item.line_price) + "</span>" +
            '<button type="button" class="drawer-item__remove" data-line-key="' + item.key + '">Remove</button>' +
          "</div>" +
        "</div>";
    });
    cartItemsEl.innerHTML = html;

    if (cartSubtotalEl) cartSubtotalEl.textContent = money(cart.total_price);

    if (cartShippingEl) {
      var subtotalDollars = cart.total_price / 100;
      if (subtotalDollars >= freeShip) {
        cartShippingEl.textContent = "You’ve unlocked complimentary shipping.";
      } else {
        var remaining = (freeShip - subtotalDollars).toFixed(2);
        cartShippingEl.textContent = "You’re $" + remaining + " away from complimentary shipping.";
      }
    }
  }

  function fetchCart() {
    return fetch("/cart.js", { headers: { Accept: "application/json" } }).then(function (r) { return r.json(); });
  }

  function addToCart(id) {
    return fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ items: [{ id: id, quantity: 1 }] }),
    }).then(function (r) { return r.json(); });
  }

  function changeCart(key, qty) {
    return fetch("/cart/change.js", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ id: key, quantity: qty }),
    }).then(function (r) { return r.json(); });
  }

  /* Add-to-cart clicks (event delegation for JS-rendered cards) */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".product__cta[data-product-id]");
    if (!btn) return;
    e.preventDefault();
    var id = btn.getAttribute("data-product-id");
    if (!id) return;
    var original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Adding…";
    addToCart(id)
      .then(fetchCart)
      .then(function (cart) {
        renderCart(cart);
        openCart();
      })
      .catch(function () {})
      .then(function () {
        btn.textContent = original;
        btn.disabled = false;
      });
  });

  /* Remove line item */
  if (cartItemsEl) {
    cartItemsEl.addEventListener("click", function (e) {
      var rm = e.target.closest(".drawer-item__remove");
      if (!rm) return;
      var key = rm.getAttribute("data-line-key");
      changeCart(key, 0).then(renderCart);
    });
  }

  /* Header bag button */
  document.querySelectorAll("[data-cart-open]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      fetchCart().then(function (cart) {
        renderCart(cart);
        openCart();
      });
    });
  });

  document.querySelectorAll("[data-cart-close]").forEach(function (el) {
    el.addEventListener("click", closeCart);
  });
  if (cartBackdrop) cartBackdrop.addEventListener("click", closeCart);

  /* ============ WISHLIST ============ */
  var WK = "chemistrie_wishlist";
  var wishDrawer = document.getElementById("wishlistDrawer");
  var wishBackdrop = document.getElementById("wishlistDrawerBackdrop");
  var wishItemsEl = document.getElementById("wishlistItems");
  var wishEmptyEl = document.getElementById("wishlistEmpty");

  function getWishlist() {
    try { return JSON.parse(localStorage.getItem(WK)) || []; }
    catch (e) { return []; }
  }
  function setWishlist(list) {
    localStorage.setItem(WK, JSON.stringify(list));
    updateWishCount();
  }
  function inWishlist(handle) {
    return getWishlist().some(function (i) { return i.handle === handle; });
  }

  function updateWishCount() {
    var n = getWishlist().length;
    document.querySelectorAll(".nav__wish-count").forEach(function (el) {
      el.textContent = n;
      if (n > 0) el.removeAttribute("hidden"); else el.setAttribute("hidden", "");
    });
  }

  function syncWishButtons() {
    document.querySelectorAll("[data-wishlist-toggle]").forEach(function (btn) {
      btn.classList.toggle("is-active", inWishlist(btn.getAttribute("data-handle")));
    });
  }

  function openWish() {
    if (!wishDrawer) return;
    renderWishlist();
    wishDrawer.classList.add("is-open");
    if (wishBackdrop) wishBackdrop.classList.add("is-open");
    lockBody();
  }
  function closeWish() {
    if (!wishDrawer) return;
    wishDrawer.classList.remove("is-open");
    if (wishBackdrop) wishBackdrop.classList.remove("is-open");
    maybeUnlock();
  }

  function renderWishlist() {
    if (!wishItemsEl) return;
    var list = getWishlist();
    if (list.length === 0) {
      wishItemsEl.innerHTML = "";
      if (wishEmptyEl) wishEmptyEl.hidden = false;
      return;
    }
    if (wishEmptyEl) wishEmptyEl.hidden = true;
    var html = "";
    list.forEach(function (item) {
      var img = item.image
        ? '<img class="drawer-item__img" src="' + item.image + '" alt="' + escapeHtml(item.title) + '">'
        : '<span class="drawer-item__img"></span>';
      var titleInner = escapeHtml(item.title);
      var titleEl = item.url && item.url !== "#"
        ? '<a class="drawer-item__title" href="' + item.url + '">' + titleInner + "</a>"
        : '<span class="drawer-item__title">' + titleInner + "</span>";
      html +=
        '<div class="drawer-item">' +
          img +
          '<div class="drawer-item__info">' +
            titleEl +
            '<span class="drawer-item__variant">' + escapeHtml(item.price || "") + "</span>" +
          "</div>" +
          '<div class="drawer-item__right">' +
            '<button type="button" class="drawer-item__remove" data-wish-remove="' + escapeHtml(item.handle) + '">Remove</button>' +
          "</div>" +
        "</div>";
    });
    wishItemsEl.innerHTML = html;
  }

  /* Toggle wishlist (delegated) */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-wishlist-toggle]");
    if (!btn) return;
    e.preventDefault();
    var handle = btn.getAttribute("data-handle");
    var list = getWishlist();
    if (inWishlist(handle)) {
      list = list.filter(function (i) { return i.handle !== handle; });
    } else {
      list.push({
        handle: handle,
        title: btn.getAttribute("data-title") || "",
        price: btn.getAttribute("data-price") || "",
        image: btn.getAttribute("data-image") || "",
        url: btn.getAttribute("data-url") || "#",
      });
    }
    setWishlist(list);
    syncWishButtons();
    if (wishDrawer && wishDrawer.classList.contains("is-open")) renderWishlist();
  });

  /* Remove from wishlist drawer */
  if (wishItemsEl) {
    wishItemsEl.addEventListener("click", function (e) {
      var rm = e.target.closest("[data-wish-remove]");
      if (!rm) return;
      var handle = rm.getAttribute("data-wish-remove");
      setWishlist(getWishlist().filter(function (i) { return i.handle !== handle; }));
      syncWishButtons();
      renderWishlist();
    });
  }

  document.querySelectorAll("[data-wishlist-open]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); openWish(); });
  });
  document.querySelectorAll("[data-wishlist-close]").forEach(function (el) {
    el.addEventListener("click", closeWish);
  });
  if (wishBackdrop) wishBackdrop.addEventListener("click", closeWish);

  /* Escape closes any drawer */
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeCart(); closeWish(); }
  });

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* init */
  updateWishCount();
  syncWishButtons();
})();

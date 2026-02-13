const PRODUCTS = [
  {
    id: "lexic-cuff",
    name: "The Lexic Cuff Ring",
    price: 6990,
    currency: "$",
    images: [
      "style/assets/hands-in-rings.png",
      "style/assets/side-woman.png",
      "style/assets/woman-main.png",
      "style/assets/shadow-woman.png",
    ],
    colorImages: [
      "style/assets/color.png",
      "style/assets/color.png",
      "style/assets/color.png",
    ],
    description:
      "A modern cuff ring featuring high quality cut and brilliance. Crafted with care and designed for statement wear.",
    specs: { gold: "18k", diamond: "2.4c", clarity: "92%" },
    colors: ["#ffffff", "#f0c7a0", "#ffd6e0"],
    sizes: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5],
  },
  // Collection items
  {
    id: "r1",
    name: "First Product Name",
    price: 1500,
    images: ["style/assets/first-ring.png"],
  },
  {
    id: "r2",
    name: "Second Product Name",
    price: 1500,
    images: ["style/assets/second-ring.png"],
  },
  {
    id: "r3",
    name: "Third Product Name",
    price: 1500,
    images: ["style/assets/third-ring.png"],
  },
  {
    id: "r4",
    name: "Fourth Product Name",
    price: 1500,
    images: ["style/assets/fourth-ring.png"],
  },
];

class ProductStore {
  constructor(products) {
    this.products = products.slice();
  }
  getFeatured() {
    return this.products[0];
  }
  getCollection() {
    return this.products.slice(1);
  }
  findById(id) {
    return this.products.find((p) => p.id === id);
  }
}

class Cart {
  constructor() {
    this.items = [];
  }
  add(item) {
    const key = item.id + JSON.stringify(item.meta || {});
    const existing = this.items.find((i) => i._key === key);
    if (existing) {
      existing.qty += item.qty;
    } else {
      this.items.push(Object.assign({ _key: key }, item));
    }
  }
  remove(key) {
    this.items = this.items.filter((i) => i._key !== key);
  }
  count() {
    return this.items.reduce((s, i) => s + i.qty, 0);
  }
  total() {
    return this.items.reduce((s, i) => s + i.price * i.qty, 0);
  }
}

class UI {
  constructor(store, cart) {
    this.store = store;
    this.cart = cart;
    this.root = document.getElementById("product-root");
    this.collectionRoot = document.getElementById("collection-root");
    this.cartCountEl = document.getElementById("cart-count");
    this.cartDrawer = document.getElementById("cart-drawer");
    this.cartItemsEl = document.getElementById("cart-items");
    this.cartTotalEl = document.getElementById("cart-total");
    this.init();
  }
  init() {
    this.renderFeatured();
    this.renderCollection();
    this.updateCartCount();
    this.attachCartHandlers();
  }
  formatPrice(n) {
    return "$" + (n / 100).toFixed(2);
  }
  renderFeatured() {
    const p = this.store.getFeatured();
    const galleryHtml = `
      <div class="product-gallery">
        <div class="product-main-image"><img src="${p.images[0]}" alt="${p.name}"></div>
        <div class="gallery-sub">
          <div class="sub-left"><img src="${p.images[1]}" alt="${p.name} 2"></div>
          <div class="sub-right">
            <img src="${p.images[2]}" alt="${p.name} 3">
            <img src="${p.images[3]}" alt="${p.name} 4">
          </div>
        </div>
      </div>`;

    const infoHtml = `
      <div class="product-info">
        <h1>${p.name}</h1>
        <div class="price">${this.formatPrice(p.price)}</div>
        <p class="desc">${p.description}</p>

        <div class="meta-grid">
          <div class="meta-item"><div class="label">Gold</div><div class="value">${p.specs.gold}</div></div>
          <div class="meta-item"><div class="label">Diamond</div><div class="value">${p.specs.diamond}</div></div>
          <div class="meta-item"><div class="label">Clarity</div><div class="value">${p.specs.clarity}</div></div>
        </div>

        <div class="options">
          <div class="label" style="color:var(--muted);margin-bottom:6px">Color</div>
          <div class="swatches">${(p.colorImages || p.colors)
            .map((c, idx) => {
              if (p.colorImages) {
                return `<div class="swatch" data-color="${p.colors[idx] || ""}" role="button" tabindex="0" ${idx === 0 ? "data-active" : ""}><img src="${p.colorImages[idx]}" alt="color-${idx + 1}"></div>`;
              }
              return `<div class="swatch" data-color="${c}" role="button" tabindex="0" ${idx === 0 ? "data-active" : ""} style="background:${c}"></div>`;
            })
            .join("")}</div>

          <div class="label" style="color:var(--muted);margin-top:12px">Size</div>
          <div class="size-list">${p.sizes.map((s, idx) => `<div class="size ${s === 7 ? "disabled" : ""}" data-size="${s}" ${idx === 2 ? "data-active" : ""}>${s}</div>`).join("")}</div>

          <div style="margin-top:18px;display:flex;gap:12px;align-items:center">
            <button id="add-to-cart" class="btn primary">Add To Cart</button>
            <div style="flex:1"></div>
          </div>
        </div>
      </div>`;

    this.root.innerHTML = `<div class="product-gallery-root">${galleryHtml}</div><aside>${infoHtml}</aside>`;

    const swatches = this.root.querySelectorAll(".swatch");
    swatches.forEach((s) =>
      s.addEventListener("click", (e) => {
        swatches.forEach((x) => x.classList.remove("active"));
        s.classList.add("active");
      }),
    );
    const sizes = this.root.querySelectorAll(".size");
    sizes.forEach((sz) => {
      if (sz.classList.contains("disabled")) return;
      sz.addEventListener("click", (e) => {
        sizes.forEach((x) => x.classList.remove("active"));
        sz.classList.add("active");
      });
    });

    const addBtn = document.getElementById("add-to-cart");
    addBtn.addEventListener("click", () => {
      const selectedSize =
        this.root.querySelector(".size.active")?.dataset.size ||
        this.root.querySelector(".size")?.dataset.size;
      const selectedColor =
        this.root.querySelector(".swatch.active")?.dataset.color ||
        this.root.querySelector(".swatch")?.dataset.color;
      this.cart.add({
        id: p.id,
        name: p.name,
        price: p.price,
        qty: 1,
        meta: { size: selectedSize, color: selectedColor },
      });
      this.updateCartCount();
      this.renderCartDrawer();
      this.openCart();
    });
  }
  renderCollection() {
    const items = this.store.getCollection();
    const html = `
      <h2 class="collection-title">Ring Collection</h2>
      <div class="collection-grid">${items
        .map(
          (it) => `
        <article class="product-card" data-id="${it.id}">
          <img src="${it.images[0]}" alt="${it.name}">
          <a class="name" href="#">${it.name}</a>
          <div class="price">${this.formatPrice(it.price)}</div>
          <button class="btn add-small" data-id="${it.id}">Add</button>
        </article>
      `,
        )
        .join("")}</div>
      <div style="text-align:center;margin-top:28px"><button class="btn shop-rings">Shop Rings</button></div>`;
    this.collectionRoot.innerHTML = html;

    this.collectionRoot.querySelectorAll(".add-small").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = btn.dataset.id;
        const prod = this.store.findById(id);
        this.cart.add({
          id: prod.id,
          name: prod.name,
          price: prod.price,
          qty: 1,
        });
        this.updateCartCount();
        this.renderCartDrawer();
      });
    });
  }
  updateCartCount() {
    this.cartCountEl.textContent = this.cart.count();
    this.cartTotalEl.textContent = this.formatPrice(this.cart.total());
  }
  renderCartDrawer() {
    this.cartItemsEl.innerHTML = "";
    if (this.cart.items.length === 0) {
      this.cartItemsEl.innerHTML =
        '<li style="color:var(--muted);padding:12px">Your cart is empty</li>';
      this.cartTotalEl.textContent = this.formatPrice(0);
      return;
    }
    this.cart.items.forEach((it) => {
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `<img src="https://picsum.photos/seed/${it.id}/120/120" alt="${it.name}"><div style="flex:1"><div style="font-weight:600">${it.name}</div><div style="color:var(--muted);font-size:13px">${it.meta ? "Size: " + (it.meta.size || "—") : ""}</div></div><div style="min-width:64px;text-align:right">${this.formatPrice(it.price)}<div style="font-size:12px;color:var(--muted)">x ${it.qty}</div></div>`;
      this.cartItemsEl.appendChild(li);
    });
    this.cartTotalEl.textContent = this.formatPrice(this.cart.total());
  }
  attachCartHandlers() {
    const openBtn = document.getElementById("cart-btn");
    const closeBtn = document.getElementById("close-cart");
    openBtn.addEventListener("click", () => {
      this.openCart();
      this.renderCartDrawer();
    });
    closeBtn.addEventListener("click", () => {
      this.closeCart();
    });
    document.addEventListener("click", (e) => {
      if (
        !this.cartDrawer.contains(e.target) &&
        !document.getElementById("cart-btn").contains(e.target)
      ) {
        this.closeCart();
      }
    });
  }
  openCart() {
    this.cartDrawer.setAttribute("aria-hidden", "false");
  }
  closeCart() {
    this.cartDrawer.setAttribute("aria-hidden", "true");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const store = new ProductStore(PRODUCTS);
  const cart = new Cart();
  const ui = new UI(store, cart);
});

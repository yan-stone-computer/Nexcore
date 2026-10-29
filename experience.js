(function () {
  "use strict";

  const root = document.documentElement;
  const products = window.PRODUCTS_DATA || [];
  const deck = document.getElementById("productDeck");
  const cover = document.getElementById("cover");
  const stage = document.getElementById("coverStage");
  const themeButton = document.getElementById("themeToggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const indexLabel = document.getElementById("showcaseIndex");
  const titleLabel = document.getElementById("showcaseTitle");
  const metaLabel = document.getElementById("showcaseMeta");
  const productLink = document.getElementById("showcaseLink");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const art = {
    NexcoreWork: { image: "assets/nexcorework-icon.svg", width: 512, height: 512, tone: "#dff7eb", ink: "#075f47", type: "icon" },
    NexcoreGraph: { image: "assets/nexcoregraph-icon.png", width: 1024, height: 1024, tone: "#313b48", ink: "#e6fbf5", type: "icon" },
    "Drum Tide": { image: "assets/guling-icon.webp", width: 512, height: 512, tone: "#f2ddd8", ink: "#a52e20", type: "icon" },
    PolarisNote: { image: "", width: 28, height: 28, tone: "#ece8ff", ink: "#5040b7", type: "icon" },
    ChenHanshen: { image: "assets/chenhansheng-cover.jpg", width: 1080, height: 600, tone: "#f4dedd", ink: "#512d32", type: "cover" }
  };

  function cardMarkup(product, color) {
    const visual = product.iconSvg
      ? `<span class="product-card__icon">${product.iconSvg}</span>`
      : `<img src="${visualFor(product, color)}" width="${color.width}" height="${color.height}" alt="" loading="eager" decoding="async">`;
    return `
      <span class="product-card__surface">
        <span class="product-card__shape product-card__shape-a"></span>
        <span class="product-card__shape product-card__shape-b"></span>
        <span class="product-card__visual is-${color.type}">${visual}</span>
        <span class="product-card__index">${product.num}</span>
        <span class="product-card__badge">${product.repo ? "开源" : "产品"}</span>
        <span class="product-card__tagline">${product.tag}</span>
        <span class="product-card__name">${product.en}</span>
      </span>`;
  }

  function visualFor(product, color) {
    return color.image || product.iconImg || "";
  }

  function paint(index) {
    const active = products[index];
    if (!active) return;
    indexLabel.textContent = `${String(index + 1).padStart(2, "0")} / ${String(products.length).padStart(2, "0")}`;
    titleLabel.textContent = active.name;
    metaLabel.textContent = `${active.en} · ${active.tag}`;
    productLink.href = active.site || "#products";

    deck.querySelectorAll(".product-card").forEach((card, position) => {
      const product = products[(position + index) % products.length];
      const color = art[product.en] || { image: product.iconImg || "", tone: "#eeeeF2", ink: "#1d1d1f", type: "icon" };
      card.href = product.site || "#products";
      card.setAttribute("aria-label", `查看${product.name}，${product.tag}`);
      card.style.setProperty("--tone", color.tone);
      card.style.setProperty("--tone-ink", color.ink);
      card.innerHTML = cardMarkup(product, color);
    });
  }

  if (deck && products.length) {
    deck.innerHTML = products.map((_, index) => `
      <a class="product-card" data-position="${index}" style="--i:${index}" href="#products" aria-label="查看产品"></a>
    `).join("");

    let activeIndex = 0;
    let directionQueue = 0;
    let cycling = false;

    function playCycle() {
      if (cycling || !directionQueue) return;
      cycling = true;
      const direction = Math.sign(directionQueue);
      directionQueue -= direction;
      activeIndex = (activeIndex + direction + products.length) % products.length;
      deck.querySelectorAll(".product-card").forEach((card) => {
        card.classList.remove("is-cycling");
        void card.offsetWidth;
        card.classList.add("is-cycling");
      });
      setTimeout(() => paint(activeIndex), 170);
      setTimeout(() => {
        deck.querySelectorAll(".product-card").forEach((card) => card.classList.remove("is-cycling"));
        cycling = false;
        playCycle();
      }, 720);
    }

    function requestCycle(direction) {
      directionQueue += direction;
      playCycle();
    }

    document.getElementById("prevProduct").addEventListener("click", () => requestCycle(-1));
    document.getElementById("nextProduct").addEventListener("click", () => requestCycle(1));
    paint(activeIndex);
  }

  function syncTheme() {
    const dark = root.dataset.theme === "dark";
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute("aria-label", dark ? "切换到浅色模式" : "切换到深色模式");
  }

  syncTheme();
  themeButton.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    root.style.colorScheme = next;
    themeMeta.content = next === "dark" ? "#101012" : "#f5f5f7";
    try {
      localStorage.setItem("nexcore-theme", next);
    } catch {}
    syncTheme();
  });

  if (!reduceMotion && cover && stage) {
    let visible = false;
    let frameId = 0;
    let current = 0;

    function frame() {
      const distance = cover.offsetHeight - innerHeight;
      const target = distance > 0 ? Math.min(1, Math.max(0, -cover.getBoundingClientRect().top / distance)) : 0;
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.0004) current = target;
      stage.style.setProperty("--p", current.toFixed(4));
      stage.classList.toggle("is-reading", current > 0.34);
      frameId = visible ? requestAnimationFrame(frame) : 0;
    }

    new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible && !frameId) frameId = requestAnimationFrame(frame);
    }, { threshold: 0 }).observe(cover);
  } else if (stage) {
    stage.style.setProperty("--p", "0");
  }
})();

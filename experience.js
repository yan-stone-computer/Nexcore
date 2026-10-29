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

  function visualFor(product, color) {
    return color.image || product.iconImg || "";
  }

  function cardMarkup(product, color) {
    const visual = product.iconSvg
      ? `<span class="product-card__icon">${product.iconSvg}</span>`
      : `<img src="${visualFor(product, color)}" width="${color.width}" height="${color.height}" alt="" loading="eager" decoding="async" draggable="false">`;
    const platform = (product.meta || []).find((item) => item.k === "平台");

    return `
      <span class="product-card__flip">
        <span class="product-card__surface product-card__front">
          <span class="product-card__shape product-card__shape-a"></span>
          <span class="product-card__shape product-card__shape-b"></span>
          <span class="product-card__visual is-${color.type}">${visual}</span>
          <span class="product-card__index">${product.num}</span>
          <span class="product-card__badge">${product.repo ? "开源" : "产品"}</span>
          <span class="product-card__tagline">${product.tag}</span>
          <span class="product-card__name">${product.en}</span>
        </span>
        <span class="product-card__surface product-card__back">
          <span class="product-card__back-label">${product.repo ? "OPEN SOURCE" : "PRODUCT"}</span>
          <b>${product.name}</b>
          <small>${product.en}</small>
          <span class="product-card__back-line"></span>
          <span class="product-card__back-copy">${product.lead}</span>
          <span class="product-card__back-meta">${platform ? platform.v : product.tag}</span>
          <span class="product-card__back-action">再次点击翻回</span>
        </span>
      </span>`;
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
      const color = art[product.en] || { image: product.iconImg || "", width: 512, height: 512, tone: "#eeeef2", ink: "#1d1d1f", type: "icon" };
      card.dataset.site = product.site || "#products";
      card.setAttribute("aria-label", `翻转查看${product.name}，${product.tag}`);
      card.style.setProperty("--tone", color.tone);
      card.style.setProperty("--tone-ink", color.ink);
      card.classList.remove("is-flipped");
      card.setAttribute("aria-pressed", "false");
      card.innerHTML = cardMarkup(product, color);
    });
    stage.style.setProperty("--hero-tone", (art[active.en] || {}).tone || "var(--accent-soft)");
  }

  if (deck && products.length) {
    deck.innerHTML = products.map((_, index) => `
      <button class="product-card" data-position="${index}" style="--i:${index}" type="button" aria-label="翻转查看产品" aria-pressed="false"></button>
    `).join("");

    let activeIndex = 0;
    let directionQueue = 0;
    let cycling = false;
    let suppressClick = false;
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragX = 0;
    let hoveredCard = null;

    function playCycle() {
      if (cycling || !directionQueue) return;
      cycling = true;
      const direction = Math.sign(directionQueue);
      directionQueue -= direction;
      activeIndex = (activeIndex + direction + products.length) % products.length;
      deck.querySelectorAll(".product-card").forEach((card) => {
        card.classList.remove("is-cycling", "is-flipped");
        card.setAttribute("aria-pressed", "false");
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

    function resetDrag() {
      dragging = false;
      dragX = 0;
      stage.classList.remove("is-dragging");
      stage.style.setProperty("--drag-x", "0px");
      stage.style.setProperty("--drag-r", "0deg");
    }

    deck.addEventListener("click", (event) => {
      const card = event.target.closest(".product-card");
      if (!card || suppressClick) return;
      const flipped = !card.classList.contains("is-flipped");
      deck.querySelectorAll(".product-card").forEach((item) => {
        item.classList.toggle("is-flipped", item === card && flipped);
        item.setAttribute("aria-pressed", String(item === card && flipped));
      });
    });

    window.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const card = event.target.closest(".product-card");
      if (!card) return;
      dragging = true;
      hoveredCard = card;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragX = 0;
    });

    window.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      dragX = event.clientX - dragStartX;
      const dragY = event.clientY - dragStartY;
      if (Math.abs(dragX) <= 5 || Math.abs(dragX) < Math.abs(dragY)) return;
      stage.classList.add("is-dragging");
      stage.style.setProperty("--drag-x", `${Math.max(-170, Math.min(170, dragX))}px`);
      stage.style.setProperty("--drag-r", `${Math.max(-6, Math.min(6, dragX * 0.028))}deg`);
    });

    function finishDrag(event) {
      if (!dragging) return;
      const moved = Math.abs(dragX) > 8;
      const shouldCycle = Math.abs(dragX) > 56;
      dragging = false;
      resetDrag();
      if (moved) {
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 0);
      }
      if (shouldCycle) requestCycle(dragX < 0 ? 1 : -1);
      hoveredCard = null;
    }

    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    deck.addEventListener("pointerover", (event) => {
      const card = event.target.closest(".product-card");
      if (!card || card === hoveredCard) return;
      hoveredCard = card;
      deck.querySelectorAll(".product-card").forEach((item) => item.classList.toggle("is-hovered", item === card));
    });

    deck.addEventListener("pointerleave", () => {
      hoveredCard = null;
      deck.querySelectorAll(".product-card").forEach((card) => card.classList.remove("is-hovered"));
    });

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

    cover.addEventListener("pointermove", (event) => {
      const x = event.clientX / innerWidth - 0.5;
      const y = event.clientY / innerHeight - 0.5;
      stage.style.setProperty("--mouse-x", `${x * 22}px`);
      stage.style.setProperty("--mouse-y", `${y * 18}px`);
    });
    cover.addEventListener("pointerleave", () => {
      stage.style.setProperty("--mouse-x", "0px");
      stage.style.setProperty("--mouse-y", "0px");
    });
  } else if (stage) {
    stage.style.setProperty("--p", "0");
  }
})();

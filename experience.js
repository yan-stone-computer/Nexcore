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
          <span class="product-card__spotlight"></span>
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
    let draggingCard = null;
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
      if (draggingCard) {
        draggingCard.classList.remove("is-dragging");
        draggingCard.style.setProperty("--local-x", "0px");
        draggingCard.style.setProperty("--local-y", "0px");
        draggingCard.style.setProperty("--local-r", "0deg");
      }
      draggingCard = null;
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
      draggingCard = card;
      hoveredCard = card;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragX = 0;
    });

    window.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      dragX = event.clientX - dragStartX;
      const dragY = event.clientY - dragStartY;
      if (Math.abs(dragX) <= 3 || Math.abs(dragX) < Math.abs(dragY)) return;
      event.preventDefault();
      stage.classList.add("is-dragging");
      draggingCard.classList.add("is-dragging");
      draggingCard.style.setProperty("--local-x", `${Math.max(-180, Math.min(180, dragX))}px`);
      draggingCard.style.setProperty("--local-y", `${Math.max(-36, Math.min(36, dragY * 0.22))}px`);
      draggingCard.style.setProperty("--local-r", `${Math.max(-5, Math.min(5, dragX * 0.022))}deg`);
      stage.style.setProperty("--drag-x", `${Math.max(-36, Math.min(36, dragX * 0.18))}px`);
      stage.style.setProperty("--drag-r", `${Math.max(-6, Math.min(6, dragX * 0.028))}deg`);
    });

    function finishDrag(event) {
      if (!dragging) return;
      const moved = Math.abs(dragX) > 8;
      const shouldCycle = Math.abs(dragX) > 56;
      const dragDirection = dragX < 0 ? 1 : -1;
      dragging = false;
      resetDrag();
      if (moved) {
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 0);
      }
      if (shouldCycle) requestCycle(dragDirection);
      hoveredCard = null;
    }

    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    deck.addEventListener("pointerover", (event) => {
      const card = event.target.closest(".product-card");
      if (!card || card === hoveredCard) return;
      hoveredCard = card;
      deck.querySelectorAll(".product-card").forEach((item) => {
        item.classList.toggle("is-hovered", item === card);
        if (item !== card) {
          item.style.setProperty("--tilt-x", "0deg");
          item.style.setProperty("--tilt-y", "0deg");
        }
      });
    });

    deck.addEventListener("pointermove", (event) => {
      if (dragging || event.pointerType !== "mouse") return;
      const card = event.target.closest(".product-card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(y * -7).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(x * 9).toFixed(2)}deg`);
      card.style.setProperty("--spot-x", `${(x * 100 + 50).toFixed(1)}%`);
      card.style.setProperty("--spot-y", `${(y * 100 + 50).toFixed(1)}%`);
    });

    deck.addEventListener("pointerleave", () => {
      hoveredCard = null;
      deck.querySelectorAll(".product-card").forEach((card) => {
        card.classList.remove("is-hovered");
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
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

  function applyTheme(next) {
    root.dataset.theme = next;
    root.style.colorScheme = next;
    themeMeta.content = next === "dark" ? "#101012" : "#f5f5f7";
    try {
      localStorage.setItem("nexcore-theme", next);
    } catch {}
    syncTheme();
  }

  syncTheme();
  themeButton.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    if (reduceMotion || !document.startViewTransition) {
      applyTheme(next);
      return;
    }
    const rect = themeButton.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    root.style.setProperty("--theme-x", `${x}px`);
    root.style.setProperty("--theme-y", `${y}px`);
    root.style.setProperty("--theme-radius", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
    document.startViewTransition(() => applyTheme(next));
  });

  function mountProductPreview() {
    if (reduceMotion || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const media = {
      NexcoreWork: { src: "assets/nexcorework-icon.svg", kind: "icon" },
      NexcoreGraph: { src: "assets/nexcoregraph-icon.png", kind: "icon" },
      "Drum Tide": { src: "assets/guling-icon.webp", kind: "icon" },
      PolarisNote: { src: "assets/polaris-dashboard.png", kind: "image" },
      ChenHanshen: { src: "assets/chenhansheng-cover.jpg", kind: "image" }
    };
    const peek = document.createElement("div");
    peek.className = "product-peek";
    peek.setAttribute("aria-hidden", "true");
    peek.innerHTML = '<span class="product-peek__media"><img width="238" height="136" alt="" decoding="async"></span><span class="product-peek__copy"><b></b><small></small></span>';
    document.body.append(peek);
    const image = peek.querySelector("img");
    const title = peek.querySelector("b");
    const tag = peek.querySelector("small");
    let currentRow = null;
    let pointerX = 0;
    let pointerY = 0;
    let frameId = 0;

    function positionPreview() {
      frameId = 0;
      const width = 238;
      const height = 180;
      const x = pointerX + width + 30 > innerWidth ? pointerX - width - 22 : pointerX + 22;
      const y = Math.min(innerHeight - height - 16, Math.max(16, pointerY + 18));
      peek.style.transform = `translate3d(${Math.max(16, x)}px, ${y}px, 0)`;
    }

    function hidePreview() {
      currentRow = null;
      peek.classList.remove("is-visible");
    }

    document.addEventListener("pointerover", (event) => {
      const row = event.target.closest?.(".prod");
      if (!row || row === currentRow) return;
      const rows = [...document.querySelectorAll(".prod")];
      const product = products[rows.indexOf(row)];
      const item = product && media[product.en];
      if (!product || !item) return;
      currentRow = row;
      image.src = item.src;
      title.textContent = product.name;
      tag.textContent = product.tag;
      peek.classList.toggle("is-icon", item.kind === "icon");
      peek.classList.add("is-visible");
    });

    document.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!currentRow) return;
      if (!event.target.closest?.(".prod")) {
        hidePreview();
        return;
      }
      if (!frameId) frameId = requestAnimationFrame(positionPreview);
    });

    document.documentElement.addEventListener("pointerleave", hidePreview);
    window.addEventListener("wheel", hidePreview, { passive: true });
  }

  mountProductPreview();

  const contactGroup = document.querySelector(".contact-group");
  if (contactGroup) {
    contactGroup.addEventListener("click", async () => {
      const value = contactGroup.dataset.copy;
      const label = contactGroup.querySelector("small");
      if (!value || !label) return;
      const original = label.textContent;
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        const field = document.createElement("textarea");
        field.value = value;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.append(field);
        field.select();
        document.execCommand("copy");
        field.remove();
      }
      contactGroup.classList.add("is-copied");
      label.textContent = "群号已复制";
      setTimeout(() => {
        contactGroup.classList.remove("is-copied");
        label.textContent = original;
      }, 1600);
    });
  }

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

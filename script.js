const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

const syncHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

navToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  }
});

const statusClassNames = {
  ご家族募集中: "status-available",
  商談中: "status-talk",
  お引き渡し済み: "status-graduated",
};

const createTextElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  return element;
};

const createKittenMeta = (label, value) => {
  const row = document.createElement("div");
  const term = createTextElement("dt", "", label);
  const description = createTextElement("dd", "", value || "未定");

  row.append(term, description);
  return row;
};

const createKittenCard = (kitten) => {
  const article = document.createElement("article");
  article.className = "animal-card kitten-card";
  if (kitten.status === "お引き渡し済み") {
    article.classList.add("is-graduated");
  }

  const image = document.createElement("img");
  image.src = kitten.image;
  image.alt = kitten.alt || `${kitten.color || "ラグドール"}の子猫`;

  const body = document.createElement("div");
  body.className = "animal-card-body";

  const status = createTextElement(
    "p",
    `card-kicker ${statusClassNames[kitten.status] || ""}`.trim(),
    kitten.status || "ステータス未定"
  );

  const name = createTextElement("h3", "", `幼名：${kitten.name || "未定"}`);

  const meta = document.createElement("dl");
  meta.className = "kitten-meta";
  meta.append(
    createKittenMeta("性別", kitten.sex),
    createKittenMeta("誕生日", kitten.birthDate),
    createKittenMeta("毛色", kitten.color)
  );

  const note = createTextElement("p", "kitten-note", kitten.note || "成長に合わせて追記します");

  body.append(status, name, meta, note);
  article.append(image, body);

  return article;
};

const renderKittenLists = () => {
  const kittens = Array.isArray(window.AmorAliceKittens) ? window.AmorAliceKittens : [];
  const visibleKittens = kittens.filter((kitten) => kitten.visible !== false);
  const kittenList = document.querySelector("[data-kitten-list]");
  const graduateList = document.querySelector("[data-graduate-list]");
  const kittenCount = document.querySelector("[data-kitten-count]");

  if (kittenCount) {
    kittenCount.textContent = `現在の掲載：${visibleKittens.length}匹`;
  }

  if (kittenList) {
    kittenList.replaceChildren(...visibleKittens.map(createKittenCard));
  }

  if (graduateList) {
    const graduates = visibleKittens.filter((kitten) => kitten.status === "お引き渡し済み");
    graduateList.replaceChildren(...graduates.map(createKittenCard));
  }
};

renderKittenLists();

const initFrameHero = () => {
  const section = document.querySelector("[data-frame-hero]");
  if (!section) return;

  const canvas = section.querySelector("[data-frame-canvas]");
  const ctx = canvas.getContext("2d", { alpha: false });
  const heroText = section.querySelector("[data-hero-text]");
  const loader = section.querySelector("[data-frame-loader]");
  const loaderBar = section.querySelector("[data-frame-loader-bar]");
  const annotations = [...section.querySelectorAll("[data-annotation]")];
  const frameCount = 120;
  const frames = [];
  let loadedCount = 0;
  let currentFrame = -1;
  let ticking = false;
  let canvasWidth = 0;
  let canvasHeight = 0;

  const frameSrc = (index) => `assets/hero-door-frames/frame_${String(index).padStart(4, "0")}.jpg`;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const getFrameView = () => {
    if (window.innerWidth <= 520) return { scale: 1, focalX: 0.55, focalY: 0.5 };
    if (window.innerWidth <= 860) return { scale: 1, focalX: 0.53, focalY: 0.5 };
    return { scale: 1, focalX: 0.5, focalY: 0.34 };
  };
  const getCoverRect = (imgRatio, view) => {
    const canvasRatio = canvasWidth / canvasHeight;
    let drawWidth;
    let drawHeight;

    if (canvasRatio > imgRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
    } else {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
    }

    drawWidth *= view.scale;
    drawHeight *= view.scale;

    return {
      x: clamp(canvasWidth * view.focalX - drawWidth * view.focalX, canvasWidth - drawWidth, 0),
      y: clamp(canvasHeight * view.focalY - drawHeight * view.focalY, canvasHeight - drawHeight, 0),
      width: drawWidth,
      height: drawHeight
    };
  };
  const drawMobileFrame = (img, imgRatio) => {
    const background = getCoverRect(imgRatio, { scale: 1.08, focalX: 0.5, focalY: 0.5 });
    const foregroundHeight = Math.min(canvasHeight * 0.58, canvasWidth * 1.22);
    const foregroundWidth = foregroundHeight * imgRatio;
    const foregroundX = clamp(canvasWidth * 0.5 - foregroundWidth * 0.5, canvasWidth - foregroundWidth, 0);
    const foregroundY = Math.min(Math.max(72, canvasHeight * 0.08), canvasHeight * 0.12);

    ctx.save();
    ctx.filter = "blur(14px)";
    ctx.drawImage(
      img,
      background.x - 24,
      background.y - 24,
      background.width + 48,
      background.height + 48
    );
    ctx.restore();

    ctx.fillStyle = "rgba(8, 12, 17, 0.22)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, foregroundX, foregroundY, foregroundWidth, foregroundHeight);
  };

  const resizeCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvasWidth = Math.max(1, rect.width || window.innerWidth);
    canvasHeight = Math.max(1, rect.height || window.innerHeight);
    canvas.width = Math.round(canvasWidth * dpr);
    canvas.height = Math.round(canvasHeight * dpr);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(Math.max(currentFrame, 0), true);
  };

  const drawFrame = (index, force = false) => {
    if (!force && index === currentFrame) return;
    const img = frames[index];
    if (!img?.complete || img.naturalWidth === 0) return;

    currentFrame = index;
    const imgRatio = img.naturalWidth / img.naturalHeight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (window.innerWidth <= 600) {
      drawMobileFrame(img, imgRatio);
      return;
    }

    const frame = getCoverRect(imgRatio, getFrameView());
    ctx.drawImage(img, frame.x, frame.y, frame.width, frame.height);
  };

  const updateHero = () => {
    const rect = section.getBoundingClientRect();
    const scrollableHeight = Math.max(section.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(1, Math.max(0, -rect.top / scrollableHeight));
    const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount));

    drawFrame(frameIndex);

    if (heroText) {
      const textOpacity = Math.max(0, 1 - progress / 0.08);
      heroText.style.opacity = String(textOpacity);
      heroText.style.transform = `translateY(${-18 * Math.min(progress / 0.08, 1)}px)`;
    }

    annotations.forEach((card) => {
      const show = Number(card.dataset.show);
      const hide = Number(card.dataset.hide);
      card.classList.toggle("is-visible", progress >= show && progress <= hide);
    });
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateHero();
      ticking = false;
    });
  };

  for (let i = 1; i <= frameCount; i += 1) {
    const img = new Image();
    img.src = frameSrc(i);
    img.onload = () => {
      loadedCount += 1;
      if (loaderBar) {
        loaderBar.style.width = `${Math.round((loadedCount / frameCount) * 100)}%`;
      }
      if (i === 1) drawFrame(0, true);
      if (loadedCount === frameCount) {
        loader?.classList.add("is-hidden");
        requestUpdate();
      }
    };
    frames.push(img);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas, { passive: true });
  window.addEventListener("scroll", requestUpdate, { passive: true });
  requestUpdate();
};

initFrameHero();

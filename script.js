const header = document.querySelector("[data-header]");
const frameHero = document.querySelector("[data-frame-hero]");
const mobileContactBar = document.querySelector("[data-mobile-contact-bar]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

const syncHeader = () => {
  if (!header) return;
  const headerHeight = header.offsetHeight || 0;
  const isPastHero = frameHero
    ? frameHero.getBoundingClientRect().bottom <= headerHeight
    : window.scrollY > 12;
  header.classList.toggle("is-scrolled", isPastHero);

  if (mobileContactBar?.dataset.afterHero === "true" && frameHero) {
    const heroDone = frameHero.getBoundingClientRect().bottom <= window.innerHeight + 4;
    mobileContactBar.classList.toggle("is-visible", heroDone);
  }
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

const emptyKittenMessages = {
  all:
    "現在、子猫情報は掲載準備中です。写真とメモが整った子から、募集中・商談中・お引き渡し済みに分けて掲載します。",
  ご家族募集中:
    "現在、ご家族募集中の子猫は掲載準備中です。見学や出産予定については、見学申し込みフォームからご相談ください。",
  商談中: "現在、商談中の子猫は掲載していません。",
  お引き渡し済み:
    "お引き渡し済みの子は、写真とメモが整った子からこちらへ追加します。",
};

const createKittenMeta = (label, value) => {
  const row = document.createElement("div");
  const term = createTextElement("dt", "", label);
  const description = createTextElement("dd", "", value || "未定");

  row.append(term, description);
  return row;
};

const createKittenTags = (tags = []) => {
  const wrapper = document.createElement("div");
  wrapper.className = "kitten-tags";
  tags.forEach((tagText) => {
    wrapper.append(createTextElement("span", "", tagText));
  });
  return wrapper;
};

const createKittenCardActions = (kitten, context) => {
  const actions = document.createElement("div");
  actions.className = "kitten-card-actions";

  if (context === "graduates" || kitten.status === "お引き渡し済み") {
    actions.append(createTextElement("span", "kitten-record-label", "巣立ち記録として掲載中"));
    return actions;
  }

  const inquiry = document.createElement("a");
  inquiry.className = "kitten-card-link";
  inquiry.href = "visit-form.html?type=visit";
  inquiry.textContent = "この子について相談";
  actions.append(inquiry);

  return actions;
};

const createKittenCard = (kitten, context = "index") => {
  const article = document.createElement("article");
  article.className = "animal-card kitten-card";
  if (kitten.status === "お引き渡し済み") {
    article.classList.add("is-graduated");
  }

  const media = document.createElement("figure");
  media.className = "kitten-card-media";

  const image = document.createElement("img");
  image.src = kitten.image;
  image.alt = kitten.alt || `${kitten.color || "ラグドール"}の子猫`;
  media.append(image);

  const body = document.createElement("div");
  body.className = "animal-card-body";

  const head = document.createElement("div");
  head.className = "kitten-card-head";

  const status = createTextElement(
    "p",
    `card-kicker ${statusClassNames[kitten.status] || ""}`.trim(),
    kitten.status || "ステータス未定"
  );
  const birth = createTextElement("span", "kitten-birth", kitten.birthDate || "誕生日未定");
  head.append(status, birth);

  const name = createTextElement("h3", "", `幼名：${kitten.name || "未定"}`);
  const subtitle = createTextElement(
    "p",
    "kitten-subtitle",
    [kitten.color, kitten.sex].filter(Boolean).join(" / ") || "ラグドール"
  );

  const meta = document.createElement("dl");
  meta.className = "kitten-meta";
  meta.append(
    createKittenMeta("性別", kitten.sex),
    createKittenMeta("誕生日", kitten.birthDate),
    createKittenMeta("毛色", kitten.color)
  );

  const note = document.createElement("p");
  note.className = "kitten-note";
  note.append(
    createTextElement("strong", "", "性格メモ"),
    createTextElement("span", "", kitten.note || "成長に合わせて追記します")
  );

  const appeal = createTextElement(
    "p",
    "kitten-appeal",
    kitten.appeal || "写真や日々の様子を見ながら、見学時に詳しくご案内します。"
  );

  body.append(head, name, subtitle, meta, note, appeal);
  if (Array.isArray(kitten.tags) && kitten.tags.length > 0) {
    body.append(createKittenTags(kitten.tags));
  }
  body.append(createKittenCardActions(kitten, context));
  article.append(media, body);

  return article;
};

const renderKittenLists = () => {
  const kittens = Array.isArray(window.AmorAliceKittens) ? window.AmorAliceKittens : [];
  const visibleKittens = kittens.filter((kitten) => kitten.visible !== false);
  const kittenList = document.querySelector("[data-kitten-list]");
  const graduateList = document.querySelector("[data-graduate-list]");
  const kittenCount = document.querySelector("[data-kitten-count]");
  const filterButtons = document.querySelectorAll("[data-kitten-filter]");
  const filterLabel = document.querySelector("[data-kitten-filter-label]");
  const totalCount = document.querySelector("[data-kitten-total]");
  const availableCount = document.querySelector("[data-kitten-available]");
  const talkCount = document.querySelector("[data-kitten-talk]");
  const graduatedCount = document.querySelector("[data-kitten-graduated]");

  if (kittenCount) {
    kittenCount.textContent = `現在の掲載：${visibleKittens.length}匹`;
  }

  const counts = {
    all: visibleKittens.length,
    available: visibleKittens.filter((kitten) => kitten.status === "ご家族募集中").length,
    talk: visibleKittens.filter((kitten) => kitten.status === "商談中").length,
    graduated: visibleKittens.filter((kitten) => kitten.status === "お引き渡し済み").length,
  };

  if (totalCount) totalCount.textContent = counts.all;
  if (availableCount) availableCount.textContent = counts.available;
  if (talkCount) talkCount.textContent = counts.talk;
  if (graduatedCount) graduatedCount.textContent = counts.graduated;

  const renderFilteredKittens = (filter = "all") => {
    if (!kittenList) return;
    const filteredKittens = filter === "all"
      ? visibleKittens
      : visibleKittens.filter((kitten) => kitten.status === filter);

    if (filterLabel) {
      if (filter === "all" && visibleKittens.length === 0) {
        filterLabel.textContent = "現在、掲載準備中です。";
      } else {
        filterLabel.textContent = filter === "all"
          ? "すべての子猫を表示しています。"
          : `${filter}の子猫を表示しています。`;
      }
    }

    if (filteredKittens.length === 0) {
      const empty = createTextElement(
        "p",
        "kitten-empty",
        emptyKittenMessages[filter] || "現在、このステータスの掲載はありません。"
      );
      kittenList.replaceChildren(empty);
      return;
    }

    kittenList.replaceChildren(...filteredKittens.map((kitten) => createKittenCard(kitten, "index")));
  };

  if (kittenList) {
    renderFilteredKittens();
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        renderFilteredKittens(button.dataset.kittenFilter || "all");
      });
    });
  }

  if (graduateList) {
    const graduates = visibleKittens.filter((kitten) => kitten.status === "お引き渡し済み");
    if (graduates.length === 0) {
      graduateList.replaceChildren(
        createTextElement(
          "p",
          "kitten-empty",
          "お引き渡し済みの子は、写真とメモが整った子からこちらへ追加します。"
        )
      );
    } else {
      graduateList.replaceChildren(...graduates.map((kitten) => createKittenCard(kitten, "graduates")));
    }
  }
};

renderKittenLists();

const createBlogCard = (post) => {
  const article = document.createElement("article");
  article.className = "blog-card";

  if (post.image) {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.src = post.image;
    image.alt = post.imageAlt || "";
    figure.append(image);
    article.append(figure);
  }

  const body = document.createElement("div");
  body.className = "blog-card-body";

  const meta = document.createElement("div");
  meta.className = "blog-card-meta";

  const tag = createTextElement("span", "", post.tag || "Blog");
  const date = document.createElement("time");
  date.textContent = post.date || "";
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(post.date || "")) {
    date.dateTime = post.date.replace(/\./g, "-");
  }
  meta.append(tag, date);

  const title = createTextElement("h3", "", post.title || "記事タイトル未定");
  const summary = createTextElement("p", "", post.summary || "内容を準備中です。");

  body.append(meta, title, summary);
  article.append(body);

  return article;
};

const renderBlogCategory = (container, posts, emptyMessage) => {
  if (!container) return;
  const visiblePosts = posts.filter((post) => post.visible !== false);

  if (visiblePosts.length === 0) {
    const empty = createTextElement("p", "blog-empty", emptyMessage);
    container.replaceChildren(empty);
    return;
  }

  container.replaceChildren(...visiblePosts.map(createBlogCard));
};

const renderBlogPosts = () => {
  const posts = Array.isArray(window.AmorAliceBlogPosts) ? window.AmorAliceBlogPosts : [];
  renderBlogCategory(
    document.querySelector("[data-news-list]"),
    posts.filter((post) => post.category === "news"),
    "ニュースは現在準備中です。"
  );
  renderBlogCategory(
    document.querySelector("[data-letter-list]"),
    posts.filter((post) => post.category === "letter"),
    "里親様からのお便りは現在準備中です。"
  );
};

renderBlogPosts();

const initVisitForm = () => {
  const form = document.querySelector("[data-visit-form]");
  if (!form) return;

  const status = form.querySelector("[data-form-status]");
  const copyButton = form.querySelector("[data-copy-form]");
  const requestType = form.elements.requestType;
  const getFormValue = (formData, name) => String(formData.get(name) || "").trim();
  const setStatus = (message) => {
    if (status) status.textContent = message;
  };
  const buildMessage = () => {
    const formData = new FormData(form);
    const rows = [
      ["お名前", getFormValue(formData, "name")],
      ["ふりがな", getFormValue(formData, "kana")],
      ["メールアドレス", getFormValue(formData, "email")],
      ["電話番号", getFormValue(formData, "tel")],
      ["連絡しやすい方法", getFormValue(formData, "preferredContact")],
      ["ご相談内容", getFormValue(formData, "requestType")],
      ["気になる子・希望", getFormValue(formData, "interest")],
      ["お住まい", getFormValue(formData, "area")],
      ["見学希望日 第1希望", getFormValue(formData, "visitDate1")],
      ["見学希望日 第2希望", getFormValue(formData, "visitDate2")],
      ["希望時間帯", getFormValue(formData, "timeSlot")],
      ["見学予定人数", getFormValue(formData, "people")],
      ["先住猫・先住犬", getFormValue(formData, "residentPets")],
      ["猫の飼育経験", getFormValue(formData, "experience")],
      ["ご質問・ご相談", getFormValue(formData, "message")]
    ];

    return [
      "Amor Alice 見学申し込み",
      "",
      ...rows.map(([label, value]) => `${label}: ${value || "未入力"}`),
      "",
      "送信前に、入力内容に間違いがないかご確認ください。"
    ].join("\n");
  };

  const formMode = new URLSearchParams(window.location.search).get("type");
  if (requestType && formMode === "birth") {
    requestType.value = "出産予約";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const name = getFormValue(formData, "name") || "お客様";
    const subject = `【HP問い合わせ】見学申し込み：${name} 様`;
    const body = buildMessage();
    const mailto = `mailto:cattery227.amor.alice@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setStatus("メールアプリが開きます。送信前に内容をご確認ください。");
    window.location.href = mailto;
  });

  copyButton?.addEventListener("click", async () => {
    if (!form.reportValidity()) return;

    const body = buildMessage();
    try {
      await navigator.clipboard.writeText(body);
      setStatus("入力内容をコピーしました。LINEやメールに貼り付けて送れます。");
    } catch (error) {
      setStatus("コピーできませんでした。メール作成ボタンをご利用ください。");
    }
  });
};

initVisitForm();

const initFrameHero = () => {
  const section = document.querySelector("[data-frame-hero]");
  if (!section) return;

  const canvas = section.querySelector("[data-frame-canvas]");
  const ctx = canvas.getContext("2d", { alpha: false });
  const heroText = section.querySelector("[data-hero-text]");
  const loader = section.querySelector("[data-frame-loader]");
  const loaderBar = section.querySelector("[data-frame-loader-bar]");
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
    const background = getCoverRect(imgRatio, { scale: 1.14, focalX: 0.5, focalY: 0.5 });
    const foregroundHeight = Math.min(canvasHeight * 0.58, canvasWidth * 1.22);
    const foregroundWidth = foregroundHeight * imgRatio;
    const foregroundX = clamp(canvasWidth * 0.5 - foregroundWidth * 0.5, canvasWidth - foregroundWidth, 0);
    const foregroundY = Math.min(Math.max(72, canvasHeight * 0.08), canvasHeight * 0.12);

    ctx.save();
    ctx.filter = "blur(36px) saturate(0.9) brightness(0.9)";
    ctx.drawImage(
      img,
      background.x - 72,
      background.y - 72,
      background.width + 144,
      background.height + 144
    );
    ctx.restore();

    ctx.fillStyle = "rgba(8, 12, 17, 0.16)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    const fade = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    fade.addColorStop(0, "rgba(8, 12, 17, 0.2)");
    fade.addColorStop(0.38, "rgba(8, 12, 17, 0)");
    fade.addColorStop(0.7, "rgba(8, 12, 17, 0.08)");
    fade.addColorStop(1, "rgba(8, 12, 17, 0.46)");
    ctx.fillStyle = fade;
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

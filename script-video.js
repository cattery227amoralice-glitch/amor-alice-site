const header = document.querySelector("[data-header]");
const videoHero = document.querySelector("[data-video-hero]");
const mobileContactBar = document.querySelector("[data-mobile-contact-bar]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

const syncHeader = () => {
  if (!header) return;
  const headerHeight = header.offsetHeight || 0;
  const heroBottom = videoHero?.getBoundingClientRect().bottom;
  const isPastHero = typeof heroBottom === "number"
    ? heroBottom <= headerHeight
    : window.scrollY > 12;
  header.classList.toggle("is-scrolled", isPastHero);

  if (mobileContactBar?.dataset.afterHero === "true" && typeof heroBottom === "number") {
    mobileContactBar.classList.toggle("is-visible", heroBottom <= headerHeight + 12);
  }
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });
window.addEventListener("resize", syncHeader, { passive: true });

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

const heroVideo = document.querySelector("[data-hero-video]");
const heroVideoBg = document.querySelector("[data-hero-video-bg]");
heroVideo?.addEventListener("loadeddata", () => {
  videoHero?.classList.add("is-video-ready");
  if (heroVideoBg) {
    heroVideoBg.currentTime = heroVideo.currentTime;
  }
});
heroVideo?.addEventListener("play", () => {
  if (!heroVideoBg) return;
  heroVideoBg.currentTime = heroVideo.currentTime;
  heroVideoBg.play?.().catch?.(() => {});
});
heroVideo?.addEventListener("pause", () => {
  heroVideoBg?.pause();
});
heroVideo?.addEventListener("ended", () => {
  heroVideo.pause();
  if (heroVideoBg) {
    heroVideoBg.pause();
    heroVideoBg.currentTime = heroVideo.duration || heroVideo.currentTime;
  }
  videoHero?.classList.add("is-video-ended");
});
const playPromise = heroVideo?.play?.();
playPromise?.catch?.(() => {
  videoHero?.classList.add("is-video-paused");
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
  const kittenCount = document.querySelector("[data-kitten-count]");

  if (kittenCount) {
    kittenCount.textContent = `現在の掲載：${visibleKittens.length}匹`;
  }

  if (kittenList) {
    kittenList.replaceChildren(...visibleKittens.map(createKittenCard));
  }
};

renderKittenLists();

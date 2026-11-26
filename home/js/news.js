// Loads home/content.json and renders the News section:
// a description and an auto-scrolling photo carousel.

// Appends text: [label](url) becomes a link, "\n" becomes a line break.
function appendRich(node, text = "") {
  const appendText = (str) => {
    str.split("\n").forEach((line, i) => {
      if (i > 0) node.append(document.createElement("br"));
      node.append(line);
    });
  };
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    appendText(text.slice(last, m.index));
    const a = document.createElement("a");
    a.href = m[2];
    a.textContent = m[1];
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    node.append(a);
    last = m.index + m[0].length;
  }
  appendText(text.slice(last));
}

const SECONDS_PER_PHOTO = 5;

// One shared dialog that shows a photo at full size.
let lightbox;

function getLightbox() {
  if (lightbox) return lightbox;

  lightbox = document.createElement("dialog");
  lightbox.className = "lightbox";
  lightbox.setAttribute("aria-label", "Photo viewer");

  const img = document.createElement("img");

  const close = document.createElement("button");
  close.className = "lightbox__close";
  close.type = "button";
  close.setAttribute("aria-label", "Close");
  close.textContent = "×";

  const caption = document.createElement("p");
  caption.className = "lightbox__caption";

  lightbox.append(close, img, caption);

  // Click anywhere closes the viewer
  lightbox.addEventListener("click", () => lightbox.close());

  // Drop focus on close so the carousel is not stuck in its paused state
  lightbox.addEventListener("close", () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  document.body.append(lightbox);
  return lightbox;
}

function openLightbox({ src, alt }) {
  const dialog = getLightbox();
  const img = dialog.querySelector("img");
  img.src = src;
  img.alt = alt ?? "";
  dialog.querySelector(".lightbox__caption").textContent = alt ?? "";
  dialog.showModal();
}

function renderCarousel(photos) {
  const carousel = document.createElement("div");
  carousel.className = "carousel";
  carousel.setAttribute("role", "region");
  carousel.setAttribute("aria-label", "News photos");

  const track = document.createElement("div");
  track.className = "carousel__track";
  track.style.setProperty(
    "--duration",
    `${photos.length * SECONDS_PER_PHOTO}s`,
  );

  // The set of photos is rendered twice so the loop is seamless.
  // The copy is hidden from assistive technologies.
  [false, true].forEach((isCopy) => {
    photos.forEach(({ src, alt }) => {
      const item = document.createElement("div");
      item.className = "carousel__item";
      if (isCopy) item.setAttribute("aria-hidden", "true");
      const img = document.createElement("img");
      img.src = src;
      img.alt = isCopy ? "" : (alt ?? "");
      item.tabIndex = isCopy ? -1 : 0;
      item.title = "Double-click to enlarge";
      item.addEventListener("dblclick", () => openLightbox({ src, alt }));
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter") openLightbox({ src, alt });
      });
      item.append(img);
      track.append(item);
    });
  });

  carousel.append(track);
  return carousel;
}

async function loadNews() {
  const container = document.querySelector("#news-content");
  try {
    const response = await fetch("home/content.json");
    if (!response.ok)
      throw new Error(`${response.status} ${response.statusText}`);
    const { news } = await response.json();

    const nodes = [];
    (news.description ?? []).forEach((text) => {
      const p = document.createElement("p");
      appendRich(p, text);
      nodes.push(p);
    });
    if (news.photos?.length) nodes.push(renderCarousel(news.photos));
    container.replaceChildren(...nodes);
  } catch (error) {
    console.error("Could not load news:", error);
    container.textContent = "News could not be loaded.";
  }
}

loadNews();

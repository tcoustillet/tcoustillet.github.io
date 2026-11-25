// Loads content.json and renders the CV sections as timelines.

// Appends text to a node, turning [label](url) into external links.
function appendRich(node, text = "") {
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    node.append(text.slice(last, m.index));
    const a = document.createElement("a");
    a.href = m[2];
    a.textContent = m[1];
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    node.append(a);
    last = m.index + m[0].length;
  }
  node.append(text.slice(last));
}

function renderDetails(details) {
  const ul = document.createElement("ul");
  ul.className = "cv-item__details";
  details.forEach((entry) => {
    const li = document.createElement("li");
    if (typeof entry === "string") {
      appendRich(li, entry);
    } else if (entry.fold && entry.children?.length) {
      appendRich(li, entry.text);

      const fold = document.createElement("details");
      fold.className = "cv-fold cv-fold--details";

      const summary = document.createElement("summary");
      summary.textContent = entry.foldLabel ?? "Show";

      fold.append(summary, renderDetails(entry.children));
      li.append(fold);
    } else {
      appendRich(li, entry.text);
      if (entry.children?.length) li.append(renderDetails(entry.children));
    }
    ul.append(li);
  });
  return ul;
}

function renderItem({
  title,
  place,
  period,
  badges = [],
  details = [],
  fold,
  foldLabel,
}) {
  const li = document.createElement("li");
  li.className = "cv-item";

  const head = document.createElement("div");
  head.className = "cv-item__head";

  const t = document.createElement("div");
  t.className = "cv-item__title";
  appendRich(t, title);
  head.append(t);

  if (period) {
    const p = document.createElement("span");
    p.className = "cv-item__period";
    p.textContent = period;
    head.append(p);
  }

  badges.forEach((badge) => head.append(renderBadge(badge)));
  li.append(head);

  if (place) {
    const where = document.createElement("div");
    where.className = "cv-item__place";
    appendRich(where, place);
    li.append(where);
  }

  if (details.length) {
    if (fold) {
      const wrapper = document.createElement("details");
      wrapper.className = "cv-fold cv-fold--details";

      const summary = document.createElement("summary");
      summary.textContent = foldLabel ?? "Show";

      wrapper.append(summary, renderDetails(details));
      li.append(wrapper);
    } else {
      li.append(renderDetails(details));
    }
  }
  return li;
}

function renderSection({ label, color, items }) {
  const section = document.createElement("section");
  section.className = "cv-group";
  section.style.setProperty("--section-color", color);

  const heading = document.createElement("h4");
  const text = document.createElement("span");
  text.textContent = label;
  heading.append(text);

  const hidden = items.filter((item) => item.hide);
  const nodes = [];
  let groupAdded = false;
  items.forEach((item) => {
    if (!item.hide) {
      nodes.push(renderItem(item));
    } else if (!groupAdded) {
      nodes.push(renderHiddenGroup(hidden));
      groupAdded = true;
    }
  });

  const list = document.createElement("ul");
  list.className = "cv-list";
  list.append(...nodes);

  section.append(heading, list);
  return section;
}

async function loadCv() {
  const container = document.querySelector("#cv-content");
  try {
    const response = await fetch("content.json");
    if (!response.ok)
      throw new Error(`${response.status} ${response.statusText}`);
    const sections = await response.json();
    container.replaceChildren(...sections.map(renderSection));
  } catch (error) {
    console.error("Could not load CV:", error);
    container.textContent = "CV could not be loaded.";
  }
  if (window.renderMathInElement) {
    renderMathInElement(container, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      throwOnError: false,
    });
  }
}

function renderBadge({ text, gold = false }) {
  const span = document.createElement("span");
  span.className = gold ? "cv-badge cv-badge--gold" : "cv-badge";
  span.textContent = text;
  return span;
}

// Wraps all hidden items in one collapsible "Projects" entry.
function renderHiddenGroup(items) {
  const li = document.createElement("li");
  li.className = "cv-item cv-item--group";

  const fold = document.createElement("details");
  fold.className = "cv-fold";

  const summary = document.createElement("summary");
  summary.className = "cv-item__title";
  summary.textContent = `Projects (${items.length})`;

  summary.textContent = `Projects (${items.length})`;

  const inner = document.createElement("ul");
  inner.className = "cv-list cv-list--nested";
  inner.append(...items.map(renderItem));

  fold.append(summary, inner);
  li.append(fold);
  return li;
}

loadCv();

// Loads content.json and renders each project as a card.

const ME = "Coustillet, T.";

function renderAuthors(authors) {
  const span = document.createElement("span");
  authors.forEach((name, i) => {
    const node = document.createElement(name === ME ? "strong" : "span");
    node.textContent = name;
    span.append(node);
    if (i < authors.length - 2) span.append(", ");
    else if (i === authors.length - 2) span.append(" & ");
  });
  return span;
}

// Appends text to a node: [label](url) becomes a link, "\n" becomes a line break.
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

// Same buttons as the publications page (classes come from its stylesheet).
function renderLinkButton(variant, label, url, title) {
  const a = document.createElement("a");
  a.className = `pub__btn pub__btn--${variant}`;
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.setAttribute("aria-label", `${label}: ${title}`);
  a.textContent = label;
  return a;
}

function renderCustomButton(
  { label, url, icon = "link", logo = false },
  title,
) {
  const a = document.createElement("a");
  a.className = "pub__btn pub__btn--custom";
  if (logo) a.classList.add("pub__btn--logo");
  a.style.setProperty("--btn-icon", `url("/assets/icons/${icon}.svg")`);
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.setAttribute("aria-label", `${label}: ${title}`);
  a.textContent = label;
  return a;
}

function renderGallery(images) {
  const list = document.createElement("div");
  list.className = "project__gallery";
  images.forEach(({ src, alt, caption }) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt ?? "";
    img.loading = "lazy";
    figure.append(img);
    if (caption) {
      const cap = document.createElement("figcaption");
      appendRich(cap, caption);
      figure.append(cap);
    }
    list.append(figure);
  });
  return list;
}

function renderProject(project) {
  const card = document.createElement("article");
  card.className = "project";
  // --type-color is what the shared button styles read
  card.style.setProperty(
    "--type-color",
    project.color ?? "var(--color-accent)",
  );

  const title = document.createElement("h4");
  title.className = "project__title";
  title.textContent = project.title;
  card.append(title);

  const hasAuthors = project.authors?.length;
  if (hasAuthors || project.date) {
    const m = document.createElement("div");
    m.className = "project__meta";
    if (hasAuthors) m.append(renderAuthors(project.authors));
    if (hasAuthors && project.date) m.append(", ");
    if (project.date) m.append(project.date);
    card.append(m);
  }

  (project.description ?? []).forEach((text) => {
    const p = document.createElement("p");
    p.className = "project__text";
    appendRich(p, text);
    card.append(p);
  });

  const buttons = document.createElement("div");
  buttons.className = "pub__links";
  (project.buttons ?? []).forEach((b) => {
    buttons.append(
      b.type === "github"
        ? renderLinkButton("github", b.label ?? "GitHub", b.url, project.title)
        : renderCustomButton(b, project.title),
    );
  });
  if (buttons.children.length) card.append(buttons);

  if (project.images?.length) {
    const fold = document.createElement("details");
    fold.className = "project__fold";
    const summary = document.createElement("summary");
    summary.textContent = project.overviewLabel ?? "Overview";
    fold.append(summary, renderGallery(project.images));
    card.append(fold);
  }

  return card;
}

async function loadProjects() {
  const container = document.querySelector("#projects-list");
  try {
    const response = await fetch("content.json");
    if (!response.ok)
      throw new Error(`${response.status} ${response.statusText}`);
    const projects = await response.json();
    container.replaceChildren(...projects.map(renderProject));
  } catch (error) {
    console.error("Could not load projects:", error);
    container.textContent = "Projects could not be loaded.";
  }
}

loadProjects();

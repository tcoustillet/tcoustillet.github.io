// Loads content.json and renders it grouped by type.

const TYPES = [
  {
    id: "peer-reviewed",
    label: "Peer-reviewed articles",
    color: "var(--tab-green)",
  },
  {
    id: "article",
    label: "Articles",
    color: "var(--tab-olive)",
  },
  { id: "patent", label: "Patents", color: "var(--tab-orange)" },
  { id: "software", label: "Software and packages", color: "var(--tab-blue)" },
  {
    id: "post",
    label: "Posts",
    color: "var(--tab-purple)",
  },
  {
    id: "poster",
    label: "Posters",
    color: "var(--tab-pink)",
  },
];

// Your name as written in the data: it is highlighted in author lists.
const ME = "Coustillet, T.";

function externalLink(label, url) {
  const a = document.createElement("a");
  a.href = url;
  a.textContent = label;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
}

function renderAuthors(authors) {
  const span = document.createElement("span");
  span.className = "pub__authors";
  authors.forEach((name, i) => {
    const node = document.createElement(name === ME ? "strong" : "span");
    node.textContent = name;
    span.append(node);
    if (i < authors.length - 2) span.append(", ");
    else if (i === authors.length - 2) span.append(" & ");
  });
  return span;
}

function renderPublication(pub) {
  const li = document.createElement("li");
  li.className = "pub";

  const title = document.createElement("div");
  title.className = "pub__title";
  title.textContent = pub.title;

  const meta = document.createElement("div");
  meta.className = "pub__meta";
  meta.append(
    renderAuthors(pub.authors),
    document.createElement("br"),
    renderCitation(pub),
  );

  li.append(title, meta);

  const buttons = document.createElement("div");
  buttons.className = "pub__links";
  if (pub.pdf) {
    buttons.append(renderPdfButton(pub.pdf, pub.title, pub.pdfLabel));
  }
  if (pub.pmid) buttons.append(renderPubmedButton(pub.pmid, pub.title));
  if (pub.doi) buttons.append(renderPublisherButton(pub));
  if (pub.github) {
    buttons.append(renderLinkButton("github", "GitHub", pub.github, pub.title));
  }
  if (pub.pypi) {
    const pypi = renderLinkButton(
      "pypi",
      "PyPI",
      `https://pypi.org/project/${pub.pypi}/`,
      pub.title,
    );
    pypi.classList.add("pub__btn--logo");
    buttons.append(pypi);
  }
  (pub.buttons ?? []).forEach((btn) => {
    buttons.append(renderCustomButton(btn, pub.title));
  });
  if (buttons.children.length) li.append(buttons);

  return li;
}

function renderCitation(pub) {
  const cite = document.createElement("span");
  cite.className = "pub__cite";

  const venue = document.createElement("em");
  venue.textContent = pub.venue ?? "";
  if (pub.venue) cite.append(venue);

  if (pub.volume) {
    const volume = document.createElement("strong");
    volume.className = "pub__volume";
    volume.textContent = pub.volume;
    cite.append(" ", volume);
  }
  if (pub.pages) cite.append(`, ${pub.pages.replace("-", "–")}`);
  if (pub.id) cite.append(`, ${pub.id}`);
  if (pub.year) {
    cite.append(
      pub.type === "peer-reviewed" ? ` (${pub.year})` : `, ${pub.year}`,
    );
  }
  return cite;
}

function renderGroup({ id, label, color }, publications) {
  const items = publications
    .filter((pub) => pub.type === id)
    .sort((a, b) => b.year - a.year);
  if (items.length === 0) return null;

  const group = document.createElement("section");
  group.className = "pub-group";
  group.style.setProperty("--type-color", color);

  const heading = document.createElement("h4");
  heading.textContent = label;

  const list = document.createElement("ul");
  list.className = "pub-list";
  list.append(...items.map(renderPublication));

  group.append(heading, list);
  return group;
}

async function loadPublications() {
  const container = document.querySelector("#publications-list");
  try {
    const response = await fetch("content.json");
    if (!response.ok)
      throw new Error(`${response.status} ${response.statusText}`);
    const publications = await response.json();
    container.replaceChildren(
      ...TYPES.map((type) => renderGroup(type, publications)).filter(Boolean),
    );
  } catch (error) {
    console.error("Could not load publications:", error);
    container.textContent = "Publications could not be loaded.";
  }
}

function renderPdfButton(url, title, label = "PDF") {
  const a = document.createElement("a");
  a.className = "pub__btn pub__btn--pdf";
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.setAttribute("aria-label", `${label}: ${title}`);
  a.textContent = label;
  return a;
}

function renderPubmedButton(pmid, title) {
  const a = document.createElement("a");
  a.className = "pub__btn pub__btn--pubmed";
  a.href = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.setAttribute("aria-label", `PubMed: ${title}`);
  a.textContent = "PubMed";
  return a;
}

function renderPublisherButton(pub) {
  const a = document.createElement("a");
  a.className = "pub__btn pub__btn--publisher";
  a.href = `https://doi.org/${pub.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, "")}`;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.setAttribute(
    "aria-label",
    `${pub.venue || "Publisher"} page: ${pub.title}`,
  );
  a.textContent = pub.venue || "Publisher";
  if (pub.publisher) {
    a.style.setProperty(
      "--btn-icon",
      `url("/assets/icons/${pub.publisher}.svg")`,
    );
    a.classList.add("pub__btn--logo", `pub__btn--${pub.publisher}`);
  }
  return a;
}

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

function renderCustomButton({ label, url, icon = "link" }, title) {
  const a = document.createElement("a");
  a.className = "pub__btn pub__btn--logo pub__btn--custom";
  a.style.setProperty("--btn-icon", `url("/assets/icons/${icon}.svg")`);
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.setAttribute("aria-label", `${label}: ${title}`);
  a.textContent = label;
  return a;
}

loadPublications();

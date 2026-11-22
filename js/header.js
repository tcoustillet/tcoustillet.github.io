// Renders the header navigation and marks the current page.

const NAV = [
  { label: "Home", href: "/" },
  { label: "Publications & Communications", href: "/publications/" },
  { label: "Projects", href: "/projects/" },
  { label: "CV", href: "/cv/" },
];

function isCurrent(href) {
  const path = location.pathname.replace(/index\.html$/, "");
  return href === "/" ? path === "/" : path.startsWith(href);
}

function renderHeader() {
  const items = NAV.map(({ label, href }) => {
    const current = isCurrent(href) ? ' aria-current="page"' : "";
    return `<li><a href="${href}"${current}>${label}</a></li>`;
  }).join("");

  return `
    <div class="layout site-header__inner">
      <nav aria-label="Main">
        <ul class="nav">${items}</ul>
      </nav>
    </div>`;
}

document.querySelector(".site-header").innerHTML = renderHeader();

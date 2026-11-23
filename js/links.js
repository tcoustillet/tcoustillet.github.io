// Opens external links in a new tab and hardens them.
// A link is external when its origin differs from the current site.

document.querySelectorAll("main a[href]").forEach((link) => {
  if (link.origin !== location.origin) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
});

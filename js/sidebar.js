// Renders the sidebar: name, photo, role and social links.

const SIDEBAR = {
  name: "Thibaut Coustillet",
  role: "Bioinformatics Engineer",
  photo: "/assets/img/profile.png",
  social: [
    {
      cls: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/thibautcoustillet/",
    },
    {
      cls: "github",
      label: "GitHub",
      href: "https://github.com/tcoustillet",
    },
    {
      cls: "orcid",
      label: 'ORC<span class="orcid-id">ID</span>',
      href: "https://orcid.org/0000-0002-7945-0519",
    },
  ],
};

function renderSidebar({ name, role, photo, social }) {
  const links = social
    .map(
      ({ cls, label, href }) => `
    <li>
      <a class="social__${cls}" href="${href}" target="_blank" rel="me noopener noreferrer">
        <span class="social__label">${label}</span>
      </a>
    </li>`,
    )
    .join("");

  return `
    <a class="sidebar__name" href="/">${name}</a>
    <img class="sidebar__photo" src="${photo}"
         alt="Portrait of ${name}" width="224" height="224">
    <p class="sidebar__role">${role}</p>
    <ul class="social">${links}</ul>`;
}

document.querySelector(".sidebar").innerHTML = renderSidebar(SIDEBAR);

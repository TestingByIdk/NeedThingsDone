const profiles = [
  {
    id: "alex-portelance",
    name: "Alex Portelance",
    location: "Ottawa, Ontario",
    headline: "Computer repair, technical support, and website help.",
    services: ["Computer Repair", "Tech Support", "Website Help"],
    tags: ["Friendly", "Problem Solver", "Reliable"],
    availability: ["Weekdays", "Evenings", "Weekends", "Flexible"],
    price: 25,
    priceLabel: "$25 per hour",
    messaging: true,
    document: true,
    website: true,
    created: 6
  },
  {
    id: "mia-tremblay",
    name: "Mia Tremblay",
    location: "Ottawa, Ontario",
    headline: "Patient tutoring and French-language support.",
    services: ["Tutoring"],
    tags: ["Patient", "Friendly", "Professional"],
    availability: ["Evenings", "Weekends"],
    price: 30,
    priceLabel: "$30 per hour",
    messaging: true,
    document: false,
    website: false,
    created: 5
  },
  {
    id: "jordan-lee",
    name: "Jordan Lee",
    location: "Nepean, Ontario",
    headline: "Reliable dog walking and pet-care support.",
    services: ["Dog Walking"],
    tags: ["Reliable", "Friendly", "Patient"],
    availability: ["Weekdays", "Weekends", "Flexible"],
    price: 20,
    priceLabel: "$20 per visit",
    messaging: true,
    document: false,
    website: true,
    created: 4
  },
  {
    id: "samira-khan",
    name: "Samira Khan",
    location: "Orléans, Ontario",
    headline: "Home organization and careful residential cleaning.",
    services: ["Cleaning"],
    tags: ["Professional", "Reliable"],
    availability: ["Weekdays"],
    price: 45,
    priceLabel: "$45 per hour",
    messaging: false,
    document: true,
    website: true,
    created: 3
  },
  {
    id: "noah-bouchard",
    name: "Noah Bouchard",
    location: "Gatineau, Quebec",
    headline: "Friendly website help for small projects and portfolios.",
    services: ["Website Help", "Tech Support"],
    tags: ["Friendly", "Professional", "Problem Solver"],
    availability: ["Evenings", "Flexible"],
    price: 60,
    priceLabel: "$60 per hour",
    messaging: true,
    document: true,
    website: true,
    created: 2
  },
  {
    id: "emma-wilson",
    name: "Emma Wilson",
    location: "Kanata, Ontario",
    headline: "Flexible tutoring for younger students.",
    services: ["Tutoring"],
    tags: ["Patient", "Reliable", "Friendly"],
    availability: ["Weekends", "Flexible"],
    price: 22,
    priceLabel: "$22 per hour",
    messaging: true,
    document: false,
    website: false,
    created: 1
  }
];

const $ = id => document.getElementById(id);

const el = {
  query: $("queryInput"),
  location: $("locationInput"),
  search: $("searchButton"),
  toggle: $("filterToggle"),
  close: $("closeFilters"),
  sidebar: $("filterSidebar"),
  overlay: $("filterOverlay"),
  layout: $("searchLayout"),
  clear: $("clearFilters"),
  sort: $("sortSelect"),
  count: $("resultsCount"),
  active: $("activeFilters"),
  grid: $("resultsGrid"),
  empty: $("emptyState"),
  resetEmpty: $("resetEmpty"),
  messaging: $("messagingFilter"),
  document: $("documentFilter"),
  website: $("websiteFilter")
};

bindEvents();
render();

function bindEvents() {
  el.search.addEventListener("click", render);
  el.query.addEventListener("keydown", e => e.key === "Enter" && render());
  el.location.addEventListener("keydown", e => e.key === "Enter" && render());
  el.toggle.addEventListener("click", toggleFilters);
  el.close.addEventListener("click", closeMobileFilters);
  el.overlay.addEventListener("click", closeMobileFilters);
  el.clear.addEventListener("click", clearFilters);
  el.resetEmpty.addEventListener("click", clearFilters);
  el.sort.addEventListener("change", render);

  document.querySelectorAll('.filter-sidebar input').forEach(input => {
    input.addEventListener("change", render);
  });

document
  .querySelectorAll(".filter-section-toggle")
  .forEach(button => {
    button.addEventListener("click", () => {
      const section = button.closest(".filter-section");
      const content = section.querySelector(".filter-options");

      const isOpen =
        button.getAttribute("aria-expanded") === "true";

      button.setAttribute(
        "aria-expanded",
        String(!isOpen)
      );

      content.classList.toggle(
        "filter-options-closed",
        isOpen
      );

      button.lastElementChild.textContent =
        isOpen ? "⌄" : "⌃";
    });
  });
}

function toggleFilters() {
  if (window.innerWidth <= 900) {
    const open = el.sidebar.classList.toggle("open");
    el.overlay.classList.toggle("active", open);
    document.body.classList.toggle("filters-open", open);
    el.toggle.setAttribute("aria-expanded", String(open));
    return;
  }

  const collapsed = el.layout.classList.toggle("collapsed");
  el.toggle.setAttribute("aria-expanded", String(!collapsed));
}

function closeMobileFilters() {
  el.sidebar.classList.remove("open");
  el.overlay.classList.remove("active");
  document.body.classList.remove("filters-open");
  el.toggle.setAttribute("aria-expanded", "false");
}

function render() {
  let results = profiles.filter(profile =>
    matchesText(profile) &&
    matchesLocation(profile) &&
    matchesSelected(profile, "service", "services", false) &&
    matchesSelected(profile, "availability", "availability", false) &&
    matchesPrice(profile) &&
    matchesFeatures(profile) &&
    matchesSelected(profile, "tag", "tags", true)
  );

  results = sortResults(results);
  el.grid.innerHTML = "";

  results.forEach(profile => el.grid.appendChild(createCard(profile)));

  el.empty.hidden = results.length > 0;
  el.grid.hidden = results.length === 0;
  el.count.textContent = `${results.length} individual profile${results.length === 1 ? "" : "s"} found`;
  renderActiveFilters();

  if (window.innerWidth <= 900) closeMobileFilters();
}

function matchesText(profile) {
  const q = el.query.value.trim().toLowerCase();
  if (!q) return true;

  return [
    profile.name,
    profile.headline,
    ...profile.services,
    ...profile.tags
  ].join(" ").toLowerCase().includes(q);
}

function matchesLocation(profile) {
  const q = el.location.value.trim().toLowerCase();
  return !q || profile.location.toLowerCase().includes(q);
}

function selectedValues(type) {
  return [...document.querySelectorAll(`[data-filter="${type}"]:checked`)]
    .map(input => input.value);
}

function matchesSelected(profile, filter, property, requireAll) {
  const chosen = selectedValues(filter);
  if (!chosen.length) return true;

  return requireAll
    ? chosen.every(value => profile[property].includes(value))
    : chosen.some(value => profile[property].includes(value));
}

function matchesPrice(profile) {
  const value = document.querySelector('input[name="price"]:checked')?.value || "all";
  if (value === "under-25") return profile.price < 25;
  if (value === "25-50") return profile.price >= 25 && profile.price <= 50;
  if (value === "50-plus") return profile.price > 50;
  return true;
}

function matchesFeatures(profile) {
  return (!el.messaging.checked || profile.messaging) &&
    (!el.document.checked || profile.document) &&
    (!el.website.checked || profile.website);
}

function sortResults(list) {
  const sorted = [...list];

  switch (el.sort.value) {
    case "price-low": return sorted.sort((a, b) => a.price - b.price);
    case "price-high": return sorted.sort((a, b) => b.price - a.price);
    case "newest": return sorted.sort((a, b) => b.created - a.created);
    case "name": return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default: return sorted;
  }
}

function createCard(profile) {
  const card = document.createElement("article");
  card.className = "result-card";

  card.innerHTML = `
    <div class="result-avatar">👤</div>

    <div class="result-main">
      <div class="result-heading">
        <div>
          <p class="result-type">Individual</p>
          <h2>${escapeHTML(profile.name)}</h2>
        </div>
        <span class="new-pill">New</span>
      </div>

      <p class="result-location">📍 ${escapeHTML(profile.location)}</p>
      <p class="result-headline">${escapeHTML(profile.headline)}</p>

      <div class="service-tags">
        ${profile.services.map(service => `<span>${escapeHTML(service)}</span>`).join("")}
      </div>

      <div class="personality-tags">
        ${profile.tags.slice(0, 4).map(tag => `<span>${escapeHTML(tag)}</span>`).join("")}
      </div>

      <div class="profile-features">
        ${profile.messaging ? "<span>💬 Messaging available</span>" : ""}
        ${profile.document ? "<span>📄 Resume or flyer</span>" : ""}
        ${profile.website ? "<span>🌐 Website</span>" : ""}
      </div>
    </div>

    <div class="result-side">
      <div class="result-price">
        <small>Starting at</small>
        <strong>${escapeHTML(profile.priceLabel)}</strong>
      </div>

      <a class="primary-btn" href="public-profile.html?profile=${encodeURIComponent(profile.id)}">
        View Profile
      </a>
    </div>
  `;

  return card;
}

function renderActiveFilters() {
  const chips = [];

  if (el.query.value.trim()) {
    chips.push({ label: `Search: ${el.query.value.trim()}`, clear: () => el.query.value = "" });
  }

  if (el.location.value.trim()) {
    chips.push({ label: `Location: ${el.location.value.trim()}`, clear: () => el.location.value = "" });
  }

  document.querySelectorAll('.filter-sidebar input[type="checkbox"]:checked').forEach(input => {
    chips.push({
      label: input.parentElement.textContent.trim(),
      clear: () => input.checked = false
    });
  });

  const price = document.querySelector('input[name="price"]:checked');
  if (price && price.value !== "all") {
    chips.push({
      label: price.parentElement.textContent.trim(),
      clear: () => document.querySelector('input[name="price"][value="all"]').checked = true
    });
  }

  el.active.innerHTML = "";

  chips.forEach(chip => {
    const button = document.createElement("button");
    button.className = "filter-chip";
    button.type = "button";
    button.innerHTML = `<span>${escapeHTML(chip.label)}</span><strong>×</strong>`;
    button.addEventListener("click", () => {
      chip.clear();
      render();
    });
    el.active.appendChild(button);
  });
}

function clearFilters() {
  el.query.value = "";
  el.location.value = "";
  document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(input => input.checked = false);
  document.querySelector('input[name="price"][value="all"]').checked = true;
  el.sort.value = "relevance";
  render();
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

const defaultSavedProfiles = [
  {
    id: "alex-portelance",
    type: "individual",
    icon: "👤",
    name: "Alex Portelance",
    location: "Ottawa, Ontario",
    headline: "Computer repair, technical support, and website help.",
    services: ["Computer Repair", "Tech Support", "Website Help"],
    tags: ["Friendly", "Reliable", "Problem Solver"],
    price: "Contact for price",
    messaging: true,
    website: true,
    savedAt: 6,
    viewedAt: 8,
    note: "Good fit for laptop troubleshooting and website help."
  },
  {
    id: "maple-corner-shop",
    type: "shop",
    icon: "🛍️",
    name: "Maple Corner Shop",
    location: "Orléans, Ontario",
    headline: "Local crafts, custom gifts, and personalized orders.",
    services: ["Arts & Crafts", "Custom Gifts"],
    tags: ["Local Shop", "Custom Orders"],
    price: "View shop",
    messaging: true,
    website: true,
    savedAt: 5,
    viewedAt: 7,
    note: ""
  },
  {
    id: "ottawa-home-repair",
    type: "business",
    icon: "🏢",
    name: "Ottawa Home Repair",
    location: "Ottawa, Ontario",
    headline: "Residential repairs, maintenance, and seasonal work.",
    services: ["Home Repair", "Maintenance"],
    tags: ["Professional", "Established"],
    price: "Request a quote",
    messaging: false,
    website: true,
    savedAt: 4,
    viewedAt: 6,
    note: "Ask about availability for the spring."
  },
  {
    id: "jordan-lee",
    type: "individual",
    icon: "👤",
    name: "Jordan Lee",
    location: "Nepean, Ontario",
    headline: "Reliable dog walking and pet-care support.",
    services: ["Dog Walking", "Pet Care"],
    tags: ["Friendly", "Reliable", "Patient"],
    price: "$20 per visit",
    messaging: true,
    website: true,
    savedAt: 3,
    viewedAt: 5,
    note: ""
  }
];

const defaultRecentProfiles = [
  ...defaultSavedProfiles,
  {
    id: "mia-tremblay",
    type: "individual",
    icon: "👤",
    name: "Mia Tremblay",
    location: "Ottawa, Ontario",
    headline: "Patient tutoring and French-language support.",
    services: ["Tutoring", "Language Help"],
    tags: ["Patient", "Friendly", "Professional"],
    price: "$30 per hour",
    messaging: true,
    website: false,
    savedAt: 0,
    viewedAt: 4,
    note: ""
  },
  {
    id: "northstar-services",
    type: "large-business",
    icon: "📍",
    name: "Northstar Services",
    location: "Eastern Ontario",
    headline: "Multi-location home and property services.",
    services: ["Property Care", "Seasonal Services"],
    tags: ["Multi-Location", "Established"],
    price: "Request a quote",
    messaging: false,
    website: true,
    savedAt: 0,
    viewedAt: 3,
    note: ""
  }
];

const $ = id => document.getElementById(id);

const el = {
  tabs: document.querySelectorAll(".saved-tab"),
  clearRecent: $("clearRecentButton"),
  search: $("savedSearchInput"),
  typeFilter: $("typeFilter"),
  locationFilter: $("locationFilter"),
  sort: $("sortSaved"),
  grid: $("savedProfilesGrid"),
  empty: $("savedEmptyState"),
  emptyTitle: $("savedEmptyTitle"),
  emptyText: $("savedEmptyText"),
  resultsEyebrow: $("resultsEyebrow"),
  visibleCount: $("visibleSavedCount"),
  savedCountSummary: $("savedCountSummary"),
  recentCountSummary: $("recentCountSummary"),
  notesCountSummary: $("notesCountSummary"),
  locationCountSummary: $("locationCountSummary"),
  noteModal: $("noteModal"),
  noteProfileName: $("noteProfileName"),
  noteInput: $("noteInput"),
  noteCharacterCount: $("noteCharacterCount"),
  saveNote: $("saveNoteButton"),
  deleteNote: $("deleteNoteButton"),
  toast: $("savedToast")
};

let savedProfiles = loadSavedProfiles();
let recentProfiles = loadRecentProfiles();
let activeTab = "saved";
let activeNoteProfileId = null;

initialize();

function initialize() {
  bindEvents();
  populateLocationFilter();
  renderEverything();
}

function bindEvents() {
  el.tabs.forEach(button => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab;

      el.tabs.forEach(tab => {
        tab.classList.toggle("active", tab === button);
      });

      el.clearRecent.hidden = activeTab !== "recent";

      el.resultsEyebrow.textContent =
        activeTab === "saved"
          ? "Your shortlist"
          : "Browsing history";

      el.sort.querySelector('option[value="newest"]').textContent =
        activeTab === "saved"
          ? "Newest saved"
          : "Most recently viewed";

      populateLocationFilter();
      renderProfiles();
    });
  });

  [el.search, el.typeFilter, el.locationFilter, el.sort].forEach(control => {
    control.addEventListener(
      control === el.search ? "input" : "change",
      renderProfiles
    );
  });

  el.clearRecent.addEventListener("click", () => {
    recentProfiles = [];
    saveRecentProfiles();
    populateLocationFilter();
    renderEverything();
    showToast("Recently viewed profiles cleared.");
  });

  document.querySelectorAll("[data-close-note]").forEach(button => {
    button.addEventListener("click", closeNoteModal);
  });

  el.noteInput.addEventListener("input", () => {
    el.noteCharacterCount.textContent =
      `${el.noteInput.value.length}/500`;
  });

  el.saveNote.addEventListener("click", saveActiveNote);
  el.deleteNote.addEventListener("click", deleteActiveNote);
}

function renderEverything() {
  renderProfiles();
  renderSummaries();
}

function getActiveProfiles() {
  return activeTab === "saved"
    ? savedProfiles
    : recentProfiles;
}

function renderProfiles() {
  let profiles = getActiveProfiles().filter(profile => {
    const query = el.search.value.trim().toLowerCase();

    const searchText = [
      profile.name,
      profile.location,
      profile.headline,
      ...profile.services,
      ...profile.tags,
      profile.note || ""
    ]
      .join(" ")
      .toLowerCase();

    const searchMatch =
      !query || searchText.includes(query);

    const typeMatch =
      el.typeFilter.value === "all" ||
      profile.type === el.typeFilter.value;

    const locationMatch =
      el.locationFilter.value === "all" ||
      profile.location === el.locationFilter.value;

    return searchMatch && typeMatch && locationMatch;
  });

  profiles = sortProfiles(profiles);

  el.grid.innerHTML = "";

  profiles.forEach(profile => {
    el.grid.appendChild(createProfileCard(profile));
  });

  el.visibleCount.textContent =
    `${profiles.length} profile${profiles.length === 1 ? "" : "s"}`;

  el.empty.hidden = profiles.length > 0;
  el.grid.hidden = profiles.length === 0;

  if (activeTab === "saved") {
    el.emptyTitle.textContent = "No saved profiles yet";
    el.emptyText.textContent =
      "Save a profile while browsing and it will appear here.";
  } else {
    el.emptyTitle.textContent = "No recently viewed profiles";
    el.emptyText.textContent =
      "Profiles you open while browsing will appear here.";
  }

  renderSummaries();
}

function sortProfiles(profiles) {
  const sorted = [...profiles];

  if (el.sort.value === "name") {
    return sorted.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  if (el.sort.value === "location") {
    return sorted.sort((a, b) =>
      a.location.localeCompare(b.location)
    );
  }

  if (el.sort.value === "type") {
    return sorted.sort((a, b) =>
      getTypeLabel(a.type).localeCompare(
        getTypeLabel(b.type)
      )
    );
  }

  const property =
    activeTab === "saved"
      ? "savedAt"
      : "viewedAt";

  return sorted.sort((a, b) =>
    b[property] - a[property]
  );
}

function createProfileCard(profile) {
  const article = document.createElement("article");

  article.className = "saved-profile-card";

  const isSaved = savedProfiles.some(item =>
    item.id === profile.id
  );

  article.innerHTML = `
    <div class="saved-profile-card-top">
      <div class="saved-profile-avatar">
        ${profile.icon}
      </div>

      <div class="saved-profile-identity">
        <div>
          <span class="saved-profile-type">
            ${escapeHTML(getTypeLabel(profile.type))}
          </span>

          ${
            activeTab === "recent"
              ? '<span class="recently-viewed-pill">Recently viewed</span>'
              : ""
          }
        </div>

        <h3>${escapeHTML(profile.name)}</h3>

        <p>📍 ${escapeHTML(profile.location)}</p>
      </div>

      <button
        class="save-toggle-button ${isSaved ? "saved" : ""}"
        type="button"
        aria-label="${isSaved ? "Remove from saved" : "Save profile"}"
      >
        ${isSaved ? "🔖" : "☆"}
      </button>
    </div>

    <p class="saved-profile-headline">
      ${escapeHTML(profile.headline)}
    </p>

    <div class="saved-profile-services">
      ${profile.services
        .slice(0, 3)
        .map(service =>
          `<span>${escapeHTML(service)}</span>`
        )
        .join("")}
    </div>

    <div class="saved-profile-tags">
      ${profile.tags
        .slice(0, 4)
        .map(tag =>
          `<span>${escapeHTML(tag)}</span>`
        )
        .join("")}
    </div>

    ${
      profile.note
        ? `
          <div class="saved-private-note">
            <strong>📝 Private note</strong>
            <p>${escapeHTML(profile.note)}</p>
          </div>
        `
        : ""
    }

    <div class="saved-profile-details">
      <span>${escapeHTML(profile.price)}</span>

      ${
        profile.messaging
          ? "<span>💬 Messaging</span>"
          : ""
      }

      ${
        profile.website
          ? "<span>🌐 Website</span>"
          : ""
      }
    </div>

    <footer class="saved-profile-actions">
      <a
        class="primary-btn"
        href="public-profile.html?profile=${encodeURIComponent(profile.id)}"
      >
        View Profile
      </a>

      <button
        class="secondary-btn note-button"
        type="button"
      >
        ${profile.note ? "Edit Note" : "Add Note"}
      </button>

      ${
        activeTab === "recent"
          ? `
            <button
              class="secondary-btn remove-recent-button"
              type="button"
            >
              Remove
            </button>
          `
          : ""
      }
    </footer>
  `;

  article
    .querySelector(".save-toggle-button")
    .addEventListener("click", () => {
      toggleSavedProfile(profile);
    });

  article
    .querySelector(".note-button")
    .addEventListener("click", () => {
      openNoteModal(profile.id);
    });

  const removeRecentButton =
    article.querySelector(".remove-recent-button");

  if (removeRecentButton) {
    removeRecentButton.addEventListener("click", () => {
      recentProfiles = recentProfiles.filter(item =>
        item.id !== profile.id
      );

      saveRecentProfiles();
      populateLocationFilter();
      renderEverything();
      showToast("Removed from recently viewed.");
    });
  }

  return article;
}

function toggleSavedProfile(profile) {
  const existingIndex =
    savedProfiles.findIndex(item =>
      item.id === profile.id
    );

  if (existingIndex >= 0) {
    savedProfiles.splice(existingIndex, 1);
    showToast("Removed from saved profiles.");
  } else {
    savedProfiles.unshift({
      ...profile,
      savedAt: getNextSavedOrder()
    });

    showToast("Profile saved.");
  }

  saveSavedProfiles();
  populateLocationFilter();
  renderEverything();
}

function openNoteModal(profileId) {
  const profile = findProfile(profileId);

  if (!profile) {
    return;
  }

  activeNoteProfileId = profileId;

  el.noteProfileName.textContent =
    profile.name;

  el.noteInput.value =
    profile.note || "";

  el.noteCharacterCount.textContent =
    `${el.noteInput.value.length}/500`;

  el.deleteNote.hidden =
    !profile.note;

  el.noteModal.hidden = false;
  document.body.classList.add("note-modal-open");

  el.noteInput.focus();
}

function closeNoteModal() {
  el.noteModal.hidden = true;
  document.body.classList.remove("note-modal-open");
  activeNoteProfileId = null;
}

function saveActiveNote() {
  const profile = findProfile(activeNoteProfileId);

  if (!profile) {
    return;
  }

  const note =
    el.noteInput.value.trim();

  updateNoteAcrossLists(profile.id, note);

  saveSavedProfiles();
  saveRecentProfiles();
  closeNoteModal();
  renderEverything();

  showToast(
    note
      ? "Private note saved."
      : "Private note cleared."
  );
}

function deleteActiveNote() {
  if (!activeNoteProfileId) {
    return;
  }

  updateNoteAcrossLists(activeNoteProfileId, "");

  saveSavedProfiles();
  saveRecentProfiles();
  closeNoteModal();
  renderEverything();

  showToast("Private note deleted.");
}

function updateNoteAcrossLists(profileId, note) {
  [savedProfiles, recentProfiles].forEach(list => {
    const profile = list.find(item =>
      item.id === profileId
    );

    if (profile) {
      profile.note = note;
    }
  });
}

function findProfile(profileId) {
  return (
    savedProfiles.find(profile =>
      profile.id === profileId
    ) ||
    recentProfiles.find(profile =>
      profile.id === profileId
    )
  );
}

function populateLocationFilter() {
  const currentValue =
    el.locationFilter.value;

  const locations =
    [...new Set(
      getActiveProfiles().map(profile =>
        profile.location
      )
    )]
      .sort((a, b) =>
        a.localeCompare(b)
      );

  el.locationFilter.innerHTML =
    '<option value="all">All locations</option>';

  locations.forEach(location => {
    const option =
      document.createElement("option");

    option.value = location;
    option.textContent = location;

    el.locationFilter.appendChild(option);
  });

  el.locationFilter.value =
    locations.includes(currentValue)
      ? currentValue
      : "all";
}

function renderSummaries() {
  el.savedCountSummary.textContent =
    savedProfiles.length;

  el.recentCountSummary.textContent =
    recentProfiles.length;

  const noteProfileIds =
    new Set();

  [...savedProfiles, ...recentProfiles].forEach(profile => {
    if (profile.note) {
      noteProfileIds.add(profile.id);
    }
  });

  el.notesCountSummary.textContent =
    noteProfileIds.size;

  const locations =
    new Set(
      [...savedProfiles, ...recentProfiles]
        .map(profile => profile.location)
    );

  el.locationCountSummary.textContent =
    locations.size;
}

function getTypeLabel(type) {
  const labels = {
    individual: "Individual",
    shop: "Shop",
    business: "Business",
    "large-business": "Multi-Location"
  };

  return labels[type] || "Profile";
}

function getNextSavedOrder() {
  return savedProfiles.reduce(
    (highest, profile) =>
      Math.max(highest, profile.savedAt || 0),
    0
  ) + 1;
}

function loadSavedProfiles() {
  try {
    const stored =
      JSON.parse(
        localStorage.getItem("ntdSavedProfiles")
      );

    return Array.isArray(stored)
      ? stored
      : structuredClone(defaultSavedProfiles);
  } catch {
    return structuredClone(defaultSavedProfiles);
  }
}

function loadRecentProfiles() {
  try {
    const stored =
      JSON.parse(
        localStorage.getItem("ntdRecentlyViewed")
      );

    return Array.isArray(stored)
      ? stored
      : structuredClone(defaultRecentProfiles);
  } catch {
    return structuredClone(defaultRecentProfiles);
  }
}

function saveSavedProfiles() {
  localStorage.setItem(
    "ntdSavedProfiles",
    JSON.stringify(savedProfiles)
  );
}

function saveRecentProfiles() {
  localStorage.setItem(
    "ntdRecentlyViewed",
    JSON.stringify(recentProfiles)
  );
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("visible");

  clearTimeout(showToast.timeout);

  showToast.timeout = setTimeout(() => {
    el.toast.classList.remove("visible");
  }, 2500);
}

function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]
  );
}

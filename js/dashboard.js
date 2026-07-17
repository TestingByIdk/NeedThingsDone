const completed = readObject("ntdCompletedProfile");
const profileType = completed.type || localStorage.getItem("ntdProfileType") || "individual";
const details = completed.details || readObject("ntdProfileDetails");
const services = completed.services || readArray("ntdProfileServices");
const tags = completed.profileTags || readArray("ntdProfileTags");
const workStyle = completed.workStyle || readObject("ntdWorkStyle");
const extra = completed.extraDetails || readObject("ntdProfileExtraDetails");

const typeSettings = {
  individual: { icon: "👤", label: "Individual" },
  shop: { icon: "🛍️", label: "Shop" },
  business: { icon: "🏢", label: "Business" },
  "large-business": { icon: "📍", label: "Multi-Location Business" }
};

const type = typeSettings[profileType] || typeSettings.individual;
const $ = id => document.getElementById(id);

const el = {
  mobileMenuButton: $("mobileMenuButton"),
  sidebar: $("dashboardSidebar"),
  overlay: $("dashboardOverlay"),
  sidebarAvatar: $("sidebarAvatar"),
  sidebarName: $("sidebarName"),
  sidebarType: $("sidebarType"),
  welcomeName: $("welcomeName"),
  strengthText: $("profileStrengthText"),
  strengthFill: $("dashboardStrengthFill"),
  progressItems: $("profileProgressItems"),
  messageStatCard: $("messageStatCard"),
  messagesNavItem: $("messagesNavItem"),
  messagesQuickAction: $("messagesQuickAction"),
  documentOpenLabel: $("documentOpenLabel"),
  shareProfileAction: $("shareProfileAction"),
  shareMessage: $("shareMessage"),
  ottoGreeting: $("ottoGreeting"),
  ottoTip: $("ottoDashboardTip"),
  ottoTipAction: $("ottoTipAction"),
  activityWorkStyle: $("activityWorkStyle"),
  summaryAvatar: $("summaryAvatar"),
  summaryName: $("summaryName"),
  summaryLocation: $("summaryLocation"),
  profileTags: $("dashboardProfileTags"),
  serviceList: $("summaryServiceList")
};

init();

function init() {
  renderIdentity();
  renderMessaging();
  renderStrength();
  renderOttoTip();
  renderSummary();
  bindNavigation();
  bindMobileMenu();
  bindShare();
}

function renderIdentity() {
  const name = details.displayName || `${type.label} profile`;
  const firstName = name.split(" ")[0] || "there";
  const location = [details.city, details.province].filter(Boolean).join(", ");

  el.sidebarAvatar.textContent = type.icon;
  el.sidebarName.textContent = name;
  el.sidebarType.textContent = type.label;
  el.welcomeName.textContent = firstName;
  el.summaryAvatar.textContent = type.icon;
  el.summaryName.textContent = name;
  el.summaryLocation.textContent = location ? `📍 ${location}` : "📍 Location not added";

  if (workStyle.name) {
    el.activityWorkStyle.textContent =
      `${workStyle.icon || "🧩"} ${workStyle.name} is saved to your profile.`;
  }
}

function renderMessaging() {
  const enabled =
    (profileType === "individual" || profileType === "shop") &&
    extra.allowMessages;

  el.messageStatCard.hidden = !enabled;
  el.messagesNavItem.hidden = !enabled;
  el.messagesQuickAction.hidden = !enabled;

  if (enabled) {
    el.messagesQuickAction.addEventListener("click", () => showSection("messages"));
  }
}

function renderStrength() {
  const items = [
    ["Add a profile name", Boolean(details.displayName), 12],
    ["Add your complete location", Boolean(details.city && details.province), 10],
    ["Add at least three services", services.length >= 3, 18],
    ["Choose at least three profile tags", tags.length >= 3, 12],
    ["Write a detailed About section", Boolean(extra.longDescription && extra.longDescription.length >= 100), 23],
    ["Add a public contact option", Boolean(extra.allowMessages || extra.contactEmail || extra.contactPhone || extra.website), 13],
    [
      profileType === "individual"
        ? "Add a website, resume, portfolio, or flyer"
        : "Add your website",
      Boolean(extra.documentLink || extra.website),
      12
    ]
  ];

  const score = Math.min(
    items.reduce((total, item) => total + (item[1] ? item[2] : 0), 0),
    100
  );

  el.strengthText.textContent = `${score}%`;
  el.strengthFill.style.width = `${score}%`;
  el.progressItems.innerHTML = "";

  items.forEach(([label, complete]) => {
    const row = document.createElement("div");
    row.className = complete
      ? "profile-progress-item complete"
      : "profile-progress-item";
    row.innerHTML = `<span>${complete ? "✓" : "○"}</span><p>${escapeHTML(label)}</p>`;
    el.progressItems.appendChild(row);
  });

  if (extra.documentLink) {
    el.documentOpenLabel.textContent = "Resume or flyer linked";
  }
}

function renderOttoTip() {
  const tips = [];

  if (services.length < 3) {
    tips.push([
      "Profiles with several clear services are easier to discover in search.",
      "../onboarding/profile-services.html"
    ]);
  }

  if (tags.length < 3) {
    tips.push([
      "Complete Otto’s questions and choose a few profile tags to show your work style.",
      "../onboarding/meet-otto.html"
    ]);
  }

  if (!extra.longDescription || extra.longDescription.length < 100) {
    tips.push([
      "A stronger About section helps visitors understand what makes you different.",
      "../onboarding/profile-extra-details.html"
    ]);
  }

  if (!extra.website && !extra.documentLink) {
    tips.push([
      profileType === "individual"
        ? "Add a website, resume, portfolio, or flyer to give visitors more confidence."
        : "Add your official website so visitors can learn more.",
      "../onboarding/profile-extra-details.html"
    ]);
  }

  if (!tips.length) {
    el.ottoGreeting.textContent = "Your profile looks strong";
    el.ottoTip.textContent =
      "Nice work! The next big improvement will come from real reviews and reputation data.";
    el.ottoTipAction.textContent = "View public profile →";
    el.ottoTipAction.href = "public-profile.html";
    return;
  }

  el.ottoTip.textContent = tips[0][0];
  el.ottoTipAction.href = tips[0][1];
}

function renderSummary() {
  el.profileTags.innerHTML = "";
  tags.slice(0, 6).forEach(tag => {
    const item = document.createElement("span");
    item.textContent = tag;
    el.profileTags.appendChild(item);
  });

  el.serviceList.innerHTML = "";

  if (!services.length) {
    el.serviceList.innerHTML =
      '<p class="dashboard-empty-text">No services added yet.</p>';
    return;
  }

  services.slice(0, 5).forEach(service => {
    const item = document.createElement("span");
    item.textContent = service;
    el.serviceList.appendChild(item);
  });
}

function bindNavigation() {
  document.querySelectorAll(".dashboard-nav-item").forEach(button => {
    button.addEventListener("click", () => {
      showSection(button.dataset.section);
      if (window.innerWidth <= 900) closeMenu();
    });
  });
}

function showSection(name) {
  document.querySelectorAll(".dashboard-section").forEach(section => {
    section.classList.remove("active");
  });

  document.querySelectorAll(".dashboard-nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.section === name);
  });

  const target = document.getElementById(`${name}Section`);
  if (target) target.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindMobileMenu() {
  el.mobileMenuButton.addEventListener("click", () => {
    const open = el.sidebar.classList.toggle("mobile-open");
    el.overlay.classList.toggle("active", open);
    document.body.classList.toggle("dashboard-menu-open", open);
    el.mobileMenuButton.setAttribute("aria-expanded", String(open));
  });

  el.overlay.addEventListener("click", closeMenu);
}

function closeMenu() {
  el.sidebar.classList.remove("mobile-open");
  el.overlay.classList.remove("active");
  document.body.classList.remove("dashboard-menu-open");
  el.mobileMenuButton.setAttribute("aria-expanded", "false");
}

function bindShare() {
  el.shareProfileAction.addEventListener("click", async () => {
    const url = new URL("public-profile.html", window.location.href).href;

    try {
      await navigator.clipboard.writeText(url);
      el.shareMessage.textContent = "Public profile link copied!";
    } catch {
      el.shareMessage.textContent = "Copying is unavailable in this browser.";
    }
  });
}

function readObject(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const readJSON = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  };

  const state = {
    completed: readJSON("ntdCompletedProfile", {}),
    account: readJSON("ntdAccountProfileV1", {}),
    details: {},
    extra: {},
    services: [],
    tags: [],
    saved: [],
    notifications: [],
    messages: [],
    reviews: [],
    profileType: "customer",
    user: null
  };

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    buildState();
    bindMenu();
    bindTheme();
    bindSignOut();

    state.user = await resolveUser();
    if (window.supabaseClient && !state.user) {
      location.replace("../onboarding/login.html?next=../pages/dashboard.html");
      return;
    }

    renderIdentity();
    renderCounts();
    renderAccountType();
    renderStrength();
    renderDiscoveries();
    renderActivity();
    finishLoading();
  }

  function buildState() {
    const rawDetails = readJSON("ntdProfileDetails", {});
    const completeDetails = state.completed.details || {};
    const rawExtra = readJSON("ntdProfileExtraDetails", {});
    const completeExtra = state.completed.extraDetails || {};

    state.details = {
      ...rawDetails,
      ...completeDetails,
      displayName: completeDetails.displayName || rawDetails.displayName || state.account.displayName || "",
      city: completeDetails.city || rawDetails.city || String(state.account.city || "").split(",")[0].trim(),
      province: completeDetails.province || rawDetails.province || String(state.account.city || "").split(",").slice(1).join(",").trim()
    };
    state.extra = {
      ...rawExtra,
      ...completeExtra,
      longDescription: completeExtra.longDescription || rawExtra.longDescription || state.account.bio || "",
      website: completeExtra.website || rawExtra.website || state.account.website || ""
    };
    state.services = state.completed.services || readJSON("ntdProfileServices", []);
    state.tags = state.completed.profileTags || readJSON("ntdProfileTags", []);
    state.profileType = state.completed.type || localStorage.getItem("ntdProfileType") || localStorage.getItem("ntdActiveAccountType") || "customer";
    state.saved = readJSON("ntdSavedProfilesV1", readJSON("ntdSavedProfiles", readJSON("ntdAccountSavedItemsV1", [])));
    state.notifications = readJSON("ntdNotificationsV1", []);
    state.messages = readJSON("ntdMessagesV1", []);
    state.reviews = readJSON("ntdReviewsV1", []);
  }

  async function resolveUser() {
    if (!window.supabaseClient) return null;
    try {
      const { data, error } = await window.supabaseClient.auth.getSession();
      if (error) throw error;
      return data?.session?.user || null;
    } catch (error) {
      console.warn("Could not read dashboard session:", error);
      showToast("We could not confirm your session. Please sign in again.");
      return null;
    }
  }

  function renderIdentity() {
    const metadata = state.user?.user_metadata || {};
    const fullName = state.details.displayName || metadata.full_name || [metadata.first_name, metadata.last_name].filter(Boolean).join(" ") || state.user?.email?.split("@")[0] || "there";
    const firstName = fullName.trim().split(/\s+/)[0] || "there";
    const hour = new Date().getHours();

    $("welcomeName").textContent = firstName;
    $("sidebarName").textContent = fullName;
    $("timeGreeting").textContent = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }

  function renderCounts() {
    const messages = Array.isArray(state.messages) ? state.messages : [];
    const notifications = Array.isArray(state.notifications) ? state.notifications : [];
    const reviews = Array.isArray(state.reviews) ? state.reviews : [];
    const saved = Array.isArray(state.saved) ? state.saved : [];
    const unreadMessages = messages.filter((item) => item?.unread === true || item?.read === false).length;
    const unreadNotifications = notifications.filter((item) => item?.unread === true || item?.read === false).length;

    setText("messageCount", unreadMessages);
    setText("notificationCount", unreadNotifications);
    setText("reviewCount", reviews.length);
    setText("savedCount", saved.length);
    updateBadge("messageNavBadge", unreadMessages);
    updateBadge("notificationNavBadge", unreadNotifications);

    const ratings = reviews.map((item) => Number(item?.rating)).filter((rating) => Number.isFinite(rating) && rating > 0);
    if (ratings.length) {
      const average = ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
      $("ratingText").textContent = `${average.toFixed(1)} average rating`;
    }
  }

  function renderAccountType() {
    const typeMap = {
      visitor: ["👋", "Visitor"],
      customer: ["🔎", "Member"],
      individual: ["👤", "Individual"],
      business: ["🏢", "Business"],
      shop: ["🛍️", "Shop"],
      "large-business": ["📍", "Multi-location business"]
    };
    const current = typeMap[state.profileType] || typeMap.customer;
    const isOwner = !["visitor", "customer"].includes(state.profileType);
    const subtitleMap = {
      visitor: "Browse local help, send messages, leave reviews, and keep useful listings close.",
      customer: "Find local help, check replies, and keep track of everything you save.",
      individual: "Manage your services, reputation, messages, and public profile.",
      business: "Track your listing, messages, reviews, and local visibility.",
      shop: "Manage your shop presence, product links, messages, and reviews.",
      "large-business": "Manage your locations, visibility, messages, and reviews."
    };
    const tipMap = {
      visitor: "Save useful profiles so they are easy to find later.",
      customer: "Reviews help other people choose local services with confidence.",
      individual: "Clear services and availability make your profile easier to discover.",
      business: "Keep your contact details and service area accurate.",
      shop: "Direct product and menu links help visitors take action quickly.",
      "large-business": "Keep every location accurate so customers reach the right team."
    };

    $("sidebarAvatar").textContent = current[0];
    $("sidebarType").textContent = current[1];
    $("welcomeSubtitle").textContent = subtitleMap[state.profileType] || subtitleMap.customer;
    $("ottoSideTip").textContent = tipMap[state.profileType] || tipMap.customer;
    document.querySelectorAll(".owner-only").forEach((element) => { element.hidden = !isOwner; });
  }

  function renderStrength() {
    if (["visitor", "customer"].includes(state.profileType)) return;

    const items = [
      ["Add a profile name", Boolean(state.details.displayName), 15],
      ["Add your location", Boolean(state.details.city && state.details.province), 15],
      ["Add at least three services", state.services.length >= 3, 20],
      ["Choose at least three tags", state.tags.length >= 3, 15],
      ["Write a detailed About section", String(state.extra.longDescription || "").trim().length >= 100, 20],
      ["Add a contact option", Boolean(state.extra.allowMessages || state.extra.contactEmail || state.extra.contactPhone || state.extra.website), 15]
    ];
    const score = items.reduce((total, item) => total + (item[1] ? item[2] : 0), 0);

    $("profileStrengthText").textContent = `${score}%`;
    $("dashboardStrengthFill").style.width = `${score}%`;
    $("profileAlert").hidden = score >= 100;
    $("profileProgressItems").innerHTML = items.map(([label, done]) => `
      <div class="profile-progress-item ${done ? "complete" : ""}">
        <span>${done ? "✓" : "○"}</span><p>${escapeHTML(label)}</p>
      </div>`).join("");
  }

  function renderDiscoveries() {
    const city = state.details.city || "Ottawa";
    const discoveries = [
      ["🏠", `Home services near ${city}`, "Browse trusted local businesses.", "businesses.html"],
      ["👤", "Skilled individuals", "Find people offering useful local skills.", "individual-search.html"],
      ["🛍️", "Local shops", "Discover local products, cafés, and stores.", "shop.html"]
    ];
    $("discoveryList").innerHTML = discoveries.map(([icon, title, description, href]) => `
      <a href="${href}"><span>${icon}</span><div><strong>${escapeHTML(title)}</strong><p>${escapeHTML(description)}</p></div><b>→</b></a>`).join("");
  }

  function renderActivity() {
    const activity = [];
    if (state.completed.details) activity.push(["👤", "Profile information saved", "Your latest profile details are available.", "Today"]);
    if (state.services.length) activity.push(["🛠️", "Services updated", `${state.services.length} service${state.services.length === 1 ? "" : "s"} added to your profile.`, "Recent"]);
    if (state.tags.length) activity.push(["🏷️", "Profile tags saved", `${state.tags.length} discovery tag${state.tags.length === 1 ? " is" : "s are"} ready.`, "Recent"]);
    if (Array.isArray(state.saved) && state.saved.length) activity.push(["🔖", "Saved items ready", `${state.saved.length} saved item${state.saved.length === 1 ? "" : "s"} in your collection.`, "Recent"]);
    if (!activity.length) activity.push(["✨", "Your dashboard is ready", "Start exploring NeedThingsDone or update your account settings.", "Now"]);

    $("activityList").innerHTML = activity.slice(0, 4).map(([icon, title, description, time]) => `
      <article><span>${icon}</span><div><strong>${escapeHTML(title)}</strong><p>${escapeHTML(description)}</p></div><time>${escapeHTML(time)}</time></article>`).join("");
  }

  function bindMenu() {
    const button = $("mobileMenuButton");
    const sidebar = $("dashboardSidebar");
    const overlay = $("dashboardOverlay");
    if (!button || !sidebar || !overlay) return;

    const close = () => {
      sidebar.classList.remove("mobile-open");
      overlay.classList.remove("active");
      document.body.classList.remove("dashboard-menu-open");
      button.setAttribute("aria-expanded", "false");
    };
    button.addEventListener("click", () => {
      const open = sidebar.classList.toggle("mobile-open");
      overlay.classList.toggle("active", open);
      document.body.classList.toggle("dashboard-menu-open", open);
      button.setAttribute("aria-expanded", String(open));
    });
    overlay.addEventListener("click", close);
    window.addEventListener("resize", () => { if (innerWidth > 820) close(); });
  }

  function bindTheme() {
    const button = $("themeToggle");
    if (!button) return;
    const syncIcon = () => { button.textContent = document.documentElement.dataset.theme === "dark" ? "☀️" : "🌙"; };
    syncIcon();
    button.addEventListener("click", () => {
      const dark = document.documentElement.dataset.theme !== "dark";
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document.documentElement.classList.toggle("dark-mode", dark);
      document.body.classList.toggle("dark-mode", dark);
      localStorage.setItem("ntdTheme", dark ? "dark" : "light");
      const settings = readJSON("ntdAccountSettingsV1", {});
      localStorage.setItem("ntdAccountSettingsV1", JSON.stringify({ ...settings, theme: dark ? "dark" : "light" }));
      syncIcon();
    });
  }

  function bindSignOut() {
    $("signOutButton")?.addEventListener("click", async () => {
      try {
        if (window.supabaseClient) await window.supabaseClient.auth.signOut();
      } finally {
        location.replace("../onboarding/login.html");
      }
    });
  }

  function updateBadge(id, count) {
    const badge = $(id);
    if (!badge) return;
    badge.textContent = count > 99 ? "99+" : String(count);
    badge.hidden = count < 1;
  }

  function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = String(value);
  }

  function finishLoading() {
    requestAnimationFrame(() => $("dashboardLoading")?.classList.add("done"));
  }

  function showToast(message) {
    const toast = $("dashboardToast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  }
})();

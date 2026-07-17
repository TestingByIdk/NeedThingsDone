const NTD_ASSETS = window.NTD_ASSETS || "assets/images";
const OTTO_INLINE = `<img src="${NTD_ASSETS}/otto.png" class="otto otto-inline" alt="Otto">`;

const tutorialSteps = [
  {
    title: "Welcome to NeedThingsDone!",
    text: "Hi! I’m Otto. I’ll show you how NeedThingsDone helps you find businesses, individuals, shops, community help, news, and nearby listings."
  },
  {
    title: "Home",
    text: "The Home page gives you a quick overview of the platform. You can search for help, see platform stats, learn about Alex, and meet me, Otto."
  },
  {
    title: "Businesses",
    text: "The Businesses page is for trusted companies and services like roofing, plumbing, auto repair, tech support, and more."
  },
  {
    title: "Individuals",
    text: "The Individuals page is for people offering skills, help, creativity, or services. This could include pet care, tutoring, tech help, photography, and unique talents."
  },
  {
    title: "Shop",
    text: "The Shop page is for products and local finds like parts, arts and crafts, cafés, bakeries, local stores, featured products, and deals."
  },
  {
    title: "Community",
    text: "The Community page works like a forum. You can ask questions, get recommendations, share advice, and help others find what they need."
  },
  {
    title: "News",
    text: "The News page will become NeedThingsDone Weekly. Otto will highlight new businesses, new individuals, shop finds, reminders, and fun local updates."
  },
  {
    title: "Signing Up",
    text: "Later, users will be able to create accounts. Businesses can make profiles, individuals can show their skills, and shops can list products. Otto will help guide setup step by step."
  },
  {
    title: "Have Fun Exploring!",
    text: "Lastly, make sure to have fun exploring NeedThingsDone. Discover local businesses, meet talented individuals, find great deals, ask questions, and see what your community has to offer. I'll be around to help whenever you need me! 🐙"
  }
];

let currentStep = 0;

const openTutorial = document.getElementById("openTutorial");
const tutorialOverlay = document.getElementById("tutorialOverlay");
const closeTutorial = document.getElementById("closeTutorial");
const nextTutorial = document.getElementById("nextTutorial");
const prevTutorial = document.getElementById("prevTutorial");

const tutorialStep = document.getElementById("tutorialStep");
const tutorialTitle = document.getElementById("tutorialTitle");
const tutorialText = document.getElementById("tutorialText");

function updateTutorial() {
  if (!tutorialStep || !tutorialTitle || !tutorialText) return;

  tutorialStep.textContent = `Step ${currentStep + 1} of ${tutorialSteps.length}`;
  tutorialTitle.textContent = tutorialSteps[currentStep].title;
  tutorialText.textContent = tutorialSteps[currentStep].text;

  if (prevTutorial) {
    prevTutorial.style.visibility = currentStep === 0 ? "hidden" : "visible";
  }

  if (nextTutorial) {
    nextTutorial.textContent = currentStep === tutorialSteps.length - 1 ? "Finish" : "Next";
  }
}

if (openTutorial && tutorialOverlay) {
  openTutorial.addEventListener("click", function(event) {
    event.preventDefault();
    currentStep = 0;
    updateTutorial();
    tutorialOverlay.classList.add("show");
  });
}

if (closeTutorial && tutorialOverlay) {
  closeTutorial.addEventListener("click", function() {
    tutorialOverlay.classList.remove("show");
  });
}

if (nextTutorial && tutorialOverlay) {
  nextTutorial.addEventListener("click", function() {
    if (currentStep < tutorialSteps.length - 1) {
      currentStep++;
      updateTutorial();
    } else {
      tutorialOverlay.classList.remove("show");
    }
  });
}

if (prevTutorial) {
  prevTutorial.addEventListener("click", function() {
    if (currentStep > 0) {
      currentStep--;
      updateTutorial();
    }
  });
}

if (tutorialOverlay) {
  tutorialOverlay.addEventListener("click", function(event) {
    if (event.target === tutorialOverlay) {
      tutorialOverlay.classList.remove("show");
    }
  });
}

// ABOUT ALEX / OTTO POPUPS

const openAlex = document.getElementById("openAlex");
const openOtto = document.getElementById("openOtto");
const aboutOverlay = document.getElementById("aboutOverlay");
const aboutContent = document.getElementById("aboutContent");
const closeAbout = document.getElementById("closeAbout");

const alexPopup = `
<h2>About Alex 👋</h2>

<p>
Hi, I'm Alex, the creator of NeedThingsDone.
</p>

<p>
I started this project because I believe finding trustworthy businesses,
skilled individuals, and helpful local information should be simple.
</p>

<p>
My goal is to build a platform where people can discover opportunities,
support local communities, and find the help they need without jumping
between dozens of different websites.
</p>

<p>
NeedThingsDone is still growing, but every feature is being built with
that goal in mind.
</p>

<hr>

<p>
Thank you for checking out the project.
</p>

<p>
As a reward, I have included some extremely important documentation.
</p>

<a
  href="https://youtu.be/PvHU3dV-WNA?si=TJ5d_yaPR2xcgxh5"
  target="_blank"
  class="otto-link"
>
🐱 View Important Documentation
</a>
`;

const ottoPopup = `
<h2>About Otto ${OTTO_INLINE}</h2>

<p>
Otto is the official mascot of NeedThingsDone.
</p>

<p>
While most platforms have support agents, help centers, and complicated guides,
NeedThingsDone has an octopus.
</p>

<p>
Nobody knows where Otto came from.
Nobody knows where he goes.
He simply appears whenever things need to get done.
</p>

<hr>

<p><strong>Favorite Food:</strong> Fish</p>
<p><strong>Favorite Hobby:</strong> Helping people</p>
<p><strong>Current Occupation:</strong> Professional Octopus</p>
<p><strong>Favorite Activity:</strong> Organizing chaos</p>
<p><strong>Number of Tentacles:</strong> 8</p>

<hr>

<p><strong>${OTTO_INLINE} Otto Fact #1</strong></p>
<p>
Otto has never paid taxes.
</p>

<p><strong>${OTTO_INLINE} Otto Fact #2</strong></p>
<p>
When questioned about Fact #1, Otto declined to comment.
</p>

<p><strong>${OTTO_INLINE} Otto Fact #3</strong></p>
<p>
Otto claims he invented the internet.
Historians remain unconvinced.
</p>

<p><strong>${OTTO_INLINE} Otto Fact #4</strong></p>
<p>
Otto once completed a task before it was assigned.
This achievement remains under investigation.
</p>

<p><strong>${OTTO_INLINE} Otto's Mission</strong></p>
<p>
Help people find trusted businesses, talented individuals,
great deals, useful information, and the right path forward.
</p>

<button class="otto-close-btn" id="acceptWisdom">
${OTTO_INLINE} Accept Otto's Wisdom
</button>
`;

if (openAlex && aboutOverlay && aboutContent) {
  openAlex.addEventListener("click", function(e) {
    e.preventDefault();
    aboutContent.innerHTML = alexPopup;
    aboutOverlay.classList.add("show");
  });
}

if (openOtto && aboutOverlay && aboutContent) {
  openOtto.addEventListener("click", function(e) {
    e.preventDefault();
    aboutContent.innerHTML = ottoPopup;
    aboutOverlay.classList.add("show");

    const wisdomBtn = document.getElementById("acceptWisdom");

    if (wisdomBtn) {
      wisdomBtn.addEventListener("click", function() {
        aboutOverlay.classList.remove("show");
      });
    }
  });
}

if (closeAbout && aboutOverlay) {
  closeAbout.addEventListener("click", function() {
    aboutOverlay.classList.remove("show");
  });
}

if (aboutOverlay) {
  aboutOverlay.addEventListener("click", function(e) {
    if (e.target === aboutOverlay) {
      aboutOverlay.classList.remove("show");
    }
  });
}

// DARK MODE — shared by every page
const themeToggle = document.getElementById("themeToggle");

function getNTDThemePreference() {
  const account = (() => {
    try { return JSON.parse(localStorage.getItem("ntdAccountSettingsV1") || "null")?.theme; }
    catch { return null; }
  })();
  return account || localStorage.getItem("ntdTheme") || localStorage.getItem("theme") || localStorage.getItem("ntdThemePreference") || "light";
}

function applyNTDTheme(preference) {
  const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const dark = preference === "dark" || (preference === "system" && systemDark);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.classList.toggle("dark-mode", dark);
  document.body.classList.toggle("dark-mode", dark);
  if (themeToggle) themeToggle.textContent = dark ? "☀️" : "🌙";
}

const initialNTDTheme = getNTDThemePreference();
applyNTDTheme(initialNTDTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", function() {
    const next = document.body.classList.contains("dark-mode") ? "light" : "dark";
    localStorage.setItem("theme", next);
    localStorage.setItem("ntdTheme", next);
    localStorage.setItem("ntdThemePreference", next);
    try {
      const settings = JSON.parse(localStorage.getItem("ntdAccountSettingsV1") || "{}");
      settings.theme = next;
      localStorage.setItem("ntdAccountSettingsV1", JSON.stringify(settings));
    } catch {}
    applyNTDTheme(next);
  });
}


const exploreArea = document.getElementById("exploreArea");
const exploreTitle = document.getElementById("exploreTitle");
const exploreEmoji = document.getElementById("exploreEmoji");
const exploreContent = document.getElementById("exploreContent");
const exploreFilters = document.getElementById("exploreFilters");
const closeExplore = document.getElementById("closeExplore");

const categoryData = {
  cafes: {
    emoji: "☕",
    title: "Cafés & Bakeries",
    filters: ["All", "Coffee", "Pastries", "Cupcakes", "Bread"],
    items: [
      { name: "Vanilla Latte", detail: "Smooth espresso with steamed milk.", price: "$4.99", type: "Coffee", image: "☕" },
      { name: "Butter Croissant", detail: "Fresh baked pastry from a local bakery.", price: "$3.50", type: "Pastries", image: "🥐" },
      { name: "Chocolate Cupcake", detail: "Soft cupcake with chocolate frosting.", price: "$2.75", type: "Cupcakes", image: "🧁" },
      { name: "Sourdough Loaf", detail: "Fresh local bread, baked daily.", price: "$6.00", type: "Bread", image: "🍞" }
    ]
  },

  parts: {
    emoji: "🛠️",
    title: "Parts",
    filters: ["All", "Computer", "Auto", "Tools", "Cables"],
    items: [
      { name: "HDMI Cable", detail: "6ft cable for monitors and TVs.", price: "$9.99", type: "Cables", image: "🔌" },
      { name: "SSD Drive", detail: "Fast storage upgrade for computers.", price: "$49.99", type: "Computer", image: "💾" },
      { name: "Socket Set", detail: "Basic repair tool kit.", price: "$29.99", type: "Tools", image: "🔧" },
      { name: "Oil Filter", detail: "Replacement filter for vehicle maintenance.", price: "$12.99", type: "Auto", image: "🚗" }
    ]
  },

  crafts: {
    emoji: "🎨",
    title: "Arts & Crafts",
    filters: ["All", "Jewelry", "Artwork", "Woodwork", "Decor"],
    items: [
      { name: "Handmade Bracelet", detail: "Locally made bracelet with custom colours.", price: "$12.00", type: "Jewelry", image: "📿" },
      { name: "Canvas Painting", detail: "Original artwork from a local creator.", price: "$45.00", type: "Artwork", image: "🖼️" },
      { name: "Wooden Key Holder", detail: "Handmade woodwork for home organization.", price: "$25.00", type: "Woodwork", image: "🪵" },
      { name: "Mini Desk Plant Pot", detail: "Cute handmade decor for desks and shelves.", price: "$10.00", type: "Decor", image: "🪴" }
    ]
  },

  stores: {
    emoji: "🏪",
    title: "Local Stores",
    filters: ["All", "Gifts", "Electronics", "Pets", "Outdoor"],
    items: [
      { name: "Local Gift Basket", detail: "A mix of small locally sourced items.", price: "$35.00", type: "Gifts", image: "🎁" },
      { name: "Phone Charger", detail: "Fast charging cable from a local shop.", price: "$14.99", type: "Electronics", image: "🔋" },
      { name: "Dog Toy Pack", detail: "Small bundle of toys for playful pets.", price: "$18.00", type: "Pets", image: "🐶" },
      { name: "Camping Mug", detail: "Durable mug for outdoor adventures.", price: "$11.50", type: "Outdoor", image: "🏕️" }
    ]
  },

  deals: {
    emoji: "🏷️",
    title: "Deals",
    filters: ["All", "Food", "Services", "Products", "Limited"],
    items: [
      { name: "10% Off Pastries", detail: "Weekly bakery deal from a local café.", price: "10% off", type: "Food", image: "🥐" },
      { name: "Oil Change Special", detail: "Limited service deal from a local auto shop.", price: "$59.99", type: "Services", image: "🚗" },
      { name: "Buy 2 Get 1 Craft Item", detail: "Deal on selected handmade products.", price: "BOGO", type: "Products", image: "🎨" },
      { name: "Weekend Flash Deal", detail: "Short-time local shop promotion.", price: "Limited", type: "Limited", image: "⚡" }
    ]
  }
};

function renderExploreItems(data, filter = "All") {
  exploreContent.innerHTML = "";

  data.items
    .filter(item => filter === "All" || item.type === filter)
    .forEach(item => {
      exploreContent.innerHTML += `
        <div class="explore-item">
          <div class="item-img">${item.image}</div>

          <div class="item-info">
            <h4>${item.name}</h4>
            <p>${item.detail}</p>
          </div>

          <div class="item-price">${item.price}</div>
        </div>
      `;
    });
}

document.querySelectorAll(".explore-btn").forEach(button => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;
    const data = categoryData[category];

    if (!data) return;

    exploreEmoji.textContent = data.emoji;
    exploreTitle.textContent = data.title;

    exploreFilters.innerHTML = "";

    data.filters.forEach(filter => {
      exploreFilters.innerHTML += `
        <button class="filter-chip ${filter === "All" ? "active" : ""}" data-filter="${filter}">
          ${filter}
        </button>
      `;
    });

    renderExploreItems(data);

    exploreArea.classList.add("show");

    exploreArea.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    document.querySelectorAll(".filter-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        renderExploreItems(data, chip.dataset.filter);
      });
    });
  });
});

if (closeExplore) {
  closeExplore.addEventListener("click", () => {
    exploreArea.classList.remove("show");
  });
}


/* =========================================================
   NEEDTHINGSDONE GLOBAL APP UI
   Notifications, messenger dock, account-aware navigation,
   and return-to-page login behaviour.
   ========================================================= */
(() => {
  "use strict";

  const pageIsOnboarding = /\/onboarding\//i.test(window.location.pathname);
  if (pageIsOnboarding) return;

  const isInsidePagesFolder = /\/pages\//i.test(window.location.pathname);
  const rootPrefix = isInsidePagesFolder ? "../" : "";
  const pagePrefix = isInsidePagesFolder ? "" : "pages/";
  const onboardingPrefix = rootPrefix + "onboarding/";

  const getStoredArray = (key, fallback = []) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value : fallback;
    } catch {
      return fallback;
    }
  };

  const saveArray = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);

  const relativeCurrentUrl = () => {
    const path = window.location.pathname.split("/").filter(Boolean);
    const projectIndex = path.lastIndexOf("NeedThingsDone-main");
    let relativePath;

    if (projectIndex >= 0) {
      relativePath = path.slice(projectIndex + 1).join("/");
    } else {
      relativePath = isInsidePagesFolder
        ? `pages/${path[path.length - 1] || "dashboard.html"}`
        : (path[path.length - 1] || "index.html");
    }

    return relativePath + window.location.search + window.location.hash;
  };

  // Make every login button open only the login page, then return here.
  document.querySelectorAll('a.login-btn, a[href$="onboarding/account-choice.html"]').forEach(link => {
    if (!link.classList.contains("signup-btn")) {
      link.textContent = "Log In";
      link.href = `${onboardingPrefix}login.html?returnTo=${encodeURIComponent(relativeCurrentUrl())}`;
    }
  });

  let navActions = document.querySelector(".nav-actions");
  const customActions = document.querySelector(".dashboard-topbar-actions, .saved-topbar-actions");

  // Dashboard and utility pages use custom headers. Give them the same main-site navigation.
  const customHeader = document.querySelector(".dashboard-topbar, .saved-topbar");
  if (!document.querySelector(".navbar") && customHeader && !customHeader.querySelector(".ntd-utility-site-nav")) {
    const utilityNav = document.createElement("nav");
    utilityNav.className = "ntd-utility-site-nav";
    utilityNav.innerHTML = `
      <a href="../index.html">Home</a><a href="businesses.html">Businesses</a>
      <a href="individuals.html">Individuals</a><a href="shop.html">Shop</a>
      <a href="community.html">Community</a><a href="news.html">News</a><a href="map.html">Map</a>`;
    customHeader.insertBefore(utilityNav, customHeader.lastElementChild);
  }

  if (!navActions && customActions) {
    navActions = customActions;
    if (!navActions.querySelector('.login-btn') && !navActions.querySelector('#signOutButton')) {
      const login = document.createElement('a');
      login.className='login-btn'; login.textContent='Log In';
      login.href=`${onboardingPrefix}login.html?returnTo=${encodeURIComponent(relativeCurrentUrl())}`;
      navActions.appendChild(login);
    }
  }
  if (!navActions) return;

  const defaultNotifications = [
    {
      id: "welcome-notification",
      icon: "🐙",
      title: "Welcome to NeedThingsDone",
      text: "Your notifications will appear here on every page.",
      time: "Just now",
      read: false,
      href: `${pagePrefix}notifications.html`
    },
    {
      id: "community-notification",
      icon: "💬",
      title: "Community is ready",
      text: "Browse local questions, advice, and recommendations.",
      time: "Today",
      read: false,
      href: `${pagePrefix}community.html`
    }
  ];

  let notifications = getStoredArray("ntdGlobalNotificationsV1");
  if (!notifications.length) {
    notifications = defaultNotifications;
    saveArray("ntdGlobalNotificationsV1", notifications);
  }

  const appControls = document.createElement("div");
  appControls.className = "ntd-global-controls";
  appControls.innerHTML = `
    <div class="ntd-notification-wrap">
      <button class="ntd-icon-button" id="ntdNotificationButton" type="button"
        aria-label="Open notifications" aria-haspopup="true" aria-expanded="false">
        <span aria-hidden="true">🔔</span>
        <b class="ntd-count-badge" id="ntdNotificationCount" hidden>0</b>
      </button>
      <section class="ntd-notification-panel" id="ntdNotificationPanel" hidden>
        <header>
          <div>
            <strong>Notifications</strong>
            <small>Updates from across NeedThingsDone</small>
          </div>
          <button type="button" id="ntdMarkAllRead">Mark all read</button>
        </header>
        <div class="ntd-notification-list" id="ntdNotificationList"></div>
        <a class="ntd-panel-footer" href="${pagePrefix}notifications.html">View all notifications →</a>
      </section>
    </div>
  `;

  const themeButton = navActions.querySelector("#themeToggle");
  navActions.insertBefore(appControls, themeButton || navActions.firstChild);

  const notificationButton = document.getElementById("ntdNotificationButton");
  const notificationPanel = document.getElementById("ntdNotificationPanel");
  const notificationList = document.getElementById("ntdNotificationList");
  const notificationCount = document.getElementById("ntdNotificationCount");
  const markAllRead = document.getElementById("ntdMarkAllRead");

  const renderNotifications = () => {
    const unread = notifications.filter(item => !item.read).length;
    notificationCount.textContent = unread > 99 ? "99+" : String(unread);
    notificationCount.hidden = unread === 0;

    if (!notifications.length) {
      notificationList.innerHTML = `
        <div class="ntd-empty-state">
          <span>🔔</span>
          <strong>You’re all caught up</strong>
          <p>New updates will appear here.</p>
        </div>`;
      return;
    }

    notificationList.innerHTML = notifications.slice(0, 6).map(item => `
      <a class="ntd-notification-item ${item.read ? "" : "is-unread"}"
         href="${escapeHtml(item.href || `${pagePrefix}notifications.html`)}"
         data-notification-id="${escapeHtml(item.id)}">
        <span class="ntd-notification-icon">${escapeHtml(item.icon || "🔔")}</span>
        <span>
          <strong>${escapeHtml(item.title || "Notification")}</strong>
          <small>${escapeHtml(item.text || "")}</small>
          <time>${escapeHtml(item.time || "Recently")}</time>
        </span>
      </a>
    `).join("");

    notificationList.querySelectorAll("[data-notification-id]").forEach(link => {
      link.addEventListener("click", () => {
        const found = notifications.find(item => item.id === link.dataset.notificationId);
        if (found) {
          found.read = true;
          saveArray("ntdGlobalNotificationsV1", notifications);
        }
      });
    });
  };

  const closeNotificationPanel = () => {
    notificationPanel.hidden = true;
    notificationButton.setAttribute("aria-expanded", "false");
  };

  notificationButton.addEventListener("click", event => {
    event.stopPropagation();
    const willOpen = notificationPanel.hidden;
    notificationPanel.hidden = !willOpen;
    notificationButton.setAttribute("aria-expanded", String(willOpen));
  });

  markAllRead.addEventListener("click", () => {
    notifications.forEach(item => item.read = true);
    saveArray("ntdGlobalNotificationsV1", notifications);
    renderNotifications();
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".ntd-notification-wrap")) closeNotificationPanel();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeNotificationPanel();
  });

  renderNotifications();

  // Bottom-left messenger dock.
  const defaultThreads = [
    {
      id: "otto",
      name: "Otto Assistant",
      avatar: "🐙",
      preview: "Hi! I can help you explore NeedThingsDone.",
      unread: 1,
      messages: [
        { from: "them", text: "Hi! I can help you explore NeedThingsDone." },
        { from: "them", text: "Messages will eventually update instantly with Supabase Realtime." }
      ]
    },
    {
      id: "sample-business",
      name: "Sample Local Business",
      avatar: "🏢",
      preview: "Thanks for reaching out!",
      unread: 0,
      messages: [
        { from: "them", text: "Thanks for reaching out!" }
      ]
    }
  ];

  let threads = getStoredArray("ntdMessengerThreadsV1");
  if (!threads.length) {
    threads = defaultThreads;
    saveArray("ntdMessengerThreadsV1", threads);
  }

  const messenger = document.createElement("aside");
  messenger.className = "ntd-messenger";
  messenger.innerHTML = `
    <button class="ntd-messenger-tab" id="ntdMessengerTab" type="button" aria-expanded="false">
      <span>💬</span>
      <strong>Messages</strong>
      <b id="ntdMessageBadge" hidden>0</b>
    </button>
    <section class="ntd-messenger-window" id="ntdMessengerWindow" hidden>
      <header>
        <div>
          <strong id="ntdMessengerTitle">Messages</strong>
          <small id="ntdMessengerSubtitle">Your conversations</small>
        </div>
        <div>
          <button id="ntdMessengerBack" type="button" hidden aria-label="Back to conversations">←</button>
          <button id="ntdMessengerClose" type="button" aria-label="Minimize messages">−</button>
        </div>
      </header>
      <div class="ntd-thread-list" id="ntdThreadList"></div>
      <div class="ntd-chat-view" id="ntdChatView" hidden>
        <div class="ntd-chat-messages" id="ntdChatMessages"></div>
        <form class="ntd-chat-compose" id="ntdChatForm">
          <input id="ntdChatInput" type="text" maxlength="500" autocomplete="off" placeholder="Write a message…">
          <button type="submit" aria-label="Send message">➤</button>
        </form>
      </div>
      <a class="ntd-messenger-footer" href="${pagePrefix}messages.html">Open full messages →</a>
    </section>
  `;
  document.body.appendChild(messenger);

  const messengerTab = document.getElementById("ntdMessengerTab");
  const messengerWindow = document.getElementById("ntdMessengerWindow");
  const messengerClose = document.getElementById("ntdMessengerClose");
  const messengerBack = document.getElementById("ntdMessengerBack");
  const messengerTitle = document.getElementById("ntdMessengerTitle");
  const messengerSubtitle = document.getElementById("ntdMessengerSubtitle");
  const messageBadge = document.getElementById("ntdMessageBadge");
  const threadList = document.getElementById("ntdThreadList");
  const chatView = document.getElementById("ntdChatView");
  const chatMessages = document.getElementById("ntdChatMessages");
  const chatForm = document.getElementById("ntdChatForm");
  const chatInput = document.getElementById("ntdChatInput");
  let activeThreadId = null;

  const renderThreadList = () => {
    const unread = threads.reduce((sum, thread) => sum + Number(thread.unread || 0), 0);
    messageBadge.textContent = unread > 99 ? "99+" : String(unread);
    messageBadge.hidden = unread === 0;

    threadList.innerHTML = threads.map(thread => `
      <button class="ntd-thread-row" type="button" data-thread-id="${escapeHtml(thread.id)}">
        <span class="ntd-thread-avatar">${escapeHtml(thread.avatar || "👤")}</span>
        <span class="ntd-thread-copy">
          <strong>${escapeHtml(thread.name)}</strong>
          <small>${escapeHtml(thread.preview || "Open conversation")}</small>
        </span>
        ${thread.unread ? `<b>${Number(thread.unread)}</b>` : ""}
      </button>
    `).join("");

    threadList.querySelectorAll("[data-thread-id]").forEach(button => {
      button.addEventListener("click", () => openThread(button.dataset.threadId));
    });
  };

  const openThread = id => {
    const thread = threads.find(item => item.id === id);
    if (!thread) return;

    activeThreadId = id;
    thread.unread = 0;
    saveArray("ntdMessengerThreadsV1", threads);
    renderThreadList();

    messengerTitle.textContent = thread.name;
    messengerSubtitle.textContent = "Active conversation";
    messengerBack.hidden = false;
    threadList.hidden = true;
    chatView.hidden = false;

    chatMessages.innerHTML = (thread.messages || []).map(message => `
      <div class="ntd-chat-bubble ${message.from === "me" ? "is-mine" : ""}">
        ${escapeHtml(message.text)}
      </div>
    `).join("");

    requestAnimationFrame(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
      chatInput.focus();
    });
  };

  const showThreads = () => {
    activeThreadId = null;
    messengerTitle.textContent = "Messages";
    messengerSubtitle.textContent = "Your conversations";
    messengerBack.hidden = true;
    threadList.hidden = false;
    chatView.hidden = true;
  };

  const setMessengerOpen = open => {
    messengerWindow.hidden = !open;
    messengerTab.setAttribute("aria-expanded", String(open));
    if (open) renderThreadList();
  };

  messengerTab.addEventListener("click", () => setMessengerOpen(messengerWindow.hidden));
  messengerClose.addEventListener("click", () => setMessengerOpen(false));
  messengerBack.addEventListener("click", showThreads);

  chatForm.addEventListener("submit", event => {
    event.preventDefault();
    const originalText = chatInput.value.trim();
    const thread = threads.find(item => item.id === activeThreadId);
    if (!originalText || !thread) return;

    const blockedWords = ["fuck", "shit", "bitch", "asshole", "cunt", "nigger", "faggot"];
    const filteredText = blockedWords.reduce((result, word) =>
      result.replace(new RegExp(`\b${word}\b`, "gi"), "•".repeat(word.length)), originalText);

    thread.messages = thread.messages || [];
    thread.messages.push({ from: "me", text: filteredText });
    thread.preview = filteredText;
    saveArray("ntdMessengerThreadsV1", threads);
    chatInput.value = "";
    openThread(activeThreadId);
  });

  renderThreadList();

  // Replace login/signup controls with a compact profile menu when signed in.
  const supabaseClient = window.supabaseClient;
  if (supabaseClient?.auth) {
    supabaseClient.auth.getSession().then(({ data }) => {
      const session = data?.session;
      if (!session) return;

      navActions.querySelectorAll(".login-btn, .signup-btn").forEach(item => item.remove());

      const metadata = session.user?.user_metadata || {};
      const displayName =
        metadata.first_name ||
        metadata.full_name?.split(" ")[0] ||
        session.user?.email?.split("@")[0] ||
        "Account";

      const profileWrap = document.createElement("div");
      profileWrap.className = "ntd-profile-wrap";
      profileWrap.innerHTML = `
        <button class="ntd-profile-button" id="ntdProfileButton" type="button" aria-expanded="false">
          <span>${escapeHtml(displayName.charAt(0).toUpperCase())}</span>
          <strong>${escapeHtml(displayName)}</strong>
          <small>▾</small>
        </button>
        <div class="ntd-profile-menu" id="ntdProfileMenu" hidden>
          <a href="${pagePrefix}dashboard.html">Dashboard</a>
          <a href="${pagePrefix}account-settings.html">Account settings</a>
          <a href="${pagePrefix}saved-profiles.html">Saved items</a>
          <button id="ntdGlobalSignOut" type="button">Log out</button>
        </div>
      `;
      navActions.appendChild(profileWrap);

      const profileButton = document.getElementById("ntdProfileButton");
      const profileMenu = document.getElementById("ntdProfileMenu");
      profileButton.addEventListener("click", event => {
        event.stopPropagation();
        profileMenu.hidden = !profileMenu.hidden;
        profileButton.setAttribute("aria-expanded", String(!profileMenu.hidden));
      });
      document.addEventListener("click", event => {
        if (!event.target.closest(".ntd-profile-wrap")) {
          profileMenu.hidden = true;
          profileButton.setAttribute("aria-expanded", "false");
        }
      });
      document.getElementById("ntdGlobalSignOut").addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        window.location.reload();
      });
    });
  }
})();


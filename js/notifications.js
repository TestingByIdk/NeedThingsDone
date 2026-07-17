const notifications = [
  {
    id: 1,
    category: "messages",
    icon: "💬",
    title: "New message from Mia",
    description: "“Would tomorrow evening work?”",
    time: "6 minutes ago",
    sortOrder: 8,
    unread: true,
    priority: "normal",
    href: "messages.html"
  },
  {
    id: 2,
    category: "reviews",
    icon: "⭐",
    title: "New 4-star review",
    description: "Mia mentioned Professional and Slow Replies.",
    time: "2 hours ago",
    sortOrder: 7,
    unread: true,
    priority: "normal",
    href: "reviews.html"
  },
  {
    id: 3,
    category: "reviews",
    icon: "🛠️",
    title: "Issue marked resolved",
    description: "A reviewer marked your response as resolving their concern.",
    time: "Yesterday",
    sortOrder: 6,
    unread: true,
    priority: "normal",
    href: "reviews.html"
  },
  {
    id: 4,
    category: "account",
    icon: "🛡️",
    title: "Review report updated",
    description: "An admin decision will appear here after moderation is connected.",
    time: "Yesterday",
    sortOrder: 5,
    unread: true,
    priority: "high",
    href: "reviews.html"
  },
  {
    id: 5,
    category: "account",
    icon: "🏅",
    title: "Badge earned",
    description: "You unlocked Completed Otto Setup.",
    time: "2 days ago",
    sortOrder: 4,
    unread: false,
    priority: "milestone",
    href: "dashboard.html"
  },
  {
    id: 6,
    category: "messages",
    icon: "💬",
    title: "Maple Corner Shop replied",
    description: "“Thanks! We’ll send the link shortly.”",
    time: "2 days ago",
    sortOrder: 3,
    unread: false,
    priority: "normal",
    href: "messages.html"
  },
  {
    id: 7,
    category: "account",
    icon: "👀",
    title: "Profile milestone",
    description: "Your profile reached 100 views.",
    time: "3 days ago",
    sortOrder: 2,
    unread: false,
    priority: "milestone",
    href: "dashboard.html"
  },
  {
    id: 8,
    category: "account",
    icon: "📄",
    title: "Public document opened",
    description: "A visitor opened your linked resume or flyer.",
    time: "4 days ago",
    sortOrder: 1,
    unread: false,
    priority: "normal",
    href: "public-profile.html"
  }
];

const $ = id => document.getElementById(id);

const el = {
  tabs: document.querySelectorAll(".notification-tab"),
  list: $("notificationList"),
  empty: $("notificationEmptyState"),
  count: $("visibleNotificationCount"),
  sort: $("notificationSort"),
  markAllRead: $("markAllRead"),
  clearRead: $("clearRead"),
  resetFilters: $("resetNotificationFilters"),
  unreadSummary: $("unreadSummary"),
  messageSummary: $("messageSummary"),
  reviewSummary: $("reviewSummary"),
  accountSummary: $("accountSummary"),
  openBellMenu: $("openBellMenu"),
  bellMenu: $("bellMenu"),
  bellUnreadCount: $("bellUnreadCount"),
  bellMenuCount: $("bellMenuCount"),
  bellMenuList: $("bellMenuList"),
  markBellRead: $("markBellRead"),
  toast: $("notificationToast"),
  preferenceInputs: document.querySelectorAll(".notification-toggle-list input")
};

let activeFilter = "all";
let removedNotificationIds = new Set();

initialize();

function initialize() {
  loadPreferences();
  bindEvents();
  renderEverything();
}

function bindEvents() {
  el.tabs.forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;

      el.tabs.forEach(tab => {
        tab.classList.toggle("active", tab === button);
      });

      renderNotificationList();
    });
  });

  el.sort.addEventListener("change", renderNotificationList);
  el.markAllRead.addEventListener("click", markEverythingRead);
  el.markBellRead.addEventListener("click", markEverythingRead);
  el.clearRead.addEventListener("click", clearReadNotifications);
  el.resetFilters.addEventListener("click", showAllNotifications);

  el.openBellMenu.addEventListener("click", event => {
    event.stopPropagation();

    const open = el.bellMenu.hidden;
    el.bellMenu.hidden = !open;

    el.openBellMenu.setAttribute(
      "aria-expanded",
      String(open)
    );

    if (open) {
      renderBellMenu();
    }
  });

  document.addEventListener("click", event => {
    if (
      !el.bellMenu.contains(event.target) &&
      event.target !== el.openBellMenu
    ) {
      closeBellMenu();
    }
  });

  el.preferenceInputs.forEach(input => {
    input.addEventListener("change", savePreferences);
  });
}

function renderEverything() {
  renderNotificationList();
  renderSummaries();
  renderBellMenu();
}

function getVisibleNotifications() {
  let visible = notifications.filter(notification => {
    if (removedNotificationIds.has(notification.id)) {
      return false;
    }

    if (activeFilter === "unread") {
      return notification.unread;
    }

    if (activeFilter === "all") {
      return true;
    }

    return notification.category === activeFilter;
  });

  visible = [...visible];

  if (el.sort.value === "oldest") {
    visible.sort((a, b) => a.sortOrder - b.sortOrder);
  } else if (el.sort.value === "priority") {
    const rank = {
      high: 3,
      milestone: 2,
      normal: 1
    };

    visible.sort((a, b) => {
      return (
        rank[b.priority] - rank[a.priority] ||
        b.sortOrder - a.sortOrder
      );
    });
  } else {
    visible.sort((a, b) => b.sortOrder - a.sortOrder);
  }

  return visible;
}

function renderNotificationList() {
  const visible = getVisibleNotifications();

  el.list.innerHTML = "";

  visible.forEach(notification => {
    el.list.appendChild(
      createNotificationCard(notification)
    );
  });

  el.count.textContent =
    `${visible.length} notification${visible.length === 1 ? "" : "s"}`;

  el.empty.hidden = visible.length > 0;
  el.list.hidden = visible.length === 0;

  renderSummaries();
  renderBellMenu();
}

function createNotificationCard(notification) {
  const article = document.createElement("article");

  article.className = "notification-card";

  if (notification.unread) {
    article.classList.add("unread");
  }

  article.innerHTML = `
    <div class="notification-icon">
      ${notification.icon}
    </div>

    <div class="notification-content">
      <div class="notification-title-row">
        <div>
          <h3>${escapeHTML(notification.title)}</h3>
          ${renderPriorityBadge(notification.priority)}
        </div>

        <time>${escapeHTML(notification.time)}</time>
      </div>

      <p>${escapeHTML(notification.description)}</p>

      <div class="notification-actions">
        <a href="${escapeHTML(notification.href)}">
          Open →
        </a>

        <button
          class="mark-notification-button"
          type="button"
        >
          ${notification.unread ? "Mark as read" : "Mark unread"}
        </button>

        <button
          class="remove-notification-button"
          type="button"
        >
          Remove
        </button>
      </div>
    </div>

    ${
      notification.unread
        ? '<span class="unread-indicator" aria-label="Unread"></span>'
        : ""
    }
  `;

  article
    .querySelector(".mark-notification-button")
    .addEventListener("click", () => {
      notification.unread = !notification.unread;
      renderEverything();
    });

  article
    .querySelector(".remove-notification-button")
    .addEventListener("click", () => {
      removedNotificationIds.add(notification.id);
      renderEverything();
      showToast("Notification removed for this demo.");
    });

  article.addEventListener("click", event => {
    if (
      event.target.closest("button") ||
      event.target.closest("a")
    ) {
      return;
    }

    notification.unread = false;
    renderEverything();
  });

  return article;
}

function renderPriorityBadge(priority) {
  if (priority === "high") {
    return '<span class="priority-badge high">High priority</span>';
  }

  if (priority === "milestone") {
    return '<span class="priority-badge milestone">Milestone</span>';
  }

  return '<span class="priority-badge normal">Normal</span>';
}

function renderSummaries() {
  const activeNotifications =
    notifications.filter(notification => {
      return !removedNotificationIds.has(notification.id);
    });

  const unreadCount =
    activeNotifications.filter(notification => {
      return notification.unread;
    }).length;

  el.unreadSummary.textContent = unreadCount;

  el.messageSummary.textContent =
    activeNotifications.filter(notification => {
      return notification.category === "messages";
    }).length;

  el.reviewSummary.textContent =
    activeNotifications.filter(notification => {
      return notification.category === "reviews";
    }).length;

  el.accountSummary.textContent =
    activeNotifications.filter(notification => {
      return (
        notification.category === "account" &&
        notification.priority === "high"
      );
    }).length;

  el.bellUnreadCount.textContent = unreadCount;
  el.bellUnreadCount.hidden = unreadCount === 0;

  el.bellMenuCount.textContent =
    `${unreadCount} unread`;
}

function renderBellMenu() {
  const latest =
    notifications
      .filter(notification => {
        return !removedNotificationIds.has(notification.id);
      })
      .sort((a, b) => b.sortOrder - a.sortOrder)
      .slice(0, 4);

  el.bellMenuList.innerHTML = "";

  latest.forEach(notification => {
    const item = document.createElement("a");

    item.href = notification.href;

    item.className = notification.unread
      ? "bell-menu-item unread"
      : "bell-menu-item";

    item.innerHTML = `
      <span>${notification.icon}</span>

      <div>
        <strong>${escapeHTML(notification.title)}</strong>
        <p>${escapeHTML(notification.description)}</p>
        <small>${escapeHTML(notification.time)}</small>
      </div>
    `;

    item.addEventListener("click", () => {
      notification.unread = false;
      renderEverything();
    });

    el.bellMenuList.appendChild(item);
  });
}

function markEverythingRead() {
  notifications.forEach(notification => {
    if (!removedNotificationIds.has(notification.id)) {
      notification.unread = false;
    }
  });

  renderEverything();
  showToast("All notifications marked as read.");
}

function clearReadNotifications() {
  notifications.forEach(notification => {
    if (!notification.unread) {
      removedNotificationIds.add(notification.id);
    }
  });

  renderEverything();
  showToast("Read notifications cleared.");
}

function showAllNotifications() {
  activeFilter = "all";

  el.tabs.forEach(tab => {
    tab.classList.toggle(
      "active",
      tab.dataset.filter === "all"
    );
  });

  el.sort.value = "newest";
  renderNotificationList();
}

function closeBellMenu() {
  el.bellMenu.hidden = true;

  el.openBellMenu.setAttribute(
    "aria-expanded",
    "false"
  );
}

function savePreferences() {
  const preferences = {};

  el.preferenceInputs.forEach(input => {
    preferences[input.id] = input.checked;
  });

  localStorage.setItem(
    "ntdNotificationPreferences",
    JSON.stringify(preferences)
  );

  showToast("Notification preferences saved.");
}

function loadPreferences() {
  try {
    const preferences =
      JSON.parse(
        localStorage.getItem("ntdNotificationPreferences")
      ) || {};

    el.preferenceInputs.forEach(input => {
      if (Object.prototype.hasOwnProperty.call(preferences, input.id)) {
        input.checked = Boolean(preferences[input.id]);
      }
    });
  } catch {
    // Use defaults.
  }
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

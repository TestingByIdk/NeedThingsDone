const conversations = [
  {
    id: "otto",
    name: "Otto Assistant",
    type: "assistant",
    avatar: "🐙",
    headline: "NeedThingsDone helper",
    location: "NeedThingsDone",
    online: true,
    unread: 0,
    lastMessage: "Need help understanding your dashboard?",
    lastTime: "Now",
    responseTime: "Replies instantly",
    messagingNotice: "Otto is an automated helper for NeedThingsDone.",
    tags: ["Helpful", "Platform Guide"],
    services: ["Profile Help", "Website Guidance"],
    messages: [
      {
        sender: "them",
        text: "Hi! I’m Otto. I can help explain how your NeedThingsDone account works.",
        time: "8:30 PM"
      },
      {
        sender: "them",
        text: "Your real customer conversations will stay separate from this chat.",
        time: "8:30 PM"
      }
    ]
  },
  {
    id: "mia",
    name: "Mia Tremblay",
    type: "individual",
    avatar: "👤",
    headline: "Looking for computer repair help",
    location: "Ottawa, Ontario",
    online: true,
    unread: 2,
    lastMessage: "Would tomorrow evening work?",
    lastTime: "6m",
    responseTime: "Usually replies within 1 hour",
    messagingNotice: "This person contacted you from your public profile.",
    tags: ["Friendly", "Detailed"],
    services: ["Computer Repair"],
    messages: [
      {
        sender: "them",
        text: "Hi! I found your profile while searching for computer repair.",
        time: "7:42 PM"
      },
      {
        sender: "them",
        text: "My laptop keeps freezing whenever I open a game. Would you be able to take a look?",
        time: "7:43 PM"
      },
      {
        sender: "me",
        text: "Sure. I can help diagnose it. Do you know whether it started after an update or new program?",
        time: "7:51 PM"
      },
      {
        sender: "them",
        text: "It started after a Windows update last week.",
        time: "8:01 PM"
      },
      {
        sender: "them",
        text: "Would tomorrow evening work?",
        time: "8:02 PM"
      }
    ]
  },
  {
    id: "maple-shop",
    name: "Maple Corner Shop",
    type: "shop",
    avatar: "🛍️",
    headline: "Local crafts and custom gifts",
    location: "Orléans, Ontario",
    online: false,
    unread: 0,
    lastMessage: "Thanks! We’ll send the link shortly.",
    lastTime: "2h",
    responseTime: "Usually replies within 6 hours",
    messagingNotice: "This shop uses NeedThingsDone messages.",
    tags: ["Local Shop", "Custom Orders"],
    services: ["Arts & Crafts", "Custom Gifts"],
    messages: [
      {
        sender: "me",
        text: "Hi! Do you make custom birthday cards?",
        time: "3:14 PM"
      },
      {
        sender: "them",
        text: "Yes! We can personalize the design, colours, and message.",
        time: "3:38 PM"
      },
      {
        sender: "me",
        text: "Perfect. Could you send me the order page?",
        time: "3:44 PM"
      },
      {
        sender: "them",
        text: "Thanks! We’ll send the link shortly.",
        time: "4:02 PM"
      }
    ]
  },
  {
    id: "jordan",
    name: "Jordan Lee",
    type: "individual",
    avatar: "👤",
    headline: "Dog walking and pet care",
    location: "Nepean, Ontario",
    online: false,
    unread: 0,
    lastMessage: "No worries, thanks for letting me know.",
    lastTime: "Yesterday",
    responseTime: "Usually replies within 3 hours",
    messagingNotice: "You started this conversation from Jordan’s profile.",
    tags: ["Reliable", "Friendly"],
    services: ["Dog Walking", "Pet Care"],
    messages: [
      {
        sender: "me",
        text: "Are you available this Saturday afternoon?",
        time: "Yesterday, 11:20 AM"
      },
      {
        sender: "them",
        text: "I’m booked that afternoon, unfortunately.",
        time: "Yesterday, 12:08 PM"
      },
      {
        sender: "me",
        text: "No worries, thanks for letting me know.",
        time: "Yesterday, 12:12 PM"
      }
    ]
  }
];

const $ = id => document.getElementById(id);

const el = {
  sidebar: $("conversationSidebar"),
  list: $("conversationList"),
  emptyList: $("conversationEmpty"),
  search: $("conversationSearch"),
  filterButtons: document.querySelectorAll(".conversation-filter"),
  openList: $("openConversationList"),
  closeList: $("closeConversationList"),
  profilePanel: $("profilePanel"),
  openProfile: $("openProfilePanel"),
  closeProfile: $("closeProfilePanel"),
  overlay: $("messagesOverlay"),
  chatAvatar: $("chatAvatar"),
  chatName: $("chatName"),
  chatStatus: $("chatStatus"),
  chatMessages: $("chatMessages"),
  chatEmpty: $("chatEmptyState"),
  composer: $("messageComposer"),
  messageInput: $("messageInput"),
  characterCount: $("messageCharacterCount"),
  menuButton: $("conversationMenuButton"),
  menu: $("chatMenu"),
  profileContent: $("profilePanelContent"),
  report: $("reportConversation"),
  block: $("blockConversation"),
  archive: $("archiveConversation"),
  toast: $("messagesToast")
};

let activeConversationId = null;
let activeFilter = "all";
let archivedConversationIds = new Set();

initialize();

function initialize() {
  bindEvents();
  renderConversationList();
}

function bindEvents() {
  el.search.addEventListener("input", renderConversationList);

  el.filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;

      el.filterButtons.forEach(item => {
        item.classList.toggle(
          "active",
          item === button
        );
      });

      renderConversationList();
    });
  });

  el.openList.addEventListener(
    "click",
    () => openMobilePanel("conversations")
  );

  el.closeList.addEventListener(
    "click",
    closeMobilePanels
  );

  el.openProfile.addEventListener(
    "click",
    () => openMobilePanel("profile")
  );

  el.closeProfile.addEventListener(
    "click",
    closeMobilePanels
  );

  el.overlay.addEventListener(
    "click",
    closeMobilePanels
  );

  el.messageInput.addEventListener(
    "input",
    handleMessageInput
  );

  el.composer.addEventListener(
    "submit",
    sendMessage
  );

  el.menuButton.addEventListener(
    "click",
    toggleConversationMenu
  );

  document.addEventListener(
    "click",
    event => {
      if (
        !el.menu.contains(event.target) &&
        event.target !== el.menuButton
      ) {
        closeConversationMenu();
      }
    }
  );

  el.report.addEventListener(
    "click",
    () => {
      showToast(
        "The report workflow will connect to admin moderation later."
      );

      closeConversationMenu();
    }
  );

  el.block.addEventListener(
    "click",
    () => {
      showToast(
        "Blocking will require a signed-in account and confirmation."
      );

      closeConversationMenu();
    }
  );

  el.archive.addEventListener(
    "click",
    archiveActiveConversation
  );
}

function renderConversationList() {
  const query =
    el.search.value.trim().toLowerCase();

  const filtered =
    conversations.filter(conversation => {
      if (
        archivedConversationIds.has(
          conversation.id
        )
      ) {
        return false;
      }

      const matchesQuery =
        !query ||
        [
          conversation.name,
          conversation.headline,
          conversation.lastMessage,
          ...conversation.tags,
          ...conversation.services
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      if (!matchesQuery) {
        return false;
      }

      if (activeFilter === "unread") {
        return conversation.unread > 0;
      }

      if (activeFilter === "shops") {
        return conversation.type === "shop";
      }

      if (activeFilter === "individuals") {
        return conversation.type === "individual";
      }

      return true;
    });

  el.list.innerHTML = "";

  filtered.forEach(conversation => {
    el.list.appendChild(
      createConversationButton(conversation)
    );
  });

  el.emptyList.hidden =
    filtered.length > 0;
}

function createConversationButton(conversation) {
  const button =
    document.createElement("button");

  button.type = "button";

  button.className =
    "conversation-item";

  button.classList.toggle(
    "active",
    conversation.id === activeConversationId
  );

  button.innerHTML = `
    <div class="conversation-avatar">
      ${conversation.avatar}

      ${
        conversation.online
          ? '<span class="online-dot"></span>'
          : ""
      }
    </div>

    <div class="conversation-item-main">
      <div>
        <strong>
          ${escapeHTML(conversation.name)}
        </strong>

        <time>
          ${escapeHTML(conversation.lastTime)}
        </time>
      </div>

      <p>
        ${escapeHTML(conversation.lastMessage)}
      </p>
    </div>

    ${
      conversation.unread > 0
        ? `
          <span class="unread-badge">
            ${conversation.unread}
          </span>
        `
        : ""
    }
  `;

  button.addEventListener(
    "click",
    () => {
      selectConversation(
        conversation.id
      );
    }
  );

  return button;
}

function selectConversation(id) {
  activeConversationId = id;

  const conversation =
    getActiveConversation();

  if (!conversation) {
    return;
  }

  conversation.unread = 0;

  renderConversationList();
  renderChat(conversation);
  renderProfilePanel(conversation);

  el.chatEmpty.hidden = true;
  el.composer.hidden = false;

  if (window.innerWidth <= 900) {
    closeMobilePanels();
  }
}

function renderChat(conversation) {
  el.chatAvatar.textContent =
    conversation.avatar;

  el.chatName.textContent =
    conversation.name;

  el.chatStatus.textContent =
    conversation.online
      ? `Online · ${conversation.responseTime}`
      : conversation.responseTime;

  el.chatMessages.innerHTML = "";

  const notice =
    document.createElement("div");

  notice.className =
    "conversation-start-notice";

  notice.innerHTML = `
    <strong>
      ${escapeHTML(conversation.messagingNotice)}
    </strong>

    <span>
      Keep the conversation respectful and focused on the service.
    </span>
  `;

  el.chatMessages.appendChild(notice);

  conversation.messages.forEach(message => {
    el.chatMessages.appendChild(
      createMessageBubble(message)
    );
  });

  requestAnimationFrame(() => {
    el.chatMessages.scrollTop =
      el.chatMessages.scrollHeight;
  });
}

function createMessageBubble(message) {
  const wrapper =
    document.createElement("div");

  wrapper.className =
    message.sender === "me"
      ? "message-row mine"
      : "message-row theirs";

  wrapper.innerHTML = `
    <div class="message-bubble">
      <p>
        ${escapeHTML(message.text)}
      </p>

      <time>
        ${escapeHTML(message.time)}
      </time>
    </div>
  `;

  return wrapper;
}

function renderProfilePanel(conversation) {
  const typeLabel =
    conversation.type === "shop"
      ? "Shop"
      : conversation.type === "assistant"
        ? "Assistant"
        : "Individual";

  el.profileContent.innerHTML = `
    <div class="profile-panel-avatar">
      ${conversation.avatar}
    </div>

    <p class="profile-panel-type">
      ${typeLabel}
    </p>

    <h3>
      ${escapeHTML(conversation.name)}
    </h3>

    <p class="profile-panel-headline">
      ${escapeHTML(conversation.headline)}
    </p>

    <p class="profile-panel-location">
      📍 ${escapeHTML(conversation.location)}
    </p>

    <div class="profile-panel-response">
      <span>
        ${conversation.online ? "🟢" : "🟡"}
      </span>

      <div>
        <strong>
          Response time
        </strong>

        <p>
          ${escapeHTML(conversation.responseTime)}
        </p>
      </div>
    </div>

    <section class="profile-panel-section">
      <strong>Profile tags</strong>

      <div class="profile-panel-tags">
        ${conversation.tags
          .map(tag =>
            `<span>${escapeHTML(tag)}</span>`
          )
          .join("")}
      </div>
    </section>

    <section class="profile-panel-section">
      <strong>Services</strong>

      <div class="profile-panel-services">
        ${conversation.services
          .map(service =>
            `<span>${escapeHTML(service)}</span>`
          )
          .join("")}
      </div>
    </section>

    <a
      class="secondary-btn profile-panel-link"
      href="public-profile.html?profile=${encodeURIComponent(conversation.id)}"
    >
      View Public Profile
    </a>

    <p class="profile-panel-reminder">
      You can leave this conversation and continue browsing while waiting for a reply.
    </p>
  `;
}

function handleMessageInput() {
  el.characterCount.textContent =
    `${el.messageInput.value.length}/1000`;

  autoResizeTextarea();
}

function autoResizeTextarea() {
  el.messageInput.style.height = "auto";

  el.messageInput.style.height =
    `${Math.min(
      el.messageInput.scrollHeight,
      150
    )}px`;
}

function sendMessage(event) {
  event.preventDefault();

  const conversation =
    getActiveConversation();

  const value =
    el.messageInput.value.trim();

  if (!conversation || !value) {
    return;
  }

  conversation.messages.push({
    sender: "me",
    text: value,
    time: "Just now"
  });

  conversation.lastMessage = value;
  conversation.lastTime = "Now";

  el.messageInput.value = "";
  el.characterCount.textContent =
    "0/1000";

  autoResizeTextarea();
  renderConversationList();
  renderChat(conversation);
}

function toggleConversationMenu() {
  const willOpen =
    el.menu.hidden;

  el.menu.hidden = !willOpen;

  el.menuButton.setAttribute(
    "aria-expanded",
    String(willOpen)
  );
}

function closeConversationMenu() {
  el.menu.hidden = true;

  el.menuButton.setAttribute(
    "aria-expanded",
    "false"
  );
}

function archiveActiveConversation() {
  const conversation =
    getActiveConversation();

  if (!conversation) {
    return;
  }

  archivedConversationIds.add(
    conversation.id
  );

  activeConversationId = null;

  el.chatAvatar.textContent = "👤";
  el.chatName.textContent =
    "Select a conversation";
  el.chatStatus.textContent =
    "Choose someone from your inbox.";

  el.chatMessages.innerHTML = "";
  el.chatEmpty.hidden = false;
  el.composer.hidden = true;

  el.profileContent.innerHTML = `
    <div class="profile-panel-empty">
      <span>👤</span>

      <p>
        Select a conversation to view profile details.
      </p>
    </div>
  `;

  renderConversationList();

  showToast(
    "Conversation archived locally for this demo."
  );

  closeConversationMenu();
}

function openMobilePanel(panel) {
  if (panel === "conversations") {
    el.sidebar.classList.add("mobile-open");
  }

  if (panel === "profile") {
    el.profilePanel.classList.add(
      "mobile-open"
    );
  }

  el.overlay.classList.add("active");

  document.body.classList.add(
    "messages-panel-open"
  );
}

function closeMobilePanels() {
  el.sidebar.classList.remove(
    "mobile-open"
  );

  el.profilePanel.classList.remove(
    "mobile-open"
  );

  el.overlay.classList.remove("active");

  document.body.classList.remove(
    "messages-panel-open"
  );
}

function getActiveConversation() {
  return conversations.find(
    conversation =>
      conversation.id === activeConversationId
  );
}

function showToast(message) {
  el.toast.textContent = message;

  el.toast.classList.add("visible");

  clearTimeout(showToast.timeout);

  showToast.timeout =
    setTimeout(() => {
      el.toast.classList.remove("visible");
    }, 2600);
}

function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    character => {
      const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return replacements[character];
    }
  );
}

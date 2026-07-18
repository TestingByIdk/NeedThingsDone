(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const state = { user: null, conversations: [], activeId: null, filter: "all", channel: null };
  const el = {};

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    Object.assign(el, {
      sidebar: $("conversationSidebar"), list: $("conversationList"), emptyList: $("conversationEmpty"),
      search: $("conversationSearch"), filters: [...document.querySelectorAll(".conversation-filter")],
      openList: $("openConversationList"), closeList: $("closeConversationList"),
      profilePanel: $("profilePanel"), openProfile: $("openProfilePanel"), closeProfile: $("closeProfilePanel"),
      overlay: $("messagesOverlay"), avatar: $("chatAvatar"), name: $("chatName"), status: $("chatStatus"),
      messages: $("chatMessages"), emptyChat: $("chatEmptyState"), composer: $("messageComposer"),
      input: $("messageInput"), count: $("messageCharacterCount"), menuButton: $("conversationMenuButton"),
      menu: $("chatMenu"), profileContent: $("profilePanelContent"), toast: $("messagesToast"),
      report: $("reportConversation"), block: $("blockConversation"), archive: $("archiveConversation")
    });

    bindEvents();
    if (!window.supabaseClient) return fail("Supabase did not load. Refresh the page and try again.");

    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    if (error || !session?.user) {
      location.replace("../onboarding/login.html?next=../pages/messages.html");
      return;
    }
    state.user = session.user;

    await maybeCreateConversationFromUrl();
    await loadConversations();
    subscribeRealtime();
  }

  function bindEvents() {
    el.search?.addEventListener("input", renderConversationList);
    el.filters.forEach((button) => button.addEventListener("click", () => {
      state.filter = button.dataset.filter || "all";
      el.filters.forEach((item) => item.classList.toggle("active", item === button));
      renderConversationList();
    }));
    el.openList?.addEventListener("click", () => openPanel("conversations"));
    el.closeList?.addEventListener("click", closePanels);
    el.openProfile?.addEventListener("click", () => openPanel("profile"));
    el.closeProfile?.addEventListener("click", closePanels);
    el.overlay?.addEventListener("click", closePanels);
    el.input?.addEventListener("input", () => {
      el.count.textContent = `${el.input.value.length}/1000`;
      el.input.style.height = "auto";
      el.input.style.height = `${Math.min(el.input.scrollHeight, 160)}px`;
    });
    el.composer?.addEventListener("submit", sendMessage);
    el.menuButton?.addEventListener("click", (event) => {
      event.stopPropagation();
      el.menu.hidden = !el.menu.hidden;
      el.menuButton.setAttribute("aria-expanded", String(!el.menu.hidden));
    });
    document.addEventListener("click", () => { if (el.menu) el.menu.hidden = true; });
    el.report?.addEventListener("click", () => showToast("Reporting will be connected to moderation next."));
    el.block?.addEventListener("click", () => showToast("Blocking will be added with moderation tools."));
    el.archive?.addEventListener("click", archiveConversation);
  }

  async function maybeCreateConversationFromUrl() {
    const params = new URLSearchParams(location.search);
    const recipientId = params.get("recipient");
    if (!recipientId || recipientId === state.user.id) return;

    const { data, error } = await window.supabaseClient.rpc("get_or_create_direct_conversation", { other_user_id: recipientId });
    if (error) return showToast(`Could not start conversation: ${error.message}`);
    state.activeId = data;
    history.replaceState({}, "", "messages.html");
  }

  async function loadConversations() {
    setLoading(true);
    const { data, error } = await window.supabaseClient.rpc("get_my_conversations");
    setLoading(false);
    if (error) return fail(`Could not load messages: ${error.message}`);

    state.conversations = (data || []).map((row) => ({
      id: row.conversation_id,
      name: row.other_display_name || "NeedThingsDone member",
      avatar: row.other_avatar_url || "👤",
      type: row.other_account_type || "individual",
      headline: row.other_headline || "NeedThingsDone member",
      location: row.other_location || "Canada",
      unread: Number(row.unread_count || 0),
      lastMessage: row.last_message || "Conversation started",
      lastTime: formatRelative(row.last_message_at || row.created_at),
      lastMessageAt: row.last_message_at || row.created_at,
      archived: Boolean(row.archived)
    }));

    renderConversationList();
    const initial = state.activeId || state.conversations[0]?.id;
    if (initial) await openConversation(initial);
  }

  function renderConversationList() {
    const query = (el.search?.value || "").trim().toLowerCase();
    const filtered = state.conversations.filter((item) => {
      if (item.archived) return false;
      if (state.filter === "unread" && item.unread < 1) return false;
      if (state.filter === "shops" && item.type !== "shop") return false;
      if (state.filter === "individuals" && item.type !== "individual") return false;
      return !query || `${item.name} ${item.headline} ${item.lastMessage}`.toLowerCase().includes(query);
    });

    el.list.innerHTML = filtered.map((item) => `
      <button type="button" class="conversation-item ${item.id === state.activeId ? "active" : ""}" data-id="${item.id}">
        <div class="conversation-avatar">${renderAvatar(item.avatar)}</div>
        <div class="conversation-copy"><div><strong>${escapeHTML(item.name)}</strong><time>${escapeHTML(item.lastTime)}</time></div>
        <p>${escapeHTML(item.lastMessage)}</p></div>
        ${item.unread ? `<span class="conversation-unread">${item.unread > 99 ? "99+" : item.unread}</span>` : ""}
      </button>`).join("");
    el.emptyList.hidden = filtered.length > 0;
    el.list.querySelectorAll("[data-id]").forEach((button) => button.addEventListener("click", () => openConversation(button.dataset.id)));
  }

  async function openConversation(id) {
    state.activeId = id;
    renderConversationList();
    closePanels();
    const conversation = state.conversations.find((item) => item.id === id);
    if (!conversation) return;

    el.avatar.innerHTML = renderAvatar(conversation.avatar);
    el.name.textContent = conversation.name;
    el.status.textContent = conversation.headline;
    el.emptyChat.hidden = true;
    el.composer.hidden = false;
    renderProfile(conversation);

    const { data, error } = await window.supabaseClient
      .from("messages")
      .select("id, sender_id, body, created_at, read_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (error) return showToast(`Could not load this chat: ${error.message}`);

    renderMessages(data || []);
    await window.supabaseClient.rpc("mark_conversation_read", { target_conversation_id: id });
    conversation.unread = 0;
    renderConversationList();
  }

  function renderMessages(messages) {
    el.messages.innerHTML = messages.map((message) => {
      const mine = message.sender_id === state.user.id;
      return `<article class="chat-message ${mine ? "sent" : "received"}">
        <div><p>${escapeHTML(message.body)}</p><time>${formatTime(message.created_at)}</time></div>
      </article>`;
    }).join("");
    if (!messages.length) el.messages.innerHTML = `<div class="conversation-empty"><span>👋</span><p>Say hello to begin this conversation.</p></div>`;
    requestAnimationFrame(() => { el.messages.scrollTop = el.messages.scrollHeight; });
  }

  async function sendMessage(event) {
    event.preventDefault();
    const body = el.input.value.trim();
    if (!body || !state.activeId) return;
    const button = $("sendMessage");
    button.disabled = true;

    const { error } = await window.supabaseClient.from("messages").insert({
      conversation_id: state.activeId,
      sender_id: state.user.id,
      body
    });
    button.disabled = false;
    if (error) return showToast(`Message not sent: ${error.message}`);

    el.input.value = "";
    el.count.textContent = "0/1000";
    el.input.style.height = "auto";
    await openConversation(state.activeId);
    await loadConversationsSilently();
  }

  async function loadConversationsSilently() {
    const current = state.activeId;
    const { data } = await window.supabaseClient.rpc("get_my_conversations");
    if (!data) return;
    state.conversations = data.map((row) => ({
      id: row.conversation_id, name: row.other_display_name || "NeedThingsDone member", avatar: row.other_avatar_url || "👤",
      type: row.other_account_type || "individual", headline: row.other_headline || "NeedThingsDone member",
      location: row.other_location || "Canada", unread: Number(row.unread_count || 0), lastMessage: row.last_message || "Conversation started",
      lastTime: formatRelative(row.last_message_at || row.created_at), lastMessageAt: row.last_message_at || row.created_at, archived: Boolean(row.archived)
    }));
    state.activeId = current;
    renderConversationList();
  }

  function subscribeRealtime() {
    state.channel = window.supabaseClient.channel(`messages-${state.user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async (payload) => {
        const message = payload.new;
        const belongs = state.conversations.some((item) => item.id === message.conversation_id) || message.conversation_id === state.activeId;
        if (!belongs) { await loadConversationsSilently(); return; }
        await loadConversationsSilently();
        if (message.conversation_id === state.activeId) await openConversation(state.activeId);
        else showToast("You received a new message.");
      }).subscribe();
  }

  async function archiveConversation() {
    if (!state.activeId) return;
    const { error } = await window.supabaseClient.rpc("archive_conversation", { target_conversation_id: state.activeId });
    if (error) return showToast(error.message);
    state.conversations = state.conversations.map((item) => item.id === state.activeId ? { ...item, archived: true } : item);
    state.activeId = null;
    renderConversationList();
    el.composer.hidden = true;
    el.emptyChat.hidden = false;
    showToast("Conversation archived.");
  }

  function renderProfile(item) {
    el.profileContent.innerHTML = `<div class="profile-panel-card"><div class="profile-large-avatar">${renderAvatar(item.avatar)}</div>
      <h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.headline)}</p>
      <div class="profile-detail-list"><div><span>📍</span><p>${escapeHTML(item.location)}</p></div><div><span>🛡️</span><p>Keep payments and sensitive details outside chat until you trust the recipient.</p></div></div></div>`;
  }

  function renderAvatar(value) {
    return /^https?:\/\//i.test(String(value)) ? `<img src="${escapeHTML(value)}" alt="">` : escapeHTML(value || "👤");
  }
  function openPanel(which) { closePanels(); document.body.classList.add("messages-panel-open"); el.overlay.classList.add("active"); (which === "profile" ? el.profilePanel : el.sidebar).classList.add("mobile-open"); }
  function closePanels() { document.body.classList.remove("messages-panel-open"); el.overlay?.classList.remove("active"); el.sidebar?.classList.remove("mobile-open"); el.profilePanel?.classList.remove("mobile-open"); }
  function setLoading(loading) { if (el.emptyList) { el.emptyList.hidden = !loading; el.emptyList.innerHTML = loading ? "<span>⏳</span><p>Loading conversations…</p>" : "<span>💬</span><p>No conversations yet.</p>"; } }
  function fail(message) { showToast(message); if (el.emptyList) { el.emptyList.hidden = false; el.emptyList.innerHTML = `<span>⚠️</span><p>${escapeHTML(message)}</p>`; } }
  function showToast(message) { if (!el.toast) return; el.toast.textContent = message; el.toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => el.toast.classList.remove("show"), 3500); }
  function formatTime(value) { return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value)); }
  function formatRelative(value) { const date = new Date(value); const diff = Date.now() - date.getTime(); if (diff < 60000) return "Now"; if (diff < 3600000) return `${Math.floor(diff / 60000)}m`; if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`; return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date); }
  function escapeHTML(value) { return String(value ?? "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])); }
})();

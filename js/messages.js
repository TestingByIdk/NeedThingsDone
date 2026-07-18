(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const state = {
    user: null,
    conversations: [],
    activeId: null,
    activeMessages: [],
    filter: "all",
    channel: null,
    pollTimer: null,
    loadingConversation: false
  };
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
      input: $("messageInput"), count: $("messageCharacterCount"), send: $("sendMessage"),
      menuButton: $("conversationMenuButton"), menu: $("chatMenu"), profileContent: $("profilePanelContent"),
      toast: $("messagesToast"), report: $("reportConversation"), block: $("blockConversation"),
      archive: $("archiveConversation")
    });

    bindEvents();
    if (!window.supabaseClient) return fail("Supabase did not load. Refresh the page and try again.");

    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    if (error || !session?.user) {
      location.replace("../onboarding/login.html?returnTo=pages/messages.html");
      return;
    }

    state.user = session.user;
    await maybeCreateConversationFromUrl();
    await loadConversations();
    subscribeRealtime();
    startPollingFallback();
  }

  function bindEvents() {
    el.search?.addEventListener("input", renderConversationList);
    el.filters.forEach(button => button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      el.filters.forEach(item => item.classList.toggle("active", item === button));
      renderConversationList();
    }));
    el.composer?.addEventListener("submit", sendMessage);
    el.input?.addEventListener("input", updateComposer);
    el.input?.addEventListener("keydown", event => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!el.send.disabled) el.composer.requestSubmit();
      }
    });
    el.openList?.addEventListener("click", () => openPanel("list"));
    el.closeList?.addEventListener("click", closePanels);
    el.openProfile?.addEventListener("click", () => openPanel("profile"));
    el.closeProfile?.addEventListener("click", closePanels);
    el.overlay?.addEventListener("click", closePanels);
    el.menuButton?.addEventListener("click", event => {
      event.stopPropagation();
      el.menu.hidden = !el.menu.hidden;
      el.menuButton.setAttribute("aria-expanded", String(!el.menu.hidden));
    });
    document.addEventListener("click", () => { if (el.menu) el.menu.hidden = true; });
    el.report?.addEventListener("click", () => showToast("Reporting will be connected with moderation tools."));
    el.block?.addEventListener("click", () => showToast("Blocking will be connected with moderation tools."));
    el.archive?.addEventListener("click", archiveConversation);
    window.addEventListener("beforeunload", cleanup);
  }

  function updateComposer() {
    const value = el.input.value;
    el.count.textContent = `${value.length}/1000`;
    el.input.style.height = "auto";
    el.input.style.height = `${Math.min(el.input.scrollHeight, 120)}px`;
    el.send.disabled = !value.trim() || !state.activeId;
  }

  async function maybeCreateConversationFromUrl() {
    const params = new URLSearchParams(location.search);
    const direct = params.get("conversation");
    if (direct) state.activeId = direct;
    const recipientId = params.get("recipient");
    if (!recipientId || recipientId === state.user.id) return;
    const { data, error } = await window.supabaseClient.rpc("get_or_create_direct_conversation", { other_user_id: recipientId });
    if (error) return showToast(`Could not start conversation: ${error.message}`);
    state.activeId = data;
    history.replaceState({}, "", `messages.html?conversation=${encodeURIComponent(data)}`);
  }

  async function loadConversations() {
    setLoading(true);
    const { data, error } = await window.supabaseClient.rpc("get_my_conversations");
    setLoading(false);
    if (error) return fail(`Could not load messages: ${error.message}`);
    state.conversations = mapConversations(data || []);
    renderConversationList();
    const initial = state.activeId || state.conversations[0]?.id;
    if (initial) await openConversation(initial);
  }

  function mapConversations(data) {
    return data.map(row => ({
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
  }

  function renderConversationList() {
    const query = (el.search?.value || "").trim().toLowerCase();
    const filtered = state.conversations.filter(item => {
      if (item.archived) return false;
      if (state.filter === "unread" && item.unread < 1) return false;
      if (state.filter === "shops" && item.type !== "shop") return false;
      if (state.filter === "individuals" && item.type !== "individual") return false;
      return !query || `${item.name} ${item.headline} ${item.lastMessage}`.toLowerCase().includes(query);
    });

    el.list.innerHTML = filtered.map(item => `
      <button type="button" class="conversation-item ${item.id === state.activeId ? "active" : ""} ${item.unread ? "has-unread" : ""}" data-id="${escapeHTML(item.id)}">
        <div class="conversation-avatar">${renderAvatar(item.avatar)}</div>
        <div class="conversation-copy"><div><strong>${escapeHTML(item.name)}</strong><time>${escapeHTML(item.lastTime)}</time></div><p>${escapeHTML(item.lastMessage)}</p></div>
        ${item.unread ? `<span class="conversation-unread">${item.unread > 99 ? "99+" : item.unread}</span>` : ""}
      </button>`).join("");
    el.emptyList.hidden = filtered.length > 0;
    el.list.querySelectorAll("[data-id]").forEach(button => button.addEventListener("click", () => openConversation(button.dataset.id)));
  }

  async function openConversation(id, options = {}) {
    if (state.loadingConversation && !options.silent) return;
    state.activeId = id;
    renderConversationList();
    closePanels();
    const conversation = state.conversations.find(item => item.id === id);
    if (!conversation) return;

    el.avatar.innerHTML = renderAvatar(conversation.avatar);
    el.name.textContent = conversation.name;
    el.status.textContent = conversation.headline;
    el.emptyChat.hidden = true;
    el.composer.hidden = false;
    updateComposer();
    renderProfile(conversation);
    history.replaceState({}, "", `messages.html?conversation=${encodeURIComponent(id)}`);

    state.loadingConversation = true;
    const { data, error } = await window.supabaseClient
      .from("messages")
      .select("id, sender_id, body, created_at, read_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    state.loadingConversation = false;
    if (error) return showToast(`Could not load this chat: ${error.message}`);

    const next = data || [];
    const changed = messageSignature(next) !== messageSignature(state.activeMessages);
    state.activeMessages = next;
    if (changed || !options.silent) renderMessages(next, options.keepScroll);

    const { error: readError } = await window.supabaseClient.rpc("mark_conversation_read", { target_conversation_id: id });
    if (readError) console.warn("Could not mark read", readError);
    conversation.unread = 0;
    renderConversationList();
    window.dispatchEvent(new CustomEvent("ntd:messages-updated"));
  }

  function messageSignature(messages) {
    return messages.map(item => `${item.id}:${item.read_at || ""}`).join("|");
  }

  function renderMessages(messages, keepScroll = false) {
    const nearBottom = el.messages.scrollHeight - el.messages.scrollTop - el.messages.clientHeight < 100;
    let previousDay = "";
    el.messages.innerHTML = messages.map(message => {
      const mine = message.sender_id === state.user.id;
      const day = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(message.created_at));
      const divider = day !== previousDay ? `<div class="chat-day-divider">${escapeHTML(day)}</div>` : "";
      previousDay = day;
      return `${divider}<article class="chat-message ${mine ? "sent" : "received"}" data-message-id="${escapeHTML(message.id)}"><div class="bubble">${escapeHTML(message.body).replace(/\n/g, "<br>")}</div><time>${formatTime(message.created_at)}${mine && message.read_at ? " · Seen" : ""}</time></article>`;
    }).join("");
    if (!messages.length) el.messages.innerHTML = `<div class="conversation-empty"><span>👋</span><p>Say hello to begin this conversation.</p></div>`;
    if (!keepScroll || nearBottom) requestAnimationFrame(scrollToLatest);
  }

  async function sendMessage(event) {
    event.preventDefault();
    const body = el.input.value.trim();
    if (!body || !state.activeId || el.send.disabled) return;

    const conversationId = state.activeId;
    const optimisticId = `temp-${Date.now()}`;
    const optimistic = { id: optimisticId, sender_id: state.user.id, body, created_at: new Date().toISOString(), read_at: null };
    state.activeMessages = [...state.activeMessages, optimistic];
    renderMessages(state.activeMessages);

    el.input.value = "";
    el.input.style.height = "auto";
    updateComposer();
    el.send.disabled = true;
    el.send.setAttribute("aria-busy", "true");

    const { data, error } = await window.supabaseClient
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: state.user.id, body })
      .select("id, sender_id, body, created_at, read_at")
      .single();

    el.send.removeAttribute("aria-busy");
    if (error) {
      state.activeMessages = state.activeMessages.filter(item => item.id !== optimisticId);
      renderMessages(state.activeMessages);
      el.input.value = body;
      updateComposer();
      return showToast(`Message not sent: ${error.message}`);
    }

    state.activeMessages = state.activeMessages.map(item => item.id === optimisticId ? data : item);
    renderMessages(state.activeMessages);
    await loadConversationsSilently();
    window.dispatchEvent(new CustomEvent("ntd:messages-updated"));
    el.input.focus();
  }

  async function loadConversationsSilently() {
    const current = state.activeId;
    const { data, error } = await window.supabaseClient.rpc("get_my_conversations");
    if (error || !data) return;
    state.conversations = mapConversations(data);
    state.activeId = current;
    renderConversationList();
  }

  function subscribeRealtime() {
    state.channel = window.supabaseClient
      .channel(`messages-${state.user.id}-${Date.now()}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async payload => {
        await loadConversationsSilently();
        if (payload.new.conversation_id === state.activeId) {
          await openConversation(state.activeId, { silent: true });
        } else {
          showToast("You received a new message.");
          window.dispatchEvent(new CustomEvent("ntd:messages-updated"));
        }
      })
      .subscribe(status => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") console.warn("Realtime unavailable; polling fallback remains active.");
      });
  }

  function startPollingFallback() {
    clearInterval(state.pollTimer);
    state.pollTimer = setInterval(async () => {
      if (document.hidden) return;
      await loadConversationsSilently();
      if (state.activeId) await openConversation(state.activeId, { silent: true, keepScroll: true });
    }, 2500);
  }

  function cleanup() {
    clearInterval(state.pollTimer);
    if (state.channel) window.supabaseClient.removeChannel(state.channel);
  }

  async function archiveConversation() {
    if (!state.activeId) return;
    const { error } = await window.supabaseClient.rpc("archive_conversation", { target_conversation_id: state.activeId });
    if (error) return showToast(error.message);
    state.conversations = state.conversations.map(item => item.id === state.activeId ? { ...item, archived: true } : item);
    state.activeId = null;
    state.activeMessages = [];
    renderConversationList();
    el.composer.hidden = true;
    el.emptyChat.hidden = false;
    el.messages.innerHTML = "";
    showToast("Conversation archived.");
  }

  function renderProfile(item) {
    el.profileContent.innerHTML = `<div class="profile-panel-card"><div class="profile-large-avatar">${renderAvatar(item.avatar)}</div><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.headline)}</p><div class="profile-detail-list"><div><span>📍</span><p>${escapeHTML(item.location)}</p></div><div><span>🛡️</span><p>Keep payments and sensitive details outside chat until you trust the recipient.</p></div></div><button class="profile-action" type="button">View profile</button></div>`;
  }

  function renderAvatar(value) {
    return /^https?:\/\//i.test(value || "") ? `<img src="${escapeHTML(value)}" alt="">` : escapeHTML(value || "👤");
  }
  function scrollToLatest() { el.messages.scrollTop = el.messages.scrollHeight; }
  function formatTime(value) { return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value)); }
  function formatRelative(value) {
    const date = new Date(value); const diff = Date.now() - date.getTime();
    if (diff < 60000) return "Now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
  }
  function escapeHTML(value) { return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
  function openPanel(type) { closePanels(); const target = type === "list" ? el.sidebar : el.profilePanel; target?.classList.add("mobile-open"); el.overlay?.classList.add("active"); }
  function closePanels() { el.sidebar?.classList.remove("mobile-open"); el.profilePanel?.classList.remove("mobile-open"); el.overlay?.classList.remove("active"); }
  function setLoading(loading) { if (loading) el.list.innerHTML = `<div class="conversation-empty"><span>⏳</span><p>Loading conversations…</p></div>`; }
  function fail(message) { el.list.innerHTML = `<div class="conversation-empty"><span>⚠️</span><p>${escapeHTML(message)}</p></div>`; showToast(message); }
  let toastTimer;
  function showToast(message) { if (!el.toast) return; el.toast.textContent = message; el.toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.toast.classList.remove("show"), 3200); }
})();

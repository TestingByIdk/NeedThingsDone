(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const state = { user:null, conversations:[], activeId:null, filter:"all", channel:null };
  const el = {};
  document.addEventListener("DOMContentLoaded", init);

  async function init(){
    Object.assign(el,{sidebar:$("conversationSidebar"),list:$("conversationList"),emptyList:$("conversationEmpty"),search:$("conversationSearch"),filters:[...document.querySelectorAll(".conversation-filter")],openList:$("openConversationList"),closeList:$("closeConversationList"),profilePanel:$("profilePanel"),openProfile:$("openProfilePanel"),closeProfile:$("closeProfilePanel"),overlay:$("messagesOverlay"),avatar:$("chatAvatar"),name:$("chatName"),status:$("chatStatus"),messages:$("chatMessages"),emptyChat:$("chatEmptyState"),composer:$("messageComposer"),input:$("messageInput"),count:$("messageCharacterCount"),send:$("sendMessage"),menuButton:$("conversationMenuButton"),menu:$("chatMenu"),profileContent:$("profilePanelContent"),toast:$("messagesToast"),report:$("reportConversation"),block:$("blockConversation"),archive:$("archiveConversation")});
    bindEvents();
    if(!window.supabaseClient) return fail("Supabase did not load. Refresh the page and try again.");
    const {data:{session},error}=await window.supabaseClient.auth.getSession();
    if(error||!session?.user){location.replace("../onboarding/login.html?next=../pages/messages.html");return;}
    state.user=session.user;
    await maybeCreateConversationFromUrl();
    await loadConversations();
    subscribeRealtime();
  }

  function bindEvents(){
    el.search?.addEventListener("input",renderConversationList);
    el.filters.forEach(btn=>btn.addEventListener("click",()=>{state.filter=btn.dataset.filter;el.filters.forEach(x=>x.classList.toggle("active",x===btn));renderConversationList();}));
    el.composer?.addEventListener("submit",sendMessage);
    el.input?.addEventListener("input",()=>{el.count.textContent=`${el.input.value.length}/1000`;el.input.style.height="auto";el.input.style.height=`${Math.min(el.input.scrollHeight,120)}px`;el.send.disabled=!el.input.value.trim()||!state.activeId;});
    el.input?.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();el.composer.requestSubmit();}});
    el.openList?.addEventListener("click",()=>openPanel("list"));el.closeList?.addEventListener("click",closePanels);el.openProfile?.addEventListener("click",()=>openPanel("profile"));el.closeProfile?.addEventListener("click",closePanels);el.overlay?.addEventListener("click",closePanels);
    el.menuButton?.addEventListener("click",e=>{e.stopPropagation();el.menu.hidden=!el.menu.hidden;el.menuButton.setAttribute("aria-expanded",String(!el.menu.hidden));});
    document.addEventListener("click",()=>{if(el.menu)el.menu.hidden=true;});
    el.report?.addEventListener("click",()=>showToast("Reporting will be connected with moderation tools."));el.block?.addEventListener("click",()=>showToast("Blocking will be connected with moderation tools."));el.archive?.addEventListener("click",archiveConversation);
  }

  async function maybeCreateConversationFromUrl(){
    const params=new URLSearchParams(location.search);const direct=params.get("conversation");if(direct)state.activeId=direct;
    const recipientId=params.get("recipient");if(!recipientId||recipientId===state.user.id)return;
    const {data,error}=await window.supabaseClient.rpc("get_or_create_direct_conversation",{other_user_id:recipientId});
    if(error)return showToast(`Could not start conversation: ${error.message}`);state.activeId=data;history.replaceState({},"","messages.html");
  }

  async function loadConversations(){setLoading(true);const {data,error}=await window.supabaseClient.rpc("get_my_conversations");setLoading(false);if(error)return fail(`Could not load messages: ${error.message}`);state.conversations=mapConversations(data||[]);renderConversationList();const initial=state.activeId||state.conversations[0]?.id;if(initial)await openConversation(initial);}
  function mapConversations(data){return data.map(row=>({id:row.conversation_id,name:row.other_display_name||"NeedThingsDone member",avatar:row.other_avatar_url||"👤",type:row.other_account_type||"individual",headline:row.other_headline||"NeedThingsDone member",location:row.other_location||"Canada",unread:Number(row.unread_count||0),lastMessage:row.last_message||"Conversation started",lastTime:formatRelative(row.last_message_at||row.created_at),lastMessageAt:row.last_message_at||row.created_at,archived:Boolean(row.archived)}));}

  function renderConversationList(){
    const q=(el.search?.value||"").trim().toLowerCase();const filtered=state.conversations.filter(item=>{if(item.archived)return false;if(state.filter==="unread"&&item.unread<1)return false;if(state.filter==="shops"&&item.type!=="shop")return false;if(state.filter==="individuals"&&item.type!=="individual")return false;return !q||`${item.name} ${item.headline} ${item.lastMessage}`.toLowerCase().includes(q);});
    el.list.innerHTML=filtered.map(item=>`<button type="button" class="conversation-item ${item.id===state.activeId?"active":""} ${item.unread?"has-unread":""}" data-id="${escapeHTML(item.id)}"><div class="conversation-avatar">${renderAvatar(item.avatar)}</div><div class="conversation-copy"><div><strong>${escapeHTML(item.name)}</strong><time>${escapeHTML(item.lastTime)}</time></div><p>${escapeHTML(item.lastMessage)}</p></div>${item.unread?`<span class="conversation-unread">${item.unread>99?"99+":item.unread}</span>`:""}</button>`).join("");
    el.emptyList.hidden=filtered.length>0;el.list.querySelectorAll("[data-id]").forEach(btn=>btn.addEventListener("click",()=>openConversation(btn.dataset.id)));
  }

  async function openConversation(id){
    state.activeId=id;renderConversationList();closePanels();const c=state.conversations.find(x=>x.id===id);if(!c)return;
    el.avatar.innerHTML=renderAvatar(c.avatar);el.name.textContent=c.name;el.status.textContent=c.headline;el.emptyChat.hidden=true;el.composer.hidden=false;el.send.disabled=!el.input.value.trim();renderProfile(c);
    history.replaceState({},"",`messages.html?conversation=${encodeURIComponent(id)}`);
    const {data,error}=await window.supabaseClient.from("messages").select("id, sender_id, body, created_at, read_at").eq("conversation_id",id).order("created_at",{ascending:true});
    if(error)return showToast(`Could not load this chat: ${error.message}`);renderMessages(data||[]);
    const {error:readError}=await window.supabaseClient.rpc("mark_conversation_read",{target_conversation_id:id});if(readError)console.warn("Could not mark read",readError);
    c.unread=0;renderConversationList();window.dispatchEvent(new CustomEvent("ntd:messages-updated"));
  }

  function renderMessages(messages){
    let previousDay="";el.messages.innerHTML=messages.map(m=>{const mine=m.sender_id===state.user.id;const day=new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric"}).format(new Date(m.created_at));const divider=day!==previousDay?`<div class="chat-day-divider">${escapeHTML(day)}</div>`:"";previousDay=day;return `${divider}<article class="chat-message ${mine?"sent":"received"}"><div class="bubble">${escapeHTML(m.body).replace(/\n/g,"<br>")}</div><time>${formatTime(m.created_at)}${mine&&m.read_at?" · Seen":""}</time></article>`;}).join("");
    if(!messages.length)el.messages.innerHTML=`<div class="conversation-empty"><span>👋</span><p>Say hello to begin this conversation.</p></div>`;requestAnimationFrame(()=>{el.messages.scrollTop=el.messages.scrollHeight;});
  }

  async function sendMessage(event){event.preventDefault();const body=el.input.value.trim();if(!body||!state.activeId||el.send.disabled)return;el.send.disabled=true;const old=el.send.innerHTML;el.send.setAttribute("aria-busy","true");const {error}=await window.supabaseClient.from("messages").insert({conversation_id:state.activeId,sender_id:state.user.id,body});el.send.removeAttribute("aria-busy");if(error){el.send.disabled=false;return showToast(`Message not sent: ${error.message}`);}el.input.value="";el.count.textContent="0/1000";el.input.style.height="auto";await openConversation(state.activeId);await loadConversationsSilently();window.dispatchEvent(new CustomEvent("ntd:messages-updated"));}

  async function loadConversationsSilently(){const current=state.activeId;const {data,error}=await window.supabaseClient.rpc("get_my_conversations");if(error||!data)return;state.conversations=mapConversations(data);state.activeId=current;renderConversationList();}
  function subscribeRealtime(){state.channel=window.supabaseClient.channel(`messages-${state.user.id}-${Date.now()}`).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},async payload=>{const m=payload.new;await loadConversationsSilently();if(m.conversation_id===state.activeId){await openConversation(state.activeId);}else{showToast("You received a new message.");window.dispatchEvent(new CustomEvent("ntd:messages-updated"));}}).subscribe();}
  async function archiveConversation(){if(!state.activeId)return;const {error}=await window.supabaseClient.rpc("archive_conversation",{target_conversation_id:state.activeId});if(error)return showToast(error.message);state.conversations=state.conversations.map(x=>x.id===state.activeId?{...x,archived:true}:x);state.activeId=null;renderConversationList();el.composer.hidden=true;el.emptyChat.hidden=false;showToast("Conversation archived.");}
  function renderProfile(item){el.profileContent.innerHTML=`<div class="profile-panel-card"><div class="profile-large-avatar">${renderAvatar(item.avatar)}</div><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.headline)}</p><div class="profile-detail-list"><div><span>📍</span><p>${escapeHTML(item.location)}</p></div><div><span>🛡️</span><p>Keep payments and sensitive details outside chat until you trust the recipient.</p></div></div><button class="profile-action" type="button" onclick="history.back()">View profile</button></div>`;}
  function renderAvatar(v){return /^https?:\/\//i.test(String(v))?`<img src="${escapeHTML(v)}" alt="">`:escapeHTML(v||"👤");}
  function openPanel(which){closePanels();document.body.classList.add("messages-panel-open");el.overlay.classList.add("active");(which==="profile"?el.profilePanel:el.sidebar).classList.add("mobile-open");}
  function closePanels(){document.body.classList.remove("messages-panel-open");el.overlay?.classList.remove("active");el.sidebar?.classList.remove("mobile-open");el.profilePanel?.classList.remove("mobile-open");}
  function setLoading(on){if(el.emptyList){el.emptyList.hidden=!on;el.emptyList.innerHTML=on?"<span>⏳</span><p>Loading conversations…</p>":"<span>💬</span><p>No conversations yet.</p>";}}
  function fail(msg){showToast(msg);if(el.emptyList){el.emptyList.hidden=false;el.emptyList.innerHTML=`<span>⚠️</span><p>${escapeHTML(msg)}</p>`;}}
  function showToast(msg){if(!el.toast)return;el.toast.textContent=msg;el.toast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.toast.classList.remove("show"),3500);}
  function formatTime(v){return new Intl.DateTimeFormat(undefined,{hour:"numeric",minute:"2-digit"}).format(new Date(v));}
  function formatRelative(v){const d=new Date(v),diff=Date.now()-d.getTime();if(diff<60000)return"Now";if(diff<3600000)return`${Math.floor(diff/60000)}m`;if(diff<86400000)return`${Math.floor(diff/3600000)}h`;return new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric"}).format(d);}
  function escapeHTML(v){return String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
})();

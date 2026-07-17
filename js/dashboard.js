(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const completed = read("ntdCompletedProfile", {});
  const accountProfile = read("ntdAccountProfileV1", {});
  const rawDetails = read("ntdProfileDetails", {});
  const details = { ...rawDetails, ...(completed.details || {}),
    displayName: (completed.details || {}).displayName || rawDetails.displayName || accountProfile.displayName || "",
    city: (completed.details || {}).city || rawDetails.city || (accountProfile.city || "").split(",")[0] || "",
    province: (completed.details || {}).province || rawDetails.province || (accountProfile.city || "").split(",").slice(1).join(",").trim() || ""
  };
  const extra = { ...read("ntdProfileExtraDetails", {}), ...(completed.extraDetails || {}),
    longDescription: (completed.extraDetails || {}).longDescription || read("ntdProfileExtraDetails", {}).longDescription || accountProfile.bio || "",
    website: (completed.extraDetails || {}).website || read("ntdProfileExtraDetails", {}).website || accountProfile.website || ""
  };
  const services = completed.services || read("ntdProfileServices", []) || [];
  const tags = completed.profileTags || read("ntdProfileTags", []) || [];
  const profileType = completed.type || localStorage.getItem("ntdProfileType") || localStorage.getItem("ntdActiveAccountType") || "customer";
  const types = {
    visitor:["👋","Visitor"],
    customer:["🔎","Member"],
    individual:["👤","Individual"],
    business:["🏢","Business"],
    shop:["🛍️","Shop"],
    "large-business":["📍","Multi-location business"]
  };
  const type = types[profileType] || types.customer;
  const saved = read("ntdSavedProfilesV1", read("ntdSavedProfiles", read("ntdAccountSavedItemsV1", [])));
  const notifications = read("ntdNotificationsV1", []);
  const messages = read("ntdMessagesV1", []);
  const reviews = read("ntdReviewsV1", []);

  init();
  async function init(){
    bindMenu(); bindShare(); bindSignOut();
    const user = await getUser();
    renderIdentity(user); renderCounts(); renderStrength(); renderDiscoveries(); renderActivity(); personalize();
  }
  async function getUser(){
    if(!window.supabaseClient) return null;
    try { const {data} = await window.supabaseClient.auth.getUser(); return data?.user || null; } catch { return null; }
  }
  function renderIdentity(user){
    const metadata=user?.user_metadata||{};
    const fullName=details.displayName || metadata.full_name || [metadata.first_name,metadata.last_name].filter(Boolean).join(" ") || user?.email?.split("@")[0] || "there";
    const first=fullName.split(" ")[0];
    $("welcomeName").textContent=first;
    $("sidebarName").textContent=fullName;
    $("sidebarAvatar").textContent=type[0]; $("sidebarType").textContent=type[1];
    const hour=new Date().getHours(); $("timeGreeting").textContent=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  }
  function renderCounts(){
    const unreadMessages=Array.isArray(messages)?messages.filter(x=>x.unread||x.read===false).length:0;
    const unreadNotifications=Array.isArray(notifications)?notifications.filter(x=>x.unread||x.read===false).length:0;
    const reviewItems=Array.isArray(reviews)?reviews:[];
    const savedCount=Array.isArray(saved)?saved.length:0;
    $("messageCount").textContent=unreadMessages; $("messageNavBadge").textContent=unreadMessages;
    $("notificationCount").textContent=unreadNotifications; $("notificationBadge").textContent=unreadNotifications;
    $("reviewCount").textContent=reviewItems.length; $("savedCount").textContent=savedCount;
    const ratings=reviewItems.map(x=>Number(x.rating)).filter(Boolean); if(ratings.length) $("ratingText").textContent=(ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1)+" average";
  }
  function renderStrength(){
    if(profileType==="customer" || profileType==="visitor") {
      $("profileAlert").hidden=true;
      $("profileStrengthText").textContent=profileType==="visitor" ? "Visitor" : "Member";
      $("dashboardStrengthFill").style.width="100%";
      $("profileProgressItems").innerHTML=`<div class="profile-progress-item complete"><span>✓</span><p>Your ${profileType==="visitor" ? "visitor" : "member"} account is ready.</p></div>`;
      return;
    }
    const items=[["Add a profile name",!!details.displayName,15],["Add your location",!!(details.city&&details.province),15],["Add at least three services",services.length>=3,20],["Choose profile tags",tags.length>=3,15],["Write a detailed About section",!!(extra.longDescription&&extra.longDescription.length>=100),20],["Add a contact option",!!(extra.allowMessages||extra.contactEmail||extra.contactPhone||extra.website),15]];
    const score=items.reduce((n,x)=>n+(x[1]?x[2]:0),0); $("profileStrengthText").textContent=score+"%"; $("dashboardStrengthFill").style.width=score+"%"; $("profileAlert").hidden=score>=100;
    $("profileProgressItems").innerHTML=items.map(x=>`<div class="profile-progress-item ${x[1]?"complete":""}"><span>${x[1]?"✓":"○"}</span><p>${x[0]}</p></div>`).join("");
  }
  function personalize(){
    const subtitles={
      visitor:"Browse local help, send messages, and leave reviews.",
      customer:"Find help, check replies, and keep track of what you saved.",
      individual:"Manage your services, reputation, messages, and public profile.",
      business:"Track your listing, reviews, messages, and local visibility.",
      shop:"Manage your shop presence, product links, messages, and reviews."
    };
    $("welcomeSubtitle").textContent=subtitles[profileType]||subtitles.customer;
    if(profileType==="customer" || profileType==="visitor") {
      document.querySelectorAll("[data-owner-action]").forEach(x=>x.hidden=true);
    }
    const tips={
      visitor:"Message a profile when you need details, and review services you have actually used.",
      customer:"Save useful profiles so they are easy to find later.",
      individual:"Clear services and availability make your profile easier to discover.",
      business:"Keep your contact details and service area accurate.",
      shop:"Add direct product or menu links so visitors can act quickly."
    }; $("ottoSideTip").textContent=tips[profileType]||tips.customer;
  }
  function renderDiscoveries(){
    const city=details.city||"Ottawa"; const items=[
      ["🏠","Home services near "+city,"Browse trusted local businesses.","businesses.html"],
      ["👤","Skilled individuals","Find people offering useful local skills.","individual-search.html"],
      ["🛍️","Local shops","Discover products, cafés, and local stores.","shop.html"]];
    $("discoveryList").innerHTML=items.map(x=>`<a href="${x[3]}"><span>${x[0]}</span><div><strong>${x[1]}</strong><p>${x[2]}</p></div><b>→</b></a>`).join("");
  }
  function renderActivity(){
    const activity=[];
    if(completed.details) activity.push(["👤","Profile setup saved","Your public profile information is available in this browser.","Today"]);
    if(services.length) activity.push(["🛠️","Services updated",`${services.length} service${services.length===1?"":"s"} added to your profile.`,"Recent"]);
    if(tags.length) activity.push(["🐙","Otto profile tags saved",`${tags.length} profile tags are ready.`,"Recent"]);
    if(!activity.length) activity.push(["✨","Your dashboard is ready","Start exploring or finish your profile setup.","Now"]);
    $("activityList").innerHTML=activity.map(x=>`<article><span>${x[0]}</span><div><strong>${x[1]}</strong><p>${x[2]}</p></div><time>${x[3]}</time></article>`).join("");
  }
  function bindShare(){ $("shareProfileAction")?.addEventListener("click",async()=>{const url=new URL("public-profile.html",location.href).href; try{await navigator.clipboard.writeText(url);$("shareMessage").textContent="Public profile link copied!";}catch{$("shareMessage").textContent=url;}}); }
  function bindSignOut(){ $("signOutButton").addEventListener("click",async()=>{if(window.supabaseClient) await window.supabaseClient.auth.signOut(); location.href="../onboarding/login.html";}); }
  function bindMenu(){const b=$("mobileMenuButton"),s=$("dashboardSidebar"),o=$("dashboardOverlay"); const close=()=>{s.classList.remove("mobile-open");o.classList.remove("active");document.body.classList.remove("dashboard-menu-open");b.setAttribute("aria-expanded","false")}; b.addEventListener("click",()=>{const open=s.classList.toggle("mobile-open");o.classList.toggle("active",open);document.body.classList.toggle("dashboard-menu-open",open);b.setAttribute("aria-expanded",String(open))});o.addEventListener("click",close);}
})();
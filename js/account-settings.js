(()=>{"use strict";
const SK="ntdAccountSettingsV1",PK="ntdAccountProfileV1",SV="ntdAccountSavedItemsV1";
const defaults={publicProfile:true,cityOnly:true,hideEmail:true,hidePhone:true,allowDMs:true,allowReviews:true,messagesApp:true,messagesEmail:true,reviewsApp:true,reviewsEmail:true,communityApp:true,communityEmail:false,accountApp:true,accountEmail:true,newsApp:false,newsEmail:false,theme:"light",compactMode:false,largeText:false};
const defaultProfile={displayName:"Alex Portelance",username:"alex",city:"Ottawa, Ontario",website:"",bio:"Building useful Canadian tools and helping people get things done.",skills:"Website management, social media, computer repair",availability:"Available now",avatar:""};
const defaultSaved=[{id:1,type:"businesses",title:"Ottawa Roofing",detail:"Roofing · Ottawa, Ontario"},{id:2,type:"individuals",title:"Jordan M.",detail:"Computer repair · Rockland, Ontario"},{id:3,type:"shops",title:"Maple Corner Shop",detail:"Local gifts and handmade products"},{id:4,type:"community",title:"Best local bakery for a birthday cake?",detail:"Community discussion · Ottawa"}];
const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??JSON.parse(JSON.stringify(f))}catch{return JSON.parse(JSON.stringify(f))}};
let settings=load(SK,defaults),profile=load(PK,defaultProfile),saved=load(SV,defaultSaved),savedTab="all",modalAction=null;
const save=()=>{localStorage.setItem(SK,JSON.stringify(settings));localStorage.setItem(PK,JSON.stringify(profile));localStorage.setItem(SV,JSON.stringify(saved))};
const esc=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const initials=n=>n.trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()||"").join("")||"NT";
const avatar=(el)=>{el.innerHTML=profile.avatar?`<img src="${profile.avatar}" alt="">`:initials(profile.displayName)};
function header(){document.getElementById("headerName").textContent=profile.displayName;document.getElementById("headerUsername").textContent="@"+profile.username;avatar(document.getElementById("headerAvatar"));avatar(document.getElementById("largeAvatar"))}
function populate(){displayName.value=profile.displayName;username.value=profile.username;city.value=profile.city;website.value=profile.website;bio.value=profile.bio;skills.value=profile.skills;availability.value=profile.availability;bioCount.textContent=bio.value.length;header()}
function apply(){document.body.classList.toggle("settings-compact",settings.compactMode);document.body.classList.toggle("settings-large-text",settings.largeText);localStorage.setItem("ntdThemePreference",settings.theme);if(settings.theme==="system")delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=settings.theme}
document.querySelectorAll(".settings-nav-item").forEach(b=>b.onclick=()=>{document.querySelectorAll(".settings-nav-item").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".settings-panel").forEach(p=>p.classList.toggle("active",p.dataset.panel===b.dataset.section))});
profileForm.oninput=()=>{profileSaveState.textContent="Unsaved changes";profileSaveState.classList.add("unsaved")};
profileForm.onsubmit=e=>{e.preventDefault();profile={...profile,displayName:displayName.value.trim(),username:username.value.trim().replace(/^@/,""),city:city.value.trim(),website:website.value.trim(),bio:bio.value.trim(),skills:skills.value.trim(),availability:availability.value};save();header();profileSaveState.textContent="Saved";profileSaveState.classList.remove("unsaved")};
profileForm.onreset=()=>setTimeout(()=>{populate();profileSaveState.textContent="Saved";profileSaveState.classList.remove("unsaved")});
bio.oninput=()=>bioCount.textContent=bio.value.length;
avatarUpload.onchange=e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>3*1024*1024){alert("Please choose an image smaller than 3 MB.");return}const r=new FileReader();r.onload=()=>{profile.avatar=String(r.result);save();header()};r.readAsDataURL(f)};
removeAvatar.onclick=()=>{profile.avatar="";save();header()};
document.querySelectorAll("[data-setting]").forEach(i=>{i.checked=!!settings[i.dataset.setting];i.onchange=()=>{settings[i.dataset.setting]=i.checked;save()}});
document.querySelectorAll("[data-theme-choice]").forEach(b=>{b.classList.toggle("active",b.dataset.themeChoice===settings.theme);b.onclick=()=>{settings.theme=b.dataset.themeChoice;document.querySelectorAll("[data-theme-choice]").forEach(x=>x.classList.toggle("active",x===b));save();apply()}});
compactMode.checked=!!settings.compactMode;largeText.checked=!!settings.largeText;
compactMode.onchange=()=>{settings.compactMode=compactMode.checked;save();apply()};largeText.onchange=()=>{settings.largeText=largeText.checked;save();apply()};
function renderSaved(){const list=savedTab==="all"?saved:saved.filter(x=>x.type===savedTab);savedItems.innerHTML=list.length?list.map(x=>`<article class="settings-saved-item" data-id="${x.id}"><div><strong>${esc(x.title)}</strong><span>${esc(x.detail)}</span></div><button class="settings-text-button" data-remove>Remove</button></article>`).join(""):`<div class="settings-saved-item"><div><strong>No saved items here</strong><span>Saved items will appear in this section.</span></div></div>`}
document.querySelectorAll("[data-saved-tab]").forEach(b=>b.onclick=()=>{savedTab=b.dataset.savedTab;document.querySelectorAll("[data-saved-tab]").forEach(x=>x.classList.toggle("active",x===b));renderSaved()});
savedItems.onclick=e=>{const b=e.target.closest("[data-remove]");if(!b)return;const id=Number(b.closest("[data-id]").dataset.id);saved=saved.filter(x=>x.id!==id);save();renderSaved()};
function openModal(t,x,c,a){modalTitle.textContent=t;modalText.textContent=x;modalConfirm.textContent=c;modalAction=a;settingsModal.hidden=false;document.body.style.overflow="hidden"}
function closeModal(){settingsModal.hidden=true;document.body.style.overflow="";modalAction=null}
document.querySelectorAll("[data-close-modal]").forEach(b=>b.onclick=closeModal);modalConfirm.onclick=()=>{if(typeof modalAction==="function")modalAction();closeModal()};
changePassword.onclick=()=>alert("Password changes will connect to Supabase authentication later.");
twoFactor.onclick=()=>alert("Two-factor authentication will be added after backend integration.");
document.querySelectorAll(".signout-session").forEach(b=>b.onclick=()=>openModal("Sign out this session?","This device will need to sign in again.","Sign out",()=>b.closest("article").remove()));
deactivateAccount.onclick=()=>openModal("Deactivate your account?","Your public profile will be hidden. This is only a frontend demonstration.","Deactivate",()=>alert("Demo deactivation recorded."));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!settingsModal.hidden)closeModal()});
populate();apply();renderSaved();
})();

const reports=[
{title:"Harassment in business reply",priority:"High Priority",reporter:"Jordan M.",target:"Ottawa Home Repair"},
{title:"Fake review suspected",priority:"Medium Priority",reporter:"Alex P.",target:"Maple Corner Shop"},
{title:"Profile impersonation",priority:"High Priority",reporter:"Chris R.",target:"John Smith"}
];
const q=document.getElementById("queue");
const modal=document.getElementById("modal");
const title=document.getElementById("actionTitle");
const reason=document.getElementById("reason");
let action="";
reports.forEach(r=>{
const d=document.createElement("div");
d.className="report";
d.innerHTML=`<span class="badge">${r.priority}</span>
<h3>${r.title}</h3>
<p><b>Reported by:</b> ${r.reporter}<br><b>Against:</b> ${r.target}</p>
<div class="actions">
<button>View Context</button>
<button>Message Reporter</button>
<button>Message Owner</button>
<button data-a="Dismiss">Dismiss</button>
<button data-a="Remove Reply">Remove Reply</button>
<button data-a="Warn">Warn</button>
<button data-a="Ban" class="primary">Ban</button>
</div>`;
d.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{action=b.dataset.a;title.textContent=action+" Confirmation";reason.value="";modal.classList.remove("hidden");});
q.appendChild(d);
});
cancel.onclick=()=>modal.classList.add("hidden");
confirm.onclick=()=>{
if(!reason.value.trim()){alert("Please provide a reason.");return;}
alert(action+" recorded (demo).");
modal.classList.add("hidden");
};

const completedProfile = readStoredObject("ntdCompletedProfile");
const profileType = completedProfile.type || localStorage.getItem("ntdProfileType") || "individual";
const profileDetails = completedProfile.details || readStoredObject("ntdProfileDetails");
const profileServices = completedProfile.services || readStoredArray("ntdProfileServices");
const profileTags = completedProfile.profileTags || readStoredArray("ntdProfileTags");
const workStyle = completedProfile.workStyle || readStoredObject("ntdWorkStyle");
const extraDetails = completedProfile.extraDetails || readStoredObject("ntdProfileExtraDetails");

const el = id => document.getElementById(id);
const elements = {
  publicAvatar: el("publicAvatar"), publicType: el("publicType"), publicName: el("publicName"), publicHeadline: el("publicHeadline"),
  publicProfileTags: el("publicProfileTags"), publicLocation: el("publicLocation"), messageProfile: el("messageProfile"),
  websiteButton: el("websiteButton"), documentButton: el("documentButton"), phoneButton: el("phoneButton"),
  responseText: el("responseText"), tagCountMetric: el("tagCountMetric"), ottoPublicSection: el("ottoPublicSection"),
  publicWorkStyleIcon: el("publicWorkStyleIcon"), publicWorkStyleName: el("publicWorkStyleName"), publicWorkStyleDescription: el("publicWorkStyleDescription"),
  aboutHeading: el("aboutHeading"), publicAbout: el("publicAbout"), quickDetails: el("quickDetails"), servicesHeading: el("servicesHeading"),
  publicServices: el("publicServices"), publicDocumentSection: el("publicDocumentSection"), publicDocumentLink: el("publicDocumentLink"),
  sidebarContactList: el("sidebarContactList"), copyProfileLink: el("copyProfileLink"), copyMessage: el("copyMessage")
};

const typeSettings = {
  individual: { icon: "👤", label: "Individual", headline: "Independent local help", aboutHeading: "About this individual", servicesHeading: "Skills and services" },
  shop: { icon: "🛍️", label: "Shop", headline: "Local products and shopping", aboutHeading: "About this shop", servicesHeading: "Shop categories" },
  business: { icon: "🏢", label: "Business", headline: "Trusted local business", aboutHeading: "About this business", servicesHeading: "Business services" },
  "large-business": { icon: "📍", label: "Multi-Location Business", headline: "Services across multiple locations", aboutHeading: "About this business", servicesHeading: "Business services" }
};

const currentType = typeSettings[profileType] || typeSettings.individual;
initializePublicProfile();

function initializePublicProfile() {
  renderHero(); renderActions(); renderWorkStyle(); renderAbout(); renderServices(); renderDocument(); renderContact(); bindPageActions();
}

function renderHero() {
  elements.publicAvatar.textContent = currentType.icon;
  elements.publicType.textContent = currentType.label;
  elements.publicName.textContent = profileDetails.displayName || `${currentType.label} profile`;
  elements.publicHeadline.textContent = profileDetails.shortDescription || currentType.headline;
  const location = [profileDetails.city, profileDetails.province].filter(Boolean);
  elements.publicLocation.textContent = location.length ? `📍 ${location.join(", ")}` : "📍 Location not added";
  elements.publicProfileTags.innerHTML = "";
  profileTags.slice(0, 6).forEach(tag => { const item = document.createElement("span"); item.textContent = tag; elements.publicProfileTags.appendChild(item); });
  elements.tagCountMetric.textContent = profileTags.length;
}

function renderActions() {
  const canMessage = (profileType === "individual" || profileType === "shop") && extraDetails.allowMessages;
  elements.messageProfile.hidden = !canMessage;
  elements.responseText.textContent = canMessage ? "Messaging enabled" : (profileType === "business" || profileType === "large-business" ? "Use business contact" : "Messaging unavailable");
  if (extraDetails.website) { elements.websiteButton.hidden = false; elements.websiteButton.href = extraDetails.website; }
  if (profileType === "individual" && extraDetails.documentLink) { elements.documentButton.hidden = false; elements.documentButton.href = extraDetails.documentLink; }
  if (extraDetails.contactPhone && extraDetails.showPhone) { elements.phoneButton.hidden = false; elements.phoneButton.href = `tel:${extraDetails.contactPhone}`; }
}

function renderWorkStyle() {
  if (!workStyle.name) return;
  elements.ottoPublicSection.hidden = false;
  elements.publicWorkStyleIcon.textContent = workStyle.icon || "🧩";
  elements.publicWorkStyleName.textContent = workStyle.name;
  elements.publicWorkStyleDescription.textContent = workStyle.description || "";
}

function renderAbout() {
  elements.aboutHeading.textContent = currentType.aboutHeading;
  elements.publicAbout.textContent = extraDetails.longDescription || profileDetails.shortDescription || "No public introduction has been added yet.";
  elements.quickDetails.innerHTML = "";
  getQuickDetails().filter(item => item.value).forEach(item => {
    const card = document.createElement("div"); card.className = "public-quick-detail";
    card.innerHTML = `<span>${escapeHTML(item.icon)}</span><div><small>${escapeHTML(item.label)}</small><strong>${escapeHTML(String(item.value))}</strong></div>`;
    elements.quickDetails.appendChild(card);
  });
}

function getQuickDetails() {
  if (profileType === "individual") return [
    { icon: "🕒", label: "Availability", value: extraDetails.availability }, { icon: "📍", label: "Service area", value: extraDetails.serviceArea },
    { icon: "🧰", label: "Experience", value: extraDetails.experience }, { icon: "🗣️", label: "Languages", value: extraDetails.languages },
    { icon: "💲", label: "Starting price", value: getIndividualPrice() }
  ];
  if (profileType === "shop") return [
    { icon: "🏬", label: "Store type", value: extraDetails.storeType }, { icon: "📦", label: "Order options", value: extraDetails.orderOptions },
    { icon: "🕒", label: "Store hours", value: extraDetails.shopHours }, { icon: "💲", label: "Price range", value: extraDetails.priceRange }
  ];
  if (profileType === "large-business") return [
    { icon: "📍", label: "Locations", value: extraDetails.locationCount }, { icon: "🗓️", label: "Years in business", value: extraDetails.yearsInBusiness },
    { icon: "🕒", label: "General hours", value: extraDetails.businessHours }, { icon: "🗺️", label: "Coverage area", value: extraDetails.coverageArea }
  ];
  return [
    { icon: "🗓️", label: "Years in business", value: extraDetails.yearsInBusiness }, { icon: "🕒", label: "Business hours", value: extraDetails.businessHours },
    { icon: "🗺️", label: "Service area", value: extraDetails.serviceArea }, { icon: "🚨", label: "Emergency service", value: extraDetails.emergencyService }
  ];
}

function getIndividualPrice() {
  if (extraDetails.priceType === "contact for price") return "Contact for price";
  return extraDetails.startingPrice ? `$${extraDetails.startingPrice} ${extraDetails.priceType || ""}`.trim() : "";
}

function renderServices() {
  elements.servicesHeading.textContent = currentType.servicesHeading;
  elements.publicServices.innerHTML = "";
  if (!profileServices.length) { elements.publicServices.innerHTML = '<div class="public-empty-state">No services or categories have been added.</div>'; return; }
  const icons = ["🛠️","✨","📍","💡","🤝","⭐"];
  profileServices.forEach((service, index) => {
    const card = document.createElement("article"); card.className = "public-service-card";
    const description = profileType === "shop" ? "Available through this local shop." : (profileType === "business" || profileType === "large-business" ? "Contact the business for details and availability." : "Contact this individual for details and availability.");
    card.innerHTML = `<div class="service-card-icon">${icons[index % icons.length]}</div><div><h3>${escapeHTML(service)}</h3><p>${description}</p></div><span class="service-card-arrow">→</span>`;
    elements.publicServices.appendChild(card);
  });
}

function renderDocument() {
  if (profileType !== "individual" || !extraDetails.documentLink) return;
  elements.publicDocumentSection.hidden = false;
  elements.publicDocumentLink.href = extraDetails.documentLink;
}

function renderContact() {
  const contacts = [];
  const canMessage = (profileType === "individual" || profileType === "shop") && extraDetails.allowMessages;
  if (canMessage) contacts.push({ icon: "💬", title: "NeedThingsDone messages", value: "Messaging enabled" });
  if (extraDetails.contactEmail) contacts.push({ icon: "✉️", title: "Email", value: extraDetails.contactEmail });
  if (extraDetails.contactPhone && extraDetails.showPhone) contacts.push({ icon: "📞", title: "Phone", value: extraDetails.contactPhone });
  if (extraDetails.website) contacts.push({ icon: "🌐", title: "Website", value: extraDetails.website });
  elements.sidebarContactList.innerHTML = "";
  if (!contacts.length) { elements.sidebarContactList.innerHTML = '<p class="public-empty-text">No public contact options are available.</p>'; return; }
  contacts.forEach(contact => {
    const item = document.createElement("div"); item.className = "sidebar-contact-item";
    item.innerHTML = `<span>${contact.icon}</span><div><small>${escapeHTML(contact.title)}</small><strong>${escapeHTML(contact.value)}</strong></div>`;
    elements.sidebarContactList.appendChild(item);
  });
}

function bindPageActions() {
  elements.messageProfile.addEventListener("click", () => alert("Messaging will open here once the messaging system is connected."));
  elements.copyProfileLink.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(window.location.href); elements.copyMessage.textContent = "Profile link copied!"; }
    catch { elements.copyMessage.textContent = "Copying is unavailable in this browser."; }
  });
}

function readStoredObject(key) { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } }
function readStoredArray(key) { try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value : []; } catch { return []; } }
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]); }

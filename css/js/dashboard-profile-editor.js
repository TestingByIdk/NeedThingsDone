const completed = readObject("ntdCompletedProfile");
const profileType = completed.type || localStorage.getItem("ntdProfileType") || "individual";

let details = completed.details || readObject("ntdProfileDetails");
let services = [...(completed.services || readArray("ntdProfileServices"))];
let tags = [...(completed.profileTags || readArray("ntdProfileTags"))];
let workStyle = completed.workStyle || readObject("ntdWorkStyle");
let extra = completed.extraDetails || readObject("ntdProfileExtraDetails");
let visibility = readObject("ntdProfileVisibility");

const typeSettings = {
  individual: { icon: "👤", label: "Individual" },
  shop: { icon: "🛍️", label: "Shop" },
  business: { icon: "🏢", label: "Business" },
  "large-business": { icon: "📍", label: "Multi-Location Business" }
};

const currentType = typeSettings[profileType] || typeSettings.individual;
const $ = id => document.getElementById(id);

const el = {
  form: $("profileEditorForm"),
  displayName: $("displayName"),
  shortDescription: $("shortDescription"),
  city: $("city"),
  province: $("province"),
  longDescription: $("longDescription"),
  aboutCount: $("aboutCharacterCount"),
  serviceTagList: $("serviceTagList"),
  newServiceInput: $("newServiceInput"),
  addServiceButton: $("addServiceButton"),
  startingPrice: $("startingPrice"),
  priceType: $("priceType"),
  workStyleIcon: $("editorWorkStyleIcon"),
  workStyleName: $("editorWorkStyleName"),
  workStyleDescription: $("editorWorkStyleDescription"),
  profileTagList: $("profileTagList"),
  contactEmail: $("contactEmail"),
  contactPhone: $("contactPhone"),
  website: $("website"),
  showPhone: $("showPhone"),
  documentLink: $("documentLink"),
  messagingCard: $("messagingCard"),
  allowMessages: $("allowMessages"),
  emailNotifications: $("messageEmailNotifications"),
  showPricing: $("showPricing"),
  showWebsite: $("showWebsite"),
  showDocument: $("showDocument"),
  showInSearch: $("showInSearch"),
  vacationMode: $("vacationMode"),
  documentCard: $("documentCard"),
  documentToggleRow: $("showDocumentToggleRow"),
  messageAnalyticsCard: $("messageAnalyticsCard"),
  strengthText: $("editorStrengthText"),
  strengthFill: $("editorStrengthFill"),
  previewAvatar: $("previewAvatar"),
  previewType: $("previewType"),
  previewName: $("previewName"),
  previewLocation: $("previewLocation"),
  previewHeadline: $("previewHeadline"),
  previewTags: $("previewTags"),
  previewAbout: $("previewAbout"),
  previewServices: $("previewServices"),
  previewPrice: $("previewPrice"),
  futurePhotoAvatar: $("futurePhotoAvatar"),
  unsavedBar: $("unsavedBar"),
  discard: $("discardChanges"),
  save: $("saveChanges"),
  toast: $("editorToast")
};

let originalSnapshot = "";
let dirty = false;

initialize();

function initialize() {
  fillForm();
  renderServices();
  renderTags();
  renderWorkStyle();
  renderPreview();
  renderStrength();
  applyProfileTypeRules();
  bindEvents();
  originalSnapshot = createSnapshot();
}

function fillForm() {
  el.displayName.value = details.displayName || "";
  el.shortDescription.value = details.shortDescription || "";
  el.city.value = details.city || "";
  el.province.value = details.province || "";
  el.longDescription.value = extra.longDescription || "";
  el.startingPrice.value = extra.startingPrice || "";
  el.priceType.value = extra.priceType || "per hour";
  el.contactEmail.value = extra.contactEmail || "";
  el.contactPhone.value = extra.contactPhone || "";
  el.website.value = extra.website || "";
  el.showPhone.checked = Boolean(extra.showPhone);
  el.documentLink.value = extra.documentLink || "";
  el.allowMessages.checked = Boolean(extra.allowMessages);
  el.emailNotifications.checked = Boolean(extra.messageEmailNotifications);
  el.showPricing.checked = visibility.showPricing !== false;
  el.showWebsite.checked = visibility.showWebsite !== false;
  el.showDocument.checked = visibility.showDocument !== false;
  el.showInSearch.checked = visibility.showInSearch !== false;
  el.vacationMode.checked = Boolean(visibility.vacationMode);
  updateAboutCount();
}

function applyProfileTypeRules() {
  el.futurePhotoAvatar.textContent = currentType.icon;
  el.previewAvatar.textContent = currentType.icon;
  el.previewType.textContent = currentType.label;

  const messagingAllowed = profileType === "individual" || profileType === "shop";
  el.messagingCard.hidden = !messagingAllowed;
  el.messageAnalyticsCard.hidden = !messagingAllowed;

  const documentAllowed = profileType === "individual";
  el.documentCard.hidden = !documentAllowed;
  el.documentToggleRow.hidden = !documentAllowed;
}

function bindEvents() {
  el.form.querySelectorAll("input, textarea, select").forEach(input => {
    input.addEventListener("input", handleChange);
    input.addEventListener("change", handleChange);
  });

  el.addServiceButton.addEventListener("click", addService);
  el.newServiceInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      addService();
    }
  });

  el.discard.addEventListener("click", discardChanges);
  el.save.addEventListener("click", saveChanges);

  window.addEventListener("beforeunload", event => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
}

function handleChange() {
  updateAboutCount();
  renderPreview();
  renderStrength();
  setDirty(createSnapshot() !== originalSnapshot);
}

function addService() {
  const value = cleanText(el.newServiceInput.value);

  if (!value) {
    showToast("Enter a service before adding it.", true);
    return;
  }

  if (services.length >= 10) {
    showToast("You can add up to 10 services.", true);
    return;
  }

  if (services.some(service => normalize(service) === normalize(value))) {
    showToast("That service is already listed.", true);
    return;
  }

  services.push(value);
  el.newServiceInput.value = "";
  renderServices();
  renderPreview();
  renderStrength();
  setDirty(true);
}

function removeService(index) {
  services.splice(index, 1);
  renderServices();
  renderPreview();
  renderStrength();
  setDirty(true);
}

function renderServices() {
  el.serviceTagList.innerHTML = "";

  if (!services.length) {
    el.serviceTagList.innerHTML =
      '<p class="editor-empty-text">No services added yet.</p>';
    return;
  }

  services.forEach((service, index) => {
    const item = document.createElement("span");
    item.innerHTML = `${escapeHTML(service)} <button type="button" aria-label="Remove ${escapeHTML(service)}">×</button>`;
    item.querySelector("button").addEventListener("click", () => removeService(index));
    el.serviceTagList.appendChild(item);
  });
}

function renderTags() {
  el.profileTagList.innerHTML = "";

  if (!tags.length) {
    el.profileTagList.innerHTML =
      '<p class="editor-empty-text">No Otto tags saved yet.</p>';
    return;
  }

  tags.slice(0, 6).forEach(tag => {
    const item = document.createElement("span");
    item.textContent = tag;
    el.profileTagList.appendChild(item);
  });
}

function renderWorkStyle() {
  if (!workStyle.name) return;

  el.workStyleIcon.textContent = workStyle.icon || "🧩";
  el.workStyleName.textContent = workStyle.name;
  el.workStyleDescription.textContent = workStyle.description || "";
}

function renderPreview() {
  const name = el.displayName.value.trim() || "Your Profile";
  const location = [el.city.value.trim(), el.province.value].filter(Boolean).join(", ");
  const headline = el.shortDescription.value.trim() || "Your short headline will appear here.";
  const about = el.longDescription.value.trim() || "Your public introduction will appear here.";

  el.previewName.textContent = name;
  el.previewLocation.textContent = location ? `📍 ${location}` : "📍 Location not added";
  el.previewHeadline.textContent = headline;
  el.previewAbout.textContent = about;

  el.previewTags.innerHTML = "";
  tags.slice(0, 6).forEach(tag => {
    const item = document.createElement("span");
    item.textContent = tag;
    el.previewTags.appendChild(item);
  });

  el.previewServices.innerHTML = "";
  if (!services.length) {
    el.previewServices.innerHTML = "<em>No services added.</em>";
  } else {
    services.slice(0, 5).forEach(service => {
      const item = document.createElement("span");
      item.textContent = service;
      el.previewServices.appendChild(item);
    });
  }

  if (!el.showPricing.checked) {
    el.previewPrice.textContent = "Pricing hidden";
  } else if (el.priceType.value === "contact for price") {
    el.previewPrice.textContent = "Contact for price";
  } else if (el.startingPrice.value) {
    el.previewPrice.textContent =
      `$${el.startingPrice.value} ${el.priceType.value}`;
  } else {
    el.previewPrice.textContent = "Price not added";
  }
}

function renderStrength() {
  const checks = [
    Boolean(el.displayName.value.trim()),
    Boolean(el.city.value.trim() && el.province.value),
    services.length >= 3,
    tags.length >= 3,
    el.longDescription.value.trim().length >= 100,
    Boolean(
      el.allowMessages.checked ||
      el.contactEmail.value.trim() ||
      el.contactPhone.value.trim() ||
      el.website.value.trim()
    ),
    Boolean(el.website.value.trim() || el.documentLink.value.trim())
  ];

  const weights = [12, 10, 18, 12, 23, 13, 12];

  const score = Math.min(
    checks.reduce((total, complete, index) => {
      return total + (complete ? weights[index] : 0);
    }, 0),
    100
  );

  el.strengthText.textContent = `${score}%`;
  el.strengthFill.style.width = `${score}%`;
}

function updateAboutCount() {
  el.aboutCount.textContent = `${el.longDescription.value.length}/500`;
}

function saveChanges() {
  const website = el.website.value.trim();
  const documentLink = el.documentLink.value.trim();

  if (!el.displayName.value.trim()) {
    showToast("Display name is required.", true);
    el.displayName.focus();
    return;
  }

  if (website && !isValidUrl(website)) {
    showToast("Enter a complete website URL beginning with http:// or https://.", true);
    el.website.focus();
    return;
  }

  if (documentLink && !isValidUrl(documentLink)) {
    showToast("Enter a complete public document URL.", true);
    el.documentLink.focus();
    return;
  }

  details = {
    ...details,
    displayName: el.displayName.value.trim(),
    shortDescription: el.shortDescription.value.trim(),
    city: el.city.value.trim(),
    province: el.province.value
  };

  extra = {
    ...extra,
    longDescription: el.longDescription.value.trim(),
    startingPrice: el.startingPrice.value,
    priceType: el.priceType.value,
    contactEmail: el.contactEmail.value.trim(),
    contactPhone: el.contactPhone.value.trim(),
    website,
    showPhone: el.showPhone.checked,
    documentLink,
    allowMessages:
      profileType === "individual" || profileType === "shop"
        ? el.allowMessages.checked
        : false,
    messageEmailNotifications: el.emailNotifications.checked
  };

  visibility = {
    showPricing: el.showPricing.checked,
    showWebsite: el.showWebsite.checked,
    showDocument: el.showDocument.checked,
    showInSearch: el.showInSearch.checked,
    vacationMode: el.vacationMode.checked
  };

  const completedProfile = {
    type: profileType,
    details,
    services,
    profileTags: tags,
    workStyle,
    extraDetails: extra,
    visibility
  };

  localStorage.setItem("ntdProfileDetails", JSON.stringify(details));
  localStorage.setItem("ntdProfileServices", JSON.stringify(services));
  localStorage.setItem("ntdProfileTags", JSON.stringify(tags));
  localStorage.setItem("ntdWorkStyle", JSON.stringify(workStyle));
  localStorage.setItem("ntdProfileExtraDetails", JSON.stringify(extra));
  localStorage.setItem("ntdProfileVisibility", JSON.stringify(visibility));
  localStorage.setItem("ntdCompletedProfile", JSON.stringify(completedProfile));

  originalSnapshot = createSnapshot();
  setDirty(false);
  showToast("Profile changes saved.");
}

function discardChanges() {
  window.location.reload();
}

function createSnapshot() {
  return JSON.stringify({
    displayName: el.displayName.value,
    shortDescription: el.shortDescription.value,
    city: el.city.value,
    province: el.province.value,
    longDescription: el.longDescription.value,
    services,
    startingPrice: el.startingPrice.value,
    priceType: el.priceType.value,
    contactEmail: el.contactEmail.value,
    contactPhone: el.contactPhone.value,
    website: el.website.value,
    showPhone: el.showPhone.checked,
    documentLink: el.documentLink.value,
    allowMessages: el.allowMessages.checked,
    emailNotifications: el.emailNotifications.checked,
    showPricing: el.showPricing.checked,
    showWebsite: el.showWebsite.checked,
    showDocument: el.showDocument.checked,
    showInSearch: el.showInSearch.checked,
    vacationMode: el.vacationMode.checked
  });
}

function setDirty(value) {
  dirty = value;
  el.unsavedBar.hidden = !value;
}

function showToast(message, isError = false) {
  el.toast.textContent = message;
  el.toast.classList.toggle("error", isError);
  el.toast.classList.add("visible");

  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    el.toast.classList.remove("visible");
  }, 2600);
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function cleanText(value) {
  return value.trim().replace(/\s+/g, " ");
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function readObject(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

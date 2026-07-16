const profileType =
  localStorage.getItem("ntdProfileType") || "individual";

const profileDetails =
  readStoredObject("ntdProfileDetails");

const profileServices =
  readStoredArray("ntdProfileServices");

const profileTags =
  readStoredArray("ntdProfileTags");

const workStyle =
  readStoredObject("ntdWorkStyle");

const extraDetails =
  readStoredObject("ntdProfileExtraDetails");

const reviewAvatar =
  document.getElementById("reviewAvatar");

const reviewType =
  document.getElementById("reviewType");

const reviewName =
  document.getElementById("reviewName");

const reviewLocation =
  document.getElementById("reviewLocation");

const reviewAbout =
  document.getElementById("reviewAbout");

const reviewServices =
  document.getElementById("reviewServices");

const reviewDetails =
  document.getElementById("reviewDetails");

const reviewContact =
  document.getElementById("reviewContact");

const reviewDocumentSection =
  document.getElementById("reviewDocumentSection");

const reviewDocumentLink =
  document.getElementById("reviewDocumentLink");

const strengthScore =
  document.getElementById("strengthScore");

const strengthLabel =
  document.getElementById("strengthLabel");

const strengthFill =
  document.getElementById("strengthFill");

const strengthSuggestions =
  document.getElementById("strengthSuggestions");

const publishProfile =
  document.getElementById("publishProfile");

const reviewMessage =
  document.getElementById("reviewMessage");

const reviewProfileTags =
  document.getElementById("reviewProfileTags");

const reviewWorkStyleSection =
  document.getElementById("reviewWorkStyleSection");

const reviewWorkStyleIcon =
  document.getElementById("reviewWorkStyleIcon");

const reviewWorkStyleName =
  document.getElementById("reviewWorkStyleName");

const reviewWorkStyleDescription =
  document.getElementById("reviewWorkStyleDescription");

const typeSettings = {
  individual: {
    icon: "👤",
    label: "Individual"
  },

  shop: {
    icon: "🛍️",
    label: "Shop"
  },

  business: {
    icon: "🏢",
    label: "Business"
  },

  "large-business": {
    icon: "📍",
    label: "Multi-Location Business"
  }
};

const currentType =
  typeSettings[profileType] || typeSettings.individual;

renderProfile();
renderProfileTags();
renderWorkStyle();
renderStrength();

function renderProfileTags() {
  reviewProfileTags.innerHTML = "";

  if (profileTags.length === 0) {
    reviewProfileTags.hidden = true;
    return;
  }

  reviewProfileTags.hidden = false;

  profileTags.forEach(tag => {
    const item = document.createElement("span");

    item.textContent = tag;

    /*
      These are self-selected tags, so they do not get
      a verification checkmark yet.
    */
    reviewProfileTags.appendChild(item);
  });
}

function renderWorkStyle() {
  if (!workStyle.name) {
    reviewWorkStyleSection.hidden = true;
    return;
  }

  reviewWorkStyleSection.hidden = false;

  reviewWorkStyleIcon.textContent =
    workStyle.icon || "🧩";

  reviewWorkStyleName.textContent =
    workStyle.name;

  reviewWorkStyleDescription.textContent =
    workStyle.description || "";
}

publishProfile.addEventListener("click", () => {
  const completeProfile = {
  type: profileType,
  details: profileDetails,
  services: profileServices,
  profileTags,
  workStyle,
  extraDetails
};

  localStorage.setItem(
    "ntdCompletedProfile",
    JSON.stringify(completeProfile)
  );

  reviewMessage.textContent =
    "Profile saved locally. Database publishing will be connected next.";

  reviewMessage.classList.remove("error");
  reviewMessage.classList.add("success");

  publishProfile.disabled = true;
  publishProfile.textContent = "Profile Ready ✓";
});

function renderProfile() {
  reviewAvatar.textContent = currentType.icon;
  reviewType.textContent = currentType.label;

  reviewName.textContent =
    profileDetails.displayName ||
    `${currentType.label} profile`;

  const locationParts = [
    profileDetails.city,
    profileDetails.province
  ].filter(Boolean);

  reviewLocation.textContent =
    locationParts.length > 0
      ? `📍 ${locationParts.join(", ")}`
      : "📍 Location not added";

  reviewAbout.textContent =
    extraDetails.longDescription ||
    profileDetails.shortDescription ||
    "No description added yet.";

  renderServices();
  renderDetails();
  renderContact();
  renderDocument();
}

function renderServices() {
  reviewServices.innerHTML = "";

  if (profileServices.length === 0) {
    reviewServices.innerHTML =
      `<p class="review-empty-text">No services selected.</p>`;

    return;
  }

  profileServices.forEach(service => {
    const tag = document.createElement("span");

    tag.textContent = service;
    reviewServices.appendChild(tag);
  });
}

function renderDetails() {
  const details = getDisplayDetails();

  reviewDetails.innerHTML = "";

  details.forEach(detail => {
    if (!detail.value) return;

    const item = document.createElement("div");

    item.className = "review-detail-item";

    item.innerHTML = `
      <span>${escapeHTML(detail.label)}</span>
      <strong>${escapeHTML(String(detail.value))}</strong>
    `;

    reviewDetails.appendChild(item);
  });

  if (!reviewDetails.children.length) {
    reviewDetails.innerHTML =
      `<p class="review-empty-text">No extra details added.</p>`;
  }
}

function getDisplayDetails() {
  if (profileType === "individual") {
    const price =
      extraDetails.priceType === "contact for price"
        ? "Contact for price"
        : extraDetails.startingPrice
          ? `$${extraDetails.startingPrice} ${extraDetails.priceType || ""}`
          : "";

    return [
      {
        label: "Experience",
        value: extraDetails.experience
      },
      {
        label: "Availability",
        value: extraDetails.availability
      },
      {
        label: "Service area",
        value: extraDetails.serviceArea
      },
      {
        label: "Languages",
        value: extraDetails.languages
      },
      {
        label: "Starting price",
        value: price
      }
    ];
  }

  if (profileType === "shop") {
    return [
      {
        label: "Store type",
        value: extraDetails.storeType
      },
      {
        label: "Order options",
        value: extraDetails.orderOptions
      },
      {
        label: "Store hours",
        value: extraDetails.shopHours
      },
      {
        label: "Price range",
        value: extraDetails.priceRange
      }
    ];
  }

  if (profileType === "large-business") {
    return [
      {
        label: "Locations",
        value: extraDetails.locationCount
      },
      {
        label: "Years in business",
        value: extraDetails.yearsInBusiness
      },
      {
        label: "General hours",
        value: extraDetails.businessHours
      },
      {
        label: "Coverage area",
        value: extraDetails.coverageArea
      }
    ];
  }

  return [
    {
      label: "Years in business",
      value: extraDetails.yearsInBusiness
    },
    {
      label: "Business hours",
      value: extraDetails.businessHours
    },
    {
      label: "Service area",
      value: extraDetails.serviceArea
    },
    {
      label: "Emergency service",
      value: extraDetails.emergencyService
    }
  ];
}

function renderContact() {
  reviewContact.innerHTML = "";

  const contactItems = [];

  if (extraDetails.allowMessages) {
    contactItems.push({
      icon: "💬",
      label: "NeedThingsDone messages enabled"
    });
  }

  if (extraDetails.contactEmail) {
    contactItems.push({
      icon: "✉️",
      label: extraDetails.contactEmail
    });
  }

  if (
    extraDetails.contactPhone &&
    extraDetails.showPhone
  ) {
    contactItems.push({
      icon: "📞",
      label: extraDetails.contactPhone
    });
  }

  if (extraDetails.website) {
    contactItems.push({
      icon: "🌐",
      label: extraDetails.website
    });
  }

  if (contactItems.length === 0) {
    reviewContact.innerHTML =
      `<p class="review-empty-text">No public contact options selected.</p>`;

    return;
  }

  contactItems.forEach(contact => {
    const item = document.createElement("div");

    item.className = "review-contact-item";

    item.innerHTML = `
      <span>${contact.icon}</span>
      <p>${escapeHTML(contact.label)}</p>
    `;

    reviewContact.appendChild(item);
  });
}

function renderDocument() {
  if (
    profileType !== "individual" ||
    !extraDetails.documentLink
  ) {
    reviewDocumentSection.hidden = true;
    return;
  }

  reviewDocumentSection.hidden = false;
  reviewDocumentLink.href = extraDetails.documentLink;
}

function renderStrength() {
  let score = 0;
  const suggestions = [];

  if (profileDetails.displayName) {
    score += 15;
  } else {
    suggestions.push("Add a profile name.");
  }

  if (
    profileDetails.city &&
    profileDetails.province
  ) {
    score += 10;
  } else {
    suggestions.push("Add your complete location.");
  }

  if (profileServices.length >= 3) {
    score += 20;
  } else if (profileServices.length > 0) {
    score += 10;
    suggestions.push("Add a few more skills or services.");
  } else {
    suggestions.push("Choose at least one skill or service.");
  }

  if (
    extraDetails.longDescription &&
    extraDetails.longDescription.length >= 100
  ) {
    score += 25;
  } else if (extraDetails.longDescription) {
    score += 12;
    suggestions.push("Write a slightly longer introduction.");
  } else {
    suggestions.push("Add an About section.");
  }

  if (
    extraDetails.allowMessages ||
    extraDetails.contactEmail ||
    extraDetails.contactPhone ||
    extraDetails.website
  ) {
    score += 15;
  } else {
    suggestions.push("Add a contact option.");
  }

  if (
    extraDetails.documentLink ||
    extraDetails.website
  ) {
    score += 15;
  } else {
    suggestions.push(
      profileType === "individual"
        ? "Add a website, resume, portfolio, or flyer."
        : "Add your website."
    );
  }

  score = Math.min(score, 100);

  strengthScore.textContent = `${score}%`;
  strengthFill.style.width = `${score}%`;

  if (score >= 85) {
    strengthLabel.textContent = "Excellent";
  } else if (score >= 65) {
    strengthLabel.textContent = "Looking good";
  } else if (score >= 40) {
    strengthLabel.textContent = "Good start";
  } else {
    strengthLabel.textContent = "Needs more details";
  }

  strengthSuggestions.innerHTML = "";

  if (suggestions.length === 0) {
    strengthSuggestions.innerHTML = `
      <p class="strength-complete">
        ✓ Your profile looks ready.
      </p>
    `;

    return;
  }

  suggestions.slice(0, 3).forEach(suggestion => {
    const item = document.createElement("p");

    item.textContent = `• ${suggestion}`;
    strengthSuggestions.appendChild(item);
  });
}

function readStoredObject(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

function readStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return replacements[character];
  });
}
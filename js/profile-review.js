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

const elements = {
  reviewAvatar: document.getElementById("reviewAvatar"),
  reviewType: document.getElementById("reviewType"),
  reviewName: document.getElementById("reviewName"),
  reviewLocation: document.getElementById("reviewLocation"),
  reviewAbout: document.getElementById("reviewAbout"),
  reviewServices: document.getElementById("reviewServices"),
  reviewDetails: document.getElementById("reviewDetails"),
  reviewContact: document.getElementById("reviewContact"),

  reviewDocumentSection:
    document.getElementById("reviewDocumentSection"),

  reviewDocumentLink:
    document.getElementById("reviewDocumentLink"),

  strengthScore: document.getElementById("strengthScore"),
  strengthLabel: document.getElementById("strengthLabel"),
  strengthFill: document.getElementById("strengthFill"),

  strengthSuggestions:
    document.getElementById("strengthSuggestions"),

  publishProfile: document.getElementById("publishProfile"),
  reviewMessage: document.getElementById("reviewMessage"),

  reviewProfileTags:
    document.getElementById("reviewProfileTags"),

  reviewWorkStyleSection:
    document.getElementById("reviewWorkStyleSection"),

  reviewWorkStyleIcon:
    document.getElementById("reviewWorkStyleIcon"),

  reviewWorkStyleName:
    document.getElementById("reviewWorkStyleName"),

  reviewWorkStyleDescription:
    document.getElementById("reviewWorkStyleDescription")
};

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

initializeReviewPage();

function initializeReviewPage() {
  renderProfile();
  renderProfileTags();
  renderWorkStyle();
  renderStrength();

  elements.publishProfile.addEventListener(
    "click",
    publishCompletedProfile
  );
}

function renderProfile() {
  elements.reviewAvatar.textContent =
    currentType.icon;

  elements.reviewType.textContent =
    currentType.label;

  elements.reviewName.textContent =
    profileDetails.displayName ||
    `${currentType.label} profile`;

  const locationParts = [
    profileDetails.city,
    profileDetails.province
  ].filter(Boolean);

  elements.reviewLocation.textContent =
    locationParts.length > 0
      ? `📍 ${locationParts.join(", ")}`
      : "📍 Location not added";

  elements.reviewAbout.textContent =
    extraDetails.longDescription ||
    profileDetails.shortDescription ||
    "No description added yet.";

  renderServices();
  renderDetails();
  renderContact();
  renderDocument();
}

function renderProfileTags() {
  const container =
    elements.reviewProfileTags;

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (profileTags.length === 0) {
    container.hidden = true;
    return;
  }

  container.hidden = false;

  profileTags.forEach(tag => {
    const item =
      document.createElement("span");

    item.textContent = tag;

    container.appendChild(item);
  });
}

function renderWorkStyle() {
  const section =
    elements.reviewWorkStyleSection;

  if (!section) {
    return;
  }

  if (!workStyle.name) {
    section.hidden = true;
    return;
  }

  section.hidden = false;

  elements.reviewWorkStyleIcon.textContent =
    workStyle.icon || "🧩";

  elements.reviewWorkStyleName.textContent =
    workStyle.name;

  elements.reviewWorkStyleDescription.textContent =
    workStyle.description || "";
}

function renderServices() {
  const container =
    elements.reviewServices;

  container.innerHTML = "";

  if (profileServices.length === 0) {
    container.innerHTML = `
      <p class="review-empty-text">
        No services selected.
      </p>
    `;

    return;
  }

  profileServices.forEach(service => {
    const tag =
      document.createElement("span");

    tag.textContent = service;

    container.appendChild(tag);
  });
}

function renderDetails() {
  const container =
    elements.reviewDetails;

  const details =
    getDisplayDetails();

  container.innerHTML = "";

  details
    .filter(detail => detail.value)
    .forEach(detail => {
      const item =
        document.createElement("div");

      item.className =
        "review-detail-item";

      item.innerHTML = `
        <span>
          ${escapeHTML(detail.label)}
        </span>

        <strong>
          ${escapeHTML(String(detail.value))}
        </strong>
      `;

      container.appendChild(item);
    });

  if (!container.children.length) {
    container.innerHTML = `
      <p class="review-empty-text">
        No extra details added.
      </p>
    `;
  }
}

function getDisplayDetails() {
  if (profileType === "individual") {
    return getIndividualDetails();
  }

  if (profileType === "shop") {
    return getShopDetails();
  }

  if (profileType === "large-business") {
    return getLargeBusinessDetails();
  }

  return getBusinessDetails();
}

function getIndividualDetails() {
  const price =
    extraDetails.priceType ===
    "contact for price"
      ? "Contact for price"
      : extraDetails.startingPrice
        ? `$${extraDetails.startingPrice} ${
            extraDetails.priceType || ""
          }`.trim()
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

function getShopDetails() {
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

function getLargeBusinessDetails() {
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

function getBusinessDetails() {
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
  const container =
    elements.reviewContact;

  const contactItems =
    getContactItems();

  container.innerHTML = "";

  if (contactItems.length === 0) {
    container.innerHTML = `
      <p class="review-empty-text">
        No public contact options selected.
      </p>
    `;

    return;
  }

  contactItems.forEach(contact => {
    const item =
      document.createElement("div");

    item.className =
      "review-contact-item";

    item.innerHTML = `
      <span>${contact.icon}</span>

      <p>
        ${escapeHTML(contact.label)}
      </p>
    `;

    container.appendChild(item);
  });
}

function getContactItems() {
  const items = [];

  if (extraDetails.allowMessages) {
    items.push({
      icon: "💬",
      label:
        "NeedThingsDone messages enabled"
    });
  }

  if (extraDetails.contactEmail) {
    items.push({
      icon: "✉️",
      label: extraDetails.contactEmail
    });
  }

  if (
    extraDetails.contactPhone &&
    extraDetails.showPhone
  ) {
    items.push({
      icon: "📞",
      label: extraDetails.contactPhone
    });
  }

  if (extraDetails.website) {
    items.push({
      icon: "🌐",
      label: extraDetails.website
    });
  }

  return items;
}

function renderDocument() {
  if (
    profileType !== "individual" ||
    !extraDetails.documentLink
  ) {
    elements.reviewDocumentSection.hidden =
      true;

    return;
  }

  elements.reviewDocumentSection.hidden =
    false;

  elements.reviewDocumentLink.href =
    extraDetails.documentLink;
}

function renderStrength() {
  const result =
    calculateProfileStrength();

  elements.strengthScore.textContent =
    `${result.score}%`;

  elements.strengthFill.style.width =
    `${result.score}%`;

  elements.strengthLabel.textContent =
    getStrengthLabel(result.score);

  renderStrengthSuggestions(
    result.suggestions
  );
}

function calculateProfileStrength() {
  let score = 0;

  const suggestions = [];

  if (profileDetails.displayName) {
    score += 12;
  } else {
    suggestions.push(
      "Add a profile name."
    );
  }

  if (
    profileDetails.city &&
    profileDetails.province
  ) {
    score += 10;
  } else {
    suggestions.push(
      "Add your complete location."
    );
  }

  if (profileServices.length >= 3) {
    score += 18;
  } else if (
    profileServices.length > 0
  ) {
    score += 9;

    suggestions.push(
      "Add a few more skills or services."
    );
  } else {
    suggestions.push(
      "Choose at least one skill or service."
    );
  }

  if (profileTags.length >= 3) {
    score += 12;
  } else if (
    profileTags.length > 0
  ) {
    score += 6;

    suggestions.push(
      "Choose a few more profile tags."
    );
  } else {
    suggestions.push(
      "Complete Otto’s tag questions."
    );
  }

  if (
    extraDetails.longDescription &&
    extraDetails.longDescription.length >= 100
  ) {
    score += 23;
  } else if (
    extraDetails.longDescription
  ) {
    score += 11;

    suggestions.push(
      "Write a slightly longer introduction."
    );
  } else {
    suggestions.push(
      "Add an About section."
    );
  }

  if (
    extraDetails.allowMessages ||
    extraDetails.contactEmail ||
    extraDetails.contactPhone ||
    extraDetails.website
  ) {
    score += 13;
  } else {
    suggestions.push(
      "Add a contact option."
    );
  }

  if (
    extraDetails.documentLink ||
    extraDetails.website
  ) {
    score += 12;
  } else {
    suggestions.push(
      profileType === "individual"
        ? "Add a website, resume, portfolio, or flyer."
        : "Add your website."
    );
  }

  return {
    score: Math.min(score, 100),
    suggestions
  };
}

function getStrengthLabel(score) {
  if (score >= 85) {
    return "Excellent";
  }

  if (score >= 65) {
    return "Looking good";
  }

  if (score >= 40) {
    return "Good start";
  }

  return "Needs more details";
}

function renderStrengthSuggestions(
  suggestions
) {
  const container =
    elements.strengthSuggestions;

  container.innerHTML = "";

  if (suggestions.length === 0) {
    container.innerHTML = `
      <p class="strength-complete">
        ✓ Your profile looks ready.
      </p>
    `;

    return;
  }

  suggestions
    .slice(0, 3)
    .forEach(suggestion => {
      const item =
        document.createElement("p");

      item.textContent =
        `• ${suggestion}`;

      container.appendChild(item);
    });
}

function publishCompletedProfile() {
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

  localStorage.removeItem("ntdSignupFlowPendingV1");
  localStorage.removeItem("ntdPendingEmail");

  elements.reviewMessage.textContent =
    "Profile saved locally. Database publishing will be connected next.";

  elements.reviewMessage.classList.remove(
    "error"
  );

  elements.reviewMessage.classList.add(
    "success"
  );

  elements.publishProfile.disabled =
    true;

  elements.publishProfile.textContent =
    "Profile Ready ✓";
}

function readStoredObject(key) {
  try {
    return (
      JSON.parse(
        localStorage.getItem(key)
      ) || {}
    );
  } catch (error) {
    console.error(
      `Could not read stored object: ${key}`,
      error
    );

    return {};
  }
}

function readStoredArray(key) {
  try {
    const value =
      JSON.parse(
        localStorage.getItem(key)
      );

    return Array.isArray(value)
      ? value
      : [];
  } catch (error) {
    console.error(
      `Could not read stored array: ${key}`,
      error
    );

    return [];
  }
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
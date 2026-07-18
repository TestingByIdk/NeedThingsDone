const MAX_SELECTIONS = 6;
const CUSTOM_CHARACTER_LIMIT = 40;

const profileType =
  localStorage.getItem("ntdProfileType") || "individual";

const servicesHeading =
  document.getElementById("servicesHeading");

const servicesOttoText =
  document.getElementById("servicesOttoText");

const serviceSearch =
  document.getElementById("serviceSearch");

const serviceOptions =
  document.getElementById("serviceOptions");

const selectedCount =
  document.getElementById("selectedCount");

const customService =
  document.getElementById("customService");

const customCount =
  document.getElementById("customCount");

const addCustomService =
  document.getElementById("addCustomService");

const continueServices =
  document.getElementById("continueServices");

const servicesMessage =
  document.getElementById("servicesMessage");

/*
  Front-end filtering improves the experience, but it is not security.
  Apply the same validation on the server before saving public profile data.
*/
const blockedTerms = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "cunt",
  "dick",
  "pussy",
  "nigger",
  "faggot"
];

const serviceData = {
  individual: {
    heading: "Choose your skills",
    otto: "Pick the skills that best show what you can help people with.",
    searchPlaceholder: "Search skills...",
    popular: [
      "Dog Walking",
      "Tutoring",
      "Computer Repair",
      "Tech Support",
      "Cleaning"
    ],
    options: [
      "Pet Care",
      "Dog Walking",
      "Tutoring",
      "Language Help",
      "Computer Repair",
      "Tech Support",
      "Photography",
      "Graphic Design",
      "Website Help",
      "Social Media",
      "Cleaning",
      "Home Organization",
      "Furniture Assembly",
      "Lawn Care",
      "Snow Removal",
      "Painting",
      "Moving Help",
      "Delivery Help",
      "Writing",
      "Music Lessons",
      "Event Help",
      "Childcare",
      "Senior Assistance",
      "Other"
    ]
  },

  shop: {
    heading: "Choose your shop categories",
    otto: "Choose what your shop sells so customers can find the right products.",
    searchPlaceholder: "Search shop categories...",
    popular: [
      "Café",
      "Bakery",
      "Arts & Crafts",
      "Local Food",
      "Deals & Promotions"
    ],
    options: [
      "Café",
      "Bakery",
      "Restaurant",
      "Arts & Crafts",
      "Clothing",
      "Jewelry",
      "Home Décor",
      "Beauty Products",
      "Pet Products",
      "Computer Parts",
      "Auto Parts",
      "Tools",
      "Books",
      "Local Food",
      "Collectibles",
      "Gifts",
      "Handmade Products",
      "Digital Products",
      "Seasonal Products",
      "Deals & Promotions",
      "Other"
    ]
  },

  business: {
    heading: "Choose your business services",
    otto: "Choose the main services customers can get from your business.",
    searchPlaceholder: "Search business services...",
    popular: [
      "Roofing",
      "Plumbing",
      "Cleaning",
      "Automotive Repair",
      "Computer Repair"
    ],
    options: [
      "Roofing",
      "Plumbing",
      "Electrical",
      "Heating & Cooling",
      "Landscaping",
      "Cleaning",
      "Renovations",
      "Painting",
      "Moving",
      "Automotive Repair",
      "Auto Detailing",
      "Tire Services",
      "Computer Repair",
      "IT Support",
      "Web Design",
      "Accounting",
      "Legal Services",
      "Consulting",
      "Photography",
      "Marketing",
      "Event Services",
      "Food Services",
      "Pet Services",
      "Other"
    ]
  },

  "large-business": {
    heading: "Choose your business services",
    otto: "Choose the services offered across your business locations.",
    searchPlaceholder: "Search business services...",
    popular: [
      "Retail",
      "Restaurant",
      "Automotive",
      "Home Services",
      "Professional Services"
    ],
    options: [
      "Retail",
      "Restaurant",
      "Automotive",
      "Home Services",
      "Technology",
      "Health & Wellness",
      "Professional Services",
      "Financial Services",
      "Education",
      "Hospitality",
      "Entertainment",
      "Construction",
      "Property Services",
      "Transportation",
      "Food Services",
      "Pet Services",
      "Personal Care",
      "Multiple Service Categories",
      "Other"
    ]
  }
};

const selectedConfig =
  serviceData[profileType] || serviceData.individual;

let allOptions = [...selectedConfig.options];
let selectedServices = new Set();

servicesHeading.textContent = selectedConfig.heading;
servicesOttoText.textContent = selectedConfig.otto;
serviceSearch.placeholder = selectedConfig.searchPlaceholder;
customService.maxLength = CUSTOM_CHARACTER_LIMIT;

loadSavedSelections();
renderOptions();
updateCustomCount();

serviceSearch.addEventListener("input", () => {
  renderOptions(serviceSearch.value);
});

customService.addEventListener("input", () => {
  updateCustomCount();
  clearMessage();
});

addCustomService.addEventListener("click", addCustomOption);

customService.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    addCustomOption();
  }
});

continueServices.addEventListener("click", () => {
  if (selectedServices.size === 0) {
    showMessage(
      "Choose at least one option before continuing.",
      true
    );
    return;
  }

  localStorage.setItem(
    "ntdProfileServices",
    JSON.stringify([...selectedServices])
  );

  window.location.href = "profile-extra-details.html";
});

function renderOptions(searchTerm = "") {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const visibleOptions = allOptions.filter(option =>
    option.toLowerCase().includes(normalizedSearch)
  );

  serviceOptions.innerHTML = "";

  if (visibleOptions.length === 0) {
    serviceOptions.innerHTML = `
      <div class="no-service-results">
        <span>🔍</span>
        <h2>No matching options</h2>
        <p>Add your own option below.</p>
      </div>
    `;
    return;
  }

  visibleOptions.forEach(option => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "service-option";
    button.dataset.service = option;
    button.setAttribute(
      "aria-pressed",
      String(selectedServices.has(option))
    );

    if (selectedServices.has(option)) {
      button.classList.add("selected");
    }

    button.innerHTML = `
  <span class="service-check">✓</span>
  <span class="service-name">${escapeHTML(option)}</span>
`;

    button.addEventListener("click", () => {
      toggleService(option);
    });

    serviceOptions.appendChild(button);
  });
}

function toggleService(service) {
  clearMessage();

  if (selectedServices.has(service)) {
    selectedServices.delete(service);
  } else {
    if (selectedServices.size >= MAX_SELECTIONS) {
      showMessage(
        `You can choose up to ${MAX_SELECTIONS} options.`,
        true
      );
      return;
    }

    selectedServices.add(service);
  }

  updateSelectionState();
  renderOptions(serviceSearch.value);
}

function addCustomOption() {
  clearMessage();

  const value = cleanDisplayValue(customService.value);

  if (!value) {
    showMessage("Enter an option before adding it.", true);
    return;
  }

  if (value.length > CUSTOM_CHARACTER_LIMIT) {
    showMessage(
      `Custom options must be ${CUSTOM_CHARACTER_LIMIT} characters or fewer.`,
      true
    );
    return;
  }

  if (containsBlockedTerm(value)) {
    showMessage(
      "Please choose a more appropriate option.",
      true
    );
    return;
  }

  const normalizedValue = normalizeForComparison(value);

  const existingOption = allOptions.find(option =>
    normalizeForComparison(option) === normalizedValue
  );

  if (existingOption) {
    if (selectedServices.has(existingOption)) {
      showMessage(`"${existingOption}" is already selected.`, true);
      return;
    }

    if (selectedServices.size >= MAX_SELECTIONS) {
      showMessage(
        `You can choose up to ${MAX_SELECTIONS} options.`,
        true
      );
      return;
    }

    selectedServices.add(existingOption);
    resetCustomInput();
    updateSelectionState();
    renderOptions(serviceSearch.value);
    showMessage(`"${existingOption}" is now selected.`);
    return;
  }

  if (selectedServices.size >= MAX_SELECTIONS) {
    showMessage(
      `You can choose up to ${MAX_SELECTIONS} options.`,
      true
    );
    return;
  }

  allOptions.push(value);
  selectedServices.add(value);

  resetCustomInput();
  serviceSearch.value = "";

  updateSelectionState();
  renderOptions();
  showMessage("Custom option added.");
}

function containsBlockedTerm(value) {
  const normalized = value
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[$5]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const compact = normalized.replace(/\s/g, "");

  return blockedTerms.some(term => {
    const cleanTerm = term.replace(/[^a-z0-9]/g, "");

    return (
      normalized.split(" ").includes(cleanTerm) ||
      compact.includes(cleanTerm)
    );
  });
}

function normalizeForComparison(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function cleanDisplayValue(value) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^[^a-zA-Z0-9À-ÿ]+|[^a-zA-Z0-9À-ÿ]+$/g, "");
}

function resetCustomInput() {
  customService.value = "";
  updateCustomCount();
}

function updateCustomCount() {
  customCount.textContent = customService.value.length;
  customCount.parentElement.classList.toggle(
    "near-limit",
    customService.value.length >= CUSTOM_CHARACTER_LIMIT - 5
  );
}

function updateSelectionState() {
  selectedCount.textContent = selectedServices.size;
  continueServices.disabled = selectedServices.size === 0;

  localStorage.setItem(
    "ntdProfileServicesDraft",
    JSON.stringify([...selectedServices])
  );
}

function loadSavedSelections() {
  const saved =
    localStorage.getItem("ntdProfileServicesDraft") ||
    localStorage.getItem("ntdProfileServices");

  if (!saved) {
    updateSelectionState();
    return;
  }

  try {
    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      updateSelectionState();
      return;
    }

    parsed.slice(0, MAX_SELECTIONS).forEach(service => {
      if (
        typeof service === "string" &&
        service.trim()
      ) {
        const cleanService = cleanDisplayValue(service);

        if (!cleanService || containsBlockedTerm(cleanService)) {
          return;
        }

        selectedServices.add(cleanService);

        if (
          !allOptions.some(
            option =>
              normalizeForComparison(option) ===
              normalizeForComparison(cleanService)
          )
        ) {
          allOptions.push(cleanService);
        }
      }
    });
  } catch (error) {
    console.error("Could not load saved services:", error);
  }

  updateSelectionState();
}

function showMessage(message, isError = false) {
  servicesMessage.textContent = message;
  servicesMessage.classList.toggle("error", isError);
  servicesMessage.classList.toggle("success", !isError);
}

function clearMessage() {
  servicesMessage.textContent = "";
  servicesMessage.classList.remove("error", "success");
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, character => {
    const characters = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return characters[character];
  });
}

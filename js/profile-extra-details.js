const profileType =
  localStorage.getItem("ntdProfileType") || "individual";

const extraHeading =
  document.getElementById("extraHeading");

const extraOttoText =
  document.getElementById("extraOttoText");

const dynamicFields =
  document.getElementById("dynamicFields");

const extraDetailsForm =
  document.getElementById("extraDetailsForm");

const extraMessage =
  document.getElementById("extraMessage");

const contactEmail =
  document.getElementById("contactEmail");

const contactPhone =
  document.getElementById("contactPhone");

const website =
  document.getElementById("website");

const allowMessages =
  document.getElementById("allowMessages");

const showPhone =
  document.getElementById("showPhone");

const pageSettings = {
  individual: {
    heading: "Complete your individual profile",
    otto:
      "Tell people about your experience, availability, and service area.",
    fields: `
      <div class="form-field full-field">
        <label for="longDescription">About you</label>

        <textarea
          id="longDescription"
          maxlength="500"
          placeholder="Explain your experience, what you enjoy doing, and what people can expect when working with you."
          required
        ></textarea>

        <div class="character-count">
          <span id="longDescriptionCount">0</span>/500
        </div>
      </div>

      <div class="form-field">
        <label for="experience">Years of experience</label>

        <select id="experience" required>
          <option value="">Select experience</option>
          <option value="Less than 1 year">Less than 1 year</option>
          <option value="1–2 years">1–2 years</option>
          <option value="3–5 years">3–5 years</option>
          <option value="6–10 years">6–10 years</option>
          <option value="10+ years">10+ years</option>
        </select>
      </div>

      <div class="form-field full-field">

  <label>Starting price</label>

  <div class="price-row">

    <span>$</span>

    <input
      id="startingPrice"
      type="number"
      min="0"
      max="100000"
      step="0.01"
      placeholder="25"
    >

    <select id="priceType">
      <option value="per hour">Per hour</option>
      <option value="per job">Per job</option>
      <option value="starting at">Starting at</option>
      <option value="contact for price">
        Contact for price
      </option>
    </select>

  </div>

</div>

<div class="form-field full-field document-link-field">

    <label for="documentLink">
        Resume, portfolio or flyer
        <span class="field-optional">(Optional)</span>
    </label>

    <p class="field-help">
        Upload your resume, portfolio, or promotional flyer somewhere online
        (Google Drive, Dropbox, OneDrive, etc.) and paste the public link here.

        NeedThingsDone will automatically show a preview on your public profile.
    </p>

    <input
        id="documentLink"
        type="url"
        placeholder="https://drive.google.com/..."
    >

    <div class="accepted-document-types">
        <span>📄 Resume PDF</span>
        <span>🎨 Portfolio</span>
        <span>📢 Flyer</span>
        <span>📋 Brochure</span>
    </div>

    <p class="link-warning">
        Make sure anyone with the link can view the document.
    </p>

</div>

</div>
            `
    
  },

  shop: {
    heading: "Complete your shop profile",
    otto:
      "Add your shop details so customers know how to browse and buy.",
    fields: `
      <div class="form-field full-field">
        <label for="longDescription">About your shop</label>

        <textarea
          id="longDescription"
          maxlength="500"
          placeholder="Explain what your shop sells and what makes it special."
          required
        ></textarea>

        <div class="character-count">
          <span id="longDescriptionCount">0</span>/500
        </div>
      </div>

      <div class="form-field">
        <label for="storeType">Store type</label>

        <select id="storeType" required>
          <option value="">Select store type</option>
          <option value="Physical store">Physical store</option>
          <option value="Online store">Online store</option>
          <option value="Physical and online">
            Physical and online
          </option>
          <option value="Market or pop-up">
            Market or pop-up
          </option>
        </select>
      </div>

      <div class="form-field">
        <label for="orderOptions">Order options</label>

        <select id="orderOptions" required>
          <option value="">Select order options</option>
          <option value="Pickup">Pickup</option>
          <option value="Delivery">Delivery</option>
          <option value="Shipping">Shipping</option>
          <option value="Pickup and delivery">
            Pickup and delivery
          </option>
          <option value="External website">
            External website
          </option>
        </select>
      </div>

      <div class="form-field">
        <label for="shopHours">Store hours</label>

        <input
          id="shopHours"
          type="text"
          maxlength="100"
          placeholder="Mon–Fri, 9 AM–5 PM"
          required
        >
      </div>

      <div class="form-field">
        <label for="priceRange">Price range</label>

        <select id="priceRange">
          <option value="">Select price range</option>
          <option value="$">$ — Budget</option>
          <option value="$$">$$ — Moderate</option>
          <option value="$$$">$$$ — Premium</option>
          <option value="Varies">Varies</option>
        </select>
      </div>
    `
  },

  business: {
    heading: "Complete your business profile",
    otto:
      "Add the information customers need before contacting your business.",
    fields: `
      <div class="form-field full-field">
        <label for="longDescription">Business description</label>

        <textarea
          id="longDescription"
          maxlength="500"
          placeholder="Explain your services, experience, and what customers can expect."
          required
        ></textarea>

        <div class="character-count">
          <span id="longDescriptionCount">0</span>/500
        </div>
      </div>

      <div class="form-field">
        <label for="yearsInBusiness">
          Years in business
        </label>

        <select id="yearsInBusiness" required>
          <option value="">Select years</option>
          <option value="Less than 1 year">
            Less than 1 year
          </option>
          <option value="1–2 years">1–2 years</option>
          <option value="3–5 years">3–5 years</option>
          <option value="6–10 years">6–10 years</option>
          <option value="10+ years">10+ years</option>
        </select>
      </div>

      <div class="form-field">
        <label for="businessHours">Business hours</label>

        <input
          id="businessHours"
          type="text"
          maxlength="100"
          placeholder="Mon–Fri, 8 AM–6 PM"
          required
        >
      </div>

      <div class="form-field">
        <label for="serviceArea">Service area</label>

        <select id="serviceArea" required>
          <option value="">Select service area</option>
          <option value="One neighbourhood">
            One neighbourhood
          </option>
          <option value="City-wide">City-wide</option>
          <option value="Regional">Regional</option>
          <option value="Province-wide">Province-wide</option>
          <option value="Remote">Remote services</option>
        </select>
      </div>

      <div class="form-field">
        <label for="emergencyService">
          Emergency service
        </label>

        <select id="emergencyService">
          <option value="No">No</option>
          <option value="Yes">Yes</option>
          <option value="Limited availability">
            Limited availability
          </option>
        </select>
      </div>
    `
  },

  "large-business": {
    heading: "Complete your multi-location profile",
    otto:
      "Add the main details shared across your business locations.",
    fields: `
      <div class="form-field full-field">
        <label for="longDescription">Business description</label>

        <textarea
          id="longDescription"
          maxlength="500"
          placeholder="Explain your business, services, and locations."
          required
        ></textarea>

        <div class="character-count">
          <span id="longDescriptionCount">0</span>/500
        </div>
      </div>

      <div class="form-field">
        <label for="locationCount">
          Number of locations
        </label>

        <input
          id="locationCount"
          type="number"
          min="2"
          max="10000"
          placeholder="2"
          required
        >
      </div>

      <div class="form-field">
        <label for="yearsInBusiness">
          Years in business
        </label>

        <select id="yearsInBusiness" required>
          <option value="">Select years</option>
          <option value="Less than 1 year">
            Less than 1 year
          </option>
          <option value="1–2 years">1–2 years</option>
          <option value="3–5 years">3–5 years</option>
          <option value="6–10 years">6–10 years</option>
          <option value="10+ years">10+ years</option>
        </select>
      </div>

      <div class="form-field">
        <label for="businessHours">
          General business hours
        </label>

        <input
          id="businessHours"
          type="text"
          maxlength="100"
          placeholder="Hours may vary by location"
          required
        >
      </div>

      <div class="form-field">
        <label for="coverageArea">
          Coverage area
        </label>

        <select id="coverageArea" required>
          <option value="">Select coverage</option>
          <option value="One city">One city</option>
          <option value="Multiple cities">
            Multiple cities
          </option>
          <option value="Province-wide">
            Province-wide
          </option>
          <option value="Across Canada">
            Across Canada
          </option>
        </select>
      </div>
    `
  }
};

const selectedSettings =
  pageSettings[profileType] || pageSettings.individual;

extraHeading.textContent = selectedSettings.heading;
extraOttoText.textContent = selectedSettings.otto;
dynamicFields.innerHTML = selectedSettings.fields;
const websiteLabel =
    document.getElementById("websiteLabel");

const websiteHelp =
    document.getElementById("websiteHelp");

if(profileType==="individual"){

    websiteLabel.textContent =
        "Personal website or social profile";

    websiteHelp.textContent =
        "Optional. Add your portfolio, LinkedIn, website, or another public profile. Use the Resume/Flyer section above if you want a document preview.";

}else if(profileType==="shop"){

    websiteLabel.textContent =
        "Shop website";

    websiteHelp.textContent =
        "Recommended. Add your Shopify store, menu, online catalogue, or shop page.";

}else{

    websiteLabel.textContent =
        "Business website";

    websiteHelp.textContent =
        "Recommended. Add your official website or Google Business page.";
}

const longDescription =
  document.getElementById("longDescription");

const longDescriptionCount =
  document.getElementById("longDescriptionCount");

longDescription.addEventListener("input", () => {
  longDescriptionCount.textContent =
    longDescription.value.length;
});

loadSavedData();

extraDetailsForm.addEventListener("submit", event => {
  event.preventDefault();
  clearMessage();

  if (!extraDetailsForm.checkValidity()) {
    extraDetailsForm.reportValidity();
    return;
  }

  const extraDetails = collectFormValues();

  if (
    extraDetails.contactPhone &&
    !isValidPhone(extraDetails.contactPhone)
  ) {
    showMessage(
      "Please enter a valid phone number.",
      true
    );
    return;
  }

  if(
    extraDetails.documentLink &&
    !isValidWebsite(extraDetails.documentLink)
){

    showMessage(
        "Please enter a valid public resume or flyer URL.",
        true
    );

    return;

}

  if (
    extraDetails.website &&
    !isValidWebsite(extraDetails.website)
  ) {
    showMessage(
      "Please enter a full website address, including https://",
      true
    );
    return;
  }

  localStorage.setItem(
    "ntdProfileExtraDetails",
    JSON.stringify(extraDetails)
  );

  window.location.href = "profile-review.html";
});

function collectFormValues() {
  const values = {
    type: profileType
  };

  extraDetailsForm
    .querySelectorAll("input, select, textarea")
    .forEach(field => {
      if (!field.id) return;

      if (field.type === "checkbox") {
        values[field.id] = field.checked;
      } else {
        values[field.id] = field.value.trim();
      }
    });

  return values;
}

function loadSavedData() {
  const saved =
    localStorage.getItem("ntdProfileExtraDetails");

  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);

    if (
      !parsed ||
      parsed.type !== profileType
    ) {
      return;
    }

    Object.entries(parsed).forEach(([key, value]) => {
      const field = document.getElementById(key);

      if (!field) return;

      if (field.type === "checkbox") {
        field.checked = Boolean(value);
      } else {
        field.value = value;
      }
    });

    longDescriptionCount.textContent =
      longDescription.value.length;
  } catch (error) {
    console.error(
      "Could not load saved extra details:",
      error
    );
  }
}

function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function isValidWebsite(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function showMessage(message, isError = false) {
  extraMessage.textContent = message;
  extraMessage.classList.toggle("error", isError);
}

function clearMessage() {
  extraMessage.textContent = "";
  extraMessage.classList.remove("error");
}
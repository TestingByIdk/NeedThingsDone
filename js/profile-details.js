const profileType =
  localStorage.getItem("ntdProfileType") || "individual";

const detailsHeading =
  document.getElementById("detailsHeading");

const detailsOttoText =
  document.getElementById("detailsOttoText");

const displayNameLabel =
  document.getElementById("displayNameLabel");

const displayName =
  document.getElementById("displayName");

const city =
  document.getElementById("city");

const province =
  document.getElementById("province");

const shortDescription =
  document.getElementById("shortDescription");

const descriptionCount =
  document.getElementById("descriptionCount");

const detailsMessage =
  document.getElementById("detailsMessage");

const profileDetailsForm =
  document.getElementById("profileDetailsForm");

const pageContent = {
  individual: {
    heading: "Tell us about yourself",
    label: "Display name",
    placeholder: "Your name",
    otto: "Let’s add the basic details people will see on your profile."
  },

  shop: {
    heading: "Tell us about your shop",
    label: "Shop name",
    placeholder: "Your shop name",
    otto: "Let’s add the basic details customers will see about your shop."
  },

  business: {
    heading: "Tell us about your business",
    label: "Business name",
    placeholder: "Your business name",
    otto: "Let’s add the information customers need to recognize your business."
  },

  "large-business": {
    heading: "Tell us about your business",
    label: "Business name",
    placeholder: "Your business name",
    otto: "Let’s start with the main information for your multi-location business."
  }
};

const selectedContent =
  pageContent[profileType] || pageContent.individual;

detailsHeading.textContent =
  selectedContent.heading;

detailsOttoText.textContent =
  selectedContent.otto;

displayNameLabel.textContent =
  selectedContent.label;

displayName.placeholder =
  selectedContent.placeholder;

shortDescription.addEventListener("input", () => {
  descriptionCount.textContent =
    shortDescription.value.length;
});

profileDetailsForm.addEventListener("submit", event => {
  event.preventDefault();

  const profileDetails = {
    type: profileType,
    displayName: displayName.value.trim(),
    city: city.value.trim(),
    province: province.value,
    shortDescription: shortDescription.value.trim()
  };

  if (
    !profileDetails.displayName ||
    !profileDetails.city ||
    !profileDetails.province ||
    !profileDetails.shortDescription
  ) {
    detailsMessage.textContent =
      "Please complete every field before continuing.";

    detailsMessage.classList.add("error");
    return;
  }

  localStorage.setItem(
    "ntdProfileDetails",
    JSON.stringify(profileDetails)
  );

  window.location.href = "profile-services.html";
});
const profileType = localStorage.getItem("ntdProfileType");

const previewIcon = document.getElementById("previewIcon");
const previewTitle = document.getElementById("previewTitle");
const previewHeading = document.getElementById("previewHeading");
const previewList = document.getElementById("previewList");
const previewOttoText = document.getElementById("previewOttoText");

const profiles = {
  individual: {
    icon: "👤",
    title: "Individual",
    otto: "Great! I’ll help you build a profile that shows what you can do.",
    items: ["Reviews", "Skills", "Pricing", "Contact options"]
  },
  shop: {
    icon: "🛍️",
    title: "Shop",
    otto: "Awesome! I’ll help your shop look clear, trusted, and easy to find.",
    items: ["Shop profile", "Products or menu", "Deals", "Customer reviews"]
  },
  business: {
    icon: "🏢",
    title: "Business",
    otto: "Nice! I’ll help build a business page customers can trust.",
    items: ["Business page", "Services", "Location", "Reviews"]
  },
  "large-business": {
    icon: "📍",
    title: "Multi-Location",
    otto: "Perfect! I’ll help organize your locations and business details.",
    items: ["Multiple locations", "Business details", "Weekly news visibility", "Customer reviews"]
  }
};

const selected = profiles[profileType] || profiles.individual;

previewIcon.textContent = selected.icon;
previewTitle.textContent = selected.title;
previewHeading.textContent = `Perfect! You're creating a ${selected.title} profile.`;
previewOttoText.textContent = selected.otto;

previewList.innerHTML = selected.items.map(item => `<li>${item}</li>`).join("");
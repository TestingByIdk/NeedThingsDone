const profileCards = document.querySelectorAll(".profile-card");
const continueProfile = document.getElementById("continueProfile");
const profileOttoText = document.getElementById("profileOttoText");

let selectedProfile = "";

const ottoMessages = {
  individual: "Nice! I’ll help you make a profile that shows your skills clearly.",
  shop: "Awesome! I’ll help your shop stand out with links, products, and location info.",
  business: "Great choice! I’ll help build a business page customers can trust.",
  "large-business": "Big move! I’ll help organize your locations and featured visibility."
};

profileCards.forEach(card => {
  card.addEventListener("mouseenter", () => {
    const profile = card.dataset.profile;
    profileOttoText.textContent = ottoMessages[profile];
  });

  card.addEventListener("click", () => {
    profileCards.forEach(c => c.classList.remove("selected"));

    card.classList.add("selected");
    selectedProfile = card.dataset.profile;

    profileOttoText.textContent = ottoMessages[selectedProfile];

    continueProfile.disabled = false;
    continueProfile.classList.add("ready");
  });
});

continueProfile.addEventListener("click", () => {
  if (!selectedProfile) return;

  localStorage.setItem("ntdProfileType", selectedProfile);
  window.location.href = "profile-preview.html";
});

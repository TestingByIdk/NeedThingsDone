const tutorialSteps = [
  {
    title: "Welcome to NeedThingsDone!",
    text: "Hi! I’m Otto. I’ll show you how NeedThingsDone helps you find businesses, individuals, shops, community help, news, and nearby listings."
  },
  {
    title: "Home",
    text: "The Home page gives you a quick overview of the platform. You can search for help, see platform stats, learn about Alex, and meet me, Otto."
  },
  {
    title: "Businesses",
    text: "The Businesses page is for trusted companies and services like roofing, plumbing, auto repair, tech support, and more."
  },
  {
    title: "Individuals",
    text: "The Individuals page is for people offering skills, help, creativity, or services. This could include pet care, tutoring, tech help, photography, and unique talents."
  },
  {
    title: "Shop",
    text: "The Shop page is for products and local finds like parts, arts and crafts, cafés, bakeries, local stores, featured products, and deals."
  },
  {
    title: "Community",
    text: "The Community page works like a forum. You can ask questions, get recommendations, share advice, and help others find what they need."
  },
  {
    title: "News",
    text: "The News page will become NeedThingsDone Weekly. Otto will highlight new businesses, new individuals, shop finds, reminders, and fun local updates."
  },
  {
    title: "Signing Up",
    text: "Users are able to create accounts. Businesses can make profiles, individuals can show their skills, and shops can list products. Otto will help guide everyone and anyone setup step by step!"
  }
];

let currentStep = 0;

const openTutorial = document.getElementById("openTutorial");
const tutorialOverlay = document.getElementById("tutorialOverlay");
const closeTutorial = document.getElementById("closeTutorial");
const nextTutorial = document.getElementById("nextTutorial");
const prevTutorial = document.getElementById("prevTutorial");

const tutorialStep = document.getElementById("tutorialStep");
const tutorialTitle = document.getElementById("tutorialTitle");
const tutorialText = document.getElementById("tutorialText");

function updateTutorial() {
  tutorialStep.textContent = `Step ${currentStep + 1} of ${tutorialSteps.length}`;
  tutorialTitle.textContent = tutorialSteps[currentStep].title;
  tutorialText.textContent = tutorialSteps[currentStep].text;

  prevTutorial.style.visibility = currentStep === 0 ? "hidden" : "visible";
  nextTutorial.textContent = currentStep === tutorialSteps.length - 1 ? "Finish" : "Next";
}

if (openTutorial) {
  openTutorial.addEventListener("click", function(event) {
    event.preventDefault();
    currentStep = 0;
    updateTutorial();
    tutorialOverlay.classList.add("show");
  });
}

if (closeTutorial) {
  closeTutorial.addEventListener("click", function() {
    tutorialOverlay.classList.remove("show");
  });
}

if (nextTutorial) {
  nextTutorial.addEventListener("click", function() {
    if (currentStep < tutorialSteps.length - 1) {
      currentStep++;
      updateTutorial();
    } else {
      tutorialOverlay.classList.remove("show");
    }
  });
}

if (prevTutorial) {
  prevTutorial.addEventListener("click", function() {
    if (currentStep > 0) {
      currentStep--;
      updateTutorial();
    }
  });
}

if (tutorialOverlay) {
  tutorialOverlay.addEventListener("click", function(event) {
    if (event.target === tutorialOverlay) {
      tutorialOverlay.classList.remove("show");
    }
  });
}

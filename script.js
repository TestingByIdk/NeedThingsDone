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
    text: "Later, users will be able to create accounts. Businesses can make profiles, individuals can show their skills, and shops can list products. Otto will help guide setup step by step."
  },
  {
    title: "Have Fun Exploring!",
    text: "Lastly, make sure to have fun exploring NeedThingsDone. Discover local businesses, meet talented individuals, find great deals, ask questions, and see what your community has to offer. I'll be around to help whenever you need me! 🐙"
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
  if (!tutorialStep || !tutorialTitle || !tutorialText) return;

  tutorialStep.textContent = `Step ${currentStep + 1} of ${tutorialSteps.length}`;
  tutorialTitle.textContent = tutorialSteps[currentStep].title;
  tutorialText.textContent = tutorialSteps[currentStep].text;

  if (prevTutorial) {
    prevTutorial.style.visibility = currentStep === 0 ? "hidden" : "visible";
  }

  if (nextTutorial) {
    nextTutorial.textContent = currentStep === tutorialSteps.length - 1 ? "Finish" : "Next";
  }
}

if (openTutorial && tutorialOverlay) {
  openTutorial.addEventListener("click", function(event) {
    event.preventDefault();
    currentStep = 0;
    updateTutorial();
    tutorialOverlay.classList.add("show");
  });
}

if (closeTutorial && tutorialOverlay) {
  closeTutorial.addEventListener("click", function() {
    tutorialOverlay.classList.remove("show");
  });
}

if (nextTutorial && tutorialOverlay) {
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

// ABOUT ALEX / OTTO POPUPS

const openAlex = document.getElementById("openAlex");
const openOtto = document.getElementById("openOtto");
const aboutOverlay = document.getElementById("aboutOverlay");
const aboutContent = document.getElementById("aboutContent");
const closeAbout = document.getElementById("closeAbout");

const alexPopup = `
<h2>About Alex 👋</h2>

<p>Creator of NeedThingsDone.</p>

<p>
I started this project because I thought finding trustworthy businesses,
individuals, and community recommendations should be easier.
</p>

<p>
My goal is to build a place where Canadians can discover local businesses,
support skilled individuals, find deals, ask questions, and connect with
their communities.
</p>

<p>That's all.</p>

<p>Now enjoy this very important documentation:</p>

<a
  href="https://youtu.be/PvHU3dV-WNA?si=TJ5d_yaPR2xcgxh5"
  target="_blank"
  class="otto-link"
>
🐱 View Important Documentation
</a>
`;

const ottoPopup = `
<h2>About Otto 🐙</h2>

<p>Otto is an octopus.</p>

<p>
Nobody knows where he came from.
Nobody knows where he goes.
</p>

<p>
He simply appears whenever things need to get done.
</p>

<hr>

<p><strong>Favorite Food:</strong> Fish</p>
<p><strong>Favorite Hobby:</strong> Helping people</p>
<p><strong>Current Occupation:</strong> Professional Octopus</p>
<p><strong>Favorite Activity:</strong> Organizing chaos</p>
<p><strong>Number of Tentacles:</strong> 8</p>

<hr>

<p><strong>🐙 Otto Fact #1</strong></p>
<p>Otto has never paid taxes.</p>

<p><strong>🐙 Otto Fact #2</strong></p>
<p>Otto refuses to explain why.</p>

<p><strong>🐙 Otto Fact #3</strong></p>
<p>Otto claims he invented the internet. Nobody believes him.</p>

<p><strong>🐙 Otto Fact #4</strong></p>
<p>Otto once completed a task before it was assigned.</p>

<button class="otto-close-btn" id="acceptWisdom">
🐙 Accept Otto's Wisdom
</button>
`;

if (openAlex && aboutOverlay && aboutContent) {
  openAlex.addEventListener("click", function(e) {
    e.preventDefault();
    aboutContent.innerHTML = alexPopup;
    aboutOverlay.classList.add("show");
  });
}

if (openOtto && aboutOverlay && aboutContent) {
  openOtto.addEventListener("click", function(e) {
    e.preventDefault();
    aboutContent.innerHTML = ottoPopup;
    aboutOverlay.classList.add("show");

    const wisdomBtn = document.getElementById("acceptWisdom");

    if (wisdomBtn) {
      wisdomBtn.addEventListener("click", function() {
        aboutOverlay.classList.remove("show");
      });
    }
  });
}

if (closeAbout && aboutOverlay) {
  closeAbout.addEventListener("click", function() {
    aboutOverlay.classList.remove("show");
  });
}

if (aboutOverlay) {
  aboutOverlay.addEventListener("click", function(e) {
    if (e.target === aboutOverlay) {
      aboutOverlay.classList.remove("show");
    }
  });
}

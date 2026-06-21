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

<p>
Hi, I'm Alex, the creator of NeedThingsDone.
</p>

<p>
I started this project because I believe finding trustworthy businesses,
skilled individuals, and helpful local information should be simple.
</p>

<p>
My goal is to build a platform where people can discover opportunities,
support local communities, and find the help they need without jumping
between dozens of different websites.
</p>

<p>
NeedThingsDone is still growing, but every feature is being built with
that goal in mind.
</p>

<hr>

<p>
Thank you for checking out the project.
</p>

<p>
As a reward, I have included some extremely important documentation.
</p>

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

<p>
Otto is the official mascot of NeedThingsDone.
</p>

<p>
While most platforms have support agents, help centers, and complicated guides,
NeedThingsDone has an octopus.
</p>

<p>
Nobody knows where Otto came from.
Nobody knows where he goes.
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
<p>
Otto has never paid taxes.
</p>

<p><strong>🐙 Otto Fact #2</strong></p>
<p>
When questioned about Fact #1, Otto declined to comment.
</p>

<p><strong>🐙 Otto Fact #3</strong></p>
<p>
Otto claims he invented the internet.
Historians remain unconvinced.
</p>

<p><strong>🐙 Otto Fact #4</strong></p>
<p>
Otto once completed a task before it was assigned.
This achievement remains under investigation.
</p>

<p><strong>🐙 Otto's Mission</strong></p>
<p>
Help people find trusted businesses, talented individuals,
great deals, useful information, and the right path forward.
</p>

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

// DARK MODE

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "☀️";
    }

    themeToggle.addEventListener("click", function() {

        document.body.classList.toggle("dark-mode");

        const darkModeEnabled =
            document.body.classList.contains("dark-mode");

        localStorage.setItem(
            "theme",
            darkModeEnabled ? "dark" : "light"
        );

        themeToggle.textContent =
            darkModeEnabled ? "☀️" : "🌙";
    });
}


const exploreArea = document.getElementById("exploreArea");
const exploreTitle = document.getElementById("exploreTitle");
const exploreEmoji = document.getElementById("exploreEmoji");
const exploreContent = document.getElementById("exploreContent");

const categoryData = {

  parts: {
    emoji: "🛠️",
    title: "Parts",
    items: [
      "Computer Components",
      "Car Parts",
      "Power Tools",
      "Phone Accessories",
      "Networking Equipment",
      "Cables & Adapters"
    ]
  },

  crafts: {
    emoji: "🎨",
    title: "Arts & Crafts",
    items: [
      "Handmade Jewelry",
      "Paintings",
      "Custom Artwork",
      "3D Prints",
      "Woodworking",
      "Craft Supplies"
    ]
  },

  cafes: {
    emoji: "☕",
    title: "Cafés & Bakeries",
    items: [
      "Coffee Shops",
      "Fresh Pastries",
      "Cupcakes",
      "Donuts",
      "Bread",
      "Local Treats"
    ]
  },

  stores: {
    emoji: "🏪",
    title: "Local Stores",
    items: [
      "Gift Shops",
      "Electronics",
      "Collectibles",
      "Pet Supplies",
      "Outdoor Gear",
      "Specialty Products"
    ]
  },

  deals: {
    emoji: "🏷️",
    title: "Deals",
    items: [
      "Today's Deals",
      "Clearance Items",
      "Weekly Specials",
      "Buy One Get One",
      "Seasonal Discounts",
      "Featured Promotions"
    ]
  }

};


document.querySelectorAll(".explore-btn").forEach(button => {

  button.addEventListener("click", () => {

    const category = button.dataset.category;

    const data = categoryData[category];

    if (!data) return;

    const focusedCard = document.getElementById("focusedCard");
const cardClone = button.closest(".aisle-card").cloneNode(true);

cardClone.querySelector(".explore-btn").remove();

focusedCard.innerHTML = "";
focusedCard.appendChild(cardClone);

    exploreEmoji.textContent = data.emoji;
    exploreTitle.textContent = data.title;

    exploreContent.innerHTML = "";

    data.items.forEach(item => {

      exploreContent.innerHTML += `
        <div class="explore-item">
          <h4>${item}</h4>
          <p>Listings will appear here.</p>
        </div>
      `;

    });

    exploreArea.classList.add("show");

    button.closest(".aisle-card").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    setTimeout(() => {

      exploreArea.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }, 250);

  });

});





const showLogin = document.getElementById("showLogin");
const showSignup = document.getElementById("showSignup");
const authFormBox = document.getElementById("authFormBox");
const ottoSpeech = document.getElementById("ottoSpeech");

if (showLogin && showSignup && authFormBox) {
  showLogin.addEventListener("click", showLoginForm);
  showSignup.addEventListener("click", showSignupForm);
}

function showLoginForm() {
  setOttoSpeech("Welcome back! Log in and we’ll continue where you left off.");
  setActiveChoice(showLogin);

  authFormBox.innerHTML = `
    <div class="auth-mini-box">
      <h2>Log in</h2>

      <input id="loginEmail" type="email" placeholder="Email">

      <div class="password-row">
        <input id="loginPassword" type="password" placeholder="Password">
        <button type="button" class="show-pass" data-target="loginPassword">
          <i data-lucide="eye"></i>
        </button>
      </div>

      <button id="loginBtn" class="auth-submit">Log In</button>
      <p id="loginMessage" class="auth-message"></p>
    </div>
  `;

  refreshIcons();
  setupPasswordEyes();
  setupLogin();
}

function showSignupForm() {
  setOttoSpeech("Nice! Let’s create your NeedThingsDone account.");
  setActiveChoice(showSignup);

  authFormBox.innerHTML = `
    <div class="auth-mini-box">
      <h2>Create your account</h2>

      <input id="signupEmail" type="email" placeholder="Email">

      <div class="password-row">
        <input id="signupPassword" type="password" placeholder="Password">
        <button type="button" class="show-pass" data-target="signupPassword">
          <i data-lucide="eye"></i>
        </button>
      </div>

      <div class="password-row">
        <input id="signupConfirm" type="password" placeholder="Confirm Password">
        <button type="button" class="show-pass" data-target="signupConfirm">
          <i data-lucide="eye"></i>
        </button>
      </div>

      <button id="signupBtn" class="auth-submit">Create Account</button>
      <p id="signupMessage" class="auth-message"></p>
    </div>
  `;

  refreshIcons();
  setupPasswordEyes();
  setupSignup();
}

function refreshIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

function setupPasswordEyes() {
  document.querySelectorAll(".show-pass").forEach(button => {
    button.addEventListener("click", function () {
      const input = document.getElementById(button.dataset.target);
      if (!input) return;

      const isHidden = input.type === "password";

      input.type = isHidden ? "text" : "password";
      button.innerHTML = isHidden
        ? `<i data-lucide="eye-off"></i>`
        : `<i data-lucide="eye"></i>`;

      button.classList.toggle("active", isHidden);
      refreshIcons();
    });
  });
}

function setupLogin() {
  const loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) return;

  loginBtn.addEventListener("click", async function () {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");

    message.textContent = "Logging in...";

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      message.textContent = error.message;
      return;
    }

    message.textContent = "Logged in! Moving to Step 3...";

    setTimeout(() => {
      window.location.href = "choose-profile.html";
    }, 800);
  });
}

function setupSignup() {
  const signupBtn = document.getElementById("signupBtn");
  if (!signupBtn) return;

  signupBtn.addEventListener("click", async function () {
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;
    const message = document.getElementById("signupMessage");

    if (!email || !password || !confirm) {
      message.textContent = "Please fill in all fields.";
      return;
    }

    if (password !== confirm) {
      message.textContent = "Passwords do not match.";
      return;
    }

    if (password.length < 8) {
      message.textContent = "Password must be at least 8 characters.";
      return;
    }

    message.textContent = "Creating account...";

    const { error } = await supabaseClient.auth.signUp({
      email,
      password
    });

    if (error) {
      message.textContent = error.message;
      return;
    }

    message.textContent = "Account created! Moving to Step 3...";

    setTimeout(() => {
      window.location.href = "choose-profile.html";
    }, 1000);
  });
}

function setOttoSpeech(text) {
  if (!ottoSpeech) return;

  ottoSpeech.textContent = text;
  ottoSpeech.classList.remove("otto-change");

  void ottoSpeech.offsetWidth;

  ottoSpeech.classList.add("otto-change");
}

function setActiveChoice(activeButton) {
  showLogin.classList.remove("active-choice");
  showSignup.classList.remove("active-choice");

  activeButton.classList.add("active-choice");
}
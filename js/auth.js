// ACCOUNT CHOICE PAGE

const showLogin = document.getElementById("showLogin");
const showSignup = document.getElementById("showSignup");
const authFormBox = document.getElementById("authFormBox");

if (showLogin && showSignup && authFormBox) {
  showLogin.addEventListener("click", function () {
    showLoginForm();
  });

  showSignup.addEventListener("click", function () {
    showSignupForm();
  });
}

// SHOW LOGIN FORM

function showLoginForm() {
  authFormBox.innerHTML = `
    <div class="auth-mini-box pop-in">
      <h2>Log in</h2>

      <input id="loginEmail" type="email" placeholder="Email">

      <div class="password-row">
        <input id="loginPassword" type="password" placeholder="Password">
        <button type="button" class="show-pass" data-target="loginPassword">Show</button>
      </div>

      <button id="loginBtn">Log In</button>

      <p id="loginMessage"></p>
    </div>
  `;

  setupPasswordTools();
  setupLogin();
}

// SHOW SIGNUP FORM

function showSignupForm() {
  authFormBox.innerHTML = `
    <div class="auth-mini-box pop-in">
      <h2>Create your account</h2>

      <input id="signupEmail" type="email" placeholder="Email">

      <div class="password-row">
        <input id="signupPassword" type="password" placeholder="Password">
        <button type="button" class="show-pass" data-target="signupPassword">Show</button>
      </div>   

      <div class="password-row">
        <input id="signupConfirm" type="password" placeholder="Confirm Password">
        <button type="button" class="show-pass" data-target="signupConfirm">Show</button>
      </div>

      <button id="signupBtn">Create Account</button>

      <p id="signupMessage"></p>
    </div>
  `;

  setupPasswordTools();
  setupSignup();
}

// PASSWORD TOOLS

function setupPasswordTools() {
  document.querySelectorAll(".show-pass").forEach(button => {
    button.addEventListener("click", function () {
      const input = document.getElementById(button.dataset.target);

      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        button.textContent = "Hide";
      } else {
        input.type = "password";
        button.textContent = "Show";
      }
    });
  });

// LOGIN

function setupLogin() {
  const loginBtn = document.getElementById("loginBtn");

  if (!loginBtn) return;

  loginBtn.addEventListener("click", async function () {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");

    message.textContent = "Logging in...";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      message.textContent = error.message;
      return;
    }

    message.textContent = "Logged in! Moving to Step 3...";
    console.log("Logged in:", data);

    setTimeout(() => {
      window.location.href = "choose-profile.html";
    }, 800);
  });
}

// SIGNUP

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

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password
    });

    if (error) {
      message.textContent = error.message;
      return;
    }

    message.textContent = "Account created! Moving to Step 3...";
    console.log("Signed up:", data);

    setTimeout(() => {
      window.location.href = "choose-profile.html";
    }, 1000);
  });
}

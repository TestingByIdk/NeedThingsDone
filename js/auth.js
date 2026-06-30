const signupBtn = document.getElementById("signupBtn");

if (signupBtn) {
  signupBtn.addEventListener("click", async function () {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const message = document.getElementById("signupMessage");

    message.textContent = "Creating account...";

    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      message.textContent = error.message;
      return;
    }

    message.textContent = "Account created! Check Supabase Users.";
    console.log("Signed up:", data);
  });
}

const showLogin = document.getElementById("showLogin");
const showSignup = document.getElementById("showSignup");
const authFormBox = document.getElementById("authFormBox");

if (showLogin && showSignup && authFormBox) {
  showLogin.addEventListener("click", function () {
    authFormBox.innerHTML = `
      <div class="auth-mini-box">
        <h2>Log in</h2>
        <input id="loginEmail" type="email" placeholder="Email">
        <input id="loginPassword" type="password" placeholder="Password">
        <button id="loginBtn">Log In</button>
        <p id="loginMessage"></p>
      </div>
    `;
  });

  showSignup.addEventListener("click", function () {
   authFormBox.innerHTML = `
  <div class="auth-mini-box pop-in">
    <h2>Create your account</h2>

    <input id="signupEmail" type="email" placeholder="Email">

    <div class="password-row">
      <input id="signupPassword" type="password" placeholder="Password">
      <button type="button" class="show-pass" data-target="signupPassword">Show</button>
    </div>

    <div class="password-strength">
      <div id="strengthBar"></div>
    </div>
    <p id="strengthText" class="strength-text">Password strength</p>

    <div class="password-row">
      <input id="signupConfirm" type="password" placeholder="Confirm Password">
      <button type="button" class="show-pass" data-target="signupConfirm">Show</button>
    </div>

    <button id="signupBtn">Create Account</button>
    <p id="signupMessage"></p>
  </div>
`;

setupPasswordTools();

  });
}

function setupPasswordTools() {
  const passwordInput = document.getElementById("signupPassword");
  const strengthBar = document.getElementById("strengthBar");
  const strengthText = document.getElementById("strengthText");

  document.querySelectorAll(".show-pass").forEach(button => {
    button.addEventListener("click", function () {
      const input = document.getElementById(button.dataset.target);

      if (input.type === "password") {
        input.type = "text";
        button.textContent = "Hide";
      } else {
        input.type = "password";
        button.textContent = "Show";
      }
    });
  });

  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      const value = passwordInput.value;
      let score = 0;

      if (value.length >= 8) score++;
      if (/[A-Z]/.test(value)) score++;
      if (/[0-9]/.test(value)) score++;
      if (/[^A-Za-z0-9]/.test(value)) score++;

      strengthBar.className = "";
      strengthBar.style.width = `${score * 25}%`;

      if (score <= 1) {
        strengthBar.classList.add("weak");
        strengthText.textContent = "Weak password";
      } else if (score === 2 || score === 3) {
        strengthBar.classList.add("okay");
        strengthText.textContent = "Okay password";
      } else {
        strengthBar.classList.add("strong");
        strengthText.textContent = "Strong password";
      }
    });
  }
}




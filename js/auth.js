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
      <div class="auth-mini-box">
        <h2>Create your account</h2>
        <input id="signupEmail" type="email" placeholder="Email">
        <input id="signupPassword" type="password" placeholder="Password">
        <input id="signupConfirm" type="password" placeholder="Confirm Password">
        <button id="signupBtn">Create Account</button>
        <p id="signupMessage"></p>
      </div>
    `;
  });
}



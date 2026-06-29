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

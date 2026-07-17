(() => {
  "use strict";

  const client = window.supabaseClient;
  const $ = (id) => document.getElementById(id);
  const absoluteUrl = (file) => new URL(file, window.location.href).href;
  const SIGNUP_FLOW_KEY = "ntdSignupFlowPendingV1";
  const LOGIN_RETURN_KEY = "ntdLoginReturnToV1";

  function rememberSignupFlow(email, accountType = "profile") {
    const visitor = accountType === "visitor";
    localStorage.setItem(SIGNUP_FLOW_KEY, JSON.stringify({
      email,
      accountType,
      next: visitor ? "../pages/dashboard.html" : "choose-profile.html",
      createdAt: Date.now()
    }));
  }

  function setLocalAccountType(accountType) {
    if (accountType === "visitor") {
      localStorage.setItem("ntdActiveAccountType", "visitor");
      localStorage.setItem("ntdProfileType", "visitor");
    }
  }

  function clearSignupFlow() {
    localStorage.removeItem(SIGNUP_FLOW_KEY);
    sessionStorage.removeItem("ntdPendingEmail");
    localStorage.removeItem("ntdPendingEmail");
  }

  function readSignupFlow() {
    try {
      const value = JSON.parse(localStorage.getItem(SIGNUP_FLOW_KEY) || "null");
      if (!value || !value.createdAt) return null;
      // Discard abandoned signup state after seven days.
      if (Date.now() - value.createdAt > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(SIGNUP_FLOW_KEY);
        return null;
      }
      return value;
    } catch {
      return null;
    }
  }

  function safeReturnTarget(value) {
    return value &&
      !value.startsWith("//") &&
      !value.includes("://") &&
      !value.toLowerCase().startsWith("javascript:")
        ? value
        : null;
  }

  function showNotice(message, type = "success") {
    const box = $("authNotice");
    if (!box) return;
    box.hidden = false;
    box.className = `auth-notice ${type}`;
    box.textContent = message;
  }

  function setBusy(button, busy, busyText) {
    if (!button) return;
    if (busy) {
      button.dataset.originalText = button.textContent;
      button.textContent = busyText;
      button.disabled = true;
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
    }
  }

  function readableError(error, fallback) {
    if (!error) return fallback;
    const message = String(error.message || fallback);
    if (/invalid login credentials/i.test(message)) return "The email or password is incorrect.";
    if (/email not confirmed/i.test(message)) return "Please verify your email before logging in.";
    if (/rate limit/i.test(message)) return "Too many attempts. Wait a moment and try again.";
    return message;
  }

  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = $(button.dataset.togglePassword);
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      button.textContent = input.type === "password" ? "Show" : "Hide";
    });
  });

  const password = $("signupPassword");
  if (password) {
    password.addEventListener("input", () => {
      const value = password.value;
      let score = 0;
      if (value.length >= 8) score++;
      if (/[A-Z]/.test(value)) score++;
      if (/\d/.test(value)) score++;
      if (/[^A-Za-z0-9]/.test(value)) score++;
      const meter = $("passwordMeter");
      const hint = $("passwordHint");
      if (meter) {
        meter.style.width = `${score * 25}%`;
        meter.dataset.score = String(score);
      }
      if (hint) hint.textContent = [
        "Use 8+ characters, a capital letter, and a number.",
        "Add a capital letter and a number.",
        "Good start — adding a symbol makes it stronger.",
        "Strong password.",
        "Very strong password."
      ][score];
    });
  }

  document.querySelectorAll("[data-oauth-provider]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!client) return showNotice("Supabase did not load. Refresh and try again.", "error");
      setBusy(button, true, "Opening Google…");
      const isSignupPage = Boolean(document.getElementById("signupForm"));
      if (isSignupPage) {
        rememberSignupFlow("", "profile");
      } else {
        const requestedReturn = safeReturnTarget(new URLSearchParams(window.location.search).get("returnTo"));
        if (requestedReturn) localStorage.setItem(LOGIN_RETURN_KEY, requestedReturn);
      }
      const { error } = await client.auth.signInWithOAuth({
        provider: button.dataset.oauthProvider,
        options: { redirectTo: absoluteUrl(`success.html?mode=${isSignupPage ? "signup" : "login"}`) }
      });
      if (error) {
        showNotice(readableError(error, "Google sign-in could not start."), "error");
        setBusy(button, false);
      }
    });
  });

  const loginForm = $("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!loginForm.reportValidity()) return;
      if (!client) return showNotice("Supabase did not load. Refresh and try again.", "error");
      const button = $("loginSubmit");
      setBusy(button, true, "Logging in…");
      const { data, error } = await client.auth.signInWithPassword({
        email: $("loginEmail").value.trim(),
        password: $("loginPassword").value
      });
      if (error) {
        showNotice(readableError(error, "Login failed."), "error");
        setBusy(button, false);
        return;
      }
      if (!data.session) {
        showNotice("Please verify your email before continuing.", "error");
        setBusy(button, false);
        return;
      }
      const requestedReturn = safeReturnTarget(new URLSearchParams(window.location.search).get("returnTo"));
      const storedReturn = safeReturnTarget(localStorage.getItem(LOGIN_RETURN_KEY));
      const signupFlow = readSignupFlow();
      localStorage.removeItem(LOGIN_RETURN_KEY);

      if (requestedReturn) {
        window.location.href = `../${requestedReturn.replace(/^\/+/, "")}`;
      } else if (storedReturn) {
        window.location.href = `../${storedReturn.replace(/^\/+/, "")}`;
      } else if (
        data.user?.user_metadata?.account_type === "visitor" ||
        signupFlow?.accountType === "visitor"
      ) {
        setLocalAccountType("visitor");
        clearSignupFlow();
        window.location.href = "../pages/dashboard.html";
      } else if (signupFlow) {
        window.location.href = "choose-profile.html";
      } else {
        window.location.href = "../pages/dashboard.html";
      }
    });
  }

  const signupForm = $("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!signupForm.reportValidity()) return;
      const pass = $("signupPassword").value;
      if (pass !== $("signupConfirm").value) return showNotice("The passwords do not match.", "error");
      if (pass.length < 8 || !/[A-Z]/.test(pass) || !/\d/.test(pass)) return showNotice("Use at least 8 characters with a capital letter and a number.", "error");
      if (!client) return showNotice("Supabase did not load. Refresh and try again.", "error");
      const email = $("signupEmail").value.trim().toLowerCase();
      rememberSignupFlow(email, "profile");
      const button = $("signupSubmit");
      setBusy(button, true, "Creating account…");
      const { data, error } = await client.auth.signUp({
        email,
        password: pass,
        options: {
          emailRedirectTo: absoluteUrl("success.html?mode=signup"),
          data: {
            first_name: $("firstName").value.trim(),
            last_name: $("lastName").value.trim(),
            account_type: "profile"
          }
        }
      });
      if (error) {
        showNotice(readableError(error, "Account creation failed."), "error");
        setBusy(button, false);
        return;
      }
      sessionStorage.setItem("ntdPendingEmail", email);
      localStorage.setItem("ntdPendingEmail", email);
      window.location.href = data.session ? "success.html" : "verify-email.html";
    });
  }


  const visitorSignupForm = $("visitorSignupForm");
  if (visitorSignupForm) {
    visitorSignupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!visitorSignupForm.reportValidity()) return;
      if (!client) return showNotice("Supabase did not load. Refresh and try again.", "error");

      const firstName = $("visitorFirstName").value.trim();
      const lastName = $("visitorLastName").value.trim();
      const email = $("visitorEmail").value.trim().toLowerCase();
      const button = $("visitorSignupSubmit");

      rememberSignupFlow(email, "visitor");
      sessionStorage.setItem("ntdPendingEmail", email);
      localStorage.setItem("ntdPendingEmail", email);

      setBusy(button, true, "Sending secure link…");

      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: absoluteUrl("success.html?mode=visitor"),
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim(),
            account_type: "visitor"
          }
        }
      });

      setBusy(button, false);

      if (error) {
        showNotice(readableError(error, "The visitor account could not be created."), "error");
        return;
      }

      window.location.href = "verify-email.html?mode=visitor";
    });
  }

  const forgotForm = $("forgotForm");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!forgotForm.reportValidity()) return;
      if (!client) return showNotice("Supabase did not load. Refresh and try again.", "error");
      const button = $("forgotSubmit");
      setBusy(button, true, "Sending link…");
      const { error } = await client.auth.resetPasswordForEmail($("forgotEmail").value.trim(), {
        redirectTo: absoluteUrl("reset-password.html")
      });
      setBusy(button, false);
      if (error) return showNotice(readableError(error, "The reset email could not be sent."), "error");
      showNotice("Check your email for the secure password-reset link.");
      forgotForm.reset();
    });
  }

  const resetForm = $("resetForm");
  if (resetForm) {
    resetForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!resetForm.reportValidity()) return;
      const next = $("resetPassword").value;
      if (next !== $("confirmPassword").value) return showNotice("The passwords do not match.", "error");
      if (next.length < 8) return showNotice("Use at least 8 characters.", "error");
      if (!client) return showNotice("Supabase did not load. Refresh and try again.", "error");
      const button = $("resetSubmit");
      setBusy(button, true, "Updating…");
      const { error } = await client.auth.updateUser({ password: next });
      if (error) {
        showNotice(readableError(error, "The password could not be updated. Open a fresh reset link and try again."), "error");
        setBusy(button, false);
        return;
      }
      showNotice("Password updated. Taking you to login…");
      setTimeout(() => { window.location.href = "login.html"; }, 900);
    });
  }

  const verifyEmailText = $("verifyEmailText");
  if (verifyEmailText) {
    verifyEmailText.textContent =
      sessionStorage.getItem("ntdPendingEmail") ||
      localStorage.getItem("ntdPendingEmail") ||
      readSignupFlow()?.email ||
      "your email address";

    const flow = readSignupFlow();
    const verificationCopy = document.querySelector(".auth-center-card > p:not(.auth-help)");
    const verificationHelp = document.querySelector(".auth-center-card .auth-help");
    if (flow?.accountType === "visitor") {
      if (verificationCopy) verificationCopy.innerHTML =
        `We sent a secure sign-in link to <strong id="verifyEmailText">${verifyEmailText.textContent}</strong>.`;
      if (verificationHelp) verificationHelp.textContent =
        "Open the link to verify your free visitor account and sign in automatically.";
    }
  }

  const resend = $("resendVerification");
  if (resend) {
    resend.addEventListener("click", async () => {
      const email = sessionStorage.getItem("ntdPendingEmail") || localStorage.getItem("ntdPendingEmail") || readSignupFlow()?.email;
      if (!email) return showNotice("Return to sign up and enter your email again.", "error");
      setBusy(resend, true, "Resending…");
      const flow = readSignupFlow();
      let error;

      if (flow?.accountType === "visitor") {
        ({ error } = await client.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: absoluteUrl("success.html?mode=visitor")
          }
        }));
      } else {
        ({ error } = await client.auth.resend({
          type: "signup",
          email,
          options: { emailRedirectTo: absoluteUrl("success.html?mode=signup") }
        }));
      }

      setBusy(resend, false);
      if (error) return showNotice(readableError(error, "The verification email could not be resent."), "error");
      showNotice("Verification email resent. Check your inbox and spam folder.");
    });
  }

  const successEmail = $("successEmail");
  if (successEmail && client) {
    const successMessage = $("successMessage");
    const continueLink = $("successContinue");
    const successDetails = $("successDetails");
    const successNextStep = $("successNextStep");
    const signupFlow = readSignupFlow();
    const urlMode = new URL(window.location.href).searchParams.get("mode");
    const visitorFlow =
      urlMode === "visitor" ||
      signupFlow?.accountType === "visitor";

    if (successNextStep && visitorFlow) {
      successNextStep.textContent = "Visitor dashboard";
    }

    const pendingEmail = () =>
      localStorage.getItem("ntdPendingEmail") ||
      sessionStorage.getItem("ntdPendingEmail") ||
      readSignupFlow()?.email ||
      "";

    const setSuccessState = (message) => {
      if (successMessage) successMessage.textContent = message;
      if (continueLink) {
        continueLink.href = visitorFlow ? "../pages/dashboard.html" : "choose-profile.html";
        continueLink.textContent = visitorFlow ? "Enter your visitor dashboard →" : "Continue with Otto →";
        continueLink.removeAttribute("aria-disabled");
        continueLink.dataset.action = "continue";
      }
      if (successNextStep) {
        successNextStep.textContent = visitorFlow ? "Visitor dashboard" : "Otto profile setup";
      }
    };

    const setFailureState = (message) => {
      if (successMessage) successMessage.textContent = message;
      if (successNextStep) {
        successNextStep.textContent = visitorFlow ? "Visitor dashboard" : "Otto profile setup";
      }
      if (continueLink) {
        if (visitorFlow) {
          continueLink.href = "#";
          continueLink.textContent = "Email me a fresh secure sign-in link →";
          continueLink.dataset.action = "resend-visitor-link";
        } else {
          continueLink.href = "login.html?returnTo=onboarding/choose-profile.html";
          continueLink.textContent = "Sign in and continue setup →";
          continueLink.dataset.action = "login";
        }
        continueLink.removeAttribute("aria-disabled");
      }
    };

    const sendFreshVisitorLink = async () => {
      const email = pendingEmail();
      if (!email) {
        window.location.href = "visitor-signup.html";
        return;
      }

      if (continueLink) {
        continueLink.setAttribute("aria-disabled", "true");
        continueLink.textContent = "Sending secure link…";
      }
      if (successMessage) successMessage.textContent = "Sending a new password-free sign-in link to your email…";

      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: absoluteUrl("success.html?mode=visitor")
        }
      });

      if (error) {
        setFailureState(readableError(error, "A new sign-in link could not be sent."));
        return;
      }

      if (successMessage) {
        successMessage.textContent = "A fresh secure sign-in link was sent. Open that email in this browser to enter your visitor dashboard.";
      }
      if (continueLink) {
        continueLink.href = "visitor-signup.html";
        continueLink.textContent = "Use a different email";
        continueLink.dataset.action = "different-email";
        continueLink.removeAttribute("aria-disabled");
      }
    };

    if (continueLink) {
      continueLink.addEventListener("click", (event) => {
        if (continueLink.dataset.action !== "resend-visitor-link") return;
        event.preventDefault();
        sendFreshVisitorLink().catch((error) => {
          console.error("Visitor sign-in link recovery failed:", error);
          setFailureState("A new sign-in link could not be sent. Please try again.");
        });
      });
    }

    const waitForSession = async (timeoutMs = 6000) => {
      const started = Date.now();
      while (Date.now() - started < timeoutMs) {
        const { data } = await client.auth.getSession();
        if (data?.session) return data.session;
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
      return null;
    };

    const finishVerifiedSignup = async () => {
      if (successMessage) {
        successMessage.textContent = visitorFlow
          ? "Confirming your email and opening your visitor dashboard…"
          : "Confirming your email and preparing Otto…";
      }
      if (continueLink) {
        continueLink.textContent = visitorFlow
          ? "Opening your dashboard…"
          : "Preparing your profile setup…";
        continueLink.setAttribute("aria-disabled", "true");
      }

      const url = new URL(window.location.href);
      const callbackError = url.searchParams.get("error_description") || url.searchParams.get("error");
      if (callbackError) {
        setFailureState(decodeURIComponent(callbackError.replace(/\+/g, " ")));
        return;
      }

      // Handle PKCE callback links.
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await client.auth.exchangeCodeForSession(code);
        if (error && !/already.*exchanged|invalid.*code/i.test(error.message || "")) {
          console.warn("Could not exchange confirmation code:", error);
        }
      }

      // Handle implicit callback tokens from either the hash or query string.
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token") || url.searchParams.get("access_token");
      const refreshToken = hash.get("refresh_token") || url.searchParams.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        if (error) console.warn("Could not restore confirmation session:", error);
      }

      // Give Supabase's automatic URL detection enough time to finish.
      let session = await waitForSession();

      if (!session) {
        successEmail.textContent = pendingEmail() || "Email confirmed";
        if (successDetails) successDetails.hidden = false;
        setFailureState(
          visitorFlow
            ? "Your email was confirmed, but this browser did not keep the secure sign-in session. Request a fresh password-free link below—no normal login is required."
            : "Your email is confirmed, but this browser could not restore the session. Sign in once and you will continue directly to Otto—not the dashboard."
        );
        return;
      }

      successEmail.textContent = session.user?.email || pendingEmail() || "Verified";
      if (successDetails) successDetails.hidden = false;
      if (visitorFlow) setLocalAccountType("visitor");

      setSuccessState(
        visitorFlow
          ? "Your visitor account is ready. Opening your dashboard now…"
          : "Your email is confirmed. Taking you directly to Otto’s profile setup…"
      );

      history.replaceState(
        {},
        document.title,
        window.location.pathname + `?mode=${visitorFlow ? "visitor" : "signup"}`
      );

      setTimeout(() => {
        if (visitorFlow) {
          clearSignupFlow();
          window.location.replace("../pages/dashboard.html");
        } else {
          window.location.replace("choose-profile.html");
        }
      }, 700);
    };

    finishVerifiedSignup().catch((error) => {
      console.error("Verification callback failed:", error);
      setFailureState(
        visitorFlow
          ? "We could not finish the password-free visitor sign-in automatically. Request a fresh secure link below."
          : "We could not finish the confirmation automatically. Sign in once and you will continue directly to Otto’s setup."
      );
    });
  }

  const signOutButton = $("signOutButton");
  if (signOutButton && client) signOutButton.addEventListener("click", async () => {
    await client.auth.signOut();
    window.location.href = "login.html";
  });
})();

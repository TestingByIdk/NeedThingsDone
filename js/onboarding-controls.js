
(() => {
  "use strict";

  const SETTINGS_KEY = "ntdAccountSettingsV1";

  const readPreference = () => {
    try {
      const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
      return (
        settings?.theme ||
        localStorage.getItem("ntdTheme") ||
        localStorage.getItem("theme") ||
        localStorage.getItem("ntdThemePreference") ||
        "light"
      );
    } catch {
      return localStorage.getItem("ntdTheme") || "light";
    }
  };

  const systemDark = () =>
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const preferenceIsDark = preference =>
    preference === "dark" || (preference === "system" && systemDark());

  const applyTheme = preference => {
    const dark = preferenceIsDark(preference);
    document.documentElement.classList.toggle("dark-mode", dark);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.body.classList.toggle("dark-mode", dark);

    const button = document.getElementById("ntdOnboardingThemeToggle");
    if (button) {
      button.textContent = dark ? "☀️" : "🌙";
      button.setAttribute(
        "aria-label",
        dark ? "Switch to light mode" : "Switch to dark mode"
      );
      button.title = dark ? "Switch to light mode" : "Switch to dark mode";
    }
  };

  const saveTheme = preference => {
    localStorage.setItem("ntdTheme", preference);
    localStorage.setItem("theme", preference);
    localStorage.setItem("ntdThemePreference", preference);

    try {
      const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      settings.theme = preference;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  };

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.querySelector(".ntd-onboarding")) return;

    const button = document.createElement("button");
    button.id = "ntdOnboardingThemeToggle";
    button.className = "ntd-onboarding-theme-toggle";
    button.type = "button";
    document.body.appendChild(button);

    applyTheme(readPreference());

    button.addEventListener("click", () => {
      const next = document.body.classList.contains("dark-mode")
        ? "light"
        : "dark";
      saveTheme(next);
      applyTheme(next);
    });
  });
})();

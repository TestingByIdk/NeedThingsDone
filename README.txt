NeedThingsDone Authentication Frontend

Files included:
onboarding/welcome.html
onboarding/login.html
onboarding/signup.html
onboarding/forgot-password.html
onboarding/reset-password.html
onboarding/verify-email.html
onboarding/account-choice.html
onboarding/success.html
css/auth.css
js/auth.js

Installation:
1. Back up any onboarding files with the same names.
2. Copy the onboarding files into your onboarding folder.
3. Add auth.css to css and auth.js to js.
4. Keep your existing style.css and script.js.

This is a frontend demo:
- Accounts are stored in localStorage.
- Passwords are not secure in this demo.
- Google/Apple sign-in, real verification email, and password reset are placeholders.
- Replace localStorage authentication with Supabase Auth before launch.


AUTHENTICATION MERGE - 2026-07-17
- Preserved Otto onboarding and the existing Supabase project connection.
- Connected login, signup, email verification, password reset, OAuth, success, and profile selection.
- Replaced the mixed localStorage demo authentication with Supabase Auth.
- Main flow: welcome -> account choice -> login/signup -> verification -> choose profile.
- In Supabase Authentication URL Configuration, add your deployed success.html and reset-password.html URLs as allowed redirect URLs.


Dashboard Update v0.5
- Personalized account dashboard
- Supabase session name and sign out
- Role-based quick actions
- Messages, notifications, reviews, and saved-item counters
- Profile completion tracking
- Nearby discovery and recent activity sections
- Persistent light/dark dashboard theme


GLOBAL UI UPDATE
- Notification bell is injected into the navbar on every main site page.
- Notification dropdown and unread count persist using localStorage.
- A Facebook-style mini messenger is fixed to the bottom-left and can be opened/minimized.
- Mini-chat conversations persist locally for frontend testing.
- Signed-in users get a profile dropdown instead of Login and Sign Up buttons.
- Login opens directly without sending users through signup/onboarding choices.
- After login, users return to the exact page where they selected Log In.
- Supabase Realtime and database-backed notifications/messages are the future backend step.


UI POLISH UPDATE
- Rebuilt Community replies as a full discussion window.
- Added original-post summary, reply profiles, timestamps, roles, helpful votes, quoting, accepted-answer styling, and a proper reply composer.
- Existing locally saved community posts are automatically upgraded to the new reply format.
- Added a broad dark-mode compatibility pass across global navigation, forms, cards, notification dropdowns, profile menus, and the mini messenger.
- Fixed low-contrast messenger text and community cards in dark mode.
- Improved mobile discussion modal behaviour.


FIX UPDATE
- Replies now expand directly under one community post at a time; no full-screen modal and no trapped scrolling.
- Added main navigation to dashboard and saved-items custom headers.
- Added login/account handling to custom utility headers.
- Repaired dashboard contrast in both light and dark mode.
- Added a basic profanity filter to mini-chat demo messages.


ACCOUNT NAVIGATION & THEME FIX
- Added the full dashboard/account navigation bar to Dashboard, My Profile, Messages, Notifications, Reviews, Saved Items, Account Settings, and Public Profile.
- Added the shared global script to every account page, so the same theme toggle and saved theme preference work everywhere.
- Fixed Saved Items theme button by loading the missing shared script.
- Added dark mode styling for full Messages, Notifications, Reviews, Saved Items, Account Settings, Profile Editor, and Public Profile pages.
- Normalized Assets/Images to assets/images for case-sensitive GitHub Pages hosting.


ACCOUNT DATA AND THEME CONSISTENCY FIX
- Fixed Notifications rendering: removed-header bell controls are now optional instead of crashing the page.
- Fixed Reviews rendering: missing create-review modal trigger no longer stops all review cards from loading.
- Unified theme persistence across global pages, dashboard, and Account Settings.
- Account Settings now inherits the current site theme instead of resetting to light.
- Added early theme bootstrap to avoid a bright flash when opening account pages.
- Synced Saved Profiles, Reviews, and Notifications with dashboard storage keys.
- Dashboard now merges onboarding profile details with Account Settings profile data.
- Added exact dark-mode styling for notifications, reviews, and saved profile cards.


PREMIUM DARK MODE REBUILD
- Added css/premium-dark.css and loaded it last on every HTML page.
- Rebuilt dark mode around a layered midnight-blue visual system.
- Added consistent surfaces, borders, typography, buttons, inputs, focus states, and scrollbars.
- Reworked Dashboard, Messages, Notifications, Reviews, Saved Items, Account Settings, Community, notifications, profile menu, and mini messenger.
- Added restrained blue, purple, cyan, green, and warm accent colours.
- Light mode remains unchanged.


COMPLETE DARK MODE COMPONENT AUDIT
- Audited Messages, Notifications, Reviews, Saved Items, Profile Editor, Account Settings, Public Profile, Dashboard, Community, and global UI separately.
- Replaced remaining white search gutters, select wrappers, toggle rows, status cards, preview cards, analytics cards, notes, toolbars, sidebars, and modal surfaces.
- Added explicit dark colours for text hierarchy, labels, helper copy, placeholders, disabled states, filters, tags, and button states.
- Ensured premium-dark.css is the final stylesheet loaded on every HTML page.


SURFACE AND COMMUNITY ALIGNMENT FIX
- Replaced the remaining bright conversation canvas and message bubbles in dark mode.
- Darkened account activity timeline groups and cards.
- Darkened profile editor analytics and toggle rows.
- Improved dark profile-detail status, tags, services, and navigation counters.
- Added matching light-mode cleanup for the same components.
- Added more breathing room between the Community hero, summary cards, and forum layout.
- Aligned Community summary and forum content to the same maximum width.


DARK MODE FOLLOW-UP FIX
- Fixed the remaining bright response-time cards in Messages.
- Fixed review owner replies, timelines, card footers, action buttons, and owner-replied badges.
- Fixed Saved Items tabs and filter/select shells.
- Reworked the Account Settings Appearance panel, preview cards, and compact/larger-text rows.
- Added saved-theme loading to every onboarding page.
- Added dark styling for onboarding progress steps, welcome screen, cards, buttons, and descriptions.
- Added matching light-mode cleanup for the same components.


EMAIL VERIFICATION FLOW FIX
- Email confirmation now restores/exchanges the Supabase session on the callback page.
- Successful verification automatically continues to choose-profile.html and Otto onboarding.
- Signup state is saved in localStorage so opening the confirmation email in a new tab does not lose the flow.
- If a browser blocks session restoration, the fallback login preserves the onboarding destination instead of sending the user to Dashboard.
- The verification page no longer tells users to log in as the normal next step.
- Supabase is configured for the implicit browser flow while still supporting older PKCE confirmation links.


ONBOARDING STEPS 3–8 DARK MODE FIX
- Added a complete dark-mode treatment for Choose Profile, Profile Details, Services, Extra Details, Preview, and Review.
- Styled every card, input, textarea, select, service choice, toggle, tag, note, preview surface, strength card, and action button.
- Reworked onboarding progress steps and backgrounds for dark mode.
- Centered Otto on Step 3, including the Otto’s Tip heading and comparison panel.
- Added mobile centering rules for the Step 3 tip.

ONBOARDING / AUTH DARK MODE AUDIT
- Added css/onboarding-audit.css and loaded it last on all 15 onboarding/auth pages.
- Audited signup, verification, login, password recovery, account choice, welcome, Steps 3–8, and Meet Otto.
- Fixed disabled-button contrast, dark form controls, role cards, verification notices, progress steps, profile cards, Otto Tip, service choices, toggles, previews, review cards, and quiz controls.
- Standardized onboarding widths, margins, card padding, button sizing, and responsive layouts.
- Centered Otto and all Step 3 tip content.
- Prevented profile tiers from overflowing and changed the tier grid to 4/2/1 columns by screen width.
- Added mobile-safe progress scrolling and full-width action buttons.


ONBOARDING STRUCTURAL LAYOUT REPAIR
- Fixed the legacy horizontal flex conflict that placed the progress bar and page content side by side.
- Steps 3–8 now use a stable vertical document layout.
- Progress is in normal page flow and no longer overlaps Otto or the content.
- Centered Otto, headings, tier cards, Otto’s Tip, and Continue controls.
- Added responsive 4-column, 2-column, and 1-column profile grids.
- Locked Steps 4–8 cards and review columns inside the centered content width.
- Added css/onboarding-layout-repair.css as the final stylesheet on Steps 3–8.


DEFINITIVE ONBOARDING FIX
- Rebuilt Steps 3–8 and Meet Otto around one final stylesheet: css/onboarding-final.css.
- Removed onboarding-audit.css and onboarding-layout-repair.css from the profile onboarding pages to stop conflicting overrides.
- Fixed vertical structure, centered content, progress positioning, tier-card sizing, skill search, document link section, contact preferences, action buttons, review layout, and Meet Otto.
- Added complete dark-mode styling for every component targeted by the profile onboarding flow.


ONBOARDING VISUAL CLEANUP
- Removed the large rectangular wrapper background behind every onboarding step.
- Added a persistent light/dark theme button to Choose Profile, Preview, Details, Services, Extra Details, Meet Otto, and Final Review.
- Fixed Meet Otto recommendation tags in dark mode.
- Fixed the work-style result card in Meet Otto and Final Review.
- Fixed Final Review contact rows.
- Rebuilt the contact-preferences section and its toggle rows.


FINAL DARK MODE TOUCH-UPS
- Darkened the Saved Items profile type, location, and sort filter wrappers.
- Darkened the select elements and focus states inside those filters.
- Replaced the white Messages/account count badge with a blue-purple dark-mode badge.


SAVED FILTER EXACT FIX
- Corrected the selector from .saved-controls to the actual .saved-toolbar filter wrappers.
- Darkened Profile Type, Location, Sort By, and the search wrapper.


VISITOR ACCOUNT UPDATE
- Added a free Visitor account option.
- Visitors register with first name, last name, and email only.
- Supabase sends a secure magic-link email; no password is required.
- Verified visitors go directly to the dashboard without Otto profile setup.
- Visitor accounts are intended for browsing, messaging profiles, and leaving reviews.
- Added Visitor routing and dashboard identity support.

# NeedThingsDone Email Kit

> **Beginner setup:** open `START-HERE-EMAILS.txt` in the main project folder and follow it from top to bottom.
> Your Resend API key does **not** belong in these files. Keep it in Supabase Custom SMTP.

Clean, professional HTML email templates for Supabase Auth and future transactional emails.

## Use the Supabase Auth templates now

In Supabase, open **Authentication → Email Templates**. For each template:

1. Copy the subject listed below.
2. Open the matching HTML file in `email-templates/supabase-auth/`.
3. Copy the entire HTML file into the Supabase message body.
4. Save and send a test email.

- **confirm-signup.html** — `Welcome to NeedThingsDone — Verify your email`
- **magic-link.html** — `Your secure NeedThingsDone sign-in link`
- **reset-password.html** — `Reset your NeedThingsDone password`
- **change-email.html** — `Confirm your new NeedThingsDone email`
- **reauthentication.html** — `Your NeedThingsDone security code`
- **invite-user.html** — `You’re invited to NeedThingsDone`

Do not replace Supabase variables such as `{{ .ConfirmationURL }}` or `{{ .Token }}`. Supabase fills those automatically.

## Transactional templates

The files in `email-templates/transactional/` cover welcome messages, new messages, reviews, publishing, badges, subscriptions, payments, vouchers, weekly summaries, and account notices. Their placeholders use names such as `{{sender_name}}` and `{{conversation_url}}`.

These emails must be sent from a trusted server or Supabase Edge Function. Never place the Resend API key in browser JavaScript or commit it to GitHub.

A starter Edge Function is included at:

`supabase/functions/send-transactional-email/index.ts`

Set `RESEND_API_KEY` as a Supabase secret before deploying.

## Preview

Open `email-templates/preview/index.html` locally to browse links to every template. Some button URLs are placeholders and are only meant for visual review.

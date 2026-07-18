# Send Transactional Email Edge Function

1. Install the Supabase CLI.
2. Set secrets:
   `supabase secrets set RESEND_API_KEY=your_key SITE_URL=https://www.needthingsdone.ca`
3. Deploy:
   `supabase functions deploy send-transactional-email`

Never commit the Resend API key to GitHub. The browser should call this function only after authentication and authorization rules are added for each email event.

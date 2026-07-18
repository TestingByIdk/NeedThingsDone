import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { renderEmail, type EmailPayload } from "../_shared/email.ts";

const allowedOrigin = Deno.env.get("SITE_URL") ?? "https://www.needthingsdone.ca";

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": allowedOrigin, "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return new Response("Email service is not configured", { status: 500 });

  try {
    const payload = await request.json() as EmailPayload;
    if (!payload.to || !payload.subject || !payload.title || !Array.isArray(payload.paragraphs)) {
      return new Response("Invalid email payload", { status: 400 });
    }

    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "NeedThingsDone <no-reply@auth.needthingsdone.ca>",
        to: [payload.to],
        subject: payload.subject,
        html: renderEmail(payload),
      }),
    });

    const responseBody = await result.text();
    return new Response(responseBody, {
      status: result.status,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": allowedOrigin },
    });
  } catch (error) {
    console.error(error);
    return new Response("Unable to send email", { status: 500 });
  }
});

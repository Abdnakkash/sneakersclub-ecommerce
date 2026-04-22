// Supabase Edge Function: order-notify
// Sends admin email via Resend and optional customer SMS via Twilio.
// Required secrets:
// RESEND_API_KEY
// ADMIN_EMAIL_TO
// ADMIN_EMAIL_FROM
// Optional secrets:
// TWILIO_ACCOUNT_SID
// TWILIO_AUTH_TOKEN
// TWILIO_FROM_NUMBER

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendAdminEmail(payload: any) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("ADMIN_EMAIL_TO");
  const from = Deno.env.get("ADMIN_EMAIL_FROM") || "onboarding@resend.dev";
  if (!apiKey || !to) return { skipped: true, reason: "missing_admin_email_config" };

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>New SneakersClub Order</h2>
      <p><strong>Product:</strong> ${payload?.product?.name || "-"}</p>
      <p><strong>Brand:</strong> ${payload?.product?.brand || "-"}</p>
      <p><strong>Category:</strong> ${payload?.product?.category || "-"}</p>
      <p><strong>Size:</strong> ${payload?.size || "-"}</p>
      <p><strong>Sale Price:</strong> $${payload?.order?.price || 0}</p>
      <p><strong>Cost Price:</strong> $${payload?.order?.cost_price || 0}</p>
      <p><strong>Profit:</strong> $${payload?.order?.profit || 0}</p>
      <hr />
      <p><strong>Customer:</strong> ${payload?.customer?.full_name || "-"}</p>
      <p><strong>Phone:</strong> ${payload?.customer?.phone || "-"}</p>
      <p><strong>City:</strong> ${payload?.customer?.city || "-"}</p>
      <p><strong>Address:</strong> ${payload?.customer?.address || "-"}</p>
      <p><strong>Note:</strong> ${payload?.customer?.note || "-"}</p>
      ${payload?.product?.image_url ? `<p><img src="${payload.product.image_url}" alt="product" style="max-width:220px;border-radius:12px" /></p>` : ""}
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `New Order - ${payload?.product?.name || "SneakersClub"}`,
      html,
    }),
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

async function sendCustomerSms(payload: any) {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_FROM_NUMBER");
  const to = payload?.customer?.phone;
  if (!sid || !token || !from || !to) return { skipped: true, reason: "missing_sms_config" };

  const body = new URLSearchParams({
    To: to,
    From: from,
    Body: `SneakersClub: your order for ${payload?.product?.name || "product"} size ${payload?.size || "-"} has been received successfully.`,
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + btoa(`${sid}:${token}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const [emailResult, smsResult] = await Promise.all([
      sendAdminEmail(payload),
      sendCustomerSms(payload),
    ]);

    return new Response(JSON.stringify({ emailResult, smsResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

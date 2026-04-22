# order-notify Edge Function

This function sends:
- Admin email via Resend
- Optional customer SMS via Twilio

## Required secrets
Set these in Supabase Edge Function secrets:
- RESEND_API_KEY
- ADMIN_EMAIL_TO
- ADMIN_EMAIL_FROM

## Optional SMS secrets
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_FROM_NUMBER

## Deploy
supabase functions deploy order-notify

## Example local invoke
supabase functions serve --env-file .env.local

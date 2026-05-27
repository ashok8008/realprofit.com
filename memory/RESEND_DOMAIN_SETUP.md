# Email Sender Configuration (Resend)

## Current state
- `RESEND_API_KEY=re_3YL3UR...` (from user — active)
- `SENDER_EMAIL=onboarding@resend.dev` (sandbox sender — works only for the inbox that owns the API key)

## To activate production emails to external recipients

### Step 1 — Verify your domain in Resend (one-time, ~5 min)
1. Go to https://resend.com/domains
2. Click **"+ Add Domain"** → enter `realprofits.com`
3. Resend gives you 3 DNS records to add:
   - **MX**: `feedback-smtp.us-east-1.amazonses.com` (priority 10)
   - **TXT** (SPF): `v=spf1 include:amazonses.com ~all`
   - **TXT** (DKIM): `resend._domainkey ...` (long key Resend provides)
4. Add those records at your DNS host (Cloudflare, GoDaddy, Namecheap, etc.)
5. Click **"Verify DNS Records"** in the Resend dashboard. It usually verifies in 1–5 minutes.

### Step 2 — Update the backend env
Once verification is green, edit `/app/backend/.env`:

```bash
SENDER_EMAIL=sign@realprofits.com
# Optional: separate addresses for different products
INVOICE_SENDER_EMAIL=invoices@realprofits.com
ESIGN_SENDER_EMAIL=sign@realprofits.com
```

Then restart the backend: `sudo supervisorctl restart backend`

### Step 3 — Test it
1. Trigger a real signing flow at `/tools/esign/new`
2. Check the signer's email inbox — they should see the email coming from `sign@realprofits.com`
3. The reply-to is automatically the same; if you want a separate inbox monitor, add `REPLY_TO_EMAIL=hello@realprofits.com` to .env

## What happens if you skip this?
The app stays fully functional — emails just won't deliver to external mailboxes
(Resend rejects them in sandbox mode). The signing links still work in-browser.

## Code that reads these settings
- `/app/backend/esign/email_service.py` → `_sender()` reads `SENDER_EMAIL`
- `/app/backend/invoices.py` → top-level `SENDER_EMAIL` constant
- `/app/backend/scheduler_jobs.py::send_invoice_reminders_job` → reads `SENDER_EMAIL` per-run

## Cost
Resend's free tier = 3,000 emails/month / 100 per day. Plenty for early users.

# 06 — API Documentation

Base URL: `${REACT_APP_BACKEND_URL}` (frontend uses `NEXT_PUBLIC_BACKEND_URL`).
All paths below are prefixed with `/api`.

**Authentication**: most authenticated endpoints rely on the HttpOnly
`access` cookie set by `/api/auth/login`. Send `credentials: "include"` from
the browser. Server returns `401` on missing/expired cookie; client API
modules dispatch a `window` event `"auth:expired"` to trigger redirect to
`/login`.

**Error envelope** (FastAPI default): `{"detail": "string or array"}`.

---

## 1. Health & Diagnostics

### `GET /api/health`
- Public.
- Response: `{"status": "healthy", "message": "RealProfits API is running"}`.

### `GET /api/admin/email-diag`
- Admin bearer (`Authorization: Bearer <token>` or admin cookie).
- Returns Resend config status + masked sender email.

---

## 2. Authentication — `/api/auth`

### `POST /api/auth/register`
```json
Request: {"email": "user@x.com", "password": "Strong#Pwd1", "name": "Jane"}
Response 200: {"id":"...","email":"...","name":"...","role":"user","created_at":"..."}
```
Cookies set: `access`, `refresh`.

### `POST /api/auth/login`
Same shape; also enforces brute-force lockout (429).

### `POST /api/auth/logout`
Clears cookies. Returns `{"ok": true}`.

### `GET /api/auth/me`
Returns the current user JSON or 401.

### `POST /api/auth/refresh`
Reads `refresh` cookie, issues new `access` cookie. 401 if refresh expired.

### `POST /api/auth/forgot-password`
```json
Request: {"email": "user@x.com"}
Response: {"ok": true} (always; doesn't leak existence)
```
Emails a reset link via Resend.

### `POST /api/auth/reset-password`
```json
Request: {"token": "uuid", "password": "newPwd1!"}
Response: {"ok": true}
```

---

## 3. Invoices — `/api/invoices`

| Method  | Path                                        | Auth | Notes                              |
|---------|---------------------------------------------|------|------------------------------------|
| GET     | `/api/invoices`                             | ✓    | List user's invoices (newest first) |
| POST    | `/api/invoices`                             | ✓    | Create invoice                      |
| GET     | `/api/invoices/{id}`                        | ✓    | Get one                             |
| PUT     | `/api/invoices/{id}`                        | ✓    | Update                              |
| DELETE  | `/api/invoices/{id}`                        | ✓    | Delete                              |
| POST    | `/api/invoices/{id}/payment`                | ✓    | `{amount, date, note}` — recomputes status |
| GET     | `/api/invoices/stats/summary`               | ✓    | Counts + revenue                    |
| GET     | `/api/invoices/settings`                    | ✓    | User settings (logo)                |
| POST    | `/api/invoices/upload-logo`                 | ✓    | multipart `file=<image>` (≤2 MB)    |
| GET     | `/api/invoices/clients/list`                | ✓    | Address book                        |
| POST    | `/api/invoices/clients`                     | ✓    | Add client                          |
| PUT     | `/api/invoices/clients/{id}`                | ✓    | Update client                       |
| DELETE  | `/api/invoices/clients/{id}`                | ✓    | Delete                              |
| POST    | `/api/invoices/{id}/attachments`            | ✓    | multipart `file=<any>` (≤10 MB)     |
| GET     | `/api/invoices/{id}/attachments/{aid}`      | ✓    | Download                            |
| DELETE  | `/api/invoices/{id}/attachments/{aid}`      | ✓    | Remove                              |
| POST    | `/api/invoices/send-email`                  | ✓    | See body below                      |
| POST    | `/api/invoices/{id}/share`                  | ✓    | Idempotent — returns `{share_token, public_url}` |
| GET     | `/api/invoices/public/{token}`              | —    | HTML invoice page with Pay button   |
| GET     | `/api/invoices/public/{token}/attachments/{aid}` | — | Public attachment download         |

### Send Email body
```json
{
  "invoice_id": "65f...",
  "recipient_email": "client@x.com",
  "subject": "Invoice INV-007",
  "message": "Hi, please find attached…",
  "cc": ["cc@x.com"],
  "bcc": ["bcc@x.com"],
  "include_attachment_ids": ["att1", "att2"]
}
```
Side effects: status → `sent`; row inserted into `invoice_email_logs`.

### Invoice JSON Shape
See [`04 Database §invoices`](./04-database.md#invoices). Server recomputes
`subtotal/discount_amount/tax_amount/total` and discards client-supplied
values for those fields.

---

## 4. User Data — `/api/user-data`

| Method  | Path                          | Auth | Body                              |
|---------|-------------------------------|------|-----------------------------------|
| GET     | `/api/user-data`              | ✓    | —  Returns map `{tool_key: data}` |
| GET     | `/api/user-data/{tool_key}`   | ✓    | —  Returns the blob               |
| PUT     | `/api/user-data/{tool_key}`   | ✓    | `{data: any}` (upsert)            |
| DELETE  | `/api/user-data/{tool_key}`   | ✓    | —                                 |
| POST    | `/api/user-data/bulk`         | ✓    | `[{tool_key, data}, …]`           |

---

## 5. eSign — `/api/esign`

### Owner

| Method  | Path                                    | Auth | Notes                                 |
|---------|-----------------------------------------|------|---------------------------------------|
| POST    | `/api/esign/documents`                  | ✓    | multipart `title` + `file=<pdf>` — tier-gated |
| GET     | `/api/esign/documents`                  | ✓    | List w/ counts                        |
| GET     | `/api/esign/documents/{id}`             | ✓    | Detail (signers + fields)             |
| PATCH   | `/api/esign/documents/{id}`             | ✓    | Update title/order/expires_at/settings/signers/fields (tier-gated) |
| DELETE  | `/api/esign/documents/{id}`             | ✓    |                                       |
| POST    | `/api/esign/documents/{id}/send`        | ✓    | Mints per-signer JWTs, emails E1, `status=sent` |
| POST    | `/api/esign/documents/{id}/void`        | ✓    | Notifies signers, `status=voided`     |
| GET     | `/api/esign/documents/{id}/original`    | ✓    | Owner downloads original PDF          |
| GET     | `/api/esign/documents/{id}/signed`      | ✓    | Final signed PDF + audit page         |
| GET     | `/api/esign/signature`                  | ✓    | Get saved signature                   |
| PUT     | `/api/esign/signature`                  | ✓    | `{image_data, method}`                |
| DELETE  | `/api/esign/signature`                  | ✓    |                                       |

### Public signing (token only)

| Method  | Path                                    | Auth     | Notes                                |
|---------|-----------------------------------------|----------|--------------------------------------|
| GET     | `/api/esign/sign/{token}`               | Token    | Returns `SignerPublicView` including `fields`, `other_filled_fields`, `signers[]`, `already_signed`, `expired` |
| GET     | `/api/esign/sign/{token}/pdf`           | Token    | PDF for in-browser rendering         |
| POST    | `/api/esign/sign/{token}/submit`        | Token    | `{signer_name, field_values:[{field_id,value}], consent:true}` |
| POST    | `/api/esign/sign/{token}/decline`       | Token    | `{reason}`                           |
| GET     | `/api/esign/verify/{doc_id}`            | Public   | Returns hash + signer list with masked emails |

### `SignerPublicView` shape
```json
{
  "document_id": "uuid",
  "document_title": "…",
  "page_count": 4,
  "signer_name": "Bob Jones",
  "signer_email": "bob@x.com",
  "fields": [Field],
  "other_filled_fields": [Field],
  "signers": [{"id","name","role","order_index","color","status","signed_at"}],
  "already_signed": false,
  "expired": false
}
```
`Field` = `{id, signer_id, page, x, y, width, height, field_type, required, label, filled_at, value}`. Coords are fractions 0–1.

---

## 6. Billing — `/api/billing`

| Method  | Path                                    | Auth        | Notes                                  |
|---------|-----------------------------------------|-------------|----------------------------------------|
| GET     | `/api/billing/plans`                    | —           | Static plan list                       |
| GET     | `/api/billing/status`                   | ✓           | Current tier + usage + limits          |
| POST    | `/api/billing/checkout`                 | ✓           | `{plan: "pro"\|"business", interval: "month"\|"year"}` → `{url}` |
| POST    | `/api/billing/portal`                   | ✓           | → `{url}`                              |
| GET     | `/api/billing/checkout-status/{sid}`    | ✓           | Poll after Stripe redirect             |
| POST    | `/api/billing/webhook`                  | Stripe sig  | Stripe event handler — idempotent      |
| POST    | `/api/billing/cancel`                   | ✓           | Sets `cancel_at_period_end=true`       |

### Webhook events handled

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded` / `invoice.payment_failed`

---

## 7. Career Tools — `/api/career-tools`

| Method | Path                                | Body                                                 |
|--------|-------------------------------------|------------------------------------------------------|
| POST   | `/improve-bullet`                   | `{text, role?, industry?}`                           |
| POST   | `/improve-summary`                  | `{text, role?, years?}`                              |
| POST   | `/generate-summaries`               | `{name, role, years, skills[]}` → 3 variants         |
| POST   | `/suggest-skills`                   | `{role, years}` → skills[]                           |
| POST   | `/ats-check`                        | `{resume_text, job_description?}` — cached 1h        |
| POST   | `/resume-draft`                     | `{draft_id?, payload, template, score}`              |
| GET    | `/resume-draft/{draft_id}`          | —                                                    |
| POST   | `/email-template`                   | `{scenario, tone, recipient_role, context}`          |
| GET    | `/email-templates`                  | List built-in templates                              |

All public (no cookie required); rate-limited by hash-based cache and request size.

---

## 8. Tax Tools — `/api/tax-tools`

| Method | Path             | Body                                            |
|--------|------------------|-------------------------------------------------|
| POST   | `/explain`       | `{topic, situation, jurisdiction}` → AI summary |

---

## 9. Analytics — `/api/analytics`

| Method | Path                       | Auth  | Body                                  |
|--------|----------------------------|-------|---------------------------------------|
| POST   | `/event`                   | —     | `{experiment, variant, event, user_id?, session_id}` |
| GET    | `/summary/{experiment}`    | Admin | Counts + click_rate + conversion_rate |

---

## 10. Sitemaps

| GET | `/api/sitemap.xml`         | Lists all 7 sub-sitemaps                            |
| GET | `/api/sitemap/stats`       | URL counts per section                              |

Plus 7 sub-sitemaps generated by Next.js itself at `/sitemap-core.xml`,
`/sitemap-salary.xml`, `/sitemap-invoice-templates.xml`, `/sitemap-guides.xml`,
`/sitemap-articles.xml`, `/sitemap-tax.xml`, `/sitemap-contract-templates.xml`.

---

## Curl Recipes

### Login + list invoices
```bash
API=$NEXT_PUBLIC_BACKEND_URL
curl -s -c /tmp/c.txt -X POST $API/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@realprofits.com","password":"RealProfits2026!"}'
curl -s -b /tmp/c.txt $API/api/invoices | jq .
```

### Mint an eSign signing token in tests (Python)
```python
from esign import tokens as esign_tokens
tok = esign_tokens.create_signing_token(signer_id, doc_id, email, expires_at=None)
hash_ = esign_tokens.hash_token(tok)
# store hash_ on the signer row before testing
```

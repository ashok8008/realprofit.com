# 04 — Database Documentation

RealProfits uses **two databases**:

- **MongoDB** (`realprofits`) — auth, user-scoped state, invoices, analytics, AI caches.
- **PostgreSQL 15** (`realprofits_esign`) — eSign documents/signers/fields/audit + Stripe subscriptions.

Connection strings come from env vars in `/app/backend/.env`:

```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=realprofits
DATABASE_URL=postgresql+asyncpg://realprofits:realprofits_dev@localhost:5432/realprofits_esign
```

---

## 4.1 MongoDB Collections

### `users`

Authenticated users.

| Field          | Type      | Required | Notes                              |
|----------------|-----------|----------|------------------------------------|
| `_id`          | ObjectId  | ✓        | Primary key                        |
| `email`        | string    | ✓        | **Unique index**                   |
| `password_hash`| string    | ✓        | bcrypt cost 12                     |
| `name`         | string    | ✓        |                                    |
| `role`         | string    | ✓        | `"user"` or `"admin"`              |
| `created_at`   | ISO date  | ✓        | UTC                                |

Indexes (created in `db.py`):

```python
db.users.create_index("email", unique=True)
```

Sample:

```json
{
  "_id": "65f3...",
  "email": "admin@realprofits.com",
  "name": "Admin",
  "role": "admin",
  "password_hash": "$2b$12$...",
  "created_at": "2026-04-07T13:23:09Z"
}
```

### `login_attempts`

Brute-force tracker (TTL-protected via `locked_until`).

| Field          | Type      | Required | Notes                                  |
|----------------|-----------|----------|----------------------------------------|
| `identifier`   | string    | ✓        | `"<ip>:<email>"` — **indexed**         |
| `count`        | int       | ✓        | Failed attempts                        |
| `locked_until` | ISO date  | ✗        | Until then, login returns 429          |
| `updated_at`   | ISO date  | ✓        |                                        |

After 5 failures → 15-minute lockout. Successful login wipes the row.

### `password_reset_tokens`

| Field        | Type     | Required | Notes                              |
|--------------|----------|----------|------------------------------------|
| `_id`        | ObjectId | ✓        |                                    |
| `token`      | string   | ✓        | UUID4                              |
| `user_id`    | string   | ✓        | Mongo user `_id` string            |
| `expires_at` | ISO date | ✓        | **TTL index** (auto-delete)        |
| `used`       | bool     | ✓        | One-shot flag                      |

```python
db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
```

### `user_data`

Per-tool, per-user persisted state (cross-device sync of localStorage).

| Field         | Type       | Required | Notes                                       |
|---------------|------------|----------|---------------------------------------------|
| `user_id`     | string     | ✓        | Mongo user `_id` string                     |
| `tool_key`    | string     | ✓        | Slug — e.g. `"resume"`, `"net-worth-calc"`  |
| `data`        | any        | ✓        | Arbitrary JSON blob                         |
| `created_at`  | ISO date   | ✓        |                                             |
| `updated_at`  | ISO date   | ✓        |                                             |

Compound unique index:

```python
db.user_data.create_index([("user_id", 1), ("tool_key", 1)], unique=True)
```

### `resume_drafts`

Draft resumes (anonymous-friendly via `draft_id`).

| Field        | Type     | Notes                                  |
|--------------|----------|----------------------------------------|
| `draft_id`   | string   | UUID — **unique index**                |
| `user_id`    | string   | Optional (anonymous drafts allowed)    |
| `payload`    | object   | Full resume tree                       |
| `template`   | string   | `clean / professional / minimal / executive / modern` |
| `score`      | int      | 0–100 deterministic score              |
| `updated_at` | ISO date |                                        |

### `ats_checks`

Cache for ATS analysis results.

| Field        | Type    | Notes                                          |
|--------------|---------|------------------------------------------------|
| `hash`       | string  | SHA-256 of (resume + JD) — **unique index**    |
| `result`     | object  | Score + categories                             |
| `created_at` | ISO date| **Indexed** (used for 1-hour TTL eviction)     |

### `invoices`

| Field             | Type      | Required | Notes                                  |
|-------------------|-----------|----------|----------------------------------------|
| `_id`             | ObjectId  | ✓        |                                        |
| `user_id`         | string    | ✓        | Owner — **indexed (compound w/ created_at)** |
| `invoice_number`  | string    | ✓        | e.g. `INV-007`                         |
| `status`          | string    | ✓        | `draft / sent / paid / overdue / partial` |
| `date`, `due_date`| string    | ✓        | ISO date `YYYY-MM-DD`                  |
| `currency`        | string    | ✓        | ISO 4217 (USD, EUR…)                   |
| `client_name`, `client_email`, `client_address`, `client_company` | string | partial | Snapshot of recipient at create time |
| `business_name`, `business_email`, `business_phone`, `business_address` | string | partial | Sender |
| `items[]`         | array     | ✓        | `{id, description, qty, unit, rate}`   |
| `discount_type`   | enum      | ✓        | `"%"` or `"$"`                         |
| `discount_value`  | float     | ✓        |                                        |
| `tax_label`, `tax_rate` | string, float | ✓ |                                        |
| `notes`, `payment_terms`, `payment_link` | string | ✗ |                              |
| `subtotal`, `discount_amount`, `tax_amount`, `total` | float | ✓ | Computed at save |
| `payments[]`      | array     | ✓        | `{amount, date, note, recorded_at}`    |
| `attachments[]`   | array     | ✓        | `{id, filename, mime, size, uploaded_at}` (data on disk) |
| `share_token`     | string    | ✗        | Public-URL token (issued on first share) |
| `created_at`, `updated_at` | ISO date | ✓ |                                  |

```python
db.invoices.create_index([("user_id", 1), ("created_at", -1)])
```

### `invoice_clients`

Address book.

| Field      | Type     | Notes                            |
|------------|----------|----------------------------------|
| `_id`      | ObjectId |                                  |
| `user_id`  | string   | **Compound index w/ name**       |
| `name`     | string   |                                  |
| `email`    | string   |                                  |
| `company`  | string   |                                  |
| `address`  | string   |                                  |

### `invoice_settings`

Per-user settings (currently just logo).

| Field        | Type   | Notes                                    |
|--------------|--------|------------------------------------------|
| `user_id`    | string | Primary key                              |
| `logo_url`   | string | Base64 data URL (≤2 MB)                  |
| `updated_at` | ISO date |                                        |

### `invoice_email_logs`

Resend audit trail.

| Field          | Type      | Notes                                |
|----------------|-----------|--------------------------------------|
| `invoice_id`   | string    | Mongo invoice `_id`                  |
| `to_email`     | string    |                                      |
| `cc`, `bcc`    | array[str]|                                      |
| `subject`      | string    |                                      |
| `status`       | string    | `sent / failed`                      |
| `provider_id`  | string    | Resend message id                    |
| `error`        | string    | If failed                            |
| `sent_at`      | ISO date  |                                      |

### `ab_events`

| Field          | Type     | Notes                                |
|----------------|----------|--------------------------------------|
| `experiment`   | string   | e.g. `"hero_cta_v2"` — indexed       |
| `variant`      | string   | `"a"`, `"b"`                         |
| `event`        | string   | `view / click / convert`             |
| `user_id`      | string   | Optional                             |
| `session_id`   | string   | Cookie / fingerprint                 |
| `ts`           | ISO date |                                      |

---

## 4.2 PostgreSQL Tables

DDL is generated by SQLAlchemy on startup from `backend/esign/models.py` and
`backend/billing/models.py`. Indexes/constraints below are declared in the
`Column(..., index=True, unique=True, …)` calls.

### `documents`

| Column           | Type                     | Constraints                  |
|------------------|--------------------------|------------------------------|
| `id`             | `UUID` PK                | `default=uuid4`              |
| `owner_id`       | `varchar(64)` not null   | Mongo user `_id` string — **indexed** |
| `title`          | `varchar(255)` not null  |                              |
| `original_key`   | `varchar(500)` not null  | Disk path (e.g. `uploads/esign/<uuid>.pdf`) |
| `signed_key`     | `varchar(500)`           | Set after completion         |
| `status`         | `varchar(20)` not null   | `draft / sent / partial / completed / expired / voided / declined` |
| `doc_hash`       | `varchar(64)`            | SHA-256 of final PDF         |
| `signing_order`  | `varchar(20)` not null   | `sequential / parallel`      |
| `page_count`     | `int` not null           |                              |
| `expires_at`     | `timestamptz`            |                              |
| `completed_at`   | `timestamptz`            |                              |
| `settings`       | `jsonb` not null         | `{uuid_enabled, qr_enabled, brand_enabled, email_owner_on_view, reminder_days[]}` |
| `created_at`, `updated_at` | `timestamptz` not null | `onupdate=now()`        |

### `signers`

| Column          | Type                   | Constraints                                         |
|-----------------|------------------------|-----------------------------------------------------|
| `id`            | `UUID` PK              |                                                     |
| `document_id`   | `UUID` FK → `documents.id` on delete CASCADE | not null, **indexed**         |
| `name`          | `varchar(255)` not null |                                                    |
| `email`         | `varchar(255)` not null |                                                    |
| `role`          | `varchar(20)` not null | `signer / approver / cc / witness`                  |
| `order_index`   | `int` not null         |                                                     |
| `color`         | `varchar(7)`           | Hex                                                 |
| `token_hash`    | `varchar(128)`         | SHA-256 of last issued JWT — **indexed**            |
| `token_used`    | `bool` not null        |                                                     |
| `status`        | `varchar(20)` not null | `pending / notified / viewed / signed / declined`   |
| `signed_at`, `viewed_at` | `timestamptz` |                                                     |
| `ip_address`    | `varchar(64)`          |                                                     |
| `user_agent`    | `text`                 |                                                     |
| `geo_country`, `geo_city` | `varchar` |                                                     |
| `reminder_count`| `int` not null         | Used by reminder cron                               |
| `decline_reason`| `text`                 |                                                     |

### `signature_fields`

| Column          | Type                                | Constraints                                |
|-----------------|-------------------------------------|--------------------------------------------|
| `id`            | `UUID` PK                           |                                            |
| `document_id`   | `UUID` FK → `documents.id` CASCADE  | not null                                   |
| `signer_id`     | `UUID` FK → `signers.id` CASCADE    | not null                                   |
| `page`          | `int` not null                      | 1-indexed                                  |
| `x`, `y`, `width`, `height` | `float` not null        | Fractions of page (0–1, top-left origin)   |
| `field_type`    | `varchar(20)` not null              | `signature / initials / date / text / checkbox / stamp` |
| `required`      | `bool` not null                     |                                            |
| `label`         | `varchar(100)`                      |                                            |
| `filled_at`     | `timestamptz`                       |                                            |
| `value`         | `text`                              | Base64 PNG for signature/initials, plain text otherwise |

### `audit_events`

| Column          | Type                                | Notes                                  |
|-----------------|-------------------------------------|----------------------------------------|
| `id`            | `UUID` PK                           |                                        |
| `document_id`   | `UUID` FK → `documents.id` CASCADE  | not null, **indexed**                  |
| `signer_id`     | `UUID` FK → `signers.id` ON DELETE SET NULL | nullable for system events     |
| `event_type`    | `varchar(60)` not null              | `viewed / signed / declined / document_sent / document_voided / completed / expired / reminder_sent` |
| `occurred_at`   | `timestamptz` not null              | **Indexed** (used by timeline render)  |
| `ip_address`    | `varchar(64)`                       |                                        |
| `user_agent`    | `text`                              |                                        |
| `event_metadata`| `jsonb`                             | Stored as `metadata` column            |

### `subscriptions`

| Column                  | Type                  | Notes                                |
|-------------------------|-----------------------|--------------------------------------|
| `user_id`               | `varchar(64)` PK      | Mongo user `_id` string              |
| `tier`                  | `varchar(20)` not null| `free / pro / business`              |
| `status`                | `varchar(20)` not null| `active / trialing / past_due / canceled / unpaid` |
| `stripe_customer_id`    | `varchar(255)`        | **Indexed**                          |
| `stripe_subscription_id`| `varchar(255)`        | **Indexed**                          |
| `plan_interval`         | `varchar(10)`         | `month / year`                       |
| `current_period_end`    | `timestamptz`         |                                      |
| `cancel_at_period_end`  | `bool` not null       |                                      |
| `docs_used_this_month`  | `int` not null        | Reset on the 1st by `reset_counters_job` |
| `docs_reset_at`         | `timestamptz`         |                                      |
| `created_at`, `updated_at` | `timestamptz`      |                                      |

### `subscription_events`

| Column           | Type                       | Notes                                 |
|------------------|----------------------------|---------------------------------------|
| `id`             | `UUID` PK                  |                                       |
| `user_id`        | `varchar(64)` indexed      |                                       |
| `event_type`     | `varchar(100)` not null    | Stripe event type                     |
| `stripe_event_id`| `varchar(255)` UNIQUE      | **Idempotency key** for webhook       |
| `amount_usd`     | `numeric(10,2)`            |                                       |
| `tier`           | `varchar(20)`              |                                       |
| `occurred_at`    | `timestamptz` not null     |                                       |
| `event_metadata` | `jsonb`                    |                                       |

### `saved_signatures`

| Column        | Type                  | Notes                                 |
|---------------|-----------------------|---------------------------------------|
| `user_id`     | `varchar(64)` PK      |                                       |
| `image_data`  | `text` not null       | Base64 PNG data URL                   |
| `method`      | `varchar(20)` not null| `draw / type / upload`                |
| `updated_at`  | `timestamptz`         |                                       |

---

## 4.3 ER Diagram (PostgreSQL)

```mermaid
erDiagram
    documents ||--o{ signers : has
    documents ||--o{ signature_fields : has
    documents ||--o{ audit_events : has
    signers ||--o{ signature_fields : owns
    signers ||--o{ audit_events : actor
    subscriptions ||--o{ subscription_events : "stripe webhook"

    documents {
      uuid id PK
      string owner_id "Mongo _id"
      string title
      string status
      string signing_order
      jsonb settings
      timestamptz created_at
      timestamptz updated_at
    }
    signers {
      uuid id PK
      uuid document_id FK
      string name
      string email
      string role
      int order_index
      string status
      string token_hash
    }
    signature_fields {
      uuid id PK
      uuid document_id FK
      uuid signer_id FK
      int page
      float x
      float y
      float width
      float height
      string field_type
      text value
    }
    audit_events {
      uuid id PK
      uuid document_id FK
      uuid signer_id FK
      string event_type
      timestamptz occurred_at
      string ip_address
    }
    subscriptions {
      string user_id PK
      string tier
      string stripe_customer_id
      string stripe_subscription_id
      int docs_used_this_month
      timestamptz current_period_end
    }
    subscription_events {
      uuid id PK
      string user_id
      string event_type
      string stripe_event_id UK
    }
```

## 4.4 Cross-DB Reference

The two databases are **linked by `owner_id` / `user_id`** (Mongo user `_id`
serialised as string). There is **no foreign-key constraint** across DBs —
referential integrity is the application's responsibility (the auth layer
guarantees only authenticated users can write).

```mermaid
flowchart LR
    Users[(Mongo: users)] -. owner_id .-> Doc[(PG: documents)]
    Users -. user_id .-> Sub[(PG: subscriptions)]
    Users -. user_id .-> UserData[(Mongo: user_data)]
    Users -. user_id .-> Inv[(Mongo: invoices)]
```

Deleting a Mongo user does **not** cascade — Postgres docs/subs become
orphaned. If you implement account deletion in the future, you must also
purge from Postgres + filesystem `uploads/`.

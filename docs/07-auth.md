# 07 — Authentication & Authorization

## 7.1 Login Flow

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant N as Next.js
    participant A as POST /api/auth/login
    participant M as Mongo

    B->>N: Visit /login
    N-->>B: LoginForm (client component)
    B->>A: POST {email, password}
    A->>M: lookup users.email
    alt user not found OR bcrypt mismatch
        A->>M: upsert login_attempts (count++)
        opt count >= 5
          A-->>B: 429 + locked_until
        end
        A-->>B: 401 "Invalid credentials"
    else success
        A->>M: delete login_attempts row
        A->>A: sign access JWT (15m), refresh JWT (7d)
        A-->>B: 200 user JSON<br/>Set-Cookie access; HttpOnly; Secure; SameSite=Lax<br/>Set-Cookie refresh; HttpOnly; Secure; SameSite=Lax
    end
```

The Login form sets `method="post"` and uses `autoComplete="email" / "current-password"` so the browser doesn't expose credentials in the URL.

## 7.2 JWT Implementation

- Library: **`pyjwt`** (HS256).
- Secret: `JWT_SECRET` env var (rotate to invalidate everyone).
- Two tokens:
  - **Access**: 15-minute TTL — embedded in `access` HttpOnly cookie.
  - **Refresh**: 7-day TTL — embedded in `refresh` HttpOnly cookie.
- Payload:
  ```json
  {"sub": "<user_id>", "role": "user|admin", "type": "access|refresh", "iat": ..., "exp": ...}
  ```
- Verification helper: `get_current_user(request)` in `backend/auth.py` reads the `access` cookie, verifies it, and returns the Mongo user doc; raises `HTTPException(401)` on failure.

### eSign signing tokens (different secret-domain JWT)

- Library: same `pyjwt` HS256.
- Secret: `JWT_SECRET` (reused — could be split if you want extra isolation).
- Payload:
  ```json
  {"sid": "<signer_uuid>", "did": "<doc_uuid>", "email": "<>", "type": "esign", "iat": …, "exp": …}
  ```
- Code: `backend/esign/tokens.py`. Tokens are **one-shot**: after `submit`, `signers.token_used = true` prevents reuse. The `token_hash` column stores SHA-256(token) so even DB compromise doesn't leak usable tokens.

## 7.3 Roles & Permissions

| Role    | Granted to                       | Special powers                                                            |
|---------|----------------------------------|---------------------------------------------------------------------------|
| `user`  | All registered users             | Full access to own resources (invoices, eSign docs, etc.).                |
| `admin` | First registered user whose email matches `ADMIN_EMAIL` | All user powers + `GET /api/analytics/summary/*` + `/api/admin/email-diag` |

There is currently **no fine-grained role system** beyond user/admin. Tier-based gating for eSign (free/pro/business) lives in `backend/billing/tiers.py` and is enforced inside route bodies with `assert_can_*` calls, not via FastAPI dependencies.

## 7.4 Middleware

FastAPI doesn't use traditional middleware here — auth is done **per route** via `Depends(get_current_user)` or by reading the cookie inline. The single global middleware is CORS:

```python
# server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 7.5 Frontend: Global 401 Handler

API client modules (`frontend/src/components/esign/api.ts`, `frontend/src/components/invoice-app/api.ts`) detect `res.status === 401`, then:

```ts
window.dispatchEvent(new CustomEvent("auth:expired", { detail: { source: "esign" } }));
throw new Error("AUTH_REQUIRED");
```

`AuthContext.tsx` listens for that event and runs:

```ts
const path = window.location.pathname + window.location.search;
window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
```

This guarantees mid-session expiries always land the user on the login page with the destination preserved. The `/login` page reads `?redirect=` and routes the user back after a successful login.

## 7.6 Security Mechanisms

| Mechanism                    | Where                                                     |
|------------------------------|-----------------------------------------------------------|
| **Bcrypt password hashing**  | `auth.py` — cost 12                                       |
| **HttpOnly cookies**         | `set_auth_cookies()` in `auth.py`                         |
| **CSRF mitigation**          | SameSite=Lax + JSON-only mutating endpoints (no HTML form posts to mutating endpoints) |
| **Brute force lockout**      | 5 failures → 15 min lock via `login_attempts`             |
| **Password reset tokens**    | UUID + TTL index (15-min expiry) in `password_reset_tokens` |
| **One-shot eSign tokens**    | `token_hash` + `token_used` columns                       |
| **PDF magic-byte validation**| `esign/storage.py` rejects non-`%PDF-` uploads            |
| **Stripe webhook signing**   | `STRIPE_WEBHOOK_SECRET` verified in `billing/service.py`  |
| **Idempotent Stripe webhook**| `subscription_events.stripe_event_id UNIQUE`              |
| **SHA-256 audit hash**       | Final signed PDF hashed → `documents.doc_hash`            |
| **PII masking on verify**    | Emails masked (`a***@x.com`) on public `/verify/{doc_id}` |

See **[14 Security Review](./14-security.md)** for known gaps and recommendations.

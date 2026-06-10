# 12 — Maintenance Guide

## 12.1 Coding Standards

### Backend (Python)

- Python 3.11; **async** by default (`async def`).
- Use **`datetime.now(timezone.utc)`** — never `datetime.utcnow()`.
- Schemas live in `*/schemas.py` (Pydantic v2 with `model_config = ConfigDict(from_attributes=True)`).
- Routes return Pydantic models, never raw dicts.
- Use **`PyObjectId`** type for any Mongo `_id` exposed in API responses.
- ObjectId-aware base model: never return `{**doc}` — call `Model.from_mongo(doc)`.
- Errors: `HTTPException(status_code, detail="…")`. Reserve 500 for genuine bugs.
- Lint: `ruff check backend/`.
- Tests: `pytest backend/tests`.

### Frontend (TypeScript / React)

- **Named export** components (`export const Foo`). **Default export** pages (Next.js requirement).
- All interactive elements get **`data-testid`** in kebab-case.
- Use **shadcn/ui** primitives from `src/components/ui/`. Don't recreate buttons/inputs/dialogs.
- Use **Tailwind** + the design tokens declared in `globals.css`. Don't introduce purple/violet gradients (banned per design guidelines).
- Toasts: `import { toast } from "sonner";` (via `useToast()` helper).
- Tooltips: `@radix-ui/react-tooltip` (already wrapped in shadcn).
- Avoid emojis in code icons — use **lucide-react** or FontAwesome.
- Component size guideline: **< 700 lines**. Refactor when you hit ~500.

### API contract rules

- Every **mutation** is authenticated unless explicitly public (`/sign/{token}`, `/verify/{doc_id}`, `/invoices/public/{token}`).
- New endpoints use `/api/<feature>` prefix.
- Pagination, when added, uses `?limit=&cursor=` (none of the current endpoints paginate — they all return the user's entire row set).

## 12.2 How to add a new Module

Backend (e.g. a "Reports" module):

1. Create `backend/reports/` directory.
2. Add `models.py` (SQLAlchemy or Pydantic).
3. Add `schemas.py`.
4. Add `routes.py` exposing `router = APIRouter(prefix="/api/reports", tags=["reports"])`.
5. Optional: `service.py` for business logic separated from routes.
6. Register in `backend/server.py`:
   ```python
   from reports.routes import router as reports_router
   app.include_router(reports_router)
   ```
7. Add pytest under `backend/tests/test_reports.py`.

Frontend:

1. Page lives under `frontend/app/reports/page.tsx` (or nested as needed).
2. Components in `frontend/src/components/reports/`.
3. API client in `frontend/src/components/reports/api.ts` — **dispatch `"auth:expired"`** on 401.
4. Add `data-testid` to every interactive element.

## 12.3 How to add a new API

```python
# backend/<module>/routes.py
from fastapi import APIRouter, Depends
from auth import get_current_user

router = APIRouter(prefix="/api/widgets", tags=["widgets"])

@router.get("/", response_model=list[WidgetOut])
async def list_widgets(user=Depends(get_current_user)):
    rows = await db.widgets.find({"user_id": user["_id"]}).to_list(None)
    return [WidgetOut.from_mongo(r) for r in rows]
```

If the API touches MongoDB, make sure the collection is indexed in `db.create_indexes()`.

If the API mutates state, add a pytest in `backend/tests/`.

## 12.4 How to add a new database table

### MongoDB
- Just write to a new collection name. Add an index in `db.create_indexes()`. No DDL needed.

### PostgreSQL
1. Add the model in `backend/<module>/models.py`:
   ```python
   from sqlalchemy import Column, String, DateTime
   from .database import Base

   class MyTable(Base):
       __tablename__ = "my_table"
       id = Column(String, primary_key=True)
       created_at = Column(DateTime(timezone=True), nullable=False, default=_now)
   ```
2. Make sure `MyTable` is imported somewhere that runs at startup (e.g. `from .models import MyTable` in the module `__init__.py`).
3. On next backend restart, `Base.metadata.create_all()` will create the table — **but only the table**, not column additions to existing tables. For altering existing schemas you must:
   - Either drop & recreate in dev (acceptable until first paying customer).
   - Or write a manual migration via `sudo -u postgres psql realprofits_esign -c "ALTER TABLE ..."`.
4. There is **no Alembic** in the repo. Adding one is on the [tech-debt list](./15-technical-debt.md).

## 12.5 How to add a new pSEO route

1. Add a route folder under `frontend/app/<segment>/[param]/page.tsx`.
2. Export `generateStaticParams()` returning every URL combo.
3. Export `generateMetadata({ params })` with unique title/description.
4. Use the variation engine (or write a new one in `frontend/src/lib/<feature>/`) to ensure each page has **distinct** copy. Google penalises near-duplicates.
5. Add the section to `frontend/src/lib/sitemap-data.ts` so it shows up in the sitemap index.
6. Run `yarn build` and inspect the output — Next prints `(SSG)` counts per route.

## 12.6 How to add a new email template

1. Add a function in `backend/esign/email_service.py` or `backend/invoices.py` shaped like the existing `send_signature_request`.
2. Use the shared `_wrap(title, preheader, body_html, cta_label, cta_url)` helper for consistent branding (TEAL header, GOLD CTA).
3. Always call `_send(to, subject, html)` so the Resend audit log row gets written.

## 12.7 Best Practices

- **Don't trust client totals.** Server recomputes invoice subtotals + eSign field positions.
- **One-shot operations are idempotent.** `share_token` minting, `subscription_events` insertion, eSign sending — all check existing state first.
- **Always pass `credentials: "include"`** from frontend fetch calls.
- **Use `data-testid`** for every interactive element. The QA agent relies on them.
- **No emoji in icons.** Use lucide-react.
- **Log to stderr** in backend — supervisor captures it. Don't write to custom files in `uploads/`.
- **Don't hand-edit** `package.json`, `requirements.txt`, or supervisor configs — use `yarn add`, `pip install + pip freeze`, and don't touch supervisor (read-only).
- **Update `/app/memory/PRD.md`** when you ship a feature.
- **Update `/app/memory/test_credentials.md`** when you change auth credentials.

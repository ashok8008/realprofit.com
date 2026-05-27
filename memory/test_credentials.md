# RealProfits Test Credentials

## Primary Admin Account
- **Email**: admin@realprofits.com
- **Password**: RealProfits2026!
- **Role**: admin
- **Use for**: All authenticated endpoints (invoices, eSign documents, etc.)

## Database Access (local pod)

### MongoDB (existing app)
- URL: `mongodb://localhost:27017`
- DB: `realprofits`
- Use for: auth, users, invoices, resume_drafts, calculator caches

### PostgreSQL (eSign module — NEW)
- Host: `localhost:5432`
- User: `realprofits` / `realprofits_dev`
- Database: `realprofits_esign`
- Tables: `documents`, `signers`, `signature_fields`, `audit_events`
- Connection: `postgresql+asyncpg://realprofits:realprofits_dev@localhost:5432/realprofits_esign`

## eSign Public Endpoints
- Public signing page (no auth): `/sign/{jwt-token}` — token issued via `/api/esign/documents/{id}/send`
- Public verification (no auth): `/verify/{document-uuid}`

import os
from motor.motor_asyncio import AsyncIOMotorClient

_client = None
_db = None


def get_db():
    global _client, _db
    if _db is None:
        mongo_url = os.environ.get("MONGO_URL")
        db_name = os.environ.get("DB_NAME")
        if not mongo_url or not db_name:
            raise RuntimeError("MONGO_URL and DB_NAME environment variables must be set")
        _client = AsyncIOMotorClient(mongo_url)
        _db = _client[db_name]
    return _db


async def init_db():
    db = get_db()
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.user_data.create_index([("user_id", 1), ("tool_key", 1)], unique=True)
    await db.resume_drafts.create_index("draft_id", unique=True)
    await db.ats_checks.create_index("hash", unique=True)
    await db.ats_checks.create_index("created_at")
    await db.invoices.create_index([("user_id", 1), ("created_at", -1)])
    await db.invoice_clients.create_index([("user_id", 1), ("name", 1)])

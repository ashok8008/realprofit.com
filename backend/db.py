import os
from motor.motor_asyncio import AsyncIOMotorClient

_client = None
_db = None


def get_db():
    global _client, _db
    if _db is None:
        mongo_url = os.environ["MONGO_URL"]
        db_name = os.environ["DB_NAME"]
        _client = AsyncIOMotorClient(mongo_url)
        _db = _client[db_name]
    return _db


async def init_db():
    db = get_db()
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.user_data.create_index([("user_id", 1), ("tool_key", 1)], unique=True)

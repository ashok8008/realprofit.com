"""JWT signing-link tokens — RS256 not available here, fall back to HS256 with shared secret.

Tokens are bound to a single signer for a single document. We store SHA-256(token) in
signers.token_hash and mark token_used=True after submission, per security spec.
"""
import os
import hashlib
import jwt
from datetime import datetime, timezone, timedelta

ALG = "HS256"
DEFAULT_DAYS = 30


def _secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_signing_token(signer_id: str, document_id: str, email: str,
                          expires_at: datetime | None = None) -> str:
    if expires_at is None:
        expires_at = datetime.now(timezone.utc) + timedelta(days=DEFAULT_DAYS)
    payload = {
        "sid": signer_id,
        "did": document_id,
        "email": email,
        "iat": datetime.now(timezone.utc),
        "exp": expires_at,
        "type": "esign",
    }
    return jwt.encode(payload, _secret(), algorithm=ALG)


def decode_signing_token(token: str) -> dict:
    """Returns payload or raises jwt errors."""
    payload = jwt.decode(token, _secret(), algorithms=[ALG])
    if payload.get("type") != "esign":
        raise jwt.InvalidTokenError("Wrong token type")
    return payload

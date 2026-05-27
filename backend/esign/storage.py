"""Local file storage for eSign PDFs. Pluggable for S3/R2 later."""
import os
import hashlib
from pathlib import Path
from typing import Optional

BASE_DIR = Path(os.environ.get("ESIGN_STORAGE_DIR", "/app/backend/uploads/esign"))
BASE_DIR.mkdir(parents=True, exist_ok=True)


def _safe_subdir(doc_id: str) -> Path:
    p = BASE_DIR / doc_id
    p.mkdir(parents=True, exist_ok=True)
    return p


def save_original(doc_id: str, content: bytes, filename: str = "original.pdf") -> tuple[str, str]:
    """Save the uploaded PDF. Returns (relative_key, sha256_hex)."""
    folder = _safe_subdir(doc_id)
    file_path = folder / filename
    file_path.write_bytes(content)
    sha = hashlib.sha256(content).hexdigest()
    return f"{doc_id}/{filename}", sha


def save_signed(doc_id: str, content: bytes) -> str:
    folder = _safe_subdir(doc_id)
    out_path = folder / "signed.pdf"
    out_path.write_bytes(content)
    return f"{doc_id}/signed.pdf"


def read(rel_key: str) -> Optional[bytes]:
    p = BASE_DIR / rel_key
    if not p.exists():
        return None
    return p.read_bytes()


def delete_document(doc_id: str) -> None:
    folder = BASE_DIR / doc_id
    if folder.exists():
        for f in folder.iterdir():
            f.unlink()
        folder.rmdir()

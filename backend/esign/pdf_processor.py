"""PDF processing: embed signatures and append the audit-trail page.

Uses pypdf to read the original PDF and reportlab to draw overlays per page,
then merges them. The final PDF is hashed and saved.
"""
from __future__ import annotations

import base64
import io
import hashlib
from datetime import datetime
from typing import List, Tuple

from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

import qrcode
from PIL import Image


# Color palette per scope
TEAL = (11 / 255, 61 / 255, 61 / 255)
GOLD = (200 / 255, 169 / 255, 110 / 255)
MUTED = (110 / 255, 107 / 255, 99 / 255)
DARK = (28 / 255, 27 / 255, 24 / 255)


def _decode_png(data_url_or_b64: str) -> Image.Image | None:
    if not data_url_or_b64:
        return None
    raw = data_url_or_b64
    if raw.startswith("data:"):
        raw = raw.split(",", 1)[1]
    try:
        img_bytes = base64.b64decode(raw)
        return Image.open(io.BytesIO(img_bytes)).convert("RGBA")
    except Exception:
        return None


def _get_page_size(page) -> Tuple[float, float]:
    box: RectangleObject = page.mediabox
    return float(box.width), float(box.height)


def build_overlay_for_page(width: float, height: float, fields: List[dict],
                            uuid_enabled: bool, brand_enabled: bool) -> bytes:
    """Create a single-page PDF (in memory) with all signature overlays."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(width, height))
    c.setFillColorRGB(*DARK)

    for f in fields:
        # f keys: field_type, x, y, width, height (all 0-1), value, signer_name, signer_uuid
        fx = f["x"] * width
        fw = f["width"] * width
        fh = f["height"] * height
        # PDF y origin is bottom-left; HTML/canvas y is top-left → invert
        fy = height - (f["y"] * height) - fh

        ftype = f["field_type"]
        value = f.get("value") or ""

        if ftype in ("signature", "initials", "stamp"):
            img = _decode_png(value)
            if img is not None:
                # Fit image inside the field rectangle preserving aspect
                iw, ih = img.size
                ratio = min(fw / iw, fh / ih)
                draw_w, draw_h = iw * ratio, ih * ratio
                draw_x = fx + (fw - draw_w) / 2
                draw_y = fy + (fh - draw_h) / 2
                c.drawImage(ImageReader(img), draw_x, draw_y, draw_w, draw_h, mask="auto")
            else:
                # Fallback — render typed value as text
                c.setFont("Helvetica-Oblique", min(18, fh * 0.7))
                c.drawString(fx + 2, fy + fh * 0.3, value[:50])
        elif ftype == "date":
            c.setFont("Helvetica", min(11, fh * 0.6))
            c.drawString(fx + 2, fy + fh * 0.3, value or datetime.utcnow().strftime("%b %d, %Y"))
        elif ftype == "text":
            c.setFont("Helvetica", min(11, fh * 0.6))
            c.drawString(fx + 2, fy + fh * 0.3, value[:200])
        elif ftype == "checkbox":
            c.setFont("Helvetica", min(12, fh * 0.8))
            mark = "x" if value in ("true", "1", "checked", "on") else " "
            c.rect(fx + 2, fy + 2, min(fw, fh) - 4, min(fw, fh) - 4, stroke=1, fill=0)
            if mark.strip():
                c.drawString(fx + 5, fy + 5, "X")

        if uuid_enabled and ftype in ("signature", "initials") and f.get("signer_uuid"):
            c.setFillColorRGB(*MUTED)
            c.setFont("Helvetica", 6)
            c.drawString(fx, fy - 8, f"ID: {f['signer_uuid'][:8]}  • {f.get('signer_name','')[:30]}")
            c.setFillColorRGB(*DARK)

    if brand_enabled:
        c.setFillColorRGB(*MUTED)
        c.setFont("Helvetica", 7)
        c.drawString(36, 12, "Powered by RealProfits eSign — realprofits.com")

    c.save()
    buf.seek(0)
    return buf.getvalue()


def _audit_qr_png(verify_url: str) -> Image.Image:
    qr = qrcode.QRCode(box_size=4, border=1)
    qr.add_data(verify_url)
    qr.make(fit=True)
    return qr.make_image(fill_color="black", back_color="white").convert("RGB")


def build_audit_page(document, signers: list, signed_hash: str, verify_url: str,
                       audit_events: list | None = None) -> bytes:
    """Generate a multi-page audit-trail PDF.

    audit_events: optional list of AuditEvent rows (chronological); rendered as
    a tamper-evident "Activity timeline" — chain-of-custody record for legal use.
    """
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    width, height = letter

    # Header bar
    c.setFillColorRGB(*TEAL)
    c.rect(0, height - 60, width, 60, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(36, height - 38, "RealProfits eSign — Audit Trail")
    c.setFont("Helvetica", 9)
    c.drawString(36, height - 52, f"Document ID: {document.id}")

    # Metadata block
    y = height - 90
    c.setFillColorRGB(*DARK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(36, y, document.title)
    y -= 14
    c.setFont("Helvetica", 9)
    c.setFillColorRGB(*MUTED)
    c.drawString(36, y, f"Created: {document.created_at.strftime('%b %d, %Y %H:%M UTC')}")
    y -= 12
    if document.completed_at:
        c.drawString(36, y, f"Completed: {document.completed_at.strftime('%b %d, %Y %H:%M UTC')}")
        y -= 12
    c.drawString(36, y, f"SHA-256: {signed_hash}")
    y -= 24

    # Signers table
    c.setFillColorRGB(*DARK)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(36, y, "Signers")
    y -= 4
    c.setStrokeColorRGB(*GOLD)
    c.setLineWidth(1)
    c.line(36, y, width - 36, y)
    y -= 14

    c.setFont("Helvetica-Bold", 8)
    c.setFillColorRGB(*MUTED)
    for x, label in [(36, "NAME"), (180, "EMAIL"), (330, "IP / DEVICE"), (470, "SIGNED AT")]:
        c.drawString(x, y, label)
    y -= 12
    c.setFont("Helvetica", 8)
    c.setFillColorRGB(*DARK)
    for s in signers:
        if y < 130:
            c.showPage()
            y = height - 60
        c.drawString(36, y, (s.name or "")[:24])
        c.drawString(180, y, (s.email or "")[:24])
        ip = s.ip_address or "—"
        ua = (s.user_agent or "")[:18]
        c.drawString(330, y, f"{ip[:14]} / {ua}")
        signed = s.signed_at.strftime("%b %d %H:%M UTC") if s.signed_at else "—"
        c.drawString(470, y, signed)
        y -= 12
        c.setFillColorRGB(*MUTED)
        c.setFont("Helvetica-Oblique", 7)
        # Map raw status → human-readable, role-aware label so a witness
        # doesn't read "signed" on the audit trail.
        status_label = (s.status or "").lower()
        role_lc = (getattr(s, "role", "") or "").lower()
        if status_label == "signed":
            if role_lc == "witness":
                status_label = "witnessed"
            elif role_lc == "approver":
                status_label = "approved"
            elif role_lc == "cc":
                status_label = "received"
        role_suffix = f"  •  Role: {role_lc}" if role_lc and role_lc != "signer" else ""
        c.drawString(36, y, f"Signer ID: {s.id}  •  Status: {status_label}{role_suffix}")
        c.setFillColorRGB(*DARK)
        c.setFont("Helvetica", 8)
        y -= 14

    # ── Activity timeline ────────────────────────────────────────────────
    # Tamper-evident chain-of-custody record of every event recorded for this
    # document (viewed / signed / declined / sent / completed / voided / expired).
    if audit_events:
        signer_by_id = {str(s.id): s for s in signers}
        # Sort defensively in case caller didn't.
        events = sorted(audit_events, key=lambda e: e.occurred_at)
        if y < 200:
            c.showPage()
            y = height - 60
        else:
            y -= 6
        c.setFillColorRGB(*DARK)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(36, y, "Activity timeline")
        y -= 4
        c.setStrokeColorRGB(*GOLD)
        c.setLineWidth(1)
        c.line(36, y, width - 36, y)
        y -= 14

        c.setFont("Helvetica-Bold", 8)
        c.setFillColorRGB(*MUTED)
        for x, label in [(36, "WHEN"), (140, "EVENT"), (270, "WHO"), (430, "IP")]:
            c.drawString(x, y, label)
        y -= 12

        # Map raw event_type → human-readable, role-aware verb.
        def _verb(event_type: str, who_role: str) -> str:
            et = (event_type or "").lower().strip()
            r = (who_role or "").lower()
            if et in ("signed", "sign"):
                return {"witness": "Witnessed",
                        "approver": "Approved",
                        "cc": "Acknowledged"}.get(r, "Signed")
            if et in ("viewed", "view"):
                return "Viewed"
            if et in ("declined", "decline"):
                return "Declined"
            if et in ("document_sent", "sent"):
                return "Document sent"
            if et in ("document_voided", "voided"):
                return "Voided"
            if et in ("completed",):
                return "Document completed"
            if et in ("expired",):
                return "Expired"
            return event_type.replace("_", " ").capitalize() if event_type else "Event"

        for ev in events:
            if y < 80:
                c.showPage()
                y = height - 60
                # Re-print headers on continuation page.
                c.setFont("Helvetica-Bold", 8)
                c.setFillColorRGB(*MUTED)
                for x, label in [(36, "WHEN"), (140, "EVENT"), (270, "WHO"), (430, "IP")]:
                    c.drawString(x, y, label)
                y -= 12

            when = ev.occurred_at.strftime("%b %d %H:%M UTC") if ev.occurred_at else "—"
            sid = str(getattr(ev, "signer_id", "") or "")
            s = signer_by_id.get(sid)
            who = s.name if s else "System"
            role = (s.role if s else "") or ""
            verb = _verb(getattr(ev, "event_type", ""), role)
            ip = (getattr(ev, "ip_address", None) or "—")[:14]

            c.setFont("Helvetica", 8)
            c.setFillColorRGB(*DARK)
            c.drawString(36, y, when)
            c.drawString(140, y, verb[:22])
            c.drawString(270, y, (who or "")[:24])
            c.setFillColorRGB(*MUTED)
            c.drawString(430, y, ip)
            y -= 11
        y -= 6

    # QR code & verify URL
    if y < 180:
        c.showPage()
        y = height - 100
    qr_img = _audit_qr_png(verify_url)
    c.drawImage(ImageReader(qr_img), width - 130, 50, 90, 90)
    c.setFont("Helvetica-Bold", 9)
    c.setFillColorRGB(*DARK)
    c.drawString(36, 130, "Verify this document")
    c.setFont("Helvetica", 8)
    c.setFillColorRGB(*MUTED)
    c.drawString(36, 116, verify_url)

    # Legal footer
    c.setFont("Helvetica", 7)
    text = ("This document was signed electronically using RealProfits eSign in compliance with "
            "the U.S. ESIGN Act, UETA, and eIDAS SES standards. Each signer's identity is "
            "verified via a unique signing link. The SHA-256 hash above proves the document "
            "has not been modified since signing.")
    obj = c.beginText(36, 96)
    obj.setFont("Helvetica", 7)
    obj.setFillColorRGB(*MUTED)
    # Wrap manually
    line = ""
    for w in text.split():
        if len(line) + len(w) > 110:
            obj.textLine(line)
            line = w
        else:
            line = (line + " " + w).strip()
    if line:
        obj.textLine(line)
    c.drawText(obj)

    c.setFont("Helvetica", 7)
    c.setFillColorRGB(*MUTED)
    c.drawString(36, 30, f"Generated by RealProfits eSign · realprofits.com · {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")

    c.save()
    buf.seek(0)
    return buf.getvalue()


def merge_signatures(original_pdf_bytes: bytes,
                     fields_by_page: dict,
                     uuid_enabled: bool,
                     brand_enabled: bool) -> bytes:
    """Stamp each page's overlay onto the original PDF page."""
    reader = PdfReader(io.BytesIO(original_pdf_bytes))
    writer = PdfWriter()
    for idx, page in enumerate(reader.pages, start=1):
        w, h = _get_page_size(page)
        page_fields = fields_by_page.get(idx, [])
        if page_fields:
            overlay_bytes = build_overlay_for_page(w, h, page_fields, uuid_enabled, brand_enabled)
            overlay_reader = PdfReader(io.BytesIO(overlay_bytes))
            page.merge_page(overlay_reader.pages[0])
        writer.add_page(page)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


def append_audit_page(pdf_bytes: bytes, audit_bytes: bytes) -> bytes:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    audit_reader = PdfReader(io.BytesIO(audit_bytes))
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    for page in audit_reader.pages:
        writer.add_page(page)
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def get_page_count(pdf_bytes: bytes) -> int:
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        return len(reader.pages)
    except Exception:
        return 1

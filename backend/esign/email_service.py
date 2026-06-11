"""Resend-based email service for eSign notifications."""
import os
import logging
import httpx
from typing import Optional

logger = logging.getLogger(__name__)

RESEND_API = "https://api.resend.com/emails"

# Brand palette
TEAL = "#0B3D3D"
GOLD = "#C8A96E"
CREAM = "#F5F3EE"
DARK = "#1C1B18"
MUTED = "#6E6B63"


def _api_key() -> str:
    return os.environ.get("RESEND_API_KEY", "")


def _sender() -> str:
    return os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")


def _app_url() -> str:
    return os.environ.get("APP_URL", os.environ.get("FRONTEND_URL", "http://localhost:3000"))


async def _send(to: str, subject: str, html: str, attachments: list | None = None) -> bool:
    api_key = _api_key()
    sender = _sender()
    logger.info(
        "[esign-email] preparing send → to=%s subject=%r sender=%s api_key=%s",
        to, subject, sender,
        "SET(len=%d)" % len(api_key) if api_key else "EMPTY",
    )
    if not api_key:
        logger.error("[esign-email] RESEND_API_KEY missing — refusing to send")
        return False
    payload = {
        "from": f"RealProfits eSign <{sender}>",
        "to": [to],
        "subject": subject,
        "html": html,
    }
    if attachments:
        payload["attachments"] = attachments
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(RESEND_API, json=payload,
                                  headers={"Authorization": f"Bearer {api_key}"})
            if r.status_code >= 400:
                logger.error(
                    "[esign-email] Resend rejected → status=%d body=%s",
                    r.status_code, r.text[:500],
                )
                return False
            logger.info("[esign-email] Resend accepted → status=%d body=%s",
                        r.status_code, r.text[:200])
            return True
    except Exception as e:
        logger.exception("[esign-email] send failed: %s", e)
        return False


def _wrap(title: str, preheader: str, body_html: str, cta_text: str | None = None,
          cta_url: str | None = None) -> str:
    cta = ""
    if cta_text and cta_url:
        cta = f'''
        <div style="text-align:center;margin:32px 0;">
          <a href="{cta_url}" style="display:inline-block;background:{TEAL};color:#fff;
             padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;
             font-family:Arial,sans-serif;font-size:15px;">{cta_text}</a>
        </div>'''
    return f'''<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:{CREAM};font-family:Arial,sans-serif;color:{DARK};">
<div style="display:none;max-height:0;overflow:hidden;">{preheader}</div>
<div style="max-width:580px;margin:0 auto;padding:24px;">
  <div style="background:{TEAL};padding:24px 28px;border-radius:10px 10px 0 0;">
    <div style="color:{GOLD};font-size:13px;letter-spacing:2px;text-transform:uppercase;">RealProfits eSign</div>
    <div style="color:#fff;font-size:22px;font-weight:700;margin-top:6px;">{title}</div>
  </div>
  <div style="background:#fff;padding:28px;border:1px solid #E2DDD4;border-top:0;border-radius:0 0 10px 10px;">
    {body_html}
    {cta}
    <div style="margin-top:32px;padding-top:18px;border-top:1px solid #E2DDD4;font-size:12px;color:{MUTED};line-height:1.6;">
      This document was sent via RealProfits eSign. Electronic signatures are legally binding
      under the U.S. ESIGN Act, UETA and eIDAS standards. If you did not expect this message,
      you can safely ignore it.
    </div>
  </div>
  <div style="text-align:center;font-size:11px;color:{MUTED};margin-top:12px;">
    realprofits.com
  </div>
</div></body></html>'''


# ============ E1: Signature Request ============

async def send_signature_request(*, to_email: str, signer_name: str, owner_name: str,
                                  document_title: str, sign_url: str,
                                  expires: Optional[str] = None,
                                  role: str = "signer") -> bool:
    # Role-aware copy. Witnesses don't "sign" — they confirm; CC recipients only get a copy.
    role_label = {
        "witness": "witnessing",
        "approver": "approval",
        "cc": "review",
    }.get(role, "signature")
    cta_label = {
        "witness": "Review & Witness Document",
        "approver": "Review & Approve Document",
        "cc": "Open Document",
    }.get(role, "Review & Sign Document")
    title_label = {
        "witness": "Witness Request",
        "approver": "Approval Request",
        "cc": "Document Shared",
    }.get(role, "Signature Request")
    subject_verb = {
        "witness": "asked you to witness",
        "approver": "asked for your approval on",
        "cc": "shared a document with you:",
    }.get(role, "requested your signature on")
    body_verb_html = {
        "witness": "asked you to <b>witness</b> the signing of",
        "approver": "asked for your <b>approval</b> on",
        "cc": "shared a copy of",
    }.get(role, f"requested your {role_label} on")

    subject = f'[Action Required] {owner_name} {subject_verb} "{document_title}"'
    preheader_action = {
        "witness": "Open to witness",
        "approver": "Open to approve",
        "cc": "Open to review",
    }.get(role, "Open to review and sign")
    preheader = f"{preheader_action} — {f'expires {expires}' if expires else 'one-time secure link'}"
    body = f'''
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px;">Hi {signer_name},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px;">
      <b>{owner_name}</b> has {body_verb_html}
      <b style="color:{TEAL};">{document_title}</b>. The link below is unique to you and
      can only be used once.
    </p>
    {f'<p style="font-size:13px;color:{MUTED};margin:0 0 14px;">This request expires on {expires}.</p>' if expires else ''}
    <p style="font-size:13px;color:{MUTED};margin:0;">
      🔒 Do not share this link — it is tied to your email address.
    </p>'''
    return await _send(to_email, subject,
                       _wrap(title_label, preheader, body, cta_label, sign_url))


# ============ E5/E6: Completion ============

async def send_completion(*, to_email: str, recipient_name: str, document_title: str,
                           document_url: str, signed_pdf_b64: str | None,
                           audit_pdf_b64: str | None, is_owner: bool) -> bool:
    subject = f"✓ {document_title} has been fully signed"
    body = f'''
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px;">Hi {recipient_name},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px;">
      All parties have completed signing <b style="color:{TEAL};">{document_title}</b>.
      {'A copy of the signed PDF and the audit trail are attached to this email.' if signed_pdf_b64 else 'The fully signed PDF is now available in your dashboard.'}
    </p>
    {'<p style="font-size:13px;color:'+MUTED+';margin:0 0 14px;">As the document owner, you can download both copies from your dashboard at any time.</p>' if is_owner else ''}
    '''
    attachments = []
    if signed_pdf_b64:
        attachments.append({"filename": "signed-document.pdf", "content": signed_pdf_b64})
    if audit_pdf_b64:
        attachments.append({"filename": "audit-trail.pdf", "content": audit_pdf_b64})
    return await _send(to_email, subject,
                       _wrap("Document Signed", "All parties have signed.", body,
                             "View Document", document_url),
                       attachments=attachments or None)


# ============ E7: Partial Sign ============

async def send_partial_notify(*, to_email: str, owner_name: str, document_title: str,
                               signer_name: str, remaining: int, document_url: str) -> bool:
    subject = f"{signer_name} signed \"{document_title}\""
    body = f'''
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px;">Hi {owner_name},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px;">
      <b>{signer_name}</b> just signed <b style="color:{TEAL};">{document_title}</b>.
      {remaining} signer{'s' if remaining != 1 else ''} remaining.
    </p>'''
    return await _send(to_email, subject,
                       _wrap("Progress Update", "A signer just completed their portion.",
                             body, "View Progress", document_url))


# ============ E9: Declined ============

async def send_declined(*, to_email: str, recipient_name: str, document_title: str,
                         signer_name: str, reason: str | None, document_url: str) -> bool:
    subject = f"{signer_name} declined to sign \"{document_title}\""
    body = f'''
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px;">Hi {recipient_name},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px;">
      <b>{signer_name}</b> declined to sign <b style="color:{TEAL};">{document_title}</b>.
    </p>
    {f'<p style="font-size:14px;background:#FAF5EE;border-left:3px solid {GOLD};padding:12px;margin:0 0 14px;"><b>Reason:</b> {reason}</p>' if reason else ''}
    <p style="font-size:13px;color:{MUTED};margin:0;">The document status has been updated to Declined.</p>'''
    return await _send(to_email, subject,
                       _wrap("Document Declined", "A signer declined the request.",
                             body, "View Document", document_url))


# ============ E10: Voided ============

async def send_voided(*, to_email: str, recipient_name: str, document_title: str) -> bool:
    subject = f"Document voided: \"{document_title}\""
    body = f'''
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px;">Hi {recipient_name},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px;">
      The document <b style="color:{TEAL};">{document_title}</b> has been voided by the owner
      and is no longer available for signing.
    </p>'''
    return await _send(to_email, subject,
                       _wrap("Document Voided", "The owner voided this document.", body))


# ============ E11: Guest sender email-verification (6-digit code) ============

async def send_guest_verification(*, to_email: str, sender_name: str,
                                    document_title: str, signer_name: str,
                                    signer_email: str, code: str,
                                    expires_minutes: int = 30) -> bool:
    subject = f"Your RealProfits eSign verification code: {code}"
    body = f'''
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px;">Hi {sender_name},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px;">
      Use the code below to confirm you want to send
      <b style="color:{TEAL};">{document_title}</b> to
      <b>{signer_name}</b> &lt;{signer_email}&gt; for signing.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <div style="display:inline-block;background:{CREAM};border:2px solid {GOLD};border-radius:10px;
                  padding:18px 36px;font-family:'Courier New',monospace;font-weight:700;
                  font-size:32px;letter-spacing:10px;color:{TEAL};">{code}</div>
    </div>
    <p style="font-size:13px;color:{MUTED};margin:0 0 14px;">
      This code expires in {expires_minutes} minutes. If you didn't initiate this,
      no further action is required — the document will not be sent.
    </p>
    <p style="font-size:13px;color:{MUTED};margin:0;">
      Tip: <b>Sign up for a free RealProfits account</b> to send unlimited
      documents, track signing status from a dashboard, and skip this
      verification step on every send.
    </p>'''
    return await _send(to_email, subject,
                       _wrap("Confirm your send",
                             f"Verification code: {code}",
                             body))

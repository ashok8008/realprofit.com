"use client";
// Public signing page — no auth required. Token-driven.
import { useEffect, useState, useMemo } from "react";
import { CheckCircle2, AlertTriangle, FileSignature, X, Sparkles } from "lucide-react";
import { signApi, type Field } from "./api";
import { usePdfRenderer, PageCanvas } from "./PdfRenderer";
import { SignatureCreator } from "./SignatureCreator";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Props {
  token: string;
}

export function SigningPage({ token }: Props) {
  const [view, setView] = useState<Awaited<ReturnType<typeof signApi.view>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [currentSignature, setCurrentSignature] = useState<string | null>(null);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  const [consent, setConsent] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  // Saved signature (only available if signer is also a logged-in user)
  const [savedSig, setSavedSig] = useState<string | null>(null);
  useEffect(() => {
    fetch(`${API}/api/esign/signature`, { credentials: "include" })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && d.image_data) setSavedSig(d.image_data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const v = await signApi.view(token);
        setView(v);
        setConfirmName(v.signer_name);
        if (v.fields.length > 0) {
          setActiveFieldId(v.fields[0].id);
        }
      } catch (e: any) {
        setError(e.message || "Unable to load this signing link.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const pdfUrl = useMemo(() => signApi.pdfUrl(token), [token]);
  const { pages, loading: pdfLoading } = usePdfRenderer(pdfUrl, 1.5);

  const requiredCount = view?.fields.filter((f) => f.required).length || 0;
  const filledCount = view?.fields.filter((f) => f.required && fieldValues[f.id]).length || 0;
  const allRequiredFilled = filledCount === requiredCount;

  const applyToField = (fieldId: string, field: Field) => {
    if (field.field_type === "signature" || field.field_type === "initials" || field.field_type === "stamp") {
      if (!currentSignature) return;
      setFieldValues({ ...fieldValues, [fieldId]: currentSignature });
    } else if (field.field_type === "date") {
      setFieldValues({ ...fieldValues, [fieldId]: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) });
    }
    // Auto-advance to next empty field
    const next = view?.fields.find((f) => f.id !== fieldId && !fieldValues[f.id]);
    if (next) setActiveFieldId(next.id);
  };

  const submit = async () => {
    if (!view || !consent) return;
    setSubmitting(true);
    try {
      await signApi.submit(token, {
        signer_name: confirmName,
        field_values: Object.entries(fieldValues).map(([field_id, value]) => ({ field_id, value })),
        consent: true,
      });
      setCompleted(true);
    } catch (e: any) {
      setError(e.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const submitDecline = async () => {
    try {
      await signApi.decline(token, declineReason);
      setDeclined(true);
      setShowDeclineModal(false);
    } catch (e: any) {
      setError(e.message || "Could not decline");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] text-stone-600">Loading document…</div>;
  }

  if (error || !view) {
    const friendlyMsg =
      !error ? "This signing link is invalid or has expired." :
      error.includes("AUTH_REQUIRED") || error.includes("Invalid") ? "This signing link is invalid. Please use the link from your email." :
      error.includes("expired") ? "This signing link has expired. Contact the sender to request a new one." :
      error.includes("voided") ? "This document has been voided by the sender." :
      "We couldn't open this document. The link may be invalid or expired.";
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] px-6">
        <div className="bg-white border border-stone-200 rounded-xl p-10 max-w-md text-center shadow-sm">
          <AlertTriangle className="w-12 h-12 mx-auto text-[#B53D2F] mb-4" />
          <h1 className="text-xl font-semibold text-stone-900 mb-2">Unable to open document</h1>
          <p className="text-sm text-stone-600">{friendlyMsg}</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] px-6">
        <div className="bg-white border border-stone-200 rounded-xl p-10 max-w-md text-center shadow-sm">
          <CheckCircle2 className="w-14 h-14 mx-auto text-[#2A6B45] mb-4" />
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">Thank you!</h1>
          <p className="text-stone-600 mb-1">You've signed <b>{view.document_title}</b>.</p>
          <p className="text-sm text-stone-500 mt-4">A signed copy will be emailed to you once all parties complete signing.</p>
          <div className="mt-6 pt-6 border-t border-stone-200">
            <div className="text-[10px] tracking-[0.2em] uppercase text-[#C8A96E] font-semibold mb-2">
              Need to invoice this client?
            </div>
            <a
              href="/tools/invoice"
              data-testid="completion-cross-promo-invoice"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#0B3D3D] border border-[#0B3D3D] rounded-md hover:bg-[#0B3D3D] hover:text-white transition-colors"
            >
              Try Invoice Generator →
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (declined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] px-6">
        <div className="bg-white border border-stone-200 rounded-xl p-10 max-w-md text-center shadow-sm">
          <X className="w-14 h-14 mx-auto text-stone-500 mb-4" />
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">Declined</h1>
          <p className="text-stone-600">The document owner has been notified.</p>
        </div>
      </div>
    );
  }

  if (view.already_signed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] px-6">
        <div className="bg-white border border-stone-200 rounded-xl p-10 max-w-md text-center shadow-sm">
          <CheckCircle2 className="w-14 h-14 mx-auto text-[#2A6B45] mb-4" />
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">Already signed</h1>
          <p className="text-stone-600">You've already completed this document.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      {/* Header */}
      <header className="bg-[#0B3D3D] text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.2em] text-[#C8A96E] uppercase font-medium">RealProfits eSign</div>
            <h1 className="text-base font-semibold mt-0.5">{view.document_title}</h1>
          </div>
          <div className="text-right text-xs text-stone-300">
            <div>Signing as <b className="text-white">{view.signer_name}</b></div>
            <div className="text-stone-400">{view.signer_email}</div>
          </div>
        </div>
        <div className="bg-[#165252] px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="text-stone-200">
              {filledCount} of {requiredCount} required fields completed
            </div>
            <div className="flex-1 mx-4 h-1.5 bg-[#0B3D3D] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C8A96E] transition-all"
                style={{ width: requiredCount ? `${(filledCount / requiredCount) * 100}%` : "0%" }}
              />
            </div>
            <button
              onClick={() => setShowDeclineModal(true)}
              data-testid="decline-btn"
              className="text-stone-300 hover:text-white"
            >
              Decline to sign
            </button>
          </div>
        </div>
      </header>

      {/* Signing progress strip — small avatars showing who has signed, who's current, who's pending. */}
      {view.signers && view.signers.length > 1 && (
        <div className="bg-white border-b border-stone-200" data-testid="signing-progress-strip">
          <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-semibold whitespace-nowrap pr-2 border-r border-stone-200 mr-1">
              Signing order
            </span>
            {view.signers
              .slice()
              .sort((a, b) => a.order_index - b.order_index)
              .map((s, idx, arr) => {
                const isMe = s.name === view.signer_name && s.role !== "cc";
                const isSigned = s.status === "signed" || !!s.signed_at;
                const isDeclined = s.status === "declined";
                const stateLabel = isSigned
                  ? "Signed"
                  : isDeclined
                    ? "Declined"
                    : isMe
                      ? "You're next"
                      : "Pending";
                const initials = (s.name || "?")
                  .split(/\s+/)
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                return (
                  <div key={s.id} className="flex items-center gap-2 flex-shrink-0" data-testid={`progress-signer-${s.id}`}>
                    <div
                      className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${
                        isMe ? "ring-2 ring-offset-2 ring-[#C8A96E]" : ""
                      } ${isSigned ? "" : isDeclined ? "opacity-60" : "opacity-70"}`}
                      style={{ background: s.color }}
                      title={`${s.name} — ${stateLabel}`}
                    >
                      {initials}
                      {isSigned && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2A6B45]" />
                        </span>
                      )}
                      {isDeclined && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                          <X className="w-3 h-3 text-[#B53D2F]" />
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className={`text-xs font-semibold ${isMe ? "text-[#0B3D3D]" : "text-stone-800"} truncate max-w-[160px]`}>
                        {isMe ? "You" : s.name}
                        {s.role !== "signer" && (
                          <span className="ml-1 text-[9px] uppercase tracking-wider text-stone-500 font-medium">
                            {s.role}
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-[10px] ${
                          isSigned
                            ? "text-[#2A6B45]"
                            : isDeclined
                              ? "text-[#B53D2F]"
                              : isMe
                                ? "text-[#A0621A] font-medium"
                                : "text-stone-500"
                        }`}
                      >
                        {stateLabel}
                      </span>
                    </div>
                    {idx < arr.length - 1 && (
                      <span className="text-stone-300 px-1 select-none" aria-hidden>›</span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-12 gap-6 items-start">
        {/* PDF column */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {pdfLoading && <div className="text-stone-500">Loading document…</div>}
          {pages.map((p) => {
            const myFields = view.fields.filter((f) => f.page === p.pageNumber);
            const othersFilled = (view.other_filled_fields || []).filter((f) => f.page === p.pageNumber);
            return (
              <PageCanvas key={p.pageNumber} info={p}>
                {/* Read-only overlays for fields already signed by other signers / witnesses preview */}
                {othersFilled.map((f) => {
                  const owner = view.signers?.find((s) => s.id === f.signer_id);
                  const accent = owner?.color || "#2A6B45";
                  const val = f.value || "";
                  const isImg = val.startsWith("data:image");
                  return (
                    <div
                      key={`other-${f.id}`}
                      data-testid={`other-signed-field-${f.id}`}
                      style={{
                        position: "absolute",
                        left: `${f.x * 100}%`,
                        top: `${f.y * 100}%`,
                        width: `${f.width * 100}%`,
                        height: `${f.height * 100}%`,
                        borderColor: accent,
                        background: `${accent}14`,
                      }}
                      className="border rounded flex items-center justify-center overflow-hidden pointer-events-none"
                      title={owner ? `Signed by ${owner.name}` : "Signed"}
                    >
                      {isImg ? (
                        <img src={val} alt={`${owner?.name || "Signer"} signature`} className="max-h-full max-w-full" />
                      ) : (
                        <span className="text-xs px-1 truncate" style={{ fontSize: "min(14px, 90%)", color: accent }}>
                          {val}
                        </span>
                      )}
                    </div>
                  );
                })}
                {myFields.map((f) => {
                  const isActive = f.id === activeFieldId;
                  const isFilled = !!fieldValues[f.id];
                  return (
                    <button
                      key={f.id}
                      onClick={() => setActiveFieldId(f.id)}
                      data-testid={`signing-field-${f.id}`}
                      style={{
                        position: "absolute",
                        left: `${f.x * 100}%`,
                        top: `${f.y * 100}%`,
                        width: `${f.width * 100}%`,
                        height: `${f.height * 100}%`,
                      }}
                      className={`border-2 rounded transition-all flex items-center justify-center overflow-hidden ${
                        isFilled
                          ? "border-[#2A6B45] bg-[#2A6B45]/10"
                          : isActive
                            ? "border-[#C8A96E] bg-[#C8A96E]/20 animate-pulse"
                            : "border-dashed border-[#0B3D3D] bg-[#C8A96E]/10 hover:bg-[#C8A96E]/20"
                      }`}
                    >
                      {isFilled ? (
                        f.field_type === "signature" || f.field_type === "initials" || f.field_type === "stamp" ? (
                          <img src={fieldValues[f.id]} alt="signature" className="max-h-full max-w-full" />
                        ) : (
                          <span className="text-xs px-1 truncate" style={{ fontSize: "min(14px, 90%)" }}>
                            {fieldValues[f.id]}
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#0B3D3D]">
                          {f.field_type}
                          {f.required && " *"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </PageCanvas>
            );
          })}
        </div>

        {/* Side panel — sticky as a whole so both Active-field card and Finish-signing card
            stay visible while scrolling the multi-page PDF. */}
        <aside className="col-span-12 lg:col-span-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto space-y-4 pr-1">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
            {(() => {
              const activeField = view.fields.find((f) => f.id === activeFieldId);
              if (!activeField) {
                return <div className="text-stone-500 text-sm">Click a field on the document to fill it.</div>;
              }
              if (activeField.field_type === "text") {
                return (
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 mb-3">
                      {activeField.label || "Text field"}
                    </h3>
                    <input
                      type="text"
                      value={fieldValues[activeField.id] || ""}
                      onChange={(e) => setFieldValues({ ...fieldValues, [activeField.id]: e.target.value })}
                      data-testid={`text-input-${activeField.id}`}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:border-[#0B3D3D]"
                      placeholder="Type here…"
                    />
                  </div>
                );
              }
              if (activeField.field_type === "checkbox") {
                return (
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 mb-3">
                      {activeField.label || "Checkbox"}
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fieldValues[activeField.id] === "checked"}
                        onChange={(e) =>
                          setFieldValues({ ...fieldValues, [activeField.id]: e.target.checked ? "checked" : "" })
                        }
                        data-testid={`checkbox-input-${activeField.id}`}
                        className="w-4 h-4 accent-[#0B3D3D]"
                      />
                      <span className="text-sm">I agree</span>
                    </label>
                  </div>
                );
              }
              if (activeField.field_type === "date") {
                return (
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 mb-3">Date field</h3>
                    <button
                      onClick={() => applyToField(activeField.id, activeField)}
                      data-testid={`apply-date-${activeField.id}`}
                      className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252]"
                    >
                      Stamp today's date
                    </button>
                  </div>
                );
              }
              // signature/initials/stamp
              return (
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 mb-3">
                    Create your {activeField.field_type}
                  </h3>
                  {savedSig && (
                    <div
                      data-testid="saved-signature-banner"
                      className="mb-3 bg-[#FAF5EE] border border-[#C8A96E] rounded-md p-3 flex items-center gap-3"
                    >
                      <img
                        src={savedSig}
                        alt="Saved signature"
                        className="h-10 max-w-[120px] object-contain bg-white border border-stone-200 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-stone-900 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#C8A96E]" /> Use your saved signature
                        </div>
                        <div className="text-[11px] text-stone-600">One click — no need to draw again.</div>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentSignature(savedSig);
                          setFieldValues({ ...fieldValues, [activeField.id]: savedSig });
                          const next = view.fields.find((f) => f.id !== activeField.id && !fieldValues[f.id]);
                          if (next) setActiveFieldId(next.id);
                        }}
                        data-testid="use-saved-sig-btn"
                        className="px-3 py-1.5 text-xs font-bold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252] flex-shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  <SignatureCreator
                    onChange={setCurrentSignature}
                    initialName={view.signer_name}
                  />
                  <button
                    onClick={() => applyToField(activeField.id, activeField)}
                    disabled={!currentSignature}
                    data-testid={`apply-signature-${activeField.id}`}
                    className="w-full mt-3 px-4 py-2.5 text-sm font-semibold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Complete card */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-stone-900 mb-3">Finish signing</h3>
            <label className="flex items-start gap-2 cursor-pointer mb-3" data-testid="consent-label">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                data-testid="consent-checkbox"
                className="mt-1 w-4 h-4 accent-[#0B3D3D]"
              />
              <span className="text-xs text-stone-700 leading-relaxed">
                I agree to sign this document electronically under the U.S. ESIGN Act / UETA /
                eIDAS standards, and that my electronic signature is legally binding.
              </span>
            </label>
            <button
              onClick={submit}
              disabled={!consent || !allRequiredFilled || submitting}
              data-testid="complete-signing-btn"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileSignature className="w-4 h-4" />
              {submitting ? "Submitting…" : allRequiredFilled ? "Complete signing" : `Fill ${requiredCount - filledCount} more`}
            </button>
          </div>
        </aside>
      </main>

      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Decline to sign?</h3>
            <p className="text-sm text-stone-600 mb-4">The sender will be notified that you declined.</p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Optional reason (visible to the sender)"
              data-testid="decline-reason-input"
              className="w-full h-24 px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:border-[#0B3D3D] resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowDeclineModal(false)}
                data-testid="decline-cancel-btn"
                className="px-4 py-2 text-sm text-stone-700 rounded-md hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={submitDecline}
                data-testid="decline-confirm-btn"
                className="px-4 py-2 text-sm font-semibold text-white bg-[#B53D2F] rounded-md hover:bg-[#9F3326]"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

export type GuestModalStep = "sender_info" | "code_entry" | "sent";

export interface GuestModalState {
  open: boolean;
  senderName: string;
  senderEmail: string;
  code: string;
  verificationId: string | null;
  expiresAt: string | null;
  submitting: boolean;
  error: string;
  step: GuestModalStep;
  claimToken: string | null;
  documentId: string | null;
}

interface Props {
  state: GuestModalState;
  setState: (updater: (m: GuestModalState) => GuestModalState) => void;
  /** First (and only) signer in guest mode — used for the success copy. */
  signerName: string;
  signerEmail: string;
  /** Imperative handlers (live in EsignWizard because they touch wizard state). */
  onSubmit: () => Promise<void> | void;
  onVerify: () => Promise<void> | void;
  /** Called when the user clicks "Sign up free" inside the modal. */
  onSignup: (reason?: string) => void;
  onDone: () => void;
}

/**
 * 3-step modal used during guest-mode "Send":
 *  1. sender_info  — collect sender's name + email.
 *  2. code_entry   — verify the 6-digit code we just emailed.
 *  3. sent         — show tracking link + signup CTA.
 */
export function GuestSendModal({ state, setState, signerName, signerEmail, onSubmit, onVerify, onSignup, onDone }: Props) {
  if (!state.open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      data-testid="guest-send-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget && !state.submitting && state.step !== "sent") {
          setState((m) => ({ ...m, open: false }));
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        {state.step === "sender_info" && (
          <>
            <h3 className="text-lg font-semibold text-stone-900 mb-1">Send as a guest</h3>
            <p className="text-sm text-stone-600 mb-5">
              We&apos;ll email a 6-digit code to your address to confirm this send.
              This keeps the audit trail tamper-evident — and means you can come back later
              (by signing up with the same email) to see what was signed.
            </p>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Your name</label>
            <input
              type="text"
              data-testid="guest-sender-name"
              className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:border-[#0B3D3D] mb-3"
              placeholder="Jane Smith"
              value={state.senderName}
              onChange={(e) => setState((m) => ({ ...m, senderName: e.target.value, error: "" }))}
            />
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Your email (the sender)</label>
            <input
              type="email"
              data-testid="guest-sender-email"
              className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:border-[#0B3D3D]"
              placeholder="you@company.com"
              value={state.senderEmail}
              onChange={(e) => setState((m) => ({ ...m, senderEmail: e.target.value, error: "" }))}
            />
            {state.error && (
              <p className="text-xs text-[#B53D2F] mt-2" data-testid="guest-send-error">{state.error}</p>
            )}
            <div className="flex items-center justify-between gap-2 mt-5">
              <button
                onClick={() => setState((m) => ({ ...m, open: false }))}
                disabled={state.submitting}
                data-testid="guest-cancel"
                className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                onClick={() => onSubmit()}
                disabled={state.submitting}
                data-testid="guest-send-submit"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252] disabled:opacity-40"
              >
                {state.submitting ? "Sending…" : "Send verification code"}
              </button>
            </div>
            <p className="text-[11px] text-stone-500 mt-4">
              Want unlimited sends, a dashboard, multi-signer + witness/approver/CC?{" "}
              <button
                type="button"
                data-testid="guest-signup-link"
                className="font-semibold text-[#0B3D3D] underline underline-offset-2"
                onClick={() => onSignup("Continue with a free account to skip verification.")}
              >
                Sign up free
              </button>{" "}
              — your work is preserved.
            </p>
          </>
        )}
        {state.step === "code_entry" && (
          <>
            <h3 className="text-lg font-semibold text-stone-900 mb-1">Enter the 6-digit code</h3>
            <p className="text-sm text-stone-600 mb-5">
              We just emailed a code to <b>{state.senderEmail}</b>. Enter it below to send the document.
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              data-testid="guest-code-input"
              className="w-full px-4 py-3 border-2 border-[#C8A96E] rounded-lg text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:border-[#0B3D3D]"
              placeholder="••••••"
              value={state.code}
              onChange={(e) => setState((m) => ({ ...m, code: e.target.value.replace(/\D/g, ""), error: "" }))}
            />
            {state.error && (
              <p className="text-xs text-[#B53D2F] mt-2" data-testid="guest-code-error">{state.error}</p>
            )}
            <div className="flex items-center justify-between gap-2 mt-5">
              <button
                onClick={() => setState((m) => ({ ...m, step: "sender_info", code: "", error: "" }))}
                disabled={state.submitting}
                data-testid="guest-back"
                className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900"
              >
                Back
              </button>
              <button
                onClick={() => onVerify()}
                disabled={state.submitting || state.code.length !== 6}
                data-testid="guest-verify-submit"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252] disabled:opacity-40"
              >
                {state.submitting ? "Verifying…" : "Verify & send"}
              </button>
            </div>
          </>
        )}
        {state.step === "sent" && (
          <>
            <h3 className="text-lg font-semibold text-stone-900 mb-1">Sent — keep this safe</h3>
            <p className="text-sm text-stone-600 mb-3">
              <b>{signerName}</b> will receive the signing email at <b>{signerEmail}</b>.
            </p>
            {state.claimToken && state.documentId && (
              <div className="bg-[#FAF5EE] border border-[#C8A96E] rounded-md p-3 mb-3">
                <p className="text-xs font-semibold text-stone-700 mb-1">Your tracking link</p>
                <input
                  readOnly
                  data-testid="guest-tracking-url"
                  className="w-full px-2 py-1.5 text-xs bg-white border border-stone-300 rounded font-mono"
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/track/esign?d=${state.documentId}&c=${state.claimToken}`}
                />
                <p className="text-[10px] text-stone-500 mt-1">Bookmark this — it&apos;s the only way to check status without an account.</p>
              </div>
            )}
            <p className="text-xs text-stone-500 mb-4">
              Tip:{" "}
              <button
                type="button"
                data-testid="guest-signup-after-send"
                onClick={() => onSignup(undefined)}
                className="font-semibold text-[#0B3D3D] underline underline-offset-2"
              >
                Sign up free
              </button>{" "}
              with this same email to see this document in your dashboard automatically.
            </p>
            <div className="flex justify-end">
              <button
                onClick={onDone}
                data-testid="guest-done"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252]"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

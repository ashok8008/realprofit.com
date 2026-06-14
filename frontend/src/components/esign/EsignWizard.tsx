"use client";
// 5-step wizard: Upload → Signers → Place Fields → Settings & Review → Send
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft, ArrowRight, Upload, Users, MousePointer2, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { esignApi, SIGNER_PALETTE, type DocumentDetail, type Signer } from "./api";
import { FieldPlacer } from "./FieldPlacer";
import { GuestSendModal, type GuestModalState } from "./GuestSendModal";
import { useAutosave, readAutosave, clearAutosave } from "@/hooks/useAutosave";
import { WizardStepUpload } from "./WizardStepUpload";
import { WizardStepSigners } from "./WizardStepSigners";
import { WizardStepSettings } from "./WizardStepSettings";
import type { SignerDraft, FieldDraft } from "./wizardTypes";

const ESIGN_AUTOSAVE_KEY = "rp-autosave:esign:wizard";

interface WizardAutosaveSnapshot {
  docId?: string | null;
  step?: 1 | 2 | 3 | 4 | 5;
  title?: string;
  signers?: SignerDraft[];
  signingOrder?: "sequential" | "parallel";
  expiryDays?: number;
  brandEnabled?: boolean;
  uuidEnabled?: boolean;
  fields?: FieldDraft[];
}

type WizardStep = 1 | 2 | 3 | 4 | 5;

const STEPS: { id: WizardStep; label: string; icon: any }[] = [
  { id: 1, label: "Upload", icon: Upload },
  { id: 2, label: "Signers", icon: Users },
  { id: 3, label: "Place Fields", icon: MousePointer2 },
  { id: 4, label: "Settings", icon: SettingsIcon },
  { id: 5, label: "Send", icon: Send },
];

interface Props {
  initialDoc?: DocumentDetail;
}

export function EsignWizard({ initialDoc }: Props = {}) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<WizardStep>(initialDoc ? 2 : 1);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(initialDoc?.title || "");
  const [doc, setDoc] = useState<DocumentDetail | null>(initialDoc || null);
  const [signers, setSigners] = useState<SignerDraft[]>(
    initialDoc && initialDoc.signers.length > 0
      ? initialDoc.signers
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map((s, idx) => ({
            name: s.name,
            email: s.email,
            role: s.role,
            color: s.color || SIGNER_PALETTE[idx % SIGNER_PALETTE.length],
          }))
      : [{ name: user?.name || "", email: user?.email || "", role: "signer", color: SIGNER_PALETTE[0] }]
  );
  const [signingOrder, setSigningOrder] = useState<"sequential" | "parallel">(
    initialDoc?.signing_order || "parallel"
  );
  const initialExpiryDays = (() => {
    if (!initialDoc?.expires_at) return 15;
    const diff = Math.round((new Date(initialDoc.expires_at).getTime() - Date.now()) / (24 * 3600 * 1000));
    return diff > 0 ? diff : 15;
  })();
  const [expiryDays, setExpiryDays] = useState<number>(initialExpiryDays);
  const [brandEnabled, setBrandEnabled] = useState(initialDoc?.settings?.brand_enabled ?? true);
  const [uuidEnabled, setUuidEnabled] = useState(initialDoc?.settings?.uuid_enabled ?? true);
  const [fields, setFields] = useState<FieldDraft[]>(
    initialDoc?.fields?.map((f) => ({
      signer_id: f.signer_id,
      page: f.page,
      x: f.x,
      y: f.y,
      width: f.width,
      height: f.height,
      field_type: f.field_type,
      required: f.required,
      label: f.label || undefined,
      _localId: `f-existing-${f.id}`,
    })) || []
  );
  const [submitting, setSubmitting] = useState(false);
  // Self-sign: when ON + exactly 1 signer + that signer == the user, send()
  // routes the user straight to the signing page instead of emailing them.
  const [selfSign, setSelfSign] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  // Gate useAutosave's first write until the restore effect has run — otherwise
  // the empty initial state can clobber the saved snapshot on mount.
  const [restored, setRestored] = useState(false);

  // ── Autosave ──
  // On mount (only when NOT editing an existing draft), try restoring a snapshot.
  useEffect(() => {
    if (initialDoc) { setRestored(true); return; } // editing — don't fight server state
    const snap = readAutosave<WizardAutosaveSnapshot>(ESIGN_AUTOSAVE_KEY);
    if (!snap || !snap.data) { setRestored(true); return; }
    const d = snap.data;
    const hasMeaningful =
      (d.signers || []).some((s) => (s.name && s.email)) ||
      (d.fields || []).length > 0 ||
      (d.title && d.title.length > 0);
    if (!hasMeaningful) { setRestored(true); return; }
    if (typeof d.step === "number" && d.step >= 1 && d.step <= 5) setStep(d.step as WizardStep);
    if (d.title) setTitle(d.title);
    if (d.signers && d.signers.length > 0) setSigners(d.signers);
    if (d.signingOrder) setSigningOrder(d.signingOrder);
    if (typeof d.expiryDays === "number") setExpiryDays(d.expiryDays);
    if (typeof d.brandEnabled === "boolean") setBrandEnabled(d.brandEnabled);
    if (typeof d.uuidEnabled === "boolean") setUuidEnabled(d.uuidEnabled);
    if (d.fields) setFields(d.fields);
    setRestored(true);
    setTimeout(() => {
      toast({
        title: "Draft restored",
        description: "We kept the document you were preparing. Click Send when you're ready.",
      });
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Backfill signer-0 with the logged-in user's identity once auth resolves
  // (the initial useState ran while user was still null).
  useEffect(() => {
    if (!user) return;
    if (!restored) return; // wait so we don't overwrite a restored snapshot
    setSigners((prev) => {
      if (!prev[0]) return prev;
      if (prev[0].name || prev[0].email) return prev; // already filled (manual or restored)
      const next = prev.slice();
      next[0] = { ...next[0], name: user.name || "", email: user.email || "" };
      return next;
    });
  }, [user, restored]);

  // Save snapshot to localStorage every 5s; server-side persistence happens
  // via the existing PATCH calls between wizard steps (don't double-save).
  useAutosave<WizardAutosaveSnapshot>({
    key: ESIGN_AUTOSAVE_KEY,
    data: {
      docId: doc?.id || null,
      step,
      title,
      signers,
      signingOrder,
      expiryDays,
      brandEnabled,
      uuidEnabled,
      fields,
    },
    enabled: restored, // gated — avoids clobbering the saved snapshot on mount
    localDebounceMs: 5000,
  });

  // --- Step 1: Upload ---

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast({ title: "Only PDF files are supported", variant: "destructive" });
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      toast({ title: "File too large (max 25 MB)", variant: "destructive" });
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.pdf$/i, ""));
  };

  // ─────────────────────────────────────────────────────────────────────
  // Guest mode helpers
  // ─────────────────────────────────────────────────────────────────────
  // A guest can complete the entire flow IFF the document has exactly one
  // signer AND that signer's role is "signer". Adding more signers or any
  // non-signer role (approver/witness/cc) requires login.
  const guestEligible = !user
    && signers.length === 1
    && signers.every((s) => s.role === "signer");

  const requireLoginAndPreserve = (reason?: string) => {
    // Autosave hook keeps the wizard state in localStorage; just redirect.
    if (reason) {
      toast({
        title: "Sign in to continue",
        description: reason,
      });
    }
    const back = "/tools/esign/new";
    router.push(`/login?redirect=${encodeURIComponent(back)}`);
  };

  // Local object URL for guests so the PDF can render without a server upload.
  const localPdfUrl = useMemo(() => {
    if (!file) return "";
    try { return URL.createObjectURL(file); } catch { return ""; }
  }, [file]);

  const uploadAndContinue = async () => {
    if (!file || !title.trim()) return;
    setSubmitting(true);
    try {
      if (user) {
        const result = await esignApi.upload(title.trim(), file);
        setDoc(result);
      }
      // Guests: we keep `file` in state and lazily upload on Send.
      setStep(2);
      // Conversion event for paid-traffic attribution. Attaches Zeropark
      // source/campaign/cost automatically when the user came from an ad.
      try {
        const { trackZeroparkEvent } = await import("@/lib/analytics/zeropark");
        trackZeroparkEvent("tool_started", { tool: "esign" });
      } catch { /* analytics is best-effort */ }
      toast({ title: user ? "Document uploaded" : "Document ready — add your signer" });
    } catch (e: any) {
      if (e.message === "AUTH_REQUIRED") {
        router.push("/login?redirect=/tools/esign/new");
        return;
      }
      toast({
        title: "Upload failed",
        description:
          e?.message ||
          "Server returned an error. Please try again — if it persists, contact support.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Step 2: Signers ---

  const addSigner = () => {
    if (!user) {
      // Guests are restricted to a single signer with role="signer".
      requireLoginAndPreserve("Sign in to add more than one signer.");
      return;
    }
    if (signers.length >= 5) {
      toast({ title: "Free plan allows up to 5 signers", description: "Upgrade to Pro for more." });
      return;
    }
    setSigners([
      ...signers,
      { name: "", email: "", role: "signer", color: SIGNER_PALETTE[signers.length % SIGNER_PALETTE.length] },
    ]);
  };

  const updateSigner = (i: number, patch: Partial<SignerDraft>) => {
    // Guests can't pick non-signer roles — re-route them to login.
    if (!user && patch.role && patch.role !== "signer") {
      requireLoginAndPreserve("Sign in to add an approver, witness, or CC.");
      return;
    }
    setSigners(signers.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const removeSigner = (i: number) => {
    if (signers.length <= 1) return;
    setSigners(signers.filter((_, idx) => idx !== i));
  };

  const saveSignersAndContinue = async () => {
    const invalid = signers.find((s) => !s.name.trim() || !s.email.includes("@"));
    if (invalid) {
      toast({ title: "Every signer needs a name and valid email", variant: "destructive" });
      return;
    }
    // Guest flow: keep everything client-side; just advance.
    if (!user) {
      if (!guestEligible) {
        requireLoginAndPreserve("Sign in to send to multiple recipients or use approver/witness/CC.");
        return;
      }
      setStep(3);
      return;
    }
    if (!doc) return;
    setSubmitting(true);
    try {
      // Capture old signer mapping (id → email) before backend replaces signers.
      const oldSignerEmailById = new Map<string, string>(
        (doc.signers || []).map((s) => [s.id, s.email.toLowerCase()])
      );
      const updated = await esignApi.update(doc.id, {
        signing_order: signingOrder,
        signers: signers.map((s, idx) => ({
          name: s.name.trim(),
          email: s.email.trim().toLowerCase(),
          role: s.role,
          order_index: idx,
          color: s.color,
        })),
      });
      setDoc(updated);
      // Remap existing fields' signer_id from old → new by matching email; drop orphans.
      const newSignerIdByEmail = new Map<string, string>(
        (updated.signers || []).map((s) => [s.email.toLowerCase(), s.id])
      );
      setFields((prev) => {
        const remapped: FieldDraft[] = [];
        for (const f of prev) {
          const oldEmail = oldSignerEmailById.get(f.signer_id);
          const newSignerId = oldEmail ? newSignerIdByEmail.get(oldEmail) : undefined;
          if (newSignerId) {
            remapped.push({ ...f, signer_id: newSignerId });
          }
        }
        return remapped;
      });
      setStep(3);
    } catch (e: any) {
      if (e.message === "AUTH_REQUIRED") {
        router.push(`/login?redirect=/tools/esign/edit/${doc.id}`);
        return;
      }
      toast({ title: "Could not save signers", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Step 3: Fields placement (FieldPlacer manages this) ---

  const goToFields = () => setStep(3);

  const saveFieldsAndContinue = async () => {
    if (fields.length === 0) {
      toast({ title: "Place at least one signature field", variant: "destructive" });
      return;
    }
    if (user && !doc) return; // safety — logged-in users must have a doc id
    setStep(4);
  };

  // ── Guest send modal state ──
  const [guestModal, setGuestModal] = useState<GuestModalState>({
    open: false,
    senderName: "",
    senderEmail: "",
    code: "",
    verificationId: null,
    expiresAt: null,
    submitting: false,
    error: "",
    step: "sender_info",
    claimToken: null,
    documentId: null,
  });

  // --- Step 5: Send ---

  const sendDocument = async () => {
    // Guest flow: open the sender-info modal.
    if (!user) {
      if (!guestEligible) {
        requireLoginAndPreserve("Sign in to send to multiple recipients or use approver/witness/CC.");
        return;
      }
      if (fields.length === 0) {
        toast({ title: "Place at least one signature field", variant: "destructive" });
        return;
      }
      if (!file) {
        toast({ title: "Please re-upload the PDF", variant: "destructive" });
        return;
      }
      setGuestModal((m) => ({ ...m, open: true, step: "sender_info", error: "" }));
      return;
    }
    if (!doc) return;
    setSubmitting(true);
    try {
      // Persist final fields + settings
      const expiresIso = expiryDays > 0
        ? new Date(Date.now() + expiryDays * 24 * 3600 * 1000).toISOString()
        : null;
      await esignApi.update(doc.id, {
        expires_at: expiresIso,
        settings: {
          uuid_enabled: uuidEnabled,
          qr_enabled: true,
          brand_enabled: brandEnabled,
          email_owner_on_view: false,
          reminder_days: [3, 7, 14],
        },
        fields: fields.map((f) => ({
          signer_id: f.signer_id,
          page: f.page,
          x: f.x,
          y: f.y,
          width: f.width,
          height: f.height,
          field_type: f.field_type,
          required: f.required,
          label: f.label,
        })),
      });
      const ownerEmail = (user?.email || "").toLowerCase();
      const isSelfSignEligible =
        selfSign &&
        signers.length === 1 &&
        signers[0].email.trim().toLowerCase() === ownerEmail;
      const res = await esignApi.send(doc.id, isSelfSignEligible);
      clearAutosave(ESIGN_AUTOSAVE_KEY);
      if (isSelfSignEligible && res.self_sign_url) {
        toast({ title: "Ready to sign", description: "Opening signing page…" });
        router.push(res.self_sign_url);
        return;
      }
      toast({ title: `Sent to ${res.recipients} signer(s)`, description: "Email invitations are on the way." });
      router.push("/tools/esign/dashboard");
    } catch (e: any) {
      if (e.message === "AUTH_REQUIRED") {
        router.push(`/login?redirect=/tools/esign/edit/${doc.id}`);
        return;
      }
      toast({ title: "Could not send", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Guest: actually upload + verify ──
  const submitGuestSend = async () => {
    if (!file || signers.length !== 1) return;
    const sender_name = guestModal.senderName.trim();
    const sender_email = guestModal.senderEmail.trim().toLowerCase();
    if (!sender_name || !sender_email.includes("@")) {
      setGuestModal((m) => ({ ...m, error: "Please enter your name and a valid email." }));
      return;
    }
    if (sender_email === signers[0].email.trim().toLowerCase()) {
      setGuestModal((m) => ({
        ...m,
        error: "The sender and signer can't share an email. Want to sign yourself? Sign up for a free account.",
      }));
      return;
    }
    setGuestModal((m) => ({ ...m, submitting: true, error: "" }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append(
        "payload",
        JSON.stringify({
          title: title.trim() || "Untitled document",
          sender_name,
          sender_email,
          signer_name: signers[0].name.trim(),
          signer_email: signers[0].email.trim().toLowerCase(),
          signing_order: "parallel",
          fields: fields.map((f) => ({
            page: f.page, x: f.x, y: f.y, width: f.width, height: f.height,
            field_type: f.field_type, required: f.required, label: f.label || null,
          })),
        })
      );
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/esign/guest/documents`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const t = await res.text();
        try { const j = JSON.parse(t); throw new Error(j.detail || t); }
        catch { throw new Error(t || `HTTP ${res.status}`); }
      }
      const data = await res.json();
      setGuestModal((m) => ({
        ...m,
        submitting: false,
        error: "",
        step: "code_entry",
        verificationId: data.verification_id,
        expiresAt: data.expires_at,
        documentId: data.document_id,
      }));
      toast({
        title: "Check your inbox",
        description: `We sent a 6-digit code to ${sender_email} to confirm this send.`,
      });
    } catch (e: any) {
      setGuestModal((m) => ({ ...m, submitting: false, error: e.message || "Send failed" }));
    }
  };

  const verifyGuestCode = async () => {
    if (!guestModal.verificationId) return;
    const code = guestModal.code.trim();
    if (!/^\d{6}$/.test(code)) {
      setGuestModal((m) => ({ ...m, error: "Enter the 6-digit code from the email." }));
      return;
    }
    setGuestModal((m) => ({ ...m, submitting: true, error: "" }));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/esign/guest/documents/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verification_id: guestModal.verificationId, code }),
      });
      if (!res.ok) {
        const t = await res.text();
        try { const j = JSON.parse(t); throw new Error(j.detail || t); }
        catch { throw new Error(t || `HTTP ${res.status}`); }
      }
      const data = await res.json();
      clearAutosave(ESIGN_AUTOSAVE_KEY);
      setGuestModal((m) => ({
        ...m,
        submitting: false,
        step: "sent",
        claimToken: data.claim_token,
        documentId: data.document_id,
        error: "",
      }));
      toast({ title: "Document sent!", description: `${signers[0].name} will receive the signing email shortly.` });
    } catch (e: any) {
      setGuestModal((m) => ({ ...m, submitting: false, error: e.message || "Verification failed" }));
    }
  };
  // Active signer for placement
  const [activeSignerId, setActiveSignerId] = useState<string | null>(null);
  const signerOptions: Signer[] = doc?.signers || (signers.map((s, i) => ({
    id: `local-${i}`,
    name: s.name || "Signer",
    email: s.email,
    role: s.role,
    order_index: i,
    color: s.color,
    status: "pending",
  })) as Signer[]);
  useMemo(() => {
    if (signerOptions.length && !activeSignerId) {
      setActiveSignerId(signerOptions[0].id);
    }
  }, [signerOptions, activeSignerId]);

  // --- Render ---

  const minStep: WizardStep = initialDoc ? 2 : 1;
  const canBack = step > minStep && !submitting;
  const canForward = ((): boolean => {
    if (submitting) return false;
    if (step === 1) return !!file && !!title.trim();
    if (step === 2) return signers.every((s) => s.name.trim() && s.email.includes("@"));
    if (step === 3) return fields.length > 0;
    if (step === 4) return true;
    return false;
  })();

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      {/* Top progress bar */}
      <header className="bg-[#0B3D3D] text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.2em] text-[#C8A96E] uppercase font-medium">RealProfits eSign</div>
            <h1 className="text-lg font-semibold mt-0.5">{doc?.title || "New Document"}</h1>
          </div>
          <button
            onClick={() => router.push("/tools/esign/dashboard")}
            data-testid="exit-wizard"
            className="text-xs text-stone-300 hover:text-white transition-colors"
          >
            Exit
          </button>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-4">
          <div className="flex items-center gap-1">
            {STEPS.map((s, idx) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div
                    data-testid={`step-pip-${s.id}`}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      done ? "bg-[#C8A96E] text-[#0B3D3D]" :
                      active ? "bg-white text-[#0B3D3D] ring-2 ring-[#C8A96E]" :
                      "bg-[#165252] text-stone-400"
                    }`}
                  >
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div className={`ml-2 text-xs hidden sm:block ${active ? "text-white font-medium" : done ? "text-[#C8A96E]" : "text-stone-400"}`}>
                    {s.label}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-3 ${done ? "bg-[#C8A96E]" : "bg-[#165252]"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-6xl mx-auto px-6 py-8 pb-32">
        {step === 1 && (
          <WizardStepUpload
            title={title}
            setTitle={setTitle}
            file={file}
            onFile={handleFile}
          />
        )}

        {step === 2 && (
          <>
            <WizardStepSigners
              signers={signers}
              setSigners={setSigners}
              signingOrder={signingOrder}
              setSigningOrder={setSigningOrder}
              dragIdx={dragIdx}
              setDragIdx={setDragIdx}
              onAddSigner={addSigner}
              onUpdateSigner={updateSigner}
              onRemoveSigner={removeSigner}
            />
            {/* Self-sign affordance: only meaningful when the lone signer IS
                 the logged-in user. Saves an email round-trip. */}
            {user &&
              signers.length === 1 &&
              signers[0].email.trim().toLowerCase() === (user.email || "").toLowerCase() && (
                <div className="max-w-3xl mx-auto mt-4">
                  <label
                    className="flex items-start gap-3 p-4 bg-[#FAF5EE] border border-[#C8A96E] rounded-xl cursor-pointer hover:bg-[#F4ECD9]"
                    data-testid="self-sign-toggle"
                  >
                    <input
                      type="checkbox"
                      checked={selfSign}
                      onChange={(e) => setSelfSign(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#0B3D3D]"
                      data-testid="self-sign-checkbox"
                    />
                    <div>
                      <div className="text-sm font-semibold text-[#0B3D3D]">
                        Sign this myself — skip the email step
                      </div>
                      <div className="text-xs text-stone-700 mt-1">
                        We&apos;ll take you straight to the signing page once you click <b>Send</b>.
                        No email round-trip, and you can download the signed PDF immediately.
                      </div>
                    </div>
                  </label>
                </div>
              )}
          </>
        )}

        {step === 3 && (doc || (!user && file)) && (
          <section data-testid="step-3-fields">
            <h2 className="text-2xl font-semibold text-stone-900 mb-1">Place signature fields</h2>
            <p className="text-sm text-stone-600 mb-6">Pick a signer, pick a field type, then click on the document to drop a field.</p>
            <FieldPlacer
              pdfUrl={user && doc ? esignApi.originalUrl(doc.id) : localPdfUrl}
              signers={(doc?.signers as Signer[]) || (signers.map((s, i) => ({
                id: `local-${i}`,
                name: s.name || "Signer",
                email: s.email,
                role: s.role,
                order_index: i,
                color: s.color,
                status: "pending",
              })) as Signer[])}
              fields={fields}
              onChange={setFields}
              activeSignerId={activeSignerId}
              setActiveSignerId={setActiveSignerId}
            />
          </section>
        )}

        {step === 4 && (
          <WizardStepSettings
            docTitle={doc?.title || title || "Untitled document"}
            signerCount={signers.length}
            fieldCount={fields.length}
            signingOrder={signingOrder}
            expiryDays={expiryDays}
            setExpiryDays={setExpiryDays}
            uuidEnabled={uuidEnabled}
            setUuidEnabled={setUuidEnabled}
            brandEnabled={brandEnabled}
            setBrandEnabled={setBrandEnabled}
          />
        )}
      </main>

      {/* Footer action bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setStep((Math.max(minStep, step - 1)) as WizardStep)}
            disabled={!canBack}
            data-testid="wizard-back"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-700 rounded-md hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-xs text-stone-500">
            Step {step} of {STEPS.length}
          </div>
          {step < 4 ? (
            <button
              onClick={
                step === 1 ? uploadAndContinue :
                step === 2 ? saveSignersAndContinue :
                saveFieldsAndContinue
              }
              disabled={!canForward}
              data-testid="wizard-next"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Working…" : "Continue"} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={sendDocument}
              disabled={submitting}
              data-testid="wizard-send"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252] disabled:opacity-40"
            >
              <Send className="w-4 h-4" /> {submitting ? "Sending…" : selfSign ? "Sign now" : "Send for signing"}
            </button>
          )}
        </div>
      </footer>

      {/* Guest send + verification modal */}
      <GuestSendModal
        state={guestModal}
        setState={setGuestModal}
        signerName={signers[0]?.name || ""}
        signerEmail={signers[0]?.email || ""}
        onSubmit={submitGuestSend}
        onVerify={verifyGuestCode}
        onSignup={(reason) => {
          if (reason) {
            requireLoginAndPreserve(reason);
          } else {
            router.push(`/register?email=${encodeURIComponent(guestModal.senderEmail)}`);
          }
        }}
        onDone={() => {
          setGuestModal((m) => ({ ...m, open: false }));
          router.push("/");
        }}
      />
    </div>
  );
}

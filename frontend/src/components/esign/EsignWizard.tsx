"use client";
// 5-step wizard: Upload → Signers → Place Fields → Settings & Review → Send
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Users, MousePointer2, Settings as SettingsIcon, Send, ArrowLeft, ArrowRight, Plus, Trash2, FileText, GripVertical } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { esignApi, SIGNER_PALETTE, type DocumentDetail, type FieldType, type Signer } from "./api";
import { FieldPlacer } from "./FieldPlacer";
import { useAutosave, readAutosave, clearAutosave } from "@/hooks/useAutosave";

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

interface SignerDraft {
  name: string;
  email: string;
  role: "signer" | "approver" | "cc" | "witness";
  color: string;
}

interface FieldDraft {
  signer_id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  field_type: FieldType;
  required: boolean;
  label?: string;
  // local id for tracking
  _localId?: string;
}

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
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // ── Autosave ──
  // On mount (only when NOT editing an existing draft), try restoring a snapshot.
  useEffect(() => {
    if (initialDoc) return; // editing an existing draft — don't fight server state
    const snap = readAutosave<WizardAutosaveSnapshot>(ESIGN_AUTOSAVE_KEY);
    if (!snap || !snap.data) return;
    const d = snap.data;
    const hasMeaningful =
      (d.signers || []).some((s) => (s.name && s.email)) ||
      (d.fields || []).length > 0 ||
      (d.title && d.title.length > 0);
    if (!hasMeaningful) return;
    if (typeof d.step === "number" && d.step >= 1 && d.step <= 5) setStep(d.step as WizardStep);
    if (d.title) setTitle(d.title);
    if (d.signers && d.signers.length > 0) setSigners(d.signers);
    if (d.signingOrder) setSigningOrder(d.signingOrder);
    if (typeof d.expiryDays === "number") setExpiryDays(d.expiryDays);
    if (typeof d.brandEnabled === "boolean") setBrandEnabled(d.brandEnabled);
    if (typeof d.uuidEnabled === "boolean") setUuidEnabled(d.uuidEnabled);
    if (d.fields) setFields(d.fields);
    setTimeout(() => {
      toast({
        title: "Draft restored",
        description: "We kept the document you were preparing. Click Send when you're ready.",
      });
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    enabled: true, // works for guests too — survives accidental tab close
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
      toast({ title: user ? "Document uploaded" : "Document ready — add your signer" });
    } catch (e: any) {
      if (e.message === "AUTH_REQUIRED") {
        router.push("/login?redirect=/tools/esign/new");
        return;
      }
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
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
  const [guestModal, setGuestModal] = useState<{
    open: boolean;
    senderName: string;
    senderEmail: string;
    code: string;
    verificationId: string | null;
    expiresAt: string | null;
    submitting: boolean;
    error: string;
    step: "sender_info" | "code_entry" | "sent";
    claimToken: string | null;
    documentId: string | null;
  }>({
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
      const res = await esignApi.send(doc.id);
      clearAutosave(ESIGN_AUTOSAVE_KEY);
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
          <section data-testid="step-1-upload" className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-stone-900 mb-1">Upload your document</h2>
            <p className="text-sm text-stone-600 mb-6">PDF only, up to 25 MB on the free plan.</p>

            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
              <label className="block text-sm font-medium text-stone-700 mb-1">Document title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Freelance Contract Q2"
                data-testid="doc-title-input"
                className="w-full px-3 py-2 border border-stone-300 rounded-md text-base focus:outline-none focus:border-[#0B3D3D] mb-4"
              />

              <label
                htmlFor="pdf-upload"
                data-testid="pdf-upload-zone"
                className="block border-2 border-dashed border-stone-300 rounded-lg p-10 text-center cursor-pointer hover:border-[#0B3D3D] transition-colors bg-stone-50/50"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFile(e.dataTransfer.files?.[0] || null);
                }}
              >
                <FileText className="w-10 h-10 mx-auto text-[#0B3D3D] mb-3" />
                <div className="text-base font-medium text-stone-800">
                  {file ? file.name : "Drag & drop your PDF here"}
                </div>
                <div className="text-sm text-stone-500 mt-1">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or click to choose a file"}
                </div>
                <input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFile(e.target.files?.[0] || null)}
                  className="hidden"
                  data-testid="pdf-upload-input"
                />
              </label>
            </div>
          </section>
        )}

        {step === 2 && (
          <section data-testid="step-2-signers" className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold text-stone-900 mb-1">Who needs to sign?</h2>
            <p className="text-sm text-stone-600 mb-6">Add up to 5 signers. Each will get a unique signing link by email.</p>

            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
              <div className="space-y-3">
                {signers.map((s, i) => {
                  const reorderable = signingOrder === "sequential";
                  return (
                    <div
                      key={i}
                      className={`grid grid-cols-12 gap-3 items-center rounded-md transition-colors ${
                        dragIdx === i ? "opacity-40" : ""
                      }`}
                      data-testid={`signer-row-${i}`}
                      draggable={reorderable}
                      onDragStart={(e) => {
                        if (!reorderable) return;
                        setDragIdx(i);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        if (!reorderable || dragIdx === null) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        if (!reorderable || dragIdx === null || dragIdx === i) return;
                        e.preventDefault();
                        const next = signers.slice();
                        const [moved] = next.splice(dragIdx, 1);
                        next.splice(i, 0, moved);
                        setSigners(next);
                        setDragIdx(null);
                      }}
                      onDragEnd={() => setDragIdx(null)}
                    >
                      <div className="col-span-1 flex items-center gap-1">
                        {reorderable && (
                          <button
                            type="button"
                            data-testid={`signer-drag-handle-${i}`}
                            className="p-1 text-stone-400 hover:text-stone-700 cursor-grab active:cursor-grabbing"
                            aria-label={`Drag signer ${i + 1} to reorder`}
                            title="Drag to reorder"
                          >
                            <GripVertical className="w-4 h-4" />
                          </button>
                        )}
                        <div
                          className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center"
                          style={{ background: s.color }}
                        >
                          {i + 1}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => updateSigner(i, { name: e.target.value })}
                        placeholder="Full name"
                        data-testid={`signer-name-${i}`}
                        className="col-span-4 px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:border-[#0B3D3D]"
                      />
                      <input
                        type="email"
                        value={s.email}
                        onChange={(e) => updateSigner(i, { email: e.target.value })}
                        placeholder="email@company.com"
                        data-testid={`signer-email-${i}`}
                        className="col-span-4 px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:border-[#0B3D3D]"
                      />
                      <select
                        value={s.role}
                        onChange={(e) => updateSigner(i, { role: e.target.value as any })}
                        data-testid={`signer-role-${i}`}
                        className="col-span-2 px-2 py-2 border border-stone-300 rounded-md text-xs focus:outline-none focus:border-[#0B3D3D]"
                      >
                        <option value="signer">Signer</option>
                        <option value="approver">Approver</option>
                        <option value="cc">CC</option>
                        <option value="witness">Witness</option>
                      </select>
                      <button
                        onClick={() => removeSigner(i)}
                        disabled={signers.length <= 1}
                        data-testid={`signer-remove-${i}`}
                        className="col-span-1 p-2 rounded-md text-stone-400 hover:text-[#B53D2F] hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={addSigner}
                data-testid="add-signer-btn"
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0B3D3D] border border-[#0B3D3D] rounded-md hover:bg-[#0B3D3D] hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" /> Add signer
              </button>

              {signers.length > 1 && (
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <label className="block text-sm font-medium text-stone-700 mb-2">Signing order</label>
                  <div className="flex gap-2">
                    {[
                      { id: "parallel" as const, label: "Anyone, any order", desc: "All signers notified at once" },
                      { id: "sequential" as const, label: "In order", desc: "One at a time — drag rows to reorder" },
                    ].map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setSigningOrder(o.id)}
                        data-testid={`signing-order-${o.id}`}
                        className={`flex-1 text-left p-3 rounded-md border transition-all ${
                          signingOrder === o.id
                            ? "border-[#0B3D3D] bg-[#FAF5EE]"
                            : "border-stone-200 hover:border-stone-400"
                        }`}
                      >
                        <div className="text-sm font-medium text-stone-900">{o.label}</div>
                        <div className="text-xs text-stone-600 mt-0.5">{o.desc}</div>
                      </button>
                    ))}
                  </div>
                  {signingOrder === "sequential" && (
                    <p className="mt-3 text-xs text-stone-500" data-testid="reorder-hint">
                      Drag the <GripVertical className="w-3 h-3 inline -mt-0.5" /> handle on any signer row to change the order.
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
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
          <section data-testid="step-4-settings" className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-stone-900 mb-1">Final settings</h2>
            <p className="text-sm text-stone-600 mb-6">Configure how this document behaves once sent.</p>

            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Expires in</label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                  data-testid="expiry-select"
                  className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:border-[#0B3D3D]"
                >
                  <option value={7}>7 days</option>
                  <option value={15}>15 days (recommended)</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={0}>No expiry</option>
                </select>
              </div>

              <label className="flex items-start gap-3 cursor-pointer" data-testid="setting-uuid">
                <input
                  type="checkbox"
                  checked={uuidEnabled}
                  onChange={(e) => setUuidEnabled(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#0B3D3D]"
                />
                <div>
                  <div className="text-sm font-medium text-stone-900">Show signer ID under each signature</div>
                  <div className="text-xs text-stone-600 mt-0.5">Adds a unique identifier under each signature for legal traceability.</div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer" data-testid="setting-brand">
                <input
                  type="checkbox"
                  checked={brandEnabled}
                  onChange={(e) => setBrandEnabled(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#0B3D3D]"
                />
                <div>
                  <div className="text-sm font-medium text-stone-900">"Powered by RealProfits" footer</div>
                  <div className="text-xs text-stone-600 mt-0.5">Free plans display this footer on signed PDFs. Pro removes it.</div>
                </div>
              </label>
            </div>

            <div className="mt-6 bg-[#FAF5EE] border border-[#C8A96E] rounded-xl p-5">
              <div className="text-sm font-semibold text-[#0B3D3D] mb-2">Ready to send</div>
              <ul className="text-sm text-stone-700 space-y-1">
                <li>• {doc?.title}</li>
                <li>• {signers.length} signer{signers.length !== 1 ? "s" : ""} ({signingOrder})</li>
                <li>• {fields.length} field{fields.length !== 1 ? "s" : ""} to fill</li>
                <li>• Expires {expiryDays > 0 ? `in ${expiryDays} days` : "never"}</li>
              </ul>
            </div>
          </section>
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
              <Send className="w-4 h-4" /> {submitting ? "Sending…" : "Send for signing"}
            </button>
          )}
        </div>
      </footer>

      {/* Guest send + verification modal */}
      {guestModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          data-testid="guest-send-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget && !guestModal.submitting && guestModal.step !== "sent") {
              setGuestModal((m) => ({ ...m, open: false }));
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            {guestModal.step === "sender_info" && (
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
                  value={guestModal.senderName}
                  onChange={(e) => setGuestModal((m) => ({ ...m, senderName: e.target.value, error: "" }))}
                />
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Your email (the sender)</label>
                <input
                  type="email"
                  data-testid="guest-sender-email"
                  className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:border-[#0B3D3D]"
                  placeholder="you@company.com"
                  value={guestModal.senderEmail}
                  onChange={(e) => setGuestModal((m) => ({ ...m, senderEmail: e.target.value, error: "" }))}
                />
                {guestModal.error && (
                  <p className="text-xs text-[#B53D2F] mt-2" data-testid="guest-send-error">{guestModal.error}</p>
                )}
                <div className="flex items-center justify-between gap-2 mt-5">
                  <button
                    onClick={() => setGuestModal((m) => ({ ...m, open: false }))}
                    disabled={guestModal.submitting}
                    data-testid="guest-cancel"
                    className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitGuestSend}
                    disabled={guestModal.submitting}
                    data-testid="guest-send-submit"
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252] disabled:opacity-40"
                  >
                    {guestModal.submitting ? "Sending…" : "Send verification code"}
                  </button>
                </div>
                <p className="text-[11px] text-stone-500 mt-4">
                  Want unlimited sends, a dashboard, multi-signer + witness/approver/CC?{" "}
                  <button
                    type="button"
                    data-testid="guest-signup-link"
                    className="font-semibold text-[#0B3D3D] underline underline-offset-2"
                    onClick={() => requireLoginAndPreserve("Continue with a free account to skip verification.")}
                  >
                    Sign up free
                  </button>{" "}
                  — your work is preserved.
                </p>
              </>
            )}
            {guestModal.step === "code_entry" && (
              <>
                <h3 className="text-lg font-semibold text-stone-900 mb-1">Enter the 6-digit code</h3>
                <p className="text-sm text-stone-600 mb-5">
                  We just emailed a code to <b>{guestModal.senderEmail}</b>. Enter it below to send the document.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  data-testid="guest-code-input"
                  className="w-full px-4 py-3 border-2 border-[#C8A96E] rounded-lg text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:border-[#0B3D3D]"
                  placeholder="••••••"
                  value={guestModal.code}
                  onChange={(e) => setGuestModal((m) => ({ ...m, code: e.target.value.replace(/\D/g, ""), error: "" }))}
                />
                {guestModal.error && (
                  <p className="text-xs text-[#B53D2F] mt-2" data-testid="guest-code-error">{guestModal.error}</p>
                )}
                <div className="flex items-center justify-between gap-2 mt-5">
                  <button
                    onClick={() => setGuestModal((m) => ({ ...m, step: "sender_info", code: "", error: "" }))}
                    disabled={guestModal.submitting}
                    data-testid="guest-back"
                    className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900"
                  >
                    Back
                  </button>
                  <button
                    onClick={verifyGuestCode}
                    disabled={guestModal.submitting || guestModal.code.length !== 6}
                    data-testid="guest-verify-submit"
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252] disabled:opacity-40"
                  >
                    {guestModal.submitting ? "Verifying…" : "Verify & send"}
                  </button>
                </div>
              </>
            )}
            {guestModal.step === "sent" && (
              <>
                <h3 className="text-lg font-semibold text-stone-900 mb-1">Sent — keep this safe</h3>
                <p className="text-sm text-stone-600 mb-3">
                  <b>{signers[0]?.name}</b> will receive the signing email at <b>{signers[0]?.email}</b>.
                </p>
                {guestModal.claimToken && guestModal.documentId && (
                  <div className="bg-[#FAF5EE] border border-[#C8A96E] rounded-md p-3 mb-3">
                    <p className="text-xs font-semibold text-stone-700 mb-1">Your tracking link</p>
                    <input
                      readOnly
                      data-testid="guest-tracking-url"
                      className="w-full px-2 py-1.5 text-xs bg-white border border-stone-300 rounded font-mono"
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/track/esign?d=${guestModal.documentId}&c=${guestModal.claimToken}`}
                    />
                    <p className="text-[10px] text-stone-500 mt-1">Bookmark this — it&apos;s the only way to check status without an account.</p>
                  </div>
                )}
                <p className="text-xs text-stone-500 mb-4">
                  Tip: <button
                    type="button"
                    data-testid="guest-signup-after-send"
                    onClick={() => router.push(`/register?email=${encodeURIComponent(guestModal.senderEmail)}`)}
                    className="font-semibold text-[#0B3D3D] underline underline-offset-2"
                  >
                    Sign up free
                  </button>{" "}
                  with this same email to see this document in your dashboard automatically.
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setGuestModal((m) => ({ ...m, open: false }));
                      router.push("/");
                    }}
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
      )}
    </div>
  );
}

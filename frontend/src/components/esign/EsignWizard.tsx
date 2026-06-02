"use client";
// 5-step wizard: Upload → Signers → Place Fields → Settings & Review → Send
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Upload, Users, MousePointer2, Settings as SettingsIcon, Send, ArrowLeft, ArrowRight, Plus, Trash2, FileText, GripVertical } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { esignApi, SIGNER_PALETTE, type DocumentDetail, type FieldType, type Signer } from "./api";
import { FieldPlacer } from "./FieldPlacer";

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

  const uploadAndContinue = async () => {
    if (!file || !title.trim()) return;
    setSubmitting(true);
    try {
      const result = await esignApi.upload(title.trim(), file);
      setDoc(result);
      setStep(2);
      toast({ title: "Document uploaded" });
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
    setSigners(signers.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const removeSigner = (i: number) => {
    if (signers.length <= 1) return;
    setSigners(signers.filter((_, idx) => idx !== i));
  };

  const saveSignersAndContinue = async () => {
    if (!doc) return;
    const invalid = signers.find((s) => !s.name.trim() || !s.email.includes("@"));
    if (invalid) {
      toast({ title: "Every signer needs a name and valid email", variant: "destructive" });
      return;
    }
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
    if (!doc) return;
    if (fields.length === 0) {
      toast({ title: "Place at least one signature field", variant: "destructive" });
      return;
    }
    setStep(4);
  };

  // --- Step 5: Send ---

  const sendDocument = async () => {
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

  // Active signer for placement
  const [activeSignerId, setActiveSignerId] = useState<string | null>(null);
  const signerOptions: Signer[] = doc?.signers || [];
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

        {step === 3 && doc && (
          <section data-testid="step-3-fields">
            <h2 className="text-2xl font-semibold text-stone-900 mb-1">Place signature fields</h2>
            <p className="text-sm text-stone-600 mb-6">Pick a signer, pick a field type, then click on the document to drop a field.</p>
            <FieldPlacer
              pdfUrl={esignApi.originalUrl(doc.id)}
              signers={doc.signers}
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
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { Plus, Trash2, Upload, X, Paperclip, FileText, Save, Send, Link2, Copy, Download, FilePlus } from "lucide-react";
import type { InvoiceData, ClientData, LineItem, InvoiceAttachment, BankDetails } from "./types";
import { UNITS, getCurrencySymbol, calcTotals, EMPTY_BANK_DETAILS, hasBankDetails } from "./types";

interface EditorProps {
  inv: InvoiceData;
  setInv: React.Dispatch<React.SetStateAction<InvoiceData>>;
  clients: ClientData[];
  editingId: string | null;
  onSaveAsClient: () => void;
  onRecordPayment: () => void;
  onLogoUpload: (file: File) => void;
  onUploadAttachment: (file: File) => Promise<void>;
  onDeleteAttachment: (attachmentId: string) => Promise<void>;
  // Top-right action toolbar handlers (Issue #7)
  onNewInvoice: () => void;
  onDuplicate: () => void;
  onSave: () => void;
  onSendEmail: () => void;
  onShare: () => void;
  onExportCSV: () => void;
  onDownloadPDF: () => void;
  // Bank details default-set helpers (optional)
  settings?: { bank_details?: BankDetails | null } | null;
  onSaveDefaultBank?: (bd: BankDetails) => void;
}

const lbl = "text-[11px] font-semibold text-[#6E6B63] uppercase tracking-wider mb-1 block";
const inp = "w-full bg-[#F9F8F5] border border-[#E2DDD4] rounded-md px-3 py-2 text-sm text-[#1C1B18] focus:border-[#0B3D3D] focus:bg-white focus:outline-none transition-colors";
const fst = "text-[11px] font-bold text-[#0B3D3D] uppercase tracking-widest mb-3 flex items-center gap-2";
const section = "bg-white border border-[#E2DDD4] rounded-xl p-5 mb-3.5";

export function InvoiceEditor({
  inv, setInv, clients, editingId,
  onSaveAsClient, onRecordPayment, onLogoUpload,
  onUploadAttachment, onDeleteAttachment,
  onNewInvoice, onDuplicate, onSave, onSendEmail, onShare, onExportCSV, onDownloadPDF,
  settings, onSaveDefaultBank,
}: EditorProps) {
  const sym = getCurrencySymbol(inv.currency);
  const totals = calcTotals(inv);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState("");

  const set = (field: keyof InvoiceData, value: unknown) => setInv(prev => ({ ...prev, [field]: value }));
  const setItem = (id: string, field: keyof LineItem, value: unknown) => setInv(prev => ({ ...prev, items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i) }));
  const addItem = () => setInv(prev => ({ ...prev, items: [...prev.items, { id: Date.now().toString(), description: "", qty: 1, unit: "hr", rate: 0 }] }));
  const removeItem = (id: string) => setInv(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));

  const loadClient = (cid: string) => {
    const c = clients.find(cl => cl.id === cid);
    if (c) setInv(prev => ({ ...prev, client_id: c.id || "", client_name: c.name, client_company: c.company, client_email: c.email, client_address: c.address }));
  };

  // Status is now a passive label — it auto-updates on real actions
  // (sent on email send, paid/partial on record-payment, overdue on cron).
  const statusColors: Record<string, string> = {
    draft: "bg-gray-200 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-700",
    overdue: "bg-red-100 text-red-700",
    partial: "bg-amber-100 text-amber-700",
  };

  const paidTotal = inv.payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = Math.max(0, totals.total - paidTotal);
  const attachmentTotalBytes = inv.attachments.reduce((s, a) => s + a.size, 0);
  const attachmentLimitBytes = 25 * 1024 * 1024;
  const attachmentRemaining = Math.max(0, attachmentLimitBytes - attachmentTotalBytes);

  const handleAttachmentChoose = async (file: File | null | undefined) => {
    if (!file) return;
    setAttachmentError("");
    if (file.size > attachmentRemaining) {
      setAttachmentError(`File too large. Remaining: ${(attachmentRemaining / 1024 / 1024).toFixed(1)} MB.`);
      return;
    }
    setUploadingAttachment(true);
    try {
      await onUploadAttachment(file);
    } catch (e) {
      setAttachmentError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingAttachment(false);
    }
  };

  const fmtSize = (b: number): string => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const toolbarBtn = "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors";

  return (
    <div className="max-w-2xl mx-auto py-6 px-4" data-testid="invoice-editor">
      {/* Top-right action toolbar (Issue #7) */}
      <div className="flex flex-wrap items-center justify-end gap-2 mb-4" data-testid="invoice-top-toolbar">
        <button onClick={onNewInvoice} className={`${toolbarBtn} text-[#0B3D3D] bg-white border-[#E2DDD4] hover:bg-[#F9F8F5]`} data-testid="toolbar-new-invoice"><FilePlus className="w-3.5 h-3.5" /> New</button>
        <button onClick={onDuplicate} className={`${toolbarBtn} text-[#0B3D3D] bg-white border-[#E2DDD4] hover:bg-[#F9F8F5]`} data-testid="toolbar-duplicate"><Copy className="w-3.5 h-3.5" /> Duplicate</button>
        <button onClick={onSave} className={`${toolbarBtn} text-white bg-[#0B3D3D] border-[#0B3D3D] hover:bg-[#165252]`} data-testid="toolbar-save"><Save className="w-3.5 h-3.5" /> Save</button>
        <button onClick={onSendEmail} className={`${toolbarBtn} text-white bg-[#0B3D3D] border-[#0B3D3D] hover:bg-[#165252]`} data-testid="toolbar-send"><Send className="w-3.5 h-3.5" /> Send</button>
        <button onClick={onShare} className={`${toolbarBtn} text-[#0B3D3D] bg-white border-[#E2DDD4] hover:bg-[#F9F8F5]`} data-testid="toolbar-share"><Link2 className="w-3.5 h-3.5" /> Copy link</button>
        <button onClick={onDownloadPDF} className={`${toolbarBtn} text-[#0B3D3D] bg-white border-[#E2DDD4] hover:bg-[#F9F8F5]`} data-testid="toolbar-pdf"><Download className="w-3.5 h-3.5" /> PDF</button>
        <button onClick={onExportCSV} className={`${toolbarBtn} text-[#0B3D3D] bg-white border-[#E2DDD4] hover:bg-[#F9F8F5]`} data-testid="toolbar-csv"><Download className="w-3.5 h-3.5" /> CSV</button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-[#1C1B18] tracking-tight">{editingId ? "Edit Invoice" : "Create Invoice"}</h1>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[inv.status]}`} data-testid="status-label" title="Status changes automatically based on send and payment actions">
            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Invoice Details */}
      <div className={section}>
        <p className={fst}>Invoice Details</p>
        <div className="grid grid-cols-3 gap-3">
          <div><label className={lbl}>Invoice Number</label><input className={inp} value={inv.invoice_number} onChange={e => set("invoice_number", e.target.value)} data-testid="inv-number" /></div>
          <div><label className={lbl}>Invoice Date</label><input type="date" className={inp} value={inv.date} onChange={e => set("date", e.target.value)} data-testid="inv-date" /></div>
          <div><label className={lbl}>Due Date</label><input type="date" className={inp} value={inv.due_date} onChange={e => set("due_date", e.target.value)} data-testid="inv-due-date" /></div>
        </div>
      </div>

      {/* Your Business */}
      <div className={section}>
        <p className={fst}><Upload className="w-3.5 h-3.5" /> Your Business</p>
        {/* Logo Upload */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#E2DDD4]">
          <div className="w-16 h-16 rounded-lg border-2 border-dashed border-[#E2DDD4] flex items-center justify-center overflow-hidden bg-[#F9F8F5] flex-shrink-0">
            {inv.logo_url ? (
              <img src={inv.logo_url} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Upload className="w-5 h-5 text-[#C4C0B6]" />
            )}
          </div>
          <div>
            <label className={lbl}>Business Logo</label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-xs font-semibold text-[#0B3D3D] hover:text-[#C8A96E] transition-colors">
                {inv.logo_url ? "Change Logo" : "Upload Logo"}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onLogoUpload(f); }} data-testid="logo-upload-input" />
              </label>
              {inv.logo_url && (
                <button onClick={() => set("logo_url", "")} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              )}
            </div>
            <p className="text-[10px] text-[#C4C0B6] mt-0.5">PNG, JPEG, WebP or SVG (max 2MB)</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={lbl}>Business Name</label><input className={inp} value={inv.business_name} onChange={e => set("business_name", e.target.value)} data-testid="biz-name" /></div>
          <div><label className={lbl}>Email</label><input type="email" className={inp} value={inv.business_email} onChange={e => set("business_email", e.target.value)} data-testid="biz-email" /></div>
          <div><label className={lbl}>Phone</label><input className={inp} value={inv.business_phone} onChange={e => set("business_phone", e.target.value)} data-testid="biz-phone" /></div>
          <div><label className={lbl}>Accent Color</label><div className="flex gap-2"><input type="color" className="w-10 h-9 rounded cursor-pointer border border-[#E2DDD4]" value={inv.accent_color} onChange={e => set("accent_color", e.target.value)} /><input className={inp + " flex-1"} value={inv.accent_color} onChange={e => set("accent_color", e.target.value)} /></div></div>
          <div className="col-span-2"><label className={lbl}>Address</label><textarea className={inp + " min-h-[60px] resize-y"} value={inv.business_address} onChange={e => set("business_address", e.target.value)} data-testid="biz-address" /></div>
        </div>
      </div>

      {/* Bill To */}
      <div className={section}>
        <p className={fst}>Bill To</p>
        {clients.length > 0 && (
          <div className="mb-3">
            <label className={lbl}>Load Saved Client</label>
            <select className={inp} value={inv.client_id} onChange={e => loadClient(e.target.value)} data-testid="client-select">
              <option value="">-- Select client --</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
            </select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div><label className={lbl}>Client Name</label><input className={inp} value={inv.client_name} onChange={e => set("client_name", e.target.value)} data-testid="client-name" /></div>
          <div><label className={lbl}>Company</label><input className={inp} value={inv.client_company} onChange={e => set("client_company", e.target.value)} data-testid="client-company" /></div>
          <div className="col-span-2"><label className={lbl}>Email</label><input type="email" className={inp} value={inv.client_email} onChange={e => set("client_email", e.target.value)} data-testid="client-email" /></div>
          <div className="col-span-2"><label className={lbl}>Address</label><textarea className={inp + " min-h-[60px] resize-y"} value={inv.client_address} onChange={e => set("client_address", e.target.value)} data-testid="client-address" /></div>
        </div>
        <button onClick={onSaveAsClient} className="mt-2 text-xs font-semibold text-[#0B3D3D] hover:text-[#C8A96E] transition-colors" data-testid="save-as-client">+ Save as Client</button>
      </div>

      {/* Line Items */}
      <div className={section}>
        <p className={fst}>Line Items</p>
        <div className="grid grid-cols-[1fr_60px_70px_80px_80px_32px] gap-2 text-[10px] font-bold text-[#6E6B63] uppercase tracking-wider mb-2 px-1">
          <span>Description</span><span>Qty</span><span>Unit</span><span>Rate</span><span>Amount</span><span></span>
        </div>
        {inv.items.map(item => (
          <div key={item.id} className="grid grid-cols-[1fr_60px_70px_80px_80px_32px] gap-2 mb-2 items-center" data-testid={`line-item-${item.id}`}>
            <input className={inp} placeholder="Description" value={item.description} onChange={e => setItem(item.id, "description", e.target.value)} />
            <input type="number" min="0" step="0.5" className={inp + " text-center"} value={item.qty} onChange={e => setItem(item.id, "qty", parseFloat(e.target.value) || 0)} />
            <select className={inp + " px-1"} value={item.unit} onChange={e => setItem(item.id, "unit", e.target.value)}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" min="0" step="0.01" className={inp + " text-right"} value={item.rate} onChange={e => setItem(item.id, "rate", parseFloat(e.target.value) || 0)} />
            <span className="text-sm font-semibold text-[#1C1B18] text-right pr-1">{sym}{(item.qty * item.rate).toFixed(2)}</span>
            <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"><X className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        <button onClick={addItem} className="mt-2 w-full border-2 border-dashed border-[#E2DDD4] rounded-lg py-2.5 text-sm font-semibold text-[#6E6B63] hover:border-[#0B3D3D] hover:text-[#0B3D3D] transition-colors flex items-center justify-center gap-1.5" data-testid="add-item-btn"><Plus className="w-4 h-4" /> Add Item</button>
      </div>

      {/* Discount / Tax / Totals */}
      <div className={section}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className={lbl}>Discount</label>
            <div className="flex gap-1.5">
              <div className="flex rounded-md overflow-hidden border border-[#E2DDD4]">
                <button onClick={() => set("discount_type", "%")} className={`px-2.5 py-1.5 text-xs font-bold ${inv.discount_type === "%" ? "bg-[#0B3D3D] text-white" : "bg-[#F9F8F5] text-[#6E6B63]"}`}>%</button>
                <button onClick={() => set("discount_type", "$")} className={`px-2.5 py-1.5 text-xs font-bold ${inv.discount_type === "$" ? "bg-[#0B3D3D] text-white" : "bg-[#F9F8F5] text-[#6E6B63]"}`}>{sym}</button>
              </div>
              <input type="number" min="0" className={inp + " flex-1"} value={inv.discount_value} onChange={e => set("discount_value", parseFloat(e.target.value) || 0)} data-testid="discount-value" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={lbl}>Tax Label</label><input className={inp} value={inv.tax_label} onChange={e => set("tax_label", e.target.value)} /></div>
            <div><label className={lbl}>Tax Rate (%)</label><input type="number" min="0" step="0.1" className={inp} value={inv.tax_rate} onChange={e => set("tax_rate", parseFloat(e.target.value) || 0)} data-testid="tax-rate" /></div>
          </div>
        </div>

        <div className="space-y-2 border-t border-[#E2DDD4] pt-3">
          <div className="flex justify-between text-sm"><span className="text-[#6E6B63]">Subtotal</span><span className="font-medium">{sym}{totals.subtotal.toFixed(2)}</span></div>
          {totals.discount_amount > 0 && <div className="flex justify-between text-sm"><span className="text-[#6E6B63]">Discount</span><span className="text-red-600 font-medium">-{sym}{totals.discount_amount.toFixed(2)}</span></div>}
          {totals.tax_amount > 0 && <div className="flex justify-between text-sm"><span className="text-[#6E6B63]">{inv.tax_label}</span><span className="font-medium">{sym}{totals.tax_amount.toFixed(2)}</span></div>}
          <div className="flex justify-between text-base font-bold border-t border-[#E2DDD4] pt-2"><span>Total</span><span className="text-[#0B3D3D]">{sym}{totals.total.toFixed(2)}</span></div>
          {paidTotal > 0 && <div className="flex justify-between text-sm font-semibold text-amber-700"><span>Outstanding Balance</span><span>{sym}{outstanding.toFixed(2)}</span></div>}
        </div>
      </div>

      {/* Notes & Terms */}
      <div className={section}>
        <p className={fst}>Notes & Terms</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={lbl}>Notes</label><textarea className={inp + " min-h-[80px] resize-y"} placeholder="Additional notes..." value={inv.notes} onChange={e => set("notes", e.target.value)} data-testid="inv-notes" /></div>
          <div><label className={lbl}>Payment Terms</label><textarea className={inp + " min-h-[80px] resize-y"} placeholder="Net 30, etc." value={inv.payment_terms} onChange={e => set("payment_terms", e.target.value)} data-testid="inv-terms" /></div>
        </div>
      </div>

      {/* Payment Link */}
      <div className={section}>
        <p className={fst}>Payment Link</p>
        <label className={lbl}>Payment URL (shown as QR code on invoice)</label>
        <input type="url" className={inp} placeholder="https://pay.me/..." value={inv.payment_link} onChange={e => set("payment_link", e.target.value)} data-testid="payment-link" />
        <p className="text-xs text-[#6E6B63] mt-1.5">Leave empty if you prefer to share bank details below.</p>
      </div>

      {/* Bank / ACH details — shown on the public invoice page + PDF when no payment link is provided */}
      <div className={section}>
        <div className="flex items-center justify-between">
          <p className={fst} style={{ marginBottom: 0 }}>Bank / ACH details</p>
          <button
            type="button"
            data-testid="copy-default-bank-btn"
            onClick={async () => {
              try {
                const settings = await (await import("./api")).invoiceApi.list();
                void settings; // silence unused warn — we already have settings via parent; we won't fetch here.
              } catch { /* noop */ }
            }}
            className="hidden"
          />
        </div>
        <p className="text-xs text-[#6E6B63] mb-3">Optional — shown to clients when no payment link is set, so they can make an ACH / bank transfer / PayPal payment.</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={lbl}>Bank Name</label><input className={inp} placeholder="Chase, Wells Fargo..." value={inv.bank_details?.bank_name || ""} onChange={e => set("bank_details", { ...(inv.bank_details || EMPTY_BANK_DETAILS), bank_name: e.target.value })} data-testid="bank-name" /></div>
          <div><label className={lbl}>Account Holder</label><input className={inp} placeholder="As on the bank account" value={inv.bank_details?.account_holder || ""} onChange={e => set("bank_details", { ...(inv.bank_details || EMPTY_BANK_DETAILS), account_holder: e.target.value })} data-testid="bank-holder" /></div>
          <div><label className={lbl}>Account Number / IBAN</label><input className={inp} placeholder="123456789" value={inv.bank_details?.account_number || ""} onChange={e => set("bank_details", { ...(inv.bank_details || EMPTY_BANK_DETAILS), account_number: e.target.value })} data-testid="bank-account" /></div>
          <div><label className={lbl}>Routing / SWIFT / IFSC</label><input className={inp} placeholder="ABA / SWIFT / IFSC" value={inv.bank_details?.routing_number || ""} onChange={e => set("bank_details", { ...(inv.bank_details || EMPTY_BANK_DETAILS), routing_number: e.target.value })} data-testid="bank-routing" /></div>
          <div><label className={lbl}>Account Type</label>
            <select className={inp} value={inv.bank_details?.account_type || ""} onChange={e => set("bank_details", { ...(inv.bank_details || EMPTY_BANK_DETAILS), account_type: e.target.value })} data-testid="bank-type">
              <option value="">—</option>
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
              <option value="Business">Business</option>
            </select>
          </div>
          <div><label className={lbl}>PayPal / Venmo / Zelle</label><input className={inp} placeholder="@handle or email" value={inv.bank_details?.paypal || ""} onChange={e => set("bank_details", { ...(inv.bank_details || EMPTY_BANK_DETAILS), paypal: e.target.value })} data-testid="bank-paypal" /></div>
        </div>
        <label className={lbl + " mt-3 block"}>Notes</label>
        <textarea className={inp + " min-h-[60px] resize-y"} placeholder="e.g. Bank address, reference number, anything else the payer needs" value={inv.bank_details?.notes || ""} onChange={e => set("bank_details", { ...(inv.bank_details || EMPTY_BANK_DETAILS), notes: e.target.value })} data-testid="bank-notes" />
        {settings?.bank_details && hasBankDetails(settings.bank_details) && !hasBankDetails(inv.bank_details) && (
          <button
            type="button"
            data-testid="use-default-bank-btn"
            onClick={() => set("bank_details", { ...(settings!.bank_details as BankDetails) })}
            className="mt-3 text-xs font-semibold text-[#0B3D3D] underline underline-offset-2"
          >
            Use my saved default bank details
          </button>
        )}
        {hasBankDetails(inv.bank_details) && (
          <button
            type="button"
            data-testid="save-default-bank-btn"
            onClick={() => onSaveDefaultBank?.(inv.bank_details)}
            className="mt-3 ml-3 text-xs font-semibold text-[#0B3D3D] underline underline-offset-2"
          >
            Save as my default for future invoices
          </button>
        )}
      </div>

      {/* Partial Payments */}
      <div className={section}>
        <p className={fst}>Partial Payments</p>
        {inv.payments.length === 0 ? (
          <p className="text-sm text-[#6E6B63]">No payments recorded yet.</p>
        ) : (
          <div className="space-y-2 mb-3">
            {inv.payments.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-[#F9F8F5] rounded-lg px-3 py-2 text-sm">
                <span className="font-semibold text-emerald-700">{sym}{p.amount.toFixed(2)}</span>
                <span className="text-[#6E6B63]">{p.date}</span>
                {p.note && <span className="text-[#6E6B63] text-xs">{p.note}</span>}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">Outstanding: <span className={outstanding > 0 ? "text-amber-700" : "text-emerald-700"}>{sym}{outstanding.toFixed(2)}</span></span>
          <button onClick={onRecordPayment} className="bg-[#0B3D3D] text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-[#165252] transition-colors" data-testid="record-payment-btn">Record Payment</button>
        </div>
      </div>

      {/* Attachments (Issue #3) */}
      <div className={section}>
        <p className={fst}><Paperclip className="w-3.5 h-3.5" /> Attachments</p>
        <p className="text-xs text-[#6E6B63] mb-3">
          Attach contracts, work proofs, PDFs or images that should be emailed along with this invoice. Max 25 MB total.
        </p>

        {inv.attachments.length > 0 && (
          <div className="space-y-1.5 mb-3" data-testid="attachment-list">
            {inv.attachments.map((a: InvoiceAttachment) => (
              <div key={a.id} className="flex items-center justify-between bg-[#F9F8F5] rounded-md px-3 py-2 text-sm" data-testid={`attachment-${a.id}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-[#0B3D3D] flex-shrink-0" />
                  <span className="font-medium truncate text-[#1C1B18]">{a.filename}</span>
                  <span className="text-[11px] text-[#9A968B] flex-shrink-0">{fmtSize(a.size)}</span>
                </div>
                <button
                  onClick={() => onDeleteAttachment(a.id)}
                  className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                  data-testid={`attachment-delete-${a.id}`}
                  aria-label={`Remove ${a.filename}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <label
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md cursor-pointer transition-colors text-[#0B3D3D] bg-white border border-[#0B3D3D] hover:bg-[#F9F8F5]`}
            data-testid="attachment-upload-label"
          >
            <Upload className="w-3.5 h-3.5" /> {uploadingAttachment ? "Uploading…" : "Add Attachment"}
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.gif,.docx,.xlsx,.csv,.txt"
              className="hidden"
              disabled={uploadingAttachment}
              onChange={e => handleAttachmentChoose(e.target.files?.[0])}
              data-testid="attachment-input"
            />
          </label>
          <span className="text-[11px] text-[#9A968B]">
            {fmtSize(attachmentTotalBytes)} / 25 MB used
          </span>
        </div>
        {attachmentError && (
          <p className="text-xs text-red-600 mt-2" data-testid="attachment-error">{attachmentError}</p>
        )}
      </div>

      {/* Recurring */}
      <div className={section}>
        <p className={fst}>Recurring Invoice</p>
        <div className="flex items-center gap-3 mb-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={inv.recurring} onChange={e => set("recurring", e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#0B3D3D] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
          </label>
          <span className="text-sm text-[#1C1B18]">Enable recurring billing</span>
        </div>
        {inv.recurring && (
          <div>
            <label className={lbl}>Billing Period</label>
            <select className={inp} value={inv.recurring_period} onChange={e => set("recurring_period", e.target.value)} data-testid="recurring-period">
              {["Weekly", "Bi-weekly", "Monthly", "Quarterly", "Annually"].map(p => <option key={p} value={p.toLowerCase()}>{p}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

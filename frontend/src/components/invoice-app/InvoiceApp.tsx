"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { InvoiceSidebar } from "./InvoiceSidebar";
import { InvoiceEditor } from "./InvoiceEditor";
import { ClientsTab } from "./ClientsTab";
import { HistoryTab } from "./HistoryTab";
import { InvoicePreviewPanel } from "./InvoicePreviewPanel";
import { invoiceApi, clientApi } from "./api";
import { defaultInvoice, calcTotals } from "./types";
import type { InvoiceData, ClientData } from "./types";

export function InvoiceApp() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"editor" | "clients" | "history">("editor");
  const [inv, setInv] = useState<InvoiceData>({ ...defaultInvoice });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [invoices, setInvoices] = useState<{ id: string; invoice_number: string; client_name: string; client_company?: string; status: string; total: number; currency: string; date: string; due_date: string }[]>([]);
  const [stats, setStats] = useState({ total_count: 0, paid_count: 0, overdue_count: 0, total_revenue: 0 });
  const [showEsignCrossPromo, setShowEsignCrossPromo] = useState(false);

  // Modal states
  const [clientModal, setClientModal] = useState<{ open: boolean; editing: ClientData | null }>({ open: false, editing: null });
  const [paymentModal, setPaymentModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/tools/invoice");
    }
  }, [user, authLoading, router]);

  // Load data on mount
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [cl, inv, st] = await Promise.all([clientApi.list(), invoiceApi.list(), invoiceApi.stats()]);
      setClients(cl);
      setInvoices(inv);
      setStats(st);
      // Load saved settings (logo)
      try {
        const settings = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/settings`, { credentials: "include" }).then(r => r.json());
        if (settings.logo_url) setInv(prev => ({ ...prev, logo_url: settings.logo_url }));
      } catch {}
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "AUTH_REQUIRED") return;
      console.error("Failed to load data:", err);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  if (authLoading) {
    return <div className="h-screen flex items-center justify-center bg-[#F5F3EE]"><div className="animate-spin w-8 h-8 border-4 border-[#0B3D3D] border-t-transparent rounded-full" /></div>;
  }
  if (!user) return null;

  // ── Actions ──
  const handleNewInvoice = () => {
    const nextNum = `INV-${String(invoices.length + 1).padStart(3, "0")}`;
    setInv({ ...defaultInvoice, invoice_number: nextNum });
    setEditingId(null);
    setActiveTab("editor");
    toast({ title: "New invoice", description: "Form cleared — start fresh." });
  };

  const handleSave = async () => {
    const totals = calcTotals(inv);
    const data = { ...inv, ...totals };
    try {
      if (editingId) {
        await invoiceApi.update(editingId, data);
        toast({ title: "Invoice updated" });
      } else {
        const res = await invoiceApi.create(data);
        setEditingId(res.id);
        toast({ title: "Invoice saved" });
      }
      loadData();
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  const handleDuplicate = () => {
    const nextNum = `INV-${String(invoices.length + 1).padStart(3, "0")}`;
    setInv(prev => ({ ...prev, invoice_number: nextNum, status: "draft" as const, payments: [] }));
    setEditingId(null);
    toast({ title: "Duplicated — edit and save" });
  };

  const handleOpenInvoice = async (id: string) => {
    try {
      const doc = await invoiceApi.get(id);
      setInv(doc);
      setEditingId(id);
      setActiveTab("editor");
    } catch {
      toast({ title: "Failed to load invoice", variant: "destructive" });
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    try {
      await invoiceApi.delete(id);
      toast({ title: "Invoice deleted" });
      if (editingId === id) handleNewInvoice();
      loadData();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleSaveAsClient = async () => {
    const trimmedName = (inv.client_name || "").trim();
    const trimmedEmail = (inv.client_email || "").trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail);
    if (!trimmedName) { toast({ title: "Client name is required", variant: "destructive" }); return; }
    if (!emailValid) { toast({ title: "Enter a valid client email before saving", variant: "destructive" }); return; }
    try {
      await clientApi.create({ name: trimmedName, company: (inv.client_company || "").trim(), email: trimmedEmail, address: (inv.client_address || "").trim() });
      toast({ title: "Client saved" });
      loadData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save client";
      toast({ title: msg, variant: "destructive" });
    }
  };

  const handleLoadClient = (c: ClientData) => {
    setInv(prev => ({ ...prev, client_id: c.id || "", client_name: c.name, client_company: c.company, client_email: c.email, client_address: c.address }));
    setActiveTab("editor");
    toast({ title: `Loaded ${c.name}` });
  };

  const handleSaveClient = async (data: Partial<ClientData>, editId?: string) => {
    try {
      if (editId) {
        await clientApi.update(editId, data as ClientData);
        toast({ title: "Client updated" });
      } else {
        await clientApi.create(data);
        toast({ title: "Client added" });
      }
      setClientModal({ open: false, editing: null });
      loadData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save client";
      toast({ title: msg, variant: "destructive" });
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Delete this client?")) return;
    try {
      await clientApi.delete(id);
      toast({ title: "Client deleted" });
      loadData();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleRecordPayment = async (amount: number, date: string, note: string) => {
    if (!editingId) { toast({ title: "Save invoice first" }); return; }
    try {
      await invoiceApi.recordPayment(editingId, { amount, date, note });
      setInv(prev => {
        const newPayments = [...prev.payments, { amount, date, note }];
        const totals = calcTotals(prev);
        const paid = newPayments.reduce((s, p) => s + p.amount, 0);
        const newStatus: InvoiceData["status"] = paid >= totals.total ? "paid" : "partial";
        return { ...prev, payments: newPayments, status: newStatus };
      });
      setPaymentModal(false);
      toast({ title: "Payment recorded" });
      loadData();
    } catch {
      toast({ title: "Failed to record payment", variant: "destructive" });
    }
  };


  const handleLogoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/upload-logo`, {
        method: "POST", credentials: "include", body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setInv(prev => ({ ...prev, logo_url: data.logo_url }));
      toast({ title: "Logo uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  const handleSendEmail = async (recipientEmail: string, subject: string, message: string) => {
    if (!editingId) {
      // Save first then send
      const totals = calcTotals(inv);
      const data = { ...inv, ...totals };
      try {
        const res = await invoiceApi.create(data);
        setEditingId(res.id);
        await invoiceApi.sendEmail({ invoice_id: res.id, recipient_email: recipientEmail, subject, message });
        setEmailModal(false);
        toast({ title: "Invoice sent!", description: `Email sent to ${recipientEmail}` });
        loadData();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to send";
        toast({ title: "Failed to send", description: msg, variant: "destructive" });
      }
      return;
    }
    try {
      await invoiceApi.sendEmail({ invoice_id: editingId, recipient_email: recipientEmail, subject, message });
      setEmailModal(false);
      setInv(prev => ({ ...prev, status: "sent" }));
      toast({ title: "Invoice sent!", description: `Email sent to ${recipientEmail}` });
      loadData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to send email";
      toast({ title: "Failed to send email", description: msg, variant: "destructive" });
    }
  };

  const handleUploadAttachment = async (file: File) => {
    if (!editingId) throw new Error("Save the invoice first");
    const att = await invoiceApi.uploadAttachment(editingId, file);
    setInv(prev => ({ ...prev, attachments: [...prev.attachments, att] }));
    toast({ title: "Attachment added", description: file.name });
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!editingId) return;
    try {
      await invoiceApi.deleteAttachment(editingId, attachmentId);
      setInv(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.id !== attachmentId) }));
      toast({ title: "Attachment removed" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to remove attachment";
      toast({ title: "Failed", description: msg, variant: "destructive" });
    }
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) { toast({ title: "No invoices to export" }); return; }
    const headers = ["Invoice #", "Client", "Status", "Amount", "Currency", "Date", "Due Date"];
    const rows = invoices.map(i => [i.invoice_number, i.client_name, i.status, i.total, i.currency, i.date, i.due_date].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "invoices.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exported" });
  };

  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (!editingId) {
      toast({ title: "Save the invoice first", description: "Save before generating a shareable link.", variant: "destructive" });
      return;
    }
    try {
      const r = await invoiceApi.share(editingId);
      const url = r.public_url.startsWith("http") ? r.public_url : `${window.location.origin}${r.public_url}`;
      await navigator.clipboard.writeText(url).catch(() => {});
      toast({ title: "Share link copied", description: url });
    } catch (e: any) {
      toast({ title: "Could not generate share link", description: e.message, variant: "destructive" });
    }
  };

  const handleDownloadPDF = async () => {
    toast({ title: "Generating PDF..." });
    // Use jsPDF with pdf-brand
    try {
      const { jsPDF } = require("jspdf");
      const { drawHeader, drawFooter, BRAND, LM, PW } = require("@/lib/pdf-brand");
      const QRCode = (await import("qrcode")).default;
      const doc = new jsPDF();
      const sym = getCurrencySymbol(inv.currency);
      const totals = calcTotals(inv);

      let y = drawHeader(doc, "INVOICE", inv.invoice_number);

      // Business info
      doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
      doc.text(inv.business_name || "Your Business", LM, y); y += 5;
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
      if (inv.business_email) { doc.text(inv.business_email, LM, y); y += 4; }
      if (inv.business_phone) { doc.text(inv.business_phone, LM, y); y += 4; }
      y += 4;

      // Bill To
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.setTextColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
      doc.text("BILL TO", LM, y); y += 5;
      doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
      doc.text(inv.client_name || "Client", LM, y); y += 4;
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
      if (inv.client_email) { doc.text(inv.client_email, LM, y); y += 4; }
      y += 6;

      // Items table
      const cols = [80, 25, 35, 35];
      doc.setFillColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
      doc.roundedRect(LM, y, PW, 8, 1, 1, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      let x = LM + 3;
      ["Description", "Qty", "Rate", "Amount"].forEach((h, i) => { doc.text(h, x, y + 5.5); x += cols[i]; });
      y += 10;

      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      inv.items.forEach((item, ri) => {
        if (ri % 2 === 0) { doc.setFillColor(BRAND.light[0], BRAND.light[1], BRAND.light[2]); doc.rect(LM, y - 1, PW, 7, "F"); }
        doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
        x = LM + 3;
        doc.text((item.description || "Item").substring(0, 40), x, y + 4); x += cols[0];
        doc.text(`${item.qty} ${item.unit}`, x, y + 4); x += cols[1];
        doc.text(`${sym}${item.rate.toFixed(2)}`, x, y + 4); x += cols[2];
        doc.text(`${sym}${(item.qty * item.rate).toFixed(2)}`, x, y + 4);
        y += 7;
      });
      y += 4;

      // Totals
      const tx = LM + PW / 2 + 10;
      const vx = LM + PW;
      doc.setFontSize(8);
      doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
      doc.text("Subtotal:", tx, y); doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]); doc.text(`${sym}${totals.subtotal.toFixed(2)}`, vx - doc.getTextWidth(`${sym}${totals.subtotal.toFixed(2)}`), y); y += 5;
      if (totals.discount_amount > 0) { doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]); doc.text("Discount:", tx, y); doc.setTextColor(200, 50, 50); doc.text(`-${sym}${totals.discount_amount.toFixed(2)}`, vx - doc.getTextWidth(`-${sym}${totals.discount_amount.toFixed(2)}`), y); y += 5; }
      if (totals.tax_amount > 0) { doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]); doc.text(`${inv.tax_label}:`, tx, y); doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]); doc.text(`${sym}${totals.tax_amount.toFixed(2)}`, vx - doc.getTextWidth(`${sym}${totals.tax_amount.toFixed(2)}`), y); y += 5; }
      y += 2;
      doc.setFillColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
      doc.roundedRect(tx - 5, y - 3, vx - tx + 10, 11, 2, 2, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("TOTAL", tx, y + 5);
      const ts = `${sym}${totals.total.toFixed(2)}`;
      doc.text(ts, vx - doc.getTextWidth(ts), y + 5);
      y += 14;

      // Payments received + outstanding (Issue #6)
      const paidTotal = inv.payments.reduce((s, p) => s + p.amount, 0);
      const outstanding = Math.max(0, totals.total - paidTotal);
      if (inv.payments.length > 0) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        doc.setTextColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
        doc.text("PAYMENTS RECEIVED", LM, y); y += 5;
        doc.setFont("helvetica", "normal"); doc.setFontSize(8);
        doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
        inv.payments.forEach(p => {
          const lbl = `${p.date || "—"}${p.note ? ` · ${p.note}` : ""}`;
          const amt = `${sym}${p.amount.toFixed(2)}`;
          doc.text(lbl.substring(0, 60), LM, y);
          doc.setTextColor(42, 107, 69);
          doc.text(amt, vx - doc.getTextWidth(amt), y);
          doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
          y += 5;
        });
        y += 2;
        doc.setDrawColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]);
        doc.line(LM, y, LM + PW, y);
        y += 4;
        doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
        doc.text("Outstanding Balance", LM, y);
        const os = `${sym}${outstanding.toFixed(2)}`;
        doc.setTextColor(outstanding > 0 ? 160 : 42, outstanding > 0 ? 98 : 107, outstanding > 0 ? 26 : 69);
        doc.text(os, vx - doc.getTextWidth(os), y);
        y += 8;
      }

      drawFooter(doc);

      // Append a QR code to the public share page (auto-share if not yet shared)
      try {
        if (editingId) {
          let shareUrl = "";
          try {
            const r = await invoiceApi.share(editingId);
            shareUrl = r.public_url.startsWith("http") ? r.public_url : `${window.location.origin}${r.public_url}`;
          } catch {}
          if (shareUrl) {
            const qrDataUrl = await QRCode.toDataURL(shareUrl, { margin: 1, width: 220 });
            const qrSize = 28;
            const qrX = PW - LM - qrSize;
            const qrY = doc.internal.pageSize.getHeight() - qrSize - 28;
            doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
            doc.setFontSize(7);
            doc.setTextColor(110, 107, 99);
            doc.text("Scan to view or pay online", qrX + qrSize / 2, qrY + qrSize + 4, { align: "center" });
          }
        }
      } catch (qrErr) {
        console.warn("QR code generation skipped:", qrErr);
      }

      doc.save(`${inv.invoice_number || "invoice"}.pdf`);
      toast({ title: "PDF downloaded" });
      // Cross-promote eSign after download — highest-intent moment
      setShowEsignCrossPromo(true);
    } catch (err) {
      console.error("PDF error:", err);
      toast({ title: "PDF generation failed", variant: "destructive" });
    }
  };

  // Need to import getCurrencySymbol here since it's used in handleDownloadPDF
  const { getCurrencySymbol } = require("./types");

  return (
    <div className="h-screen flex bg-[#F5F3EE] overflow-hidden" data-testid="invoice-app">
      {/* Sidebar */}
      <InvoiceSidebar
        activeTab={activeTab} setActiveTab={setActiveTab}
        currency={inv.currency} setCurrency={c => setInv(prev => ({ ...prev, currency: c }))}
        onNewInvoice={handleNewInvoice}
        clientCount={clients.length} invoiceCount={invoices.length}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Tabs */}
          <div className="sticky top-0 z-10 bg-[#F5F3EE] border-b border-[#E2DDD4] px-6">
            <div className="flex gap-1">
              {(["editor", "clients", "history"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab ? "text-[#0B3D3D] border-[#0B3D3D]" : "text-[#6E6B63] border-transparent hover:text-[#1C1B18]"}`} data-testid={`tab-${tab}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {activeTab === "editor" && (
            <InvoiceEditor
              inv={inv}
              setInv={setInv}
              clients={clients}
              editingId={editingId}
              onSaveAsClient={handleSaveAsClient}
              onRecordPayment={() => setPaymentModal(true)}
              onLogoUpload={handleLogoUpload}
              onUploadAttachment={handleUploadAttachment}
              onDeleteAttachment={handleDeleteAttachment}
              onNewInvoice={handleNewInvoice}
              onDuplicate={handleDuplicate}
              onSave={handleSave}
              onSendEmail={() => setEmailModal(true)}
              onShare={handleShare}
              onExportCSV={handleExportCSV}
              onDownloadPDF={handleDownloadPDF}
            />
          )}
          {activeTab === "clients" && (
            <ClientsTab
              clients={clients}
              onAdd={() => setClientModal({ open: true, editing: null })}
              onEdit={c => setClientModal({ open: true, editing: c })}
              onDelete={handleDeleteClient}
              onLoad={handleLoadClient}
            />
          )}
          {activeTab === "history" && (
            <HistoryTab invoices={invoices} stats={stats} onOpen={handleOpenInvoice} onDelete={handleDeleteInvoice} onExportCSV={handleExportCSV} />
          )}
        </div>

        {/* Preview — only show on editor tab */}
        {activeTab === "editor" && (
          <InvoicePreviewPanel inv={inv} onPrint={handlePrint} onDownloadPDF={handleDownloadPDF} />
        )}
      </div>

      {/* Client Modal */}
      {clientModal.open && (
        <ClientModal
          editing={clientModal.editing}
          onSave={handleSaveClient}
          onClose={() => setClientModal({ open: false, editing: null })}
        />
      )}

      {/* Payment Modal */}
      {paymentModal && (
        <PaymentModal
          onRecord={handleRecordPayment}
          onClose={() => setPaymentModal(false)}
        />
      )}

      {/* Send Email Modal */}
      {emailModal && (
        <SendEmailModal
          defaultEmail={inv.client_email}
          invoiceNumber={inv.invoice_number}
          businessName={inv.business_name}
          onSend={handleSendEmail}
          onClose={() => setEmailModal(false)}
        />
      )}
      {/* eSign Cross-promo (high-intent: user just downloaded a PDF) */}
      {showEsignCrossPromo && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={() => setShowEsignCrossPromo(false)}>
          <div
            data-testid="esign-cross-promo-modal"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-[#0B3D3D] text-white p-5">
              <div className="text-[10px] tracking-[0.2em] uppercase text-[#C8A96E] font-semibold mb-1">One more thing…</div>
              <h3 className="text-xl font-bold">Need your client to sign this invoice?</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-stone-700 leading-relaxed mb-4">
                Use <b>RealProfits eSign</b> — free for up to 5 signers, full audit trail. Upload the PDF you just downloaded and have it signed in under 90 seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href="/tools/esign/new"
                  data-testid="cross-promo-esign-cta"
                  className="flex-1 px-4 py-2.5 bg-[#0B3D3D] text-white text-sm font-bold rounded-md hover:bg-[#165252] text-center"
                >
                  Sign with eSign →
                </a>
                <button
                  onClick={() => setShowEsignCrossPromo(false)}
                  data-testid="cross-promo-dismiss"
                  className="px-4 py-2.5 text-sm font-semibold text-stone-600 border border-stone-300 rounded-md hover:bg-stone-50"
                >
                  Maybe later
                </button>
              </div>
              <div className="text-[11px] text-stone-500 mt-3 text-center">
                100% free · 5 signers per doc · ESIGN Act + eIDAS compliant
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientModal({ editing, onSave, onClose }: { editing: ClientData | null; onSave: (data: Partial<ClientData>, editId?: string) => void; onClose: () => void }) {
  const [name, setName] = useState(editing?.name || "");
  const [company, setCompany] = useState(editing?.company || "");
  const [email, setEmail] = useState(editing?.email || "");
  const [address, setAddress] = useState(editing?.address || "");
  const [submitted, setSubmitted] = useState(false);
  const inp = "w-full bg-[#F9F8F5] border border-[#E2DDD4] rounded-md px-3 py-2 text-sm focus:border-[#0B3D3D] focus:outline-none";
  const inpErr = "w-full bg-[#FEF2F2] border border-red-400 rounded-md px-3 py-2 text-sm focus:border-red-600 focus:outline-none";

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail);
  const nameError = submitted && !trimmedName ? "Name is required" : "";
  const emailError = submitted && !trimmedEmail ? "Email is required" : submitted && !emailValid ? "Enter a valid email address" : "";
  const canSubmit = !!trimmedName && emailValid;

  const handleSave = () => {
    setSubmitted(true);
    if (!canSubmit) return;
    onSave({ name: trimmedName, company: company.trim(), email: trimmedEmail, address: address.trim() }, editing?.id);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" data-testid="client-modal">
        <h3 className="text-lg font-bold text-[#1C1B18] mb-4">{editing ? "Edit Client" : "Add Client"}</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Full Name *</label>
            <input className={nameError ? inpErr : inp} value={name} onChange={e => setName(e.target.value)} data-testid="modal-client-name" />
            {nameError && <p className="text-xs text-red-600 mt-1" data-testid="modal-client-name-error">{nameError}</p>}
          </div>
          <div><label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Company</label><input className={inp} value={company} onChange={e => setCompany(e.target.value)} /></div>
          <div>
            <label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Email *</label>
            <input type="email" className={emailError ? inpErr : inp} value={email} onChange={e => setEmail(e.target.value)} data-testid="modal-client-email" />
            {emailError && <p className="text-xs text-red-600 mt-1" data-testid="modal-client-email-error">{emailError}</p>}
          </div>
          <div><label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Address</label><textarea className={inp + " min-h-[60px]"} value={address} onChange={e => setAddress(e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#6E6B63] border border-[#E2DDD4] rounded-md hover:bg-[#F9F8F5]">Cancel</button>
          <button onClick={handleSave} disabled={submitted && !canSubmit} className="px-4 py-2 text-sm font-bold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252] disabled:bg-[#0B3D3D]/50 disabled:cursor-not-allowed" data-testid="modal-save-client">Save Client</button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({ onRecord, onClose }: { onRecord: (amount: number, date: string, note: string) => void; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const inp = "w-full bg-[#F9F8F5] border border-[#E2DDD4] rounded-md px-3 py-2 text-sm focus:border-[#0B3D3D] focus:outline-none";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" data-testid="payment-modal">
        <h3 className="text-lg font-bold text-[#1C1B18] mb-4">Record Payment</h3>
        <div className="space-y-3">
          <div><label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Amount *</label><input type="number" min="0" step="0.01" className={inp} value={amount} onChange={e => setAmount(e.target.value)} data-testid="modal-payment-amount" /></div>
          <div><label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Date</label><input type="date" className={inp} value={date} onChange={e => setDate(e.target.value)} /></div>
          <div><label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Note (optional)</label><input className={inp} value={note} onChange={e => setNote(e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#6E6B63] border border-[#E2DDD4] rounded-md hover:bg-[#F9F8F5]">Cancel</button>
          <button onClick={() => { const a = parseFloat(amount); if (a > 0) onRecord(a, date, note); }} className="px-4 py-2 text-sm font-bold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252]" data-testid="modal-record-payment">Record Payment</button>
        </div>
      </div>
    </div>
  );
}


function SendEmailModal({ defaultEmail, invoiceNumber, businessName, onSend, onClose }: { defaultEmail: string; invoiceNumber: string; businessName: string; onSend: (email: string, subject: string, message: string) => void; onClose: () => void }) {
  const [email, setEmail] = useState(defaultEmail);
  const [subject, setSubject] = useState(`Invoice ${invoiceNumber} from ${businessName || "RealProfits"}`);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const inp = "w-full bg-[#F9F8F5] border border-[#E2DDD4] rounded-md px-3 py-2 text-sm focus:border-[#0B3D3D] focus:outline-none";

  const handleSend = async () => {
    if (!email) return;
    setSending(true);
    await onSend(email, subject, message);
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" data-testid="send-email-modal">
        <h3 className="text-lg font-bold text-[#1C1B18] mb-1">Send Invoice by Email</h3>
        <p className="text-sm text-[#6E6B63] mb-4">Your client will receive a professional HTML email with invoice details.</p>
        <div className="space-y-3">
          <div><label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Recipient Email *</label><input type="email" className={inp} value={email} onChange={e => setEmail(e.target.value)} data-testid="modal-send-email" /></div>
          <div><label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Subject</label><input className={inp} value={subject} onChange={e => setSubject(e.target.value)} /></div>
          <div><label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Personal Message (optional)</label><textarea className={inp + " min-h-[80px]"} placeholder="Hi, please find your invoice attached..." value={message} onChange={e => setMessage(e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#6E6B63] border border-[#E2DDD4] rounded-md hover:bg-[#F9F8F5]">Cancel</button>
          <button onClick={handleSend} disabled={!email || sending} className="px-4 py-2 text-sm font-bold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252] disabled:opacity-50 flex items-center gap-2" data-testid="modal-send-email-btn">
            {sending ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : null}
            {sending ? "Sending..." : "Send Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}

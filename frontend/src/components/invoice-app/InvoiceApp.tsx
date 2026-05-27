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

  // Modal states
  const [clientModal, setClientModal] = useState<{ open: boolean; editing: ClientData | null }>({ open: false, editing: null });
  const [paymentModal, setPaymentModal] = useState(false);

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
    if (!inv.client_name || !inv.client_email) { toast({ title: "Client name and email required" }); return; }
    try {
      await clientApi.create({ name: inv.client_name, company: inv.client_company, email: inv.client_email, address: inv.client_address });
      toast({ title: "Client saved" });
      loadData();
    } catch {
      toast({ title: "Failed to save client", variant: "destructive" });
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
    } catch {
      toast({ title: "Failed to save client", variant: "destructive" });
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
      setInv(prev => ({ ...prev, payments: [...prev.payments, { amount, date, note }] }));
      setPaymentModal(false);
      toast({ title: "Payment recorded" });
      loadData();
    } catch {
      toast({ title: "Failed to record payment", variant: "destructive" });
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
  const handleDownloadPDF = () => {
    toast({ title: "Generating PDF..." });
    // Use jsPDF with pdf-brand
    try {
      const { jsPDF } = require("jspdf");
      const { drawHeader, drawFooter, BRAND, LM, PW } = require("@/lib/pdf-brand");
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

      drawFooter(doc);
      doc.save(`${inv.invoice_number || "invoice"}.pdf`);
      toast({ title: "PDF downloaded" });
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
        onNewInvoice={handleNewInvoice} onDuplicate={handleDuplicate}
        onSave={handleSave} onExportCSV={handleExportCSV}
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
            <InvoiceEditor inv={inv} setInv={setInv} clients={clients} onSaveAsClient={handleSaveAsClient} onRecordPayment={() => setPaymentModal(true)} />
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
    </div>
  );
}

// ── Modals ──

function ClientModal({ editing, onSave, onClose }: { editing: ClientData | null; onSave: (data: Partial<ClientData>, editId?: string) => void; onClose: () => void }) {
  const [name, setName] = useState(editing?.name || "");
  const [company, setCompany] = useState(editing?.company || "");
  const [email, setEmail] = useState(editing?.email || "");
  const [address, setAddress] = useState(editing?.address || "");
  const inp = "w-full bg-[#F9F8F5] border border-[#E2DDD4] rounded-md px-3 py-2 text-sm focus:border-[#0B3D3D] focus:outline-none";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" data-testid="client-modal">
        <h3 className="text-lg font-bold text-[#1C1B18] mb-4">{editing ? "Edit Client" : "Add Client"}</h3>
        <div className="space-y-3">
          <div><label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Full Name *</label><input className={inp} value={name} onChange={e => setName(e.target.value)} data-testid="modal-client-name" /></div>
          <div><label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Company</label><input className={inp} value={company} onChange={e => setCompany(e.target.value)} /></div>
          <div><label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Email *</label><input type="email" className={inp} value={email} onChange={e => setEmail(e.target.value)} data-testid="modal-client-email" /></div>
          <div><label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Address</label><textarea className={inp + " min-h-[60px]"} value={address} onChange={e => setAddress(e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#6E6B63] border border-[#E2DDD4] rounded-md hover:bg-[#F9F8F5]">Cancel</button>
          <button onClick={() => { if (!name || !email) return; onSave({ name, company, email, address }, editing?.id); }} className="px-4 py-2 text-sm font-bold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252]" data-testid="modal-save-client">Save Client</button>
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

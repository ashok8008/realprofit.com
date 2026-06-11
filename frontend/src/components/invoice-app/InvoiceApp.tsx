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
import type { InvoiceData, ClientData, InvoiceAttachment } from "./types";
import { useAutosave, readAutosave, clearAutosave } from "@/hooks/useAutosave";

const INVOICE_AUTOSAVE_KEY = "rp-autosave:invoice:current";

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
  // User-level settings — currently logo + default bank details.
  const [settings, setSettings] = useState<{ logo_url?: string; bank_details?: import("./types").BankDetails | null } | null>(null);

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
      // Load saved settings (logo + default bank details)
      try {
        const s = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/settings`, { credentials: "include" }).then(r => r.json());
        setSettings(s || null);
        if (s?.logo_url) setInv(prev => ({ ...prev, logo_url: s.logo_url }));
        // Auto-prefill bank details for new (un-saved) invoice if not already set.
        if (s?.bank_details && !inv.id && !inv.bank_details?.bank_name && !inv.bank_details?.account_number) {
          setInv(prev => ({ ...prev, bank_details: { ...s.bank_details } }));
        }
      } catch {}
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "AUTH_REQUIRED") {
        router.push("/login?redirect=/tools/invoice");
        return;
      }
      console.error("Failed to load data:", err);
    }
  }, [user, router]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Autosave / restore ──
  // 1. On mount, if there's a saved draft AND no invoice currently being edited,
  //    restore it (and show a toast giving the user a chance to discard).
  const [restoredDraftAt, setRestoredDraftAt] = useState<number | null>(null);
  useEffect(() => {
    if (editingId) return;
    const draft = readAutosave<InvoiceData>(INVOICE_AUTOSAVE_KEY);
    if (!draft) return;
    // Only restore if draft has any meaningful content beyond defaults.
    const hasContent = !!(draft.data.client_name || draft.data.client_email
      || draft.data.business_name || (draft.data.items || []).some(i => i.description));
    if (!hasContent) return;
    setInv(draft.data);
    setRestoredDraftAt(draft.ts);
    // Defer the toast until after the Toaster portal is mounted (next tick).
    setTimeout(() => {
      toast({
        title: "Draft restored",
        description: "We kept the invoice you were working on. Click Save to keep it permanently.",
      });
    }, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Autosave: localStorage every 5s, server every 30s (only for saved invoices being edited).
  useAutosave<InvoiceData>({
    key: INVOICE_AUTOSAVE_KEY,
    data: inv,
    enabled: !!user,
    localDebounceMs: 5000,
    remoteIntervalMs: 30_000,
    enableRemote: !!editingId,
    remoteSave: async (snapshot) => {
      if (!editingId) return;
      try {
        const totals = calcTotals(snapshot);
        await invoiceApi.update(editingId, { ...snapshot, ...totals });
      } catch { /* swallow — next tick retries */ }
    },
  });

  if (authLoading) {
    return <div className="h-screen flex items-center justify-center bg-[#F5F3EE]"><div className="animate-spin w-8 h-8 border-4 border-[#0B3D3D] border-t-transparent rounded-full" /></div>;
  }
  if (!user) return null;

  // ── Actions ──
  const handleNewInvoice = () => {
    const nextNum = `INV-${String(invoices.length + 1).padStart(3, "0")}`;
    setInv({ ...defaultInvoice, invoice_number: nextNum });
    setEditingId(null);
    setRestoredDraftAt(null);
    clearAutosave(INVOICE_AUTOSAVE_KEY);
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
      // Successful save — wipe the autosave snapshot so we don't restore it later.
      clearAutosave(INVOICE_AUTOSAVE_KEY);
      setRestoredDraftAt(null);
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
      const res = await invoiceApi.recordPayment(editingId, { amount, date, note });
      // Backend now returns authoritative invoice_status — trust it.
      setInv(prev => ({
        ...prev,
        payments: [...prev.payments, { amount, date, note }],
        status: (res.invoice_status || prev.status) as InvoiceData["status"],
      }));
      setPaymentModal(false);
      toast({ title: "Payment recorded", description: res.invoice_status === "paid" ? "Invoice marked as paid" : res.invoice_status === "partial" ? "Invoice marked as partial" : undefined });
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

  const handleSendEmail = async (recipientEmail: string, subject: string, message: string, cc: string[], bcc: string[], attachmentIds: string[]) => {
    let id = editingId;
    if (!id) {
      const totals = calcTotals(inv);
      const data = { ...inv, ...totals };
      try {
        const res = await invoiceApi.create(data);
        id = res.id;
        setEditingId(id);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to save";
        toast({ title: "Failed to save invoice", description: msg, variant: "destructive" });
        return;
      }
    }
    if (!id) {
      toast({ title: "Failed to save invoice", variant: "destructive" });
      return;
    }
    try {
      await invoiceApi.sendEmail({
        invoice_id: id, recipient_email: recipientEmail, subject, message,
        cc, bcc, include_attachment_ids: attachmentIds,
      });
      setEmailModal(false);
      setInv(prev => ({ ...prev, status: "sent" }));
      toast({ title: "Invoice sent!", description: `Email sent to ${recipientEmail}${bcc.length ? " (copy to you)" : ""}` });
      loadData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to send email";
      toast({ title: "Failed to send email", description: msg, variant: "destructive" });
    }
  };

  // ── Row-level actions on the Invoices (history) page ───
  const handleRowResend = async (id: string) => {
    await handleOpenInvoice(id);
    setEmailModal(true);
  };

  const handleRowMarkPaid = async (id: string) => {
    try {
      const full = await invoiceApi.get(id);
      const paidAlready = (full.payments || []).reduce((s: number, p: { amount: number }) => s + p.amount, 0);
      const outstanding = Math.max(0, (full.total || 0) - paidAlready);
      if (outstanding <= 0) {
        toast({ title: "Already fully paid" });
        return;
      }
      const today = new Date().toISOString().split("T")[0];
      const res = await invoiceApi.recordPayment(id, { amount: outstanding, date: today, note: "Marked paid from invoices list" });
      toast({
        title: res.invoice_status === "paid" ? "Marked as paid" : "Payment recorded",
        description: `${outstanding.toFixed(2)} recorded${res.invoice_status === "paid" ? "" : ` (status: ${res.invoice_status})`}`,
      });
      // If user has this invoice currently open in editor, sync local state too
      if (editingId === id) {
        setInv(prev => ({ ...prev, status: (res.invoice_status || prev.status) as InvoiceData["status"] }));
      }
      loadData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      toast({ title: "Failed to mark paid", description: msg, variant: "destructive" });
    }
  };

  const handleRowDuplicate = async (id: string) => {
    await handleOpenInvoice(id);
    handleDuplicate();
  };

  const handleRowDownloadPDF = async (id: string) => {
    await handleOpenInvoice(id);
    // wait one tick so state has propagated before generating
    setTimeout(() => handleDownloadPDF(), 80);
  };

  const handleRowShare = async (id: string) => {
    try {
      const res = await invoiceApi.share(id);
      await navigator.clipboard.writeText(res.public_url);
      toast({ title: "Share link copied", description: res.public_url });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed";
      toast({ title: "Failed to share", description: msg, variant: "destructive" });
    }
  };

  const handleUploadAttachment = async (file: File) => {
    // Issue #1: allow attachment before save — silently create the invoice first.
    let id = editingId;
    if (!id) {
      const totals = calcTotals(inv);
      const data = { ...inv, ...totals };
      const res = await invoiceApi.create(data);
      id = res.id;
      setEditingId(id);
      toast({ title: "Invoice saved — uploading attachment…" });
    }
    if (!id) throw new Error("Could not save invoice");
    const att = await invoiceApi.uploadAttachment(id, file);
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
        doc.text((item.description || "").substring(0, 40), x, y + 4); x += cols[0];
        const qtyStr = Number.isInteger(item.qty) ? String(item.qty) : String(item.qty);
        doc.text(qtyStr, x, y + 4); x += cols[1];
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

      // Payment terms + Notes block in PDF (Issue #2)
      const blocks: Array<{ title: string; text: string }> = [];
      if (inv.payment_terms) blocks.push({ title: "Payment terms", text: inv.payment_terms });
      if (inv.notes) blocks.push({ title: "Notes", text: inv.notes });
      // Bank / ACH details block in PDF
      const bd = inv.bank_details;
      if (bd && (bd.bank_name || bd.account_number || bd.routing_number || bd.paypal || bd.account_holder)) {
        const lines: string[] = [];
        if (bd.bank_name) lines.push(`Bank: ${bd.bank_name}`);
        if (bd.account_holder) lines.push(`Account holder: ${bd.account_holder}`);
        if (bd.account_number) lines.push(`Account number: ${bd.account_number}`);
        if (bd.routing_number) lines.push(`Routing / SWIFT / IFSC: ${bd.routing_number}`);
        if (bd.account_type) lines.push(`Type: ${bd.account_type}`);
        if (bd.paypal) lines.push(`PayPal / Venmo / Zelle: ${bd.paypal}`);
        if (bd.notes) lines.push(bd.notes);
        blocks.push({ title: "Bank / Payment details", text: lines.join("\n") });
      }
      for (const b of blocks) {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold"); doc.setFontSize(8);
        doc.setTextColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
        doc.text(b.title.toUpperCase(), LM, y); y += 4;
        doc.setFont("helvetica", "normal"); doc.setFontSize(8);
        doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
        const lines = doc.splitTextToSize(b.text, PW);
        doc.text(lines, LM, y);
        y += lines.length * 4 + 4;
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
          {/* Tab content (top tab strip removed — left sidebar is the only nav) */}
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
              settings={settings}
              onSaveDefaultBank={async (bd) => {
                try {
                  await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices/settings`, {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bank_details: bd }),
                  });
                  setSettings(prev => ({ ...(prev || {}), bank_details: bd }));
                  toast({ title: "Saved as default", description: "These bank details will be auto-filled on new invoices." });
                } catch (e) {
                  toast({ title: "Could not save", description: String(e), variant: "destructive" });
                }
              }}
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
            <HistoryTab
              invoices={invoices}
              stats={stats}
              onOpen={handleOpenInvoice}
              onDelete={handleDeleteInvoice}
              onExportCSV={handleExportCSV}
              onDuplicate={handleRowDuplicate}
              onResend={handleRowResend}
              onMarkPaid={handleRowMarkPaid}
              onDownloadPDF={handleRowDownloadPDF}
              onShare={handleRowShare}
            />
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
          attachments={inv.attachments}
          currentUserEmail={user?.email || ""}
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


function SendEmailModal({ defaultEmail, invoiceNumber, businessName, attachments, currentUserEmail, onSend, onClose }: { defaultEmail: string; invoiceNumber: string; businessName: string; attachments: InvoiceAttachment[]; currentUserEmail: string; onSend: (email: string, subject: string, message: string, cc: string[], bcc: string[], attachmentIds: string[]) => void; onClose: () => void }) {
  const [email, setEmail] = useState(defaultEmail);
  const [subject, setSubject] = useState(`Invoice ${invoiceNumber} from ${businessName || "RealProfits"}`);
  const [message, setMessage] = useState("");
  const [cc, setCc] = useState("");
  const [sendCopyToMe, setSendCopyToMe] = useState(true);
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>(attachments.map(a => a.id));
  const [sending, setSending] = useState(false);
  const inp = "w-full bg-[#F9F8F5] border border-[#E2DDD4] rounded-md px-3 py-2 text-sm focus:border-[#0B3D3D] focus:outline-none";

  const parseEmails = (s: string): string[] =>
    s.split(/[,;\n]+/).map(e => e.trim()).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e));

  const handleSend = async () => {
    if (!email) return;
    setSending(true);
    const ccList = parseEmails(cc);
    const bccList = sendCopyToMe && currentUserEmail ? [currentUserEmail] : [];
    await onSend(email, subject, message, ccList, bccList, selectedAttachmentIds);
    setSending(false);
  };

  const toggleAtt = (id: string) =>
    setSelectedAttachmentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" data-testid="send-email-modal">
        <h3 className="text-lg font-bold text-[#1C1B18] mb-1">Send Invoice by Email</h3>
        <p className="text-sm text-[#6E6B63] mb-4">Your client will receive a professional HTML email with invoice details.</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">To *</label>
            <input type="email" className={inp} value={email} onChange={e => setEmail(e.target.value)} data-testid="modal-send-email" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">CC <span className="text-[#9A968B] font-normal normal-case">(separate with commas)</span></label>
            <input className={inp} placeholder="boss@x.com, accountant@y.com" value={cc} onChange={e => setCc(e.target.value)} data-testid="modal-cc" />
          </div>
          <label className="flex items-start gap-2 text-sm text-[#1C1B18] cursor-pointer select-none">
            <input type="checkbox" checked={sendCopyToMe} onChange={e => setSendCopyToMe(e.target.checked)} className="mt-0.5 accent-[#0B3D3D]" data-testid="modal-send-copy-to-me" disabled={!currentUserEmail} />
            <span>
              Send a copy to me {currentUserEmail ? <span className="text-[#9A968B]">({currentUserEmail})</span> : <span className="text-[#9A968B]">(login email unavailable)</span>}
            </span>
          </label>
          <div>
            <label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Subject</label>
            <input className={inp} value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6E6B63] uppercase mb-1 block">Personal Message (optional)</label>
            <textarea className={inp + " min-h-[80px]"} placeholder="Hi, please find your invoice attached..." value={message} onChange={e => setMessage(e.target.value)} />
          </div>

          {attachments.length > 0 && (
            <div className="border border-[#E2DDD4] rounded-md p-3 bg-[#F9F8F5]">
              <p className="text-xs font-semibold text-[#6E6B63] uppercase mb-2">Attachments to include ({selectedAttachmentIds.length}/{attachments.length})</p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {attachments.map(a => (
                  <label key={a.id} className="flex items-center gap-2 text-sm text-[#1C1B18] cursor-pointer hover:bg-white rounded px-1.5 py-1">
                    <input type="checkbox" checked={selectedAttachmentIds.includes(a.id)} onChange={() => toggleAtt(a.id)} className="accent-[#0B3D3D]" data-testid={`modal-att-${a.id}`} />
                    <span className="truncate flex-1">{a.filename}</span>
                    <span className="text-[10px] text-[#9A968B]">{(a.size / 1024).toFixed(0)} KB</span>
                  </label>
                ))}
              </div>
            </div>
          )}
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

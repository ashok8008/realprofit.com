// Pure invoice-PDF builder. No React, no toasts — just jsPDF.
//
// Extracted from InvoiceApp.tsx to keep the orchestrating component lean.
// Returns the configured jsPDF instance so the caller can .save() / preview.
//
// If `shareUrl` is provided, a QR code linking to it is stamped at the
// bottom-right of the last page.
import type { InvoiceData } from "./types";
import { calcTotals, getCurrencySymbol } from "./types";

export interface BuildPdfOptions {
  inv: InvoiceData;
  /** When provided, a QR code linking here is added to the last page. */
  shareUrl?: string;
}

export async function buildInvoicePdf({ inv, shareUrl }: BuildPdfOptions): Promise<any> {
  // Dynamic imports so the heavy PDF libs aren't pulled into the initial bundle.
  const { jsPDF } = await import("jspdf");
  const { drawHeader, drawFooter, BRAND, LM, PW } = await import("@/lib/pdf-brand");
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
  doc.text("Subtotal:", tx, y); doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
  doc.text(`${sym}${totals.subtotal.toFixed(2)}`, vx - doc.getTextWidth(`${sym}${totals.subtotal.toFixed(2)}`), y); y += 5;
  if (totals.discount_amount > 0) {
    doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]); doc.text("Discount:", tx, y);
    doc.setTextColor(200, 50, 50);
    doc.text(`-${sym}${totals.discount_amount.toFixed(2)}`, vx - doc.getTextWidth(`-${sym}${totals.discount_amount.toFixed(2)}`), y); y += 5;
  }
  if (totals.tax_amount > 0) {
    doc.setTextColor(BRAND.muted[0], BRAND.muted[1], BRAND.muted[2]); doc.text(`${inv.tax_label}:`, tx, y);
    doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
    doc.text(`${sym}${totals.tax_amount.toFixed(2)}`, vx - doc.getTextWidth(`${sym}${totals.tax_amount.toFixed(2)}`), y); y += 5;
  }
  y += 2;
  doc.setFillColor(BRAND.accent[0], BRAND.accent[1], BRAND.accent[2]);
  doc.roundedRect(tx - 5, y - 3, vx - tx + 10, 11, 2, 2, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL", tx, y + 5);
  const ts = `${sym}${totals.total.toFixed(2)}`;
  doc.text(ts, vx - doc.getTextWidth(ts), y + 5);
  y += 14;

  // Payments received + outstanding
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

  // Payment terms + Notes + Bank details
  const blocks: Array<{ title: string; text: string }> = [];
  if (inv.payment_terms) blocks.push({ title: "Payment terms", text: inv.payment_terms });
  if (inv.notes) blocks.push({ title: "Notes", text: inv.notes });
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

  // QR code linking to the public share page
  if (shareUrl) {
    try {
      const qrDataUrl = await QRCode.toDataURL(shareUrl, { margin: 1, width: 220 });
      const qrSize = 28;
      const qrX = PW - LM - qrSize;
      const qrY = doc.internal.pageSize.getHeight() - qrSize - 28;
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
      doc.setFontSize(7);
      doc.setTextColor(110, 107, 99);
      doc.text("Scan to view or pay online", qrX + qrSize / 2, qrY + qrSize + 4, { align: "center" });
    } catch (qrErr) {
      console.warn("QR code generation skipped:", qrErr);
    }
  }

  return doc;
}

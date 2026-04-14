import type { ToastFunction } from "./invoiceTypes";

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  senderName: string;
  senderAddress: string;
  senderEmail: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  items: { id: string; description: string; quantity: string; rate: string }[];
  discount: string;
  taxPercentage: string;
  notes: string;
  paymentTerms: string;
}

export function exportInvoicePDF(
  data: InvoiceData,
  subtotal: number,
  discountVal: number,
  taxPctVal: number,
  taxAmount: number,
  grandTotal: number,
  getItemQty: (item: { quantity: string }) => number,
  getItemRate: (item: { rate: string }) => number,
  toast: ToastFunction,
) {
  try {
    const { jsPDF } = require("jspdf");
    const { drawHeader, drawFooter, drawRule, BRAND, LM, PW, PAGE_W } = require("@/lib/pdf-brand");
    const doc = new jsPDF();

    let y = drawHeader(doc, "INVOICE", `Invoice ${data.invoiceNumber}`);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.dark);
    doc.text("From", LM, y);
    doc.text("Invoice Details", PAGE_W / 2 + 10, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.muted);
    const senderLines = [data.senderName, data.senderAddress, data.senderEmail].filter(Boolean);
    senderLines.forEach((line: string) => { doc.text(line, LM, y); y += 5; });

    let ry = y - senderLines.length * 5;
    const details = [
      ["Invoice #:", data.invoiceNumber],
      ["Date:", data.date],
      ["Due Date:", data.dueDate],
    ];
    details.forEach(([label, val]: string[]) => {
      doc.setTextColor(...BRAND.muted);
      doc.text(label, PAGE_W / 2 + 10, ry);
      doc.setTextColor(...BRAND.dark);
      doc.setFont("helvetica", "bold");
      doc.text(val, PAGE_W / 2 + 40, ry);
      doc.setFont("helvetica", "normal");
      ry += 5;
    });

    y = Math.max(y, ry) + 6;
    y = drawRule(doc, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.accent);
    doc.text("Bill To", LM, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.dark);
    [data.clientName, data.clientAddress, data.clientEmail].filter(Boolean).forEach((line: string) => {
      doc.text(line, LM, y); y += 5;
    });
    y += 6;

    const colWidths = [80, 25, 35, 35];
    const tableHeaders = ["Description", "Qty", "Rate", "Amount"];
    const rowH = 8;

    doc.setFillColor(...BRAND.dark);
    doc.roundedRect(LM, y, PW, 9, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.white);
    let x = LM + 4;
    tableHeaders.forEach((h: string, i: number) => { doc.text(h, x, y + 6); x += colWidths[i]; });
    y += 11;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    data.items.forEach((item, ri) => {
      if (ri % 2 === 0) {
        doc.setFillColor(...BRAND.light);
        doc.rect(LM, y - 1, PW, rowH, "F");
      }
      doc.setTextColor(...BRAND.dark);
      const qty = getItemQty(item);
      const rate = getItemRate(item);
      const desc = (item.description || "Item").substring(0, 40);
      x = LM + 4;
      doc.text(desc, x, y + 5); x += colWidths[0];
      doc.text(qty.toString(), x, y + 5); x += colWidths[1];
      doc.text(`$${rate.toFixed(2)}`, x, y + 5); x += colWidths[2];
      doc.text(`$${(qty * rate).toFixed(2)}`, x, y + 5);
      y += rowH;
    });

    y += 6;

    const totalsX = PAGE_W / 2 + 20;
    const valX = PAGE_W - LM;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND.muted);
    doc.text("Subtotal:", totalsX, y);
    doc.setTextColor(...BRAND.dark);
    doc.text(`$${subtotal.toFixed(2)}`, valX - doc.getTextWidth(`$${subtotal.toFixed(2)}`), y);
    y += 6;

    if (discountVal > 0) {
      doc.setTextColor(...BRAND.muted);
      doc.text("Discount:", totalsX, y);
      doc.setTextColor(...BRAND.red);
      doc.text(`-$${discountVal.toFixed(2)}`, valX - doc.getTextWidth(`-$${discountVal.toFixed(2)}`), y);
      y += 6;
    }

    if (taxPctVal > 0) {
      doc.setTextColor(...BRAND.muted);
      doc.text(`Tax (${taxPctVal}%):`, totalsX, y);
      doc.setTextColor(...BRAND.dark);
      doc.text(`$${taxAmount.toFixed(2)}`, valX - doc.getTextWidth(`$${taxAmount.toFixed(2)}`), y);
      y += 6;
    }

    y += 2;
    doc.setFillColor(...BRAND.accent);
    doc.roundedRect(totalsX - 5, y - 3, PAGE_W - LM - totalsX + 10, 12, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...BRAND.white);
    doc.text("TOTAL", totalsX, y + 5);
    const totalStr = `$${grandTotal.toFixed(2)}`;
    doc.text(totalStr, valX - doc.getTextWidth(totalStr), y + 5);
    y += 18;

    if (data.notes) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...BRAND.dark);
      doc.text("Notes", LM, y); y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.muted);
      const noteLines = doc.splitTextToSize(data.notes, PW);
      doc.text(noteLines, LM, y); y += noteLines.length * 4 + 4;
    }

    if (data.paymentTerms) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...BRAND.dark);
      doc.text("Payment Terms", LM, y); y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.muted);
      const termLines = doc.splitTextToSize(data.paymentTerms, PW);
      doc.text(termLines, LM, y);
    }

    drawFooter(doc);
    doc.save(`${data.invoiceNumber || "invoice"}.pdf`);
    toast({ title: "Invoice Downloaded", description: "Your PDF has been saved." });
  } catch {
    toast({ title: "Export Failed", description: "Could not generate PDF.", variant: "destructive" });
  }
}

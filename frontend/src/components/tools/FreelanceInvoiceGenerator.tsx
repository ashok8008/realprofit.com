"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Copy, Download, Printer, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveToStorage, loadFromStorage } from "@/lib/career-tools/storage";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";

const STORAGE_KEY = "invoice";

export function FreelanceInvoiceGenerator() {
  const { toast } = useToast();

  const [data, setData] = useState({
    invoiceNumber: "INV-001",
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    senderName: "",
    senderAddress: "",
    senderEmail: "",
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    items: [{ id: "1", description: "Consulting Services", quantity: "1", rate: "100" }] as { id: string; description: string; quantity: string; rate: string }[],
    discount: "0",
    taxPercentage: "0",
    notes: "Thank you for your business!",
    paymentTerms: "Please pay within 30 days."
  });

  useEffect(() => {
    const parsed = loadFromStorage(STORAGE_KEY, data);
    if (parsed.items) {
      parsed.items = parsed.items.map((item: any) => ({
        ...item,
        quantity: String(item.quantity ?? "1"),
        rate: String(item.rate ?? "0")
      }));
    }
    if (parsed.discount !== undefined) parsed.discount = String(parsed.discount);
    if (parsed.taxPercentage !== undefined) parsed.taxPercentage = String(parsed.taxPercentage);
    setData(parsed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveToStorage(STORAGE_KEY, data);
  }, [data]);

  const getItemQty = (item: { quantity: string }) => parseFloat(item.quantity) || 0;
  const getItemRate = (item: { rate: string }) => parseFloat(item.rate) || 0;
  const discountVal = parseFloat(data.discount) || 0;
  const taxPctVal = parseFloat(data.taxPercentage) || 0;

  const subtotal = data.items.reduce((sum, item) => sum + (getItemQty(item) * getItemRate(item)), 0);
  const taxAmount = (subtotal - discountVal) * (taxPctVal / 100);
  const grandTotal = subtotal - discountVal + taxAmount;

  const handleItemChange = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = () => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), description: "", quantity: "1", rate: "0" }]
    }));
  };

  const duplicateItem = (item: any) => {
    setData(prev => ({
      ...prev,
      items: [...prev.items, { ...item, id: Date.now().toString() }]
    }));
  };

  const removeItem = (id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleExportPDF = () => {
    try {
      const { jsPDF } = require("jspdf");
      const { drawHeader, drawFooter, drawRule, BRAND, LM, PW, PAGE_W } = require("@/lib/pdf-brand");
      const doc = new jsPDF();

      // Header
      let y = drawHeader(doc, "INVOICE", `Invoice ${data.invoiceNumber}`);

      // Two-column: Sender (left) | Invoice details (right)
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
      senderLines.forEach(line => { doc.text(line, LM, y); y += 5; });

      let ry = y - senderLines.length * 5;
      const details = [
        ["Invoice #:", data.invoiceNumber],
        ["Date:", data.date],
        ["Due Date:", data.dueDate],
      ];
      details.forEach(([label, val]) => {
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

      // Bill To
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...BRAND.accent);
      doc.text("Bill To", LM, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...BRAND.dark);
      [data.clientName, data.clientAddress, data.clientEmail].filter(Boolean).forEach(line => {
        doc.text(line, LM, y); y += 5;
      });
      y += 6;

      // Items Table
      const colWidths = [80, 25, 35, 35];
      const tableHeaders = ["Description", "Qty", "Rate", "Amount"];
      const rowH = 8;

      // Table header
      doc.setFillColor(...BRAND.dark);
      doc.roundedRect(LM, y, PW, 9, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.white);
      let x = LM + 4;
      tableHeaders.forEach((h, i) => { doc.text(h, x, y + 6); x += colWidths[i]; });
      y += 11;

      // Table rows
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

      // Totals section (right-aligned)
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

      // Grand total bar
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

      // Notes & Payment Terms
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
    } catch (e) {
      toast({ title: "Export Failed", description: "Could not generate PDF.", variant: "destructive" });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setData({
      invoiceNumber: "INV-001",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      senderName: "",
      senderAddress: "",
      senderEmail: "",
      clientName: "",
      clientAddress: "",
      clientEmail: "",
      items: [{ id: "1", description: "Consulting Services", quantity: "1", rate: "100" }],
      discount: "0",
      taxPercentage: "0",
      notes: "Thank you for your business!",
      paymentTerms: "Please pay within 30 days."
    });
    toast({ title: "Reset", description: "Invoice form has been cleared." });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-8 no-print">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-serif font-bold">Edit Invoice</h2>
          <Button variant="outline" size="sm" onClick={handleReset} data-testid="button-reset">
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Invoice Number</Label>
            <Input value={data.invoiceNumber} onChange={e => setData({ ...data, invoiceNumber: e.target.value })} data-testid="input-invoice-number" />
          </div>
          <div className="space-y-2"></div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" value={data.dueDate} onChange={e => setData({ ...data, dueDate: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold border-b pb-2">Your Details</h3>
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input value={data.senderName} onChange={e => setData({ ...data, senderName: e.target.value })} placeholder="Your Company" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={data.senderEmail} onChange={e => setData({ ...data, senderEmail: e.target.value })} placeholder="you@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea value={data.senderAddress} onChange={e => setData({ ...data, senderAddress: e.target.value })} placeholder="123 Business Rd&#10;City, State 12345" className="h-24" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold border-b pb-2">Client Details</h3>
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input value={data.clientName} onChange={e => setData({ ...data, clientName: e.target.value })} placeholder="Client Company" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={data.clientEmail} onChange={e => setData({ ...data, clientEmail: e.target.value })} placeholder="client@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea value={data.clientAddress} onChange={e => setData({ ...data, clientAddress: e.target.value })} placeholder="456 Client Pkwy&#10;City, State 67890" className="h-24" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold">Line Items</h3>
            <Button size="sm" onClick={addItem} data-testid="button-add-item"><Plus className="w-4 h-4 mr-1" /> Add Item</Button>
          </div>

          <div className="space-y-3">
            {data.items.map((item, index) => (
              <div key={item.id} className="bg-muted/20 p-3 rounded-md space-y-2">
                <div className="flex gap-2 items-start">
                  <div className="flex-1 min-w-0">
                    <Input placeholder="Description" value={item.description} onChange={e => handleItemChange(item.id, "description", e.target.value)} />
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => duplicateItem(item)} title="Duplicate"><Copy className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeItem(item.id)} title="Remove" disabled={data.items.length === 1}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Qty</Label>
                    <Input type="number" min="0.01" step="any" value={item.quantity} onChange={e => handleItemChange(item.id, "quantity", e.target.value)} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Rate ($)</Label>
                    <Input type="number" min="0" step="0.01" value={item.rate} onChange={e => handleItemChange(item.id, "rate", e.target.value)} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Amount</Label>
                    <div className="h-9 flex items-center justify-end font-mono font-bold text-sm">
                      ${(getItemQty(item) * getItemRate(item)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={data.notes} onChange={e => setData({ ...data, notes: e.target.value })} className="h-20" />
            </div>
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Textarea value={data.paymentTerms} onChange={e => setData({ ...data, paymentTerms: e.target.value })} className="h-20" />
            </div>
          </div>
          <div className="space-y-4 bg-muted/10 p-4 rounded-lg">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 justify-between">
              <Label className="whitespace-nowrap">Discount ($):</Label>
              <Input type="number" className="w-24 text-right" value={data.discount} onChange={e => setData({ ...data, discount: e.target.value })} min="0" />
            </div>
            <div className="flex items-center gap-2 justify-between">
              <Label className="whitespace-nowrap">Tax (%):</Label>
              <Input type="number" className="w-24 text-right" value={data.taxPercentage} onChange={e => setData({ ...data, taxPercentage: e.target.value })} min="0" />
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center no-print">
          <h2 className="text-2xl font-serif font-bold">Preview</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm" data-testid="button-print"><Printer className="w-4 h-4 mr-2" /> Print</Button>
            <Button onClick={handleExportPDF} size="sm" data-testid="button-export-pdf"><Download className="w-4 h-4 mr-2" /> Download PDF</Button>
          </div>
        </div>

        <div className="border rounded-lg p-8 bg-white text-black shadow-sm aspect-[1/1.4] overflow-auto text-sm print-container">
          <InvoicePreview data={data} subtotal={subtotal} discountVal={discountVal} taxPctVal={taxPctVal} taxAmount={taxAmount} grandTotal={grandTotal} getItemQty={getItemQty} getItemRate={getItemRate} />
        </div>
      </div>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

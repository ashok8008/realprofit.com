"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Copy, Download, Printer, RotateCcw } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "rp-tool-freelance-invoice";

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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
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
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
      const doc = new jsPDF();
      let y = 20;

      doc.setFontSize(24);
      doc.text("INVOICE", 150, y);
      doc.setFontSize(12);

      doc.text(data.senderName || "Your Company", 20, y);
      y += 6;
      if (data.senderAddress) {
        const addressLines = doc.splitTextToSize(data.senderAddress, 60);
        doc.text(addressLines, 20, y);
        y += addressLines.length * 6;
      }
      if (data.senderEmail) {
        doc.text(data.senderEmail, 20, y);
      }

      y = Math.max(y + 15, 50);

      doc.text(`Invoice Number: ${data.invoiceNumber}`, 150, y);
      y += 6;
      doc.text(`Date: ${data.date}`, 150, y);
      y += 6;
      doc.text(`Due Date: ${data.dueDate}`, 150, y);

      y -= 12;

      doc.setFontSize(14);
      doc.text("Bill To:", 20, y);
      doc.setFontSize(12);
      y += 6;
      doc.text(data.clientName || "Client Name", 20, y);
      y += 6;
      if (data.clientAddress) {
        const addressLines = doc.splitTextToSize(data.clientAddress, 60);
        doc.text(addressLines, 20, y);
        y += addressLines.length * 6;
      }
      if (data.clientEmail) {
        doc.text(data.clientEmail, 20, y);
      }

      y = Math.max(y + 15, 80);

      doc.setFillColor(240, 240, 240);
      doc.rect(20, y, 170, 10, "F");
      doc.setFont(undefined as any, "bold");
      doc.text("Description", 22, y + 7);
      doc.text("Qty", 120, y + 7);
      doc.text("Rate", 145, y + 7);
      doc.text("Amount", 170, y + 7);
      doc.setFont(undefined as any, "normal");

      y += 15;

      data.items.forEach(item => {
        const qty = getItemQty(item);
        const rate = getItemRate(item);
        const descLines = doc.splitTextToSize(item.description || "Item", 90);
        doc.text(descLines, 22, y);
        doc.text(qty.toString(), 120, y);
        doc.text(`$${rate.toFixed(2)}`, 145, y);
        doc.text(`$${(qty * rate).toFixed(2)}`, 170, y);

        y += Math.max(descLines.length * 6, 10);
      });

      y += 10;
      doc.text(`Subtotal:`, 140, y);
      doc.text(`$${subtotal.toFixed(2)}`, 170, y);

      if (discountVal > 0) {
        y += 6;
        doc.text(`Discount:`, 140, y);
        doc.text(`-$${discountVal.toFixed(2)}`, 170, y);
      }

      if (taxPctVal > 0) {
        y += 6;
        doc.text(`Tax (${taxPctVal}%):`, 140, y);
        doc.text(`$${taxAmount.toFixed(2)}`, 170, y);
      }

      y += 8;
      doc.setFont(undefined as any, "bold");
      doc.text(`Total:`, 140, y);
      doc.text(`$${grandTotal.toFixed(2)}`, 170, y);
      doc.setFont(undefined as any, "normal");

      y += 20;
      if (data.notes) {
        doc.text("Notes:", 20, y);
        y += 6;
        const noteLines = doc.splitTextToSize(data.notes, 170);
        doc.text(noteLines, 20, y);
        y += noteLines.length * 6 + 4;
      }

      if (data.paymentTerms) {
        doc.text("Payment Terms:", 20, y);
        y += 6;
        const termLines = doc.splitTextToSize(data.paymentTerms, 170);
        doc.text(termLines, 20, y);
      }

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
          <div className="flex flex-col sm:flex-row justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-4 text-gray-800">INVOICE</h1>
              <div className="text-gray-600 space-y-1">
                <p className="font-bold text-gray-800">{data.senderName || "Your Company"}</p>
                {data.senderAddress && <p className="whitespace-pre-wrap">{data.senderAddress}</p>}
                {data.senderEmail && <p>{data.senderEmail}</p>}
              </div>
            </div>
            <div className="sm:text-right text-gray-600 space-y-1">
              <p><span className="font-bold text-gray-800">Invoice Number:</span> {data.invoiceNumber}</p>
              <p><span className="font-bold text-gray-800">Date:</span> {data.date}</p>
              <p><span className="font-bold text-gray-800">Due Date:</span> {data.dueDate}</p>
            </div>
          </div>

          <div className="mb-10 text-gray-600 space-y-1">
            <p className="font-bold text-gray-800 mb-2">Bill To:</p>
            <p className="font-bold text-gray-800">{data.clientName || "Client Name"}</p>
            {data.clientAddress && <p className="whitespace-pre-wrap">{data.clientAddress}</p>}
            {data.clientEmail && <p>{data.clientEmail}</p>}
          </div>

          <div className="overflow-x-auto mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-2 text-gray-800">Description</th>
                  <th className="text-right py-2 text-gray-800 pl-4">Qty</th>
                  <th className="text-right py-2 text-gray-800 pl-4">Rate</th>
                  <th className="text-right py-2 text-gray-800 pl-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => {
                  const qty = getItemQty(item);
                  const rate = getItemRate(item);
                  return (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-3 text-gray-600 break-words max-w-[200px]">{item.description}</td>
                      <td className="text-right py-3 text-gray-600 pl-4 whitespace-nowrap">{qty}</td>
                      <td className="text-right py-3 text-gray-600 pl-4 whitespace-nowrap">${rate.toFixed(2)}</td>
                      <td className="text-right py-3 text-gray-800 pl-4 whitespace-nowrap">${(qty * rate).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-10">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount:</span>
                  <span>-${discountVal.toFixed(2)}</span>
                </div>
              )}
              {taxPctVal > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({taxPctVal}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-800 border-t-2 border-gray-300 pt-2 mt-2">
                <span>Total:</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {(data.notes || data.paymentTerms) && (
            <div className="text-gray-600 space-y-4">
              {data.notes && (
                <div>
                  <p className="font-bold text-gray-800 mb-1">Notes:</p>
                  <p className="whitespace-pre-wrap">{data.notes}</p>
                </div>
              )}
              {data.paymentTerms && (
                <div>
                  <p className="font-bold text-gray-800 mb-1">Payment Terms:</p>
                  <p className="whitespace-pre-wrap">{data.paymentTerms}</p>
                </div>
              )}
            </div>
          )}
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

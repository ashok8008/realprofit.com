"use client";
import React from "react";
import { Printer, Download } from "lucide-react";
import type { InvoiceData } from "./types";
import { getCurrencySymbol, calcTotals } from "./types";

interface PreviewProps {
  inv: InvoiceData;
  onPrint: () => void;
  onDownloadPDF: () => void;
}

export function InvoicePreviewPanel({ inv, onPrint, onDownloadPDF }: PreviewProps) {
  const sym = getCurrencySymbol(inv.currency);
  const totals = calcTotals(inv);
  const accent = inv.accent_color || "#0B3D3D";
  const paidTotal = inv.payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = Math.max(0, totals.total - paidTotal);

  return (
    <div className="w-[400px] flex-shrink-0 bg-[#F5F3EE] border-l border-[#E2DDD4] h-screen sticky top-0 flex flex-col overflow-hidden" data-testid="invoice-preview-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2DDD4] bg-white">
        <h3 className="text-sm font-bold text-[#1C1B18]">Preview</h3>
        <div className="flex gap-1.5">
          <button onClick={onPrint} className="border border-[#E2DDD4] bg-white text-[#6E6B63] text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-[#F9F8F5] flex items-center gap-1"><Printer className="w-3 h-3" /> Print</button>
          <button onClick={onDownloadPDF} className="bg-[#0B3D3D] text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-[#165252] flex items-center gap-1"><Download className="w-3 h-3" /> PDF</button>
        </div>
      </div>

      {/* Template picker */}
      <div className="flex gap-1.5 px-4 py-2.5 border-b border-[#E2DDD4] bg-white">
        {(["minimal", "corporate", "creative"] as const).map(t => (
          <button key={t} className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${inv.template === t ? "bg-[#0B3D3D] text-white" : "bg-[#F9F8F5] text-[#6E6B63] border border-[#E2DDD4] hover:bg-white"}`} data-testid={`template-${t}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Invoice Doc */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border border-[#E2DDD4] p-6 text-xs" id="invoice-preview-doc" data-testid="invoice-preview-doc">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold" style={{ color: accent }}>{inv.business_name || "Your Business"}</h2>
              {inv.business_email && <p className="text-[#6E6B63] mt-0.5">{inv.business_email}</p>}
              {inv.business_phone && <p className="text-[#6E6B63]">{inv.business_phone}</p>}
              {inv.business_address && <p className="text-[#6E6B63] whitespace-pre-line">{inv.business_address}</p>}
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold" style={{ color: accent }}>INVOICE</h1>
              <p className="text-[#6E6B63] font-mono mt-1">{inv.invoice_number}</p>
              <p className="text-[#6E6B63] mt-1">Date: {inv.date}</p>
              <p className="text-[#6E6B63]">Due: {inv.due_date}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[2px] mb-5" style={{ background: accent }} />

          {/* Bill To */}
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>Bill To</p>
            <p className="font-bold text-[#1C1B18]">{inv.client_name || "Client Name"}</p>
            {inv.client_company && <p className="text-[#6E6B63]">{inv.client_company}</p>}
            {inv.client_email && <p className="text-[#6E6B63]">{inv.client_email}</p>}
            {inv.client_address && <p className="text-[#6E6B63] whitespace-pre-line">{inv.client_address}</p>}
          </div>

          {/* Items Table */}
          <table className="w-full mb-4">
            <thead>
              <tr className="text-white text-[10px] uppercase tracking-wider" style={{ background: accent }}>
                <th className="text-left px-2 py-1.5 rounded-l">Description</th>
                <th className="text-center px-2 py-1.5">Qty</th>
                <th className="text-right px-2 py-1.5">Rate</th>
                <th className="text-right px-2 py-1.5 rounded-r">Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.items.map((item, i) => (
                <tr key={item.id} className={i % 2 === 0 ? "bg-[#F9F8F5]" : ""}>
                  <td className="px-2 py-1.5 text-[#1C1B18]">{item.description || "Item"}</td>
                  <td className="px-2 py-1.5 text-center text-[#6E6B63]">{item.qty} {item.unit}</td>
                  <td className="px-2 py-1.5 text-right text-[#6E6B63]">{sym}{item.rate.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-right font-semibold text-[#1C1B18]">{sym}{(item.qty * item.rate).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="ml-auto w-1/2 space-y-1">
            <div className="flex justify-between"><span className="text-[#6E6B63]">Subtotal</span><span>{sym}{totals.subtotal.toFixed(2)}</span></div>
            {totals.discount_amount > 0 && <div className="flex justify-between"><span className="text-[#6E6B63]">Discount</span><span className="text-red-600">-{sym}{totals.discount_amount.toFixed(2)}</span></div>}
            {totals.tax_amount > 0 && <div className="flex justify-between"><span className="text-[#6E6B63]">{inv.tax_label}</span><span>{sym}{totals.tax_amount.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-sm border-t pt-1 mt-1" style={{ borderColor: accent }}>
              <span>Total</span><span style={{ color: accent }}>{sym}{totals.total.toFixed(2)}</span>
            </div>
            {paidTotal > 0 && (
              <div className="flex justify-between text-amber-700 font-semibold"><span>Outstanding</span><span>{sym}{outstanding.toFixed(2)}</span></div>
            )}
          </div>

          {/* Notes */}
          {inv.notes && (
            <div className="mt-5 pt-3 border-t border-[#E2DDD4]">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>Notes</p>
              <p className="text-[#6E6B63] whitespace-pre-line">{inv.notes}</p>
            </div>
          )}
          {inv.payment_terms && (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>Payment Terms</p>
              <p className="text-[#6E6B63] whitespace-pre-line">{inv.payment_terms}</p>
            </div>
          )}

          {/* Signature */}
          {inv.signature_data && (
            <div className="mt-4 pt-3 border-t border-[#E2DDD4]">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: accent }}>Signature</p>
              <img src={inv.signature_data} alt="Signature" className="h-12" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

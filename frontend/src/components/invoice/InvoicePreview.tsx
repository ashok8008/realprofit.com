"use client";
import React from "react";

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

interface InvoicePreviewProps {
  data: InvoiceData;
  subtotal: number;
  discountVal: number;
  taxPctVal: number;
  taxAmount: number;
  grandTotal: number;
  getItemQty: (item: { quantity: string }) => number;
  getItemRate: (item: { rate: string }) => number;
}

export function InvoicePreview({ data, subtotal, discountVal, taxPctVal, taxAmount, grandTotal, getItemQty, getItemRate }: InvoicePreviewProps) {
  return (
    <div className="border rounded-lg p-8 bg-white text-black shadow-sm aspect-[1/1.4] overflow-auto text-sm print-container" data-testid="invoice-preview">
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
          <div className="flex justify-between text-gray-600"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
          {discountVal > 0 && <div className="flex justify-between text-gray-600"><span>Discount:</span><span>-${discountVal.toFixed(2)}</span></div>}
          {taxPctVal > 0 && <div className="flex justify-between text-gray-600"><span>Tax ({taxPctVal}%):</span><span>${taxAmount.toFixed(2)}</span></div>}
          <div className="flex justify-between text-lg font-bold text-gray-800 border-t-2 border-gray-300 pt-2 mt-2"><span>Total:</span><span>${grandTotal.toFixed(2)}</span></div>
        </div>
      </div>

      {(data.notes || data.paymentTerms) && (
        <div className="text-gray-600 space-y-4">
          {data.notes && <div><p className="font-bold text-gray-800 mb-1">Notes:</p><p className="whitespace-pre-wrap">{data.notes}</p></div>}
          {data.paymentTerms && <div><p className="font-bold text-gray-800 mb-1">Payment Terms:</p><p className="whitespace-pre-wrap">{data.paymentTerms}</p></div>}
        </div>
      )}
    </div>
  );
}

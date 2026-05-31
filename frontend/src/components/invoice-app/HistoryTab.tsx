"use client";
import React, { useState, useRef, useEffect } from "react";
import { Download, FileText, MoreVertical, Edit3, Copy, Send, CheckCircle2, Link2, Trash2 } from "lucide-react";
import { getCurrencySymbol } from "./types";

interface InvoiceSummary {
  id: string;
  invoice_number: string;
  client_name: string;
  client_company?: string;
  status: string;
  total: number;
  currency: string;
  date: string;
  due_date: string;
}

interface Stats {
  total_count: number;
  paid_count: number;
  overdue_count: number;
  total_revenue: number;
}

interface HistoryTabProps {
  invoices: InvoiceSummary[];
  stats: Stats;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onExportCSV: () => void;
  onDuplicate: (id: string) => void;
  onResend: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onDownloadPDF: (id: string) => void;
  onShare: (id: string) => void;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  sent: "bg-blue-50 text-blue-600",
  paid: "bg-emerald-50 text-emerald-600",
  overdue: "bg-red-50 text-red-600",
  partial: "bg-amber-50 text-amber-600",
};

function RowMenu({
  inv, onOpen, onDuplicate, onResend, onMarkPaid, onDownloadPDF, onShare, onDelete,
}: {
  inv: InvoiceSummary;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onResend: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onDownloadPDF: (id: string) => void;
  onShare: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const item = (label: string, Icon: typeof Edit3, action: () => void, disabled = false, danger = false) => (
    <button
      onClick={e => { e.stopPropagation(); if (disabled) return; setOpen(false); action(); }}
      disabled={disabled}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
        disabled
          ? "text-stone-300 cursor-not-allowed"
          : danger
          ? "text-red-600 hover:bg-red-50"
          : "text-[#1C1B18] hover:bg-[#F9F8F5]"
      }`}
      data-testid={`row-action-${label.toLowerCase().replace(/\s+/g, "-")}-${inv.id}`}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded hover:bg-stone-200 text-[#6E6B63]"
        data-testid={`row-menu-${inv.id}`}
        aria-label="More actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-stone-200 rounded-lg shadow-lg z-20 py-1" onClick={e => e.stopPropagation()}>
          {item("Edit", Edit3, () => onOpen(inv.id))}
          {item("Duplicate", Copy, () => onDuplicate(inv.id))}
          {item("Resend", Send, () => onResend(inv.id), inv.status === "draft")}
          {item("Mark as paid", CheckCircle2, () => onMarkPaid(inv.id), inv.status === "paid")}
          {item("Download PDF", Download, () => onDownloadPDF(inv.id))}
          {item("Share link", Link2, () => onShare(inv.id))}
          <div className="h-px bg-stone-200 my-1" />
          {item("Delete", Trash2, () => onDelete(inv.id), false, true)}
        </div>
      )}
    </div>
  );
}

export function HistoryTab({ invoices, stats, onOpen, onDelete, onExportCSV, onDuplicate, onResend, onMarkPaid, onDownloadPDF, onShare }: HistoryTabProps) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? invoices : invoices.filter(i => i.status === filter);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4" data-testid="history-tab">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1C1B18]">Invoices</h2>
          <p className="text-sm text-[#6E6B63]">All saved invoices</p>
        </div>
        <button onClick={onExportCSV} className="border border-[#E2DDD4] bg-white text-[#1C1B18] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#F9F8F5] flex items-center gap-2" data-testid="export-csv-btn"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-[#E2DDD4] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#1C1B18]">{stats.total_count}</p>
          <p className="text-[10px] text-[#6E6B63] uppercase font-semibold tracking-wider">Total Invoices</p>
        </div>
        <div className="bg-white border border-[#E2DDD4] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{stats.paid_count}</p>
          <p className="text-[10px] text-[#6E6B63] uppercase font-semibold tracking-wider">Paid</p>
        </div>
        <div className="bg-white border border-[#E2DDD4] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.overdue_count}</p>
          <p className="text-[10px] text-[#6E6B63] uppercase font-semibold tracking-wider">Overdue</p>
        </div>
        <div className="bg-white border border-[#E2DDD4] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#0B3D3D]">${stats.total_revenue.toLocaleString()}</p>
          <p className="text-[10px] text-[#6E6B63] uppercase font-semibold tracking-wider">Revenue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-4">
        {["all", "draft", "sent", "paid", "overdue", "partial"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${filter === f ? "bg-[#0B3D3D] text-white" : "bg-white border border-[#E2DDD4] text-[#6E6B63] hover:bg-[#F9F8F5]"}`} data-testid={`filter-${f}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-[#E2DDD4] rounded-xl">
          <FileText className="w-10 h-10 text-[#E2DDD4] mx-auto mb-3" />
          <h3 className="font-bold text-[#1C1B18] mb-1">No invoices found</h3>
          <p className="text-sm text-[#6E6B63]">Save invoices to see them here</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E2DDD4] rounded-xl overflow-visible">
          <table className="w-full text-sm">
            <thead className="bg-[#F9F8F5] border-b border-[#E2DDD4]">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-[#6E6B63] text-xs uppercase tracking-wider">Invoice</th>
                <th className="text-left px-4 py-3 font-semibold text-[#6E6B63] text-xs uppercase tracking-wider">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-[#6E6B63] text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-[#6E6B63] text-xs uppercase tracking-wider">Amount</th>
                <th className="text-right px-4 py-3 font-semibold text-[#6E6B63] text-xs uppercase tracking-wider">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DDD4]">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-[#F9F8F5] cursor-pointer" onClick={() => onOpen(inv.id)}>
                  <td className="px-4 py-3 font-mono font-bold text-[#1C1B18]">{inv.invoice_number}</td>
                  <td className="px-4 py-3 text-[#1C1B18]">{inv.client_name || inv.client_company || "—"}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[inv.status] || statusColors.draft}`}>{inv.status}</span></td>
                  <td className="px-4 py-3 text-right font-semibold">{getCurrencySymbol(inv.currency)}{inv.total?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-[#6E6B63]">{inv.date}</td>
                  <td className="px-4 py-3 text-right">
                    <RowMenu
                      inv={inv}
                      onOpen={onOpen}
                      onDuplicate={onDuplicate}
                      onResend={onResend}
                      onMarkPaid={onMarkPaid}
                      onDownloadPDF={onDownloadPDF}
                      onShare={onShare}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

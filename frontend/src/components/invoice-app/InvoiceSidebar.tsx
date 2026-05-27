"use client";
import React from "react";
import Link from "next/link";
import { FilePlus, Users, Clock, Copy, Save, Download, ChevronLeft, Send, Link2 } from "lucide-react";
import { CURRENCIES } from "./types";

type Tab = "editor" | "clients" | "history";

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  currency: string;
  setCurrency: (c: string) => void;
  onNewInvoice: () => void;
  onDuplicate: () => void;
  onSave: () => void;
  onSendEmail: () => void;
  onShare: () => void;
  onExportCSV: () => void;
  clientCount: number;
  invoiceCount: number;
}

export function InvoiceSidebar({ activeTab, setActiveTab, currency, setCurrency, onNewInvoice, onDuplicate, onSave, onSendEmail, onShare, onExportCSV, clientCount, invoiceCount }: SidebarProps) {
  const nav = (tab: Tab) => () => setActiveTab(tab);

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#0B3D3D] flex flex-col h-screen sticky top-0 overflow-y-auto" data-testid="invoice-sidebar">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <Link href="/" className="block">
          <span className="font-serif font-bold text-xl text-white tracking-tight">RealProfits<span className="text-[#C8A96E]">.</span></span>
        </Link>
        <p className="text-[10px] text-white/40 tracking-wider mt-0.5">INVOICE GENERATOR</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 mb-2">Tools</p>

        <button onClick={() => { onNewInvoice(); setActiveTab("editor"); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/8 hover:text-white transition-colors mb-0.5" data-testid="sidebar-new-invoice">
          <FilePlus className="w-4 h-4" /> New Invoice
        </button>

        <button onClick={nav("editor")} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors mb-0.5 ${activeTab === "editor" ? "bg-white/14 text-white font-medium" : "text-white/70 hover:bg-white/8 hover:text-white"}`} data-testid="sidebar-editor">
          <FilePlus className="w-4 h-4" /> Editor
        </button>

        <button onClick={nav("clients")} className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-sm transition-colors mb-0.5 ${activeTab === "clients" ? "bg-white/14 text-white font-medium" : "text-white/70 hover:bg-white/8 hover:text-white"}`} data-testid="sidebar-clients">
          <span className="flex items-center gap-2.5"><Users className="w-4 h-4" /> Clients</span>
          {clientCount > 0 && <span className="bg-[#C8A96E] text-[#0B3D3D] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{clientCount}</span>}
        </button>

        <button onClick={nav("history")} className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-sm transition-colors mb-0.5 ${activeTab === "history" ? "bg-white/14 text-white font-medium" : "text-white/70 hover:bg-white/8 hover:text-white"}`} data-testid="sidebar-history">
          <span className="flex items-center gap-2.5"><Clock className="w-4 h-4" /> History</span>
          {invoiceCount > 0 && <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{invoiceCount}</span>}
        </button>

        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 mt-5 mb-2">Actions</p>

        <button onClick={onDuplicate} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/8 hover:text-white transition-colors mb-0.5" data-testid="sidebar-duplicate">
          <Copy className="w-4 h-4" /> Duplicate
        </button>
        <button onClick={onSave} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/8 hover:text-white transition-colors mb-0.5" data-testid="sidebar-save">
          <Save className="w-4 h-4" /> Save Invoice
        </button>
        <button onClick={onSendEmail} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/8 hover:text-white transition-colors mb-0.5" data-testid="sidebar-send-email">
          <Send className="w-4 h-4" /> Send by Email
        </button>
        <button onClick={onShare} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/8 hover:text-white transition-colors mb-0.5" data-testid="sidebar-share">
          <Link2 className="w-4 h-4" /> Copy share link
        </button>
        <button onClick={onExportCSV} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/8 hover:text-white transition-colors mb-0.5" data-testid="sidebar-export-csv">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </nav>

      {/* Currency */}
      <div className="px-4 py-4 border-t border-white/10">
        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1.5">Currency</label>
        <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-white/10 border border-white/15 text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-[#C8A96E]" data-testid="currency-select">
          {CURRENCIES.map(c => <option key={c.code} value={c.code} className="text-black">{c.code} ({c.symbol})</option>)}
        </select>
      </div>

      {/* Back */}
      <div className="px-4 py-3 border-t border-white/10">
        <Link href="/tools" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Back to Tools</Link>
      </div>
    </aside>
  );
}

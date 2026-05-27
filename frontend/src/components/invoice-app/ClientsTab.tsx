"use client";
import React from "react";
import { Plus, Pencil, Trash2, Mail, Building2 } from "lucide-react";
import type { ClientData } from "./types";

interface ClientsTabProps {
  clients: ClientData[];
  onAdd: () => void;
  onEdit: (client: ClientData) => void;
  onDelete: (id: string) => void;
  onLoad: (client: ClientData) => void;
}

export function ClientsTab({ clients, onAdd, onEdit, onDelete, onLoad }: ClientsTabProps) {
  return (
    <div className="max-w-3xl mx-auto py-6 px-4" data-testid="clients-tab">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1C1B18]">Saved Clients</h2>
          <p className="text-sm text-[#6E6B63]">Load client details into any invoice</p>
        </div>
        <button onClick={onAdd} className="bg-[#0B3D3D] text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-[#165252] transition-colors flex items-center gap-2" data-testid="add-client-btn"><Plus className="w-4 h-4" /> Add Client</button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-[#E2DDD4] rounded-xl">
          <Building2 className="w-10 h-10 text-[#E2DDD4] mx-auto mb-3" />
          <p className="text-[#6E6B63] mb-4">No saved clients yet</p>
          <button onClick={onAdd} className="bg-[#C8A96E] text-[#1C1B18] text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-[#b89a5e]" data-testid="add-client-empty">Add Your First Client</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {clients.map(c => (
            <div key={c.id} className="bg-white border border-[#E2DDD4] rounded-xl p-5 hover:shadow-sm transition-shadow" data-testid={`client-card-${c.id}`}>
              <h3 className="font-bold text-[#1C1B18] text-base mb-0.5">{c.name}</h3>
              {c.company && <p className="text-sm text-[#6E6B63] mb-1">{c.company}</p>}
              {c.email && <p className="text-xs text-[#1A5276] flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</p>}
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[#E2DDD4]">
                <button onClick={() => onLoad(c)} className="text-xs font-semibold text-[#0B3D3D] hover:text-[#C8A96E]">Use in Invoice</button>
                <button onClick={() => onEdit(c)} className="text-xs font-semibold text-[#6E6B63] hover:text-[#0B3D3D] flex items-center gap-1"><Pencil className="w-3 h-3" /> Edit</button>
                <button onClick={() => c.id && onDelete(c.id)} className="text-xs font-semibold text-[#6E6B63] hover:text-red-600 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
              </div>
            </div>
          ))}
          <button onClick={onAdd} className="border-2 border-dashed border-[#E2DDD4] rounded-xl p-5 flex flex-col items-center justify-center text-[#6E6B63] hover:border-[#0B3D3D] hover:text-[#0B3D3D] transition-colors cursor-pointer min-h-[120px]">
            <Plus className="w-6 h-6 mb-1" />
            <span className="text-sm font-semibold">Add Client</span>
          </button>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TaxPDFExport } from "@/components/tax/TaxPDFExport";
import { AlertTriangle, Plus, Trash2, CheckCircle, Circle } from "lucide-react";

interface W2Entry { id: number; employer: string; wages: number; federalWithheld: number; stateWithheld: number }
interface Form1099Entry { id: number; payer: string; amount: number; type: string }

let wId = 1;
let fId = 1;

export function W2Organizer() {
  const [w2s, setW2s] = useState<W2Entry[]>([
    { id: wId++, employer: "", wages: 0, federalWithheld: 0, stateWithheld: 0 },
  ]);
  const [form1099s, setForm1099s] = useState<Form1099Entry[]>([]);
  const [checklist, setChecklist] = useState<Set<string>>(new Set());

  const addW2 = () => setW2s(prev => [...prev, { id: wId++, employer: "", wages: 0, federalWithheld: 0, stateWithheld: 0 }]);
  const removeW2 = (id: number) => setW2s(prev => prev.filter(w => w.id !== id));
  const updateW2 = (id: number, field: keyof W2Entry, value: string | number) => {
    setW2s(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const add1099 = () => setForm1099s(prev => [...prev, { id: fId++, payer: "", amount: 0, type: "NEC" }]);
  const remove1099 = (id: number) => setForm1099s(prev => prev.filter(f => f.id !== id));
  const update1099 = (id: number, field: keyof Form1099Entry, value: string | number) => {
    setForm1099s(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const totalW2Wages = w2s.reduce((s, w) => s + w.wages, 0);
  const totalW2Federal = w2s.reduce((s, w) => s + w.federalWithheld, 0);
  const totalW2State = w2s.reduce((s, w) => s + w.stateWithheld, 0);
  const total1099 = form1099s.reduce((s, f) => s + f.amount, 0);
  const totalIncome = totalW2Wages + total1099;

  const checklistItems = [
    "All W-2 forms collected from employers",
    "All 1099 forms collected from clients/payers",
    "Amounts verified against last pay stubs",
    "SSN confirmed on all documents",
    "Copy of prior year return accessible",
  ];

  const toggleCheck = (item: string) => {
    setChecklist(prev => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  };

  const pdfSections = [
    {
      heading: "W-2 Income Summary",
      rows: w2s.filter(w => w.wages > 0).map(w => ({
        label: w.employer || "Employer",
        value: `Wages: $${w.wages.toLocaleString()} | Fed Withheld: $${w.federalWithheld.toLocaleString()} | State: $${w.stateWithheld.toLocaleString()}`,
      })).concat([
        { label: "Total W-2 Wages", value: `$${totalW2Wages.toLocaleString()}` },
        { label: "Total Federal Withheld", value: `$${totalW2Federal.toLocaleString()}` },
        { label: "Total State Withheld", value: `$${totalW2State.toLocaleString()}` },
      ]),
    },
    ...(form1099s.length > 0 ? [{
      heading: "1099 Income Summary",
      rows: form1099s.filter(f => f.amount > 0).map(f => ({
        label: `${f.payer || "Payer"} (1099-${f.type})`,
        value: `$${f.amount.toLocaleString()}`,
      })).concat([{ label: "Total 1099 Income", value: `$${total1099.toLocaleString()}` }]),
    }] : []),
    {
      heading: "Combined Totals",
      rows: [
        { label: "Total Income (W-2 + 1099)", value: `$${totalIncome.toLocaleString()}` },
        { label: "Total Withholding", value: `$${(totalW2Federal + totalW2State).toLocaleString()}` },
      ],
    },
    {
      heading: "Filing Checklist",
      rows: checklistItems.map(item => ({
        label: item,
        value: checklist.has(item) ? "Done" : "Pending",
      })),
    },
  ];

  const pdfNotes = [
    "This is an ORGANIZER WORKSHEET — it is NOT an official IRS document.",
    "Do not submit this to the IRS. Use it to organize your income documents before filing.",
  ];

  return (
    <div className="space-y-8" data-testid="w2-organizer">
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3" data-testid="irs-prep-disclaimer">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Organizer Worksheet Only.</strong> This tool helps you organize income documents. It is <strong>NOT</strong> an official IRS form and cannot be filed.
        </div>
      </div>

      {/* W-2 Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">W-2 Forms</h3>
          <button onClick={addW2} className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors" data-testid="add-w2-btn">
            <Plus className="w-4 h-4" /> Add W-2
          </button>
        </div>
        <div className="space-y-4">
          {w2s.map((w, idx) => (
            <div key={w.id} className="bg-muted/20 border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-muted-foreground">W-2 #{idx + 1}</span>
                {w2s.length > 1 && (
                  <button onClick={() => removeW2(w.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Employer</Label>
                  <Input placeholder="Company name" value={w.employer} onChange={e => updateW2(w.id, "employer", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Wages (Box 1)</Label>
                  <Input type="number" min="0" value={w.wages || ""} onChange={e => updateW2(w.id, "wages", Math.max(0, +e.target.value || 0))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Federal Withheld (Box 2)</Label>
                  <Input type="number" min="0" value={w.federalWithheld || ""} onChange={e => updateW2(w.id, "federalWithheld", Math.max(0, +e.target.value || 0))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">State Withheld (Box 17)</Label>
                  <Input type="number" min="0" value={w.stateWithheld || ""} onChange={e => updateW2(w.id, "stateWithheld", Math.max(0, +e.target.value || 0))} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1099 Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">1099 Forms</h3>
          <button onClick={add1099} className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors" data-testid="add-1099-btn">
            <Plus className="w-4 h-4" /> Add 1099
          </button>
        </div>
        {form1099s.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-xl border text-center">No 1099 forms added. Click "Add 1099" if applicable.</p>
        ) : (
          <div className="space-y-4">
            {form1099s.map((f, idx) => (
              <div key={f.id} className="bg-muted/20 border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-muted-foreground">1099 #{idx + 1}</span>
                  <button onClick={() => remove1099(f.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Payer Name</Label>
                    <Input placeholder="Client / payer" value={f.payer} onChange={e => update1099(f.id, "payer", e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Amount ($)</Label>
                    <Input type="number" min="0" value={f.amount || ""} onChange={e => update1099(f.id, "amount", Math.max(0, +e.target.value || 0))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Input placeholder="NEC, INT, DIV, etc." value={f.type} onChange={e => update1099(f.id, "type", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1">W-2 Wages</div>
          <div className="text-xl font-bold">${totalW2Wages.toLocaleString()}</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1">1099 Income</div>
          <div className="text-xl font-bold">${total1099.toLocaleString()}</div>
        </div>
        <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 text-center">
          <div className="text-xs text-primary mb-1">Total Income</div>
          <div className="text-xl font-bold text-primary" data-testid="total-income">${totalIncome.toLocaleString()}</div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
          <div className="text-xs text-emerald-700 mb-1">Total Withheld</div>
          <div className="text-xl font-bold text-emerald-700">${(totalW2Federal + totalW2State).toLocaleString()}</div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-muted/20 border rounded-xl p-6">
        <h3 className="font-bold mb-4">Filing Readiness Checklist</h3>
        <div className="space-y-2">
          {checklistItems.map(item => (
            <div
              key={item}
              onClick={() => toggleCheck(item)}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checklist.has(item) ? "bg-emerald-50 border-emerald-200" : "bg-white hover:bg-gray-50"}`}
            >
              {checklist.has(item) ? <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" /> : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />}
              <span className={`text-sm ${checklist.has(item) ? "line-through text-gray-400" : ""}`}>{item}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          {checklist.size}/{checklistItems.length} complete
        </div>
      </div>

      <TaxPDFExport title="W-2 + 1099 Income Organizer" sections={pdfSections} notes={pdfNotes} fileName="w2-1099-organizer" />
    </div>
  );
}

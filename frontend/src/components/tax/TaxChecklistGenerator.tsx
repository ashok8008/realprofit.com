"use client";
import React, { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Circle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem { id: string; text: string; checked: boolean; category: string }

const rules: { condition: (s: State) => boolean; items: { text: string; category: string }[] }[] = [
  { condition: s => s.w2, items: [
    { text: "W-2 form from each employer", category: "Forms" },
    { text: "Last pay stub of the year (verify W-2 accuracy)", category: "Forms" },
  ]},
  { condition: s => s.freelance || s.nec1099, items: [
    { text: "1099-NEC from each client paying $600+", category: "Forms" },
    { text: "Schedule C (Profit or Loss from Business)", category: "Forms" },
    { text: "1040-ES (Quarterly Estimated Tax Payments)", category: "Forms" },
    { text: "Business expense receipts and records", category: "Documents" },
    { text: "Mileage log (if applicable)", category: "Documents" },
    { text: "Home office measurements and expenses", category: "Documents" },
  ]},
  { condition: s => s.investments, items: [
    { text: "1099-DIV (Dividends and Distributions)", category: "Forms" },
    { text: "1099-B (Proceeds from Broker/Barter)", category: "Forms" },
    { text: "1099-INT (Interest Income)", category: "Forms" },
    { text: "Cost basis documentation for sold assets", category: "Documents" },
  ]},
  { condition: s => s.rental, items: [
    { text: "Rental income records", category: "Documents" },
    { text: "Rental expense receipts (repairs, insurance, property tax)", category: "Documents" },
    { text: "Schedule E (Supplemental Income/Loss)", category: "Forms" },
  ]},
  { condition: s => s.unemployment, items: [
    { text: "1099-G (Unemployment Compensation)", category: "Forms" },
  ]},
  { condition: s => s.selfEmployed, items: [
    { text: "Schedule SE (Self-Employment Tax)", category: "Forms" },
    { text: "Health insurance premium records (self-employed deduction)", category: "Documents" },
    { text: "Retirement contribution records (SEP-IRA, Solo 401k)", category: "Documents" },
  ]},
  { condition: () => true, items: [
    { text: "Social Security number for you and dependents", category: "Personal" },
    { text: "Bank account and routing number (for direct deposit of refund)", category: "Personal" },
    { text: "Copy of last year's tax return", category: "Documents" },
    { text: "Charitable donation receipts", category: "Documents" },
    { text: "Student loan interest statement (1098-E)", category: "Documents" },
    { text: "Property tax and mortgage interest (1098)", category: "Documents" },
  ]},
  { condition: s => s.filing === "mfj", items: [
    { text: "Spouse's Social Security number", category: "Personal" },
    { text: "Spouse's income documentation", category: "Documents" },
  ]},
];

// Deadlines
const deadlines = [
  { date: "January 15", desc: "Q4 estimated tax payment due" },
  { date: "January 31", desc: "W-2s and 1099s must be mailed by employers/clients" },
  { date: "April 15", desc: "Tax filing deadline (or extension) + Q1 estimated payment" },
  { date: "June 15", desc: "Q2 estimated tax payment due" },
  { date: "September 15", desc: "Q3 estimated tax payment due + extended return due" },
  { date: "October 15", desc: "Extended tax return filing deadline" },
];

interface State { w2: boolean; freelance: boolean; nec1099: boolean; investments: boolean; rental: boolean; unemployment: boolean; selfEmployed: boolean; filing: string }

export function TaxChecklistGenerator() {
  const { toast } = useToast();
  const [state, setState] = useState<State>({ w2: true, freelance: false, nec1099: false, investments: false, rental: false, unemployment: false, selfEmployed: false, filing: "single" });
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const checklist = useMemo(() => {
    const items: ChecklistItem[] = [];
    let idx = 0;
    for (const rule of rules) {
      if (rule.condition(state)) {
        for (const item of rule.items) {
          const id = `item-${idx++}`;
          if (!items.some(i => i.text === item.text)) {
            items.push({ id, text: item.text, checked: checkedItems.has(id), category: item.category });
          }
        }
      }
    }
    return items;
  }, [state, checkedItems]);

  const toggle = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleOption = (key: keyof State) => {
    if (key === "filing") return;
    setState(prev => ({ ...prev, [key]: !prev[key] }));
    setCheckedItems(new Set());
  };

  const categories = [...new Set(checklist.map(i => i.category))];
  const progress = checklist.length > 0 ? Math.round((checkedItems.size / checklist.length) * 100) : 0;

  const downloadChecklist = () => {
    const lines = [`Tax Prep Checklist — Generated ${new Date().toLocaleDateString()}\n`];
    for (const cat of categories) {
      lines.push(`\n--- ${cat} ---`);
      checklist.filter(i => i.category === cat).forEach(i => {
        lines.push(`[${checkedItems.has(i.id) ? 'X' : ' '}] ${i.text}`);
      });
    }
    lines.push("\n--- Key Deadlines ---");
    deadlines.forEach(d => lines.push(`${d.date}: ${d.desc}`));
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "tax-checklist.txt"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Checklist downloaded" });
  };

  return (
    <div className="space-y-8">
      <div className="bg-muted/30 p-6 rounded-xl border">
        <h3 className="font-bold mb-4">Your Income Situation</h3>
        <div className="flex flex-wrap gap-3 mb-4">
          {([["w2", "W-2 Employee"], ["freelance", "Freelancer"], ["nec1099", "1099-NEC"], ["investments", "Investments"], ["rental", "Rental Income"], ["unemployment", "Unemployment"], ["selfEmployed", "Self-Employed"]] as [keyof State, string][]).map(([key, label]) => (
            <button key={key} onClick={() => toggleOption(key)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${state[key] ? "bg-teal-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`} data-testid={`checklist-${key}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="max-w-xs">
          <Select value={state.filing} onValueChange={v => setState(prev => ({ ...prev, filing: v }))}>
            <SelectTrigger><SelectValue placeholder="Filing Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="mfj">Married Filing Jointly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-bold">{checklist.length} items</span>
          <span className="text-sm text-muted-foreground ml-2">{progress}% complete</span>
        </div>
        <button onClick={downloadChecklist} className="inline-flex items-center gap-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg px-4 py-2 text-sm font-bold transition-colors" data-testid="download-checklist">
          <Download className="w-4 h-4" /> Download Checklist
        </button>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      {categories.map(cat => (
        <div key={cat}>
          <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">{cat}</h4>
          <div className="space-y-2">
            {checklist.filter(i => i.category === cat).map(item => (
              <div key={item.id} onClick={() => toggle(item.id)} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checkedItems.has(item.id) ? "bg-emerald-50 border-emerald-200" : "bg-white hover:bg-gray-50"}`} data-testid={`checklist-item-${item.id}`}>
                {checkedItems.has(item.id) ? <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" /> : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />}
                <span className={`text-sm ${checkedItems.has(item.id) ? "line-through text-gray-400" : ""}`}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h4 className="font-bold text-amber-800 mb-3">Key Tax Deadlines</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {deadlines.map(d => (
            <div key={d.date} className="flex items-start gap-2">
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded whitespace-nowrap">{d.date}</span>
              <span className="text-sm text-amber-800">{d.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

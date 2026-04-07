"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { calcSETax } from "@/lib/tax/taxBrackets";
import { TaxAIExplain } from "@/components/tax/TaxAIExplain";
import { TaxPDFExport } from "@/components/tax/TaxPDFExport";
import { getRuleBasedSEExplanation } from "@/lib/tax/useTaxAI";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";

interface ExpenseRow { id: number; category: string; amount: number }

let nextId = 1;

const DEFAULT_EXPENSES: ExpenseRow[] = [
  { id: nextId++, category: "Advertising", amount: 0 },
  { id: nextId++, category: "Office Supplies", amount: 0 },
  { id: nextId++, category: "Software & Subscriptions", amount: 0 },
  { id: nextId++, category: "Travel", amount: 0 },
  { id: nextId++, category: "Home Office", amount: 0 },
  { id: nextId++, category: "Professional Services", amount: 0 },
];

export function ScheduleCPrep() {
  const [businessName, setBusinessName] = useState("My Business");
  const [grossRevenue, setGrossRevenue] = useState(85000);
  const [costOfGoods, setCostOfGoods] = useState(0);
  const [expenses, setExpenses] = useState<ExpenseRow[]>(DEFAULT_EXPENSES);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const grossProfit = grossRevenue - costOfGoods;
  const netProfit = grossProfit - totalExpenses;
  const se = calcSETax(netProfit);

  const addExpense = () => setExpenses(prev => [...prev, { id: nextId++, category: "", amount: 0 }]);
  const removeExpense = (id: number) => setExpenses(prev => prev.filter(e => e.id !== id));
  const updateExpense = (id: number, field: "category" | "amount", value: string | number) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const pdfSections = [
    {
      heading: `Business: ${businessName}`,
      rows: [
        { label: "Gross Revenue (Line 1)", value: `$${grossRevenue.toLocaleString()}` },
        { label: "Cost of Goods Sold (Line 4)", value: `$${costOfGoods.toLocaleString()}` },
        { label: "Gross Profit (Line 7)", value: `$${grossProfit.toLocaleString()}` },
      ],
    },
    {
      heading: "Business Expenses (Part II)",
      rows: expenses.filter(e => e.amount > 0).map(e => ({
        label: e.category || "Uncategorized",
        value: `$${e.amount.toLocaleString()}`,
      })).concat([{ label: "Total Expenses (Line 28)", value: `$${totalExpenses.toLocaleString()}` }]),
    },
    {
      heading: "Net Profit & Self-Employment Tax",
      rows: [
        { label: "Net Profit (Line 31)", value: `$${Math.round(netProfit).toLocaleString()}` },
        { label: "Estimated SE Tax", value: `$${Math.round(se.seTax).toLocaleString()}` },
        { label: "Deductible Half of SE Tax", value: `$${Math.round(se.deductibleHalf).toLocaleString()}` },
      ],
    },
  ];

  const pdfNotes = [
    "This is a PREP SUMMARY ONLY — it is NOT an official IRS Schedule C.",
    "Do not submit this document to the IRS. Use it to organize data for your actual Schedule C filing.",
    "Verify all amounts against receipts and bank statements before filing.",
  ];

  const fallback = getRuleBasedSEExplanation({
    netIncome: netProfit,
    seTax: se.seTax,
    deductibleHalf: se.deductibleHalf,
    netAfterSE: netProfit - se.seTax,
  });

  const aiPrompt = `Schedule C prep for "${businessName}": Gross revenue $${grossRevenue}, COGS $${costOfGoods}, total expenses $${totalExpenses}, net profit $${Math.round(netProfit)}. SE tax $${Math.round(se.seTax)}. Expense categories: ${expenses.filter(e => e.amount > 0).map(e => `${e.category}: $${e.amount}`).join(", ")}. Explain key insights and suggest deduction strategies.`;

  return (
    <div className="space-y-8" data-testid="schedule-c-prep">
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3" data-testid="irs-prep-disclaimer">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Prep Summary Only.</strong> This tool helps you organize business income and expenses. It is <strong>NOT</strong> an official IRS Schedule C and cannot be submitted to the IRS.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Business Name</Label>
          <Input value={businessName} onChange={e => setBusinessName(e.target.value)} data-testid="biz-name" />
        </div>
        <div className="space-y-2">
          <Label>Gross Revenue ($)</Label>
          <Input type="number" min="0" value={grossRevenue} onChange={e => setGrossRevenue(Math.max(0, +e.target.value || 0))} data-testid="gross-revenue" />
        </div>
        <div className="space-y-2">
          <Label>Cost of Goods Sold ($)</Label>
          <Input type="number" min="0" value={costOfGoods} onChange={e => setCostOfGoods(Math.max(0, +e.target.value || 0))} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">Business Expenses</h3>
          <button onClick={addExpense} className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors" data-testid="add-expense-btn">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
        <div className="space-y-3">
          {expenses.map(exp => (
            <div key={exp.id} className="flex items-center gap-3">
              <Input
                className="flex-1"
                placeholder="Category (e.g., Office Supplies)"
                value={exp.category}
                onChange={e => updateExpense(exp.id, "category", e.target.value)}
              />
              <Input
                className="w-32"
                type="number"
                min="0"
                placeholder="Amount"
                value={exp.amount || ""}
                onChange={e => updateExpense(exp.id, "amount", Math.max(0, +e.target.value || 0))}
              />
              <button onClick={() => removeExpense(exp.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1">Gross Revenue</div>
          <div className="text-xl font-bold">${grossRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1">Total Expenses</div>
          <div className="text-xl font-bold">${totalExpenses.toLocaleString()}</div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
          <div className="text-xs text-emerald-700 mb-1">Net Profit</div>
          <div className="text-xl font-bold text-emerald-700" data-testid="net-profit">${Math.round(netProfit).toLocaleString()}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-center">
          <div className="text-xs text-orange-700 mb-1">SE Tax</div>
          <div className="text-xl font-bold text-orange-700">${Math.round(se.seTax).toLocaleString()}</div>
        </div>
      </div>

      <TaxPDFExport title="Schedule C Prep Summary" sections={pdfSections} notes={pdfNotes} fileName="schedule-c-prep" />

      <TaxAIExplain prompt={aiPrompt} fallback={fallback} label="Explain My Business Taxes" />
    </div>
  );
}

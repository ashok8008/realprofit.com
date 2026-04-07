"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calcFederalTax, calcSETax, STANDARD_DEDUCTION_SINGLE, STANDARD_DEDUCTION_MFJ, QUARTERLY_DUE_DATES } from "@/lib/tax/taxBrackets";
import { TaxAIExplain } from "@/components/tax/TaxAIExplain";
import { TaxPDFExport } from "@/components/tax/TaxPDFExport";
import { getRuleBasedPlanningExplanation } from "@/lib/tax/useTaxAI";
import { AlertTriangle } from "lucide-react";

export function Form1040ESPrep() {
  const [filing, setFiling] = useState<"single" | "mfj">("single");
  const [wages, setWages] = useState(0);
  const [freelanceIncome, setFreelanceIncome] = useState(60000);
  const [freelanceExpenses, setFreelanceExpenses] = useState(12000);
  const [otherIncome, setOtherIncome] = useState(0);
  const [stateRate, setStateRate] = useState(5);
  const [priorYearTax, setPriorYearTax] = useState(0);
  const [withholding, setWithholding] = useState(0);

  const netSE = freelanceIncome - freelanceExpenses;
  const se = calcSETax(netSE);
  const deduction = filing === "mfj" ? STANDARD_DEDUCTION_MFJ : STANDARD_DEDUCTION_SINGLE;
  const adjustedIncome = wages + netSE + otherIncome - se.deductibleHalf;
  const taxableIncome = Math.max(0, adjustedIncome - deduction);
  const federalTax = calcFederalTax(taxableIncome, filing);
  const stateTax = taxableIncome * (stateRate / 100);
  const totalTax = federalTax + se.seTax + stateTax;
  const amountOwed = Math.max(0, totalTax - withholding);
  const quarterlyPayment = Math.round(amountOwed / 4);

  const safeHarbor = Math.max(totalTax * 0.9, priorYearTax);
  const requiredPayment = Math.max(0, Math.round((safeHarbor - withholding) / 4));

  const pdfSections = [
    {
      heading: "Income Summary",
      rows: [
        { label: "W-2 Wages", value: `$${wages.toLocaleString()}` },
        { label: "Self-Employment Income", value: `$${freelanceIncome.toLocaleString()}` },
        { label: "Business Expenses", value: `($${freelanceExpenses.toLocaleString()})` },
        { label: "Net Self-Employment", value: `$${netSE.toLocaleString()}` },
        { label: "Other Income", value: `$${otherIncome.toLocaleString()}` },
      ],
    },
    {
      heading: "Tax Calculation",
      rows: [
        { label: "Filing Status", value: filing === "mfj" ? "Married Filing Jointly" : "Single" },
        { label: `Standard Deduction`, value: `($${deduction.toLocaleString()})` },
        { label: "Taxable Income", value: `$${Math.round(taxableIncome).toLocaleString()}` },
        { label: "Federal Income Tax", value: `$${Math.round(federalTax).toLocaleString()}` },
        { label: "Self-Employment Tax", value: `$${Math.round(se.seTax).toLocaleString()}` },
        { label: `State Tax (${stateRate}%)`, value: `$${Math.round(stateTax).toLocaleString()}` },
        { label: "Total Estimated Tax", value: `$${Math.round(totalTax).toLocaleString()}` },
      ],
    },
    {
      heading: "Quarterly Estimated Payments",
      rows: QUARTERLY_DUE_DATES.map(q => ({
        label: `${q.quarter} — Due ${q.due} (${q.period})`,
        value: `$${requiredPayment.toLocaleString()}`,
      })),
    },
  ];

  const pdfNotes = [
    "This is a PREP WORKSHEET ONLY — it is NOT an official IRS Form 1040-ES.",
    "Do not submit this document to the IRS. Use it to prepare your actual 1040-ES filing.",
    "Estimates may vary. Consult a qualified tax professional for your specific situation.",
  ];

  const fallback = getRuleBasedPlanningExplanation({
    annualIncome: wages + freelanceIncome + otherIncome,
    annualExpenses: freelanceExpenses,
    annualNet: adjustedIncome,
    estimatedTax: totalTax,
    quarterlyAmount: requiredPayment,
  });

  const aiPrompt = `1040-ES quarterly tax prep: Filing ${filing}. W-2 wages $${wages}, SE income $${freelanceIncome}, expenses $${freelanceExpenses}, other $${otherIncome}. Federal tax $${Math.round(federalTax)}, SE tax $${Math.round(se.seTax)}, state tax $${Math.round(stateTax)}. Withholding $${withholding}. Prior year tax $${priorYearTax}. Quarterly payment needed: $${requiredPayment}. Explain key insights and safe harbor rules.`;

  return (
    <div className="space-y-8" data-testid="form-1040es-prep">
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3" data-testid="irs-prep-disclaimer">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Prep Worksheet Only.</strong> This tool helps you estimate quarterly payments. It is <strong>NOT</strong> an official IRS form and cannot be submitted to the IRS. Always use the actual Form 1040-ES for filing.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Filing Status</Label>
          <Select value={filing} onValueChange={v => setFiling(v as "single" | "mfj")}>
            <SelectTrigger data-testid="filing-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="mfj">Married Filing Jointly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>W-2 Wages ($)</Label>
          <Input type="number" min="0" value={wages} onChange={e => setWages(Math.max(0, +e.target.value || 0))} data-testid="wages-input" />
        </div>
        <div className="space-y-2">
          <Label>Self-Employment Income ($)</Label>
          <Input type="number" min="0" value={freelanceIncome} onChange={e => setFreelanceIncome(Math.max(0, +e.target.value || 0))} data-testid="se-income-input" />
        </div>
        <div className="space-y-2">
          <Label>Business Expenses ($)</Label>
          <Input type="number" min="0" value={freelanceExpenses} onChange={e => setFreelanceExpenses(Math.max(0, +e.target.value || 0))} data-testid="se-expenses-input" />
        </div>
        <div className="space-y-2">
          <Label>Other Income ($)</Label>
          <Input type="number" min="0" value={otherIncome} onChange={e => setOtherIncome(Math.max(0, +e.target.value || 0))} />
        </div>
        <div className="space-y-2">
          <Label>State Tax Rate (%)</Label>
          <Input type="number" min="0" max="15" step="0.1" value={stateRate} onChange={e => setStateRate(Math.max(0, Math.min(15, +e.target.value || 0)))} />
        </div>
        <div className="space-y-2">
          <Label>W-2 Withholding ($)</Label>
          <Input type="number" min="0" value={withholding} onChange={e => setWithholding(Math.max(0, +e.target.value || 0))} />
          <p className="text-xs text-muted-foreground">Tax already withheld from paychecks</p>
        </div>
        <div className="space-y-2">
          <Label>Prior Year Total Tax ($)</Label>
          <Input type="number" min="0" value={priorYearTax} onChange={e => setPriorYearTax(Math.max(0, +e.target.value || 0))} />
          <p className="text-xs text-muted-foreground">For safe harbor calculation</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1">Federal Tax</div>
          <div className="text-xl font-bold">${Math.round(federalTax).toLocaleString()}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-center">
          <div className="text-xs text-orange-700 mb-1">SE Tax</div>
          <div className="text-xl font-bold text-orange-700">${Math.round(se.seTax).toLocaleString()}</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
          <div className="text-xs text-amber-700 mb-1">State Tax</div>
          <div className="text-xl font-bold text-amber-700">${Math.round(stateTax).toLocaleString()}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
          <div className="text-xs text-red-700 mb-1">Total Estimated</div>
          <div className="text-xl font-bold text-red-700">${Math.round(totalTax).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
        <div className="text-sm font-medium text-muted-foreground mb-1">Quarterly Payment (Safe Harbor)</div>
        <div className="text-4xl font-serif font-bold text-primary" data-testid="quarterly-payment">${requiredPayment.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground mt-2">
          Based on max(90% current year, 100% prior year) minus withholding
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUARTERLY_DUE_DATES.map(q => (
          <div key={q.quarter} className="bg-muted/30 p-3 rounded-lg border text-center">
            <div className="text-xs font-bold text-muted-foreground">{q.quarter}</div>
            <div className="font-bold mt-1">${requiredPayment.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Due {q.due}</div>
            <div className="text-[10px] text-muted-foreground">{q.period}</div>
          </div>
        ))}
      </div>

      <TaxPDFExport title="1040-ES Prep Worksheet" sections={pdfSections} notes={pdfNotes} fileName="1040es-prep-worksheet" />

      <TaxAIExplain prompt={aiPrompt} fallback={fallback} label="Explain My Quarterly Taxes" />
    </div>
  );
}

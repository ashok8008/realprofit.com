"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calcFederalTax, calcSETax, STANDARD_DEDUCTION_SINGLE, STANDARD_DEDUCTION_MFJ, getMarginalBracket } from "@/lib/tax/taxBrackets";
import { TaxAIExplain } from "@/components/tax/TaxAIExplain";
import { TaxPDFExport } from "@/components/tax/TaxPDFExport";
import { getRuleBasedIRSPrepExplanation } from "@/lib/tax/useTaxAI";
import { AlertTriangle } from "lucide-react";

export function TaxSummaryPDFTool() {
  const [filing, setFiling] = useState<"single" | "mfj">("single");
  const [wages, setWages] = useState(70000);
  const [freelanceNet, setFreelanceNet] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);
  const [stateRate, setStateRate] = useState(5);
  const [itemizedDeductions, setItemizedDeductions] = useState(0);
  const [retirementContributions, setRetirementContributions] = useState(0);
  const [taxCredits, setTaxCredits] = useState(0);
  const [withholding, setWithholding] = useState(0);
  const [estimatedPaid, setEstimatedPaid] = useState(0);

  const se = freelanceNet > 0 ? calcSETax(freelanceNet) : { seTax: 0, deductibleHalf: 0, seTaxable: 0 };
  const standardDed = filing === "mfj" ? STANDARD_DEDUCTION_MFJ : STANDARD_DEDUCTION_SINGLE;
  const deduction = Math.max(standardDed, itemizedDeductions);
  const usedStandard = deduction === standardDed;
  const totalGross = wages + freelanceNet + otherIncome;
  const agi = totalGross - se.deductibleHalf - retirementContributions;
  const taxableIncome = Math.max(0, agi - deduction);
  const federalTax = calcFederalTax(taxableIncome, filing);
  const stateTax = taxableIncome * (stateRate / 100);
  const totalTax = Math.max(0, federalTax + se.seTax + stateTax - taxCredits);
  const totalPaid = withholding + estimatedPaid;
  const balance = totalTax - totalPaid;
  const effectiveRate = totalGross > 0 ? (totalTax / totalGross) * 100 : 0;
  const marginal = getMarginalBracket(taxableIncome, filing);

  const pdfSections = [
    {
      heading: "Personal Information",
      rows: [
        { label: "Filing Status", value: filing === "mfj" ? "Married Filing Jointly" : "Single" },
        { label: "Tax Year", value: "2025" },
      ],
    },
    {
      heading: "Income",
      rows: [
        { label: "W-2 Wages", value: `$${wages.toLocaleString()}` },
        { label: "Self-Employment Net Income", value: `$${freelanceNet.toLocaleString()}` },
        { label: "Other Income", value: `$${otherIncome.toLocaleString()}` },
        { label: "Total Gross Income", value: `$${totalGross.toLocaleString()}` },
      ],
    },
    {
      heading: "Adjustments & Deductions",
      rows: [
        { label: "Retirement Contributions", value: `($${retirementContributions.toLocaleString()})` },
        { label: "½ SE Tax Deduction", value: `($${Math.round(se.deductibleHalf).toLocaleString()})` },
        { label: "Adjusted Gross Income (AGI)", value: `$${Math.round(agi).toLocaleString()}` },
        { label: `Deduction (${usedStandard ? "Standard" : "Itemized"})`, value: `($${deduction.toLocaleString()})` },
        { label: "Taxable Income", value: `$${Math.round(taxableIncome).toLocaleString()}` },
      ],
    },
    {
      heading: "Tax Summary",
      rows: [
        { label: "Federal Income Tax", value: `$${Math.round(federalTax).toLocaleString()}` },
        { label: "Self-Employment Tax", value: `$${Math.round(se.seTax).toLocaleString()}` },
        { label: `State Tax (${stateRate}%)`, value: `$${Math.round(stateTax).toLocaleString()}` },
        { label: "Tax Credits", value: `($${taxCredits.toLocaleString()})` },
        { label: "Total Tax Liability", value: `$${Math.round(totalTax).toLocaleString()}` },
      ],
    },
    {
      heading: "Payments & Balance",
      rows: [
        { label: "W-2 Withholding", value: `$${withholding.toLocaleString()}` },
        { label: "Estimated Payments Made", value: `$${estimatedPaid.toLocaleString()}` },
        { label: "Total Paid", value: `$${totalPaid.toLocaleString()}` },
        { label: balance >= 0 ? "Amount Owed" : "Refund Due", value: `$${Math.abs(Math.round(balance)).toLocaleString()}` },
      ],
    },
    {
      heading: "Key Rates",
      rows: [
        { label: "Effective Tax Rate", value: `${effectiveRate.toFixed(1)}%` },
        { label: "Marginal Tax Bracket", value: `${marginal}%` },
      ],
    },
  ];

  const pdfNotes = [
    "This is an INFORMATIONAL PREP SUMMARY — it is NOT an official IRS tax return.",
    "Do not submit this document to the IRS. Use it alongside your tax documents for reference.",
    "All figures are estimates. Consult a tax professional for accurate filing.",
  ];

  const fallback = getRuleBasedIRSPrepExplanation({
    totalIncome: totalGross,
    totalDeductions: deduction + se.deductibleHalf + retirementContributions,
    estimatedTax: totalTax,
  });

  const aiPrompt = `Tax summary: Filing ${filing}. Wages $${wages}, SE net $${freelanceNet}, other $${otherIncome}. AGI $${Math.round(agi)}. Deduction $${deduction} (${usedStandard ? "standard" : "itemized"}). Taxable $${Math.round(taxableIncome)}. Federal tax $${Math.round(federalTax)}, SE tax $${Math.round(se.seTax)}, state tax $${Math.round(stateTax)}, credits $${taxCredits}. Total tax $${Math.round(totalTax)}. Paid $${totalPaid}. Balance ${balance >= 0 ? "owed" : "refund"}: $${Math.abs(Math.round(balance))}. Effective rate ${effectiveRate.toFixed(1)}%. Explain summary and suggest improvements.`;

  return (
    <div className="space-y-8" data-testid="tax-summary-pdf-tool">
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3" data-testid="irs-prep-disclaimer">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Informational Summary Only.</strong> This generates a prep summary document for your records. It is <strong>NOT</strong> an official tax return and cannot be submitted to the IRS.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Filing Status</Label>
          <Select value={filing} onValueChange={v => setFiling(v as "single" | "mfj")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="mfj">Married Filing Jointly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>W-2 Wages ($)</Label>
          <Input type="number" min="0" value={wages} onChange={e => setWages(Math.max(0, +e.target.value || 0))} data-testid="summary-wages" />
        </div>
        <div className="space-y-2">
          <Label>SE Net Income ($)</Label>
          <Input type="number" min="0" value={freelanceNet} onChange={e => setFreelanceNet(Math.max(0, +e.target.value || 0))} />
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
          <Label>Itemized Deductions ($)</Label>
          <Input type="number" min="0" value={itemizedDeductions} onChange={e => setItemizedDeductions(Math.max(0, +e.target.value || 0))} />
          <p className="text-xs text-muted-foreground">Leave 0 to use standard deduction</p>
        </div>
        <div className="space-y-2">
          <Label>Retirement Contributions ($)</Label>
          <Input type="number" min="0" value={retirementContributions} onChange={e => setRetirementContributions(Math.max(0, +e.target.value || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Tax Credits ($)</Label>
          <Input type="number" min="0" value={taxCredits} onChange={e => setTaxCredits(Math.max(0, +e.target.value || 0))} />
        </div>
        <div className="space-y-2">
          <Label>W-2 Withholding ($)</Label>
          <Input type="number" min="0" value={withholding} onChange={e => setWithholding(Math.max(0, +e.target.value || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Estimated Tax Payments ($)</Label>
          <Input type="number" min="0" value={estimatedPaid} onChange={e => setEstimatedPaid(Math.max(0, +e.target.value || 0))} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1">Total Gross</div>
          <div className="text-xl font-bold">${totalGross.toLocaleString()}</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1">Taxable Income</div>
          <div className="text-xl font-bold">${Math.round(taxableIncome).toLocaleString()}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
          <div className="text-xs text-red-700 mb-1">Total Tax</div>
          <div className="text-xl font-bold text-red-700">${Math.round(totalTax).toLocaleString()}</div>
        </div>
      </div>

      <div className={`${balance >= 0 ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"} border rounded-xl p-6 text-center`}>
        <div className="text-sm font-medium text-muted-foreground mb-1">
          {balance >= 0 ? "Estimated Amount Owed" : "Estimated Refund"}
        </div>
        <div className={`text-4xl font-serif font-bold ${balance >= 0 ? "text-red-700" : "text-emerald-700"}`} data-testid="balance-amount">
          ${Math.abs(Math.round(balance)).toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Effective Rate: {effectiveRate.toFixed(1)}% | Marginal: {marginal}%
        </div>
      </div>

      <TaxPDFExport title="Tax Prep Summary" sections={pdfSections} notes={pdfNotes} fileName="tax-prep-summary" />

      <TaxAIExplain prompt={aiPrompt} fallback={fallback} label="Summarize My Tax Situation" />
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calcFederalTax, calcSETax, STANDARD_DEDUCTION_SINGLE, STANDARD_DEDUCTION_MFJ, getMarginalBracket, QUARTERLY_DUE_DATES } from "@/lib/tax/taxBrackets";
import { TaxAIExplain } from "@/components/tax/TaxAIExplain";
import { getRuleBasedIRSPrepExplanation } from "@/lib/tax/useTaxAI";
import { AlertTriangle, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";

export function YearEndPacket() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [filing, setFiling] = useState<"single" | "mfj">("single");
  const [wages, setWages] = useState(70000);
  const [freelanceRevenue, setFreelanceRevenue] = useState(40000);
  const [freelanceExpenses, setFreelanceExpenses] = useState(8000);
  const [otherIncome, setOtherIncome] = useState(0);
  const [stateRate, setStateRate] = useState(5);
  const [withholding, setWithholding] = useState(0);
  const [estimatedPaid, setEstimatedPaid] = useState(0);
  const [retirementContrib, setRetirementContrib] = useState(0);
  const [charitableDonations, setCharitableDonations] = useState(0);
  const [mortgageInterest, setMortgageInterest] = useState(0);

  const freelanceNet = freelanceRevenue - freelanceExpenses;
  const se = freelanceNet > 0 ? calcSETax(freelanceNet) : { seTax: 0, deductibleHalf: 0, seTaxable: 0 };
  const standardDed = filing === "mfj" ? STANDARD_DEDUCTION_MFJ : STANDARD_DEDUCTION_SINGLE;
  const itemizedTotal = charitableDonations + mortgageInterest;
  const deduction = Math.max(standardDed, itemizedTotal);
  const totalGross = wages + freelanceNet + otherIncome;
  const agi = totalGross - se.deductibleHalf - retirementContrib;
  const taxableIncome = Math.max(0, agi - deduction);
  const federalTax = calcFederalTax(taxableIncome, filing);
  const stateTax = taxableIncome * (stateRate / 100);
  const totalTax = federalTax + se.seTax + stateTax;
  const totalPaid = withholding + estimatedPaid;
  const balance = totalTax - totalPaid;
  const effectiveRate = totalGross > 0 ? (totalTax / totalGross) * 100 : 0;
  const marginal = getMarginalBracket(taxableIncome, filing);

  const generatePacket = () => {
    const doc = new jsPDF();
    let y = 20;
    const lm = 20;
    const pw = 170;

    const addPageIfNeeded = (needed: number) => {
      if (y + needed > 275) { doc.addPage(); y = 20; }
    };

    const heading = (text: string) => {
      addPageIfNeeded(20);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(text, lm, y);
      y += 7;
      doc.setDrawColor(0, 150, 136);
      doc.setLineWidth(0.5);
      doc.line(lm, y, lm + pw, y);
      y += 6;
    };

    const row = (label: string, value: string) => {
      addPageIfNeeded(8);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(label, lm, y);
      doc.text(value, lm + pw - doc.getTextWidth(value), y);
      y += 6;
    };

    // Title page
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Year-End Tax Packet", lm, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Prepared for: ${name || "Taxpayer"} | Tax Year 2025`, lm, y);
    y += 5;
    doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, lm, y);
    doc.setTextColor(0);
    y += 5;

    // Disclaimer bar
    doc.setFillColor(255, 243, 205);
    doc.rect(lm, y, pw, 12, "F");
    doc.setFontSize(8);
    doc.setTextColor(120, 80, 0);
    doc.text("PREP DOCUMENT ONLY — NOT for IRS submission. For reference and filing preparation only.", lm + 3, y + 5);
    doc.text("This is NOT an official tax return. Consult a tax professional before filing.", lm + 3, y + 9);
    doc.setTextColor(0);
    y += 18;

    // Section 1: Income summary
    heading("Section 1: Income Summary");
    row("W-2 Wages", `$${wages.toLocaleString()}`);
    row("Self-Employment Revenue", `$${freelanceRevenue.toLocaleString()}`);
    row("Business Expenses", `($${freelanceExpenses.toLocaleString()})`);
    row("Net Self-Employment", `$${freelanceNet.toLocaleString()}`);
    row("Other Income", `$${otherIncome.toLocaleString()}`);
    row("Total Gross Income", `$${totalGross.toLocaleString()}`);
    y += 4;

    // Section 2: Schedule C summary
    heading("Section 2: Schedule C Summary");
    row("Gross Revenue", `$${freelanceRevenue.toLocaleString()}`);
    row("Total Business Expenses", `($${freelanceExpenses.toLocaleString()})`);
    row("Net Profit (Line 31)", `$${freelanceNet.toLocaleString()}`);
    row("SE Tax", `$${Math.round(se.seTax).toLocaleString()}`);
    row("Deductible Half of SE Tax", `$${Math.round(se.deductibleHalf).toLocaleString()}`);
    y += 4;

    // Section 3: Deductions
    heading("Section 3: Deductions & Adjustments");
    row("Standard Deduction", `$${standardDed.toLocaleString()}`);
    row("Charitable Donations", `$${charitableDonations.toLocaleString()}`);
    row("Mortgage Interest", `$${mortgageInterest.toLocaleString()}`);
    row("Itemized Total", `$${itemizedTotal.toLocaleString()}`);
    row(`Deduction Used (${deduction === standardDed ? "Standard" : "Itemized"})`, `$${deduction.toLocaleString()}`);
    row("Retirement Contributions", `$${retirementContrib.toLocaleString()}`);
    y += 4;

    // Section 4: Tax calculation
    heading("Section 4: Tax Calculation");
    row("Filing Status", filing === "mfj" ? "Married Filing Jointly" : "Single");
    row("Adjusted Gross Income", `$${Math.round(agi).toLocaleString()}`);
    row("Taxable Income", `$${Math.round(taxableIncome).toLocaleString()}`);
    row("Federal Income Tax", `$${Math.round(federalTax).toLocaleString()}`);
    row("Self-Employment Tax", `$${Math.round(se.seTax).toLocaleString()}`);
    row(`State Tax (${stateRate}%)`, `$${Math.round(stateTax).toLocaleString()}`);
    row("Total Tax Liability", `$${Math.round(totalTax).toLocaleString()}`);
    y += 4;

    // Section 5: Payments
    heading("Section 5: Payments & Balance");
    row("W-2 Withholding", `$${withholding.toLocaleString()}`);
    row("Estimated Payments Made", `$${estimatedPaid.toLocaleString()}`);
    row("Total Paid", `$${totalPaid.toLocaleString()}`);
    doc.setFont("helvetica", "bold");
    row(balance >= 0 ? "AMOUNT OWED" : "REFUND DUE", `$${Math.abs(Math.round(balance)).toLocaleString()}`);
    doc.setFont("helvetica", "normal");
    y += 4;

    // Section 6: Key rates
    heading("Section 6: Key Rates & Reference");
    row("Effective Tax Rate", `${effectiveRate.toFixed(1)}%`);
    row("Marginal Tax Bracket", `${marginal}%`);
    y += 4;

    // Quarterly dates
    heading("Quarterly Payment Schedule (Next Year)");
    QUARTERLY_DUE_DATES.forEach(q => {
      row(`${q.quarter} (${q.period})`, `Due ${q.due}`);
    });

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(`RealProfits.com — Year-End Tax Packet | Page ${i} of ${pageCount}`, lm, 290);
      doc.text("PREP ONLY — Not for IRS submission. Informational estimates only.", lm, 285);
    }

    doc.save("year-end-tax-packet.pdf");
    toast({ title: "Tax packet downloaded", description: "Your year-end tax packet has been saved as PDF." });
  };

  const fallback = getRuleBasedIRSPrepExplanation({
    totalIncome: totalGross,
    totalDeductions: deduction + se.deductibleHalf + retirementContrib,
    estimatedTax: totalTax,
  });

  const aiPrompt = `Year-end tax packet: ${name || "Taxpayer"}, filing ${filing}. Wages $${wages}, SE revenue $${freelanceRevenue}, expenses $${freelanceExpenses}, other $${otherIncome}. Retirement $${retirementContrib}, charitable $${charitableDonations}, mortgage interest $${mortgageInterest}. Federal $${Math.round(federalTax)}, SE tax $${Math.round(se.seTax)}, state $${Math.round(stateTax)}. Total tax $${Math.round(totalTax)}, paid $${totalPaid}. ${balance >= 0 ? "Owes" : "Refund"} $${Math.abs(Math.round(balance))}. Effective rate ${effectiveRate.toFixed(1)}%. Provide year-end tax insights and next-year planning tips.`;

  return (
    <div className="space-y-8" data-testid="year-end-packet">
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3" data-testid="irs-prep-disclaimer">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Prep Document Only.</strong> This generates a comprehensive tax prep packet for your records. It is <strong>NOT</strong> an official tax return and <strong>cannot</strong> be submitted to the IRS.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Your Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="For the PDF cover" data-testid="packet-name" />
        </div>
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
          <Input type="number" min="0" value={wages} onChange={e => setWages(Math.max(0, +e.target.value || 0))} data-testid="packet-wages" />
        </div>
        <div className="space-y-2">
          <Label>SE Revenue ($)</Label>
          <Input type="number" min="0" value={freelanceRevenue} onChange={e => setFreelanceRevenue(Math.max(0, +e.target.value || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Business Expenses ($)</Label>
          <Input type="number" min="0" value={freelanceExpenses} onChange={e => setFreelanceExpenses(Math.max(0, +e.target.value || 0))} />
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
        </div>
        <div className="space-y-2">
          <Label>Est. Payments Made ($)</Label>
          <Input type="number" min="0" value={estimatedPaid} onChange={e => setEstimatedPaid(Math.max(0, +e.target.value || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Retirement Contributions ($)</Label>
          <Input type="number" min="0" value={retirementContrib} onChange={e => setRetirementContrib(Math.max(0, +e.target.value || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Charitable Donations ($)</Label>
          <Input type="number" min="0" value={charitableDonations} onChange={e => setCharitableDonations(Math.max(0, +e.target.value || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Mortgage Interest ($)</Label>
          <Input type="number" min="0" value={mortgageInterest} onChange={e => setMortgageInterest(Math.max(0, +e.target.value || 0))} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1">Total Gross</div>
          <div className="text-xl font-bold">${totalGross.toLocaleString()}</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1">Federal Tax</div>
          <div className="text-xl font-bold">${Math.round(federalTax).toLocaleString()}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-center">
          <div className="text-xs text-orange-700 mb-1">SE Tax</div>
          <div className="text-xl font-bold text-orange-700">${Math.round(se.seTax).toLocaleString()}</div>
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
        <div className={`text-4xl font-serif font-bold ${balance >= 0 ? "text-red-700" : "text-emerald-700"}`} data-testid="packet-balance">
          ${Math.abs(Math.round(balance)).toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Effective Rate: {effectiveRate.toFixed(1)}% | Marginal: {marginal}%
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={generatePacket}
          className="inline-flex items-center gap-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg px-6 py-3 font-bold transition-colors"
          data-testid="download-packet-btn"
        >
          <Download className="w-5 h-5" /> Download Year-End Tax Packet (PDF)
        </button>
      </div>

      <TaxAIExplain prompt={aiPrompt} fallback={fallback} label="Year-End Tax Insights" />
    </div>
  );
}

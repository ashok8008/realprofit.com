"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calcFederalTax, calcSETax, STANDARD_DEDUCTION_SINGLE, STANDARD_DEDUCTION_MFJ, getMarginalBracket, QUARTERLY_DUE_DATES } from "@/lib/tax/taxBrackets";
import { TaxAIExplain } from "@/components/tax/TaxAIExplain";
import { getRuleBasedIRSPrepExplanation } from "@/lib/tax/useTaxAI";
import { AlertTriangle, Download } from "lucide-react";
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
    const { jsPDF } = require("jspdf");
    const { drawHeader, drawFooter, drawSectionHeading, drawKVRow, drawRule, drawStatCard, BRAND, LM, PW, PAGE_W, PAGE_H } = require("@/lib/pdf-brand");
    const doc = new jsPDF();

    let y = drawHeader(doc, "Year-End Tax Packet", `Prepared for: ${name || "Taxpayer"} | Tax Year 2025`);

    // Disclaimer bar
    doc.setFillColor(255, 243, 205);
    doc.roundedRect(LM, y, PW, 12, 2, 2, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120, 80, 0);
    doc.text("PREP DOCUMENT ONLY \u2014 NOT for IRS submission. For reference and filing preparation only.", LM + 4, y + 5);
    doc.text("This is NOT an official tax return. Consult a tax professional before filing.", LM + 4, y + 10);
    doc.setTextColor(0, 0, 0);
    y += 18;

    // Summary stat cards
    const cw = (PW - 15) / 4;
    drawStatCard(doc, "Total Gross", `$${totalGross.toLocaleString()}`, LM, y, cw, 22, BRAND.dark);
    drawStatCard(doc, "Federal Tax", `$${Math.round(federalTax).toLocaleString()}`, LM + cw + 5, y, cw, 22, BRAND.blue);
    drawStatCard(doc, "SE Tax", `$${Math.round(se.seTax).toLocaleString()}`, LM + (cw + 5) * 2, y, cw, 22, BRAND.amber);
    drawStatCard(doc, balance >= 0 ? "Owed" : "Refund", `$${Math.abs(Math.round(balance)).toLocaleString()}`, LM + (cw + 5) * 3, y, cw, 22, balance >= 0 ? BRAND.red : BRAND.green);
    y += 30;

    const checkPage = (needed: number) => { if (y + needed > PAGE_H - 25) { doc.addPage(); y = 15; } };

    // Section 1: Income Summary
    checkPage(50);
    y = drawSectionHeading(doc, "Section 1: Income Summary", y);
    y = drawKVRow(doc, "W-2 Wages", `$${wages.toLocaleString()}`, y);
    y = drawKVRow(doc, "Self-Employment Revenue", `$${freelanceRevenue.toLocaleString()}`, y);
    y = drawKVRow(doc, "Business Expenses", `($${freelanceExpenses.toLocaleString()})`, y);
    y = drawKVRow(doc, "Net Self-Employment", `$${freelanceNet.toLocaleString()}`, y, { bold: true, color: BRAND.accent });
    y = drawKVRow(doc, "Other Income", `$${otherIncome.toLocaleString()}`, y);
    y = drawKVRow(doc, "Total Gross Income", `$${totalGross.toLocaleString()}`, y, { bold: true, color: BRAND.dark, size: 11 });
    y = drawRule(doc, y);

    // Section 2: Schedule C
    checkPage(40);
    y = drawSectionHeading(doc, "Section 2: Schedule C Summary", y);
    y = drawKVRow(doc, "Gross Revenue", `$${freelanceRevenue.toLocaleString()}`, y);
    y = drawKVRow(doc, "Total Business Expenses", `($${freelanceExpenses.toLocaleString()})`, y);
    y = drawKVRow(doc, "Net Profit (Line 31)", `$${freelanceNet.toLocaleString()}`, y, { bold: true, color: BRAND.accent });
    y = drawKVRow(doc, "SE Tax", `$${Math.round(se.seTax).toLocaleString()}`, y);
    y = drawKVRow(doc, "Deductible Half of SE Tax", `$${Math.round(se.deductibleHalf).toLocaleString()}`, y);
    y = drawRule(doc, y);

    // Section 3: Deductions
    checkPage(50);
    y = drawSectionHeading(doc, "Section 3: Deductions & Adjustments", y);
    y = drawKVRow(doc, "Standard Deduction", `$${standardDed.toLocaleString()}`, y);
    y = drawKVRow(doc, "Charitable Donations", `$${charitableDonations.toLocaleString()}`, y);
    y = drawKVRow(doc, "Mortgage Interest", `$${mortgageInterest.toLocaleString()}`, y);
    y = drawKVRow(doc, "Itemized Total", `$${itemizedTotal.toLocaleString()}`, y);
    y = drawKVRow(doc, `Deduction Used (${deduction === standardDed ? "Standard" : "Itemized"})`, `$${deduction.toLocaleString()}`, y, { bold: true, color: BRAND.accent });
    y = drawKVRow(doc, "Retirement Contributions", `$${retirementContrib.toLocaleString()}`, y);
    y = drawRule(doc, y);

    // Section 4: Tax Calculation
    checkPage(50);
    y = drawSectionHeading(doc, "Section 4: Tax Calculation", y);
    y = drawKVRow(doc, "Filing Status", filing === "mfj" ? "Married Filing Jointly" : "Single", y);
    y = drawKVRow(doc, "Adjusted Gross Income", `$${Math.round(agi).toLocaleString()}`, y);
    y = drawKVRow(doc, "Taxable Income", `$${Math.round(taxableIncome).toLocaleString()}`, y, { bold: true });
    y = drawKVRow(doc, "Federal Income Tax", `$${Math.round(federalTax).toLocaleString()}`, y);
    y = drawKVRow(doc, "Self-Employment Tax", `$${Math.round(se.seTax).toLocaleString()}`, y);
    y = drawKVRow(doc, `State Tax (${stateRate}%)`, `$${Math.round(stateTax).toLocaleString()}`, y);
    y = drawKVRow(doc, "Total Tax Liability", `$${Math.round(totalTax).toLocaleString()}`, y, { bold: true, color: BRAND.red, size: 11 });
    y = drawRule(doc, y);

    // Section 5: Payments & Balance
    checkPage(40);
    y = drawSectionHeading(doc, "Section 5: Payments & Balance", y);
    y = drawKVRow(doc, "W-2 Withholding", `$${withholding.toLocaleString()}`, y);
    y = drawKVRow(doc, "Estimated Payments Made", `$${estimatedPaid.toLocaleString()}`, y);
    y = drawKVRow(doc, "Total Paid", `$${totalPaid.toLocaleString()}`, y, { bold: true });
    y += 2;
    // Balance highlight bar
    const balColor = balance >= 0 ? BRAND.red : BRAND.green;
    doc.setFillColor(...balColor);
    doc.roundedRect(LM, y, PW, 12, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.white);
    const balLabel = balance >= 0 ? "AMOUNT OWED" : "REFUND DUE";
    doc.text(balLabel, LM + 6, y + 8);
    const balVal = `$${Math.abs(Math.round(balance)).toLocaleString()}`;
    doc.text(balVal, LM + PW - 6 - doc.getTextWidth(balVal), y + 8);
    y += 18;

    // Section 6: Key Rates
    checkPage(30);
    y = drawSectionHeading(doc, "Section 6: Key Rates & Reference", y);
    y = drawKVRow(doc, "Effective Tax Rate", `${effectiveRate.toFixed(1)}%`, y);
    y = drawKVRow(doc, "Marginal Tax Bracket", `${marginal}%`, y);
    y = drawRule(doc, y);

    // Quarterly dates
    checkPage(40);
    y = drawSectionHeading(doc, "Quarterly Payment Schedule (Next Year)", y);
    QUARTERLY_DUE_DATES.forEach(q => {
      y = drawKVRow(doc, `${q.quarter} (${q.period})`, `Due ${q.due}`, y);
    });

    drawFooter(doc);
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
      <div className="flex items-center justify-between">
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3 flex-1" data-testid="irs-prep-disclaimer">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Prep Document Only.</strong> This generates a comprehensive tax prep packet for your records. It is <strong>NOT</strong> an official tax return and <strong>cannot</strong> be submitted to the IRS.
          </div>
        </div>
        <button onClick={generatePacket} className="ml-4 flex-shrink-0 inline-flex items-center gap-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg px-5 py-2.5 font-bold text-sm transition-colors" data-testid="download-packet-btn-top">
          <Download className="w-4 h-4" /> Download PDF
        </button>
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

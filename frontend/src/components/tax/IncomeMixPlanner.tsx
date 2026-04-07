"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { calcFederalTax, calcSETax, STANDARD_DEDUCTION_SINGLE, getMarginalBracket } from "@/lib/tax/taxBrackets";
import { TaxAIExplain } from "@/components/tax/TaxAIExplain";
import { getRuleBasedTaxExplanation } from "@/lib/tax/useTaxAI";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#059669", "#ef4444", "#f59e0b", "#6366f1"];

export function IncomeMixPlanner() {
  const [w2Income, setW2Income] = useState(50000);
  const [freelanceIncome, setFreelanceIncome] = useState(30000);
  const [otherIncome, setOtherIncome] = useState(0);
  const [deductions, setDeductions] = useState(STANDARD_DEDUCTION_SINGLE);
  const [stateRate, setStateRate] = useState(5);

  const totalGross = w2Income + freelanceIncome + otherIncome;
  const taxableIncome = Math.max(0, totalGross - deductions);
  const federalTax = calcFederalTax(taxableIncome);
  const stateTax = taxableIncome * (stateRate / 100);
  const se = calcSETax(freelanceIncome);
  const totalTax = federalTax + stateTax + se.seTax;
  const takeHome = totalGross - totalTax;
  const effectiveRate = totalGross > 0 ? (totalTax / totalGross) * 100 : 0;
  const marginal = getMarginalBracket(taxableIncome);

  const chartData = [
    { name: "Take Home", value: Math.max(0, takeHome) },
    { name: "Federal Tax", value: Math.max(0, federalTax) },
    { name: "State Tax", value: Math.max(0, stateTax) },
    { name: "SE Tax", value: Math.max(0, se.seTax) },
  ].filter(d => d.value > 0);

  const fallback = getRuleBasedTaxExplanation({ income: totalGross, federalTax, stateTax, totalTax, effectiveRate, takeHome, marginalRate: marginal });
  const aiPrompt = `Income mix: W-2 $${w2Income}, Freelance $${freelanceIncome}, Other $${otherIncome}. Deductions $${deductions}. State rate ${stateRate}%. Federal tax $${Math.round(federalTax)}, State tax $${Math.round(stateTax)}, SE tax $${Math.round(se.seTax)}. Total tax $${Math.round(totalTax)}. Effective rate ${effectiveRate.toFixed(1)}%. Explain key insights and suggest tax strategy for mixed-income earner.`;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>W-2 Income ($)</Label>
          <Input type="number" min="0" value={w2Income} onChange={e => setW2Income(Math.max(0, +e.target.value || 0))} data-testid="mix-w2" />
        </div>
        <div className="space-y-2">
          <Label>1099 / Freelance Income ($)</Label>
          <Input type="number" min="0" value={freelanceIncome} onChange={e => setFreelanceIncome(Math.max(0, +e.target.value || 0))} data-testid="mix-freelance" />
        </div>
        <div className="space-y-2">
          <Label>Other Income ($)</Label>
          <Input type="number" min="0" value={otherIncome} onChange={e => setOtherIncome(Math.max(0, +e.target.value || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Deductions ($)</Label>
          <Input type="number" min="0" value={deductions} onChange={e => setDeductions(Math.max(0, +e.target.value || 0))} />
          <p className="text-xs text-muted-foreground">Standard: ${STANDARD_DEDUCTION_SINGLE.toLocaleString()}</p>
        </div>
        <div className="space-y-2">
          <Label>State Tax Rate (%)</Label>
          <Input type="number" min="0" max="15" step="0.1" value={stateRate} onChange={e => setStateRate(Math.max(0, Math.min(15, +e.target.value || 0)))} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1">Total Gross</div>
          <div className="text-xl font-bold">${totalGross.toLocaleString()}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
          <div className="text-xs text-red-700 mb-1">Federal Tax</div>
          <div className="text-xl font-bold text-red-700">${Math.round(federalTax).toLocaleString()}</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
          <div className="text-xs text-amber-700 mb-1">State Tax</div>
          <div className="text-xl font-bold text-amber-700">${Math.round(stateTax).toLocaleString()}</div>
        </div>
        <div className="bg-violet-50 p-4 rounded-xl border border-violet-200 text-center">
          <div className="text-xs text-violet-700 mb-1">SE Tax</div>
          <div className="text-xl font-bold text-violet-700">${Math.round(se.seTax).toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
          <div className="text-sm text-muted-foreground">Estimated Take-Home</div>
          <div className="text-3xl font-serif font-bold text-primary mt-1">${Math.round(takeHome).toLocaleString()}</div>
          <div className="text-xs mt-2 opacity-80">Effective Rate: {effectiveRate.toFixed(1)}% | Marginal: {marginal}%</div>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie data={chartData} innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <RechartsTooltip formatter={(v: number) => `$${Math.round(v).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <TaxAIExplain prompt={aiPrompt} fallback={fallback} label="Explain My Taxes" />
    </div>
  );
}

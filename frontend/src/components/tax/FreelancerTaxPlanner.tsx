"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calcFederalTax, calcSETax, QUARTERLY_DUE_DATES } from "@/lib/tax/taxBrackets";
import { TaxAIExplain } from "@/components/tax/TaxAIExplain";
import { getRuleBasedPlanningExplanation } from "@/lib/tax/useTaxAI";

export function FreelancerTaxPlanner() {
  const [monthlyIncome, setMonthlyIncome] = useState(6000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(1200);
  const [taxRateEst, setTaxRateEst] = useState(25);
  const [selfEmployed, setSelfEmployed] = useState("yes");

  const annualIncome = monthlyIncome * 12;
  const annualExpenses = monthlyExpenses * 12;
  const annualNet = annualIncome - annualExpenses;
  const se = selfEmployed === "yes" ? calcSETax(annualNet) : { seTax: 0, deductibleHalf: 0, seTaxable: 0 };
  const estimatedTax = annualNet * (taxRateEst / 100) + se.seTax;
  const quarterlyAmount = estimatedTax / 4;
  const annualTakeHome = annualIncome - annualExpenses - estimatedTax;

  const fallback = getRuleBasedPlanningExplanation({ annualIncome, annualExpenses, annualNet, estimatedTax, quarterlyAmount });
  const aiPrompt = `Freelancer tax situation: $${monthlyIncome}/mo income, $${monthlyExpenses}/mo expenses, ${selfEmployed === 'yes' ? 'self-employed' : 'not SE'}, ${taxRateEst}% estimated tax rate. Annual net: $${annualNet}. Estimated total tax: $${Math.round(estimatedTax)}. Quarterly set-aside: $${Math.round(quarterlyAmount)}. Explain insights and suggest improvements.`;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Monthly Freelance Income ($)</Label>
          <Input type="number" min="0" value={monthlyIncome} onChange={e => setMonthlyIncome(Math.max(0, +e.target.value || 0))} data-testid="fl-income" />
        </div>
        <div className="space-y-2">
          <Label>Monthly Business Expenses ($)</Label>
          <Input type="number" min="0" value={monthlyExpenses} onChange={e => setMonthlyExpenses(Math.max(0, +e.target.value || 0))} data-testid="fl-expenses" />
        </div>
        <div className="space-y-2">
          <Label>Est. Tax Rate (%)</Label>
          <Input type="number" min="0" max="60" value={taxRateEst} onChange={e => setTaxRateEst(Math.max(0, Math.min(60, +e.target.value || 0)))} />
        </div>
        <div className="space-y-2">
          <Label>Self-Employed?</Label>
          <Select value={selfEmployed} onValueChange={setSelfEmployed}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1">Annual Gross</div>
          <div className="text-xl font-bold break-all">${annualIncome.toLocaleString()}</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1">Annual Expenses</div>
          <div className="text-xl font-bold break-all">${annualExpenses.toLocaleString()}</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1">Annual Net</div>
          <div className="text-xl font-bold break-all">${annualNet.toLocaleString()}</div>
        </div>
        {selfEmployed === "yes" && (
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-center">
            <div className="text-xs text-orange-700 mb-1">SE Tax</div>
            <div className="text-xl font-bold text-orange-700 break-all">${Math.round(se.seTax).toLocaleString()}</div>
          </div>
        )}
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
          <div className="text-xs text-red-700 mb-1">Est. Total Tax</div>
          <div className="text-xl font-bold text-red-700 break-all">${Math.round(estimatedTax).toLocaleString()}</div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
          <div className="text-xs text-emerald-700 mb-1">Est. Take-Home</div>
          <div className="text-xl font-bold text-emerald-700 break-all">${Math.round(annualTakeHome).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
        <div className="text-sm font-medium text-muted-foreground mb-1">Quarterly Set-Aside</div>
        <div className="text-4xl font-serif font-bold text-primary">${Math.round(quarterlyAmount).toLocaleString()}</div>
        <div className="text-xs text-muted-foreground mt-2">Save this amount every quarter for estimated taxes</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUARTERLY_DUE_DATES.map(q => (
          <div key={q.quarter} className="bg-muted/30 p-3 rounded-lg border text-center">
            <div className="text-xs font-bold text-muted-foreground">{q.quarter}</div>
            <div className="font-bold mt-1">${Math.round(quarterlyAmount).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Due {q.due}</div>
          </div>
        ))}
      </div>

      <TaxAIExplain prompt={aiPrompt} fallback={fallback} label="Suggest My Tax Strategy" />
    </div>
  );
}

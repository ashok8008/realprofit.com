import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function SavingsIncomeCalculator() {
  const [deposit, setDeposit] = useState(100000);
  const [yieldRate, setYieldRate] = useState(4.5);

  const annualIncome = deposit * (yieldRate / 100);
  const monthlyIncome = annualIncome / 12;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div className="space-y-2">
          <Label>Deposit Amount ($)</Label>
          <Input type="number" value={deposit} onChange={e => setDeposit(Number(e.target.value) || 0)} data-testid="input-deposit" />
        </div>
        <div className="space-y-2">
          <Label>Annual Yield (%)</Label>
          <Input type="number" value={yieldRate} step="0.1" onChange={e => setYieldRate(Number(e.target.value) || 0)} data-testid="input-yield" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div>
          <h3 className="font-bold mb-1">Monthly Income</h3>
          <div className="text-4xl font-serif font-bold text-primary" data-testid="text-monthly">${Math.round(monthlyIncome).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Annual Income</h3>
          <div className="text-4xl font-serif font-bold text-emerald-600" data-testid="text-annual">${Math.round(annualIncome).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

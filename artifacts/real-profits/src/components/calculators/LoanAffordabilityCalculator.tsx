import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function LoanAffordabilityCalculator() {
  const [income, setIncome] = useState(6000);
  const [dtiLimit, setDtiLimit] = useState(36);
  const [existingDebt, setExistingDebt] = useState(800);
  const [rate, setRate] = useState(7);
  const [months, setMonths] = useState(60);

  const maxTotalDebt = income * (dtiLimit / 100);
  const availablePayment = Math.max(0, maxTotalDebt - existingDebt);

  const monthlyRate = (rate / 100) / 12;
  
  let maxLoan = 0;
  if (monthlyRate === 0) {
    maxLoan = availablePayment * months;
  } else if (months > 0 && availablePayment > 0) {
    maxLoan = availablePayment * ((Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months)));
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Gross Monthly Income ($)</Label>
          <Input type="number" value={income} onChange={e => setIncome(Number(e.target.value) || 0)} data-testid="input-income" />
        </div>
        <div className="space-y-2">
          <Label>Max DTI Limit (%)</Label>
          <Input type="number" value={dtiLimit} onChange={e => setDtiLimit(Number(e.target.value) || 0)} data-testid="input-dti" />
        </div>
        <div className="space-y-2">
          <Label>Existing Monthly Debt ($)</Label>
          <Input type="number" value={existingDebt} onChange={e => setExistingDebt(Number(e.target.value) || 0)} data-testid="input-debt" />
        </div>
        <div className="space-y-2">
          <Label>Expected Rate (%)</Label>
          <Input type="number" value={rate} step="0.1" onChange={e => setRate(Number(e.target.value) || 0)} data-testid="input-rate" />
        </div>
        <div className="space-y-2">
          <Label>Loan Term (Months)</Label>
          <Input type="number" value={months} onChange={e => setMonths(Number(e.target.value) || 0)} data-testid="input-months" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl">
          <h3 className="font-bold mb-1 text-primary">Max Loan Amount You Can Afford</h3>
          <div className="text-4xl font-serif font-bold text-primary" data-testid="text-max-loan">${Math.round(maxLoan).toLocaleString()}</div>
        </div>
        <div className="p-6 rounded-xl flex flex-col justify-center">
          <h3 className="font-bold mb-1">Available for New Monthly Payment</h3>
          <div className="text-3xl font-serif font-bold">${Math.round(availablePayment).toLocaleString()}</div>
          <p className="text-sm text-muted-foreground mt-2">Based on max total debt of ${Math.round(maxTotalDebt)}/mo</p>
        </div>
      </div>
    </div>
  );
}

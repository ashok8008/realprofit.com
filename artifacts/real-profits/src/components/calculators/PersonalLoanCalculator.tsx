import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function PersonalLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(15000);
  const [rate, setRate] = useState(10);
  const [months, setMonths] = useState(36);

  const monthlyRate = (rate / 100) / 12;

  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / months;
  } else if (months > 0) {
    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  }

  const totalRepayment = monthlyPayment * months;
  const totalInterest = totalRepayment - loanAmount;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Loan Amount ($)</Label>
          <Input type="number" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value) || 0)} data-testid="input-amount" />
        </div>
        <div className="space-y-2">
          <Label>Interest Rate (%)</Label>
          <Input type="number" value={rate} step="0.1" onChange={e => setRate(Number(e.target.value) || 0)} data-testid="input-rate" />
        </div>
        <div className="space-y-2">
          <Label>Term (Months)</Label>
          <Input type="number" value={months} onChange={e => setMonths(Number(e.target.value) || 0)} data-testid="input-months" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div className="md:col-span-3 bg-primary/10 border border-primary/20 p-6 rounded-xl">
          <h3 className="font-bold mb-1 text-primary">Monthly Payment</h3>
          <div className="text-4xl font-serif font-bold text-primary" data-testid="text-monthly">${Math.round(monthlyPayment).toLocaleString()}</div>
        </div>
        <div className="col-span-1 md:col-start-2">
          <h3 className="font-bold mb-1">Total Repayment</h3>
          <div className="text-2xl font-bold">${Math.round(totalRepayment).toLocaleString()}</div>
        </div>
        <div className="col-span-1 md:col-start-3">
          <h3 className="font-bold mb-1 text-destructive">Total Interest</h3>
          <div className="text-2xl font-bold text-destructive">${Math.round(totalInterest).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

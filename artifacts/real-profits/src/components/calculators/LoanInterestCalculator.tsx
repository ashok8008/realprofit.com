import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function LoanInterestCalculator() {
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(5);

  const monthlyRate = (rate / 100) / 12;
  const numPayments = years * 12;

  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = amount / numPayments;
  } else if (numPayments > 0) {
    monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  const totalRepayment = monthlyPayment * numPayments;
  const totalInterest = totalRepayment - amount;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Loan Amount ($)</Label>
          <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Interest Rate (%)</Label>
          <Input type="number" value={rate} step="0.1" onChange={e => setRate(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Loan Term (Years)</Label>
          <Input type="number" value={years} onChange={e => setYears(Number(e.target.value) || 0)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl text-center">
          <h3 className="font-bold mb-1 text-primary">Monthly Payment</h3>
          <div className="text-3xl font-serif font-bold text-primary">${monthlyPayment > 0 ? Math.round(monthlyPayment).toLocaleString() : 0}</div>
        </div>
        <div className="bg-muted/30 p-6 rounded-xl border text-center">
          <h3 className="font-bold mb-1">Total Repayment</h3>
          <div className="text-2xl font-bold">${totalRepayment > 0 ? Math.round(totalRepayment).toLocaleString() : 0}</div>
        </div>
        <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/20 text-center">
          <h3 className="font-bold mb-1 text-destructive">Total Interest</h3>
          <div className="text-2xl font-bold text-destructive">${totalInterest > 0 ? Math.round(totalInterest).toLocaleString() : 0}</div>
        </div>
      </div>
    </div>
  );
}

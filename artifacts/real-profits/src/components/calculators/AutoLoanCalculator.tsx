import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function AutoLoanCalculator() {
  const [price, setPrice] = useState(25000);
  const [downPayment, setDownPayment] = useState(5000);
  const [tradeIn, setTradeIn] = useState(0);
  const [salesTax, setSalesTax] = useState(6.5);
  const [fees, setFees] = useState(500);
  const [rate, setRate] = useState(5.5);
  const [months, setMonths] = useState(60);

  const taxableAmount = Math.max(0, price - tradeIn);
  const taxAmount = taxableAmount * (salesTax / 100);
  const financed = price - downPayment - tradeIn + taxAmount + fees;

  const monthlyRate = (rate / 100) / 12;

  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = financed / months;
  } else if (months > 0) {
    monthlyPayment = financed * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  }

  const totalRepayment = monthlyPayment * months;
  const totalInterest = totalRepayment - financed;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Car Price ($)</Label>
          <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value) || 0)} data-testid="input-price" />
        </div>
        <div className="space-y-2">
          <Label>Down Payment ($)</Label>
          <Input type="number" value={downPayment} onChange={e => setDownPayment(Number(e.target.value) || 0)} data-testid="input-down" />
        </div>
        <div className="space-y-2">
          <Label>Trade-In Value ($)</Label>
          <Input type="number" value={tradeIn} onChange={e => setTradeIn(Number(e.target.value) || 0)} data-testid="input-tradein" />
        </div>
        <div className="space-y-2">
          <Label>Sales Tax Rate (%)</Label>
          <Input type="number" value={salesTax} step="0.1" onChange={e => setSalesTax(Number(e.target.value) || 0)} data-testid="input-tax" />
        </div>
        <div className="space-y-2">
          <Label>Dealer Fees ($)</Label>
          <Input type="number" value={fees} onChange={e => setFees(Number(e.target.value) || 0)} data-testid="input-fees" />
        </div>
        <div className="space-y-2">
          <Label>Interest Rate (%)</Label>
          <Input type="number" value={rate} step="0.1" onChange={e => setRate(Number(e.target.value) || 0)} data-testid="input-rate" />
        </div>
        <div className="space-y-2">
          <Label>Loan Term (Months)</Label>
          <Input type="number" value={months} onChange={e => setMonths(Number(e.target.value) || 0)} data-testid="input-months" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div className="md:col-span-2 bg-primary/10 border border-primary/20 p-6 rounded-xl flex flex-col justify-center">
          <h3 className="font-bold mb-1 text-primary">Monthly Payment</h3>
          <div className="text-4xl font-serif font-bold text-primary" data-testid="text-monthly">${Math.round(monthlyPayment).toLocaleString()}</div>
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="font-bold mb-1">Financed Amount</h3>
          <div className="text-2xl font-bold">${Math.round(financed).toLocaleString()}</div>
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="font-bold mb-1 text-destructive">Total Interest</h3>
          <div className="text-2xl font-bold text-destructive">${Math.round(totalInterest).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

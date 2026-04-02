import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function MortgageCalculator() {
  const [price, setPrice] = useState(400000);
  const [downPayment, setDownPayment] = useState(80000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [tax, setTax] = useState(4800);
  const [insurance, setInsurance] = useState(1200);
  const [hoa, setHoa] = useState(0);
  const [pmi, setPmi] = useState(0);

  const loanAmount = Math.max(0, price - downPayment);
  const monthlyRate = (rate / 100) / 12;
  const numPayments = Math.max(1, years) * 12;

  let principalAndInterest = 0;
  if (loanAmount > 0 && numPayments > 0) {
    if (monthlyRate === 0) {
      principalAndInterest = loanAmount / numPayments;
    } else {
      principalAndInterest = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
  }

  const monthlyTax = tax / 12;
  const monthlyInsurance = insurance / 12;
  const totalMonthly = principalAndInterest + monthlyTax + monthlyInsurance + hoa + pmi;
  
  const totalInterest = Math.max(0, (principalAndInterest * numPayments) - loanAmount);
  const totalRepayment = principalAndInterest * numPayments;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2 lg:col-span-2">
          <Label>Home Price ($)</Label>
          <Input type="number" min="0" value={price} onChange={e => setPrice(Math.max(0, Number(e.target.value) || 0))} data-testid="input-price" />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label>Down Payment ($)</Label>
          <Input type="number" min="0" value={downPayment} onChange={e => setDownPayment(Math.max(0, Number(e.target.value) || 0))} data-testid="input-down" />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label>Interest Rate (%)</Label>
          <Input type="number" min="0" max="30" step="0.1" value={rate} onChange={e => setRate(Math.max(0, Number(e.target.value) || 0))} data-testid="input-rate" />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Label>Loan Term (Years)</Label>
          <Input type="number" min="1" max="50" value={years} onChange={e => setYears(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} data-testid="input-years" />
        </div>
        
        <div className="space-y-2">
          <Label>Annual Prop Tax ($)</Label>
          <Input type="number" min="0" value={tax} onChange={e => setTax(Math.max(0, Number(e.target.value) || 0))} data-testid="input-tax" />
        </div>
        <div className="space-y-2">
          <Label>Annual Insurance ($)</Label>
          <Input type="number" min="0" value={insurance} onChange={e => setInsurance(Math.max(0, Number(e.target.value) || 0))} data-testid="input-insurance" />
        </div>
        <div className="space-y-2">
          <Label>Monthly HOA ($)</Label>
          <Input type="number" min="0" value={hoa} onChange={e => setHoa(Math.max(0, Number(e.target.value) || 0))} data-testid="input-hoa" />
        </div>
        <div className="space-y-2">
          <Label>Monthly PMI ($)</Label>
          <Input type="number" min="0" value={pmi} onChange={e => setPmi(Math.max(0, Number(e.target.value) || 0))} data-testid="input-pmi" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div className="md:col-span-3 bg-primary/10 border border-primary/20 p-6 rounded-xl">
          <h3 className="font-bold mb-1 text-primary">Estimated Monthly Payment</h3>
          <div className="text-4xl font-serif font-bold text-primary break-words" data-testid="text-monthly">${Math.round(totalMonthly).toLocaleString()}</div>
          <div className="text-sm mt-2 flex justify-center gap-4 flex-wrap opacity-80">
            <span>P&I: ${Math.round(principalAndInterest)}</span>
            <span>Tax: ${Math.round(monthlyTax)}</span>
            <span>Ins: ${Math.round(monthlyInsurance)}</span>
            {hoa > 0 && <span>HOA: ${hoa}</span>}
            {pmi > 0 && <span>PMI: ${pmi}</span>}
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Loan Amount</h3>
          <div className="text-2xl font-bold break-words">${Math.round(loanAmount).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Total Repayment (P&I)</h3>
          <div className="text-2xl font-bold break-words">${Math.round(totalRepayment).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-destructive">Total Interest</h3>
          <div className="text-2xl font-bold text-destructive break-words">${Math.round(totalInterest).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

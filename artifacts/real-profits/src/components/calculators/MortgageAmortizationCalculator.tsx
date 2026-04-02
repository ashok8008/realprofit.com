import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function MortgageAmortizationCalculator() {
  const [loanAmount, setLoanAmount] = useState(300000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);

  const monthlyRate = (rate / 100) / 12;
  const numPayments = years * 12;

  let monthlyPayment = 0;
  if (loanAmount > 0 && numPayments > 0) {
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / numPayments;
    } else {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
  }

  const data = [];
  let balance = loanAmount;
  let totalInterest = 0;

  if (loanAmount > 0 && numPayments > 0 && monthlyPayment > 0) {
    for (let year = 1; year <= years; year++) {
      let yearPrincipal = 0;
      let yearInterest = 0;
      for (let m = 0; m < 12; m++) {
        if (balance <= 0) break;
        const interest = balance * monthlyRate;
        let principal = monthlyPayment - interest;
        if (balance < principal) {
          principal = balance;
        }
        yearInterest += interest;
        yearPrincipal += principal;
        balance -= principal;
        totalInterest += interest;
      }
      data.push({
        year,
        Principal: Math.round(yearPrincipal),
        Interest: Math.round(yearInterest),
        Balance: Math.max(0, Math.round(balance))
      });
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Loan Amount ($)</Label>
          <Input type="number" min="0" value={loanAmount} onChange={e => setLoanAmount(Math.max(0, Number(e.target.value) || 0))} data-testid="input-amount" />
        </div>
        <div className="space-y-2">
          <Label>Interest Rate (%)</Label>
          <Input type="number" min="0" max="30" value={rate} step="0.1" onChange={e => setRate(Math.max(0, Number(e.target.value) || 0))} data-testid="input-rate" />
        </div>
        <div className="space-y-2">
          <Label>Loan Term (Years)</Label>
          <Input type="number" min="1" max="50" value={years} onChange={e => setYears(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} data-testid="input-years" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div>
          <h3 className="font-bold mb-1">Monthly Payment</h3>
          <div className="text-3xl font-serif font-bold text-primary" data-testid="text-monthly">${Math.round(monthlyPayment).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-destructive">Total Interest Paid</h3>
          <div className="text-3xl font-serif font-bold text-destructive">${Math.round(totalInterest).toLocaleString()}</div>
        </div>
      </div>

      {data.length > 0 && (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} />
              <YAxis tickFormatter={v => `$${v/1000}k`} />
              <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
              <Bar dataKey="Principal" stackId="a" fill="hsl(var(--primary))" />
              <Bar dataKey="Interest" stackId="a" fill="hsl(var(--destructive))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function ExtraPaymentCalculator() {
  const [loanAmount, setLoanAmount] = useState(200000);
  const [rate, setRate] = useState(6.5);
  const [months, setMonths] = useState(360);
  const [extraPayment, setExtraPayment] = useState(200);

  const monthlyRate = (rate / 100) / 12;
  const safeMonths = Math.max(1, Math.min(600, months));

  let basePayment = 0;
  if (loanAmount > 0 && safeMonths > 0) {
    if (monthlyRate === 0) {
      basePayment = loanAmount / safeMonths;
    } else {
      basePayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, safeMonths)) / (Math.pow(1 + monthlyRate, safeMonths) - 1);
    }
  }

  const data = [];
  let baseBalance = loanAmount;
  let extraBalance = loanAmount;
  let baseInterest = 0;
  let extraInterest = 0;
  let newMonths = 0;

  for (let m = 1; m <= safeMonths; m++) {
    if (baseBalance > 0) {
      const interest = baseBalance * monthlyRate;
      let principal = basePayment - interest;
      if (baseBalance < principal) principal = baseBalance;
      baseBalance -= principal;
      baseInterest += interest;
    }

    if (extraBalance > 0) {
      const interest = extraBalance * monthlyRate;
      let principal = (basePayment + extraPayment) - interest;
      if (extraBalance < principal) principal = extraBalance;
      extraBalance -= principal;
      extraInterest += interest;
      newMonths++;
    }

    if (m % 12 === 0 || (baseBalance <= 0 && extraBalance <= 0)) {
      data.push({
        year: m / 12,
        Base: Math.max(0, Math.round(baseBalance)),
        WithExtra: Math.max(0, Math.round(extraBalance))
      });
    }

    if (baseBalance <= 0 && extraBalance <= 0) break;
  }

  const monthsSaved = safeMonths - newMonths;
  const interestSaved = baseInterest - extraInterest;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Loan Amount ($)</Label>
          <Input type="number" min="0" value={loanAmount} onChange={e => setLoanAmount(Math.max(0, Number(e.target.value) || 0))} data-testid="input-amount" />
        </div>
        <div className="space-y-2">
          <Label>Interest Rate (%)</Label>
          <Input type="number" min="0" max="30" step="0.1" value={rate} onChange={e => setRate(Math.max(0, Number(e.target.value) || 0))} data-testid="input-rate" />
        </div>
        <div className="space-y-2">
          <Label>Term (Months)</Label>
          <Input type="number" min="1" max="600" value={months} onChange={e => setMonths(Math.max(1, Math.min(600, Number(e.target.value) || 1)))} data-testid="input-months" />
        </div>
        <div className="space-y-2">
          <Label>Extra Monthly Payment ($)</Label>
          <Input type="number" min="0" value={extraPayment} onChange={e => setExtraPayment(Math.max(0, Number(e.target.value) || 0))} data-testid="input-extra" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div>
          <h3 className="font-bold mb-1 text-emerald-600">Interest Saved</h3>
          <div className="text-4xl font-serif font-bold text-emerald-600 break-words" data-testid="text-interest-saved">${Math.round(interestSaved).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-primary">Time Saved</h3>
          <div className="text-4xl font-serif font-bold text-primary" data-testid="text-time-saved">
            {Math.floor(monthsSaved / 12)}y {monthsSaved % 12}m
          </div>
          <div className="text-sm text-muted-foreground mt-2">New payoff: {Math.floor(newMonths / 12)}y {newMonths % 12}m</div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} />
            <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
            <Legend />
            <Line name="Original Balance" type="monotone" dataKey="Base" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
            <Line name="With Extra Payments" type="monotone" dataKey="WithExtra" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

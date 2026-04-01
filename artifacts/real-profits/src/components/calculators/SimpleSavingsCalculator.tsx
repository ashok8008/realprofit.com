import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function SimpleSavingsCalculator() {
  const [deposit, setDeposit] = useState(1000);
  const [monthly, setMonthly] = useState(100);
  const [rate, setRate] = useState(4);
  const [years, setYears] = useState(10);

  const data = [];
  let balance = deposit;
  let totalContributions = deposit;

  for (let year = 0; year <= years; year++) {
    if (year > 0) {
      for (let m = 0; m < 12; m++) {
        balance += monthly;
        balance += balance * ((rate / 100) / 12);
        totalContributions += monthly;
      }
    }
    data.push({
      year,
      balance: Math.round(balance),
      contributions: Math.round(totalContributions),
    });
  }

  const interestEarned = balance - totalContributions;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Initial Deposit ($)</Label>
          <Input type="number" value={deposit} onChange={e => setDeposit(Number(e.target.value) || 0)} data-testid="input-deposit" />
        </div>
        <div className="space-y-2">
          <Label>Monthly Contribution ($)</Label>
          <Input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value) || 0)} data-testid="input-monthly" />
        </div>
        <div className="space-y-2">
          <Label>Annual Interest Rate (%)</Label>
          <Input type="number" value={rate} onChange={e => setRate(Number(e.target.value) || 0)} step="0.1" data-testid="input-rate" />
        </div>
        <div className="space-y-2">
          <Label>Years</Label>
          <Input type="number" value={years} onChange={e => setYears(Number(e.target.value) || 0)} data-testid="input-years" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div>
          <h3 className="font-bold mb-1">Ending Balance</h3>
          <div className="text-3xl font-serif font-bold text-primary" data-testid="text-balance">${Math.round(balance).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Total Contributions</h3>
          <div className="text-2xl font-serif font-bold">${Math.round(totalContributions).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-emerald-600">Interest Earned</h3>
          <div className="text-2xl font-serif font-bold text-emerald-600">${Math.round(interestEarned).toLocaleString()}</div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} />
            <YAxis tickFormatter={v => `$${v}`} />
            <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
            <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="contributions" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

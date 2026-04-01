import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function InvestmentReturnCalculator() {
  const [starting, setStarting] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);

  const data = [];
  let balance = starting;
  let totalContributions = starting;

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
      growth: Math.round(balance - totalContributions)
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Starting Amount ($)</Label>
          <Input type="number" value={starting} onChange={e => setStarting(Number(e.target.value) || 0)} data-testid="input-starting" />
        </div>
        <div className="space-y-2">
          <Label>Monthly Addition ($)</Label>
          <Input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value) || 0)} data-testid="input-monthly" />
        </div>
        <div className="space-y-2">
          <Label>Expected Annual Return (%)</Label>
          <Input type="number" value={rate} step="0.1" onChange={e => setRate(Number(e.target.value) || 0)} data-testid="input-rate" />
        </div>
        <div className="space-y-2">
          <Label>Years to Invest</Label>
          <Input type="number" value={years} onChange={e => setYears(Number(e.target.value) || 0)} data-testid="input-years" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div>
          <h3 className="font-bold mb-1">Final Balance</h3>
          <div className="text-3xl font-serif font-bold text-primary">${Math.round(balance).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-muted-foreground">Total Contributions</h3>
          <div className="text-2xl font-serif font-bold text-muted-foreground">${Math.round(totalContributions).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-emerald-600">Total Return</h3>
          <div className="text-2xl font-serif font-bold text-emerald-600">${Math.round(balance - totalContributions).toLocaleString()}</div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} />
            <YAxis tickFormatter={v => `$${v/1000}k`} />
            <Tooltip formatter={v => `$${v.toLocaleString()}`} />
            <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
            <Area type="monotone" dataKey="contributions" stroke="hsl(var(--muted-foreground))" fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

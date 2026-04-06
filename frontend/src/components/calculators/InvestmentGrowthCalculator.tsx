import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function InvestmentGrowthCalculator() {
  const [starting, setStarting] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);

  const safeYears = Math.max(1, Math.min(50, years));
  const data = [];
  let balance = starting;
  let totalContributions = starting;

  for (let year = 0; year <= safeYears; year++) {
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
          <Input type="number" min="0" value={starting} onChange={e => setStarting(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Monthly Addition ($)</Label>
          <Input type="number" min="0" value={monthly} onChange={e => setMonthly(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Annual Return (%)</Label>
          <Input type="number" min="0" max="100" step="0.1" value={rate} onChange={e => setRate(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Years to Grow</Label>
          <Input type="number" min="1" max="50" value={years} onChange={e => setYears(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div>
          <h3 className="font-bold mb-1">Ending Balance</h3>
          <div className="text-3xl font-serif font-bold text-primary break-words">${Math.round(balance).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Total Contributions</h3>
          <div className="text-2xl font-serif font-bold text-muted-foreground break-words">${Math.round(totalContributions).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Total Growth</h3>
          <div className="text-2xl font-serif font-bold text-emerald-600 break-words">${Math.round(balance - totalContributions).toLocaleString()}</div>
        </div>
      </div>

      <div className="h-[300px]" id="investment-growth-chart">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} />
            <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
            <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
            <Area type="monotone" dataKey="contributions" stroke="hsl(var(--muted-foreground))" fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function SIPCalculator() {
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const safeYears = Math.max(1, Math.min(50, years));
  const data = [];
  let balance = 0;
  let totalContributions = 0;

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
      value: Math.round(balance),
      invested: Math.round(totalContributions)
    });
  }

  const finalValue = balance;
  const gains = finalValue - totalContributions;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Monthly Investment (SIP) ($)</Label>
          <Input type="number" min="0" value={monthly} onChange={e => setMonthly(Math.max(0, Number(e.target.value) || 0))} data-testid="input-monthly" />
        </div>
        <div className="space-y-2">
          <Label>Expected Return (%)</Label>
          <Input type="number" min="0" max="100" step="0.1" value={rate} onChange={e => setRate(Math.max(0, Number(e.target.value) || 0))} data-testid="input-rate" />
        </div>
        <div className="space-y-2">
          <Label>Time Period (Years)</Label>
          <Input type="number" min="1" max="50" value={years} onChange={e => setYears(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} data-testid="input-years" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div>
          <h3 className="font-bold mb-1">Invested Amount</h3>
          <div className="text-2xl font-serif font-bold text-muted-foreground break-words">${Math.round(totalContributions).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-emerald-600">Est. Returns</h3>
          <div className="text-2xl font-serif font-bold text-emerald-600 break-words">${Math.round(gains).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Total Value</h3>
          <div className="text-3xl font-serif font-bold text-primary break-words">${Math.round(finalValue).toLocaleString()}</div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} />
            <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="invested" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

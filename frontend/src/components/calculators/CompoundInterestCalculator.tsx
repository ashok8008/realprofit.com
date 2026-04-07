"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(5000);
  const [monthly, setMonthly] = useState(200);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);

  const safeYears = Math.max(1, Math.min(50, years));
  const data = [];
  let currentBalance = principal;
  let totalContributed = principal;
  
  for (let year = 0; year <= safeYears; year++) {
    if (year > 0) {
      for (let m = 0; m < 12; m++) {
        currentBalance += monthly;
        currentBalance += currentBalance * ((rate / 100) / 12);
        totalContributed += monthly;
      }
    }
    
    data.push({
      year,
      balance: Math.round(currentBalance),
      contributions: Math.round(totalContributed),
      interest: Math.round(currentBalance - totalContributed)
    });
  }

  const finalBalance = data[data.length - 1].balance;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Starting Principal ($)</Label>
          <Input type="number" min="0" value={principal} onChange={e => setPrincipal(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Monthly Contribution ($)</Label>
          <Input type="number" min="0" value={monthly} onChange={e => setMonthly(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Estimated Annual Return (%)</Label>
          <Input type="number" min="0" max="100" step="0.1" value={rate} onChange={e => setRate(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Years to Grow</Label>
          <Input type="number" min="1" max="50" value={years} onChange={e => setYears(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} />
        </div>
      </div>

      <div className="bg-muted/30 p-6 rounded-xl border text-center">
        <h3 className="text-lg font-bold mb-2">Future Balance</h3>
        <div className="text-4xl md:text-5xl font-serif text-primary font-bold break-words">
          ${finalBalance.toLocaleString()}
        </div>
      </div>

      <div className="h-[300px] mt-8" id="compound-interest-chart">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tickFormatter={(v) => `Year ${v}`} />
            <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} width={70} />
            <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
            <Area type="monotone" dataKey="balance" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
            <Area type="monotone" dataKey="contributions" stackId="2" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground)/0.1)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

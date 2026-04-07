"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function RetirementGrowthCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [monthly, setMonthly] = useState(1000);
  const [rate, setRate] = useState(7);

  const safeRetirementAge = Math.min(retirementAge, currentAge + 80);
  const years = Math.max(0, safeRetirementAge - currentAge);

  const data = [];
  let balance = currentSavings;
  let totalContributions = currentSavings;

  for (let year = 0; year <= years; year++) {
    if (year > 0) {
      for (let m = 0; m < 12; m++) {
        balance += monthly;
        balance += balance * ((rate / 100) / 12);
        totalContributions += monthly;
      }
    }
    data.push({
      age: currentAge + year,
      balance: Math.round(balance),
      contributions: Math.round(totalContributions),
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label>Current Age</Label>
          <Input type="number" min="16" max="90" value={currentAge} onChange={e => setCurrentAge(Math.max(16, Math.min(90, Number(e.target.value) || 16)))} />
        </div>
        <div className="space-y-2">
          <Label>Retirement Age</Label>
          <Input type="number" min="20" max="100" value={retirementAge} onChange={e => setRetirementAge(Math.max(20, Math.min(100, Number(e.target.value) || 20)))} />
        </div>
        <div className="space-y-2">
          <Label>Current Savings ($)</Label>
          <Input type="number" min="0" value={currentSavings} onChange={e => setCurrentSavings(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Monthly Contrib ($)</Label>
          <Input type="number" min="0" value={monthly} onChange={e => setMonthly(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Return (%)</Label>
          <Input type="number" min="0" max="50" step="0.1" value={rate} onChange={e => setRate(Math.max(0, Number(e.target.value) || 0))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div className="md:col-span-3 bg-primary/10 border border-primary/20 p-6 rounded-xl">
          <h3 className="font-bold mb-1 text-primary">Retirement Balance (Age {safeRetirementAge})</h3>
          <div className="text-4xl font-serif font-bold text-primary break-words">${Math.round(balance).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-muted-foreground">Total Contributions</h3>
          <div className="text-2xl font-serif font-bold text-muted-foreground break-words">${Math.round(totalContributions).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-emerald-600">Total Growth</h3>
          <div className="text-2xl font-serif font-bold text-emerald-600 break-words">${Math.round(balance - totalContributions).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Safe Withdraw (4%)</h3>
          <div className="text-2xl font-serif font-bold break-words">${Math.round(balance * 0.04).toLocaleString()} / yr</div>
        </div>
      </div>

      {years > 0 && (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="age" tickFormatter={v => `Age ${v}`} />
              <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
              <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" />
              <Area type="monotone" dataKey="contributions" stroke="hsl(var(--muted-foreground))" fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

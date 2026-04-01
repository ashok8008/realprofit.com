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

  const years = Math.max(0, retirementAge - currentAge);

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
          <Input type="number" value={currentAge} onChange={e => setCurrentAge(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Retirement Age</Label>
          <Input type="number" value={retirementAge} onChange={e => setRetirementAge(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Current Savings ($)</Label>
          <Input type="number" value={currentSavings} onChange={e => setCurrentSavings(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Monthly Contrib ($)</Label>
          <Input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Return (%)</Label>
          <Input type="number" value={rate} step="0.1" onChange={e => setRate(Number(e.target.value) || 0)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div className="md:col-span-3 bg-primary/10 border border-primary/20 p-6 rounded-xl">
          <h3 className="font-bold mb-1 text-primary">Retirement Balance (Age {retirementAge})</h3>
          <div className="text-4xl font-serif font-bold text-primary">${Math.round(balance).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-muted-foreground">Total Contributions</h3>
          <div className="text-2xl font-serif font-bold text-muted-foreground">${Math.round(totalContributions).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-emerald-600">Total Growth</h3>
          <div className="text-2xl font-serif font-bold text-emerald-600">${Math.round(balance - totalContributions).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Safe Withdraw (4%)</h3>
          <div className="text-2xl font-serif font-bold">${Math.round(balance * 0.04).toLocaleString()} / yr</div>
        </div>
      </div>

      {years > 0 && (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="age" tickFormatter={v => `Age ${v}`} />
              <YAxis tickFormatter={v => `$${Math.floor(v/1000)}k`} />
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

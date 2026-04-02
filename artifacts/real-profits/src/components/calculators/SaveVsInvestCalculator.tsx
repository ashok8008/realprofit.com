import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function SaveVsInvestCalculator() {
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(20);
  const [saveRate, setSaveRate] = useState(2);
  const [investRate, setInvestRate] = useState(8);

  const safeYears = Math.max(1, Math.min(50, years));
  const data = [];
  let saveBalance = 0;
  let investBalance = 0;
  
  for (let year = 0; year <= safeYears; year++) {
    if (year > 0) {
      for (let m = 0; m < 12; m++) {
        saveBalance += monthly;
        saveBalance += saveBalance * ((saveRate / 100) / 12);
        investBalance += monthly;
        investBalance += investBalance * ((investRate / 100) / 12);
      }
    }
    data.push({
      year,
      savings: Math.round(saveBalance),
      investments: Math.round(investBalance)
    });
  }

  const finalSave = data[data.length - 1].savings;
  const finalInvest = data[data.length - 1].investments;
  const difference = finalInvest - finalSave;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Monthly Amount ($)</Label>
          <Input type="number" min="0" value={monthly} onChange={e => setMonthly(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Time Horizon (Years)</Label>
          <Input type="number" min="1" max="50" value={years} onChange={e => setYears(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} />
        </div>
        <div className="space-y-2">
          <Label>Savings APY (%)</Label>
          <Input type="number" min="0" max="100" step="0.1" value={saveRate} onChange={e => setSaveRate(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Investment Expected Return (%)</Label>
          <Input type="number" min="0" max="100" step="0.1" value={investRate} onChange={e => setInvestRate(Math.max(0, Number(e.target.value) || 0))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <h4 className="text-sm font-medium text-muted-foreground">Cash Savings</h4>
          <div className="text-2xl font-bold mt-1 break-words">${finalSave.toLocaleString()}</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <h4 className="text-sm font-medium text-muted-foreground">Market Investments</h4>
          <div className="text-2xl font-bold mt-1 text-primary break-words">${finalInvest.toLocaleString()}</div>
        </div>
        <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 text-center">
          <h4 className="text-sm font-medium text-primary">Opportunity Cost</h4>
          <div className="text-2xl font-bold mt-1 text-primary break-words">${difference.toLocaleString()}</div>
        </div>
      </div>

      <div className="h-[350px] mt-8" id="save-vs-invest-chart">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tickFormatter={(v) => `Year ${v}`} />
            <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
            <Legend />
            <Line name="Investments" type="monotone" dataKey="investments" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
            <Line name="Savings" type="monotone" dataKey="savings" stroke="#f59e0b" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

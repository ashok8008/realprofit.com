import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function MonthlyIncomeEstimator() {
  const [projectValue, setProjectValue] = useState(1500);
  const [projectsPerMonth, setProjectsPerMonth] = useState(4);
  const [variability, setVariability] = useState(25);

  const baseEstimate = projectValue * projectsPerMonth;
  const lowEstimate = baseEstimate * (1 - variability / 100);
  const highEstimate = baseEstimate * (1 + variability / 100);

  const data = [
    { name: "Low (Pessimistic)", value: Math.round(lowEstimate) },
    { name: "Average (Base)", value: Math.round(baseEstimate) },
    { name: "High (Optimistic)", value: Math.round(highEstimate) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Avg Project Value ($)</Label>
          <Input type="number" value={projectValue} onChange={e => setProjectValue(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Projects per Month</Label>
          <Input type="number" value={projectsPerMonth} onChange={e => setProjectsPerMonth(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Income Variability (%)</Label>
          <Input type="number" value={variability} onChange={e => setVariability(Number(e.target.value) || 0)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-muted/20 p-4 rounded-xl border text-center">
          <h4 className="text-sm text-muted-foreground">Low Estimate</h4>
          <div className="text-2xl font-bold mt-1 text-destructive">${Math.round(lowEstimate).toLocaleString()}</div>
        </div>
        <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 text-center">
          <h4 className="text-sm font-medium text-primary">Base Estimate</h4>
          <div className="text-3xl font-bold mt-1 text-primary">${Math.round(baseEstimate).toLocaleString()}</div>
        </div>
        <div className="bg-muted/20 p-4 rounded-xl border text-center">
          <h4 className="text-sm text-muted-foreground">High Estimate</h4>
          <div className="text-2xl font-bold mt-1 text-emerald-600">${Math.round(highEstimate).toLocaleString()}</div>
        </div>
      </div>

      <div className="h-[250px]" id="monthly-income-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(value) => `$${value}`} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 1 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

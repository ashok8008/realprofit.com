import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function MonthlySavingsCalculator() {
  const [target, setTarget] = useState(50000);
  const [current, setCurrent] = useState(5000);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(4);

  const months = Math.max(1, years) * 12;
  const monthlyRate = (rate / 100) / 12;
  
  let requiredMonthly = 0;
  if (months > 0 && target > current) {
    if (monthlyRate === 0) {
      requiredMonthly = (target - current) / months;
    } else {
      const futureValueOfCurrent = current * Math.pow(1 + monthlyRate, months);
      const shortfall = target - futureValueOfCurrent;
      if (shortfall > 0) {
        requiredMonthly = shortfall / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      }
    }
  }

  const totalContributions = (requiredMonthly > 0 ? requiredMonthly * months : 0) + current;
  const projectedInterest = target - totalContributions;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Target Amount ($)</Label>
          <Input type="number" min="0" value={target} onChange={e => setTarget(Math.max(0, Number(e.target.value) || 0))} data-testid="input-target" />
        </div>
        <div className="space-y-2">
          <Label>Current Savings ($)</Label>
          <Input type="number" min="0" value={current} onChange={e => setCurrent(Math.max(0, Number(e.target.value) || 0))} data-testid="input-current" />
        </div>
        <div className="space-y-2">
          <Label>Years to Goal</Label>
          <Input type="number" min="1" max="50" value={years} onChange={e => setYears(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} data-testid="input-years" />
        </div>
        <div className="space-y-2">
          <Label>Annual Interest Rate (%)</Label>
          <Input type="number" min="0" max="100" step="0.1" value={rate} onChange={e => setRate(Math.max(0, Number(e.target.value) || 0))} data-testid="input-rate" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div className="md:col-span-3 bg-primary/10 p-6 rounded-xl border border-primary/20">
          <h3 className="font-bold mb-1 text-primary">Required Monthly Contribution</h3>
          <div className="text-4xl font-serif font-bold text-primary break-words" data-testid="text-required">${requiredMonthly > 0 ? Math.round(requiredMonthly).toLocaleString() : 0}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Total Target</h3>
          <div className="text-2xl font-serif font-bold break-words">${target.toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-muted-foreground">Total Contributions</h3>
          <div className="text-2xl font-serif font-bold text-muted-foreground break-words">${Math.round(totalContributions).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-emerald-600">Projected Interest</h3>
          <div className="text-2xl font-serif font-bold text-emerald-600 break-words">${Math.round(projectedInterest).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

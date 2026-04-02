import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function HourlyRateCalculator() {
  const [annualIncome, setAnnualIncome] = useState(75000);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [weeksPerYear, setWeeksPerYear] = useState(50);

  const totalHours = hoursPerWeek * weeksPerYear;
  const hourly = totalHours > 0 ? annualIncome / totalHours : 0;
  const monthly = annualIncome / 12;
  const weekly = weeksPerYear > 0 ? annualIncome / weeksPerYear : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Annual Salary ($)</Label>
          <Input type="number" min="0" value={annualIncome} onChange={e => setAnnualIncome(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Hours per Week</Label>
          <Input type="number" min="1" max="168" value={hoursPerWeek} onChange={e => setHoursPerWeek(Math.max(1, Math.min(168, Number(e.target.value) || 1)))} />
        </div>
        <div className="space-y-2">
          <Label>Working Weeks per Year</Label>
          <Input type="number" min="1" max="52" value={weeksPerYear} onChange={e => setWeeksPerYear(Math.max(1, Math.min(52, Number(e.target.value) || 1)))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div>
          <h3 className="font-medium text-muted-foreground mb-1">Effective Hourly Rate</h3>
          <div className="text-3xl font-serif font-bold text-primary">${hourly.toFixed(2)} / hr</div>
        </div>
        <div>
          <h3 className="font-medium text-muted-foreground mb-1">Weekly Earnings</h3>
          <div className="text-3xl font-serif font-bold">${Math.round(weekly).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-medium text-muted-foreground mb-1">Monthly Earnings</h3>
          <div className="text-3xl font-serif font-bold">${Math.round(monthly).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

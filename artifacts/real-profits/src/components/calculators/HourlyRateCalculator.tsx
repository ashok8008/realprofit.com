import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function HourlyRateCalculator() {
  const [annualIncome, setAnnualIncome] = useState(75000);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [weeksPerYear, setWeeksPerYear] = useState(50); // assuming 2 weeks off

  const totalHours = hoursPerWeek * weeksPerYear;
  const hourly = totalHours > 0 ? annualIncome / totalHours : 0;
  const monthly = annualIncome / 12;
  const weekly = weeksPerYear > 0 ? annualIncome / weeksPerYear : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Annual Salary ($)</Label>
          <Input type="number" value={annualIncome} onChange={e => setAnnualIncome(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Hours Worked / Week</Label>
          <Input type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Weeks Worked / Year</Label>
          <Input type="number" value={weeksPerYear} onChange={e => setWeeksPerYear(Number(e.target.value) || 0)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div>
          <h3 className="font-medium text-muted-foreground mb-1">True Hourly Rate</h3>
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

"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function SideHustleEarnings() {
  const [hourlyRate, setHourlyRate] = useState(25);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [weeksPerMonth, setWeeksPerMonth] = useState(4);

  const weekly = hourlyRate * hoursPerWeek;
  const monthly = weekly * weeksPerMonth;
  const annual = monthly * 12;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Hourly Rate ($)</Label>
          <Input type="number" min="0" value={hourlyRate} onChange={e => setHourlyRate(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Hours per Week</Label>
          <Input type="number" min="0" value={hoursPerWeek} onChange={e => setHoursPerWeek(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Weeks per Month</Label>
          <Input type="number" min="0" max="5" value={weeksPerMonth} onChange={e => setWeeksPerMonth(Math.max(0, Math.min(5, Number(e.target.value) || 0)))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div>
          <h3 className="font-bold mb-1">Weekly Extra</h3>
          <div className="text-4xl font-serif font-bold text-blue-600">${Math.round(weekly).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Monthly Extra</h3>
          <div className="text-4xl font-serif font-bold text-primary">${Math.round(monthly).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Annual Extra</h3>
          <div className="text-4xl font-serif font-bold text-emerald-600">${Math.round(annual).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

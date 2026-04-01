import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export function InterestCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(10);
  const [isCompound, setIsCompound] = useState(true);

  let interest = 0;
  let total = 0;

  if (isCompound) {
    total = principal * Math.pow(1 + rate / 100, years);
    interest = total - principal;
  } else {
    interest = principal * (rate / 100) * years;
    total = principal + interest;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Principal ($)</Label>
          <Input type="number" value={principal} onChange={e => setPrincipal(Number(e.target.value) || 0)} data-testid="input-principal" />
        </div>
        <div className="space-y-2">
          <Label>Annual Interest Rate (%)</Label>
          <Input type="number" value={rate} step="0.1" onChange={e => setRate(Number(e.target.value) || 0)} data-testid="input-rate" />
        </div>
        <div className="space-y-2">
          <Label>Years</Label>
          <Input type="number" value={years} onChange={e => setYears(Number(e.target.value) || 0)} data-testid="input-years" />
        </div>
        <div className="flex items-center space-x-2 pt-8">
          <Switch id="compound" checked={isCompound} onCheckedChange={setIsCompound} />
          <Label htmlFor="compound">Compound Interest (Annually)</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div>
          <h3 className="font-bold mb-1">Interest Earned</h3>
          <div className="text-3xl font-serif font-bold text-emerald-600">${Math.round(interest).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Total Value</h3>
          <div className="text-3xl font-serif font-bold text-primary">${Math.round(total).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

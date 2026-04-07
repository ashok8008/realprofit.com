"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function SelfEmploymentTaxCalculator() {
  const [netIncome, setNetIncome] = useState(50000);

  const seTaxable = netIncome * 0.9235;
  const seTax = seTaxable > 0 ? seTaxable * 0.153 : 0;
  const deductibleHalf = seTax / 2;
  const netAfterSeTax = netIncome - seTax;

  return (
    <div className="space-y-8">
      <div className="max-w-md mx-auto space-y-2">
        <Label>Net Self-Employment Income ($)</Label>
        <Input type="number" min="0" value={netIncome} onChange={e => setNetIncome(Math.max(0, Number(e.target.value) || 0))} />
        <p className="text-xs text-muted-foreground">Revenue minus business expenses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-destructive/10 p-6 rounded-xl border border-destructive/20 text-center">
          <h3 className="font-bold mb-1 text-destructive">Estimated SE Tax</h3>
          <div className="text-3xl font-serif font-bold text-destructive break-words">${Math.round(seTax).toLocaleString()}</div>
          <p className="text-xs mt-2 opacity-80">15.3% of 92.35% of net income</p>
        </div>
        <div className="bg-muted/30 p-6 rounded-xl border text-center">
          <h3 className="font-bold mb-1">Deductible Portion</h3>
          <div className="text-3xl font-serif font-bold break-words">${Math.round(deductibleHalf).toLocaleString()}</div>
          <p className="text-xs mt-2 text-muted-foreground">For income tax purposes</p>
        </div>
        <div className="bg-primary/10 p-6 rounded-xl border border-primary/20 text-center">
          <h3 className="font-bold mb-1 text-primary">Net after SE Tax</h3>
          <div className="text-3xl font-serif font-bold text-primary break-words">${Math.round(netAfterSeTax).toLocaleString()}</div>
          <p className="text-xs mt-2 opacity-80">Before standard income tax</p>
        </div>
      </div>
    </div>
  );
}

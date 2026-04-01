import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function QuarterlyTaxCalculator() {
  const [annualTax, setAnnualTax] = useState(12000);

  const quarterly = annualTax / 4;

  return (
    <div className="space-y-8">
      <div className="max-w-md mx-auto space-y-2">
        <Label>Estimated Annual Tax Liability ($)</Label>
        <Input type="number" value={annualTax} onChange={e => setAnnualTax(Number(e.target.value) || 0)} />
      </div>

      <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl text-center max-w-md mx-auto">
        <h3 className="font-bold mb-2 text-primary">Your Quarterly Payment</h3>
        <div className="text-4xl font-serif font-bold text-primary">${Math.round(quarterly).toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Q1 Payment</div>
          <div className="font-medium">Due April 15</div>
          <div className="text-xl font-bold mt-2">${Math.round(quarterly).toLocaleString()}</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Q2 Payment</div>
          <div className="font-medium">Due June 15</div>
          <div className="text-xl font-bold mt-2">${Math.round(quarterly).toLocaleString()}</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Q3 Payment</div>
          <div className="font-medium">Due September 15</div>
          <div className="text-xl font-bold mt-2">${Math.round(quarterly).toLocaleString()}</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Q4 Payment</div>
          <div className="font-medium">Due January 15</div>
          <div className="text-xl font-bold mt-2">${Math.round(quarterly).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

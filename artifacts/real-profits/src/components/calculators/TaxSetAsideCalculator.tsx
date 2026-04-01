import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function TaxSetAsideCalculator() {
  const [income, setIncome] = useState(5000);
  const [expenseRate, setExpenseRate] = useState(20);
  const [taxRate, setTaxRate] = useState(25);

  const expenses = income * (expenseRate / 100);
  const net = income - expenses;
  const taxSetAside = net * (taxRate / 100);
  const spendable = net - taxSetAside;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Monthly Income ($)</Label>
          <Input type="number" value={income} onChange={e => setIncome(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Est. Business Expenses (%)</Label>
          <Input type="number" value={expenseRate} onChange={e => setExpenseRate(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Est. Tax Rate (%)</Label>
          <Input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value) || 0)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div>
          <h3 className="font-bold mb-1">Tax Set-Aside (Save this!)</h3>
          <div className="text-3xl font-serif font-bold text-destructive">${Math.round(taxSetAside).toLocaleString()} / mo</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Safe to Spend / Pay Yourself</h3>
          <div className="text-3xl font-serif font-bold text-primary">${Math.round(spendable).toLocaleString()} / mo</div>
        </div>
      </div>
    </div>
  );
}

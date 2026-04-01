import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

export function DebtSnowballCalculator() {
  const [debts, setDebts] = useState([
    { id: 1, name: "Credit Card", balance: 5000, rate: 21.99, minPayment: 150 },
    { id: 2, name: "Car Loan", balance: 12000, rate: 5.5, minPayment: 250 },
    { id: 3, name: "Student Loan", balance: 25000, rate: 6.8, minPayment: 300 }
  ]);
  const [extraPayment, setExtraPayment] = useState(200);

  const addDebt = () => {
    setDebts([...debts, { id: Date.now(), name: "New Debt", balance: 1000, rate: 10, minPayment: 50 }]);
  };

  const updateDebt = (id: number, field: string, value: any) => {
    setDebts(debts.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const removeDebt = (id: number) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  // Simulate snowball
  let sortedDebts = [...debts].sort((a, b) => a.balance - b.balance);
  let months = 0;
  let totalInterest = 0;
  const history = [];

  const maxMonths = 1200; // 100 years safety
  let workingDebts = sortedDebts.map(d => ({ ...d }));

  while (workingDebts.length > 0 && months < maxMonths) {
    let availableCash = extraPayment;
    let thisMonthInterest = 0;

    // Pay minimums and collect interest
    for (let i = 0; i < workingDebts.length; i++) {
      const d = workingDebts[i];
      const monthlyRate = (d.rate / 100) / 12;
      const interest = d.balance * monthlyRate;
      thisMonthInterest += interest;
      totalInterest += interest;

      let payment = Math.min(d.minPayment, d.balance + interest);
      availableCash += (d.minPayment - payment); // If min payment covers more than balance+interest, roll it over
      d.balance = d.balance + interest - payment;
    }

    // Apply extra cash to smallest debt
    if (workingDebts.length > 0) {
      let targetIdx = 0; // First is smallest by default since we sorted and don't re-sort
      while (availableCash > 0 && targetIdx < workingDebts.length) {
        const d = workingDebts[targetIdx];
        if (d.balance > 0) {
          const payment = Math.min(d.balance, availableCash);
          d.balance -= payment;
          availableCash -= payment;
        }
        targetIdx++;
      }
    }

    // Filter out paid debts
    workingDebts = workingDebts.filter(d => d.balance > 0.01);
    months++;
  }

  const totalOriginalBalance = debts.reduce((a, b) => a + b.balance, 0);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {debts.map((debt, index) => (
          <div key={debt.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-muted/10 p-4 rounded-lg border">
            <div className="space-y-2">
              <Label>Debt Name</Label>
              <Input value={debt.name} onChange={e => updateDebt(debt.id, "name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Balance ($)</Label>
              <Input type="number" value={debt.balance} onChange={e => updateDebt(debt.id, "balance", Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>APR (%)</Label>
              <Input type="number" step="0.1" value={debt.rate} onChange={e => updateDebt(debt.id, "rate", Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Min Payment ($)</Label>
              <Input type="number" value={debt.minPayment} onChange={e => updateDebt(debt.id, "minPayment", Number(e.target.value) || 0)} />
            </div>
            <Button variant="destructive" size="icon" className="mb-[2px] md:w-full" onClick={() => removeDebt(debt.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addDebt} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Debt
        </Button>
      </div>

      <div className="max-w-md space-y-2">
        <Label className="text-lg text-primary">Extra Monthly Payment ($)</Label>
        <Input type="number" className="text-lg h-12" value={extraPayment} onChange={e => setExtraPayment(Number(e.target.value) || 0)} />
        <p className="text-xs text-muted-foreground">Amount to pay ON TOP of all minimums</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div className="md:col-span-3 bg-primary/10 border border-primary/20 p-6 rounded-xl">
          <h3 className="font-bold mb-1 text-primary">Debt-Free Date</h3>
          <div className="text-4xl font-serif font-bold text-primary">
            {months >= maxMonths ? "Never" : `${Math.floor(months / 12)}y ${months % 12}m`}
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Total Debt</h3>
          <div className="text-2xl font-bold">${Math.round(totalOriginalBalance).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-destructive">Total Interest</h3>
          <div className="text-2xl font-bold text-destructive">${Math.round(totalInterest).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Total Paid</h3>
          <div className="text-2xl font-bold">${Math.round(totalOriginalBalance + totalInterest).toLocaleString()}</div>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-xl border">
        <h3 className="font-bold mb-4">Payoff Order (Snowball)</h3>
        <ol className="list-decimal pl-5 space-y-2">
          {sortedDebts.map(d => (
            <li key={d.id} className="font-medium">{d.name} <span className="text-muted-foreground font-normal">(${d.balance.toLocaleString()})</span></li>
          ))}
        </ol>
      </div>
    </div>
  );
}

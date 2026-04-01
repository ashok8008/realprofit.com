import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function MinimumPaymentTrapCalculator() {
  const [balance, setBalance] = useState(5000);
  const [apr, setApr] = useState(21.99);
  const [minPct, setMinPct] = useState(2);
  const [floor, setFloor] = useState(25);

  const monthlyRate = (apr / 100) / 12;
  
  let currentBalance = balance;
  let months = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  const maxMonths = 1200; // Cap at 100 years

  while (currentBalance > 0 && months < maxMonths) {
    const interest = currentBalance * monthlyRate;
    totalInterest += interest;
    
    let requiredMin = Math.max(currentBalance * (minPct / 100), floor);
    
    // If interest is greater than the min payment, the balance will grow infinitely unless we cap it or flag it.
    // Actually, usually min payment includes interest + 1% of principal, but the prompt says:
    // payment = max(balance x minPct, floor).
    if (requiredMin <= interest && currentBalance > floor) {
      // It will never be paid off
      months = maxMonths;
      break;
    }

    let payment = requiredMin;
    if (currentBalance + interest < payment) {
      payment = currentBalance + interest;
    }

    totalPaid += payment;
    currentBalance = currentBalance + interest - payment;
    months++;
  }

  const willNeverPayOff = months >= maxMonths;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Card Balance ($)</Label>
          <Input type="number" value={balance} onChange={e => setBalance(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Annual APR (%)</Label>
          <Input type="number" value={apr} step="0.1" onChange={e => setApr(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Min Payment (%)</Label>
          <Input type="number" value={minPct} step="0.1" onChange={e => setMinPct(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Min Payment Floor ($)</Label>
          <Input type="number" value={floor} onChange={e => setFloor(Number(e.target.value) || 0)} />
        </div>
      </div>

      {willNeverPayOff ? (
        <div className="bg-destructive/10 text-destructive p-6 rounded-xl text-center border border-destructive/20">
          <h3 className="font-bold text-lg mb-2">Warning: Infinite Debt Trap</h3>
          <p>With a {minPct}% minimum payment, your payment does not cover the monthly interest. Your balance will continue to grow forever.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
          <div className="md:col-span-3 bg-destructive/10 border border-destructive/20 p-6 rounded-xl">
            <h3 className="font-bold mb-1 text-destructive">Time to Payoff</h3>
            <div className="text-4xl font-serif font-bold text-destructive">
              {Math.floor(months / 12)}y {months % 12}m
            </div>
            <p className="text-sm mt-2 opacity-80 text-destructive">By only paying the minimum</p>
          </div>
          <div className="col-span-1 md:col-start-2">
            <h3 className="font-bold mb-1">Total Interest</h3>
            <div className="text-2xl font-bold text-destructive">${Math.round(totalInterest).toLocaleString()}</div>
          </div>
          <div>
            <h3 className="font-bold mb-1">Total Paid</h3>
            <div className="text-2xl font-bold">${Math.round(totalPaid).toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}

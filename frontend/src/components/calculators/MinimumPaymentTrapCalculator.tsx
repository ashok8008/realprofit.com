"use client";
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
  const maxMonths = 1200;

  if (balance > 0) {
    if (apr === 0) {
      while (currentBalance > 0 && months < maxMonths) {
        let requiredMin = Math.max(currentBalance * (minPct / 100), floor);
        let payment = Math.min(requiredMin, currentBalance);
        totalPaid += payment;
        currentBalance -= payment;
        months++;
      }
    } else {
      while (currentBalance > 0 && months < maxMonths) {
        const interest = currentBalance * monthlyRate;
        totalInterest += interest;
        
        let requiredMin = Math.max(currentBalance * (minPct / 100), floor);
        
        if (requiredMin <= interest && currentBalance > floor) {
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
    }
  }

  const willNeverPayOff = months >= maxMonths;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Card Balance ($)</Label>
          <Input type="number" min="0" value={balance} onChange={e => setBalance(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Annual APR (%)</Label>
          <Input type="number" min="0" max="50" step="0.1" value={apr} onChange={e => setApr(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Min Payment (%)</Label>
          <Input type="number" min="0" max="100" step="0.1" value={minPct} onChange={e => setMinPct(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Min Payment Floor ($)</Label>
          <Input type="number" min="0" value={floor} onChange={e => setFloor(Math.max(0, Number(e.target.value) || 0))} />
        </div>
      </div>

      {willNeverPayOff ? (
        <div className="bg-destructive/10 text-destructive p-6 rounded-xl text-center border border-destructive/20">
          <h3 className="font-bold text-lg mb-2">Warning: Infinite Debt Trap</h3>
          <p>With a {minPct}% minimum payment, your payment does not cover the monthly interest. Your balance will continue to grow forever.</p>
        </div>
      ) : balance > 0 ? (
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
            <div className="text-2xl font-bold text-destructive break-words">${Math.round(totalInterest).toLocaleString()}</div>
          </div>
          <div>
            <h3 className="font-bold mb-1">Total Paid</h3>
            <div className="text-2xl font-bold break-words">${Math.round(totalPaid).toLocaleString()}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

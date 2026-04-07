"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function BusinessLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(50000);
  const [rate, setRate] = useState(8.5);
  const [months, setMonths] = useState(24);
  const [frequency, setFrequency] = useState("monthly");

  const periodsPerYear = frequency === "monthly" ? 12 : 52;
  const totalPeriods = frequency === "monthly" ? months : (months / 12) * 52;
  const periodRate = (rate / 100) / periodsPerYear;

  let payment = 0;
  if (loanAmount > 0 && totalPeriods > 0) {
    if (periodRate === 0) {
      payment = loanAmount / totalPeriods;
    } else {
      payment = loanAmount * (periodRate * Math.pow(1 + periodRate, totalPeriods)) / (Math.pow(1 + periodRate, totalPeriods) - 1);
    }
  }

  const totalRepayment = payment * totalPeriods;
  const totalInterest = Math.max(0, totalRepayment - loanAmount);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Loan Amount ($)</Label>
          <Input type="number" min="0" value={loanAmount} onChange={e => setLoanAmount(Math.max(0, Number(e.target.value) || 0))} data-testid="input-amount" />
        </div>
        <div className="space-y-2">
          <Label>Interest Rate (%)</Label>
          <Input type="number" min="0" max="50" value={rate} step="0.1" onChange={e => setRate(Math.max(0, Number(e.target.value) || 0))} data-testid="input-rate" />
        </div>
        <div className="space-y-2">
          <Label>Term (Months)</Label>
          <Input type="number" min="1" max="360" value={months} onChange={e => setMonths(Math.max(1, Math.min(360, Number(e.target.value) || 1)))} data-testid="input-months" />
        </div>
        <div className="space-y-2">
          <Label>Payment Frequency</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger data-testid="select-frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div className="md:col-span-3 bg-primary/10 border border-primary/20 p-6 rounded-xl">
          <h3 className="font-bold mb-1 text-primary">{frequency === "monthly" ? "Monthly" : "Weekly"} Payment</h3>
          <div className="text-4xl font-serif font-bold text-primary" data-testid="text-payment">${Math.round(payment).toLocaleString()}</div>
        </div>
        <div className="md:col-start-2">
          <h3 className="font-bold mb-1">Total Repayment</h3>
          <div className="text-2xl font-bold">${Math.round(totalRepayment).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1 text-destructive">Total Interest</h3>
          <div className="text-2xl font-bold text-destructive">${Math.round(totalInterest).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

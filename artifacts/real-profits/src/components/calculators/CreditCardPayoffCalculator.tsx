import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function CreditCardPayoffCalculator() {
  const [balance, setBalance] = useState(5000);
  const [apr, setApr] = useState(21.99);
  const [payment, setPayment] = useState(200);

  const monthlyRate = (apr / 100) / 12;
  let currentBalance = balance;
  let months = 0;
  let totalInterest = 0;
  const data = [];

  // Prevent infinite loop if payment is less than interest
  const minPaymentReq = balance * monthlyRate;
  const willPayOff = payment > minPaymentReq;

  if (willPayOff) {
    while (currentBalance > 0 && months < 600) { // cap at 50 years
      const interestForMonth = currentBalance * monthlyRate;
      totalInterest += interestForMonth;
      
      let actualPayment = payment;
      if (currentBalance + interestForMonth < payment) {
        actualPayment = currentBalance + interestForMonth;
      }
      
      currentBalance = currentBalance + interestForMonth - actualPayment;
      months++;
      
      if (months % 3 === 0 || currentBalance <= 0) {
        data.push({
          month: months,
          balance: Math.max(0, Math.round(currentBalance))
        });
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Card Balance ($)</Label>
          <Input type="number" value={balance} onChange={e => setBalance(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Interest Rate (APR %)</Label>
          <Input type="number" step="0.1" value={apr} onChange={e => setApr(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Monthly Payment ($)</Label>
          <Input type="number" value={payment} onChange={e => setPayment(Number(e.target.value) || 0)} />
        </div>
      </div>

      {!willPayOff && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-center border border-destructive/20">
          Your payment of ${payment} is less than the monthly interest of ${Math.round(minPaymentReq)}. You will never pay off this card.
        </div>
      )}

      {willPayOff && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
            <div>
              <h3 className="font-bold mb-1">Time to Payoff</h3>
              <div className="text-3xl font-serif font-bold text-primary">
                {Math.floor(months / 12)}y {months % 12}m
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-1">Total Interest Paid</h3>
              <div className="text-3xl font-serif font-bold text-destructive">
                ${Math.round(totalInterest).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="h-[250px]" id="credit-card-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickFormatter={(v) => `${Math.floor(v/12)}y`} />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value) => `$${value}`} labelFormatter={(v) => `Month ${v}`} />
                <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

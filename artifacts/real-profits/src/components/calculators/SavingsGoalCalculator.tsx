import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function SavingsGoalCalculator() {
  const [target, setTarget] = useState<number>(10000);
  const [current, setCurrent] = useState<number>(1000);
  const [monthly, setMonthly] = useState<number>(200);
  const [rate, setRate] = useState<number>(4);

  // Calculate
  const monthlyRate = (rate / 100) / 12;
  let balance = current;
  let months = 0;
  const data = [];

  if (monthly > 0) {
    while (balance < target && months < 1200) { // cap at 100 years
      balance += balance * monthlyRate + monthly;
      months++;
      if (months % 3 === 0 || balance >= target) {
        data.push({
          month: months,
          balance: Math.round(balance),
          target: target
        });
      }
    }
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Savings Target ($)</Label>
          <Input type="number" value={target} onChange={e => setTarget(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Current Savings ($)</Label>
          <Input type="number" value={current} onChange={e => setCurrent(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Monthly Contribution ($)</Label>
          <Input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Annual Interest Rate (%)</Label>
          <Input type="number" value={rate} onChange={e => setRate(Number(e.target.value) || 0)} />
        </div>
      </div>

      <div className="bg-muted/30 p-6 rounded-xl text-center border">
        <h3 className="text-lg font-bold mb-2">Time to Reach Goal</h3>
        <div className="text-4xl font-serif text-primary font-bold">
          {months === 1200 ? "Never" : `${years} years, ${remainingMonths} months`}
        </div>
      </div>

      {data.length > 0 && months < 1200 && (
        <div className="h-[300px] mt-8" id="savings-goal-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
              <XAxis dataKey="month" tickFormatter={(v) => `${Math.floor(v/12)}y`} />
              <YAxis tickFormatter={(v) => `$${v}`} width={80} />
              <Tooltip formatter={(value) => `$${value}`} labelFormatter={(v) => `Month ${v}`} />
              <Line type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

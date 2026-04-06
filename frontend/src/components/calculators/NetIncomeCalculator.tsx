import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function NetIncomeCalculator() {
  const [grossIncome, setGrossIncome] = useState(120000);
  const [taxes, setTaxes] = useState(25000);
  const [businessCosts, setBusinessCosts] = useState(15000);
  const [otherDeductions, setOtherDeductions] = useState(5000);

  const netIncome = grossIncome - taxes - businessCosts - otherDeductions;
  const totalExpenses = taxes + businessCosts + otherDeductions;
  
  const expenseRatio = grossIncome > 0 ? (totalExpenses / grossIncome) * 100 : 0;
  const remainingRatio = grossIncome > 0 ? (netIncome / grossIncome) * 100 : 0;

  const data = [
    { name: "Taxes", value: taxes, fill: "#ef4444" },
    { name: "Business Costs", value: businessCosts, fill: "#f59e0b" },
    { name: "Other Deductions", value: otherDeductions, fill: "#6366f1" },
    { name: "Net Income", value: Math.max(0, netIncome), fill: "#059669" }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
        <div className="space-y-2 md:col-span-2">
          <Label className="text-lg text-primary">Gross Income ($)</Label>
          <Input type="number" min="0" className="text-lg h-12" value={grossIncome} onChange={e => setGrossIncome(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Estimated Taxes ($)</Label>
          <Input type="number" min="0" value={taxes} onChange={e => setTaxes(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Business Costs ($)</Label>
          <Input type="number" min="0" value={businessCosts} onChange={e => setBusinessCosts(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Other Deductions ($)</Label>
          <Input type="number" min="0" value={otherDeductions} onChange={e => setOtherDeductions(Math.max(0, Number(e.target.value) || 0))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div className="md:col-span-3 bg-primary/10 border border-primary/20 p-6 rounded-xl">
          <h3 className="font-bold mb-1 text-primary">True Net Income</h3>
          <div className="text-4xl font-serif font-bold text-primary break-words">${Math.round(netIncome).toLocaleString()}</div>
          <div className="text-sm mt-2 opacity-80">{remainingRatio.toFixed(1)}% of gross income is yours to keep</div>
        </div>
        <div className="col-span-1 md:col-start-2">
          <h3 className="font-bold mb-1">Total Deductions</h3>
          <div className="text-2xl font-bold text-destructive break-words">${Math.round(totalExpenses).toLocaleString()}</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Expense Ratio</h3>
          <div className="text-2xl font-bold">{expenseRatio.toFixed(1)}%</div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data} layout="vertical" margin={{ left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

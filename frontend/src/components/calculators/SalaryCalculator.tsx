"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function SalaryCalculator() {
  const [salary, setSalary] = useState(75000);
  const [frequency, setFrequency] = useState("annual");
  const [taxRate, setTaxRate] = useState(22);
  const [retirement, setRetirement] = useState(6);
  const [insurance, setInsurance] = useState(200);

  // Normalize to annual
  const annualSalary = frequency === "annual" ? salary
    : frequency === "monthly" ? salary * 12
    : frequency === "biweekly" ? salary * 26
    : salary * 2080;

  const taxAmount = annualSalary * (taxRate / 100);
  const retirementAmount = annualSalary * (retirement / 100);
  const insuranceAnnual = insurance * 12;
  const totalDeductions = taxAmount + retirementAmount + insuranceAnnual;
  const netAnnual = Math.max(0, annualSalary - totalDeductions);

  const monthly = netAnnual / 12;
  const biweekly = netAnnual / 26;
  const hourly = netAnnual / 2080;

  const data = [
    { name: "Gross", amount: Math.round(annualSalary), fill: "#0B3D3D" },
    { name: "Tax", amount: Math.round(taxAmount), fill: "#ef4444" },
    { name: "401(k)", amount: Math.round(retirementAmount), fill: "#f59e0b" },
    { name: "Insurance", amount: Math.round(insuranceAnnual), fill: "#8b5cf6" },
    { name: "Take-Home", amount: Math.round(netAnnual), fill: "#10b981" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Salary Amount ($)</Label>
          <Input type="number" min="0" value={salary} onChange={e => setSalary(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Pay Frequency</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="annual">Annual</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Estimated Tax Rate (%)</Label>
          <Input type="number" min="0" max="60" value={taxRate} onChange={e => setTaxRate(Math.max(0, Math.min(60, Number(e.target.value) || 0)))} />
        </div>
        <div className="space-y-2">
          <Label>Retirement Contribution (%)</Label>
          <Input type="number" min="0" max="100" value={retirement} onChange={e => setRetirement(Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
        </div>
        <div className="space-y-2">
          <Label>Monthly Health Insurance ($)</Label>
          <Input type="number" min="0" value={insurance} onChange={e => setInsurance(Math.max(0, Number(e.target.value) || 0))} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-primary/10 border border-primary/20 p-5 rounded-xl text-center">
          <div className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Annual Take-Home</div>
          <div className="text-3xl font-serif font-bold text-primary">${Math.round(netAnnual).toLocaleString()}</div>
        </div>
        <div className="bg-muted/30 p-5 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Monthly</div>
          <div className="text-2xl font-serif font-bold">${Math.round(monthly).toLocaleString()}</div>
        </div>
        <div className="bg-muted/30 p-5 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Bi-weekly</div>
          <div className="text-2xl font-serif font-bold">${Math.round(biweekly).toLocaleString()}</div>
        </div>
        <div className="bg-muted/30 p-5 rounded-xl border text-center">
          <div className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">Hourly</div>
          <div className="text-2xl font-serif font-bold">${hourly.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-bold mb-4">Deduction Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Federal + State Tax ({taxRate}%)</span>
              <span className="font-bold text-red-600">${Math.round(taxAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Retirement ({retirement}%)</span>
              <span className="font-bold text-amber-600">${Math.round(retirementAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Health Insurance</span>
              <span className="font-bold text-violet-600">${Math.round(insuranceAnnual).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t font-bold">
              <span>Total Deductions</span>
              <span>${Math.round(totalDeductions).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

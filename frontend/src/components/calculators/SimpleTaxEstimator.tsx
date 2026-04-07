"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export function SimpleTaxEstimator() {
  const [income, setIncome] = useState(75000);
  const [stateRate, setStateRate] = useState(5);
  
  const standardDeduction = 14600;
  const taxable = Math.max(0, income - standardDeduction);
  
  let federalTax = 0;
  if (taxable > 609350) {
    federalTax += (taxable - 609350) * 0.37 + 183647.25;
  } else if (taxable > 243725) {
    federalTax += (taxable - 243725) * 0.35 + 55678.5;
  } else if (taxable > 191950) {
    federalTax += (taxable - 191950) * 0.32 + 39110.5;
  } else if (taxable > 100525) {
    federalTax += (taxable - 100525) * 0.24 + 17168.5;
  } else if (taxable > 47150) {
    federalTax += (taxable - 47150) * 0.22 + 5426;
  } else if (taxable > 11600) {
    federalTax += (taxable - 11600) * 0.12 + 1160;
  } else if (taxable > 0) {
    federalTax += taxable * 0.10;
  }

  const stateTax = taxable * (stateRate / 100);
  const totalTax = federalTax + stateTax;
  const takeHome = income - totalTax;
  
  const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;

  const data = [
    { name: "Take Home", value: Math.max(0, takeHome) },
    { name: "Federal Tax", value: Math.max(0, federalTax) },
    { name: "State Tax", value: Math.max(0, stateTax) },
  ];
  
  const COLORS = ['#059669', '#ef4444', '#f59e0b'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Gross Annual Income ($)</Label>
          <Input type="number" min="0" value={income} onChange={e => setIncome(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>State Tax Rate (%)</Label>
          <Input type="number" min="0" max="15" step="0.1" value={stateRate} onChange={e => setStateRate(Math.max(0, Math.min(15, Number(e.target.value) || 0)))} />
          <p className="text-xs text-muted-foreground">Enter your state's income tax rate (0% for states with no income tax)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/30 p-4 rounded-xl border text-center">
          <h4 className="text-sm font-medium text-muted-foreground">Estimated Total Tax</h4>
          <div className="text-2xl font-bold mt-1 text-destructive">${Math.round(totalTax).toLocaleString()}</div>
        </div>
        <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 text-center md:col-span-2">
          <h4 className="text-sm font-medium text-primary">Estimated Take-Home Pay</h4>
          <div className="text-3xl font-bold mt-1 text-primary">${Math.round(takeHome).toLocaleString()}</div>
          <p className="text-xs mt-1 opacity-80">Effective Tax Rate: {effectiveRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-muted/20 p-4 rounded-lg border text-sm text-muted-foreground">
        <p className="font-medium mb-1">How this works:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Federal tax is calculated using 2024 single-filer brackets after a ${standardDeduction.toLocaleString()} standard deduction</li>
          <li>State tax is applied at the flat rate you entered on your taxable income</li>
          <li>This is an estimate -- actual taxes depend on filing status, deductions, and credits</li>
        </ul>
      </div>

      <div className="h-[250px]" id="simple-tax-chart">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip formatter={(value) => `$${Math.round(Number(value)).toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

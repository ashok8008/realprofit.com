import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export function SalaryRealityCalculator() {
  const [grossSalary, setGrossSalary] = useState(80000);
  const [taxRate, setTaxRate] = useState(25);
  const [expenses, setExpenses] = useState({
    housing: 1500,
    debt: 400,
    necessities: 800,
    savings: 500,
  });

  const afterTax = grossSalary * (1 - taxRate / 100);
  const monthlyTakeHome = afterTax / 12;
  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const leftover = monthlyTakeHome - totalExpenses;

  const data = [
    { name: "Housing", value: expenses.housing },
    { name: "Debt", value: expenses.debt },
    { name: "Necessities", value: expenses.necessities },
    { name: "Savings", value: expenses.savings },
    { name: "Leftover", value: Math.max(0, leftover) }
  ];

  const COLORS = ['#059669', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  const handleExpenseChange = (key: string, val: string) => {
    setExpenses({ ...expenses, [key]: Math.max(0, Number(val) || 0) });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
        <div className="space-y-2">
          <Label>New Gross Salary ($)</Label>
          <Input type="number" min="0" value={grossSalary} onChange={e => setGrossSalary(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Estimated Tax Rate (%)</Label>
          <Input type="number" min="0" max="60" value={taxRate} onChange={e => setTaxRate(Math.max(0, Math.min(60, Number(e.target.value) || 0)))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {Object.entries(expenses).map(([key, value]) => (
          <div className="space-y-2" key={key}>
            <Label className="capitalize">{key} ($/mo)</Label>
            <Input 
              type="number" 
              min="0"
              value={value} 
              onChange={e => handleExpenseChange(key, e.target.value)} 
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-xl border text-center">
            <h4 className="text-sm font-medium text-muted-foreground">Annual After-Tax</h4>
            <div className="text-2xl font-bold mt-1 break-words">${Math.round(afterTax).toLocaleString()}</div>
          </div>
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-center">
            <h4 className="text-sm font-medium text-primary">Monthly Take-Home</h4>
            <div className="text-3xl font-bold mt-1 text-primary break-words">${Math.round(monthlyTakeHome).toLocaleString()}</div>
          </div>
          <div className={`p-4 rounded-xl border text-center ${leftover >= 0 ? 'bg-muted/30' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
            <h4 className="text-sm font-medium">True Leftover / Fun Money</h4>
            <div className="text-2xl font-bold mt-1 break-words">${Math.round(leftover).toLocaleString()} / mo</div>
          </div>
        </div>

        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={data.filter(d => d.value > 0)}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value) => `$${Math.round(Number(value))}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

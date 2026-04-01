import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export function MonthlyBudgetCalculator() {
  const [income, setIncome] = useState(5000);
  const [expenses, setExpenses] = useState({
    housing: 1500,
    food: 600,
    transport: 400,
    utilities: 250,
    debt: 500,
    savings: 500,
    entertainment: 300,
    misc: 200
  });

  const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
  const remaining = income - totalExpenses;
  
  const savingsRatio = income > 0 ? (expenses.savings / income) * 100 : 0;
  const debtRatio = income > 0 ? (expenses.debt / income) * 100 : 0;

  const data = Object.entries(expenses)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#f59e0b', '#fbbf24', '#fcd34d'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="space-y-2 md:col-span-2 border-b pb-4 mb-2">
          <Label className="text-lg text-primary">Monthly Net Income ($)</Label>
          <Input 
            type="number" 
            className="text-lg h-12"
            value={income} 
            onChange={e => setIncome(Number(e.target.value) || 0)} 
          />
        </div>
        
        {Object.entries(expenses).map(([key, value]) => (
          <div className="space-y-2" key={key}>
            <Label className="capitalize">{key} ($)</Label>
            <Input 
              type="number" 
              value={value} 
              onChange={e => setExpenses({...expenses, [key]: Number(e.target.value) || 0})} 
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-muted/30 p-4 rounded-xl border text-center">
            <h4 className="text-sm font-medium text-muted-foreground">Total Expenses</h4>
            <div className="text-2xl font-bold mt-1">${totalExpenses.toLocaleString()}</div>
          </div>
          <div className={`p-4 rounded-xl border text-center ${remaining >= 0 ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
            <h4 className="text-sm font-medium">Remaining Balance</h4>
            <div className="text-3xl font-bold mt-1">${remaining.toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/20 p-3 rounded-lg border text-center">
              <div className="text-xs text-muted-foreground">Savings Rate</div>
              <div className="font-bold">{savingsRatio.toFixed(1)}%</div>
            </div>
            <div className="bg-muted/20 p-3 rounded-lg border text-center">
              <div className="text-xs text-muted-foreground">Debt-to-Income</div>
              <div className="font-bold">{debtRatio.toFixed(1)}%</div>
            </div>
          </div>
        </div>
        
        <div className="h-[250px]" id="monthly-budget-chart">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value) => `$${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

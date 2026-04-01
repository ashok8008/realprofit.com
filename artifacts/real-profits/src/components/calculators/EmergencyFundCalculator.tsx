import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export function EmergencyFundCalculator() {
  const [expenses, setExpenses] = useState({
    housing: 1500,
    food: 600,
    transport: 300,
    utilities: 200,
    insurance: 150,
    other: 250,
  });
  const [months, setMonths] = useState(6);

  const totalMonthly = Object.values(expenses).reduce((a, b) => a + b, 0);
  const target = totalMonthly * months;

  const data = [
    { name: "Housing", value: expenses.housing },
    { name: "Food", value: expenses.food },
    { name: "Transport", value: expenses.transport },
    { name: "Utilities", value: expenses.utilities },
    { name: "Insurance", value: expenses.insurance },
    { name: "Other", value: expenses.other },
  ].filter(d => d.value > 0);

  const COLORS = ['#059669', '#34d399', '#10b981', '#6ee7b7', '#a7f3d0', '#d1fae5'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {Object.entries(expenses).map(([key, value]) => (
          <div className="space-y-2" key={key}>
            <Label className="capitalize">{key} ($/mo)</Label>
            <Input 
              type="number" 
              value={value} 
              onChange={e => setExpenses({...expenses, [key]: Number(e.target.value) || 0})} 
            />
          </div>
        ))}
        <div className="space-y-2 md:col-span-2 mt-4 pt-4 border-t">
          <Label>Target Months to Save For</Label>
          <div className="flex gap-4 mt-2">
            {[3, 6, 9, 12].map(m => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className={`flex-1 py-2 rounded-md border font-medium transition-colors ${months === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
              >
                {m} Months
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border">
        <div className="flex flex-col justify-center text-center">
          <h3 className="text-lg font-bold mb-2">Total Emergency Fund Target</h3>
          <div className="text-4xl font-serif text-primary font-bold">
            ${target.toLocaleString()}
          </div>
          <p className="text-muted-foreground mt-2">Based on ${totalMonthly.toLocaleString()}/mo in essential expenses</p>
        </div>
        <div className="h-[200px]" id="emergency-fund-chart">
          <ResponsiveContainer width="100%" height="100%">
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
              <RechartsTooltip formatter={(value) => `$${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export function ExpenseBreakdownTool() {
  const [expenses, setExpenses] = useState({
    housing: 2000,
    food: 800,
    transport: 400,
    entertainment: 300,
    utilities: 250,
    other: 450,
  });

  const total = Object.values(expenses).reduce((a, b) => a + b, 0);

  const data = Object.entries(expenses)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const topCategory = data.length > 0 ? data[0] : null;
  const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#fcd34d', '#fbbf24', '#f59e0b'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {Object.entries(expenses).map(([key, value]) => (
          <div className="space-y-2" key={key}>
            <Label className="capitalize">{key} ($/mo)</Label>
            <Input
              type="number"
              value={value}
              onChange={(e) => setExpenses({ ...expenses, [key]: Number(e.target.value) || 0 })}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border">
        <div className="text-center">
          <h3 className="font-bold mb-1">Total Monthly</h3>
          <div className="text-3xl font-serif font-bold text-primary">${total.toLocaleString()}</div>
        </div>
        <div className="text-center md:col-span-2">
          {topCategory ? (
            <>
              <h3 className="font-bold mb-1">Top Spending Category</h3>
              <div className="text-2xl font-bold">{topCategory.name}: ${topCategory.value.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {((topCategory.value / total) * 100).toFixed(1)}% of total budget
              </p>
            </>
          ) : (
            <div className="text-muted-foreground">Add expenses to see breakdown.</div>
          )}
        </div>
      </div>

      {total > 0 && (
        <div className="h-[300px]" id="expense-breakdown-chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

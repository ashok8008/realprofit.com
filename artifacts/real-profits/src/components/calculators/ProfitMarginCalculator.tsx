import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export function ProfitMarginCalculator() {
  const [revenue, setRevenue] = useState(100000);
  const [costs, setCosts] = useState(60000);

  const profit = revenue - costs;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  const data = [
    { name: "Profit", value: Math.max(0, profit) },
    { name: "Costs", value: Math.max(0, costs) }
  ];

  const COLORS = ['#059669', '#ef4444'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div className="space-y-2">
          <Label>Total Revenue ($)</Label>
          <Input type="number" min="0" value={revenue} onChange={e => setRevenue(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Total Costs ($)</Label>
          <Input type="number" min="0" value={costs} onChange={e => setCosts(Math.max(0, Number(e.target.value) || 0))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-muted/30 p-6 rounded-xl border">
        <div className="space-y-6 text-center">
          <div>
            <h3 className="font-bold mb-1">Net Profit</h3>
            <div className={`text-4xl font-serif font-bold ${profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              ${Math.round(profit).toLocaleString()}
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-1">Profit Margin</h3>
            <div className={`text-3xl font-bold ${margin >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {margin.toFixed(1)}%
            </div>
          </div>
        </div>

        {revenue > 0 && costs >= 0 && (
          <div className="h-[250px]">
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
        )}
      </div>
    </div>
  );
}

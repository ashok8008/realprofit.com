import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function CostOfLivingComparison() {
  const [currentCosts, setCurrentCosts] = useState({
    rent: 1500,
    groceries: 400,
    transport: 200,
    utilities: 150,
    misc: 300
  });

  const [targetCosts, setTargetCosts] = useState({
    rent: 2200,
    groceries: 500,
    transport: 250,
    utilities: 200,
    misc: 400
  });

  const currentTotal = Object.values(currentCosts).reduce((a, b) => a + b, 0);
  const targetTotal = Object.values(targetCosts).reduce((a, b) => a + b, 0);

  const diffMonthly = targetTotal - currentTotal;
  const diffAnnually = diffMonthly * 12;

  const data = [
    { name: "Rent", Current: currentCosts.rent, Target: targetCosts.rent },
    { name: "Groceries", Current: currentCosts.groceries, Target: targetCosts.groceries },
    { name: "Transport", Current: currentCosts.transport, Target: targetCosts.transport },
    { name: "Utilities", Current: currentCosts.utilities, Target: targetCosts.utilities },
    { name: "Misc", Current: currentCosts.misc, Target: targetCosts.misc },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div className="font-bold text-lg border-b pb-2 col-span-1">Current City ($/mo)</div>
        <div className="font-bold text-lg border-b pb-2 col-span-1">Target City ($/mo)</div>

        {Object.keys(currentCosts).map((key) => (
          <React.Fragment key={key}>
            <div className="space-y-2">
              <Label className="capitalize">{key}</Label>
              <Input 
                type="number" 
                min="0"
                value={currentCosts[key as keyof typeof currentCosts]} 
                onChange={e => setCurrentCosts({...currentCosts, [key]: Math.max(0, Number(e.target.value) || 0)})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="capitalize">{key}</Label>
              <Input 
                type="number" 
                min="0"
                value={targetCosts[key as keyof typeof targetCosts]} 
                onChange={e => setTargetCosts({...targetCosts, [key]: Math.max(0, Number(e.target.value) || 0)})} 
              />
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div>
          <h3 className="font-bold mb-1">Current Total</h3>
          <div className="text-2xl font-bold">${currentTotal.toLocaleString()} / mo</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Target Total</h3>
          <div className="text-2xl font-bold">${targetTotal.toLocaleString()} / mo</div>
        </div>
        <div className={diffMonthly > 0 ? "text-destructive" : "text-emerald-600"}>
          <h3 className="font-bold mb-1">Difference</h3>
          <div className="text-2xl font-bold">{diffMonthly > 0 ? '+' : ''}${diffMonthly.toLocaleString()} / mo</div>
          <div className="text-sm opacity-80">{diffAnnually > 0 ? '+' : ''}${diffAnnually.toLocaleString()} / year</div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value}`} />
            <Bar dataKey="Current" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Target" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

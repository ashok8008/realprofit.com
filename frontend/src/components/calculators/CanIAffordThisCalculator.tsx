import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function CanIAffordThisCalculator() {
  const [takeHome, setTakeHome] = useState(5000);
  const [expenses, setExpenses] = useState(3500);
  const [newCost, setNewCost] = useState(400);

  const currentLeftover = takeHome - expenses;
  const afterLeftover = currentLeftover - newCost;
  const ratio = takeHome > 0 ? (newCost / takeHome) * 100 : 0;

  const isAffordable = afterLeftover >= 0;
  const isTight = afterLeftover > 0 && afterLeftover < takeHome * 0.1;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Monthly Take-Home ($)</Label>
          <Input type="number" min="0" value={takeHome} onChange={e => setTakeHome(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Current Monthly Expenses ($)</Label>
          <Input type="number" min="0" value={expenses} onChange={e => setExpenses(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>New Monthly Cost ($)</Label>
          <Input type="number" min="0" value={newCost} onChange={e => setNewCost(Math.max(0, Number(e.target.value) || 0))} />
          <p className="text-xs text-muted-foreground">E.g., new car payment, subscription</p>
        </div>
      </div>

      <div className={`p-8 rounded-xl border text-center ${
        !isAffordable 
          ? 'bg-destructive/10 border-destructive/20 text-destructive' 
          : isTight 
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-500' 
            : 'bg-primary/10 border-primary/20 text-primary'
      }`}>
        <h3 className="font-bold text-2xl mb-2">
          {!isAffordable 
            ? "No, you cannot afford this." 
            : isTight 
              ? "Yes, but it will be very tight." 
              : "Yes, you can afford this!"}
        </h3>
        <p className="opacity-80">This purchase takes up {ratio.toFixed(1)}% of your monthly income.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div>
          <h3 className="font-bold mb-1">Current Leftover</h3>
          <div className="text-3xl font-serif font-bold break-words">${Math.round(currentLeftover).toLocaleString()} / mo</div>
        </div>
        <div>
          <h3 className="font-bold mb-1">Leftover After Purchase</h3>
          <div className={`text-3xl font-serif font-bold break-words ${afterLeftover < 0 ? 'text-destructive' : 'text-primary'}`}>
            ${Math.round(afterLeftover).toLocaleString()} / mo
          </div>
        </div>
      </div>
    </div>
  );
}

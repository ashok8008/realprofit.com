"use client";
import React from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const PIE_COLORS = ["#2563eb", "#dc2626", "#16a34a", "#f59e0b", "#8b5cf6", "#ec4899"];

interface SubSummaryProps {
  totalMonthly: number;
  totalAnnual: number;
  avgMonthly: number;
  subsCount: number;
  mostExpensive: { name: string; monthlyEquivalent: number } | null;
  categoryData: { name: string; value: number }[];
}

export function SubscriptionSummary({ totalMonthly, totalAnnual, avgMonthly, subsCount, mostExpensive, categoryData }: SubSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4" data-testid="subscription-summary">
        <h3 className="font-bold border-b pb-2">Summary</h3>
        <div>
          <p className="text-sm text-muted-foreground">Total Monthly</p>
          <p className="text-3xl font-serif font-bold text-primary">${totalMonthly.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Annual</p>
          <p className="text-2xl font-bold">${totalAnnual.toFixed(2)}</p>
        </div>
        <div className="pt-4 border-t grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Average / Sub</p>
            <p className="font-medium">${avgMonthly.toFixed(2)}/mo</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Subs</p>
            <p className="font-medium">{subsCount}</p>
          </div>
        </div>
        {mostExpensive && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-1">Most Expensive</p>
            <div className="flex justify-between items-center bg-muted/30 p-2 rounded">
              <span className="font-medium">{mostExpensive.name}</span>
              <span className="font-mono text-destructive">${mostExpensive.monthlyEquivalent.toFixed(2)}/mo</span>
            </div>
          </div>
        )}
      </div>

      {categoryData.length > 0 && (
        <div className="bg-card border rounded-xl p-6 shadow-sm" data-testid="subscription-category-chart">
          <h3 className="font-bold mb-4">By Category (Monthly)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                <span className="capitalize">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

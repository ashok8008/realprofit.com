import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "rp-tool-paycheck";

export function PaycheckCalculator() {
  const { toast } = useToast();
  
  const [data, setData] = useState({
    grossPay: 3000,
    frequency: "biweekly",
    taxRate: 22,
    retirement: 150,
    insurance: 100,
    otherDeductions: 50
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setData(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const getMultiplier = (freq: string) => {
    switch (freq) {
      case "weekly": return 52;
      case "biweekly": return 26;
      case "semimonthly": return 24;
      case "monthly": return 12;
      case "annual": return 1;
      default: return 1;
    }
  };

  const multiplier = getMultiplier(data.frequency);
  const annualGross = data.grossPay * multiplier;
  
  const taxAmount = data.grossPay * (data.taxRate / 100);
  const totalDeductions = data.retirement + data.insurance + data.otherDeductions;
  const takeHome = data.grossPay - taxAmount - totalDeductions;
  
  const annualTakeHome = takeHome * multiplier;

  const chartData = [
    { name: "Take Home", value: takeHome, fill: "hsl(var(--chart-2))" },
    { name: "Taxes", value: taxAmount, fill: "hsl(var(--destructive))" },
    { name: "Retirement", value: data.retirement, fill: "hsl(var(--chart-1))" },
    { name: "Insurance", value: data.insurance, fill: "hsl(var(--chart-4))" },
    { name: "Other", value: data.otherDeductions, fill: "hsl(var(--chart-5))" }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div className="bg-muted/30 border-l-4 border-l-primary p-4 rounded-r-lg text-sm text-muted-foreground mb-6">
        <strong>Disclaimer:</strong> This is a simplified estimate for educational purposes. Actual tax withholdings are complex and depend on your W-4, state, local taxes, and exact benefit structures.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold border-b pb-2">Income Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gross Pay ($)</Label>
                <Input type="number" min="0" value={data.grossPay} onChange={e => setData({...data, grossPay: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label>Pay Frequency</Label>
                <Select value={data.frequency} onValueChange={v => setData({...data, frequency: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly (52/yr)</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly (26/yr)</SelectItem>
                    <SelectItem value="semimonthly">Semi-monthly (24/yr)</SelectItem>
                    <SelectItem value="monthly">Monthly (12/yr)</SelectItem>
                    <SelectItem value="annual">Annually (1/yr)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Estimated Tax Rate (%)</Label>
              <Input type="number" min="0" max="100" value={data.taxRate} onChange={e => setData({...data, taxRate: parseFloat(e.target.value) || 0})} />
              <p className="text-xs text-muted-foreground">Combined Federal, State, and FICA estimate.</p>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold border-b pb-2">Deductions (per paycheck)</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <Label>Retirement (401k, etc)</Label>
                <Input type="number" className="text-right" value={data.retirement} onChange={e => setData({...data, retirement: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label>Health Insurance</Label>
                <Input type="number" className="text-right" value={data.insurance} onChange={e => setData({...data, insurance: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label>Other Deductions</Label>
                <Input type="number" className="text-right" value={data.otherDeductions} onChange={e => setData({...data, otherDeductions: parseFloat(e.target.value) || 0})} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary text-primary-foreground rounded-xl p-8 text-center shadow-md">
            <p className="text-primary-foreground/80 uppercase tracking-widest text-sm font-bold mb-2">Estimated Take-Home</p>
            <h3 className="text-5xl md:text-6xl font-serif font-bold mb-2">
              ${takeHome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </h3>
            <p className="text-primary-foreground/80">per paycheck</p>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-center mb-6">Paycheck Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => [`$${value.toLocaleString(undefined, {minimumFractionDigits: 2})}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 mt-4 text-sm">
              <div className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="font-medium">Gross Pay</span>
                <span>${data.grossPay.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between p-2 text-destructive">
                <span>Estimated Taxes</span>
                <span>-${taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between p-2 text-muted-foreground">
                <span>Total Deductions</span>
                <span>-${totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between p-2 border-t font-bold text-base">
                <span>Take-Home Pay</span>
                <span>${takeHome.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm text-center">
            <h3 className="font-bold border-b pb-2 mb-4">Annualized Perspective</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Annual Gross</p>
                <p className="text-xl font-bold">${annualGross.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Annual Take-Home</p>
                <p className="text-xl font-bold text-primary">${annualTakeHome.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
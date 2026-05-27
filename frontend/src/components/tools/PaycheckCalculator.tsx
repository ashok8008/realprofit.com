"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { saveToStorage, loadFromStorage } from "@/lib/career-tools/storage";

const STORAGE_KEY = "paycheck";

const CHART_COLORS = ["#22c55e", "#ef4444", "#2563eb", "#f59e0b", "#8b5cf6"];

export function PaycheckCalculator() {
  const { toast } = useToast();

  const [data, setData] = useState({
    grossPay: "3000",
    frequency: "biweekly",
    taxRate: "22",
    retirement: "150",
    insurance: "100",
    otherDeductions: "50"
  });

  useEffect(() => {
    const saved = loadFromStorage(STORAGE_KEY, data);
    setData({
      grossPay: String(saved.grossPay ?? "3000"),
      frequency: saved.frequency || "biweekly",
      taxRate: String(saved.taxRate ?? "22"),
      retirement: String(saved.retirement ?? "150"),
      insurance: String(saved.insurance ?? "100"),
      otherDeductions: String(saved.otherDeductions ?? "50"),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveToStorage(STORAGE_KEY, data);
  }, [data]);

  const grossPayVal = Math.max(0, parseFloat(data.grossPay) || 0);
  const taxRateVal = Math.min(100, Math.max(0, parseFloat(data.taxRate) || 0));
  const retirementVal = Math.max(0, parseFloat(data.retirement) || 0);
  const insuranceVal = Math.max(0, parseFloat(data.insurance) || 0);
  const otherVal = Math.max(0, parseFloat(data.otherDeductions) || 0);

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
  const annualGross = grossPayVal * multiplier;

  const taxAmount = grossPayVal * (taxRateVal / 100);
  const totalDeductions = retirementVal + insuranceVal + otherVal;
  const takeHome = grossPayVal - taxAmount - totalDeductions;

  const annualTakeHome = takeHome * multiplier;

  const chartData = [
    { name: "Take Home", value: takeHome, color: CHART_COLORS[0] },
    { name: "Taxes", value: taxAmount, color: CHART_COLORS[1] },
    { name: "Retirement (401k)", value: retirementVal, color: CHART_COLORS[2] },
    { name: "Health Insurance", value: insuranceVal, color: CHART_COLORS[3] },
    { name: "Other Deductions", value: otherVal, color: CHART_COLORS[4] }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-2">
        <div className="bg-muted/30 border-l-4 border-l-primary p-4 rounded-r-lg text-sm text-muted-foreground flex-1">
          <strong>Disclaimer:</strong> This is a simplified estimate for educational purposes. Actual tax withholdings depend on your W-4, state, local taxes, and benefit structures.
        </div>
        <div className="flex gap-2 ml-4 flex-shrink-0">
          <button onClick={() => { setData({ grossPay: "3000", frequency: "biweekly", taxRate: "22", retirement: "150", insurance: "100", otherDeductions: "50" }); toast({ title: "Reset to defaults" }); }} className="px-3 py-2 text-sm font-medium border rounded-lg hover:bg-muted/50">Reset</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold border-b pb-2">Income Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gross Pay ($)</Label>
                <Input type="number" min="0" value={data.grossPay} onChange={e => { const v = e.target.value; if (v === "" || parseFloat(v) >= 0) setData({ ...data, grossPay: v }); }} />
              </div>
              <div className="space-y-2">
                <Label>Pay Frequency</Label>
                <Select value={data.frequency} onValueChange={v => setData({ ...data, frequency: v })}>
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
              <Input type="number" min="0" max="100" value={data.taxRate} onChange={e => { const v = e.target.value; if (v === "" || (parseFloat(v) >= 0 && parseFloat(v) <= 100)) setData({ ...data, taxRate: v }); }} />
              <p className="text-xs text-muted-foreground">Combined Federal, State, and FICA estimate.</p>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold border-b pb-2">Deductions (per paycheck)</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <Label>Retirement (401k, etc)</Label>
                <Input type="number" min="0" className="text-right" value={data.retirement} onChange={e => { const v = e.target.value; if (v === "" || parseFloat(v) >= 0) setData({ ...data, retirement: v }); }} />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label>Health Insurance</Label>
                <Input type="number" min="0" className="text-right" value={data.insurance} onChange={e => { const v = e.target.value; if (v === "" || parseFloat(v) >= 0) setData({ ...data, insurance: v }); }} />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label>Other Deductions</Label>
                <Input type="number" min="0" className="text-right" value={data.otherDeductions} onChange={e => { const v = e.target.value; if (v === "" || parseFloat(v) >= 0) setData({ ...data, otherDeductions: v }); }} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary text-primary-foreground rounded-xl p-8 text-center shadow-md">
            <p className="text-primary-foreground/80 uppercase tracking-widest text-sm font-bold mb-2">Estimated Take-Home</p>
            <h3 className="text-5xl md:text-6xl font-serif font-bold mb-2">
              ${takeHome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-primary-foreground/80">per paycheck</p>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-center mb-6">Paycheck Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number, name: string) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-4 text-sm">
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Gross Pay</span>
                </div>
                <span>${grossPayVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[1] }}></div>
                  <span>Estimated Taxes ({taxRateVal}%)</span>
                </div>
                <span style={{ color: CHART_COLORS[1] }}>-${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {retirementVal > 0 && (
                <div className="flex justify-between items-center p-2 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[2] }}></div>
                    <span>Retirement (401k, etc)</span>
                  </div>
                  <span style={{ color: CHART_COLORS[2] }}>-${retirementVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {insuranceVal > 0 && (
                <div className="flex justify-between items-center p-2 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[3] }}></div>
                    <span>Health Insurance</span>
                  </div>
                  <span style={{ color: CHART_COLORS[3] }}>-${insuranceVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {otherVal > 0 && (
                <div className="flex justify-between items-center p-2 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[4] }}></div>
                    <span>Other Deductions</span>
                  </div>
                  <span style={{ color: CHART_COLORS[4] }}>-${otherVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-2 border-t font-bold text-base">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[0] }}></div>
                  <span>Take-Home Pay</span>
                </div>
                <span style={{ color: CHART_COLORS[0] }}>${takeHome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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

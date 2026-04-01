import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { RotateCcw } from "lucide-react";
import { ExportToCSVButton, ExportToPDFButton } from "@/components/export/ExportButtons";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "rp-tool-net-worth";

export function NetWorthCalculator() {
  const { toast } = useToast();
  
  const [assets, setAssets] = useState({
    cash: 5000,
    savings: 15000,
    investments: 45000,
    retirement: 120000,
    property: 350000,
    vehicles: 18000,
    other: 5000
  });

  const [liabilities, setLiabilities] = useState({
    mortgage: 280000,
    studentLoans: 35000,
    personalLoans: 0,
    autoLoans: 12000,
    creditCards: 4500,
    other: 0
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.assets) setAssets(parsed.assets);
        if (parsed.liabilities) setLiabilities(parsed.liabilities);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ assets, liabilities }));
  }, [assets, liabilities]);

  const handleAssetChange = (key: keyof typeof assets, value: string) => {
    setAssets(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const handleLiabilityChange = (key: keyof typeof liabilities, value: string) => {
    setLiabilities(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const totalAssets = Object.values(assets).reduce((a, b) => a + b, 0);
  const totalLiabilities = Object.values(liabilities).reduce((a, b) => a + b, 0);
  const netWorth = totalAssets - totalLiabilities;

  const handleReset = () => {
    setAssets({ cash: 0, savings: 0, investments: 0, retirement: 0, property: 0, vehicles: 0, other: 0 });
    setLiabilities({ mortgage: 0, studentLoans: 0, personalLoans: 0, autoLoans: 0, creditCards: 0, other: 0 });
    toast({ title: "Reset", description: "All fields have been cleared." });
  };

  // Chart Data
  const pieData = [
    { name: "Assets", value: totalAssets, fill: "hsl(var(--chart-2))" },
    { name: "Liabilities", value: totalLiabilities, fill: "hsl(var(--destructive))" }
  ].filter(d => d.value > 0);

  const barData = [
    { name: "Cash/Savings", amount: assets.cash + assets.savings, type: "asset" },
    { name: "Investments", amount: assets.investments + assets.retirement, type: "asset" },
    { name: "Property/Vehicles", amount: assets.property + assets.vehicles, type: "asset" },
    { name: "Housing Debt", amount: liabilities.mortgage, type: "liability" },
    { name: "Consumer Debt", amount: liabilities.creditCards + liabilities.personalLoans + liabilities.autoLoans, type: "liability" },
    { name: "Student Debt", amount: liabilities.studentLoans, type: "liability" }
  ].filter(d => d.amount > 0).sort((a, b) => b.amount - a.amount);

  const exportData = [
    ...Object.entries(assets).map(([k, v]) => ({ Type: 'Asset', Category: k, Amount: v })),
    ...Object.entries(liabilities).map(([k, v]) => ({ Type: 'Liability', Category: k, Amount: v }))
  ];

  return (
    <div className="space-y-8" id="net-worth-report">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-serif font-bold">Net Worth Calculator</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2"/> Reset</Button>
          <ExportToCSVButton data={exportData} title="Net Worth Data" />
          <ExportToPDFButton elementId="net-worth-report" title="Net Worth Report" />
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-8 shadow-sm text-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2 font-bold">Total Net Worth</p>
        <h3 className={`text-5xl md:text-6xl font-serif font-bold ${netWorth >= 0 ? 'text-green-600 dark:text-green-500' : 'text-destructive'}`}>
          ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets Form */}
        <div className="space-y-6 bg-muted/10 p-6 rounded-xl border border-green-200/50 dark:border-green-900/50">
          <div className="flex justify-between items-center border-b border-green-200/50 dark:border-green-900/50 pb-2">
            <h3 className="font-bold text-xl text-green-700 dark:text-green-400">Assets (+)</h3>
            <span className="font-bold font-mono">${totalAssets.toLocaleString()}</span>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Cash & Checking</Label>
              <Input type="number" className="text-right" value={assets.cash} onChange={e => handleAssetChange('cash', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Savings Accounts</Label>
              <Input type="number" className="text-right" value={assets.savings} onChange={e => handleAssetChange('savings', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Brokerage & Crypto</Label>
              <Input type="number" className="text-right" value={assets.investments} onChange={e => handleAssetChange('investments', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Retirement (401k/IRA)</Label>
              <Input type="number" className="text-right" value={assets.retirement} onChange={e => handleAssetChange('retirement', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Primary Home Value</Label>
              <Input type="number" className="text-right" value={assets.property} onChange={e => handleAssetChange('property', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Vehicles Value</Label>
              <Input type="number" className="text-right" value={assets.vehicles} onChange={e => handleAssetChange('vehicles', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Other Assets</Label>
              <Input type="number" className="text-right" value={assets.other} onChange={e => handleAssetChange('other', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Liabilities Form */}
        <div className="space-y-6 bg-muted/10 p-6 rounded-xl border border-red-200/50 dark:border-red-900/50">
          <div className="flex justify-between items-center border-b border-red-200/50 dark:border-red-900/50 pb-2">
            <h3 className="font-bold text-xl text-destructive">Liabilities (-)</h3>
            <span className="font-bold font-mono">${totalLiabilities.toLocaleString()}</span>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Mortgage Balance</Label>
              <Input type="number" className="text-right" value={liabilities.mortgage} onChange={e => handleLiabilityChange('mortgage', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Student Loans</Label>
              <Input type="number" className="text-right" value={liabilities.studentLoans} onChange={e => handleLiabilityChange('studentLoans', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Auto Loans</Label>
              <Input type="number" className="text-right" value={liabilities.autoLoans} onChange={e => handleLiabilityChange('autoLoans', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Credit Card Debt</Label>
              <Input type="number" className="text-right" value={liabilities.creditCards} onChange={e => handleLiabilityChange('creditCards', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Personal Loans</Label>
              <Input type="number" className="text-right" value={liabilities.personalLoans} onChange={e => handleLiabilityChange('personalLoans', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 items-center">
              <Label>Other Debts</Label>
              <Input type="number" className="text-right" value={liabilities.other} onChange={e => handleLiabilityChange('other', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {(totalAssets > 0 || totalLiabilities > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t no-print">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="text-center font-bold mb-4">Assets vs Liabilities</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="text-center font-bold mb-4">Major Categories</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={v => `$${v > 1000 ? v/1000+'k' : v}`} />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                  <RechartsTooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.type === 'asset' ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

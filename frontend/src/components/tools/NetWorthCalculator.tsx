"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { RotateCcw, Download } from "lucide-react";
import { ExportToCSVButton } from "@/components/export/ExportButtons";
import { useToast } from "@/hooks/use-toast";
import { saveToStorage, loadFromStorage } from "@/lib/career-tools/storage";

const STORAGE_KEY = "net_worth";

const ASSET_LABELS: Record<string, string> = {
  cash: "Cash & Checking",
  savings: "Savings Accounts",
  investments: "Brokerage & Crypto",
  retirement: "Retirement (401k/IRA)",
  property: "Primary Home Value",
  vehicles: "Vehicles Value",
  other: "Other Assets"
};

const LIABILITY_LABELS: Record<string, string> = {
  mortgage: "Mortgage Balance",
  studentLoans: "Student Loans",
  personalLoans: "Personal Loans",
  autoLoans: "Auto Loans",
  creditCards: "Credit Card Debt",
  other: "Other Debts"
};

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
    const saved = loadFromStorage<{ assets: typeof assets; liabilities: typeof liabilities }>(STORAGE_KEY, { assets, liabilities });
    if (saved.assets) setAssets(saved.assets);
    if (saved.liabilities) setLiabilities(saved.liabilities);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveToStorage(STORAGE_KEY, { assets, liabilities });
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

  const pieData = [
    { name: "Assets", value: totalAssets, fill: "#22c55e" },
    { name: "Liabilities", value: totalLiabilities, fill: "#ef4444" }
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
    ...Object.entries(assets).map(([k, v]) => ({ Type: 'Asset', Category: ASSET_LABELS[k] || k, Amount: v })),
    ...Object.entries(liabilities).map(([k, v]) => ({ Type: 'Liability', Category: LIABILITY_LABELS[k] || k, Amount: v }))
  ];

  const handleExportPDF = () => {
    try {
      const { jsPDF } = require("jspdf");
      const { drawHeader, drawFooter, drawSectionHeading, drawKVRow, drawBarChart, drawRule, drawStatCard, BRAND, LM, PW, PAGE_W } = require("@/lib/pdf-brand");
      const doc = new jsPDF();

      let y = drawHeader(doc, "Net Worth Report");

      // Stat cards row
      const cardW = (PW - 10) / 3;
      drawStatCard(doc, "Total Assets", `$${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 0 })}`, LM, y, cardW, 22, BRAND.green);
      drawStatCard(doc, "Total Liabilities", `$${totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 0 })}`, LM + cardW + 5, y, cardW, 22, BRAND.red);
      drawStatCard(doc, "Net Worth", `$${netWorth.toLocaleString(undefined, { minimumFractionDigits: 0 })}`, LM + (cardW + 5) * 2, y, cardW, 22, netWorth >= 0 ? BRAND.accent : BRAND.red);
      y += 30;

      // Assets section with bar chart
      y = drawSectionHeading(doc, "Assets", y);
      const assetItems = Object.entries(assets).filter(([, val]) => val > 0).map(([key, val]) => ({
        label: ASSET_LABELS[key] || key,
        value: val,
        color: BRAND.green as [number, number, number],
      }));
      if (assetItems.length > 0) {
        y = drawBarChart(doc, assetItems, y);
      } else {
        doc.setFontSize(9); doc.setTextColor(...BRAND.muted); doc.text("No assets entered", LM + 4, y); y += 8;
      }
      y += 4;

      // Liabilities section with bar chart
      y = drawSectionHeading(doc, "Liabilities", y);
      const liabItems = Object.entries(liabilities).filter(([, val]) => val > 0).map(([key, val]) => ({
        label: LIABILITY_LABELS[key] || key,
        value: val,
        color: BRAND.red as [number, number, number],
      }));
      if (liabItems.length > 0) {
        y = drawBarChart(doc, liabItems, y);
      } else {
        doc.setFontSize(9); doc.setTextColor(...BRAND.muted); doc.text("No liabilities entered", LM + 4, y); y += 8;
      }
      y += 4;

      // Summary section
      y = drawRule(doc, y);
      y = drawSectionHeading(doc, "Summary", y);
      y = drawKVRow(doc, "Total Assets", `$${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, y, { color: BRAND.green });
      y = drawKVRow(doc, "Total Liabilities", `$${totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, y, { color: BRAND.red });
      y = drawKVRow(doc, "Net Worth", `$${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, y, { bold: true, color: netWorth >= 0 ? BRAND.accent : BRAND.red, size: 12 });

      drawFooter(doc);
      doc.save("net-worth-report.pdf");
      toast({ title: "PDF Downloaded", description: "Your net worth report has been saved." });
    } catch {
      toast({ title: "Export Failed", description: "Could not generate PDF.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8" id="net-worth-report">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-serif font-bold">Net Worth Calculator</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2"/> Reset</Button>
          <ExportToCSVButton data={exportData} title="Net Worth Data" />
          <Button variant="outline" size="sm" onClick={handleExportPDF}><Download className="w-4 h-4 mr-2"/> PDF</Button>
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-8 shadow-sm text-center">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2 font-bold">Total Net Worth</p>
        <h3 className={`text-5xl md:text-6xl font-serif font-bold ${netWorth >= 0 ? 'text-green-600 dark:text-green-500' : 'text-destructive'}`}>
          ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6 bg-muted/10 p-6 rounded-xl border border-green-200/50 dark:border-green-900/50">
          <div className="flex justify-between items-center border-b border-green-200/50 dark:border-green-900/50 pb-2">
            <h3 className="font-bold text-xl text-green-700 dark:text-green-400">Assets (+)</h3>
            <span className="font-bold font-mono">${totalAssets.toLocaleString()}</span>
          </div>
          
          <div className="space-y-4">
            {(Object.keys(assets) as (keyof typeof assets)[]).map(key => (
              <div key={key} className="grid grid-cols-2 gap-4 items-center">
                <Label>{ASSET_LABELS[key]}</Label>
                <Input type="number" className="text-right" value={assets[key]} onChange={e => handleAssetChange(key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 bg-muted/10 p-6 rounded-xl border border-red-200/50 dark:border-red-900/50">
          <div className="flex justify-between items-center border-b border-red-200/50 dark:border-red-900/50 pb-2">
            <h3 className="font-bold text-xl text-destructive">Liabilities (-)</h3>
            <span className="font-bold font-mono">${totalLiabilities.toLocaleString()}</span>
          </div>
          
          <div className="space-y-4">
            {(Object.keys(liabilities) as (keyof typeof liabilities)[]).map(key => (
              <div key={key} className="grid grid-cols-2 gap-4 items-center">
                <Label>{LIABILITY_LABELS[key]}</Label>
                <Input type="number" className="text-right" value={liabilities[key]} onChange={e => handleLiabilityChange(key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {(totalAssets > 0 || totalLiabilities > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="text-center font-bold mb-4">Assets vs Liabilities</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22c55e" }}></div>
                <span>Assets (${totalAssets.toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }}></div>
                <span>Liabilities (${totalLiabilities.toLocaleString()})</span>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="text-center font-bold mb-4">Major Categories</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={v => `$${v > 1000 ? v/1000+'k' : v}`} />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                  <RechartsTooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.type === 'asset' ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22c55e" }}></div>
                <span>Assets</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }}></div>
                <span>Liabilities</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

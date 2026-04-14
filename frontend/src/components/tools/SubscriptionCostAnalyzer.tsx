"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Plus, Trash2, RotateCcw, Pencil, Check, X, Download } from "lucide-react";
import { ExportToCSVButton } from "@/components/export/ExportButtons";
import { useToast } from "@/hooks/use-toast";
import { saveToStorage, loadFromStorage } from "@/lib/career-tools/storage";
import { SubscriptionSummary } from "./subscription/SubscriptionSummary";

const STORAGE_KEY = "subscriptions";

const BAR_COLORS = [
  "#2563eb", "#dc2626", "#16a34a", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#84cc16"
];

const PIE_COLORS = ["#2563eb", "#dc2626", "#16a34a", "#f59e0b", "#8b5cf6", "#ec4899"];

type Sub = { id: string; name: string; cost: number; cycle: string; category: string };

export function SubscriptionCostAnalyzer() {
  const { toast } = useToast();

  const [subs, setSubs] = useState<Sub[]>([]);
  const [newSub, setNewSub] = useState({ name: "", cost: "", cycle: "monthly", category: "streaming" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", cost: "", cycle: "monthly", category: "streaming" });

  useEffect(() => {
    const saved = loadFromStorage<Sub[]>(STORAGE_KEY, []);
    if (saved.length > 0) setSubs(saved);
  }, []);

  useEffect(() => {
    saveToStorage(STORAGE_KEY, subs);
  }, [subs]);

  const isAddDisabled = !newSub.name.trim() || !newSub.cost || parseFloat(newSub.cost) <= 0;

  const addSub = () => {
    const trimmedName = newSub.name.trim();
    if (!trimmedName) {
      toast({ title: "Invalid Name", description: "Service name cannot be empty.", variant: "destructive" });
      return;
    }
    const costVal = parseFloat(newSub.cost);
    if (!costVal || costVal <= 0) {
      toast({ title: "Invalid Cost", description: "Cost must be greater than zero.", variant: "destructive" });
      return;
    }
    setSubs([...subs, {
      id: Date.now().toString(),
      name: trimmedName,
      cost: costVal,
      cycle: newSub.cycle,
      category: newSub.category
    }]);
    setNewSub({ name: "", cost: "", cycle: "monthly", category: "streaming" });
  };

  const removeSub = (id: string) => {
    setSubs(subs.filter(s => s.id !== id));
  };

  const startEdit = (s: Sub) => {
    setEditingId(s.id);
    setEditData({ name: s.name, cost: String(s.cost), cycle: s.cycle, category: s.category });
  };

  const saveEdit = () => {
    if (!editingId) return;
    const trimmedName = editData.name.trim();
    const costVal = parseFloat(editData.cost);
    if (!trimmedName || !costVal || costVal <= 0) {
      toast({ title: "Invalid", description: "Name and valid cost are required.", variant: "destructive" });
      return;
    }
    setSubs(subs.map(s => s.id === editingId ? { ...s, name: trimmedName, cost: costVal, cycle: editData.cycle, category: editData.category } : s));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleReset = () => {
    setSubs([]);
    toast({ title: "Reset", description: "All subscriptions cleared." });
  };

  const processedSubs = subs.map(s => ({
    ...s,
    monthlyEquivalent: s.cycle === "annual" ? s.cost / 12 : s.cost,
    annualEquivalent: s.cycle === "monthly" ? s.cost * 12 : s.cost
  }));

  const totalMonthly = processedSubs.reduce((sum, s) => sum + s.monthlyEquivalent, 0);
  const totalAnnual = processedSubs.reduce((sum, s) => sum + s.annualEquivalent, 0);
  const avgMonthly = subs.length ? totalMonthly / subs.length : 0;

  const mostExpensive = processedSubs.length ?
    processedSubs.reduce((prev, current) => (prev.monthlyEquivalent > current.monthlyEquivalent) ? prev : current) : null;

  const categoryData = processedSubs.reduce((acc, sub) => {
    const existing = acc.find(a => a.name === sub.category);
    if (existing) {
      existing.value += sub.monthlyEquivalent;
    } else {
      acc.push({ name: sub.category, value: sub.monthlyEquivalent });
    }
    return acc;
  }, [] as any[]);

  const barChartHeight = Math.max(200, processedSubs.length * 40 + 60);

  const handleExportPDF = () => {
    try {
      const { jsPDF } = require("jspdf");
      const { drawHeader, drawFooter, drawSectionHeading, drawKVRow, drawTable, drawBarChart, drawStatCard, BRAND, LM, PW, PAGE_W } = require("@/lib/pdf-brand");
      const doc = new jsPDF();

      let y = drawHeader(doc, "Subscription Cost Analysis");

      // Stat cards
      const cardW = (PW - 10) / 3;
      drawStatCard(doc, "Monthly Cost", `$${totalMonthly.toFixed(0)}`, LM, y, cardW, 22, BRAND.accent);
      drawStatCard(doc, "Annual Cost", `$${totalAnnual.toFixed(0)}`, LM + cardW + 5, y, cardW, 22, BRAND.blue);
      drawStatCard(doc, "Subscriptions", subs.length.toString(), LM + (cardW + 5) * 2, y, cardW, 22, BRAND.dark);
      y += 30;

      // Quick stats
      y = drawSectionHeading(doc, "Overview", y);
      y = drawKVRow(doc, "Average per subscription", `$${avgMonthly.toFixed(2)}/mo`, y);
      if (mostExpensive) {
        y = drawKVRow(doc, "Most expensive", `${mostExpensive.name} ($${mostExpensive.monthlyEquivalent.toFixed(2)}/mo)`, y, { color: BRAND.red });
      }
      y += 4;

      // Subscriptions table
      y = drawSectionHeading(doc, "Subscriptions", y);
      const headers = ["Service", "Category", "Cost", "Monthly Eq."];
      const rows = processedSubs.map(s => [
        s.name,
        s.category,
        `$${s.cost.toFixed(2)} /${s.cycle === "monthly" ? "mo" : "yr"}`,
        `$${s.monthlyEquivalent.toFixed(2)}`
      ]);
      y = drawTable(doc, headers, rows, [55, 45, 40, 40], y);
      y += 4;

      // Category breakdown with bar chart
      if (categoryData.length > 0) {
        y = drawSectionHeading(doc, "By Category (Monthly)", y);
        const catColors: [number, number, number][] = [BRAND.accent, BRAND.blue, BRAND.amber, BRAND.green, BRAND.red];
        const catItems = categoryData.map((cat, i) => ({
          label: cat.name,
          value: cat.value,
          color: catColors[i % catColors.length],
        }));
        y = drawBarChart(doc, catItems, y);
      }

      drawFooter(doc);
      doc.save("subscription-analysis.pdf");
      toast({ title: "PDF Downloaded", description: "Your subscription analysis has been saved." });
    } catch {
      toast({ title: "Export Failed", description: "Could not generate PDF.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-2xl font-serif font-bold">Subscription Analyzer</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2" /> Reset</Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={subs.length === 0}><Download className="w-4 h-4 mr-2" /> PDF</Button>
          <ExportToCSVButton data={processedSubs} title="Subscriptions" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-muted/20 p-4 rounded-lg border flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label>Service Name <span className="text-destructive">*</span></Label>
              <Input value={newSub.name} onChange={e => setNewSub({ ...newSub, name: e.target.value })} placeholder="e.g. Netflix" />
            </div>
            <div className="w-full md:w-24 space-y-2">
              <Label>Cost ($) <span className="text-destructive">*</span></Label>
              <Input type="number" min="0.01" step="0.01" value={newSub.cost} onChange={e => setNewSub({ ...newSub, cost: e.target.value })} placeholder="10.00" />
            </div>
            <div className="w-full md:w-32 space-y-2">
              <Label>Cycle</Label>
              <Select value={newSub.cycle} onValueChange={v => setNewSub({ ...newSub, cycle: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40 space-y-2">
              <Label>Category</Label>
              <Select value={newSub.category} onValueChange={v => setNewSub({ ...newSub, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="streaming">Video</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="fitness">Fitness</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addSub} className="w-full md:w-auto" disabled={isAddDisabled}><Plus className="w-4 h-4 mr-1" /> Add</Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left whitespace-nowrap">Service</th>
                    <th className="p-3 text-left whitespace-nowrap hidden sm:table-cell">Category</th>
                    <th className="p-3 text-right whitespace-nowrap">Cost</th>
                    <th className="p-3 text-right whitespace-nowrap">Monthly</th>
                    <th className="p-3 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {processedSubs.length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No subscriptions added. Add your first subscription above.</td></tr>
                  )}
                  {processedSubs.map((s, idx) => (
                    <tr key={s.id} className="border-t">
                      {editingId === s.id ? (
                        <>
                          <td className="p-2">
                            <Input className="h-8 text-sm" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                          </td>
                          <td className="p-2 hidden sm:table-cell">
                            <Select value={editData.category} onValueChange={v => setEditData({ ...editData, category: v })}>
                              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="streaming">Video</SelectItem>
                                <SelectItem value="music">Music</SelectItem>
                                <SelectItem value="software">Software</SelectItem>
                                <SelectItem value="fitness">Fitness</SelectItem>
                                <SelectItem value="news">News</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Input type="number" className="h-8 text-sm text-right w-20 ml-auto" value={editData.cost} onChange={e => setEditData({ ...editData, cost: e.target.value })} />
                          </td>
                          <td className="p-2 text-right whitespace-nowrap font-mono">${(editData.cycle === "annual" ? (parseFloat(editData.cost) || 0) / 12 : parseFloat(editData.cost) || 0).toFixed(2)}</td>
                          <td className="p-2">
                            <div className="flex gap-1 justify-center">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={saveEdit}><Check className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 font-medium">
                            {s.name}
                            <span className="block sm:hidden text-xs text-muted-foreground capitalize">{s.category}</span>
                          </td>
                          <td className="p-3 capitalize text-muted-foreground hidden sm:table-cell">{s.category}</td>
                          <td className="p-3 text-right whitespace-nowrap">${s.cost.toFixed(2)}<span className="text-muted-foreground text-xs">/{s.cycle === 'monthly' ? 'mo' : 'yr'}</span></td>
                          <td className="p-3 text-right font-mono whitespace-nowrap">${s.monthlyEquivalent.toFixed(2)}</td>
                          <td className="p-3">
                            <div className="flex gap-1 justify-center">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(s)}><Pencil className="w-3.5 h-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeSub(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {processedSubs.length > 0 && (
            <div className="border rounded-lg p-4 pt-2">
              <h4 className="font-bold text-sm text-center mb-2">By Cost (Monthly)</h4>
              <div style={{ height: barChartHeight }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={processedSubs} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={v => `$${v}`} label={{ value: "Monthly Cost ($)", position: "insideBottom", offset: -10, style: { fontSize: 12 } }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                    <RechartsTooltip formatter={(value: number) => [`$${value.toFixed(2)}/mo`, 'Cost']} />
                    <Bar dataKey="monthlyEquivalent" radius={[0, 4, 4, 0]}>
                      {processedSubs.map((_, index) => (
                        <Cell key={`bar-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <SubscriptionSummary
            totalMonthly={totalMonthly}
            totalAnnual={totalAnnual}
            avgMonthly={avgMonthly}
            subsCount={subs.length}
            mostExpensive={mostExpensive}
            categoryData={categoryData}
          />
      </div>
    </div>
  );
}

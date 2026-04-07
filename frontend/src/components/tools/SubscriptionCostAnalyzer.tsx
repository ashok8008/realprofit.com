"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Plus, Trash2, RotateCcw, Pencil, Check, X, Download } from "lucide-react";
import { ExportToCSVButton } from "@/components/export/ExportButtons";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "rp-tool-subscription-analyzer";

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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSubs(parsed);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
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
      const doc = new jsPDF();
      let y = 20;
      doc.setFontSize(20);
      doc.text("Subscription Cost Analysis", 20, y);
      y += 12;
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, y);
      y += 15;

      doc.setFontSize(14);
      doc.text("Summary", 20, y);
      y += 8;
      doc.setFontSize(12);
      doc.text(`Total Monthly Cost: $${totalMonthly.toFixed(2)}`, 25, y); y += 6;
      doc.text(`Total Annual Cost: $${totalAnnual.toFixed(2)}`, 25, y); y += 6;
      doc.text(`Average per Subscription: $${avgMonthly.toFixed(2)}/mo`, 25, y); y += 6;
      doc.text(`Total Subscriptions: ${subs.length}`, 25, y); y += 6;
      if (mostExpensive) {
        doc.text(`Most Expensive: ${mostExpensive.name} ($${mostExpensive.monthlyEquivalent.toFixed(2)}/mo)`, 25, y);
      }
      y += 12;

      doc.setFontSize(14);
      doc.text("Subscriptions", 20, y);
      y += 8;

      doc.setFillColor(240, 240, 240);
      doc.rect(20, y - 1, 170, 8, "F");
      doc.setFontSize(10);
      doc.setFont(undefined as any, "bold");
      doc.text("Service", 22, y + 5);
      doc.text("Category", 75, y + 5);
      doc.text("Cost", 115, y + 5);
      doc.text("Monthly Eq.", 150, y + 5);
      doc.setFont(undefined as any, "normal");
      y += 12;

      processedSubs.forEach(s => {
        doc.text(s.name, 22, y);
        doc.text(s.category, 75, y);
        doc.text(`$${s.cost.toFixed(2)} /${s.cycle === 'monthly' ? 'mo' : 'yr'}`, 115, y);
        doc.text(`$${s.monthlyEquivalent.toFixed(2)}`, 150, y);
        y += 7;
        if (y > 270) { doc.addPage(); y = 20; }
      });

      y += 8;
      if (categoryData.length > 0) {
        doc.setFontSize(14);
        doc.text("By Category (Monthly)", 20, y);
        y += 8;
        doc.setFontSize(12);
        categoryData.forEach(cat => {
          doc.text(`${cat.name}: $${cat.value.toFixed(2)}/mo`, 25, y);
          y += 6;
        });
      }

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

        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
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
                <p className="font-medium">{subs.length}</p>
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
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-4">By Category (Monthly)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                      {categoryData.map((entry, index) => (
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
      </div>
    </div>
  );
}

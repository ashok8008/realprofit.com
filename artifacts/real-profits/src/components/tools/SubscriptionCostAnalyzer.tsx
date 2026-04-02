import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { ExportToCSVButton } from "@/components/export/ExportButtons";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "rp-tool-subscription-analyzer";

export function SubscriptionCostAnalyzer() {
  const { toast } = useToast();
  
  const [subs, setSubs] = useState([
    { id: "1", name: "Netflix", cost: 15.49, cycle: "monthly", category: "streaming" },
    { id: "2", name: "Spotify", cost: 10.99, cycle: "monthly", category: "music" },
    { id: "3", name: "Amazon Prime", cost: 139.00, cycle: "annual", category: "other" }
  ]);
  const [newSub, setNewSub] = useState({ name: "", cost: "", cycle: "monthly", category: "streaming" });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setSubs(JSON.parse(saved)); } catch {}
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

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const barChartHeight = Math.max(200, processedSubs.length * 40 + 60);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold">Subscription Analyzer</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2"/> Reset</Button>
          <ExportToCSVButton data={processedSubs} title="Subscriptions" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-muted/20 p-4 rounded-lg border flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label>Service Name <span className="text-destructive">*</span></Label>
              <Input value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} placeholder="e.g. Netflix" />
            </div>
            <div className="w-full md:w-24 space-y-2">
              <Label>Cost ($) <span className="text-destructive">*</span></Label>
              <Input type="number" min="0.01" step="0.01" value={newSub.cost} onChange={e => setNewSub({...newSub, cost: e.target.value})} placeholder="10.00" />
            </div>
            <div className="w-full md:w-32 space-y-2">
              <Label>Cycle</Label>
              <Select value={newSub.cycle} onValueChange={v => setNewSub({...newSub, cycle: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-40 space-y-2">
              <Label>Category</Label>
              <Select value={newSub.category} onValueChange={v => setNewSub({...newSub, category: v})}>
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
            <Button onClick={addSub} className="w-full md:w-auto" disabled={isAddDisabled}><Plus className="w-4 h-4 mr-1"/> Add</Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">Service</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-right">Cost</th>
                  <th className="p-3 text-right">Monthly Eq.</th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {processedSubs.length === 0 && (
                  <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No subscriptions added.</td></tr>
                )}
                {processedSubs.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3 capitalize text-muted-foreground">{s.category}</td>
                    <td className="p-3 text-right">${s.cost.toFixed(2)} /{s.cycle === 'monthly' ? 'mo' : 'yr'}</td>
                    <td className="p-3 text-right font-mono">${s.monthlyEquivalent.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeSub(s.id)}>
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {processedSubs.length > 0 && (
            <div className="border rounded-lg p-4 pt-6" style={{ height: barChartHeight }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={processedSubs} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={v => `$${v}`} label={{ value: "Monthly Cost ($)", position: "insideBottom", offset: -10, style: { fontSize: 12 } }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(value: number) => [`$${value.toFixed(2)}/mo`, 'Cost']} />
                  <Bar dataKey="monthlyEquivalent" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
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

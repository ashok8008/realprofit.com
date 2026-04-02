import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { ExportToCSVButton } from "@/components/export/ExportButtons";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "rp-tool-expense-tracker";

export function ExpenseTracker() {
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split("T")[0],
    merchant: "",
    category: "food",
    amount: "",
    notes: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setEntries(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    const trimmedMerchant = newEntry.merchant.trim();
    if (!trimmedMerchant) {
      toast({ title: "Invalid Merchant", description: "Merchant name cannot be empty.", variant: "destructive" });
      return;
    }
    const amountVal = parseFloat(newEntry.amount);
    if (!amountVal || amountVal <= 0) {
      toast({ title: "Invalid Amount", description: "Amount must be greater than zero.", variant: "destructive" });
      return;
    }
    setEntries([
      ...entries,
      {
        id: Date.now().toString(),
        date: newEntry.date,
        merchant: trimmedMerchant,
        category: newEntry.category,
        amount: amountVal,
        notes: newEntry.notes
      }
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    setNewEntry(prev => ({ ...prev, merchant: "", amount: "", notes: "" }));
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const handleReset = () => {
    setEntries([]);
    toast({ title: "Reset", description: "All expense entries cleared." });
  };

  const totalExpense = entries.reduce((sum, e) => sum + e.amount, 0);
  
  const categoryData = entries.reduce((acc, entry) => {
    const existing = acc.find((a: any) => a.name === entry.category);
    if (existing) {
      existing.value += entry.amount;
    } else {
      acc.push({ name: entry.category, value: entry.amount });
    }
    return acc;
  }, []).sort((a: any, b: any) => b.value - a.value);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--destructive))', 'hsl(var(--primary))'];

  const isLogDisabled = !newEntry.merchant.trim() || !newEntry.amount || parseFloat(newEntry.amount) <= 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold">Expense Tracker</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2"/> Reset</Button>
          <ExportToCSVButton data={entries} title="Expense Log" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-card border rounded-xl p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Total Tracked Expenses</p>
          <p className="text-3xl font-bold text-destructive">${totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
        <div className="bg-card border rounded-xl p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Entries</p>
          <p className="text-3xl font-bold">{entries.length}</p>
        </div>
        <div className="bg-card border rounded-xl p-6 text-center shadow-sm col-span-1 lg:col-span-2 flex flex-col justify-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Top Category</p>
          <div className="flex items-baseline justify-center gap-2 mt-2">
            <span className="text-2xl font-bold capitalize">{categoryData[0]?.name || "N/A"}</span>
            <span className="text-muted-foreground">({categoryData.length > 0 ? ((categoryData[0].value / totalExpense) * 100).toFixed(0) : 0}%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-muted/20 p-5 rounded-xl border space-y-4">
            <h3 className="font-bold">Log New Expense</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={newEntry.date} onChange={e => setNewEntry({...newEntry, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Amount ($) <span className="text-destructive">*</span></Label>
                <Input type="number" min="0.01" step="0.01" value={newEntry.amount} onChange={e => setNewEntry({...newEntry, amount: e.target.value})} placeholder="0.00" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Merchant / Description <span className="text-destructive">*</span></Label>
                <Input value={newEntry.merchant} onChange={e => setNewEntry({...newEntry, merchant: e.target.value})} placeholder="Store Name" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2 md:col-span-1">
                <Label>Category</Label>
                <Select value={newEntry.category} onValueChange={v => setNewEntry({...newEntry, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="housing">Housing</SelectItem>
                    <SelectItem value="food">Food & Dining</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Notes (Optional)</Label>
                <Input value={newEntry.notes} onChange={e => setNewEntry({...newEntry, notes: e.target.value})} placeholder="..." />
              </div>
              <Button onClick={addEntry} className="w-full md:col-span-1" variant="destructive" disabled={isLogDisabled}><Plus className="w-4 h-4 mr-2"/> Log</Button>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="max-h-[400px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Merchant</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No expenses logged yet.</td></tr>
                  ) : (
                    entries.map(e => (
                      <tr key={e.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 whitespace-nowrap">{e.date}</td>
                        <td className="p-3 font-medium">
                          {e.merchant}
                          {e.notes && <span className="block text-xs text-muted-foreground font-normal">{e.notes}</span>}
                        </td>
                        <td className="p-3 capitalize text-muted-foreground">{e.category}</td>
                        <td className="p-3 text-right font-bold">${e.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="p-3 text-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeEntry(e.id)}>
                            <Trash2 className="w-4 h-4"/>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {categoryData.length > 0 && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-4 text-center">Spending by Category</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spent']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4 max-h-48 overflow-auto pr-2">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex justify-between items-center text-sm border-b pb-1 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="capitalize">{entry.name}</span>
                    </div>
                    <span className="font-medium">${entry.value.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
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

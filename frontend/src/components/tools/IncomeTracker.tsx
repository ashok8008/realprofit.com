"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Plus, Trash2, RotateCcw, Pencil, Check, X } from "lucide-react";
import { ExportToCSVButton } from "@/components/export/ExportButtons";
import { useToast } from "@/hooks/use-toast";
import { saveToStorage, loadFromStorage } from "@/lib/career-tools/storage";

const STORAGE_KEY = "income_tracker";

export function IncomeTracker() {
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split("T")[0],
    source: "",
    category: "salary",
    amount: "",
    notes: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ date: "", source: "", category: "", amount: "", notes: "" });

  useEffect(() => {
    setEntries(loadFromStorage<any[]>(STORAGE_KEY, []));
  }, []);

  useEffect(() => {
    saveToStorage(STORAGE_KEY, entries);
  }, [entries]);

  const addEntry = () => {
    if (!newEntry.source.trim() || !newEntry.amount) return;
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
        source: newEntry.source.trim(),
        category: newEntry.category,
        amount: amountVal,
        notes: newEntry.notes
      }
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    setNewEntry(prev => ({ ...prev, source: "", amount: "", notes: "" }));
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const startEdit = (entry: any) => {
    setEditingId(entry.id);
    setEditData({
      date: entry.date,
      source: entry.source,
      category: entry.category,
      amount: String(entry.amount),
      notes: entry.notes || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const amountVal = parseFloat(editData.amount);
    if (!editData.source.trim() || !amountVal || amountVal <= 0) {
      toast({ title: "Invalid Entry", description: "Source and a positive amount are required.", variant: "destructive" });
      return;
    }
    setEntries(prev =>
      prev.map(e => e.id === editingId ? {
        ...e,
        date: editData.date,
        source: editData.source.trim(),
        category: editData.category,
        amount: amountVal,
        notes: editData.notes
      } : e).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    setEditingId(null);
    toast({ title: "Updated", description: "Income entry has been updated." });
  };

  const handleReset = () => {
    setEntries([]);
    setEditingId(null);
    toast({ title: "Reset", description: "All income entries cleared." });
  };

  const totalIncome = entries.reduce((sum, e) => sum + e.amount, 0);
  
  const monthlyData = entries.reduce((acc, entry) => {
    const month = entry.date.substring(0, 7);
    const existing = acc.find((a: any) => a.month === month);
    if (existing) {
      existing.amount += entry.amount;
    } else {
      acc.push({ month, amount: entry.amount });
    }
    return acc;
  }, []).sort((a: any, b: any) => a.month.localeCompare(b.month));

  const averageMonthly = monthlyData.length ? totalIncome / monthlyData.length : 0;
  
  const categoryData = entries.reduce((acc, entry) => {
    const existing = acc.find((a: any) => a.name === entry.category);
    if (existing) {
      existing.amount += entry.amount;
    } else {
      acc.push({ name: entry.category, amount: entry.amount });
    }
    return acc;
  }, []).sort((a: any, b: any) => b.amount - a.amount);

  const isAddDisabled = !newEntry.source.trim() || !newEntry.amount || parseFloat(newEntry.amount) <= 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold">Income Tracker</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2"/> Reset</Button>
          <ExportToCSVButton data={entries} title="Income Log" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-card border rounded-xl p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Total Tracked Income</p>
          <p className="text-3xl font-bold text-primary">${totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
        <div className="bg-card border rounded-xl p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Entries</p>
          <p className="text-3xl font-bold">{entries.length}</p>
        </div>
        <div className="bg-card border rounded-xl p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Avg Monthly</p>
          <p className="text-3xl font-bold">${averageMonthly.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
        <div className="bg-card border rounded-xl p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Top Category</p>
          <p className="text-xl font-bold capitalize mt-2">{categoryData[0]?.name || "N/A"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-muted/20 p-5 rounded-xl border space-y-4">
            <h3 className="font-bold">Log New Income</h3>
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
                <Label>Source / Client <span className="text-destructive">*</span></Label>
                <Input value={newEntry.source} onChange={e => setNewEntry({...newEntry, source: e.target.value})} placeholder="Company Name" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2 md:col-span-1">
                <Label>Category</Label>
                <Select value={newEntry.category} onValueChange={v => setNewEntry({...newEntry, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="side hustle">Side Hustle</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="gift">Gift</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Notes (Optional)</Label>
                <Input value={newEntry.notes} onChange={e => setNewEntry({...newEntry, notes: e.target.value})} placeholder="..." />
              </div>
              <Button onClick={addEntry} className="w-full md:col-span-1" disabled={isAddDisabled}><Plus className="w-4 h-4 mr-2"/> Add</Button>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="max-h-[400px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Source</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No income logged yet.</td></tr>
                  ) : (
                    entries.map(e => (
                      <tr key={e.id} className="border-t hover:bg-muted/30">
                        {editingId === e.id ? (
                          <>
                            <td className="p-2">
                              <Input type="date" value={editData.date} onChange={ev => setEditData({...editData, date: ev.target.value})} className="h-8 text-xs" />
                            </td>
                            <td className="p-2">
                              <Input value={editData.source} onChange={ev => setEditData({...editData, source: ev.target.value})} className="h-8 text-xs" />
                            </td>
                            <td className="p-2">
                              <Select value={editData.category} onValueChange={v => setEditData({...editData, category: v})}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="salary">Salary</SelectItem>
                                  <SelectItem value="freelance">Freelance</SelectItem>
                                  <SelectItem value="side hustle">Side Hustle</SelectItem>
                                  <SelectItem value="investment">Investment</SelectItem>
                                  <SelectItem value="gift">Gift</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-2">
                              <Input type="number" min="0.01" step="0.01" value={editData.amount} onChange={ev => setEditData({...editData, amount: ev.target.value})} className="h-8 text-xs text-right" />
                            </td>
                            <td className="p-2 text-center">
                              <div className="flex gap-1 justify-center">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={saveEdit} title="Save">
                                  <Check className="w-4 h-4"/>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={cancelEdit} title="Cancel">
                                  <X className="w-4 h-4"/>
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 whitespace-nowrap">{e.date}</td>
                            <td className="p-3 font-medium">
                              {e.source}
                              {e.notes && <span className="block text-xs text-muted-foreground font-normal">{e.notes}</span>}
                            </td>
                            <td className="p-3 capitalize">{e.category}</td>
                            <td className="p-3 text-right font-bold text-primary">${e.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            <td className="p-3 text-center">
                              <div className="flex gap-1 justify-center">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => startEdit(e)} title="Edit">
                                  <Pencil className="w-4 h-4"/>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeEntry(e.id)}>
                                  <Trash2 className="w-4 h-4"/>
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {monthlyData.length > 0 && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-4">Income Trend</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickFormatter={v => v.substring(5, 7) + '/' + v.substring(2, 4)} tick={{fontSize: 12}} />
                    <YAxis tickFormatter={v => `$${v > 1000 ? v/1000+'k' : v}`} width={50} tick={{fontSize: 12}} />
                    <RechartsTooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Income']} />
                    <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {categoryData.length > 0 && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-4">By Category</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={v => `$${v > 1000 ? v/1000+'k' : v}`} tick={{fontSize: 12}} />
                    <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                    <RechartsTooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Income']} />
                    <Bar dataKey="amount" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

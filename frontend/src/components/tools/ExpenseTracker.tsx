"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Plus, Trash2, RotateCcw, Pencil, Check, X } from "lucide-react";
import { ExportToCSVButton } from "@/components/export/ExportButtons";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "rp-tool-expense-tracker";

const COLORS = ["#2563eb", "#dc2626", "#16a34a", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

type Entry = { id: string; date: string; merchant: string; category: string; amount: number; notes: string };

export function ExpenseTracker() {
  const { toast } = useToast();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split("T")[0],
    merchant: "",
    category: "food",
    amount: "",
    notes: ""
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ date: "", merchant: "", category: "food", amount: "", notes: "" });

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
    if (!newEntry.date) {
      toast({ title: "Invalid Date", description: "Please select a date.", variant: "destructive" });
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

  const startEdit = (e: Entry) => {
    setEditingId(e.id);
    setEditData({ date: e.date, merchant: e.merchant, category: e.category, amount: String(e.amount), notes: e.notes || "" });
  };

  const saveEdit = () => {
    if (!editingId) return;
    const trimmedMerchant = editData.merchant.trim();
    const amountVal = parseFloat(editData.amount);
    if (!trimmedMerchant || !amountVal || amountVal <= 0) {
      toast({ title: "Invalid", description: "Merchant and valid amount are required.", variant: "destructive" });
      return;
    }
    setEntries(entries.map(e => e.id === editingId ? {
      ...e,
      date: editData.date || e.date,
      merchant: trimmedMerchant,
      category: editData.category,
      amount: amountVal,
      notes: editData.notes
    } : e).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setEditingId(null);
  };

  const cancelEdit = () => { setEditingId(null); };

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
  }, [] as { name: string; value: number }[]).sort((a, b) => b.value - a.value);

  const isLogDisabled = !newEntry.merchant.trim() || !newEntry.amount || parseFloat(newEntry.amount) <= 0 || !newEntry.date;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold">Expense Tracker</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2" /> Reset</Button>
          <ExportToCSVButton data={entries} title="Expense Log" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-card border rounded-xl p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-destructive">${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
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
                <Input type="date" value={newEntry.date} onChange={e => setNewEntry({ ...newEntry, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Amount ($) <span className="text-destructive">*</span></Label>
                <Input type="number" min="0.01" step="0.01" value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} placeholder="0.00" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Merchant <span className="text-destructive">*</span></Label>
                <Input value={newEntry.merchant} onChange={e => setNewEntry({ ...newEntry, merchant: e.target.value })} placeholder="Store name or description" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2 md:col-span-1">
                <Label>Category</Label>
                <Select value={newEntry.category} onValueChange={v => setNewEntry({ ...newEntry, category: v })}>
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
                <Input value={newEntry.notes} onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })} placeholder="..." />
              </div>
              <Button onClick={addEntry} className="w-full md:col-span-1" variant="destructive" disabled={isLogDisabled}><Plus className="w-4 h-4 mr-2" /> Log</Button>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="max-h-[400px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left whitespace-nowrap">Date</th>
                    <th className="p-3 text-left whitespace-nowrap">Merchant</th>
                    <th className="p-3 text-left whitespace-nowrap hidden sm:table-cell">Category</th>
                    <th className="p-3 text-right whitespace-nowrap">Amount</th>
                    <th className="p-3 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No expenses logged yet.</td></tr>
                  ) : (
                    entries.map(e => (
                      <tr key={e.id} className="border-t hover:bg-muted/30">
                        {editingId === e.id ? (
                          <>
                            <td className="p-2">
                              <Input type="date" className="h-8 text-sm" value={editData.date} onChange={ev => setEditData({ ...editData, date: ev.target.value })} />
                            </td>
                            <td className="p-2">
                              <Input className="h-8 text-sm" value={editData.merchant} onChange={ev => setEditData({ ...editData, merchant: ev.target.value })} />
                            </td>
                            <td className="p-2 hidden sm:table-cell">
                              <Select value={editData.category} onValueChange={v => setEditData({ ...editData, category: v })}>
                                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
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
                            </td>
                            <td className="p-2">
                              <Input type="number" className="h-8 text-sm text-right w-20 ml-auto" value={editData.amount} onChange={ev => setEditData({ ...editData, amount: ev.target.value })} />
                            </td>
                            <td className="p-2">
                              <div className="flex gap-1 justify-center">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={saveEdit}><Check className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 whitespace-nowrap">{e.date}</td>
                            <td className="p-3 font-medium">
                              {e.merchant}
                              {e.notes && <span className="block text-xs text-muted-foreground font-normal">{e.notes}</span>}
                              <span className="block sm:hidden text-xs text-muted-foreground capitalize">{e.category}</span>
                            </td>
                            <td className="p-3 capitalize text-muted-foreground hidden sm:table-cell">{e.category}</td>
                            <td className="p-3 text-right font-bold whitespace-nowrap">${e.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-3">
                              <div className="flex gap-1 justify-center">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(e)}><Pencil className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeEntry(e.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
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
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="capitalize">{entry.name}</span>
                    </div>
                    <span className="font-medium" style={{ color: COLORS[index % COLORS.length] }}>${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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

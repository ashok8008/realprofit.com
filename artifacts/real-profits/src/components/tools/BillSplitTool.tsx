import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "rp-tool-bill-split";

export function BillSplitTool() {
  const { toast } = useToast();
  
  const [data, setData] = useState({
    subtotal: 100,
    taxAmount: 8,
    tipPercent: 20,
    isEqualSplit: true,
    peopleCount: 4,
    payerIndex: 0,
    customPeople: [
      { id: "1", name: "Alice", amount: 25 },
      { id: "2", name: "Bob", amount: 25 },
      { id: "3", name: "Charlie", amount: 25 },
      { id: "4", name: "Diana", amount: 25 }
    ]
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

  const tipAmount = data.subtotal * (data.taxAmount > 0 ? (data.tipPercent / 100) : 0); // basic logic for tip, simplified
  const actualTipAmount = data.subtotal * (data.tipPercent / 100);
  const grandTotal = data.subtotal + data.taxAmount + actualTipAmount;
  
  // Calculate ratio to scale subtotal inputs to final bill with tax and tip
  const multiplier = data.subtotal > 0 ? grandTotal / data.subtotal : 1;

  const handleReset = () => {
    setData({
      subtotal: 100, taxAmount: 8, tipPercent: 20, isEqualSplit: true, peopleCount: 4, payerIndex: 0,
      customPeople: [
        { id: "1", name: "Alice", amount: 25 }, { id: "2", name: "Bob", amount: 25 },
        { id: "3", name: "Charlie", amount: 25 }, { id: "4", name: "Diana", amount: 25 }
      ]
    });
    toast({ title: "Reset", description: "Bill split cleared." });
  };

  const updatePersonCount = (count: number) => {
    if (count < 1) return;
    let newPeople = [...data.customPeople];
    if (count > newPeople.length) {
      for (let i = newPeople.length; i < count; i++) {
        newPeople.push({ id: Date.now().toString() + i, name: `Person ${i+1}`, amount: 0 });
      }
    } else {
      newPeople = newPeople.slice(0, count);
    }
    
    // Reset amounts to equal distribution of subtotal
    const equalShare = data.subtotal / count;
    newPeople = newPeople.map(p => ({ ...p, amount: equalShare }));
    
    setData({ ...data, peopleCount: count, customPeople: newPeople, payerIndex: Math.min(data.payerIndex, count - 1) });
  };

  const handleCustomChange = (id: string, field: string, value: string | number) => {
    setData(prev => ({
      ...prev,
      customPeople: prev.customPeople.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const customTotal = data.customPeople.reduce((sum, p) => sum + p.amount, 0);
  const diffFromSubtotal = Math.abs(data.subtotal - customTotal);
  const isCustomValid = diffFromSubtotal < 0.05; // allow small rounding diff

  return (
    <div className="space-y-8 print-container">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-serif font-bold">Bill Split Tool</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2"/> Print</Button>
          <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2"/> Reset</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6 no-print">
          <div className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold border-b pb-2">The Bill</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subtotal ($)</Label>
                <Input type="number" min="0" step="0.01" value={data.subtotal} onChange={e => setData({...data, subtotal: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label>Tax Amount ($)</Label>
                <Input type="number" min="0" step="0.01" value={data.taxAmount} onChange={e => setData({...data, taxAmount: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label>Tip (%)</Label>
                <Input type="number" min="0" step="1" value={data.tipPercent} onChange={e => setData({...data, tipPercent: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label>Who Paid?</Label>
                <Select value={data.payerIndex.toString()} onValueChange={v => setData({...data, payerIndex: parseInt(v)})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({length: data.peopleCount}).map((_, i) => (
                      <SelectItem key={i} value={i.toString()}>{data.isEqualSplit ? `Person ${i+1}` : data.customPeople[i].name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg flex justify-between items-center text-lg mt-4">
              <span className="font-bold">Grand Total:</span>
              <span className="font-bold text-primary">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold">Split Method</h3>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Custom Items</Label>
                <Switch checked={!data.isEqualSplit} onCheckedChange={c => setData({...data, isEqualSplit: !c})} />
              </div>
            </div>

            {data.isEqualSplit ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Number of People</Label>
                  <Input type="number" min="2" max="20" value={data.peopleCount} onChange={e => updatePersonCount(parseInt(e.target.value) || 2)} />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Enter item costs per person (before tax/tip)</span>
                  <span className={isCustomValid ? "text-green-600" : "text-destructive font-bold"}>
                    Sum: ${customTotal.toFixed(2)} / ${data.subtotal.toFixed(2)}
                  </span>
                </div>
                
                {data.customPeople.map((person, i) => (
                  <div key={person.id} className="flex gap-2">
                    <Input className="flex-1" value={person.name} onChange={e => handleCustomChange(person.id, "name", e.target.value)} placeholder={`Person ${i+1}`} />
                    <Input type="number" min="0" step="0.01" className="w-24 text-right" value={person.amount} onChange={e => handleCustomChange(person.id, "amount", parseFloat(e.target.value) || 0)} />
                  </div>
                ))}
                
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => updatePersonCount(data.peopleCount + 1)}>Add Person</Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => updatePersonCount(Math.max(2, data.peopleCount - 1))} disabled={data.peopleCount <= 2}>Remove</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-8 shadow-sm h-full">
            <h3 className="text-2xl font-serif font-bold text-center mb-6">Settlement Summary</h3>
            
            <div className="text-center mb-8 border-b pb-6">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Total Paid</p>
              <p className="text-4xl font-bold">${grandTotal.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Includes ${data.taxAmount.toFixed(2)} tax and ${actualTipAmount.toFixed(2)} tip
              </p>
            </div>

            {!data.isEqualSplit && !isCustomValid && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 text-center text-sm font-bold">
                ⚠️ Custom amounts (${customTotal.toFixed(2)}) must equal subtotal (${data.subtotal.toFixed(2)}).
              </div>
            )}

            <div className="space-y-4">
              {data.isEqualSplit ? (
                // EQUAL SPLIT DISPLAY
                Array.from({length: data.peopleCount}).map((_, i) => {
                  const owes = grandTotal / data.peopleCount;
                  const isPayer = i === data.payerIndex;
                  return (
                    <div key={i} className={`p-4 rounded-lg flex justify-between items-center ${isPayer ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}>
                      <div>
                        <span className="font-bold">Person {i+1}</span>
                        {isPayer && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Paid Bill</span>}
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-lg">${owes.toFixed(2)}</span>
                        {!isPayer && (
                          <div className="text-xs text-muted-foreground mt-1">Owes Person {data.payerIndex + 1}</div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                // CUSTOM SPLIT DISPLAY
                data.customPeople.map((person, i) => {
                  const finalAmount = person.amount * multiplier;
                  const isPayer = i === data.payerIndex;
                  const payerName = data.customPeople[data.payerIndex].name;
                  
                  return (
                    <div key={person.id} className={`p-4 rounded-lg flex justify-between items-center ${isPayer ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}>
                      <div>
                        <span className="font-bold">{person.name || `Person ${i+1}`}</span>
                        {isPayer && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Paid Bill</span>}
                        <div className="text-xs text-muted-foreground mt-1">Item subtotal: ${person.amount.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-lg font-bold">${finalAmount.toFixed(2)}</span>
                        {!isPayer && finalAmount > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">Owes {payerName}</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="mt-8 text-center text-xs text-muted-foreground no-print">
              Tax and tip are distributed proportionally based on each person's share of the subtotal.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

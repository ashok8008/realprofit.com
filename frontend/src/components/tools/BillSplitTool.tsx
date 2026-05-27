"use client";
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveToStorage, loadFromStorage } from "@/lib/career-tools/storage";

const STORAGE_KEY = "bill_split";

const DEFAULT_STATE = {
  subtotal: "",
  taxAmount: "",
  tipPercent: "15",
  isEqualSplit: true,
  peopleCount: "2",
  payerIndex: 0,
  customPeople: [
    { id: "1", name: "Person 1", amount: "" },
    { id: "2", name: "Person 2", amount: "" }
  ]
};

export function BillSplitTool() {
  const { toast } = useToast();

  const [data, setData] = useState(DEFAULT_STATE);

  useEffect(() => {
    const parsed = loadFromStorage(STORAGE_KEY, DEFAULT_STATE);
    setData({
      subtotal: String(parsed.subtotal ?? ""),
      taxAmount: String(parsed.taxAmount ?? ""),
      tipPercent: String(parsed.tipPercent ?? "15"),
      isEqualSplit: parsed.isEqualSplit ?? true,
      peopleCount: String(parsed.peopleCount ?? "2"),
      payerIndex: parsed.payerIndex ?? 0,
      customPeople: (parsed.customPeople || DEFAULT_STATE.customPeople).map((p: any) => ({
        ...p,
        amount: String(p.amount ?? "")
      }))
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveToStorage(STORAGE_KEY, data);
  }, [data]);

  const subtotalVal = parseFloat(data.subtotal) || 0;
  const taxAmountVal = parseFloat(data.taxAmount) || 0;
  const tipPercentVal = parseFloat(data.tipPercent) || 0;
  const peopleCountVal = Math.max(2, parseInt(data.peopleCount) || 2);

  const actualTipAmount = subtotalVal * (tipPercentVal / 100);
  const grandTotal = subtotalVal + taxAmountVal + actualTipAmount;

  const multiplier = subtotalVal > 0 ? grandTotal / subtotalVal : 0;

  const handleReset = () => {
    setData({ ...DEFAULT_STATE, customPeople: DEFAULT_STATE.customPeople.map(p => ({ ...p })) });
    toast({ title: "Reset", description: "Bill split cleared." });
  };

  const handleNumericInput = (value: string): string => {
    if (value === "" || value === ".") return value;
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    if (num < 0) return "0";
    return value;
  };

  const updatePersonCount = (countStr: string) => {
    const count = parseInt(countStr) || 2;
    if (count < 2 || count > 20) return;
    let newPeople = [...data.customPeople];
    if (count > newPeople.length) {
      for (let i = newPeople.length; i < count; i++) {
        newPeople.push({ id: Date.now().toString() + i, name: `Person ${i + 1}`, amount: "" });
      }
    } else {
      newPeople = newPeople.slice(0, count);
    }
    setData({ ...data, peopleCount: countStr, customPeople: newPeople, payerIndex: Math.min(data.payerIndex, count - 1) });
  };

  const addPerson = () => {
    const count = data.customPeople.length + 1;
    const newPeople = [...data.customPeople, { id: Date.now().toString(), name: `Person ${count}`, amount: "" }];
    setData({ ...data, peopleCount: String(count), customPeople: newPeople });
  };

  const removePerson = () => {
    if (data.customPeople.length <= 2) return;
    const newPeople = data.customPeople.slice(0, -1);
    setData({ ...data, peopleCount: String(newPeople.length), customPeople: newPeople, payerIndex: Math.min(data.payerIndex, newPeople.length - 1) });
  };

  const handleCustomChange = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      customPeople: prev.customPeople.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const customTotal = data.customPeople.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const diffFromSubtotal = Math.abs(subtotalVal - customTotal);
  const isCustomValid = subtotalVal === 0 || diffFromSubtotal < 0.05;

  const handleSwitchToCustom = (isCustom: boolean) => {
    if (isCustom && subtotalVal > 0) {
      const share = subtotalVal / data.customPeople.length;
      const newPeople = data.customPeople.map(p => ({ ...p, amount: share.toFixed(2) }));
      setData({ ...data, isEqualSplit: false, customPeople: newPeople });
    } else {
      setData({ ...data, isEqualSplit: !isCustom });
    }
  };

  return (
    <div className="space-y-8 print-container">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-serif font-bold">Bill Split Tool</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" /> Print</Button>
          <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw className="w-4 h-4 mr-2" /> Reset</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6 no-print">
          <div className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold border-b pb-2">The Bill</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subtotal ($)</Label>
                <Input type="number" min="0" step="0.01" value={data.subtotal} onChange={e => setData({ ...data, subtotal: handleNumericInput(e.target.value) })} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Tax Amount ($)</Label>
                <Input type="number" min="0" step="0.01" value={data.taxAmount} onChange={e => setData({ ...data, taxAmount: handleNumericInput(e.target.value) })} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Tip (%)</Label>
                <Input type="number" min="0" step="1" value={data.tipPercent} onChange={e => setData({ ...data, tipPercent: handleNumericInput(e.target.value) })} placeholder="15" />
              </div>
              <div className="space-y-2">
                <Label>Who Paid?</Label>
                <Select value={data.payerIndex.toString()} onValueChange={v => setData({ ...data, payerIndex: parseInt(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {data.customPeople.map((p, i) => (
                      <SelectItem key={i} value={i.toString()}>{data.isEqualSplit ? `Person ${i + 1}` : p.name}</SelectItem>
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
                <Switch checked={!data.isEqualSplit} onCheckedChange={handleSwitchToCustom} />
              </div>
            </div>

            {data.isEqualSplit ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Number of People</Label>
                  <Input type="number" min="2" max="20" value={data.peopleCount} onChange={e => updatePersonCount(e.target.value)} placeholder="2" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Enter item costs per person (before tax/tip)</span>
                  <span className={isCustomValid ? "text-green-600" : "text-destructive font-bold"}>
                    Sum: ${customTotal.toFixed(2)} / ${subtotalVal.toFixed(2)}
                  </span>
                </div>

                {data.customPeople.map((person, i) => (
                  <div key={person.id} className="flex gap-2">
                    <Input className="flex-1" value={person.name} onChange={e => handleCustomChange(person.id, "name", e.target.value)} placeholder={`Person ${i + 1}`} />
                    <Input type="number" min="0" step="0.01" className="w-24 text-right" value={person.amount} onChange={e => handleCustomChange(person.id, "amount", handleNumericInput(e.target.value))} placeholder="0.00" />
                  </div>
                ))}

                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="w-full" onClick={addPerson}>Add Person</Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={removePerson} disabled={data.customPeople.length <= 2}>Remove</Button>
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
                Includes ${taxAmountVal.toFixed(2)} tax and ${actualTipAmount.toFixed(2)} tip ({tipPercentVal}%)
              </p>
            </div>

            {!data.isEqualSplit && !isCustomValid && subtotalVal > 0 && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6 text-center text-sm font-bold">
                Custom amounts (${customTotal.toFixed(2)}) must equal subtotal (${subtotalVal.toFixed(2)}).
              </div>
            )}

            {grandTotal === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Enter a bill amount above to see the split.
              </div>
            ) : (
              <div className="space-y-4">
                {data.isEqualSplit ? (
                  Array.from({ length: peopleCountVal }).map((_, i) => {
                    const owes = grandTotal / peopleCountVal;
                    const isPayer = i === data.payerIndex;
                    return (
                      <div key={i} className={`p-4 rounded-lg flex justify-between items-center ${isPayer ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}>
                        <div>
                          <span className="font-bold">Person {i + 1}</span>
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
                  data.customPeople.map((person, i) => {
                    const personAmount = parseFloat(person.amount) || 0;
                    const finalAmount = personAmount * multiplier;
                    const isPayer = i === data.payerIndex;
                    const payerName = data.customPeople[data.payerIndex]?.name || `Person ${data.payerIndex + 1}`;

                    return (
                      <div key={person.id} className={`p-4 rounded-lg flex justify-between items-center ${isPayer ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}>
                        <div>
                          <span className="font-bold">{person.name || `Person ${i + 1}`}</span>
                          {isPayer && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Paid Bill</span>}
                          <div className="text-xs text-muted-foreground mt-1">Item subtotal: ${personAmount.toFixed(2)}</div>
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
            )}

            <div className="mt-8 text-center text-xs text-muted-foreground no-print">
              Tax and tip are distributed proportionally based on each person's share of the subtotal.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

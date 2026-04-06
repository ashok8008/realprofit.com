import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function RentVsBuyCalculator() {
  const [rent, setRent] = useState(2000);
  const [price, setPrice] = useState(400000);
  const [downPayment, setDownPayment] = useState(80000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(10);

  const principal = Math.max(0, price - downPayment);
  const monthlyRate = rate / 100 / 12;
  const numPayments = 30 * 12;
  
  let monthlyMortgage = 0;
  if (principal > 0 && monthlyRate > 0 && numPayments > 0) {
    monthlyMortgage = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  } else if (principal > 0 && numPayments > 0) {
    monthlyMortgage = principal / numPayments;
  }
  
  const propertyTax = (price * 0.012) / 12;
  const insurance = 150;
  const maintenance = (price * 0.01) / 12;
  
  const monthlyBuyCost = monthlyMortgage + propertyTax + insurance + maintenance;
  
  const totalRent = rent * 12 * years;
  const totalBuy = monthlyBuyCost * 12 * years;
  
  const data = [
    { name: 'Renting', cost: Math.round(totalRent), fill: '#f59e0b' },
    { name: 'Buying (Total Costs)', cost: Math.round(totalBuy), fill: '#059669' }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Current Rent ($/mo)</Label>
          <Input type="number" min="0" value={rent} onChange={e => setRent(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Target Home Price ($)</Label>
          <Input type="number" min="0" value={price} onChange={e => setPrice(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Down Payment ($)</Label>
          <Input type="number" min="0" value={downPayment} onChange={e => setDownPayment(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2">
          <Label>Mortgage Rate (%)</Label>
          <Input type="number" min="0" max="30" step="0.1" value={rate} onChange={e => setRate(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Timeframe (Years)</Label>
          <Input type="number" min="1" max="50" value={years} onChange={e => setYears(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-xl border text-center">
        <div>
          <h3 className="font-bold mb-1">Monthly Buy Cost</h3>
          <div className="text-3xl font-serif font-bold text-primary">${Math.round(monthlyBuyCost).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Includes mortgage, taxes, ins, maintenance</p>
        </div>
        <div>
          <h3 className="font-bold mb-1">Difference over {years} years</h3>
          <div className={`text-3xl font-serif font-bold ${totalBuy < totalRent ? 'text-primary' : 'text-amber-500'}`}>
            ${Math.abs(Math.round(totalRent - totalBuy)).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalBuy < totalRent ? 'Buying is cheaper' : 'Renting is cheaper'}
          </p>
        </div>
      </div>

      <div className="h-[250px]" id="rent-vs-buy-chart">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `$${v/1000}k`} />
            <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
            <Bar dataKey="cost" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

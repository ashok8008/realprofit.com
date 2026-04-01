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

  // Simplified calc
  const principal = price - downPayment;
  const monthlyRate = rate / 100 / 12;
  const numPayments = 30 * 12; // 30 yr mortgage assumed
  
  const monthlyMortgage = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  const propertyTax = (price * 0.012) / 12; // 1.2% annual
  const insurance = 150;
  const maintenance = (price * 0.01) / 12; // 1% annual
  
  const monthlyBuyCost = monthlyMortgage + propertyTax + insurance + maintenance;
  
  const totalRent = rent * 12 * years;
  const totalBuy = monthlyBuyCost * 12 * years;
  
  const data = [
    { name: 'Renting', cost: totalRent, fill: '#f59e0b' },
    { name: 'Buying (Total Costs)', cost: totalBuy, fill: '#059669' }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Current Rent ($/mo)</Label>
          <Input type="number" value={rent} onChange={e => setRent(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Target Home Price ($)</Label>
          <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Down Payment ($)</Label>
          <Input type="number" value={downPayment} onChange={e => setDownPayment(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2">
          <Label>Mortgage Rate (%)</Label>
          <Input type="number" value={rate} onChange={e => setRate(Number(e.target.value) || 0)} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Timeframe (Years)</Label>
          <Input type="number" value={years} onChange={e => setYears(Number(e.target.value) || 0)} />
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
            ${Math.abs(totalRent - totalBuy).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalBuy < totalRent ? 'Buying is cheaper' : 'Renting is cheaper'}
          </p>
        </div>
      </div>

      <div className="h-[250px]" id="rent-vs-buy-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `$${v/1000}k`} />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Bar dataKey="cost" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

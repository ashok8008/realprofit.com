import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";

const whatIfData = [
  { age: 30, value: 10000 },
  { age: 35, value: 35000 },
  { age: 40, value: 80000 },
  { age: 45, value: 140000 },
  { age: 50, value: 250000 },
  { age: 55, value: 400000 },
  { age: 60, value: 650000 },
  { age: 65, value: 1050000 },
];

export default function WhatIfChart() {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <AreaChart data={whatIfData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f766e" stopOpacity={0.2}/>
            <stop offset="100%" stopColor="#0f766e" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="age" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => v >= 1000000 ? `$${v/1000000}M` : `$${v/1000}K`} />
        <Area type="monotone" dataKey="value" stroke="#0f766e" fill="url(#colorValue)" strokeWidth={2.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

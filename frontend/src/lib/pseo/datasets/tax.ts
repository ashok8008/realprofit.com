export interface TaxEntry {
  value: number;
  slug: string;
  title: string;
  type: "tax";
  filingStatus: string;
  standardDeduction: number;
  taxableIncome: number;
  estimatedFedTax: number;
  effectiveRate: number;
  ficaTax: number;
  estimatedStateTax: number;
  totalTax: number;
  takeHome: number;
}

function buildTax(amount: number): TaxEntry {
  const standardDeduction = 14600;
  const taxableIncome = Math.max(0, amount - standardDeduction);
  let fedTax = 0;
  let remaining = taxableIncome;

  const brackets = [
    { limit: 11600, rate: 0.10 },
    { limit: 47150, rate: 0.12 },
    { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: 243725, rate: 0.32 },
    { limit: 609350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ];

  let prev = 0;
  for (const b of brackets) {
    const taxable = Math.min(remaining, b.limit - prev);
    if (taxable <= 0) break;
    fedTax += taxable * b.rate;
    remaining -= taxable;
    prev = b.limit;
  }

  fedTax = Math.round(fedTax);
  const ficaTax = Math.round(Math.min(amount, 168600) * 0.0765 + Math.max(0, amount - 200000) * 0.009);
  const stateTax = Math.round(amount * 0.05);
  const totalTax = fedTax + ficaTax + stateTax;

  return {
    value: amount,
    slug: `tax-on-${amount}-income`,
    title: `$${amount.toLocaleString()} Income — Tax Breakdown & Take-Home Pay`,
    type: "tax",
    filingStatus: "Single",
    standardDeduction,
    taxableIncome,
    estimatedFedTax: fedTax,
    effectiveRate: Math.round((fedTax / amount) * 1000) / 10,
    ficaTax,
    estimatedStateTax: stateTax,
    totalTax,
    takeHome: amount - totalTax,
  };
}

// Grid: 20k→100k step 5k, 100k→300k step 10k
const gridAmounts: number[] = [];
for (let a = 20000; a <= 100000; a += 5000) gridAmounts.push(a);
for (let a = 110000; a <= 300000; a += 10000) gridAmounts.push(a);

// Existing amounts from legacy dataset
const legacyAmounts = [
  20000, 25000, 30000, 35000, 40000, 45000, 48000, 50000, 52000, 55000, 58000,
  60000, 62000, 65000, 68000, 70000, 72000, 75000, 78000, 80000, 82000, 85000,
  88000, 90000, 92000, 95000, 98000, 100000, 105000, 110000, 115000, 120000,
  125000, 130000, 140000, 150000, 160000, 170000, 175000, 180000, 190000,
  200000, 220000, 250000, 275000, 300000, 350000, 400000, 500000,
];

const allAmounts = [...new Set([...gridAmounts, ...legacyAmounts])].sort((a, b) => a - b);

export const taxEntries: TaxEntry[] = allAmounts.map(buildTax);

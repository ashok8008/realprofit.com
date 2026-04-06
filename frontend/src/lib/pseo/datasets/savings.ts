export interface SavingsEntry {
  value: number;
  slug: string;
  title: string;
  type: "savings";
  context: string;
  monthlyAt6mo: number;
  monthlyAt1yr: number;
  monthlyAt2yr: number;
  monthlyAt5yr: number;
}

function getContext(amount: number): string {
  if (amount <= 500) return "Starter Fund";
  if (amount <= 1000) return "Starter Emergency Fund";
  if (amount <= 1500) return "Security Deposit";
  if (amount <= 2000) return "Small Emergency Fund";
  if (amount <= 2500) return "Car Repair Fund";
  if (amount <= 3000) return "Mini Emergency Fund";
  if (amount <= 4000) return "Medical Emergency";
  if (amount <= 5000) return "Safety Net";
  if (amount <= 6000) return "3-Month Emergency";
  if (amount <= 7500) return "Travel Fund";
  if (amount <= 8000) return "Used Car Fund";
  if (amount <= 10000) return "Life Milestone";
  if (amount <= 12000) return "6-Month Emergency";
  if (amount <= 15000) return "Wedding Fund";
  if (amount <= 20000) return "New Car Fund";
  if (amount <= 25000) return "Down Payment Starter";
  if (amount <= 30000) return "Home Down Payment";
  if (amount <= 40000) return "Major Life Change";
  if (amount <= 50000) return "Down Payment";
  if (amount <= 60000) return "Investment Seed";
  if (amount <= 75000) return "Business Startup";
  if (amount <= 100000) return "Six Figure Savings";
  if (amount <= 150000) return "Financial Freedom";
  if (amount <= 200000) return "Early Retirement Seed";
  if (amount <= 250000) return "Wealth Building";
  if (amount <= 300000) return "Serious Wealth";
  if (amount <= 400000) return "Major Milestone";
  if (amount <= 500000) return "Half Million Goal";
  if (amount <= 750000) return "Portfolio Foundation";
  return "Millionaire Goal";
}

function buildSavings(amount: number): SavingsEntry {
  return {
    value: amount,
    slug: `save-${amount}`,
    title: `How to Save $${amount.toLocaleString()} (${getContext(amount)})`,
    type: "savings",
    context: getContext(amount),
    monthlyAt6mo: Math.ceil(amount / 6),
    monthlyAt1yr: Math.ceil(amount / 12),
    monthlyAt2yr: Math.ceil(amount / 24),
    monthlyAt5yr: Math.ceil(amount / 60),
  };
}

// Grid: 1k→5k step 1k, 5k→50k step 5k, 50k→200k step 25k, 200k→1M step variable
const gridAmounts: number[] = [];
for (let a = 1000; a <= 5000; a += 1000) gridAmounts.push(a);
for (let a = 10000; a <= 50000; a += 5000) gridAmounts.push(a);
for (let a = 75000; a <= 200000; a += 25000) gridAmounts.push(a);
gridAmounts.push(250000, 300000, 400000, 500000, 750000, 1000000);

// Existing amounts from legacy dataset
const legacyAmounts = [
  500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7500, 8000,
  10000, 12000, 15000, 20000, 25000, 30000, 40000, 50000, 60000,
  75000, 100000, 150000, 200000, 250000, 500000, 1000000,
];

const allAmounts = [...new Set([...gridAmounts, ...legacyAmounts])].sort((a, b) => a - b);

export const savingsEntries: SavingsEntry[] = allAmounts.map(buildSavings);

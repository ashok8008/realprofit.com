export interface SavingsTarget {
  amount: number;
  context: string;
  slug: string;
  monthlyAt6mo: number;
  monthlyAt1yr: number;
  monthlyAt2yr: number;
  monthlyAt5yr: number;
}

function buildSavings(amount: number, context: string): SavingsTarget {
  return {
    amount,
    context,
    slug: `save-${amount}`,
    monthlyAt6mo: Math.ceil(amount / 6),
    monthlyAt1yr: Math.ceil(amount / 12),
    monthlyAt2yr: Math.ceil(amount / 24),
    monthlyAt5yr: Math.ceil(amount / 60),
  };
}

export const savingsTargets: SavingsTarget[] = [
  buildSavings(500, "Starter Fund"),
  buildSavings(1000, "Starter Emergency Fund"),
  buildSavings(1500, "Security Deposit"),
  buildSavings(2000, "Small Emergency Fund"),
  buildSavings(2500, "Car Repair Fund"),
  buildSavings(3000, "Mini Emergency Fund"),
  buildSavings(4000, "Medical Emergency"),
  buildSavings(5000, "Safety Net"),
  buildSavings(6000, "3-Month Emergency"),
  buildSavings(7500, "Travel Fund"),
  buildSavings(8000, "Used Car Fund"),
  buildSavings(10000, "Life Milestone"),
  buildSavings(12000, "6-Month Emergency"),
  buildSavings(15000, "Wedding Fund"),
  buildSavings(20000, "New Car Fund"),
  buildSavings(25000, "Down Payment Starter"),
  buildSavings(30000, "Home Down Payment"),
  buildSavings(40000, "Major Life Change"),
  buildSavings(50000, "Down Payment"),
  buildSavings(60000, "Investment Seed"),
  buildSavings(75000, "Business Startup"),
  buildSavings(100000, "Six Figure Savings"),
  buildSavings(150000, "Financial Freedom"),
  buildSavings(200000, "Early Retirement Seed"),
  buildSavings(250000, "Wealth Building"),
  buildSavings(500000, "Half Million Goal"),
  buildSavings(1000000, "Millionaire Goal"),
];

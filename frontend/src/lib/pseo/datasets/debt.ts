export interface DebtEntry {
  value: number;
  slug: string;
  title: string;
  type: "debt";
  variant: "payoff" | "interest";
  interestRate: number;
  minimumPayment: number;
  minimumPayoffMonths: number;
  minimumTotalInterest: number;
  aggressivePayment: number;
  aggressivePayoffMonths: number;
  aggressiveTotalInterest: number;
}

function simulatePayoff(balance: number, annualRate: number, monthlyPayment: number): { months: number; totalInterest: number } {
  let remaining = balance;
  let months = 0;
  let totalInterest = 0;
  const monthlyRate = annualRate / 100 / 12;

  while (remaining > 0.01 && months < 600) {
    const interest = remaining * monthlyRate;
    totalInterest += interest;
    const effectivePayment = Math.min(monthlyPayment, remaining + interest);
    const principal = effectivePayment - interest;
    if (principal <= 0) return { months: 999, totalInterest: Math.round(totalInterest) };
    remaining -= principal;
    months++;
  }

  return { months, totalInterest: Math.round(totalInterest) };
}

function buildDebt(amount: number, variant: "payoff" | "interest"): DebtEntry {
  const rate = 22; // typical credit card APR
  const minPayment = Math.max(25, Math.round(amount * 0.02));
  const aggressivePayment = Math.max(minPayment * 3, 100);
  const fmtAmt = `$${amount.toLocaleString()}`;

  const minResult = simulatePayoff(amount, rate, minPayment);
  const aggResult = simulatePayoff(amount, rate, aggressivePayment);

  const slug = variant === "payoff" ? `pay-off-${amount}-debt` : `credit-card-interest-${amount}`;
  const title = variant === "payoff"
    ? `How to Pay Off ${fmtAmt} in Debt: Timeline & Strategy`
    : `How Much Interest on ${fmtAmt} Credit Card Balance?`;

  return {
    value: amount,
    slug,
    title,
    type: "debt",
    variant,
    interestRate: rate,
    minimumPayment: minPayment,
    minimumPayoffMonths: minResult.months,
    minimumTotalInterest: minResult.totalInterest,
    aggressivePayment,
    aggressivePayoffMonths: aggResult.months,
    aggressiveTotalInterest: aggResult.totalInterest,
  };
}

const amounts = [
  1000, 2000, 3000, 4000, 5000, 7500, 10000, 15000,
  20000, 25000, 30000, 40000, 50000, 75000, 100000,
];

const entries: DebtEntry[] = [];
for (const a of amounts) {
  entries.push(buildDebt(a, "payoff"));
  entries.push(buildDebt(a, "interest"));
}

export const debtEntries: DebtEntry[] = entries;

export interface MortgageEntry {
  value: number;
  slug: string;
  title: string;
  type: "mortgage";
  variant: "base" | "rate" | "term";
  rate: number;
  term: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
}

function calcMortgage(principal: number, annualRate: number, termYears: number) {
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return { monthlyPayment: Math.round(principal / n), totalInterest: 0, totalCost: principal };
  const monthly = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalCost = monthly * n;
  return {
    monthlyPayment: Math.round(monthly),
    totalInterest: Math.round(totalCost - principal),
    totalCost: Math.round(totalCost),
  };
}

function buildMortgage(amount: number, rate: number, term: number, variant: "base" | "rate" | "term"): MortgageEntry {
  const calc = calcMortgage(amount, rate, term);
  const fmtAmt = `$${amount.toLocaleString()}`;

  let slug: string;
  let title: string;
  if (variant === "base") {
    slug = `mortgage-${amount}`;
    title = `${fmtAmt} Mortgage: Monthly Payment & Total Cost`;
  } else if (variant === "rate") {
    slug = `mortgage-${amount}-${rate}-percent`;
    title = `${fmtAmt} Mortgage at ${rate}% Interest Rate`;
  } else {
    slug = `mortgage-${amount}-${term}-year`;
    title = `${fmtAmt} Mortgage Over ${term} Years`;
  }

  return {
    value: amount,
    slug,
    title,
    type: "mortgage",
    variant,
    rate,
    term,
    ...calc,
  };
}

// Primary amounts
const amounts = [
  50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000,
  450000, 500000, 600000, 700000, 800000, 900000, 1000000, 1500000, 2000000,
];

// Key amounts for rate & term variants
const variantAmounts = [150000, 200000, 300000, 400000, 500000, 700000, 1000000, 1500000];

const rates = [5, 6, 7, 8];
const terms = [15, 30];

const entries: MortgageEntry[] = [];

// Base pages: default 7% / 30yr
for (const a of amounts) {
  entries.push(buildMortgage(a, 7, 30, "base"));
}

// Rate variant pages
for (const a of variantAmounts) {
  for (const r of rates) {
    entries.push(buildMortgage(a, r, 30, "rate"));
  }
}

// Term variant pages
for (const a of variantAmounts) {
  for (const t of terms) {
    entries.push(buildMortgage(a, 7, t, "term"));
  }
}

export const mortgageEntries: MortgageEntry[] = entries;

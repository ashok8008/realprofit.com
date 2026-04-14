export interface FreelancerEntry {
  value: number;
  slug: string;
  title: string;
  type: "freelancer";
  variant: "se-tax" | "set-aside";
  netEarnings: number;
  selfEmploymentTax: number;
  seDeduction: number;
  estimatedFedTax: number;
  estimatedStateTax: number;
  totalTax: number;
  takeHome: number;
  recommendedSetAsidePercent: number;
  quarterlyPayment: number;
}

function buildFreelancer(income: number, variant: "se-tax" | "set-aside"): FreelancerEntry {
  const netEarnings = Math.round(income * 0.9235);
  const ssCap = 168600;
  const ssTax = Math.min(netEarnings, ssCap) * 0.124;
  const mediTax = netEarnings * 0.029 + Math.max(0, netEarnings - 200000) * 0.009;
  const seTax = Math.round(ssTax + mediTax);
  const seDeduction = Math.round(seTax / 2);

  const adjustedIncome = income - seDeduction;
  const standardDeduction = 14600;
  const taxableIncome = Math.max(0, adjustedIncome - standardDeduction);

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

  const stateTax = Math.round(income * 0.05);
  const totalTax = seTax + fedTax + stateTax;
  const takeHome = income - totalTax;

  let setAsidePercent: number;
  if (income < 40000) setAsidePercent = 25;
  else if (income < 80000) setAsidePercent = 30;
  else if (income < 150000) setAsidePercent = 33;
  else setAsidePercent = 37;

  const fmtIncome = `$${income.toLocaleString()}`;
  const slug = variant === "se-tax"
    ? `self-employment-tax-${income}`
    : `how-much-tax-to-set-aside-${income}`;
  const title = variant === "se-tax"
    ? `Self-Employment Tax on ${fmtIncome} — The Full Picture`
    : `Freelancing at ${fmtIncome}? How Much to Set Aside for Taxes`;

  return {
    value: income,
    slug,
    title,
    type: "freelancer",
    variant,
    netEarnings,
    selfEmploymentTax: seTax,
    seDeduction,
    estimatedFedTax: fedTax,
    estimatedStateTax: stateTax,
    totalTax,
    takeHome,
    recommendedSetAsidePercent: setAsidePercent,
    quarterlyPayment: Math.round(totalTax / 4),
  };
}

const incomes = [
  10000, 15000, 20000, 25000, 30000, 35000, 40000, 50000, 60000,
  70000, 80000, 90000, 100000, 120000, 150000, 175000, 200000, 250000, 300000,
];

const entries: FreelancerEntry[] = [];
for (const i of incomes) {
  entries.push(buildFreelancer(i, "se-tax"));
  entries.push(buildFreelancer(i, "set-aside"));
}

export const freelancerEntries: FreelancerEntry[] = entries;

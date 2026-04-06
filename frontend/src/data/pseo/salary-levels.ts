export interface SalaryLevel {
  amount: number;
  context: string;
  slug: string;
  taxBracket: string;
  monthlyGross: number;
  estimatedFedTax: number;
  estimatedStateTax: number;
  estimatedFICA: number;
  monthlyNet: number;
}

function buildSalary(amount: number, context: string): SalaryLevel {
  const monthlyGross = Math.round(amount / 12);
  const fica = Math.round(amount * 0.0765);

  let fedRate: number;
  let taxBracket: string;
  if (amount <= 11600) { fedRate = 0.10; taxBracket = "10%"; }
  else if (amount <= 47150) { fedRate = 0.12; taxBracket = "12%"; }
  else if (amount <= 100525) { fedRate = 0.22; taxBracket = "22%"; }
  else if (amount <= 191950) { fedRate = 0.24; taxBracket = "24%"; }
  else if (amount <= 243725) { fedRate = 0.32; taxBracket = "32%"; }
  else if (amount <= 609350) { fedRate = 0.35; taxBracket = "35%"; }
  else { fedRate = 0.37; taxBracket = "37%"; }

  const estimatedFedTax = Math.round(amount * fedRate * 0.7);
  const estimatedStateTax = Math.round(amount * 0.05);
  const monthlyNet = Math.round((amount - estimatedFedTax - estimatedStateTax - fica) / 12);

  return {
    amount,
    context,
    slug: `${amount}-salary`,
    taxBracket,
    monthlyGross,
    estimatedFedTax,
    estimatedStateTax,
    estimatedFICA: fica,
    monthlyNet,
  };
}

export const salaryLevels: SalaryLevel[] = [
  buildSalary(25000, "Minimum Wage Range"),
  buildSalary(30000, "Entry Level"),
  buildSalary(35000, "Entry Level"),
  buildSalary(40000, "Entry Level"),
  buildSalary(42000, "Median Individual"),
  buildSalary(45000, "Lower Middle Income"),
  buildSalary(48000, "Lower Middle Income"),
  buildSalary(50000, "Median Household"),
  buildSalary(52000, "Standard"),
  buildSalary(55000, "Standard"),
  buildSalary(58000, "Standard"),
  buildSalary(60000, "Solid Middle Class"),
  buildSalary(62000, "Solid Middle Class"),
  buildSalary(65000, "Solid Middle Class"),
  buildSalary(68000, "Upper Middle"),
  buildSalary(70000, "Upper Middle"),
  buildSalary(72000, "Upper Middle"),
  buildSalary(75000, "Comfortable"),
  buildSalary(78000, "Comfortable"),
  buildSalary(80000, "Comfortable"),
  buildSalary(82000, "Comfortable"),
  buildSalary(85000, "Above Average"),
  buildSalary(88000, "Above Average"),
  buildSalary(90000, "Above Average"),
  buildSalary(92000, "Above Average"),
  buildSalary(95000, "Near Six Figures"),
  buildSalary(98000, "Near Six Figures"),
  buildSalary(100000, "Six Figures"),
  buildSalary(105000, "Six Figures"),
  buildSalary(110000, "Six Figures"),
  buildSalary(115000, "Six Figures"),
  buildSalary(120000, "High Earner"),
  buildSalary(125000, "High Earner"),
  buildSalary(130000, "High Earner"),
  buildSalary(135000, "High Earner"),
  buildSalary(140000, "Top 10%"),
  buildSalary(145000, "Top 10%"),
  buildSalary(150000, "Top 10%"),
  buildSalary(160000, "Top 10%"),
  buildSalary(170000, "Top 5%"),
  buildSalary(175000, "Top 5%"),
  buildSalary(180000, "Top 5%"),
  buildSalary(190000, "Top 5%"),
  buildSalary(200000, "Top 3%"),
  buildSalary(210000, "Top 3%"),
  buildSalary(220000, "Top 3%"),
  buildSalary(225000, "Top 3%"),
  buildSalary(250000, "Top 2%"),
  buildSalary(275000, "Top 2%"),
  buildSalary(300000, "Top 1%"),
  buildSalary(350000, "Top 1%"),
  buildSalary(400000, "Top 1%"),
  buildSalary(500000, "Top 0.5%"),
];

export interface TaxOnIncome {
  amount: number;
  slug: string;
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

function buildTax(amount: number): TaxOnIncome {
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
    amount,
    slug: `tax-on-${amount}-income`,
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

export const taxOnIncome: TaxOnIncome[] = [
  buildTax(20000),
  buildTax(25000),
  buildTax(30000),
  buildTax(35000),
  buildTax(40000),
  buildTax(45000),
  buildTax(48000),
  buildTax(50000),
  buildTax(52000),
  buildTax(55000),
  buildTax(58000),
  buildTax(60000),
  buildTax(62000),
  buildTax(65000),
  buildTax(68000),
  buildTax(70000),
  buildTax(72000),
  buildTax(75000),
  buildTax(78000),
  buildTax(80000),
  buildTax(82000),
  buildTax(85000),
  buildTax(88000),
  buildTax(90000),
  buildTax(92000),
  buildTax(95000),
  buildTax(98000),
  buildTax(100000),
  buildTax(105000),
  buildTax(110000),
  buildTax(115000),
  buildTax(120000),
  buildTax(125000),
  buildTax(130000),
  buildTax(140000),
  buildTax(150000),
  buildTax(160000),
  buildTax(170000),
  buildTax(175000),
  buildTax(180000),
  buildTax(190000),
  buildTax(200000),
  buildTax(220000),
  buildTax(250000),
  buildTax(275000),
  buildTax(300000),
  buildTax(350000),
  buildTax(400000),
  buildTax(500000),
];

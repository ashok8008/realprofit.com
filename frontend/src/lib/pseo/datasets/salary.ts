export interface SalaryEntry {
  value: number;
  slug: string;
  title: string;
  type: "salary";
  context: string;
  taxBracket: string;
  monthlyGross: number;
  estimatedFedTax: number;
  estimatedStateTax: number;
  estimatedFICA: number;
  monthlyNet: number;
}

function getContext(amount: number): string {
  if (amount < 25000) return "Minimum Wage Range";
  if (amount < 35000) return "Entry Level";
  if (amount < 42000) return "Below Median";
  if (amount < 50000) return "Lower Middle Income";
  if (amount < 60000) return "Standard";
  if (amount < 70000) return "Solid Middle Class";
  if (amount < 80000) return "Upper Middle";
  if (amount < 90000) return "Above Average";
  if (amount < 100000) return "Near Six Figures";
  if (amount < 120000) return "Six Figures";
  if (amount < 140000) return "High Earner";
  if (amount < 170000) return "Top 10%";
  if (amount < 200000) return "Top 5%";
  if (amount < 250000) return "Top 3%";
  if (amount < 350000) return "Top 2%";
  if (amount < 500000) return "Top 1%";
  return "Top 0.5%";
}

function buildSalary(amount: number): SalaryEntry {
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
    value: amount,
    slug: `${amount}-salary`,
    title: `Is $${amount.toLocaleString()} a Good Salary? A Reality Check`,
    type: "salary",
    context: getContext(amount),
    taxBracket,
    monthlyGross,
    estimatedFedTax,
    estimatedStateTax,
    estimatedFICA: fica,
    monthlyNet,
  };
}

// Grid: 20k→100k step 5k, 100k→300k step 10k
const gridAmounts: number[] = [];
for (let a = 20000; a <= 100000; a += 5000) gridAmounts.push(a);
for (let a = 110000; a <= 300000; a += 10000) gridAmounts.push(a);

// Existing amounts that may not be on the grid (preserves old slugs)
const legacyAmounts = [
  25000, 30000, 35000, 40000, 42000, 45000, 48000, 50000, 52000, 55000, 58000,
  60000, 62000, 65000, 68000, 70000, 72000, 75000, 78000, 80000, 82000, 85000,
  88000, 90000, 92000, 95000, 98000, 100000, 105000, 110000, 115000, 120000,
  125000, 130000, 135000, 140000, 145000, 150000, 160000, 170000, 175000,
  180000, 190000, 200000, 210000, 220000, 225000, 250000, 275000, 300000,
  350000, 400000, 500000,
];

const allAmounts = [...new Set([...gridAmounts, ...legacyAmounts])].sort((a, b) => a - b);

export const salaryEntries: SalaryEntry[] = allAmounts.map(buildSalary);

// Shared federal tax bracket logic for all tax tools

interface Bracket { min: number; max: number; rate: number; base: number }

const SINGLE_BRACKETS: Bracket[] = [
  { min: 0, max: 11600, rate: 0.10, base: 0 },
  { min: 11600, max: 47150, rate: 0.12, base: 1160 },
  { min: 47150, max: 100525, rate: 0.22, base: 5426 },
  { min: 100525, max: 191950, rate: 0.24, base: 17168.5 },
  { min: 191950, max: 243725, rate: 0.32, base: 39110.5 },
  { min: 243725, max: 609350, rate: 0.35, base: 55678.5 },
  { min: 609350, max: Infinity, rate: 0.37, base: 183647.25 },
];

const MFJ_BRACKETS: Bracket[] = [
  { min: 0, max: 23200, rate: 0.10, base: 0 },
  { min: 23200, max: 94300, rate: 0.12, base: 2320 },
  { min: 94300, max: 201050, rate: 0.22, base: 10852 },
  { min: 201050, max: 383900, rate: 0.24, base: 34337 },
  { min: 383900, max: 487450, rate: 0.32, base: 78221 },
  { min: 487450, max: 731200, rate: 0.35, base: 111357 },
  { min: 731200, max: Infinity, rate: 0.37, base: 196669.5 },
];

export const STANDARD_DEDUCTION_SINGLE = 14600;
export const STANDARD_DEDUCTION_MFJ = 29200;

export function calcFederalTax(taxableIncome: number, filing: "single" | "mfj" = "single"): number {
  if (taxableIncome <= 0) return 0;
  const brackets = filing === "mfj" ? MFJ_BRACKETS : SINGLE_BRACKETS;
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxableIncome > brackets[i].min) {
      return brackets[i].base + (taxableIncome - brackets[i].min) * brackets[i].rate;
    }
  }
  return 0;
}

export function calcSETax(netIncome: number) {
  const seTaxable = netIncome * 0.9235;
  const seTax = seTaxable > 0 ? seTaxable * 0.153 : 0;
  return { seTaxable, seTax, deductibleHalf: seTax / 2 };
}

export function getMarginalBracket(taxableIncome: number, filing: "single" | "mfj" = "single"): number {
  const brackets = filing === "mfj" ? MFJ_BRACKETS : SINGLE_BRACKETS;
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxableIncome > brackets[i].min) return brackets[i].rate * 100;
  }
  return 10;
}

export const QUARTERLY_DUE_DATES = [
  { quarter: "Q1", due: "April 15", period: "Jan 1 - Mar 31" },
  { quarter: "Q2", due: "June 15", period: "Apr 1 - May 31" },
  { quarter: "Q3", due: "September 15", period: "Jun 1 - Aug 31" },
  { quarter: "Q4", due: "January 15", period: "Sep 1 - Dec 31" },
];

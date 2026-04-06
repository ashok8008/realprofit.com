import { salaryEntries, type SalaryEntry } from "./salary";
import { taxEntries, type TaxEntry } from "./tax";
import { savingsEntries, type SavingsEntry } from "./savings";
import { mortgageEntries, type MortgageEntry } from "./mortgage";
import { debtEntries, type DebtEntry } from "./debt";
import { freelancerEntries, type FreelancerEntry } from "./freelancer";
import type { PseoType } from "../variationEngine";

export type PseoEntry = SalaryEntry | TaxEntry | SavingsEntry | MortgageEntry | DebtEntry | FreelancerEntry;

const slugMap = new Map<string, PseoEntry>();

function register(entries: PseoEntry[]) {
  for (const e of entries) {
    slugMap.set(e.slug, e);
  }
}

register(salaryEntries as PseoEntry[]);
register(taxEntries as PseoEntry[]);
register(savingsEntries as PseoEntry[]);
register(mortgageEntries as PseoEntry[]);
register(debtEntries as PseoEntry[]);
register(freelancerEntries as PseoEntry[]);

export function findBySlug(slug: string): PseoEntry | undefined {
  return slugMap.get(slug);
}

export function getAllSlugs(): string[] {
  return Array.from(slugMap.keys());
}

export function getEntriesByType(type: PseoType): PseoEntry[] {
  const map: Record<PseoType, PseoEntry[]> = {
    salary: salaryEntries,
    tax: taxEntries,
    savings: savingsEntries,
    mortgage: mortgageEntries,
    debt: debtEntries,
    freelancer: freelancerEntries,
  };
  return map[type] || [];
}

export function getTotalPageCount(): number {
  return slugMap.size;
}

export {
  salaryEntries, taxEntries, savingsEntries,
  mortgageEntries, debtEntries, freelancerEntries,
};
export type {
  SalaryEntry, TaxEntry, SavingsEntry,
  MortgageEntry, DebtEntry, FreelancerEntry,
};

import { salaryEntries, type SalaryEntry } from "./salary";
import { taxEntries, type TaxEntry } from "./tax";
import { savingsEntries, type SavingsEntry } from "./savings";
import { mortgageEntries, type MortgageEntry } from "./mortgage";
import { debtEntries, type DebtEntry } from "./debt";
import { freelancerEntries, type FreelancerEntry } from "./freelancer";
import { locationSalaryEntries, type LocationSalaryEntry } from "./locationSalary";
import { allResumeCareerEntries, type ResumeCareerEntry } from "./resumeCareer";
import type { PseoType } from "../variationEngine";

export type PseoEntry = SalaryEntry | TaxEntry | SavingsEntry | MortgageEntry | DebtEntry | FreelancerEntry | LocationSalaryEntry;

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
register(locationSalaryEntries as PseoEntry[]);

// Resume/Career entries in a separate map (different route)
const resumeCareerMap = new Map<string, ResumeCareerEntry>();
for (const e of allResumeCareerEntries) {
  resumeCareerMap.set(e.slug, e);
}

export function findBySlug(slug: string): PseoEntry | undefined {
  return slugMap.get(slug);
}

export function getAllSlugs(): string[] {
  return Array.from(slugMap.keys());
}

export function getEntriesByType(type: PseoType): PseoEntry[] {
  const map: Record<PseoType | "location-salary", PseoEntry[]> = {
    salary: salaryEntries,
    tax: taxEntries,
    savings: savingsEntries,
    mortgage: mortgageEntries,
    debt: debtEntries,
    freelancer: freelancerEntries,
    "location-salary": locationSalaryEntries,
  };
  return map[type] || [];
}

export function findResumeCareerBySlug(slug: string): ResumeCareerEntry | undefined {
  return resumeCareerMap.get(slug);
}

export function getAllResumeCareerSlugs(): string[] {
  return Array.from(resumeCareerMap.keys());
}

export function getTotalPageCount(): number {
  return slugMap.size + resumeCareerMap.size;
}

export {
  salaryEntries, taxEntries, savingsEntries,
  mortgageEntries, debtEntries, freelancerEntries,
  locationSalaryEntries, allResumeCareerEntries,
};
export type {
  SalaryEntry, TaxEntry, SavingsEntry,
  MortgageEntry, DebtEntry, FreelancerEntry,
  LocationSalaryEntry, ResumeCareerEntry,
};

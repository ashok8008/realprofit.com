export interface TaxToolDef {
  id: string;
  name: string;
  slug: string;
  description: string;
  section: "calculators" | "planning" | "irs-prep" | "guides";
  tag?: string;
}

export const taxTools: TaxToolDef[] = [
  // ── Tax Calculators ──
  { id: "simple-tax", name: "Simple Tax Estimator", slug: "simple-tax-estimator", description: "Estimate federal + state income tax and take-home pay.", section: "calculators", tag: "Estimate" },
  { id: "self-employment-tax", name: "Self-Employment Tax Calculator", slug: "self-employment-tax-calculator", description: "Find your exact FICA burden as a freelancer or contractor.", section: "calculators", tag: "Estimate" },
  { id: "tax-set-aside", name: "Tax Set-Aside Calculator", slug: "tax-set-aside-calculator", description: "Know how much of each freelance check to save for the IRS.", section: "calculators", tag: "Estimate" },
  { id: "quarterly-tax", name: "Quarterly Tax Calculator", slug: "quarterly-tax-calculator", description: "Calculate your estimated quarterly tax payments and due dates.", section: "calculators", tag: "Estimate" },

  // ── Tax Planning ──
  { id: "freelancer-tax-planner", name: "Freelancer Tax Planner", slug: "freelancer-tax-planner", description: "Annual and quarterly tax planning dashboard for freelancers.", section: "planning", tag: "Plan" },
  { id: "income-mix-planner", name: "Income Mix Tax Planner", slug: "income-mix-planner", description: "Estimate taxes when income comes from multiple sources (W-2 + 1099 + other).", section: "planning", tag: "Plan" },
  { id: "tax-checklist", name: "Tax Checklist Generator", slug: "tax-checklist-generator", description: "Generate a checklist of tax forms, documents, and deadlines you need.", section: "planning", tag: "Plan" },

  // ── IRS Prep ──
  { id: "1040es-prep", name: "1040-ES Prep Generator", slug: "1040es-prep-generator", description: "Prepare quarterly estimated tax documentation for download.", section: "irs-prep", tag: "Prepare" },
  { id: "schedule-c-prep", name: "Schedule C Prep Summary", slug: "schedule-c-prep-summary", description: "Summarize business income and expenses before filing.", section: "irs-prep", tag: "Prepare" },
  { id: "tax-summary-pdf", name: "Tax Summary PDF", slug: "tax-summary-pdf", description: "Generate a clean year-end tax prep summary document.", section: "irs-prep", tag: "Prepare" },
  { id: "w2-1099-organizer", name: "W-2 + 1099 Organizer", slug: "w2-1099-organizer", description: "Organize income documents and generate a filing checklist.", section: "irs-prep", tag: "Prepare" },
  { id: "year-end-packet", name: "Year-End Tax Packet", slug: "year-end-tax-packet", description: "Bundle all your tax prep into one exportable PDF packet.", section: "irs-prep", tag: "Prepare" },
];

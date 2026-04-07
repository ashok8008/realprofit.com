import type { Metadata } from "next";
import { taxTools } from "@/data/tax-tools";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://realprofits.com";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Tax Tools - Free Tax Calculators, Planning & IRS Prep",
    description:
      "Free tax tools for freelancers and employees. Estimate income tax, plan quarterly payments, organize W-2s and 1099s, and generate prep worksheets. No IRS filing — prep only.",
    keywords:
      "tax calculator, quarterly tax, self employment tax, 1040-ES, schedule c, tax planning, freelance tax, irs prep, w2 organizer, tax tools",
    alternates: {
      canonical: `${BASE}/tax-tools`,
    },
    openGraph: {
      title: "Tax Tools - Free Tax Calculators, Planning & IRS Prep",
      description:
        "Free tax tools for freelancers and employees. Estimate income tax, plan quarterly payments, and generate prep worksheets.",
      url: `${BASE}/tax-tools`,
      type: "website",
    },
  };
}

export { default } from "@/views/tax-tools/TaxToolsHub";

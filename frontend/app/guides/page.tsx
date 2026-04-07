import type { Metadata } from "next";
import GuidesHubClient from "@/views/GuidesHub";

export const metadata: Metadata = {
  title: "Financial Guides",
  description: "Browse 700+ free financial guides covering salary breakdowns, tax calculations, savings plans, mortgage analysis, debt payoff strategies, and freelancer tax planning.",
  keywords: "financial guides, salary breakdown, tax calculation, savings plan, mortgage calculator, debt payoff, freelance tax, self employment tax, personal finance",
  alternates: { canonical: "https://realprofits.com/guides" },
};

export default function GuidesPage() {
  return <GuidesHubClient />;
}

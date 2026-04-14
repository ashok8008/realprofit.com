"use client";
import Link from "next/link";
import { ArrowRight, TrendingUp, FileText, DollarSign, Briefcase, PiggyBank, Building2, HelpCircle } from "lucide-react";

const TOP_PAGES = [
  // Salary (highest search volume)
  { href: "/guides/80000-salary", label: "Is $80,000 a Good Salary?", icon: DollarSign, cat: "Salary" },
  { href: "/guides/100000-salary", label: "Is $100K a Good Salary?", icon: DollarSign, cat: "Salary" },
  { href: "/guides/50000-salary", label: "Is $50K a Good Salary?", icon: DollarSign, cat: "Salary" },
  // Tax
  { href: "/guides/tax-on-100000-income", label: "$100K Tax Breakdown", icon: DollarSign, cat: "Tax" },
  { href: "/guides/tax-on-70000-income", label: "$70K After Tax", icon: DollarSign, cat: "Tax" },
  // Resume (high-intent)
  { href: "/learn/resume-for-software-engineer", label: "Resume for Software Engineers", icon: FileText, cat: "Resume" },
  { href: "/learn/resume-score-70", label: "Is Resume Score 70 Good?", icon: FileText, cat: "Resume" },
  { href: "/learn/why-my-resume-is-not-getting-calls", label: "Why No Interview Calls?", icon: FileText, cat: "Resume" },
  { href: "/learn/resume-with-no-experience", label: "Resume with No Experience", icon: FileText, cat: "Resume" },
  // Savings
  { href: "/guides/save-10000", label: "How to Save $10K Fast", icon: PiggyBank, cat: "Savings" },
  { href: "/guides/save-50000", label: "How to Save $50K", icon: PiggyBank, cat: "Savings" },
  // Career Decisions
  { href: "/learn/should-i-change-jobs", label: "Should I Change Jobs?", icon: Briefcase, cat: "Career" },
  { href: "/learn/is-my-salary-good", label: "Is My Salary Good?", icon: HelpCircle, cat: "Career" },
  // Location
  { href: "/guides/80000-salary-in-new-york", label: "$80K in New York — Worth It?", icon: Building2, cat: "City" },
  { href: "/guides/100000-salary-in-san-francisco", label: "$100K in San Francisco", icon: Building2, cat: "City" },
  // Debt
  { href: "/guides/pay-off-10000-debt", label: "Pay Off $10K Debt Fast", icon: DollarSign, cat: "Debt" },
];

export function TrendingGuidesSection() {
  return (
    <section className="py-16 px-4 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-bold text-gray-900">Trending Guides & Calculators</h2>
        </div>
        <p className="text-sm text-gray-500 mb-8">Most-searched salary, resume, tax, and career guides — all free.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TOP_PAGES.map((page) => {
            const Icon = page.icon;
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-teal-400 hover:shadow-sm transition-all"
              >
                <Icon className="w-4 h-4 text-gray-400 group-hover:text-teal-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-sm font-medium text-gray-800 group-hover:text-teal-700 line-clamp-2 leading-snug">{page.label}</span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1 block">{page.cat}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-8">
          <Link href="/guides" className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
            All Financial Guides <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link href="/learn" className="text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
            All Resume & Career Guides <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

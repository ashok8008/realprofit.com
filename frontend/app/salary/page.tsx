import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, TrendingUp, MapPin, Briefcase } from "lucide-react";
import { JOBS } from "@/data/pseo/jobs";
import { CITIES } from "@/data/pseo/cities";
import { SALARY_DATA, SALARY_DATA_VINTAGE } from "@/data/pseo/salary-data";

export const metadata: Metadata = {
  title: "US Salary Database — Real Pay by Job & City | RealProfits",
  description: `Compare median, entry, and senior salaries for ${JOBS.length} top jobs across ${CITIES.length} major US metros. Sourced from ${SALARY_DATA_VINTAGE} data, adjusted for cost of living.`,
  alternates: { canonical: "/salary" },
};

export default function SalaryHub() {
  // Pre-compute job-level national median for the table
  const jobsWithNational = JOBS.map((j) => {
    const sampleRecord = Object.values(SALARY_DATA).find((r) => r.jobSlug === j.slug);
    return { ...j, nationalMedian: sampleRecord?.nationalMedian ?? 0 };
  }).sort((a, b) => b.nationalMedian - a.nationalMedian);

  // Group jobs by category for browse-by-category section
  const categories: Record<string, typeof JOBS> = {};
  for (const j of JOBS) {
    if (!categories[j.category]) categories[j.category] = [];
    categories[j.category].push(j);
  }
  const categoryLabels: Record<string, string> = {
    tech: "Tech & Engineering",
    healthcare: "Healthcare",
    finance: "Finance & Accounting",
    business: "Business & Management",
    creative: "Creative & Design",
    trades: "Skilled Trades",
    education: "Education",
    legal: "Legal",
  };

  return (
    <div className="bg-[#F5F3EE] min-h-screen">
      {/* Hero */}
      <section className="bg-[#0B3D3D] text-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96E] font-semibold mb-3">
            US Salary database
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            How much does <span className="text-[#C8A96E]">your job</span> pay in <span className="text-[#C8A96E]">your city</span>?
          </h1>
          <p className="text-lg text-stone-300 max-w-2xl">
            Median, entry-level and senior salaries for {JOBS.length} top jobs across {CITIES.length} major US metros — sourced from {SALARY_DATA_VINTAGE} data and adjusted for cost of living.
          </p>
          <div className="flex flex-wrap gap-3 mt-7 text-sm">
            <Link href="/calculators/paycheck-calculator" data-testid="salary-hub-paycheck-cta"
                  className="inline-flex items-center gap-2 px-5 py-3 font-bold text-[#0B3D3D] bg-[#C8A96E] rounded-md hover:bg-[#D4B780] transition-colors">
              Paycheck calculator <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/career-tools/am-i-underpaid" data-testid="salary-hub-underpaid-cta"
                  className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white border border-white/30 rounded-md hover:bg-white/10 transition-colors">
              Am I underpaid? <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by job (sorted by national median) */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex items-center gap-2 mb-6">
          <Briefcase className="w-5 h-5 text-[#0B3D3D]" />
          <h2 className="text-2xl font-semibold text-stone-900">Browse by job title</h2>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-600">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Job title</th>
                <th className="text-right py-3 px-4 font-semibold hidden sm:table-cell">National median</th>
                <th className="text-right py-3 px-4 font-semibold hidden md:table-cell">10-yr growth</th>
                <th className="text-right py-3 px-4 font-semibold">By city</th>
              </tr>
            </thead>
            <tbody>
              {jobsWithNational.map((j, i) => (
                <tr key={j.slug} className={i % 2 ? "bg-stone-50/40" : ""}>
                  <td className="py-3 px-4">
                    <Link href={`/salary/${j.slug}`} data-testid={`salary-hub-job-${j.slug}`}
                          className="font-semibold text-stone-900 hover:text-[#0B3D3D] hover:underline">
                      {j.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-[#0B3D3D] hidden sm:table-cell">
                    ${j.nationalMedian.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-stone-600 hidden md:table-cell">
                    +{j.growthPct}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/salary/${j.slug}`}
                          className="text-xs font-semibold text-[#0B3D3D] hover:underline">
                      View {CITIES.length} cities →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Browse by city */}
      <section className="max-w-6xl mx-auto px-6 pb-14">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-5 h-5 text-[#0B3D3D]" />
          <h2 className="text-2xl font-semibold text-stone-900">Browse by city</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CITIES.map((c) => (
            <Link key={c.slug} href={`/salary/in/${c.slug}`} data-testid={`salary-hub-city-${c.slug}`}
                  className="bg-white border border-stone-200 rounded-lg p-4 hover:border-[#0B3D3D] hover:shadow-sm transition-all">
              <div className="text-sm font-semibold text-stone-900">{c.name}, {c.stateAbbr}</div>
              <div className="text-[11px] text-stone-500 mt-1">COL index {c.colIndex}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by category */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-[#0B3D3D]" />
          <h2 className="text-2xl font-semibold text-stone-900">Browse by industry</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(categories).map(([cat, jobs]) => (
            <div key={cat} className="bg-white border border-stone-200 rounded-xl p-6">
              <div className="text-xs uppercase tracking-wider text-[#C8A96E] font-semibold mb-3">
                {categoryLabels[cat] || cat}
              </div>
              <ul className="space-y-1.5">
                {jobs.map((j) => (
                  <li key={j.slug}>
                    <Link href={`/salary/${j.slug}`}
                          className="text-sm text-stone-700 hover:text-[#0B3D3D] hover:underline">
                      {j.title} salary
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Data note */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-[#FAF5EE] border border-[#C8A96E]/40 rounded-xl p-6 text-sm text-stone-700 leading-relaxed">
          <strong className="text-stone-900">About the data:</strong> All salaries are derived from the US Bureau of Labor Statistics Occupational Employment and Wage Statistics (OEWS) program — {SALARY_DATA_VINTAGE}. National medians are reported directly; city-level figures apply BLS-published metro wage premiums. Year-over-year change reflects the most recent OEWS release. Numbers are pre-tax and exclude benefits, equity and bonuses.
        </div>
      </section>
    </div>
  );
}

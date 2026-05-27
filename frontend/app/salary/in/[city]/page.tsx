import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MapPin, TrendingUp, Briefcase } from "lucide-react";
import { JOBS } from "@/data/pseo/jobs";
import { CITIES, getCity } from "@/data/pseo/cities";
import { getSalary, SALARY_DATA_VINTAGE } from "@/data/pseo/salary-data";

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const c = getCity(city);
  if (!c) return { title: "City salaries" };
  return {
    title: `Salaries in ${c.name}, ${c.stateAbbr} — Average Pay by Job (2026) | RealProfits`,
    description: `Compare median salaries for ${JOBS.length} top jobs in ${c.name}, ${c.stateAbbr}. Cost-of-living index ${c.colIndex}. Latest BLS OEWS ${SALARY_DATA_VINTAGE} data.`,
    keywords: `${c.name.toLowerCase()} salaries, average salary ${c.name.toLowerCase()}, jobs in ${c.name.toLowerCase()}, ${c.name.toLowerCase()} pay`,
    alternates: { canonical: `/salary/in/${c.slug}` },
    openGraph: {
      title: `Average salaries in ${c.name}, ${c.stateAbbr}`,
      description: `Median pay for ${JOBS.length} top jobs in ${c.name}. BLS data + COL adjustments.`,
    },
  };
}

export default async function CityHubPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const c = getCity(city);
  if (!c) notFound();

  // Build job-pay rows for this city, sorted by median
  const rows = JOBS.map((j) => ({
    job: j,
    rec: getSalary(j.slug, c.slug)!,
  })).sort((a, b) => b.rec.median - a.rec.median);

  const topJob = rows[0];
  const overallAvg = Math.round(rows.reduce((s, r) => s + r.rec.median, 0) / rows.length / 100) * 100;

  // Related (nearest) cities — just the other CITIES, sorted by COL diff
  const otherCities = CITIES.filter((x) => x.slug !== c.slug)
    .sort((a, b) => Math.abs(a.colIndex - c.colIndex) - Math.abs(b.colIndex - c.colIndex))
    .slice(0, 6);

  const faqs = [
    { q: `What is the average salary in ${c.name}, ${c.stateAbbr}?`, a: `Across the ${JOBS.length} most common jobs we track, the average median salary in ${c.name} is around $${overallAvg.toLocaleString()} per year. Pay varies significantly by occupation, with ${topJob.job.title}s earning the most at $${topJob.rec.median.toLocaleString()}.` },
    { q: `Which job pays the most in ${c.name}?`, a: `Of the jobs we cover, ${topJob.job.title} is the highest-paying at a median of $${topJob.rec.median.toLocaleString()} per year in ${c.name}.` },
    { q: `Is ${c.name} a high cost-of-living city?`, a: `${c.name} has a cost-of-living index of ${c.colIndex} (vs the US average of 100). ${c.colIndex > 130 ? "That's significantly above the national average — housing is typically the largest driver." : c.colIndex > 110 ? "That's moderately above the national average." : c.colIndex < 100 ? "That's below the national average, giving residents better purchasing power." : "That's roughly in line with the national average."}` },
    { q: `Does ${c.stateAbbr} have a state income tax?`, a: c.marketSummary.includes("no state income tax") ? `${c.state} has no state income tax — which boosts take-home pay significantly vs cities in California or New York.` : `${c.state} levies a state income tax. Use the paycheck calculator below for an exact net-pay estimate.` },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://realprofits.com" },
      { "@type": "ListItem", position: 2, name: "Salary", item: "https://realprofits.com/salary" },
      { "@type": "ListItem", position: 3, name: c.name, item: `https://realprofits.com/salary/in/${c.slug}` },
    ],
  };

  return (
    <div className="bg-[#F5F3EE] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <nav className="max-w-6xl mx-auto px-6 pt-6 text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-800">Home</Link> ·{" "}
        <Link href="/salary" className="hover:text-stone-800">Salary</Link> ·{" "}
        <span className="text-stone-800">{c.name}, {c.stateAbbr}</span>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96E] font-semibold mb-3">
          City salary report
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight max-w-3xl">
          Average salaries in {c.name}, {c.stateAbbr}
        </h1>
        <p className="text-base text-stone-600 mt-4 max-w-3xl leading-relaxed">
          {c.marketSummary} The {JOBS.length} jobs below average about <strong className="text-[#0B3D3D]">${overallAvg.toLocaleString()}</strong> per year in {c.name} — cost-of-living index <strong>{c.colIndex}</strong>.
        </p>
      </section>

      {/* Quick stats */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500">Metro population</div>
            <div className="text-xl font-bold text-stone-900 mt-1">{c.population.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500">COL index</div>
            <div className="text-xl font-bold text-stone-900 mt-1">{c.colIndex}</div>
            <div className="text-[10px] text-stone-500 mt-1">(US avg = 100)</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500">Avg job pays</div>
            <div className="text-xl font-bold text-[#0B3D3D] mt-1">${overallAvg.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500">BLS metro code</div>
            <div className="text-xl font-bold text-stone-900 mt-1">{c.msaCode}</div>
          </div>
        </div>
      </section>

      {/* Job table */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <h2 className="text-2xl font-semibold text-stone-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#0B3D3D]" /> Salary by job in {c.name}
        </h2>
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-600">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Job</th>
                <th className="text-right py-3 px-4 font-semibold">Median</th>
                <th className="text-right py-3 px-4 font-semibold hidden sm:table-cell">Entry</th>
                <th className="text-right py-3 px-4 font-semibold hidden md:table-cell">Senior</th>
                <th className="text-right py-3 px-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ job, rec }, i) => (
                <tr key={job.slug} className={i % 2 ? "bg-stone-50/40" : ""}>
                  <td className="py-3 px-4">
                    <Link href={`/salary/${job.slug}/${c.slug}`} data-testid={`city-hub-job-${job.slug}`}
                          className="font-semibold text-stone-900 hover:text-[#0B3D3D] hover:underline">
                      {job.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-[#0B3D3D]">${rec.median.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-stone-700 hidden sm:table-cell">${rec.entry.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-stone-700 hidden md:table-cell">${rec.senior.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/salary/${job.slug}/${c.slug}`} className="text-xs font-semibold text-[#0B3D3D] hover:underline">View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Other cities */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <h2 className="text-2xl font-semibold text-stone-900 mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#0B3D3D]" /> Similar cities to compare
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {otherCities.map((oc) => (
            <Link key={oc.slug} href={`/salary/in/${oc.slug}`}
                  className="bg-white border border-stone-200 rounded-lg p-4 hover:border-[#0B3D3D] hover:shadow-sm transition-all">
              <div className="text-sm font-semibold text-stone-900">{oc.name}, {oc.stateAbbr}</div>
              <div className="text-[11px] text-stone-500 mt-1">COL {oc.colIndex}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">FAQ — {c.name} salaries</h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="bg-white border border-stone-200 rounded-lg p-5 group">
              <summary className="cursor-pointer font-semibold text-stone-900 list-none flex justify-between items-center">
                {f.q}<span className="text-stone-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-stone-700 mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0B3D3D] text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-3">Run the numbers for your job in {c.name}</h2>
          <p className="text-stone-300 mb-7 max-w-xl mx-auto">
            Use our free paycheck calculator to see exactly what your take-home pay would look like.
          </p>
          <Link href={`/calculators/paycheck-calculator?state=${c.stateSlug}`}
                className="inline-block px-8 py-3.5 text-base font-bold text-[#0B3D3D] bg-[#C8A96E] rounded-md hover:bg-[#D4B780] transition-colors">
            Paycheck calculator →
          </Link>
        </div>
      </section>
    </div>
  );
}

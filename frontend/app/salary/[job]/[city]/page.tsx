import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MapPin, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { JOBS, getJob } from "@/data/pseo/jobs";
import { CITIES, getCity } from "@/data/pseo/cities";
import { getSalary, SALARY_DATA_VINTAGE } from "@/data/pseo/salary-data";

export function generateStaticParams() {
  const params: { job: string; city: string }[] = [];
  for (const j of JOBS) {
    for (const c of CITIES) {
      params.push({ job: j.slug, city: c.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ job: string; city: string }> }): Promise<Metadata> {
  const { job, city } = await params;
  const j = getJob(job);
  const c = getCity(city);
  if (!j || !c) return { title: "Salary" };
  const rec = getSalary(j.slug, c.slug);
  if (!rec) return { title: "Salary" };
  return {
    title: `${j.title} Salary in ${c.name}, ${c.stateAbbr} — $${rec.median.toLocaleString()} Median (2026)`,
    description: `${j.title}s in ${c.name} earn a median of $${rec.median.toLocaleString()}/yr (entry $${rec.entry.toLocaleString()}, senior $${rec.senior.toLocaleString()}). Compare to national average, cost of living, and similar roles.`,
    keywords: `${j.title.toLowerCase()} salary ${c.name.toLowerCase()}, ${j.title.toLowerCase()} pay ${c.stateAbbr}, ${c.name.toLowerCase()} ${j.title.toLowerCase()} jobs, ${j.title.toLowerCase()} salary by city`,
    alternates: { canonical: `/salary/${j.slug}/${c.slug}` },
    openGraph: {
      title: `${j.title} salary in ${c.name} — $${rec.median.toLocaleString()} median`,
      description: `Compare ${j.title} pay in ${c.name} vs national average. Cost-of-living adjusted.`,
    },
  };
}

function fmt(n: number): string {
  return `$${n.toLocaleString()}`;
}

export default async function SalaryLeafPage({ params }: { params: Promise<{ job: string; city: string }> }) {
  const { job, city } = await params;
  const j = getJob(job);
  const c = getCity(city);
  if (!j || !c) notFound();
  const rec = getSalary(j.slug, c.slug);
  if (!rec) notFound();

  // Cost-of-living adjusted equivalent (real purchasing power vs national avg col=100)
  const colAdjusted = Math.round((rec.median * 100) / c.colIndex / 100) * 100;
  const diffNational = ((rec.median - rec.nationalMedian) / rec.nationalMedian) * 100;

  // Similar jobs in same city (same category)
  const relatedJobs = JOBS.filter((x) => x.category === j.category && x.slug !== j.slug).slice(0, 5)
    .map((x) => ({ job: x, rec: getSalary(x.slug, c.slug)! }));

  // Same job, other cities (top 5 by salary, excluding current)
  const relatedCities = CITIES.filter((x) => x.slug !== c.slug)
    .map((x) => ({ city: x, rec: getSalary(j.slug, x.slug)! }))
    .sort((a, b) => b.rec.median - a.rec.median)
    .slice(0, 5);

  // 5-year deterministic trend (simulate based on yoyChange — pure visualization, no extrapolation claims)
  const yearsBack = 4;
  const trend = Array.from({ length: yearsBack + 1 }, (_, i) => {
    const yearsAgo = yearsBack - i;
    const factor = Math.pow(1 + rec.yoyChange / 100, -yearsAgo);
    return {
      year: new Date().getFullYear() - yearsAgo,
      value: Math.round((rec.median * factor) / 100) * 100,
    };
  });
  const trendMax = Math.max(...trend.map((t) => t.value));

  const faqs = [
    {
      q: `How much does a ${j.title} make in ${c.name}, ${c.stateAbbr}?`,
      a: `${j.title}s in ${c.name} earn a median of $${rec.median.toLocaleString()} per year — ${diffNational >= 0 ? "about " + diffNational.toFixed(0) + "% above" : "about " + Math.abs(diffNational).toFixed(0) + "% below"} the national average of $${rec.nationalMedian.toLocaleString()}.`,
    },
    {
      q: `What's the entry-level ${j.title} salary in ${c.name}?`,
      a: `Entry-level ${j.title}s in ${c.name} typically earn around $${rec.entry.toLocaleString()} per year. Salaries scale to about $${rec.senior.toLocaleString()} at the senior level with 8+ years of experience.`,
    },
    {
      q: `Is $${rec.median.toLocaleString()} a good ${j.title} salary in ${c.name}?`,
      a: `$${rec.median.toLocaleString()} is the median, meaning half of ${j.title}s in ${c.name} earn more and half earn less. Adjusted for the city's cost-of-living index of ${c.colIndex}, that's roughly $${colAdjusted.toLocaleString()} in nationally-equivalent purchasing power.`,
    },
    {
      q: `How fast is ${j.title} pay growing in ${c.name}?`,
      a: `${j.title} salaries in ${c.name} grew about ${rec.yoyChange.toFixed(1)}% year-over-year in the latest BLS data. The 10-year national outlook for this role is +${j.growthPct}%.`,
    },
    {
      q: `Where do ${j.title}s in ${c.name} get paid the most?`,
      a: `The 90th percentile ${j.title} salary in ${c.name} is around $${rec.p90.toLocaleString()}. These typically include senior, lead, or specialist roles at major employers.`,
    },
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
      { "@type": "ListItem", position: 3, name: `${j.title} salary`, item: `https://realprofits.com/salary/${j.slug}` },
      { "@type": "ListItem", position: 4, name: c.name, item: `https://realprofits.com/salary/${j.slug}/${c.slug}` },
    ],
  };

  return (
    <div className="bg-[#F5F3EE] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <nav className="max-w-6xl mx-auto px-6 pt-6 text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-800">Home</Link> ·{" "}
        <Link href="/salary" className="hover:text-stone-800">Salary</Link> ·{" "}
        <Link href={`/salary/${j.slug}`} className="hover:text-stone-800">{j.title}</Link> ·{" "}
        <span className="text-stone-800">{c.name}</span>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96E] font-semibold mb-3">
          Salary report · {c.name}, {c.stateAbbr}
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight max-w-3xl">
          What is the average {j.title} salary in {c.name}, {c.stateAbbr}?
        </h1>
        <p className="text-base text-stone-600 mt-4 max-w-2xl leading-relaxed">
          {j.title}s in {c.name} earn a median of <strong className="text-[#0B3D3D]">${rec.median.toLocaleString()}</strong> per year — {diffNational >= 0 ? "about " + diffNational.toFixed(0) + "% above" : "about " + Math.abs(diffNational).toFixed(0) + "% below"} the national average. Pay ranges from ${rec.p25.toLocaleString()} (25th percentile) to ${rec.p90.toLocaleString()} (90th percentile).
        </p>
      </section>

      {/* Big answer card */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">25th percentile</div>
              <div className="text-xl font-bold text-stone-900 mt-1">{fmt(rec.p25)}</div>
            </div>
            <div className="bg-[#FAF5EE] -m-2 p-3 rounded-lg border border-[#C8A96E]/40">
              <div className="text-[10px] uppercase tracking-wider text-[#0B3D3D]">Median</div>
              <div className="text-xl font-bold text-[#0B3D3D] mt-1">{fmt(rec.median)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">75th percentile</div>
              <div className="text-xl font-bold text-stone-900 mt-1">{fmt(rec.p75)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">90th percentile</div>
              <div className="text-xl font-bold text-stone-900 mt-1">{fmt(rec.p90)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">YoY change</div>
              <div className={`text-xl font-bold mt-1 ${rec.yoyChange >= 0 ? "text-[#2A6B45]" : "text-rose-600"}`}>
                {rec.yoyChange >= 0 ? "+" : ""}{rec.yoyChange.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* By experience */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <h2 className="text-2xl font-semibold text-stone-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#0B3D3D]" /> {j.title} salary by experience level
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <div className="text-[10px] uppercase tracking-wider text-stone-500">Entry · 0–2 yrs</div>
            <div className="text-xl font-bold text-stone-900 mt-1">{fmt(rec.entry)}</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <div className="text-[10px] uppercase tracking-wider text-stone-500">Mid · 3–5 yrs</div>
            <div className="text-xl font-bold text-stone-900 mt-1">{fmt(rec.median)}</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <div className="text-[10px] uppercase tracking-wider text-stone-500">Senior · 6–8 yrs</div>
            <div className="text-xl font-bold text-stone-900 mt-1">{fmt(rec.p75)}</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-lg p-5">
            <div className="text-[10px] uppercase tracking-wider text-stone-500">Lead · 8+ yrs</div>
            <div className="text-xl font-bold text-stone-900 mt-1">{fmt(rec.senior)}</div>
          </div>
        </div>
      </section>

      {/* Comparison bars */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <h2 className="text-2xl font-semibold text-stone-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#0B3D3D]" /> How {c.name} pay compares
        </h2>
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
          {[
            { label: `${c.name} median`, value: rec.median, accent: true },
            { label: "National median", value: rec.nationalMedian, accent: false },
            { label: "Cost-of-living adjusted", value: colAdjusted, accent: false, note: `COL index ${c.colIndex}` },
          ].map((row) => {
            const max = Math.max(rec.median, rec.nationalMedian, colAdjusted);
            const pct = (row.value / max) * 100;
            return (
              <div key={row.label}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-sm font-medium text-stone-800">{row.label}{row.note ? <span className="text-stone-400 text-xs ml-1">({row.note})</span> : null}</span>
                  <span className={`text-sm font-bold ${row.accent ? "text-[#0B3D3D]" : "text-stone-700"}`}>
                    ${row.value.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div className={`h-full ${row.accent ? "bg-[#C8A96E]" : "bg-[#0B3D3D]/70"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-stone-500 mt-3 leading-relaxed">
          Cost-of-living adjusted is the {c.name} salary translated into equivalent purchasing power vs the US average (COL index 100). Useful for comparing offers across cities.
        </p>
      </section>

      {/* 5-year trend */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <h2 className="text-2xl font-semibold text-stone-900 mb-4">5-year salary trend</h2>
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-end gap-3 h-40">
            {trend.map((t) => (
              <div key={t.year} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs font-semibold text-stone-700">${(t.value / 1000).toFixed(0)}K</div>
                <div className="w-full bg-stone-100 rounded-t-md" style={{ height: `${(t.value / trendMax) * 100}%`, minHeight: "30px" }}>
                  <div className="w-full h-full bg-gradient-to-t from-[#0B3D3D] to-[#1E5757] rounded-t-md" />
                </div>
                <div className="text-[11px] text-stone-500">{t.year}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-500 mt-4">Trend extrapolated from BLS {SALARY_DATA_VINTAGE} OEWS data using the latest year-over-year growth rate of {rec.yoyChange.toFixed(1)}%.</p>
        </div>
      </section>

      {/* Market context */}
      <section className="max-w-6xl mx-auto px-6 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#0B3D3D]" /> {j.title} job market in {c.name}
          </h2>
          <p className="text-stone-700 leading-relaxed mb-4">{c.marketSummary}</p>
          <p className="text-stone-700 leading-relaxed">
            An estimated <strong className="text-stone-900">{rec.employed.toLocaleString()}</strong> {j.title.toLowerCase()}s work in the {c.name} metro. Daily responsibilities typically include:
          </p>
          <ul className="space-y-2 text-sm text-stone-700 list-disc pl-5 mt-3">
            {j.dailyTasks.map((t, i) => (<li key={i}>{t}</li>))}
          </ul>
        </div>

        <aside className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-[#C8A96E]" />
            <h3 className="text-base font-semibold text-stone-900">Quick stats</h3>
          </div>
          <ul className="space-y-3 text-sm text-stone-700">
            <li><span className="text-stone-500">City:</span> <strong className="text-stone-900">{c.name}, {c.stateAbbr}</strong></li>
            <li><span className="text-stone-500">Metro population:</span> <strong className="text-stone-900">{c.population.toLocaleString()}</strong></li>
            <li><span className="text-stone-500">COL index:</span> <strong className="text-stone-900">{c.colIndex}</strong> (US avg = 100)</li>
            <li><span className="text-stone-500">BLS occupation code:</span> <strong className="text-stone-900">{j.socCode}</strong></li>
            <li><span className="text-stone-500">10-yr growth:</span> <strong className="text-[#2A6B45]">+{j.growthPct}%</strong></li>
          </ul>
          <Link href={`/calculators/paycheck-calculator?annual=${rec.median}&state=${c.stateSlug}`}
                className="block w-full text-center mt-4 px-4 py-2.5 text-xs font-bold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252] transition-colors">
            Paycheck calculator
          </Link>
        </aside>
      </section>

      {/* Related jobs same city */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">Related job salaries in {c.name}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {relatedJobs.map(({ job: rj, rec: rr }) => (
            <Link key={rj.slug} href={`/salary/${rj.slug}/${c.slug}`}
                  className="bg-white border border-stone-200 rounded-lg p-4 hover:border-[#0B3D3D] hover:shadow-sm transition-all">
              <div className="text-sm font-semibold text-stone-900">{rj.title}</div>
              <div className="text-xs text-[#0B3D3D] font-semibold mt-1">${rr.median.toLocaleString()}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Same job, other cities */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">{j.title} salary in other cities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {relatedCities.map(({ city: rc, rec: rr }) => (
            <Link key={rc.slug} href={`/salary/${j.slug}/${rc.slug}`}
                  className="bg-white border border-stone-200 rounded-lg p-4 hover:border-[#0B3D3D] hover:shadow-sm transition-all">
              <div className="text-sm font-semibold text-stone-900">{rc.name}, {rc.stateAbbr}</div>
              <div className="text-xs text-[#0B3D3D] font-semibold mt-1">${rr.median.toLocaleString()}</div>
            </Link>
          ))}
        </div>
        <div className="mt-4">
          <Link href={`/salary/${j.slug}`} className="text-sm font-semibold text-[#0B3D3D] hover:underline inline-flex items-center gap-1">
            View all {CITIES.length} cities for {j.title} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">FAQ</h2>
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
          <h2 className="text-3xl font-bold mb-3">Are you being paid fairly in {c.name}?</h2>
          <p className="text-stone-300 mb-7 max-w-xl mx-auto">
            Run a free comparison against BLS data — see if your salary is below, at, or above the {c.name} median.
          </p>
          <Link href="/career-tools/am-i-underpaid" data-testid={`salary-leaf-cta-${j.slug}-${c.slug}`}
                className="inline-block px-8 py-3.5 text-base font-bold text-[#0B3D3D] bg-[#C8A96E] rounded-md hover:bg-[#D4B780] transition-colors">
            Check my salary →
          </Link>
        </div>
      </section>
    </div>
  );
}

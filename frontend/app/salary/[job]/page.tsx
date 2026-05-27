import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MapPin, TrendingUp, Briefcase, Award } from "lucide-react";
import { JOBS, getJob } from "@/data/pseo/jobs";
import { CITIES } from "@/data/pseo/cities";
import { getSalary, SALARY_DATA_VINTAGE } from "@/data/pseo/salary-data";

export function generateStaticParams() {
  return JOBS.map((j) => ({ job: j.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ job: string }> }): Promise<Metadata> {
  const { job } = await params;
  const j = getJob(job);
  if (!j) return { title: "Salary" };
  const national = getSalary(j.slug, "new-york-ny")?.nationalMedian ?? 0;
  return {
    title: `${j.title} Salary in 2026 — Average Pay & Top-Paying Cities | RealProfits`,
    description: `${j.title}s earn a national median of $${national.toLocaleString()}. See pay by city, experience level, and 10-year growth outlook (+${j.growthPct}%).`,
    keywords: `${j.title.toLowerCase()} salary, ${j.title.toLowerCase()} pay, average ${j.title.toLowerCase()} salary, ${j.title.toLowerCase()} income`,
    alternates: { canonical: `/salary/${j.slug}` },
    openGraph: {
      title: `${j.title} Salary by City — 2026 Pay Data`,
      description: `National median $${national.toLocaleString()}. Compare ${j.title} pay across ${CITIES.length} major US metros.`,
    },
  };
}

export default async function JobHubPage({ params }: { params: Promise<{ job: string }> }) {
  const { job } = await params;
  const j = getJob(job);
  if (!j) notFound();

  // Build sorted city data
  const cityRecords = CITIES.map((c) => ({
    city: c,
    rec: getSalary(j.slug, c.slug)!,
  })).sort((a, b) => b.rec.median - a.rec.median);

  const national = cityRecords[0].rec.nationalMedian;
  const topCity = cityRecords[0];
  const bottomCity = cityRecords[cityRecords.length - 1];

  // Related jobs in same category
  const related = JOBS.filter((x) => x.category === j.category && x.slug !== j.slug).slice(0, 5);

  const faqs = [
    { q: `What is the average ${j.title} salary in the United States?`, a: `The national median ${j.title} salary is $${national.toLocaleString()} per year, based on the latest BLS OEWS data (${SALARY_DATA_VINTAGE}).` },
    { q: `Which US city pays ${j.title}s the most?`, a: `${topCity.city.name}, ${topCity.city.stateAbbr} currently pays the highest at a median of $${topCity.rec.median.toLocaleString()}/yr — roughly ${Math.round(((topCity.rec.median - national) / national) * 100)}% above the national average. Adjust for cost of living before deciding to relocate.` },
    { q: `How much does an entry-level ${j.title} make?`, a: `Entry-level ${j.title}s typically earn around $${topCity.rec.entry.toLocaleString()} in top-paying metros and ${(bottomCity.rec.entry / national * 100).toFixed(0)}% of the median nationally.` },
    { q: `How fast is the ${j.title} job market growing?`, a: `The Bureau of Labor Statistics projects ${j.growthPct >= 10 ? "much faster than average" : j.growthPct >= 5 ? "faster than average" : "about average"} growth of +${j.growthPct}% over the next 10 years.` },
    { q: `Do I need a degree to be a ${j.title}?`, a: j.entryPath },
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
    ],
  };

  return (
    <div className="bg-[#F5F3EE] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <nav className="max-w-6xl mx-auto px-6 pt-6 text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-800">Home</Link> ·{" "}
        <Link href="/salary" className="hover:text-stone-800">Salary</Link> ·{" "}
        <span className="text-stone-800">{j.title}</span>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96E] font-semibold mb-3">
          Salary report · {j.title}s
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight max-w-3xl">
          How much does a {j.title} make in 2026?
        </h1>
        <p className="text-base text-stone-600 mt-4 max-w-2xl leading-relaxed">
          The national median {j.title} salary is <strong className="text-[#0B3D3D]">${national.toLocaleString()}</strong> per year. {j.description}
        </p>
      </section>

      {/* Answer box */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500">National median</div>
            <div className="text-2xl font-bold text-[#0B3D3D] mt-1">${national.toLocaleString()}</div>
            <div className="text-[11px] text-stone-500 mt-1">Per year</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500">Entry level</div>
            <div className="text-2xl font-bold text-stone-900 mt-1">${Math.round(national * 0.65).toLocaleString()}</div>
            <div className="text-[11px] text-stone-500 mt-1">0–2 years</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500">Senior</div>
            <div className="text-2xl font-bold text-stone-900 mt-1">${Math.round(national * 1.45).toLocaleString()}</div>
            <div className="text-[11px] text-stone-500 mt-1">8+ years</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-500">10-yr growth</div>
            <div className="text-2xl font-bold text-stone-900 mt-1">+{j.growthPct}%</div>
            <div className="text-[11px] text-stone-500 mt-1">BLS projection</div>
          </div>
        </div>
      </section>

      {/* By city table */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <h2 className="text-2xl font-semibold text-stone-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#0B3D3D]" /> {j.title} salary by city
        </h2>
        <p className="text-sm text-stone-600 mb-6">
          Median pay across {CITIES.length} major US metros — sorted by highest to lowest. Click any city for a full breakdown.
        </p>
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-600">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">City</th>
                <th className="text-right py-3 px-4 font-semibold">Median</th>
                <th className="text-right py-3 px-4 font-semibold hidden sm:table-cell">vs national</th>
                <th className="text-right py-3 px-4 font-semibold hidden md:table-cell">COL index</th>
                <th className="text-right py-3 px-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {cityRecords.map(({ city, rec }, i) => {
                const diff = ((rec.median - national) / national) * 100;
                return (
                  <tr key={city.slug} className={i % 2 ? "bg-stone-50/40" : ""}>
                    <td className="py-3 px-4">
                      <Link href={`/salary/${j.slug}/${city.slug}`} data-testid={`job-hub-city-${city.slug}`}
                            className="font-semibold text-stone-900 hover:text-[#0B3D3D] hover:underline">
                        {city.name}, {city.stateAbbr}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-[#0B3D3D]">${rec.median.toLocaleString()}</td>
                    <td className={`py-3 px-4 text-right hidden sm:table-cell ${diff >= 0 ? "text-[#2A6B45]" : "text-rose-600"}`}>
                      {diff >= 0 ? "+" : ""}{diff.toFixed(0)}%
                    </td>
                    <td className="py-3 px-4 text-right text-stone-600 hidden md:table-cell">{city.colIndex}</td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/salary/${j.slug}/${city.slug}`}
                            className="text-xs font-semibold text-[#0B3D3D] hover:underline">View →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* What they do */}
      <section className="max-w-6xl mx-auto px-6 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#0B3D3D]" /> What does a {j.title} do?
          </h2>
          <p className="text-stone-700 leading-relaxed mb-4">{j.description}</p>
          <ul className="space-y-2 text-sm text-stone-700 list-disc pl-5">
            {j.dailyTasks.map((t, i) => (<li key={i}>{t}</li>))}
          </ul>
          <h3 className="text-lg font-semibold text-stone-900 mt-8 mb-3">How to become a {j.title}</h3>
          <p className="text-stone-700 leading-relaxed">{j.entryPath}</p>
        </div>

        <aside className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-[#C8A96E]" />
            <h3 className="text-base font-semibold text-stone-900">Career outlook</h3>
          </div>
          <ul className="space-y-3 text-sm text-stone-700">
            <li><span className="text-stone-500">BLS occupation code:</span> <strong className="text-stone-900">{j.socCode}</strong></li>
            <li><span className="text-stone-500">Education typically required:</span> <strong className="text-stone-900">{j.educationYears}+ years</strong></li>
            <li><span className="text-stone-500">10-year growth:</span> <strong className="text-[#2A6B45]">+{j.growthPct}%</strong></li>
            <li><span className="text-stone-500">Category:</span> <strong className="text-stone-900 capitalize">{j.category}</strong></li>
          </ul>
          <Link href="/career-tools/am-i-underpaid" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B3D3D] mt-4 hover:underline">
            Am I underpaid? <ArrowRight className="w-3 h-3" />
          </Link>
        </aside>
      </section>

      {/* Related jobs */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-10">
          <h2 className="text-2xl font-semibold text-stone-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0B3D3D]" /> Related job salaries
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/salary/${r.slug}`}
                    className="bg-white border border-stone-200 rounded-lg p-4 hover:border-[#0B3D3D] hover:shadow-sm transition-all">
                <div className="text-sm font-semibold text-stone-900">{r.title}</div>
                <div className="text-xs text-stone-500 mt-1">+{r.growthPct}% 10-yr growth</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">FAQ — {j.title} salary</h2>
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
          <h2 className="text-3xl font-bold mb-3">Are you being paid fairly?</h2>
          <p className="text-stone-300 mb-7 max-w-xl mx-auto">
            Run a free comparison against {CITIES.length}+ metros and the latest BLS data.
          </p>
          <Link href="/career-tools/am-i-underpaid"
                className="inline-block px-8 py-3.5 text-base font-bold text-[#0B3D3D] bg-[#C8A96E] rounded-md hover:bg-[#D4B780] transition-colors">
            Check my salary →
          </Link>
        </div>
      </section>
    </div>
  );
}

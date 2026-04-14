import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowRight, CheckCircle, Sparkles, Target, BookOpen } from "lucide-react";
import { findResumeCareerBySlug, getAllResumeCareerSlugs } from "@/lib/pseo/datasets";
import type { ResumeCareerEntry } from "@/lib/pseo/datasets/resumeCareer";
import {
  generateRoleContent, generateScoreContent, generateExperienceContent,
  generateCompanyContent, generateProblemContent, generateDecisionContent,
} from "@/lib/pseo/resumeVariationEngine";
import { buildFAQSchema, buildBreadcrumbSchema } from "@/lib/schemas";

export function generateStaticParams() {
  return getAllResumeCareerSlugs().map((slug) => ({ slug }));
}

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://realprofits.com";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = findResumeCareerBySlug(slug);
  if (!entry) return { title: "Not Found" };

  const desc = entry.title.length > 120 ? entry.title.slice(0, 117) + "..." : entry.title + " — Free tools, templates, and expert tips from RealProfits.";

  return {
    title: entry.title,
    description: desc,
    alternates: { canonical: `${BASE}/learn/${slug}` },
    openGraph: { title: entry.title, description: desc, url: `${BASE}/learn/${slug}`, type: "article", siteName: "RealProfits" },
    twitter: { card: "summary_large_image", title: entry.title, description: desc },
  };
}

function getCTALink(entry: ResumeCareerEntry): { href: string; label: string } {
  if (entry.type === "resume-role" || entry.type === "resume-experience" || entry.type === "resume-company")
    return { href: "/career-tools/resume-builder", label: "Build Your Resume Free" };
  if (entry.type === "resume-score") return { href: "/career-tools/resume-builder", label: "Check Your Resume Score" };
  if (entry.type === "resume-problem") return { href: "/career-tools/resume-builder", label: "Fix Your Resume Now" };
  return { href: "/career-tools", label: "Explore Career Tools" };
}

function getRelatedLinks(entry: ResumeCareerEntry): { href: string; label: string }[] {
  const links: { href: string; label: string }[] = [];
  if (entry.type !== "resume-score") links.push({ href: "/career-tools/resume-builder", label: "AI Resume Builder" });
  links.push({ href: "/career-tools/salary-comparison", label: "Salary Comparison Tool" });
  links.push({ href: "/career-tools/am-i-underpaid", label: "Am I Underpaid?" });
  if (entry.type === "career-decision") links.push({ href: "/calculators/savings-goal-calculator", label: "Savings Goal Calculator" });
  if (entry.type === "resume-role") links.push({ href: "/career-tools/cover-letter-generator", label: "Cover Letter Generator" });
  if (entry.type === "resume-company") links.push({ href: "/career-tools/job-readiness-score", label: "Job Readiness Score" });
  return links.slice(0, 5);
}

export default async function LearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = findResumeCareerBySlug(slug);
  if (!entry) notFound();

  const cta = getCTALink(entry);
  const related = getRelatedLinks(entry);

  // Determine breadcrumb category
  const categoryMap: Record<string, { label: string; href: string }> = {
    "resume-role": { label: "Resume Guides", href: "/learn" },
    "resume-score": { label: "Resume Score", href: "/learn" },
    "resume-experience": { label: "Experience Guides", href: "/learn" },
    "resume-company": { label: "Company Guides", href: "/learn" },
    "resume-problem": { label: "Resume Help", href: "/learn" },
    "career-decision": { label: "Career Decisions", href: "/learn" },
  };
  const cat = categoryMap[entry.type] || { label: "Learn", href: "/learn" };

  // Generate varied content
  let directAnswer = "";
  let keyTakeaways: string[] = [];
  let faqs: { q: string; a: string }[] = [];
  let extraSections: { heading: string; content: string }[] = [];
  let comparisonTable: { range: string; label: string; pct: string; meaning: string }[] | null = null;
  let improvementSteps: string[] | null = null;

  if (entry.type === "resume-role") {
    const c = generateRoleContent(entry);
    directAnswer = c.directAnswer; keyTakeaways = c.keyTakeaways; faqs = c.faqs; extraSections = c.sections;
  } else if (entry.type === "resume-score") {
    const c = generateScoreContent(entry);
    directAnswer = c.directAnswer; keyTakeaways = c.keyTakeaways; faqs = c.faqs;
    comparisonTable = c.comparison; improvementSteps = c.improvementSteps;
  } else if (entry.type === "resume-experience") {
    const c = generateExperienceContent(entry);
    directAnswer = c.directAnswer; keyTakeaways = c.keyTakeaways; faqs = c.faqs;
  } else if (entry.type === "resume-company") {
    const c = generateCompanyContent(entry);
    directAnswer = c.directAnswer; keyTakeaways = c.keyTakeaways; faqs = c.faqs;
  } else if (entry.type === "resume-problem") {
    const c = generateProblemContent(entry);
    directAnswer = c.directAnswer; keyTakeaways = c.keyTakeaways;
    faqs = [
      { q: `How do I fix ${entry.problem} on my resume?`, a: "Start by running your resume through our free ATS checker, then follow the specific recommendations it provides. Most issues can be fixed in under 15 minutes." },
      { q: "Will fixing this improve my interview rate?", a: "Yes. ATS-optimized resumes get 2-5x more callbacks. The fixes we recommend target the exact factors that determine whether your resume gets seen by a human." },
    ];
  } else if (entry.type === "career-decision") {
    const c = generateDecisionContent(entry);
    directAnswer = c.directAnswer; keyTakeaways = c.keyTakeaways;
    faqs = [
      { q: `How do I decide about ${entry.topic}?`, a: "Use data-driven tools: compare salaries, calculate cost of living differences, and assess your career trajectory. Our free calculators remove guesswork from the equation." },
      { q: "What tools can help me decide?", a: "Use our Salary Comparison, Am I Underpaid, and What-If Simulator tools. Together they give you the full picture — financial impact, market data, and scenario planning." },
    ];
  }

  // JSON-LD schemas
  const schemas = [];
  if (faqs.length > 0) {
    schemas.push(buildFAQSchema(faqs.map(f => ({ question: f.q, answer: f.a }))));
  }
  schemas.push(buildBreadcrumbSchema([
    { name: "Home", url: BASE },
    { name: cat.label, url: `${BASE}${cat.href}` },
    { name: entry.title, url: `${BASE}/learn/${slug}` },
  ]));

  return (
    <div className="w-full">
      {/* JSON-LD */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 pt-6 max-w-4xl">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-teal-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={cat.href} className="hover:text-teal-600">{cat.label}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium truncate">{entry.title.slice(0, 50)}</span>
        </nav>
      </div>

      {/* Hero */}
      <article className="container mx-auto px-4 max-w-4xl pb-16">
        <header className="mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-5 leading-tight">{entry.title}</h1>

          {/* Direct Answer (GEO optimized) */}
          <div className="bg-teal-50 border-l-4 border-teal-500 rounded-r-xl p-5 mb-6">
            <p className="text-base text-gray-800 leading-relaxed">{directAnswer}</p>
          </div>

          {/* Key Takeaways */}
          {keyTakeaways.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-600" /> Key Takeaways
              </h2>
              <ul className="space-y-2">
                {keyTakeaways.map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        {/* CTA */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 mb-10 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg mb-1">Ready to take action?</p>
            <p className="text-gray-400 text-sm">Use our free AI-powered tools — no signup required.</p>
          </div>
          <Link href={cta.href} className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-lg px-6 py-3 font-bold text-sm transition-colors flex-shrink-0">
            {cta.label}
          </Link>
        </div>

        {/* Extra sections (role pages have detailed content) */}
        {extraSections.map((sec, i) => (
          <section key={i} className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-3">{sec.heading}</h2>
            <p className="text-gray-700 leading-relaxed">{sec.content}</p>
          </section>
        ))}

        {/* Score comparison table */}
        {comparisonTable && (
          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">How Resume Scores Compare</h2>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Score Range</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Rating</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">% of Resumes</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">What It Means</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonTable.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">{row.range}</td>
                      <td className="px-4 py-3 font-medium">{row.label}</td>
                      <td className="px-4 py-3 text-gray-600">{row.pct}</td>
                      <td className="px-4 py-3 text-gray-600">{row.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Improvement steps */}
        {improvementSteps && (
          <section className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">How to Improve Your Score</h2>
            <ol className="space-y-3">
              {improvementSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 font-bold text-sm flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <span className="text-gray-700 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <section className="mb-10">
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Links (Internal Linking) */}
        <section className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" /> Related Tools & Guides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map((link, i) => (
              <Link key={i} href={link.href} className="flex items-center gap-2 text-sm text-teal-700 hover:text-teal-900 font-medium bg-white border border-gray-200 rounded-lg px-4 py-3 hover:shadow-sm transition-all">
                <ArrowRight className="w-4 h-4" /> {link.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-4">50+ free tools. No signup required.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/career-tools/resume-builder" className="bg-teal-600 text-white hover:bg-teal-700 rounded-lg px-6 py-3 font-bold text-sm transition-colors">
              Build Your Resume
            </Link>
            <Link href="/career-tools/salary-comparison" className="border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-6 py-3 font-bold text-sm transition-colors">
              Compare Your Salary
            </Link>
            <Link href="/calculators" className="border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-6 py-3 font-bold text-sm transition-colors">
              All Calculators
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}

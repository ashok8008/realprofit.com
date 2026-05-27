import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, FileSignature, Check, AlertTriangle, FileText, Lightbulb } from "lucide-react";
import { CONTRACT_TYPES, getContractType } from "@/data/pseo/contracts";
import { INDUSTRIES, getIndustry } from "@/data/pseo/industries";
import { getBaseTemplate } from "@/data/pseo/contract-templates";

export function generateStaticParams() {
  const out: { type: string; industry: string }[] = [];
  for (const c of CONTRACT_TYPES) {
    for (const i of INDUSTRIES) {
      out.push({ type: c.slug, industry: i.slug });
    }
  }
  return out;
}

export async function generateMetadata({ params }: { params: Promise<{ type: string; industry: string }> }): Promise<Metadata> {
  const { type, industry } = await params;
  const c = getContractType(type);
  const i = getIndustry(industry);
  if (!c || !i) return { title: "Contract Template" };
  return {
    title: `Free ${c.name} Template for ${i.plural} — Sign Online Free`,
    description: `${c.shortDesc} Tailored for ${i.plural.toLowerCase()}. Edit and sign online — 100% free, no signup.`,
    keywords: `${c.name.toLowerCase()} for ${i.name.toLowerCase()}, ${i.name.toLowerCase()} ${c.name.toLowerCase()} template, ${c.slug} ${i.slug} contract`,
    alternates: { canonical: `/contract-template/${c.slug}/${i.slug}` },
    openGraph: {
      title: `Free ${c.name} for ${i.plural}`,
      description: `${c.shortDesc} Sign online free.`,
    },
  };
}

// Inject industry-specific copy into the base template
function fillTemplate(text: string, industryName: string): string {
  return text
    .replace(/\{\{INDUSTRY\}\}/g, industryName.toLowerCase())
    .replace(/\{\{CONTRACT_NAME\}\}/g, "");
}

export default async function ContractLeafPage({ params }: { params: Promise<{ type: string; industry: string }> }) {
  const { type, industry } = await params;
  const c = getContractType(type);
  const i = getIndustry(industry);
  if (!c || !i) notFound();

  const baseTpl = getBaseTemplate(c.baseTemplate);

  // Industry-specific FAQ — deterministic, draws on industry traits + contract type
  const isHighRisk = i.traits.includes("high-risk");
  const isRegulated = i.traits.includes("regulated");
  const isCreative = i.traits.includes("creative");

  const faqs: { q: string; a: string }[] = [
    {
      q: `Do ${i.plural.toLowerCase()} really need a ${c.name}?`,
      a: `Yes — and especially in ${i.name.toLowerCase()}, where ${isHighRisk ? "the liability stakes are high" : isCreative ? "intellectual property gets created on every job" : "client relationships are the core asset"}. A signed ${c.name.toLowerCase()} protects both sides if something goes wrong — and most disputes can be solved by simply pointing at the signed contract.`,
    },
    {
      q: `What's different about a ${c.name} for ${i.plural.toLowerCase()}?`,
      a: `Compared to a generic ${c.name.toLowerCase()}, the ${i.name.toLowerCase()} version typically adds clauses around: ${i.considerations.slice(0, 3).join("; ")}.`,
    },
    {
      q: `Is this ${c.name} legally binding once signed?`,
      a: `Yes. Under the federal ESIGN Act and state UETA laws, an electronic signature is just as legally binding as a wet-ink signature for almost all commercial contracts. Our eSign tool produces a SHA-256 audit trail proving who signed, when, and from where — so the contract is defensible in court.`,
    },
    {
      q: `Can I edit this template?`,
      a: `Yes — and you should. The template covers the typical scope, but every ${i.name.toLowerCase()} engagement has unique details (rates, scope, deadlines). Use our eSign tool to drop in your actual project details before sending the contract for signature.`,
    },
    {
      q: `How do I sign this online?`,
      a: `Click "Edit & sign online — free" below. Our eSign tool opens with a blank document; upload your customized contract PDF, drag-drop signature/date fields, and email it to the other party. They sign from any device — no account needed for signers.`,
    },
  ];

  if (isRegulated) {
    faqs.push({
      q: `Are there specific regulatory requirements for ${i.plural.toLowerCase()}?`,
      a: `Yes. ${i.name} are subject to industry-specific regulations that affect contract terms. Always confirm your version complies with applicable licensing rules, disclosure requirements, and consumer protection laws in your state. When in doubt, have a licensed attorney review.`,
    });
  }

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
      { "@type": "ListItem", position: 2, name: "Contract Templates", item: "https://realprofits.com/contract-template" },
      { "@type": "ListItem", position: 3, name: c.name, item: `https://realprofits.com/contract-template/${c.slug}` },
      { "@type": "ListItem", position: 4, name: i.name, item: `https://realprofits.com/contract-template/${c.slug}/${i.slug}` },
    ],
  };

  // 5 related contracts for this industry (not the current one)
  const relatedContracts = CONTRACT_TYPES
    .filter((x) => x.slug !== c.slug && x.audience !== "b2c")
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5);

  return (
    <div className="bg-[#F5F3EE] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <nav className="max-w-6xl mx-auto px-6 pt-6 text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-800">Home</Link> ·{" "}
        <Link href="/contract-template" className="hover:text-stone-800">Contract Templates</Link> ·{" "}
        <Link href={`/contract-template/${c.slug}`} className="hover:text-stone-800">{c.name}</Link> ·{" "}
        <span className="text-stone-800">{i.name}</span>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96E] font-semibold mb-3">
          Contract template · for {i.plural}
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight max-w-3xl">
          Free {c.name} Template for {i.plural}
        </h1>
        <p className="text-base text-stone-600 mt-4 max-w-2xl leading-relaxed">
          {c.longDesc} This version is tailored for {i.name.toLowerCase()} — covering the specific clauses and considerations that matter most in the industry.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href={`/tools/esign/new?from=contract&type=${c.slug}&industry=${i.slug}`}
                data-testid="contract-leaf-cta-esign"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252] transition-colors">
            <FileSignature className="w-4 h-4" /> Edit & sign online — free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href={`/contract-template/${c.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#0B3D3D] border border-[#0B3D3D] rounded-md hover:bg-[#0B3D3D] hover:text-white transition-colors">
            See all {c.name} options
          </Link>
        </div>
      </section>

      {/* Template Preview */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0B3D3D]" />
            <h2 className="text-base font-semibold text-stone-900">{c.name} — Template Preview</h2>
            <span className="ml-auto text-[10px] uppercase tracking-wider text-stone-500">For {i.plural}</span>
          </div>
          <div className="p-8 bg-[#FCFBF7] font-serif text-sm text-stone-800 leading-relaxed max-h-[600px] overflow-y-auto">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-stone-900 uppercase tracking-wide">{c.name}</h3>
              <p className="text-xs text-stone-500 mt-1">For use in {i.name}</p>
            </div>
            {baseTpl.sections.map((s, idx) => (
              <div key={idx} className="mb-5">
                <h4 className="font-bold text-stone-900 mb-2">{s.heading}</h4>
                <p>{fillTemplate(s.body, i.name)}</p>
              </div>
            ))}
            <div className="mt-8 pt-6 border-t border-stone-200 text-xs text-stone-500 italic text-center">
              [Signatures and execution clauses on signing]
            </div>
          </div>
        </div>
      </section>

      {/* Industry-specific considerations */}
      <section className="max-w-6xl mx-auto px-6 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-stone-900 mb-4">Industry-specific considerations for {i.plural.toLowerCase()}</h2>
          <p className="text-stone-700 leading-relaxed mb-5">
            Beyond the standard {c.name.toLowerCase()} clauses, here are the specific items {i.plural.toLowerCase()} typically need to address before signing:
          </p>
          <ul className="space-y-3">
            {i.considerations.map((item, idx) => (
              <li key={idx} className="bg-white border border-stone-200 rounded-lg p-4 flex items-start gap-3">
                <Check className="w-4 h-4 text-[#2A6B45] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-stone-700">{item}</span>
              </li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold text-stone-900 mt-8 mb-3">Typical pricing in {i.name.toLowerCase()}</h3>
          <p className="text-stone-700 leading-relaxed text-sm">{i.pricingExample}</p>
        </div>

        <aside className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-[#C8A96E]" />
            <h3 className="text-base font-semibold text-stone-900">Key clauses</h3>
          </div>
          <ul className="space-y-2 text-sm text-stone-700">
            {c.keyClauses.map((k, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#C8A96E] mt-0.5">•</span>
                <span>{k}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-4 border-t border-stone-200">
            <div className="text-[10px] uppercase tracking-wider text-stone-500">Default term</div>
            <div className="text-sm font-semibold text-stone-900 mt-1">{c.defaultTerm}</div>
          </div>
        </aside>
      </section>

      {/* How to use */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">How to use this template — 3 steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { n: "1", h: "Customize", b: `Use our eSign tool to drop in your real names, dates, scope and fees. The template handles the legal scaffolding; you fill in the specifics for your ${i.name.toLowerCase()} engagement.` },
            { n: "2", h: "Add signature fields", b: "Drag-drop signature, date, initials, and text fields onto the document. Assign each field to the correct signer (yourself, the client, or both)." },
            { n: "3", h: "Send for signature", b: "Enter the other party's name and email, hit Send. They receive a signing link via email — no account required. You get notified the second they sign." },
          ].map((s) => (
            <div key={s.n} className="bg-white border border-stone-200 rounded-xl p-6">
              <div className="text-3xl font-bold text-[#C8A96E]">{s.n}</div>
              <h3 className="text-base font-semibold text-stone-900 mt-3">{s.h}</h3>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Customization tips */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="bg-[#FAF5EE] border border-[#C8A96E]/40 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#C8A96E]" /> Customization tips before you send
          </h2>
          <ul className="space-y-2 text-sm text-stone-700">
            <li>• Replace every <strong>[BRACKETED]</strong> placeholder with real values — names, dates, dollar amounts, percentages.</li>
            <li>• Set the <strong>governing law</strong> to your state — usually where you live or do business.</li>
            <li>• Confirm the <strong>{c.defaultTerm.toLowerCase()}</strong> term length matches your project.</li>
            <li>• If this is a high-stakes contract (over ~$50K, or anything involving {isRegulated ? "regulated activity" : "significant ongoing liability"}), have a licensed attorney in your state spend 30 minutes on a review.</li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">FAQ — {c.name} for {i.plural}</h2>
        <div className="space-y-3">
          {faqs.map((f, idx) => (
            <details key={idx} className="bg-white border border-stone-200 rounded-lg p-5 group">
              <summary className="cursor-pointer font-semibold text-stone-900 list-none flex justify-between items-center">
                {f.q}<span className="text-stone-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-stone-700 mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related contracts */}
      {relatedContracts.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-10">
          <h2 className="text-2xl font-semibold text-stone-900 mb-6">Other contracts {i.plural.toLowerCase()} commonly need</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {relatedContracts.map((r) => (
              <Link key={r.slug} href={`/contract-template/${r.slug}/${i.slug}`}
                    className="bg-white border border-stone-200 rounded-lg p-4 hover:border-[#0B3D3D] hover:shadow-sm transition-all">
                <div className="text-sm font-semibold text-stone-900">{r.name}</div>
                <div className="text-[11px] text-stone-500 mt-1 leading-tight">{r.shortDesc}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <section className="bg-white border-y border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-8 text-xs text-stone-600 leading-relaxed">
          <strong className="text-stone-800">Legal disclaimer:</strong> This template is provided for general informational use only and does not constitute legal advice. RealProfits is not a law firm and does not provide legal services. Contract law varies by state and country; enforceability depends on specifics this template can't anticipate. For high-stakes or regulated matters, consult a licensed attorney in your jurisdiction before signing.
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#0B3D3D] text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to sign?</h2>
          <p className="text-stone-300 mb-7 max-w-xl mx-auto">
            Open the {c.name} in our free eSign tool, customize it for your {i.name.toLowerCase()} engagement, and send it for signature in under 2 minutes.
          </p>
          <Link href={`/tools/esign/new?from=contract&type=${c.slug}&industry=${i.slug}`}
                className="inline-block px-8 py-3.5 text-base font-bold text-[#0B3D3D] bg-[#C8A96E] rounded-md hover:bg-[#D4B780] transition-colors">
            Open in eSign — free →
          </Link>
        </div>
      </section>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, FileSignature, Check } from "lucide-react";
import { CONTRACT_TYPES, getContractType } from "@/data/pseo/contracts";
import { INDUSTRIES } from "@/data/pseo/industries";

export function generateStaticParams() {
  return CONTRACT_TYPES.map((c) => ({ type: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const c = getContractType(type);
  if (!c) return { title: "Contract Template" };
  return {
    title: `Free ${c.name} Template — Sign Online Free`,
    description: `${c.shortDesc} Edit and sign online for free. ${INDUSTRIES.length} industry-specific versions available.`,
    keywords: `${c.name.toLowerCase()} template, free ${c.name.toLowerCase()}, ${c.name.toLowerCase()} pdf, ${c.name.toLowerCase()} sample`,
    alternates: { canonical: `/contract-template/${c.slug}` },
    openGraph: {
      title: `Free ${c.name} Template`,
      description: c.shortDesc,
    },
  };
}

export default async function ContractTypeHub({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const c = getContractType(type);
  if (!c) notFound();

  const related = CONTRACT_TYPES.filter((x) => x.baseTemplate === c.baseTemplate && x.slug !== c.slug);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://realprofits.com" },
      { "@type": "ListItem", position: 2, name: "Contract Templates", item: "https://realprofits.com/contract-template" },
      { "@type": "ListItem", position: 3, name: c.name, item: `https://realprofits.com/contract-template/${c.slug}` },
    ],
  };

  return (
    <div className="bg-[#F5F3EE] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <nav className="max-w-6xl mx-auto px-6 pt-6 text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-800">Home</Link> ·{" "}
        <Link href="/contract-template" className="hover:text-stone-800">Contract Templates</Link> ·{" "}
        <span className="text-stone-800">{c.name}</span>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96E] font-semibold mb-3">
          Contract template · {c.plural}
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight max-w-3xl">
          Free {c.name} Template
        </h1>
        <p className="text-base text-stone-600 mt-4 max-w-3xl leading-relaxed">{c.longDesc}</p>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link href={`/tools/esign/new?from=contract&type=${c.slug}`} data-testid="contract-type-cta-esign"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252] transition-colors">
            <FileSignature className="w-4 h-4" /> Edit & sign online — free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Key clauses */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <h2 className="text-2xl font-semibold text-stone-900 mb-4">What's in a {c.name}?</h2>
        <p className="text-stone-700 leading-relaxed mb-4 max-w-3xl">A typical {c.name.toLowerCase()} covers the following key clauses:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
          {c.keyClauses.map((k, i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-lg p-4 flex items-start gap-2">
              <Check className="w-4 h-4 text-[#2A6B45] mt-0.5 flex-shrink-0" />
              <span className="text-sm text-stone-700">{k}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Industry picker */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <h2 className="text-2xl font-semibold text-stone-900 mb-4">Pick your industry</h2>
        <p className="text-sm text-stone-600 mb-6 max-w-3xl">
          We've prepared an industry-tailored version of the {c.name} for each of the {INDUSTRIES.length} industries below. Click your industry to see the industry-specific considerations and a downloadable template.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {INDUSTRIES.map((i) => (
            <Link key={i.slug} href={`/contract-template/${c.slug}/${i.slug}`}
                  data-testid={`contract-type-industry-${i.slug}`}
                  className="bg-white border border-stone-200 rounded-lg p-4 hover:border-[#0B3D3D] hover:shadow-sm transition-all">
              <div className="text-sm font-semibold text-stone-900">{i.name}</div>
              <div className="text-[11px] text-stone-500 mt-1 leading-tight">For {i.plural.toLowerCase()}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Related contracts */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-10">
          <h2 className="text-2xl font-semibold text-stone-900 mb-6">Related contract templates</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/contract-template/${r.slug}`}
                    className="bg-white border border-stone-200 rounded-lg p-4 hover:border-[#0B3D3D] hover:shadow-sm transition-all">
                <div className="text-sm font-semibold text-stone-900">{r.name}</div>
                <div className="text-xs text-stone-500 mt-1">{r.shortDesc}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <section className="bg-[#FAF5EE] border-y border-[#C8A96E]/30">
        <div className="max-w-4xl mx-auto px-6 py-10 text-sm text-stone-700 leading-relaxed">
          <strong className="text-stone-900">Legal disclaimer:</strong> This template is provided for general informational purposes and is not legal advice. Laws vary by state and country, and contract enforceability depends on specifics that this template can't anticipate. For high-stakes contracts, consult a licensed attorney in your jurisdiction.
        </div>
      </section>
    </div>
  );
}

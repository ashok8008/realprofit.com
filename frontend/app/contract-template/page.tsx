import Link from "next/link";
import type { Metadata } from "next";
import { FileSignature, Shield, ArrowRight } from "lucide-react";
import { CONTRACT_TYPES } from "@/data/pseo/contracts";
import { INDUSTRIES } from "@/data/pseo/industries";

export const metadata: Metadata = {
  title: "Free Contract Templates — Sign Online Free",
  description: `${CONTRACT_TYPES.length} free contract templates across ${INDUSTRIES.length} industries. NDAs, service agreements, freelance contracts, and more. Edit and sign online — 100% free, no signup.`,
  alternates: { canonical: "/contract-template" },
};

export default function ContractTemplateHub() {
  const sorted = [...CONTRACT_TYPES].sort((a, b) => a.rank - b.rank);

  return (
    <div className="bg-[#F5F3EE] min-h-screen">
      <section className="bg-[#0B3D3D] text-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96E] font-semibold mb-3">
            Free contract templates
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {CONTRACT_TYPES.length} Contracts. {INDUSTRIES.length} Industries. <span className="text-[#C8A96E]">All Free.</span>
          </h1>
          <p className="text-lg text-stone-300 max-w-2xl">
            Hand-crafted templates for the contracts you actually need — NDAs, service agreements, freelance contracts, and more. Edit and sign online for free using our eSign tool.
          </p>
          <div className="flex flex-wrap gap-3 mt-7 text-sm">
            <Link href="/tools/esign/new" data-testid="contract-hub-esign-cta"
                  className="inline-flex items-center gap-2 px-5 py-3 font-bold text-[#0B3D3D] bg-[#C8A96E] rounded-md hover:bg-[#D4B780] transition-colors">
              <FileSignature className="w-4 h-4" /> Open eSign tool <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/verify" data-testid="contract-hub-verify-cta"
                  className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-white border border-white/30 rounded-md hover:bg-white/10 transition-colors">
              <Shield className="w-4 h-4" /> Verify a signed document
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">Browse contracts by type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((c) => (
            <Link key={c.slug} href={`/contract-template/${c.slug}`} data-testid={`contract-type-${c.slug}`}
                  className="bg-white border border-stone-200 rounded-xl p-5 hover:border-[#0B3D3D] hover:shadow-sm transition-all group">
              <div className="text-sm font-semibold text-stone-900 group-hover:text-[#0B3D3D]">{c.name}</div>
              <div className="text-xs text-stone-500 mt-1 leading-relaxed">{c.shortDesc}</div>
              <div className="text-[11px] text-[#C8A96E] font-semibold mt-3 uppercase tracking-wider">
                {INDUSTRIES.length} industries →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-14">
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">Browse by industry</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {INDUSTRIES.map((i) => (
            <Link key={i.slug} href={`/contract-template/nda/${i.slug}`}
                  className="bg-white border border-stone-200 rounded-lg p-4 hover:border-[#0B3D3D] hover:shadow-sm transition-all">
              <div className="text-sm font-semibold text-stone-900">{i.name}</div>
              <div className="text-[11px] text-stone-500 mt-1">{i.shortDesc}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#FAF5EE] border-y border-[#C8A96E]/30">
        <div className="max-w-4xl mx-auto px-6 py-10 text-sm text-stone-700 leading-relaxed">
          <strong className="text-stone-900">A note on legal templates:</strong> These contracts are written to be reasonable starting points. They are not legal advice and don't replace a lawyer when the stakes warrant one (anything over ~$50K, regulated industries, or anything you'd hate to litigate). For high-stakes work, take this template to a licensed attorney in your state for a 30-minute review — it's almost always cheaper than the alternative.
        </div>
      </section>
    </div>
  );
}

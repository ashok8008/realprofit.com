import Link from "next/link";
import type { Metadata } from "next";
import { PROFESSIONS, PROFESSION_CATEGORIES } from "@/data/pseo/professions";

export const metadata: Metadata = {
  title: "Free Invoice Templates for Freelancers & Small Businesses | RealProfits",
  description: "Browse 250+ free invoice templates organized by profession. Pre-filled line items, suggested rates, instant PDF download. No signup required.",
  alternates: { canonical: "/invoice-template" },
};

export default function InvoiceTemplateHub() {
  const grouped = PROFESSION_CATEGORIES.map((cat) => ({
    cat,
    items: PROFESSIONS.filter((p) => p.category === cat.id).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="bg-[#F5F3EE] min-h-screen">
      <section className="bg-[#0B3D3D] text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96E] font-semibold mb-3">Invoice templates</div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Free Invoice Templates for Every Profession</h1>
          <p className="text-lg text-stone-300 max-w-2xl mx-auto">
            {PROFESSIONS.length}+ industry-specific templates with pre-filled line items and suggested rates. Pick your profession to get a head start.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {grouped.map(({ cat, items }) => (
          <div key={cat.id}>
            <h2 className="text-xl font-semibold text-stone-900 mb-4">{cat.label} <span className="text-stone-400 text-sm font-normal ml-1">({items.length})</span></h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {items.map((p) => (
                <Link key={p.slug} href={`/invoice-template/${p.slug}`}
                      data-testid={`template-link-${p.slug}`}
                      className="px-3 py-2 text-sm bg-white border border-stone-200 rounded-md hover:border-[#0B3D3D] hover:bg-[#FAF5EE] transition-colors">
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

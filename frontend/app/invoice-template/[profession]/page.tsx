import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, FileText, FileSignature, Check, Lightbulb, Sparkles } from "lucide-react";
import { PROFESSIONS, getProfession } from "@/data/pseo/professions";

export function generateStaticParams() {
  return PROFESSIONS.map((p) => ({ profession: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ profession: string }> }): Promise<Metadata> {
  const { profession } = await params;
  const p = getProfession(profession);
  if (!p) return { title: "Invoice Template" };
  return {
    title: `Free ${p.name} Invoice Template — Download or Use Online`,
    description: `Professional ${p.name.toLowerCase()} invoice template with pre-filled line items, suggested rates of $${p.hourlyRateLow}–$${p.hourlyRateHigh}/hr, and instant PDF download. 100% free, no signup.`,
    keywords: `${p.name.toLowerCase()} invoice template, ${p.name.toLowerCase()} invoice, freelance ${p.name.toLowerCase()} invoice, ${p.name.toLowerCase()} billing template, free invoice template`,
    alternates: { canonical: `/invoice-template/${p.slug}` },
    openGraph: {
      title: `Free ${p.name} Invoice Template`,
      description: `Pre-filled with ${p.name.toLowerCase()}-specific line items. Download as PDF or fill online — free.`,
    },
  };
}

export default async function InvoiceTemplatePage({ params }: { params: Promise<{ profession: string }> }) {
  const { profession } = await params;
  const p = getProfession(profession);
  if (!p) notFound();

  // Related = same category, excluding self
  const related = PROFESSIONS.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 6);

  const faqs = [
    { q: `When should I send a ${p.name.toLowerCase()} invoice?`, a: `Send your invoice immediately after delivering work or completing a milestone. Most ${p.name.toLowerCase()}s use Net 14 or Net 30 payment terms.` },
    { q: `What hourly rate should a ${p.name.toLowerCase()} charge?`, a: `Typical ${p.name.toLowerCase()} rates range from $${p.hourlyRateLow}/hr to $${p.hourlyRateHigh}/hr depending on experience, geography and project complexity. Mid-career ${p.name.toLowerCase()}s average around $${Math.round((p.hourlyRateLow + p.hourlyRateHigh) / 2)}/hr.` },
    { q: `Does a ${p.name.toLowerCase()} invoice need a tax ID?`, a: `If you operate as a sole proprietor in the US, you can use your SSN. Most ${p.name.toLowerCase()}s apply for a free EIN from the IRS to keep their SSN off invoices.` },
    { q: `Can I charge a late fee?`, a: `Yes — most states allow 1.5% per month (~18% annualized) on unpaid invoices. Always state the late fee in writing on the invoice itself.` },
    { q: `Is this invoice template legally binding?`, a: `An invoice itself isn't a contract, but it's a legally enforceable record of services rendered and amount owed. Pair it with a signed contract (free via our eSign tool) for maximum protection.` },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://realprofits.com" },
      { "@type": "ListItem", position: 2, name: "Invoice Templates", item: "https://realprofits.com/invoice-template" },
      { "@type": "ListItem", position: 3, name: p.name, item: `https://realprofits.com/invoice-template/${p.slug}` },
    ],
  };

  return (
    <div className="bg-[#F5F3EE] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* Breadcrumb */}
      <nav className="max-w-6xl mx-auto px-6 pt-6 text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-800">Home</Link> ·{" "}
        <Link href="/invoice-template" className="hover:text-stone-800">Invoice Templates</Link> ·{" "}
        <span className="text-stone-800">{p.name}</span>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-[10px] tracking-[0.3em] uppercase text-[#C8A96E] font-semibold mb-3">
          Invoice template · {p.plural}
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight max-w-3xl">
          Free {p.name} Invoice Template — Download or Use Online
        </h1>
        <p className="text-base text-stone-600 mt-4 max-w-2xl leading-relaxed">
          {p.description} Use the buttons below to download a printable PDF or open our free Invoice Generator pre-filled with {p.name.toLowerCase()}-specific line items.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href={`/tools/invoice?profession=${p.slug}`} data-testid="invoice-template-cta-primary"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252] transition-colors">
            <FileText className="w-4 h-4" /> Use Online (Free) <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/tools/esign" data-testid="invoice-template-cta-esign"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#0B3D3D] border border-[#0B3D3D] rounded-md hover:bg-[#0B3D3D] hover:text-white transition-colors">
            <FileSignature className="w-4 h-4" /> Need a contract signed? Try eSign
          </Link>
        </div>
      </section>

      {/* Pre-filled line items */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#C8A96E]" />
            <h2 className="text-xl font-semibold text-stone-900">Pre-filled line items for {p.plural}</h2>
          </div>
          <p className="text-sm text-stone-600 mb-6">
            These are suggested defaults based on typical {p.name.toLowerCase()} engagements. The Invoice Generator lets you edit any of them in seconds.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-stone-200 rounded-lg overflow-hidden">
              <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-600">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Description</th>
                  <th className="text-left py-3 px-4 font-semibold">Unit</th>
                  <th className="text-right py-3 px-4 font-semibold">Suggested rate</th>
                </tr>
              </thead>
              <tbody>
                {p.defaultLineItems.map((li, i) => (
                  <tr key={i} className={i % 2 ? "bg-stone-50/40" : ""}>
                    <td className="py-3 px-4 text-stone-800">{li.description}</td>
                    <td className="py-3 px-4 text-stone-500 lowercase">{li.unit === "flat" ? "fixed" : `per ${li.unit}`}</td>
                    <td className="py-3 px-4 text-right font-semibold text-[#0B3D3D]">
                      {li.rate ? `$${li.rate.toLocaleString()}` : "Varies"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* What every invoice must include */}
      <section className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold text-stone-900 mb-4">What every {p.name.toLowerCase()} invoice must include</h2>
          <p className="text-stone-700 leading-relaxed mb-4">
            A {p.name.toLowerCase()} invoice is more than a request for payment — it's a legal record. To stay compliant and get paid on time, make sure your invoice has these elements:
          </p>
          <ul className="space-y-3 text-sm text-stone-700">
            {[
              "Your full business name, address, and contact info",
              `A unique invoice number (e.g. ${p.slug.toUpperCase().slice(0, 4)}-001) for tracking`,
              "Your client's name, business name and address",
              "Issue date and due date (Net 14 or Net 30 is standard)",
              "Itemized list of services with quantities and rates",
              "Subtotal, tax (if applicable) and total amount due",
              "Payment methods accepted (bank transfer, card, PayPal)",
              "Late fee terms if you charge them (1.5% per month is standard)",
              "Your tax ID — EIN for businesses, SSN for sole proprietors",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#2A6B45] mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-semibold text-stone-900 mb-4 mt-10">Suggested rate ranges for {p.plural}</h2>
          <p className="text-stone-700 leading-relaxed mb-4">
            Hourly rates for {p.name.toLowerCase()}s range widely based on experience, location and project complexity:
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-stone-200 rounded-lg p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Entry-level</div>
              <div className="text-xl font-bold text-stone-900 mt-1">${p.hourlyRateLow}/hr</div>
            </div>
            <div className="bg-[#FAF5EE] border border-[#C8A96E] rounded-lg p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-[#0B3D3D]">Mid-career</div>
              <div className="text-xl font-bold text-[#0B3D3D] mt-1">${Math.round((p.hourlyRateLow + p.hourlyRateHigh) / 2)}/hr</div>
            </div>
            <div className="bg-white border border-stone-200 rounded-lg p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Expert</div>
              <div className="text-xl font-bold text-stone-900 mt-1">${p.hourlyRateHigh}/hr</div>
            </div>
          </div>
        </div>

        {/* Tax tips */}
        <aside className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-[#C8A96E]" />
            <h3 className="text-base font-semibold text-stone-900">Tax tips for {p.plural}</h3>
          </div>
          <ul className="space-y-2 text-sm text-stone-700">
            {p.taxTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#C8A96E] mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          <Link href="/tax-tools" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B3D3D] mt-4 hover:underline">
            Explore tax tools <ArrowRight className="w-3 h-3" />
          </Link>
        </aside>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold text-stone-900 mb-6">Frequently asked questions</h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="bg-white border border-stone-200 rounded-lg p-5 group">
              <summary className="cursor-pointer font-semibold text-stone-900 list-none flex justify-between items-center">
                {f.q}
                <span className="text-stone-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-stone-700 mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-semibold text-stone-900 mb-6">Related invoice templates</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/invoice-template/${r.slug}`}
                    className="bg-white border border-stone-200 rounded-lg p-4 hover:border-[#0B3D3D] hover:shadow-sm transition-all">
                <div className="text-sm font-semibold text-stone-900">{r.name}</div>
                <div className="text-xs text-stone-500 mt-1">${r.hourlyRateLow}–${r.hourlyRateHigh}/hr</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="bg-[#0B3D3D] text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to invoice your client?</h2>
          <p className="text-stone-300 mb-7 max-w-xl mx-auto">
            Use our free Invoice Generator — pre-filled with {p.name.toLowerCase()} line items. PDF, payment links, and email delivery included.
          </p>
          <Link href={`/tools/invoice?profession=${p.slug}`}
                className="inline-block px-8 py-3.5 text-base font-bold text-[#0B3D3D] bg-[#C8A96E] rounded-md hover:bg-[#D4B780] transition-colors">
            Open Invoice Generator →
          </Link>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ToolSchema } from "@/components/seo/ToolSchema";
import { taxTools } from "@/data/tax-tools";
import { US_STATES } from "@/data/pseo/us-states";
import { SITE_URL } from "@/lib/site";

/**
 * /tax-tools/[state]/[tool] — programmatic geo × tool grid.
 *
 * Generates 51 states × ~12 tax tools = ~600 leaf pages. Each emits
 * FinancialProduct + SoftwareApplication + CalculateAction + Place
 * structured data so search engines see this as a state-scoped financial
 * utility, not a duplicate of the parent tool page.
 *
 * The interactive UI on each page deep-links to the parent `/tax-tools/[slug]`
 * so we don't duplicate the calculator engine — the SEO surface is the
 * benefit, the engine is shared.
 */
export async function generateStaticParams() {
  const tools = taxTools.filter((t) => t.section !== "calculators");
  const out: { slug: string; tool: string }[] = [];
  for (const s of US_STATES) {
    for (const t of tools) out.push({ slug: s.slug, tool: t.slug });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; tool: string }>;
}): Promise<Metadata> {
  const { slug: state, tool } = await params;
  const st = US_STATES.find((s) => s.slug === state);
  const tt = taxTools.find((t) => t.slug === tool);
  if (!st || !tt) return { title: "Page Not Found" };
  const title = `${tt.name} — ${st.name} | Free Tax Tool`;
  const description = `${tt.name} for ${st.name} residents. ${tt.description} Free, no signup required. Informational estimates only.`;
  return {
    title,
    description,
    keywords: `${tt.name.toLowerCase()}, ${st.name.toLowerCase()} ${tt.name.toLowerCase()}, ${st.name.toLowerCase()} tax calculator, free ${st.name.toLowerCase()} tax tool`,
    alternates: { canonical: `${SITE_URL}/tax-tools/${st.slug}/${tt.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/tax-tools/${st.slug}/${tt.slug}`,
      images: [{ url: "/opengraph.jpg", width: 1200, height: 630 }],
    },
  };
}

export default async function StateTaxToolPage({
  params,
}: {
  params: Promise<{ slug: string; tool: string }>;
}) {
  const { slug: state, tool } = await params;
  const st = US_STATES.find((s) => s.slug === state);
  const tt = taxTools.find((t) => t.slug === tool);
  if (!st || !tt) notFound();

  const placeSchema = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: st.name,
    address: {
      "@type": "PostalAddress",
      addressRegion: st.abbrev,
      addressCountry: "US",
    },
  };

  return (
    <div className="bg-[#F5F3EE] min-h-screen">
      <ToolSchema
        path={`/tax-tools/${st.slug}/${tt.slug}`}
        name={`${tt.name} for ${st.name} residents`}
        description={`${tt.name} for ${st.name} (${st.abbrev}) residents. ${tt.description}`}
        inputs={["Annual income", "Filing status", "Deductions"]}
        output={`Estimated ${tt.name.toLowerCase()} result for ${st.name}.`}
      />
      {/* Extra Place schema so search engines see the geo-scope */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }}
      />

      <div className="max-w-3xl mx-auto px-6 py-16">
        <nav className="text-sm text-stone-600 mb-6" aria-label="Breadcrumb">
          <Link href="/tax-tools" className="hover:text-stone-900">Tax Tools</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-900 font-medium">{st.name}</span>
          <span className="mx-2">/</span>
          <span className="text-stone-900">{tt.name}</span>
        </nav>

        <div className="text-[10px] tracking-[0.3em] text-[#C8A96E] uppercase font-medium mb-3">
          {st.name} · Free Tax Tool
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-stone-900 mb-4">
          {tt.name} — {st.name}
        </h1>
        <p className="text-lg text-stone-700 leading-relaxed mb-8">
          The free {tt.name.toLowerCase()} for {st.name} ({st.abbrev}) residents.{" "}
          {tt.description} Built for {st.name} workers, freelancers and small
          business owners who want a fast, no-signup estimate.
        </p>

        <div className="bg-white border border-stone-200 rounded-xl p-8 mb-10 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-900 mb-3">
            Open the full {tt.name}
          </h2>
          <p className="text-sm text-stone-600 mb-5">
            The same calculator engine handles every state. We&rsquo;ll pre-select{" "}
            <strong>{st.name}</strong> for you so the result is locally accurate.
          </p>
          <Link
            href={`/tax-tools/${tt.slug}?state=${st.abbrev}`}
            className="inline-block px-6 py-3 rounded-lg bg-[#0B3D3D] text-white font-semibold hover:bg-[#0A3535] transition-colors"
            data-testid="open-state-tool"
          >
            Open {tt.name} →
          </Link>
        </div>

        <div className="bg-[#FAF5EE] border border-[#C8A96E] rounded-xl p-5 text-sm text-stone-800">
          <strong>Notice for {st.name} residents:</strong> All estimates are
          informational only — not for IRS or state submission. {st.name} tax law
          changes annually; for filing purposes always consult a licensed{" "}
          {st.name} tax professional or the {st.name} Department of Revenue.
        </div>
      </div>
    </div>
  );
}

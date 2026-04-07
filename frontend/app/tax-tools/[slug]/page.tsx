import type { Metadata } from "next";
import { taxTools } from "@/data/tax-tools";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://realprofits.com";

export async function generateStaticParams() {
  return taxTools
    .filter(t => t.section !== "calculators")
    .map(t => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = taxTools.find(t => t.slug === slug);

  if (!tool) {
    return { title: "Tax Tool Not Found" };
  }

  const isIRSPrep = tool.section === "irs-prep";
  const suffix = isIRSPrep ? " (Prep Only)" : "";

  return {
    title: `${tool.name}${suffix} - Free Tax Tool`,
    description: `${tool.description} Free, no signup required. Informational estimates only — not for IRS submission.`,
    keywords: `${tool.name.toLowerCase()}, ${tool.slug.replace(/-/g, " ")}, free tax tool, tax calculator, tax planning, irs prep`,
    alternates: {
      canonical: `${BASE}/tax-tools/${tool.slug}`,
    },
    openGraph: {
      title: `${tool.name} - Free Tax Tool`,
      description: `${tool.description} Free, no signup required.`,
      url: `${BASE}/tax-tools/${tool.slug}`,
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export { default } from "@/views/tax-tools/TaxToolDetail";

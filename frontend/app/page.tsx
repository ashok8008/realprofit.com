import type { Metadata } from "next";
import Home from "@/views/Home";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Invoice Generator + eSign Tool — 50+ Free Financial Tools",
  description:
    "Free financial tools for freelancers and individuals — invoice generator, eSign tool, paycheck calculator and 50+ more tools. No signup required.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    url: SITE_URL,
    title: "Free Invoice Generator + eSign Tool — RealProfits",
    description:
      "50+ free financial tools — invoices, eSign, paycheck calculator, expense tracker. No signup required.",
    images: [{ url: "/opengraph.jpg", width: 1200, height: 630, alt: "RealProfits — Free Financial Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Invoice Generator + eSign Tool — RealProfits",
    description: "50+ free financial tools. No signup required.",
    images: ["/opengraph.jpg"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description:
    "Free financial tools for freelancers and individuals — invoice generator, eSign tool, paycheck calculator and 50+ more tools. No signup required.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    email: "realprofits@gmail.com",
    contactType: "customer support",
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={[websiteSchema, orgSchema]} />
      <Home />
    </>
  );
}

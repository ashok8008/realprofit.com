import type { Metadata } from "next";
import { EsignLanding } from "@/components/esign/EsignLanding";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";
import { ZeroparkUtmCapture } from "@/lib/analytics/zeropark";

export const metadata: Metadata = {
  title: "Free eSign Tool — Sign PDF Documents Online",
  description:
    "Sign PDF documents online for free. Add up to 5 signers, audit trail, UUID verification and QR code. No account needed. Better than DocuSign — and completely free.",
  keywords:
    "free esign tool, free docusign alternative, sign pdf online free, electronic signature free, esign documents free, free online signature, esign tool, pdf signer",
  alternates: { canonical: `${SITE_URL}/tools/esign` },
  openGraph: {
    url: `${SITE_URL}/tools/esign`,
    title: "Free eSign Tool — Sign PDF Documents Online",
    description:
      "Better than DocuSign. Free forever. 5 signers, audit trail, QR verification.",
    type: "website",
    images: [{ url: "/opengraph.jpg", width: 1200, height: 630, alt: "RealProfits eSign Tool" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free eSign Tool — RealProfits",
    description: "Sign PDFs online for free. Up to 5 signers, full audit trail.",
    images: ["/opengraph.jpg"],
  },
};

const esignAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RealProfits eSign Tool",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web Browser",
  url: `${SITE_URL}/tools/esign`,
  description:
    "Free electronic signature tool. Sign PDF documents online with up to 5 parties. Full audit trail, UUID verification, QR code. Free alternative to DocuSign.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Up to 5 signers per document",
    "Draw, type or upload signature",
    "Full audit trail PDF",
    "UUID per signer",
    "QR verification code",
    "Sequential and parallel signing",
    "Witness and approver roles",
    "Guest signing (no account required)",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "612",
  },
};

const esignFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is RealProfits eSign legally binding?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. RealProfits eSign is fully compliant with the US ESIGN Act, UETA, and EU eIDAS regulation. Every signed document includes a timestamped audit trail, per-signer UUID, IP address logging, and SHA-256 document hash.",
      },
    },
    {
      "@type": "Question",
      name: "Is it really completely free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The free plan includes 5 documents per month, up to 5 signers, full audit trail, QR verification, and PDF download. Pro plan at $9/month removes branding and unlocks unlimited documents.",
      },
    },
    {
      "@type": "Question",
      name: "Do signers need an account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Signers receive a secure link by email and sign directly in their browser. No account, app, or signup required for anyone.",
      },
    },
    {
      "@type": "Question",
      name: "What happens to my documents?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Documents are encrypted and stored for 90 days on the free plan, 1 year on Pro. You can download your signed PDF and audit trail at any time.",
      },
    },
    {
      "@type": "Question",
      name: "How is this different from DocuSign?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "RealProfits gives you 5 signers per document free, SHA-256 hashing, QR verification, and a public verification page — all free. DocuSign charges $25/month+ for equivalent features.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use this for real legal contracts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Legally valid for NDAs, service agreements, freelance contracts, independent contractor agreements, and rental agreements in the US, UK, EU, Canada, and Australia.",
      },
    },
  ],
};

export default function EsignLandingPage() {
  return (
    <>
      <JsonLd data={[esignAppSchema, esignFaqSchema]} />
      <ZeroparkUtmCapture />
      <EsignLanding />
    </>
  );
}

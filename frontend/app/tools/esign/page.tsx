import type { Metadata } from "next";
import { EsignLanding } from "@/components/esign/EsignLanding";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

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
      name: "Is RealProfits eSign legally valid?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. RealProfits eSign is compliant with the US ESIGN Act, UETA, and EU eIDAS regulations for Simple Electronic Signatures. Each signature includes a timestamp, UUID, IP address, and a downloadable audit trail PDF.",
      },
    },
    {
      "@type": "Question",
      name: "Is the eSign tool really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The Free plan lets you send and sign unlimited documents with up to 5 signers, full audit trail, and a 'Powered by RealProfits' footer. The Pro plan ($9/month) removes the footer and unlocks higher monthly limits.",
      },
    },
    {
      "@type": "Question",
      name: "Can I sign without creating an account?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Recipients never need an account to sign — they just click the email link, complete the fields, and click Finish. The sender can also send single-signer documents as a guest without logging in.",
      },
    },
    {
      "@type": "Question",
      name: "How is RealProfits eSign different from DocuSign?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "RealProfits eSign is free for unlimited documents up to 5 signers, while DocuSign starts at $10/month with restrictive limits. Both produce legally compliant signatures with full audit trails. RealProfits adds QR verification on every signed PDF for instant public verification.",
      },
    },
  ],
};

export default function EsignLandingPage() {
  return (
    <>
      <JsonLd data={[esignAppSchema, esignFaqSchema]} />
      <EsignLanding />
    </>
  );
}

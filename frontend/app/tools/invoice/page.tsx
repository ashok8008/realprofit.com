import type { Metadata } from "next";
import { InvoiceApp } from "@/components/invoice-app/InvoiceApp";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Invoice Generator — Create & Download Professional Invoices",
  description:
    "Free invoice generator for freelancers. Create professional invoices with payment links, client management, 3 templates and PDF download. No signup required.",
  keywords:
    "free invoice generator, freelance invoice template, online invoice maker, free invoice software, invoice with payment link",
  alternates: { canonical: `${SITE_URL}/tools/invoice` },
  openGraph: {
    url: `${SITE_URL}/tools/invoice`,
    title: "Free Invoice Generator — RealProfits",
    description:
      "Create professional invoices with payment links, client management, 3 templates and PDF download. Free forever.",
    images: [{ url: "/opengraph.jpg", width: 1200, height: 630, alt: "RealProfits Invoice Generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Invoice Generator — RealProfits",
    description: "Create professional invoices with payment links, free forever.",
    images: ["/opengraph.jpg"],
  },
};

const invoiceAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RealProfits Invoice Generator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web Browser",
  url: `${SITE_URL}/tools/invoice`,
  description:
    "Free invoice generator for freelancers. Create professional invoices with payment links, client management, 3 templates and PDF download. No signup required.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "PDF invoice download",
    "Payment link and QR code",
    "Client management",
    "3 invoice templates",
    "Multi-currency support",
    "Partial payment tracking",
    "Digital signature",
    "Email delivery with attachments",
    "Bank / ACH payment details",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1240",
  },
};

const invoiceFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is RealProfits invoice generator really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The invoice generator is completely free with no account required. You can create, download and send unlimited invoices at no cost.",
      },
    },
    {
      "@type": "Question",
      name: "Can clients pay directly from the invoice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every invoice gets a shareable public link with a 'Pay now' button and a QR code. You can list bank / ACH / PayPal details and clients pay via your preferred method.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to sign up to use the invoice generator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No signup is required to generate and download an invoice as a PDF. Creating an account is only needed if you want to save clients, track payments, or send invoices by email.",
      },
    },
  ],
};

export default function InvoicePage() {
  return (
    <>
      <JsonLd data={[invoiceAppSchema, invoiceFaqSchema]} />
      <InvoiceApp />
    </>
  );
}

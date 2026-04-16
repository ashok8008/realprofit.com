import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { LayoutShell } from "@/components/layout/LayoutShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--app-font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--app-font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BACKEND_URL || "https://realprofits.com"),
  title: {
    default: "RealProfits - Smart Financial Tools & Career Guides",
    template: "%s | RealProfits",
  },
  description:
    "Free financial calculators, career tools, and data-driven guides to help you make smarter decisions about salary, taxes, savings, mortgage, and debt.",
  keywords:
    "financial calculators, salary guide, tax calculator, savings planner, resume builder, career tools, personal finance",
  authors: [{ name: "RealProfits" }],
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  openGraph: {
    siteName: "RealProfits",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  other: {
    "geo.region": "US",
    "geo.placename": "United States",
    rating: "general",
    distribution: "global",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <Script id="gtm" strategy="beforeInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-KQ9BHG4B');
        `}</Script>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-7PX07P6BKF" strategy="afterInteractive" />
        <Script id="ga4-config" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-7PX07P6BKF');
        `}</Script>
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KQ9BHG4B"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}

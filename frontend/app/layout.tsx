import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

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
  robots: "index, follow",
  openGraph: {
    siteName: "RealProfits",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

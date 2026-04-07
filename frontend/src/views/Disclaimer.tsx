"use client";
import React from "react";
import { Seo } from "@/components/Seo";

export default function Disclaimer() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <Seo title="Disclaimer" description="Financial Disclaimer for RealProfits. Our content is for educational purposes only." keywords="financial disclaimer, not financial advice, educational content, RealProfits disclaimer" path="/disclaimer" />
      <h1 className="font-serif text-4xl font-bold mb-8">Financial Disclaimer</h1>
      <div className="prose prose-lg prose-headings:font-serif">
        <p className="font-bold text-lg border-l-4 border-primary pl-4 py-2 bg-muted/30">
          RealProfits is an educational platform. We do not provide personalized financial, legal, or tax advice.
        </p>

        <h2>No Professional Advice</h2>
        <p>The information, articles, and calculators on this site are for educational and informational purposes only. Every individual's financial situation is unique. What works for one person may not work for another.</p>

        <h2>Investing Risks</h2>
        <p>All investments involve risk, including the potential loss of principal. Past performance is not indicative of future results. We do not guarantee any specific financial outcome from using our strategies or tools.</p>

        <h2>Affiliate Disclosure</h2>
        <p>RealProfits may partner with financial products or services that align with our editorial standards. We may receive compensation if you click on certain links or open accounts. However, our recommendations are always driven by editorial independence, not affiliate payouts.</p>
      </div>
    </div>
  );
}

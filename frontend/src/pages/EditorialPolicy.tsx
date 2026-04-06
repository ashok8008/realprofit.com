import React from "react";
import { Seo } from "@/components/Seo";

export default function EditorialPolicy() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <Seo title="Editorial Policy" description="Editorial Policy for RealProfits. How we create and review our financial content." keywords="editorial policy, content standards, financial content review, RealProfits editorial, trusted finance content" path="/editorial-policy" />
      <h1 className="font-serif text-4xl font-bold mb-8">Editorial Policy</h1>
      <div className="prose prose-lg prose-headings:font-serif">
        <h2>Our Commitment to Clarity</h2>
        <p>Financial media is often plagued by hype, fear-mongering, or overly academic jargon. Our mission is to cut through the noise and provide clear, grounded, and practical advice.</p>
        
        <h2>No Hype</h2>
        <p>We do not promote "get rich quick" schemes. We believe in steady, sustainable financial habits. If an investment strategy sounds too good to be true, we will investigate it with skepticism.</p>

        <h2>Independence</h2>
        <p>Our editorial team operates independently from our advertising and affiliate teams. Our reviews, comparisons, and advice are not influenced by compensation.</p>

        <h2>Accuracy</h2>
        <p>We strive to ensure all tax brackets, contribution limits, and financial rules are up-to-date. Content is regularly reviewed and updated to reflect current laws and market realities.</p>
      </div>
    </div>
  );
}

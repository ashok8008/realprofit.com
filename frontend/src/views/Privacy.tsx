"use client";
import React from "react";
import { Seo } from "@/components/Seo";

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <Seo title="Privacy Policy" description="Privacy Policy for RealProfits. Learn how we protect your data and privacy." keywords="privacy policy, data protection, RealProfits privacy, personal information, cookies policy" path="/privacy" />
      <h1 className="font-serif text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-lg prose-headings:font-serif">
        <p className="text-muted-foreground mb-8">Last Updated: October 2023</p>
        
        <h2>1. Information We Collect</h2>
        <p>At RealProfits, we believe in collecting only the data we need to improve your experience. We do not require you to create an account to use our basic calculators or read our articles.</p>
        
        <h2>2. How We Use Your Information</h2>
        <p>If you subscribe to our newsletter, we use your email address solely to send you the content you requested. We do not sell your personal information to third parties.</p>

        <h2>3. Cookies and Analytics</h2>
        <p>We use standard analytics tools to understand which articles and calculators are most helpful to our readers. These tools may use cookies, which you can manage through your browser settings.</p>

        <h2>4. Calculator Data</h2>
        <p>The numbers you input into our calculators remain on your device (client-side) and are not stored on our servers. Your financial data is your business.</p>
      </div>
    </div>
  );
}

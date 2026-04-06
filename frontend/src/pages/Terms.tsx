import React from "react";
import { Seo } from "@/components/Seo";

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <Seo title="Terms of Service" description="Terms of Service for RealProfits. Read our terms and conditions." keywords="terms of service, terms and conditions, RealProfits terms, user agreement" path="/terms" />
      <h1 className="font-serif text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-lg prose-headings:font-serif">
        <h2>Educational Purposes Only</h2>
        <p>RealProfits provides educational content and tools. We are not a financial advisor, broker, or legal firm. The information provided on this website should not be considered personalized financial advice.</p>
        
        <h2>Use of Calculators</h2>
        <p>Our calculators are provided "as is" and rely on the accuracy of the information you input. They are designed to give estimates and general projections. For exact figures regarding your personal tax liability or investment returns, consult a certified professional.</p>
        
        <h2>Intellectual Property</h2>
        <p>All content, tools, and designs on RealProfits are the property of RealProfits. You may not reproduce or republish our articles or calculators without explicit permission.</p>
      </div>
    </div>
  );
}

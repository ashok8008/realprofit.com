import React from "react";
import { Seo } from "@/components/Seo";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <Seo title="About Us" description="About RealProfits -- free personal finance education, calculators, and tools for everyday Americans." keywords="about RealProfits, personal finance website, financial education, money management, free financial tools, USA finance" path="/about" />
      <h1 className="font-serif text-4xl font-bold mb-6">About RealProfits</h1>
      <div className="prose prose-lg">
        <p>RealProfits is dedicated to providing clear, actionable financial education for everyday Americans.</p>
        <p>We believe that personal finance shouldn't be hidden behind complex jargon or aggressive sales pitches. Our goal is to provide editorially sound, trustworthy guides and calculators to help you make informed decisions.</p>
      </div>
    </div>
  );
}

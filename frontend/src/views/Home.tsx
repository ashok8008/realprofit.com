"use client";
import { Seo } from "@/components/Seo";
import { HeroSection } from "@/components/home/HeroSection";
import { StartHereSection, PillarCardsSection, PopularToolsSection } from "@/components/home/ToolSections";
import { CareerHighlightSection } from "@/components/home/CareerHighlight";
import { WhatIfPreviewSection, CalculatorsShowcaseSection, ProductiveToolsSection } from "@/components/home/ShowcaseSections";
import { ArticlesSection, TrustSection } from "@/components/home/ContentSections";

export default function Home() {
  return (
    <div className="w-full">
      <Seo 
        title="Understand Your Money, Income & Career"
        description="Free tools to calculate your salary, track spending, build resumes, and make smarter financial and career decisions — no signup required."
        keywords="personal finance, financial calculator, salary comparison, resume builder, career tools, budget calculator, savings calculator, money management, financial planning, debt payoff, investment calculator, tax calculator"
        path="/"
      />
      <HeroSection />
      <StartHereSection />
      <PillarCardsSection />
      <PopularToolsSection />
      <CareerHighlightSection />
      <WhatIfPreviewSection />
      <CalculatorsShowcaseSection />
      <ProductiveToolsSection />
      <ArticlesSection />
      <TrustSection />
    </div>
  );
}

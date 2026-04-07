"use client";
import React, { lazy, Suspense } from "react";
import Link from "next/link";
import { Shield, Lock } from "lucide-react";
import { QuickSalaryCheck } from "./QuickSalaryCheck";

const LazyHeroCharts = lazy(() => import("@/components/home/HeroCharts"));

export function HeroSection() {
  return (
    <section className="hero-gradient py-20 md:py-28 lg:py-32 px-4" data-testid="hero-section">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="lg:w-1/2 text-white">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#f5c542] animate-pulse"></span>
              50+ free tools — no signup required
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6" data-testid="hero-headline">
              Understand Your Money, Income &amp; Career — Instantly
            </h1>
            <p className="text-base md:text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
              Free tools to calculate your salary, track spending, build resumes, and make smarter decisions — no signup required.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <Link href="/calculators" className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-lg px-7 py-3.5 font-bold text-sm transition-all hover:-translate-y-0.5 inline-block shadow-lg" data-testid="hero-cta-explore">
                Explore Tools
              </Link>
              <Link href="/career-tools/salary-comparison" className="border-2 border-white/60 text-white hover:bg-white/10 hover:border-white rounded-lg px-7 py-3.5 font-bold text-sm transition-all inline-block" data-testid="hero-cta-salary">
                Check My Salary
              </Link>
            </div>
            <div className="flex items-center gap-5 text-xs text-white/60">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Private by default</span>
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> No signup needed</span>
            </div>
            <div className="mt-8">
              <QuickSalaryCheck />
            </div>
          </div>
          <div className="lg:w-1/2 relative h-[420px] hidden lg:block" data-testid="hero-visual">
            <Suspense fallback={null}>
              <LazyHeroCharts />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}

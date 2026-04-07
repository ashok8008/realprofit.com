"use client";
import React from "react";
import Link from "next/link";

export function CareerHighlightSection() {
  const tools = [
    { title: "Resume Builder", desc: "AI-powered resume creation with 5 premium PDF templates", slug: "resume-builder", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { title: "Salary Comparison", desc: "Compare pay against 90+ role benchmarks with location data", slug: "salary-comparison", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: "Am I Underpaid?", desc: "Instant market assessment of your compensation", slug: "am-i-underpaid", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: "Job Readiness", desc: "Comprehensive checklist to gauge your search preparedness", slug: "job-readiness-score", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden" data-testid="career-tools-section">
      <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="lg:w-1/2">
            <span className="inline-block bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-5">Career Tools</span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-5 leading-tight" data-testid="career-tools-headline">
              Grow Your Income, Not Just Track It
            </h2>
            <p className="text-gray-400 text-base mb-8 max-w-lg leading-relaxed">
              Build your resume with AI, compare your pay, and understand where you stand — all free, all private. The career clarity you need, without the career coach price tag.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/career-tools" className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-lg px-7 py-3.5 font-bold text-sm transition-all hover:-translate-y-0.5 inline-block" data-testid="career-cta-explore">
                Explore Career Tools
              </Link>
              <Link href="/career-tools/resume-builder" className="border-2 border-teal-500/50 text-teal-400 hover:bg-teal-500/10 rounded-lg px-7 py-3.5 font-bold text-sm transition-all inline-block" data-testid="career-cta-resume">
                Build My Resume
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
            {tools.map((tool) => (
              <Link key={tool.slug} href={`/career-tools/${tool.slug}`} className="group block" data-testid={`career-card-${tool.slug}`}>
                <div className="rounded-xl border border-slate-700/80 bg-slate-800/60 p-5 transition-all hover:bg-slate-800 hover:border-teal-500/40 hover:shadow-xl h-full">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-teal-500/15 text-teal-400">
                    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={tool.icon} />
                    </svg>
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1 group-hover:text-teal-400 transition-colors">{tool.title}</h3>
                  <p className="text-gray-500 text-[11px] leading-relaxed">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

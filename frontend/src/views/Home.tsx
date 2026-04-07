"use client";
import React, { useState, useMemo, lazy, Suspense } from "react";
import Link from "next/link";
import { Seo } from "@/components/Seo";
import { articles } from "@/data/articles";
import { categories } from "@/data/categories";
import { 
  ArrowRight, Shield, Lock, BarChart3, Heart,
  Calculator, Briefcase, TrendingUp, BookOpen,
  FileText, DollarSign, HelpCircle, PiggyBank, 
  Wallet, Receipt, ClipboardCheck, LineChart,
  Search, ChevronRight, TrendingDown, Minus
} from "lucide-react";
import { analyzeSalary, getAllJobTitles } from "@/lib/career-tools/salaryBenchmarks";

// Lazy load Recharts since it's heavy and only used below the fold
const LazyWhatIfChart = lazy(() => import("@/components/home/WhatIfChart"));
const LazyHeroCharts = lazy(() => import("@/components/home/HeroCharts"));

function QuickSalaryCheck() {
  const [jobTitle, setJobTitle] = useState("");
  const [salary, setSalary] = useState("");
  const allTitles = useMemo(() => getAllJobTitles(), []);
  
  const salaryNum = parseInt(salary.replace(/[^0-9]/g, '')) || 0;
  const analysis = jobTitle.trim() && salaryNum > 0
    ? analyzeSalary(jobTitle, 3, salaryNum, "National Average")
    : null;
  
  const hasResult = analysis?.benchmark && analysis?.gap;
  const position = analysis?.gap?.position;
  
  const formatSalary = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return '';
    return '$' + parseInt(num).toLocaleString();
  };
  
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 max-w-md" data-testid="quick-salary-check">
      <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Search className="w-3.5 h-3.5" /> Quick Salary Check
      </div>
      <div className="flex gap-2 mb-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Job title..."
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            list="hero-job-titles"
            className="w-full rounded-lg bg-white/90 text-gray-900 text-sm px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f5c542]"
            data-testid="quick-salary-job-input"
          />
          <datalist id="hero-job-titles">
            {allTitles.map(t => <option key={t} value={t} />)}
          </datalist>
        </div>
        <div className="w-36">
          <input
            type="text"
            placeholder="Salary..."
            value={salary}
            onChange={e => setSalary(formatSalary(e.target.value))}
            className="w-full rounded-lg bg-white/90 text-gray-900 text-sm px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f5c542]"
            data-testid="quick-salary-amount-input"
          />
        </div>
      </div>
      
      {hasResult ? (
        <div className={`rounded-lg px-4 py-3 flex items-center justify-between ${
          position === 'below' ? 'bg-red-500/20 border border-red-400/30' :
          position === 'above' ? 'bg-emerald-500/20 border border-emerald-400/30' :
          'bg-blue-500/20 border border-blue-400/30'
        }`} data-testid="quick-salary-result">
          <div className="flex items-center gap-2">
            {position === 'below' ? <TrendingDown className="w-4 h-4 text-red-300" /> :
             position === 'above' ? <TrendingUp className="w-4 h-4 text-emerald-300" /> :
             <Minus className="w-4 h-4 text-blue-300" />}
            <span className={`text-sm font-bold ${
              position === 'below' ? 'text-red-200' :
              position === 'above' ? 'text-emerald-200' : 'text-blue-200'
            }`}>
              {position === 'below' ? 'Below Market' : position === 'above' ? 'Above Market' : 'At Market'}
            </span>
          </div>
          <Link href="/career-tools/salary-comparison" className="text-xs text-white/70 hover:text-white flex items-center gap-0.5 transition-colors">
            Full analysis <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="text-[11px] text-white/50">
          {jobTitle && salaryNum === 0 ? 'Enter your salary' : 
           !jobTitle ? 'Try: Software Engineer, Data Analyst, Product Manager...' :
           'No data for this role. Try a different title.'}
        </div>
      )}
    </div>
  );
}

function SliderPreview({ label, value, color, pct }: { label: string; value: string; color: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <span className="text-xs font-bold text-gray-900">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );
}

export default function Home() {
  const latestArticles = [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
  
  return (
    <div className="w-full">
      <Seo 
        title="Understand Your Money, Income & Career"
        description="Free tools to calculate your salary, track spending, build resumes, and make smarter financial and career decisions — no signup required."
        keywords="personal finance, financial calculator, salary comparison, resume builder, career tools, budget calculator, savings calculator, money management, financial planning, debt payoff, investment calculator, tax calculator"
        path="/"
      />
      
      {/* ============================================ */}
      {/* 1. HERO SECTION */}
      {/* ============================================ */}
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
              
              {/* Quick Salary Check Widget */}
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

      {/* ============================================ */}
      {/* 2. START HERE SECTION */}
      {/* ============================================ */}
      <section className="py-16 md:py-20 bg-stone-50/50" data-testid="start-here-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight mb-2">Start with one simple question</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { q: "Am I underpaid?", href: "/career-tools/am-i-underpaid", icon: <HelpCircle className="w-5 h-5" />, color: "text-amber-600 bg-amber-50 border-amber-200" },
              { q: "How much tax do I pay?", href: "/calculators/simple-tax-estimator", icon: <Receipt className="w-5 h-5" />, color: "text-rose-600 bg-rose-50 border-rose-200" },
              { q: "Can I afford this house?", href: "/calculators/rent-vs-buy-calculator", icon: <PiggyBank className="w-5 h-5" />, color: "text-teal-600 bg-teal-50 border-teal-200" },
              { q: "How long to save $10K?", href: "/calculators/savings-goal-calculator", icon: <Wallet className="w-5 h-5" />, color: "text-blue-600 bg-blue-50 border-blue-200" },
              { q: "Build my resume", href: "/career-tools/resume-builder", icon: <FileText className="w-5 h-5" />, color: "text-violet-600 bg-violet-50 border-violet-200" },
              { q: "Track my spending", href: "/tools/expense-tracker", icon: <LineChart className="w-5 h-5" />, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
            ].map((item, i) => (
              <Link key={i} href={item.href} className={`group flex flex-col items-center text-center gap-2.5 p-4 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${item.color}`} data-testid={`start-here-card-${i}`}>
                {item.icon}
                <span className="text-xs font-bold leading-tight">{item.q}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 3. WHAT YOU CAN DO HERE - 4 PILLARS */}
      {/* ============================================ */}
      <section className="py-20 md:py-24" data-testid="what-you-can-do-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-3">What You Can Do Here</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
              One platform for financial clarity, career growth, and smarter life decisions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: "Financial Calculators",
                desc: "Taxes, salary, savings, debt, mortgage, investing — 39+ free calculators for every money question.",
                icon: <Calculator className="w-6 h-6" />,
                color: "text-teal-600 bg-teal-50",
                borderHover: "hover:border-teal-400",
                href: "/calculators",
                cta: "Browse Calculators",
                count: "39+",
              },
              {
                title: "Everyday Tools",
                desc: "Invoice generator, expense tracker, subscription analyzer, bill split — hands-on utilities that save time.",
                icon: <Briefcase className="w-6 h-6" />,
                color: "text-amber-600 bg-amber-50",
                borderHover: "hover:border-amber-400",
                href: "/tools",
                cta: "View Tools",
                count: "7",
              },
              {
                title: "Career Tools",
                desc: "Resume builder, salary comparison, underpaid tool, job readiness — grow your income, not just track it.",
                icon: <TrendingUp className="w-6 h-6" />,
                color: "text-blue-600 bg-blue-50",
                borderHover: "hover:border-blue-400",
                href: "/career-tools",
                cta: "Explore Career Tools",
                count: "10",
              },
              {
                title: "Future Planning",
                desc: "What-if scenarios, salary guides, decision support — see where your choices could lead before committing.",
                icon: <BookOpen className="w-6 h-6" />,
                color: "text-violet-600 bg-violet-50",
                borderHover: "hover:border-violet-400",
                href: "/what-if",
                cta: "Plan Your Future",
                count: "130+",
              },
            ].map((pillar, i) => (
              <Link key={i} href={pillar.href} className={`group block rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1 ${pillar.borderHover}`} data-testid={`pillar-card-${i}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pillar.color}`}>
                    {pillar.icon}
                  </div>
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">{pillar.count}</span>
                </div>
                <h3 className="font-bold text-base mb-2">{pillar.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-4">{pillar.desc}</p>
                <div className="font-bold text-sm flex items-center text-gray-600 group-hover:text-gray-900 transition-colors">
                  {pillar.cta} <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 4. POPULAR TOOLS RIGHT NOW */}
      {/* ============================================ */}
      <section className="py-20 md:py-24 bg-stone-50/50" data-testid="popular-tools-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-3">Popular Tools Right Now</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">
              The tools people use most — start with any of these.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "Resume Builder", desc: "Create a polished, ATS-friendly resume with AI-powered suggestions. Download as premium PDF.", href: "/career-tools/resume-builder", icon: <FileText className="w-5 h-5" />, color: "text-blue-600 bg-blue-50", tag: "AI-Powered" },
              { title: "Salary Comparison", desc: "Compare your pay against market benchmarks for your role, experience, and location.", href: "/career-tools/salary-comparison", icon: <DollarSign className="w-5 h-5" />, color: "text-emerald-600 bg-emerald-50", tag: "Career" },
              { title: "Am I Underpaid?", desc: "Find out in 30 seconds if your compensation is below, at, or above market rate.", href: "/career-tools/am-i-underpaid", icon: <HelpCircle className="w-5 h-5" />, color: "text-amber-600 bg-amber-50", tag: "Career" },
              { title: "Freelance Invoice Generator", desc: "Create professional invoices and download as PDF. No account needed.", href: "/tools/freelance-invoice-generator", icon: <Receipt className="w-5 h-5" />, color: "text-orange-600 bg-orange-50", tag: "Tool" },
              { title: "Expense Tracker", desc: "Record expenses and understand your spending habits with clean visualizations.", href: "/tools/expense-tracker", icon: <LineChart className="w-5 h-5" />, color: "text-cyan-600 bg-cyan-50", tag: "Tool" },
              { title: "Mortgage Calculator", desc: "Calculate your monthly payments, total interest, and amortization schedule.", href: "/calculators/mortgage-calculator", icon: <Calculator className="w-5 h-5" />, color: "text-violet-600 bg-violet-50", tag: "Calculator" },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} className="group block h-full" data-testid={`popular-tool-${i}`}>
                <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-teal-400 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tool.color}`}>
                      {tool.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{tool.tag}</span>
                  </div>
                  <h3 className="font-bold text-base mb-1.5 group-hover:text-teal-600 transition-colors">{tool.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-grow">{tool.desc}</p>
                  <div className="font-bold text-teal-600 text-sm flex items-center">
                    Try Now <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 5. CAREER TOOLS HIGHLIGHT */}
      {/* ============================================ */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden" data-testid="career-tools-section">
        {/* Subtle grid pattern */}
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
              {[
                { title: "Resume Builder", desc: "AI-powered resume creation with 5 premium PDF templates", slug: "resume-builder", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                { title: "Salary Comparison", desc: "Compare pay against 90+ role benchmarks with location data", slug: "salary-comparison", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                { title: "Am I Underpaid?", desc: "Instant market assessment of your compensation", slug: "am-i-underpaid", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                { title: "Job Readiness", desc: "Comprehensive checklist to gauge your search preparedness", slug: "job-readiness-score", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
              ].map((tool, i) => (
                <Link key={i} href={`/career-tools/${tool.slug}`} className="group block" data-testid={`career-card-${i}`}>
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

      {/* ============================================ */}
      {/* 6. WHAT-IF / FUTURE PLANNING */}
      {/* ============================================ */}
      <section className="py-20 md:py-24" data-testid="what-if-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-3">See How Your Future Could Change</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
              Tweak income, savings, debt, and investment assumptions to explore where your decisions could lead.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-2/5 p-6 md:p-8 border-r border-gray-100">
                <div className="mb-6">
                  <span className="text-xs font-bold text-gray-700 block mb-3">Personal Information</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] text-gray-400 mb-1">Current Age</div>
                      <div className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900">30</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 mb-1">Retirement Age</div>
                      <div className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900">65</div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <span className="text-xs font-bold text-gray-700 block mb-4">Financial Status</span>
                  <div className="space-y-4">
                    <SliderPreview label="Income (Monthly)" value="$5,000" color="#0f766e" pct={40} />
                    <SliderPreview label="Savings Rate" value="25%" color="#06b6d4" pct={33} />
                    <SliderPreview label="Expenses (Monthly)" value="$3,000" color="#3b82f6" pct={20} />
                  </div>
                </div>
                
                <div className="mb-6">
                  <span className="text-xs font-bold text-gray-700 block mb-4">Investment Return</span>
                  <SliderPreview label="Expected Return Rate" value="6%" color="#8b5cf6" pct={40} />
                </div>
                
                <Link href="/what-if" className="block w-full bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-lg px-6 py-3 font-bold text-sm text-center transition-colors" data-testid="what-if-cta">
                  Explore What-If Scenarios
                </Link>
              </div>
              
              <div className="lg:w-3/5 p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="font-bold text-sm text-gray-700">Your Net Worth Over Time</div>
                  <div className="text-xs text-gray-400">Projected</div>
                </div>
                <div className="h-64 w-full" data-testid="what-if-chart">
                  <Suspense fallback={<div className="h-full flex items-center justify-center text-gray-300 text-sm">Loading chart...</div>}>
                    <LazyWhatIfChart />
                  </Suspense>
                </div>
                <div className="flex justify-center gap-6 mt-4 text-xs text-gray-400">
                  <span>At age 50: <span className="font-bold text-gray-700">$250K</span></span>
                  <span>At age 65: <span className="font-bold text-emerald-600">$1.05M</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 7. FINANCIAL CALCULATORS */}
      {/* ============================================ */}
      <section className="py-20 md:py-24 bg-stone-50/50" data-testid="calculators-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-3">Free Calculators for Real Money Decisions</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">
              Plan your mortgage, payoff debt, estimate taxes, and model investments — with transparent math.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {[
              { title: "Mortgage Calculator", desc: "Calculate monthly payments, total interest, and amortization.", slug: "mortgage-calculator", color: "text-teal-600 bg-teal-50", fields: [{ l: "Home Price", v: "$350,000" }, { l: "Down Payment", v: "20%" }, { l: "Term", v: "30 Years" }] },
              { title: "Debt Payoff Calculator", desc: "See how fast you can become debt-free.", slug: "credit-card-payoff-calculator", color: "text-orange-600 bg-orange-50", fields: [{ l: "Total Debt", v: "$15,000" }, { l: "Monthly Pmt", v: "$500" }, { l: "Interest", v: "18%" }] },
              { title: "Compound Interest", desc: "Watch your money grow over decades.", slug: "compound-interest-calculator", color: "text-blue-600 bg-blue-50", fields: [{ l: "Initial", v: "$10,000" }, { l: "Monthly", v: "$200" }, { l: "Rate", v: "7%" }] },
              { title: "Salary Reality Calculator", desc: "See your real take-home after taxes and deductions.", slug: "salary-reality-calculator", color: "text-emerald-600 bg-emerald-50", fields: [{ l: "Gross Salary", v: "$85,000" }, { l: "State", v: "California" }, { l: "Filing", v: "Single" }] },
              { title: "Tax Estimator", desc: "Estimate your federal and state tax liability.", slug: "simple-tax-estimator", color: "text-rose-600 bg-rose-50", fields: [{ l: "Income", v: "$75,000" }, { l: "Deductions", v: "Standard" }, { l: "Filing", v: "Single" }] },
              { title: "Rent vs. Buy Calculator", desc: "Should you rent or buy? Run the numbers.", slug: "rent-vs-buy-calculator", color: "text-indigo-600 bg-indigo-50", fields: [{ l: "Rent", v: "$1,800/mo" }, { l: "Home Price", v: "$350K" }, { l: "Timeline", v: "10 Years" }] },
            ].map((calc, i) => (
              <Link key={i} href={`/calculators/${calc.slug}`} className="group block h-full" data-testid={`calc-card-${i}`}>
                <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-teal-400 flex flex-col">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${calc.color}`}>
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base mb-1.5 group-hover:text-teal-600 transition-colors">{calc.title}</h3>
                  <p className="text-gray-500 text-xs mb-4 flex-grow">{calc.desc}</p>
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                    {calc.fields.map((f, fi) => (
                      <div key={fi} className="flex justify-between text-[10px] mb-1 last:mb-0">
                        <span className="text-gray-400">{f.l}</span>
                        <span className="font-semibold text-gray-700">{f.v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="font-bold text-teal-600 text-sm flex items-center">
                    Calculate <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/calculators" className="inline-block border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-lg px-8 py-3 font-bold text-sm transition-colors" data-testid="view-all-calculators">
              View All 39+ Calculators
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 8. PRODUCTIVE TOOLS */}
      {/* ============================================ */}
      <section className="py-20 md:py-24" data-testid="productive-tools-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-3">Everyday Tools That Save You Time and Money</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">
              Hands-on utilities to manage invoices, track spending, split bills, and stay on top of your finances.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {[
              { title: "Freelance Invoice Generator", desc: "Create professional invoices and download as PDF.", slug: "freelance-invoice-generator", color: "text-amber-600 bg-amber-50" },
              { title: "Subscription Cost Analyzer", desc: "Track monthly subscriptions and find what to cut.", slug: "subscription-cost-analyzer", color: "text-rose-600 bg-rose-50" },
              { title: "Bill Split Tool", desc: "Split bills fairly among friends or roommates.", slug: "bill-split-tool", color: "text-blue-600 bg-blue-50" },
              { title: "Net Worth Calculator", desc: "Calculate your total assets minus liabilities.", slug: "net-worth-calculator", color: "text-emerald-600 bg-emerald-50" },
              { title: "Income Tracker", desc: "Log income entries and visualize earning patterns.", slug: "income-tracker", color: "text-violet-600 bg-violet-50" },
              { title: "Expense Tracker", desc: "Record expenses and understand spending habits.", slug: "expense-tracker", color: "text-cyan-600 bg-cyan-50" },
            ].map((tool, i) => (
              <Link key={i} href={`/tools/${tool.slug}`} className="group block h-full" data-testid={`tool-card-${i}`}>
                <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-teal-400 flex flex-col">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${tool.color}`}>
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base mb-1.5 group-hover:text-teal-600 transition-colors">{tool.title}</h3>
                  <p className="text-gray-500 text-xs mb-4 flex-grow">{tool.desc}</p>
                  <div className="font-bold text-teal-600 text-sm flex items-center">
                    Use Tool <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/tools" className="inline-block border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-lg px-8 py-3 font-bold text-sm transition-colors" data-testid="view-all-tools">
              View All Tools
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 9. ARTICLES & GUIDES */}
      {/* ============================================ */}
      <section className="py-20 md:py-24 bg-stone-50/50" data-testid="articles-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-3">Learn With RealProfits</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm mb-8">
              Practical guides and insights that pair with our tools to help you understand money decisions better.
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {[
                { label: "All Articles", href: "/search" },
                { label: "Taxes", href: "/category/taxes" },
                { label: "Debt", href: "/category/debt-credit" },
                { label: "Investing", href: "/category/saving-vs-investing" },
                { label: "Budgeting", href: "/category/money-basics" },
                { label: "Guides", href: "/guides" },
              ].map((tab, i) => (
                <Link key={i} href={tab.href} className={`px-5 py-2 rounded-lg text-xs font-bold transition-colors ${i === 0 ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {latestArticles.length > 0 && (
              <Link href={`/articles/${latestArticles[0].slug}`} className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="h-48 w-full bg-gradient-to-br from-amber-100 to-orange-200 relative overflow-hidden flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-amber-600/30" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-2">
                    {categories.find(c => c.slug === latestArticles[0].categorySlug)?.name || 'Finance'}
                  </span>
                  <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {latestArticles[0].title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-grow">{latestArticles[0].excerpt}</p>
                  <span className="text-xs text-gray-400">{latestArticles[0].readTime} min read</span>
                </div>
              </Link>
            )}
            
            <div className="flex flex-col gap-4">
              {latestArticles.slice(1, 4).map((article, i) => (
                <Link key={article.slug} href={`/articles/${article.slug}`} className="group flex bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-md transition-all h-full">
                  <div className={`w-28 md:w-36 flex-shrink-0 ${i === 0 ? 'bg-gradient-to-br from-sky-100 to-blue-200' : i === 1 ? 'bg-gradient-to-br from-emerald-100 to-teal-200' : 'bg-gradient-to-br from-violet-100 to-purple-200'} flex items-center justify-center`}>
                    <BookOpen className="w-7 h-7 text-gray-400/40" />
                  </div>
                  <div className="p-4 flex flex-col justify-center flex-grow">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-1">
                      {categories.find(c => c.slug === article.categorySlug)?.name || 'Finance'}
                    </span>
                    <h3 className="font-bold text-sm mb-1 group-hover:text-teal-600 transition-colors line-clamp-2">{article.title}</h3>
                    <span className="text-[10px] text-gray-400">{article.readTime} min read</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <Link href="/search" className="inline-block border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-lg px-8 py-3 font-bold text-sm transition-colors">
              Read More Articles
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 10. TRUST SECTION */}
      {/* ============================================ */}
      <section className="py-20 md:py-24" data-testid="trust-section">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-3">Built to Be Useful. Designed to Be Trusted.</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">
              No signup walls, no data selling, no confusion. Just practical tools for real decisions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Privacy First", desc: "Your data stays on your device. We don't sell it, share it, or track what you enter.", icon: <Shield className="w-6 h-6 text-teal-600" /> },
              { title: "Clear Calculations", desc: "Transparent, data-driven math you can verify. No black boxes, no guesswork.", icon: <BarChart3 className="w-6 h-6 text-teal-600" /> },
              { title: "Free and Practical", desc: "No premium tiers for core tools. Use everything, no signup required for most features.", icon: <Heart className="w-6 h-6 text-teal-600" /> },
              { title: "Built for Real People", desc: "Made for everyday decisions — not finance pros. Clear language, useful defaults.", icon: <Lock className="w-6 h-6 text-teal-600" /> },
            ].map((card, i) => (
              <div key={i} className="text-center" data-testid={`trust-card-${i}`}>
                <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-5 border border-teal-100">
                  {card.icon}
                </div>
                <h3 className="font-bold text-base mb-2">{card.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

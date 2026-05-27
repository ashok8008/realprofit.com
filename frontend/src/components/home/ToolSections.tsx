"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowRight, Calculator, Briefcase, TrendingUp, BookOpen,
  FileText, DollarSign, HelpCircle, PiggyBank, Wallet, Receipt, LineChart
} from "lucide-react";

export function StartHereSection() {
  return (
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
          ].map((item) => (
            <Link key={item.href} href={item.href} className={`group flex flex-col items-center text-center gap-2.5 p-4 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5 ${item.color}`} data-testid={`start-here-card-${item.q}`}>
              {item.icon}
              <span className="text-xs font-bold leading-tight">{item.q}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PillarCardsSection() {
  return (
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
            { title: "Financial Calculators", desc: "Taxes, salary, savings, debt, mortgage, investing — 39+ free calculators for every money question.", icon: <Calculator className="w-6 h-6" />, color: "text-teal-600 bg-teal-50", borderHover: "hover:border-teal-400", href: "/calculators", cta: "Browse Calculators", count: "39+" },
            { title: "Everyday Tools", desc: "Invoice generator, expense tracker, subscription analyzer, bill split — hands-on utilities that save time.", icon: <Briefcase className="w-6 h-6" />, color: "text-amber-600 bg-amber-50", borderHover: "hover:border-amber-400", href: "/tools", cta: "View Tools", count: "7" },
            { title: "Career Tools", desc: "Resume builder, salary comparison, underpaid tool, job readiness — grow your income, not just track it.", icon: <TrendingUp className="w-6 h-6" />, color: "text-blue-600 bg-blue-50", borderHover: "hover:border-blue-400", href: "/career-tools", cta: "Explore Career Tools", count: "10" },
            { title: "Future Planning", desc: "What-if scenarios, salary guides, decision support — see where your choices could lead before committing.", icon: <BookOpen className="w-6 h-6" />, color: "text-violet-600 bg-violet-50", borderHover: "hover:border-violet-400", href: "/what-if", cta: "Plan Your Future", count: "130+" },
          ].map((pillar) => (
            <Link key={pillar.href} href={pillar.href} className={`group block rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1 ${pillar.borderHover}`} data-testid={`pillar-card-${pillar.title}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pillar.color}`}>{pillar.icon}</div>
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
  );
}

export function PopularToolsSection() {
  return (
    <section className="py-20 md:py-24 bg-stone-50/50" data-testid="popular-tools-section">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-3">Popular Tools Right Now</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm">The tools people use most — start with any of these.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: "Resume Builder", desc: "Create a polished, ATS-friendly resume with AI-powered suggestions. Download as premium PDF.", href: "/career-tools/resume-builder", icon: <FileText className="w-5 h-5" />, color: "text-blue-600 bg-blue-50", tag: "AI-Powered" },
            { title: "Salary Comparison", desc: "Compare your pay against market benchmarks for your role, experience, and location.", href: "/career-tools/salary-comparison", icon: <DollarSign className="w-5 h-5" />, color: "text-emerald-600 bg-emerald-50", tag: "Career" },
            { title: "Am I Underpaid?", desc: "Find out in 30 seconds if your compensation is below, at, or above market rate.", href: "/career-tools/am-i-underpaid", icon: <HelpCircle className="w-5 h-5" />, color: "text-amber-600 bg-amber-50", tag: "Career" },
            { title: "Freelance Invoice Generator", desc: "Create professional invoices and get paid online. Client management, payment links, 3 templates and PDF download.", href: "/tools/freelance-invoice-generator", icon: <Receipt className="w-5 h-5" />, color: "text-orange-600 bg-orange-50", tag: "Tool" },
            { title: "eSign Tool", desc: "Sign any PDF free. Up to 5 signers, audit trail, QR verification. Better than DocuSign.", href: "/tools/esign", icon: <FileText className="w-5 h-5" />, color: "text-teal-700 bg-teal-50", tag: "NEW" },
            { title: "Mortgage Calculator", desc: "Calculate your monthly payments, total interest, and amortization schedule.", href: "/calculators/mortgage-calculator", icon: <Calculator className="w-5 h-5" />, color: "text-violet-600 bg-violet-50", tag: "Calculator" },
          ].map((tool, i) => (
            <Link key={tool.href} href={tool.href} className="group block h-full" data-testid={`popular-tool-${i}`}>
              <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-teal-400 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tool.color}`}>{tool.icon}</div>
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
  );
}

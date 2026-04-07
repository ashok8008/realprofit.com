"use client";
import React, { lazy, Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, Briefcase } from "lucide-react";

const LazyWhatIfChart = lazy(() => import("@/components/home/WhatIfChart"));

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

export function WhatIfPreviewSection() {
  return (
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
                  <div><div className="text-[10px] text-gray-400 mb-1">Current Age</div><div className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900">30</div></div>
                  <div><div className="text-[10px] text-gray-400 mb-1">Retirement Age</div><div className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900">65</div></div>
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
  );
}

export function CalculatorsShowcaseSection() {
  return (
    <section className="py-20 md:py-24 bg-stone-50/50" data-testid="calculators-section">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-3">Free Calculators for Real Money Decisions</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm">Plan your mortgage, payoff debt, estimate taxes, and model investments — with transparent math.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {[
            { title: "Mortgage Calculator", desc: "Calculate monthly payments, total interest, and amortization.", slug: "mortgage-calculator", color: "text-teal-600 bg-teal-50", fields: [{ l: "Home Price", v: "$350,000" }, { l: "Down Payment", v: "20%" }, { l: "Term", v: "30 Years" }] },
            { title: "Debt Payoff Calculator", desc: "See how fast you can become debt-free.", slug: "credit-card-payoff-calculator", color: "text-orange-600 bg-orange-50", fields: [{ l: "Total Debt", v: "$15,000" }, { l: "Monthly Pmt", v: "$500" }, { l: "Interest", v: "18%" }] },
            { title: "Compound Interest", desc: "Watch your money grow over decades.", slug: "compound-interest-calculator", color: "text-blue-600 bg-blue-50", fields: [{ l: "Initial", v: "$10,000" }, { l: "Monthly", v: "$200" }, { l: "Rate", v: "7%" }] },
            { title: "Salary Reality Calculator", desc: "See your real take-home after taxes and deductions.", slug: "salary-reality-calculator", color: "text-emerald-600 bg-emerald-50", fields: [{ l: "Gross Salary", v: "$85,000" }, { l: "State", v: "California" }, { l: "Filing", v: "Single" }] },
            { title: "Tax Estimator", desc: "Estimate your federal and state tax liability.", slug: "simple-tax-estimator", color: "text-rose-600 bg-rose-50", fields: [{ l: "Income", v: "$75,000" }, { l: "Deductions", v: "Standard" }, { l: "Filing", v: "Single" }] },
            { title: "Rent vs. Buy Calculator", desc: "Should you rent or buy? Run the numbers.", slug: "rent-vs-buy-calculator", color: "text-indigo-600 bg-indigo-50", fields: [{ l: "Rent", v: "$1,800/mo" }, { l: "Home Price", v: "$350K" }, { l: "Timeline", v: "10 Years" }] },
          ].map((calc) => (
            <Link key={calc.slug} href={`/calculators/${calc.slug}`} className="group block h-full" data-testid={`calc-card-${calc.slug}`}>
              <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-teal-400 flex flex-col">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${calc.color}`}><Calculator className="w-5 h-5" /></div>
                <h3 className="font-bold text-base mb-1.5 group-hover:text-teal-600 transition-colors">{calc.title}</h3>
                <p className="text-gray-500 text-xs mb-4 flex-grow">{calc.desc}</p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                  {calc.fields.map((f) => (
                    <div key={f.l} className="flex justify-between text-[10px] mb-1 last:mb-0">
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
  );
}

export function ProductiveToolsSection() {
  return (
    <section className="py-20 md:py-24" data-testid="productive-tools-section">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-3">Everyday Tools That Save You Time and Money</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm">Hands-on utilities to manage invoices, track spending, split bills, and stay on top of your finances.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {[
            { title: "Freelance Invoice Generator", desc: "Create professional invoices and download as PDF.", slug: "freelance-invoice-generator", color: "text-amber-600 bg-amber-50" },
            { title: "Subscription Cost Analyzer", desc: "Track monthly subscriptions and find what to cut.", slug: "subscription-cost-analyzer", color: "text-rose-600 bg-rose-50" },
            { title: "Bill Split Tool", desc: "Split bills fairly among friends or roommates.", slug: "bill-split-tool", color: "text-blue-600 bg-blue-50" },
            { title: "Net Worth Calculator", desc: "Calculate your total assets minus liabilities.", slug: "net-worth-calculator", color: "text-emerald-600 bg-emerald-50" },
            { title: "Income Tracker", desc: "Log income entries and visualize earning patterns.", slug: "income-tracker", color: "text-violet-600 bg-violet-50" },
            { title: "Expense Tracker", desc: "Record expenses and understand spending habits.", slug: "expense-tracker", color: "text-cyan-600 bg-cyan-50" },
          ].map((tool) => (
            <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group block h-full" data-testid={`tool-card-${tool.slug}`}>
              <div className="h-full rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-teal-400 flex flex-col">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${tool.color}`}><Briefcase className="w-5 h-5" /></div>
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
  );
}

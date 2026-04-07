"use client";
import React from "react";
import Link from "next/link";
import { Seo } from "@/components/Seo";
import { taxTools, TaxToolDef } from "@/data/tax-tools";
import {
  ArrowRight, Calculator, ClipboardList, FileText, Receipt,
  Briefcase, PieChart, CheckSquare, Package, Shield, Clock, DollarSign,
} from "lucide-react";

const sectionMeta: Record<string, { title: string; description: string; color: string }> = {
  calculators: { title: "Tax Calculators", description: "Quick estimates for income tax, self-employment tax, and quarterly payments.", color: "border-l-blue-500" },
  planning: { title: "Tax Planning", description: "Plan your taxes across income sources, generate checklists, and map quarterly schedules.", color: "border-l-emerald-500" },
  "irs-prep": { title: "IRS Prep Tools", description: "Organize your tax documents and generate prep worksheets. Not for IRS submission.", color: "border-l-amber-500" },
};

const toolIcons: Record<string, { icon: React.ReactNode; bg: string }> = {
  "simple-tax": { icon: <Calculator className="w-5 h-5" />, bg: "bg-blue-100 text-blue-600" },
  "self-employment-tax": { icon: <Receipt className="w-5 h-5" />, bg: "bg-orange-100 text-orange-600" },
  "tax-set-aside": { icon: <DollarSign className="w-5 h-5" />, bg: "bg-teal-100 text-teal-600" },
  "quarterly-tax": { icon: <ClipboardList className="w-5 h-5" />, bg: "bg-violet-100 text-violet-600" },
  "freelancer-tax-planner": { icon: <Briefcase className="w-5 h-5" />, bg: "bg-emerald-100 text-emerald-600" },
  "income-mix-planner": { icon: <PieChart className="w-5 h-5" />, bg: "bg-cyan-100 text-cyan-600" },
  "tax-checklist": { icon: <CheckSquare className="w-5 h-5" />, bg: "bg-rose-100 text-rose-600" },
  "1040es-prep": { icon: <FileText className="w-5 h-5" />, bg: "bg-amber-100 text-amber-600" },
  "schedule-c-prep": { icon: <Receipt className="w-5 h-5" />, bg: "bg-lime-100 text-lime-600" },
  "tax-summary-pdf": { icon: <FileText className="w-5 h-5" />, bg: "bg-sky-100 text-sky-600" },
  "w2-1099-organizer": { icon: <ClipboardList className="w-5 h-5" />, bg: "bg-indigo-100 text-indigo-600" },
  "year-end-packet": { icon: <Package className="w-5 h-5" />, bg: "bg-pink-100 text-pink-600" },
};

function getToolHref(tool: TaxToolDef): string {
  if (tool.section === "calculators") {
    return `/calculators/${tool.slug}`;
  }
  return `/tax-tools/${tool.slug}`;
}

export default function TaxToolsHub() {
  const sections = ["calculators", "planning", "irs-prep"] as const;

  return (
    <div className="w-full" data-testid="tax-tools-hub">
      <Seo
        title="Tax Tools - Free Tax Calculators, Planning & IRS Prep"
        description="Free tax tools for freelancers and employees. Estimate income tax, plan quarterly payments, organize W-2s and 1099s, and generate prep worksheets. No IRS filing — prep only."
        keywords="tax calculator, quarterly tax, self employment tax, 1040-ES, schedule c, tax planning, freelance tax, irs prep, w2 organizer, tax tools"
        path="/tax-tools"
      />

      {/* Hero */}
      <section className="hero-gradient py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-4">
                <span className="text-xs font-bold text-white">PREP ONLY</span>
                <span className="text-xs text-white/80">No IRS submission</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" data-testid="tax-tools-hero-title">
                Tax Tools Built for Real People
              </h1>
              <p className="text-base text-white/80 mb-6 max-w-md leading-relaxed">
                Estimate taxes, plan quarterly payments, organize W-2s and 1099s, and generate prep worksheets — all free, all in your browser.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="#all-tools" className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-full px-7 py-3 font-bold text-sm transition-colors inline-block shadow-lg" data-testid="explore-tools-btn">
                  Explore All Tools
                </Link>
                <Link href="/tax-tools/freelancer-tax-planner" className="bg-white/10 text-white hover:bg-white/20 border border-white/30 rounded-full px-7 py-3 font-bold text-sm transition-colors inline-block">
                  Plan My Taxes
                </Link>
              </div>
            </div>

            <div className="lg:w-1/2 relative h-[350px] hidden lg:block">
              <div className="absolute top-0 right-16 bg-white rounded-xl p-4 shadow-2xl rotate-3 w-56 z-20">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Tax Estimator</div>
                <div className="text-2xl font-bold text-gray-900">$12,450</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">Effective: 16.6%</div>
                <div className="mt-2 flex gap-1">
                  <span className="bg-red-100 text-[8px] px-2 py-0.5 rounded-full text-red-700">Federal</span>
                  <span className="bg-amber-100 text-[8px] px-2 py-0.5 rounded-full text-amber-700">State</span>
                  <span className="bg-orange-100 text-[8px] px-2 py-0.5 rounded-full text-orange-700">SE</span>
                </div>
              </div>
              <div className="absolute top-28 right-0 bg-white rounded-xl p-4 shadow-2xl -rotate-2 w-48 z-30">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Quarterly Due</div>
                <div className="text-lg font-bold text-gray-900">$3,112 /qtr</div>
                <div className="text-[10px] text-gray-500 mt-1">Next: April 15</div>
              </div>
              <div className="absolute bottom-4 right-20 bg-white rounded-xl p-4 shadow-2xl rotate-2 w-52 z-10">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Year-End Packet</div>
                <div className="flex items-center gap-2">
                  <FileText className="w-8 h-8 text-teal-600" />
                  <div>
                    <div className="text-sm font-bold">PDF Ready</div>
                    <div className="text-[10px] text-gray-500">6 sections</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-6 bg-amber-50 border-b border-amber-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-amber-800">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> <span>100% Private — data stays in your browser</span></div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> <span>Free forever — no signup required</span></div>
            <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> <span>Informational estimates only — not tax advice</span></div>
          </div>
        </div>
      </section>

      {/* Popular Tools Quick Links */}
      <section className="py-16 bg-gray-50 border-b">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold mb-3">Most Popular Tax Tools</h2>
            <p className="text-gray-500">Start here for quick tax estimates and planning</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["simple-tax", "freelancer-tax-planner", "year-end-packet"].map(id => {
              const tool = taxTools.find(t => t.id === id);
              if (!tool) return null;
              const iconData = toolIcons[tool.id];
              return (
                <Link key={tool.slug} href={getToolHref(tool)} className="group" data-testid={`popular-${tool.id}`}>
                  <div className="bg-white border rounded-xl p-6 h-full shadow-sm hover:shadow-lg transition-all hover:border-teal-400 hover:-translate-y-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconData?.bg || "bg-gray-100"}`}>
                      {iconData?.icon}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg group-hover:text-teal-600 transition-colors">{tool.name}</h3>
                      {tool.tag && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{tool.tag}</span>}
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{tool.description}</p>
                    <span className="text-teal-600 font-bold text-sm flex items-center">
                      Use Tool <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Tools by Section */}
      <div id="all-tools" className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">All Tax Tools</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Calculators, planners, and IRS prep worksheets — everything you need for tax season.</p>
        </div>

        {sections.map(sectionKey => {
          const meta = sectionMeta[sectionKey];
          const sectionTools = taxTools.filter(t => t.section === sectionKey);
          if (sectionTools.length === 0) return null;
          return (
            <div key={sectionKey} className={`mb-14 last:mb-0 border-l-4 ${meta.color} pl-6`} data-testid={`section-${sectionKey}`}>
              <h3 className="font-serif text-2xl font-bold mb-2">{meta.title}</h3>
              <p className="text-sm text-muted-foreground mb-6">{meta.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sectionTools.map(tool => {
                  const iconData = toolIcons[tool.id] || { icon: <Calculator className="w-5 h-5" />, bg: "bg-gray-100 text-gray-600" };
                  return (
                    <Link key={tool.slug} href={getToolHref(tool)} className="group h-full block" data-testid={`tool-card-${tool.id}`}>
                      <div className="bg-white border rounded-xl p-5 h-full shadow-sm hover:shadow-md transition-all hover:border-teal-400 flex flex-col">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconData.bg}`}>
                            {iconData.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-sm group-hover:text-teal-600 transition-colors">{tool.name}</h4>
                              {tool.tag && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{tool.tag}</span>}
                            </div>
                            <p className="text-gray-500 text-xs line-clamp-2">{tool.description}</p>
                          </div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-50">
                          <span className="text-teal-600 font-bold text-xs flex items-center">
                            Use Tool <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compliance / Trust Section */}
      <section className="py-16 bg-gray-50 border-t">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-3">What These Tools Are (and Aren't)</h2>
            <p className="text-gray-500">Transparency about our tax tools</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">They Are</h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>Educational tax estimators</li>
                <li>Filing prep organizers</li>
                <li>Planning and budgeting tools</li>
                <li>PDF worksheets for your records</li>
              </ul>
            </div>
            <div className="bg-white border rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">They Are NOT</h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>Official IRS forms or returns</li>
                <li>Tax filing or submission tools</li>
                <li>Substitutes for professional advice</li>
                <li>Guaranteed-accurate calculations</li>
              </ul>
            </div>
            <div className="bg-white border rounded-xl p-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Your Privacy</h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>All calculations run in your browser</li>
                <li>No financial data sent to servers</li>
                <li>No account required to use any tool</li>
                <li>Sign in only for optional cloud sync</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#0d9488] via-[#0ea5a5] to-[#14b8c2]">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-serif text-3xl font-bold mb-4 text-white">Ready for Tax Season?</h2>
          <p className="text-white/80 mb-6">Generate your complete year-end tax packet in minutes.</p>
          <Link href="/tax-tools/year-end-tax-packet" className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-full px-8 py-3 font-bold text-sm transition-colors inline-block shadow-lg" data-testid="cta-year-end">
            Create My Tax Packet
          </Link>
        </div>
      </section>
    </div>
  );
}

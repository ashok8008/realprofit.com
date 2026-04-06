import React from "react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { salaryEntries, taxEntries, savingsEntries, mortgageEntries, debtEntries, freelancerEntries, getTotalPageCount } from "@/lib/pseo/datasets";

const fmt = (n: number) => n.toLocaleString("en-US");

function GuideGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">{children}</div>;
}

function GuideCard({ href, label, sublabel }: { href: string; label: string; sublabel: string }) {
  return (
    <Link href={href} className="block bg-white border rounded-xl p-4 hover:border-teal-400 hover:shadow-md transition-all group" data-testid={`guide-card-${href.split('/').pop()}`}>
      <span className="block font-bold text-lg group-hover:text-teal-600 transition-colors">{label}</span>
      <span className="text-xs text-muted-foreground">{sublabel}</span>
    </Link>
  );
}

export default function GuidesHub() {
  const totalPages = getTotalPageCount();

  return (
    <>
      <Seo
        title="Financial Guides"
        description={`Browse ${totalPages}+ free financial guides covering salary breakdowns, tax calculations, savings plans, mortgage analysis, debt payoff strategies, and freelancer tax planning.`}
        keywords="financial guides, salary breakdown, tax calculation, savings plan, mortgage calculator, debt payoff, freelance tax, self employment tax, personal finance"
        path="/guides"
      />

      <div className="bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-teal-600">Home</Link>
            <span>&rsaquo;</span>
            <span>Guides</span>
          </nav>

          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="guides-hub-title">Financial Guides</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mb-12">
            {totalPages}+ data-driven guides with real calculations for your specific salary, tax bracket, savings goal, mortgage, debt, or freelance income. Pick a number that matches your situation.
          </p>

          {/* Salary */}
          <section className="mb-16" data-testid="salary-guides-section">
            <h2 className="font-serif text-2xl font-bold mb-2">Salary Guides</h2>
            <p className="text-muted-foreground mb-6">Find out what your salary really means after taxes, how it compares nationally, and what you can afford.</p>
            <GuideGrid>
              {salaryEntries.map(s => (
                <GuideCard key={s.slug} href={`/guides/${s.slug}`} label={`$${fmt(s.value)}`} sublabel={s.context} />
              ))}
            </GuideGrid>
          </section>

          {/* Tax */}
          <section className="mb-16" data-testid="tax-guides-section">
            <h2 className="font-serif text-2xl font-bold mb-2">Tax on Income Guides</h2>
            <p className="text-muted-foreground mb-6">See exactly how much tax you owe on any income level, with federal, state, and FICA breakdowns.</p>
            <GuideGrid>
              {taxEntries.map(t => (
                <GuideCard key={t.slug} href={`/guides/${t.slug}`} label={`$${fmt(t.value)}`} sublabel="Tax Breakdown" />
              ))}
            </GuideGrid>
          </section>

          {/* Savings */}
          <section className="mb-16" data-testid="savings-guides-section">
            <h2 className="font-serif text-2xl font-bold mb-2">Savings Goal Guides</h2>
            <p className="text-muted-foreground mb-6">Get a step-by-step plan to save any amount, with monthly and weekly targets across different timelines.</p>
            <GuideGrid>
              {savingsEntries.map(s => (
                <GuideCard key={s.slug} href={`/guides/${s.slug}`} label={`$${fmt(s.value)}`} sublabel={s.context} />
              ))}
            </GuideGrid>
          </section>

          {/* Mortgage */}
          <section className="mb-16" data-testid="mortgage-guides-section">
            <h2 className="font-serif text-2xl font-bold mb-2">Mortgage Guides</h2>
            <p className="text-muted-foreground mb-6">See monthly payments, total interest, and how rates and terms affect the true cost of your home loan.</p>
            <GuideGrid>
              {mortgageEntries.filter(m => m.variant === "base").map(m => (
                <GuideCard key={m.slug} href={`/guides/${m.slug}`} label={`$${fmt(m.value)}`} sublabel={`${m.rate}% / ${m.term}yr`} />
              ))}
            </GuideGrid>
            <details className="mt-4">
              <summary className="text-sm font-medium text-teal-600 cursor-pointer hover:text-teal-800">Show rate & term variations ({mortgageEntries.filter(m => m.variant !== "base").length} more guides)</summary>
              <div className="mt-3">
                <GuideGrid>
                  {mortgageEntries.filter(m => m.variant !== "base").map(m => (
                    <GuideCard key={m.slug} href={`/guides/${m.slug}`} label={`$${fmt(m.value)}`} sublabel={m.variant === "rate" ? `${m.rate}% rate` : `${m.term}-year term`} />
                  ))}
                </GuideGrid>
              </div>
            </details>
          </section>

          {/* Debt */}
          <section className="mb-16" data-testid="debt-guides-section">
            <h2 className="font-serif text-2xl font-bold mb-2">Debt Payoff Guides</h2>
            <p className="text-muted-foreground mb-6">See exactly how long it takes to pay off your debt and how much interest you'll save with aggressive payments.</p>
            <GuideGrid>
              {debtEntries.filter(d => d.variant === "payoff").map(d => (
                <GuideCard key={d.slug} href={`/guides/${d.slug}`} label={`$${fmt(d.value)}`} sublabel="Payoff Strategy" />
              ))}
            </GuideGrid>
            <details className="mt-4">
              <summary className="text-sm font-medium text-teal-600 cursor-pointer hover:text-teal-800">Show interest analysis guides ({debtEntries.filter(d => d.variant === "interest").length} more)</summary>
              <div className="mt-3">
                <GuideGrid>
                  {debtEntries.filter(d => d.variant === "interest").map(d => (
                    <GuideCard key={d.slug} href={`/guides/${d.slug}`} label={`$${fmt(d.value)}`} sublabel="Interest Analysis" />
                  ))}
                </GuideGrid>
              </div>
            </details>
          </section>

          {/* Freelancer */}
          <section className="mb-16" data-testid="freelancer-guides-section">
            <h2 className="font-serif text-2xl font-bold mb-2">Freelancer & Self-Employment Tax Guides</h2>
            <p className="text-muted-foreground mb-6">Understand self-employment tax, how much to set aside, and quarterly payment schedules for any freelance income.</p>
            <GuideGrid>
              {freelancerEntries.filter(f => f.variant === "se-tax").map(f => (
                <GuideCard key={f.slug} href={`/guides/${f.slug}`} label={`$${fmt(f.value)}`} sublabel="SE Tax" />
              ))}
            </GuideGrid>
            <details className="mt-4">
              <summary className="text-sm font-medium text-teal-600 cursor-pointer hover:text-teal-800">Show tax set-aside guides ({freelancerEntries.filter(f => f.variant === "set-aside").length} more)</summary>
              <div className="mt-3">
                <GuideGrid>
                  {freelancerEntries.filter(f => f.variant === "set-aside").map(f => (
                    <GuideCard key={f.slug} href={`/guides/${f.slug}`} label={`$${fmt(f.value)}`} sublabel="Tax Set-Aside" />
                  ))}
                </GuideGrid>
              </div>
            </details>
          </section>

        </div>
      </div>
    </>
  );
}

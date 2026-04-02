import React from "react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { salaryLevels, taxOnIncome } from "@/data/pseo/salary-levels";
import { savingsTargets } from "@/data/pseo/savings-targets";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function GuidesHub() {
  return (
    <>
      <Seo
        title="Financial Guides"
        description="Browse 129+ free financial guides covering salary breakdowns, tax calculations, and savings plans for every income level."
        keywords="financial guides, salary breakdown, tax calculation guide, savings plan, income analysis, how much tax on salary, is my salary good, savings goal guide, personal finance guide, money guide"
        path="/guides"
      />

      <div className="bg-gradient-to-br from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-teal-600">Home</Link>
            <span>›</span>
            <span>Guides</span>
          </nav>

          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Financial Guides</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mb-12">
            Data-driven guides with real calculations for your specific salary, tax bracket, or savings goal. Pick a number that matches your situation.
          </p>

          <section className="mb-16">
            <h2 className="font-serif text-2xl font-bold mb-2">Salary Guides</h2>
            <p className="text-muted-foreground mb-6">
              Find out what your salary really means after taxes, how it compares nationally, and what you can afford.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {salaryLevels.map((s) => (
                <Link
                  key={s.slug}
                  href={`/guides/${s.slug}`}
                  className="block bg-white border rounded-xl p-4 hover:border-teal-400 hover:shadow-md transition-all group"
                >
                  <span className="block font-bold text-lg group-hover:text-teal-600 transition-colors">
                    ${fmt(s.amount)}
                  </span>
                  <span className="text-xs text-muted-foreground">{s.context}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="font-serif text-2xl font-bold mb-2">Tax on Income Guides</h2>
            <p className="text-muted-foreground mb-6">
              See exactly how much tax you owe on any income level, with federal, state, and FICA breakdowns.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {taxOnIncome.map((t) => (
                <Link
                  key={t.slug}
                  href={`/guides/${t.slug}`}
                  className="block bg-white border rounded-xl p-4 hover:border-teal-400 hover:shadow-md transition-all group"
                >
                  <span className="block font-bold text-lg group-hover:text-teal-600 transition-colors">
                    ${fmt(t.amount)}
                  </span>
                  <span className="text-xs text-muted-foreground">Tax Breakdown</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="font-serif text-2xl font-bold mb-2">Savings Goal Guides</h2>
            <p className="text-muted-foreground mb-6">
              Get a step-by-step plan to save any amount, with monthly and weekly targets across different timelines.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {savingsTargets.map((s) => (
                <Link
                  key={s.slug}
                  href={`/guides/${s.slug}`}
                  className="block bg-white border rounded-xl p-4 hover:border-teal-400 hover:shadow-md transition-all group"
                >
                  <span className="block font-bold text-lg group-hover:text-teal-600 transition-colors">
                    ${fmt(s.amount)}
                  </span>
                  <span className="text-xs text-muted-foreground">{s.context}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

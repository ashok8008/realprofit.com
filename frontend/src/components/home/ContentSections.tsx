"use client";
import React from "react";
import Link from "next/link";
import { BookOpen, Shield, BarChart3, Heart, Lock } from "lucide-react";
import { articles } from "@/data/articles";
import { categories } from "@/data/categories";

export function ArticlesSection() {
  const latestArticles = [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  return (
    <section className="py-20 md:py-24 bg-stone-50/50" data-testid="articles-section">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-3">Learn With RealProfits</h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm mb-8">Practical guides and insights that pair with our tools to help you understand money decisions better.</p>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {[
              { label: "All Articles", href: "/search" },
              { label: "Taxes", href: "/category/taxes" },
              { label: "Debt", href: "/category/debt-credit" },
              { label: "Investing", href: "/category/saving-vs-investing" },
              { label: "Budgeting", href: "/category/money-basics" },
              { label: "Guides", href: "/guides" },
            ].map((tab) => (
              <Link key={tab.href} href={tab.href} className={`px-5 py-2 rounded-lg text-xs font-bold transition-colors ${tab.href === '/search' ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
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
                <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">{latestArticles[0].title}</h3>
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
  );
}

export function TrustSection() {
  return (
    <section className="py-20 md:py-24" data-testid="trust-section">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-3">Built to Be Useful. Designed to Be Trusted.</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm">No signup walls, no data selling, no confusion. Just practical tools for real decisions.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Privacy First", desc: "Your data stays on your device. We don't sell it, share it, or track what you enter.", icon: <Shield className="w-6 h-6 text-teal-600" /> },
            { title: "Clear Calculations", desc: "Transparent, data-driven math you can verify. No black boxes, no guesswork.", icon: <BarChart3 className="w-6 h-6 text-teal-600" /> },
            { title: "Free and Practical", desc: "No premium tiers for core tools. Use everything, no signup required for most features.", icon: <Heart className="w-6 h-6 text-teal-600" /> },
            { title: "Built for Real People", desc: "Made for everyday decisions — not finance pros. Clear language, useful defaults.", icon: <Lock className="w-6 h-6 text-teal-600" /> },
          ].map((card) => (
            <div key={card.title} className="text-center" data-testid={`trust-card-${card.title}`}>
              <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-5 border border-teal-100">{card.icon}</div>
              <h3 className="font-bold text-base mb-2">{card.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

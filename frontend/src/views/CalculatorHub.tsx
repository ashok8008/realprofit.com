"use client";
import React from "react";
import Link from "next/link";
import { Seo } from "@/components/Seo";
import { calculators } from "@/data/calculators";
import { categories } from "@/data/categories";
import { articles } from "@/data/articles";
import { ArrowRight, Zap, Shield, BarChart3, TrendingUp, Share2, Lightbulb } from "lucide-react";

export default function CalculatorHub() {
  const calcCategory = categories.find(c => c.slug === "calculators");
  const latestArticles = articles.slice(0, 3);

  const iconColors = [
    "bg-teal-100 text-teal-600",
    "bg-blue-100 text-blue-600",
    "bg-orange-100 text-orange-600",
    "bg-green-100 text-green-600",
    "bg-purple-100 text-purple-600",
    "bg-indigo-100 text-indigo-600",
    "bg-rose-100 text-rose-600",
    "bg-amber-100 text-amber-600",
    "bg-cyan-100 text-cyan-600",
  ];
  
  return (
    <div className="w-full">
      <Seo 
        title="Financial Calculators"
        description="Interactive tools to clarify your numbers and plan your financial future."
        keywords="financial calculators, budget calculator, savings goal calculator, compound interest calculator, debt payoff calculator, tax estimator, investment growth calculator, mortgage calculator, loan calculator, retirement calculator, free online calculators"
        path="/calculators"
      />
      
      {/* Hero */}
      <section className="hero-gradient py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-4">
                <span className="text-xs font-bold text-white">100% FREE</span>
                <span className="text-xs text-white/80">No signup required</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Financial Calculators That Work for You
              </h1>
              <p className="text-base text-white/80 mb-4 max-w-md leading-relaxed">
                Make smarter financial choices with tools designed for clarity, accuracy, and speed. All calculators run instantly in your browser -- your data is never stored.
              </p>
              <Link href="#all-calculators" className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-full px-7 py-3 font-bold text-sm transition-colors inline-block shadow-lg">
                Explore All Calculators
              </Link>
            </div>
            
            <div className="lg:w-1/2 relative h-[350px] hidden lg:block">
              <div className="absolute top-0 right-16 bg-white rounded-xl p-4 shadow-2xl rotate-3 w-52 z-20">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Monthly Summary</div>
                <div className="flex gap-2 mb-2">
                  <div className="flex-1 h-16 bg-gradient-to-t from-teal-500 to-teal-300 rounded"></div>
                  <div className="flex-1 h-12 bg-gradient-to-t from-blue-500 to-blue-300 rounded mt-4"></div>
                  <div className="flex-1 h-14 bg-gradient-to-t from-amber-500 to-amber-300 rounded mt-2"></div>
                </div>
                <div className="text-xs text-gray-500">Growth: <span className="font-bold text-green-600">+12.5%</span></div>
              </div>
              
              <div className="absolute top-20 right-0 bg-white rounded-xl p-4 shadow-2xl -rotate-3 w-48 z-30">
                <div className="relative w-24 h-24 mx-auto mb-2">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="13" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                    <circle cx="18" cy="18" r="13" fill="none" stroke="#8b5cf6" strokeWidth="5" strokeDasharray="50 82" strokeLinecap="round" />
                    <circle cx="18" cy="18" r="13" fill="none" stroke="#f59e0b" strokeWidth="5" strokeDasharray="25 82" strokeDashoffset="-50" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900">$2,850</span>
                  </div>
                </div>
                <div className="text-[10px] text-center text-gray-500">Payment Breakdown</div>
              </div>
              
              <div className="absolute bottom-4 right-24 bg-white rounded-xl p-4 shadow-2xl rotate-2 w-48 z-10">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Investment ROI</div>
                <div className="flex items-end gap-1">
                  {[20, 30, 25, 40, 35, 55, 50, 65].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t" style={{ height: `${h}px`, backgroundColor: i >= 6 ? '#22c55e' : '#e5e7eb' }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Calculators */}
      <div id="all-calculators" className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Our Calculators</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Simple, fast, and insightful tools to guide your financial decisions.</p>
        </div>
        
        {calcCategory?.subcategories.map((subcat, si) => {
          const catCalcs = calculators.filter(c => c.category === subcat.slug);
          if (catCalcs.length === 0) return null;
          
          return (
            <div key={subcat.slug} className="mb-14 last:mb-0">
              <h3 className="font-serif text-2xl font-bold mb-6 border-b pb-3">{subcat.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {catCalcs.map((calc, ci) => (
                  <Link key={calc.slug} href={`/calculators/${calc.slug}`} className="group h-full block">
                    <div className="bg-white border rounded-xl p-5 h-full shadow-sm hover:shadow-md transition-all hover:border-teal-400 flex flex-col">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconColors[(si * 3 + ci) % iconColors.length]}`}>
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="12" y2="10"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm mb-1 group-hover:text-teal-600 transition-colors">{calc.name}</h4>
                          <p className="text-gray-500 text-xs line-clamp-2">{calc.description}</p>
                        </div>
                      </div>
                      <div className="mt-auto pt-3 border-t border-gray-50">
                        <span className="text-teal-600 font-bold text-xs flex items-center">
                          Try Now <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Articles Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Expert Articles & Insights</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mb-8">
              Stay informed with practical guides, expert tips, and real-world strategies to help you make smarter financial decisions every day.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {["Explore Further", "Taxes", "Debt", "Investing", "Budgeting"].map((tab, i) => (
                <button key={i} className={`px-5 py-2 rounded-full text-xs font-bold transition-colors ${i === 0 ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {latestArticles.map((article, i) => (
              <Link key={article.slug} href={`/articles/${article.slug}`} className="group flex flex-col bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all">
                <div className={`h-44 w-full ${i === 0 ? 'bg-gradient-to-br from-amber-100 to-orange-200' : i === 1 ? 'bg-gradient-to-br from-sky-100 to-blue-200' : 'bg-gradient-to-br from-emerald-100 to-teal-200'} flex items-center justify-center`}>
                  <svg className="w-10 h-10 text-gray-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-sm mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">{article.title}</h3>
                  <p className="text-gray-500 text-xs mb-3 line-clamp-2 flex-grow">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <span>Read More</span>
                    <span>{article.readTime} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/search" className="inline-block border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-full px-8 py-3 font-bold text-sm transition-colors">
              Read More Articles
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-16 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Why Choose RealProfits Tools?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Smart, simple, and accurate calculators that turn complex numbers into clear insights -- helping you make better financial choices.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: <Zap className="w-6 h-6" />, title: "Fast & Simple", desc: "Get results in under 3 seconds." },
            { icon: <Shield className="w-6 h-6" />, title: "Accurate & Trusted", desc: "Built on proven financial models." },
            { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>, title: "Secure by Design", desc: "Your data never leaves your browser." },
            { icon: <BarChart3 className="w-6 h-6" />, title: "Benchmark Insights", desc: "Compare results with national averages." },
            { icon: <Share2 className="w-6 h-6" />, title: "Easy to Share", desc: "Export to PDF/CSV in one click." },
            { icon: <Lightbulb className="w-6 h-6" />, title: "Actionable Next Steps", desc: "Clear recommendations after every result." },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

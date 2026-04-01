import React from "react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { articles } from "@/data/articles";
import { categories } from "@/data/categories";
import { ArrowRight, Shield, Lock, BarChart3, Users, Info } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, YAxis, XAxis, CartesianGrid } from "recharts";

const dummyChartData = [
  { age: 30, value: 10000 },
  { age: 35, value: 35000 },
  { age: 40, value: 80000 },
  { age: 45, value: 140000 },
  { age: 50, value: 250000 },
  { age: 55, value: 400000 },
  { age: 60, value: 650000 },
  { age: 65, value: 1050000 },
];

function SliderPreview({ label, value, color, pct }: { label: string; value: string; color: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <span className="text-xs font-bold text-gray-900">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );
}

export default function Home() {
  const latestArticles = [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
  
  return (
    <div className="w-full">
      <Seo 
        title="Practical Money Clarity"
        description="RealProfits provides free calculators, expert insights, and powerful simulations to plan your financial future."
        path="/"
      />
      
      {/* Hero */}
      <section className="hero-gradient py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-white">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Smarter Financial Decisions, Made Simple
              </h1>
              <p className="text-lg text-white/80 mb-8 max-w-md">
                Free calculators, expert insights, and powerful simulations to plan your financial future.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/calculators" className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-full px-7 py-3 font-bold text-sm transition-colors inline-block shadow-lg">
                  Try Smart Calculator
                </Link>
                <Link href="/search" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-7 py-3 font-bold text-sm transition-colors inline-block">
                  Explore Insights
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative h-[420px] hidden lg:block">
              <div className="absolute top-0 right-12 bg-white rounded-xl p-5 shadow-2xl rotate-3 w-56 z-20">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mortgage Calculator</div>
                <div className="border-b border-gray-100 pb-3 mb-3">
                  <SliderPreview label="Home Price" value="$450,000" color="#0d9488" pct={60} />
                </div>
                <SliderPreview label="Down Payment" value="$90,000" color="#0d9488" pct={20} />
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-[10px] text-gray-400">Monthly Payment</div>
                  <div className="text-lg font-bold text-teal-600">$2,850</div>
                </div>
              </div>
              
              <div className="absolute top-16 right-64 bg-white rounded-xl p-5 shadow-2xl -rotate-6 w-52 z-10">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Debt Payoff Calculator</div>
                <div className="h-16 w-full mb-2">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={[{v:100},{v:85},{v:60},{v:30},{v:0}]}>
                      <Line type="monotone" dataKey="v" stroke="#f97316" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[10px] text-gray-500">Debt-free: <span className="font-bold text-orange-600">24 months</span></div>
              </div>
              
              <div className="absolute top-52 right-8 bg-white rounded-xl p-5 shadow-2xl rotate-2 w-60 z-30">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Compound Interest</div>
                <div className="h-16 w-full mb-2">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={dummyChartData.slice(0, 5)}>
                      <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400">After 30 years</span>
                  <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">+$1.2M</span>
                </div>
              </div>

              <div className="absolute top-2 right-0 z-40">
                <div className="w-14 h-14 bg-[#f5c542]/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#f5c542]">$</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculators */}
      <section className="py-20 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Powerful Free Calculators</h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Plan your mortgage, debt, investments, and more.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {[
            {
              title: "Mortgage Calculator",
              desc: "Calculate your mortgage payments easily.",
              icon: "bg-teal-100 text-teal-600",
              iconChar: "M",
              slug: "mortgage-calculator",
              preview: { label1: "Mortgage Calculator", fields: [{ l: "Home Price", v: "$350,000" }, { l: "Down Payment", v: "20%" }, { l: "Loan Term", v: "30 Years" }] }
            },
            {
              title: "Debt Payoff Calculator",
              desc: "See how fast you can become debt-free.",
              icon: "bg-orange-100 text-orange-600",
              iconChar: "D",
              slug: "credit-card-payoff-calculator",
              preview: { label1: "Debt Payoff Calculator", fields: [{ l: "Total Debt", v: "$15,000" }, { l: "Monthly Payment", v: "$500" }, { l: "Interest Rate", v: "18%" }] }
            },
            {
              title: "Compound Interest Calculator",
              desc: "Watch your money grow over time.",
              icon: "bg-blue-100 text-blue-600",
              iconChar: "C",
              slug: "compound-interest-calculator",
              preview: { label1: "Compound Interest", fields: [{ l: "Initial Amount", v: "$10,000" }, { l: "Monthly Contrib.", v: "$200" }, { l: "Return Rate", v: "7%" }] }
            },
            {
              title: "Mortgage Affordability Calculator",
              desc: "Discover how much home you can afford with your income, debt, and down payment.",
              icon: "bg-green-100 text-green-600",
              iconChar: "A",
              slug: "mortgage-affordability-calculator",
              preview: { label1: "Affordability", fields: [{ l: "Annual Income", v: "$85,000" }, { l: "Monthly Debts", v: "$600" }, { l: "Down Payment", v: "$40,000" }] }
            },
            {
              title: "Rental Property ROI Calculator",
              desc: "Evaluate cash flow and profitability of rental investments.",
              icon: "bg-purple-100 text-purple-600",
              iconChar: "R",
              slug: "rental-property-roi-calculator",
              preview: { label1: "Rental ROI", fields: [{ l: "Purchase Price", v: "$250,000" }, { l: "Monthly Rent", v: "$2,000" }, { l: "Expenses", v: "$800" }] }
            },
            {
              title: "Rent vs. Buy Calculator",
              desc: "Quickly determine whether renting or buying makes more sense for your future.",
              icon: "bg-indigo-100 text-indigo-600",
              iconChar: "R",
              slug: "rent-vs-buy-calculator",
              preview: { label1: "Rent vs Buy", fields: [{ l: "Monthly Rent", v: "$1,800" }, { l: "Home Price", v: "$350,000" }, { l: "Years", v: "10" }] }
            }
          ].map((calc, i) => (
            <Link key={i} href={`/calculators/${calc.slug}`} className="group block h-full">
              <div className="h-full rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-teal-400 flex flex-col">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${calc.icon}`}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="12" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/>
                  </svg>
                </div>
                <h3 className="font-bold text-base mb-1.5 group-hover:text-teal-600 transition-colors">{calc.title}</h3>
                <p className="text-gray-500 text-xs mb-4 flex-grow">{calc.desc}</p>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">{calc.preview.label1}</div>
                  {calc.preview.fields.map((f, fi) => (
                    <div key={fi} className="flex justify-between text-[10px] mb-1 last:mb-0">
                      <span className="text-gray-400">{f.l}</span>
                      <span className="font-semibold text-gray-700">{f.v}</span>
                    </div>
                  ))}
                </div>
                
                <div className="font-bold text-teal-600 text-sm flex items-center">
                  Try Now <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center">
          <Link href="/calculators" className="inline-block border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-full px-8 py-3 font-bold text-sm transition-colors">
            View All Calculators
          </Link>
        </div>
      </section>

      {/* Productive Tools */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Productive Tools</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Hands-on utilities to manage invoices, track spending, split bills, and stay on top of your finances.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {[
              { title: "Freelance Invoice Generator", desc: "Create professional invoices and download them as PDF.", slug: "freelance-invoice-generator", color: "bg-amber-100 text-amber-600" },
              { title: "Subscription Cost Analyzer", desc: "Track and analyze your monthly subscription spending.", slug: "subscription-cost-analyzer", color: "bg-rose-100 text-rose-600" },
              { title: "Bill Split Tool", desc: "Split bills fairly among friends or roommates.", slug: "bill-split-tool", color: "bg-blue-100 text-blue-600" },
              { title: "Net Worth Calculator", desc: "Calculate your total assets minus liabilities.", slug: "net-worth-calculator", color: "bg-emerald-100 text-emerald-600" },
              { title: "Income Tracker", desc: "Log income entries and see earning patterns over time.", slug: "income-tracker", color: "bg-violet-100 text-violet-600" },
              { title: "Expense Tracker", desc: "Record expenses and understand spending habits.", slug: "expense-tracker", color: "bg-cyan-100 text-cyan-600" },
            ].map((tool, i) => (
              <Link key={i} href={`/tools/${tool.slug}`} className="group block h-full">
                <div className="h-full rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-teal-400 flex flex-col">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${tool.color}`}>
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                    </svg>
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
            <Link href="/tools" className="inline-block border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-full px-8 py-3 font-bold text-sm transition-colors">
              View All Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Learn With RealProfits</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mb-8">
              Get expert tips, deep dives, and guides that pair with our calculators to help you understand money decisions better.
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {[
                { label: "Explore Further", href: "/articles" },
                { label: "Taxes", href: "/category/taxes" },
                { label: "Debt", href: "/category/debt-credit" },
                { label: "Investing", href: "/category/saving-vs-investing" },
                { label: "Budgeting", href: "/category/money-basics" },
              ].map((tab, i) => (
                <Link key={i} href={tab.href} className={`px-5 py-2 rounded-full text-xs font-bold transition-colors ${i === 0 ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {latestArticles.length > 0 && (
              <Link href={`/articles/${latestArticles[0].slug}`} className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-all">
                <div className="h-56 w-full bg-gradient-to-br from-amber-100 to-orange-200 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-24 bg-white/40 rounded-lg backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-12 h-12 text-amber-600/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-2">
                    {categories.find(c => c.slug === latestArticles[0].categorySlug)?.name || 'Finance'}
                  </span>
                  <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {latestArticles[0].title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-grow">{latestArticles[0].excerpt}</p>
                  <div className="flex items-center text-xs text-gray-400">
                    <span>{latestArticles[0].author}</span>
                    <span className="mx-2">-</span>
                    <span>{latestArticles[0].readTime} min read</span>
                  </div>
                </div>
              </Link>
            )}
            
            <div className="flex flex-col gap-6">
              {latestArticles.slice(1, 4).map((article, i) => (
                <Link key={article.slug} href={`/articles/${article.slug}`} className="group flex bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-all h-full">
                  <div className={`w-32 md:w-40 flex-shrink-0 ${i === 0 ? 'bg-gradient-to-br from-sky-100 to-blue-200' : i === 1 ? 'bg-gradient-to-br from-emerald-100 to-teal-200' : 'bg-gradient-to-br from-violet-100 to-purple-200'} flex items-center justify-center`}>
                    <svg className="w-8 h-8 text-gray-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
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
            <Link href="/search" className="inline-block border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-full px-8 py-3 font-bold text-sm transition-colors">
              Read More Articles
            </Link>
          </div>
        </div>
      </section>

      {/* What If Teaser */}
      <section className="py-20 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Play Out Your Future</h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Tweak your income, debt, and savings to see your net worth grow over time.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-2/5 p-6 md:p-8 border-r border-gray-100">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-bold text-gray-700">Personal Information</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <div className="text-[10px] text-gray-400 mb-1">Current Age</div>
                    <div className="border border-gray-200 rounded-md px-3 py-1.5 text-sm font-bold text-gray-900">30</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 mb-1">Retirement Age</div>
                    <div className="border border-gray-200 rounded-md px-3 py-1.5 text-sm font-bold text-gray-900">65</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-bold text-gray-700">Current Financial Status</span>
                </div>
                <div className="space-y-4">
                  <SliderPreview label="Income (Monthly)" value="$5,000" color="#0d9488" pct={40} />
                  <SliderPreview label="Savings Rate" value="25%" color="#06b6d4" pct={33} />
                  <SliderPreview label="Expenses (Monthly)" value="$3,000" color="#3b82f6" pct={20} />
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-bold text-gray-700">Investment Preferences</span>
                </div>
                <SliderPreview label="Investment Return Rate" value="6%" color="#8b5cf6" pct={40} />
              </div>
              
              <Link href="/what-if" className="block w-full bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-lg px-6 py-3 font-bold text-sm text-center transition-colors">
                Calculate
              </Link>
            </div>
            
            <div className="lg:w-3/5 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="font-bold text-sm text-gray-700">Your Net Worth Over Time</div>
                <div className="text-xs text-gray-400">Projected</div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={dummyChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="age" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => v >= 1000000 ? `$${v/1000000}M` : `$${v/1000}K`} />
                    <Line type="monotone" dataKey="value" stroke="#e11d48" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Link href="/what-if" className="inline-block border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-full px-8 py-3 font-bold text-sm transition-colors">
            Explore What-If Scenarios
          </Link>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Your Trust, Our Priority</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              "We never sell your financial data without asking. Ever."
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Privacy First", desc: "Your data stays private and protected.", icon: <Shield className="w-7 h-7 text-teal-600"/> },
              { title: "Secure & Encrypted", desc: "Bank-quality security and peace of mind.", icon: <Lock className="w-7 h-7 text-teal-600"/> },
              { title: "Accurate Calculations", desc: "Transparent, data-driven insights, no guesswork.", icon: <BarChart3 className="w-7 h-7 text-teal-600"/> },
              { title: "Trusted by Users", desc: "Join thousands already planning smarter.", icon: <Users className="w-7 h-7 text-teal-600"/> }
            ].map((card, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-5">
                  {card.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                <p className="text-gray-500 text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

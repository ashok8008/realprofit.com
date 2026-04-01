import React from "react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { categories } from "@/data/categories";
import { articles } from "@/data/articles";
import { ArrowRight, Calculator, Home as HomeIcon, CreditCard, DollarSign, TrendingUp, Shield, Lock, BarChart3, Users } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, YAxis, XAxis, CartesianGrid } from "recharts";

export default function Home() {
  const latestArticles = articles.slice(0, 3);
  
  const dummyChartData = [
    { age: 30, value: 50000 },
    { age: 35, value: 120000 },
    { age: 40, value: 250000 },
    { age: 45, value: 450000 },
    { age: 50, value: 750000 },
    { age: 55, value: 1200000 },
  ];
  
  return (
    <div className="w-full">
      <Seo 
        title="Practical Money Clarity"
        description="RealProfits provides free calculators, expert insights, and powerful simulations to plan your financial future."
        path="/"
      />
      
      {/* Section 1: Hero */}
      <section className="hero-gradient dark:hero-gradient-dark py-24 px-4 overflow-hidden relative">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-white">
              <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight mb-6">
                Smarter Financial Decisions, Made Simple
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-xl">
                Free calculators, expert insights, and powerful simulations to plan your financial future.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/calculators" className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-full px-8 py-3 font-bold text-lg transition-colors inline-block">
                  Try Smart Calculator
                </Link>
                <Link href="/search" className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8 py-3 font-bold text-lg transition-colors inline-block">
                  Explore Insights
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative h-[450px] hidden lg:block perspective-[1000px]">
              {/* Floating Cards */}
              <div className="absolute top-10 right-20 bg-white rounded-2xl p-5 shadow-2xl rotate-6 w-64 animate-in fade-in zoom-in duration-700 transform-gpu">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-teal-100 text-teal-700 rounded-lg"><HomeIcon className="w-5 h-5"/></div>
                  <div className="font-bold text-gray-900 text-sm">Mortgage Calc</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Home Price</span>
                    <span className="font-bold text-gray-900">$450,000</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 w-[20%]"></div>
                  </div>
                  <div className="pt-2 border-t border-gray-100 mt-2">
                    <div className="text-xs text-gray-500">Monthly Payment</div>
                    <div className="text-xl font-bold text-teal-600">$2,850</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-32 right-64 bg-white rounded-2xl p-5 shadow-2xl -rotate-6 w-60 animate-in fade-in zoom-in duration-700 delay-150 transform-gpu z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 text-orange-700 rounded-lg"><CreditCard className="w-5 h-5"/></div>
                  <div className="font-bold text-gray-900 text-sm">Debt Payoff</div>
                </div>
                <div className="h-24 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{v:100},{v:80},{v:60},{v:30},{v:0}]}>
                      <Line type="monotone" dataKey="v" stroke="#f97316" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-2 text-xs font-bold text-orange-600">Debt Free in 24 Mo</div>
              </div>
              
              <div className="absolute top-56 right-4 bg-white rounded-2xl p-5 shadow-2xl rotate-3 w-72 animate-in fade-in zoom-in duration-700 delay-300 transform-gpu">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-bold text-gray-900 text-sm">Investment Growth</div>
                  <div className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">+8.5%</div>
                </div>
                <div className="h-24 w-full mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dummyChartData}>
                      <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-gray-500">Projected Value at 65: <span className="font-bold text-gray-900">$1.2M</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Calculators */}
      <section className="py-20 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Powerful Free Calculators</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plan your mortgage, debt, investments, and more.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {[
            { title: "Mortgage Calculator", desc: "Estimate your monthly payment including taxes.", icon: <HomeIcon className="w-6 h-6"/>, color: "bg-blue-100 text-blue-700", slug: "mortgage-calculator" },
            { title: "Rent vs Buy", desc: "Compare the long-term math of housing decisions.", icon: <DollarSign className="w-6 h-6"/>, color: "bg-teal-100 text-teal-700", slug: "rent-vs-buy-calculator" },
            { title: "Debt Payoff", desc: "Find out exactly when you'll be completely debt-free.", icon: <CreditCard className="w-6 h-6"/>, color: "bg-orange-100 text-orange-700", slug: "credit-card-payoff-calculator" },
            { title: "Compound Interest", desc: "See the magic of compounding over decades.", icon: <TrendingUp className="w-6 h-6"/>, color: "bg-green-100 text-green-700", slug: "compound-interest-calculator" },
            { title: "Investment Growth", desc: "Project your portfolio balance to retirement age.", icon: <BarChart3 className="w-6 h-6"/>, color: "bg-purple-100 text-purple-700", slug: "investment-growth-calculator" },
            { title: "Net Worth", desc: "Calculate your total assets minus liabilities.", icon: <Calculator className="w-6 h-6"/>, color: "bg-indigo-100 text-indigo-700", slug: "net-worth-calculator" }
          ].map((calc, i) => (
            <Link key={i} href={`/calculators/${calc.slug}`} className="group block h-full">
              <div className="h-full rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${calc.color}`}>
                  {calc.icon}
                </div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{calc.title}</h3>
                <p className="text-muted-foreground text-sm flex-grow mb-4">{calc.desc}</p>
                <div className="font-bold text-primary text-sm flex items-center">
                  Try Now <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center">
          <Link href="/calculators" className="inline-block bg-white border-2 border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50 rounded-full px-8 py-3 font-bold transition-colors">
            Explore All Calculators
          </Link>
        </div>
      </section>

      {/* Section 3: Articles */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Expert Articles & Insights</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Actionable advice on everything from tax strategy to building an emergency fund.
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {["Explore Further", "Taxes", "Debt", "Investing", "Budgeting"].map((tab, i) => (
                <button key={i} className={`px-5 py-2 rounded-full text-sm font-bold ${i === 0 ? 'bg-gray-900 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {latestArticles.map((article, i) => (
              <Link key={article.slug} href={`/articles/${article.slug}`} className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-all">
                <div className={`h-48 w-full bg-gradient-to-br ${i%3===0 ? 'from-teal-400 to-cyan-600' : i%3===1 ? 'from-blue-400 to-indigo-600' : 'from-emerald-400 to-teal-600'}`}></div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-3">
                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {categories.find(c => c.slug === article.categorySlug)?.name || 'Finance'}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-teal-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-3 flex-grow">
                    {article.excerpt}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                    <span>{article.author} &middot; {article.readTime} min read</span>
                    <span className="text-teal-600 font-bold flex items-center">Read More <ArrowRight className="w-3 h-3 ml-1"/></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/search" className="inline-block bg-white border-2 border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50 rounded-full px-8 py-3 font-bold transition-colors">
              Read More Articles
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4: What If Teaser */}
      <section className="py-24 container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-16 bg-white rounded-3xl border shadow-sm p-8 md:p-12">
          <div className="lg:w-1/2">
            <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">Play Out Your Future</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Tweak your income, debt, and savings to see your net worth grow over time. Our powerful simulation engine lets you explore different financial scenarios instantly.
            </p>
            <Link href="/what-if" className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-full px-8 py-4 font-bold text-lg transition-colors inline-block shadow-md">
              Explore What-If Scenarios
            </Link>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-inner">
              <div className="flex gap-6">
                <div className="w-1/3 space-y-6 hidden sm:block border-r border-gray-200 pr-6">
                  <div>
                    <div className="h-3 w-16 bg-gray-300 rounded mb-3"></div>
                    <div className="h-2 w-full bg-teal-200 rounded-full">
                      <div className="h-full bg-teal-500 rounded-full w-2/3"></div>
                    </div>
                  </div>
                  <div>
                    <div className="h-3 w-20 bg-gray-300 rounded mb-3"></div>
                    <div className="h-2 w-full bg-blue-200 rounded-full">
                      <div className="h-full bg-blue-500 rounded-full w-1/3"></div>
                    </div>
                  </div>
                  <div>
                    <div className="h-3 w-12 bg-gray-300 rounded mb-3"></div>
                    <div className="h-2 w-full bg-orange-200 rounded-full">
                      <div className="h-full bg-orange-500 rounded-full w-1/2"></div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-500 mb-4">Your Net Worth Over Time</div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dummyChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="age" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Trust */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Your Trust, Our Priority</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              We never sell your financial data without asking. Ever.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Privacy First", desc: "Your data stays private and protected.", icon: <Shield className="w-8 h-8 text-teal-400"/> },
              { title: "Secure & Encrypted", desc: "Bank-quality security and peace of mind.", icon: <Lock className="w-8 h-8 text-teal-400"/> },
              { title: "Accurate Calculations", desc: "Transparent, data-driven insights, no guesswork.", icon: <BarChart3 className="w-8 h-8 text-teal-400"/> },
              { title: "Trusted by Users", desc: "Join thousands already planning smarter.", icon: <Users className="w-8 h-8 text-teal-400"/> }
            ].map((card, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
                <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  {card.icon}
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">{card.title}</h3>
                <p className="text-gray-400 text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

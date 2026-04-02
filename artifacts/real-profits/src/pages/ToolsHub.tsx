import React from "react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { tools } from "@/data/tools";
import { ArrowRight, Wrench, FileText, PieChart, Users, Wallet, TrendingUp, Receipt } from "lucide-react";

const toolIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  "freelance-invoice": { icon: <FileText className="w-5 h-5" />, color: "bg-amber-100 text-amber-600" },
  "subscription-analyzer": { icon: <PieChart className="w-5 h-5" />, color: "bg-rose-100 text-rose-600" },
  "bill-split": { icon: <Users className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
  "net-worth": { icon: <Wallet className="w-5 h-5" />, color: "bg-emerald-100 text-emerald-600" },
  "paycheck": { icon: <Receipt className="w-5 h-5" />, color: "bg-teal-100 text-teal-600" },
  "income-tracker": { icon: <TrendingUp className="w-5 h-5" />, color: "bg-violet-100 text-violet-600" },
  "expense-tracker": { icon: <Wrench className="w-5 h-5" />, color: "bg-cyan-100 text-cyan-600" },
};

export default function ToolsHub() {
  const categories = [
    { id: "income", name: "Income & Tracking" },
    { id: "budget", name: "Budget & Expenses" },
    { id: "wealth", name: "Wealth & Net Worth" }
  ];
  
  return (
    <div className="w-full">
      <Seo 
        title="Productive Tools"
        description="Practical, app-like money tools to track, split, and calculate your finances."
        keywords="financial tools, invoice generator, subscription tracker, bill splitter, net worth calculator, paycheck calculator, income tracker, expense tracker, money management tools, personal finance tools, free budget tools"
        path="/tools"
      />
      
      <section className="hero-gradient py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-white">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Productive Tools That Save You Time
              </h1>
              <p className="text-base text-white/80 mb-4 max-w-md leading-relaxed">
                Interactive utilities to track expenses, analyze subscriptions, split bills, generate invoices, and manage your finances -- all free, all in your browser.
              </p>
              <Link href="#all-tools" className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-full px-7 py-3 font-bold text-sm transition-colors inline-block shadow-lg">
                Explore All Tools
              </Link>
            </div>
            
            <div className="lg:w-1/2 relative h-[350px] hidden lg:block">
              <div className="absolute top-0 right-16 bg-white rounded-xl p-4 shadow-2xl rotate-3 w-52 z-20">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Invoice Generator</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Client</span>
                    <span className="font-semibold text-gray-700">Acme Corp</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Amount</span>
                    <span className="font-bold text-green-600">$4,500.00</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-400">Status</span>
                    <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Pending</span>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-24 right-0 bg-white rounded-xl p-4 shadow-2xl -rotate-3 w-48 z-30">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Expense Breakdown</div>
                <div className="flex gap-1 items-end">
                  {[35, 50, 25, 60, 40, 55, 30].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t" style={{ height: `${h}px`, backgroundColor: i === 3 ? '#0d9488' : '#e5e7eb' }}></div>
                  ))}
                </div>
                <div className="text-[10px] text-gray-500 mt-2">Monthly Total: <span className="font-bold text-gray-900">$3,240</span></div>
              </div>
              
              <div className="absolute bottom-8 right-24 bg-white rounded-xl p-4 shadow-2xl rotate-2 w-48 z-10">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Bill Split</div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-teal-200 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-amber-200 border-2 border-white"></div>
                  </div>
                  <span className="text-[10px] text-gray-500">3 people</span>
                </div>
                <div className="text-sm font-bold text-gray-900">$42.67 <span className="text-[10px] text-gray-400 font-normal">each</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="all-tools" className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">All Productive Tools</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Hands-on utilities to manage your money smarter every day.</p>
        </div>

        {categories.map(cat => {
          const catTools = tools.filter(t => t.category === cat.id);
          if (catTools.length === 0) return null;
          
          return (
            <div key={cat.id} className="mb-14 last:mb-0">
              <h3 className="font-serif text-2xl font-bold mb-6 border-b pb-3">{cat.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {catTools.map(tool => {
                  const iconData = toolIcons[tool.id] || { icon: <Wrench className="w-5 h-5" />, color: "bg-gray-100 text-gray-600" };
                  return (
                    <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group h-full block">
                      <div className="bg-white border rounded-xl p-5 h-full shadow-sm hover:shadow-md transition-all hover:border-teal-400 flex flex-col">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconData.color}`}>
                            {iconData.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm mb-1 group-hover:text-teal-600 transition-colors">{tool.name}</h4>
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
      
      <section className="py-16 bg-gray-50 border-t">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="font-serif text-2xl font-bold mb-3">Need More Financial Power?</h2>
          <p className="text-gray-500 mb-6">Check out our extensive collection of 39+ financial calculators.</p>
          <Link href="/calculators" className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-full px-8 py-3 font-bold text-sm transition-colors inline-block">
            Browse Calculators
          </Link>
        </div>
      </section>
    </div>
  );
}

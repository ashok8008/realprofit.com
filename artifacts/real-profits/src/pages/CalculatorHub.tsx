import React from "react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { calculators } from "@/data/calculators";
import { categories } from "@/data/categories";

export default function CalculatorHub() {
  const calcCategory = categories.find(c => c.slug === "calculators");
  
  return (
    <div className="w-full">
      <Seo 
        title="Financial Calculators"
        description="Interactive tools to clarify your numbers and plan your financial future."
        path="/calculators"
      />
      
      <div className="hero-gradient dark:hero-gradient-dark text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Financial Calculators</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-4">
            Make confident money decisions with our free, interactive calculators. Run the numbers on savings, debt, taxes, and life decisions.
          </p>
          <p className="text-white/70 font-medium uppercase tracking-wider text-sm">Explore All Calculators Below</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {calcCategory?.subcategories.map(subcat => {
          const catCalcs = calculators.filter(c => c.category === subcat.slug);
          if (catCalcs.length === 0) return null;
          
          return (
            <div key={subcat.slug} className="mb-16 last:mb-0">
              <h2 className="font-serif text-3xl font-bold mb-8 border-b pb-4">{subcat.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catCalcs.map(calc => (
                  <Link key={calc.slug} href={`/calculators/${calc.slug}`} className="group h-full block">
                    <div className="bg-card border rounded-2xl p-8 h-full shadow-sm hover:shadow-md transition-all hover:border-teal-500 flex flex-col">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-teal-600 transition-colors">{calc.name}</h3>
                      <p className="text-muted-foreground text-sm flex-grow mb-6">{calc.description}</p>
                      <div className="text-teal-600 font-bold text-sm mt-auto inline-flex items-center">
                        Try Now <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">&rarr;</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

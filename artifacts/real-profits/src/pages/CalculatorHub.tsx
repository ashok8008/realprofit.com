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
      
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Financial Calculators</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Make confident money decisions with our free, interactive calculators. Run the numbers on savings, debt, taxes, and life decisions.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {calcCategory?.subcategories.map(subcat => {
          const catCalcs = calculators.filter(c => c.category === subcat.slug);
          if (catCalcs.length === 0) return null;
          
          return (
            <div key={subcat.slug} className="mb-16 last:mb-0">
              <h2 className="font-serif text-3xl font-bold mb-8 border-b pb-4">{subcat.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catCalcs.map(calc => (
                  <Link key={calc.slug} href={`/calculators/${calc.slug}`} className="group h-full">
                    <div className="bg-card border rounded-xl p-6 h-full shadow-sm hover:shadow-md transition-all hover:border-primary">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{calc.name}</h3>
                      <p className="text-muted-foreground text-sm">{calc.description}</p>
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

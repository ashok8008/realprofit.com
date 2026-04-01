import React from "react";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { tools } from "@/data/tools";

export default function ToolsHub() {
  const categories = [
    { id: "income", name: "Income & Tracking" },
    { id: "budget", name: "Budget & Expenses" },
    { id: "wealth", name: "Wealth & Net Worth" }
  ];
  
  return (
    <div className="w-full">
      <Seo 
        title="Financial Tools"
        description="Practical, app-like money tools to track, split, and calculate your finances."
        path="/tools"
      />
      
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Practical Money Tools</h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Interactive utilities to track expenses, analyze subscriptions, split bills, and generate invoices.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {categories.map(cat => {
          const catTools = tools.filter(t => t.category === cat.id);
          if (catTools.length === 0) return null;
          
          return (
            <div key={cat.id} className="mb-16 last:mb-0">
              <h2 className="font-serif text-3xl font-bold mb-8 border-b pb-4">{cat.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catTools.map(tool => (
                  <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group h-full">
                    <div className="bg-card border rounded-xl p-6 h-full shadow-sm hover:shadow-md transition-all hover:border-primary">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{tool.name}</h3>
                      <p className="text-muted-foreground text-sm">{tool.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* Ad Placeholder */}
              <div className="mt-12 bg-muted/20 border border-dashed rounded-lg p-8 text-center text-muted-foreground text-sm">
                Advertisement Space
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-muted/10 py-16 border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">Looking for something else?</h2>
          <p className="mb-6 text-muted-foreground">Check out our extensive collection of financial calculators.</p>
          <Link href="/calculators" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Browse Calculators
          </Link>
        </div>
      </div>
    </div>
  );
}
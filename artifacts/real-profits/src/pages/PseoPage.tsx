import React from "react";
import { useParams, Link } from "wouter";
import { Seo } from "@/components/Seo";
import { salaryLevels } from "@/data/pseo/salary-levels";
import { savingsTargets } from "@/data/pseo/savings-targets";
import { ChevronRight } from "lucide-react";
import { CalculatorInlineCard } from "@/components/linking/InternalLinks";

export default function PseoPage() {
  const { slug } = useParams<{ slug: string }>();
  
  // Quick matching logic for demonstration
  const salaryMatch = salaryLevels.find(s => s.slug === slug);
  const savingsMatch = savingsTargets.find(s => s.slug === slug);
  
  if (!salaryMatch && !savingsMatch) {
    return <div className="container mx-auto py-20 text-center">Guide not found</div>;
  }

  const isSalary = !!salaryMatch;
  const data = salaryMatch || savingsMatch;
  const amountStr = `$${data?.amount.toLocaleString()}`;
  
  const title = isSalary 
    ? `Is ${amountStr} a Good Salary? A Reality Check`
    : `How to Save ${amountStr} (${data?.context})`;

  return (
    <div className="w-full bg-background">
      <Seo title={title} description={`Comprehensive financial guide on ${amountStr}.`} />
      
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">Guides</span>
        </nav>
        
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">{title}</h1>
        
        <div className="prose prose-lg prose-headings:font-serif">
          {isSalary ? (
            <>
              <p>Earning <strong>{amountStr}</strong> per year is a significant milestone. In the context of the average American worker, it is considered {data?.context.toLowerCase()}.</p>
              <h2>The Monthly Reality</h2>
              <p>Your gross pay is {amountStr}, but your net pay (what actually hits your bank account) will be lower after federal, state, and FICA taxes.</p>
              <CalculatorInlineCard slug="salary-reality-calculator" />
            </>
          ) : (
            <>
              <p>Setting a goal to save <strong>{amountStr}</strong> for a {data?.context.toLowerCase()} is one of the best financial decisions you can make.</p>
              <h2>How Long Will It Take?</h2>
              <p>The time it takes to reach {amountStr} depends entirely on your savings rate and your return on investment.</p>
              <CalculatorInlineCard slug="savings-goal-calculator" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

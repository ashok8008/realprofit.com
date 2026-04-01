import React, { Suspense, lazy } from "react";
import { useParams } from "wouter";
import { Seo } from "@/components/Seo";
import { calculators } from "@/data/calculators";
import { BreadcrumbNav, RelatedArticles } from "@/components/linking/InternalLinks";
import { ExportToPDFButton, ExportToCSVButton, ShareResultsButton } from "@/components/export/ExportButtons";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

// Lazy load calculators to avoid massive bundle
const SavingsGoalCalc = lazy(() => import("@/components/calculators/SavingsGoalCalculator").then(m => ({ default: m.SavingsGoalCalculator })));
const EmergencyFundCalc = lazy(() => import("@/components/calculators/EmergencyFundCalculator").then(m => ({ default: m.EmergencyFundCalculator })));
const MonthlyBudgetCalc = lazy(() => import("@/components/calculators/MonthlyBudgetCalculator").then(m => ({ default: m.MonthlyBudgetCalculator })));
const RentVsBuyCalc = lazy(() => import("@/components/calculators/RentVsBuyCalculator").then(m => ({ default: m.RentVsBuyCalculator })));
const CompoundInterestCalc = lazy(() => import("@/components/calculators/CompoundInterestCalculator").then(m => ({ default: m.CompoundInterestCalculator })));
const SaveVsInvestCalc = lazy(() => import("@/components/calculators/SaveVsInvestCalculator").then(m => ({ default: m.SaveVsInvestCalculator })));
const SimpleTaxCalc = lazy(() => import("@/components/calculators/SimpleTaxEstimator").then(m => ({ default: m.SimpleTaxEstimator })));
const CreditCardCalc = lazy(() => import("@/components/calculators/CreditCardPayoffCalculator").then(m => ({ default: m.CreditCardPayoffCalculator })));

function FallbackCalculator() {
  return (
    <div className="py-12 text-center text-muted-foreground border rounded-xl bg-muted/20">
      <p>This calculator is currently being built. Please check back soon!</p>
    </div>
  );
}

function getCalculatorComponent(slug: string) {
  switch (slug) {
    case 'savings-goal-calculator': return SavingsGoalCalc;
    case 'emergency-fund-calculator': return EmergencyFundCalc;
    case 'monthly-budget-calculator': return MonthlyBudgetCalc;
    case 'rent-vs-buy-calculator': return RentVsBuyCalc;
    case 'compound-interest-calculator': return CompoundInterestCalc;
    case 'save-vs-invest-calculator': return SaveVsInvestCalc;
    case 'simple-tax-estimator': return SimpleTaxCalc;
    case 'credit-card-payoff-calculator': return CreditCardCalc;
    default: return FallbackCalculator;
  }
}

export default function CalculatorDetail() {
  const { slug } = useParams<{ slug: string }>();
  const calculator = calculators.find(c => c.slug === slug);

  if (!calculator) {
    return <div className="container mx-auto py-20 text-center">Calculator not found</div>;
  }

  const CalcComponent = getCalculatorComponent(calculator.slug);

  return (
    <div className="w-full min-h-screen bg-muted/10 pb-20">
      <Seo 
        title={calculator.name}
        description={calculator.description}
        path={`/calculators/${calculator.slug}`}
      />
      
      <div className="bg-background border-b pt-8 pb-12 mb-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <BreadcrumbNav items={[
            { label: "Calculators", href: "/calculators" },
            { label: calculator.name, href: `/calculators/${calculator.slug}` }
          ]} />
          
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 mt-4">{calculator.name}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">{calculator.description}</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm" id={`calc-${calculator.slug}`}>
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="font-bold text-lg">Input Your Numbers</h2>
            <div className="flex gap-2">
               <ExportToPDFButton elementId={`calc-${calculator.slug}`} title={calculator.name} />
               <ShareResultsButton />
            </div>
          </div>
          
          <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading calculator...</div>}>
            <CalcComponent />
          </Suspense>
        </div>
        
        <div className="mt-16">
          <h2 className="font-serif text-3xl font-bold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="bg-card border rounded-xl px-6">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is my data saved?</AccordionTrigger>
              <AccordionContent>
                No. All calculations are performed directly in your browser. We do not store or track any of the financial numbers you input into this tool.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How accurate is this calculator?</AccordionTrigger>
              <AccordionContent>
                This calculator provides estimates based on standard formulas. Real-world results will vary based on inflation, exact daily compounding methods, and fee structures of specific financial institutions.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <RelatedArticles categorySlug={calculator.category} />
      </div>
    </div>
  );
}

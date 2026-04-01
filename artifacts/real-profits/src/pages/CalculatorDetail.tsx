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

// 12 Fallbacks
const ExpenseBreakdownTool = lazy(() => import("@/components/calculators/ExpenseBreakdownTool").then(m => ({ default: m.ExpenseBreakdownTool })));
const MonthlyIncomeEstimator = lazy(() => import("@/components/calculators/MonthlyIncomeEstimator").then(m => ({ default: m.MonthlyIncomeEstimator })));
const SideHustleEarnings = lazy(() => import("@/components/calculators/SideHustleEarnings").then(m => ({ default: m.SideHustleEarnings })));
const HourlyRateCalculator = lazy(() => import("@/components/calculators/HourlyRateCalculator").then(m => ({ default: m.HourlyRateCalculator })));
const TaxSetAsideCalculator = lazy(() => import("@/components/calculators/TaxSetAsideCalculator").then(m => ({ default: m.TaxSetAsideCalculator })));
const QuarterlyTaxCalculator = lazy(() => import("@/components/calculators/QuarterlyTaxCalculator").then(m => ({ default: m.QuarterlyTaxCalculator })));
const SelfEmploymentTaxCalculator = lazy(() => import("@/components/calculators/SelfEmploymentTaxCalculator").then(m => ({ default: m.SelfEmploymentTaxCalculator })));
const InvestmentGrowthCalculator = lazy(() => import("@/components/calculators/InvestmentGrowthCalculator").then(m => ({ default: m.InvestmentGrowthCalculator })));
const LoanInterestCalculator = lazy(() => import("@/components/calculators/LoanInterestCalculator").then(m => ({ default: m.LoanInterestCalculator })));
const DebtSnowballCalculator = lazy(() => import("@/components/calculators/DebtSnowballCalculator").then(m => ({ default: m.DebtSnowballCalculator })));
const CostOfLivingComparison = lazy(() => import("@/components/calculators/CostOfLivingComparison").then(m => ({ default: m.CostOfLivingComparison })));
const SalaryRealityCalculator = lazy(() => import("@/components/calculators/SalaryRealityCalculator").then(m => ({ default: m.SalaryRealityCalculator })));

// 19 New
const SimpleSavingsCalculator = lazy(() => import("@/components/calculators/SimpleSavingsCalculator").then(m => ({ default: m.SimpleSavingsCalculator })));
const MonthlySavingsCalculator = lazy(() => import("@/components/calculators/MonthlySavingsCalculator").then(m => ({ default: m.MonthlySavingsCalculator })));
const SavingsIncomeCalculator = lazy(() => import("@/components/calculators/SavingsIncomeCalculator").then(m => ({ default: m.SavingsIncomeCalculator })));
const MortgageCalculator = lazy(() => import("@/components/calculators/MortgageCalculator").then(m => ({ default: m.MortgageCalculator })));
const MortgageAmortizationCalculator = lazy(() => import("@/components/calculators/MortgageAmortizationCalculator").then(m => ({ default: m.MortgageAmortizationCalculator })));
const PersonalLoanCalculator = lazy(() => import("@/components/calculators/PersonalLoanCalculator").then(m => ({ default: m.PersonalLoanCalculator })));
const AutoLoanCalculator = lazy(() => import("@/components/calculators/AutoLoanCalculator").then(m => ({ default: m.AutoLoanCalculator })));
const BusinessLoanCalculator = lazy(() => import("@/components/calculators/BusinessLoanCalculator").then(m => ({ default: m.BusinessLoanCalculator })));
const LoanAffordabilityCalculator = lazy(() => import("@/components/calculators/LoanAffordabilityCalculator").then(m => ({ default: m.LoanAffordabilityCalculator })));
const ExtraPaymentCalculator = lazy(() => import("@/components/calculators/ExtraPaymentCalculator").then(m => ({ default: m.ExtraPaymentCalculator })));
const InvestmentReturnCalculator = lazy(() => import("@/components/calculators/InvestmentReturnCalculator").then(m => ({ default: m.InvestmentReturnCalculator })));
const SIPCalculator = lazy(() => import("@/components/calculators/SIPCalculator").then(m => ({ default: m.SIPCalculator })));
const RetirementGrowthCalculator = lazy(() => import("@/components/calculators/RetirementGrowthCalculator").then(m => ({ default: m.RetirementGrowthCalculator })));
const DebtAvalancheCalculator = lazy(() => import("@/components/calculators/DebtAvalancheCalculator").then(m => ({ default: m.DebtAvalancheCalculator })));
const InterestCalculator = lazy(() => import("@/components/calculators/InterestCalculator").then(m => ({ default: m.InterestCalculator })));
const MinimumPaymentTrapCalculator = lazy(() => import("@/components/calculators/MinimumPaymentTrapCalculator").then(m => ({ default: m.MinimumPaymentTrapCalculator })));
const ProfitMarginCalculator = lazy(() => import("@/components/calculators/ProfitMarginCalculator").then(m => ({ default: m.ProfitMarginCalculator })));
const NetIncomeCalculator = lazy(() => import("@/components/calculators/NetIncomeCalculator").then(m => ({ default: m.NetIncomeCalculator })));
const CanIAffordThisCalculator = lazy(() => import("@/components/calculators/CanIAffordThisCalculator").then(m => ({ default: m.CanIAffordThisCalculator })));

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
    
    // 12 Fallbacks
    case 'expense-breakdown-tool': return ExpenseBreakdownTool;
    case 'monthly-income-estimator': return MonthlyIncomeEstimator;
    case 'side-hustle-earnings': return SideHustleEarnings;
    case 'hourly-rate-calculator': return HourlyRateCalculator;
    case 'tax-set-aside-calculator': return TaxSetAsideCalculator;
    case 'quarterly-tax-calculator': return QuarterlyTaxCalculator;
    case 'self-employment-tax-calculator': return SelfEmploymentTaxCalculator;
    case 'investment-growth-calculator': return InvestmentGrowthCalculator;
    case 'loan-interest-calculator': return LoanInterestCalculator;
    case 'debt-snowball-calculator': return DebtSnowballCalculator;
    case 'cost-of-living-comparison': return CostOfLivingComparison;
    case 'salary-reality-calculator': return SalaryRealityCalculator;
    
    // 19 New
    case 'simple-savings-calculator': return SimpleSavingsCalculator;
    case 'monthly-savings-calculator': return MonthlySavingsCalculator;
    case 'savings-income-calculator': return SavingsIncomeCalculator;
    case 'mortgage-calculator': return MortgageCalculator;
    case 'mortgage-amortization-calculator': return MortgageAmortizationCalculator;
    case 'personal-loan-calculator': return PersonalLoanCalculator;
    case 'auto-loan-calculator': return AutoLoanCalculator;
    case 'business-loan-calculator': return BusinessLoanCalculator;
    case 'loan-affordability-calculator': return LoanAffordabilityCalculator;
    case 'extra-payment-calculator': return ExtraPaymentCalculator;
    case 'investment-return-calculator': return InvestmentReturnCalculator;
    case 'sip-calculator': return SIPCalculator;
    case 'retirement-growth-calculator': return RetirementGrowthCalculator;
    case 'debt-avalanche-calculator': return DebtAvalancheCalculator;
    case 'interest-calculator': return InterestCalculator;
    case 'minimum-payment-trap-calculator': return MinimumPaymentTrapCalculator;
    case 'profit-margin-calculator': return ProfitMarginCalculator;
    case 'net-income-calculator': return NetIncomeCalculator;
    case 'can-i-afford-this-calculator': return CanIAffordThisCalculator;
    
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

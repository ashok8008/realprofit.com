import React, { Suspense, lazy } from "react";
import { useParams } from "wouter";
import { Seo } from "@/components/Seo";
import { tools } from "@/data/tools";
import { BreadcrumbNav, RelatedArticles } from "@/components/linking/InternalLinks";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const FreelanceInvoiceGenerator = lazy(() => import("@/components/tools/FreelanceInvoiceGenerator").then(m => ({ default: m.FreelanceInvoiceGenerator })));
const SubscriptionCostAnalyzer = lazy(() => import("@/components/tools/SubscriptionCostAnalyzer").then(m => ({ default: m.SubscriptionCostAnalyzer })));
const BillSplitTool = lazy(() => import("@/components/tools/BillSplitTool").then(m => ({ default: m.BillSplitTool })));
const NetWorthCalculator = lazy(() => import("@/components/tools/NetWorthCalculator").then(m => ({ default: m.NetWorthCalculator })));
const PaycheckCalculator = lazy(() => import("@/components/tools/PaycheckCalculator").then(m => ({ default: m.PaycheckCalculator })));
const IncomeTracker = lazy(() => import("@/components/tools/IncomeTracker").then(m => ({ default: m.IncomeTracker })));
const ExpenseTracker = lazy(() => import("@/components/tools/ExpenseTracker").then(m => ({ default: m.ExpenseTracker })));

function FallbackTool() {
  return (
    <div className="py-12 text-center text-muted-foreground border rounded-xl bg-muted/20">
      <p>This tool is currently being built. Please check back soon!</p>
    </div>
  );
}

function getToolComponent(slug: string) {
  switch (slug) {
    case 'freelance-invoice-generator': return FreelanceInvoiceGenerator;
    case 'subscription-cost-analyzer': return SubscriptionCostAnalyzer;
    case 'bill-split-tool': return BillSplitTool;
    case 'net-worth-calculator': return NetWorthCalculator;
    case 'paycheck-calculator': return PaycheckCalculator;
    case 'income-tracker': return IncomeTracker;
    case 'expense-tracker': return ExpenseTracker;
    default: return FallbackTool;
  }
}

export default function ToolDetail() {
  const { slug } = useParams<{ slug: string }>();
  const tool = tools.find(t => t.slug === slug);

  if (!tool) {
    return <div className="container mx-auto py-20 text-center">Tool not found</div>;
  }

  const ToolComponent = getToolComponent(tool.slug);

  return (
    <div className="w-full min-h-screen bg-muted/10 pb-20">
      <Seo 
        title={tool.name}
        description={tool.description}
        keywords={`${tool.name.toLowerCase()}, ${tool.slug.replace(/-/g, ' ')}, free financial tool, money management tool, personal finance tool, online ${tool.category} tool`}
        path={`/tools/${tool.slug}`}
      />
      
      <div className="bg-background border-b pt-8 pb-12 mb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <BreadcrumbNav items={[
            { label: "Tools", href: "/tools" },
            { label: tool.name, href: `/tools/${tool.slug}` }
          ]} />
          
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 mt-4">{tool.name}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">{tool.description}</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm" id={`tool-${tool.slug}`}>
          <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading tool...</div>}>
            <ToolComponent />
          </Suspense>
        </div>
        
        <div className="mt-16">
          <h2 className="font-serif text-3xl font-bold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="bg-card border rounded-xl px-6">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is my data saved?</AccordionTrigger>
              <AccordionContent>
                Your data is saved locally on your device using your browser's storage. It is not sent to our servers. If you clear your browser data or use a different device, your saved entries will not be available.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I export my data?</AccordionTrigger>
              <AccordionContent>
                Yes, most tools support exporting your data to CSV or PDF for your records or sharing.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <RelatedArticles categorySlug="money-basics" />
      </div>
    </div>
  );
}
"use client";
import React, { Suspense, lazy } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Seo, buildWebApplicationSchema, buildBreadcrumbSchema, buildFAQSchema } from "@/components/Seo";
import { taxTools } from "@/data/tax-tools";
import { BreadcrumbNav } from "@/components/linking/InternalLinks";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ArrowRight, Shield } from "lucide-react";
import { CloudSyncIndicator } from "@/components/CloudSyncIndicator";

const FreelancerTaxPlanner = lazy(() => import("@/components/tax/FreelancerTaxPlanner").then(m => ({ default: m.FreelancerTaxPlanner })));
const IncomeMixPlanner = lazy(() => import("@/components/tax/IncomeMixPlanner").then(m => ({ default: m.IncomeMixPlanner })));
const TaxChecklistGenerator = lazy(() => import("@/components/tax/TaxChecklistGenerator").then(m => ({ default: m.TaxChecklistGenerator })));
const Form1040ESPrep = lazy(() => import("@/components/tax/Form1040ESPrep").then(m => ({ default: m.Form1040ESPrep })));
const ScheduleCPrep = lazy(() => import("@/components/tax/ScheduleCPrep").then(m => ({ default: m.ScheduleCPrep })));
const TaxSummaryPDFTool = lazy(() => import("@/components/tax/TaxSummaryPDFTool").then(m => ({ default: m.TaxSummaryPDFTool })));
const W2Organizer = lazy(() => import("@/components/tax/W2Organizer").then(m => ({ default: m.W2Organizer })));
const YearEndPacket = lazy(() => import("@/components/tax/YearEndPacket").then(m => ({ default: m.YearEndPacket })));

function FallbackTool() {
  return (
    <div className="py-12 text-center text-muted-foreground border rounded-xl bg-muted/20">
      <p>This tool is currently being built. Please check back soon!</p>
    </div>
  );
}

function getToolComponent(slug: string) {
  switch (slug) {
    case "freelancer-tax-planner": return FreelancerTaxPlanner;
    case "income-mix-planner": return IncomeMixPlanner;
    case "tax-checklist-generator": return TaxChecklistGenerator;
    case "1040es-prep-generator": return Form1040ESPrep;
    case "schedule-c-prep-summary": return ScheduleCPrep;
    case "tax-summary-pdf": return TaxSummaryPDFTool;
    case "w2-1099-organizer": return W2Organizer;
    case "year-end-tax-packet": return YearEndPacket;
    default: return FallbackTool;
  }
}

const toolFAQs: Record<string, Array<{ q: string; a: string }>> = {
  "freelancer-tax-planner": [
    { q: "Does this include self-employment tax?", a: "Yes, SE tax (15.3% of 92.35% of net income) is calculated when you select 'Self-Employed: Yes'. This includes both Social Security and Medicare portions." },
    { q: "How accurate are quarterly estimates?", a: "These are estimates based on standard tax formulas. Actual amounts may differ based on deductions, credits, and filing situation. Use these as a starting point." },
    { q: "Can I submit these quarterly amounts to the IRS?", a: "No. This tool helps you plan. You must use the official IRS Form 1040-ES to make actual quarterly payments." },
  ],
  "income-mix-planner": [
    { q: "How is SE tax calculated on mixed income?", a: "SE tax applies only to your 1099/freelance income, not W-2 wages (which already have FICA withheld). The tool calculates this automatically." },
    { q: "Should I itemize or use the standard deduction?", a: "The tool uses whatever deduction amount you enter. If your itemized deductions exceed the standard deduction, enter the higher amount." },
  ],
  "tax-checklist-generator": [
    { q: "How does the checklist know what I need?", a: "It generates items based on your income situation. Select all that apply (W-2, freelance, investments, etc.) to get a personalized list." },
    { q: "Can I save the checklist?", a: "Yes, click 'Download Checklist' to save a text file. Your checked items are also preserved during your session." },
  ],
  "1040es-prep-generator": [
    { q: "Is this an official 1040-ES form?", a: "No. This is a prep worksheet to help you estimate quarterly payments. You must use the actual IRS Form 1040-ES for filing." },
    { q: "What is the safe harbor rule?", a: "To avoid underpayment penalties, you should pay the lesser of 90% of your current year tax or 100% of your prior year tax (110% if income > $150K)." },
  ],
  "schedule-c-prep-summary": [
    { q: "Can I file this with the IRS?", a: "No. This is a summary to help you organize before filing. Use the actual IRS Schedule C when you file your return." },
    { q: "What expenses should I track?", a: "Common deductions include home office, software/subscriptions, professional development, vehicle expenses, advertising, supplies, and professional services." },
  ],
  "tax-summary-pdf": [
    { q: "What is this document for?", a: "It creates a comprehensive summary of your tax situation that you can share with an accountant or keep for your records." },
    { q: "Can I submit this to the IRS?", a: "No. This is an informational summary only. It is not a tax return and cannot be filed." },
  ],
  "w2-1099-organizer": [
    { q: "Do you store my W-2 data?", a: "No. Everything stays in your browser. Nothing is transmitted to any server." },
    { q: "Why should I organize before filing?", a: "Having all income documents organized saves time and reduces errors when using tax software or working with a tax preparer." },
  ],
  "year-end-tax-packet": [
    { q: "What's in the year-end packet?", a: "It includes income summary, Schedule C data, deductions, tax calculation, payments/balance, and key rates — all in one PDF." },
    { q: "Can this replace a tax return?", a: "No. This is a preparation document. You still need to file an actual tax return with the IRS using approved software or a tax professional." },
  ],
};

const relatedTools: Record<string, string[]> = {
  "freelancer-tax-planner": ["1040es-prep-generator", "schedule-c-prep-summary", "tax-checklist-generator"],
  "income-mix-planner": ["freelancer-tax-planner", "tax-summary-pdf", "year-end-tax-packet"],
  "tax-checklist-generator": ["w2-1099-organizer", "freelancer-tax-planner", "year-end-tax-packet"],
  "1040es-prep-generator": ["freelancer-tax-planner", "schedule-c-prep-summary", "tax-summary-pdf"],
  "schedule-c-prep-summary": ["1040es-prep-generator", "freelancer-tax-planner", "year-end-tax-packet"],
  "tax-summary-pdf": ["year-end-tax-packet", "w2-1099-organizer", "income-mix-planner"],
  "w2-1099-organizer": ["tax-checklist-generator", "tax-summary-pdf", "year-end-tax-packet"],
  "year-end-tax-packet": ["tax-summary-pdf", "schedule-c-prep-summary", "1040es-prep-generator"],
};

export default function TaxToolDetail() {
  const { slug } = useParams() as { slug: string };
  const tool = taxTools.find(t => t.slug === slug);

  if (!tool) {
    return <div className="container mx-auto py-20 text-center">Tax tool not found</div>;
  }

  const ToolComponent = getToolComponent(tool.slug);
  const faqs = toolFAQs[tool.slug] || [];
  const related = (relatedTools[tool.slug] || [])
    .map(s => taxTools.find(t => t.slug === s))
    .filter(Boolean);

  const isIRSPrep = tool.section === "irs-prep";

  const webAppSchema = buildWebApplicationSchema({
    name: tool.name,
    description: tool.description,
    slug: tool.slug,
    section: tool.section,
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "https://realprofits.com" },
    { name: "Tax Tools", url: "https://realprofits.com/tax-tools" },
    { name: tool.name, url: `https://realprofits.com/tax-tools/${tool.slug}` },
  ]);

  const faqSchema = faqs.length > 0
    ? buildFAQSchema(faqs.map(f => ({ question: f.q, answer: f.a })))
    : null;

  const schemas = [webAppSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])];

  return (
    <div className="w-full min-h-screen bg-muted/10 pb-20" data-testid="tax-tool-detail">
      <Seo
        title={`${tool.name} - Free Tax Tool`}
        description={`${tool.description} Free, no signup required. Informational estimates only.`}
        keywords={`${tool.name.toLowerCase()}, ${tool.slug.replace(/-/g, " ")}, free tax tool, tax calculator, tax planning`}
        path={`/tax-tools/${tool.slug}`}
        jsonLd={schemas}
      />

      <div className="bg-background border-b pt-8 pb-12 mb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <BreadcrumbNav items={[
            { label: "Tax Tools", href: "/tax-tools" },
            { label: tool.name, href: `/tax-tools/${tool.slug}` },
          ]} />

          <div className="flex items-start justify-between flex-wrap gap-4 mt-4">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4" data-testid="tool-title">{tool.name}</h1>
              <p className="text-xl text-muted-foreground max-w-3xl">{tool.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {isIRSPrep && (
                <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-bold" data-testid="prep-only-badge">
                  PREP ONLY
                </span>
              )}
              <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Free
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <CloudSyncIndicator />
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mt-6 max-w-3xl">
            <p className="text-sm text-teal-800">
              <strong>About this tool:</strong> {tool.description} All calculations run in your browser. Sign in to sync your data to the cloud.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm" id={`tool-${tool.slug}`}>
          <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading tool...</div>}>
            <ToolComponent />
          </Suspense>
        </div>

        {/* FAQs */}
        {faqs.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="bg-card border rounded-xl px-6">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Related Tax Tools */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-3xl font-bold mb-6">Related Tax Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map(t => t && (
                <Link key={t.slug} href={`/tax-tools/${t.slug}`} className="group">
                  <div className="bg-card border rounded-xl p-5 hover:shadow-md hover:border-teal-400 transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold mb-0 group-hover:text-teal-600">{t.name}</h3>
                      {t.tag && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.tag}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{t.description}</p>
                    <span className="text-teal-600 text-sm font-semibold flex items-center">
                      Try Tool <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-16 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-bold text-amber-800 mb-2">Important Disclaimer</h3>
          <p className="text-sm text-amber-700 leading-relaxed">
            This tool provides educational estimates based on standard U.S. federal tax formulas. It is NOT tax advice, NOT an official IRS document, and should NOT be submitted to the IRS. Actual tax obligations vary based on your specific financial situation, applicable deductions, credits, and current tax law. Always consult a qualified tax professional for personalized guidance.
          </p>
        </div>
      </div>
    </div>
  );
}

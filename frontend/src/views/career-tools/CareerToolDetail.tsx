"use client";
import React, { Suspense, lazy } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Seo } from "@/components/Seo";
import { careerTools } from "@/data/career-tools";
import { BreadcrumbNav } from "@/components/linking/InternalLinks";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ArrowRight, FileText, DollarSign, CheckSquare } from "lucide-react";
import { CloudSyncIndicator } from "@/components/CloudSyncIndicator";

const ResumeBuilder = lazy(() => import("@/components/career-tools/ResumeBuilder").then(m => ({ default: m.ResumeBuilder })));
const CoverLetterGenerator = lazy(() => import("@/components/career-tools/CoverLetterGenerator").then(m => ({ default: m.CoverLetterGenerator })));
const SalaryComparison = lazy(() => import("@/components/career-tools/SalaryComparison").then(m => ({ default: m.SalaryComparison })));
const AmIUnderpaid = lazy(() => import("@/components/career-tools/AmIUnderpaid").then(m => ({ default: m.AmIUnderpaid })));
const ResumeScore = lazy(() => import("@/components/career-tools/ResumeScore").then(m => ({ default: m.ResumeScore })));
const JobReadinessScore = lazy(() => import("@/components/career-tools/JobReadinessScore").then(m => ({ default: m.JobReadinessScore })));
const OfferComparison = lazy(() => import("@/components/career-tools/OfferComparison").then(m => ({ default: m.OfferComparison })));
const SalaryNegotiation = lazy(() => import("@/components/career-tools/SalaryNegotiation").then(m => ({ default: m.SalaryNegotiation })));
const InterviewPrep = lazy(() => import("@/components/career-tools/InterviewPrep").then(m => ({ default: m.InterviewPrep })));
const EmailTemplates = lazy(() => import("@/components/career-tools/EmailTemplates").then(m => ({ default: m.EmailTemplates })));

function FallbackTool() {
  return (
    <div className="py-12 text-center text-muted-foreground border rounded-xl bg-muted/20">
      <p>This tool is currently being built. Please check back soon!</p>
    </div>
  );
}

function getToolComponent(slug: string) {
  switch (slug) {
    case 'resume-builder': return ResumeBuilder;
    case 'cover-letter-generator': return CoverLetterGenerator;
    case 'salary-comparison': return SalaryComparison;
    case 'am-i-underpaid': return AmIUnderpaid;
    case 'resume-score': return ResumeScore;
    case 'job-readiness-score': return JobReadinessScore;
    case 'offer-comparison': return OfferComparison;
    case 'salary-negotiation': return SalaryNegotiation;
    case 'interview-prep': return InterviewPrep;
    case 'email-templates': return EmailTemplates;
    default: return FallbackTool;
  }
}

const toolFAQs: Record<string, Array<{ q: string; a: string }>> = {
  'resume-builder': [
    { q: "Is my resume data saved?", a: "Yes, your resume is automatically saved in your browser's local storage. You can return anytime to continue editing. Your data never leaves your device." },
    { q: "Can I download my resume as PDF?", a: "Yes! Click the 'Download PDF' button to export your resume. The PDF is formatted for ATS systems and recruiters." },
    { q: "Are these resume templates ATS-friendly?", a: "Yes, all our templates use clean, simple formatting that Applicant Tracking Systems can easily parse." },
    { q: "Can I switch templates without losing my data?", a: "Absolutely. Your content is saved separately from the template, so you can switch anytime." },
  ],
  'cover-letter-generator': [
    { q: "How do I customize the generated letter?", a: "After generating, you can edit any part of the letter directly. The output is fully editable." },
    { q: "Can I copy the letter to use elsewhere?", a: "Yes, use the 'Copy to Clipboard' button to copy the plain text version." },
    { q: "Is my data saved?", a: "Your inputs are saved in your browser so you can return and make changes later." },
  ],
  'salary-comparison': [
    { q: "Where does the salary data come from?", a: "Our benchmarks are compiled from publicly available salary surveys and industry reports. They should be used as general guidance, not exact figures." },
    { q: "How accurate are these salary ranges?", a: "Salary ranges can vary significantly based on company size, specific skills, and local market conditions. Use these as a starting point for research." },
    { q: "Why does location affect salary?", a: "Cost of living and local market conditions vary significantly. Tech hubs like California and New York typically have higher salaries but also higher costs." },
  ],
  'am-i-underpaid': [
    { q: "What does 'underpaid' mean exactly?", a: "We compare your salary to market benchmarks for your role, experience, and location. 'Underpaid' means your salary falls below the typical range." },
    { q: "Should I ask for a raise based on this?", a: "This tool provides data to inform your decisions. Consider additional factors like your performance, company situation, and total compensation before negotiating." },
    { q: "How do I use this information?", a: "Use it as a data point in your career planning. If you're below market, you might research further or prepare for salary negotiations." },
  ],
  'resume-score': [
    { q: "What does the score measure?", a: "The score evaluates completeness, section coverage, content density, and ATS-friendliness indicators. It's not a guarantee of interview success." },
    { q: "How can I improve my score?", a: "Follow the suggestions provided. Common improvements include adding a summary, expanding bullet points, and ensuring all sections are complete." },
    { q: "Is a perfect score necessary?", a: "No. Aim for 70+ which indicates a well-structured resume. Content quality matters more than a perfect score." },
  ],
  'job-readiness-score': [
    { q: "What is job readiness?", a: "It's a snapshot of how prepared you are for a job search, covering resume, skills, online presence, and interview readiness." },
    { q: "How do I improve my readiness?", a: "Focus on the areas marked as incomplete. Use our other tools like Resume Builder and Cover Letter Generator to prepare." },
    { q: "Is this score accurate?", a: "It's based on your self-reported inputs. Be honest for the most useful assessment." },
  ],
  'offer-comparison': [
    { q: "What's included in total compensation?", a: "We include base salary, bonuses, stock/equity, health insurance value, 401k match, and subtract commute costs for non-remote roles." },
    { q: "How do I value stock options?", a: "Enter the total value of your stock grant. We'll divide it by the vesting period (typically 4 years) for annual value." },
    { q: "Can I compare more than 2 offers?", a: "Yes! You can compare up to 5 job offers side by side." },
  ],
  'salary-negotiation': [
    { q: "When should I negotiate?", a: "Almost always! 70%+ of employers expect negotiation. The worst they can say is no." },
    { q: "What if they rescind the offer?", a: "This is extremely rare for professional, respectful negotiations. Companies invest significant time and money in hiring." },
    { q: "Should I give a salary range?", a: "No, give a specific number. Ranges signal you'll accept the bottom of the range." },
  ],
  'interview-prep': [
    { q: "What is the STAR method?", a: "STAR stands for Situation, Task, Action, Result. It's a structured way to answer behavioral questions with specific examples." },
    { q: "How many questions should I prepare?", a: "Aim to have 10-15 well-practiced answers. Most behavioral questions are variations of similar themes." },
    { q: "How do I track my interviews?", a: "Use the Interview Tracker tab to log companies, dates, stages, and outcomes for all your interviews." },
  ],
  'email-templates': [
    { q: "Are these emails generated by AI?", a: "Yes, each email is generated using AI based on the details you provide. You should always personalize the output before sending." },
    { q: "When should I send a thank you email?", a: "Ideally within 24 hours of your interview. Same-day emails show enthusiasm and professionalism." },
    { q: "Can I customize the generated email?", a: "Absolutely. Copy the email and edit it to match your voice, add specific conversation details, and personalize it further." },
    { q: "Is my data saved?", a: "Email inputs are not saved. You generate fresh emails each time for privacy." },
  ],
};

const relatedTools: Record<string, string[]> = {
  'resume-builder': ['resume-score', 'cover-letter-generator', 'job-readiness-score'],
  'cover-letter-generator': ['resume-builder', 'job-readiness-score', 'interview-prep'],
  'salary-comparison': ['am-i-underpaid', 'salary-negotiation', 'offer-comparison'],
  'am-i-underpaid': ['salary-comparison', 'salary-negotiation', 'offer-comparison'],
  'resume-score': ['resume-builder', 'job-readiness-score', 'cover-letter-generator'],
  'job-readiness-score': ['resume-builder', 'resume-score', 'interview-prep'],
  'offer-comparison': ['salary-comparison', 'salary-negotiation', 'am-i-underpaid'],
  'salary-negotiation': ['salary-comparison', 'am-i-underpaid', 'offer-comparison'],
  'interview-prep': ['resume-builder', 'cover-letter-generator', 'job-readiness-score'],
  'email-templates': ['cover-letter-generator', 'interview-prep', 'salary-negotiation'],
};

export default function CareerToolDetail() {
  const { slug } = useParams() as { slug: string };
  const tool = careerTools.find(t => t.slug === slug);

  if (!tool) {
    return <div className="container mx-auto py-20 text-center">Tool not found</div>;
  }

  const ToolComponent = getToolComponent(tool.slug);
  const faqs = toolFAQs[tool.slug] || [];
  const related = (relatedTools[tool.slug] || [])
    .map(s => careerTools.find(t => t.slug === s))
    .filter(Boolean);

  return (
    <div className="w-full min-h-screen bg-muted/10 pb-20">
      <Seo 
        title={`${tool.name} - Free Career Tool`}
        description={tool.description + " Free, no signup required. Your data stays in your browser."}
        keywords={`${tool.name.toLowerCase()}, ${tool.slug.replace(/-/g, ' ')}, free career tool, job search tool, ${tool.category} tool`}
        path={`/career-tools/${tool.slug}`}
      />
      
      <div className="bg-background border-b pt-8 pb-12 mb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <BreadcrumbNav items={[
            { label: "Career Tools", href: "/career-tools" },
            { label: tool.name, href: `/career-tools/${tool.slug}` }
          ]} />
          
          <div className="flex items-start justify-between flex-wrap gap-4 mt-4">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{tool.name}</h1>
              <p className="text-xl text-muted-foreground max-w-3xl">{tool.description}</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
              <CheckSquare className="w-4 h-4" /> 100% Free
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <CloudSyncIndicator />
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6 max-w-3xl">
            <p className="text-sm text-amber-800">
              <strong>Quick Summary:</strong> {tool.description} Sign in to sync your data to the cloud.
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
        
        {/* How It Works */}
        <div className="mt-16">
          <h2 className="font-serif text-3xl font-bold mb-6">How to Use This Tool</h2>
          <div className="bg-card border rounded-xl p-6">
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold flex-shrink-0">1</span>
                <div>
                  <strong>Enter your information</strong>
                  <p className="text-muted-foreground text-sm">Fill in the form fields with your details. Everything auto-saves as you type.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold flex-shrink-0">2</span>
                <div>
                  <strong>Review the results</strong>
                  <p className="text-muted-foreground text-sm">See your results update in real-time as you make changes.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold flex-shrink-0">3</span>
                <div>
                  <strong>Download or copy</strong>
                  <p className="text-muted-foreground text-sm">Export your results as PDF or copy to use elsewhere.</p>
                </div>
              </li>
            </ol>
          </div>
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
        
        {/* Related Tools */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-3xl font-bold mb-6">Related Career Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map(t => t && (
                <Link key={t.slug} href={`/career-tools/${t.slug}`} className="group">
                  <div className="bg-card border rounded-xl p-5 hover:shadow-md hover:border-teal-400 transition-all">
                    <h3 className="font-bold mb-2 group-hover:text-teal-600">{t.name}</h3>
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
        
        {/* Related Calculators */}
        <div className="mt-16">
          <h2 className="font-serif text-3xl font-bold mb-6">Related Calculators & Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/tools/paycheck-calculator" className="group">
              <div className="bg-card border rounded-xl p-5 hover:shadow-md hover:border-teal-400 transition-all">
                <DollarSign className="w-6 h-6 text-emerald-600 mb-2" />
                <h3 className="font-bold mb-1 group-hover:text-teal-600">Paycheck Calculator</h3>
                <p className="text-sm text-muted-foreground">Estimate take-home pay</p>
              </div>
            </Link>
            <Link href="/calculators/salary-to-hourly" className="group">
              <div className="bg-card border rounded-xl p-5 hover:shadow-md hover:border-teal-400 transition-all">
                <DollarSign className="w-6 h-6 text-blue-600 mb-2" />
                <h3 className="font-bold mb-1 group-hover:text-teal-600">Salary to Hourly</h3>
                <p className="text-sm text-muted-foreground">Convert annual to hourly rate</p>
              </div>
            </Link>
            <Link href="/guides" className="group">
              <div className="bg-card border rounded-xl p-5 hover:shadow-md hover:border-teal-400 transition-all">
                <FileText className="w-6 h-6 text-violet-600 mb-2" />
                <h3 className="font-bold mb-1 group-hover:text-teal-600">Salary Guides</h3>
                <p className="text-sm text-muted-foreground">Explore salary data by role</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import {
  findBySlug,
  getAllSlugs,
  salaryEntries,
  taxEntries,
  savingsEntries,
  mortgageEntries,
  debtEntries,
  freelancerEntries,
  locationSalaryEntries,
} from "@/lib/pseo/datasets";
import type {
  SalaryEntry,
  TaxEntry,
  SavingsEntry,
  MortgageEntry,
  DebtEntry,
  FreelancerEntry,
  LocationSalaryEntry,
} from "@/lib/pseo/datasets";
import {
  generateIntro,
  generateExplanation,
  generateFAQs,
  generateLocationIntro,
  generateLocationExplanation,
  generateLocationFAQs,
  generateCityComparison,
  getCostTier,
  type LocationContext,
} from "@/lib/pseo/variationEngine";
import {
  buildHowToSchema,
  buildFAQSchema,
  buildBreadcrumbSchema,
} from "@/lib/schemas";
import { CalculatorInlineCard, YouMightAlsoNeed } from "@/components/linking/InternalLinks";

// ─── SSG: Pre-generate ALL guide pages at build time ────────
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// ─── DYNAMIC METADATA PER PAGE ──────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = findBySlug(slug);
  if (!entry) return { title: "Guide Not Found" };

  const fmt = (n: number) => `$${n.toLocaleString()}`;
  let title = entry.title;
  let description = "";
  let keywords = "";

  switch (entry.type) {
    case "salary": {
      const d = entry as SalaryEntry;
      description = `Find out if ${fmt(d.value)} is a good salary. See monthly take-home pay, tax breakdown, and national comparison.`;
      keywords = `${fmt(d.value)} salary, is ${fmt(d.value)} good salary, ${fmt(d.value)} a year, take home pay, salary breakdown`;
      break;
    }
    case "tax": {
      const d = entry as TaxEntry;
      description = `Detailed tax breakdown on ${fmt(d.value)} income. See federal, state, FICA taxes, effective rate, and take-home pay.`;
      keywords = `tax on ${fmt(d.value)}, ${fmt(d.value)} income tax, federal tax ${fmt(d.value)}, effective tax rate, take home pay`;
      break;
    }
    case "savings": {
      const d = entry as SavingsEntry;
      description = `A practical guide to saving ${fmt(d.value)}. See monthly plans for 6-month to 5-year timelines.`;
      keywords = `how to save ${fmt(d.value)}, savings plan ${fmt(d.value)}, monthly savings goal, ${d.context.toLowerCase()}`;
      break;
    }
    case "mortgage": {
      const d = entry as MortgageEntry;
      description = `${fmt(d.value)} mortgage at ${d.rate}% for ${d.term} years. Monthly payment: ${fmt(d.monthlyPayment)}. Total interest: ${fmt(d.totalInterest)}.`;
      keywords = `${fmt(d.value)} mortgage, mortgage payment ${fmt(d.value)}, ${d.rate} percent mortgage, ${d.term} year mortgage, mortgage calculator`;
      break;
    }
    case "debt": {
      const d = entry as DebtEntry;
      const isPayoff = d.variant === "payoff";
      description = isPayoff
        ? `Pay off ${fmt(d.value)} in debt: strategies, timelines, and interest costs at ${d.interestRate}% APR.`
        : `How much interest on ${fmt(d.value)} credit card balance at ${d.interestRate}% APR. Minimum vs aggressive payoff comparison.`;
      keywords = `pay off ${fmt(d.value)} debt, ${fmt(d.value)} credit card, debt payoff strategy, ${d.interestRate} percent interest, debt calculator`;
      break;
    }
    case "freelancer": {
      const d = entry as FreelancerEntry;
      const isSETax = d.variant === "se-tax";
      description = isSETax
        ? `Self-employment tax breakdown on ${fmt(d.value)}. SE tax: ${fmt(d.selfEmploymentTax)}. Total tax: ${fmt(d.totalTax)}.`
        : `How much to set aside for taxes on ${fmt(d.value)} freelance income. Recommended: ${d.recommendedSetAsidePercent}%.`;
      keywords = `self employment tax ${fmt(d.value)}, freelance tax ${fmt(d.value)}, ${fmt(d.value)} freelance income, quarterly taxes, tax set aside`;
      break;
    }
    case "location-salary": {
      const d = entry as LocationSalaryEntry;
      description = `What is ${fmt(d.value)} really worth in ${d.cityName}, ${d.state}? See cost-of-living adjusted salary, rent burden, state taxes, and comparison to other cities.`;
      keywords = `${fmt(d.value)} salary ${d.cityName}, cost of living ${d.cityName}, ${fmt(d.value)} in ${d.state}, rent on ${fmt(d.value)} salary, salary comparison cities`;
      break;
    }
  }

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: `${title} | RealProfits`,
      description,
      url: `https://realprofits.com/guides/${slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | RealProfits`,
      description,
    },
    alternates: {
      canonical: `https://realprofits.com/guides/${slug}`,
    },
  };
}

// ─── SHARED COMPONENTS ──────────────────────────────────────

function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const schemas = Array.isArray(data) ? data : [data];
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

function PseoBreadcrumb({ label }: { label: string }) {
  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-8" data-testid="pseo-breadcrumb">
      <Link href="/" className="hover:text-foreground">Home</Link>
      <ChevronRight className="h-4 w-4 mx-2" />
      <Link href="/guides" className="hover:text-foreground">Guides</Link>
      <ChevronRight className="h-4 w-4 mx-2" />
      <span className="text-foreground truncate">{label}</span>
    </nav>
  );
}

function DirectAnswer({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 mb-10" data-testid="pseo-direct-answer">
      <p className="text-sm font-semibold text-teal-800 mb-1">Direct Answer</p>
      <p className="text-gray-800">{children}</p>
    </div>
  );
}

// Deterministic shuffle using slug hash instead of Math.random()
function deterministicShuffle<T>(arr: T[], seed: string): T[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    hash = ((hash << 5) - hash + i) | 0;
    const j = Math.abs(hash) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function CompareWithOthers({ current, allItems, type, labelFn }: {
  current: string;
  allItems: { slug: string; value: number }[];
  type: string;
  labelFn: (item: { slug: string; value: number }) => string;
}) {
  const others = deterministicShuffle(
    allItems.filter(i => i.slug !== current),
    current
  ).slice(0, 5);

  return (
    <div className="bg-gray-50 border rounded-xl p-6 mt-10" data-testid="pseo-compare-section">
      <h3 className="font-serif text-lg font-bold mb-4">Compare With Similar {type}</h3>
      <ul className="space-y-2">
        {others.map(item => (
          <li key={item.slug}>
            <Link href={`/guides/${item.slug}`} className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              {labelFn(item)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FAQSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <>
      <h2>Frequently Asked Questions</h2>
      {faqs.map((faq, i) => (
        <div key={i}>
          <p><strong>{faq.question}</strong></p>
          <p>{faq.answer}</p>
        </div>
      ))}
    </>
  );
}

const fmt = (n: number) => `$${n.toLocaleString()}`;

// ─── MAIN PAGE COMPONENT (SERVER) ───────────────────────────

export default async function PseoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = findBySlug(slug);

  if (!entry) return notFound();

  switch (entry.type) {
    case "salary": return <SalaryGuidePage data={entry as SalaryEntry} />;
    case "tax": return <TaxGuidePage data={entry as TaxEntry} />;
    case "savings": return <SavingsGuidePage data={entry as SavingsEntry} />;
    case "mortgage": return <MortgageGuidePage data={entry as MortgageEntry} />;
    case "debt": return <DebtGuidePage data={entry as DebtEntry} />;
    case "freelancer": return <FreelancerGuidePage data={entry as FreelancerEntry} />;
    case "location-salary": return <LocationSalaryGuidePage data={entry as LocationSalaryEntry} />;
    default: return notFound();
  }
}

// ─── SALARY ─────────────────────────────────────────────────

function SalaryGuidePage({ data }: { data: SalaryEntry }) {
  const v = fmt(data.value);
  const intro = generateIntro("salary", data.value);
  const explanation = generateExplanation("salary", data.value);
  const faqs = generateFAQs("salary", data.value);

  const schemas = [
    buildHowToSchema({
      title: `How to Evaluate a ${v} Salary`,
      description: data.title,
      steps: [
        { name: "Calculate monthly gross", text: `Divide ${v} by 12 to get monthly gross pay of ${fmt(data.monthlyGross)}.` },
        { name: "Estimate taxes", text: `In the ${data.taxBracket} federal bracket, estimate federal tax of ~${fmt(data.estimatedFedTax)} plus FICA of ~${fmt(data.estimatedFICA)}.` },
        { name: "Find your take-home", text: `After all taxes, estimated monthly take-home is approximately ${fmt(data.monthlyNet)}.` },
      ],
    }),
    buildFAQSchema(faqs),
    buildBreadcrumbSchema([
      { name: "Home", url: "https://realprofits.com" },
      { name: "Guides", url: "https://realprofits.com/guides" },
      { name: data.title, url: `https://realprofits.com/guides/${data.slug}` },
    ]),
  ];

  return (
    <div className="w-full bg-background" data-testid="salary-guide-page">
      <JsonLd data={schemas} />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <PseoBreadcrumb label={`${v} Salary`} />
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">{data.title}</h1>

        <DirectAnswer>
          A {v} salary is considered {data.context.toLowerCase()} in the United States. After estimated federal taxes (~{fmt(data.estimatedFedTax)}), state taxes (~{fmt(data.estimatedStateTax)}), and FICA (~{fmt(data.estimatedFICA)}), monthly take-home pay is approximately {fmt(data.monthlyNet)}.
        </DirectAnswer>

        <div className="prose prose-lg prose-headings:font-serif max-w-none">
          <h2>Understanding {v} After Taxes</h2>
          <p>{intro}</p>
          <p>Earning {v} per year translates to <strong>{fmt(data.monthlyGross)}</strong> per month before deductions. After federal income tax, state tax (est. 5%), and FICA, the estimated monthly take-home drops to <strong>{fmt(data.monthlyNet)}</strong>.</p>

          <div className="not-prose my-8 bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="text-left p-4 font-bold">Category</th><th className="text-right p-4 font-bold">Annual</th><th className="text-right p-4 font-bold">Monthly</th></tr></thead>
              <tbody className="divide-y">
                <tr><td className="p-4">Gross Income</td><td className="text-right p-4 font-semibold">{fmt(data.value)}</td><td className="text-right p-4">{fmt(data.monthlyGross)}</td></tr>
                <tr><td className="p-4">Federal Tax ({data.taxBracket} bracket)</td><td className="text-right p-4 text-red-600">-{fmt(data.estimatedFedTax)}</td><td className="text-right p-4">-{fmt(Math.round(data.estimatedFedTax/12))}</td></tr>
                <tr><td className="p-4">State Tax (est. 5%)</td><td className="text-right p-4 text-red-600">-{fmt(data.estimatedStateTax)}</td><td className="text-right p-4">-{fmt(Math.round(data.estimatedStateTax/12))}</td></tr>
                <tr><td className="p-4">FICA (7.65%)</td><td className="text-right p-4 text-red-600">-{fmt(data.estimatedFICA)}</td><td className="text-right p-4">-{fmt(Math.round(data.estimatedFICA/12))}</td></tr>
                <tr className="bg-teal-50 font-bold"><td className="p-4">Estimated Take-Home</td><td className="text-right p-4 text-teal-700">{fmt(data.value - data.estimatedFedTax - data.estimatedStateTax - data.estimatedFICA)}</td><td className="text-right p-4 text-teal-700">{fmt(data.monthlyNet)}</td></tr>
              </tbody>
            </table>
          </div>

          <h2>How {v} Compares</h2>
          <p>The median individual income in the U.S. is approximately $42,000 per year. At {v}, {data.value >= 42000 ? `the salary is ${Math.round((data.value / 42000 - 1) * 100)}% above the median, placing it in the "${data.context}" range` : "the salary falls below the national median, requiring careful budgeting"}.</p>
          <CalculatorInlineCard slug="salary-reality-calculator" />

          <h2>Budgeting on {v}</h2>
          <p>{explanation}</p>
          <p>Using the 50/30/20 rule on monthly take-home of {fmt(data.monthlyNet)}:</p>
          <ul>
            <li><strong>Needs (50%):</strong> {fmt(Math.round(data.monthlyNet * 0.5))}/month</li>
            <li><strong>Wants (30%):</strong> {fmt(Math.round(data.monthlyNet * 0.3))}/month</li>
            <li><strong>Savings (20%):</strong> {fmt(Math.round(data.monthlyNet * 0.2))}/month</li>
          </ul>

          <FAQSection faqs={faqs} />
        </div>

        <CompareWithOthers current={data.slug} allItems={salaryEntries} type="Salaries" labelFn={item => `Is ${fmt(item.value)} a Good Salary?`} />
        <YouMightAlsoNeed currentCategory="income-freelance" />
      </div>
    </div>
  );
}

// ─── TAX ────────────────────────────────────────────────────

function TaxGuidePage({ data }: { data: TaxEntry }) {
  const v = fmt(data.value);
  const intro = generateIntro("tax", data.value);
  const explanation = generateExplanation("tax", data.value);
  const faqs = generateFAQs("tax", data.value);

  const schemas = [
    buildHowToSchema({
      title: `How to Calculate Tax on ${v} Income`,
      description: data.title,
      steps: [
        { name: "Apply standard deduction", text: `Subtract $${data.standardDeduction.toLocaleString()} from ${v} for taxable income of ${fmt(data.taxableIncome)}.` },
        { name: "Calculate federal tax", text: `Apply progressive brackets for estimated federal tax of ${fmt(data.estimatedFedTax)} (${data.effectiveRate}% effective rate).` },
        { name: "Add FICA and state", text: `Add FICA (${fmt(data.ficaTax)}) and state tax (${fmt(data.estimatedStateTax)}) for total tax of ${fmt(data.totalTax)}.` },
      ],
    }),
    buildFAQSchema(faqs),
    buildBreadcrumbSchema([
      { name: "Home", url: "https://realprofits.com" },
      { name: "Guides", url: "https://realprofits.com/guides" },
      { name: data.title, url: `https://realprofits.com/guides/${data.slug}` },
    ]),
  ];

  return (
    <div className="w-full bg-background" data-testid="tax-guide-page">
      <JsonLd data={schemas} />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <PseoBreadcrumb label={`Tax on ${v}`} />
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">{data.title}</h1>

        <DirectAnswer>
          On {v} gross income (single filer), estimated federal tax is {fmt(data.estimatedFedTax)} ({data.effectiveRate}% effective rate), FICA is {fmt(data.ficaTax)}, and state tax is ~{fmt(data.estimatedStateTax)}. Total estimated tax: {fmt(data.totalTax)}. Take-home: {fmt(data.takeHome)}/year or ~{fmt(Math.round(data.takeHome / 12))}/month.
        </DirectAnswer>

        <div className="prose prose-lg prose-headings:font-serif max-w-none">
          <h2>Complete Tax Breakdown for {v}</h2>
          <p>{intro}</p>

          <div className="not-prose my-8 bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="text-left p-4 font-bold">Item</th><th className="text-right p-4 font-bold">Amount</th></tr></thead>
              <tbody className="divide-y">
                <tr><td className="p-4">Gross Income</td><td className="text-right p-4 font-semibold">{v}</td></tr>
                <tr><td className="p-4">Standard Deduction</td><td className="text-right p-4">-{fmt(data.standardDeduction)}</td></tr>
                <tr><td className="p-4">Taxable Income</td><td className="text-right p-4 font-semibold">{fmt(data.taxableIncome)}</td></tr>
                <tr><td className="p-4">Federal Income Tax</td><td className="text-right p-4 text-red-600">-{fmt(data.estimatedFedTax)}</td></tr>
                <tr><td className="p-4">FICA (SS + Medicare)</td><td className="text-right p-4 text-red-600">-{fmt(data.ficaTax)}</td></tr>
                <tr><td className="p-4">State Tax (est. 5%)</td><td className="text-right p-4 text-red-600">-{fmt(data.estimatedStateTax)}</td></tr>
                <tr className="font-bold"><td className="p-4">Total Estimated Tax</td><td className="text-right p-4 text-red-700">{fmt(data.totalTax)}</td></tr>
                <tr className="bg-teal-50 font-bold"><td className="p-4">Take-Home Pay</td><td className="text-right p-4 text-teal-700">{fmt(data.takeHome)}/year</td></tr>
                <tr className="bg-teal-50"><td className="p-4">Monthly Take-Home</td><td className="text-right p-4 font-semibold text-teal-700">{fmt(Math.round(data.takeHome / 12))}/month</td></tr>
              </tbody>
            </table>
          </div>

          <h2>How Progressive Tax Brackets Work</h2>
          <p>The effective federal tax rate on {v} is <strong>{data.effectiveRate}%</strong>. This is lower than the marginal rate because only income within each bracket is taxed at that rate.</p>
          <CalculatorInlineCard slug="simple-tax-estimator" />

          <h2>Tax Optimization Strategies</h2>
          <p>{explanation}</p>

          <FAQSection faqs={faqs} />
        </div>

        <CompareWithOthers current={data.slug} allItems={taxEntries} type="Tax Brackets" labelFn={item => `Tax on ${fmt(item.value)} Income`} />
        <YouMightAlsoNeed currentCategory="taxes" />
      </div>
    </div>
  );
}

// ─── SAVINGS ────────────────────────────────────────────────

function SavingsGuidePage({ data }: { data: SavingsEntry }) {
  const v = fmt(data.value);
  const intro = generateIntro("savings", data.value);
  const explanation = generateExplanation("savings", data.value);
  const faqs = generateFAQs("savings", data.value);

  const schemas = [
    buildHowToSchema({
      title: `How to Save ${v} for a ${data.context}`,
      description: data.title,
      steps: [
        { name: "Set your timeline", text: `Decide when you need ${v}. In 6 months, save ${fmt(data.monthlyAt6mo)}/month. In 1 year, save ${fmt(data.monthlyAt1yr)}/month.` },
        { name: "Automate transfers", text: "Set up automatic transfers from checking to a dedicated savings account on each payday." },
        { name: "Track progress", text: `Monitor your balance monthly. At ${fmt(data.monthlyAt1yr)}/month, you reach ${v} in 12 months.` },
      ],
    }),
    buildFAQSchema(faqs),
    buildBreadcrumbSchema([
      { name: "Home", url: "https://realprofits.com" },
      { name: "Guides", url: "https://realprofits.com/guides" },
      { name: data.title, url: `https://realprofits.com/guides/${data.slug}` },
    ]),
  ];

  return (
    <div className="w-full bg-background" data-testid="savings-guide-page">
      <JsonLd data={schemas} />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <PseoBreadcrumb label={`Save ${v}`} />
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">{data.title}</h1>

        <DirectAnswer>
          To save {v} for a {data.context.toLowerCase()}, set aside {fmt(data.monthlyAt1yr)}/month for 1 year, or {fmt(data.monthlyAt2yr)}/month over 2 years. Automate transfers and use a high-yield savings account to earn interest along the way.
        </DirectAnswer>

        <div className="prose prose-lg prose-headings:font-serif max-w-none">
          <h2>Monthly Savings Plan for {v}</h2>
          <p>{intro}</p>

          <div className="not-prose my-8 bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="text-left p-4 font-bold">Timeline</th><th className="text-right p-4 font-bold">Monthly</th><th className="text-right p-4 font-bold">Weekly</th></tr></thead>
              <tbody className="divide-y">
                <tr><td className="p-4">6 Months</td><td className="text-right p-4 font-semibold">{fmt(data.monthlyAt6mo)}</td><td className="text-right p-4">{fmt(Math.ceil(data.monthlyAt6mo / 4.33))}</td></tr>
                <tr><td className="p-4">1 Year</td><td className="text-right p-4 font-semibold">{fmt(data.monthlyAt1yr)}</td><td className="text-right p-4">{fmt(Math.ceil(data.monthlyAt1yr / 4.33))}</td></tr>
                <tr><td className="p-4">2 Years</td><td className="text-right p-4 font-semibold">{fmt(data.monthlyAt2yr)}</td><td className="text-right p-4">{fmt(Math.ceil(data.monthlyAt2yr / 4.33))}</td></tr>
                <tr className="bg-teal-50"><td className="p-4 font-bold">5 Years</td><td className="text-right p-4 font-bold text-teal-700">{fmt(data.monthlyAt5yr)}</td><td className="text-right p-4 font-bold text-teal-700">{fmt(Math.ceil(data.monthlyAt5yr / 4.33))}</td></tr>
              </tbody>
            </table>
          </div>

          <h2>Step-by-Step Approach</h2>
          <p>{explanation}</p>
          <p><strong>1. Set your timeline.</strong> A shorter deadline means larger monthly contributions, while a longer timeline makes it more manageable.</p>
          <p><strong>2. Open a dedicated account.</strong> Keep your {data.context.toLowerCase()} savings separate from everyday spending.</p>
          <p><strong>3. Automate your savings.</strong> Set up recurring automatic transfers on each payday.</p>
          <CalculatorInlineCard slug="savings-goal-calculator" />

          <FAQSection faqs={faqs} />
        </div>

        <CompareWithOthers current={data.slug} allItems={savingsEntries} type="Savings Goals" labelFn={item => `How to Save ${fmt(item.value)}`} />
        <YouMightAlsoNeed currentCategory="saving-vs-investing" />
      </div>
    </div>
  );
}

// ─── MORTGAGE ───────────────────────────────────────────────

function MortgageGuidePage({ data }: { data: MortgageEntry }) {
  const v = fmt(data.value);
  const intro = generateIntro("mortgage", data.value);
  const explanation = generateExplanation("mortgage", data.value);
  const faqs = generateFAQs("mortgage", data.value);
  const interestRatio = Math.round((data.totalInterest / data.value) * 100);

  const schemas = [
    buildHowToSchema({
      title: `Understanding a ${v} Mortgage`,
      description: data.title,
      steps: [
        { name: "Determine monthly payment", text: `At ${data.rate}% over ${data.term} years, the monthly payment on ${v} is ${fmt(data.monthlyPayment)}.` },
        { name: "Calculate total interest", text: `Over the full term, you'll pay ${fmt(data.totalInterest)} in total interest.` },
        { name: "Evaluate total cost", text: `The total cost of the loan (principal + interest) is ${fmt(data.totalCost)}.` },
      ],
    }),
    buildFAQSchema(faqs),
    buildBreadcrumbSchema([
      { name: "Home", url: "https://realprofits.com" },
      { name: "Guides", url: "https://realprofits.com/guides" },
      { name: data.title, url: `https://realprofits.com/guides/${data.slug}` },
    ]),
  ];

  return (
    <div className="w-full bg-background" data-testid="mortgage-guide-page">
      <JsonLd data={schemas} />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <PseoBreadcrumb label={data.title} />
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">{data.title}</h1>

        <DirectAnswer>
          A {v} mortgage at {data.rate}% for {data.term} years has a monthly payment of {fmt(data.monthlyPayment)}. Over the full term, you&apos;ll pay {fmt(data.totalInterest)} in interest, bringing the total cost to {fmt(data.totalCost)}.
        </DirectAnswer>

        <div className="prose prose-lg prose-headings:font-serif max-w-none">
          <h2>Mortgage Breakdown</h2>
          <p>{intro}</p>

          <div className="not-prose my-8 bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="text-left p-4 font-bold">Detail</th><th className="text-right p-4 font-bold">Amount</th></tr></thead>
              <tbody className="divide-y">
                <tr><td className="p-4">Loan Amount</td><td className="text-right p-4 font-semibold">{v}</td></tr>
                <tr><td className="p-4">Interest Rate</td><td className="text-right p-4">{data.rate}%</td></tr>
                <tr><td className="p-4">Loan Term</td><td className="text-right p-4">{data.term} years</td></tr>
                <tr><td className="p-4">Monthly Payment (P&amp;I)</td><td className="text-right p-4 font-bold text-teal-700">{fmt(data.monthlyPayment)}</td></tr>
                <tr><td className="p-4">Total Interest Paid</td><td className="text-right p-4 text-red-600">{fmt(data.totalInterest)}</td></tr>
                <tr className="bg-teal-50 font-bold"><td className="p-4">Total Cost of Loan</td><td className="text-right p-4 text-teal-700">{fmt(data.totalCost)}</td></tr>
              </tbody>
            </table>
          </div>

          <h2>What the Numbers Mean</h2>
          <p>On this {v} mortgage, total interest adds <strong>{interestRatio}%</strong> to the original loan amount. That means for every dollar borrowed, you pay an additional ${(interestRatio / 100).toFixed(2)} in interest over {data.term} years.</p>
          <p>{explanation}</p>
          <CalculatorInlineCard slug="mortgage-calculator" />

          <h2>Rate &amp; Term Impact</h2>
          <p>Reducing the rate by 1% on a {v} mortgage saves approximately {fmt(Math.round(data.value * 0.007 * data.term))} in total interest. Switching from a 30-year to 15-year term roughly doubles the monthly payment but cuts total interest by more than half.</p>

          <FAQSection faqs={faqs} />
        </div>

        <CompareWithOthers current={data.slug} allItems={mortgageEntries.filter(e => e.variant === "base")} type="Mortgages" labelFn={item => `${fmt(item.value)} Mortgage`} />
        <YouMightAlsoNeed currentCategory="life-decisions" />
      </div>
    </div>
  );
}

// ─── DEBT ───────────────────────────────────────────────────

function DebtGuidePage({ data }: { data: DebtEntry }) {
  const v = fmt(data.value);
  const intro = generateIntro("debt", data.value);
  const explanation = generateExplanation("debt", data.value);
  const faqs = generateFAQs("debt", data.value);
  const isPayoff = data.variant === "payoff";
  const interestSaved = data.minimumTotalInterest - data.aggressiveTotalInterest;
  const monthsSaved = data.minimumPayoffMonths - data.aggressivePayoffMonths;

  const schemas = [
    buildHowToSchema({
      title: isPayoff ? `How to Pay Off ${v} in Debt` : `Understanding Interest on ${v} Credit Card Balance`,
      description: data.title,
      steps: isPayoff ? [
        { name: "Calculate minimum payment", text: `The minimum payment on ${v} at ${data.interestRate}% APR is about ${fmt(data.minimumPayment)}/month.` },
        { name: "See minimum payoff timeline", text: `At minimum payments, it takes ${data.minimumPayoffMonths} months (${(data.minimumPayoffMonths / 12).toFixed(1)} years) and costs ${fmt(data.minimumTotalInterest)} in interest.` },
        { name: "Apply aggressive strategy", text: `At ${fmt(data.aggressivePayment)}/month, payoff takes ${data.aggressivePayoffMonths} months and costs only ${fmt(data.aggressiveTotalInterest)} in interest.` },
      ] : [
        { name: "Understand APR impact", text: `At ${data.interestRate}% APR on ${v}, you pay roughly ${fmt(Math.round(data.value * data.interestRate / 100))}/year in interest.` },
        { name: "Calculate with minimum payments", text: `Minimum payments of ${fmt(data.minimumPayment)}/month result in ${fmt(data.minimumTotalInterest)} total interest over ${data.minimumPayoffMonths} months.` },
        { name: "Compare strategies", text: `Tripling your payment to ${fmt(data.aggressivePayment)}/month saves ${fmt(data.minimumTotalInterest - data.aggressiveTotalInterest)} in interest.` },
      ],
    }),
    buildFAQSchema(faqs),
    buildBreadcrumbSchema([
      { name: "Home", url: "https://realprofits.com" },
      { name: "Guides", url: "https://realprofits.com/guides" },
      { name: data.title, url: `https://realprofits.com/guides/${data.slug}` },
    ]),
  ];

  return (
    <div className="w-full bg-background" data-testid="debt-guide-page">
      <JsonLd data={schemas} />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <PseoBreadcrumb label={isPayoff ? `Pay Off ${v} Debt` : `${v} CC Interest`} />
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">{data.title}</h1>

        <DirectAnswer>
          {isPayoff
            ? <>With minimum payments of {fmt(data.minimumPayment)}/month at {data.interestRate}% APR, paying off {v} takes {data.minimumPayoffMonths} months and costs {fmt(data.minimumTotalInterest)} in interest. Paying {fmt(data.aggressivePayment)}/month instead saves {fmt(interestSaved)} and {monthsSaved} months.</>
            : <>At {data.interestRate}% APR, a {v} credit card balance accrues roughly {fmt(Math.round(data.value * data.interestRate / 100 / 12))}/month in interest. Minimum payments result in {fmt(data.minimumTotalInterest)} total interest over {data.minimumPayoffMonths} months.</>
          }
        </DirectAnswer>

        <div className="prose prose-lg prose-headings:font-serif max-w-none">
          <h2>{isPayoff ? "Payoff Strategy Comparison" : "Interest Cost Analysis"}</h2>
          <p>{intro}</p>

          <div className="not-prose my-8 bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="text-left p-4 font-bold">Strategy</th><th className="text-right p-4 font-bold">Monthly</th><th className="text-right p-4 font-bold">Months</th><th className="text-right p-4 font-bold">Total Interest</th></tr></thead>
              <tbody className="divide-y">
                <tr><td className="p-4">Minimum Payment</td><td className="text-right p-4">{fmt(data.minimumPayment)}</td><td className="text-right p-4">{data.minimumPayoffMonths}</td><td className="text-right p-4 text-red-600">{fmt(data.minimumTotalInterest)}</td></tr>
                <tr className="bg-teal-50"><td className="p-4 font-bold">Aggressive Payment</td><td className="text-right p-4 font-bold">{fmt(data.aggressivePayment)}</td><td className="text-right p-4 font-bold">{data.aggressivePayoffMonths}</td><td className="text-right p-4 font-bold text-teal-700">{fmt(data.aggressiveTotalInterest)}</td></tr>
                <tr className="font-bold bg-green-50"><td className="p-4">You Save</td><td className="text-right p-4"></td><td className="text-right p-4 text-green-700">{monthsSaved} months</td><td className="text-right p-4 text-green-700">{fmt(interestSaved)}</td></tr>
              </tbody>
            </table>
          </div>

          <h2>{isPayoff ? "Why Minimum Payments Cost So Much" : "How Credit Card Interest Compounds"}</h2>
          <p>{explanation}</p>
          <p>At {data.interestRate}% APR, each month {fmt(Math.round(data.value * data.interestRate / 100 / 12))} of your minimum payment goes to interest alone. The remaining {fmt(Math.max(0, data.minimumPayment - Math.round(data.value * data.interestRate / 100 / 12)))} reduces your actual balance.</p>
          <CalculatorInlineCard slug="credit-card-payoff-calculator" />

          <FAQSection faqs={faqs} />
        </div>

        <CompareWithOthers current={data.slug} allItems={debtEntries.filter(e => e.variant === data.variant)} type="Debt Levels" labelFn={item => isPayoff ? `Pay Off ${fmt(item.value)} Debt` : `Interest on ${fmt(item.value)}`} />
        <YouMightAlsoNeed currentCategory="debt-credit" />
      </div>
    </div>
  );
}

// ─── FREELANCER ─────────────────────────────────────────────

function FreelancerGuidePage({ data }: { data: FreelancerEntry }) {
  const v = fmt(data.value);
  const intro = generateIntro("freelancer", data.value);
  const explanation = generateExplanation("freelancer", data.value);
  const faqs = generateFAQs("freelancer", data.value);
  const isSETax = data.variant === "se-tax";
  const effectiveRate = Math.round((data.totalTax / data.value) * 1000) / 10;

  const schemas = [
    buildHowToSchema({
      title: isSETax ? `Self-Employment Tax on ${v}` : `Tax Set-Aside on ${v} Freelance Income`,
      description: data.title,
      steps: [
        { name: "Calculate net earnings", text: `Multiply ${v} by 92.35% to get net earnings of ${fmt(data.netEarnings)} subject to SE tax.` },
        { name: "Determine SE tax", text: `At 15.3%, self-employment tax is ${fmt(data.selfEmploymentTax)}.` },
        { name: isSETax ? "Add income tax" : "Set aside quarterly", text: isSETax ? `Federal income tax adds ${fmt(data.estimatedFedTax)}, plus ${fmt(data.estimatedStateTax)} in state tax, for a total tax liability of ${fmt(data.totalTax)}.` : `Set aside ${data.recommendedSetAsidePercent}% of income (${fmt(Math.round(data.value * data.recommendedSetAsidePercent / 100))}), paying ${fmt(data.quarterlyPayment)} each quarter.` },
      ],
    }),
    buildFAQSchema(faqs),
    buildBreadcrumbSchema([
      { name: "Home", url: "https://realprofits.com" },
      { name: "Guides", url: "https://realprofits.com/guides" },
      { name: data.title, url: `https://realprofits.com/guides/${data.slug}` },
    ]),
  ];

  return (
    <div className="w-full bg-background" data-testid="freelancer-guide-page">
      <JsonLd data={schemas} />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <PseoBreadcrumb label={isSETax ? `SE Tax on ${v}` : `Tax Set-Aside ${v}`} />
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">{data.title}</h1>

        <DirectAnswer>
          {isSETax
            ? <>On {v} self-employment income, SE tax is {fmt(data.selfEmploymentTax)}, federal income tax is ~{fmt(data.estimatedFedTax)}, and state tax is ~{fmt(data.estimatedStateTax)}. Total tax liability: {fmt(data.totalTax)} ({effectiveRate}% effective rate). Take-home: {fmt(data.takeHome)}.</>
            : <>On {v} freelance income, set aside {data.recommendedSetAsidePercent}% ({fmt(Math.round(data.value * data.recommendedSetAsidePercent / 100))}). Pay quarterly estimated taxes of {fmt(data.quarterlyPayment)} (due April 15, June 15, Sept 15, Jan 15).</>
          }
        </DirectAnswer>

        <div className="prose prose-lg prose-headings:font-serif max-w-none">
          <h2>{isSETax ? "Complete Tax Breakdown" : "Setting Aside the Right Amount"}</h2>
          <p>{intro}</p>

          <div className="not-prose my-8 bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="text-left p-4 font-bold">Item</th><th className="text-right p-4 font-bold">Amount</th></tr></thead>
              <tbody className="divide-y">
                <tr><td className="p-4">Gross Freelance Income</td><td className="text-right p-4 font-semibold">{v}</td></tr>
                <tr><td className="p-4">Net Earnings (92.35%)</td><td className="text-right p-4">{fmt(data.netEarnings)}</td></tr>
                <tr><td className="p-4">Self-Employment Tax (15.3%)</td><td className="text-right p-4 text-red-600">-{fmt(data.selfEmploymentTax)}</td></tr>
                <tr><td className="p-4">SE Tax Deduction (half)</td><td className="text-right p-4 text-green-600">+{fmt(data.seDeduction)}</td></tr>
                <tr><td className="p-4">Federal Income Tax</td><td className="text-right p-4 text-red-600">-{fmt(data.estimatedFedTax)}</td></tr>
                <tr><td className="p-4">State Tax (est. 5%)</td><td className="text-right p-4 text-red-600">-{fmt(data.estimatedStateTax)}</td></tr>
                <tr className="font-bold"><td className="p-4">Total Tax Liability</td><td className="text-right p-4 text-red-700">{fmt(data.totalTax)}</td></tr>
                <tr className="bg-teal-50 font-bold"><td className="p-4">Estimated Take-Home</td><td className="text-right p-4 text-teal-700">{fmt(data.takeHome)}</td></tr>
                <tr className="bg-amber-50"><td className="p-4 font-bold">Quarterly Payment</td><td className="text-right p-4 font-bold text-amber-700">{fmt(data.quarterlyPayment)}</td></tr>
              </tbody>
            </table>
          </div>

          <h2>{isSETax ? "Understanding Self-Employment Tax" : "Quarterly Estimated Tax Schedule"}</h2>
          <p>{explanation}</p>
          {!isSETax && (
            <>
              <p>Mark these dates:</p>
              <ul>
                <li><strong>Q1:</strong> April 15 — {fmt(data.quarterlyPayment)}</li>
                <li><strong>Q2:</strong> June 15 — {fmt(data.quarterlyPayment)}</li>
                <li><strong>Q3:</strong> September 15 — {fmt(data.quarterlyPayment)}</li>
                <li><strong>Q4:</strong> January 15 (next year) — {fmt(data.quarterlyPayment)}</li>
              </ul>
            </>
          )}
          <CalculatorInlineCard slug="self-employment-tax-calculator" />

          <FAQSection faqs={faqs} />
        </div>

        <CompareWithOthers current={data.slug} allItems={freelancerEntries.filter(e => e.variant === data.variant)} type="Income Levels" labelFn={item => isSETax ? `SE Tax on ${fmt(item.value)}` : `Tax Set-Aside on ${fmt(item.value)}`} />
        <YouMightAlsoNeed currentCategory="income-freelance" />
      </div>
    </div>
  );
}

// ─── LOCATION SALARY ────────────────────────────────────────

function LocationSalaryGuidePage({ data }: { data: LocationSalaryEntry }) {
  const v = fmt(data.value);
  const noStateTax = data.stateTaxRate === 0;
  const colDiff = data.costOfLivingIndex - 100;
  const colLabel = colDiff > 0 ? `${colDiff}% above` : colDiff < 0 ? `${Math.abs(colDiff)}% below` : "at";

  const ctx: LocationContext = {
    cityName: data.cityName,
    stateName: data.state,
    costOfLivingIndex: data.costOfLivingIndex,
    costTier: getCostTier(data.costOfLivingIndex),
    hasStateTax: !noStateTax,
    stateTaxRate: data.stateTaxRate,
    avgRent1br: data.avgRent1br,
    adjustedSalary: data.adjustedSalary,
    monthlyNet: data.monthlyNet,
  };

  const intro = generateLocationIntro(data.value, ctx);
  const explanation = generateLocationExplanation(data.value, ctx);
  const faqs = generateLocationFAQs(data.value, ctx);
  const comparison = generateCityComparison(data.value, ctx);

  const schemas = [
    buildHowToSchema({
      title: `How ${v} Compares in ${data.cityName}`,
      description: data.title,
      steps: [
        { name: "Adjust for cost of living", text: `${data.cityName}'s COL index is ${data.costOfLivingIndex} (${colLabel} average). ${v} has the purchasing power of ${fmt(data.adjustedSalary)} at national average costs.` },
        { name: "Calculate take-home", text: `After federal (${fmt(data.estimatedFedTax)}), state (${noStateTax ? "no state tax" : fmt(data.estimatedStateTax)}), and FICA (${fmt(data.estimatedFICA)}), monthly take-home is ${fmt(data.monthlyNet)}.` },
        { name: "Evaluate rent burden", text: `Average 1BR rent in ${data.cityName} is ${fmt(data.avgRent1br)}/mo, consuming ${data.rentBurden1br}% of take-home pay.` },
      ],
    }),
    buildFAQSchema(faqs),
    buildBreadcrumbSchema([
      { name: "Home", url: "https://realprofits.com" },
      { name: "Guides", url: "https://realprofits.com/guides" },
      { name: data.title, url: `https://realprofits.com/guides/${data.slug}` },
    ]),
  ];

  const sameSalaryOtherCities = deterministicShuffle(
    locationSalaryEntries.filter(e => e.value === data.value && e.citySlug !== data.citySlug),
    data.slug
  ).slice(0, 5);

  return (
    <div className="w-full bg-background" data-testid="location-salary-guide-page">
      <JsonLd data={schemas} />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <PseoBreadcrumb label={`${v} in ${data.cityName}`} />
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">{data.title}</h1>

        <DirectAnswer>
          In {data.cityName}, {data.state}, a {v} salary has the purchasing power of {fmt(data.adjustedSalary)} at national average costs (COL index: {data.costOfLivingIndex}). After taxes, monthly take-home is {fmt(data.monthlyNet)}.
          Average 1BR rent ({fmt(data.avgRent1br)}/mo) consumes {data.rentBurden1br}% of take-home pay.
          {noStateTax && ` ${data.state} has no state income tax, saving you ${fmt(Math.round(data.value * 0.05))}/year vs a 5% tax state.`}
        </DirectAnswer>

        <div className="prose prose-lg prose-headings:font-serif max-w-none">
          <h2>What {v} Buys You in {data.cityName}</h2>
          <p>{intro}</p>

          <div className="not-prose my-8 bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="text-left p-4 font-bold">Detail</th><th className="text-right p-4 font-bold">Amount</th></tr></thead>
              <tbody className="divide-y">
                <tr><td className="p-4">Gross Salary</td><td className="text-right p-4 font-semibold">{v}</td></tr>
                <tr><td className="p-4">Cost-of-Living Index</td><td className="text-right p-4">{data.costOfLivingIndex} ({colLabel} nat&apos;l avg)</td></tr>
                <tr><td className="p-4">Purchasing Power (adjusted)</td><td className="text-right p-4 font-bold" style={{color: data.adjustedSalary >= data.value ? "#059669" : "#dc2626"}}>{fmt(data.adjustedSalary)}</td></tr>
                <tr><td className="p-4">Federal Tax</td><td className="text-right p-4 text-red-600">-{fmt(data.estimatedFedTax)}</td></tr>
                <tr><td className="p-4">{data.state} State Tax{noStateTax ? " (none!)" : ` (${(data.stateTaxRate * 100).toFixed(1)}%)`}</td><td className="text-right p-4 text-red-600">{noStateTax ? <span className="text-emerald-600 font-semibold">$0</span> : `-${fmt(data.estimatedStateTax)}`}</td></tr>
                <tr><td className="p-4">FICA</td><td className="text-right p-4 text-red-600">-{fmt(data.estimatedFICA)}</td></tr>
                <tr className="bg-teal-50 font-bold"><td className="p-4">Monthly Take-Home</td><td className="text-right p-4 text-teal-700">{fmt(data.monthlyNet)}/mo</td></tr>
              </tbody>
            </table>
          </div>

          <h2>Rent Burden in {data.cityName}</h2>
          <p>Housing is typically the largest expense. In {data.cityName}:</p>

          <div className="not-prose my-8 bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="text-left p-4 font-bold">Housing Type</th><th className="text-right p-4 font-bold">Avg Rent</th><th className="text-right p-4 font-bold">% of Take-Home</th><th className="text-right p-4 font-bold">Status</th></tr></thead>
              <tbody className="divide-y">
                <tr><td className="p-4">1 Bedroom</td><td className="text-right p-4">{fmt(data.avgRent1br)}/mo</td><td className="text-right p-4 font-semibold">{data.rentBurden1br}%</td><td className="text-right p-4"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${data.rentBurden1br <= 30 ? "bg-emerald-100 text-emerald-700" : data.rentBurden1br <= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{data.rentBurden1br <= 30 ? "Healthy" : data.rentBurden1br <= 40 ? "Stretched" : "Burdened"}</span></td></tr>
                <tr><td className="p-4">2 Bedroom</td><td className="text-right p-4">{fmt(data.avgRent2br)}/mo</td><td className="text-right p-4 font-semibold">{data.rentBurden2br}%</td><td className="text-right p-4"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${data.rentBurden2br <= 30 ? "bg-emerald-100 text-emerald-700" : data.rentBurden2br <= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{data.rentBurden2br <= 30 ? "Healthy" : data.rentBurden2br <= 40 ? "Stretched" : "Burdened"}</span></td></tr>
                <tr className="bg-gray-50"><td className="p-4 text-muted-foreground" colSpan={4}>Recommended: Keep rent under 30% of take-home ({fmt(Math.round(data.monthlyNet * 0.3))}/mo)</td></tr>
              </tbody>
            </table>
          </div>

          <h2>{data.cityName} vs National Average</h2>
          <p>{comparison}</p>

          <h2>Living on {v} in {data.cityName}</h2>
          <p>{explanation}</p>
          <CalculatorInlineCard slug="cost-of-living-comparison" />

          <FAQSection faqs={faqs} />
        </div>

        {sameSalaryOtherCities.length > 0 && (
          <div className="bg-gray-50 border rounded-xl p-6 mt-10" data-testid="pseo-compare-section">
            <h3 className="font-serif text-lg font-bold mb-4">{v} in Other Cities</h3>
            <ul className="space-y-2">
              {sameSalaryOtherCities.map(item => (
                <li key={item.slug}>
                  <Link href={`/guides/${item.slug}`} className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    {v} Salary in {item.cityName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <YouMightAlsoNeed currentCategory="life-decisions" />
      </div>
    </div>
  );
}

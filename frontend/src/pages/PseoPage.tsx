import React from "react";
import { useParams, Link } from "wouter";
import { Seo, buildHowToSchema, buildFAQSchema, buildBreadcrumbSchema } from "@/components/Seo";
import { findBySlug, salaryEntries, taxEntries, savingsEntries, mortgageEntries, debtEntries, freelancerEntries, locationSalaryEntries } from "@/lib/pseo/datasets";
import type { SalaryEntry, TaxEntry, SavingsEntry, MortgageEntry, DebtEntry, FreelancerEntry, LocationSalaryEntry } from "@/lib/pseo/datasets";
import { generateIntro, generateExplanation, generateFAQs } from "@/lib/pseo/variationEngine";
import { ChevronRight, ArrowRight } from "lucide-react";
import { CalculatorInlineCard, YouMightAlsoNeed } from "@/components/linking/InternalLinks";

// ─── SHARED COMPONENTS ──────────────────────────────────────

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

function CompareWithOthers({ current, allItems, type, labelFn }: {
  current: string;
  allItems: { slug: string; value: number }[];
  type: string;
  labelFn: (item: { slug: string; value: number }) => string;
}) {
  const others = allItems
    .filter(i => i.slug !== current)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

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

// ─── MAIN ROUTER ────────────────────────────────────────────

export default function PseoPage() {
  const { slug } = useParams<{ slug: string }>();
  const entry = findBySlug(slug || "");

  if (!entry) {
    return (
      <div className="container mx-auto py-20 text-center" data-testid="pseo-not-found">
        <h1 className="text-2xl font-bold mb-4">Guide Not Found</h1>
        <p className="text-muted-foreground mb-6">The guide you're looking for doesn't exist.</p>
        <Link href="/guides" className="text-teal-600 hover:text-teal-800 font-medium">Browse all guides</Link>
      </div>
    );
  }

  switch (entry.type) {
    case "salary": return <SalaryGuidePage data={entry as SalaryEntry} />;
    case "tax": return <TaxGuidePage data={entry as TaxEntry} />;
    case "savings": return <SavingsGuidePage data={entry as SavingsEntry} />;
    case "mortgage": return <MortgageGuidePage data={entry as MortgageEntry} />;
    case "debt": return <DebtGuidePage data={entry as DebtEntry} />;
    case "freelancer": return <FreelancerGuidePage data={entry as FreelancerEntry} />;
    case "location-salary": return <LocationSalaryGuidePage data={entry as LocationSalaryEntry} />;
    default: return null;
  }
}

// ─── SALARY ─────────────────────────────────────────────────

function SalaryGuidePage({ data }: { data: SalaryEntry }) {
  const v = fmt(data.value);
  const intro = generateIntro("salary", data.value);
  const explanation = generateExplanation("salary", data.value);
  const faqs = generateFAQs("salary", data.value);

  const howTo = buildHowToSchema({
    title: `How to Evaluate a ${v} Salary`,
    description: data.title,
    steps: [
      { name: "Calculate monthly gross", text: `Divide ${v} by 12 to get monthly gross pay of ${fmt(data.monthlyGross)}.` },
      { name: "Estimate taxes", text: `In the ${data.taxBracket} federal bracket, estimate federal tax of ~${fmt(data.estimatedFedTax)} plus FICA of ~${fmt(data.estimatedFICA)}.` },
      { name: "Find your take-home", text: `After all taxes, estimated monthly take-home is approximately ${fmt(data.monthlyNet)}.` },
    ],
  });

  const faqSchema = buildFAQSchema(faqs);
  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", url: "https://realprofits.com" },
    { name: "Guides", url: "https://realprofits.com/guides" },
    { name: data.title, url: `https://realprofits.com/guides/${data.slug}` },
  ]);

  return (
    <div className="w-full bg-background" data-testid="salary-guide-page">
      <Seo title={data.title} description={`Find out if ${v} is a good salary. See monthly take-home pay, tax breakdown, and national comparison.`} keywords={`${v} salary, is ${v} good salary, ${v} a year, take home pay, salary breakdown`} path={`/guides/${data.slug}`} jsonLd={[howTo, faqSchema, breadcrumbs]} />

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

  const howTo = buildHowToSchema({
    title: `How to Calculate Tax on ${v} Income`,
    description: data.title,
    steps: [
      { name: "Apply standard deduction", text: `Subtract $${data.standardDeduction.toLocaleString()} from ${v} for taxable income of ${fmt(data.taxableIncome)}.` },
      { name: "Calculate federal tax", text: `Apply progressive brackets for estimated federal tax of ${fmt(data.estimatedFedTax)} (${data.effectiveRate}% effective rate).` },
      { name: "Add FICA and state", text: `Add FICA (${fmt(data.ficaTax)}) and state tax (${fmt(data.estimatedStateTax)}) for total tax of ${fmt(data.totalTax)}.` },
    ],
  });

  const faqSchema = buildFAQSchema(faqs);
  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", url: "https://realprofits.com" },
    { name: "Guides", url: "https://realprofits.com/guides" },
    { name: data.title, url: `https://realprofits.com/guides/${data.slug}` },
  ]);

  return (
    <div className="w-full bg-background" data-testid="tax-guide-page">
      <Seo title={data.title} description={`Detailed tax breakdown on ${v} income. See federal, state, FICA taxes, effective rate, and take-home pay.`} keywords={`tax on ${v}, ${v} income tax, federal tax ${v}, effective tax rate, take home pay`} path={`/guides/${data.slug}`} jsonLd={[howTo, faqSchema, breadcrumbs]} />

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

  const howTo = buildHowToSchema({
    title: `How to Save ${v} for a ${data.context}`,
    description: data.title,
    steps: [
      { name: "Set your timeline", text: `Decide when you need ${v}. In 6 months, save ${fmt(data.monthlyAt6mo)}/month. In 1 year, save ${fmt(data.monthlyAt1yr)}/month.` },
      { name: "Automate transfers", text: "Set up automatic transfers from checking to a dedicated savings account on each payday." },
      { name: "Track progress", text: `Monitor your balance monthly. At ${fmt(data.monthlyAt1yr)}/month, you reach ${v} in 12 months.` },
    ],
  });

  const faqSchema = buildFAQSchema(faqs);
  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", url: "https://realprofits.com" },
    { name: "Guides", url: "https://realprofits.com/guides" },
    { name: data.title, url: `https://realprofits.com/guides/${data.slug}` },
  ]);

  return (
    <div className="w-full bg-background" data-testid="savings-guide-page">
      <Seo title={data.title} description={`A practical guide to saving ${v}. See monthly plans for 6-month to 5-year timelines.`} keywords={`how to save ${v}, savings plan ${v}, monthly savings goal, ${data.context.toLowerCase()}`} path={`/guides/${data.slug}`} jsonLd={[howTo, faqSchema, breadcrumbs]} />

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

  const howTo = buildHowToSchema({
    title: `Understanding a ${v} Mortgage`,
    description: data.title,
    steps: [
      { name: "Determine monthly payment", text: `At ${data.rate}% over ${data.term} years, the monthly payment on ${v} is ${fmt(data.monthlyPayment)}.` },
      { name: "Calculate total interest", text: `Over the full term, you'll pay ${fmt(data.totalInterest)} in total interest.` },
      { name: "Evaluate total cost", text: `The total cost of the loan (principal + interest) is ${fmt(data.totalCost)}.` },
    ],
  });

  const faqSchema = buildFAQSchema(faqs);
  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", url: "https://realprofits.com" },
    { name: "Guides", url: "https://realprofits.com/guides" },
    { name: data.title, url: `https://realprofits.com/guides/${data.slug}` },
  ]);

  const interestRatio = Math.round((data.totalInterest / data.value) * 100);

  return (
    <div className="w-full bg-background" data-testid="mortgage-guide-page">
      <Seo title={data.title} description={`${v} mortgage at ${data.rate}% for ${data.term} years. Monthly payment: ${fmt(data.monthlyPayment)}. Total interest: ${fmt(data.totalInterest)}.`} keywords={`${v} mortgage, mortgage payment ${v}, ${data.rate} percent mortgage, ${data.term} year mortgage, mortgage calculator`} path={`/guides/${data.slug}`} jsonLd={[howTo, faqSchema, breadcrumbs]} />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <PseoBreadcrumb label={data.title} />
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">{data.title}</h1>

        <DirectAnswer>
          A {v} mortgage at {data.rate}% for {data.term} years has a monthly payment of {fmt(data.monthlyPayment)}. Over the full term, you'll pay {fmt(data.totalInterest)} in interest, bringing the total cost to {fmt(data.totalCost)}.
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
                <tr><td className="p-4">Monthly Payment (P&I)</td><td className="text-right p-4 font-bold text-teal-700">{fmt(data.monthlyPayment)}</td></tr>
                <tr><td className="p-4">Total Interest Paid</td><td className="text-right p-4 text-red-600">{fmt(data.totalInterest)}</td></tr>
                <tr className="bg-teal-50 font-bold"><td className="p-4">Total Cost of Loan</td><td className="text-right p-4 text-teal-700">{fmt(data.totalCost)}</td></tr>
              </tbody>
            </table>
          </div>

          <h2>What the Numbers Mean</h2>
          <p>On this {v} mortgage, total interest adds <strong>{interestRatio}%</strong> to the original loan amount. That means for every dollar borrowed, you pay an additional ${(interestRatio / 100).toFixed(2)} in interest over {data.term} years.</p>
          <p>{explanation}</p>
          <CalculatorInlineCard slug="mortgage-calculator" />

          <h2>Rate & Term Impact</h2>
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

  const howTo = buildHowToSchema({
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
  });

  const faqSchema = buildFAQSchema(faqs);
  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", url: "https://realprofits.com" },
    { name: "Guides", url: "https://realprofits.com/guides" },
    { name: data.title, url: `https://realprofits.com/guides/${data.slug}` },
  ]);

  const interestSaved = data.minimumTotalInterest - data.aggressiveTotalInterest;
  const monthsSaved = data.minimumPayoffMonths - data.aggressivePayoffMonths;

  return (
    <div className="w-full bg-background" data-testid="debt-guide-page">
      <Seo title={data.title} description={isPayoff ? `Pay off ${v} in debt: strategies, timelines, and interest costs at ${data.interestRate}% APR.` : `How much interest on ${v} credit card balance at ${data.interestRate}% APR. Minimum vs aggressive payoff comparison.`} keywords={`pay off ${v} debt, ${v} credit card, debt payoff strategy, ${data.interestRate} percent interest, debt calculator`} path={`/guides/${data.slug}`} jsonLd={[howTo, faqSchema, breadcrumbs]} />

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

  const howTo = buildHowToSchema({
    title: isSETax ? `Self-Employment Tax on ${v}` : `Tax Set-Aside on ${v} Freelance Income`,
    description: data.title,
    steps: [
      { name: "Calculate net earnings", text: `Multiply ${v} by 92.35% to get net earnings of ${fmt(data.netEarnings)} subject to SE tax.` },
      { name: "Determine SE tax", text: `At 15.3%, self-employment tax is ${fmt(data.selfEmploymentTax)}.` },
      { name: isSETax ? "Add income tax" : "Set aside quarterly", text: isSETax ? `Federal income tax adds ${fmt(data.estimatedFedTax)}, plus ${fmt(data.estimatedStateTax)} in state tax, for a total tax liability of ${fmt(data.totalTax)}.` : `Set aside ${data.recommendedSetAsidePercent}% of income (${fmt(Math.round(data.value * data.recommendedSetAsidePercent / 100))}), paying ${fmt(data.quarterlyPayment)} each quarter.` },
    ],
  });

  const faqSchema = buildFAQSchema(faqs);
  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", url: "https://realprofits.com" },
    { name: "Guides", url: "https://realprofits.com/guides" },
    { name: data.title, url: `https://realprofits.com/guides/${data.slug}` },
  ]);

  const effectiveRate = Math.round((data.totalTax / data.value) * 1000) / 10;

  return (
    <div className="w-full bg-background" data-testid="freelancer-guide-page">
      <Seo title={data.title} description={isSETax ? `Self-employment tax breakdown on ${v}. SE tax: ${fmt(data.selfEmploymentTax)}. Total tax: ${fmt(data.totalTax)}.` : `How much to set aside for taxes on ${v} freelance income. Recommended: ${data.recommendedSetAsidePercent}%.`} keywords={`self employment tax ${v}, freelance tax ${v}, ${v} freelance income, quarterly taxes, tax set aside`} path={`/guides/${data.slug}`} jsonLd={[howTo, faqSchema, breadcrumbs]} />

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
  const intro = generateIntro("location-salary", data.value);
  const explanation = generateExplanation("location-salary", data.value);
  const faqs = generateFAQs("location-salary", data.value);

  const colDiff = data.costOfLivingIndex - 100;
  const colLabel = colDiff > 0 ? `${colDiff}% above` : colDiff < 0 ? `${Math.abs(colDiff)}% below` : "at";
  const noStateTax = data.stateTaxRate === 0;

  const howTo = buildHowToSchema({
    title: `How ${v} Compares in ${data.cityName}`,
    description: data.title,
    steps: [
      { name: "Adjust for cost of living", text: `${data.cityName}'s COL index is ${data.costOfLivingIndex} (${colLabel} average). ${v} has the purchasing power of ${fmt(data.adjustedSalary)} at national average costs.` },
      { name: "Calculate take-home", text: `After federal (${fmt(data.estimatedFedTax)}), state (${noStateTax ? "no state tax" : fmt(data.estimatedStateTax)}), and FICA (${fmt(data.estimatedFICA)}), monthly take-home is ${fmt(data.monthlyNet)}.` },
      { name: "Evaluate rent burden", text: `Average 1BR rent in ${data.cityName} is ${fmt(data.avgRent1br)}/mo, consuming ${data.rentBurden1br}% of take-home pay.` },
    ],
  });

  const faqSchema = buildFAQSchema([
    { question: `Is ${v} a good salary in ${data.cityName}?`, answer: data.costOfLivingIndex > 130 ? `${v} is below average purchasing power in ${data.cityName} due to the high cost of living (${data.costOfLivingIndex} index). It has the equivalent purchasing power of ${fmt(data.adjustedSalary)} at national average costs.` : data.costOfLivingIndex > 100 ? `${v} provides moderate purchasing power in ${data.cityName}. The slightly above-average cost of living means your real purchasing power is equivalent to ${fmt(data.adjustedSalary)}.` : `${v} goes further in ${data.cityName} than in many other metros. With a below-average cost of living, your purchasing power is equivalent to ${fmt(data.adjustedSalary)} at national average costs.` },
    ...faqs,
  ]);

  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", url: "https://realprofits.com" },
    { name: "Guides", url: "https://realprofits.com/guides" },
    { name: data.title, url: `https://realprofits.com/guides/${data.slug}` },
  ]);

  // Find same salary in other cities for comparison
  const sameSalaryOtherCities = locationSalaryEntries
    .filter(e => e.value === data.value && e.citySlug !== data.citySlug)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  return (
    <div className="w-full bg-background" data-testid="location-salary-guide-page">
      <Seo title={data.title} description={`What is ${v} really worth in ${data.cityName}, ${data.state}? See cost-of-living adjusted salary, rent burden, state taxes, and comparison to other cities.`} keywords={`${v} salary ${data.cityName}, cost of living ${data.cityName}, ${v} in ${data.state}, rent on ${v} salary, salary comparison cities`} path={`/guides/${data.slug}`} jsonLd={[howTo, faqSchema, breadcrumbs]} />

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
                <tr><td className="p-4">Cost-of-Living Index</td><td className="text-right p-4">{data.costOfLivingIndex} ({colLabel} nat'l avg)</td></tr>
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

          <h2>Location Strategy</h2>
          <p>{explanation}</p>
          <CalculatorInlineCard slug="cost-of-living-comparison" />

          <FAQSection faqs={[
            { question: `Is ${v} a good salary in ${data.cityName}?`, answer: data.costOfLivingIndex > 130 ? `${v} is below average purchasing power in ${data.cityName} due to the high cost of living (${data.costOfLivingIndex} index). It has the equivalent purchasing power of ${fmt(data.adjustedSalary)} at national average costs.` : data.costOfLivingIndex > 100 ? `${v} provides moderate purchasing power in ${data.cityName}. The slightly above-average cost of living means your real purchasing power is equivalent to ${fmt(data.adjustedSalary)}.` : `${v} goes further in ${data.cityName} than in many other metros. With a below-average cost of living, your purchasing power is equivalent to ${fmt(data.adjustedSalary)} at national average costs.` },
            ...faqs,
          ]} />
        </div>

        {/* Compare same salary across cities */}
        {sameSalaryOtherCities.length > 0 && (
          <div className="bg-gray-50 border rounded-xl p-6 mt-10" data-testid="pseo-compare-section">
            <h3 className="font-serif text-lg font-bold mb-4">{v} in Other Cities</h3>
            <ul className="space-y-2">
              {sameSalaryOtherCities.map(item => (
                <li key={item.slug}>
                  <Link href={`/guides/${item.slug}`} className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    {v} Salary in {(item as LocationSalaryEntry).cityName}
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

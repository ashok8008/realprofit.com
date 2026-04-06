import React from "react";
import { useParams, Link } from "wouter";
import { Seo, buildHowToSchema, buildFAQSchema, buildBreadcrumbSchema } from "@/components/Seo";
import { salaryLevels, taxOnIncome } from "@/data/pseo/salary-levels";
import { savingsTargets } from "@/data/pseo/savings-targets";
import { ChevronRight, ArrowRight } from "lucide-react";
import { CalculatorInlineCard, YouMightAlsoNeed } from "@/components/linking/InternalLinks";

function CompareWithOthers({ current, allItems, type }: {
  current: string;
  allItems: { slug: string; amount: number }[];
  type: "salary" | "tax" | "savings";
}) {
  const others = allItems
    .filter(i => i.slug !== current)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  const prefix = type === "salary" ? "Is" : type === "tax" ? "Tax on" : "How to Save";
  const suffix = type === "salary" ? "a Good Salary?" : type === "tax" ? "Income" : "";

  return (
    <div className="bg-gray-50 border rounded-xl p-6 mt-10">
      <h3 className="font-serif text-lg font-bold mb-4">Compare With Other {type === "savings" ? "Goals" : "Brackets"}</h3>
      <ul className="space-y-2">
        {others.map(item => (
          <li key={item.slug}>
            <Link href={`/guides/${item.slug}`} className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              {prefix} ${item.amount.toLocaleString()} {suffix}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PseoPage() {
  const { slug } = useParams<{ slug: string }>();

  const salaryMatch = salaryLevels.find(s => s.slug === slug);
  const taxMatch = taxOnIncome.find(t => t.slug === slug);
  const savingsMatch = savingsTargets.find(s => s.slug === slug);

  if (!salaryMatch && !taxMatch && !savingsMatch) {
    return <div className="container mx-auto py-20 text-center">Guide not found</div>;
  }

  if (taxMatch) return <TaxGuidePage data={taxMatch} />;
  if (salaryMatch) return <SalaryGuidePage data={salaryMatch} />;
  return <SavingsGuidePage data={savingsMatch!} />;
}

function SalaryGuidePage({ data }: { data: typeof salaryLevels[0] }) {
  const amountStr = `$${data.amount.toLocaleString()}`;
  const title = `Is ${amountStr} a Good Salary? A Reality Check`;
  const description = `Find out if ${amountStr} is a good salary in the U.S. See monthly take-home pay, tax breakdown, and how it compares to the national average.`;
  const keywords = `${amountStr} salary, is ${amountStr} a good salary, ${amountStr} a year, ${amountStr} income, salary breakdown, how much is ${amountStr} after taxes, take home pay, personal finance`;

  const howTo = buildHowToSchema({
    title: `How to Evaluate a ${amountStr} Salary`,
    description,
    steps: [
      { name: "Calculate monthly gross", text: `Divide ${amountStr} by 12 to get your monthly gross pay of $${data.monthlyGross.toLocaleString()}.` },
      { name: "Estimate taxes", text: `In the ${data.taxBracket} federal tax bracket, estimate federal tax of ~$${data.estimatedFedTax.toLocaleString()} plus FICA of ~$${data.estimatedFICA.toLocaleString()}.` },
      { name: "Find your take-home", text: `After all taxes, your estimated monthly take-home is approximately $${data.monthlyNet.toLocaleString()}.` },
    ],
  });

  const faqs = buildFAQSchema([
    { question: `Is ${amountStr} a year a good salary?`, answer: `At ${amountStr}, the salary is considered ${data.context.toLowerCase()} for the U.S. The median individual income is around $42,000, so ${amountStr} ${data.amount >= 42000 ? "is above" : "is below"} the national average.` },
    { question: `How much is ${amountStr} a year per month?`, answer: `${amountStr} per year is approximately $${data.monthlyGross.toLocaleString()} per month before taxes.` },
    { question: `What is the take-home pay on ${amountStr}?`, answer: `After federal, state, and FICA taxes, estimated monthly take-home is approximately $${data.monthlyNet.toLocaleString()}.` },
  ]);

  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", url: "https://realprofits.com" },
    { name: "Guides", url: "https://realprofits.com/guides" },
    { name: title, url: `https://realprofits.com/guides/${data.slug}` },
  ]);

  return (
    <div className="w-full bg-background">
      <Seo title={title} description={description} keywords={keywords} path={`/guides/${data.slug}`} jsonLd={[howTo, faqs, breadcrumbs]} />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">Guides</span>
        </nav>

        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">{title}</h1>

        <div id="ai-summary" className="bg-teal-50 border border-teal-200 rounded-xl p-5 mb-10">
          <p className="text-sm font-semibold text-teal-800 mb-1">Direct Answer</p>
          <p className="text-gray-800">
            A {amountStr} salary is considered {data.context.toLowerCase()} in the United States. After estimated federal taxes (~${data.estimatedFedTax.toLocaleString()}), state taxes (~${data.estimatedStateTax.toLocaleString()}), and FICA (~${data.estimatedFICA.toLocaleString()}), monthly take-home pay is approximately ${data.monthlyNet.toLocaleString()}.
          </p>
        </div>

        <div className="prose prose-lg prose-headings:font-serif max-w-none">
          <h2>The Monthly Reality of {amountStr}</h2>
          <p>Earning {amountStr} per year translates to <strong>${data.monthlyGross.toLocaleString()}</strong> per month before any deductions. After federal income tax, state income tax (estimated at 5%), and FICA (Social Security + Medicare), the estimated monthly take-home drops to approximately <strong>${data.monthlyNet.toLocaleString()}</strong>.</p>

          <div className="not-prose my-8 bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-bold">Category</th>
                  <th className="text-right p-4 font-bold">Annual</th>
                  <th className="text-right p-4 font-bold">Monthly</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="p-4">Gross Income</td><td className="text-right p-4 font-semibold">${data.amount.toLocaleString()}</td><td className="text-right p-4">${data.monthlyGross.toLocaleString()}</td></tr>
                <tr><td className="p-4">Federal Tax ({data.taxBracket} bracket)</td><td className="text-right p-4 text-red-600">-${data.estimatedFedTax.toLocaleString()}</td><td className="text-right p-4">-${Math.round(data.estimatedFedTax/12).toLocaleString()}</td></tr>
                <tr><td className="p-4">State Tax (est. 5%)</td><td className="text-right p-4 text-red-600">-${data.estimatedStateTax.toLocaleString()}</td><td className="text-right p-4">-${Math.round(data.estimatedStateTax/12).toLocaleString()}</td></tr>
                <tr><td className="p-4">FICA (7.65%)</td><td className="text-right p-4 text-red-600">-${data.estimatedFICA.toLocaleString()}</td><td className="text-right p-4">-${Math.round(data.estimatedFICA/12).toLocaleString()}</td></tr>
                <tr className="bg-teal-50 font-bold"><td className="p-4">Estimated Take-Home</td><td className="text-right p-4 text-teal-700">${(data.amount - data.estimatedFedTax - data.estimatedStateTax - data.estimatedFICA).toLocaleString()}</td><td className="text-right p-4 text-teal-700">${data.monthlyNet.toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>

          <h2>How {amountStr} Compares</h2>
          <p>The median individual income in the United States is approximately $42,000 per year. At {amountStr}, {data.amount >= 42000 ? `the salary is ${Math.round((data.amount / 42000 - 1) * 100)}% above the median, placing it in the "${data.context}" range for American earners` : "the salary falls below the national median, which may require careful budgeting to manage expenses comfortably"}.</p>

          <p>You can estimate this using a simple calculator to see how different salary levels impact take-home pay and lifestyle affordability.</p>

          <CalculatorInlineCard slug="salary-reality-calculator" />

          <h2>What Can You Afford on {amountStr}?</h2>
          <p>Using the common 50/30/20 budgeting rule applied to monthly take-home of ${data.monthlyNet.toLocaleString()}:</p>
          <ul>
            <li><strong>Needs (50%):</strong> ${Math.round(data.monthlyNet * 0.5).toLocaleString()}/month for housing, utilities, food, insurance</li>
            <li><strong>Wants (30%):</strong> ${Math.round(data.monthlyNet * 0.3).toLocaleString()}/month for dining, entertainment, travel</li>
            <li><strong>Savings (20%):</strong> ${Math.round(data.monthlyNet * 0.2).toLocaleString()}/month for emergency fund, retirement, investments</li>
          </ul>

          <h2>Frequently Asked Questions</h2>
          <p><strong>Is {amountStr} a year a good salary?</strong></p>
          <p>At {amountStr}, it is considered {data.context.toLowerCase()}. The median individual income is approximately $42,000, so {amountStr} {data.amount >= 42000 ? "exceeds" : "falls below"} the national average.</p>
          <p><strong>How much is {amountStr} per hour?</strong></p>
          <p>Assuming a standard 2,080 work hours per year, {amountStr} equals approximately ${(data.amount / 2080).toFixed(2)} per hour before taxes.</p>
          <p><strong>How much tax do I pay on {amountStr}?</strong></p>
          <p>In the {data.taxBracket} federal bracket, estimated total annual tax (federal + state + FICA) is approximately ${(data.estimatedFedTax + data.estimatedStateTax + data.estimatedFICA).toLocaleString()}.</p>

          <h2>Why This Matters</h2>
          <p>Understanding the real-world impact of a salary goes beyond the headline number. Taxes, cost of living, and lifestyle choices all determine whether {amountStr} feels comfortable or tight. The key is knowing the take-home number and budgeting accordingly.</p>
        </div>

        <CompareWithOthers current={data.slug} allItems={salaryLevels} type="salary" />

        <YouMightAlsoNeed currentCategory="income-freelance" />
      </div>
    </div>
  );
}

function TaxGuidePage({ data }: { data: typeof taxOnIncome[0] }) {
  const amountStr = `$${data.amount.toLocaleString()}`;
  const title = `How Much Tax Do You Pay on ${amountStr} Income?`;
  const description = `Detailed tax breakdown on ${amountStr} income. See federal, state, FICA taxes, effective rate, and take-home pay.`;
  const keywords = `tax on ${amountStr}, ${amountStr} income tax, how much tax on ${amountStr}, federal tax ${amountStr}, effective tax rate, take home pay after taxes, tax calculator, tax breakdown`;

  const howTo = buildHowToSchema({
    title: `How to Calculate Tax on ${amountStr} Income`,
    description,
    steps: [
      { name: "Apply standard deduction", text: `Subtract the standard deduction of $${data.standardDeduction.toLocaleString()} from ${amountStr} to get taxable income of $${data.taxableIncome.toLocaleString()}.` },
      { name: "Calculate federal tax", text: `Apply progressive tax brackets to get estimated federal tax of $${data.estimatedFedTax.toLocaleString()} (effective rate: ${data.effectiveRate}%).` },
      { name: "Add FICA and state", text: `Add FICA taxes ($${data.ficaTax.toLocaleString()}) and estimated state tax ($${data.estimatedStateTax.toLocaleString()}) for total tax of $${data.totalTax.toLocaleString()}.` },
    ],
  });

  const faqs = buildFAQSchema([
    { question: `How much tax do I pay on ${amountStr}?`, answer: `On ${amountStr} income (single filer), estimated total tax is $${data.totalTax.toLocaleString()}, leaving take-home pay of $${data.takeHome.toLocaleString()}.` },
    { question: `What is the effective tax rate on ${amountStr}?`, answer: `The effective federal tax rate on ${amountStr} is approximately ${data.effectiveRate}%.` },
    { question: `How much is ${amountStr} after taxes per month?`, answer: `After all taxes, estimated monthly take-home is approximately $${Math.round(data.takeHome / 12).toLocaleString()}.` },
  ]);

  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", url: "https://realprofits.com" },
    { name: "Guides", url: "https://realprofits.com/guides" },
    { name: title, url: `https://realprofits.com/guides/${data.slug}` },
  ]);

  return (
    <div className="w-full bg-background">
      <Seo title={title} description={description} keywords={keywords} path={`/guides/${data.slug}`} jsonLd={[howTo, faqs, breadcrumbs]} />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">Guides</span>
        </nav>

        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">{title}</h1>

        <div id="ai-summary" className="bg-teal-50 border border-teal-200 rounded-xl p-5 mb-10">
          <p className="text-sm font-semibold text-teal-800 mb-1">Direct Answer</p>
          <p className="text-gray-800">
            On {amountStr} gross income (single filer), estimated federal tax is ${data.estimatedFedTax.toLocaleString()} ({data.effectiveRate}% effective rate), FICA is ${data.ficaTax.toLocaleString()}, and state tax is approximately ${data.estimatedStateTax.toLocaleString()}. Total estimated tax: ${data.totalTax.toLocaleString()}. Take-home: ${data.takeHome.toLocaleString()}/year or ~${Math.round(data.takeHome / 12).toLocaleString()}/month.
          </p>
        </div>

        <div className="prose prose-lg prose-headings:font-serif max-w-none">
          <h2>Complete Tax Breakdown for {amountStr}</h2>

          <div className="not-prose my-8 bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-bold">Item</th>
                  <th className="text-right p-4 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="p-4">Gross Income</td><td className="text-right p-4 font-semibold">{amountStr}</td></tr>
                <tr><td className="p-4">Standard Deduction</td><td className="text-right p-4">-${data.standardDeduction.toLocaleString()}</td></tr>
                <tr><td className="p-4">Taxable Income</td><td className="text-right p-4 font-semibold">${data.taxableIncome.toLocaleString()}</td></tr>
                <tr><td className="p-4">Federal Income Tax</td><td className="text-right p-4 text-red-600">-${data.estimatedFedTax.toLocaleString()}</td></tr>
                <tr><td className="p-4">FICA (Social Security + Medicare)</td><td className="text-right p-4 text-red-600">-${data.ficaTax.toLocaleString()}</td></tr>
                <tr><td className="p-4">State Tax (est. 5%)</td><td className="text-right p-4 text-red-600">-${data.estimatedStateTax.toLocaleString()}</td></tr>
                <tr className="font-bold"><td className="p-4">Total Estimated Tax</td><td className="text-right p-4 text-red-700">${data.totalTax.toLocaleString()}</td></tr>
                <tr className="bg-teal-50 font-bold"><td className="p-4">Estimated Take-Home Pay</td><td className="text-right p-4 text-teal-700">${data.takeHome.toLocaleString()}/year</td></tr>
                <tr className="bg-teal-50"><td className="p-4">Monthly Take-Home</td><td className="text-right p-4 font-semibold text-teal-700">${Math.round(data.takeHome / 12).toLocaleString()}/month</td></tr>
              </tbody>
            </table>
          </div>

          <p>The effective federal tax rate on {amountStr} is <strong>{data.effectiveRate}%</strong>. This is lower than the marginal rate because the U.S. uses a progressive tax system where only income within each bracket is taxed at that rate.</p>

          <p>You can estimate this using a simple calculator to see how different income levels affect total taxes.</p>

          <CalculatorInlineCard slug="simple-tax-estimator" />

          <h2>How Progressive Tax Brackets Work</h2>
          <p>The first $11,600 of taxable income is taxed at 10%. The next portion up to $47,150 is taxed at 12%. Each additional bracket layer only applies to the income within that range, not the entire amount. This is why the effective rate ({data.effectiveRate}%) is always lower than the marginal bracket rate.</p>

          <h2>Frequently Asked Questions</h2>
          <p><strong>How much is {amountStr} after taxes?</strong></p>
          <p>After all estimated taxes, take-home pay is approximately ${data.takeHome.toLocaleString()} per year, or ${Math.round(data.takeHome / 12).toLocaleString()} per month.</p>
          <p><strong>What tax bracket is {amountStr} in?</strong></p>
          <p>With a taxable income of ${data.taxableIncome.toLocaleString()} (after standard deduction), the marginal tax bracket is determined by which bracket range the taxable income falls into.</p>
          <p><strong>Does state tax vary?</strong></p>
          <p>Yes. This estimate uses 5% as an average. Some states like Texas, Florida, and Washington have no state income tax, while others like California can exceed 10%.</p>
        </div>

        <CompareWithOthers current={data.slug} allItems={taxOnIncome} type="tax" />

        <YouMightAlsoNeed currentCategory="taxes" />
      </div>
    </div>
  );
}

function SavingsGuidePage({ data }: { data: typeof savingsTargets[0] }) {
  const amountStr = `$${data.amount.toLocaleString()}`;
  const title = `How to Save ${amountStr} (${data.context})`;
  const description = `A practical guide to saving ${amountStr} for a ${data.context.toLowerCase()}. See monthly savings plans for 6-month to 5-year timelines.`;
  const keywords = `how to save ${amountStr}, save ${amountStr} fast, savings plan ${amountStr}, monthly savings goal, ${data.context.toLowerCase()}, savings tips, money saving guide, personal finance`;

  const howTo = buildHowToSchema({
    title: `How to Save ${amountStr} for a ${data.context}`,
    description,
    steps: [
      { name: "Set your timeline", text: `Decide when you need ${amountStr}. In 6 months, save $${data.monthlyAt6mo.toLocaleString()}/month. In 1 year, save $${data.monthlyAt1yr.toLocaleString()}/month.` },
      { name: "Automate transfers", text: "Set up automatic transfers from checking to a dedicated savings account on each payday." },
      { name: "Track progress", text: `Monitor your balance monthly. At $${data.monthlyAt1yr.toLocaleString()}/month, you reach ${amountStr} in 12 months.` },
    ],
  });

  const faqs = buildFAQSchema([
    { question: `How long does it take to save ${amountStr}?`, answer: `At $${data.monthlyAt1yr.toLocaleString()}/month it takes 1 year. At $${data.monthlyAt2yr.toLocaleString()}/month it takes 2 years. At $${data.monthlyAt5yr.toLocaleString()}/month it takes 5 years.` },
    { question: `How much do I need to save monthly to reach ${amountStr}?`, answer: `It depends on your timeline: $${data.monthlyAt6mo.toLocaleString()}/month for 6 months, $${data.monthlyAt1yr.toLocaleString()}/month for 1 year, or $${data.monthlyAt5yr.toLocaleString()}/month for 5 years.` },
    { question: `Where should I keep my ${amountStr} savings?`, answer: `A high-yield savings account is recommended for goals under 5 years. For longer-term goals, consider a mix of savings and low-risk investments.` },
  ]);

  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", url: "https://realprofits.com" },
    { name: "Guides", url: "https://realprofits.com/guides" },
    { name: title, url: `https://realprofits.com/guides/${data.slug}` },
  ]);

  return (
    <div className="w-full bg-background">
      <Seo title={title} description={description} keywords={keywords} path={`/guides/${data.slug}`} jsonLd={[howTo, faqs, breadcrumbs]} />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">Guides</span>
        </nav>

        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">{title}</h1>

        <div id="ai-summary" className="bg-teal-50 border border-teal-200 rounded-xl p-5 mb-10">
          <p className="text-sm font-semibold text-teal-800 mb-1">Direct Answer</p>
          <p className="text-gray-800">
            To save {amountStr} for a {data.context.toLowerCase()}, set aside ${data.monthlyAt1yr.toLocaleString()} per month for 1 year, or ${data.monthlyAt2yr.toLocaleString()} per month over 2 years. Automate your transfers and use a high-yield savings account to earn interest along the way.
          </p>
        </div>

        <div className="prose prose-lg prose-headings:font-serif max-w-none">
          <h2>Monthly Savings Plan for {amountStr}</h2>

          <div className="not-prose my-8 bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-bold">Timeline</th>
                  <th className="text-right p-4 font-bold">Monthly Savings</th>
                  <th className="text-right p-4 font-bold">Weekly Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="p-4">6 Months</td><td className="text-right p-4 font-semibold">${data.monthlyAt6mo.toLocaleString()}</td><td className="text-right p-4">${Math.ceil(data.monthlyAt6mo / 4.33).toLocaleString()}</td></tr>
                <tr><td className="p-4">1 Year</td><td className="text-right p-4 font-semibold">${data.monthlyAt1yr.toLocaleString()}</td><td className="text-right p-4">${Math.ceil(data.monthlyAt1yr / 4.33).toLocaleString()}</td></tr>
                <tr><td className="p-4">2 Years</td><td className="text-right p-4 font-semibold">${data.monthlyAt2yr.toLocaleString()}</td><td className="text-right p-4">${Math.ceil(data.monthlyAt2yr / 4.33).toLocaleString()}</td></tr>
                <tr className="bg-teal-50"><td className="p-4 font-bold">5 Years</td><td className="text-right p-4 font-bold text-teal-700">${data.monthlyAt5yr.toLocaleString()}</td><td className="text-right p-4 font-bold text-teal-700">${Math.ceil(data.monthlyAt5yr / 4.33).toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>

          <h2>Step-by-Step Approach</h2>
          <p><strong>1. Set your timeline.</strong> Decide when you need {amountStr}. A shorter deadline means larger monthly contributions, while a longer timeline makes it more manageable.</p>
          <p><strong>2. Open a dedicated account.</strong> Keep your {data.context.toLowerCase()} savings separate from everyday spending. A high-yield savings account earns interest while keeping the money accessible.</p>
          <p><strong>3. Automate your savings.</strong> Set up recurring automatic transfers on each payday. This removes the temptation to skip a month.</p>

          <p>You can estimate this using a simple calculator to project exactly when you will reach {amountStr} based on your monthly contribution.</p>

          <CalculatorInlineCard slug="savings-goal-calculator" />

          <h2>What If You Can Only Save a Little?</h2>
          <p>Even if ${data.monthlyAt1yr.toLocaleString()}/month feels out of reach, starting with ${data.monthlyAt5yr.toLocaleString()}/month over 5 years gets to the same goal. The most important step is starting, even if the amount is small.</p>

          <h2>Frequently Asked Questions</h2>
          <p><strong>How long does it take to save {amountStr}?</strong></p>
          <p>At ${data.monthlyAt1yr.toLocaleString()}/month, it takes approximately 1 year. At ${data.monthlyAt5yr.toLocaleString()}/month, it takes about 5 years.</p>
          <p><strong>Where should I keep my savings?</strong></p>
          <p>A high-yield savings account is ideal for goals under 5 years. For longer timelines, consider a mix of savings and conservative investments.</p>
          <p><strong>Should I invest instead of save?</strong></p>
          <p>For goals needed within 1-3 years, savings accounts are safer. For 5+ year goals, investing may help the money grow faster but carries more risk.</p>
        </div>

        <CompareWithOthers current={data.slug} allItems={savingsTargets} type="savings" />

        <YouMightAlsoNeed currentCategory="saving-vs-investing" />
      </div>
    </div>
  );
}

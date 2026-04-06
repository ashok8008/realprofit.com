export type PseoType = "salary" | "tax" | "savings" | "mortgage" | "debt" | "freelancer" | "location-salary";
export type ValueBucket = "low" | "mid" | "high";

const thresholds: Record<PseoType, [number, number]> = {
  salary: [40000, 100000],
  tax: [40000, 100000],
  savings: [5000, 50000],
  mortgage: [200000, 500000],
  debt: [5000, 25000],
  freelancer: [50000, 150000],
  "location-salary": [40000, 100000],
};

export function getValueBucket(type: PseoType, value: number): ValueBucket {
  const [lo, hi] = thresholds[type];
  if (value < lo) return "low";
  if (value < hi) return "mid";
  return "high";
}

function pick<T>(variants: T[], value: number): T {
  return variants[Math.floor(value / 1000) % variants.length];
}

const fmt = (n: number) => `$${n.toLocaleString()}`;

// ─── INTRO VARIATIONS ──────────────────────────────────────
const intros: Record<PseoType, Record<ValueBucket, string[]>> = {
  salary: {
    low: [
      "At lower income levels, every dollar counts. Understanding your actual take-home pay after taxes and deductions is the first step toward building a budget that works.",
      "Earning below the national median means financial discipline is essential. Knowing exactly what lands in your bank account helps you plan for essentials and start saving.",
      "When income is modest, clarity about your net pay empowers smarter decisions about housing, transportation, and building an emergency fund.",
    ],
    mid: [
      "At moderate income levels, the gap between your gross salary and what you actually bring home can be surprising. Understanding this gap is key to effective financial planning.",
      "Middle-income earners have real opportunities to build wealth, but only if they understand where their money goes. Taxes, deductions, and smart budgeting all play a role.",
      "Earning around the national median means you have both challenges and opportunities. A clear picture of your income breakdown reveals exactly where to optimize.",
    ],
    high: [
      "At higher income levels, progressive taxation means a growing share of each additional dollar goes to federal and state taxes. Strategic planning becomes essential for wealth preservation.",
      "High earners face unique financial dynamics — higher tax brackets, phase-out limits on deductions, and greater complexity in planning. Understanding your true net position is critical.",
      "When income enters the upper brackets, the conversation shifts from earning to optimizing. Tax-advantaged accounts, investment strategy, and careful planning drive long-term outcomes.",
    ],
  },
  tax: {
    low: [
      "For lower incomes, the standard deduction often shields a significant portion of earnings from federal tax, resulting in a relatively modest effective rate.",
      "At this income level, understanding how the standard deduction works in your favor can prevent over-withholding and help you keep more of each paycheck.",
      "Lower earners benefit most from the progressive tax system's bottom brackets. Knowing your actual tax liability prevents unnecessary anxiety and helps with planning.",
    ],
    mid: [
      "At mid-range incomes, you begin entering higher marginal brackets where tax-planning strategies start to have real financial impact.",
      "Middle incomes face a balancing act: brackets rise, but strategic use of deductions and credits can meaningfully reduce your overall liability.",
      "Understanding your tax breakdown at this income level reveals opportunities — retirement contributions, HSAs, and other deductions that directly lower your bill.",
    ],
    high: [
      "Higher incomes face the full weight of progressive taxation. Each bracket layer adds complexity, making detailed tax planning not just helpful but essential.",
      "At this income level, the marginal rate tells only part of the story. Understanding effective rates, FICA caps, and available deductions reveals your true tax picture.",
      "Upper-bracket earners have the most to gain from proactive tax strategy. From maximizing retirement contributions to timing income and deductions, every decision matters.",
    ],
  },
  savings: {
    low: [
      "Small savings goals are the foundation of financial security. Even a modest buffer can prevent a single unexpected expense from becoming a financial crisis.",
      "Starting with a manageable savings target builds the habits and confidence you need for larger goals. Consistency matters more than the dollar amount.",
      "A small but dedicated savings fund changes your relationship with money. It shifts you from reactive to proactive, one automatic transfer at a time.",
    ],
    mid: [
      "Mid-sized savings goals require a clear plan with monthly milestones. Breaking the target into smaller chunks makes even ambitious amounts feel achievable.",
      "At this savings level, choosing the right account type matters. High-yield savings accounts and CDs can add meaningful interest over your accumulation period.",
      "Reaching a five-figure savings goal is a transformative milestone. It opens doors — a home down payment, career flexibility, or a true safety net.",
    ],
    high: [
      "Large savings targets require multi-year commitment and often a combination of saving and investing strategies to reach the goal efficiently.",
      "At this level, your savings strategy should account for inflation, opportunity cost, and tax-advantaged account options that maximize every dollar saved.",
      "Building a six-figure savings reserve is a marathon, not a sprint. The right vehicle — from HYSAs to brokerage accounts — depends on your timeline and goals.",
    ],
  },
  mortgage: {
    low: [
      "A smaller mortgage often means more manageable payments, but total interest costs can still add up significantly over 15 or 30 years.",
      "Even at lower home prices, understanding how interest rates and loan terms affect your total cost empowers better homebuying decisions.",
      "Starter-level mortgages offer an entry point into homeownership. Knowing your exact monthly obligation helps you budget confidently from day one.",
    ],
    mid: [
      "At mainstream home prices, your mortgage becomes one of the largest financial commitments of your life. Even fractional rate differences translate to thousands in savings.",
      "Mid-range mortgages demand careful comparison shopping. The difference between a 6% and 7% rate on this amount could fund a year of groceries.",
      "At this price point, the interplay between down payment size, interest rate, and loan term creates dramatically different long-term cost scenarios.",
    ],
    high: [
      "High-value mortgages amplify every financial variable. A single percentage point in rate difference can mean six-figure differences in total interest paid.",
      "At premium price levels, mortgage structuring becomes strategic: jumbo loan thresholds, rate buydowns, and term optimization all warrant serious analysis.",
      "Luxury-level mortgages require a sophisticated approach to financing. Understanding total cost across different scenarios is essential before committing.",
    ],
  },
  debt: {
    low: [
      "Small debt balances are the easiest to eliminate, but they can quietly grow if you rely on minimum payments. A focused payoff plan makes quick work of them.",
      "Even a modest debt balance costs real money in interest every month. Understanding the math behind payoff timelines motivates faster action.",
      "Low-balance debts are deceptive: the interest is small in absolute terms but large as a percentage. Aggressive payoff saves more than you might expect.",
    ],
    mid: [
      "At this debt level, the choice between snowball and avalanche strategies can save you hundreds or thousands in interest — and months of payments.",
      "Mid-range debt requires a structured plan. Random extra payments help, but a calculated strategy delivers significantly faster results.",
      "Carrying this level of debt means interest compounds into a meaningful cost. Understanding your exact payoff timeline turns an abstract worry into an actionable plan.",
    ],
    high: [
      "Significant debt demands a comprehensive strategy. At this level, consolidation, balance transfers, or negotiated rates can dramatically reduce total interest costs.",
      "High debt balances compound aggressively. Without a calculated payoff plan, interest alone can exceed your original charges over time.",
      "When debt reaches this level, every percentage point of interest and every extra dollar of payment creates a measurably different outcome. The math matters.",
    ],
  },
  freelancer: {
    low: [
      "Side hustle and part-time freelance income still triggers self-employment tax obligations that many earners don't anticipate until filing time.",
      "Even modest self-employment income creates tax liability beyond regular income tax. The 15.3% SE tax applies from the first dollar over $400.",
      "Part-time freelancers are often surprised by their tax bills. Understanding quarterly payment obligations prevents penalties and cash flow stress.",
    ],
    mid: [
      "Full-time self-employment at this income level means the combined self-employment and income tax rate requires disciplined quarterly planning.",
      "At this income level, the self-employment tax alone represents a significant annual expense. Structuring deductions and retirement contributions is critical.",
      "Mid-range freelance income puts you in a tax planning sweet spot: high enough that strategies matter, accessible enough that standard tools handle most needs.",
    ],
    high: [
      "At higher self-employment incomes, advanced tax structures — including potential S-corp election — can reduce the self-employment tax burden substantially.",
      "High-earning freelancers face combined effective rates that demand sophisticated planning. Maximizing deductions and choosing the right business structure saves thousands.",
      "At this income level, the difference between naive and optimized tax strategy can exceed five figures annually. Professional-grade planning pays for itself.",
    ],
  },
  "location-salary": {
    low: [
      "At lower income levels, your city's cost of living dramatically determines your actual quality of life. The same salary can feel tight in one city and comfortable in another.",
      "Where you live matters as much as what you earn when income is modest. Understanding local costs helps you decide whether relocating could significantly improve your finances.",
      "A below-median salary stretches much further in affordable metros. Comparing your purchasing power across cities reveals surprisingly large lifestyle differences.",
    ],
    mid: [
      "At middle-income levels, location choice becomes a strategic financial decision. The same salary buys vastly different lifestyles depending on local housing costs and tax rates.",
      "Your salary's real value depends on where you spend it. Cost-of-living differences between major cities can make a moderate income feel either comfortable or strained.",
      "Mid-range earners benefit most from location arbitrage — the practice of earning in one market and spending in another through remote work or strategic relocation.",
    ],
    high: [
      "At higher incomes, state tax policy becomes a major factor in net compensation. The difference between a no-income-tax state and a high-tax state can exceed tens of thousands annually.",
      "High earners in expensive cities often find their lifestyle surprisingly similar to middle earners in affordable areas. Understanding adjusted purchasing power prevents costly location lock-in.",
      "Location decisions at higher income levels involve complex trade-offs between career access, tax burden, cost of living, and quality of life. The numbers reveal what intuition misses.",
    ],
  },
};

export function generateIntro(type: PseoType, value: number): string {
  const bucket = getValueBucket(type, value);
  return pick(intros[type][bucket], value);
}

// ─── EXPLANATION TEXT VARIATIONS ─────────────────────────────
const explanations: Record<PseoType, Record<ValueBucket, string[]>> = {
  salary: {
    low: [
      "At this income range, housing should ideally stay below 30% of take-home pay. Many financial advisors recommend the 50/30/20 rule, but at lower incomes, the \"needs\" category often requires a larger share.",
      "Budgeting on a below-median salary means prioritizing essentials and finding creative ways to reduce fixed costs. Roommates, public transit, and meal planning can free up meaningful savings capacity.",
      "Building an emergency fund is especially important at lower income levels, where a single unexpected expense can derail monthly finances. Even $500 set aside provides a critical buffer.",
    ],
    mid: [
      "At this salary level, you have meaningful room to build wealth through consistent investing and strategic tax planning. Maxing out employer 401(k) matches is the highest-return financial move available.",
      "Middle-income earners often face lifestyle inflation as income grows. Maintaining the same spending level while income increases is one of the most powerful wealth-building strategies.",
      "This income range offers a balance between comfort and growth opportunity. With disciplined saving of 15-20% of gross income, significant wealth accumulation is achievable over a 20-30 year horizon.",
    ],
    high: [
      "At this income level, maxing out all tax-advantaged accounts — 401(k), IRA, HSA — should be a baseline strategy. The tax savings compound significantly over time.",
      "Higher earners benefit from diversifying across account types: pre-tax, Roth, and taxable. This creates flexibility in retirement to manage tax brackets year by year.",
      "Beyond tax-advantaged accounts, high earners should consider tax-efficient investment placement, charitable giving strategies, and estate planning to preserve wealth across generations.",
    ],
  },
  tax: {
    low: [
      "At this income level, the Earned Income Tax Credit (EITC) may further reduce your tax burden. Check eligibility — many qualifying taxpayers miss this significant credit.",
      "Lower-income filers often benefit from free tax preparation services. IRS Free File and VITA programs help ensure you claim every deduction and credit available.",
      "Understanding your W-4 withholding at this income level prevents both underwithholding (surprise tax bills) and overwithholding (giving the government an interest-free loan).",
    ],
    mid: [
      "At middle income levels, the decision between standard and itemized deductions becomes worth evaluating each year, especially if you have mortgage interest or significant charitable contributions.",
      "Contributing to tax-deferred retirement accounts like a 401(k) or traditional IRA directly reduces your taxable income. At this bracket, each dollar contributed saves real tax money.",
      "Health Savings Accounts (HSAs) offer a triple tax advantage at this income level: tax-deductible contributions, tax-free growth, and tax-free withdrawals for medical expenses.",
    ],
    high: [
      "High-income taxpayers should evaluate Roth conversion strategies, especially in years with temporarily lower income. Converting traditional IRA funds to Roth locks in a lower tax rate.",
      "At this level, the Net Investment Income Tax (3.8%) applies to investment earnings above certain thresholds. Tax-loss harvesting and asset location strategies become valuable tools.",
      "Charitable giving strategies like donor-advised funds and qualified charitable distributions (QCDs) offer high earners both philanthropic impact and meaningful tax benefits.",
    ],
  },
  savings: {
    low: [
      "The hardest part of saving a small amount is starting. Automating even $25 per week builds the habit that eventually scales to larger goals.",
      "For smaller goals, no-fee high-yield savings accounts maximize every dollar. Even 4-5% APY on a growing balance adds meaningful progress over months.",
      "Consider the 'pay yourself first' approach: treat your savings contribution like a bill due on payday, not whatever happens to be left at month's end.",
    ],
    mid: [
      "At this goal size, consider splitting your savings between a high-yield savings account and short-term CDs to capture higher rates on portions you won't need immediately.",
      "Tracking your savings rate as a percentage of income — rather than just the dollar amount — provides a more meaningful measure of financial progress.",
      "Mid-sized savings goals often coincide with major life transitions. Building this buffer before the transition (not during) dramatically reduces financial stress.",
    ],
    high: [
      "For large savings goals with 3+ year timelines, a portion allocated to conservative index funds may outpace pure savings accounts after accounting for inflation.",
      "Consider tax implications of your savings vehicle. For goals like retirement, tax-advantaged accounts (IRA, 401k) can accelerate your progress by 20-30% through tax savings alone.",
      "At this level, dollar-cost averaging into a diversified portfolio while maintaining a cash reserve provides both growth potential and liquidity for your target date.",
    ],
  },
  mortgage: {
    low: [
      "For smaller mortgages, a 15-year term often adds only a modest amount to monthly payments while saving tens of thousands in total interest compared to a 30-year term.",
      "Consider the total cost of ownership beyond the mortgage: property taxes, insurance, maintenance (budget 1-2% of home value annually), and potential HOA fees.",
      "First-time buyer programs, FHA loans, and VA loans often offer lower down payment requirements and more favorable rates for qualifying borrowers at this price point.",
    ],
    mid: [
      "At mainstream price levels, the 20% down payment rule avoids PMI (Private Mortgage Insurance), which typically costs 0.5-1% of the loan annually until you reach 20% equity.",
      "Rate shopping across at least 3-4 lenders is essential at this loan size. A difference of just 0.25% in rate can save $10,000-$30,000 over the life of the loan.",
      "Consider mortgage points (prepaid interest) if you plan to stay in the home long-term. Each point typically costs 1% of the loan and reduces your rate by about 0.25%.",
    ],
    high: [
      "Jumbo loans (typically above $766,550 in most markets) carry different qualification requirements and often slightly higher rates. Understanding conforming loan limits affects your financing strategy.",
      "At higher loan amounts, an adjustable-rate mortgage (ARM) with a 7 or 10-year fixed period may offer meaningfully lower initial rates if you plan to refinance or sell within that window.",
      "For luxury properties, consider the opportunity cost of a large down payment. If investment returns exceed your mortgage rate, a larger loan and smaller down payment may build more wealth.",
    ],
  },
  debt: {
    low: [
      "The psychological win of paying off a small balance in full can create momentum for tackling larger debts. This is the core principle behind the debt snowball method.",
      "For balances under $5,000, a 0% APR balance transfer card (typically 12-21 months) can eliminate interest entirely while you pay down the principal.",
      "Consider using the 'debt sprint' approach: temporarily cut discretionary spending for 2-3 months and redirect everything to eliminate this balance quickly.",
    ],
    mid: [
      "At this balance level, compare the debt avalanche (highest rate first) vs. snowball (smallest balance first) approach. Avalanche saves more money; snowball provides faster psychological wins.",
      "Debt consolidation loans often offer 7-15% rates vs. credit card rates of 20%+. At this balance, the interest savings can reduce your payoff timeline by months or years.",
      "Creating a detailed payoff calendar with specific monthly targets turns an overwhelming balance into a series of achievable milestones.",
    ],
    high: [
      "For significant balances, negotiating directly with creditors for lower interest rates or settlement amounts can save thousands. Many creditors prefer reduced payment to the risk of default.",
      "Consider whether a home equity loan or line of credit (HELOC) could consolidate high-interest debt at a much lower rate. The tax deductibility of HELOC interest adds additional savings.",
      "A certified credit counselor can help negotiate a debt management plan (DMP) that reduces interest rates and consolidates payments into a single monthly amount.",
    ],
  },
  freelancer: {
    low: [
      "Even at lower self-employment income, you must file Schedule SE if net earnings exceed $400. Setting aside 25-30% of each payment covers both income tax and SE tax.",
      "Track every business expense meticulously. At lower income levels, deductions for home office, internet, equipment, and mileage can dramatically reduce your taxable self-employment income.",
      "Consider using a separate bank account for freelance income. Transfer your tax set-aside percentage immediately upon receiving payment to avoid spending money earmarked for taxes.",
    ],
    mid: [
      "At this income level, a SEP-IRA or Solo 401(k) can shelter a significant portion of income from both income tax and self-employment tax. Contributions are deductible business expenses.",
      "Quarterly estimated tax payments (due April 15, June 15, Sept 15, Jan 15) prevent underpayment penalties. Use Form 1040-ES to calculate each payment based on expected annual income.",
      "The qualified business income (QBI) deduction may reduce your taxable income by up to 20% of qualified business income, subject to phase-outs at higher income levels.",
    ],
    high: [
      "At this income level, forming an S-corporation can save thousands in self-employment tax by splitting income between a 'reasonable salary' (subject to FICA) and distributions (exempt from SE tax).",
      "Maximize retirement contributions: a Solo 401(k) allows up to $23,500 in employee contributions plus 25% of net self-employment earnings as employer contributions (total cap $70,000 in 2025).",
      "Consider hiring a CPA who specializes in self-employment taxation. At this income level, professional tax planning typically saves multiples of its cost through optimized strategies.",
    ],
  },
  "location-salary": {
    low: [
      "At this income level in this city, the 30% housing rule is critical. If rent consumes more than a third of take-home pay, explore neighborhoods further from the city center or consider shared housing.",
      "Transportation costs vary dramatically by city. In transit-friendly metros, ditching a car can save $500-800/month — a game-changer when every dollar matters.",
      "Look into city-specific assistance programs. Many high-cost cities offer rent stabilization, utility assistance, and food programs for residents below certain income thresholds.",
    ],
    mid: [
      "At moderate income levels, the rent-to-income ratio reveals whether a city is truly affordable for you. A healthy ratio is under 30%, but in expensive metros it often exceeds 40%.",
      "Remote work has created unprecedented location arbitrage opportunities. If your employer allows it, earning a mid-range salary while living in a low-cost city can feel like a substantial raise.",
      "State income tax differences are pure savings. Moving from a 7-9% state tax state to a no-income-tax state on this salary means thousands more in your pocket annually.",
    ],
    high: [
      "At this income level, state tax arbitrage alone can generate five-figure annual savings. High earners in states like California or New York pay dramatically more than peers in Texas or Florida.",
      "Higher earners in expensive cities should evaluate whether the career premium justifies the cost premium. If your industry allows remote work, the math often favors relocation.",
      "Consider the total compensation picture: some cities offer higher salaries but the cost-of-living adjustment more than offsets the nominal increase. Net purchasing power is what matters.",
    ],
  },
};

export function generateExplanation(type: PseoType, value: number): string {
  const bucket = getValueBucket(type, value);
  return pick(explanations[type][bucket], value);
}

// ─── FAQ VARIATIONS ─────────────────────────────────────────
export function generateFAQs(type: PseoType, value: number): { question: string; answer: string }[] {
  const bucket = getValueBucket(type, value);
  const v = fmt(value);

  if (type === "salary") {
    const base: { question: string; answer: string }[] = [
      { question: `Is ${v} a year a good salary?`, answer: bucket === "low" ? `${v} falls below the U.S. median individual income of ~$42,000. It requires careful budgeting but is livable in lower-cost areas.` : bucket === "mid" ? `${v} is ${value >= 42000 ? "above" : "near"} the U.S. median individual income. It provides a solid foundation for building financial stability.` : `${v} places you well above the national median and in the upper percentiles of U.S. earners. It provides significant financial flexibility.` },
      { question: `How much is ${v} per month after taxes?`, answer: `Divide ${v} by 12 for gross monthly, then subtract estimated federal, state, and FICA taxes to find your net monthly take-home pay.` },
    ];
    if (bucket === "low") {
      base.push({ question: `Can I live comfortably on ${v}?`, answer: `Comfort depends heavily on location. In rural or low-cost areas, ${v} can cover basics. In high-cost cities, it will be tight without shared housing or supplemental income.` });
      base.push({ question: `How do I budget effectively on ${v}?`, answer: `Focus on the essentials first: housing under 30% of take-home, minimize transportation costs, and automate even small savings ($25-50/week) to build a buffer.` });
    } else if (bucket === "mid") {
      base.push({ question: `How does ${v} compare nationally?`, answer: `${v} ${value >= 42000 ? `exceeds the median individual income by ${Math.round((value/42000-1)*100)}%` : "is near the median individual income"}. It places you in the ${value >= 60000 ? "upper-middle" : "middle"} range of U.S. earners.` });
      base.push({ question: `What can I afford on ${v}?`, answer: `Using the 50/30/20 rule on your net income, allocate 50% to needs, 30% to wants, and 20% to savings and debt repayment.` });
    } else {
      base.push({ question: `What tax strategies work for ${v} earners?`, answer: `Maximize tax-advantaged accounts (401k, IRA, HSA), consider tax-loss harvesting, and evaluate whether itemizing deductions exceeds the standard deduction.` });
      base.push({ question: `How can I build wealth on ${v}?`, answer: `After maximizing retirement accounts, invest consistently in diversified index funds. At ${v}, saving 20-30% of gross income accelerates wealth building significantly.` });
    }
    return base;
  }

  if (type === "tax") {
    const base: { question: string; answer: string }[] = [
      { question: `How much tax do I pay on ${v}?`, answer: `Total estimated tax on ${v} includes federal income tax, FICA (7.65%), and state tax. The exact amount depends on filing status, deductions, and state of residence.` },
      { question: `What is the effective tax rate on ${v}?`, answer: `The effective rate is your total federal tax divided by gross income. Due to progressive brackets, it's always lower than your marginal (top bracket) rate.` },
    ];
    if (bucket === "low") {
      base.push({ question: `Do I qualify for tax credits at ${v}?`, answer: `At this income, you may qualify for the Earned Income Tax Credit (EITC), Saver's Credit, and potentially the Child Tax Credit. These directly reduce your tax liability.` });
      base.push({ question: `Should I adjust my W-4 withholding?`, answer: `Review your withholding annually. At lower incomes, overwithholding is common — getting a large refund means you lent the government money interest-free all year.` });
    } else if (bucket === "mid") {
      base.push({ question: `Should I itemize or take the standard deduction?`, answer: `At ${v}, the standard deduction ($14,600 single / $29,200 married) is usually more beneficial unless you have significant mortgage interest, state taxes, or charitable contributions.` });
      base.push({ question: `How can I reduce my tax bill at ${v}?`, answer: `Contribute to pre-tax retirement accounts (401k, traditional IRA), use an HSA if eligible, and ensure you're claiming all available deductions and credits.` });
    } else {
      base.push({ question: `Am I subject to the Alternative Minimum Tax?`, answer: `At ${v}, check whether AMT applies. The AMT exemption phases out at higher incomes, potentially increasing your tax liability beyond regular income tax.` });
      base.push({ question: `What is the Net Investment Income Tax?`, answer: `The NIIT adds 3.8% tax on investment income (dividends, capital gains, rental income) for single filers above $200,000. At ${v}, this may affect your total tax picture.` });
    }
    return base;
  }

  if (type === "savings") {
    const base: { question: string; answer: string }[] = [
      { question: `How long does it take to save ${v}?`, answer: `The timeline depends on your monthly contribution. Divide ${v} by your planned monthly savings amount for an approximate number of months.` },
      { question: `Where should I keep my ${v} savings?`, answer: bucket === "low" ? `A high-yield savings account is ideal for smaller goals. Look for accounts with no minimum balance requirements and competitive APY.` : bucket === "mid" ? `Split between a high-yield savings account for near-term access and CDs for portions you won't need for 6-12+ months to capture higher rates.` : `Consider a mix of high-yield savings, CDs, Treasury bonds, and potentially conservative index funds depending on your timeline.` },
    ];
    if (bucket === "low") {
      base.push({ question: `What if I can only save a little each month?`, answer: `Start with whatever you can — even $20/week adds up to $1,040/year. The habit matters more than the amount. Increase contributions as your income grows.` });
      base.push({ question: `Should I save or pay off debt first?`, answer: `Build a small emergency buffer ($500-1,000) first, then focus on high-interest debt. Once debt is managed, redirect those payments toward your savings goal.` });
    } else if (bucket === "mid") {
      base.push({ question: `Should I save in a regular or high-yield account?`, answer: `A high-yield savings account is strongly recommended. The difference between 0.01% and 4-5% APY on ${v} translates to hundreds of dollars in free money over your savings timeline.` });
      base.push({ question: `How do I stay motivated while saving ${v}?`, answer: `Track progress visually (charts, apps), celebrate milestones (25%, 50%, 75%), and automate transfers so saving doesn't require willpower each month.` });
    } else {
      base.push({ question: `Should I invest instead of saving ${v}?`, answer: `For timelines under 3 years, prioritize savings. For 5+ years, investing in diversified index funds historically outperforms savings accounts by 4-7% annually.` });
      base.push({ question: `What are the tax implications of saving ${v}?`, answer: `Interest earned in savings accounts is taxable income. For large amounts, consider tax-advantaged options like IRAs, 529 plans (for education), or municipal bonds.` });
    }
    return base;
  }

  if (type === "mortgage") {
    const base: { question: string; answer: string }[] = [
      { question: `What is the monthly payment on a ${v} mortgage?`, answer: `Monthly payment depends on interest rate and term. At current rates (6-8%), a 30-year ${v} mortgage ranges from roughly ${fmt(Math.round(value*0.006))} to ${fmt(Math.round(value*0.0074))}/month for principal and interest.` },
      { question: `How much total interest will I pay on ${v}?`, answer: `Over a 30-year term, total interest often exceeds 50-100% of the original loan amount. Shorter terms and lower rates dramatically reduce total interest.` },
    ];
    if (bucket === "low") {
      base.push({ question: `Is a 15-year or 30-year term better for ${v}?`, answer: `For a ${v} mortgage, a 15-year term adds relatively little to monthly payments while potentially saving tens of thousands in interest.` });
      base.push({ question: `What down payment do I need for ${v}?`, answer: `Conventional loans require 3-20% down. FHA loans require 3.5%. On ${v}, that ranges from ${fmt(Math.round(value*0.035))} to ${fmt(Math.round(value*0.20))}.` });
    } else if (bucket === "mid") {
      base.push({ question: `How much income do I need for a ${v} mortgage?`, answer: `Using the 28% front-end ratio, you'd need roughly ${fmt(Math.round(value*0.0074/0.28*12))} annual income to qualify for a ${v} mortgage at 7%.` });
      base.push({ question: `Should I pay points to lower my rate?`, answer: `If you plan to stay in the home 5+ years, paying points (1% of loan = ~0.25% rate reduction) typically breaks even within 4-7 years and saves money long-term.` });
    } else {
      base.push({ question: `Will I need a jumbo loan for ${v}?`, answer: `In most markets, loans above $766,550 are considered jumbo. A ${v} mortgage ${value > 766550 ? "exceeds this threshold and will require jumbo loan qualification" : "falls within conforming loan limits"}.` });
      base.push({ question: `How does rate impact total cost on ${v}?`, answer: `On a ${v} 30-year mortgage, each 1% rate increase adds roughly ${fmt(Math.round(value*0.21))} in total interest over the life of the loan.` });
    }
    return base;
  }

  if (type === "debt") {
    const base: { question: string; answer: string }[] = [
      { question: `How long to pay off ${v} in debt?`, answer: `With minimum payments (2% of balance), payoff can take years and cost thousands in interest. Doubling or tripling minimum payments dramatically shortens the timeline.` },
      { question: `How much interest will I pay on ${v} of debt?`, answer: `At typical credit card rates (20-25%), minimum-only payments on ${v} can result in total interest charges exceeding the original balance.` },
    ];
    if (bucket === "low") {
      base.push({ question: `Can I pay off ${v} in 6 months?`, answer: `To pay off ${v} in 6 months, you'd need to pay roughly ${fmt(Math.ceil(value/6))}/month plus interest. For most people with this balance, a 6-12 month payoff is realistic.` });
      base.push({ question: `Should I use a balance transfer for ${v}?`, answer: `A 0% APR balance transfer card can save significant interest on ${v}. Factor in the transfer fee (typically 3-5%) and commit to full payoff before the promotional period ends.` });
    } else if (bucket === "mid") {
      base.push({ question: `Snowball or avalanche for ${v} in debt?`, answer: `The avalanche method (highest rate first) saves more money. The snowball method (smallest balance first) provides faster wins. Choose based on whether you need motivation or pure savings.` });
      base.push({ question: `Should I consolidate ${v} in debt?`, answer: `A debt consolidation loan at 7-12% vs credit card rates of 20%+ can save ${fmt(Math.round(value*0.10))}+ in interest. Ensure the total cost (with fees) is actually lower.` });
    } else {
      base.push({ question: `Should I consider debt settlement for ${v}?`, answer: `Debt settlement (negotiating to pay less than owed) is an option for severe financial hardship but damages credit. Explore all alternatives — consolidation, counseling, refinancing — first.` });
      base.push({ question: `Is bankruptcy an option for ${v} in debt?`, answer: `Bankruptcy is a last resort with long-lasting credit impacts. At ${v}, it may be worth consulting a bankruptcy attorney, but structured repayment is usually preferable.` });
    }
    return base;
  }

  // freelancer
  if (type === "freelancer") {
    const base: { question: string; answer: string }[] = [
      { question: `How much self-employment tax on ${v}?`, answer: `Self-employment tax is 15.3% on 92.35% of net earnings (up to the Social Security cap). On ${v}, that's approximately ${fmt(Math.round(value*0.9235*0.153))}.` },
      { question: `How much should I set aside for taxes on ${v}?`, answer: bucket === "low" ? `Set aside 25-30% of each payment. At ${v}, that means saving ${fmt(Math.round(value*0.275))} for the year.` : bucket === "mid" ? `Set aside 30-35% of each payment. At ${v}, that means saving roughly ${fmt(Math.round(value*0.325))} for annual tax obligations.` : `Set aside 35-40% of each payment. At ${v}, total tax liability (SE + income + state) can reach ${fmt(Math.round(value*0.375))}.` },
    ];
    if (bucket === "low") {
      base.push({ question: `Do I need to pay quarterly taxes on ${v}?`, answer: `If you expect to owe $1,000+ in taxes, quarterly estimated payments are required. On ${v}, you likely meet this threshold and should file Form 1040-ES.` });
      base.push({ question: `What can I deduct as a freelancer earning ${v}?`, answer: `Common deductions include home office, internet, phone, equipment, software, mileage, health insurance premiums, and half of your SE tax.` });
    } else if (bucket === "mid") {
      base.push({ question: `Should I open a retirement account for my ${v} freelance income?`, answer: `A SEP-IRA or Solo 401(k) lets you contribute up to 25% of net self-employment earnings (or $23,500 + 25% for Solo 401k), directly reducing taxable income.` });
      base.push({ question: `What business structure is best at ${v}?`, answer: `At ${v}, operating as a sole proprietor with a SEP-IRA is often sufficient. As income grows toward $80-100k+, an S-corp may save on SE tax.` });
    } else {
      base.push({ question: `Should I form an S-Corp at ${v}?`, answer: `At ${v}, an S-corp can save thousands in SE tax. You'd pay yourself a "reasonable salary" (subject to FICA) and take remaining profit as distributions (exempt from SE tax).` });
      base.push({ question: `How do I maximize retirement savings at ${v}?`, answer: `With a Solo 401(k), you can contribute up to $70,000/year (2025 limits). At ${v}, maximizing this reduces your taxable income significantly.` });
    }
    return base;
  }

  // location-salary (fallback — city-specific FAQs are generated in the page component)
  return [
    { question: `Is ${v} a good salary for this area?`, answer: `It depends on the local cost of living. In affordable cities, ${v} provides solid purchasing power. In expensive metros, it may feel tight after rent and taxes.` },
    { question: `How does cost of living affect ${v}?`, answer: `A city with a cost-of-living index of 150 means your ${v} has the purchasing power of roughly ${fmt(Math.round(value * 100 / 150))} at the national average.` },
    { question: `Should I relocate for a better cost of living?`, answer: bucket === "low" ? "At this income level, relocating to a lower-cost city can dramatically improve quality of life. Even a 20% cost reduction is transformative." : bucket === "mid" ? "Location arbitrage at this income level can be powerful, especially if remote work allows you to keep the same salary while reducing expenses." : "At higher incomes, the decision involves career access, networking, and tax strategy alongside raw cost-of-living calculations." },
    { question: `What percentage of income should go to rent?`, answer: `Financial advisors recommend keeping housing costs under 30% of take-home pay. In expensive cities, this may require living further from the center or considering roommates.` },
  ];
}

// ─── CITY-AWARE LOCATION SALARY GENERATORS ──────────────────

export type CostTier = "low" | "moderate" | "high" | "very-high";

export interface LocationContext {
  cityName: string;
  stateName: string;
  costOfLivingIndex: number;
  costTier: CostTier;
  hasStateTax: boolean;
  stateTaxRate: number;
  avgRent1br: number;
  adjustedSalary: number;
  monthlyNet: number;
}

export function getCostTier(col: number): CostTier {
  if (col < 95) return "low";
  if (col <= 105) return "moderate";
  if (col <= 140) return "high";
  return "very-high";
}

const costTierLabels: Record<CostTier, string> = {
  "low": "more affordable than most major U.S. metros",
  "moderate": "close to the national average in cost of living",
  "high": "above the national average in living costs",
  "very-high": "among the most expensive places to live in the United States",
};

const costTierAdj: Record<CostTier, string> = {
  "low": "affordable",
  "moderate": "moderately priced",
  "high": "above-average cost",
  "very-high": "very expensive",
};

export function generateLocationIntro(value: number, ctx: LocationContext): string {
  const bucket = getValueBucket("location-salary", value);
  const v = fmt(value);
  const tierLabel = costTierLabels[ctx.costTier];
  const tierAdj = costTierAdj[ctx.costTier];
  const taxNote = ctx.hasStateTax
    ? `with a ${(ctx.stateTaxRate * 100).toFixed(1)}% state income tax rate`
    : `with no state income tax — a meaningful advantage`;

  const templates: Record<ValueBucket, Record<CostTier, string[]>> = {
    low: {
      "very-high": [
        `${ctx.cityName} is ${tierLabel}, and on a ${v} salary, that reality hits hard. After federal taxes and ${ctx.stateName}'s ${ctx.hasStateTax ? "state income tax" : "tax-free status"}, the take-home shrinks — then ${ctx.cityName}'s housing costs claim an outsized share of what remains.`,
        `Earning ${v} in ${ctx.cityName} puts you in a difficult position. The city is ${tierLabel}, meaning your purchasing power is significantly reduced compared to what the same salary would buy elsewhere.`,
        `At ${v} in a city as expensive as ${ctx.cityName}, every budgeting decision matters. The gap between gross pay and real lifestyle is wider here than in almost any other U.S. metro.`,
      ],
      "high": [
        `${ctx.cityName} has above-average living costs, and at ${v}, that translates to tighter margins than the same salary would produce in a more affordable city. Understanding your real take-home after taxes in ${ctx.stateName} (${taxNote}) is the first step.`,
        `A ${v} salary in ${ctx.cityName} faces the double pressure of ${ctx.hasStateTax ? "state taxes and" : ""} above-average housing costs. Knowing exactly how far your paycheck stretches here helps you plan realistically.`,
        `In ${ctx.cityName}, where costs run above the national average, ${v} requires deliberate budgeting. The numbers below show what you actually keep after taxes and what local rents demand.`,
      ],
      "moderate": [
        `${ctx.cityName} is ${tierLabel}, which means a ${v} salary here buys roughly what it would in an average American city. That said, at this income level, careful budgeting is still essential — even moderate costs can strain a lower salary.`,
        `At ${v} in ${ctx.cityName}, you benefit from a cost of living near the national average. While it's not a high-cost metro, this income level still requires disciplined spending on housing and essentials.`,
        `${ctx.cityName}'s balanced cost of living means your ${v} salary isn't dramatically eroded by local prices. But at this income range, the margin between comfort and stress remains thin.`,
      ],
      "low": [
        `${ctx.cityName} is ${tierLabel}, which is a genuine advantage on a ${v} salary. Your dollars stretch further here — housing costs are well below coastal city levels, and ${ctx.hasStateTax ? `${ctx.stateName}'s ${(ctx.stateTaxRate * 100).toFixed(1)}% state tax is manageable` : `${ctx.stateName} charges no state income tax, keeping more money in your pocket`}.`,
        `A ${v} salary goes meaningfully further in ${ctx.cityName} than in pricier metros. With a cost-of-living index of ${ctx.costOfLivingIndex}, your purchasing power exceeds what the raw number suggests.`,
        `In ${ctx.cityName}, ${v} buys a lifestyle that would be difficult to achieve in higher-cost cities. The combination of ${tierAdj} housing and ${ctx.hasStateTax ? "moderate taxes" : "no state income tax"} makes each dollar work harder.`,
      ],
    },
    mid: {
      "very-high": [
        `Earning ${v} in ${ctx.cityName} sounds solid on paper, but this city is ${tierLabel}. After federal taxes, ${ctx.stateName} ${ctx.hasStateTax ? "state taxes" : "tax savings"}, and FICA, the monthly take-home faces ${ctx.cityName}'s aggressive housing market — where average rents can consume a startling percentage of net pay.`,
        `${ctx.cityName} is one of America's most expensive cities, and a ${v} salary here provides a very different lifestyle than the same income in a mid-cost metro. The numbers below reveal exactly how much ${ctx.cityName}'s cost of living compresses your real purchasing power.`,
        `At ${v} in ${ctx.cityName}, the salary-to-lifestyle equation is more complex than in most cities. The cost of living index of ${ctx.costOfLivingIndex} means your effective purchasing power is closer to ${fmt(ctx.adjustedSalary)} at national average prices.`,
      ],
      "high": [
        `${ctx.cityName}'s above-average cost of living (index: ${ctx.costOfLivingIndex}) means a ${v} salary here doesn't stretch as far as the number suggests. Combined ${taxNote}, understanding your real take-home and rent burden is essential for planning.`,
        `A ${v} salary in ${ctx.cityName} provides a moderate lifestyle, but the city's costs run above the national average. Smart choices about housing and commuting can significantly improve how far this income actually goes.`,
        `In ${ctx.cityName}, ${v} places you in the middle — not struggling, but not flush either. With costs ${Math.round(ctx.costOfLivingIndex - 100)}% above the national average, strategic budgeting makes the difference between feeling comfortable and feeling pinched.`,
      ],
      "moderate": [
        `${ctx.cityName} sits near the national cost-of-living average (index: ${ctx.costOfLivingIndex}), making a ${v} salary here a relatively strong position. Your purchasing power closely matches the nominal figure, and ${ctx.hasStateTax ? `${ctx.stateName}'s tax rate adds a manageable burden` : `${ctx.stateName}'s lack of state income tax is a real bonus`}.`,
        `At ${v} in ${ctx.cityName}, you're in a favorable position. The city's moderate costs mean your salary translates to real purchasing power without the dramatic erosion seen in coastal metros.`,
        `${ctx.cityName}'s cost of living is close to the U.S. average, which means ${v} here buys approximately what you'd expect. This makes budgeting more predictable and savings goals more achievable than in higher-cost cities.`,
      ],
      "low": [
        `${ctx.cityName} is ${tierLabel}, and at ${v}, that's a real advantage. Your purchasing power here is equivalent to ${fmt(ctx.adjustedSalary)} at national average costs — effectively a built-in raise compared to working in a pricier metro.`,
        `Earning ${v} in ${ctx.cityName} puts you in a strong position relative to local costs. With a COL index of ${ctx.costOfLivingIndex}, you have more room for saving, investing, and lifestyle than the same salary would provide in most large cities.`,
        `A ${v} salary combined with ${ctx.cityName}'s lower-than-average costs creates real financial opportunity. ${ctx.hasStateTax ? `Even with ${ctx.stateName}'s state tax, ` : `With no state income tax in ${ctx.stateName}, `}your net purchasing power here outperforms most major metros.`,
      ],
    },
    high: {
      "very-high": [
        `Even at ${v}, ${ctx.cityName} tests your budget. The city is ${tierLabel}, with a COL index of ${ctx.costOfLivingIndex} — meaning your real purchasing power is closer to ${fmt(ctx.adjustedSalary)}. ${ctx.hasStateTax ? `Add ${ctx.stateName}'s ${(ctx.stateTaxRate * 100).toFixed(1)}% state tax` : `${ctx.stateName}'s lack of state income tax helps`}, and the picture becomes clearer: high income doesn't automatically mean high comfort in ${ctx.cityName}.`,
        `${v} is a strong salary nationally, but ${ctx.cityName}'s extreme cost of living (index ${ctx.costOfLivingIndex}) reshapes what that number actually means. The gap between this salary's national buying power and its local buying power is larger here than in nearly any other U.S. metro.`,
        `At ${v} in ${ctx.cityName}, you earn well above the national median — but the city's costs are equally above average. The result is a lifestyle that may feel more "comfortable middle" than "high earner" depending on housing choices.`,
      ],
      "high": [
        `A ${v} salary in ${ctx.cityName} provides a good lifestyle, but the city's above-average costs (index: ${ctx.costOfLivingIndex}) mean you're not as far ahead as the number suggests. ${ctx.hasStateTax ? `${ctx.stateName}'s state income tax adds to the picture` : `The absence of state income tax in ${ctx.stateName} is a meaningful advantage`}, making tax planning especially important.`,
        `In ${ctx.cityName}, ${v} translates to solid purchasing power — but not as much as you'd enjoy in a lower-cost metro. Understanding how ${ctx.cityName}'s specific cost structure (housing, taxes, transit) affects this salary helps you optimize.`,
        `${ctx.cityName}'s cost of living sits ${Math.round(ctx.costOfLivingIndex - 100)}% above the national average, which tempers the impact of a ${v} salary. Still, at this income level, you have meaningful room to build savings and invest if housing costs are managed.`,
      ],
      "moderate": [
        `${v} in ${ctx.cityName} is an excellent position. With costs near the national average and ${ctx.hasStateTax ? "manageable state taxes" : "no state income tax"}, almost all of your above-average salary translates to above-average lifestyle and savings capacity.`,
        `At ${v} in ${ctx.cityName}, you're earning well above what the local cost of living demands. This creates significant room for aggressive saving, investing, or lifestyle upgrades that wouldn't be possible at the same salary in a coastal metro.`,
        `${ctx.cityName}'s moderate costs combined with a ${v} salary create one of the better income-to-lifestyle ratios available in a U.S. metro. Your purchasing power of ${fmt(ctx.adjustedSalary)} closely matches (or exceeds) the nominal figure.`,
      ],
      "low": [
        `${v} in ${ctx.cityName} is an exceptionally strong financial position. The city's low cost of living (index: ${ctx.costOfLivingIndex}) amplifies your purchasing power to ${fmt(ctx.adjustedSalary)} at national average prices. ${ctx.hasStateTax ? `Even with state taxes, ` : `With no state income tax, `}the combination is powerful.`,
        `Earning ${v} in an affordable city like ${ctx.cityName} is a wealth-building accelerator. Your monthly take-home of ${fmt(ctx.monthlyNet)} faces housing costs far below what peers pay in coastal cities, leaving substantial room for savings and investing.`,
        `At ${v} in ${ctx.cityName}, you experience one of the strongest purchasing power multipliers in the country. This income level here provides a lifestyle that would require ${fmt(Math.round(value * ctx.costOfLivingIndex / 100))}+ in a city at the national average.`,
      ],
    },
  };

  const options = templates[bucket][ctx.costTier];
  return pick(options, value);
}

export function generateLocationExplanation(value: number, ctx: LocationContext): string {
  const bucket = getValueBucket("location-salary", value);
  const v = fmt(value);
  const taxSentence = ctx.hasStateTax
    ? `${ctx.stateName}'s ${(ctx.stateTaxRate * 100).toFixed(1)}% state income tax takes ${fmt(Math.round(value * ctx.stateTaxRate))} annually from your ${v} salary`
    : `${ctx.stateName} has no state income tax — saving you roughly ${fmt(Math.round(value * 0.05))} per year compared to a state with a 5% rate`;

  if (bucket === "low") {
    return pick([
      `In ${ctx.cityName}, the 30% housing rule is especially critical at ${v}. With average 1-bedroom rent at ${fmt(ctx.avgRent1br)}/month against your take-home of ${fmt(ctx.monthlyNet)}/month, ${ctx.avgRent1br / ctx.monthlyNet > 0.3 ? "rent alone exceeds the recommended threshold — shared housing or neighborhoods further from the center may be necessary" : "you're near or within the recommended range, though it leaves limited room for other expenses"}. ${taxSentence}.`,
      `At ${v} in ${ctx.cityName}, every dollar allocation matters. ${taxSentence}. After housing at local rates, the remaining budget for transportation, food, and savings is ${ctx.costTier === "very-high" || ctx.costTier === "high" ? "extremely tight" : "workable but requires discipline"}. Prioritizing employer-matched retirement contributions and building a $1,000 emergency fund should come before discretionary spending.`,
      `${ctx.cityName}'s ${costTierAdj[ctx.costTier]} housing market defines what ${v} feels like here. ${taxSentence}. The key question is whether rent below ${fmt(Math.round(ctx.monthlyNet * 0.3))}/month (the 30% threshold) is achievable in ${ctx.cityName} — and the data suggests it ${ctx.avgRent1br <= ctx.monthlyNet * 0.3 ? "is, with careful neighborhood selection" : "requires significant compromises like roommates or longer commutes"}.`,
    ], value);
  }

  if (bucket === "mid") {
    return pick([
      `${ctx.cityName}'s cost structure shapes how ${v} actually feels. ${taxSentence}. Housing is the single largest variable: at ${fmt(ctx.avgRent1br)}/month for a 1-bedroom, rent consumes ${Math.round(ctx.avgRent1br / ctx.monthlyNet * 100)}% of your monthly take-home. ${ctx.avgRent1br / ctx.monthlyNet <= 0.3 ? "This is within the healthy range, leaving room for saving 15-20% of gross income." : "This exceeds the recommended 30% threshold, meaning savings goals require trade-offs elsewhere."}`,
      `At this income level in ${ctx.cityName}, strategic decisions about housing and transportation have outsized impact. ${taxSentence}. If remote work allows flexibility, living slightly outside ${ctx.cityName}'s core can reduce rent by 15-25% while keeping access to the city's opportunities.`,
      `The ${v}-in-${ctx.cityName} equation comes down to housing efficiency. With take-home of ${fmt(ctx.monthlyNet)}/month, keeping rent near ${fmt(Math.round(ctx.monthlyNet * 0.3))}/month is the target. ${taxSentence}. Smart budgeting at this level means automating at least 15% of gross into savings before allocating for lifestyle spending.`,
    ], value);
  }

  return pick([
    `At ${v} in ${ctx.cityName}, the question shifts from "can I afford it?" to "am I optimizing it?" ${taxSentence}. With take-home of ${fmt(ctx.monthlyNet)}/month, the ${fmt(ctx.avgRent1br)} average rent (${Math.round(ctx.avgRent1br / ctx.monthlyNet * 100)}% of take-home) is ${ctx.avgRent1br / ctx.monthlyNet <= 0.25 ? "well within comfortable range" : ctx.avgRent1br / ctx.monthlyNet <= 0.35 ? "manageable but notable" : "a significant portion even at this income"}. Maxing out tax-advantaged accounts (401k, IRA, HSA) should be baseline strategy.`,
    `High earners in ${ctx.cityName} have a different calculus than in lower-cost metros. ${taxSentence}. The real question is opportunity cost: does ${ctx.cityName}'s job market and networking value justify the premium over a city where ${v} would have ${fmt(Math.round(value * (100 / ctx.costOfLivingIndex) - value))} more in effective purchasing power?`,
    `${v} in ${ctx.cityName} provides ${ctx.costTier === "low" || ctx.costTier === "moderate" ? "substantial financial power — prioritize wealth building through aggressive investing and retirement account maximization" : "good income but not unlimited comfort. " + (ctx.hasStateTax ? `Combined federal and ${ctx.stateName} state taxes claim a significant portion, ` : "The lack of state income tax helps, ") + "so housing efficiency and tax-advantaged accounts become the key levers for building long-term wealth"}.`,
  ], value);
}

export function generateLocationFAQs(value: number, ctx: LocationContext): { question: string; answer: string }[] {
  const bucket = getValueBucket("location-salary", value);
  const v = fmt(value);
  const rentPct = Math.round(ctx.avgRent1br / ctx.monthlyNet * 100);

  const faqs: { question: string; answer: string }[] = [
    {
      question: `Is ${v} a good salary in ${ctx.cityName}?`,
      answer: ctx.costTier === "very-high"
        ? `${v} in ${ctx.cityName} provides below-average purchasing power due to the very high cost of living (index ${ctx.costOfLivingIndex}). Your effective purchasing power is ${fmt(ctx.adjustedSalary)} at national average costs. ${bucket === "low" ? "It will be challenging without supplemental income or shared housing." : bucket === "mid" ? "It's livable but requires careful budgeting, especially around housing." : "It provides a comfortable but not lavish lifestyle by local standards."}`
        : ctx.costTier === "high"
        ? `${v} in ${ctx.cityName} is ${bucket === "low" ? "below average for the local cost of living" : bucket === "mid" ? "moderate — enough to live on but with limited room for aggressive saving" : "solid, providing a comfortable lifestyle with room for savings"}. The above-average costs (index ${ctx.costOfLivingIndex}) reduce purchasing power to ${fmt(ctx.adjustedSalary)}.`
        : ctx.costTier === "moderate"
        ? `${v} in ${ctx.cityName} is ${bucket === "low" ? "below median but workable given the moderate costs" : bucket === "mid" ? "a solid middle-class salary that goes roughly as far as the national average" : "an excellent salary that provides strong purchasing power and saving capacity"}. Your purchasing power closely matches the nominal figure at ${fmt(ctx.adjustedSalary)}.`
        : `${v} in ${ctx.cityName} goes further than in most major cities. With a cost-of-living index of only ${ctx.costOfLivingIndex}, your purchasing power is ${fmt(ctx.adjustedSalary)} — ${bucket === "low" ? "making an otherwise tight salary more manageable" : bucket === "mid" ? "giving you more breathing room than peers in expensive metros" : "creating excellent conditions for rapid wealth building"}.`,
    },
    {
      question: `How much does rent cost on ${v} in ${ctx.cityName}?`,
      answer: `Average 1BR rent in ${ctx.cityName} is ${fmt(ctx.avgRent1br)}/month. On a ${v} salary with monthly take-home of ${fmt(ctx.monthlyNet)}, that's ${rentPct}% of net pay. ${rentPct <= 30 ? "This is within the recommended 30% threshold." : rentPct <= 40 ? `This exceeds the 30% guideline. To stay within budget, target rent below ${fmt(Math.round(ctx.monthlyNet * 0.3))}/month.` : `This is significantly rent-burdened. Consider shared housing or neighborhoods outside ${ctx.cityName}'s core to reduce costs.`}`,
    },
    {
      question: `Can you live comfortably in ${ctx.cityName} on ${v}?`,
      answer: ctx.costTier === "very-high" && bucket === "low"
        ? `${v} in ${ctx.cityName} will be very challenging. After rent and taxes, little remains for savings or discretionary spending. Shared housing is typically necessary.`
        : ctx.costTier === "very-high"
        ? `Comfort in ${ctx.cityName} on ${v} depends heavily on housing choices. ${bucket === "mid" ? "It's doable with a modest apartment, but aggressive saving is difficult." : "Yes, but be aware that the same salary buys significantly more in other cities."}`
        : rentPct <= 35
        ? `Yes. With rent consuming ${rentPct}% of take-home and ${ctx.hasStateTax ? "manageable state taxes" : "no state income tax"}, ${v} provides a comfortable lifestyle in ${ctx.cityName} with room for savings.`
        : `It's possible but requires trade-offs. Rent at ${rentPct}% of take-home pay is above the comfort threshold, so careful budgeting around food, transportation, and entertainment is important.`,
    },
    {
      question: `How does ${ctx.cityName}'s cost of living compare to the national average?`,
      answer: `${ctx.cityName}'s cost-of-living index is ${ctx.costOfLivingIndex}, which is ${ctx.costOfLivingIndex > 100 ? `${ctx.costOfLivingIndex - 100}% above` : ctx.costOfLivingIndex < 100 ? `${100 - ctx.costOfLivingIndex}% below` : "exactly at"} the national average of 100. This means ${v} in ${ctx.cityName} has the purchasing power of ${fmt(ctx.adjustedSalary)} in an average-cost U.S. city. ${ctx.hasStateTax ? `${ctx.stateName}'s ${(ctx.stateTaxRate * 100).toFixed(1)}% state income tax adds to the cost consideration.` : `${ctx.stateName}'s lack of state income tax partially offsets ${ctx.costOfLivingIndex > 100 ? "the higher costs" : "expenses"}, improving your net position.`}`,
    },
    {
      question: `Should I move to ${ctx.cityName} for a ${v} salary?`,
      answer: bucket === "low"
        ? `At ${v}, ${ctx.costTier === "low" || ctx.costTier === "moderate" ? `${ctx.cityName}'s ${costTierAdj[ctx.costTier]} costs make it a reasonable choice. Your salary stretches ${ctx.costTier === "low" ? "further than average" : "about as expected"}.` : `${ctx.cityName}'s higher costs mean ${v} won't go as far as in more affordable cities. Consider whether career opportunities here justify the cost premium.`}`
        : bucket === "mid"
        ? `${ctx.costTier === "very-high" || ctx.costTier === "high" ? `Only if the career opportunity significantly outweighs the cost premium. Your ${v} has the purchasing power of ${fmt(ctx.adjustedSalary)} here.` : `${ctx.cityName} is a solid choice at ${v}. The ${costTierAdj[ctx.costTier]} costs mean your salary maintains strong purchasing power.`}`
        : `At ${v}, ${ctx.cityName} ${ctx.costTier === "very-high" ? "is livable but you'd build wealth faster in a lower-cost city" : ctx.costTier === "high" ? "offers a good lifestyle with some trade-offs vs cheaper metros" : "is an excellent choice — your high salary combined with " + (ctx.costTier === "low" ? "low costs" : "moderate costs") + " creates powerful wealth-building conditions"}.`,
    },
  ];

  return faqs;
}

export function generateCityComparison(value: number, ctx: LocationContext): string {
  const v = fmt(value);
  const diff = ctx.adjustedSalary - value;
  const direction = diff >= 0 ? "more" : "less";
  const absDiff = Math.abs(diff);

  if (ctx.costTier === "very-high") {
    return `Compared to the national average, ${ctx.cityName} has a very high cost of living — your ${v} buys what ${fmt(ctx.adjustedSalary)} would buy elsewhere, meaning you lose ${fmt(absDiff)} in purchasing power. ${ctx.hasStateTax ? `Factor in ${ctx.stateName}'s ${(ctx.stateTaxRate * 100).toFixed(1)}% state tax, and the effective cost of living in ${ctx.cityName} is even steeper.` : `The silver lining: ${ctx.stateName} has no state income tax, partially offsetting the higher costs.`} Someone earning the same ${v} in a city with a COL index around 95 would have roughly ${fmt(Math.round(value * 100 / 95))} in purchasing power — a ${fmt(Math.round(value * 100 / 95) - ctx.adjustedSalary)} difference.`;
  }
  if (ctx.costTier === "high") {
    return `${ctx.cityName}'s cost of living is ${ctx.costOfLivingIndex - 100}% above the national average. Your ${v} effectively buys what ${fmt(ctx.adjustedSalary)} would in an average-cost city — a ${fmt(absDiff)} reduction in real purchasing power. ${ctx.hasStateTax ? `${ctx.stateName}'s state income tax adds another layer of cost.` : `However, ${ctx.stateName}'s zero state income tax keeps more of each paycheck in your pocket.`}`;
  }
  if (ctx.costTier === "moderate") {
    return `${ctx.cityName}'s cost of living sits close to the national average (index: ${ctx.costOfLivingIndex}), meaning your ${v} salary translates almost dollar-for-dollar to real purchasing power. ${diff >= 0 ? `You actually gain ${fmt(absDiff)} in effective purchasing power compared to the average city.` : `The ${fmt(absDiff)} difference is minimal and unlikely to affect major financial decisions.`} ${ctx.hasStateTax ? `${ctx.stateName}'s ${(ctx.stateTaxRate * 100).toFixed(1)}% state tax is a standard consideration.` : `${ctx.stateName}'s lack of state income tax is a meaningful additional advantage.`}`;
  }
  return `${ctx.cityName} is ${direction === "more" ? "more affordable" : "comparable to"} the average U.S. city (COL index: ${ctx.costOfLivingIndex}). Your ${v} has the effective purchasing power of ${fmt(ctx.adjustedSalary)} — that's ${fmt(absDiff)} ${direction} than the same salary in an average-cost city. ${ctx.hasStateTax ? `Even with ${ctx.stateName}'s state tax, ` : `Combined with ${ctx.stateName}'s zero state income tax, `}${ctx.cityName} is one of the more financially efficient places to earn this salary.`;
}

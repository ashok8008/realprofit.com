import { z } from "zod";

export interface Subcategory {
  name: string;
  slug: string;
  description?: string;
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  icon: string;
  subcategories: Subcategory[];
}

export const categories: Category[] = [
  {
    name: "Money Basics",
    slug: "money-basics",
    description: "The fundamentals of personal finance, budgeting, and building healthy money habits.",
    icon: "Wallet",
    subcategories: [
      { name: "Saving Money", slug: "saving-money" },
      { name: "Budgeting", slug: "budgeting" },
      { name: "Emergency Funds", slug: "emergency-funds" },
      { name: "Living Paycheck to Paycheck", slug: "living-paycheck-to-paycheck" },
      { name: "Money Habits", slug: "money-habits" },
      { name: "Financial Mistakes", slug: "financial-mistakes" },
      { name: "How Much Should I Have?", slug: "how-much-should-i-have" },
      { name: "Money Myths", slug: "money-myths" },
    ],
  },
  {
    name: "Income & Side Hustles",
    slug: "income-side-hustles",
    description: "Strategies for increasing your earning potential through your career, freelance work, and side hustles.",
    icon: "TrendingUp",
    subcategories: [
      { name: "Freelancing Basics", slug: "freelancing-basics" },
      { name: "Gig Economy", slug: "gig-economy" },
      { name: "Side Hustle Ideas", slug: "side-hustle-ideas" },
      { name: "Irregular Income", slug: "irregular-income" },
      { name: "Passive Income Reality", slug: "passive-income-reality" },
      { name: "Online Income", slug: "online-income" },
      { name: "Career Switching", slug: "career-switching" },
      { name: "Increasing Your Income", slug: "increasing-your-income" },
    ],
  },
  {
    name: "Taxes",
    slug: "taxes",
    description: "Demystifying the tax system, from W-2 filing to managing freelance estimates.",
    icon: "FileText",
    subcategories: [
      { name: "Do I Need to File?", slug: "do-i-need-to-file" },
      { name: "Tax Deadlines", slug: "tax-deadlines" },
      { name: "Estimated Taxes", slug: "estimated-taxes" },
      { name: "Freelance & Gig Taxes", slug: "freelance-gig-taxes" },
      { name: "Tax Mistakes", slug: "tax-mistakes" },
      { name: "Tax Myths", slug: "tax-myths" },
      { name: "IRS Letters & Notices", slug: "irs-letters-notices" },
      { name: "Filing Options Explained", slug: "filing-options-explained" },
    ],
  },
  {
    name: "Saving vs Investing",
    slug: "saving-vs-investing",
    description: "Understanding the difference between keeping your money safe and making it grow.",
    icon: "PiggyBank",
    subcategories: [
      { name: "Saving Accounts", slug: "saving-accounts" },
      { name: "High-Yield Savings", slug: "high-yield-savings" },
      { name: "Investing Basics", slug: "investing-basics" },
      { name: "Stocks vs ETFs", slug: "stocks-vs-etfs" },
      { name: "Retirement Basics", slug: "retirement-basics" },
      { name: "Risk & Returns", slug: "risk-returns" },
      { name: "When to Invest", slug: "when-to-invest" },
      { name: "Long-Term Planning", slug: "long-term-planning" },
    ],
  },
  {
    name: "Debt & Credit",
    slug: "debt-credit",
    description: "Mastering credit scores, paying off loans, and using debt responsibly.",
    icon: "CreditCard",
    subcategories: [
      { name: "Credit Cards", slug: "credit-cards" },
      { name: "Credit Scores", slug: "credit-scores" },
      { name: "Loans & Interest", slug: "loans-interest" },
      { name: "Debt Payoff Strategies", slug: "debt-payoff-strategies" },
      { name: "Student Loans", slug: "student-loans" },
      { name: "Buy Now, Pay Later", slug: "buy-now-pay-later" },
      { name: "Credit Myths", slug: "credit-myths" },
      { name: "Bad Debt vs Good Debt", slug: "bad-debt-vs-good-debt" },
    ],
  },
  {
    name: "Life Decisions",
    slug: "life-decisions",
    description: "Navigating the financial implications of life's biggest milestones.",
    icon: "Home",
    subcategories: [
      { name: "Renting vs Buying", slug: "renting-vs-buying" },
      { name: "Marriage & Money", slug: "marriage-money" },
      { name: "Kids & Family Finances", slug: "kids-family-finances" },
      { name: "Moving Cities", slug: "moving-cities" },
      { name: "Lifestyle Inflation", slug: "lifestyle-inflation" },
      { name: "Big Purchases", slug: "big-purchases" },
      { name: "Career & Life Choices", slug: "career-life-choices" },
      { name: "Cost of Living Comparisons", slug: "cost-of-living-comparisons" },
    ],
  },
  {
    name: "Real Stories",
    slug: "real-stories",
    description: "Authentic financial journeys, salary transparencies, and lessons learned the hard way.",
    icon: "Users",
    subcategories: [
      { name: "Income Case Studies", slug: "income-case-studies" },
      { name: "Budget Breakdowns", slug: "budget-breakdowns" },
      { name: "Financial Mistakes Stories", slug: "financial-mistakes-stories" },
      { name: "Money Transformations", slug: "money-transformations" },
      { name: "Salary Reality Checks", slug: "salary-reality-checks" },
      { name: "Freelancer Stories", slug: "freelancer-stories" },
      { name: "Tax Shock Stories", slug: "tax-shock-stories" },
      { name: "What I Wish I Knew", slug: "what-i-wish-i-knew" },
    ],
  },
  {
    name: "Calculators",
    slug: "calculators",
    description: "Interactive tools to clarify your numbers and plan your financial future.",
    icon: "Calculator",
    subcategories: [
      { name: "Savings & Budget", slug: "savings-budget" },
      { name: "Income & Freelance", slug: "income-freelance" },
      { name: "Taxes", slug: "taxes-calc" },
      { name: "Investing", slug: "investing-calc" },
      { name: "Debt & Credit", slug: "debt-credit-calc" },
      { name: "Life Decisions", slug: "life-decisions-calc" },
    ],
  }
];

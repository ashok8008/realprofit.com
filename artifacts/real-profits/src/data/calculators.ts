export interface CalculatorDef {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
}

export const calculators: CalculatorDef[] = [
  { id: "savings-goal", name: "Savings Goal Calculator", slug: "savings-goal-calculator", description: "Find out how long it will take to reach your savings target.", category: "savings-budget" },
  { id: "emergency-fund", name: "Emergency Fund Calculator", slug: "emergency-fund-calculator", description: "Calculate exactly how much you need for a fully funded emergency net.", category: "savings-budget" },
  { id: "monthly-budget", name: "Monthly Budget Calculator", slug: "monthly-budget-calculator", description: "A clean, simple budget breakdown based on your net income.", category: "savings-budget" },
  { id: "expense-breakdown", name: "Expense Breakdown Tool", slug: "expense-breakdown-tool", description: "Analyze your spending habits visually.", category: "savings-budget" },
  
  { id: "monthly-income", name: "Monthly Income Estimator", slug: "monthly-income-estimator", description: "Project your variable freelance or gig income.", category: "income-freelance" },
  { id: "side-hustle", name: "Side Hustle Earnings", slug: "side-hustle-earnings", description: "See how small hourly commitments add up annually.", category: "income-freelance" },
  { id: "hourly-rate", name: "Hourly Rate Calculator", slug: "hourly-rate-calculator", description: "Convert your annual salary to a true hourly rate.", category: "income-freelance" },
  
  { id: "simple-tax", name: "Simple Tax Estimator", slug: "simple-tax-estimator", description: "Estimate your federal and state tax liability.", category: "taxes-calc" },
  { id: "tax-set-aside", name: "Tax Set-Aside Calculator", slug: "tax-set-aside-calculator", description: "Know exactly how much of each freelance check to save for the IRS.", category: "taxes-calc" },
  { id: "quarterly-tax", name: "Quarterly Tax Calculator", slug: "quarterly-tax-calculator", description: "Calculate your estimated quarterly tax payments.", category: "taxes-calc" },
  { id: "self-employment-tax", name: "Self-Employment Tax Calculator", slug: "self-employment-tax-calculator", description: "Find out your exact FICA tax burden as a freelancer.", category: "taxes-calc" },
  
  { id: "save-vs-invest", name: "Save vs Invest Calculator", slug: "save-vs-invest-calculator", description: "Compare cash savings growth versus market investments.", category: "investing-calc" },
  { id: "compound-interest", name: "Compound Interest Calculator", slug: "compound-interest-calculator", description: "See the magic of compound growth over decades.", category: "investing-calc" },
  { id: "investment-growth", name: "Investment Growth Calculator", slug: "investment-growth-calculator", description: "Project your portfolio balance to retirement.", category: "investing-calc" },
  
  { id: "credit-card-payoff", name: "Credit Card Payoff Calculator", slug: "credit-card-payoff-calculator", description: "Find out when you'll be debt-free.", category: "debt-credit-calc" },
  { id: "loan-interest", name: "Loan Interest Calculator", slug: "loan-interest-calculator", description: "Reveal the true cost of borrowing money.", category: "debt-credit-calc" },
  { id: "debt-snowball", name: "Debt Snowball Calculator", slug: "debt-snowball-calculator", description: "Organize multiple debts for the fastest payoff strategy.", category: "debt-credit-calc" },
  
  { id: "rent-vs-buy", name: "Rent vs Buy Calculator", slug: "rent-vs-buy-calculator", description: "Compare the long-term math of housing decisions.", category: "life-decisions-calc" },
  { id: "cost-of-living", name: "Cost of Living Comparison", slug: "cost-of-living-comparison", description: "See how your budget shifts when moving cities.", category: "life-decisions-calc" },
  { id: "salary-reality", name: "Salary Reality Calculator", slug: "salary-reality-calculator", description: "Translate a big job offer into actual monthly take-home pay.", category: "life-decisions-calc" },
  
  // New Savings Calculators
  { id: "simple-savings", name: "Simple Savings Calculator", slug: "simple-savings-calculator", description: "Calculate basic compound interest on your savings.", category: "savings-budget" },
  { id: "monthly-savings", name: "Monthly Savings Calculator", slug: "monthly-savings-calculator", description: "Find out how much to save monthly to reach a goal.", category: "savings-budget" },
  { id: "savings-income", name: "Savings Income Calculator", slug: "savings-income-calculator", description: "Calculate the passive income your savings generate.", category: "savings-budget" },
  
  // New Loan Calculators
  { id: "mortgage", name: "Mortgage Calculator", slug: "mortgage-calculator", description: "Calculate your total monthly mortgage payment.", category: "loans-calc" },
  { id: "mortgage-amortization", name: "Mortgage Amortization Calculator", slug: "mortgage-amortization-calculator", description: "See how your mortgage principal and interest change over time.", category: "loans-calc" },
  { id: "personal-loan", name: "Personal Loan Calculator", slug: "personal-loan-calculator", description: "Estimate your monthly payment on a personal loan.", category: "loans-calc" },
  { id: "auto-loan", name: "Auto Loan Calculator", slug: "auto-loan-calculator", description: "Figure out your car payment, including taxes and fees.", category: "loans-calc" },
  { id: "business-loan", name: "Business Loan Calculator", slug: "business-loan-calculator", description: "Calculate monthly or weekly payments for business loans.", category: "loans-calc" },
  { id: "loan-affordability", name: "Loan Affordability Calculator", slug: "loan-affordability-calculator", description: "Determine how much you can borrow based on your income.", category: "loans-calc" },
  { id: "extra-payment", name: "Extra Payment Calculator", slug: "extra-payment-calculator", description: "See how much time and interest you save by paying extra.", category: "loans-calc" },
  
  // New Investing Calculators
  { id: "investment-return", name: "Investment Return Calculator", slug: "investment-return-calculator", description: "Calculate the return on your investments over time.", category: "investing-calc" },
  { id: "sip", name: "SIP Calculator", slug: "sip-calculator", description: "Calculate returns for Systematic Investment Plans.", category: "investing-calc" },
  { id: "retirement-growth", name: "Retirement Growth Calculator", slug: "retirement-growth-calculator", description: "Project your savings until retirement age.", category: "investing-calc" },
  
  // New Debt Calculators
  { id: "debt-avalanche", name: "Debt Avalanche Calculator", slug: "debt-avalanche-calculator", description: "Pay off highest interest debts first to save money.", category: "debt-credit-calc" },
  { id: "interest", name: "Interest Calculator", slug: "interest-calculator", description: "Calculate simple or compound interest on balances.", category: "debt-credit-calc" },
  { id: "minimum-payment-trap", name: "Minimum Payment Trap Calculator", slug: "minimum-payment-trap-calculator", description: "See the true cost of making only minimum credit card payments.", category: "debt-credit-calc" },
  
  // New Income & Freelance Calculators
  { id: "profit-margin", name: "Profit Margin Calculator", slug: "profit-margin-calculator", description: "Calculate your net profit margin on sales or services.", category: "income-freelance" },
  { id: "net-income", name: "Net Income Calculator", slug: "net-income-calculator", description: "Calculate true take-home pay after business expenses and taxes.", category: "income-freelance" },
  
  // New Life Decision Calculators
  { id: "can-i-afford", name: "Can I Afford This Calculator", slug: "can-i-afford-this-calculator", description: "Quickly verify if a new recurring cost fits your budget.", category: "life-decisions-calc" },
];

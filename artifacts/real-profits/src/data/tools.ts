export interface ToolDef {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
}

export const tools: ToolDef[] = [
  { id: "freelance-invoice", name: "Freelance Invoice Generator", slug: "freelance-invoice-generator", description: "Create professional invoices and download them as PDF.", category: "income" },
  { id: "subscription-analyzer", name: "Subscription Cost Analyzer", slug: "subscription-cost-analyzer", description: "Track and analyze your monthly subscription spending.", category: "budget" },
  { id: "bill-split", name: "Bill Split Tool", slug: "bill-split-tool", description: "Split bills fairly among friends or roommates.", category: "budget" },
  { id: "net-worth", name: "Net Worth Calculator", slug: "net-worth-calculator", description: "Calculate your total assets minus liabilities.", category: "wealth" },
  { id: "paycheck", name: "Paycheck Calculator", slug: "paycheck-calculator", description: "Estimate your take-home pay from gross income.", category: "income" },
  { id: "income-tracker", name: "Income Tracker", slug: "income-tracker", description: "Log income entries and see earning patterns over time.", category: "income" },
  { id: "expense-tracker", name: "Expense Tracker", slug: "expense-tracker", description: "Record expenses and understand spending habits.", category: "budget" },
];
export interface ToolDef {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
}

export const tools: ToolDef[] = [
  { id: "esign", name: "RealProfits eSign", slug: "esign", description: "Free electronic signature tool. Upload a PDF, add signers, get legally binding signatures with audit trail.", category: "income" },
  { id: "freelance-invoice", name: "Invoice Generator Pro", slug: "freelance-invoice-generator", description: "Create, manage, and track professional invoices with client management, partial payments, and PDF export.", category: "income" },
  { id: "subscription-analyzer", name: "Subscription Cost Analyzer", slug: "subscription-cost-analyzer", description: "Track and analyze your monthly subscription spending.", category: "budget" },
  { id: "bill-split", name: "Bill Split Tool", slug: "bill-split-tool", description: "Split bills fairly among friends or roommates.", category: "budget" },
  { id: "net-worth", name: "Net Worth Calculator", slug: "net-worth-calculator", description: "Calculate your total assets minus liabilities.", category: "wealth" },
  { id: "paycheck", name: "Paycheck Calculator", slug: "paycheck-calculator", description: "Estimate your take-home pay from gross income.", category: "income" },
  { id: "income-tracker", name: "Income Tracker", slug: "income-tracker", description: "Log income entries and see earning patterns over time.", category: "income" },
  { id: "expense-tracker", name: "Expense Tracker", slug: "expense-tracker", description: "Record expenses and understand spending habits.", category: "budget" },
];
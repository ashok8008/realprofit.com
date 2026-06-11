// Invoice app types
export interface LineItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
}

export interface PaymentRecord {
  amount: number;
  date: string;
  note: string;
  recorded_at?: string;
}

export interface BankDetails {
  bank_name: string;
  account_holder: string;
  account_number: string;
  routing_number: string;     // ACH routing (US) / SWIFT / IFSC etc — free text
  account_type: string;       // "Checking" | "Savings" | other
  paypal: string;             // optional
  notes: string;              // anything else (e.g., bank address, Zelle handle)
}

export const EMPTY_BANK_DETAILS: BankDetails = {
  bank_name: "",
  account_holder: "",
  account_number: "",
  routing_number: "",
  account_type: "",
  paypal: "",
  notes: "",
};

export function hasBankDetails(b?: BankDetails | null): boolean {
  if (!b) return false;
  return !!(b.bank_name || b.account_holder || b.account_number || b.routing_number || b.paypal);
}

export interface InvoiceAttachment {
  id: string;
  filename: string;
  mime: string;
  size: number;
  uploaded_at: string;
}

export interface InvoiceData {
  id?: string;
  invoice_number: string;
  date: string;
  due_date: string;
  status: "draft" | "sent" | "paid" | "overdue" | "partial";
  currency: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  logo_url: string;
  accent_color: string;
  client_id: string;
  client_name: string;
  client_company: string;
  client_email: string;
  client_address: string;
  items: LineItem[];
  discount_type: "%" | "$";
  discount_value: number;
  tax_label: string;
  tax_rate: number;
  notes: string;
  payment_terms: string;
  payment_link: string;
  bank_details: BankDetails;
  signature_data: string;
  template: "minimal" | "corporate" | "creative";
  recurring: boolean;
  recurring_period: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  payments: PaymentRecord[];
  attachments: InvoiceAttachment[];
}

export interface ClientData {
  id?: string;
  name: string;
  company: string;
  email: string;
  address: string;
}

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
];

export const UNITS = ["hr", "day", "unit", "item", "month", "yr", "word", "page", "flat"];

export const defaultInvoice: InvoiceData = {
  invoice_number: "INV-001",
  date: new Date().toISOString().split("T")[0],
  due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  status: "draft",
  currency: "USD",
  business_name: "",
  business_email: "",
  business_phone: "",
  business_address: "",
  logo_url: "",
  accent_color: "#0B3D3D",
  client_id: "",
  client_name: "",
  client_company: "",
  client_email: "",
  client_address: "",
  items: [{ id: "1", description: "", qty: 1, unit: "hr", rate: 100 }],
  discount_type: "%",
  discount_value: 0,
  tax_label: "Tax",
  tax_rate: 0,
  notes: "",
  payment_terms: "",
  payment_link: "",
  bank_details: { ...EMPTY_BANK_DETAILS },
  signature_data: "",
  template: "minimal",
  recurring: false,
  recurring_period: "monthly",
  subtotal: 0,
  discount_amount: 0,
  tax_amount: 0,
  total: 0,
  payments: [],
  attachments: [],
};

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol || "$";
}

export function calcTotals(inv: InvoiceData): { subtotal: number; discount_amount: number; tax_amount: number; total: number } {
  const subtotal = inv.items.reduce((s, i) => s + i.qty * i.rate, 0);
  const discount_amount = inv.discount_type === "%" ? subtotal * inv.discount_value / 100 : inv.discount_value;
  const afterDiscount = subtotal - discount_amount;
  const tax_amount = afterDiscount * inv.tax_rate / 100;
  const total = afterDiscount + tax_amount;
  return { subtotal: Math.round(subtotal * 100) / 100, discount_amount: Math.round(discount_amount * 100) / 100, tax_amount: Math.round(tax_amount * 100) / 100, total: Math.round(total * 100) / 100 };
}

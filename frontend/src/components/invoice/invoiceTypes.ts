export interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  rate: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  senderName: string;
  senderAddress: string;
  senderEmail: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  items: InvoiceItem[];
  discount: string;
  taxPercentage: string;
  notes: string;
  paymentTerms: string;
}

export type ToastFunction = (opts: { title: string; description?: string; variant?: "default" | "destructive" }) => void;

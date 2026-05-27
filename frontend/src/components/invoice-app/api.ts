import type { InvoiceData, ClientData } from "./types";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

async function f(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, { credentials: "include", ...opts, headers: { "Content-Type": "application/json", ...opts?.headers } });
  if (res.status === 401) throw new Error("AUTH_REQUIRED");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const invoiceApi = {
  list: () => f("/api/invoices"),
  get: (id: string) => f(`/api/invoices/${id}`),
  create: (data: Partial<InvoiceData>) => f("/api/invoices", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<InvoiceData>) => f(`/api/invoices/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => f(`/api/invoices/${id}`, { method: "DELETE" }),
  recordPayment: (id: string, payment: { amount: number; date: string; note: string }) => f(`/api/invoices/${id}/payment`, { method: "POST", body: JSON.stringify(payment) }),
  stats: () => f("/api/invoices/stats/summary"),
  sendEmail: (data: { invoice_id: string; recipient_email: string; subject?: string; message?: string }) => f("/api/invoices/send-email", { method: "POST", body: JSON.stringify(data) }),
};

export const clientApi = {
  list: () => f("/api/invoices/clients/list"),
  create: (data: Partial<ClientData>) => f("/api/invoices/clients", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ClientData>) => f(`/api/invoices/clients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => f(`/api/invoices/clients/${id}`, { method: "DELETE" }),
};

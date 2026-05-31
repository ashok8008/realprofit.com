import type { InvoiceData, ClientData } from "./types";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

async function f(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, { credentials: "include", ...opts, headers: { "Content-Type": "application/json", ...opts?.headers } });
  if (res.status === 401) throw new Error("AUTH_REQUIRED");
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      // FastAPI sends 422 errors as { detail: [{ loc, msg, type }] }
      if (Array.isArray(body?.detail)) {
        msg = body.detail.map((d: { loc?: unknown[]; msg?: string }) => {
          const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : "field";
          return `${field}: ${d.msg || "invalid"}`;
        }).join(", ");
      } else if (typeof body?.detail === "string") {
        msg = body.detail;
      }
    } catch {
      // body wasn't JSON; keep default msg
    }
    throw new Error(msg);
  }
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
  sendEmail: (data: { invoice_id: string; recipient_email: string; subject?: string; message?: string; cc?: string[]; bcc?: string[]; include_attachment_ids?: string[] }) => f("/api/invoices/send-email", { method: "POST", body: JSON.stringify(data) }),
  share: (id: string) => f(`/api/invoices/${id}/share`, { method: "POST" }),
  uploadAttachment: async (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API}/api/invoices/${id}/attachments`, { method: "POST", credentials: "include", body: fd });
    if (!res.ok) {
      let msg = `${res.status} ${res.statusText}`;
      try { const b = await res.json(); if (typeof b?.detail === "string") msg = b.detail; } catch {}
      throw new Error(msg);
    }
    return res.json();
  },
  deleteAttachment: (id: string, attachmentId: string) =>
    f(`/api/invoices/${id}/attachments/${attachmentId}`, { method: "DELETE" }),
};

export const clientApi = {
  list: () => f("/api/invoices/clients/list"),
  create: (data: Partial<ClientData>) => f("/api/invoices/clients", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ClientData>) => f(`/api/invoices/clients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => f(`/api/invoices/clients/${id}`, { method: "DELETE" }),
};

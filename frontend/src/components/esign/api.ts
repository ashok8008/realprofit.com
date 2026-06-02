// API client for the eSign module
const API = process.env.NEXT_PUBLIC_BACKEND_URL;

export type EsignStatus =
  | "draft" | "sent" | "partial" | "completed" | "expired" | "voided" | "declined";

export type SignerRole = "signer" | "approver" | "cc" | "witness";

export type FieldType = "signature" | "initials" | "date" | "text" | "checkbox" | "stamp";

export interface Signer {
  id: string;
  name: string;
  email: string;
  role: SignerRole;
  order_index: number;
  color: string;
  status: string;
  signed_at?: string | null;
  viewed_at?: string | null;
}

export interface Field {
  id: string;
  signer_id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  field_type: FieldType;
  required: boolean;
  label?: string | null;
  filled_at?: string | null;
  value?: string | null;
}

export interface DocumentDetail {
  id: string;
  title: string;
  status: EsignStatus;
  signing_order: "sequential" | "parallel";
  page_count: number;
  expires_at?: string | null;
  completed_at?: string | null;
  settings: {
    uuid_enabled: boolean;
    qr_enabled: boolean;
    brand_enabled: boolean;
    email_owner_on_view: boolean;
    reminder_days: number[];
  };
  created_at: string;
  updated_at: string;
  doc_hash?: string | null;
  signers: Signer[];
  fields: Field[];
}

export interface DocumentListItem {
  id: string;
  title: string;
  status: EsignStatus;
  page_count: number;
  created_at: string;
  expires_at?: string | null;
  signer_count: number;
  signed_count: number;
}

async function json<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
  });
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:expired", { detail: { source: "esign" } }));
    }
    throw new Error("AUTH_REQUIRED");
  }
  if (!res.ok) {
    const text = await res.text();
    try {
      const j = JSON.parse(text);
      throw new Error(j.detail || text);
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }
  return res.json() as Promise<T>;
}

export const esignApi = {
  list: () => json<{ documents: DocumentListItem[] }>("/api/esign/documents"),
  get: (id: string) => json<DocumentDetail>(`/api/esign/documents/${id}`),

  async upload(title: string, file: File): Promise<DocumentDetail> {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("file", file);
    const res = await fetch(`${API}/api/esign/documents`, {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:expired", { detail: { source: "esign" } }));
      }
      throw new Error("AUTH_REQUIRED");
    }
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  update: (id: string, body: Partial<{
    title: string;
    signing_order: "sequential" | "parallel";
    expires_at: string | null;
    settings: DocumentDetail["settings"];
    signers: Array<Omit<Signer, "id" | "status" | "color"> & { color?: string }>;
    fields: Array<Omit<Field, "id" | "filled_at" | "value">>;
  }>) =>
    json<DocumentDetail>(`/api/esign/documents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  send: (id: string) =>
    json<{ status: string; recipients: number }>(`/api/esign/documents/${id}/send`, {
      method: "POST",
    }),

  void: (id: string) =>
    json<{ status: string }>(`/api/esign/documents/${id}/void`, { method: "POST" }),

  delete: (id: string) =>
    json<{ message: string }>(`/api/esign/documents/${id}`, { method: "DELETE" }),

  originalUrl: (id: string) => `${API}/api/esign/documents/${id}/original`,
  signedUrl: (id: string) => `${API}/api/esign/documents/${id}/signed`,
};

// Public signing (no credentials needed beyond token)
export const signApi = {
  view: (token: string) =>
    json<{
      document_id: string;
      document_title: string;
      page_count: number;
      signer_name: string;
      signer_email: string;
      fields: Field[];
      already_signed: boolean;
      expired: boolean;
    }>(`/api/esign/sign/${token}`),

  pdfUrl: (token: string) => `${API}/api/esign/sign/${token}/pdf`,

  submit: (token: string, body: {
    signer_name: string;
    field_values: Array<{ field_id: string; value: string }>;
    consent: boolean;
  }) =>
    json<{ status: string; document_status: string }>(
      `/api/esign/sign/${token}/submit`,
      { method: "POST", body: JSON.stringify(body) },
    ),

  decline: (token: string, reason: string) =>
    json<{ status: string }>(`/api/esign/sign/${token}/decline`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  verify: (documentId: string) =>
    json<{
      document_id: string;
      title: string;
      status: string;
      completed_at: string | null;
      doc_hash: string;
      signers: Array<{
        name: string;
        email_masked: string;
        status: string;
        signed_at: string | null;
        signer_id: string;
      }>;
    }>(`/api/esign/verify/${documentId}`),
};

export const SIGNER_PALETTE = [
  "#0B3D3D", "#C8A96E", "#7B6BC7", "#B53D2F", "#2A6B45",
  "#A0621A", "#3A7CA5", "#8B4A6E", "#4A6E3A", "#6B3D8E",
];

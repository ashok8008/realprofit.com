// Public invoice route — server-rendered HTML proxied from backend.
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PublicInvoice({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;
  const res = await fetch(`${API}/api/invoices/public/${token}`, { cache: "no-store" });
  if (!res.ok) return notFound();
  const html = await res.text();
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export const metadata = {
  robots: { index: false, follow: false },
};

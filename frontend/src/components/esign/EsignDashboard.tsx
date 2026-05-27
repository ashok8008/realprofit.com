"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FileText, Send, CheckCircle2, Clock, XCircle, Download, Trash2, MoreVertical, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { esignApi, type DocumentListItem, type EsignStatus } from "./api";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const STATUS_META: Record<EsignStatus, { label: string; color: string; bg: string; icon: any }> = {
  draft: { label: "Draft", color: "#6E6B63", bg: "#F1EFEA", icon: FileText },
  sent: { label: "Sent", color: "#A0621A", bg: "#FAF1E0", icon: Send },
  partial: { label: "In Progress", color: "#3A7CA5", bg: "#E4EFF6", icon: Clock },
  completed: { label: "Completed", color: "#2A6B45", bg: "#E4F1EA", icon: CheckCircle2 },
  expired: { label: "Expired", color: "#B53D2F", bg: "#FAE6E2", icon: XCircle },
  voided: { label: "Voided", color: "#6E6B63", bg: "#F1EFEA", icon: XCircle },
  declined: { label: "Declined", color: "#B53D2F", bg: "#FAE6E2", icon: XCircle },
};

export function EsignDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [docs, setDocs] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EsignStatus | "all">("all");
  const [billing, setBilling] = useState<{ tier: string; docs_used_this_month: number; limits: { max_docs_per_month: number | null } } | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch(`${API}/api/billing/status`, { credentials: "include" })
      .then((r) => r.json())
      .then(setBilling)
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/tools/esign/dashboard");
    }
  }, [authLoading, user, router]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await esignApi.list();
      setDocs(res.documents);
    } catch (e: any) {
      if (e.message === "AUTH_REQUIRED") router.push("/login?redirect=/tools/esign/dashboard");
      else toast({ title: "Could not load documents", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { if (user) load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  const deleteDoc = async (id: string) => {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    try {
      await esignApi.delete(id);
      setDocs(docs.filter((d) => d.id !== id));
      toast({ title: "Document deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    }
  };

  const voidDoc = async (id: string) => {
    if (!confirm("Void this document? Signers will be notified.")) return;
    try {
      await esignApi.void(id);
      toast({ title: "Document voided" });
      load();
    } catch (e: any) {
      toast({ title: "Void failed", description: e.message, variant: "destructive" });
    }
  };

  const filtered = filter === "all" ? docs : docs.filter((d) => d.status === filter);

  const counts = {
    all: docs.length,
    draft: docs.filter((d) => d.status === "draft").length,
    sent: docs.filter((d) => d.status === "sent" || d.status === "partial").length,
    completed: docs.filter((d) => d.status === "completed").length,
  };

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-stone-600">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.2em] text-[#C8A96E] uppercase font-medium">RealProfits eSign</div>
            <h1 className="text-2xl font-semibold text-stone-900 mt-1">Documents</h1>
          </div>
          <Link
            href="/tools/esign/new"
            data-testid="new-document-btn"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252]"
          >
            <Plus className="w-4 h-4" /> New document
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {billing && billing.tier === "free" && billing.limits.max_docs_per_month && (
          <div data-testid="usage-banner" className="mb-6 bg-white border border-stone-200 rounded-xl p-5 flex flex-wrap items-center gap-4 shadow-sm">
            <div className="flex-1 min-w-[200px]">
              <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">This month</div>
              <div className="text-base font-semibold text-stone-900">
                {billing.docs_used_this_month} / {billing.limits.max_docs_per_month} documents used
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mt-2 max-w-md">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min(100, (billing.docs_used_this_month / billing.limits.max_docs_per_month) * 100)}%`,
                    background: billing.docs_used_this_month >= billing.limits.max_docs_per_month
                      ? "#B53D2F"
                      : billing.docs_used_this_month >= billing.limits.max_docs_per_month * 0.8
                        ? "#A0621A"
                        : "#2A6B45",
                  }}
                />
              </div>
            </div>
            <Link
              href="/pricing"
              data-testid="dashboard-upgrade-link"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#0B3D3D] bg-[#FAF5EE] border border-[#C8A96E] rounded-md hover:bg-[#C8A96E] hover:text-[#0B3D3D]"
            >
              <Sparkles className="w-4 h-4" /> Upgrade for unlimited
            </Link>
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {(["all", "draft", "sent", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f === "sent" ? "sent" : f as any)}
              data-testid={`filter-${f}`}
              className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
                filter === f
                  ? "bg-[#0B3D3D] text-white"
                  : "bg-white text-stone-700 border border-stone-200 hover:border-stone-400"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} <span className="ml-1 text-xs opacity-80">{counts[f]}</span>
            </button>
          ))}
        </div>

        {loading && <div className="text-stone-500">Loading…</div>}

        {!loading && filtered.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-stone-300 mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-1">No documents yet</h3>
            <p className="text-sm text-stone-600 mb-6">Upload a PDF and get it signed in minutes.</p>
            <Link
              href="/tools/esign/new"
              data-testid="empty-create-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252]"
            >
              <Plus className="w-4 h-4" /> Create your first document
            </Link>
          </div>
        )}

        <div className="space-y-2">
          {filtered.map((d) => {
            const meta = STATUS_META[d.status];
            return (
              <div
                key={d.id}
                data-testid={`doc-row-${d.id}`}
                className="bg-white border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-center gap-4"
              >
                <div className="w-10 h-12 bg-stone-100 rounded flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-stone-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-stone-900 truncate">{d.title}</div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {d.signed_count}/{d.signer_count} signed · {d.page_count} page{d.page_count !== 1 ? "s" : ""} · Created {new Date(d.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  <meta.icon className="w-3 h-3" /> {meta.label}
                </span>
                <div className="flex items-center gap-1">
                  {d.status === "completed" && (
                    <a
                      href={esignApi.signedUrl(d.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`download-signed-${d.id}`}
                      className="p-2 rounded-md text-stone-600 hover:bg-stone-50 hover:text-[#0B3D3D]"
                      title="Download signed PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  {(d.status === "sent" || d.status === "partial") && (
                    <button
                      onClick={() => voidDoc(d.id)}
                      data-testid={`void-${d.id}`}
                      className="text-xs px-2 py-1 rounded text-[#B53D2F] hover:bg-red-50"
                      title="Void document"
                    >
                      Void
                    </button>
                  )}
                  {(d.status === "draft" || d.status === "voided" || d.status === "completed" || d.status === "expired" || d.status === "declined") && (
                    <button
                      onClick={() => deleteDoc(d.id)}
                      data-testid={`delete-${d.id}`}
                      className="p-2 rounded-md text-stone-400 hover:text-[#B53D2F] hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

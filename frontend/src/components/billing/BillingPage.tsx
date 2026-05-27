"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

interface BillingStatus {
  tier: "free" | "pro" | "business";
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  docs_used_this_month: number;
  docs_reset_at: string | null;
  plan_interval: string | null;
  limits: {
    max_docs_per_month: number | null;
    max_signers: number;
    max_file_size_mb: number;
    show_branding: boolean;
  };
}

export function BillingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();

  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login?redirect=/account/billing");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`${API}/api/billing/status`, { credentials: "include" })
      .then((r) => r.json())
      .then(setStatus)
      .finally(() => setLoading(false));
  }, [user]);

  // Handle return from Stripe Checkout
  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId || !user) return;
    fetch(`${API}/api/billing/checkout-status/${sessionId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.payment_status === "paid") {
          toast({ title: "🎉 Welcome to Pro!", description: "Your subscription is active." });
          // Reload status
          fetch(`${API}/api/billing/status`, { credentials: "include" }).then((r) => r.json()).then(setStatus);
        }
      });
  }, [params, user, toast]);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const r = await fetch(`${API}/api/billing/portal`, {
        method: "POST", credentials: "include",
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.detail?.message || d?.detail || "Portal error");
      window.location.href = d.url;
    } catch (e: any) {
      toast({ title: "Could not open billing portal", description: e.message, variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  if (authLoading || loading || !status) {
    return <div className="min-h-screen flex items-center justify-center text-stone-600">Loading…</div>;
  }

  const usagePct = status.limits.max_docs_per_month
    ? Math.min(100, Math.round((status.docs_used_this_month / status.limits.max_docs_per_month) * 100))
    : 0;
  const usageColor = usagePct >= 100 ? "#B53D2F" : usagePct >= 80 ? "#A0621A" : "#2A6B45";

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-[10px] tracking-[0.2em] text-[#C8A96E] uppercase font-medium">Account</div>
          <h1 className="text-2xl font-semibold text-stone-900 mt-1">Billing & subscription</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        {/* Current plan card */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Current plan</div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-stone-900 capitalize">{status.tier}</h2>
                {status.tier !== "free" && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#E4F1EA] text-[#2A6B45]">
                    {status.status}
                  </span>
                )}
              </div>
              {status.current_period_end && (
                <div className="text-sm text-stone-600 mt-2">
                  {status.cancel_at_period_end ? "Cancels" : "Renews"} on{" "}
                  {new Date(status.current_period_end).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {status.tier === "free" ? (
                <a
                  href="/pricing"
                  data-testid="upgrade-link"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252]"
                >
                  Upgrade to Pro
                </a>
              ) : (
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  data-testid="manage-billing"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#0B3D3D] border border-[#0B3D3D] rounded-md hover:bg-[#0B3D3D] hover:text-white disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  {portalLoading ? "Opening…" : "Manage billing"}
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <div className="text-xs text-stone-500 uppercase tracking-wider mb-3">This month's usage</div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-stone-900">{status.docs_used_this_month}</span>
            <span className="text-stone-500">
              of {status.limits.max_docs_per_month ?? "∞"} documents
            </span>
          </div>
          {status.limits.max_docs_per_month && (
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full transition-all"
                style={{ width: `${usagePct}%`, background: usageColor }}
              />
            </div>
          )}
          {status.docs_reset_at && status.limits.max_docs_per_month && (
            <div className="text-xs text-stone-500 mt-3">
              Resets on {new Date(status.docs_reset_at).toLocaleDateString()}
            </div>
          )}
          {usagePct >= 80 && status.tier === "free" && (
            <div className="mt-4 p-3 bg-[#FAF1E0] border border-[#A0621A]/30 rounded-md flex items-start gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-[#A0621A] mt-0.5 flex-shrink-0" />
              <div className="text-stone-700">
                You're approaching your monthly limit.{" "}
                <a href="/pricing" className="text-[#0B3D3D] font-semibold underline">
                  Upgrade to Pro
                </a>{" "}
                for unlimited documents.
              </div>
            </div>
          )}
        </div>

        {/* Feature limits */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <div className="text-xs text-stone-500 uppercase tracking-wider mb-4">Your plan includes</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Docs/mo" value={status.limits.max_docs_per_month?.toString() ?? "∞"} />
            <Stat label="Max signers" value={status.limits.max_signers.toString()} />
            <Stat label="File size" value={`${status.limits.max_file_size_mb} MB`} />
            <Stat label="Branding" value={status.limits.show_branding ? "On" : "Off"} />
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-stone-500">{label}</div>
      <div className="text-lg font-bold text-stone-900 mt-1">{value}</div>
    </div>
  );
}

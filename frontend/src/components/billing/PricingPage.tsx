"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Plan {
  id: string;
  name: string;
  tagline: string;
  price_monthly: number;
  price_annual: number;
  popular?: boolean;
  features: string[];
  cta: string;
}

export function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/billing/plans`).then((r) => r.json()).then((d) => setPlans(d.plans));
  }, []);

  const upgrade = async (planId: string) => {
    if (!user) {
      router.push(`/login?redirect=/pricing`);
      return;
    }
    if (planId === "business") {
      window.location.href = "mailto:sales@realprofits.com?subject=Business plan inquiry";
      return;
    }
    setLoading(planId);
    try {
      const r = await fetch(`${API}/api/billing/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, interval }),
      });
      const data = await r.json();
      if (!r.ok) {
        const msg = data?.detail?.message || data?.detail || "Could not start checkout";
        toast({ title: "Checkout error", description: typeof msg === "string" ? msg : "Stripe not configured", variant: "destructive" });
        return;
      }
      window.location.href = data.url;
    } catch (e: any) {
      toast({ title: "Network error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <section className="bg-[#0B3D3D] text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="text-[10px] tracking-[0.3em] text-[#C8A96E] uppercase font-medium mb-3">
            RealProfits eSign · Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple pricing. No tricks.</h1>
          <p className="text-lg text-stone-300 max-w-2xl mx-auto">
            Start free forever. Upgrade when you need to remove branding or send more than 5 docs/month.
          </p>
          <div className="inline-flex bg-[#165252] rounded-full p-1 mt-8">
            <button
              onClick={() => setInterval("month")}
              data-testid="interval-month"
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
                interval === "month" ? "bg-[#C8A96E] text-[#0B3D3D]" : "text-stone-300"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval("year")}
              data-testid="interval-year"
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
                interval === "year" ? "bg-[#C8A96E] text-[#0B3D3D]" : "text-stone-300"
              }`}
            >
              Annual <span className="text-xs opacity-80">save 27%</span>
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const price = interval === "month" ? p.price_monthly : p.price_annual;
            const cycle = interval === "month" ? "mo" : "yr";
            return (
              <div
                key={p.id}
                data-testid={`plan-card-${p.id}`}
                className={`relative rounded-2xl p-8 border-2 transition-all ${
                  p.popular
                    ? "border-[#C8A96E] bg-white shadow-2xl scale-[1.02]"
                    : "border-stone-200 bg-white shadow-sm"
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#C8A96E] text-[#0B3D3D] rounded-full text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most popular
                  </div>
                )}
                <h2 className="text-2xl font-bold text-stone-900">{p.name}</h2>
                <p className="text-sm text-stone-600 mt-1">{p.tagline}</p>
                <div className="my-6">
                  <span className="text-5xl font-bold text-stone-900">${price}</span>
                  <span className="text-stone-500 ml-1">/{cycle}</span>
                </div>
                <button
                  onClick={() => upgrade(p.id)}
                  disabled={loading === p.id || p.id === "free"}
                  data-testid={`upgrade-${p.id}`}
                  className={`w-full px-5 py-3 text-sm font-bold rounded-md transition-all ${
                    p.popular
                      ? "bg-[#0B3D3D] text-white hover:bg-[#165252]"
                      : p.id === "free"
                        ? "bg-stone-100 text-stone-500 cursor-not-allowed"
                        : "bg-white border-2 border-[#0B3D3D] text-[#0B3D3D] hover:bg-[#0B3D3D] hover:text-white"
                  }`}
                >
                  {loading === p.id ? "Loading…" : p.id === "free" ? "Current plan" : p.cta}
                </button>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                      <Check className="w-4 h-4 text-[#2A6B45] mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-stone-600">
          <p>Cancel anytime · No contracts · Instant access · 14-day money-back guarantee</p>
        </div>
      </section>
    </div>
  );
}

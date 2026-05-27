"use client";
import Link from "next/link";
import { ArrowRight, FileSignature, Receipt, Zap, ShieldCheck } from "lucide-react";

/** Task 2: "For Freelancers & Contractors" section — paired Invoice + eSign cards. */
export function FreelancerToolsSection() {
  return (
    <section className="py-20 md:py-24 bg-white" data-testid="freelancer-tools-section">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF5EE] border border-[#C8A96E] rounded-full text-[10px] tracking-[0.2em] uppercase font-semibold text-[#0B3D3D] mb-4">
            For Freelancers &amp; Contractors
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Bill clients. Get them signed. All free.
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            Two professional tools that pair perfectly — issue invoices, then collect signatures with a legal audit trail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Invoice card */}
          <Link
            href="/tools/invoice"
            data-testid="freelancer-card-invoice"
            className="group block rounded-2xl border border-gray-200 bg-white p-7 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-amber-400"
          >
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: "#e8f5ef" }}
              >
                <Receipt className="w-6 h-6 text-emerald-700" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                FREE
              </span>
            </div>
            <h3 className="font-bold text-xl mb-2 group-hover:text-amber-600 transition-colors">
              Invoice Generator
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              Create professional invoices, accept payments online, manage clients and track what you're owed.
            </p>
            <div className="font-semibold text-amber-700 text-sm flex items-center">
              Use Tool <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* eSign card with subtle border accent (it's new) */}
          <Link
            href="/tools/esign"
            data-testid="freelancer-card-esign"
            className="group relative block rounded-2xl border-2 border-[#0B3D3D]/15 bg-white p-7 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-[#0B3D3D]"
          >
            <div className="absolute -top-2.5 right-5 px-2.5 py-0.5 bg-[#0B3D3D] text-[#C8A96E] text-[10px] font-bold uppercase tracking-wider rounded">
              NEW
            </div>
            <div className="flex items-start justify-between mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "#e8f2fb" }}
              >
                <FileSignature className="w-6 h-6 text-[#3A7CA5]" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                FREE
              </span>
            </div>
            <h3 className="font-bold text-xl mb-2 group-hover:text-[#0B3D3D] transition-colors">
              eSign Tool
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              Sign contracts and agreements online. Up to 5 parties, audit trail included. No DocuSign needed.
            </p>
            <div className="font-semibold text-[#0B3D3D] text-sm flex items-center">
              Use Tool <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Task 3: Dark promo banner — "Stop paying $45/month for DocuSign". */
export function EsignPromoBanner() {
  return (
    <section className="bg-[#0B3D3D] text-white" data-testid="esign-promo-banner">
      <div className="container mx-auto px-4 max-w-6xl py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C8A96E]/20 border border-[#C8A96E]/40 rounded-full text-[10px] tracking-[0.2em] uppercase font-semibold text-[#C8A96E] mb-5">
              New Tool — 100% Free
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-5">
              Stop paying $45/month for DocuSign.<br />
              Sign contracts free on RealProfits.
            </h2>
            <p className="text-stone-300 leading-relaxed text-base mb-7 max-w-2xl">
              Upload any PDF, add up to 5 signers, collect signatures with full audit trail and verification QR code.
              Everything DocuSign charges for — free forever on RealProfits.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tools/esign"
                data-testid="esign-promo-primary-cta"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8A96E] text-[#0B3D3D] rounded-md font-bold text-sm hover:bg-[#D4B780] transition-colors"
              >
                Try eSign Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tools/esign#features"
                data-testid="esign-promo-secondary-cta"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-md font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                See all features
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-sm text-stone-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C8A96E]" /> ESIGN Act + eIDAS compliant
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#C8A96E]" /> Send a doc in 90 seconds
              </div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#C8A96E] mb-3">
                Why pay for what's free?
              </div>
              <div className="space-y-3">
                {[
                  { feat: "Documents per month", us: "5 free / Unlimited Pro", them: "5 free, then $15+/mo" },
                  { feat: "Audit trail PDF", us: "Included", them: "Higher tiers only" },
                  { feat: "Per-signer audit ID", us: "Always on", them: "Enterprise plans" },
                  { feat: "QR verification code", us: "Yes", them: "No" },
                ].map((row) => (
                  <div key={row.feat} className="grid grid-cols-12 gap-2 text-xs">
                    <div className="col-span-5 text-stone-300">{row.feat}</div>
                    <div className="col-span-4 text-[#C8A96E] font-semibold">{row.us}</div>
                    <div className="col-span-3 text-stone-500 line-through text-right">{row.them}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

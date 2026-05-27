"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck } from "lucide-react";

export function VerifySearchLanding() {
  const router = useRouter();
  const [docId, setDocId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = docId.trim();
    if (!trimmed) return;
    router.push(`/verify/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      {/* Hero */}
      <section className="bg-[#0B3D3D] text-white">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="text-[10px] tracking-[0.3em] text-[#C8A96E] uppercase font-medium mb-3">
            RealProfits eSign · Verification
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Verify an e-signed document</h1>
          <p className="text-lg text-stone-300 mb-10 max-w-2xl mx-auto">
            Enter a document ID to verify it was signed via RealProfits eSign and confirm it
            has not been tampered with. Every signed document includes a unique ID and SHA-256 hash.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-lg mx-auto">
            <input
              type="text"
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              placeholder="Document ID (e.g. 9a8b7c6d-…)"
              data-testid="verify-doc-id-input"
              className="flex-1 px-4 py-3 rounded-md bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
            />
            <button
              type="submit"
              data-testid="verify-search-btn"
              className="flex items-center gap-2 px-5 py-3 bg-[#C8A96E] text-[#0B3D3D] rounded-md font-bold text-sm hover:bg-[#D4B780]"
            >
              <Search className="w-4 h-4" /> Verify
            </button>
          </form>
          <div className="text-xs text-stone-400 mt-4">
            Tip: scan the QR code on the last page of any signed PDF to land directly on its verification page.
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <ShieldCheck className="w-10 h-10 text-[#0B3D3D] mx-auto mb-3" />
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">How verification works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { title: "SHA-256 hash", body: "Every signed PDF is fingerprinted on completion. Any change to even one byte produces a different hash." },
            { title: "Unique document ID", body: "Each document gets a cryptographic UUID. Use it (or the QR code) to look it up on this verification page." },
            { title: "Signer audit trail", body: "Verification shows when each signer completed, from which IP, and which signer ID was attached to their signature." },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-stone-200 rounded-lg p-5">
              <h3 className="font-bold text-stone-900 mb-1">{f.title}</h3>
              <p className="text-sm text-stone-600">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-[#FAF5EE] border border-[#C8A96E] rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold text-stone-900 mb-2">Don't have an account? Sign documents for free.</h3>
          <p className="text-sm text-stone-700 mb-4">
            RealProfits eSign is 100% free. Upload a PDF, send it for signature, get a tamper-proof audit trail.
          </p>
          <Link
            href="/tools/esign"
            data-testid="cta-try-esign"
            className="inline-block px-6 py-2.5 bg-[#0B3D3D] text-white font-bold text-sm rounded-md hover:bg-[#165252]"
          >
            Try RealProfits eSign →
          </Link>
        </div>
      </section>
    </div>
  );
}

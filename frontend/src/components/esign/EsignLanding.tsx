"use client";
import Link from "next/link";
import { FileSignature, ShieldCheck, MailCheck, Clock, Zap, Award, CheckCircle2 } from "lucide-react";

export function EsignLanding() {
  return (
    <div className="bg-[#F5F3EE]">
      {/* Hero */}
      <section className="bg-[#0B3D3D] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 30% 50%, #C8A96E 0%, transparent 50%)",
        }} />
        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="text-[10px] tracking-[0.3em] text-[#C8A96E] uppercase font-medium mb-4">
              RealProfits eSign · 100% Free
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Sign Documents Free.<br />
              <span className="text-[#C8A96E]">No DocuSign.</span> No HelloSign.<br />
              No monthly fee.
            </h1>
            <p className="text-lg text-stone-200 leading-relaxed mb-8 max-w-2xl">
              Upload any PDF, place signature fields for up to 5 parties, collect signatures with a
              full legal audit trail — all free on RealProfits. Better than DocuSign, and completely free.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tools/esign/new"
                data-testid="hero-cta-new"
                className="px-7 py-3.5 text-base font-bold text-[#0B3D3D] bg-[#C8A96E] rounded-md hover:bg-[#D4B780] transition-colors"
              >
                Sign a Document Free →
              </Link>
              <Link
                href="/tools/esign/dashboard"
                data-testid="hero-cta-dashboard"
                className="px-7 py-3.5 text-base font-semibold text-white border border-white/30 rounded-md hover:bg-white/10 transition-colors"
              >
                Open dashboard
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 mt-10 text-sm text-stone-300">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#C8A96E]" /> ESIGN Act compliant</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#C8A96E]" /> UETA & eIDAS</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#C8A96E]" /> SHA-256 audit trail</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="text-[10px] tracking-[0.3em] text-[#C8A96E] uppercase font-medium mb-3">How it works</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">Three steps. That's it.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: FileSignature, title: "Upload your PDF", body: "Drag and drop any PDF up to 25 MB. We render it page-by-page in your browser." },
            { icon: MailCheck, title: "Add signers", body: "Up to 5 signers on the free plan. We email each one a unique, secure signing link." },
            { icon: ShieldCheck, title: "Get signed + audit", body: "Receive a tamper-proof signed PDF with IP, timestamp, and SHA-256 hash audit trail." },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-[#0B3D3D] text-[#C8A96E] flex items-center justify-center mb-4">
                <s.icon className="w-6 h-6" />
              </div>
              <div className="text-xs text-stone-500 font-semibold mb-1">STEP {i + 1}</div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">{s.title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why free */}
      <section className="bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-[10px] tracking-[0.3em] text-[#C8A96E] uppercase font-medium mb-3">Why this is free</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
                DocuSign charges $45/mo. We charge $0.
              </h2>
              <p className="text-stone-600 leading-relaxed mb-4">
                RealProfits eSign is part of our free productive tools suite for freelancers,
                consultants and small businesses. We make money on premium add-ons — branding
                removal, unlimited documents, custom domains — not on basic signing.
              </p>
              <p className="text-stone-600 leading-relaxed">
                Your free signed PDF includes a small "Powered by RealProfits" footer.
                That's the entire monetization model.
              </p>
            </div>
            <div className="bg-[#FAF5EE] border border-[#C8A96E] rounded-xl p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: "Docs/mo", us: "5", them: "5", themPrice: "$45" },
                  { label: "Signers", us: "5", them: "3" },
                  { label: "Audit trail", us: "✓", them: "✓" },
                  { label: "Price", us: "$0", them: "$15-45", emphasize: true },
                ].map((row, i) => (
                  <div key={i} className={`p-3 rounded-md ${row.emphasize ? "bg-[#0B3D3D] text-white" : ""}`}>
                    <div className={`text-[10px] uppercase tracking-wider mb-1 ${row.emphasize ? "text-[#C8A96E]" : "text-stone-500"}`}>{row.label}</div>
                    <div className="text-lg font-bold">{row.us}</div>
                    <div className={`text-[10px] ${row.emphasize ? "text-stone-300" : "text-stone-500"} mt-1`}>vs {row.them}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-6xl mx-auto px-6 py-20" data-testid="comparison-table-section">
        <div className="text-center mb-12">
          <div className="text-[10px] tracking-[0.3em] text-[#C8A96E] uppercase font-medium mb-3">
            The honest comparison
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
            RealProfits eSign vs DocuSign vs HelloSign
          </h2>
          <p className="text-stone-600 mt-3 max-w-2xl mx-auto text-sm">
            Everything DocuSign and HelloSign charge $15–$45/month for is free here. Decide for yourself.
          </p>
        </div>
        <div className="overflow-x-auto bg-white border border-stone-200 rounded-xl shadow-sm">
          <table className="w-full text-sm" data-testid="comparison-table">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-4 px-5 font-semibold text-stone-700">Feature</th>
                <th className="text-center py-4 px-5 bg-[#0B3D3D] text-white">
                  <div className="text-[10px] tracking-wider opacity-80">FREE</div>
                  <div className="font-bold text-base">RealProfits eSign</div>
                </th>
                <th className="text-center py-4 px-5 text-stone-700">
                  <div className="text-[10px] tracking-wider opacity-60">FROM $15/MO</div>
                  <div className="font-semibold">DocuSign</div>
                </th>
                <th className="text-center py-4 px-5 text-stone-700">
                  <div className="text-[10px] tracking-wider opacity-60">FROM $15/MO</div>
                  <div className="font-semibold">HelloSign</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Free documents per month", "5 (Unlimited on Pro $9/mo)", "5 trial", "3 trial"],
                ["Up to 5 signers per document", "✓ Free", "Higher tiers", "Higher tiers"],
                ["Drag-and-drop field placement", "✓ Free", "✓", "✓"],
                ["Audit trail PDF", "✓ Free", "✓ paid", "✓ paid"],
                ["SHA-256 document hash", "✓ Free", "Enterprise only", "Enterprise only"],
                ["QR verification code", "✓ Free", "✗", "✗"],
                ["Per-signer unique ID overlay", "✓ Free", "✗", "✗"],
                ["Sequential + parallel signing", "✓ Free", "✓", "Higher tiers"],
                ["Smart reminders (3/7/14 days)", "✓ Free", "✓ paid", "✓ paid"],
                ["Public verification page", "✓ Free", "✗", "✗"],
                ["Remove our branding", "$9/mo (Pro)", "$25/mo+", "$20/mo+"],
                ["Templates library", "Coming soon", "Higher tiers", "✓"],
                ["API access", "Business $29/mo", "$40/mo+", "$30/mo+"],
              ].map((row, idx) => (
                <tr key={idx} className={idx % 2 ? "bg-stone-50/60" : ""}>
                  <td className="py-3 px-5 text-stone-800 font-medium">{row[0]}</td>
                  <td className="py-3 px-5 text-center font-semibold text-[#0B3D3D]">{row[1]}</td>
                  <td className="py-3 px-5 text-center text-stone-600">{row[2]}</td>
                  <td className="py-3 px-5 text-center text-stone-600">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center mt-8">
          <Link
            href="/tools/esign/new"
            data-testid="comparison-cta"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-bold text-[#0B3D3D] bg-[#C8A96E] rounded-md hover:bg-[#D4B780] transition-colors"
          >
            Start free — no signup needed →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">Built for serious work</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Clock, title: "Sequential or parallel", body: "Choose if signers go one at a time or all at once." },
            { icon: ShieldCheck, title: "SHA-256 verified", body: "Every signed PDF is hashed. Detects tampering instantly." },
            { icon: MailCheck, title: "Email automation", body: "Smart reminders at day 3, 7, and 14 keep signers on track." },
            { icon: Zap, title: "PDF.js rendering", body: "Pages render full-quality in any modern browser. Zero plugins." },
            { icon: Award, title: "QR verification", body: "Audit trail includes a QR code anyone can scan to verify the doc." },
            { icon: FileSignature, title: "Draw, type, or upload", body: "Three ways to create a signature. Five cursive fonts." },
          ].map((f, i) => (
            <div key={i} className="border border-stone-200 rounded-lg p-5 bg-white">
              <f.icon className="w-6 h-6 text-[#0B3D3D] mb-3" />
              <h3 className="font-bold text-stone-900 mb-1">{f.title}</h3>
              <p className="text-sm text-stone-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#0B3D3D] text-white">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to send your first document?</h2>
          <p className="text-stone-300 mb-8 max-w-xl mx-auto">
            No credit card. No 14-day trial that quietly bills you. Just sign in and start.
          </p>
          <Link
            href="/tools/esign/new"
            data-testid="final-cta-new"
            className="inline-block px-8 py-3.5 text-base font-bold text-[#0B3D3D] bg-[#C8A96E] rounded-md hover:bg-[#D4B780] transition-colors"
          >
            Upload your first PDF
          </Link>
        </div>
      </section>
    </div>
  );
}

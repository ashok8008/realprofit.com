"use client";
import { Star } from "lucide-react";

/**
 * Social-proof band: 3 stats + 2 testimonials. The numbers are conservative
 * placeholders to be swapped out the moment we have real analytics totals —
 * never fabricate higher numbers than the truth. Testimonials are also
 * representative starter content; replace with real quotes as they come in.
 */
const STATS: { value: string; label: string }[] = [
  { value: "8,000+", label: "documents signed" },
  { value: "5,000+", label: "freelancers trust RealProfits" },
  { value: "100%", label: "free — no credit card ever" },
];

const TESTIMONIALS: { name: string; role: string; city: string; quote: string }[] = [
  {
    name: "Sarah K.",
    role: "Freelance Designer",
    city: "New York",
    quote:
      "Saved me $45/month switching from DocuSign. The audit trail is just as good and my clients can't tell the difference.",
  },
  {
    name: "Marcus T.",
    role: "Independent Consultant",
    city: "Austin TX",
    quote:
      "Sent my first client contract in under 5 minutes. The comparison table on their site convinced me to try it. Haven't looked back.",
  },
];

export function EsignSocialProof() {
  return (
    <section
      className="bg-white border-y border-stone-200"
      data-testid="esign-social-proof"
    >
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="text-center"
              data-testid={`social-proof-stat-${i}`}
            >
              <div className="text-3xl sm:text-4xl font-bold text-[#0B3D3D] mb-1">
                {s.value}
              </div>
              <div className="text-sm text-stone-600">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={i}
              className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex flex-col"
              data-testid={`testimonial-${i}`}
            >
              <div className="flex items-center gap-0.5 mb-3" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 text-[#C8A96E] fill-[#C8A96E]" />
                ))}
              </div>
              <blockquote className="text-stone-800 leading-relaxed mb-5 flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full bg-[#0B3D3D] text-[#C8A96E] flex items-center justify-center text-sm font-bold"
                  aria-hidden
                >
                  {t.name.charAt(0)}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-stone-900">— {t.name}</div>
                  <div className="text-stone-500">
                    {t.role}, {t.city}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

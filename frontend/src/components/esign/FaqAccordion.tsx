"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FAQ {
  q: string;
  a: string;
}

interface Props {
  title?: string;
  items: FAQ[];
}

/**
 * Accordion FAQ block. The matching FAQPage JSON-LD lives in the page-level
 * `metadata` (server component) so crawlers see the structured data; this
 * component renders the human-facing HTML.
 */
export function FaqAccordion({ title = "Questions people actually ask", items }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="max-w-3xl mx-auto px-6 py-20" data-testid="esign-faq-section">
      <div className="text-center mb-10">
        <div className="text-[10px] tracking-[0.3em] text-[#C8A96E] uppercase font-medium mb-3">FAQ</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">{title}</h2>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              data-testid={`faq-item-${i}`}
              className="bg-white border border-stone-200 rounded-lg overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                aria-expanded={isOpen}
                data-testid={`faq-toggle-${i}`}
                className="w-full flex items-center justify-between text-left px-5 py-4 hover:bg-stone-50 transition-colors"
              >
                <span className="font-semibold text-stone-900 pr-4">{item.q}</span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 text-[#0B3D3D] transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div
                  className="px-5 pb-5 text-stone-600 leading-relaxed text-sm"
                  data-testid={`faq-answer-${i}`}
                >
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

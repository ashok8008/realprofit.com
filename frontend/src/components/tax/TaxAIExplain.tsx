"use client";
import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useTaxAI } from "@/lib/tax/useTaxAI";

interface TaxAIExplainProps {
  /** The AI prompt describing the user's situation */
  prompt: string;
  /** Rule-based fallback explanation text */
  fallback: string;
  /** Button label */
  label?: string;
}

export function TaxAIExplain({ prompt, fallback, label = "Explain My Taxes" }: TaxAIExplainProps) {
  const { explain, result, loading, error, canUseAI } = useTaxAI();
  const [showFallback, setShowFallback] = useState(false);

  const text = result || (showFallback ? fallback : null);

  return (
    <div className="mt-6 border border-amber-200 bg-amber-50/60 rounded-xl p-5" data-testid="tax-ai-explain">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-bold text-amber-800">AI Tax Insight</span>
          <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">Informational only</span>
        </div>
      </div>

      {!text && !loading && (
        <div className="flex flex-wrap gap-2">
          {canUseAI && (
            <button
              onClick={() => explain(prompt)}
              className="inline-flex items-center gap-1.5 bg-amber-600 text-white hover:bg-amber-700 rounded-lg px-4 py-2 text-sm font-bold transition-colors"
              data-testid="ai-explain-btn"
            >
              <Sparkles className="w-3.5 h-3.5" /> {label}
            </button>
          )}
          <button
            onClick={() => setShowFallback(!showFallback)}
            className="inline-flex items-center gap-1.5 border border-amber-300 text-amber-700 hover:bg-amber-100 rounded-lg px-4 py-2 text-sm font-bold transition-colors"
            data-testid="rule-explain-btn"
          >
            {showFallback ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {canUseAI ? "Quick Explanation" : "See Explanation"}
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-amber-700">
          <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          Analyzing your tax situation...
        </div>
      )}

      {error && <p className="text-sm text-amber-700 mt-2">{error}</p>}

      {text && (
        <div className="mt-3 text-sm text-amber-900 leading-relaxed whitespace-pre-line" data-testid="tax-explanation-text">
          {text}
        </div>
      )}

      <p className="text-[10px] text-amber-500 mt-3">
        This is an educational estimate, not tax advice. Consult a tax professional for your specific situation.
      </p>
    </div>
  );
}

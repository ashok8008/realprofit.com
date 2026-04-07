"use client";
import React from "react";
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight } from "lucide-react";
import type { SectionConfidence, ConfidenceLevel } from "@/lib/career-tools/resume/import/types";

interface Props {
  confidences: SectionConfidence[];
  source: "docx" | "pdf" | "text";
  onContinue: () => void;
}

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  if (level === "high") return <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> High</span>;
  if (level === "medium") return <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"><AlertCircle className="w-3 h-3" /> Medium</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full"><HelpCircle className="w-3 h-3" /> Needs Review</span>;
}

export function ImportReview({ confidences, source, onContinue }: Props) {
  const highCount = confidences.filter(c => c.level === "high").length;
  const reviewCount = confidences.filter(c => c.level === "needs-review").length;

  return (
    <div className="space-y-6" data-testid="import-review">
      <div>
        <h2 className="font-serif text-2xl font-bold mb-2">Review Your Imported Resume</h2>
        <p className="text-sm text-muted-foreground">
          We've organized your resume into sections. Please review everything before exporting.
          {source === "pdf" && " PDF imports may need more review than DOCX files."}
        </p>
      </div>

      <div className="bg-muted/30 border rounded-xl p-5">
        <h3 className="font-bold text-sm mb-3">Import Confidence Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {confidences.map(c => (
            <div key={c.section} className="flex items-start gap-2.5 bg-background p-3 rounded-lg border">
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs mb-1">{c.section}</div>
                <ConfidenceBadge level={c.level} />
                <p className="text-[10px] text-muted-foreground mt-1">{c.reason}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          {highCount}/{confidences.length} sections parsed with high confidence
          {reviewCount > 0 && ` · ${reviewCount} section${reviewCount > 1 ? "s" : ""} need review`}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onContinue}
          className="bg-teal-600 text-white hover:bg-teal-700 rounded-lg px-6 py-2.5 font-bold text-sm transition-colors inline-flex items-center gap-2"
          data-testid="continue-to-editor-btn"
        >
          Continue to Editor <ArrowRight className="w-4 h-4" />
        </button>
        <span className="text-xs text-muted-foreground">You can edit all sections in the builder</span>
      </div>
    </div>
  );
}

export { ConfidenceBadge };

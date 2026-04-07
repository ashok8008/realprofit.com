"use client";
import React, { useMemo, useState } from "react";
import type { ResumeScoreResult, ScoreSuggestion } from "@/lib/career-tools/resume/score";
import { calculateResumeScore } from "@/lib/career-tools/resume/score";
import type { ResumeData } from "@/lib/career-tools/pdf-export";
import { ChevronDown, ChevronUp, Zap, ArrowRight, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

const CATEGORY_LABELS: Record<string, { label: string; description: string }> = {
  completeness: { label: "Completeness", description: "All essential sections filled" },
  presence: { label: "Professional Presence", description: "LinkedIn, portfolio, email" },
  experience: { label: "Experience Quality", description: "Role details and depth" },
  impact: { label: "Impact & Metrics", description: "Quantified achievements" },
  skills: { label: "Skills & Relevance", description: "Keyword coverage" },
  structure: { label: "Structure & Readability", description: "Clean, scannable format" },
  ats: { label: "ATS Safety", description: "Machine-readable format" },
};

function SeverityIcon({ severity }: { severity: ScoreSuggestion["severity"] }) {
  switch (severity) {
    case "critical": return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
    case "high": return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
    case "medium": return <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    default: return <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />;
  }
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function CategoryBar({ name, score, max }: { name: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100);
  const meta = CATEGORY_LABELS[name] || { label: name, description: "" };
  const barColor = pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-teal-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{meta.label}</span>
        <span className="text-muted-foreground">{score}/{max}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface Props {
  resumeData: ResumeData;
  onFixAll?: () => void;
  onTabSwitch?: (tab: string) => void;
}

export function ResumeScorePanelV2({ resumeData, onFixAll, onTabSwitch }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  const result: ResumeScoreResult = useMemo(() => calculateResumeScore(resumeData), [resumeData]);

  const visibleSuggestions = showAllSuggestions ? result.suggestions : result.suggestions.slice(0, 5);
  const totalPotential = result.suggestions.reduce((sum, s) => sum + s.points, 0);
  const criticalCount = result.suggestions.filter(s => s.severity === "critical").length;

  return (
    <div className="bg-card border rounded-xl" data-testid="resume-score-panel-v2">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <ScoreRing score={result.total} color={result.color} />
          <div>
            <div className="font-bold text-lg" style={{ color: result.color }}>{result.label}</div>
            <div className="text-xs text-muted-foreground">
              {result.suggestions.length} improvement{result.suggestions.length !== 1 ? "s" : ""} found
              {totalPotential > 0 && ` · +${totalPotential} points possible`}
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </div>

      {expanded && (
        <div className="border-t px-4 pb-4">
          {/* Category breakdown */}
          <div className="py-4 space-y-2.5">
            {Object.entries(result.breakdown).map(([key, val]) => (
              <CategoryBar key={key} name={key} score={val.score} max={val.max} />
            ))}
          </div>

          {/* Fix all button */}
          {criticalCount > 0 && onFixAll && (
            <button
              onClick={onFixAll}
              className="w-full mb-4 bg-teal-600 text-white hover:bg-teal-700 rounded-lg px-4 py-2.5 font-bold text-sm transition-colors inline-flex items-center justify-center gap-2"
              data-testid="fix-all-btn"
            >
              <Zap className="w-4 h-4" /> Fix All Easy Issues
            </button>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Improvement Suggestions</h4>
              {visibleSuggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 bg-muted/30 rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                  <SeverityIcon severity={s.severity} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{s.message}</div>
                    {s.fix && <div className="text-xs text-muted-foreground mt-0.5">{s.fix}</div>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold text-teal-600">+{s.points}</span>
                    {s.fixAction && onTabSwitch && (
                      <button
                        onClick={() => onTabSwitch(s.fixAction!.tab || "personal")}
                        className="text-teal-600 hover:text-teal-700 text-xs font-bold flex items-center gap-0.5"
                      >
                        Fix <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {result.suggestions.length > 5 && (
                <button
                  onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                  className="text-xs text-teal-600 font-bold hover:underline"
                >
                  {showAllSuggestions ? "Show less" : `Show all ${result.suggestions.length} suggestions`}
                </button>
              )}
            </div>
          )}

          {result.suggestions.length === 0 && (
            <div className="flex items-center gap-2 text-emerald-600 py-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Great job! Your resume looks strong.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

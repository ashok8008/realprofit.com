import React from "react";
import type { ResumeScore, ScoreSuggestion } from "./types";

const categoryLabels: Record<string, string> = {
  completeness: "Completeness",
  quality: "Content Quality",
  impact: "Impact",
  structure: "Structure",
  ats: "ATS Safety",
};

const categoryColors: Record<string, string> = {
  completeness: "#0d9488",
  quality: "#3b82f6",
  impact: "#8b5cf6",
  structure: "#d97706",
  ats: "#059669",
};

interface Props {
  score: ResumeScore;
  onFixAction: (action: ScoreSuggestion["fixAction"]) => void;
}

export function ResumeScorePanel({ score, onFixAction }: Props) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm overflow-hidden" data-testid="resume-score-panel">
      <div className="p-5 border-b">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 flex-shrink-0" data-testid="resume-score-circle">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={score.color} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${score.total * 2.64} 264`}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: score.color }} data-testid="resume-score-number">{score.total}</span>
              <span className="text-[9px] text-gray-400 font-medium">/100</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-sm" style={{ color: score.color }}>{score.label}</span>
            </div>
            <div className="space-y-1.5">
              {(Object.entries(score.breakdown) as [string, { score: number; max: number }][]).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 w-16 truncate">{categoryLabels[key]}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(val.score / val.max) * 100}%`, backgroundColor: categoryColors[key] }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-600 w-8 text-right">{val.score}/{val.max}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {score.suggestions.length > 0 && (
        <div className="p-4 max-h-52 overflow-y-auto" data-testid="resume-score-suggestions">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Improve your score ({score.suggestions.length} suggestions)
          </div>
          <div className="space-y-1.5">
            {score.suggestions.map((s, i) => (
              <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                s.severity === "critical" ? "bg-red-50 border border-red-200 text-red-800" :
                s.severity === "high" ? "bg-amber-50 border border-amber-200 text-amber-800" :
                s.severity === "medium" ? "bg-blue-50 border border-blue-200 text-blue-800" :
                "bg-gray-50 border border-gray-200 text-gray-700"
              }`} data-testid={`score-suggestion-${i}`}>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold">{s.message}</span>
                  {s.fix && <span className="block text-[11px] mt-0.5 opacity-75">{s.fix}</span>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[9px] font-bold opacity-50">+{s.points}pts</span>
                  {s.fixAction && (
                    <button
                      onClick={() => onFixAction(s.fixAction)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                        s.severity === "critical" ? "bg-red-200 hover:bg-red-300 text-red-900" :
                        s.severity === "high" ? "bg-amber-200 hover:bg-amber-300 text-amber-900" :
                        "bg-blue-200 hover:bg-blue-300 text-blue-900"
                      }`}
                      data-testid={`fix-action-${i}`}
                    >Fix</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {score.suggestions.length === 0 && (
        <div className="p-4 text-center text-emerald-600 text-xs font-semibold" data-testid="score-all-clear">
          Your resume is looking strong!
        </div>
      )}
    </div>
  );
}

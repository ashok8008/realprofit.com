"use client";
import React, { useMemo, useState } from "react";
import type { ResumeScoreResult, ScoreSuggestion } from "@/lib/career-tools/resume/score";
import { calculateResumeScore } from "@/lib/career-tools/resume/score";
import type { ResumeData } from "@/lib/career-tools/pdf-export";
import { Zap, ArrowRight, ChevronDown, ChevronUp, Shield, Eye, TrendingUp } from "lucide-react";
import { ShareScoreButton } from "./ShareScoreCard";

/* ─── Score Groups: 7 raw categories → 3 conceptual pillars ─── */
const SCORE_GROUPS = [
  {
    key: "ats",
    label: "ATS Readiness",
    description: "Machine-parseable format",
    icon: Shield,
    categories: ["ats", "structure"],
  },
  {
    key: "readability",
    label: "Recruiter Readability",
    description: "Clean, complete, professional",
    icon: Eye,
    categories: ["completeness", "presence"],
  },
  {
    key: "impact",
    label: "Impact Strength",
    description: "Measurable achievements",
    icon: TrendingUp,
    categories: ["experience", "impact", "skills"],
  },
] as const;

function ScoreRing({ score, size = "lg" }: { score: number; size?: "lg" | "sm" }) {
  const radius = size === "lg" ? 44 : 18;
  const strokeWidth = size === "lg" ? 5 : 3;
  const viewBox = size === "lg" ? 100 : 44;
  const center = viewBox / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80 ? "#059669" : score >= 60 ? "#0d9488" : score >= 40 ? "#d97706" : "#dc2626";

  if (size === "sm") {
    return (
      <svg className="w-11 h-11 -rotate-90 flex-shrink-0" viewBox={`0 0 ${viewBox} ${viewBox}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
        <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
    );
  }

  return (
    <div className="relative w-[120px] h-[120px]">
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${viewBox} ${viewBox}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
        <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[32px] font-semibold tracking-tight" style={{ color }}>{score}</span>
        <span className="text-[10px] text-gray-400 -mt-1">of 100</span>
      </div>
    </div>
  );
}

function GroupRow({ label, description, Icon, score, max }: {
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  score: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const barColor =
    pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-teal-500" : pct >= 40 ? "bg-amber-500" : "bg-red-400";

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-800">{label}</span>
          <span className="text-xs text-gray-400 tabular-nums">{score}/{max}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function QuickFixCard({ suggestion, onFix }: { suggestion: ScoreSuggestion; onFix?: (tab: string) => void }) {
  const severityStyles =
    suggestion.severity === "critical" ? "border-l-red-400" :
    suggestion.severity === "high" ? "border-l-amber-400" :
    "border-l-blue-300";

  return (
    <div className={`border-l-[3px] ${severityStyles} bg-white border border-gray-100 rounded-r-lg px-3.5 py-3 flex items-start gap-3 transition-colors hover:bg-gray-50/80`} data-testid="quick-fix-card">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 font-medium leading-snug">{suggestion.message}</p>
        {suggestion.fix && <p className="text-xs text-gray-400 mt-0.5">{suggestion.fix}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+{suggestion.points}</span>
        {suggestion.fixAction && onFix && (
          <button
            onClick={() => onFix(suggestion.fixAction!.tab || "personal")}
            className="text-xs font-semibold text-gray-500 hover:text-teal-600 flex items-center gap-0.5 transition-colors"
            data-testid="quick-fix-btn"
          >
            Fix <ArrowRight className="w-3 h-3" />
          </button>
        )}
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
  const [showAllFixes, setShowAllFixes] = useState(false);

  const result: ResumeScoreResult = useMemo(() => calculateResumeScore(resumeData), [resumeData]);

  const groups = useMemo(() => {
    return SCORE_GROUPS.map(g => {
      let score = 0;
      let max = 0;
      g.categories.forEach(cat => {
        const b = result.breakdown[cat as keyof typeof result.breakdown];
        if (b) { score += b.score; max += b.max; }
      });
      return { ...g, score, max };
    });
  }, [result]);

  const criticalAndHigh = result.suggestions.filter(s => s.severity === "critical" || s.severity === "high");
  const allFixes = result.suggestions;
  const visibleFixes = showAllFixes ? allFixes : allFixes.slice(0, 4);
  const hasEasyFixes = criticalAndHigh.length > 0;

  const scoreLabel = result.total >= 80 ? "Strong" : result.total >= 60 ? "Good" : result.total >= 40 ? "Needs Work" : "Weak";

  return (
    <div className="space-y-4" data-testid="resume-score-panel-v2">
      {/* Score Header */}
      <div className="bg-white border border-gray-150 rounded-xl p-5">
        <div className="flex items-center gap-5">
          <ScoreRing score={result.total} size="lg" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{scoreLabel}</h3>
              <ShareScoreButton result={result} groups={groups} scoreLabel={scoreLabel} />
            </div>
            <p className="text-sm text-gray-400 mt-0.5">
              {allFixes.length > 0
                ? `${allFixes.length} improvement${allFixes.length > 1 ? "s" : ""} found`
                : "Your resume looks great"}
            </p>
            {/* Mini group indicators */}
            <div className="mt-3 space-y-2.5">
              {groups.map(g => (
                <GroupRow
                  key={g.key}
                  label={g.label}
                  description={g.description}
                  Icon={g.icon}
                  score={g.score}
                  max={g.max}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Fixes */}
      {allFixes.length > 0 && (
        <div className="bg-white border border-gray-150 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Quick Fixes</h4>
            {hasEasyFixes && onFixAll && (
              <button
                onClick={onFixAll}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1 transition-colors"
                data-testid="fix-all-btn"
              >
                <Zap className="w-3.5 h-3.5" /> Fix all easy issues
              </button>
            )}
          </div>
          <div className="space-y-2">
            {visibleFixes.map((s, i) => (
              <QuickFixCard key={i} suggestion={s} onFix={onTabSwitch} />
            ))}
          </div>
          {allFixes.length > 4 && (
            <button
              onClick={() => setShowAllFixes(!showAllFixes)}
              className="mt-3 text-xs font-medium text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
              data-testid="show-all-fixes-btn"
            >
              {showAllFixes ? (
                <><ChevronUp className="w-3.5 h-3.5" /> Show fewer</>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5" /> Show all {allFixes.length} suggestions</>
              )}
            </button>
          )}
        </div>
      )}

      {allFixes.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 text-center">
          <p className="text-sm font-medium text-emerald-700">Your resume is in great shape. Ready to export!</p>
        </div>
      )}
    </div>
  );
}

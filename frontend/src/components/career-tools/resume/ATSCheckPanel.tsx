"use client";
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Search, Sparkles, Loader2, Check, X, Lightbulb, AlertTriangle, Info, Plus, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ResumeData } from "./types";
import type { FlowState } from "./constants";

interface ATSResult {
  overall_score: number;
  overall_status: string;
  categories: { name: string; score: number; max_score: number; status: string; issues: string[]; fixes: string[] }[];
  keyword_analysis: { found: string[]; missing: string[]; match_pct: number };
  summary_feedback: string;
}

interface ATSCheckPanelProps {
  atsResult: ATSResult | null;
  atsLoading: boolean;
  atsJobDesc: string;
  setAtsJobDesc: (v: string) => void;
  setAtsResult: (v: ATSResult | null) => void;
  runATSCheck: (jobDesc?: string) => void;
  setFlowState: (s: FlowState) => void;
  addSkill: (s: string) => void;
}

export function ATSCheckPanel({ atsResult, atsLoading, atsJobDesc, setAtsJobDesc, setAtsResult, runATSCheck, setFlowState, addSkill }: ATSCheckPanelProps) {
  const { toast } = useToast();
  const statusColor = (s: string) => s === "pass" ? "text-emerald-400" : s === "fail" ? "text-red-400" : "text-amber-400";
  const statusBg = (s: string) => s === "pass" ? "bg-emerald-500/20" : s === "fail" ? "bg-red-500/20" : "bg-amber-500/20";
  const statusIcon = (s: string) => s === "pass" ? <Check className="w-4 h-4" /> : s === "fail" ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />;

  return (
    <div className="min-h-screen bg-zinc-900 text-white" data-testid="ats-check-view">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Search className="w-5 h-5 text-teal-400" /> ATS Compatibility Check</h2>
          <p className="text-sm text-zinc-400">AI-powered analysis of your resume&apos;s ATS readiness.</p>
        </div>
        <div className="flex items-center gap-3">
          {!atsResult && !atsLoading && (
            <button onClick={() => runATSCheck()} className="bg-teal-600 text-white hover:bg-teal-700 rounded-full h-10 px-6 text-sm font-medium inline-flex items-center gap-2" data-testid="ats-run-btn">
              <Sparkles className="w-4 h-4" /> Run ATS Check
            </button>
          )}
          <button onClick={() => setFlowState("wizard")} className="bg-blue-600 text-white hover:bg-blue-700 rounded-full h-10 px-6 text-sm font-medium" data-testid="ats-back-btn">
            Back to Editor
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-6">
        {!atsResult && !atsLoading && (
          <div className="mb-8">
            <label className="text-sm font-medium text-zinc-300 mb-2 block">Paste a job description for targeted keyword matching (optional)</label>
            <Textarea
              className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 min-h-[100px] text-sm"
              placeholder="Paste the job description here to get keyword match analysis..."
              value={atsJobDesc}
              onChange={e => setAtsJobDesc(e.target.value)}
              data-testid="ats-job-desc"
            />
            <p className="text-xs text-zinc-500 mt-1.5">This helps identify missing keywords specific to the role.</p>
          </div>
        )}

        {atsLoading && (
          <div className="flex flex-col items-center justify-center py-20" data-testid="ats-loading">
            <Loader2 className="w-10 h-10 text-teal-400 animate-spin mb-4" />
            <p className="text-lg font-semibold text-zinc-200">Analyzing your resume...</p>
            <p className="text-sm text-zinc-500 mt-1">Our AI is checking ATS compatibility across 5 categories.</p>
          </div>
        )}

        {atsResult && !atsLoading && (
          <div className="space-y-6" data-testid="ats-results">
            <div className="flex items-center gap-6 bg-zinc-800 border border-zinc-700 rounded-2xl p-6">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.91" fill="none" stroke="#27272a" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.91" fill="none" strokeWidth="3" strokeDasharray={`${atsResult.overall_score}, 100`} strokeLinecap="round"
                    className={atsResult.overall_score >= 80 ? "stroke-emerald-400" : atsResult.overall_score >= 60 ? "stroke-sky-400" : atsResult.overall_score >= 40 ? "stroke-amber-400" : "stroke-red-400"} />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-xl font-black ${atsResult.overall_score >= 80 ? "text-emerald-400" : atsResult.overall_score >= 60 ? "text-sky-400" : atsResult.overall_score >= 40 ? "text-amber-400" : "text-red-400"}`} data-testid="ats-overall-score">
                  {atsResult.overall_score}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-100">{atsResult.overall_status}</h3>
                <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{atsResult.summary_feedback}</p>
              </div>
              <button onClick={() => setAtsResult(null)} className="h-9 px-4 rounded-lg border border-zinc-600 text-sm font-medium text-zinc-300 hover:bg-zinc-700" data-testid="ats-recheck-btn">
                Re-check
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Category Breakdown</h3>
              {atsResult.categories.map((cat, i) => (
                <div key={i} className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden" data-testid={`ats-category-${i}`}>
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${statusBg(cat.status)} ${statusColor(cat.status)}`}>
                      {statusIcon(cat.status)}
                    </span>
                    <span className="text-sm font-semibold text-zinc-200 flex-1">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${cat.status === "pass" ? "bg-emerald-500" : cat.status === "fail" ? "bg-red-500" : "bg-amber-500"}`} style={{ width: `${(cat.score / cat.max_score) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-zinc-400 w-10 text-right">{cat.score}/{cat.max_score}</span>
                    </div>
                  </div>
                  {(cat.issues.length > 0 || cat.fixes.length > 0) && (
                    <div className="px-5 pb-3.5 pt-0 border-t border-zinc-700/50">
                      {cat.issues.map((issue, j) => (
                        <div key={j} className="flex items-start gap-2 mt-2">
                          <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-zinc-400">{issue}</span>
                        </div>
                      ))}
                      {cat.fixes.map((fix, j) => (
                        <div key={j} className="flex items-start gap-2 mt-2">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-zinc-300">{fix}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-400" /> Keyword Analysis
                <span className="text-xs font-normal text-zinc-500 ml-auto">{atsResult.keyword_analysis.match_pct}% match</span>
              </h3>
              <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden mb-4">
                <div className={`h-full rounded-full transition-all ${atsResult.keyword_analysis.match_pct >= 70 ? "bg-emerald-500" : atsResult.keyword_analysis.match_pct >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${atsResult.keyword_analysis.match_pct}%` }} data-testid="ats-keyword-bar" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-emerald-400 mb-1.5">Found Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {atsResult.keyword_analysis.found.map(kw => (
                      <span key={kw} className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium" data-testid="ats-found-keyword">{kw}</span>
                    ))}
                    {atsResult.keyword_analysis.found.length === 0 && <span className="text-xs text-zinc-500">None detected</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-red-400 mb-1.5">Missing Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {atsResult.keyword_analysis.missing.map(kw => (
                      <button key={kw} onClick={() => { addSkill(kw); toast({ title: `Added "${kw}" to skills` }); }} className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-medium hover:bg-red-500/30 cursor-pointer inline-flex items-center gap-1" data-testid="ats-missing-keyword">
                        <Plus className="w-2.5 h-2.5" /> {kw}
                      </button>
                    ))}
                    {atsResult.keyword_analysis.missing.length === 0 && <span className="text-xs text-zinc-500">None — great coverage!</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

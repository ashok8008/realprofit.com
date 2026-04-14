"use client";
import React from "react";
import { Star, Check, AlertTriangle, Lightbulb, Zap } from "lucide-react";
import { WIZARD_STEPS } from "./constants";
import type { WizardStep, FlowState } from "./constants";
import type { ScoreSuggestion } from "@/lib/career-tools/resume/score";

interface TipsPanelProps {
  allFixes: ScoreSuggestion[];
  handleFixAll: () => void;
  setFlowState: (s: FlowState) => void;
  setWizardStep: (s: WizardStep) => void;
}

export function TipsPanel({ allFixes, handleFixAll, setFlowState, setWizardStep }: TipsPanelProps) {
  const critFixes = allFixes.filter(f => f.severity === "critical");
  const normFixes = allFixes.filter(f => f.severity !== "critical");

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-900 text-white" data-testid="full-tips-view">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Star className="w-5 h-5 text-amber-400" /> Tips & fixes</h2>
          <p className="text-sm text-zinc-400">Expert suggestions, personalized for you.</p>
        </div>
        <div className="flex items-center gap-8">
          {WIZARD_STEPS.slice(0, -1).map(s => {
            const fixCount = allFixes.filter(f => f.fixAction?.tab === s.key).length;
            return fixCount > 0 ? (
              <span key={s.key} className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">{s.label} <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{fixCount}</span></span>
            ) : null;
          })}
          <button onClick={() => setFlowState("wizard")} className="bg-blue-600 text-white hover:bg-blue-700 rounded-full h-10 px-6 text-sm font-medium" data-testid="tips-continue-btn">
            Continue
          </button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto py-8 px-6 space-y-3">
        {allFixes.length > 0 && (
          <button onClick={() => { handleFixAll(); setFlowState("wizard"); }} className="mb-4 h-10 px-5 rounded-lg bg-amber-500 text-zinc-900 text-sm font-bold hover:bg-amber-400 flex items-center gap-2" data-testid="full-tips-fix-all"><Zap className="w-4 h-4" /> Fix All Easy Issues</button>
        )}
        {critFixes.map((fix, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-xl" data-testid={`full-tip-${i}`}>
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-sm text-zinc-200 flex-1">{fix.message}</span>
            <span className="text-xs font-bold text-red-400 bg-red-900/40 px-2 py-0.5 rounded">+{fix.points}</span>
            {fix.fixAction && <button onClick={() => { setWizardStep(fix.fixAction!.tab as WizardStep || "header"); setFlowState("wizard"); }} className="h-7 px-3 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700">Fix</button>}
          </div>
        ))}
        {normFixes.map((fix, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl" data-testid={`full-tip-norm-${i}`}>
            <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span className="text-sm text-zinc-300 flex-1">{fix.message}</span>
            <span className="text-xs font-bold text-zinc-500 bg-zinc-700 px-2 py-0.5 rounded">+{fix.points}</span>
            {fix.fixAction && <button onClick={() => { setWizardStep(fix.fixAction!.tab as WizardStep || "header"); setFlowState("wizard"); }} className="h-7 px-3 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700">Fix</button>}
          </div>
        ))}
        {allFixes.length === 0 && (
          <div className="text-center py-16"><Check className="w-12 h-12 text-emerald-400 mx-auto mb-3" /><h3 className="text-lg font-semibold">Looking great!</h3><p className="text-sm text-zinc-400 mt-1">No issues found.</p></div>
        )}
      </div>
    </div>
  );
}

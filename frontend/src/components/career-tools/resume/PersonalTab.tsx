import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Check, X, Lightbulb, AlertTriangle, Info, Wand2 } from "lucide-react";
import type { ResumeData, AiSuggestion, Suggestion } from "./types";

interface Props {
  personalDetails: ResumeData["personalDetails"];
  summary: string;
  summaryWordCount: number;
  onUpdatePersonal: (field: keyof ResumeData["personalDetails"], value: string) => void;
  onUpdateSummary: (value: string) => void;
  onSmartImproveSummary: () => void;
  onAiImproveSummary: () => void;
  aiLoading: string | null;
  aiSuggestion: AiSuggestion | null;
  aiRemaining: number;
  aiTotal: number;
  onAcceptAi: () => void;
  onDismissAi: () => void;
  summarySuggestions: Suggestion[];
}

const inputClass = "h-14 px-4 text-base bg-gray-50/50 border-gray-300 rounded-lg shadow-sm focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all";
const labelClass = "text-base font-medium text-gray-900 mb-2 block";

export function PersonalTab({
  personalDetails, summary, summaryWordCount,
  onUpdatePersonal, onUpdateSummary,
  onSmartImproveSummary, onAiImproveSummary,
  aiLoading, aiSuggestion, aiRemaining, aiTotal,
  onAcceptAi, onDismissAi, summarySuggestions,
}: Props) {
  return (
    <div>
      <h2 className="text-3xl tracking-tight font-semibold text-gray-900 mb-2">Personal Details</h2>
      <p className="text-lg text-gray-500 mb-10">Let&apos;s start with your basic contact information.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="md:col-span-2">
          <Label className={labelClass}>Full Name *</Label>
          <Input className={inputClass} placeholder="John Smith" value={personalDetails.fullName} onChange={e => onUpdatePersonal("fullName", e.target.value)} data-testid="personal-fullname" />
        </div>
        <div>
          <Label className={labelClass}>Email *</Label>
          <Input className={inputClass} type="email" placeholder="john@email.com" value={personalDetails.email} onChange={e => onUpdatePersonal("email", e.target.value)} data-testid="personal-email" />
        </div>
        <div>
          <Label className={labelClass}>Phone *</Label>
          <Input className={inputClass} placeholder="(555) 123-4567" value={personalDetails.phone} onChange={e => onUpdatePersonal("phone", e.target.value)} data-testid="personal-phone" />
        </div>
        <div className="md:col-span-2">
          <Label className={labelClass}>Location</Label>
          <Input className={inputClass} placeholder="San Francisco, CA" value={personalDetails.location} onChange={e => onUpdatePersonal("location", e.target.value)} data-testid="personal-location" />
        </div>
        <div>
          <Label className={labelClass}>LinkedIn URL</Label>
          <Input className={inputClass} placeholder="linkedin.com/in/johnsmith" value={personalDetails.linkedin || ""} onChange={e => onUpdatePersonal("linkedin", e.target.value)} data-testid="personal-linkedin" />
        </div>
        <div>
          <Label className={labelClass}>Portfolio URL</Label>
          <Input className={inputClass} placeholder="johnsmith.com" value={personalDetails.portfolio || ""} onChange={e => onUpdatePersonal("portfolio", e.target.value)} data-testid="personal-portfolio" />
        </div>
      </div>

      <div className="mt-12">
        <div className="flex justify-between items-center mb-2">
          <Label className={labelClass}>Professional Summary</Label>
          <span className={`text-sm ${summaryWordCount > 50 && summaryWordCount <= 100 ? "text-emerald-600" : summaryWordCount > 100 ? "text-amber-600" : "text-gray-400"}`}>
            {summaryWordCount} words (aim for 50-100)
          </span>
        </div>
        <Textarea className="min-h-[160px] p-4 text-base bg-gray-50/50 border-gray-300 rounded-lg shadow-sm focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" placeholder="Experienced professional with..." value={summary} onChange={e => onUpdateSummary(e.target.value)} data-testid="personal-summary" />
        <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
          <p className="text-sm text-gray-400">A strong summary highlights your key value in 2-3 sentences.</p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onSmartImproveSummary} disabled={!summary.trim()} className="h-11 px-5 text-sm gap-2 bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100" data-testid="smart-improve-summary-btn">
              <Wand2 className="w-4 h-4" /> Smart Improve
            </Button>
            <Button variant="outline" onClick={onAiImproveSummary} disabled={aiLoading === "summary" || !summary.trim() || aiRemaining <= 0} className="h-11 px-5 text-sm gap-2 border-violet-200 text-violet-700 hover:bg-violet-50" data-testid="ai-improve-summary-btn">
              {aiLoading === "summary" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              AI Improve
            </Button>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${aiRemaining > 0 ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-400"}`} data-testid="ai-remaining-summary">
              {aiRemaining}/{aiTotal}
            </span>
          </div>
        </div>
        {aiRemaining <= 0 && (
          <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-500" data-testid="ai-limit-message-summary">
            AI uses reached — <strong>Smart Improve</strong> is free and unlimited!
          </div>
        )}
        {aiSuggestion?.id === "summary" && (
          <div className="mt-4 bg-violet-50 border border-violet-200 rounded-xl p-5" data-testid="ai-summary-suggestion">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-violet-700 flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> AI Suggestion</span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-9 px-3 text-sm text-emerald-600 hover:bg-emerald-50" onClick={onAcceptAi} data-testid="ai-accept-summary"><Check className="w-4 h-4 mr-1" /> Accept</Button>
                <Button size="sm" variant="ghost" className="h-9 px-3 text-sm text-red-600 hover:bg-red-50" onClick={onDismissAi} data-testid="ai-dismiss-summary"><X className="w-4 h-4 mr-1" /> Dismiss</Button>
              </div>
            </div>
            <p className="text-base text-violet-900 whitespace-pre-line leading-relaxed">{aiSuggestion.improved}</p>
          </div>
        )}
        {summarySuggestions.length > 0 && summary.trim() && (
          <div className="mt-4 space-y-2" data-testid="smart-summary-suggestions">
            {summarySuggestions.map((s, i) => (
              <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-lg text-sm ${
                s.type === "warning" ? "bg-amber-50 border border-amber-200 text-amber-800" :
                s.type === "improvement" ? "bg-blue-50 border border-blue-200 text-blue-800" :
                "bg-emerald-50 border border-emerald-200 text-emerald-800"
              }`}>
                {s.type === "warning" ? <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
                 s.type === "improvement" ? <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" /> :
                 <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <div>
                  <span className="font-semibold">{s.message}</span>
                  {s.fix && <span className="block text-xs mt-0.5 opacity-80">{s.fix}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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

export function PersonalTab({
  personalDetails, summary, summaryWordCount,
  onUpdatePersonal, onUpdateSummary,
  onSmartImproveSummary, onAiImproveSummary,
  aiLoading, aiSuggestion, aiRemaining, aiTotal,
  onAcceptAi, onDismissAi, summarySuggestions,
}: Props) {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Full Name *</Label>
          <Input placeholder="John Smith" value={personalDetails.fullName} onChange={e => onUpdatePersonal("fullName", e.target.value)} data-testid="personal-fullname" />
        </div>
        <div>
          <Label>Email *</Label>
          <Input type="email" placeholder="john@email.com" value={personalDetails.email} onChange={e => onUpdatePersonal("email", e.target.value)} data-testid="personal-email" />
        </div>
        <div>
          <Label>Phone *</Label>
          <Input placeholder="(555) 123-4567" value={personalDetails.phone} onChange={e => onUpdatePersonal("phone", e.target.value)} data-testid="personal-phone" />
        </div>
        <div className="col-span-2">
          <Label>Location</Label>
          <Input placeholder="San Francisco, CA" value={personalDetails.location} onChange={e => onUpdatePersonal("location", e.target.value)} data-testid="personal-location" />
        </div>
        <div>
          <Label>LinkedIn URL</Label>
          <Input placeholder="linkedin.com/in/johnsmith" value={personalDetails.linkedin || ""} onChange={e => onUpdatePersonal("linkedin", e.target.value)} data-testid="personal-linkedin" />
        </div>
        <div>
          <Label>Portfolio URL</Label>
          <Input placeholder="johnsmith.com" value={personalDetails.portfolio || ""} onChange={e => onUpdatePersonal("portfolio", e.target.value)} data-testid="personal-portfolio" />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <Label>Professional Summary</Label>
          <span className={`text-xs ${summaryWordCount > 50 && summaryWordCount <= 100 ? "text-emerald-600" : summaryWordCount > 100 ? "text-amber-600" : "text-muted-foreground"}`}>
            {summaryWordCount} words (aim for 50-100)
          </span>
        </div>
        <Textarea placeholder="Experienced professional with..." rows={4} value={summary} onChange={e => onUpdateSummary(e.target.value)} data-testid="personal-summary" />
        <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
          <p className="text-xs text-muted-foreground">A strong summary highlights your key value in 2-3 sentences.</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onSmartImproveSummary} disabled={!summary.trim()} className="text-xs gap-1.5 border-teal-300 text-teal-700 hover:bg-teal-50" data-testid="smart-improve-summary-btn">
              <Wand2 className="w-3.5 h-3.5" /> Smart Improve
            </Button>
            <Button variant="outline" size="sm" onClick={onAiImproveSummary} disabled={aiLoading === "summary" || !summary.trim() || aiRemaining <= 0} className="text-xs gap-1.5 border-violet-300 text-violet-700 hover:bg-violet-50" data-testid="ai-improve-summary-btn">
              {aiLoading === "summary" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              AI Improve
            </Button>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${aiRemaining > 0 ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-400"}`} data-testid="ai-remaining-summary">
              {aiRemaining}/{aiTotal}
            </span>
          </div>
        </div>
        {aiRemaining <= 0 && (
          <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500" data-testid="ai-limit-message-summary">
            AI uses reached — <strong>Smart Improve</strong> is free and unlimited!
          </div>
        )}
        {aiSuggestion?.id === "summary" && (
          <div className="mt-3 bg-violet-50 border border-violet-200 rounded-lg p-4" data-testid="ai-summary-suggestion">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-violet-700 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Suggestion</span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-7 px-2 text-emerald-600 hover:bg-emerald-50" onClick={onAcceptAi} data-testid="ai-accept-summary"><Check className="w-3.5 h-3.5 mr-1" /> Accept</Button>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-red-600 hover:bg-red-50" onClick={onDismissAi} data-testid="ai-dismiss-summary"><X className="w-3.5 h-3.5 mr-1" /> Dismiss</Button>
              </div>
            </div>
            <p className="text-sm text-violet-900 whitespace-pre-line">{aiSuggestion.improved}</p>
          </div>
        )}
        {summarySuggestions.length > 0 && summary.trim() && (
          <div className="mt-3 space-y-1.5" data-testid="smart-summary-suggestions">
            {summarySuggestions.map((s, i) => (
              <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${
                s.type === "warning" ? "bg-amber-50 border border-amber-200 text-amber-800" :
                s.type === "improvement" ? "bg-blue-50 border border-blue-200 text-blue-800" :
                "bg-emerald-50 border border-emerald-200 text-emerald-800"
              }`}>
                {s.type === "warning" ? <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> :
                 s.type === "improvement" ? <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> :
                 <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
                <div>
                  <span className="font-semibold">{s.message}</span>
                  {s.fix && <span className="block text-[11px] mt-0.5 opacity-80">{s.fix}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

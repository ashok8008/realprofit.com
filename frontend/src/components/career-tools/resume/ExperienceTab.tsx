import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Sparkles, Loader2, Check, X, Lightbulb, AlertTriangle, Info, Wand2 } from "lucide-react";
import type { Experience, AiSuggestion, Suggestion } from "./types";

interface Props {
  experience: Experience[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Experience, value: string | boolean) => void;
  onRemove: (id: string) => void;
  onSmartImproveBullet: (expId: string, text: string) => void;
  onAiImproveBullet: (expId: string, text: string, title: string) => void;
  aiLoading: string | null;
  aiSuggestion: AiSuggestion | null;
  aiRemaining: number;
  aiTotal: number;
  onAcceptAi: () => void;
  onDismissAi: () => void;
  bulletSuggestions: Record<string, Suggestion[]>;
}

export function ExperienceTab({
  experience, onAdd, onUpdate, onRemove,
  onSmartImproveBullet, onAiImproveBullet,
  aiLoading, aiSuggestion, aiRemaining, aiTotal,
  onAcceptAi, onDismissAi, bulletSuggestions,
}: Props) {
  return (
    <div className="space-y-4 mt-4">
      {experience.map((exp, idx) => (
        <div key={exp.id} className="border rounded-lg p-4 space-y-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Experience {idx + 1}</span>
            <Button variant="ghost" size="sm" onClick={() => onRemove(exp.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Job Title *</Label>
              <Input placeholder="Software Engineer" value={exp.title} onChange={e => onUpdate(exp.id, "title", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Company *</Label>
              <Input placeholder="Acme Corp" value={exp.company} onChange={e => onUpdate(exp.id, "company", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Location</Label>
              <Input placeholder="New York, NY" value={exp.location} onChange={e => onUpdate(exp.id, "location", e.target.value)} />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={exp.current} onCheckedChange={v => onUpdate(exp.id, "current", v)} />
                <Label className="text-xs">Current Role</Label>
              </div>
            </div>
            <div>
              <Label className="text-xs">Start Date</Label>
              <Input placeholder="Jan 2020" value={exp.startDate} onChange={e => onUpdate(exp.id, "startDate", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">End Date</Label>
              <Input placeholder={exp.current ? "Present" : "Dec 2023"} value={exp.current ? "Present" : exp.endDate} onChange={e => onUpdate(exp.id, "endDate", e.target.value)} disabled={exp.current} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Description / Achievements</Label>
            <Textarea placeholder={"• Led a team of 5 engineers...\n• Increased conversion by 25%..."} rows={4} value={exp.description} onChange={e => onUpdate(exp.id, "description", e.target.value)} />
            <div className="flex items-center justify-between mt-1.5 flex-wrap gap-2">
              <p className="text-xs text-muted-foreground">Use bullet points starting with action verbs</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onSmartImproveBullet(exp.id, exp.description)} disabled={!exp.description.trim()} className="text-xs gap-1.5 border-teal-300 text-teal-700 hover:bg-teal-50" data-testid={`smart-improve-bullet-${idx}`}>
                  <Wand2 className="w-3.5 h-3.5" /> Smart Improve
                </Button>
                <Button variant="outline" size="sm" onClick={() => onAiImproveBullet(exp.id, exp.description, exp.title)} disabled={aiLoading === `bullet-${exp.id}` || !exp.description.trim() || aiRemaining <= 0} className="text-xs gap-1.5 border-violet-300 text-violet-700 hover:bg-violet-50" data-testid={`ai-improve-bullet-${idx}`}>
                  {aiLoading === `bullet-${exp.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  AI Improve
                </Button>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${aiRemaining > 0 ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-400"}`} data-testid={`ai-remaining-bullet-${idx}`}>
                  {aiRemaining}/{aiTotal}
                </span>
              </div>
            </div>
            {aiRemaining <= 0 && idx === 0 && (
              <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500" data-testid="ai-limit-message-bullet">
                AI uses reached — <strong>Smart Improve</strong> is free and unlimited!
              </div>
            )}
            {aiSuggestion?.id === `bullet-${exp.id}` && (
              <div className="mt-3 bg-violet-50 border border-violet-200 rounded-lg p-4" data-testid={`ai-bullet-suggestion-${idx}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-violet-700 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Suggestion</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-emerald-600 hover:bg-emerald-50" onClick={onAcceptAi} data-testid={`ai-accept-bullet-${idx}`}><Check className="w-3.5 h-3.5 mr-1" /> Accept</Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-red-600 hover:bg-red-50" onClick={onDismissAi} data-testid={`ai-dismiss-bullet-${idx}`}><X className="w-3.5 h-3.5 mr-1" /> Dismiss</Button>
                  </div>
                </div>
                <p className="text-sm text-violet-900 whitespace-pre-line">{aiSuggestion.improved}</p>
                {aiSuggestion.suggestions && aiSuggestion.suggestions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-violet-200">
                    <span className="text-xs font-semibold text-violet-600">Tips:</span>
                    <ul className="mt-1 space-y-0.5">
                      {aiSuggestion.suggestions.map((tip, i) => (
                        <li key={i} className="text-xs text-violet-700">&bull; {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {bulletSuggestions[exp.id] && bulletSuggestions[exp.id].length > 0 && (
              <div className="mt-2 space-y-1.5" data-testid={`smart-bullet-suggestions-${idx}`}>
                {bulletSuggestions[exp.id].map((s, i) => (
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
      ))}
      <Button variant="outline" onClick={onAdd} className="w-full" data-testid="add-experience-btn">
        <Plus className="w-4 h-4 mr-2" /> Add Experience
      </Button>
    </div>
  );
}

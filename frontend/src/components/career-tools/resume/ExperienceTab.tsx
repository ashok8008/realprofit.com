import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Sparkles, Loader2, Check, X, Wand2, Lightbulb, AlertTriangle, Info } from "lucide-react";
import type { Experience, AiSuggestion } from "./types";
import type { analyzeBulletPoints } from "@/lib/career-tools/smartSuggestions";

interface Props {
  experience: Experience[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Experience, value: string | boolean) => void;
  onRemove: (id: string) => void;
  onSmartImproveBullet: (expId: string, text: string) => void;
  onAiImproveBullet: (expId: string, text: string, jobTitle: string) => void;
  aiLoading: string | null;
  aiSuggestion: AiSuggestion | null;
  aiRemaining: number;
  aiTotal: number;
  onAcceptAi: () => void;
  onDismissAi: () => void;
  bulletSuggestions: Record<string, ReturnType<typeof analyzeBulletPoints>>;
}

const inputClass = "h-14 px-4 text-base bg-gray-50/50 border-gray-300 rounded-lg shadow-sm focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all";
const labelClass = "text-base font-medium text-gray-900 mb-2 block";

export function ExperienceTab({
  experience, onAdd, onUpdate, onRemove,
  onSmartImproveBullet, onAiImproveBullet,
  aiLoading, aiSuggestion, aiRemaining, aiTotal,
  onAcceptAi, onDismissAi, bulletSuggestions,
}: Props) {
  return (
    <div>
      <h2 className="text-3xl tracking-tight font-semibold text-gray-900 mb-2">Work Experience</h2>
      <p className="text-lg text-gray-500 mb-10">Add your professional experience, starting with the most recent.</p>

      {experience.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg mb-4">No experience added yet</p>
          <Button onClick={onAdd} className="h-14 px-8 text-base bg-gray-900 hover:bg-gray-800 text-white rounded-lg" data-testid="add-experience-btn">
            <Plus className="w-5 h-5 mr-2" /> Add Experience
          </Button>
        </div>
      )}

      {experience.map((exp, index) => (
        <div key={exp.id} className="mb-10 pb-10 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">{exp.title || `Position ${index + 1}`}</h3>
            <Button variant="ghost" size="sm" onClick={() => onRemove(exp.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 h-9 px-3" data-testid={`remove-exp-${exp.id}`}>
              <Trash2 className="w-4 h-4 mr-1" /> Remove
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <Label className={labelClass}>Job Title *</Label>
              <Input className={inputClass} placeholder="Software Engineer" value={exp.title} onChange={e => onUpdate(exp.id, "title", e.target.value)} data-testid={`exp-title-${exp.id}`} />
            </div>
            <div>
              <Label className={labelClass}>Company *</Label>
              <Input className={inputClass} placeholder="Acme Corp" value={exp.company} onChange={e => onUpdate(exp.id, "company", e.target.value)} data-testid={`exp-company-${exp.id}`} />
            </div>
            <div>
              <Label className={labelClass}>Location</Label>
              <Input className={inputClass} placeholder="San Francisco, CA" value={exp.location} onChange={e => onUpdate(exp.id, "location", e.target.value)} data-testid={`exp-location-${exp.id}`} />
            </div>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label className={labelClass}>Start Date</Label>
                <Input className={inputClass} placeholder="Jan 2020" value={exp.startDate} onChange={e => onUpdate(exp.id, "startDate", e.target.value)} data-testid={`exp-start-${exp.id}`} />
              </div>
              <div className="flex-1">
                <Label className={labelClass}>End Date</Label>
                <Input className={inputClass} placeholder="Dec 2023" value={exp.endDate} disabled={exp.current} onChange={e => onUpdate(exp.id, "endDate", e.target.value)} data-testid={`exp-end-${exp.id}`} />
              </div>
            </div>
            <div className="md:col-span-2 flex items-center gap-2 -mt-2">
              <Checkbox checked={exp.current} onCheckedChange={v => onUpdate(exp.id, "current", !!v)} id={`current-${exp.id}`} data-testid={`exp-current-${exp.id}`} />
              <label htmlFor={`current-${exp.id}`} className="text-sm text-gray-600 cursor-pointer">I currently work here</label>
            </div>
          </div>

          <div className="mt-6">
            <Label className={labelClass}>Description / Bullet Points</Label>
            <Textarea className="min-h-[160px] p-4 text-base bg-gray-50/50 border-gray-300 rounded-lg shadow-sm focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" placeholder={"- Led migration of monolith to microservices, reducing deployment time by 60%\n- Managed team of 5 engineers across 3 product launches"} value={exp.description} onChange={e => onUpdate(exp.id, "description", e.target.value)} data-testid={`exp-desc-${exp.id}`} />
            <div className="flex items-center gap-3 mt-3">
              <Button variant="outline" onClick={() => onSmartImproveBullet(exp.id, exp.description)} disabled={!exp.description.trim()} className="h-11 px-5 text-sm gap-2 bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100" data-testid={`smart-improve-${exp.id}`}>
                <Wand2 className="w-4 h-4" /> Smart Improve
              </Button>
              <Button variant="outline" onClick={() => onAiImproveBullet(exp.id, exp.description, exp.title)} disabled={aiLoading === `bullet-${exp.id}` || !exp.description.trim() || aiRemaining <= 0} className="h-11 px-5 text-sm gap-2 border-violet-200 text-violet-700 hover:bg-violet-50" data-testid={`ai-improve-${exp.id}`}>
                {aiLoading === `bullet-${exp.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                AI Improve
              </Button>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${aiRemaining > 0 ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-400"}`}>
                {aiRemaining}/{aiTotal}
              </span>
            </div>
          </div>

          {aiSuggestion?.id === `bullet-${exp.id}` && (
            <div className="mt-4 bg-violet-50 border border-violet-200 rounded-xl p-5" data-testid={`ai-suggestion-${exp.id}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-violet-700 flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> AI Suggestion</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="h-9 px-3 text-sm text-emerald-600 hover:bg-emerald-50" onClick={onAcceptAi}><Check className="w-4 h-4 mr-1" /> Accept</Button>
                  <Button size="sm" variant="ghost" className="h-9 px-3 text-sm text-red-600 hover:bg-red-50" onClick={onDismissAi}><X className="w-4 h-4 mr-1" /> Dismiss</Button>
                </div>
              </div>
              <p className="text-base text-violet-900 whitespace-pre-line leading-relaxed">{aiSuggestion.improved}</p>
            </div>
          )}

          {bulletSuggestions[exp.id]?.length > 0 && (
            <div className="mt-4 space-y-2">
              {bulletSuggestions[exp.id].map((s, i) => (
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
      ))}

      {experience.length > 0 && (
        <div className="mt-8">
          <Button variant="outline" onClick={onAdd} className="h-14 px-8 text-base border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg w-full" data-testid="add-experience-btn">
            <Plus className="w-5 h-5 mr-2" /> Add Another Experience
          </Button>
        </div>
      )}
    </div>
  );
}

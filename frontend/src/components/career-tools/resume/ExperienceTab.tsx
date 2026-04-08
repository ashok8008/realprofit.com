import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Sparkles, Loader2, Check, X, Wand2, Lightbulb, AlertTriangle, Info, Pencil, Briefcase, MapPin, Calendar } from "lucide-react";
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

const inputClass = "h-12 px-4 text-sm bg-zinc-50/50 border-zinc-300 rounded-lg shadow-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all";
const labelClass = "text-sm font-medium text-zinc-800 mb-1.5 block";

export function ExperienceTab({
  experience, onAdd, onUpdate, onRemove,
  onSmartImproveBullet, onAiImproveBullet,
  aiLoading, aiSuggestion, aiRemaining, aiTotal,
  onAcceptAi, onDismissAi, bulletSuggestions,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <h2 className="text-3xl tracking-tight font-semibold text-zinc-900 mb-2">Work Experience</h2>
      <p className="text-base text-zinc-500 mb-8">Add your professional experience, starting with the most recent.</p>

      {experience.length === 0 && (
        <div className="text-center py-14 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200">
          <Briefcase className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-400 text-base mb-4">No experience added yet</p>
          <Button onClick={onAdd} className="h-12 px-6 text-sm bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg" data-testid="add-experience-btn">
            <Plus className="w-4 h-4 mr-2" /> Add Experience
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {experience.map((exp, index) => {
          const isEditing = editingId === exp.id;
          const hasContent = exp.title || exp.company;

          // Review Card (collapsed)
          if (!isEditing && hasContent) {
            return (
              <div key={exp.id} className="group border border-zinc-200 rounded-xl bg-white hover:border-zinc-300 hover:shadow-sm transition-all" data-testid={`exp-card-${exp.id}`}>
                <div className="flex items-start justify-between p-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-zinc-900 truncate">{exp.title || `Position ${index + 1}`}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-sm text-zinc-500">
                      {exp.company && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {exp.company}
                        </span>
                      )}
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {exp.location}
                        </span>
                      )}
                    </div>
                    {(exp.startDate || exp.endDate) && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-zinc-400">
                        <Calendar className="w-3 h-3" />
                        {exp.startDate}{exp.startDate && (exp.endDate || exp.current) ? " — " : ""}{exp.current ? "Present" : exp.endDate}
                      </div>
                    )}
                    {exp.description && (
                      <p className="mt-2 text-xs text-zinc-400 line-clamp-2">{exp.description.substring(0, 120)}{exp.description.length > 120 ? "..." : ""}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
                    <button onClick={() => setEditingId(exp.id)} className="h-8 px-3 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-600 flex items-center gap-1.5 transition-colors" data-testid={`edit-exp-${exp.id}`}>
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => onRemove(exp.id)} className="h-8 w-8 rounded-md border border-zinc-200 bg-white hover:bg-red-50 hover:border-red-200 text-zinc-400 hover:text-red-500 flex items-center justify-center transition-colors" data-testid={`remove-exp-${exp.id}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // Edit Form (expanded)
          return (
            <div key={exp.id} className="border-2 border-zinc-900 rounded-xl bg-white p-6" data-testid={`exp-form-${exp.id}`}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-zinc-800">{exp.title || `Position ${index + 1}`}</h3>
                <div className="flex items-center gap-2">
                  {hasContent && (
                    <button onClick={() => setEditingId(null)} className="h-8 px-3 rounded-md border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-50 flex items-center gap-1.5" data-testid={`done-exp-${exp.id}`}>
                      <Check className="w-3 h-3" /> Done
                    </button>
                  )}
                  <button onClick={() => onRemove(exp.id)} className="h-8 px-3 rounded-md text-xs font-medium text-red-500 hover:bg-red-50 flex items-center gap-1.5" data-testid={`remove-exp-${exp.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Label className={labelClass}>Start Date</Label>
                    <Input className={inputClass} placeholder="Jan 2020" value={exp.startDate} onChange={e => onUpdate(exp.id, "startDate", e.target.value)} data-testid={`exp-start-${exp.id}`} />
                  </div>
                  <div className="flex-1">
                    <Label className={labelClass}>End Date</Label>
                    <Input className={inputClass} placeholder="Dec 2023" value={exp.endDate} disabled={exp.current} onChange={e => onUpdate(exp.id, "endDate", e.target.value)} data-testid={`exp-end-${exp.id}`} />
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center gap-2 -mt-1">
                  <Checkbox checked={exp.current} onCheckedChange={v => onUpdate(exp.id, "current", !!v)} id={`current-${exp.id}`} data-testid={`exp-current-${exp.id}`} />
                  <label htmlFor={`current-${exp.id}`} className="text-sm text-zinc-600 cursor-pointer">I currently work here</label>
                </div>
              </div>

              <div className="mt-5">
                <Label className={labelClass}>Description / Bullet Points</Label>
                <Textarea className="min-h-[140px] p-4 text-sm bg-zinc-50/50 border-zinc-300 rounded-lg shadow-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all" placeholder={"- Led migration of monolith to microservices, reducing deployment time by 60%\n- Managed team of 5 engineers across 3 product launches"} value={exp.description} onChange={e => onUpdate(exp.id, "description", e.target.value)} data-testid={`exp-desc-${exp.id}`} />
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="outline" onClick={() => onSmartImproveBullet(exp.id, exp.description)} disabled={!exp.description.trim()} className="h-9 px-4 text-xs gap-1.5 bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100" data-testid={`smart-improve-${exp.id}`}>
                    <Wand2 className="w-3.5 h-3.5" /> Smart Improve
                  </Button>
                  <Button variant="outline" onClick={() => onAiImproveBullet(exp.id, exp.description, exp.title)} disabled={aiLoading === `bullet-${exp.id}` || !exp.description.trim() || aiRemaining <= 0} className="h-9 px-4 text-xs gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50" data-testid={`ai-improve-${exp.id}`}>
                    {aiLoading === `bullet-${exp.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    AI Improve
                  </Button>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${aiRemaining > 0 ? "bg-violet-100 text-violet-600" : "bg-zinc-100 text-zinc-400"}`}>
                    {aiRemaining}/{aiTotal}
                  </span>
                </div>
              </div>

              {aiSuggestion?.id === `bullet-${exp.id}` && (
                <div className="mt-4 bg-violet-50 border border-violet-200 rounded-xl p-4" data-testid={`ai-suggestion-${exp.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-violet-700 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI Suggestion</span>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-emerald-600 hover:bg-emerald-50" onClick={onAcceptAi}><Check className="w-3 h-3 mr-1" /> Accept</Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-600 hover:bg-red-50" onClick={onDismissAi}><X className="w-3 h-3 mr-1" /> Dismiss</Button>
                    </div>
                  </div>
                  <p className="text-sm text-violet-900 whitespace-pre-line leading-relaxed">{aiSuggestion.improved}</p>
                </div>
              )}

              {bulletSuggestions[exp.id]?.length > 0 && (
                <div className="mt-3 space-y-1.5">
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
                        <span className="font-medium">{s.message}</span>
                        {s.fix && <span className="block text-[11px] mt-0.5 opacity-80">{s.fix}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {experience.length > 0 && (
        <div className="mt-4">
          <button onClick={() => { onAdd(); setTimeout(() => setEditingId(experience.length > 0 ? String(Date.now()) : null), 50); }} className="w-full h-12 rounded-xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 text-sm font-medium text-zinc-500 hover:text-zinc-700 flex items-center justify-center gap-2 transition-colors" data-testid="add-experience-btn">
            <Plus className="w-4 h-4" /> Add Another Experience
          </button>
        </div>
      )}
    </div>
  );
}

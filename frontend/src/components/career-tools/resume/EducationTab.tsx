import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil, Check, GraduationCap, MapPin, Calendar } from "lucide-react";
import type { Education } from "./types";

interface Props {
  education: Education[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Education, value: string) => void;
  onRemove: (id: string) => void;
}

const inputClass = "h-12 px-4 text-sm bg-zinc-50/50 border-zinc-300 rounded-lg shadow-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all";
const labelClass = "text-sm font-medium text-zinc-800 mb-1.5 block";

export function EducationTab({ education, onAdd, onUpdate, onRemove }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <h2 className="text-3xl tracking-tight font-semibold text-zinc-900 mb-2">Education</h2>
      <p className="text-base text-zinc-500 mb-8">Add your educational background.</p>

      {education.length === 0 && (
        <div className="text-center py-14 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200">
          <GraduationCap className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-400 text-base mb-4">No education added yet</p>
          <Button onClick={onAdd} className="h-12 px-6 text-sm bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg" data-testid="add-education-btn">
            <Plus className="w-4 h-4 mr-2" /> Add Education
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {education.map((edu, index) => {
          const isEditing = editingId === edu.id;
          const hasContent = edu.school || edu.degree;

          // Review Card (collapsed)
          if (!isEditing && hasContent) {
            return (
              <div key={edu.id} className="group border border-zinc-200 rounded-xl bg-white hover:border-zinc-300 hover:shadow-sm transition-all" data-testid={`edu-card-${edu.id}`}>
                <div className="flex items-start justify-between p-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-zinc-900 truncate">
                      {edu.degree}{edu.field ? ` in ${edu.field}` : ""}{!edu.degree && `Education ${index + 1}`}
                    </h3>
                    {edu.school && (
                      <div className="flex items-center gap-1 mt-1.5 text-sm text-zinc-500">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {edu.school}
                      </div>
                    )}
                    {(edu.startDate || edu.endDate) && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-zinc-400">
                        <Calendar className="w-3 h-3" />
                        {edu.startDate}{edu.startDate && edu.endDate ? " — " : ""}{edu.endDate}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
                    <button onClick={() => setEditingId(edu.id)} className="h-8 px-3 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-600 flex items-center gap-1.5 transition-colors" data-testid={`edit-edu-${edu.id}`}>
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => onRemove(edu.id)} className="h-8 w-8 rounded-md border border-zinc-200 bg-white hover:bg-red-50 hover:border-red-200 text-zinc-400 hover:text-red-500 flex items-center justify-center transition-colors" data-testid={`remove-edu-${edu.id}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // Edit Form (expanded)
          return (
            <div key={edu.id} className="border-2 border-zinc-900 rounded-xl bg-white p-6" data-testid={`edu-form-${edu.id}`}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-zinc-800">{edu.school || `Education ${index + 1}`}</h3>
                <div className="flex items-center gap-2">
                  {hasContent && (
                    <button onClick={() => setEditingId(null)} className="h-8 px-3 rounded-md border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-50 flex items-center gap-1.5" data-testid={`done-edu-${edu.id}`}>
                      <Check className="w-3 h-3" /> Done
                    </button>
                  )}
                  <button onClick={() => onRemove(edu.id)} className="h-8 px-3 rounded-md text-xs font-medium text-red-500 hover:bg-red-50 flex items-center gap-1.5" data-testid={`remove-edu-${edu.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
                  <Label className={labelClass}>School / University *</Label>
                  <Input className={inputClass} placeholder="Stanford University" value={edu.school} onChange={e => onUpdate(edu.id, "school", e.target.value)} data-testid={`edu-school-${edu.id}`} />
                </div>
                <div>
                  <Label className={labelClass}>Degree *</Label>
                  <Input className={inputClass} placeholder="Bachelor of Science" value={edu.degree} onChange={e => onUpdate(edu.id, "degree", e.target.value)} data-testid={`edu-degree-${edu.id}`} />
                </div>
                <div>
                  <Label className={labelClass}>Field of Study</Label>
                  <Input className={inputClass} placeholder="Computer Science" value={edu.field} onChange={e => onUpdate(edu.id, "field", e.target.value)} data-testid={`edu-field-${edu.id}`} />
                </div>
                <div>
                  <Label className={labelClass}>Start Date</Label>
                  <Input className={inputClass} placeholder="Sep 2016" value={edu.startDate} onChange={e => onUpdate(edu.id, "startDate", e.target.value)} data-testid={`edu-start-${edu.id}`} />
                </div>
                <div>
                  <Label className={labelClass}>End Date</Label>
                  <Input className={inputClass} placeholder="Jun 2020" value={edu.endDate} onChange={e => onUpdate(edu.id, "endDate", e.target.value)} data-testid={`edu-end-${edu.id}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {education.length > 0 && (
        <div className="mt-4">
          <button onClick={() => { onAdd(); setTimeout(() => setEditingId(education.length > 0 ? String(Date.now()) : null), 50); }} className="w-full h-12 rounded-xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 text-sm font-medium text-zinc-500 hover:text-zinc-700 flex items-center justify-center gap-2 transition-colors" data-testid="add-education-btn">
            <Plus className="w-4 h-4" /> Add Another Education
          </button>
        </div>
      )}
    </div>
  );
}

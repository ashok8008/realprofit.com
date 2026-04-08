import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { Education } from "./types";

interface Props {
  education: Education[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Education, value: string) => void;
  onRemove: (id: string) => void;
}

const inputClass = "h-14 px-4 text-base bg-gray-50/50 border-gray-300 rounded-lg shadow-sm focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all";
const labelClass = "text-base font-medium text-gray-900 mb-2 block";

export function EducationTab({ education, onAdd, onUpdate, onRemove }: Props) {
  return (
    <div>
      <h2 className="text-3xl tracking-tight font-semibold text-gray-900 mb-2">Education</h2>
      <p className="text-lg text-gray-500 mb-10">Add your educational background.</p>

      {education.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg mb-4">No education added yet</p>
          <Button onClick={onAdd} className="h-14 px-8 text-base bg-gray-900 hover:bg-gray-800 text-white rounded-lg" data-testid="add-education-btn">
            <Plus className="w-5 h-5 mr-2" /> Add Education
          </Button>
        </div>
      )}

      {education.map((edu, index) => (
        <div key={edu.id} className="mb-10 pb-10 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">{edu.school || `Education ${index + 1}`}</h3>
            <Button variant="ghost" size="sm" onClick={() => onRemove(edu.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 h-9 px-3" data-testid={`remove-edu-${edu.id}`}>
              <Trash2 className="w-4 h-4 mr-1" /> Remove
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
      ))}

      {education.length > 0 && (
        <div className="mt-8">
          <Button variant="outline" onClick={onAdd} className="h-14 px-8 text-base border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg w-full" data-testid="add-education-btn">
            <Plus className="w-5 h-5 mr-2" /> Add Another Education
          </Button>
        </div>
      )}
    </div>
  );
}

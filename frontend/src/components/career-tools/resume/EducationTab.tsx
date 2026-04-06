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

export function EducationTab({ education, onAdd, onUpdate, onRemove }: Props) {
  return (
    <div className="space-y-4 mt-4">
      {education.map((edu, idx) => (
        <div key={edu.id} className="border rounded-lg p-4 space-y-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Education {idx + 1}</span>
            <Button variant="ghost" size="sm" onClick={() => onRemove(edu.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">School / University *</Label>
              <Input placeholder="University of California" value={edu.school} onChange={e => onUpdate(edu.id, "school", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Degree</Label>
              <Input placeholder="Bachelor of Science" value={edu.degree} onChange={e => onUpdate(edu.id, "degree", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Field of Study</Label>
              <Input placeholder="Computer Science" value={edu.field} onChange={e => onUpdate(edu.id, "field", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Start Year</Label>
              <Input placeholder="2016" value={edu.startDate} onChange={e => onUpdate(edu.id, "startDate", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">End Year</Label>
              <Input placeholder="2020" value={edu.endDate} onChange={e => onUpdate(edu.id, "endDate", e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={onAdd} className="w-full" data-testid="add-education-btn">
        <Plus className="w-4 h-4 mr-2" /> Add Education
      </Button>
    </div>
  );
}

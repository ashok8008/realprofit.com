import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

const inputClass = "h-14 px-4 text-base bg-gray-50/50 border-gray-300 rounded-lg shadow-sm focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all";
const labelClass = "text-base font-medium text-gray-900 mb-2 block";

interface SkillsProps {
  skills: string[];
  skillInput: string;
  onSkillInputChange: (v: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
}

export function SkillsTab({ skills, skillInput, onSkillInputChange, onAddSkill, onRemoveSkill }: SkillsProps) {
  return (
    <div>
      <h2 className="text-3xl tracking-tight font-semibold text-gray-900 mb-2">Skills</h2>
      <p className="text-lg text-gray-500 mb-10">Add your professional skills. Include both technical and soft skills.</p>

      <div className="flex gap-3 mb-8">
        <Input className={`${inputClass} flex-1`} placeholder="e.g. JavaScript, Project Management, Data Analysis" value={skillInput} onChange={e => onSkillInputChange(e.target.value)} onKeyDown={e => e.key === "Enter" && onAddSkill()} data-testid="skill-input" />
        <Button onClick={onAddSkill} className="h-14 px-6 text-base bg-gray-900 hover:bg-gray-800 text-white rounded-lg" data-testid="add-skill-btn">
          <Plus className="w-5 h-5 mr-2" /> Add
        </Button>
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {skills.map(skill => (
            <span key={skill} className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-base" data-testid={`skill-tag-${skill}`}>
              {skill}
              <button onClick={() => onRemoveSkill(skill)} className="text-gray-400 hover:text-red-500 transition-colors" data-testid={`remove-skill-${skill}`}>
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg">No skills added yet. Start typing above to add skills.</p>
        </div>
      )}
    </div>
  );
}

interface ExtrasProps {
  certifications: string[];
  certInput: string;
  onCertInputChange: (v: string) => void;
  onAddCert: () => void;
  onRemoveCert: (cert: string) => void;
}

export function ExtrasTab({ certifications, certInput, onCertInputChange, onAddCert, onRemoveCert }: ExtrasProps) {
  return (
    <div>
      <h2 className="text-3xl tracking-tight font-semibold text-gray-900 mb-2">Certifications & Extras</h2>
      <p className="text-lg text-gray-500 mb-10">Add any relevant certifications, licenses, or awards.</p>

      <div>
        <Label className={labelClass}>Certification / Award</Label>
        <div className="flex gap-3 mb-8">
          <Input className={`${inputClass} flex-1`} placeholder="e.g. AWS Solutions Architect, PMP, Google Analytics" value={certInput} onChange={e => onCertInputChange(e.target.value)} onKeyDown={e => e.key === "Enter" && onAddCert()} data-testid="cert-input" />
          <Button onClick={onAddCert} className="h-14 px-6 text-base bg-gray-900 hover:bg-gray-800 text-white rounded-lg" data-testid="add-cert-btn">
            <Plus className="w-5 h-5 mr-2" /> Add
          </Button>
        </div>
      </div>

      {certifications.length > 0 ? (
        <div className="space-y-3">
          {certifications.map(cert => (
            <div key={cert} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-5 py-4" data-testid={`cert-item-${cert}`}>
              <span className="text-base text-gray-700">{cert}</span>
              <button onClick={() => onRemoveCert(cert)} className="text-gray-400 hover:text-red-500 transition-colors" data-testid={`remove-cert-${cert}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg">No certifications added yet.</p>
        </div>
      )}
    </div>
  );
}

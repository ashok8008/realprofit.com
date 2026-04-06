import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface SkillsProps {
  skills: string[];
  skillInput: string;
  onSkillInputChange: (v: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
}

export function SkillsTab({ skills, skillInput, onSkillInputChange, onAddSkill, onRemoveSkill }: SkillsProps) {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label>Add Skills</Label>
        <div className="flex gap-2">
          <Input
            placeholder="JavaScript, React, Project Management..."
            value={skillInput}
            onChange={e => onSkillInputChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), onAddSkill())}
            data-testid="skill-input"
          />
          <Button onClick={onAddSkill} data-testid="add-skill-btn">Add</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Press Enter or click Add for each skill</p>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2" data-testid="skills-list">
          {skills.map(skill => (
            <span key={skill} className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              {skill}
              <button onClick={() => onRemoveSkill(skill)} className="hover:text-teal-600">
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="bg-muted/30 rounded-lg p-4 mt-4">
        <p className="text-sm font-semibold mb-2">Skill Suggestions</p>
        <p className="text-xs text-muted-foreground">
          Include both technical skills (programming languages, tools) and soft skills (leadership, communication).
          Tailor skills to match the job description.
        </p>
      </div>
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
    <div className="space-y-4 mt-4">
      <div>
        <Label>Certifications & Awards</Label>
        <div className="flex gap-2">
          <Input
            placeholder="AWS Certified, PMP, Google Analytics..."
            value={certInput}
            onChange={e => onCertInputChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), onAddCert())}
            data-testid="cert-input"
          />
          <Button onClick={onAddCert} data-testid="add-cert-btn">Add</Button>
        </div>
      </div>

      {certifications.length > 0 && (
        <div className="space-y-2" data-testid="certifications-list">
          {certifications.map(cert => (
            <div key={cert} className="bg-muted/30 px-4 py-2 rounded-lg flex items-center justify-between">
              <span className="text-sm">{cert}</span>
              <button onClick={() => onRemoveCert(cert)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

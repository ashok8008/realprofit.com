"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus, Trash2, Pencil, ArrowUp, Briefcase, GraduationCap,
  Download, Printer, Sparkles, Loader2, Wand2, X, Check,
  MapPin, Calendar, Star, Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { inputClass, labelClass } from "./constants";
import type { WizardStep, FlowState } from "./constants";
import type { ResumeData, Experience, Education, AiSuggestion } from "./types";
import type { ScoreSuggestion } from "@/lib/career-tools/resume/score";
import { smartRewriteBullets, smartRewriteSummary, AI_FREE_TOTAL } from "@/lib/career-tools/smartSuggestions";
import { normalizeDate, isPresentDate } from "@/lib/career-tools/resume/dateNormalize";
import { fixCommonTypos } from "@/lib/career-tools/resume/improve";

interface WizardStepContentProps {
  wizardStep: WizardStep;
  data: ResumeData;
  setData: React.Dispatch<React.SetStateAction<ResumeData>>;
  // Experience editing
  editingExpId: string | null;
  setEditingExpId: (id: string | null) => void;
  editingEduId: string | null;
  setEditingEduId: (id: string | null) => void;
  // AI
  aiLoading: string | null;
  aiSuggestion: AiSuggestion | null;
  aiRemaining: number;
  aiImproveBullet: (id: string, text: string, title: string) => void;
  acceptAiSuggestion: () => void;
  dismissAiSuggestion: () => void;
  // Summary generation
  summaryGenLoading: boolean;
  summaryOptions: string[];
  generateSummaryOptions: () => void;
  setSummaryOptions: (v: string[]) => void;
  // Skill suggestions
  skillSuggestions: string[];
  skillSugLoading: boolean;
  fetchSkillSuggestions: () => void;
  setSkillSuggestions: React.Dispatch<React.SetStateAction<string[]>>;
  // Inputs
  skillInput: string;
  setSkillInput: (v: string) => void;
  certInput: string;
  setCertInput: (v: string) => void;
  // Score
  scorePct: number;
  allFixes: ScoreSuggestion[];
  setFlowState: (s: FlowState) => void;
  // Onboarding
  onboardIndustries: string[];
  // PDF
  handleDownloadPDF: () => void;
  handleReset: () => void;
}

export function WizardStepContent(props: WizardStepContentProps) {
  const { toast } = useToast();
  const { wizardStep, data, setData, editingExpId, setEditingExpId, editingEduId, setEditingEduId,
    aiLoading, aiSuggestion, aiRemaining, aiImproveBullet, acceptAiSuggestion, dismissAiSuggestion,
    summaryGenLoading, summaryOptions, generateSummaryOptions, setSummaryOptions,
    skillSuggestions, skillSugLoading, fetchSkillSuggestions, setSkillSuggestions,
    skillInput, setSkillInput, certInput, setCertInput,
    scorePct, allFixes, setFlowState, onboardIndustries,
    handleDownloadPDF, handleReset } = props;

  // Data helpers
  const updatePersonal = (field: keyof ResumeData["personalDetails"], value: string) => setData(prev => ({ ...prev, personalDetails: { ...prev.personalDetails, [field]: value } }));
  const addExperience = () => { const id = Date.now().toString(); setData(prev => ({ ...prev, experience: [...prev.experience, { id, title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }] })); setEditingExpId(id); };
  const updateExperience = (id: string, field: string, value: string | boolean) => setData(prev => ({ ...prev, experience: prev.experience.map(e => (e.id || "") === id ? { ...e, [field]: value } : e) }));
  const removeExperience = (id: string) => setData(prev => ({ ...prev, experience: prev.experience.filter(e => (e.id || "") !== id) }));
  const moveExperience = (id: string, dir: "up" | "down") => setData(prev => { const idx = prev.experience.findIndex(e => (e.id || "") === id); if ((dir === "up" && idx <= 0) || (dir === "down" && idx >= prev.experience.length - 1)) return prev; const arr = [...prev.experience]; const swap = dir === "up" ? idx - 1 : idx + 1; [arr[idx], arr[swap]] = [arr[swap], arr[idx]]; return { ...prev, experience: arr }; });

  /** Run on "Done editing" — normalises dates, cleans typos in the title,
   *  and auto-toggles the "current" flag if the user typed "till date" etc. */
  const finishEditingExperience = (id: string) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(e => {
        if ((e.id || "") !== id) return e;
        const cleanTitle = fixCommonTypos(e.title || "").trim();
        const startDate = normalizeDate(e.startDate || "");
        const isCurrent = e.current || isPresentDate(e.endDate || "");
        const endDate = isCurrent ? "Present" : normalizeDate(e.endDate || "");
        return { ...e, title: cleanTitle, startDate, endDate, current: isCurrent };
      }),
    }));
    setEditingExpId(null);
  };
  const addEducation = () => { const id = Date.now().toString(); setData(prev => ({ ...prev, education: [...prev.education, { id, school: "", degree: "", field: "", startDate: "", endDate: "" }] })); setEditingEduId(id); };
  const updateEducation = (id: string, field: string, value: string) => setData(prev => ({ ...prev, education: prev.education.map(e => (e.id || "") === id ? { ...e, [field]: value } : e) }));
  const removeEducation = (id: string) => setData(prev => ({ ...prev, education: prev.education.filter(e => (e.id || "") !== id) }));
  const addSkill = (s?: string) => { const val = (s || skillInput).trim(); if (val && !data.skills.includes(val)) { setData(prev => ({ ...prev, skills: [...prev.skills, val] })); if (!s) setSkillInput(""); } };
  const removeSkill = (s: string) => setData(prev => ({ ...prev, skills: prev.skills.filter(x => x !== s) }));
  const addCertification = () => { if (certInput.trim() && !data.certifications.includes(certInput.trim())) { setData(prev => ({ ...prev, certifications: [...prev.certifications, certInput.trim()] })); setCertInput(""); } };
  const removeCertification = (c: string) => setData(prev => ({ ...prev, certifications: prev.certifications.filter(x => x !== c) }));

  const summaryWordCount = data.summary.trim().split(/\s+/).filter(Boolean).length;
  const summaryCharCount = data.summary.trim().length;

  switch (wizardStep) {
    case "header":
      return (
        <div data-testid="wizard-step-header">
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">What&apos;s the best way for employers to contact you?</h2>
          <p className="text-base text-zinc-500 mb-8">We suggest including an email and phone number.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div><Label className={labelClass}>Full Name *</Label><Input className={inputClass} placeholder="John Smith" value={data.personalDetails.fullName} onChange={e => updatePersonal("fullName", e.target.value)} data-testid="personal-fullname" /></div>
            <div><Label className={labelClass}>Email *</Label><Input className={inputClass} type="email" placeholder="john@email.com" value={data.personalDetails.email} onChange={e => updatePersonal("email", e.target.value)} data-testid="personal-email" /></div>
            <div><Label className={labelClass}>Phone *</Label><Input className={inputClass} placeholder="(555) 123-4567" maxLength={15} value={data.personalDetails.phone} onChange={e => { const v = e.target.value.replace(/[^\d\s\-\+\(\)]/g, ""); updatePersonal("phone", v); }} data-testid="personal-phone" /></div>
            <div><Label className={labelClass}>Location</Label><Input className={inputClass} placeholder="San Francisco, CA" value={data.personalDetails.location} onChange={e => updatePersonal("location", e.target.value)} data-testid="personal-location" /></div>
            <div><Label className={labelClass}>LinkedIn</Label><Input className={inputClass} placeholder="linkedin.com/in/johnsmith" value={data.personalDetails.linkedin || ""} onChange={e => updatePersonal("linkedin", e.target.value)} data-testid="personal-linkedin" /></div>
            <div><Label className={labelClass}>Portfolio</Label><Input className={inputClass} placeholder="johnsmith.com" value={data.personalDetails.portfolio || ""} onChange={e => updatePersonal("portfolio", e.target.value)} data-testid="personal-portfolio" /></div>
          </div>
        </div>
      );
    case "experience":
      return (
        <div data-testid="wizard-step-experience">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold text-zinc-900">Here&apos;s an overview of your experience</h2>
            <button onClick={addExperience} className="h-10 px-5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-900 text-sm font-bold flex items-center gap-2 transition-colors" data-testid="add-experience-btn"><Plus className="w-4 h-4" /> Add experience</button>
          </div>
          <p className="text-base text-zinc-500 mb-6">Make edits as needed.</p>
          {data.experience.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
              <Briefcase className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-400 mb-4">No experience added yet</p>
              <button onClick={addExperience} className="bg-amber-500 hover:bg-amber-400 text-zinc-900 rounded-full h-11 px-6 text-sm font-bold" data-testid="add-exp-empty">Add experience</button>
            </div>
          )}
          <div className="space-y-3">
            {data.experience.map((exp, idx) => {
              const isEditing = editingExpId === exp.id;
              if (isEditing) {
                return (
                  <div key={exp.id!} className="bg-white border-2 border-blue-500 rounded-2xl p-6" data-testid={`exp-form-${exp.id!}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div><Label className={labelClass}>Job Title *</Label><Input className={inputClass} placeholder="Software Engineer" value={exp.title} onChange={e => updateExperience(exp.id!, "title", e.target.value)} data-testid={`exp-title-${exp.id!}`} /></div>
                      <div><Label className={labelClass}>Company *</Label><Input className={inputClass} placeholder="Acme Corp" value={exp.company} onChange={e => updateExperience(exp.id!, "company", e.target.value)} data-testid={`exp-company-${exp.id!}`} /></div>
                      <div><Label className={labelClass}>Location</Label><Input className={inputClass} placeholder="San Francisco, CA" value={exp.location} onChange={e => updateExperience(exp.id!, "location", e.target.value)} data-testid={`exp-location-${exp.id!}`} /></div>
                      <div className="flex gap-3">
                        <div className="flex-1"><Label className={labelClass}>Start Date</Label><Input className={inputClass} placeholder="Jan 2020" value={exp.startDate} onChange={e => updateExperience(exp.id!, "startDate", e.target.value)} data-testid={`exp-start-${exp.id!}`} /></div>
                        <div className="flex-1"><Label className={labelClass}>End Date</Label><Input className={inputClass} placeholder="Dec 2023" value={exp.endDate} disabled={exp.current} onChange={e => updateExperience(exp.id!, "endDate", e.target.value)} data-testid={`exp-end-${exp.id!}`} /></div>
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2"><Checkbox checked={exp.current} onCheckedChange={v => updateExperience(exp.id!, "current", !!v)} id={`c-${exp.id!}`} /><label htmlFor={`c-${exp.id!}`} className="text-sm text-zinc-600 cursor-pointer">I currently work here</label></div>
                      <div className="md:col-span-2">
                        <Label className={labelClass}>Description / Bullet Points</Label>
                        <Textarea className="min-h-[120px] p-4 text-sm bg-white border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={"- Led migration to microservices, reducing deploy time by 60%\n- Managed team of 5 engineers"} value={exp.description} onChange={e => updateExperience(exp.id!, "description", e.target.value)} data-testid={`exp-desc-${exp.id!}`} />
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" onClick={() => { const imp = smartRewriteBullets(exp.description); if (imp !== exp.description) { updateExperience(exp.id!, "description", imp); toast({ title: "Improved!" }); } }} disabled={!exp.description.trim()} className="h-8 px-3 text-xs gap-1 bg-teal-50 border-teal-200 text-teal-700" data-testid={`smart-improve-${exp.id!}`}><Wand2 className="w-3 h-3" /> Smart Improve</Button>
                          <Button variant="outline" onClick={() => aiImproveBullet(exp.id!, exp.description, exp.title)} disabled={aiLoading === `bullet-${exp.id!}` || !exp.description.trim() || aiRemaining <= 0} className="h-8 px-3 text-xs gap-1 border-violet-200 text-violet-700" data-testid={`ai-improve-${exp.id!}`}>
                            {aiLoading === `bullet-${exp.id!}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI Improve
                          </Button>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${aiRemaining > 0 ? "bg-violet-100 text-violet-600" : "bg-zinc-100 text-zinc-400"}`}>{aiRemaining}/{AI_FREE_TOTAL}</span>
                        </div>
                        {aiSuggestion?.id === `bullet-${exp.id!}` && (
                          <div className="mt-3 bg-violet-50 border border-violet-200 rounded-xl p-4" data-testid={`ai-suggestion-${exp.id!}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-violet-700 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Suggestion</span>
                              <div className="flex gap-1"><Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-emerald-600 hover:bg-emerald-50" onClick={acceptAiSuggestion}><Check className="w-3 h-3 mr-1" />Accept</Button><Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-red-600 hover:bg-red-50" onClick={dismissAiSuggestion}><X className="w-3 h-3 mr-1" />Dismiss</Button></div>
                            </div>
                            <p className="text-sm text-violet-900 whitespace-pre-line">{aiSuggestion.improved}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end"><button onClick={() => finishEditingExperience(exp.id!)} className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700" data-testid={`done-exp-${exp.id!}`}>Done editing</button></div>
                  </div>
                );
              }
              return (
                <div key={exp.id!} className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-sm transition-all" data-testid={`exp-card-${exp.id!}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-zinc-900">{exp.title || "Untitled"}{exp.company && `, ${exp.company}`}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                        {exp.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {exp.location}</span>}
                        {(exp.startDate || exp.endDate) && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {normalizeDate(exp.startDate)} – {exp.current ? "Present" : (normalizeDate(exp.endDate) || "—")}</span>}
                      </div>
                      {exp.description && <p className="mt-2 text-sm text-zinc-500 line-clamp-3 whitespace-pre-line">{exp.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-100">
                    <button onClick={() => setEditingExpId(exp.id!)} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium" data-testid={`edit-exp-${exp.id!}`}><Pencil className="w-3.5 h-3.5" /> Edit</button>
                    <button onClick={() => removeExperience(exp.id!)} className="text-sm text-blue-600 hover:text-red-500 flex items-center gap-1 font-medium" data-testid={`remove-exp-${exp.id!}`}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                    <button onClick={() => moveExperience(exp.id!, "up")} disabled={idx === 0} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium disabled:opacity-30" data-testid={`move-exp-${exp.id!}`}><ArrowUp className="w-3.5 h-3.5" /> Move</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    case "education":
      return (
        <div data-testid="wizard-step-education">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold text-zinc-900">Here&apos;s an overview of your education</h2>
            <button onClick={addEducation} className="h-10 px-5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-900 text-sm font-bold flex items-center gap-2" data-testid="add-education-btn"><Plus className="w-4 h-4" /> Add education</button>
          </div>
          <p className="text-base text-zinc-500 mb-6">Make edits as needed.</p>
          {data.education.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
              <GraduationCap className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-400 mb-4">No education added yet</p>
              <button onClick={addEducation} className="bg-amber-500 hover:bg-amber-400 text-zinc-900 rounded-full h-11 px-6 text-sm font-bold" data-testid="add-edu-empty">Add education</button>
            </div>
          )}
          <div className="space-y-3">
            {data.education.map((edu) => {
              const isEditing = editingEduId === edu.id;
              if (isEditing) {
                return (
                  <div key={edu.id!} className="bg-white border-2 border-blue-500 rounded-2xl p-6" data-testid={`edu-form-${edu.id!}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div className="md:col-span-2"><Label className={labelClass}>School / University *</Label><Input className={inputClass} placeholder="Stanford University" value={edu.school} onChange={e => updateEducation(edu.id!, "school", e.target.value)} data-testid={`edu-school-${edu.id!}`} /></div>
                      <div><Label className={labelClass}>Degree *</Label><Input className={inputClass} placeholder="Bachelor of Science" value={edu.degree} onChange={e => updateEducation(edu.id!, "degree", e.target.value)} data-testid={`edu-degree-${edu.id!}`} /></div>
                      <div><Label className={labelClass}>Field of Study</Label><Input className={inputClass} placeholder="Computer Science" value={edu.field} onChange={e => updateEducation(edu.id!, "field", e.target.value)} data-testid={`edu-field-${edu.id!}`} /></div>
                      <div><Label className={labelClass}>Start Date</Label><Input className={inputClass} placeholder="Sep 2016" value={edu.startDate} onChange={e => updateEducation(edu.id!, "startDate", e.target.value)} data-testid={`edu-start-${edu.id!}`} /></div>
                      <div><Label className={labelClass}>End Date</Label><Input className={inputClass} placeholder="Jun 2020" value={edu.endDate} onChange={e => updateEducation(edu.id!, "endDate", e.target.value)} data-testid={`edu-end-${edu.id!}`} /></div>
                    </div>
                    <div className="mt-4 flex justify-end"><button onClick={() => setEditingEduId(null)} className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700" data-testid={`done-edu-${edu.id!}`}>Done editing</button></div>
                  </div>
                );
              }
              return (
                <div key={edu.id!} className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-sm transition-all" data-testid={`edu-card-${edu.id!}`}>
                  <h3 className="text-base font-bold text-zinc-900">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</h3>
                  <p className="text-sm text-zinc-500 mt-0.5">{edu.school}</p>
                  {(edu.startDate || edu.endDate) && <p className="text-xs text-zinc-400 mt-1">{edu.startDate} - {edu.endDate}</p>}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-100">
                    <button onClick={() => setEditingEduId(edu.id!)} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium" data-testid={`edit-edu-${edu.id!}`}><Pencil className="w-3.5 h-3.5" /> Edit</button>
                    <button onClick={() => removeEducation(edu.id!)} className="text-sm text-blue-600 hover:text-red-500 flex items-center gap-1 font-medium" data-testid={`remove-edu-${edu.id!}`}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    case "skills":
      const jobTitle = data.experience[0]?.title || "";
      return (
        <div data-testid="wizard-step-skills">
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">What skills would you like to highlight?</h2>
          <p className="text-base text-zinc-500 mb-6">Add skills relevant to the job you want. We&apos;ll suggest some based on your experience.</p>
          <div className="flex gap-2 mb-4">
            <Input className={inputClass + " flex-1"} placeholder="Type a skill and press Enter..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())} data-testid="skill-input" />
            <button onClick={() => addSkill()} className="h-12 px-5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700" data-testid="add-skill-btn">Add</button>
          </div>
          {data.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {data.skills.map(s => (
                <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium" data-testid={`skill-tag-${s}`}>
                  {s}
                  <button onClick={() => removeSkill(s)} className="text-blue-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                </span>
              ))}
            </div>
          )}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> Suggested Skills{jobTitle && <span className="text-zinc-500 font-normal">for &ldquo;{jobTitle}&rdquo;</span>}</h3>
              <button onClick={fetchSkillSuggestions} disabled={skillSugLoading} className="h-8 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-900 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40" data-testid="suggest-skills-btn">
                {skillSugLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {skillSuggestions.length > 0 ? "Refresh" : "Get Suggestions"}
              </button>
            </div>
            {skillSuggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skillSuggestions.map(s => (
                  <button key={s} onClick={() => { addSkill(s); setSkillSuggestions(prev => prev.filter(x => x !== s)); }} className="px-3 py-1.5 rounded-full border border-amber-300 text-sm font-medium text-zinc-700 hover:bg-amber-200 transition-colors flex items-center gap-1" data-testid={`sug-skill-${s}`}>
                    <Plus className="w-3 h-3" /> {s}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">{jobTitle ? "Click \"Get Suggestions\" to see AI-recommended skills based on your job title." : "Add a job title in Experience first, then we can suggest relevant skills."}</p>
            )}
          </div>
        </div>
      );
    case "summary":
      return (
        <div data-testid="wizard-step-summary">
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">Craft your summary</h2>
          <p className="text-base text-zinc-500 mb-6">A strong summary highlights your key value in 2-3 sentences.</p>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-600" /> Prewritten options</h3>
            {summaryOptions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-zinc-500 mb-3">Let AI generate 3 professional summary options based on your profile.</p>
                <button onClick={generateSummaryOptions} disabled={summaryGenLoading || aiRemaining <= 0} className="h-10 px-6 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 inline-flex items-center gap-2" data-testid="generate-summary-btn">
                  {summaryGenLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate My Summary
                </button>
              </div>
            ) : (
              <div className="space-y-3" data-testid="summary-options">
                {summaryOptions.map((opt, i) => {
                  const labels = ["Refined for clarity", "Optimized for impact", "Focused on expertise"];
                  return (
                    <button key={i} onClick={() => { setData(prev => ({ ...prev, summary: opt })); setSummaryOptions([]); toast({ title: "Summary applied!" }); }} className="w-full text-left p-4 border border-blue-200 rounded-xl bg-white hover:border-blue-500 hover:shadow-md transition-all group" data-testid={`summary-option-${i}`}>
                      <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-full mb-2">{labels[i] || `Option ${i + 1}`}</span>
                      <p className="text-sm text-zinc-700 leading-relaxed">{opt}</p>
                    </button>
                  );
                })}
                <button onClick={() => setSummaryOptions([])} className="text-xs text-zinc-400 hover:text-zinc-600">Keep original</button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mb-2">
            <Label className={labelClass}>Your Summary</Label>
            <span
              className={`text-sm font-medium ${
                summaryCharCount > 600
                  ? "text-red-600"
                  : summaryCharCount > 500
                    ? "text-amber-600"
                    : summaryCharCount >= 200
                      ? "text-emerald-600"
                      : "text-zinc-400"
              }`}
              data-testid="summary-char-counter"
            >
              {summaryCharCount}/500 chars
            </span>
          </div>
          <Textarea className="min-h-[140px] p-4 text-sm bg-white border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Experienced professional with..." value={data.summary} onChange={e => setData(prev => ({ ...prev, summary: e.target.value }))} data-testid="personal-summary" />
          {summaryCharCount > 500 && (
            <div
              className={`mt-2 flex items-start gap-2 rounded-md border px-3 py-2 text-xs ${
                summaryCharCount > 600
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
              data-testid="summary-length-warning"
            >
              <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>
                {summaryCharCount > 600
                  ? "Your summary is too long — this hurts your ATS score. Trim to 4 lines."
                  : "Recruiters spend 6 seconds on a resume. Keep your summary under 4 lines."}
              </span>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <Button variant="outline" onClick={() => { const imp = smartRewriteSummary(data.summary, data.skills); if (imp !== data.summary) { setData(p => ({ ...p, summary: imp })); toast({ title: "Improved!" }); } }} disabled={!data.summary.trim()} className="h-9 text-xs gap-1 bg-teal-50 border-teal-200 text-teal-700" data-testid="smart-improve-summary-btn"><Wand2 className="w-3 h-3" /> Smart Improve</Button>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full self-center ${aiRemaining > 0 ? "bg-violet-100 text-violet-600" : "bg-zinc-100 text-zinc-400"}`}>{aiRemaining}/{AI_FREE_TOTAL} AI uses</span>
          </div>
        </div>
      );
    case "additional":
      return (
        <div data-testid="wizard-step-additional">
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">Review and add your details</h2>
          <p className="text-base text-zinc-500 mb-6">Highlight aspects that illustrate you&apos;re a well-rounded candidate.</p>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-bold text-zinc-900">Certifications & Licenses</h3>
              {data.certifications.length > 0 && <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Looks good</span>}
            </div>
            {data.certifications.length > 0 && (
              <div className="space-y-2 mb-3">
                {data.certifications.map(c => (
                  <div key={c} className="flex items-center justify-between px-3 py-2 bg-zinc-50 rounded-lg">
                    <span className="text-sm text-zinc-700">{c}</span>
                    <button onClick={() => removeCertification(c)} className="text-sm text-blue-600 hover:text-red-500 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input className={inputClass + " flex-1"} placeholder="e.g., PMP, AWS Certified, CPA" value={certInput} onChange={e => setCertInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCertification())} data-testid="cert-input" />
              <button onClick={addCertification} className="h-12 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700" data-testid="add-cert-btn">Add</button>
            </div>
          </div>
        </div>
      );
    case "finalize":
      return (
        <div data-testid="wizard-step-finalize">
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">Your resume is ready!</h2>
          <p className="text-base text-zinc-500 mb-6">Review the preview, then download your PDF.</p>
          <div className="flex gap-4 mb-6">
            <button onClick={handleDownloadPDF} className="flex-1 h-14 rounded-2xl bg-blue-600 text-white text-base font-bold hover:bg-blue-700 flex items-center justify-center gap-2" data-testid="resume-download-btn"><Download className="w-5 h-5" /> Download PDF</button>
            <button onClick={() => window.print()} className="h-14 px-6 rounded-2xl border-2 border-zinc-200 bg-white text-zinc-700 text-base font-medium hover:bg-zinc-50 flex items-center gap-2" data-testid="resume-print-btn"><Printer className="w-5 h-5" /> Print</button>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-zinc-700">
            <strong>Score: {scorePct}/100</strong> — {allFixes.length > 0 ? `${allFixes.length} improvement${allFixes.length > 1 ? "s" : ""} available.` : "Your resume looks great!"}
            {allFixes.length > 0 && (
              <button onClick={() => setFlowState("tips")} className="ml-2 text-blue-600 hover:underline font-medium">View Tips & Fixes</button>
            )}
          </div>
          <button onClick={handleReset} className="mt-4 text-sm text-zinc-400 hover:text-red-500 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Start over</button>
        </div>
      );
    default: return null;
  }
}

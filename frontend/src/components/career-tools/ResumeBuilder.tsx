import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw } from "lucide-react";
import { saveToStorage, loadFromStorage, clearStorage } from "@/lib/career-tools/storage";
import { generateResumePDF, type ResumeData } from "@/lib/career-tools/pdf-export";
import { useToast } from "@/hooks/use-toast";
import { analyzeBulletPoints, analyzeSummary, smartRewriteBullets, smartRewriteSummary, canUseAi, recordAiUsage, getAiRemaining, AI_FREE_TOTAL } from "@/lib/career-tools/smartSuggestions";
import { calculateResumeScore, type ScoreSuggestion } from "@/lib/career-tools/resumeScore";
import type { Experience, Education, AiSuggestion } from "./resume/types";
import { ResumeScorePanel } from "./resume/ResumeScorePanel";
import { ResumePreview } from "./resume/ResumePreview";
import { PersonalTab } from "./resume/PersonalTab";
import { ExperienceTab } from "./resume/ExperienceTab";
import { EducationTab } from "./resume/EducationTab";
import { SkillsTab, ExtrasTab } from "./resume/SkillsExtrasTab";

const STORAGE_KEY = "resume_builder";

const defaultResumeData: ResumeData = {
  personalDetails: { fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  certifications: [],
};

const templates = [
  { id: "clean", name: "Clean", desc: "Simple ATS-friendly", premium: false },
  { id: "professional", name: "Professional", desc: "Traditional business", premium: false },
  { id: "minimal", name: "Minimal", desc: "Maximum whitespace", premium: false },
  { id: "executive", name: "Executive", desc: "Bold header with accent", premium: true },
  { id: "modern", name: "Modern", desc: "Two-column layout", premium: true },
];

export function ResumeBuilder() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal");
  const [template, setTemplate] = useState("clean");
  const [data, setData] = useState<ResumeData>(() => loadFromStorage(STORAGE_KEY, defaultResumeData));
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [aiRemaining, setAiRemaining] = useState(getAiRemaining());

  // Auto-save
  useEffect(() => {
    const timeout = setTimeout(() => saveToStorage(STORAGE_KEY, data), 500);
    return () => clearTimeout(timeout);
  }, [data]);

  // ─── Data updaters ────────────────────────────────────────
  const updatePersonal = (field: keyof ResumeData["personalDetails"], value: string) => {
    setData(prev => ({ ...prev, personalDetails: { ...prev.personalDetails, [field]: value } }));
  };

  const addExperience = () => {
    const newExp: Experience = { id: Date.now().toString(), title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" };
    setData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setData(prev => ({ ...prev, experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp) }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
  };

  const addEducation = () => {
    const newEdu: Education = { id: Date.now().toString(), school: "", degree: "", field: "", startDate: "", endDate: "" };
    setData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setData(prev => ({ ...prev, education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu) }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !data.skills.includes(skillInput.trim())) {
      setData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => setData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));

  const addCertification = () => {
    if (certInput.trim() && !data.certifications.includes(certInput.trim())) {
      setData(prev => ({ ...prev, certifications: [...prev.certifications, certInput.trim()] }));
      setCertInput("");
    }
  };

  const removeCertification = (cert: string) => setData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c !== cert) }));

  const handleReset = () => {
    if (confirm("Are you sure you want to clear all resume data?")) {
      setData(defaultResumeData);
      clearStorage(STORAGE_KEY);
      toast({ title: "Resume cleared", description: "All data has been reset." });
    }
  };

  const handleDownloadPDF = () => {
    const pdf = generateResumePDF(data, template);
    pdf.save(`${data.personalDetails.fullName || "resume"}_resume.pdf`.replace(/\s+/g, "_"));
    toast({ title: "PDF Downloaded", description: "Your resume has been saved." });
  };

  // ─── AI / Smart Improve ───────────────────────────────────
  const bulletSuggestions = useMemo(() => {
    const map: Record<string, ReturnType<typeof analyzeBulletPoints>> = {};
    data.experience.forEach(exp => {
      if (exp.id && exp.description.trim()) map[exp.id] = analyzeBulletPoints(exp.description);
    });
    return map;
  }, [data.experience]);

  const summarySuggestions = useMemo(() => {
    return data.summary.trim() ? analyzeSummary(data.summary, data.skills) : [];
  }, [data.summary, data.skills]);

  const smartImproveBullet = (expId: string, text: string) => {
    if (!text.trim()) return;
    const improved = smartRewriteBullets(text);
    if (improved !== text) {
      updateExperience(expId, "description", improved);
      toast({ title: "Smart Improve applied!", description: "Text improved using writing rules." });
    } else {
      toast({ title: "Already looks good!", description: "No changes needed — try adding more detail." });
    }
  };

  const smartImproveSummary = () => {
    if (!data.summary.trim()) return;
    const improved = smartRewriteSummary(data.summary, data.skills);
    if (improved !== data.summary) {
      setData(prev => ({ ...prev, summary: improved }));
      toast({ title: "Smart Improve applied!", description: "Summary improved using writing rules." });
    } else {
      toast({ title: "Already looks good!", description: "No changes needed — try adding more detail." });
    }
  };

  const aiImproveBullet = async (expId: string, bulletText: string, jobTitle: string) => {
    if (!bulletText.trim()) { toast({ title: "Empty field", description: "Write bullet points first." }); return; }
    if (!canUseAi()) { toast({ title: "AI limit reached", description: "Use Smart Improve instead — it's free and unlimited!" }); return; }
    setAiLoading(`bullet-${expId}`);
    setAiSuggestion(null);
    try {
      const res = await fetch(`${import.meta.env.REACT_APP_BACKEND_URL}/api/career-tools/improve-bullet`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bullet_point: bulletText, job_title: jobTitle }) });
      if (!res.ok) throw new Error("AI service unavailable");
      const result = await res.json();
      recordAiUsage();
      setAiRemaining(getAiRemaining());
      setAiSuggestion({ id: `bullet-${expId}`, original: bulletText, improved: result.improved, suggestions: result.suggestions });
    } catch { toast({ title: "AI Error", description: "Could not reach AI. Try Smart Improve instead.", variant: "destructive" }); }
    finally { setAiLoading(null); }
  };

  const aiImproveSummary = async () => {
    if (!data.summary.trim()) { toast({ title: "Empty summary", description: "Write a summary first." }); return; }
    if (!canUseAi()) { toast({ title: "AI limit reached", description: "Use Smart Improve instead — it's free and unlimited!" }); return; }
    setAiLoading("summary");
    setAiSuggestion(null);
    try {
      const res = await fetch(`${import.meta.env.REACT_APP_BACKEND_URL}/api/career-tools/improve-summary`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current_summary: data.summary, job_title: data.experience[0]?.title || "", skills: data.skills.slice(0, 5) }) });
      if (!res.ok) throw new Error("AI service unavailable");
      const result = await res.json();
      recordAiUsage();
      setAiRemaining(getAiRemaining());
      setAiSuggestion({ id: "summary", original: data.summary, improved: result.improved });
    } catch { toast({ title: "AI Error", description: "Could not reach AI. Try Smart Improve instead.", variant: "destructive" }); }
    finally { setAiLoading(null); }
  };

  const acceptAiSuggestion = () => {
    if (!aiSuggestion) return;
    if (aiSuggestion.id === "summary") {
      setData(prev => ({ ...prev, summary: aiSuggestion.improved }));
    } else {
      updateExperience(aiSuggestion.id.replace("bullet-", ""), "description", aiSuggestion.improved);
    }
    toast({ title: "Applied!", description: "AI suggestion has been applied." });
    setAiSuggestion(null);
  };

  const dismissAiSuggestion = () => setAiSuggestion(null);

  // ─── Score ────────────────────────────────────────────────
  const score = useMemo(() => calculateResumeScore(data), [data]);
  const summaryWordCount = data.summary.trim().split(/\s+/).filter(Boolean).length;

  const handleFixAction = (action: ScoreSuggestion["fixAction"]) => {
    if (!action) return;
    switch (action) {
      case "add-summary": setActiveTab("personal"); break;
      case "add-experience": setActiveTab("experience"); addExperience(); break;
      case "add-skills": setActiveTab("skills"); break;
      case "add-education": setActiveTab("education"); addEducation(); break;
      case "improve-bullets": case "add-metrics": case "trim-bullets": setActiveTab("experience"); break;
    }
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Build Your Resume</h2>
          <Button variant="outline" size="sm" onClick={handleReset} data-testid="resume-reset-btn">
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
        </div>

        {/* Template Selection */}
        <div className="bg-muted/30 rounded-lg p-4">
          <Label className="text-sm font-semibold mb-3 block">Choose Template</Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {templates.map(t => (
              <button key={t.id} onClick={() => setTemplate(t.id)} className={`p-2.5 rounded-lg border text-left transition-all relative ${template === t.id ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-gray-300"}`} data-testid={`template-${t.id}`}>
                {t.premium && <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
                <div className="text-xs font-semibold">{t.name}</div>
                <div className="text-[10px] text-muted-foreground">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="personal" className="text-xs">Personal</TabsTrigger>
            <TabsTrigger value="experience" className="text-xs">Experience</TabsTrigger>
            <TabsTrigger value="education" className="text-xs">Education</TabsTrigger>
            <TabsTrigger value="skills" className="text-xs">Skills</TabsTrigger>
            <TabsTrigger value="extras" className="text-xs">Extras</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <PersonalTab
              personalDetails={data.personalDetails}
              summary={data.summary}
              summaryWordCount={summaryWordCount}
              onUpdatePersonal={updatePersonal}
              onUpdateSummary={v => setData(prev => ({ ...prev, summary: v }))}
              onSmartImproveSummary={smartImproveSummary}
              onAiImproveSummary={aiImproveSummary}
              aiLoading={aiLoading}
              aiSuggestion={aiSuggestion}
              aiRemaining={aiRemaining}
              aiTotal={AI_FREE_TOTAL}
              onAcceptAi={acceptAiSuggestion}
              onDismissAi={dismissAiSuggestion}
              summarySuggestions={summarySuggestions}
            />
          </TabsContent>

          <TabsContent value="experience">
            <ExperienceTab
              experience={data.experience as Experience[]}
              onAdd={addExperience}
              onUpdate={updateExperience}
              onRemove={removeExperience}
              onSmartImproveBullet={smartImproveBullet}
              onAiImproveBullet={aiImproveBullet}
              aiLoading={aiLoading}
              aiSuggestion={aiSuggestion}
              aiRemaining={aiRemaining}
              aiTotal={AI_FREE_TOTAL}
              onAcceptAi={acceptAiSuggestion}
              onDismissAi={dismissAiSuggestion}
              bulletSuggestions={bulletSuggestions}
            />
          </TabsContent>

          <TabsContent value="education">
            <EducationTab
              education={data.education as Education[]}
              onAdd={addEducation}
              onUpdate={updateEducation}
              onRemove={removeEducation}
            />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsTab
              skills={data.skills}
              skillInput={skillInput}
              onSkillInputChange={setSkillInput}
              onAddSkill={addSkill}
              onRemoveSkill={removeSkill}
            />
          </TabsContent>

          <TabsContent value="extras">
            <ExtrasTab
              certifications={data.certifications}
              certInput={certInput}
              onCertInputChange={setCertInput}
              onAddCert={addCertification}
              onRemoveCert={removeCertification}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Column: Score + Preview */}
      <div className="space-y-6">
        <ResumeScorePanel score={score} onFixAction={handleFixAction} />
        <ResumePreview data={data} onPrint={() => window.print()} onDownloadPDF={handleDownloadPDF} />
      </div>
    </div>
  );
}

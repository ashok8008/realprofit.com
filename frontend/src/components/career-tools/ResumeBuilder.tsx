"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Upload, User, Briefcase, GraduationCap, Wrench, Award } from "lucide-react";
import { saveToStorage, loadFromStorage, clearStorage } from "@/lib/career-tools/storage";
import { generateResumePDF, type ResumeData } from "@/lib/career-tools/pdf-export";
import { useToast } from "@/hooks/use-toast";
import { analyzeBulletPoints, analyzeSummary, smartRewriteBullets, smartRewriteSummary, canUseAi, recordAiUsage, getAiRemaining, AI_FREE_TOTAL } from "@/lib/career-tools/smartSuggestions";
import type { Experience, Education, AiSuggestion } from "./resume/types";
import { ResumeScorePanelV2 } from "./resume/ResumeScorePanel";
import { ResumePreview } from "./resume/ResumePreview";
import { PersonalTab } from "./resume/PersonalTab";
import { ExperienceTab } from "./resume/ExperienceTab";
import { EducationTab } from "./resume/EducationTab";
import { SkillsTab, ExtrasTab } from "./resume/SkillsExtrasTab";
import { ImportEntry } from "./resume/ImportEntry";
import { ImportProcessing } from "./resume/ImportProcessing";
import { ImportReview } from "./resume/ImportReview";
import { fixAllEasyIssues } from "@/lib/career-tools/resume/improve";
import type { SectionConfidence } from "@/lib/career-tools/resume/import/types";

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

const TAB_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  personal: User,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
  extras: Award,
};

type FlowState = "entry" | "processing" | "review" | "editor";

export function ResumeBuilder() {
  const { toast } = useToast();
  const [flowState, setFlowState] = useState<FlowState>("entry");
  const [activeTab, setActiveTab] = useState("personal");
  const [template, setTemplate] = useState("clean");
  const [data, setData] = useState<ResumeData>(defaultResumeData);
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [aiRemaining, setAiRemaining] = useState(getAiRemaining());
  const [importSource, setImportSource] = useState<"docx" | "pdf" | "text">("text");
  const [confidences, setConfidences] = useState<SectionConfidence[]>([]);

  // Load saved data on mount — if data exists, skip to editor
  useEffect(() => {
    const saved = loadFromStorage<ResumeData | null>(STORAGE_KEY, null as unknown as ResumeData);
    if (saved && (saved.personalDetails?.fullName || saved.experience?.length > 0 || saved.summary)) {
      setData(saved);
      setFlowState("editor");
    }
  }, []);

  // Auto-save when in editor mode
  useEffect(() => {
    if (flowState === "editor") {
      const timeout = setTimeout(() => saveToStorage(STORAGE_KEY, data), 500);
      return () => clearTimeout(timeout);
    }
  }, [data, flowState]);

  // ─── Import handlers ───────────────────────────────────────
  const handleFileImport = useCallback(async (file: File) => {
    const ext = file.name.toLowerCase();
    const source = ext.endsWith(".docx") ? "docx" as const : "pdf" as const;
    setImportSource(source);
    setFlowState("processing");

    try {
      if (source === "docx") {
        const { parseDocx } = await import("@/lib/career-tools/resume/import/docxParser");
        const result = await parseDocx(file);
        setData(result.data);
        setConfidences(result.confidences);
      } else {
        const { parsePdf } = await import("@/lib/career-tools/resume/import/pdfParser");
        const result = await parsePdf(file);
        setData(result.data);
        setConfidences(result.confidences);
      }
    } catch (err) {
      console.error("Import failed:", err);
      toast({ title: "Import failed", description: "Could not parse the file. Try pasting the text instead.", variant: "destructive" });
      setFlowState("entry");
    }
  }, [toast]);

  const handleTextImport = useCallback((text: string) => {
    setImportSource("text");
    setFlowState("processing");

    setTimeout(() => {
      try {
        const { parseText } = require("@/lib/career-tools/resume/import/textParser");
        const result = parseText(text);
        setData(result.data);
        setConfidences(result.confidences);
      } catch (err) {
        console.error("Text parse failed:", err);
        toast({ title: "Parse failed", description: "Could not parse the text. Try starting from scratch.", variant: "destructive" });
        setFlowState("entry");
      }
    }, 100);
  }, [toast]);

  const handleStartScratch = useCallback(() => {
    setData(defaultResumeData);
    setFlowState("editor");
  }, []);

  const handleProcessingComplete = useCallback(() => {
    setFlowState("review");
  }, []);

  const handleReviewContinue = useCallback(() => {
    setFlowState("editor");
    toast({ title: "Resume imported!", description: "Review and edit each section. Score updates in real-time." });
  }, [toast]);

  const handleNewImport = useCallback(() => {
    setFlowState("entry");
    setConfidences([]);
  }, []);

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
      setFlowState("entry");
      setConfidences([]);
      toast({ title: "Resume cleared", description: "All data has been reset." });
    }
  };

  const handleDownloadPDF = () => {
    const pdf = generateResumePDF(data, template);
    pdf.save(`${data.personalDetails.fullName || "resume"}_resume.pdf`.replace(/\s+/g, "_"));
    toast({ title: "PDF Downloaded", description: "Your resume has been saved." });
  };

  // ─── Fix All Easy Issues ──────────────────────────────────
  const handleFixAll = () => {
    const fixes = fixAllEasyIssues({
      summary: data.summary,
      experience: data.experience.map(e => ({ description: e.description })),
      skills: data.skills,
    });
    setData(prev => ({
      ...prev,
      summary: fixes.summary,
      experience: prev.experience.map((e, i) => ({ ...e, description: fixes.experiences[i] || e.description })),
      skills: fixes.skills,
    }));
    toast({ title: "Easy fixes applied!", description: "Action verbs, metrics placeholders, and skill normalization applied." });
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/career-tools/improve-bullet`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bullet_point: bulletText, job_title: jobTitle }) });
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/career-tools/improve-summary`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current_summary: data.summary, job_title: data.experience[0]?.title || "", skills: data.skills.slice(0, 5) }) });
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

  const summaryWordCount = data.summary.trim().split(/\s+/).filter(Boolean).length;

  // ─── Render ───────────────────────────────────────────────

  // Entry state: show import options
  if (flowState === "entry") {
    return (
      <div className="max-w-4xl mx-auto" data-testid="resume-builder-entry">
        <ImportEntry onFileImport={handleFileImport} onTextImport={handleTextImport} onStartScratch={handleStartScratch} />
      </div>
    );
  }

  // Processing state: animated loader
  if (flowState === "processing") {
    return (
      <div className="max-w-md mx-auto" data-testid="resume-builder-processing">
        <ImportProcessing source={importSource} onComplete={handleProcessingComplete} />
      </div>
    );
  }

  // Review state: confidence summary
  if (flowState === "review") {
    return (
      <div className="max-w-4xl mx-auto" data-testid="resume-builder-review">
        <ImportReview confidences={confidences} source={importSource} onContinue={handleReviewContinue} />
      </div>
    );
  }

  // ─── Editor: Premium 2-Column Layout ──────────────────────
  return (
    <div data-testid="resume-builder-editor">
      {/* Top bar: actions */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Resume Editor</h2>
          <p className="text-xs text-gray-400 mt-0.5">Auto-saved as you type</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleNewImport} className="h-8 text-xs text-gray-500 hover:text-gray-700" data-testid="new-import-btn">
            <Upload className="w-3.5 h-3.5 mr-1.5" /> Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-xs text-gray-500 hover:text-red-600" data-testid="resume-reset-btn">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
          </Button>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
        {/* ─── LEFT COLUMN: Editor ─── */}
        <div className="min-w-0">
          {/* Template Picker */}
          <div className="mb-5">
            <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2.5 block">Template</Label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`relative flex-shrink-0 px-4 py-2 rounded-lg border text-left transition-all ${
                    template === t.id
                      ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  data-testid={`template-${t.id}`}
                >
                  {t.premium && (
                    <span className={`absolute -top-1.5 -right-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      template === t.id ? "bg-white text-gray-900" : "bg-gray-900 text-white"
                    }`}>PRO</span>
                  )}
                  <div className="text-xs font-semibold">{t.name}</div>
                  <div className={`text-[10px] mt-0.5 ${template === t.id ? "text-gray-300" : "text-gray-400"}`}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-5 bg-gray-50 border border-gray-100 rounded-lg p-0.5 h-auto">
              {(["personal", "experience", "education", "skills", "extras"] as const).map(tab => {
                const Icon = TAB_ICONS[tab];
                return (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="text-xs py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-500 flex items-center gap-1.5 transition-all"
                    data-testid={`tab-${tab}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline capitalize">{tab}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="mt-4">
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
            </div>
          </Tabs>
        </div>

        {/* ─── RIGHT COLUMN: Sticky Score + Preview + Export ─── */}
        <div className="xl:sticky xl:top-20 h-fit space-y-5">
          <ResumeScorePanelV2
            resumeData={data}
            onFixAll={handleFixAll}
            onTabSwitch={setActiveTab}
          />
          <ResumePreview data={data} onPrint={() => window.print()} onDownloadPDF={handleDownloadPDF} />
        </div>
      </div>
    </div>
  );
}

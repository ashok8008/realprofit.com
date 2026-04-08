"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Upload, User, Briefcase, GraduationCap, Wrench, Award, ChevronLeft, Download } from "lucide-react";
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
import Link from "next/link";

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
  { id: "executive", name: "Executive", desc: "Bold header", premium: true },
  { id: "modern", name: "Modern", desc: "Two-column", premium: true },
];

const STEPS = [
  { key: "personal", label: "Personal", icon: User },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Wrench },
  { key: "extras", label: "Extras", icon: Award },
] as const;

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

  useEffect(() => {
    const saved = loadFromStorage<ResumeData | null>(STORAGE_KEY, null as unknown as ResumeData);
    if (saved && (saved.personalDetails?.fullName || saved.experience?.length > 0 || saved.summary)) {
      setData(saved);
      setFlowState("editor");
    }
  }, []);

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

  const handleProcessingComplete = useCallback(() => { setFlowState("review"); }, []);

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

  const currentStepIndex = STEPS.findIndex(s => s.key === activeTab);

  // ─── Render: Entry / Processing / Review ──────────────────
  if (flowState === "entry") {
    return <div data-testid="resume-builder-entry"><ImportEntry onFileImport={handleFileImport} onTextImport={handleTextImport} onStartScratch={handleStartScratch} /></div>;
  }
  if (flowState === "processing") {
    return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center" data-testid="resume-builder-processing"><div className="max-w-md w-full"><ImportProcessing source={importSource} onComplete={handleProcessingComplete} /></div></div>;
  }
  if (flowState === "review") {
    return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4" data-testid="resume-builder-review"><div className="max-w-4xl w-full"><ImportReview confidences={confidences} source={importSource} onContinue={handleReviewContinue} /></div></div>;
  }

  // ─── Render: Full-Screen Editor ───────────────────────────
  return (
    <div className="min-h-[calc(100vh-64px)] flex" data-testid="resume-builder-editor">
      {/* ─── Left Sidebar: Dark Navy ─── */}
      <aside className="hidden lg:flex flex-col w-[220px] bg-[#1a2b5e] text-white flex-shrink-0">
        {/* Logo / Back */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/career-tools" className="text-xs text-white/50 hover:text-white/80 transition-colors flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Career Tools
          </Link>
          <h2 className="text-base font-bold mt-2">Resume Builder</h2>
        </div>

        {/* Step Navigation */}
        <nav className="flex-1 px-3 py-4">
          <p className="text-[10px] uppercase tracking-widest text-white/30 px-3 mb-3">Sections</p>
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeTab === step.key;
            const isPast = idx < currentStepIndex;
            return (
              <button
                key={step.key}
                onClick={() => setActiveTab(step.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all mb-1 ${
                  isActive
                    ? "bg-white/15 text-white font-semibold"
                    : isPast
                    ? "text-white/60 hover:bg-white/5 hover:text-white/80"
                    : "text-white/35 hover:bg-white/5 hover:text-white/60"
                }`}
                data-testid={`sidebar-step-${step.key}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isActive ? "bg-white/20" : isPast ? "bg-white/10" : "bg-white/5"
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {step.label}
              </button>
            );
          })}
        </nav>

        {/* Template selector (compact) */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Template</p>
          <div className="grid grid-cols-2 gap-1.5">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`relative px-2 py-1.5 rounded text-[10px] text-left transition-all ${
                  template === t.id
                    ? "bg-white text-[#1a2b5e] font-bold"
                    : "bg-white/8 text-white/50 hover:bg-white/12 hover:text-white/70"
                }`}
                data-testid={`template-${t.id}`}
              >
                {t.name}
                {t.premium && <span className="absolute -top-1 -right-1 bg-amber-400 text-[7px] text-amber-900 px-1 rounded-full font-bold">PRO</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="px-5 py-4 border-t border-white/10 space-y-2">
          <button onClick={handleNewImport} className="w-full text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-2 py-1" data-testid="new-import-btn">
            <Upload className="w-3.5 h-3.5" /> Import New
          </button>
          <button onClick={handleReset} className="w-full text-xs text-white/40 hover:text-red-300 transition-colors flex items-center gap-2 py-1" data-testid="resume-reset-btn">
            <RotateCcw className="w-3.5 h-3.5" /> Reset All
          </button>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top progress bar */}
        <div className="bg-[#e8f0fd] border-b border-blue-100">
          <div className="flex items-center px-6 py-3">
            {/* Mobile: back button */}
            <Link href="/career-tools" className="lg:hidden mr-3 text-gray-500 hover:text-gray-700">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            {/* Progress steps (horizontal) */}
            <div className="flex items-center gap-1 flex-1">
              {STEPS.map((step, idx) => {
                const isActive = activeTab === step.key;
                const isPast = idx < currentStepIndex;
                return (
                  <React.Fragment key={step.key}>
                    {idx > 0 && <div className={`h-px flex-1 max-w-[40px] ${isPast ? "bg-[#1a2b5e]" : "bg-blue-200"}`} />}
                    <button
                      onClick={() => setActiveTab(step.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#1a2b5e] text-white shadow-sm"
                          : isPast
                          ? "text-[#1a2b5e] font-semibold"
                          : "text-gray-400"
                      }`}
                      data-testid={`tab-${step.key}`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive ? "bg-white/20 text-white" : isPast ? "bg-[#1a2b5e]/10 text-[#1a2b5e]" : "bg-gray-200 text-gray-400"
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="hidden sm:inline">{step.label}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
            {/* Download button in top bar */}
            <Button size="sm" onClick={handleDownloadPDF} className="ml-4 h-8 text-xs px-4 bg-[#1a2b5e] hover:bg-[#15224d] text-white" data-testid="resume-download-btn">
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
            </Button>
          </div>
        </div>

        {/* Content grid: Form + Right Panel */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_380px] overflow-hidden">
          {/* Form area */}
          <div className="overflow-y-auto p-6 lg:p-8">
            {/* Mobile-only template + actions */}
            <div className="lg:hidden mb-5 flex items-center gap-2 overflow-x-auto pb-2">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`relative flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    template === t.id ? "border-[#1a2b5e] bg-[#1a2b5e] text-white" : "border-gray-200 text-gray-500"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Hidden TabsList — navigation is handled by sidebar & top bar */}
              <TabsList className="sr-only">
                {STEPS.map(s => <TabsTrigger key={s.key} value={s.key}>{s.label}</TabsTrigger>)}
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

            {/* Continue / Back navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  const prev = STEPS[currentStepIndex - 1];
                  if (prev) setActiveTab(prev.key);
                }}
                disabled={currentStepIndex === 0}
                className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                data-testid="step-back-btn"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => {
                  const next = STEPS[currentStepIndex + 1];
                  if (next) setActiveTab(next.key);
                }}
                disabled={currentStepIndex === STEPS.length - 1}
                className="bg-[#1a2b5e] text-white hover:bg-[#15224d] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors inline-flex items-center gap-2"
                data-testid="step-continue-btn"
              >
                Continue <span className="text-white/50 text-xs">({currentStepIndex + 1}/{STEPS.length})</span>
              </button>
            </div>
          </div>

          {/* ─── Right Panel: Score + Preview ─── */}
          <div className="hidden xl:block overflow-y-auto border-l border-gray-100 bg-slate-50/50 p-5">
            <ResumeScorePanelV2
              resumeData={data}
              onFixAll={handleFixAll}
              onTabSwitch={setActiveTab}
            />
            <div className="mt-5">
              <ResumePreview data={data} onPrint={() => window.print()} onDownloadPDF={handleDownloadPDF} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

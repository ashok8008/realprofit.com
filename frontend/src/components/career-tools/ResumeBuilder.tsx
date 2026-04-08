"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Upload, User, Briefcase, GraduationCap, Wrench, Award, ChevronLeft, ChevronRight, Download, Printer, PanelLeftClose, PanelLeft, X, Shield, Eye, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { saveToStorage, loadFromStorage, clearStorage } from "@/lib/career-tools/storage";
import { generateResumePDF, type ResumeData } from "@/lib/career-tools/pdf-export";
import { useToast } from "@/hooks/use-toast";
import { analyzeBulletPoints, analyzeSummary, smartRewriteBullets, smartRewriteSummary, canUseAi, recordAiUsage, getAiRemaining, AI_FREE_TOTAL } from "@/lib/career-tools/smartSuggestions";
import type { Experience, Education, AiSuggestion } from "./resume/types";
import { ResumePreview } from "./resume/ResumePreview";
import { PersonalTab } from "./resume/PersonalTab";
import { ExperienceTab } from "./resume/ExperienceTab";
import { EducationTab } from "./resume/EducationTab";
import { SkillsTab, ExtrasTab } from "./resume/SkillsExtrasTab";
import { ImportEntry } from "./resume/ImportEntry";
import { ImportProcessing } from "./resume/ImportProcessing";
import { ImportReview } from "./resume/ImportReview";
import { fixAllEasyIssues } from "@/lib/career-tools/resume/improve";
import { calculateResumeScore } from "@/lib/career-tools/resume/score";
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
  { id: "clean", name: "Clean", premium: false },
  { id: "professional", name: "Professional", premium: false },
  { id: "minimal", name: "Minimal", premium: false },
  { id: "executive", name: "Executive", premium: true },
  { id: "modern", name: "Modern", premium: true },
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [atsBarVisible, setAtsBarVisible] = useState(true);

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

  // Auto-collapse ATS bar after 6 seconds
  useEffect(() => {
    if (flowState === "editor" && atsBarVisible) {
      const timer = setTimeout(() => setAtsBarVisible(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [flowState, atsBarVisible]);

  // Score computation
  const scoreResult = useMemo(() => calculateResumeScore(data), [data]);

  const scoreGroups = useMemo(() => {
    const groups = [
      { key: "ats", label: "ATS Readiness", icon: Shield, cats: ["ats", "structure"] },
      { key: "readability", label: "Readability", icon: Eye, cats: ["completeness", "presence"] },
      { key: "impact", label: "Impact", icon: TrendingUp, cats: ["experience", "impact", "skills"] },
    ];
    return groups.map(g => {
      let score = 0, max = 0;
      g.cats.forEach(cat => {
        const b = scoreResult.breakdown[cat as keyof typeof scoreResult.breakdown];
        if (b) { score += b.score; max += b.max; }
      });
      return { ...g, score, max, pct: max > 0 ? Math.round((score / max) * 100) : 0 };
    });
  }, [scoreResult]);

  const quickFixes = useMemo(() => {
    return scoreResult.suggestions.filter(s => s.severity === "critical" || s.severity === "high").slice(0, 3);
  }, [scoreResult]);

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
        setData(result.data); setConfidences(result.confidences);
      } else {
        const { parsePdf } = await import("@/lib/career-tools/resume/import/pdfParser");
        const result = await parsePdf(file);
        setData(result.data); setConfidences(result.confidences);
      }
    } catch {
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
        setData(result.data); setConfidences(result.confidences);
      } catch {
        toast({ title: "Parse failed", description: "Could not parse the text.", variant: "destructive" });
        setFlowState("entry");
      }
    }, 100);
  }, [toast]);

  const handleStartScratch = useCallback(() => { setData(defaultResumeData); setFlowState("editor"); }, []);
  const handleProcessingComplete = useCallback(() => setFlowState("review"), []);
  const handleReviewContinue = useCallback(() => { setFlowState("editor"); toast({ title: "Resume imported!", description: "Review each section. Score updates in real-time." }); }, [toast]);
  const handleNewImport = useCallback(() => { setFlowState("entry"); setConfidences([]); }, []);

  // ─── Data updaters ────────────────────────────────────────
  const updatePersonal = (field: keyof ResumeData["personalDetails"], value: string) => {
    setData(prev => ({ ...prev, personalDetails: { ...prev.personalDetails, [field]: value } }));
  };
  const addExperience = () => {
    setData(prev => ({ ...prev, experience: [...prev.experience, { id: Date.now().toString(), title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }] }));
  };
  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setData(prev => ({ ...prev, experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp) }));
  };
  const removeExperience = (id: string) => setData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
  const addEducation = () => {
    setData(prev => ({ ...prev, education: [...prev.education, { id: Date.now().toString(), school: "", degree: "", field: "", startDate: "", endDate: "" }] }));
  };
  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setData(prev => ({ ...prev, education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu) }));
  };
  const removeEducation = (id: string) => setData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
  const addSkill = () => {
    if (skillInput.trim() && !data.skills.includes(skillInput.trim())) {
      setData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] })); setSkillInput("");
    }
  };
  const removeSkill = (skill: string) => setData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  const addCertification = () => {
    if (certInput.trim() && !data.certifications.includes(certInput.trim())) {
      setData(prev => ({ ...prev, certifications: [...prev.certifications, certInput.trim()] })); setCertInput("");
    }
  };
  const removeCertification = (cert: string) => setData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c !== cert) }));

  const handleReset = () => {
    if (confirm("Clear all resume data?")) {
      setData(defaultResumeData); clearStorage(STORAGE_KEY); setFlowState("entry"); setConfidences([]);
      toast({ title: "Resume cleared" });
    }
  };

  const handleDownloadPDF = () => {
    const pdf = generateResumePDF(data, template);
    pdf.save(`${data.personalDetails.fullName || "resume"}_resume.pdf`.replace(/\s+/g, "_"));
    toast({ title: "PDF Downloaded" });
  };

  const handleFixAll = () => {
    const fixes = fixAllEasyIssues({ summary: data.summary, experience: data.experience.map(e => ({ description: e.description })), skills: data.skills });
    setData(prev => ({ ...prev, summary: fixes.summary, experience: prev.experience.map((e, i) => ({ ...e, description: fixes.experiences[i] || e.description })), skills: fixes.skills }));
    toast({ title: "Easy fixes applied!" });
  };

  // ─── AI / Smart Improve ───────────────────────────────────
  const bulletSuggestions = useMemo(() => {
    const map: Record<string, ReturnType<typeof analyzeBulletPoints>> = {};
    data.experience.forEach(exp => { if (exp.id && exp.description.trim()) map[exp.id] = analyzeBulletPoints(exp.description); });
    return map;
  }, [data.experience]);
  const summarySuggestions = useMemo(() => data.summary.trim() ? analyzeSummary(data.summary, data.skills) : [], [data.summary, data.skills]);

  const smartImproveBullet = (expId: string, text: string) => {
    if (!text.trim()) return;
    const improved = smartRewriteBullets(text);
    if (improved !== text) { updateExperience(expId, "description", improved); toast({ title: "Smart Improve applied!" }); }
    else toast({ title: "Already looks good!" });
  };
  const smartImproveSummary = () => {
    if (!data.summary.trim()) return;
    const improved = smartRewriteSummary(data.summary, data.skills);
    if (improved !== data.summary) { setData(prev => ({ ...prev, summary: improved })); toast({ title: "Smart Improve applied!" }); }
    else toast({ title: "Already looks good!" });
  };

  const aiImproveBullet = async (expId: string, bulletText: string, jobTitle: string) => {
    if (!bulletText.trim()) { toast({ title: "Empty field" }); return; }
    if (!canUseAi()) { toast({ title: "AI limit reached", description: "Use Smart Improve instead!" }); return; }
    setAiLoading(`bullet-${expId}`); setAiSuggestion(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/career-tools/improve-bullet`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bullet_point: bulletText, job_title: jobTitle }) });
      if (!res.ok) throw new Error();
      const result = await res.json();
      recordAiUsage(); setAiRemaining(getAiRemaining());
      setAiSuggestion({ id: `bullet-${expId}`, original: bulletText, improved: result.improved, suggestions: result.suggestions });
    } catch { toast({ title: "AI Error", variant: "destructive" }); }
    finally { setAiLoading(null); }
  };

  const aiImproveSummary = async () => {
    if (!data.summary.trim()) { toast({ title: "Empty summary" }); return; }
    if (!canUseAi()) { toast({ title: "AI limit reached" }); return; }
    setAiLoading("summary"); setAiSuggestion(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/career-tools/improve-summary`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current_summary: data.summary, job_title: data.experience[0]?.title || "", skills: data.skills.slice(0, 5) }) });
      if (!res.ok) throw new Error();
      const result = await res.json();
      recordAiUsage(); setAiRemaining(getAiRemaining());
      setAiSuggestion({ id: "summary", original: data.summary, improved: result.improved });
    } catch { toast({ title: "AI Error", variant: "destructive" }); }
    finally { setAiLoading(null); }
  };

  const acceptAiSuggestion = () => {
    if (!aiSuggestion) return;
    if (aiSuggestion.id === "summary") setData(prev => ({ ...prev, summary: aiSuggestion.improved }));
    else updateExperience(aiSuggestion.id.replace("bullet-", ""), "description", aiSuggestion.improved);
    toast({ title: "Applied!" }); setAiSuggestion(null);
  };
  const dismissAiSuggestion = () => setAiSuggestion(null);
  const summaryWordCount = data.summary.trim().split(/\s+/).filter(Boolean).length;
  const currentStepIndex = STEPS.findIndex(s => s.key === activeTab);

  // ─── Pre-editor flows ─────────────────────────────────────
  if (flowState === "entry") return <div data-testid="resume-builder-entry"><ImportEntry onFileImport={handleFileImport} onTextImport={handleTextImport} onStartScratch={handleStartScratch} /></div>;
  if (flowState === "processing") return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center" data-testid="resume-builder-processing"><div className="max-w-md w-full"><ImportProcessing source={importSource} onComplete={handleProcessingComplete} /></div></div>;
  if (flowState === "review") return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4" data-testid="resume-builder-review"><div className="max-w-4xl w-full"><ImportReview confidences={confidences} source={importSource} onContinue={handleReviewContinue} /></div></div>;

  // ─── EDITOR LAYOUT ────────────────────────────────────────
  const scoreColor = scoreResult.total >= 80 ? "text-emerald-600" : scoreResult.total >= 60 ? "text-teal-600" : scoreResult.total >= 40 ? "text-amber-500" : "text-red-500";
  const scoreBg = scoreResult.total >= 80 ? "bg-emerald-500" : scoreResult.total >= 60 ? "bg-teal-500" : scoreResult.total >= 40 ? "bg-amber-500" : "bg-red-400";

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col" data-testid="resume-builder-editor">
      {/* ─── ATS Score Bar (auto-collapses) ─── */}
      {atsBarVisible && (
        <div className="bg-gray-900 text-white animate-in slide-in-from-top duration-300" data-testid="ats-score-bar">
          <div className="flex items-center px-5 py-2.5 gap-6">
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${scoreColor}`}>{scoreResult.total}</span>
              <span className="text-xs text-gray-400">/100</span>
            </div>
            <div className="h-6 w-px bg-gray-700" />
            {scoreGroups.map(g => {
              const Icon = g.icon;
              const barColor = g.pct >= 80 ? "bg-emerald-500" : g.pct >= 60 ? "bg-teal-500" : g.pct >= 40 ? "bg-amber-500" : "bg-red-400";
              return (
                <div key={g.key} className="flex items-center gap-2 min-w-0" data-testid={`ats-group-${g.key}`}>
                  <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-300 whitespace-nowrap">{g.label}</span>
                  <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${g.pct}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 tabular-nums">{g.score}/{g.max}</span>
                </div>
              );
            })}
            <div className="flex-1" />
            {quickFixes.length > 0 && (
              <button onClick={handleFixAll} className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors" data-testid="ats-fix-all">
                <Zap className="w-3 h-3" /> Fix {quickFixes.length} issues
              </button>
            )}
            <button onClick={() => setAtsBarVisible(false)} className="text-gray-500 hover:text-gray-300 transition-colors ml-2" data-testid="ats-bar-close">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* ─── Left Sidebar (collapsible) ─── */}
        <aside className={`hidden lg:flex flex-col bg-gray-900 text-white flex-shrink-0 transition-all duration-300 ${sidebarOpen ? "w-[200px]" : "w-[56px]"}`} data-testid="editor-sidebar">
          {/* Header */}
          <div className={`flex items-center border-b border-white/10 ${sidebarOpen ? "px-4 py-4 justify-between" : "px-2 py-4 justify-center"}`}>
            {sidebarOpen && (
              <Link href="/career-tools" className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                <ChevronLeft className="w-3 h-3" /> Back
              </Link>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-white transition-colors" data-testid="sidebar-toggle">
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Section Navigation */}
          <nav className="flex-1 py-3 px-2">
            {sidebarOpen && <p className="text-[10px] uppercase tracking-widest text-gray-600 px-2 mb-2">Sections</p>}
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeTab === step.key;
              const isPast = idx < currentStepIndex;
              return (
                <button
                  key={step.key}
                  onClick={() => setActiveTab(step.key)}
                  className={`w-full flex items-center gap-2.5 rounded-lg transition-all mb-0.5 ${
                    sidebarOpen ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
                  } ${
                    isActive ? "bg-teal-600/20 text-teal-400" : isPast ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-400 hover:bg-white/5"
                  }`}
                  data-testid={`sidebar-step-${step.key}`}
                  title={!sidebarOpen ? step.label : undefined}
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${isActive ? "bg-teal-600/30" : "bg-white/5"}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {sidebarOpen && <span className="text-sm">{step.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Template + Actions */}
          <div className={`border-t border-white/10 py-3 ${sidebarOpen ? "px-3" : "px-2"}`}>
            {sidebarOpen ? (
              <>
                <p className="text-[10px] uppercase tracking-widest text-gray-600 px-1 mb-2">Template</p>
                <div className="flex flex-wrap gap-1">
                  {templates.map(t => (
                    <button key={t.id} onClick={() => setTemplate(t.id)} className={`relative px-2 py-1 rounded text-[10px] transition-all ${template === t.id ? "bg-teal-600 text-white font-semibold" : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"}`} data-testid={`template-${t.id}`}>
                      {t.name}
                      {t.premium && <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-900 text-[7px] px-1 rounded-full font-bold">PRO</span>}
                    </button>
                  ))}
                </div>
                <div className="mt-3 space-y-1">
                  <button onClick={handleNewImport} className="w-full text-xs text-gray-500 hover:text-gray-300 flex items-center gap-2 py-1 transition-colors" data-testid="new-import-btn"><Upload className="w-3 h-3" /> Import</button>
                  <button onClick={handleReset} className="w-full text-xs text-gray-500 hover:text-red-400 flex items-center gap-2 py-1 transition-colors" data-testid="resume-reset-btn"><RotateCcw className="w-3 h-3" /> Reset</button>
                </div>
              </>
            ) : (
              <div className="space-y-1 flex flex-col items-center">
                <button onClick={handleNewImport} className="text-gray-500 hover:text-gray-300 p-2 transition-colors" title="Import"><Upload className="w-3.5 h-3.5" /></button>
                <button onClick={handleReset} className="text-gray-500 hover:text-red-400 p-2 transition-colors" title="Reset"><RotateCcw className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>

          {/* Score mini widget at bottom */}
          <div className={`border-t border-white/10 py-3 ${sidebarOpen ? "px-4" : "px-2"}`}>
            <button onClick={() => setAtsBarVisible(true)} className="w-full group" data-testid="score-widget">
              <div className={`flex items-center ${sidebarOpen ? "gap-3" : "justify-center"}`}>
                <div className="relative w-10 h-10 flex-shrink-0">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <circle cx="20" cy="20" r="16" fill="none" stroke={scoreResult.total >= 80 ? "#059669" : scoreResult.total >= 60 ? "#0d9488" : scoreResult.total >= 40 ? "#d97706" : "#dc2626"} strokeWidth="3" strokeDasharray={`${2 * Math.PI * 16}`} strokeDashoffset={`${2 * Math.PI * 16 * (1 - scoreResult.total / 100)}`} strokeLinecap="round" className="transition-all duration-500" />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-bold ${scoreColor}`}>{scoreResult.total}</span>
                </div>
                {sidebarOpen && (
                  <div className="text-left">
                    <p className="text-xs text-gray-400">Score</p>
                    <p className="text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors">Click to expand</p>
                  </div>
                )}
              </div>
            </button>
          </div>
        </aside>

        {/* ─── Center: Form Editor ─── */}
        <div className="flex-1 overflow-y-auto bg-white" data-testid="editor-form-area">
          {/* Mobile top bar */}
          <div className="lg:hidden flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50 overflow-x-auto">
            <Link href="/career-tools" className="text-gray-400 hover:text-gray-600 mr-1"><ChevronLeft className="w-4 h-4" /></Link>
            {STEPS.map((step, idx) => {
              const isActive = activeTab === step.key;
              return (
                <button key={step.key} onClick={() => setActiveTab(step.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${isActive ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-600"}`} data-testid={`tab-${step.key}`}>
                  {idx + 1}. {step.label}
                </button>
              );
            })}
          </div>

          <div className="px-8 py-10 md:px-12 lg:px-16 xl:px-20">
            {/* Quick Fixes (contextual, inline) */}
            {quickFixes.length > 0 && (
              <div className="mb-10 space-y-3" data-testid="inline-quick-fixes">
                {quickFixes.map((fix, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4 shadow-sm" data-testid="quick-fix-card">
                    <div className="flex-1">
                      <p className="text-base font-medium text-amber-900">{fix.message}</p>
                      {fix.fix && <p className="text-sm text-amber-700 mt-1 leading-relaxed">{fix.fix}</p>}
                    </div>
                    <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex-shrink-0">+{fix.points}</span>
                    {fix.fixAction && (
                      <button onClick={() => setActiveTab(fix.fixAction!.tab || "personal")} className="bg-amber-100 text-amber-900 hover:bg-amber-200 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-shrink-0 flex items-center gap-1" data-testid="quick-fix-btn">
                        Fix <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="sr-only">
                {STEPS.map(s => <TabsTrigger key={s.key} value={s.key}>{s.label}</TabsTrigger>)}
              </TabsList>
              <TabsContent value="personal">
                <PersonalTab personalDetails={data.personalDetails} summary={data.summary} summaryWordCount={summaryWordCount} onUpdatePersonal={updatePersonal} onUpdateSummary={v => setData(prev => ({ ...prev, summary: v }))} onSmartImproveSummary={smartImproveSummary} onAiImproveSummary={aiImproveSummary} aiLoading={aiLoading} aiSuggestion={aiSuggestion} aiRemaining={aiRemaining} aiTotal={AI_FREE_TOTAL} onAcceptAi={acceptAiSuggestion} onDismissAi={dismissAiSuggestion} summarySuggestions={summarySuggestions} />
              </TabsContent>
              <TabsContent value="experience">
                <ExperienceTab experience={data.experience as Experience[]} onAdd={addExperience} onUpdate={updateExperience} onRemove={removeExperience} onSmartImproveBullet={smartImproveBullet} onAiImproveBullet={aiImproveBullet} aiLoading={aiLoading} aiSuggestion={aiSuggestion} aiRemaining={aiRemaining} aiTotal={AI_FREE_TOTAL} onAcceptAi={acceptAiSuggestion} onDismissAi={dismissAiSuggestion} bulletSuggestions={bulletSuggestions} />
              </TabsContent>
              <TabsContent value="education">
                <EducationTab education={data.education as Education[]} onAdd={addEducation} onUpdate={updateEducation} onRemove={removeEducation} />
              </TabsContent>
              <TabsContent value="skills">
                <SkillsTab skills={data.skills} skillInput={skillInput} onSkillInputChange={setSkillInput} onAddSkill={addSkill} onRemoveSkill={removeSkill} />
              </TabsContent>
              <TabsContent value="extras">
                <ExtrasTab certifications={data.certifications} certInput={certInput} onCertInputChange={setCertInput} onAddCert={addCertification} onRemoveCert={removeCertification} />
              </TabsContent>
            </Tabs>

            {/* Continue / Back */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
              <button onClick={() => { const p = STEPS[currentStepIndex - 1]; if (p) setActiveTab(p.key); }} disabled={currentStepIndex === 0} className="text-base text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors flex items-center gap-1.5" data-testid="step-back-btn">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={() => { const n = STEPS[currentStepIndex + 1]; if (n) setActiveTab(n.key); }} disabled={currentStepIndex === STEPS.length - 1} className="bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 rounded-lg h-14 px-8 text-lg font-medium transition-colors inline-flex items-center gap-3 min-w-[200px] justify-center" data-testid="step-continue-btn">
                Continue <span className="text-white/50 text-base">({currentStepIndex + 1}/{STEPS.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Right Panel: ALWAYS Resume Preview ─── */}
        <div className="hidden xl:flex flex-col w-[420px] border-l border-gray-100 bg-gray-50/80 flex-shrink-0 overflow-hidden" data-testid="resume-preview-panel">
          {/* Preview header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-400" /> Live Preview
            </h3>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" onClick={() => window.print()} className="h-7 text-[11px] px-2.5 text-gray-500" data-testid="resume-print-btn">
                <Printer className="w-3 h-3 mr-1" /> Print
              </Button>
              <Button size="sm" onClick={handleDownloadPDF} className="h-7 text-[11px] px-2.5 bg-gray-900 hover:bg-gray-800 text-white" data-testid="resume-download-btn">
                <Download className="w-3 h-3 mr-1" /> PDF
              </Button>
            </div>
          </div>
          {/* Resume document */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-5 text-sm" id="resume-preview">
                <h1 className="text-lg font-bold text-center text-gray-900 mb-0.5">{data.personalDetails.fullName || "Your Name"}</h1>
                <div className="text-center text-gray-500 text-[10px] mb-0.5">
                  {[data.personalDetails.email, data.personalDetails.phone, data.personalDetails.location].filter(Boolean).join("  |  ") || "email@example.com | (555) 123-4567"}
                </div>
                {(data.personalDetails.linkedin || data.personalDetails.portfolio) && (
                  <div className="text-center text-gray-400 text-[10px] mb-3">{[data.personalDetails.linkedin, data.personalDetails.portfolio].filter(Boolean).join("  |  ")}</div>
                )}
                {data.summary && (
                  <div className="mb-3">
                    <div className="border-b border-gray-200 mb-1 pb-0.5"><h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Professional Summary</h2></div>
                    <p className="text-gray-600 text-[10px] leading-relaxed whitespace-pre-line">{data.summary}</p>
                  </div>
                )}
                {data.experience.length > 0 && (
                  <div className="mb-3">
                    <div className="border-b border-gray-200 mb-1 pb-0.5"><h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Experience</h2></div>
                    {data.experience.map((exp, i) => (
                      <div key={exp.id || i} className="mb-2">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-gray-900 text-[11px]">{exp.title || "Job Title"}</span>
                          <span className="text-gray-400 text-[9px]">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                        </div>
                        <div className="text-gray-500 text-[9px]">{exp.company}{exp.location && `, ${exp.location}`}</div>
                        {exp.description && <p className="text-gray-600 text-[10px] mt-0.5 whitespace-pre-line leading-relaxed">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
                {data.education.length > 0 && (
                  <div className="mb-3">
                    <div className="border-b border-gray-200 mb-1 pb-0.5"><h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Education</h2></div>
                    {data.education.map((edu, i) => (
                      <div key={edu.id || i} className="mb-1">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-gray-900 text-[11px]">{edu.degree}{edu.field && ` in ${edu.field}`}</span>
                          <span className="text-gray-400 text-[9px]">{edu.startDate} - {edu.endDate}</span>
                        </div>
                        <div className="text-gray-500 text-[9px]">{edu.school}</div>
                      </div>
                    ))}
                  </div>
                )}
                {data.skills.length > 0 && (
                  <div className="mb-3">
                    <div className="border-b border-gray-200 mb-1 pb-0.5"><h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Skills</h2></div>
                    <p className="text-gray-600 text-[10px]">{data.skills.join(" \u2022 ")}</p>
                  </div>
                )}
                {data.certifications.length > 0 && (
                  <div>
                    <div className="border-b border-gray-200 mb-1 pb-0.5"><h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Certifications</h2></div>
                    <ul className="text-gray-600 text-[10px]">{data.certifications.map(c => <li key={c}>&bull; {c}</li>)}</ul>
                  </div>
                )}
                {!data.summary && data.experience.length === 0 && data.skills.length === 0 && (
                  <div className="text-center text-gray-300 py-12"><p className="text-xs">Fill in your details to see the preview</p></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

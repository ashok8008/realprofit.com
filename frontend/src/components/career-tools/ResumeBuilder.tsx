"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, Download, Printer, Star, Search } from "lucide-react";
import { saveToStorage, loadFromStorage, clearStorage } from "@/lib/career-tools/storage";
import { generateResumePDF } from "@/lib/career-tools/pdf-export";
import type { ResumeData } from "@/lib/career-tools/pdf-export";
import { useToast } from "@/hooks/use-toast";
import { canUseAi, recordAiUsage, getAiRemaining } from "@/lib/career-tools/smartSuggestions";
import type { AiSuggestion } from "./resume/types";
import type { SectionConfidence } from "@/lib/career-tools/resume/import/types";
import { ImportProcessing } from "./resume/ImportProcessing";
import { fixAllEasyIssues } from "@/lib/career-tools/resume/improve";
import { calculateResumeScore } from "@/lib/career-tools/resume/score";
import { TemplateRenderer, EmptyPreview } from "./resume/TemplateRenderer";
import Link from "next/link";

// Split components
import { STORAGE_KEY, defaultResumeData, WIZARD_STEPS, TEMPLATES } from "./resume/constants";
import type { WizardStep, FlowState } from "./resume/constants";
import { EntryScreen, UploadScreen, ProcessingScreen, WelcomeScreen, AnalysisScreen } from "./resume/EntryScreens";
import { OnboardingLevel, OnboardingYears, OnboardingIndustry } from "./resume/OnboardingScreens";
import { TemplateSelection } from "./resume/TemplateSelection";
import { ATSCheckPanel } from "./resume/ATSCheckPanel";
import { TipsPanel } from "./resume/TipsPanel";
import { WizardStepContent } from "./resume/WizardStepContent";

export function ResumeBuilder() {
  const { toast } = useToast();
  // ── Core state ──
  const [flowState, setFlowState] = useState<FlowState>("entry");
  const changeFlow = useCallback((s: FlowState) => setFlowState(s), []);
  const [wizardStep, setWizardStep] = useState<WizardStep>("header");
  const [template, setTemplate] = useState("clean");
  const [data, setData] = useState<ResumeData>(defaultResumeData);
  const [importSource, setImportSource] = useState<"docx" | "pdf" | "text">("text");
  const [confidences, setConfidences] = useState<SectionConfidence[]>([]);

  // ── Onboarding state ──
  const [onboardLevel, setOnboardLevel] = useState("");
  const [onboardYears, setOnboardYears] = useState("");
  const [onboardIndustries, setOnboardIndustries] = useState<string[]>([]);

  // ── Editor state ──
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [aiRemaining, setAiRemaining] = useState(getAiRemaining());
  const [summaryGenLoading, setSummaryGenLoading] = useState(false);
  const [summaryOptions, setSummaryOptions] = useState<string[]>([]);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [skillSugLoading, setSkillSugLoading] = useState(false);

  // ── ATS Check state ──
  const [atsResult, setAtsResult] = useState<{ overall_score: number; overall_status: string; categories: { name: string; score: number; max_score: number; status: string; issues: string[]; fixes: string[] }[]; keyword_analysis: { found: string[]; missing: string[]; match_pct: number }; summary_feedback: string } | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsJobDesc, setAtsJobDesc] = useState("");

  // ── Processing state ──
  const [processingStep, setProcessingStep] = useState(0);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  // ── Generate a stable draft ID (per browser) ──
  const getDraftId = () => {
    let id = typeof window !== "undefined" ? localStorage.getItem("resume_draft_id") : null;
    if (!id) { id = Math.random().toString(36).substring(2, 15); if (typeof window !== "undefined") localStorage.setItem("resume_draft_id", id); }
    return id;
  };

  // ── Load: check localStorage for saved draft, then try MongoDB ──
  useEffect(() => {
    const saved = loadFromStorage<ResumeData | null>(STORAGE_KEY, null as unknown as ResumeData);
    if (saved && (saved.personalDetails?.fullName || saved.experience?.length > 0 || saved.summary)) {
      setData(saved);
      setHasSavedDraft(true);
    }
    const savedMeta = loadFromStorage<{ template?: string; level?: string; years?: string; industries?: string[] } | null>("resume_meta", null);
    if (savedMeta) {
      if (savedMeta.template) setTemplate(savedMeta.template);
      if (savedMeta.level) setOnboardLevel(savedMeta.level);
      if (savedMeta.years) setOnboardYears(savedMeta.years);
      if (savedMeta.industries) setOnboardIndustries(savedMeta.industries);
    }
    const draftId = typeof window !== "undefined" ? localStorage.getItem("resume_draft_id") : null;
    if (draftId && !saved) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/career-tools/resume-draft/${draftId}`)
        .then(r => r.json())
        .then(doc => {
          if (doc?.data && (doc.data.personalDetails?.fullName || doc.data.experience?.length > 0 || doc.data.summary)) {
            setData(doc.data);
            setHasSavedDraft(true);
            saveToStorage(STORAGE_KEY, doc.data);
          }
        })
        .catch(() => {});
    }
  }, []);

  // ── Auto-save to localStorage + MongoDB ──
  useEffect(() => {
    if (flowState === "wizard") {
      const t = setTimeout(() => {
        saveToStorage(STORAGE_KEY, data);
        saveToStorage("resume_meta", { template, level: onboardLevel, years: onboardYears, industries: onboardIndustries });
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/career-tools/resume-draft`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft_id: getDraftId(), data }),
        }).catch(() => {});
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [data, flowState, template, onboardLevel, onboardYears, onboardIndustries]);

  // ── Processing tips rotation ──
  useEffect(() => {
    if (flowState === "processing") {
      const t = setInterval(() => setProcessingStep(p => p + 1), 3000);
      return () => clearInterval(t);
    }
  }, [flowState]);

  // ── Score ──
  const scoreResult = useMemo(() => calculateResumeScore(data), [data]);
  const scorePct = scoreResult.total;
  const allFixes = scoreResult.suggestions;

  // ── Step index ──
  const currentStepIdx = WIZARD_STEPS.findIndex(s => s.key === wizardStep);

  // ── Wizard completion tracking ──
  const completedSteps = useMemo(() => {
    const c = new Set<string>();
    if (data.personalDetails.fullName && data.personalDetails.email) c.add("header");
    if (data.experience.length > 0) c.add("experience");
    if (data.education.length > 0) c.add("education");
    if (data.skills.length > 0) c.add("skills");
    if (data.summary) c.add("summary");
    if (data.certifications.length > 0) c.add("additional");
    return c;
  }, [data]);

  // ── File import ──
  const handleFileImport = useCallback(async (file: File) => {
    const ext = file.name.toLowerCase();
    const source = ext.endsWith(".docx") ? "docx" as const : "pdf" as const;
    setImportSource(source); setFlowState("processing"); setProcessingStep(0);
    try {
      if (source === "docx") { const { parseDocx } = await import("@/lib/career-tools/resume/import/docxParser"); const r = await parseDocx(file); setData(r.data); setConfidences(r.confidences); }
      else { const { parsePdf } = await import("@/lib/career-tools/resume/import/pdfParser"); const r = await parsePdf(file); setData(r.data); setConfidences(r.confidences); }
      await new Promise(resolve => setTimeout(resolve, 4000));
      setFlowState("welcome");
    } catch { toast({ title: "Import failed", variant: "destructive" }); setFlowState("entry"); }
  }, [toast]);

  const handleTextImport = useCallback((text: string) => {
    setImportSource("text"); setFlowState("processing"); setProcessingStep(0);
    setTimeout(() => {
      try { const { parseText } = require("@/lib/career-tools/resume/import/textParser"); const r = parseText(text); setData(r.data); setConfidences(r.confidences); setTimeout(() => setFlowState("welcome"), 4000); }
      catch { toast({ title: "Parse failed", variant: "destructive" }); setFlowState("entry"); }
    }, 100);
  }, [toast]);

  const handleReset = () => { if (confirm("Clear all resume data?")) { setData(defaultResumeData); clearStorage(STORAGE_KEY); clearStorage("resume_meta"); setHasSavedDraft(false); setFlowState("entry"); setConfidences([]); setTemplate("clean"); setOnboardLevel(""); setOnboardYears(""); setOnboardIndustries([]); setAtsResult(null); toast({ title: "Cleared" }); } };
  const handleDownloadPDF = () => { const pdf = generateResumePDF(data, template); pdf.save(`${data.personalDetails.fullName || "resume"}_resume.pdf`.replace(/\s+/g, "_")); toast({ title: "PDF Downloaded" }); };

  // ── ATS Check ──
  const runATSCheck = async (jobDesc?: string) => {
    setAtsLoading(true);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/career-tools/ats-check`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personal_details: data.personalDetails, summary: data.summary, experience: data.experience, education: data.education, skills: data.skills, certifications: data.certifications, job_description: jobDesc || atsJobDesc || undefined }),
      });
      if (!r.ok) throw new Error("ATS check failed");
      setAtsResult(await r.json());
    } catch { toast({ title: "ATS check failed", description: "Please try again", variant: "destructive" }); }
    finally { setAtsLoading(false); }
  };

  // ── AI helpers ──
  const aiImproveBullet = async (id: string, text: string, title: string) => {
    if (!text.trim() || !canUseAi()) return; setAiLoading(`bullet-${id}`); setAiSuggestion(null);
    try { const r = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/career-tools/improve-bullet`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bullet_point: text, job_title: title }) }); if (!r.ok) throw 0; const d = await r.json(); recordAiUsage(); setAiRemaining(getAiRemaining()); setAiSuggestion({ id: `bullet-${id}`, original: text, improved: d.improved, suggestions: d.suggestions }); }
    catch { toast({ title: "AI Error", variant: "destructive" }); } finally { setAiLoading(null); }
  };

  const generateSummaryOptions = async () => {
    setSummaryGenLoading(true); setSummaryOptions([]);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/career-tools/generate-summaries`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_title: data.experience[0]?.title || "", skills: data.skills.slice(0, 8), industry: onboardIndustries[0] || "" }),
      });
      if (!r.ok) throw 0; const d = await r.json();
      setSummaryOptions(d.summaries || []); recordAiUsage(); setAiRemaining(getAiRemaining());
    } catch { toast({ title: "AI Error", variant: "destructive" }); }
    finally { setSummaryGenLoading(false); }
  };

  const fetchSkillSuggestions = async () => {
    const jobTitle = data.experience[0]?.title;
    if (!jobTitle) { toast({ title: "Add a job title in Experience first" }); return; }
    setSkillSugLoading(true); setSkillSuggestions([]);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/career-tools/suggest-skills`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_title: jobTitle, current_skills: data.skills }),
      });
      if (!r.ok) throw 0; const d = await r.json();
      setSkillSuggestions(d.suggestions || []);
    } catch { toast({ title: "Could not fetch suggestions", variant: "destructive" }); }
    finally { setSkillSugLoading(false); }
  };

  const handleFixAll = () => {
    const f = fixAllEasyIssues({ summary: data.summary, experience: data.experience.map(e => ({ description: e.description })), skills: data.skills });
    setData(prev => ({ ...prev, summary: f.summary, experience: prev.experience.map((e, i) => ({ ...e, description: f.experiences[i] || e.description })), skills: f.skills }));
    toast({ title: "Fixes applied!" });
  };

  const addSkill = (s?: string) => { const val = (s || skillInput).trim(); if (val && !data.skills.includes(val)) { setData(prev => ({ ...prev, skills: [...prev.skills, val] })); if (!s) setSkillInput(""); } };
  const acceptAiSuggestion = () => { if (!aiSuggestion) return; if (aiSuggestion.id.startsWith("bullet-")) { const id = aiSuggestion.id.replace("bullet-", ""); setData(prev => ({ ...prev, experience: prev.experience.map(e => (e.id || "") === id ? { ...e, description: aiSuggestion.improved } : e) })); } toast({ title: "Applied!" }); setAiSuggestion(null); };
  const dismissAiSuggestion = () => setAiSuggestion(null);

  // ── Navigate steps ──
  const goNext = () => { if (currentStepIdx < WIZARD_STEPS.length - 1) setWizardStep(WIZARD_STEPS[currentStepIdx + 1].key); };
  const goBack = () => { if (currentStepIdx > 0) setWizardStep(WIZARD_STEPS[currentStepIdx - 1].key); };

  // ════════════════════════════════════════════
  // Flow routing — delegate to split components
  // ════════════════════════════════════════════
  if (flowState === "entry") return <EntryScreen data={data} hasSavedDraft={hasSavedDraft} setFlowState={changeFlow} setData={setData} setHasSavedDraft={setHasSavedDraft} defaultResumeData={defaultResumeData} />;
  if (flowState === "upload") return <UploadScreen setFlowState={changeFlow} handleFileImport={handleFileImport} handleTextImport={handleTextImport} />;
  if (flowState === "processing") return <ProcessingScreen processingStep={processingStep} />;
  if (flowState === "welcome") return <WelcomeScreen data={data} setFlowState={changeFlow} />;
  if (flowState === "analysis") return <AnalysisScreen data={data} setFlowState={changeFlow} />;
  if (flowState === "onboarding-level") return <OnboardingLevel onboardLevel={onboardLevel} setOnboardLevel={setOnboardLevel} setFlowState={changeFlow} />;
  if (flowState === "onboarding-years") return <OnboardingYears onboardYears={onboardYears} setOnboardYears={setOnboardYears} setFlowState={changeFlow} />;
  if (flowState === "onboarding-industry") return <OnboardingIndustry onboardIndustries={onboardIndustries} setOnboardIndustries={setOnboardIndustries} setFlowState={changeFlow} />;
  if (flowState === "templates") return <TemplateSelection template={template} setTemplate={setTemplate} data={data} onboardLevel={onboardLevel} onboardYears={onboardYears} onboardIndustries={onboardIndustries} setFlowState={changeFlow} setWizardStep={setWizardStep} />;
  if (flowState === "ats-check") return <ATSCheckPanel atsResult={atsResult} atsLoading={atsLoading} atsJobDesc={atsJobDesc} setAtsJobDesc={setAtsJobDesc} setAtsResult={setAtsResult} runATSCheck={runATSCheck} setFlowState={changeFlow} addSkill={addSkill} />;
  if (flowState === "tips") return <TipsPanel allFixes={allFixes} handleFixAll={handleFixAll} setFlowState={changeFlow} setWizardStep={setWizardStep} />;

  // ════════════════════════════════════════════
  // WIZARD (Main guided editor layout)
  // ════════════════════════════════════════════
  return (
    <div className="h-screen flex overflow-hidden bg-white" data-testid="resume-builder-editor">
      {/* ═══ DARK SIDEBAR ═══ */}
      <aside className="hidden md:flex flex-col w-16 lg:w-52 bg-slate-900 flex-shrink-0" data-testid="editor-sidebar">
        <div className="p-3 lg:px-4 lg:py-3 border-b border-slate-800">
          <Link href="/career-tools" className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 lg:text-sm"><ChevronLeft className="w-3 h-3" /><span className="hidden lg:inline">Back</span></Link>
        </div>
        <nav className="flex-1 py-4 px-2 lg:px-3">
          {WIZARD_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = wizardStep === step.key;
            const isDone = completedSteps.has(step.key);
            const isPast = idx < currentStepIdx;
            return (
              <button key={step.key} onClick={() => setWizardStep(step.key)} className={`w-full flex items-center gap-2.5 rounded-lg mb-1 transition-all ${isActive ? "bg-blue-600 text-white" : isPast || isDone ? "text-slate-300 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"} lg:px-3 lg:py-2.5 px-0 py-2 justify-center lg:justify-start`} data-testid={`sidebar-step-${step.key}`} title={step.label}>
                <div className="relative">
                  {isDone && !isActive ? <Check className="w-4 h-4 text-emerald-400" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="hidden lg:block text-sm">{step.label}</span>
                {isActive && <span className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            );
          })}
        </nav>
        <div className="p-3 lg:p-4 border-t border-slate-800 flex justify-center lg:justify-start" data-testid="score-widget">
          <div className="flex items-center gap-2.5">
            <div className="relative w-11 h-11 flex-shrink-0">
              <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36"><circle cx="18" cy="18" r="14" fill="none" stroke="#334155" strokeWidth="3" /><circle cx="18" cy="18" r="14" fill="none" stroke={scorePct >= 80 ? "#10b981" : scorePct >= 60 ? "#0ea5e9" : scorePct >= 40 ? "#f59e0b" : "#ef4444"} strokeWidth="3" strokeDasharray={`${2*Math.PI*14}`} strokeDashoffset={`${2*Math.PI*14*(1-scorePct/100)}`} strokeLinecap="round" className="transition-all duration-700" /></svg>
              <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${scorePct >= 80 ? "text-emerald-400" : scorePct >= 60 ? "text-sky-400" : scorePct >= 40 ? "text-amber-400" : "text-red-400"}`}>{scorePct}%</span>
            </div>
            <div className="hidden lg:block"><p className="text-xs font-medium text-slate-300">Resume</p><p className="text-[10px] text-slate-500">complete</p></div>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="md:hidden flex items-center gap-1 px-4 py-2 border-b border-zinc-200 overflow-x-auto">
          {WIZARD_STEPS.map((s, i) => (
            <button key={s.key} onClick={() => setWizardStep(s.key)} className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${wizardStep === s.key ? "bg-blue-600 text-white" : "text-zinc-400"}`} data-testid={`mob-tab-${s.key}`}>
              {i + 1}. {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto" data-testid="editor-form-area">
            <div className="max-w-2xl mx-auto px-6 lg:px-10 py-8">
              {/* Score Toolbar */}
              <div className="flex items-center justify-between mb-6 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 shadow-sm" data-testid="score-toolbar">
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-0.5">
                    <span className={`text-xl font-black ${scorePct >= 80 ? "text-emerald-500" : scorePct >= 60 ? "text-sky-500" : scorePct >= 40 ? "text-amber-500" : "text-red-500"}`} data-testid="score-number">{scorePct}</span>
                    <span className="text-[10px] text-zinc-400 font-medium">/100</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-zinc-500">ATS</span>
                    <div className="w-12 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${Math.min(100, (scoreResult.breakdown.ats.score / scoreResult.breakdown.ats.max) * 100)}%` }} data-testid="ats-bar" />
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-zinc-500">Readability</span>
                    <div className="w-12 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${Math.min(100, (scoreResult.breakdown.structure.score / scoreResult.breakdown.structure.max) * 100)}%` }} data-testid="readability-bar" />
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-zinc-500">Impact</span>
                    <div className="w-12 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${Math.min(100, (scoreResult.breakdown.impact.score / scoreResult.breakdown.impact.max) * 100)}%` }} data-testid="impact-bar" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => { setFlowState("ats-check"); if (!atsResult) runATSCheck(); }} className="h-8 px-3 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-600 hover:bg-zinc-50 inline-flex items-center gap-1.5 shadow-sm" data-testid="ats-check-btn">
                    <Search className="w-3.5 h-3.5 text-teal-500" /> ATS Check
                  </button>
                  <button onClick={() => setFlowState("tips")} className="h-8 px-3 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-600 hover:bg-zinc-50 inline-flex items-center gap-1.5 shadow-sm" data-testid="tips-toggle">
                    <Star className="w-3.5 h-3.5 text-amber-400" /> Tips {allFixes.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none">{allFixes.length}</span>}
                  </button>
                </div>
              </div>

              <WizardStepContent
                wizardStep={wizardStep} data={data} setData={setData}
                editingExpId={editingExpId} setEditingExpId={setEditingExpId}
                editingEduId={editingEduId} setEditingEduId={setEditingEduId}
                aiLoading={aiLoading} aiSuggestion={aiSuggestion} aiRemaining={aiRemaining}
                aiImproveBullet={aiImproveBullet} acceptAiSuggestion={acceptAiSuggestion} dismissAiSuggestion={dismissAiSuggestion}
                summaryGenLoading={summaryGenLoading} summaryOptions={summaryOptions}
                generateSummaryOptions={generateSummaryOptions} setSummaryOptions={setSummaryOptions}
                skillSuggestions={skillSuggestions} skillSugLoading={skillSugLoading}
                fetchSkillSuggestions={fetchSkillSuggestions} setSkillSuggestions={setSkillSuggestions}
                skillInput={skillInput} setSkillInput={setSkillInput}
                certInput={certInput} setCertInput={setCertInput}
                scorePct={scorePct} allFixes={allFixes} setFlowState={changeFlow}
                onboardIndustries={onboardIndustries}
                handleDownloadPDF={handleDownloadPDF} handleReset={handleReset}
              />

              <div className="mt-10 pt-6 border-t border-zinc-200 flex items-center justify-between">
                <button onClick={goBack} disabled={currentStepIdx === 0} className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-30 flex items-center gap-1 font-medium" data-testid="step-back-btn"><ChevronLeft className="w-4 h-4" /> Back</button>
                <button onClick={goNext} disabled={currentStepIdx === WIZARD_STEPS.length - 1} className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 rounded-full h-12 px-8 text-sm font-medium inline-flex items-center gap-2" data-testid="step-continue-btn">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ═══ RESUME PREVIEW ═══ */}
          <div className="hidden lg:flex flex-col w-[38%] border-l border-zinc-200 bg-slate-50 flex-shrink-0 overflow-hidden" data-testid="resume-preview-panel">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 bg-white">
              <button onClick={() => setFlowState("templates")} className="text-xs text-blue-600 hover:underline font-medium">Change template</button>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="h-7 text-[11px] px-2 text-zinc-500" data-testid="resume-print-btn"><Printer className="w-3 h-3 mr-1" /> Print</Button>
                <Button size="sm" onClick={handleDownloadPDF} className="h-7 text-[11px] px-2 bg-blue-600 text-white hover:bg-blue-700" data-testid="resume-download-btn-preview"><Download className="w-3 h-3 mr-1" /> PDF</Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 flex justify-center">
              <div className="bg-white border border-zinc-200 rounded-lg shadow-md w-full max-w-[400px] overflow-hidden">
                <div id="resume-preview">
                  <TemplateRenderer data={data} templateId={template} scale="full" />
                  {!data.summary && data.experience.length === 0 && data.skills.length === 0 && <EmptyPreview />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

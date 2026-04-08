"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload, FileText, ChevronLeft, ChevronRight, Download, Printer, X,
  Check, Sparkles, Loader2, Lightbulb, AlertTriangle, Star, Trophy,
  Plus, Trash2, Pencil, ArrowUp, Briefcase, GraduationCap,
  User, Wrench, Award, Clipboard, Wand2, Zap,
  MapPin, Calendar, Search, Info
} from "lucide-react";
import { saveToStorage, loadFromStorage, clearStorage } from "@/lib/career-tools/storage";
import { generateResumePDF } from "@/lib/career-tools/pdf-export";
import type { ResumeData } from "@/lib/career-tools/pdf-export";
import { useToast } from "@/hooks/use-toast";
import {
  analyzeBulletPoints, analyzeSummary, smartRewriteBullets, smartRewriteSummary,
  canUseAi, recordAiUsage, getAiRemaining, AI_FREE_TOTAL
} from "@/lib/career-tools/smartSuggestions";
import type { Experience, Education, AiSuggestion } from "./resume/types";
import { ImportProcessing } from "./resume/ImportProcessing";
import { fixAllEasyIssues } from "@/lib/career-tools/resume/improve";
import { calculateResumeScore } from "@/lib/career-tools/resume/score";
import type { SectionConfidence } from "@/lib/career-tools/resume/import/types";
import { TemplateRenderer, EmptyPreview } from "./resume/TemplateRenderer";
import Link from "next/link";

const STORAGE_KEY = "resume_builder";
const defaultResumeData: ResumeData = {
  personalDetails: { fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" },
  summary: "", experience: [], education: [], skills: [], certifications: [],
};

const TEMPLATES = [
  { id: "clean", name: "Clean", desc: "Simple, ATS-friendly", premium: false },
  { id: "professional", name: "Professional", desc: "Traditional business", premium: false },
  { id: "minimal", name: "Minimal", desc: "Maximum whitespace", premium: false },
  { id: "executive", name: "Executive", desc: "Bold header", premium: true },
  { id: "modern", name: "Modern", desc: "Two-column", premium: true },
];

const WIZARD_STEPS = [
  { key: "header", label: "Header", icon: User },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Wrench },
  { key: "summary", label: "Summary", icon: FileText },
  { key: "additional", label: "Additional Details", icon: Award },
  { key: "finalize", label: "Finalize", icon: Download },
] as const;

type WizardStep = typeof WIZARD_STEPS[number]["key"];
type FlowState = "entry" | "upload" | "processing" | "welcome" | "analysis" | "onboarding-level" | "onboarding-years" | "onboarding-industry" | "templates" | "wizard" | "tips" | "ats-check";

const EXPERIENCE_LEVELS = [
  { id: "none", label: "No Experience", desc: "Less than 6 months" },
  { id: "entry", label: "Entry-Level", desc: "6 months to 3 years" },
  { id: "mid", label: "Mid-Level", desc: "3 to 10 years" },
  { id: "senior", label: "Senior-Level", desc: "10 or more years" },
];

const INDUSTRIES = [
  "Administration", "Construction", "Education", "Finance & Insurance",
  "Food & Hotel", "Healthcare", "Manufacturing", "Professional Services",
  "Retail", "Technology", "Transportation",
];

const inputClass = "h-12 px-4 text-sm bg-white border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
const labelClass = "text-sm font-medium text-zinc-800 mb-1.5 block";

export function ResumeBuilder() {
  const { toast } = useToast();
  // ── Core state ──
  const [flowState, setFlowState] = useState<FlowState>("entry");
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
  const [templateColor, setTemplateColor] = useState("#ffffff");

  // ── ATS Check state ──
  const [atsResult, setAtsResult] = useState<{ overall_score: number; overall_status: string; categories: { name: string; score: number; max_score: number; status: string; issues: string[]; fixes: string[] }[]; keyword_analysis: { found: string[]; missing: string[]; match_pct: number }; summary_feedback: string } | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsJobDesc, setAtsJobDesc] = useState("");

  // ── Paste mode ──
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  const fileRef = React.useRef<HTMLInputElement>(null);

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
    // Also load template/onboarding prefs from localStorage
    const savedMeta = loadFromStorage<{ template?: string; level?: string; years?: string; industries?: string[] } | null>("resume_meta", null);
    if (savedMeta) {
      if (savedMeta.template) setTemplate(savedMeta.template);
      if (savedMeta.level) setOnboardLevel(savedMeta.level);
      if (savedMeta.years) setOnboardYears(savedMeta.years);
      if (savedMeta.industries) setOnboardIndustries(savedMeta.industries);
    }
    // Try loading from MongoDB as fallback (in case localStorage was cleared)
    const draftId = typeof window !== "undefined" ? localStorage.getItem("resume_draft_id") : null;
    if (draftId && !saved) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/career-tools/resume-draft/${draftId}`)
        .then(r => r.json())
        .then(doc => {
          if (doc?.data && (doc.data.personalDetails?.fullName || doc.data.experience?.length > 0 || doc.data.summary)) {
            setData(doc.data);
            setHasSavedDraft(true);
            // Also update localStorage with the DB data
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
        // Also save to MongoDB
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
      // Ensure the loader shows for at least 4 seconds
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

  const handleProcessingComplete = useCallback(() => { setFlowState("welcome"); }, []);
  const handleReset = () => { if (confirm("Clear all resume data?")) { setData(defaultResumeData); clearStorage(STORAGE_KEY); clearStorage("resume_meta"); setHasSavedDraft(false); setFlowState("entry"); setConfidences([]); setTemplate("clean"); setOnboardLevel(""); setOnboardYears(""); setOnboardIndustries([]); setAtsResult(null); toast({ title: "Cleared" }); } };
  const handleDownloadPDF = () => { const pdf = generateResumePDF(data, template); pdf.save(`${data.personalDetails.fullName || "resume"}_resume.pdf`.replace(/\s+/g, "_")); toast({ title: "PDF Downloaded" }); };

  // ── ATS Check ──
  const runATSCheck = async (jobDesc?: string) => {
    setAtsLoading(true);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/career-tools/ats-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personal_details: data.personalDetails,
          summary: data.summary,
          experience: data.experience,
          education: data.education,
          skills: data.skills,
          certifications: data.certifications,
          job_description: jobDesc || atsJobDesc || undefined,
        }),
      });
      if (!r.ok) throw new Error("ATS check failed");
      const result = await r.json();
      setAtsResult(result);
    } catch {
      toast({ title: "ATS check failed", description: "Please try again", variant: "destructive" });
    } finally {
      setAtsLoading(false);
    }
  };

  // ── Data update helpers ──
  const updatePersonal = (field: keyof ResumeData["personalDetails"], value: string) => setData(prev => ({ ...prev, personalDetails: { ...prev.personalDetails, [field]: value } }));
  const addExperience = () => { const id = Date.now().toString(); setData(prev => ({ ...prev, experience: [...prev.experience, { id, title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }] })); setEditingExpId(id); };
  const updateExperience = (id: string, field: string, value: string | boolean) => setData(prev => ({ ...prev, experience: prev.experience.map(e => (e.id || "") === id ? { ...e, [field]: value } : e) }));
  const removeExperience = (id: string) => setData(prev => ({ ...prev, experience: prev.experience.filter(e => (e.id || "") !== id) }));
  const moveExperience = (id: string, dir: "up" | "down") => setData(prev => { const idx = prev.experience.findIndex(e => (e.id || "") === id); if ((dir === "up" && idx <= 0) || (dir === "down" && idx >= prev.experience.length - 1)) return prev; const arr = [...prev.experience]; const swap = dir === "up" ? idx - 1 : idx + 1; [arr[idx], arr[swap]] = [arr[swap], arr[idx]]; return { ...prev, experience: arr }; });
  const addEducation = () => { const id = Date.now().toString(); setData(prev => ({ ...prev, education: [...prev.education, { id, school: "", degree: "", field: "", startDate: "", endDate: "" }] })); setEditingEduId(id); };
  const updateEducation = (id: string, field: string, value: string) => setData(prev => ({ ...prev, education: prev.education.map(e => (e.id || "") === id ? { ...e, [field]: value } : e) }));
  const removeEducation = (id: string) => setData(prev => ({ ...prev, education: prev.education.filter(e => (e.id || "") !== id) }));
  const addSkill = (s?: string) => { const val = (s || skillInput).trim(); if (val && !data.skills.includes(val)) { setData(prev => ({ ...prev, skills: [...prev.skills, val] })); if (!s) setSkillInput(""); } };
  const removeSkill = (s: string) => setData(prev => ({ ...prev, skills: prev.skills.filter(x => x !== s) }));
  const addCertification = () => { if (certInput.trim() && !data.certifications.includes(certInput.trim())) { setData(prev => ({ ...prev, certifications: [...prev.certifications, certInput.trim()] })); setCertInput(""); } };
  const removeCertification = (c: string) => setData(prev => ({ ...prev, certifications: prev.certifications.filter(x => x !== c) }));

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

  const acceptAiSuggestion = () => { if (!aiSuggestion) return; if (aiSuggestion.id.startsWith("bullet-")) updateExperience(aiSuggestion.id.replace("bullet-", ""), "description", aiSuggestion.improved); toast({ title: "Applied!" }); setAiSuggestion(null); };
  const dismissAiSuggestion = () => setAiSuggestion(null);

  const summaryWordCount = data.summary.trim().split(/\s+/).filter(Boolean).length;

  // ── Navigate steps ──
  const goNext = () => { if (currentStepIdx < WIZARD_STEPS.length - 1) setWizardStep(WIZARD_STEPS[currentStepIdx + 1].key); };
  const goBack = () => { if (currentStepIdx > 0) setWizardStep(WIZARD_STEPS[currentStepIdx - 1].key); };

  // ════════════════════════════════════════════════════════════
  // ENTRY PAGE (Screen 1 — Big heading with two CTA buttons)
  // ════════════════════════════════════════════════════════════
  if (flowState === "entry") {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6" data-testid="resume-builder-entry">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-900 tracking-tight leading-tight mb-6">
            AI Resume Builder<br />
            <span className="text-[#0d9488]">(Fast, Easy, & Free to Use)</span>
          </h1>
          <p className="text-lg text-zinc-600 leading-relaxed mb-10 max-w-2xl">
            Land your next job with one of the best AI resume builders online. Work from your computer or phone with recruiter-approved templates and add ready-to-use skills and phrases in one click.
          </p>

          {/* Continue saved draft banner */}
          {hasSavedDraft && (
            <div className="mb-8 max-w-xl bg-white border-2 border-[#0d9488] rounded-2xl p-5 flex items-center justify-between shadow-sm" data-testid="continue-draft-banner">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-[#0d9488]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">{data.personalDetails.fullName ? `Continue ${data.personalDetails.fullName}'s resume` : "Continue where you left off"}</h3>
                  <p className="text-sm text-zinc-500">Your saved draft is ready to edit.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setFlowState("wizard")} className="h-10 px-5 rounded-full bg-[#0d9488] text-white text-sm font-bold hover:bg-[#0b8578] transition-colors" data-testid="continue-draft-btn">
                  Continue
                </button>
                <button onClick={() => { setData(defaultResumeData); clearStorage(STORAGE_KEY); setHasSavedDraft(false); }} className="h-10 px-4 rounded-full border border-zinc-200 text-sm text-zinc-500 hover:text-red-500 hover:border-red-200 transition-colors" data-testid="discard-draft-btn">
                  Discard
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => setFlowState("upload")} className="h-14 px-10 rounded-full bg-[#f5c542] hover:bg-[#e5b732] text-zinc-900 text-lg font-bold transition-colors" data-testid="import-resume-btn">
              Import your resume
            </button>
            <button onClick={() => setFlowState("onboarding-level")} className="h-14 px-10 rounded-full bg-[#3b82f6] hover:bg-[#2563eb] text-white text-lg font-bold transition-colors" data-testid="create-resume-btn">
              Create my resume
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-8">100% private &mdash; processed in your browser. No signup required.</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // UPLOAD PAGE (Screen 2 — Drag & drop zone + Browse button)
  // ════════════════════════════════════════════════════════════
  if (flowState === "upload") {
    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files?.[0]; if (f) handleFileImport(f); };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragActive(true); };
    const handleDragLeave = () => setDragActive(false);

    if (pasteMode) {
      return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6" data-testid="resume-paste-mode">
          <div className="w-full max-w-2xl">
            <button onClick={() => setPasteMode(false)} className="text-sm text-zinc-400 hover:text-zinc-600 mb-4 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
            <h2 className="text-3xl font-black text-zinc-900 mb-2">Paste Your Resume</h2>
            <p className="text-base text-zinc-500 mb-4">Paste your resume text below (min 50 characters)</p>
            <textarea className="w-full min-h-[300px] p-4 text-sm font-mono border-2 border-zinc-200 rounded-2xl bg-white focus:ring-2 focus:ring-[#0d9488] focus:border-transparent" placeholder={"John Doe\njohn@email.com\n\nEXPERIENCE\nSoftware Engineer at Acme Corp..."} value={pasteText} onChange={e => setPasteText(e.target.value)} data-testid="paste-textarea" />
            <button onClick={() => { if (pasteText.trim().length >= 50) handleTextImport(pasteText.trim()); }} disabled={pasteText.trim().length < 50} className="mt-3 bg-[#3b82f6] text-white hover:bg-[#2563eb] disabled:opacity-40 rounded-full h-12 px-8 text-sm font-bold" data-testid="parse-paste-btn">Parse Resume</button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6" data-testid="resume-upload-page">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 mb-1">Upload your resume</h2>
            <div className="w-24 h-1 bg-[#0d9488] rounded-full mx-auto mt-2" />
          </div>

          {/* Drag & Drop Zone */}
          <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${dragActive ? "border-[#0d9488] bg-teal-50" : "border-zinc-300 bg-white"}`} data-testid="upload-drop-zone">
            <div className="mx-auto w-20 h-20 mb-4">
              <svg viewBox="0 0 80 80" fill="none" className="w-full h-full"><rect x="20" y="10" width="40" height="52" rx="4" fill="#e8f5f3" stroke="#0d9488" strokeWidth="2"/><path d="M32 28h16M32 36h16M32 44h10" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/><path d="M40 58V70M34 64l6 6 6-6" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <p className="text-lg font-semibold text-zinc-700 mb-4">Drag & drop your file here</p>
            <input ref={fileRef} type="file" accept=".docx,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileImport(f); }} />
            <button onClick={() => fileRef.current?.click()} className="h-12 px-8 rounded-full bg-[#f5c542] hover:bg-[#e5b732] text-zinc-900 text-base font-bold inline-flex items-center gap-2 transition-colors" data-testid="browse-btn">
              <Upload className="w-5 h-5" /> Browse your computer
            </button>
            <p className="text-sm text-zinc-400 mt-4">Acceptable file types: DOCX, PDF</p>
          </div>

          {/* Paste text option */}
          <button onClick={() => setPasteMode(true)} className="mt-4 text-sm text-zinc-400 hover:text-[#0d9488] flex items-center gap-1.5 mx-auto" data-testid="paste-option">
            <Clipboard className="w-4 h-4" /> Or paste your resume text
          </button>

          {/* Bottom: Create new resume link */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-200">
            <button onClick={() => setFlowState("onboarding-level")} className="text-[#3b82f6] hover:text-[#2563eb] text-base font-bold hover:underline" data-testid="create-new-link">
              Create a new resume
            </button>
            <button onClick={() => setFlowState("entry")} className="text-sm text-zinc-400 hover:text-zinc-600 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // PROCESSING (Animated loader with tips while parsing)
  // ════════════════════════════════════════════════════════════
  if (flowState === "processing") {
    const TIPS = [
      { icon: "chart", title: "Did you know?", text: "Resumes with quantified achievements get 40% more interviews." },
      { icon: "target", title: "ATS Tip", text: "Use standard section headings like \"Experience\" and \"Education\" for best results." },
      { icon: "star", title: "Pro Tip", text: "Keep your resume to 1-2 pages. Recruiters spend an average of 7 seconds scanning." },
      { icon: "bulb", title: "RealProfits Insight", text: "Our AI scoring engine checks 100+ data points across ATS, readability, and impact." },
      { icon: "money", title: "Career Growth", text: "Professionals who update their resume quarterly earn 15% more on average." },
      { icon: "rocket", title: "Stand Out", text: "Adding 5-8 relevant skills increases your match rate by 60% on job boards." },
    ];
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 bg-gradient-to-br from-white to-teal-50/30" data-testid="resume-builder-processing">
        <div className="max-w-lg w-full text-center">
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-zinc-100" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#0d9488] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-[#f5c542] border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            <FileText className="absolute inset-0 m-auto w-8 h-8 text-[#0d9488]" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 mb-2">Reviewing your resume...</h2>
          <p className="text-base text-zinc-500 mb-8">Our AI is analyzing your experience, skills, and formatting.</p>

          {/* Animated progress bar */}
          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden mb-8">
            <div className="h-full bg-gradient-to-r from-[#0d9488] to-[#14b8c2] rounded-full transition-all duration-1000" style={{ width: "100%", animation: "pulse 2s ease-in-out infinite" }} />
          </div>

          {/* Rotating tips */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm" data-testid="processing-tip">
            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#f5c542]/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-[#e5b732]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-900 mb-1">{TIPS[processingStep % TIPS.length].title}</p>
                <p className="text-sm text-zinc-600 leading-relaxed">{TIPS[processingStep % TIPS.length].text}</p>
              </div>
            </div>
          </div>

          {/* Tip dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {TIPS.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === processingStep % TIPS.length ? "bg-[#0d9488] w-4" : "bg-zinc-300"}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // WELCOME (Screen 3 — "Nice to meet you, {Name}")
  // ════════════════════════════════════════════════════════════
  if (flowState === "welcome") {
    const firstName = data.personalDetails.fullName?.split(" ")[0] || "there";
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6" data-testid="import-welcome">
        <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* Left: Illustration */}
          <div className="flex-shrink-0 w-64 md:w-80">
            <svg viewBox="0 0 300 320" fill="none" className="w-full">
              {/* Background blob */}
              <ellipse cx="150" cy="180" rx="130" ry="140" fill="#fef3c7" opacity="0.5" />
              {/* Person body */}
              <rect x="110" y="140" width="80" height="100" rx="12" fill="#0d9488" />
              <rect x="115" y="145" width="70" height="90" rx="10" fill="#14b8c2" />
              {/* Head */}
              <circle cx="150" cy="110" r="36" fill="#fde68a" />
              <circle cx="150" cy="112" r="34" fill="#fef3c7" />
              {/* Glasses */}
              <circle cx="138" cy="108" r="10" fill="none" stroke="#1e293b" strokeWidth="2.5" />
              <circle cx="162" cy="108" r="10" fill="none" stroke="#1e293b" strokeWidth="2.5" />
              <line x1="148" y1="108" x2="152" y2="108" stroke="#1e293b" strokeWidth="2" />
              {/* Smile */}
              <path d="M140 120 Q150 130 160 120" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
              {/* Hair */}
              <path d="M116 100 Q115 75 140 72 Q155 70 170 75 Q188 82 185 100" fill="#1e293b" />
              {/* Wave hand */}
              <circle cx="205" cy="130" r="10" fill="#fef3c7" />
              <rect x="195" y="135" width="5" height="20" rx="2" fill="#fef3c7" transform="rotate(-15 197 145)" />
              {/* Floating icons */}
              <rect x="60" y="60" width="28" height="22" rx="3" fill="none" stroke="#f5c542" strokeWidth="2" />
              <path d="M64 66h20M64 72h14" stroke="#f5c542" strokeWidth="1.5" />
              <circle cx="230" cy="70" r="14" fill="none" stroke="#f5c542" strokeWidth="2" />
              <path d="M225 70l4 4 6-8" stroke="#f5c542" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M80 180l10-15 10 10 10-20" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          {/* Right: Personalized text */}
          <div className="flex-1 text-left">
            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mb-6">Nice to meet you, {firstName}</h1>
            <div className="space-y-4 text-lg text-zinc-700 leading-relaxed">
              {data.experience[0]?.title && data.experience[0]?.company && (
                <p>You are currently a <strong className="text-zinc-900">{data.experience[0].title}</strong> at <strong className="text-zinc-900">{data.experience[0].company}</strong>.</p>
              )}
              {data.experience.length > 1 && (
                <p>Your extensive experience in <strong className="text-zinc-900">{data.experience[0]?.title || "your field"}</strong>{data.skills.length > 0 ? <>, combined with your <strong className="text-zinc-900">{data.skills.slice(0, 3).join(" and ")}</strong> expertise</> : ""}, showcases your leadership.</p>
              )}
              {data.certifications.length > 0 && (
                <p>Your <strong className="text-zinc-900">{data.certifications.slice(0, 2).join(" and ")}</strong> certification{data.certifications.length > 1 ? "s" : ""} showcase{data.certifications.length === 1 ? "s" : ""} your commitment to professional development.</p>
              )}
              <p>We will tailor your resume-building experience to emphasize your strengths in <strong className="text-zinc-900">{data.experience[0]?.title ? data.experience[0].title.toLowerCase() : "your career"}</strong>, ensuring it aligns with your impressive background.</p>
            </div>
            <button onClick={() => setFlowState("analysis")} className="mt-8 bg-[#3b82f6] text-white hover:bg-[#2563eb] rounded-full h-14 px-10 text-lg font-bold transition-colors inline-flex items-center gap-2" data-testid="welcome-continue-btn">
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // ANALYSIS (Screen 4 — "You're off to a great start!")
  // ════════════════════════════════════════════════════════════
  if (flowState === "analysis") {
    const gotRight: string[] = [];
    if (data.personalDetails.email || data.personalDetails.phone) gotRight.push("You listed multiple ways for employers to contact you.");
    if (data.experience.length > 0 && data.summary && data.skills.length > 0) gotRight.push("You included all the sections employers look for on a resume.");
    if (data.experience.length > 0) gotRight.push(`${data.experience.length} work experience${data.experience.length > 1 ? "s" : ""} detected.`);
    if (data.skills.length > 0) gotRight.push(`${data.skills.length} skills identified.`);
    if (gotRight.length === 0) gotRight.push("We found the basic structure of your resume.");

    const improvements: string[] = [];
    improvements.push("We\u2019ll suggest section titles that match the ones employers scan for.");
    if (data.experience.length > 0) improvements.push("Revise your experience section using AI writing help.");
    improvements.push("AI-enhance your summary to align with best practices.");

    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6" data-testid="import-analysis">
        <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* Left: Illustration */}
          <div className="flex-shrink-0 w-64 md:w-72">
            <svg viewBox="0 0 300 320" fill="none" className="w-full">
              <ellipse cx="150" cy="180" rx="130" ry="140" fill="#fef3c7" opacity="0.4" />
              <rect x="110" y="140" width="80" height="100" rx="12" fill="#0d9488" />
              <rect x="115" y="145" width="70" height="90" rx="10" fill="#14b8c2" />
              <circle cx="150" cy="110" r="36" fill="#fde68a" />
              <circle cx="150" cy="112" r="34" fill="#fef3c7" />
              <circle cx="138" cy="108" r="10" fill="none" stroke="#1e293b" strokeWidth="2.5" />
              <circle cx="162" cy="108" r="10" fill="none" stroke="#1e293b" strokeWidth="2.5" />
              <line x1="148" y1="108" x2="152" y2="108" stroke="#1e293b" strokeWidth="2" />
              <path d="M140 120 Q150 128 160 120" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
              <path d="M116 100 Q115 75 140 72 Q155 70 170 75 Q188 82 185 100" fill="#1e293b" />
              {/* Magnifying glass */}
              <circle cx="220" cy="155" r="18" fill="none" stroke="#1e293b" strokeWidth="3" />
              <line x1="233" y1="168" x2="248" y2="183" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
              <circle cx="220" cy="155" r="12" fill="#0d948820" />
              {/* Document behind */}
              <rect x="50" y="90" width="50" height="65" rx="4" fill="white" stroke="#0d9488" strokeWidth="1.5" />
              <path d="M58 105h34M58 113h28M58 121h20M58 129h30" stroke="#d1d5db" strokeWidth="1.5" />
            </svg>
          </div>
          {/* Right: Feedback content */}
          <div className="flex-1 text-left">
            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mb-2">You&apos;re off to a great start!</h1>
            <p className="text-lg text-zinc-500 mb-8">Here&apos;s what you got right and some areas we&apos;ll help you improve.</p>

            {/* You got it right */}
            <div className="bg-zinc-50 rounded-2xl p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-zinc-900">You got it right</h3>
                <Trophy className="w-6 h-6 text-zinc-400" />
              </div>
              {gotRight.map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-3 h-3 text-emerald-600" /></div>
                  <span className="text-base text-zinc-700">{item}</span>
                </div>
              ))}
            </div>

            {/* How we'll help you improve */}
            <div className="bg-zinc-50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-zinc-900">How we&apos;ll help you improve</h3>
                <Lightbulb className="w-6 h-6 text-zinc-400" />
              </div>
              {improvements.map((item, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <Star className="w-5 h-5 text-[#f5c542] flex-shrink-0 mt-0.5" />
                  <span className="text-base text-zinc-700">{item}</span>
                </div>
              ))}
            </div>

            <button onClick={() => setFlowState("templates")} className="mt-8 bg-[#3b82f6] text-white hover:bg-[#2563eb] rounded-full h-14 px-10 text-lg font-bold transition-colors inline-flex items-center gap-2" data-testid="analysis-continue-btn">
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // ONBOARDING — Experience Level (matching competitor exactly)
  // ════════════════════════════════════════════════════════════
  if (flowState === "onboarding-level") {
    const PLANT_ICONS = [
      <svg key="0" viewBox="0 0 40 40" fill="none" className="w-8 h-8"><path d="M20 35V22" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><path d="M20 28c-6-2-8-8-8-12 4 0 7 3 8 6" stroke="#1e293b" strokeWidth="1.8" fill="none"/></svg>,
      <svg key="1" viewBox="0 0 40 40" fill="none" className="w-8 h-8"><path d="M20 35V18" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><path d="M20 25c-7-2-9-9-9-14 5 0 8 4 9 7" stroke="#1e293b" strokeWidth="1.8" fill="none"/><path d="M20 20c5-3 6-8 6-12-4 0-6 3-6 6" stroke="#1e293b" strokeWidth="1.8" fill="none"/></svg>,
      <svg key="2" viewBox="0 0 40 40" fill="none" className="w-8 h-8"><path d="M20 35V14" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><path d="M20 24c-8-2-10-10-10-15 5 0 9 5 10 8" stroke="#1e293b" strokeWidth="1.8" fill="none"/><path d="M20 18c6-3 8-9 8-14-5 0-7 4-8 7" stroke="#1e293b" strokeWidth="1.8" fill="none"/><path d="M20 28c4-1 6-5 6-9-3 0-5 3-6 5" stroke="#1e293b" strokeWidth="1.8" fill="none"/></svg>,
      <svg key="3" viewBox="0 0 40 40" fill="none" className="w-8 h-8"><path d="M20 35V10" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><path d="M20 22c-9-2-11-10-11-16 6 0 10 5 11 9" stroke="#1e293b" strokeWidth="1.8" fill="none"/><path d="M20 16c7-3 9-10 9-15-5 0-8 5-9 8" stroke="#1e293b" strokeWidth="1.8" fill="none"/><path d="M20 27c5-1 7-6 7-10-4 0-6 3-7 6" stroke="#1e293b" strokeWidth="1.8" fill="none"/><path d="M20 30c-4-1-6-4-6-8 3 0 5 2 6 4" stroke="#1e293b" strokeWidth="1.8" fill="none"/></svg>,
    ];
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6" data-testid="onboarding-level">
        <div className="w-full max-w-lg text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[#fef3c7] flex items-center justify-center">
            <Briefcase className="w-7 h-7 text-[#b45309]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mb-2 leading-tight">
            How much <span className="underline decoration-[#f5c542] decoration-4 underline-offset-4">work experience</span> do<br />you have?
          </h1>
          <p className="text-base text-zinc-500 mb-8">Select the one that best describes you.</p>
          <div className="space-y-3 max-w-md mx-auto">
            {EXPERIENCE_LEVELS.map((l, idx) => (
              <button key={l.id} onClick={() => { setOnboardLevel(l.id); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-full border-2 text-left transition-all hover:shadow-md ${onboardLevel === l.id ? "border-zinc-900 bg-zinc-50 shadow-sm" : "border-zinc-200 bg-white hover:border-zinc-400"}`} data-testid={`level-${l.id}`}>
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">{PLANT_ICONS[idx]}</div>
                <div><div className="text-base font-bold text-zinc-900">{l.label}</div><div className="text-sm text-zinc-500">{l.desc}</div></div>
              </button>
            ))}
          </div>
          <button onClick={() => { if (onboardLevel) setFlowState("onboarding-years"); }} disabled={!onboardLevel} className="mt-8 h-14 px-12 rounded-full bg-zinc-200 text-zinc-600 text-lg font-bold disabled:opacity-50 enabled:bg-[#3b82f6] enabled:text-white enabled:hover:bg-[#2563eb] transition-colors" data-testid="level-continue">
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // ONBOARDING — Years of Experience
  // ════════════════════════════════════════════════════════════
  if (flowState === "onboarding-years") {
    const YEARS_OPTIONS = [
      { id: "less-1", label: "Less than 1 year", icon: <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7"><circle cx="20" cy="28" r="9" fill="none" stroke="#1e293b" strokeWidth="2"/><path d="M20 22V28L24 30" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/></svg> },
      { id: "1-3", label: "1 - 3 years", icon: <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7"><circle cx="20" cy="28" r="9" fill="none" stroke="#1e293b" strokeWidth="2"/><path d="M20 22V28L24 30" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="14" r="3" fill="#f5c542" opacity="0.6"/></svg> },
      { id: "3-5", label: "3 - 5 years", icon: <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7"><circle cx="20" cy="28" r="9" fill="none" stroke="#1e293b" strokeWidth="2"/><path d="M20 22V28L24 30" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="14" r="3" fill="#f5c542" opacity="0.6"/><circle cx="28" cy="14" r="3" fill="#0d9488" opacity="0.6"/></svg> },
      { id: "5-10", label: "5 - 10 years", icon: <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7"><circle cx="20" cy="28" r="9" fill="none" stroke="#1e293b" strokeWidth="2"/><path d="M20 22V28L24 30" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><circle cx="10" cy="14" r="3" fill="#f5c542" opacity="0.6"/><circle cx="20" cy="10" r="3" fill="#3b82f6" opacity="0.6"/><circle cx="30" cy="14" r="3" fill="#0d9488" opacity="0.6"/></svg> },
      { id: "10-plus", label: "10+ years", icon: <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7"><circle cx="20" cy="28" r="9" fill="#0d9488" opacity="0.12" stroke="#1e293b" strokeWidth="2"/><path d="M20 22V28L24 30" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><path d="M14 8l6 6 6-6" stroke="#f5c542" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    ];
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6" data-testid="onboarding-years">
        <div className="w-full max-w-lg text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[#e0f2fe] flex items-center justify-center">
            <Calendar className="w-7 h-7 text-[#0369a1]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mb-2 leading-tight">
            How many <span className="underline decoration-[#3b82f6] decoration-4 underline-offset-4">years</span> of experience<br />do you have?
          </h1>
          <p className="text-base text-zinc-500 mb-8">This helps us tailor your resume to your career stage.</p>
          <div className="space-y-3 max-w-md mx-auto">
            {YEARS_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => setOnboardYears(opt.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-full border-2 text-left transition-all hover:shadow-md ${onboardYears === opt.id ? "border-zinc-900 bg-zinc-50 shadow-sm" : "border-zinc-200 bg-white hover:border-zinc-400"}`} data-testid={`years-${opt.id}`}>
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">{opt.icon}</div>
                <span className="text-base font-bold text-zinc-900">{opt.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={() => setFlowState("onboarding-level")} className="h-12 px-8 rounded-full border-2 border-zinc-900 text-zinc-900 font-bold text-sm hover:bg-zinc-50 bg-white" data-testid="years-back">
              Back
            </button>
            <button onClick={() => { if (onboardYears) setFlowState("onboarding-industry"); }} disabled={!onboardYears} className="h-12 px-8 rounded-full bg-[#3b82f6] text-white font-bold text-sm hover:bg-[#2563eb] disabled:opacity-40" data-testid="years-continue">
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // ONBOARDING — Industry (matching competitor)
  // ════════════════════════════════════════════════════════════
  if (flowState === "onboarding-industry") {
    const toggleInd = (ind: string) => setOnboardIndustries(prev => prev.includes(ind) ? prev.filter(x => x !== ind) : prev.length < 3 ? [...prev, ind] : prev);
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6" data-testid="onboarding-industry">
        <div className="w-full max-w-xl text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[#fef3c7] flex items-center justify-center">
            <Wrench className="w-7 h-7 text-[#b45309]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mb-2 leading-tight">
            What <span className="underline decoration-[#f5c542] decoration-4 underline-offset-4">industry</span> are you making<br />this resume for?
          </h1>
          <p className="text-base text-zinc-500 mb-8">You can select up to 3 industries.</p>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {INDUSTRIES.map(ind => (
              <button key={ind} onClick={() => toggleInd(ind)} className={`px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${onboardIndustries.includes(ind) ? "border-slate-800 bg-slate-800 text-white" : "border-zinc-200 text-zinc-700 bg-white hover:border-zinc-400"}`} data-testid={`industry-${ind.replace(/\s+/g, "-").toLowerCase()}`}>
                {ind}
              </button>
            ))}
          </div>
          <button className="text-[#3b82f6] text-sm font-bold hover:underline mb-8 inline-flex items-center gap-1" data-testid="add-industry-link">
            <Plus className="w-4 h-4" /> Add Industry
          </button>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setFlowState("onboarding-years")} className="h-12 px-8 rounded-full border-2 border-zinc-900 text-zinc-900 font-bold text-sm hover:bg-zinc-50 bg-white" data-testid="onboarding-back">
              Back
            </button>
            <button onClick={() => setFlowState("templates")} disabled={onboardIndustries.length === 0} className="h-12 px-8 rounded-full bg-[#3b82f6] text-white font-bold text-sm hover:bg-[#2563eb] disabled:opacity-40" data-testid="onboarding-continue">
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // TEMPLATE SELECTION (Two-pane: preview left, details right)
  // ════════════════════════════════════════════════════════════
  if (flowState === "templates") {
    const TEMPLATE_DETAILS: Record<string, { tags: string[]; features: string[]; popularity: string; colors: string[] }> = {
      clean: { tags: ["Recommended", "Classic"], features: ["ATS-optimized", "1-column layout", "Editable sample content", "Download as PDF"], popularity: "2.1K+ people picked this template", colors: ["#ffffff", "#1e293b", "#64748b", "#3b82f6", "#0ea5e9", "#0d9488", "#16a34a", "#f5c542", "#ef4444"] },
      professional: { tags: ["Popular", "Traditional"], features: ["ATS-optimized", "Professional format", "Clean typography", "Download as PDF"], popularity: "1.8K+ people picked this template", colors: ["#ffffff", "#1e293b", "#374151", "#1d4ed8", "#0d9488", "#b45309", "#7c3aed", "#dc2626", "#059669"] },
      minimal: { tags: ["Trending", "Simple"], features: ["ATS-optimized", "Maximum whitespace", "Modern feel", "Download as PDF"], popularity: "1.5K+ people picked this template", colors: ["#ffffff", "#0f172a", "#475569", "#2563eb", "#0891b2", "#65a30d", "#9333ea", "#e11d48", "#ca8a04"] },
      executive: { tags: ["Premium", "Bold"], features: ["ATS-optimized", "Bold header section", "Executive presence", "Download as PDF"], popularity: "980+ people picked this template", colors: ["#ffffff", "#0f172a", "#334155", "#1e40af", "#0d9488", "#b91c1c", "#7e22ce", "#c2410c", "#15803d"] },
      modern: { tags: ["Premium", "Modern"], features: ["ATS-optimized", "Two-column layout", "Color accents", "Download as PDF"], popularity: "1.2K+ people picked this template", colors: ["#ffffff", "#1e293b", "#6b7280", "#2563eb", "#0ea5e9", "#059669", "#d97706", "#dc2626", "#8b5cf6"] },
    };
    const sel = TEMPLATES.find(t => t.id === template) || TEMPLATES[0];
    const details = TEMPLATE_DETAILS[template] || TEMPLATE_DETAILS.clean;

    // Sample data for preview when user has no real data yet
    const hasData = data.personalDetails.fullName || data.experience.length > 0 || data.summary;
    const previewData: ResumeData = hasData ? data : {
      personalDetails: { fullName: "Sarah Johnson", email: "sarah.johnson@email.com", phone: "(555) 482-9170", location: "San Francisco, CA", linkedin: "linkedin.com/in/sarahjohnson", portfolio: "" },
      summary: "Results-driven product manager with 6+ years of experience leading cross-functional teams to deliver customer-centric solutions. Proven track record in agile environments, data-driven decision making, and driving 30% revenue growth.",
      experience: [
        { id: "s1", title: "Senior Product Manager", company: "TechVenture Inc.", location: "San Francisco, CA", startDate: "Mar 2021", endDate: "", current: true, description: "- Led product strategy for flagship SaaS platform serving 50K+ users\n- Increased user retention by 25% through data-driven feature prioritization\n- Managed $2M annual product budget and roadmap" },
        { id: "s2", title: "Product Manager", company: "DataFlow Systems", location: "Oakland, CA", startDate: "Jun 2018", endDate: "Feb 2021", current: false, description: "- Launched 3 major product features driving $1.2M in new ARR\n- Collaborated with engineering, design, and marketing teams" },
      ],
      education: [{ id: "e1", school: "UC Berkeley", degree: "MBA", field: "Technology Management", startDate: "2016", endDate: "2018" }],
      skills: ["Product Strategy", "Agile/Scrum", "Data Analytics", "User Research", "SQL", "Roadmap Planning", "A/B Testing", "Stakeholder Management"],
      certifications: ["Certified Scrum Product Owner (CSPO)"],
    };

    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6" data-testid="template-selection">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8">
          {/* Left: Template thumbnails + full preview */}
          <div className="flex gap-4 flex-1">
            {/* Thumbnail strip */}
            <div className="hidden md:flex flex-col gap-2 flex-shrink-0 w-20">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplate(t.id)} className={`w-20 aspect-[1/1.414] rounded-lg border-2 overflow-hidden transition-all ${template === t.id ? "border-[#3b82f6] shadow-md ring-2 ring-blue-200" : "border-zinc-200 bg-white hover:border-zinc-400"}`} data-testid={`template-thumb-${t.id}`}>
                  <div className="w-full h-full overflow-hidden">
                    <TemplateRenderer data={previewData} templateId={t.id} scale="thumb" />
                  </div>
                </button>
              ))}
            </div>
            {/* Full preview */}
            <div className="flex-1 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden">
              <div className="max-h-[70vh] overflow-y-auto">
                <TemplateRenderer data={previewData} templateId={template} scale="full" />
              </div>
            </div>
          </div>

          {/* Right: Template info + Use button */}
          <div className="lg:w-[340px] flex-shrink-0">
            <div className="flex gap-2 mb-2">
              {details.tags.map(tag => (
                <span key={tag} className={`text-xs font-bold px-3 py-1 rounded-full border ${tag === "Recommended" ? "bg-[#eef7ee] text-emerald-700 border-emerald-200" : tag === "Premium" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-zinc-100 text-zinc-700 border-zinc-200"}`}>{tag}</span>
              ))}
            </div>
            <h2 className="text-4xl font-black text-zinc-900 mb-2">{sel.name}</h2>
            <p className="text-sm text-zinc-500 mb-4 flex items-center gap-1.5"><User className="w-4 h-4" /> {details.popularity}</p>
            <div className="space-y-2.5 mb-6">
              {details.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-base text-zinc-800"><Check className="w-5 h-5 text-zinc-900" /> {f}</div>
              ))}
            </div>
            <button onClick={() => { setFlowState("wizard"); setWizardStep("header"); saveToStorage("resume_meta", { template, level: onboardLevel, years: onboardYears, industries: onboardIndustries }); toast({ title: "Let's build!", description: "Fill in each section — your score updates live." }); }} className="w-full h-14 rounded-full bg-[#3b82f6] hover:bg-[#2563eb] text-white text-lg font-bold transition-colors mb-6" data-testid="template-continue-btn">
              Use this template
            </button>
            <div className="border-t border-zinc-200 pt-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><div className="flex items-center gap-1.5 font-bold text-zinc-900 mb-1"><Wand2 className="w-4 h-4" /> Customize your design</div><p className="text-xs text-zinc-500">Match the resume to your professional style.</p></div>
                <div><div className="flex items-center gap-1.5 font-bold text-zinc-900 mb-1"><Sparkles className="w-4 h-4" /> AI suggestions</div><p className="text-xs text-zinc-500">Use AI-generated content personalized to roles.</p></div>
                <div><div className="flex items-center gap-1.5 font-bold text-zinc-900 mb-1"><Lightbulb className="w-4 h-4" /> Writing help</div><p className="text-xs text-zinc-500">Beat ATS by using suggested keywords.</p></div>
                <div><div className="flex items-center gap-1.5 font-bold text-zinc-900 mb-1"><Download className="w-4 h-4" /> Multiple formats</div><p className="text-xs text-zinc-500">Download as PDF, Word, or TXT file.</p></div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-zinc-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-zinc-600">Color</span>
                {details.colors.map((c, i) => (
                  <button key={i} onClick={() => setTemplateColor(c)} className={`w-7 h-7 rounded-full border-2 transition-all ${templateColor === c ? "border-zinc-900 scale-110" : "border-zinc-200 hover:border-zinc-400"}`} style={{ backgroundColor: c }} data-testid={`color-${i}`}>
                    {templateColor === c && <Check className="w-3 h-3 mx-auto text-zinc-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // ATS CHECK (Full-screen overlay)
  // ════════════════════════════════════════════════════════════
  if (flowState === "ats-check") {
    const statusColor = (s: string) => s === "pass" ? "text-emerald-400" : s === "fail" ? "text-red-400" : "text-amber-400";
    const statusBg = (s: string) => s === "pass" ? "bg-emerald-500/20" : s === "fail" ? "bg-red-500/20" : "bg-amber-500/20";
    const statusIcon = (s: string) => s === "pass" ? <Check className="w-4 h-4" /> : s === "fail" ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />;

    return (
      <div className="min-h-[calc(100vh-64px)] bg-zinc-900 text-white" data-testid="ats-check-view">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Search className="w-5 h-5 text-teal-400" /> ATS Compatibility Check</h2>
            <p className="text-sm text-zinc-400">AI-powered analysis of your resume&apos;s ATS readiness.</p>
          </div>
          <div className="flex items-center gap-3">
            {!atsResult && !atsLoading && (
              <button onClick={() => runATSCheck()} className="bg-teal-600 text-white hover:bg-teal-700 rounded-full h-10 px-6 text-sm font-medium inline-flex items-center gap-2" data-testid="ats-run-btn">
                <Sparkles className="w-4 h-4" /> Run ATS Check
              </button>
            )}
            <button onClick={() => setFlowState("wizard")} className="bg-blue-600 text-white hover:bg-blue-700 rounded-full h-10 px-6 text-sm font-medium" data-testid="ats-back-btn">
              Back to Editor
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto py-8 px-6">
          {/* Job Description input */}
          {!atsResult && !atsLoading && (
            <div className="mb-8">
              <label className="text-sm font-medium text-zinc-300 mb-2 block">Paste a job description for targeted keyword matching (optional)</label>
              <Textarea
                className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 min-h-[100px] text-sm"
                placeholder="Paste the job description here to get keyword match analysis..."
                value={atsJobDesc}
                onChange={e => setAtsJobDesc(e.target.value)}
                data-testid="ats-job-desc"
              />
              <p className="text-xs text-zinc-500 mt-1.5">This helps identify missing keywords specific to the role.</p>
            </div>
          )}

          {/* Loading */}
          {atsLoading && (
            <div className="flex flex-col items-center justify-center py-20" data-testid="ats-loading">
              <Loader2 className="w-10 h-10 text-teal-400 animate-spin mb-4" />
              <p className="text-lg font-semibold text-zinc-200">Analyzing your resume...</p>
              <p className="text-sm text-zinc-500 mt-1">Our AI is checking ATS compatibility across 5 categories.</p>
            </div>
          )}

          {/* Results */}
          {atsResult && !atsLoading && (
            <div className="space-y-6" data-testid="ats-results">
              {/* Overall score */}
              <div className="flex items-center gap-6 bg-zinc-800 border border-zinc-700 rounded-2xl p-6">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#27272a" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.91" fill="none" strokeWidth="3" strokeDasharray={`${atsResult.overall_score}, 100`} strokeLinecap="round"
                      className={atsResult.overall_score >= 80 ? "stroke-emerald-400" : atsResult.overall_score >= 60 ? "stroke-sky-400" : atsResult.overall_score >= 40 ? "stroke-amber-400" : "stroke-red-400"} />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-xl font-black ${atsResult.overall_score >= 80 ? "text-emerald-400" : atsResult.overall_score >= 60 ? "text-sky-400" : atsResult.overall_score >= 40 ? "text-amber-400" : "text-red-400"}`} data-testid="ats-overall-score">
                    {atsResult.overall_score}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-zinc-100">{atsResult.overall_status}</h3>
                  <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{atsResult.summary_feedback}</p>
                </div>
                <button onClick={() => { setAtsResult(null); }} className="h-9 px-4 rounded-lg border border-zinc-600 text-sm font-medium text-zinc-300 hover:bg-zinc-700" data-testid="ats-recheck-btn">
                  Re-check
                </button>
              </div>

              {/* Category breakdown */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Category Breakdown</h3>
                {atsResult.categories.map((cat, i) => (
                  <div key={i} className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden" data-testid={`ats-category-${i}`}>
                    <div className="flex items-center gap-3 px-5 py-3.5">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${statusBg(cat.status)} ${statusColor(cat.status)}`}>
                        {statusIcon(cat.status)}
                      </span>
                      <span className="text-sm font-semibold text-zinc-200 flex-1">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${cat.status === "pass" ? "bg-emerald-500" : cat.status === "fail" ? "bg-red-500" : "bg-amber-500"}`} style={{ width: `${(cat.score / cat.max_score) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-zinc-400 w-10 text-right">{cat.score}/{cat.max_score}</span>
                      </div>
                    </div>
                    {(cat.issues.length > 0 || cat.fixes.length > 0) && (
                      <div className="px-5 pb-3.5 pt-0 border-t border-zinc-700/50">
                        {cat.issues.map((issue, j) => (
                          <div key={j} className="flex items-start gap-2 mt-2">
                            <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-zinc-400">{issue}</span>
                          </div>
                        ))}
                        {cat.fixes.map((fix, j) => (
                          <div key={j} className="flex items-start gap-2 mt-2">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-zinc-300">{fix}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Keyword analysis */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-400" /> Keyword Analysis
                  <span className="text-xs font-normal text-zinc-500 ml-auto">{atsResult.keyword_analysis.match_pct}% match</span>
                </h3>
                <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden mb-4">
                  <div className={`h-full rounded-full transition-all ${atsResult.keyword_analysis.match_pct >= 70 ? "bg-emerald-500" : atsResult.keyword_analysis.match_pct >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${atsResult.keyword_analysis.match_pct}%` }} data-testid="ats-keyword-bar" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-emerald-400 mb-1.5">Found Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {atsResult.keyword_analysis.found.map(kw => (
                        <span key={kw} className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium" data-testid="ats-found-keyword">{kw}</span>
                      ))}
                      {atsResult.keyword_analysis.found.length === 0 && <span className="text-xs text-zinc-500">None detected</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-1.5">Missing Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {atsResult.keyword_analysis.missing.map(kw => (
                        <button key={kw} onClick={() => { addSkill(kw); toast({ title: `Added "${kw}" to skills` }); }} className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-medium hover:bg-red-500/30 cursor-pointer inline-flex items-center gap-1" data-testid="ats-missing-keyword">
                          <Plus className="w-2.5 h-2.5" /> {kw}
                        </button>
                      ))}
                      {atsResult.keyword_analysis.missing.length === 0 && <span className="text-xs text-zinc-500">None — great coverage!</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // TIPS & FIXES (Full-screen overlay)
  // ════════════════════════════════════════════════════════════
  if (flowState === "tips") {
    const critFixes = allFixes.filter(f => f.severity === "critical");
    const normFixes = allFixes.filter(f => f.severity !== "critical");
    return (
      <div className="min-h-[calc(100vh-64px)] bg-zinc-900 text-white" data-testid="full-tips-view">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><Star className="w-5 h-5 text-amber-400" /> Tips & fixes</h2>
            <p className="text-sm text-zinc-400">Expert suggestions, personalized for you.</p>
          </div>
          <div className="flex items-center gap-8">
            {/* Section badges */}
            {WIZARD_STEPS.slice(0, -1).map(s => {
              const fixCount = allFixes.filter(f => f.fixAction?.tab === s.key).length;
              return fixCount > 0 ? (
                <span key={s.key} className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">{s.label} <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{fixCount}</span></span>
              ) : null;
            })}
            <button onClick={() => setFlowState("wizard")} className="bg-blue-600 text-white hover:bg-blue-700 rounded-full h-10 px-6 text-sm font-medium" data-testid="tips-continue-btn">
              Continue
            </button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto py-8 px-6 space-y-3">
          {allFixes.length > 0 && (
            <button onClick={() => { handleFixAll(); setFlowState("wizard"); }} className="mb-4 h-10 px-5 rounded-lg bg-amber-500 text-zinc-900 text-sm font-bold hover:bg-amber-400 flex items-center gap-2" data-testid="full-tips-fix-all"><Zap className="w-4 h-4" /> Fix All Easy Issues</button>
          )}
          {critFixes.map((fix, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4 bg-zinc-800 border border-zinc-700 rounded-xl" data-testid={`full-tip-${i}`}>
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-sm text-zinc-200 flex-1">{fix.message}</span>
              <span className="text-xs font-bold text-red-400 bg-red-900/40 px-2 py-0.5 rounded">+{fix.points}</span>
              {fix.fixAction && <button onClick={() => { setWizardStep(fix.fixAction!.tab as WizardStep || "header"); setFlowState("wizard"); }} className="h-7 px-3 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700">Fix</button>}
            </div>
          ))}
          {normFixes.map((fix, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl" data-testid={`full-tip-norm-${i}`}>
              <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span className="text-sm text-zinc-300 flex-1">{fix.message}</span>
              <span className="text-xs font-bold text-zinc-500 bg-zinc-700 px-2 py-0.5 rounded">+{fix.points}</span>
              {fix.fixAction && <button onClick={() => { setWizardStep(fix.fixAction!.tab as WizardStep || "header"); setFlowState("wizard"); }} className="h-7 px-3 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700">Fix</button>}
            </div>
          ))}
          {allFixes.length === 0 && (
            <div className="text-center py-16"><Check className="w-12 h-12 text-emerald-400 mx-auto mb-3" /><h3 className="text-lg font-semibold">Looking great!</h3><p className="text-sm text-zinc-400 mt-1">No issues found.</p></div>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // WIZARD (Main guided editor)
  // ════════════════════════════════════════════════════════════
  const renderStepContent = () => {
    switch (wizardStep) {
      case "header":
        return (
          <div data-testid="wizard-step-header">
            <h2 className="text-2xl font-bold text-zinc-900 mb-1">What&apos;s the best way for employers to contact you?</h2>
            <p className="text-base text-zinc-500 mb-8">We suggest including an email and phone number.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div><Label className={labelClass}>Full Name *</Label><Input className={inputClass} placeholder="John Smith" value={data.personalDetails.fullName} onChange={e => updatePersonal("fullName", e.target.value)} data-testid="personal-fullname" /></div>
              <div><Label className={labelClass}>Email *</Label><Input className={inputClass} type="email" placeholder="john@email.com" value={data.personalDetails.email} onChange={e => updatePersonal("email", e.target.value)} data-testid="personal-email" /></div>
              <div><Label className={labelClass}>Phone *</Label><Input className={inputClass} placeholder="(555) 123-4567" value={data.personalDetails.phone} onChange={e => updatePersonal("phone", e.target.value)} data-testid="personal-phone" /></div>
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
                      <div className="mt-4 flex justify-end"><button onClick={() => setEditingExpId(null)} className="h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700" data-testid={`done-exp-${exp.id!}`}>Done editing</button></div>
                    </div>
                  );
                }
                // Review card
                return (
                  <div key={exp.id!} className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-sm transition-all" data-testid={`exp-card-${exp.id!}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-zinc-900">{exp.title || "Untitled"}{exp.company && `, ${exp.company}`}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                          {exp.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {exp.location}</span>}
                          {(exp.startDate || exp.endDate) && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {exp.startDate} - {exp.current ? "Current" : exp.endDate}</span>}
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
            {/* AI Skill Suggestions */}
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

            {/* AI Generate Summary section */}
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
              <span className={`text-sm ${summaryWordCount > 50 && summaryWordCount <= 100 ? "text-emerald-600" : summaryWordCount > 100 ? "text-amber-600" : "text-zinc-400"}`}>{summaryWordCount} words</span>
            </div>
            <Textarea className="min-h-[140px] p-4 text-sm bg-white border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Experienced professional with..." value={data.summary} onChange={e => setData(prev => ({ ...prev, summary: e.target.value }))} data-testid="personal-summary" />
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

            {/* Certifications */}
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
  };

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-white" data-testid="resume-builder-editor">
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
        {/* Score ring */}
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
        {/* Mobile step header */}
        <div className="md:hidden flex items-center gap-1 px-4 py-2 border-b border-zinc-200 overflow-x-auto">
          {WIZARD_STEPS.map((s, i) => (
            <button key={s.key} onClick={() => setWizardStep(s.key)} className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${wizardStep === s.key ? "bg-blue-600 text-white" : "text-zinc-400"}`} data-testid={`mob-tab-${s.key}`}>
              {i + 1}. {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Form area */}
          <div className="flex-1 overflow-y-auto" data-testid="editor-form-area">
            <div className="max-w-2xl mx-auto px-6 lg:px-10 py-8">
              {/* Score Toolbar */}
              <div className="flex items-center justify-between mb-6 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 shadow-sm" data-testid="score-toolbar">
                <div className="flex items-center gap-4">
                  {/* Score number */}
                  <div className="flex items-baseline gap-0.5">
                    <span className={`text-xl font-black ${scorePct >= 80 ? "text-emerald-500" : scorePct >= 60 ? "text-sky-500" : scorePct >= 40 ? "text-amber-500" : "text-red-500"}`} data-testid="score-number">{scorePct}</span>
                    <span className="text-[10px] text-zinc-400 font-medium">/100</span>
                  </div>

                  {/* ATS bar */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-zinc-500">ATS</span>
                    <div className="w-12 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${Math.min(100, (scoreResult.breakdown.ats.score / scoreResult.breakdown.ats.max) * 100)}%` }} data-testid="ats-bar" />
                    </div>
                  </div>

                  {/* Readability bar */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-zinc-500">Readability</span>
                    <div className="w-12 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${Math.min(100, (scoreResult.breakdown.structure.score / scoreResult.breakdown.structure.max) * 100)}%` }} data-testid="readability-bar" />
                    </div>
                  </div>

                  {/* Impact bar */}
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

              {renderStepContent()}

              {/* Navigation */}
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
              <button onClick={() => { /* change template */ }} className="text-xs text-blue-600 hover:underline font-medium">Change template</button>
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

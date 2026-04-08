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
  Plus, Trash2, Pencil, ArrowUp, ArrowDown, Briefcase, GraduationCap,
  User, Wrench, Award, Clipboard, ArrowRight, Wand2, Eye, Zap,
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
type FlowState = "entry" | "processing" | "welcome" | "analysis" | "onboarding-level" | "onboarding-industry" | "templates" | "wizard" | "tips";

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

  // ── Paste mode ──
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const fileRef = React.useRef<HTMLInputElement>(null);

  // ── Load saved data ──
  useEffect(() => {
    const saved = loadFromStorage<ResumeData | null>(STORAGE_KEY, null as unknown as ResumeData);
    if (saved && (saved.personalDetails?.fullName || saved.experience?.length > 0 || saved.summary)) {
      setData(saved); setFlowState("wizard");
    }
  }, []);

  // ── Auto-save ──
  useEffect(() => {
    if (flowState === "wizard") {
      const t = setTimeout(() => saveToStorage(STORAGE_KEY, data), 500);
      return () => clearTimeout(t);
    }
  }, [data, flowState]);

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
    setImportSource(source); setFlowState("processing");
    try {
      if (source === "docx") { const { parseDocx } = await import("@/lib/career-tools/resume/import/docxParser"); const r = await parseDocx(file); setData(r.data); setConfidences(r.confidences); }
      else { const { parsePdf } = await import("@/lib/career-tools/resume/import/pdfParser"); const r = await parsePdf(file); setData(r.data); setConfidences(r.confidences); }
    } catch { toast({ title: "Import failed", variant: "destructive" }); setFlowState("entry"); }
  }, [toast]);

  const handleTextImport = useCallback((text: string) => {
    setImportSource("text"); setFlowState("processing");
    setTimeout(() => {
      try { const { parseText } = require("@/lib/career-tools/resume/import/textParser"); const r = parseText(text); setData(r.data); setConfidences(r.confidences); }
      catch { toast({ title: "Parse failed", variant: "destructive" }); setFlowState("entry"); }
    }, 100);
  }, [toast]);

  const handleProcessingComplete = useCallback(() => setFlowState("welcome"), []);
  const handleReset = () => { if (confirm("Clear all resume data?")) { setData(defaultResumeData); clearStorage(STORAGE_KEY); setFlowState("entry"); setConfidences([]); toast({ title: "Cleared" }); } };
  const handleDownloadPDF = () => { const pdf = generateResumePDF(data, template); pdf.save(`${data.personalDetails.fullName || "resume"}_resume.pdf`.replace(/\s+/g, "_")); toast({ title: "PDF Downloaded" }); };

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
  // ENTRY PAGE
  // ════════════════════════════════════════════════════════════
  if (flowState === "entry") {
    if (pasteMode) {
      return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-blue-50" data-testid="resume-builder-entry">
          <div className="w-full max-w-2xl">
            <button onClick={() => setPasteMode(false)} className="text-sm text-zinc-400 hover:text-zinc-600 mb-4 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Paste Your Resume</h2>
            <p className="text-sm text-zinc-500 mb-4">Paste your resume text below (min 50 characters)</p>
            <textarea className="w-full min-h-[300px] p-4 text-sm font-mono border border-zinc-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={"John Doe\njohn@email.com\n\nEXPERIENCE\nSoftware Engineer at Acme Corp..."} value={pasteText} onChange={e => setPasteText(e.target.value)} data-testid="paste-textarea" />
            <button onClick={() => { if (pasteText.trim().length >= 50) handleTextImport(pasteText.trim()); }} disabled={pasteText.trim().length < 50} className="mt-3 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 rounded-full h-12 px-8 text-sm font-medium" data-testid="parse-paste-btn">Parse Resume</button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-blue-50" data-testid="resume-builder-entry">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-3">Resume Builder</h1>
          <p className="text-lg text-zinc-500 mb-10">Create a professional, ATS-optimized resume in minutes.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Import Card */}
            <div className="p-6 border-2 border-zinc-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer bg-white group text-left" onClick={() => fileRef.current?.click()} data-testid="upload-drop-zone">
              <input ref={fileRef} type="file" accept=".docx,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileImport(f); }} />
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">Import Your Resume</h3>
              <p className="text-sm text-zinc-500 mb-3">Upload your existing .DOCX or .PDF file</p>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">.DOCX</span>
                <span className="text-xs bg-red-50 text-red-500 px-2.5 py-1 rounded-full font-medium">.PDF</span>
              </div>
              <button onClick={e => { e.stopPropagation(); setPasteMode(true); }} className="mt-3 text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1" data-testid="paste-option">
                <Clipboard className="w-3 h-3" /> Or paste text
              </button>
            </div>
            {/* Create Card */}
            <div className="p-6 border-2 border-zinc-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer bg-white group text-left" onClick={() => setFlowState("onboarding-level")} data-testid="scratch-option">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors text-amber-600">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">Create From Scratch</h3>
              <p className="text-sm text-zinc-500">Start fresh with guided step-by-step assistance and a template.</p>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-8">100% private &mdash; processed in your browser. No signup required.</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // PROCESSING
  // ════════════════════════════════════════════════════════════
  if (flowState === "processing") return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50" data-testid="resume-builder-processing"><div className="max-w-md w-full"><ImportProcessing source={importSource} onComplete={handleProcessingComplete} /></div></div>;

  // ════════════════════════════════════════════════════════════
  // WELCOME (Import path — "Nice to meet you, {Name}")
  // ════════════════════════════════════════════════════════════
  if (flowState === "welcome") {
    const firstName = data.personalDetails.fullName?.split(" ")[0] || "there";
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-blue-50" data-testid="import-welcome">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-6">Nice to meet you, {firstName}</h1>
          <div className="text-left max-w-lg mx-auto space-y-4 text-lg text-zinc-700 leading-relaxed">
            {data.experience[0]?.title && data.experience[0]?.company && (
              <p>You are currently a <strong className="text-zinc-900">{data.experience[0].title}</strong> at <strong className="text-zinc-900">{data.experience[0].company}</strong>.</p>
            )}
            {data.experience.length > 1 && (
              <p>With <strong className="text-zinc-900">{data.experience.length} positions</strong> in your career{data.skills.length > 0 && <>, specializing in <strong className="text-zinc-900">{data.skills.slice(0, 3).join(", ")}</strong></>}, you have a strong foundation.</p>
            )}
            {data.certifications.length > 0 && (
              <p>Your <strong className="text-zinc-900">{data.certifications.slice(0, 2).join(" and ")}</strong> certification{data.certifications.length > 1 ? "s" : ""} showcase{data.certifications.length === 1 ? "s" : ""} your commitment to professional development.</p>
            )}
            <p>We will tailor your resume-building experience to emphasize your strengths and ensure it aligns with your impressive background.</p>
          </div>
          <button onClick={() => setFlowState("analysis")} className="mt-10 bg-blue-600 text-white hover:bg-blue-700 rounded-full h-14 px-10 text-lg font-medium transition-colors inline-flex items-center gap-2" data-testid="welcome-continue-btn">
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // ANALYSIS ("You're off to a great start!")
  // ════════════════════════════════════════════════════════════
  if (flowState === "analysis") {
    const gotRight: string[] = [];
    if (data.personalDetails.email || data.personalDetails.phone) gotRight.push("You listed multiple ways for employers to contact you.");
    if (data.experience.length > 0 && data.summary && data.skills.length > 0) gotRight.push("You included all the sections employers look for on a resume.");
    if (data.experience.length > 0) gotRight.push(`${data.experience.length} work experience${data.experience.length > 1 ? "s" : ""} detected.`);
    if (data.skills.length > 0) gotRight.push(`${data.skills.length} skills identified.`);
    if (gotRight.length === 0) gotRight.push("We found the basic structure of your resume.");

    const improvements: string[] = [];
    improvements.push("We'll suggest section titles that match the ones employers scan for.");
    if (data.experience.length > 0) improvements.push("Revise your experience section using AI writing help.");
    improvements.push("AI-enhance your summary to align with best practices.");

    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-blue-50" data-testid="import-analysis">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-2">You&apos;re off to a great start!</h1>
            <p className="text-lg text-zinc-500">Here&apos;s what you got right and some areas we&apos;ll help you improve.</p>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-zinc-900">You got it right</h3>
            </div>
            {gotRight.map((item, i) => (
              <div key={i} className="flex items-start gap-3 mb-2 last:mb-0">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-base text-zinc-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-zinc-900">How we&apos;ll help you improve</h3>
            </div>
            {improvements.map((item, i) => (
              <div key={i} className="flex items-start gap-3 mb-2 last:mb-0">
                <Star className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-base text-zinc-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <button onClick={() => setFlowState("templates")} className="bg-blue-600 text-white hover:bg-blue-700 rounded-full h-14 px-10 text-lg font-medium transition-colors inline-flex items-center gap-2" data-testid="analysis-continue-btn">
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // ONBOARDING — Experience Level
  // ════════════════════════════════════════════════════════════
  if (flowState === "onboarding-level") {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-blue-50" data-testid="onboarding-level">
        <div className="w-full max-w-lg text-center">
          <Briefcase className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">How much work experience<br />do you have?</h1>
          <p className="text-base text-zinc-500 mb-8">Select the one that best describes you.</p>
          <div className="space-y-3 max-w-sm mx-auto">
            {EXPERIENCE_LEVELS.map(l => (
              <button key={l.id} onClick={() => { setOnboardLevel(l.id); setFlowState("onboarding-industry"); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all hover:shadow-md hover:border-blue-400 border-zinc-200 bg-white" data-testid={`level-${l.id}`}>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600"><Briefcase className="w-5 h-5" /></div>
                <div><div className="text-base font-semibold text-zinc-900">{l.label}</div><div className="text-sm text-zinc-500">{l.desc}</div></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // ONBOARDING — Industry
  // ════════════════════════════════════════════════════════════
  if (flowState === "onboarding-industry") {
    const toggleInd = (ind: string) => setOnboardIndustries(prev => prev.includes(ind) ? prev.filter(x => x !== ind) : prev.length < 3 ? [...prev, ind] : prev);
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-blue-50" data-testid="onboarding-industry">
        <div className="w-full max-w-xl text-center">
          <Wrench className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">What industry are you<br />making this resume for?</h1>
          <p className="text-base text-zinc-500 mb-8">You can select up to 3 industries.</p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {INDUSTRIES.map(ind => (
              <button key={ind} onClick={() => toggleInd(ind)} className={`px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${onboardIndustries.includes(ind) ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-200 text-zinc-700 bg-white hover:border-blue-300"}`} data-testid={`industry-${ind.replace(/\s+/g, "-").toLowerCase()}`}>
                {ind}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setFlowState("onboarding-level")} className="h-12 px-6 rounded-full border-2 border-zinc-200 text-zinc-600 font-medium text-sm hover:bg-zinc-50 bg-white flex items-center gap-2" data-testid="onboarding-back">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => setFlowState("templates")} disabled={onboardIndustries.length === 0} className="h-12 px-8 rounded-full bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-40 flex items-center gap-2" data-testid="onboarding-continue">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // TEMPLATE SELECTION
  // ════════════════════════════════════════════════════════════
  if (flowState === "templates") {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-blue-50" data-testid="template-selection">
        <div className="w-full max-w-3xl">
          <h2 className="text-3xl font-bold text-zinc-900 mb-1 text-center">Choose a Template</h2>
          <p className="text-base text-zinc-500 mb-8 text-center">Pick a layout for your resume. You can change it later.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setTemplate(t.id)} className={`relative rounded-2xl border-2 p-4 text-left transition-all hover:shadow-lg ${template === t.id ? "border-blue-600 bg-blue-50 shadow-md" : "border-zinc-200 bg-white hover:border-zinc-400"}`} data-testid={`template-${t.id}`}>
                {t.premium && <span className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[9px] px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
                <div className="w-full aspect-[1/1.414] bg-zinc-100 rounded-lg mb-3 flex items-center justify-center">
                  <FileText className={`w-8 h-8 ${template === t.id ? "text-blue-600" : "text-zinc-300"}`} />
                </div>
                <p className="text-sm font-semibold text-zinc-800">{t.name}</p>
                <p className="text-xs text-zinc-400">{t.desc}</p>
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button onClick={() => { setFlowState("wizard"); setWizardStep("header"); toast({ title: "Let's build!", description: "Fill in each section — your score updates live." }); }} className="bg-blue-600 text-white hover:bg-blue-700 rounded-full h-14 px-10 text-lg font-medium transition-colors inline-flex items-center gap-2" data-testid="template-continue-btn">
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
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
              {/* Tips & Fixes bar */}
              <div className="flex items-center justify-between mb-6">
                <div />
                <button onClick={() => setFlowState("tips")} className="h-9 px-4 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 shadow-sm" data-testid="tips-toggle">
                  <Star className="w-4 h-4 text-amber-400" /> Tips & fixes {allFixes.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{allFixes.length}</span>}
                </button>
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
                <div className="p-6 text-sm" id="resume-preview">
                  <h1 className="text-lg font-bold text-center text-zinc-900 mb-0.5">{data.personalDetails.fullName || "Your Name"}</h1>
                  <div className="text-center text-zinc-500 text-[10px] mb-0.5">{[data.personalDetails.email, data.personalDetails.phone, data.personalDetails.location].filter(Boolean).join("  |  ") || "email@example.com | (555) 123-4567"}</div>
                  {(data.personalDetails.linkedin || data.personalDetails.portfolio) && <div className="text-center text-zinc-400 text-[10px] mb-3">{[data.personalDetails.linkedin, data.personalDetails.portfolio].filter(Boolean).join("  |  ")}</div>}
                  {data.summary && <div className="mb-3"><div className="border-b border-zinc-200 mb-1 pb-0.5"><h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Professional Summary</h2></div><p className="text-zinc-600 text-[10px] leading-relaxed whitespace-pre-line">{data.summary}</p></div>}
                  {data.experience.length > 0 && <div className="mb-3"><div className="border-b border-zinc-200 mb-1 pb-0.5"><h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Experience</h2></div>{data.experience.map((exp, i) => <div key={exp.id||i} className="mb-2"><div className="flex justify-between items-baseline"><span className="font-semibold text-zinc-900 text-[11px]">{exp.title||"Job Title"}</span><span className="text-zinc-400 text-[9px]">{exp.startDate} - {exp.current?"Present":exp.endDate}</span></div><div className="text-zinc-500 text-[9px]">{exp.company}{exp.location&&`, ${exp.location}`}</div>{exp.description&&<p className="text-zinc-600 text-[10px] mt-0.5 whitespace-pre-line leading-relaxed">{exp.description}</p>}</div>)}</div>}
                  {data.education.length > 0 && <div className="mb-3"><div className="border-b border-zinc-200 mb-1 pb-0.5"><h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Education</h2></div>{data.education.map((edu, i) => <div key={edu.id||i} className="mb-1"><div className="flex justify-between items-baseline"><span className="font-semibold text-zinc-900 text-[11px]">{edu.degree}{edu.field&&` in ${edu.field}`}</span><span className="text-zinc-400 text-[9px]">{edu.startDate} - {edu.endDate}</span></div><div className="text-zinc-500 text-[9px]">{edu.school}</div></div>)}</div>}
                  {data.skills.length > 0 && <div className="mb-3"><div className="border-b border-zinc-200 mb-1 pb-0.5"><h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Skills</h2></div><p className="text-zinc-600 text-[10px]">{data.skills.join(" \u2022 ")}</p></div>}
                  {data.certifications.length > 0 && <div><div className="border-b border-zinc-200 mb-1 pb-0.5"><h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Certifications</h2></div><ul className="text-zinc-600 text-[10px]">{data.certifications.map(c => <li key={c}>&bull; {c}</li>)}</ul></div>}
                  {!data.summary && data.experience.length === 0 && data.skills.length === 0 && <div className="text-center text-zinc-300 py-12"><p className="text-xs">Fill in your details to see the preview</p></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

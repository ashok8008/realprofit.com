"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Upload, User, Briefcase, GraduationCap, Wrench, Award, ChevronLeft, Download, Printer, PanelLeftClose, PanelLeft, X, Shield, Eye, TrendingUp, Zap, ArrowRight, FileText, Clipboard, Lightbulb, AlertTriangle, Check } from "lucide-react";
import { saveToStorage, loadFromStorage, clearStorage } from "@/lib/career-tools/storage";
import { generateResumePDF, type ResumeData } from "@/lib/career-tools/pdf-export";
import { useToast } from "@/hooks/use-toast";
import { analyzeBulletPoints, analyzeSummary, smartRewriteBullets, smartRewriteSummary, canUseAi, recordAiUsage, getAiRemaining, AI_FREE_TOTAL } from "@/lib/career-tools/smartSuggestions";
import type { Experience, Education, AiSuggestion } from "./resume/types";
import { PersonalTab } from "./resume/PersonalTab";
import { ExperienceTab } from "./resume/ExperienceTab";
import { EducationTab } from "./resume/EducationTab";
import { SkillsTab, ExtrasTab } from "./resume/SkillsExtrasTab";
import { ImportProcessing } from "./resume/ImportProcessing";
import { ImportReview } from "./resume/ImportReview";
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

const STEPS = [
  { key: "personal", label: "Personal", icon: User },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Wrench },
  { key: "extras", label: "Extras", icon: Award },
] as const;

type FlowState = "entry" | "processing" | "review" | "templates" | "editor";

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
  const [tipsOpen, setTipsOpen] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = loadFromStorage<ResumeData | null>(STORAGE_KEY, null as unknown as ResumeData);
    if (saved && (saved.personalDetails?.fullName || saved.experience?.length > 0 || saved.summary)) {
      setData(saved); setFlowState("editor");
    }
  }, []);

  useEffect(() => {
    if (flowState === "editor") {
      const t = setTimeout(() => saveToStorage(STORAGE_KEY, data), 500);
      return () => clearTimeout(t);
    }
  }, [data, flowState]);

  const scoreResult = useMemo(() => calculateResumeScore(data), [data]);
  const scoreGroups = useMemo(() => {
    const g = [
      { key: "ats", label: "ATS", icon: Shield, cats: ["ats", "structure"] },
      { key: "readability", label: "Readability", icon: Eye, cats: ["completeness", "presence"] },
      { key: "impact", label: "Impact", icon: TrendingUp, cats: ["experience", "impact", "skills"] },
    ];
    return g.map(gr => { let s = 0, m = 0; gr.cats.forEach(c => { const b = scoreResult.breakdown[c as keyof typeof scoreResult.breakdown]; if (b) { s += b.score; m += b.max; } }); return { ...gr, score: s, max: m, pct: m > 0 ? Math.round((s / m) * 100) : 0 }; });
  }, [scoreResult]);
  const allFixes = scoreResult.suggestions;

  // ─── Handlers ─────────────────────────────────────────────
  const handleFileImport = useCallback(async (file: File) => {
    const ext = file.name.toLowerCase();
    const source = ext.endsWith(".docx") ? "docx" as const : "pdf" as const;
    setImportSource(source); setFlowState("processing");
    try {
      if (source === "docx") { const { parseDocx } = await import("@/lib/career-tools/resume/import/docxParser"); const r = await parseDocx(file); setData(r.data); setConfidences(r.confidences); }
      else { const { parsePdf } = await import("@/lib/career-tools/resume/import/pdfParser"); const r = await parsePdf(file); setData(r.data); setConfidences(r.confidences); }
    } catch { toast({ title: "Import failed", description: "Could not parse the file.", variant: "destructive" }); setFlowState("entry"); }
  }, [toast]);

  const handleTextImport = useCallback((text: string) => {
    setImportSource("text"); setFlowState("processing");
    setTimeout(() => {
      try { const { parseText } = require("@/lib/career-tools/resume/import/textParser"); const r = parseText(text); setData(r.data); setConfidences(r.confidences); }
      catch { toast({ title: "Parse failed", variant: "destructive" }); setFlowState("entry"); }
    }, 100);
  }, [toast]);

  const handleStartScratch = useCallback(() => { setData(defaultResumeData); setFlowState("templates"); }, []);
  const handleProcessingComplete = useCallback(() => setFlowState("review"), []);
  const handleReviewContinue = useCallback(() => { setFlowState("templates"); }, []);
  const handleTemplateSelect = useCallback(() => { setFlowState("editor"); toast({ title: "Let's build!", description: "Fill in each section. Score updates live." }); }, [toast]);
  const handleNewImport = useCallback(() => { setFlowState("entry"); setConfidences([]); }, []);

  const updatePersonal = (field: keyof ResumeData["personalDetails"], value: string) => setData(prev => ({ ...prev, personalDetails: { ...prev.personalDetails, [field]: value } }));
  const addExperience = () => setData(prev => ({ ...prev, experience: [...prev.experience, { id: Date.now().toString(), title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }] }));
  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => setData(prev => ({ ...prev, experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e) }));
  const removeExperience = (id: string) => setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  const addEducation = () => setData(prev => ({ ...prev, education: [...prev.education, { id: Date.now().toString(), school: "", degree: "", field: "", startDate: "", endDate: "" }] }));
  const updateEducation = (id: string, field: keyof Education, value: string) => setData(prev => ({ ...prev, education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e) }));
  const removeEducation = (id: string) => setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  const addSkill = () => { if (skillInput.trim() && !data.skills.includes(skillInput.trim())) { setData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] })); setSkillInput(""); } };
  const removeSkill = (s: string) => setData(prev => ({ ...prev, skills: prev.skills.filter(x => x !== s) }));
  const addCertification = () => { if (certInput.trim() && !data.certifications.includes(certInput.trim())) { setData(prev => ({ ...prev, certifications: [...prev.certifications, certInput.trim()] })); setCertInput(""); } };
  const removeCertification = (c: string) => setData(prev => ({ ...prev, certifications: prev.certifications.filter(x => x !== c) }));

  const handleReset = () => { if (confirm("Clear all resume data?")) { setData(defaultResumeData); clearStorage(STORAGE_KEY); setFlowState("entry"); setConfidences([]); toast({ title: "Cleared" }); } };
  const handleDownloadPDF = () => { const pdf = generateResumePDF(data, template); pdf.save(`${data.personalDetails.fullName || "resume"}_resume.pdf`.replace(/\s+/g, "_")); toast({ title: "PDF Downloaded" }); };
  const handleFixAll = () => {
    const f = fixAllEasyIssues({ summary: data.summary, experience: data.experience.map(e => ({ description: e.description })), skills: data.skills });
    setData(prev => ({ ...prev, summary: f.summary, experience: prev.experience.map((e, i) => ({ ...e, description: f.experiences[i] || e.description })), skills: f.skills }));
    toast({ title: "Fixes applied!" });
  };

  const bulletSuggestions = useMemo(() => { const m: Record<string, ReturnType<typeof analyzeBulletPoints>> = {}; data.experience.forEach(e => { if (e.id && e.description.trim()) m[e.id] = analyzeBulletPoints(e.description); }); return m; }, [data.experience]);
  const summarySuggestions = useMemo(() => data.summary.trim() ? analyzeSummary(data.summary, data.skills) : [], [data.summary, data.skills]);

  const smartImproveBullet = (id: string, t: string) => { if (!t.trim()) return; const imp = smartRewriteBullets(t); if (imp !== t) { updateExperience(id, "description", imp); toast({ title: "Improved!" }); } else toast({ title: "Already good!" }); };
  const smartImproveSummary = () => { if (!data.summary.trim()) return; const imp = smartRewriteSummary(data.summary, data.skills); if (imp !== data.summary) { setData(p => ({ ...p, summary: imp })); toast({ title: "Improved!" }); } else toast({ title: "Already good!" }); };

  const aiImproveBullet = async (id: string, text: string, title: string) => {
    if (!text.trim() || !canUseAi()) return; setAiLoading(`bullet-${id}`); setAiSuggestion(null);
    try { const r = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/career-tools/improve-bullet`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bullet_point: text, job_title: title }) }); if (!r.ok) throw 0; const d = await r.json(); recordAiUsage(); setAiRemaining(getAiRemaining()); setAiSuggestion({ id: `bullet-${id}`, original: text, improved: d.improved, suggestions: d.suggestions }); }
    catch { toast({ title: "AI Error", variant: "destructive" }); } finally { setAiLoading(null); }
  };
  const aiImproveSummary = async () => {
    if (!data.summary.trim() || !canUseAi()) return; setAiLoading("summary"); setAiSuggestion(null);
    try { const r = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/career-tools/improve-summary`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current_summary: data.summary, job_title: data.experience[0]?.title || "", skills: data.skills.slice(0, 5) }) }); if (!r.ok) throw 0; const d = await r.json(); recordAiUsage(); setAiRemaining(getAiRemaining()); setAiSuggestion({ id: "summary", original: data.summary, improved: d.improved }); }
    catch { toast({ title: "AI Error", variant: "destructive" }); } finally { setAiLoading(null); }
  };
  const acceptAiSuggestion = () => { if (!aiSuggestion) return; if (aiSuggestion.id === "summary") setData(p => ({ ...p, summary: aiSuggestion.improved })); else updateExperience(aiSuggestion.id.replace("bullet-", ""), "description", aiSuggestion.improved); toast({ title: "Applied!" }); setAiSuggestion(null); };
  const dismissAiSuggestion = () => setAiSuggestion(null);
  const summaryWordCount = data.summary.trim().split(/\s+/).filter(Boolean).length;
  const currentStepIndex = STEPS.findIndex(s => s.key === activeTab);

  // ─── ENTRY: Compact Upload + Create ───────────────────────
  if (flowState === "entry") {

    if (pasteMode) {
      return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4" data-testid="resume-builder-entry">
          <div className="w-full max-w-2xl">
            <button onClick={() => setPasteMode(false)} className="text-sm text-zinc-400 hover:text-zinc-600 mb-4 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Paste Your Resume</h2>
            <p className="text-sm text-zinc-500 mb-4">Paste your resume text below (min 50 characters)</p>
            <textarea className="w-full min-h-[300px] p-4 text-sm font-mono border border-zinc-300 rounded-lg bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent" placeholder={"John Doe\njohn@email.com\n\nEXPERIENCE\nSoftware Engineer at Acme Corp..."} value={pasteText} onChange={e => setPasteText(e.target.value)} data-testid="paste-textarea" />
            <button onClick={() => { if (pasteText.trim().length >= 50) handleTextImport(pasteText.trim()); }} disabled={pasteText.trim().length < 50} className="mt-3 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40 rounded-lg h-11 px-6 text-sm font-medium" data-testid="parse-paste-btn">Parse Resume</button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4" data-testid="resume-builder-entry">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Resume Builder</h1>
          <p className="text-base text-zinc-500 mb-8">Create a professional, ATS-optimized resume in minutes.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload */}
            <div className="p-5 border border-zinc-200 rounded-xl hover:border-zinc-900 hover:shadow-md transition-all cursor-pointer bg-white group text-left" onClick={() => fileRef.current?.click()} data-testid="upload-drop-zone">
              <input ref={fileRef} type="file" accept=".docx,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileImport(f); }} />
              <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center mb-3 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 mb-1">Upload Resume</h3>
              <p className="text-sm text-zinc-500 mb-3">Import your existing .DOCX or .PDF file</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">.DOCX</span>
                <span className="text-[11px] bg-red-50 text-red-500 px-2 py-0.5 rounded font-medium">.PDF</span>
              </div>
              <button onClick={e => { e.stopPropagation(); setPasteMode(true); }} className="mt-3 text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1" data-testid="paste-option">
                <Clipboard className="w-3 h-3" /> Or paste text
              </button>
            </div>
            {/* Create */}
            <div className="p-5 border border-zinc-200 rounded-xl hover:border-zinc-900 hover:shadow-md transition-all cursor-pointer bg-white group text-left" onClick={handleStartScratch} data-testid="scratch-option">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center mb-3 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 mb-1">Create From Scratch</h3>
              <p className="text-sm text-zinc-500">Start fresh with a blank resume and choose a template.</p>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-6">100% private &mdash; processed in your browser. No signup required.</p>
        </div>
      </div>
    );
  }

  if (flowState === "processing") return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center" data-testid="resume-builder-processing"><div className="max-w-md w-full"><ImportProcessing source={importSource} onComplete={handleProcessingComplete} /></div></div>;
  if (flowState === "review") return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4" data-testid="resume-builder-review"><div className="max-w-4xl w-full"><ImportReview confidences={confidences} source={importSource} onContinue={handleReviewContinue} /></div></div>;

  // ─── TEMPLATE SELECTION STEP ──────────────────────────────
  if (flowState === "templates") {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4" data-testid="template-selection">
        <div className="w-full max-w-3xl">
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">Choose a Template</h2>
          <p className="text-sm text-zinc-500 mb-8">Pick a layout for your resume. You can change this later.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setTemplate(t.id)} className={`relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${template === t.id ? "border-zinc-900 bg-zinc-50 shadow-sm" : "border-zinc-200 bg-white hover:border-zinc-400"}`} data-testid={`template-${t.id}`}>
                {t.premium && <span className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[9px] px-1.5 py-0.5 rounded-full font-bold">PRO</span>}
                <div className="w-full aspect-[1/1.414] bg-zinc-100 rounded-lg mb-3 flex items-center justify-center">
                  <FileText className={`w-8 h-8 ${template === t.id ? "text-zinc-900" : "text-zinc-300"}`} />
                </div>
                <p className="text-sm font-semibold text-zinc-800">{t.name}</p>
                <p className="text-xs text-zinc-400">{t.desc}</p>
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <button onClick={handleTemplateSelect} className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg h-12 px-10 text-base font-medium transition-colors" data-testid="template-continue-btn">
              Continue with {TEMPLATES.find(t => t.id === template)?.name || "Clean"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── EDITOR ───────────────────────────────────────────────
  const scorePct = scoreResult.total;
  const scoreColor = scorePct >= 80 ? "text-emerald-600" : scorePct >= 60 ? "text-teal-600" : scorePct >= 40 ? "text-amber-500" : "text-red-500";

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-white" data-testid="resume-builder-editor">
      {/* ─── SIDEBAR ─── */}
      <aside className={`hidden lg:flex flex-col border-r border-zinc-200 bg-zinc-50/50 flex-shrink-0 transition-all duration-200 ${sidebarOpen ? "w-56" : "w-14"}`} data-testid="editor-sidebar">
        <div className={`flex items-center border-b border-zinc-200 ${sidebarOpen ? "px-4 py-3 justify-between" : "p-2 justify-center"}`}>
          {sidebarOpen && <Link href="/career-tools" className="text-xs text-zinc-400 hover:text-zinc-700 flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Back</Link>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-zinc-400 hover:text-zinc-700" data-testid="sidebar-toggle">
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        </div>
        <nav className="flex-1 py-2 px-1.5">
          {sidebarOpen && <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-zinc-400 px-2.5 mb-2">Sections</p>}
          {STEPS.map((step, idx) => {
            const Icon = step.icon; const isActive = activeTab === step.key; const isPast = idx < currentStepIndex;
            return (
              <button key={step.key} onClick={() => setActiveTab(step.key)} className={`w-full flex items-center gap-2.5 rounded-md mb-0.5 transition-all ${sidebarOpen ? "px-2.5 py-2" : "px-0 py-2 justify-center"} ${isActive ? "bg-zinc-900 text-white" : isPast ? "text-zinc-700 hover:bg-zinc-100" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"}`} data-testid={`sidebar-step-${step.key}`} title={!sidebarOpen ? step.label : undefined}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm">{step.label}</span>}
              </button>
            );
          })}
        </nav>
        {sidebarOpen && (
          <div className="border-t border-zinc-200 p-3 space-y-1">
            <button onClick={handleNewImport} className="w-full text-xs text-zinc-400 hover:text-zinc-700 flex items-center gap-2 py-1" data-testid="new-import-btn"><Upload className="w-3 h-3" /> Import</button>
            <button onClick={handleReset} className="w-full text-xs text-zinc-400 hover:text-red-500 flex items-center gap-2 py-1" data-testid="resume-reset-btn"><RotateCcw className="w-3 h-3" /> Reset</button>
          </div>
        )}
        {/* Score widget */}
        <div className={`border-t border-zinc-200 p-3 ${sidebarOpen ? "" : "flex justify-center"}`} data-testid="score-widget">
          <div className={`flex items-center ${sidebarOpen ? "gap-2.5" : "justify-center"}`}>
            <div className="relative w-9 h-9 flex-shrink-0">
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36"><circle cx="18" cy="18" r="14" fill="none" stroke="#e4e4e7" strokeWidth="3" /><circle cx="18" cy="18" r="14" fill="none" stroke={scorePct >= 80 ? "#059669" : scorePct >= 60 ? "#0d9488" : scorePct >= 40 ? "#d97706" : "#dc2626"} strokeWidth="3" strokeDasharray={`${2*Math.PI*14}`} strokeDashoffset={`${2*Math.PI*14*(1-scorePct/100)}`} strokeLinecap="round" className="transition-all duration-500" /></svg>
              <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${scoreColor}`}>{scorePct}</span>
            </div>
            {sidebarOpen && <div><p className="text-xs font-medium text-zinc-700">Score</p><p className="text-[10px] text-zinc-400">{allFixes.length} fixes</p></div>}
          </div>
        </div>
      </aside>

      {/* ─── FORM WORKSPACE ─── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-zinc-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/career-tools" className="lg:hidden text-zinc-400 hover:text-zinc-600"><ChevronLeft className="w-5 h-5" /></Link>
            {/* Mobile tabs */}
            <div className="lg:hidden flex gap-1 overflow-x-auto">
              {STEPS.map((s, i) => <button key={s.key} onClick={() => setActiveTab(s.key)} className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${activeTab === s.key ? "bg-zinc-900 text-white" : "text-zinc-400"}`} data-testid={`tab-${s.key}`}>{i+1}. {s.label}</button>)}
            </div>
            {/* Score chips (desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              <span className={`text-lg font-bold ${scoreColor}`}>{scorePct}</span>
              <span className="text-xs text-zinc-400">/100</span>
              {scoreGroups.map(g => {
                const barCol = g.pct >= 80 ? "bg-emerald-500" : g.pct >= 60 ? "bg-teal-500" : g.pct >= 40 ? "bg-amber-500" : "bg-red-400";
                return <div key={g.key} className="flex items-center gap-1.5" data-testid={`ats-group-${g.key}`}>
                  <span className="text-[11px] text-zinc-500">{g.label}</span>
                  <div className="w-12 h-1.5 bg-zinc-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${barCol}`} style={{ width: `${g.pct}%` }} /></div>
                </div>;
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {allFixes.length > 0 && (
              <button onClick={() => setTipsOpen(!tipsOpen)} className={`h-8 px-3 rounded-md border text-sm font-medium flex items-center gap-1.5 transition-colors ${tipsOpen ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700"}`} data-testid="tips-toggle">
                <Lightbulb className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tips</span>
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 rounded-full">{allFixes.length}</span>
              </button>
            )}
            <Button size="sm" onClick={handleDownloadPDF} className="h-8 px-3 text-xs bg-zinc-900 hover:bg-zinc-800 text-white" data-testid="resume-download-btn">
              <Download className="w-3.5 h-3.5 mr-1" /> PDF
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Form scroll area */}
          <div className="flex-1 overflow-y-auto" data-testid="editor-form-area">
            <div className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="sr-only">{STEPS.map(s => <TabsTrigger key={s.key} value={s.key}>{s.label}</TabsTrigger>)}</TabsList>
                <TabsContent value="personal"><PersonalTab personalDetails={data.personalDetails} summary={data.summary} summaryWordCount={summaryWordCount} onUpdatePersonal={updatePersonal} onUpdateSummary={v => setData(p => ({ ...p, summary: v }))} onSmartImproveSummary={smartImproveSummary} onAiImproveSummary={aiImproveSummary} aiLoading={aiLoading} aiSuggestion={aiSuggestion} aiRemaining={aiRemaining} aiTotal={AI_FREE_TOTAL} onAcceptAi={acceptAiSuggestion} onDismissAi={dismissAiSuggestion} summarySuggestions={summarySuggestions} /></TabsContent>
                <TabsContent value="experience"><ExperienceTab experience={data.experience as Experience[]} onAdd={addExperience} onUpdate={updateExperience} onRemove={removeExperience} onSmartImproveBullet={smartImproveBullet} onAiImproveBullet={aiImproveBullet} aiLoading={aiLoading} aiSuggestion={aiSuggestion} aiRemaining={aiRemaining} aiTotal={AI_FREE_TOTAL} onAcceptAi={acceptAiSuggestion} onDismissAi={dismissAiSuggestion} bulletSuggestions={bulletSuggestions} /></TabsContent>
                <TabsContent value="education"><EducationTab education={data.education as Education[]} onAdd={addEducation} onUpdate={updateEducation} onRemove={removeEducation} /></TabsContent>
                <TabsContent value="skills"><SkillsTab skills={data.skills} skillInput={skillInput} onSkillInputChange={setSkillInput} onAddSkill={addSkill} onRemoveSkill={removeSkill} /></TabsContent>
                <TabsContent value="extras"><ExtrasTab certifications={data.certifications} certInput={certInput} onCertInputChange={setCertInput} onAddCert={addCertification} onRemoveCert={removeCertification} /></TabsContent>
              </Tabs>
              <div className="mt-10 pt-6 border-t border-zinc-200 flex items-center justify-between">
                <button onClick={() => { const p = STEPS[currentStepIndex - 1]; if (p) setActiveTab(p.key); }} disabled={currentStepIndex === 0} className="text-sm text-zinc-400 hover:text-zinc-600 disabled:opacity-30 flex items-center gap-1" data-testid="step-back-btn"><ChevronLeft className="w-4 h-4" /> Back</button>
                <button onClick={() => { const n = STEPS[currentStepIndex + 1]; if (n) setActiveTab(n.key); }} disabled={currentStepIndex === STEPS.length - 1} className="bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40 rounded-lg h-11 px-8 text-sm font-medium inline-flex items-center gap-2" data-testid="step-continue-btn">Continue <span className="text-white/50">({currentStepIndex + 1}/{STEPS.length})</span></button>
              </div>
            </div>
          </div>

          {/* Tips & Fixes panel (slide-out) */}
          {tipsOpen && (
            <div className="w-72 border-l border-zinc-200 bg-zinc-50/80 overflow-y-auto flex-shrink-0 animate-in slide-in-from-right duration-200" data-testid="tips-panel">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
                <h3 className="text-sm font-semibold text-zinc-800">Tips & Fixes</h3>
                <div className="flex items-center gap-2">
                  <button onClick={handleFixAll} className="text-[11px] font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1" data-testid="fix-all-btn"><Zap className="w-3 h-3" /> Fix all</button>
                  <button onClick={() => setTipsOpen(false)} className="text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-3 space-y-1.5">
                {allFixes.map((fix, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-md shadow-sm" data-testid="quick-fix-card">
                    <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 ${fix.severity === "critical" ? "text-red-500" : "text-amber-500"}`} />
                    <span className="text-xs text-zinc-700 truncate flex-1">{fix.message}</span>
                    <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 flex-shrink-0">+{fix.points}</span>
                    {fix.fixAction && (
                      <button onClick={() => { setActiveTab(fix.fixAction!.tab || "personal"); setTipsOpen(false); }} className="h-5 px-2 text-[10px] font-medium bg-zinc-900 text-white rounded hover:bg-zinc-800 flex-shrink-0" data-testid="quick-fix-btn">Fix</button>
                    )}
                  </div>
                ))}
                {allFixes.length === 0 && <p className="text-xs text-zinc-400 text-center py-4">No issues found. Great job!</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── LIVE PREVIEW ─── */}
      <div className="hidden xl:flex flex-col w-[42%] border-l border-zinc-200 bg-zinc-100 flex-shrink-0 overflow-hidden" data-testid="resume-preview-panel">
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-zinc-200 bg-white">
          <h3 className="text-sm font-medium text-zinc-700 flex items-center gap-2"><Eye className="w-4 h-4 text-zinc-400" /> Preview</h3>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="h-7 text-[11px] px-2 text-zinc-500" data-testid="resume-print-btn"><Printer className="w-3 h-3 mr-1" /> Print</Button>
            <Button size="sm" onClick={handleDownloadPDF} className="h-7 text-[11px] px-2 bg-zinc-900 text-white" data-testid="resume-download-btn-preview"><Download className="w-3 h-3 mr-1" /> PDF</Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex justify-center">
          <div className="bg-white border border-zinc-200 rounded-lg shadow-sm w-full max-w-md overflow-hidden">
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
  );
}

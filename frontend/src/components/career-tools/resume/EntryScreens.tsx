"use client";
import React, { useState } from "react";
import { Upload, FileText, ChevronLeft, Check, Lightbulb, Star, Trophy, Clipboard } from "lucide-react";
import type { ResumeData } from "./types";
import { clearStorage } from "@/lib/career-tools/storage";
import { STORAGE_KEY } from "./constants";
import type { FlowState } from "./constants";

interface EntryScreenProps {
  data: ResumeData;
  hasSavedDraft: boolean;
  setFlowState: (s: FlowState) => void;
  setData: React.Dispatch<React.SetStateAction<ResumeData>>;
  setHasSavedDraft: (v: boolean) => void;
  defaultResumeData: ResumeData;
}

export function EntryScreen({ data, hasSavedDraft, setFlowState, setData, setHasSavedDraft, defaultResumeData }: EntryScreenProps) {
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

interface UploadScreenProps {
  setFlowState: (s: FlowState) => void;
  handleFileImport: (file: File) => Promise<void>;
  handleTextImport: (text: string) => void;
}

export function UploadScreen({ setFlowState, handleFileImport, handleTextImport }: UploadScreenProps) {
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

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

        <button onClick={() => setPasteMode(true)} className="mt-4 text-sm text-zinc-400 hover:text-[#0d9488] flex items-center gap-1.5 mx-auto" data-testid="paste-option">
          <Clipboard className="w-4 h-4" /> Or paste your resume text
        </button>

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

interface ProcessingScreenProps {
  processingStep: number;
}

export function ProcessingScreen({ processingStep }: ProcessingScreenProps) {
  const TIPS = [
    { title: "Did you know?", text: "Resumes with quantified achievements get 40% more interviews." },
    { title: "ATS Tip", text: "Use standard section headings like \"Experience\" and \"Education\" for best results." },
    { title: "Pro Tip", text: "Keep your resume to 1-2 pages. Recruiters spend an average of 7 seconds scanning." },
    { title: "RealProfits Insight", text: "Our AI scoring engine checks 100+ data points across ATS, readability, and impact." },
    { title: "Career Growth", text: "Professionals who update their resume quarterly earn 15% more on average." },
    { title: "Stand Out", text: "Adding 5-8 relevant skills increases your match rate by 60% on job boards." },
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

        <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden mb-8">
          <div className="h-full bg-gradient-to-r from-[#0d9488] to-[#14b8c2] rounded-full transition-all duration-1000" style={{ width: "100%", animation: "pulse 2s ease-in-out infinite" }} />
        </div>

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

        <div className="flex justify-center gap-1.5 mt-4">
          {TIPS.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === processingStep % TIPS.length ? "bg-[#0d9488] w-4" : "bg-zinc-300"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface WelcomeScreenProps {
  data: ResumeData;
  setFlowState: (s: FlowState) => void;
}

export function WelcomeScreen({ data, setFlowState }: WelcomeScreenProps) {
  const firstName = data.personalDetails.fullName?.split(" ")[0] || "there";
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6" data-testid="import-welcome">
      <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-10 md:gap-16">
        <div className="flex-shrink-0 w-64 md:w-80">
          <svg viewBox="0 0 300 320" fill="none" className="w-full">
            <ellipse cx="150" cy="180" rx="130" ry="140" fill="#fef3c7" opacity="0.5" />
            <rect x="110" y="140" width="80" height="100" rx="12" fill="#0d9488" />
            <rect x="115" y="145" width="70" height="90" rx="10" fill="#14b8c2" />
            <circle cx="150" cy="110" r="36" fill="#fde68a" />
            <circle cx="150" cy="112" r="34" fill="#fef3c7" />
            <circle cx="138" cy="108" r="10" fill="none" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="162" cy="108" r="10" fill="none" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="148" y1="108" x2="152" y2="108" stroke="#1e293b" strokeWidth="2" />
            <path d="M140 120 Q150 130 160 120" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
            <path d="M116 100 Q115 75 140 72 Q155 70 170 75 Q188 82 185 100" fill="#1e293b" />
            <circle cx="205" cy="130" r="10" fill="#fef3c7" />
            <rect x="195" y="135" width="5" height="20" rx="2" fill="#fef3c7" transform="rotate(-15 197 145)" />
            <rect x="60" y="60" width="28" height="22" rx="3" fill="none" stroke="#f5c542" strokeWidth="2" />
            <path d="M64 66h20M64 72h14" stroke="#f5c542" strokeWidth="1.5" />
            <circle cx="230" cy="70" r="14" fill="none" stroke="#f5c542" strokeWidth="2" />
            <path d="M225 70l4 4 6-8" stroke="#f5c542" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M80 180l10-15 10 10 10-20" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
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

interface AnalysisScreenProps {
  data: ResumeData;
  setFlowState: (s: FlowState) => void;
}

export function AnalysisScreen({ data, setFlowState }: AnalysisScreenProps) {
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
            <circle cx="220" cy="155" r="18" fill="none" stroke="#1e293b" strokeWidth="3" />
            <line x1="233" y1="168" x2="248" y2="183" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
            <circle cx="220" cy="155" r="12" fill="#0d948820" />
            <rect x="50" y="90" width="50" height="65" rx="4" fill="white" stroke="#0d9488" strokeWidth="1.5" />
            <path d="M58 105h34M58 113h28M58 121h20M58 129h30" stroke="#d1d5db" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="flex-1 text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mb-2">You&apos;re off to a great start!</h1>
          <p className="text-lg text-zinc-500 mb-8">Here&apos;s what you got right and some areas we&apos;ll help you improve.</p>

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

"use client";
import React from "react";
import { Briefcase, Calendar, Plus, Wrench, ChevronLeft } from "lucide-react";
import { EXPERIENCE_LEVELS, INDUSTRIES } from "./constants";

interface OnboardingLevelProps {
  onboardLevel: string;
  setOnboardLevel: (v: string) => void;
  setFlowState: (s: string) => void;
}

const PLANT_ICONS = [
  <svg key="0" viewBox="0 0 40 40" fill="none" className="w-8 h-8"><path d="M20 35V22" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><path d="M20 28c-6-2-8-8-8-12 4 0 7 3 8 6" stroke="#1e293b" strokeWidth="1.8" fill="none"/></svg>,
  <svg key="1" viewBox="0 0 40 40" fill="none" className="w-8 h-8"><path d="M20 35V18" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><path d="M20 25c-7-2-9-9-9-14 5 0 8 4 9 7" stroke="#1e293b" strokeWidth="1.8" fill="none"/><path d="M20 20c5-3 6-8 6-12-4 0-6 3-6 6" stroke="#1e293b" strokeWidth="1.8" fill="none"/></svg>,
  <svg key="2" viewBox="0 0 40 40" fill="none" className="w-8 h-8"><path d="M20 35V14" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><path d="M20 24c-8-2-10-10-10-15 5 0 9 5 10 8" stroke="#1e293b" strokeWidth="1.8" fill="none"/><path d="M20 18c6-3 8-9 8-14-5 0-7 4-8 7" stroke="#1e293b" strokeWidth="1.8" fill="none"/><path d="M20 28c4-1 6-5 6-9-3 0-5 3-6 5" stroke="#1e293b" strokeWidth="1.8" fill="none"/></svg>,
  <svg key="3" viewBox="0 0 40 40" fill="none" className="w-8 h-8"><path d="M20 35V10" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><path d="M20 22c-9-2-11-10-11-16 6 0 10 5 11 9" stroke="#1e293b" strokeWidth="1.8" fill="none"/><path d="M20 16c7-3 9-10 9-15-5 0-8 5-9 8" stroke="#1e293b" strokeWidth="1.8" fill="none"/><path d="M20 27c5-1 7-6 7-10-4 0-6 3-7 6" stroke="#1e293b" strokeWidth="1.8" fill="none"/><path d="M20 30c-4-1-6-4-6-8 3 0 5 2 6 4" stroke="#1e293b" strokeWidth="1.8" fill="none"/></svg>,
];

export function OnboardingLevel({ onboardLevel, setOnboardLevel, setFlowState }: OnboardingLevelProps) {
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
            <button key={l.id} onClick={() => setOnboardLevel(l.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-full border-2 text-left transition-all hover:shadow-md ${onboardLevel === l.id ? "border-zinc-900 bg-zinc-50 shadow-sm" : "border-zinc-200 bg-white hover:border-zinc-400"}`} data-testid={`level-${l.id}`}>
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

interface OnboardingYearsProps {
  onboardYears: string;
  setOnboardYears: (v: string) => void;
  setFlowState: (s: string) => void;
}

const YEARS_OPTIONS = [
  { id: "less-1", label: "Less than 1 year", icon: <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7"><circle cx="20" cy="28" r="9" fill="none" stroke="#1e293b" strokeWidth="2"/><path d="M20 22V28L24 30" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/></svg> },
  { id: "1-3", label: "1 - 3 years", icon: <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7"><circle cx="20" cy="28" r="9" fill="none" stroke="#1e293b" strokeWidth="2"/><path d="M20 22V28L24 30" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="14" r="3" fill="#f5c542" opacity="0.6"/></svg> },
  { id: "3-5", label: "3 - 5 years", icon: <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7"><circle cx="20" cy="28" r="9" fill="none" stroke="#1e293b" strokeWidth="2"/><path d="M20 22V28L24 30" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="14" r="3" fill="#f5c542" opacity="0.6"/><circle cx="28" cy="14" r="3" fill="#0d9488" opacity="0.6"/></svg> },
  { id: "5-10", label: "5 - 10 years", icon: <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7"><circle cx="20" cy="28" r="9" fill="none" stroke="#1e293b" strokeWidth="2"/><path d="M20 22V28L24 30" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><circle cx="10" cy="14" r="3" fill="#f5c542" opacity="0.6"/><circle cx="20" cy="10" r="3" fill="#3b82f6" opacity="0.6"/><circle cx="30" cy="14" r="3" fill="#0d9488" opacity="0.6"/></svg> },
  { id: "10-plus", label: "10+ years", icon: <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7"><circle cx="20" cy="28" r="9" fill="#0d9488" opacity="0.12" stroke="#1e293b" strokeWidth="2"/><path d="M20 22V28L24 30" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/><path d="M14 8l6 6 6-6" stroke="#f5c542" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
];

export function OnboardingYears({ onboardYears, setOnboardYears, setFlowState }: OnboardingYearsProps) {
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

interface OnboardingIndustryProps {
  onboardIndustries: string[];
  setOnboardIndustries: React.Dispatch<React.SetStateAction<string[]>>;
  setFlowState: (s: string) => void;
}

export function OnboardingIndustry({ onboardIndustries, setOnboardIndustries, setFlowState }: OnboardingIndustryProps) {
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

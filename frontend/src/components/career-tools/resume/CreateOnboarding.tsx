"use client";
import React, { useState } from "react";
import { Briefcase, Sprout, Trees, ArrowRight, Settings, X, ChevronLeft } from "lucide-react";

const EXPERIENCE_LEVELS = [
  { id: "none", label: "No Experience", desc: "Less than 6 months", icon: Sprout },
  { id: "entry", label: "Entry-Level", desc: "6 months to 3 years", icon: Sprout },
  { id: "mid", label: "Mid-Level", desc: "3 to 10 years", icon: Trees },
  { id: "senior", label: "Senior-Level", desc: "10 or more years", icon: Trees },
];

const INDUSTRIES = [
  "Administration", "Construction", "Education", "Finance and Insurance",
  "Food and Hotel", "Healthcare", "Manufacturing", "Professional and Technical Services",
  "Retail", "Technology", "Transportation and Warehousing",
];

interface OnboardingProps {
  onComplete: (level: string, industries: string[]) => void;
}

export function CreateOnboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<"level" | "industry">("level");
  const [level, setLevel] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  const toggleIndustry = (ind: string) => {
    setSelectedIndustries(prev =>
      prev.includes(ind) ? prev.filter(x => x !== ind) : prev.length < 3 ? [...prev, ind] : prev
    );
  };

  if (step === "industry") {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4" data-testid="onboarding-industry">
        <div className="w-full max-w-xl text-center">
          <Settings className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">What industry are you<br />making this resume for?</h1>
          <p className="text-base text-zinc-500 mb-8">You can select up to 3 industries.</p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {INDUSTRIES.map(ind => (
              <button key={ind} onClick={() => toggleIndustry(ind)} className={`px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${selectedIndustries.includes(ind) ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-700 hover:border-zinc-400"}`} data-testid={`industry-${ind.replace(/\s+/g, "-").toLowerCase()}`}>
                {ind}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setStep("level")} className="h-12 px-6 rounded-full border-2 border-zinc-200 text-zinc-600 font-medium text-sm hover:bg-zinc-50 transition-colors flex items-center gap-2" data-testid="onboarding-back">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => onComplete(level, selectedIndustries)} disabled={selectedIndustries.length === 0} className="h-12 px-8 rounded-full bg-zinc-900 text-white font-medium text-sm hover:bg-zinc-800 disabled:opacity-40 transition-colors flex items-center gap-2" data-testid="onboarding-continue">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4" data-testid="onboarding-level">
      <div className="w-full max-w-lg text-center">
        <Briefcase className="w-10 h-10 text-amber-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">How much work experience<br />do you have?</h1>
        <p className="text-base text-zinc-500 mb-8">Select the one that best describes you.</p>
        <div className="space-y-3 max-w-sm mx-auto">
          {EXPERIENCE_LEVELS.map(l => {
            const Icon = l.icon;
            return (
              <button key={l.id} onClick={() => { setLevel(l.id); setStep("industry"); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all hover:shadow-md ${level === l.id ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-400"}`} data-testid={`level-${l.id}`}>
                <Icon className="w-6 h-6 text-zinc-400 flex-shrink-0" />
                <div>
                  <div className="text-base font-semibold text-zinc-900">{l.label}</div>
                  <div className="text-sm text-zinc-500">{l.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

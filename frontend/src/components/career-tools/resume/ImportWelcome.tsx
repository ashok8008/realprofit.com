"use client";
import React from "react";
import { CheckCircle2, Star, ArrowRight, Trophy, Lightbulb } from "lucide-react";
import type { ResumeData } from "@/lib/career-tools/pdf-export";
import type { SectionConfidence } from "@/lib/career-tools/resume/import/types";

interface WelcomeProps {
  data: ResumeData;
  onContinue: () => void;
}

export function ImportWelcome({ data, onContinue }: WelcomeProps) {
  const firstName = data.personalDetails.fullName?.split(" ")[0] || "there";
  const latestTitle = data.experience[0]?.title || "";
  const latestCompany = data.experience[0]?.company || "";
  const skillCount = data.skills.length;
  const expCount = data.experience.length;
  const certCount = data.certifications.length;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4" data-testid="import-welcome">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">👋</span>
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-4">
            Nice to meet you, {firstName}
          </h1>
        </div>

        <div className="text-left max-w-lg mx-auto space-y-4 text-lg text-zinc-700 leading-relaxed">
          {latestTitle && latestCompany && (
            <p>You are currently a <strong className="text-zinc-900">{latestTitle}</strong> at <strong className="text-zinc-900">{latestCompany}</strong>.</p>
          )}
          {expCount > 1 && (
            <p>With <strong className="text-zinc-900">{expCount} positions</strong> in your career history{skillCount > 0 ? <> and expertise in <strong className="text-zinc-900">{data.skills.slice(0, 3).join(", ")}</strong>{skillCount > 3 && ` and ${skillCount - 3} more skills`}</> : null}, you have a strong foundation.</p>
          )}
          {certCount > 0 && (
            <p>Your <strong className="text-zinc-900">{data.certifications.slice(0, 2).join(" and ")}</strong> certification{certCount > 1 ? "s" : ""} showcase{certCount === 1 ? "s" : ""} your commitment to professional development.</p>
          )}
          <p>We&apos;ll tailor your resume-building experience to highlight your strengths and ensure it aligns with what employers are looking for.</p>
        </div>

        <button onClick={onContinue} className="mt-10 bg-zinc-900 text-white hover:bg-zinc-800 rounded-full h-14 px-10 text-lg font-medium transition-colors inline-flex items-center gap-2" data-testid="welcome-continue-btn">
          Continue <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

interface AnalysisProps {
  data: ResumeData;
  confidences: SectionConfidence[];
  onContinue: () => void;
}

export function ImportAnalysis({ data, confidences, onContinue }: AnalysisProps) {
  const highCount = confidences.filter(c => c.level === "high").length;
  const hasContact = !!(data.personalDetails.email || data.personalDetails.phone);
  const hasExperience = data.experience.length > 0;
  const hasSummary = !!data.summary;
  const hasSkills = data.skills.length > 0;
  const hasEducation = data.education.length > 0;

  const gotRight: string[] = [];
  if (hasContact) gotRight.push("You listed multiple ways for employers to contact you.");
  if (hasExperience && hasSummary && hasSkills) gotRight.push("You included all the key sections employers look for.");
  if (hasExperience) gotRight.push(`${data.experience.length} work experience${data.experience.length > 1 ? "s" : ""} detected with descriptions.`);
  if (hasSkills) gotRight.push(`${data.skills.length} skills identified from your resume.`);
  if (gotRight.length === 0) gotRight.push("We found the basic structure of your resume.");

  const improvements: string[] = [];
  if (!hasSummary) improvements.push("AI-generate a professional summary to catch recruiters' attention.");
  else improvements.push("AI-enhance your summary to align with best practices.");
  if (hasExperience) improvements.push("Revise your experience section using AI writing help.");
  improvements.push("We'll suggest section titles that match the ones employers scan for.");
  if (!hasSkills) improvements.push("Add skills to help ATS systems match you with roles.");

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4" data-testid="import-analysis">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-2">You&apos;re off to a great start!</h1>
          <p className="text-lg text-zinc-500">Here&apos;s what you got right and some areas we&apos;ll help you improve.</p>
        </div>

        {/* What you got right */}
        <div className="bg-zinc-50 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-zinc-400" />
            <h3 className="text-lg font-bold text-zinc-900">You got it right</h3>
          </div>
          <div className="space-y-3">
            {gotRight.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-base text-zinc-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How we'll improve */}
        <div className="bg-zinc-50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-5 h-5 text-zinc-400" />
            <h3 className="text-lg font-bold text-zinc-900">How we&apos;ll help you improve</h3>
          </div>
          <div className="space-y-3">
            {improvements.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <Star className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-base text-zinc-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button onClick={onContinue} className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full h-14 px-10 text-lg font-medium transition-colors inline-flex items-center gap-2" data-testid="analysis-continue-btn">
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

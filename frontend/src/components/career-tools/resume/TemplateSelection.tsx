"use client";
import React from "react";
import { Check, User, Sparkles, Lightbulb, Download, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveToStorage } from "@/lib/career-tools/storage";
import { TEMPLATES, SAMPLE_DATA } from "./constants";
import type { ResumeData } from "./types";
import { TemplateRenderer } from "./TemplateRenderer";
import type { WizardStep } from "./constants";

interface TemplateSelectionProps {
  template: string;
  setTemplate: (t: string) => void;
  data: ResumeData;
  onboardLevel: string;
  onboardYears: string;
  onboardIndustries: string[];
  setFlowState: (s: string) => void;
  setWizardStep: (s: WizardStep) => void;
}

const TEMPLATE_DETAILS: Record<string, { tags: string[]; features: string[]; popularity: string; colors: string[] }> = {
  clean: { tags: ["Recommended", "Classic"], features: ["ATS-optimized", "1-column layout", "Editable sample content", "Download as PDF"], popularity: "2.1K+ people picked this template", colors: ["#ffffff", "#1e293b", "#64748b", "#3b82f6", "#0ea5e9", "#0d9488", "#16a34a", "#f5c542", "#ef4444"] },
  professional: { tags: ["Popular", "Traditional"], features: ["ATS-optimized", "Professional format", "Clean typography", "Download as PDF"], popularity: "1.8K+ people picked this template", colors: ["#ffffff", "#1e293b", "#374151", "#1d4ed8", "#0d9488", "#b45309", "#7c3aed", "#dc2626", "#059669"] },
  minimal: { tags: ["Trending", "Simple"], features: ["ATS-optimized", "Maximum whitespace", "Modern feel", "Download as PDF"], popularity: "1.5K+ people picked this template", colors: ["#ffffff", "#0f172a", "#475569", "#2563eb", "#0891b2", "#65a30d", "#9333ea", "#e11d48", "#ca8a04"] },
  executive: { tags: ["Premium", "Bold"], features: ["ATS-optimized", "Bold header section", "Executive presence", "Download as PDF"], popularity: "980+ people picked this template", colors: ["#ffffff", "#0f172a", "#334155", "#1e40af", "#0d9488", "#b91c1c", "#7e22ce", "#c2410c", "#15803d"] },
  modern: { tags: ["Premium", "Modern"], features: ["ATS-optimized", "Two-column layout", "Color accents", "Download as PDF"], popularity: "1.2K+ people picked this template", colors: ["#ffffff", "#1e293b", "#6b7280", "#2563eb", "#0ea5e9", "#059669", "#d97706", "#dc2626", "#8b5cf6"] },
};

export function TemplateSelection({ template, setTemplate, data, onboardLevel, onboardYears, onboardIndustries, setFlowState, setWizardStep }: TemplateSelectionProps) {
  const { toast } = useToast();
  const [templateColor, setTemplateColor] = React.useState("#ffffff");

  const sel = TEMPLATES.find(t => t.id === template) || TEMPLATES[0];
  const details = TEMPLATE_DETAILS[template] || TEMPLATE_DETAILS.clean;

  const hasData = data.personalDetails.fullName || data.experience.length > 0 || data.summary;
  const previewData: ResumeData = hasData ? data : SAMPLE_DATA;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6" data-testid="template-selection">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8">
        <div className="flex gap-4 flex-1">
          <div className="hidden md:flex flex-col gap-2 flex-shrink-0 w-20">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setTemplate(t.id)} className={`w-20 aspect-[1/1.414] rounded-lg border-2 overflow-hidden transition-all ${template === t.id ? "border-[#3b82f6] shadow-md ring-2 ring-blue-200" : "border-zinc-200 bg-white hover:border-zinc-400"}`} data-testid={`template-thumb-${t.id}`}>
                <div className="w-full h-full overflow-hidden">
                  <TemplateRenderer data={previewData} templateId={t.id} scale="thumb" />
                </div>
              </button>
            ))}
          </div>
          <div className="flex-1 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden">
            <div className="max-h-[70vh] overflow-y-auto">
              <TemplateRenderer data={previewData} templateId={template} scale="full" />
            </div>
          </div>
        </div>

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

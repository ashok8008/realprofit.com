import { User, Briefcase, GraduationCap, Wrench, FileText, Award, Download } from "lucide-react";
import type { ResumeData } from "./types";

export const STORAGE_KEY = "resume_builder";

export const defaultResumeData: ResumeData = {
  personalDetails: { fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "" },
  summary: "", experience: [], education: [], skills: [], certifications: [],
};

export const TEMPLATES = [
  { id: "clean", name: "Clean", desc: "Simple, ATS-friendly", premium: false },
  { id: "professional", name: "Professional", desc: "Traditional business", premium: false },
  { id: "minimal", name: "Minimal", desc: "Maximum whitespace", premium: false },
  { id: "executive", name: "Executive", desc: "Bold header", premium: true },
  { id: "modern", name: "Modern", desc: "Two-column", premium: true },
];

export const WIZARD_STEPS = [
  { key: "header", label: "Header", icon: User },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Wrench },
  { key: "summary", label: "Summary", icon: FileText },
  { key: "additional", label: "Additional Details", icon: Award },
  { key: "finalize", label: "Finalize", icon: Download },
] as const;

export type WizardStep = typeof WIZARD_STEPS[number]["key"];
export type FlowState = "entry" | "upload" | "processing" | "welcome" | "analysis" | "onboarding-level" | "onboarding-years" | "onboarding-industry" | "templates" | "wizard" | "tips" | "ats-check";

export const EXPERIENCE_LEVELS = [
  { id: "none", label: "No Experience", desc: "Less than 6 months" },
  { id: "entry", label: "Entry-Level", desc: "6 months to 3 years" },
  { id: "mid", label: "Mid-Level", desc: "3 to 10 years" },
  { id: "senior", label: "Senior-Level", desc: "10 or more years" },
];

export const INDUSTRIES = [
  "Administration", "Construction", "Education", "Finance & Insurance",
  "Food & Hotel", "Healthcare", "Manufacturing", "Professional Services",
  "Retail", "Technology", "Transportation",
];

export const inputClass = "h-12 px-4 text-sm bg-white border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
export const labelClass = "text-sm font-medium text-zinc-800 mb-1.5 block";

export const SAMPLE_DATA: ResumeData = {
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

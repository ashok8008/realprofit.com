import type { ResumeData } from "@/lib/career-tools/pdf-export";

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface AiSuggestion {
  id: string;
  original: string;
  improved: string;
  suggestions?: string[];
}

export type { ResumeData };

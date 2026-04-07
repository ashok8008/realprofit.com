// Resume import types

import type { ResumeData } from "@/lib/career-tools/pdf-export";

export type ConfidenceLevel = "high" | "medium" | "needs-review";

export interface SectionConfidence {
  section: string;
  level: ConfidenceLevel;
  reason: string;
}

export interface ParsedResume {
  data: ResumeData;
  confidences: SectionConfidence[];
  rawText: string;
  source: "docx" | "pdf" | "text";
}

export interface ParsedSection {
  heading: string;
  content: string;
  startIndex: number;
}

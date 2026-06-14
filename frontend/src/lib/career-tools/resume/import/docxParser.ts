// DOCX parser — highest quality import source
// Uses mammoth to extract clean text from .docx files, then routes through
// Gemini AI parser (fallback: regex parser).

import mammoth from "mammoth";
import type { ParsedResume } from "./types";
import { detectSections } from "./sectionDetector";
import { mapSectionsToResumeData } from "./fieldMapper";
import { calculateConfidences } from "./confidence";
import { aiParseResume } from "./aiParseResume";

export async function parseDocx(file: File): Promise<ParsedResume> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const rawText = result.value;

  try {
    const data = await aiParseResume(rawText);
    const confidences = calculateConfidences(data, "docx");
    return { data, confidences, rawText, source: "docx" };
  } catch (err) {
    console.warn("[docxParser] Gemini failed, using regex fallback:", err);
    const sections = detectSections(rawText);
    const data = mapSectionsToResumeData(sections, rawText);
    const confidences = calculateConfidences(data, "docx");
    return { data, confidences, rawText, source: "docx" };
  }
}

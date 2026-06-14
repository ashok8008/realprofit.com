// Text parser — for pasted resume text. Tries Gemini AI parser first; falls
// back to the regex parser if Gemini fails.

import type { ParsedResume } from "./types";
import { detectSections } from "./sectionDetector";
import { mapSectionsToResumeData } from "./fieldMapper";
import { calculateConfidences } from "./confidence";
import { aiParseResume } from "./aiParseResume";

export async function parseText(rawText: string): Promise<ParsedResume> {
  try {
    const data = await aiParseResume(rawText);
    const confidences = calculateConfidences(data, "text");
    return { data, confidences, rawText, source: "text" };
  } catch (err) {
    console.warn("[textParser] Gemini failed, using regex fallback:", err);
    const sections = detectSections(rawText);
    const data = mapSectionsToResumeData(sections, rawText);
    const confidences = calculateConfidences(data, "text");
    return { data, confidences, rawText, source: "text" };
  }
}

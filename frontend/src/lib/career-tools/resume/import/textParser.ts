// Text parser — for pasted resume text

import type { ParsedResume } from "./types";
import { detectSections } from "./sectionDetector";
import { mapSectionsToResumeData } from "./fieldMapper";
import { calculateConfidences } from "./confidence";

export function parseText(rawText: string): ParsedResume {
  const sections = detectSections(rawText);
  const data = mapSectionsToResumeData(sections, rawText);
  const confidences = calculateConfidences(data, "text");

  return { data, confidences, rawText, source: "text" };
}

// PDF parser — lower confidence than DOCX, best-effort extraction
// Uses pdfjs-dist to extract text from PDF files, then routes through
// Gemini AI parser (fallback: regex parser).

import type { ParsedResume } from "./types";
import { detectSections } from "./sectionDetector";
import { mapSectionsToResumeData } from "./fieldMapper";
import { calculateConfidences } from "./confidence";
import { aiParseResume } from "./aiParseResume";

export async function parsePdf(file: File): Promise<ParsedResume> {
  // Dynamic import to avoid SSR issues
  const pdfjsLib = await import("pdfjs-dist");

  // Worker is self-hosted in /public/pdfjs/ (copied from node_modules by prebuild script).
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  const textParts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    textParts.push(pageText);
  }

  const rawText = textParts.join("\n\n");

  try {
    const data = await aiParseResume(rawText);
    const confidences = calculateConfidences(data, "pdf");
    return { data, confidences, rawText, source: "pdf" };
  } catch (err) {
    console.warn("[pdfParser] Gemini failed, using regex fallback:", err);
    const sections = detectSections(rawText);
    const data = mapSectionsToResumeData(sections, rawText);
    const confidences = calculateConfidences(data, "pdf");
    return { data, confidences, rawText, source: "pdf" };
  }
}

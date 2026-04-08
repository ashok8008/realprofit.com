// Section detector — identifies resume sections from raw text using heading patterns

import type { ParsedSection } from "./types";

const SECTION_PATTERNS: { key: string; patterns: RegExp[] }[] = [
  {
    key: "summary",
    patterns: [
      /^(professional\s+)?summary$/i,
      /^summary\s+of\s+experience$/i,
      /^(career\s+)?(objective|profile)$/i,
      /^about(\s+me)?$/i,
      /^executive\s+summary$/i,
      /^personal\s+statement$/i,
      /^overview$/i,
    ],
  },
  {
    key: "experience",
    patterns: [
      /^(work\s+|professional\s+)?experience$/i,
      /^employment(\s+history)?$/i,
      /^work\s+history$/i,
      /^career\s+history$/i,
      /^relevant\s+experience$/i,
      /^professional\s+background$/i,
      /^professional\s+experience$/i,
    ],
  },
  {
    key: "education",
    patterns: [
      /^education(al\s+background)?$/i,
      /^academic(\s+background)?$/i,
      /^academic\s+details$/i,
      /^qualifications$/i,
      /^degrees?$/i,
    ],
  },
  {
    key: "skills",
    patterns: [
      /^(technical\s+|core\s+|key\s+)?skills$/i,
      /^(core\s+)?competenc(ies|e)$/i,
      /^areas?\s+of\s+expertise$/i,
      /^technical\s+proficienc(ies|y)$/i,
      /^tools?\s*(&|and)\s*technolog(ies|y)$/i,
    ],
  },
  {
    key: "certifications",
    patterns: [
      /^certifications?$/i,
      /^certifications?\s+achieved$/i,
      /^licens(es|ure)$/i,
      /^certifications?\s*(&|and)\s*licens(es|ure)$/i,
      /^professional\s+certifications?$/i,
    ],
  },
  {
    key: "projects",
    patterns: [
      /^(key\s+|personal\s+|notable\s+)?projects?$/i,
    ],
  },
  {
    key: "awards",
    patterns: [
      /^awards?(\s*(&|and)\s*honors?)?$/i,
      /^honors?\s*(&|and)\s*awards?$/i,
      /^achievements?$/i,
    ],
  },
  {
    key: "languages",
    patterns: [/^languages?$/i],
  },
  {
    key: "volunteer",
    patterns: [
      /^volunteer(ing)?(\s+experience)?$/i,
      /^community\s+(service|involvement)$/i,
    ],
  },
  {
    key: "interests",
    patterns: [/^interests?$/i, /^hobbies?(\s*(&|and)\s*interests?)?$/i],
  },
  {
    key: "references",
    patterns: [/^references?$/i],
  },
];

/**
 * Detect if a line is a section heading.
 * Headings are typically: short, ALL CAPS or Title Case, no trailing punctuation,
 * not starting with bullet, and matching known patterns.
 */
function isLikelyHeading(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.length > 60) return false;
  if (/^[•\-*\d]/.test(trimmed)) return false; // bullets / numbered lists
  if (trimmed.endsWith(",")) return false;

  // Strip trailing colon for matching
  const withoutColon = trimmed.replace(/:$/, "").trim();

  // ALL CAPS check (min 3 chars)
  if (trimmed.length >= 3 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) return true;

  // Known heading pattern match
  const cleaned = withoutColon.replace(/[:\-—|]/g, "").trim();
  for (const group of SECTION_PATTERNS) {
    for (const p of group.patterns) {
      if (p.test(cleaned)) return true;
    }
  }

  return false;
}

function classifyHeading(heading: string): string {
  const cleaned = heading.replace(/[:\-—|]/g, "").trim();
  for (const group of SECTION_PATTERNS) {
    for (const p of group.patterns) {
      if (p.test(cleaned)) return group.key;
    }
  }
  return "unknown";
}

/**
 * Splits raw text into detected sections.
 */
export function detectSections(text: string): ParsedSection[] {
  const lines = text.split("\n");
  const sections: ParsedSection[] = [];
  let currentHeading = "";
  let currentContent: string[] = [];
  let currentStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (isLikelyHeading(line) && classifyHeading(line) !== "unknown") {
      // Save previous section
      if (currentContent.length > 0 || currentHeading) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join("\n").trim(),
          startIndex: currentStart,
        });
      }
      currentHeading = line;
      currentContent = [];
      currentStart = i;
    } else {
      currentContent.push(lines[i]);
    }
  }

  // Push last section
  if (currentContent.length > 0 || currentHeading) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join("\n").trim(),
      startIndex: currentStart,
    });
  }

  return sections;
}

export function classifySectionHeading(heading: string): string {
  return classifyHeading(heading);
}

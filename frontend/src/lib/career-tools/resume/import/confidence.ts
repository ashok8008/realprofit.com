// Confidence scoring — deterministic per-section confidence assessment

import type { ResumeData } from "@/lib/career-tools/pdf-export";
import type { SectionConfidence, ConfidenceLevel } from "./types";

function level(score: number): ConfidenceLevel {
  if (score >= 3) return "high";
  if (score >= 2) return "medium";
  return "needs-review";
}

function assessPersonalInfo(p: ResumeData["personalDetails"]): SectionConfidence {
  let score = 0;
  const reasons: string[] = [];

  if (p.fullName.trim().split(/\s+/).length >= 2) { score += 1; reasons.push("Name detected"); }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) { score += 1; reasons.push("Email found"); }
  if (p.phone.trim().length >= 7) { score += 1; reasons.push("Phone found"); }
  if (p.location.trim()) { score += 0.5; }
  if (p.linkedin) { score += 0.5; }

  const lev = level(score);
  const reason = lev === "high"
    ? "Name, email, and phone clearly detected"
    : lev === "medium"
      ? `Partial info found (${reasons.join(", ")})`
      : "Could not reliably extract contact details";

  return { section: "Personal Info", level: lev, reason };
}

function assessSummary(summary: string, source: "docx" | "pdf" | "text"): SectionConfidence {
  if (!summary.trim()) {
    return { section: "Summary", level: "needs-review", reason: "No summary detected — consider adding one" };
  }
  const wordCount = summary.trim().split(/\s+/).length;
  if (wordCount >= 20 && wordCount <= 150) {
    return { section: "Summary", level: "high", reason: "Summary detected with reasonable length" };
  }
  if (wordCount > 5) {
    return { section: "Summary", level: "medium", reason: wordCount < 20 ? "Summary seems short" : "Summary may be too long" };
  }
  return { section: "Summary", level: "needs-review", reason: "Extracted text may not be a summary" };
}

function assessExperience(exp: ResumeData["experience"]): SectionConfidence {
  if (exp.length === 0) {
    return { section: "Experience", level: "needs-review", reason: "No experience entries detected" };
  }

  let goodEntries = 0;
  for (const e of exp) {
    let entryScore = 0;
    if (e.title.trim()) entryScore++;
    if (e.company.trim()) entryScore++;
    if (e.startDate.trim()) entryScore++;
    if (e.description.trim().length > 20) entryScore++;
    if (entryScore >= 3) goodEntries++;
  }

  const ratio = goodEntries / exp.length;
  if (ratio >= 0.8) {
    return { section: "Experience", level: "high", reason: `${exp.length} entries parsed with titles, companies, and dates` };
  }
  if (ratio >= 0.4) {
    return { section: "Experience", level: "medium", reason: `${exp.length} entries found but some fields are incomplete` };
  }
  return { section: "Experience", level: "needs-review", reason: "Experience structure unclear — please verify entries" };
}

function assessEducation(edu: ResumeData["education"]): SectionConfidence {
  if (edu.length === 0) {
    return { section: "Education", level: "needs-review", reason: "No education entries detected" };
  }

  const hasGoodEntry = edu.some(e => e.degree.trim() && e.school.trim());
  if (hasGoodEntry) {
    return { section: "Education", level: "high", reason: `${edu.length} education entries with degree and school` };
  }
  return { section: "Education", level: "medium", reason: "Education found but details may be incomplete" };
}

function assessSkills(skills: string[]): SectionConfidence {
  if (skills.length === 0) {
    return { section: "Skills", level: "needs-review", reason: "No skills detected" };
  }
  if (skills.length >= 5) {
    return { section: "Skills", level: "high", reason: `${skills.length} skills clearly identified` };
  }
  if (skills.length >= 2) {
    return { section: "Skills", level: "medium", reason: `Only ${skills.length} skills found — consider adding more` };
  }
  return { section: "Skills", level: "needs-review", reason: "Very few skills extracted — may need manual entry" };
}

function assessCertifications(certs: string[]): SectionConfidence {
  if (certs.length === 0) {
    return { section: "Extras", level: "needs-review", reason: "No certifications or extras detected" };
  }
  if (certs.length >= 2) {
    return { section: "Extras", level: "high", reason: `${certs.length} items found in certifications/extras` };
  }
  return { section: "Extras", level: "medium", reason: "Some extras found but may need review" };
}

export function calculateConfidences(
  data: ResumeData,
  source: "docx" | "pdf" | "text"
): SectionConfidence[] {
  return [
    assessPersonalInfo(data.personalDetails),
    assessSummary(data.summary, source),
    assessExperience(data.experience),
    assessEducation(data.education),
    assessSkills(data.skills),
    assessCertifications(data.certifications),
  ];
}

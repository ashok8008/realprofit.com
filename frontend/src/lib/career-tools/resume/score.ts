// Upgraded Resume Score Engine — 7 categories, 100 points total
// Deterministic, explainable, and actionable

import type { ResumeData } from "@/lib/career-tools/pdf-export";

export interface ScoreSuggestion {
  message: string;
  fix?: string;
  points: number;
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  fixAction?: { type: string; tab?: string; field?: string };
}

export interface CategoryScore {
  score: number;
  max: number;
}

export interface ResumeScoreResult {
  total: number;
  label: string;
  color: string;
  breakdown: {
    completeness: CategoryScore;
    presence: CategoryScore;
    experience: CategoryScore;
    impact: CategoryScore;
    skills: CategoryScore;
    structure: CategoryScore;
    ats: CategoryScore;
  };
  suggestions: ScoreSuggestion[];
}

const ACTION_VERBS = new Set([
  "achieved", "accelerated", "accomplished", "administered", "advanced", "analyzed",
  "built", "championed", "coached", "collaborated", "completed", "consolidated",
  "coordinated", "created", "decreased", "delivered", "designed", "developed",
  "directed", "drove", "earned", "eliminated", "enabled", "engineered",
  "established", "exceeded", "executed", "expanded", "facilitated", "founded",
  "generated", "grew", "headed", "identified", "implemented", "improved",
  "increased", "influenced", "initiated", "innovated", "integrated", "introduced",
  "launched", "led", "leveraged", "managed", "maximized", "mentored",
  "modernized", "negotiated", "optimized", "orchestrated", "organized", "oversaw",
  "partnered", "pioneered", "planned", "produced", "promoted", "propelled",
  "reduced", "reengineered", "reformed", "resolved", "restructured", "revamped",
  "scaled", "secured", "simplified", "spearheaded", "streamlined", "strengthened",
  "supervised", "surpassed", "transformed", "unified", "upgraded",
]);

function hasMetric(text: string): boolean {
  return /\d+\s*%|\$\s*\d|#?\d+\s*(users?|clients?|projects?|people|team|members?|accounts?)/i.test(text);
}

function startsWithActionVerb(line: string): boolean {
  const first = line.replace(/^[•\-*]\s*/, "").trim().split(/\s/)[0]?.toLowerCase() || "";
  return ACTION_VERBS.has(first);
}

function getBulletLines(exp: ResumeData["experience"]): string[] {
  const lines: string[] = [];
  for (const e of exp) {
    if (!e.description) continue;
    for (const line of e.description.split("\n")) {
      const t = line.trim();
      if (t.length > 5) lines.push(t);
    }
  }
  return lines;
}

// ═══════════════════════════════════════════════════════════
// 1. COMPLETENESS (20 points)
// ═══════════════════════════════════════════════════════════
function scoreCompleteness(data: ResumeData, suggestions: ScoreSuggestion[]): CategoryScore {
  let score = 0;
  const p = data.personalDetails;

  if (p.fullName.trim()) { score += 3; } else {
    suggestions.push({ message: "Add your full name", fix: "A complete name is the first thing recruiters see", points: 3, severity: "critical", category: "completeness", fixAction: { type: "focus", tab: "personal", field: "fullName" } });
  }
  if (p.email.trim()) { score += 3; } else {
    suggestions.push({ message: "Add your email address", fix: "Required for recruiters to contact you", points: 3, severity: "critical", category: "completeness", fixAction: { type: "focus", tab: "personal", field: "email" } });
  }
  if (p.phone.trim()) { score += 2; } else {
    suggestions.push({ message: "Add your phone number", fix: "Many recruiters prefer calling over emailing", points: 2, severity: "high", category: "completeness", fixAction: { type: "focus", tab: "personal", field: "phone" } });
  }
  if (p.location.trim()) { score += 2; } else {
    suggestions.push({ message: "Add your location", fix: "City, State helps with location-based job matching", points: 2, severity: "medium", category: "completeness", fixAction: { type: "focus", tab: "personal", field: "location" } });
  }
  if (data.summary.trim().length > 50) { score += 4; } else if (data.summary.trim().length > 0) {
    score += 2;
    suggestions.push({ message: "Expand your summary (currently too short)", fix: "Aim for 50-100 words covering experience, skills, and value", points: 2, severity: "high", category: "completeness", fixAction: { type: "focus", tab: "personal", field: "summary" } });
  } else {
    suggestions.push({ message: "Add a professional summary", fix: "A strong summary increases callback rates by ~30%", points: 4, severity: "critical", category: "completeness", fixAction: { type: "focus", tab: "personal", field: "summary" } });
  }
  if (data.experience.length >= 1) { score += 3; } else {
    suggestions.push({ message: "Add at least one work experience", fix: "Experience is the #1 section recruiters look for", points: 3, severity: "critical", category: "completeness", fixAction: { type: "focus", tab: "experience" } });
  }
  if (data.education.length >= 1) { score += 1; } else {
    suggestions.push({ message: "Add education background", fix: "Even a simple degree entry helps ATS matching", points: 1, severity: "medium", category: "completeness", fixAction: { type: "focus", tab: "education" } });
  }
  if (data.skills.length >= 3) { score += 2; } else {
    suggestions.push({ message: `Add ${3 - data.skills.length} more skills (currently ${data.skills.length})`, fix: "Skills are critical for ATS keyword matching", points: 2, severity: "high", category: "completeness", fixAction: { type: "focus", tab: "skills" } });
  }

  return { score: Math.min(score, 20), max: 20 };
}

// ═══════════════════════════════════════════════════════════
// 2. CONTACT & PROFESSIONAL PRESENCE (10 points)
// ═══════════════════════════════════════════════════════════
function scorePresence(data: ResumeData, suggestions: ScoreSuggestion[]): CategoryScore {
  let score = 0;
  const p = data.personalDetails;

  if (p.linkedin) { score += 3; } else {
    suggestions.push({ message: "Add your LinkedIn URL", fix: "87% of recruiters use LinkedIn — make it easy for them", points: 3, severity: "high", category: "presence", fixAction: { type: "focus", tab: "personal", field: "linkedin" } });
  }
  if (p.portfolio) { score += 2; } else {
    suggestions.push({ message: "Add a portfolio or GitHub link", fix: "Shows proof of work beyond your resume", points: 2, severity: "low", category: "presence" });
  }
  if (p.email && /^[a-z0-9]/.test(p.email.toLowerCase()) && !/(hotmail|yahoo|aol)/i.test(p.email)) {
    score += 2;
  } else if (p.email) {
    score += 1;
    suggestions.push({ message: "Use a professional email address", fix: "firstname.lastname@gmail.com looks more professional than fun nicknames", points: 1, severity: "low", category: "presence" });
  }
  // Contact info not broken check
  if (p.fullName && p.email && (p.phone || p.linkedin)) { score += 3; } else {
    score += 1;
  }

  return { score: Math.min(score, 10), max: 10 };
}

// ═══════════════════════════════════════════════════════════
// 3. EXPERIENCE QUALITY (20 points)
// ═══════════════════════════════════════════════════════════
function scoreExperience(data: ResumeData, suggestions: ScoreSuggestion[]): CategoryScore {
  if (data.experience.length === 0) return { score: 0, max: 20 };

  let totalPoints = 0;
  const maxPerEntry = 6;
  let weakEntries = 0;

  for (const exp of data.experience) {
    let entryPts = 0;
    if (exp.title.trim()) entryPts += 1;
    if (exp.company.trim()) entryPts += 1;
    if (exp.startDate.trim()) entryPts += 1;

    const bullets = exp.description.split("\n").filter(l => l.trim().length > 5);
    if (bullets.length >= 2) entryPts += 2;
    else if (bullets.length >= 1) entryPts += 1;

    const descLen = exp.description.trim().length;
    if (descLen >= 50 && descLen <= 800) entryPts += 1;

    totalPoints += entryPts;
    if (entryPts < 3) weakEntries++;
  }

  const maxPossible = data.experience.length * maxPerEntry;
  const score = Math.min(20, Math.round((totalPoints / Math.max(maxPossible, 1)) * 20));

  if (weakEntries > 0) {
    suggestions.push({ message: `${weakEntries} experience ${weakEntries === 1 ? "entry is" : "entries are"} incomplete`, fix: "Add company name, dates, and at least 2 bullet points for each role", points: Math.min(weakEntries * 3, 8), severity: "high", category: "experience", fixAction: { type: "focus", tab: "experience" } });
  }

  // Check for missing company or dates
  for (const exp of data.experience) {
    if (!exp.company.trim() || !exp.startDate.trim()) {
      suggestions.push({ message: `"${exp.title || "Untitled role"}" is missing company or dates`, fix: "Both company and date range are expected by ATS systems", points: 2, severity: "high", category: "experience", fixAction: { type: "focus", tab: "experience" } });
      break; // Only show once
    }
  }

  return { score, max: 20 };
}

// ═══════════════════════════════════════════════════════════
// 4. IMPACT & METRICS (20 points)
// ═══════════════════════════════════════════════════════════
function scoreImpact(data: ResumeData, suggestions: ScoreSuggestion[]): CategoryScore {
  const bullets = getBulletLines(data.experience);
  if (bullets.length === 0) return { score: 0, max: 20 };

  let metricCount = 0;
  let actionResultCount = 0;
  let weakBulletCount = 0;
  let noActionVerbCount = 0;

  for (const b of bullets) {
    if (hasMetric(b)) metricCount++;
    if (startsWithActionVerb(b) && (hasMetric(b) || b.length > 60)) actionResultCount++;
    if (b.length < 30) weakBulletCount++;
    if (b.length > 220) weakBulletCount++;
    if (!startsWithActionVerb(b) && b.length > 10) noActionVerbCount++;
  }

  let score = 0;
  score += Math.min(8, metricCount * 2); // Up to 8 pts for metrics
  score += Math.min(6, actionResultCount * 2); // Up to 6 pts for action+result
  score += metricCount > 0 ? 4 : 0; // Evidence of measurable impact
  score += metricCount >= 3 ? 2 : 0; // Multiple metrics = bonus

  if (metricCount === 0) {
    suggestions.push({ message: "Add measurable results to your experience", fix: "Numbers sell: \"Increased sales by 25%\", \"Managed team of 8\", \"Reduced costs by $10K\"", points: 8, severity: "critical", category: "impact", fixAction: { type: "smart-improve" } });
  } else if (metricCount < 3) {
    suggestions.push({ message: `Only ${metricCount} bullet${metricCount === 1 ? "" : "s"} with metrics — aim for 3+`, fix: "Quantify more achievements with %, $, or counts", points: 4, severity: "high", category: "impact" });
  }

  if (noActionVerbCount > bullets.length / 2) {
    suggestions.push({ message: "Many bullets don't start with action verbs", fix: "Start with: Led, Built, Increased, Delivered, Reduced, Managed...", points: 3, severity: "high", category: "impact", fixAction: { type: "smart-improve" } });
  }

  if (weakBulletCount > 0) {
    if (bullets.some(b => b.length < 30)) {
      suggestions.push({ message: "Some bullets are too short (<30 chars)", fix: "Expand with context, action, and result", points: 2, severity: "medium", category: "impact" });
    }
    if (bullets.some(b => b.length > 220)) {
      suggestions.push({ message: "Some bullets are too long (>220 chars)", fix: "Break into focused, scannable points", points: 1, severity: "low", category: "impact" });
    }
  }

  return { score: Math.min(score, 20), max: 20 };
}

// ═══════════════════════════════════════════════════════════
// 5. SKILLS & RELEVANCE (10 points)
// ═══════════════════════════════════════════════════════════
function scoreSkills(data: ResumeData, suggestions: ScoreSuggestion[]): CategoryScore {
  let score = 0;
  const count = data.skills.length;

  if (count >= 6) { score += 5; }
  else if (count >= 3) { score += 3; suggestions.push({ message: `Add ${6 - count} more skills for stronger ATS matching`, fix: "Include both technical and soft skills relevant to your target role", points: 2, severity: "medium", category: "skills", fixAction: { type: "focus", tab: "skills" } }); }
  else {
    suggestions.push({ message: `Only ${count} skill${count === 1 ? "" : "s"} listed — add at least 6`, fix: "Skills section is heavily scanned by ATS systems", points: 5, severity: "high", category: "skills", fixAction: { type: "focus", tab: "skills" } });
  }

  // Check for generic-only skills
  const genericOnly = ["communication", "teamwork", "leadership", "problem solving", "time management"];
  const allGeneric = data.skills.length > 0 && data.skills.every(s => genericOnly.some(g => s.toLowerCase().includes(g)));
  if (allGeneric && data.skills.length > 0) {
    score += 1;
    suggestions.push({ message: "Add specific technical or domain skills", fix: "Generic skills alone won't pass ATS filters — add tools, technologies, methodologies", points: 3, severity: "medium", category: "skills" });
  } else if (count > 0) {
    score += 3;
  }

  // Mix check
  if (count >= 3) score += 2;

  return { score: Math.min(score, 10), max: 10 };
}

// ═══════════════════════════════════════════════════════════
// 6. STRUCTURE & READABILITY (10 points)
// ═══════════════════════════════════════════════════════════
function scoreStructure(data: ResumeData, suggestions: ScoreSuggestion[]): CategoryScore {
  let score = 0;

  // Summary conciseness
  const summaryLen = data.summary.trim().length;
  if (summaryLen > 0 && summaryLen <= 300) { score += 2; }
  else if (summaryLen > 300) {
    score += 1;
    suggestions.push({ message: "Summary is too long — keep under 300 characters", fix: "Recruiters spend 6 seconds scanning. Be concise.", points: 1, severity: "low", category: "structure" });
  }

  // Bullet count
  const bulletCount = getBulletLines(data.experience).length;
  if (bulletCount >= 3 && bulletCount <= 25) { score += 3; }
  else if (bulletCount > 0) {
    score += 1;
    suggestions.push({ message: bulletCount < 3 ? "Add more bullet points to experience" : "Too many bullet points — focus on top achievements", fix: "Aim for 3-5 bullets per role", points: 2, severity: "medium", category: "structure" });
  }

  // No giant text walls
  const hasWall = data.experience.some(e => {
    const lines = e.description.split("\n").filter(l => l.trim());
    return lines.some(l => l.trim().length > 300) || (lines.length === 1 && e.description.length > 200);
  });
  if (!hasWall) { score += 2; } else {
    suggestions.push({ message: "Break large text blocks into bullet points", fix: "Use bullet points for each achievement — easier to scan", points: 2, severity: "medium", category: "structure" });
  }

  // Sections in sensible order
  const hasSummary = data.summary.trim().length > 0;
  const hasExp = data.experience.length > 0;
  const hasEdu = data.education.length > 0;
  if (hasSummary && hasExp) { score += 3; }
  else if (hasExp || hasEdu) { score += 2; }
  else { score += 1; }

  return { score: Math.min(score, 10), max: 10 };
}

// ═══════════════════════════════════════════════════════════
// 7. ATS SAFETY (10 points, subtract risk)
// ═══════════════════════════════════════════════════════════
function scoreATS(data: ResumeData, suggestions: ScoreSuggestion[]): CategoryScore {
  let score = 10;

  // Missing standard headings
  const missingHeadings: string[] = [];
  if (data.experience.length === 0) missingHeadings.push("Experience");
  if (data.skills.length === 0) missingHeadings.push("Skills");
  if (missingHeadings.length > 0) {
    score -= 2;
    suggestions.push({ message: `Missing standard ATS sections: ${missingHeadings.join(", ")}`, fix: "ATS systems expect Experience and Skills sections", points: 2, severity: "high", category: "ats" });
  }

  // Our templates are clean/ATS-safe, so we give benefit of the doubt
  // But note the assumption
  if (score === 10) {
    // Great — no issues
  }

  return { score: Math.max(score, 0), max: 10 };
}

// ═══════════════════════════════════════════════════════════
// MAIN SCORE FUNCTION
// ═══════════════════════════════════════════════════════════
export function calculateResumeScore(data: ResumeData): ResumeScoreResult {
  const suggestions: ScoreSuggestion[] = [];

  const completeness = scoreCompleteness(data, suggestions);
  const presence = scorePresence(data, suggestions);
  const experience = scoreExperience(data, suggestions);
  const impact = scoreImpact(data, suggestions);
  const skills = scoreSkills(data, suggestions);
  const structure = scoreStructure(data, suggestions);
  const ats = scoreATS(data, suggestions);

  const total = completeness.score + presence.score + experience.score +
    impact.score + skills.score + structure.score + ats.score;

  // Sort suggestions: critical > high > medium > low, then by points desc
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  suggestions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || b.points - a.points);

  let label: string;
  let color: string;
  if (total >= 90) { label = "Excellent"; color = "#059669"; }
  else if (total >= 75) { label = "Strong"; color = "#0d9488"; }
  else if (total >= 60) { label = "Solid foundation"; color = "#3b82f6"; }
  else if (total >= 40) { label = "Basic but weak"; color = "#d97706"; }
  else { label = "Needs major work"; color = "#dc2626"; }

  return {
    total,
    label,
    color,
    breakdown: { completeness, presence, experience, impact, skills, structure, ats },
    suggestions,
  };
}

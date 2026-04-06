// Deterministic Resume Score Engine — zero AI, pure rules
// Total: 100 points across 5 categories

import type { ResumeData } from './pdf-export';

// ============================================================
// Types
// ============================================================

export interface ScoreBreakdown {
  completeness: { score: number; max: 30; details: string[] };
  quality: { score: number; max: 25; details: string[] };
  impact: { score: number; max: 25; details: string[] };
  structure: { score: number; max: 10; details: string[] };
  ats: { score: number; max: 10; details: string[] };
}

export interface ScoreSuggestion {
  category: keyof ScoreBreakdown;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  fix?: string;
  fixAction?: 'add-summary' | 'add-experience' | 'add-skills' | 'add-education' | 'improve-bullets' | 'add-metrics' | 'trim-bullets';
  points: number; // points the user would gain
}

export interface ResumeScore {
  total: number;
  breakdown: ScoreBreakdown;
  suggestions: ScoreSuggestion[];
  label: string;
  color: string;
}

// ============================================================
// Action verb list
// ============================================================

const actionVerbs = new Set([
  'achieved', 'accelerated', 'administered', 'analyzed', 'automated',
  'built', 'championed', 'coached', 'collaborated', 'consolidated',
  'contributed', 'coordinated', 'created', 'decreased', 'delivered',
  'designed', 'developed', 'directed', 'drove', 'earned',
  'eliminated', 'enabled', 'engineered', 'established', 'exceeded',
  'executed', 'expanded', 'facilitated', 'generated', 'grew',
  'guided', 'headed', 'implemented', 'improved', 'increased',
  'influenced', 'initiated', 'innovated', 'introduced', 'launched',
  'led', 'leveraged', 'managed', 'maximized', 'mentored',
  'modernized', 'negotiated', 'operated', 'optimized', 'orchestrated',
  'organized', 'oversaw', 'partnered', 'pioneered', 'planned',
  'produced', 'promoted', 'proposed', 'provided', 'published',
  'raised', 'rebuilt', 'reduced', 'refined', 'reorganized',
  'resolved', 'revamped', 'scaled', 'secured', 'simplified',
  'spearheaded', 'standardized', 'streamlined', 'strengthened',
  'structured', 'supervised', 'surpassed', 'trained', 'transformed',
  'unified', 'upgraded', 'utilized',
]);

function startsWithActionVerb(text: string): boolean {
  const firstWord = text.replace(/^[•\-*]\s*/, '').trim().split(/\s/)[0]?.toLowerCase() || '';
  return actionVerbs.has(firstWord);
}

function containsNumbers(text: string): boolean {
  return /\d+%?|\$[\d,]+/.test(text);
}

function getBulletLines(description: string): string[] {
  return description.split('\n').map(l => l.trim()).filter(l => l.length > 0);
}

// ============================================================
// Main Scoring Function
// ============================================================

export function calculateResumeScore(data: ResumeData): ResumeScore {
  const suggestions: ScoreSuggestion[] = [];

  // ─── 1. COMPLETENESS (30 points) ───
  let completeness = 0;
  const compDetails: string[] = [];

  if (data.personalDetails.fullName.trim()) {
    completeness += 5;
    compDetails.push('Name provided');
  } else {
    suggestions.push({ category: 'completeness', severity: 'critical', message: 'Add your full name', points: 5 });
  }

  if (data.personalDetails.email.trim()) {
    completeness += 5;
    compDetails.push('Email provided');
  } else {
    suggestions.push({ category: 'completeness', severity: 'critical', message: 'Add your email address', points: 5 });
  }

  if (data.summary.trim().length > 50) {
    completeness += 5;
    compDetails.push('Summary complete');
  } else if (data.summary.trim().length > 0) {
    completeness += 2;
    compDetails.push('Summary too short');
    suggestions.push({ category: 'completeness', severity: 'high', message: 'Expand your summary to 50+ words', fix: 'Include years of experience, key skills, and value proposition', fixAction: 'add-summary', points: 3 });
  } else {
    suggestions.push({ category: 'completeness', severity: 'critical', message: 'Add a professional summary', fix: 'A summary is the first thing recruiters read', fixAction: 'add-summary', points: 5 });
  }

  if (data.experience.length > 0) {
    completeness += 5;
    compDetails.push(`${data.experience.length} experience(s)`);
  } else {
    suggestions.push({ category: 'completeness', severity: 'critical', message: 'Add at least one work experience', fix: 'Experience is the most important resume section', fixAction: 'add-experience', points: 5 });
  }

  if (data.education.length > 0) {
    completeness += 5;
    compDetails.push(`${data.education.length} education(s)`);
  } else {
    suggestions.push({ category: 'completeness', severity: 'medium', message: 'Add your education background', fixAction: 'add-education', points: 5 });
  }

  if (data.skills.length >= 3) {
    completeness += 5;
    compDetails.push(`${data.skills.length} skills`);
  } else if (data.skills.length > 0) {
    completeness += 2;
    compDetails.push(`Only ${data.skills.length} skill(s)`);
    suggestions.push({ category: 'completeness', severity: 'medium', message: `Add ${3 - data.skills.length} more skills (need at least 3)`, fixAction: 'add-skills', points: 3 });
  } else {
    suggestions.push({ category: 'completeness', severity: 'high', message: 'Add at least 3 skills', fix: 'Skills help ATS systems match you to jobs', fixAction: 'add-skills', points: 5 });
  }

  // ─── 2. CONTENT QUALITY (25 points) ───
  let quality = 0;
  const qualDetails: string[] = [];
  let totalBullets = 0;
  let goodLengthBullets = 0;
  let actionVerbBullets = 0;

  data.experience.forEach(exp => {
    const bullets = getBulletLines(exp.description);
    totalBullets += bullets.length;
    bullets.forEach(bullet => {
      if (bullet.length > 30) { quality += 1; goodLengthBullets++; }
      if (startsWithActionVerb(bullet)) { quality += 1.5; actionVerbBullets++; }
    });
  });

  quality = Math.min(Math.round(quality), 25);
  if (totalBullets > 0) {
    qualDetails.push(`${actionVerbBullets}/${totalBullets} bullets start with action verbs`);
    qualDetails.push(`${goodLengthBullets}/${totalBullets} bullets have good length`);
  }

  if (totalBullets > 0 && actionVerbBullets < totalBullets) {
    const missing = totalBullets - actionVerbBullets;
    suggestions.push({ category: 'quality', severity: 'high', message: `${missing} bullet(s) don't start with action verbs`, fix: 'Start with: Led, Built, Designed, Improved, Increased...', fixAction: 'improve-bullets', points: Math.min(missing * 2, 10) });
  }

  if (totalBullets > 0) {
    const shortBullets = data.experience.flatMap(e => getBulletLines(e.description)).filter(b => b.length < 30 && b.length > 0);
    if (shortBullets.length > 0) {
      suggestions.push({ category: 'quality', severity: 'medium', message: `${shortBullets.length} bullet(s) are too short (<30 chars)`, fix: 'Add context: what, how, and the result', points: shortBullets.length });
    }
    const longBullets = data.experience.flatMap(e => getBulletLines(e.description)).filter(b => b.length > 200);
    if (longBullets.length > 0) {
      suggestions.push({ category: 'quality', severity: 'low', message: `${longBullets.length} bullet(s) are too long (>200 chars)`, fix: 'Keep bullets to 1-2 lines for scanability', fixAction: 'trim-bullets', points: 2 });
    }
  }

  // ─── 3. IMPACT (25 points) ───
  let impact = 0;
  const impDetails: string[] = [];
  let bulletsWithNumbers = 0;

  data.experience.forEach(exp => {
    const bullets = getBulletLines(exp.description);
    bullets.forEach(bullet => {
      if (containsNumbers(bullet)) { impact += 2.5; bulletsWithNumbers++; }
    });
  });

  impact = Math.min(Math.round(impact), 25);
  if (totalBullets > 0) {
    impDetails.push(`${bulletsWithNumbers}/${totalBullets} bullets contain metrics`);
  }

  if (totalBullets > 0 && bulletsWithNumbers === 0) {
    suggestions.push({ category: 'impact', severity: 'critical', message: 'No measurable results anywhere in your resume', fix: 'Add numbers: "Increased sales by 25%", "Managed team of 8", "Reduced costs $50K"', fixAction: 'add-metrics', points: 10 });
  } else if (totalBullets > 0 && bulletsWithNumbers < totalBullets * 0.5) {
    const missing = totalBullets - bulletsWithNumbers;
    suggestions.push({ category: 'impact', severity: 'high', message: `${missing} bullet(s) lack measurable results`, fix: 'Quantify achievements: percentages, dollar amounts, time saved, team sizes', fixAction: 'add-metrics', points: Math.min(missing * 2, 8) });
  }

  // ─── 4. STRUCTURE & READABILITY (10 points) ───
  let structure = 0;
  const structDetails: string[] = [];

  if (totalBullets >= 3 && totalBullets <= 15) {
    structure += 5;
    structDetails.push('Good bullet count');
  } else if (totalBullets > 15) {
    structure += 2;
    structDetails.push('Too many bullets');
    suggestions.push({ category: 'structure', severity: 'medium', message: `Too many bullets (${totalBullets}) — aim for 8-15`, fix: 'Remove weaker bullets to keep the strongest impact', fixAction: 'trim-bullets', points: 3 });
  } else if (totalBullets > 0) {
    structure += 2;
    structDetails.push('Few bullets');
    suggestions.push({ category: 'structure', severity: 'low', message: `Only ${totalBullets} bullet(s) — aim for at least 3`, fix: 'Add more accomplishments to strengthen your resume', points: 3 });
  }

  if (data.summary.trim().length > 0 && data.summary.trim().length < 300) {
    structure += 5;
    structDetails.push('Summary length OK');
  } else if (data.summary.trim().length >= 300) {
    structure += 2;
    structDetails.push('Summary too long');
    suggestions.push({ category: 'structure', severity: 'low', message: 'Summary is too long (>300 chars)', fix: 'Trim to 2-3 concise sentences', points: 3 });
  }

  // ─── 5. ATS SAFETY (10 points) ───
  let ats = 10;
  const atsDetails: string[] = ['Standard text format'];

  // Check for special characters that might confuse ATS
  const allText = [data.summary, ...data.experience.map(e => e.description)].join(' ');
  const specialChars = (allText.match(/[^\w\s.,;:'"!?@#$%&*()\-+=/\\]/g) || []).length;
  if (specialChars > 10) {
    ats -= 3;
    atsDetails.push('Some special characters');
    suggestions.push({ category: 'ats', severity: 'low', message: 'Reduce special characters/symbols', fix: 'Use standard characters for best ATS compatibility', points: 3 });
  }

  // Check if email looks valid
  if (data.personalDetails.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personalDetails.email)) {
    ats -= 2;
    suggestions.push({ category: 'ats', severity: 'medium', message: 'Email format looks invalid', fix: 'Use a standard email format', points: 2 });
  }

  ats = Math.max(0, ats);

  // ─── TOTAL ───
  const total = Math.min(completeness + quality + impact + structure + ats, 100);

  // Label & color
  let label: string;
  let color: string;
  if (total >= 85) { label = 'Excellent'; color = '#059669'; }
  else if (total >= 70) { label = 'Good'; color = '#0d9488'; }
  else if (total >= 50) { label = 'Fair'; color = '#d97706'; }
  else if (total >= 30) { label = 'Needs Work'; color = '#ea580c'; }
  else { label = 'Getting Started'; color = '#dc2626'; }

  // Sort suggestions: critical > high > medium > low
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  suggestions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    total,
    breakdown: {
      completeness: { score: completeness, max: 30, details: compDetails },
      quality: { score: quality, max: 25, details: qualDetails },
      impact: { score: impact, max: 25, details: impDetails },
      structure: { score: structure, max: 10, details: structDetails },
      ats: { score: ats, max: 10, details: atsDetails },
    },
    suggestions: suggestions.slice(0, 8),
    label,
    color,
  };
}

// Enhanced Smart Improve engine — rule-based rewriting helpers

const VERB_UPGRADES: Record<string, string[]> = {
  "worked on": ["Spearheaded", "Developed", "Engineered", "Executed"],
  "helped with": ["Facilitated", "Contributed to", "Supported", "Enabled"],
  "responsible for": ["Managed", "Directed", "Oversaw", "Led"],
  "was responsible": ["Managed", "Directed", "Oversaw", "Led"],
  "was in charge of": ["Led", "Directed", "Managed", "Headed"],
  "assisted with": ["Supported", "Contributed to", "Aided in", "Facilitated"],
  "assisted in": ["Supported", "Contributed to", "Aided in", "Facilitated"],
  "did": ["Executed", "Accomplished", "Delivered", "Completed"],
  "made": ["Created", "Developed", "Designed", "Built"],
  "got": ["Achieved", "Secured", "Obtained", "Earned"],
  "used": ["Leveraged", "Utilized", "Applied", "Employed"],
  "handled": ["Managed", "Oversaw", "Coordinated", "Directed"],
  "dealt with": ["Resolved", "Addressed", "Managed", "Navigated"],
  "ran": ["Managed", "Led", "Directed", "Operated"],
  "involved in": ["Contributed to", "Participated in", "Played key role in"],
  "participated in": ["Contributed to", "Collaborated on", "Engaged in"],
  "tasked with": ["Charged with", "Entrusted to", "Led"],
  "worked with": ["Collaborated with", "Partnered with", "Coordinated with"],
  "in charge of": ["Led", "Oversaw", "Directed", "Managed"],
  "managed projects": ["Managed multiple projects across planning, execution, and delivery phases"],
  "worked on team tasks": ["Collaborated on team initiatives and supported day-to-day operational goals"],
};

const GENERIC_REPLACEMENTS: Record<string, string> = {
  "hard worker": "Consistently exceeded targets by [add %]",
  "team player": "Collaborated with cross-functional teams to deliver [add outcome]",
  "go-getter": "Proactively identified and resolved [add specific issue]",
  "self-starter": "Independently initiated and completed [add project/task]",
  "detail-oriented": "Maintained [add %] accuracy across [add scope]",
  "passionate about": "Specialized in",
  "strong work ethic": "Delivered projects [add X] days ahead of schedule",
  "excellent communication skills": "Presented findings to stakeholders and leadership teams",
  "think outside the box": "Developed innovative solutions that reduced [add metric]",
  "results-driven": "Achieved measurable outcomes including [add specific result]",
  "highly motivated": "Consistently delivered ahead of deadlines",
  "people person": "Built relationships with [add #] stakeholders",
  "multitasker": "Managed [add #] concurrent projects simultaneously",
};

/**
 * Common grammar / typo fixes flagged by the ATS checker. Word-boundary
 * matching so we don't mangle valid words ("continues" inside a longer noun is
 * left alone — only "continues improvement" is corrected).
 */
const TYPO_FIXES: { bad: RegExp; good: string }[] = [
  { bad: /\bLeaded\b/g, good: "Led" },
  { bad: /\bleaded\b/g, good: "led" },
  { bad: /\bcontinues\s+improvement\b/gi, good: "continuous improvement" },
  { bad: /\btill\s*date\b/gi, good: "Present" },
  { bad: /\btill\s*now\b/gi, good: "Present" },
  { bad: /\bto\s+date\b/gi, good: "Present" },
  // "Feb2010" → "Feb 2010" (insert missing space after a month abbreviation)
  {
    bad: /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)(\d{4})\b/g,
    good: "$1 $2",
  },
];

export function fixCommonTypos(text: string): string {
  if (!text) return text;
  let out = text;
  for (const t of TYPO_FIXES) out = out.replace(t.bad, t.good);
  return out;
}

export function improveBulletWithActionVerb(bullet: string): string {
  // Start by normalising common typos (Leaded → Led, "till date" → Present, etc.)
  let result = fixCommonTypos(bullet).trim();
  const cleaned = result.replace(/^[•\-*]\s*/, "");
  const prefix = result.match(/^([•\-*]\s*)/)?.[1] || "";

  // Replace weak verbs
  for (const [weak, replacements] of Object.entries(VERB_UPGRADES)) {
    const re = new RegExp(`^${weak}\\b`, "i");
    if (re.test(cleaned)) {
      const replacement = replacements[0];
      result = prefix + cleaned.replace(re, replacement);
      break;
    }
  }

  // Capitalize first word after bullet prefix
  const inner = result.replace(/^([•\-*]\s*)/, "");
  if (inner.length > 0 && /^[a-z]/.test(inner)) {
    result = prefix + inner.charAt(0).toUpperCase() + inner.slice(1);
  }

  // Fix passive voice
  result = result.replace(/was\s+(developed|created|built|designed|implemented|managed|led|launched|delivered)/gi, (_, verb) =>
    verb.charAt(0).toUpperCase() + verb.slice(1)
  );

  return result;
}

export function improveBulletWithMetricPlaceholder(bullet: string): string {
  const hasNumber = /\d+\s*%|\$\s*\d|\d+\s*(users?|clients?|projects?|people|team|members?)/i.test(bullet);
  if (hasNumber) return bullet;

  // Add metric placeholder at the end
  if (bullet.length > 20 && !bullet.endsWith("]")) {
    const trimmed = bullet.replace(/[.,;]?\s*$/, "");
    return `${trimmed}, resulting in [add measurable result]`;
  }
  return bullet;
}

export function improveSummaryStructure(summary: string, skills: string[]): string {
  let result = fixCommonTypos(summary).trim();
  if (!result) return result;

  // Remove first person
  result = result.replace(/\bI\s+(am|was|have|had)\b/gi, (match) => {
    const verb = match.split(/\s+/)[1].toLowerCase();
    const map: Record<string, string> = { am: "A", was: "Previously", have: "Having", had: "With" };
    return map[verb] || match;
  });
  result = result.replace(/\bI\b/g, "").replace(/\s{2,}/g, " ").trim();

  // Replace generic phrases
  for (const [phrase, replacement] of Object.entries(GENERIC_REPLACEMENTS)) {
    const re = new RegExp(phrase, "gi");
    if (re.test(result)) result = result.replace(re, replacement);
  }

  // Ensure starts with capital
  if (result.length > 0 && /^[a-z]/.test(result)) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  // Add years-of-experience prompt if missing
  if (!/\d+\s*(years?|yrs?|\+)/i.test(result)) {
    result = `[X]+ years of experience. ${result}`;
  }

  // Add top skills if not mentioned
  if (skills.length > 0) {
    const mentioned = skills.filter(s => result.toLowerCase().includes(s.toLowerCase()));
    if (mentioned.length === 0) {
      result += ` Skilled in ${skills.slice(0, 3).join(", ")}.`;
    }
  }

  return result;
}

export function normalizeSkillsList(skills: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const skill of skills) {
    const normalized = skill.trim();
    const key = normalized.toLowerCase();
    if (key.length > 0 && !seen.has(key)) {
      seen.add(key);
      // Capitalize first letter
      result.push(normalized.charAt(0).toUpperCase() + normalized.slice(1));
    }
  }
  return result;
}

export function smartImproveAllBullets(description: string): string {
  return description.split("\n").map(line => {
    if (line.trim().length < 5) return line;
    let improved = improveBulletWithActionVerb(line);
    improved = improveBulletWithMetricPlaceholder(improved);
    return improved;
  }).join("\n");
}

export function fixAllEasyIssues(data: {
  summary: string;
  experience: Array<{ description: string }>;
  skills: string[];
}): { summary: string; experiences: string[]; skills: string[] } {
  return {
    summary: improveSummaryStructure(data.summary, data.skills),
    experiences: data.experience.map(e => smartImproveAllBullets(e.description)),
    skills: normalizeSkillsList(data.skills),
  };
}

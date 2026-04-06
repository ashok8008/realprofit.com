// Grammarly-style rule-based engine + AI usage tracking
// Smart Improve = free, unlimited. AI Improve = 3 free uses total.

export interface Suggestion {
  type: 'warning' | 'improvement' | 'tip';
  message: string;
  fix?: string;
}

// ============================================================
// Weak verb → Strong verb mapping
// ============================================================
const weakVerbMap: Record<string, string[]> = {
  'worked on': ['Spearheaded', 'Developed', 'Engineered', 'Executed'],
  'helped with': ['Facilitated', 'Contributed to', 'Supported', 'Enabled'],
  'responsible for': ['Managed', 'Directed', 'Oversaw', 'Led'],
  'was responsible': ['Managed', 'Directed', 'Oversaw', 'Led'],
  'was in charge of': ['Led', 'Directed', 'Managed', 'Headed'],
  'assisted with': ['Supported', 'Contributed to', 'Aided in', 'Facilitated'],
  'assisted in': ['Supported', 'Contributed to', 'Aided in', 'Facilitated'],
  'did': ['Executed', 'Accomplished', 'Delivered', 'Completed'],
  'made': ['Created', 'Developed', 'Designed', 'Built'],
  'got': ['Achieved', 'Secured', 'Obtained', 'Earned'],
  'used': ['Leveraged', 'Utilized', 'Applied', 'Employed'],
  'handled': ['Managed', 'Oversaw', 'Coordinated', 'Directed'],
  'dealt with': ['Resolved', 'Addressed', 'Managed', 'Navigated'],
  'ran': ['Managed', 'Led', 'Directed', 'Operated'],
  'involved in': ['Contributed to', 'Participated in', 'Played key role in'],
  'participated in': ['Contributed to', 'Collaborated on', 'Engaged in'],
  'tasked with': ['Charged with', 'Entrusted to', 'Led'],
  'worked with': ['Collaborated with', 'Partnered with', 'Coordinated with'],
  'in charge of': ['Led', 'Oversaw', 'Directed', 'Managed'],
};

const genericPhrases: Record<string, string> = {
  'hard worker': 'Consistently exceeded targets by X%',
  'team player': 'Collaborated with cross-functional teams to deliver...',
  'go-getter': 'Proactively identified and resolved...',
  'self-starter': 'Independently initiated and completed...',
  'detail-oriented': 'Maintained 99.X% accuracy across...',
  'passionate about': 'Specialized in',
  'strong work ethic': 'Delivered projects X days ahead of schedule',
  'excellent communication skills': 'Presented findings to stakeholders and leadership teams',
  'think outside the box': 'Developed innovative solutions that reduced...',
  'results-driven': 'Achieved measurable outcomes including...',
  'highly motivated': 'Consistently delivered ahead of deadlines',
  'people person': 'Built relationships with X+ stakeholders',
  'multitasker': 'Managed X concurrent projects simultaneously',
};

const passivePatterns = [
  /was\s+\w+ed\b/i, /were\s+\w+ed\b/i, /been\s+\w+ed\b/i,
  /is\s+being\s+\w+ed\b/i, /has\s+been\s+\w+ed\b/i,
];

// ============================================================
// ANALYZE (returns tips/suggestions — no text changes)
// ============================================================

export function analyzeBulletPoints(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  if (!text.trim()) return suggestions;
  const lines = text.split('\n').filter(l => l.trim());

  for (const [weak, replacements] of Object.entries(weakVerbMap)) {
    if (text.toLowerCase().includes(weak)) {
      suggestions.push({
        type: 'improvement',
        message: `Replace "${weak}" with a stronger verb`,
        fix: `Try: ${replacements.slice(0, 3).join(', ')}`,
      });
    }
  }

  if (!/\d+/.test(text) && text.length > 30) {
    suggestions.push({
      type: 'tip',
      message: 'Add specific numbers or metrics',
      fix: 'e.g. "Increased sales by 25%", "Managed team of 8"',
    });
  }

  for (const line of lines) {
    const trimmed = line.replace(/^[•\-*]\s*/, '').trim();
    if (trimmed.length > 0) {
      const firstWord = trimmed.split(/\s/)[0];
      if (firstWord && /^[a-z]/.test(firstWord)) {
        suggestions.push({
          type: 'improvement',
          message: 'Start bullets with a strong action verb',
          fix: `"${firstWord}..." → "Spearheaded...", "Delivered...", "Optimized..."`,
        });
        break;
      }
    }
  }

  for (const pattern of passivePatterns) {
    if (pattern.test(text)) {
      suggestions.push({ type: 'improvement', message: 'Passive voice detected — use active voice', fix: '"was implemented" → "Implemented..."' });
      break;
    }
  }

  for (const [phrase, replacement] of Object.entries(genericPhrases)) {
    if (text.toLowerCase().includes(phrase)) {
      suggestions.push({ type: 'warning', message: `Avoid "${phrase}"`, fix: `Try: "${replacement}"` });
    }
  }

  if (suggestions.length === 0 && text.length > 50) {
    suggestions.push({ type: 'tip', message: 'Looking good! Strong action verbs and clear language.' });
  }

  return suggestions.slice(0, 4);
}

export function analyzeSummary(summary: string, skills: string[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  if (!summary.trim()) return suggestions;
  const wordCount = summary.trim().split(/\s+/).length;

  if (wordCount < 20) {
    suggestions.push({ type: 'warning', message: 'Summary is too short', fix: 'Aim for 50-100 words: experience level + key skills + value proposition.' });
  } else if (wordCount > 120) {
    suggestions.push({ type: 'warning', message: 'Summary too long (>120 words)', fix: 'Trim to 50-100 words. Recruiters scan in 6 seconds.' });
  }

  for (const [phrase, replacement] of Object.entries(genericPhrases)) {
    if (summary.toLowerCase().includes(phrase)) {
      suggestions.push({ type: 'improvement', message: `Replace "${phrase}"`, fix: `Try: "${replacement}"` });
      break;
    }
  }

  if (!/\d+\s*(years?|yrs?|\+)/i.test(summary)) {
    suggestions.push({ type: 'tip', message: 'Mention years of experience', fix: 'Start with: "X+ years of experience in..."' });
  }

  if (skills.length > 0 && !skills.some(s => summary.toLowerCase().includes(s.toLowerCase()))) {
    suggestions.push({ type: 'tip', message: 'Include top skills', fix: `Weave in: ${skills.slice(0, 3).join(', ')}` });
  }

  if (/\bI\b/.test(summary)) {
    suggestions.push({ type: 'improvement', message: 'Avoid first person ("I")', fix: '"I managed..." → "Managed..."' });
  }

  if (suggestions.length === 0) {
    suggestions.push({ type: 'tip', message: 'Summary looks strong! Clear and professional.' });
  }

  return suggestions.slice(0, 4);
}

// ============================================================
// SMART REWRITE (free, rule-based — actually transforms text)
// ============================================================

export function smartRewriteBullets(text: string): string {
  if (!text.trim()) return text;
  let result = text;

  // Replace weak verbs with strong alternatives
  for (const [weak, replacements] of Object.entries(weakVerbMap)) {
    const regex = new RegExp(`\\b${weak}\\b`, 'gi');
    if (regex.test(result)) {
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      result = result.replace(regex, replacement);
    }
  }

  // Replace generic phrases
  for (const [phrase, replacement] of Object.entries(genericPhrases)) {
    const regex = new RegExp(phrase, 'gi');
    if (regex.test(result)) {
      result = result.replace(regex, replacement);
    }
  }

  // Capitalize first letter of each bullet line
  result = result.split('\n').map(line => {
    const trimmed = line.replace(/^([•\-*]\s*)/, '');
    const prefix = line.match(/^([•\-*]\s*)/)?.[1] || '';
    if (trimmed.length > 0 && /^[a-z]/.test(trimmed)) {
      return prefix + trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }
    return line;
  }).join('\n');

  // Fix passive voice patterns (simple cases)
  result = result.replace(/was\s+(developed|created|built|designed|implemented|managed|led)/gi, (_, verb) => {
    return verb.charAt(0).toUpperCase() + verb.slice(1);
  });

  return result;
}

export function smartRewriteSummary(summary: string, skills: string[]): string {
  if (!summary.trim()) return summary;
  let result = summary;

  // Remove first person
  result = result.replace(/\bI\s+(am|was|have|had)\b/gi, (match) => {
    const verb = match.split(/\s+/)[1].toLowerCase();
    if (verb === 'am') return 'A';
    if (verb === 'was') return 'Previously';
    if (verb === 'have') return 'Having';
    if (verb === 'had') return 'With';
    return match;
  });
  result = result.replace(/\bI\b/g, '');
  result = result.replace(/\s{2,}/g, ' ').trim();

  // Replace generic phrases
  for (const [phrase, replacement] of Object.entries(genericPhrases)) {
    const regex = new RegExp(phrase, 'gi');
    if (regex.test(result)) {
      result = result.replace(regex, replacement);
    }
  }

  // Capitalize first letter
  if (result.length > 0 && /^[a-z]/.test(result)) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result;
}

// ============================================================
// AI USAGE TRACKING (3 total free uses across all features)
// ============================================================

const AI_USAGE_KEY = 'rp_ai_uses_v2';
const AI_FREE_LIMIT = 3;

interface AiUsageData {
  totalUsed: number;
}

function getUsageData(): AiUsageData {
  try {
    const raw = localStorage.getItem(AI_USAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { totalUsed: 0 };
}

function saveUsageData(data: AiUsageData) {
  localStorage.setItem(AI_USAGE_KEY, JSON.stringify(data));
}

export function getAiRemaining(): number {
  return Math.max(0, AI_FREE_LIMIT - getUsageData().totalUsed);
}

export function canUseAi(): boolean {
  return getAiRemaining() > 0;
}

export function recordAiUsage() {
  const data = getUsageData();
  data.totalUsed += 1;
  saveUsageData(data);
}

export const AI_FREE_TOTAL = AI_FREE_LIMIT;

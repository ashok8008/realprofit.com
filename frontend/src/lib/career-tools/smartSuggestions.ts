// Grammarly-style rule-based suggestion engine — zero API cost

interface Suggestion {
  type: 'warning' | 'improvement' | 'tip';
  message: string;
  fix?: string;
}

// Weak verbs → Strong verb replacements
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
};

// Strong action verbs for bullets
const strongVerbs = [
  'Achieved', 'Accelerated', 'Automated', 'Built', 'Championed', 'Consolidated',
  'Decreased', 'Delivered', 'Designed', 'Drove', 'Eliminated', 'Established',
  'Exceeded', 'Expanded', 'Generated', 'Implemented', 'Improved', 'Increased',
  'Initiated', 'Launched', 'Led', 'Maximized', 'Negotiated', 'Optimized',
  'Orchestrated', 'Pioneered', 'Reduced', 'Revamped', 'Scaled', 'Secured',
  'Spearheaded', 'Streamlined', 'Strengthened', 'Surpassed', 'Transformed',
];

// Generic/filler phrases to flag
const genericPhrases = [
  'hard worker', 'team player', 'go-getter', 'self-starter', 'detail-oriented',
  'passionate about', 'strong work ethic', 'excellent communication skills',
  'think outside the box', 'results-driven', 'dynamic individual',
  'proven track record', 'synergy', 'leverage', 'fast-paced environment',
  'highly motivated', 'people person', 'multitasker',
];

// Passive voice patterns
const passivePatterns = [
  /was\s+\w+ed\b/i, /were\s+\w+ed\b/i, /been\s+\w+ed\b/i,
  /is\s+being\s+\w+ed\b/i, /has\s+been\s+\w+ed\b/i,
];

/**
 * Analyze resume bullet points and return suggestions
 */
export function analyzeBulletPoints(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  if (!text.trim()) return suggestions;

  const lines = text.split('\n').filter(l => l.trim());

  // Check for weak verbs
  for (const [weak, replacements] of Object.entries(weakVerbMap)) {
    if (text.toLowerCase().includes(weak)) {
      suggestions.push({
        type: 'improvement',
        message: `Replace "${weak}" with a stronger verb`,
        fix: `Try: ${replacements.slice(0, 3).join(', ')}`,
      });
    }
  }

  // Check for missing metrics/numbers
  const hasNumbers = /\d+/.test(text);
  if (!hasNumbers && text.length > 30) {
    suggestions.push({
      type: 'tip',
      message: 'Add specific numbers or metrics',
      fix: 'Quantify results: "Increased sales by 25%", "Managed team of 8", "Reduced costs by $50K"',
    });
  }

  // Check bullet format
  for (const line of lines) {
    const trimmed = line.replace(/^[•\-*]\s*/, '').trim();
    if (trimmed.length > 0) {
      const firstWord = trimmed.split(/\s/)[0];
      // Check if starts with action verb (capitalized word)
      if (firstWord && firstWord[0] === firstWord[0].toLowerCase() && /^[a-z]/.test(firstWord)) {
        suggestions.push({
          type: 'improvement',
          message: 'Start each bullet with a strong action verb',
          fix: `Instead of "${firstWord}...", try: "${strongVerbs[Math.floor(Math.random() * 10)]}..."`,
        });
        break; // Only flag once
      }
    }
  }

  // Check for passive voice
  for (const pattern of passivePatterns) {
    if (pattern.test(text)) {
      suggestions.push({
        type: 'improvement',
        message: 'Passive voice detected — use active voice',
        fix: 'Change "was implemented by me" → "Implemented..."',
      });
      break;
    }
  }

  // Check bullet length
  for (const line of lines) {
    const trimmed = line.replace(/^[•\-*]\s*/, '').trim();
    if (trimmed.length > 0 && trimmed.length < 20) {
      suggestions.push({
        type: 'tip',
        message: 'Some bullets are too short',
        fix: 'Add context: what you did, how you did it, and the result',
      });
      break;
    }
    if (trimmed.length > 150) {
      suggestions.push({
        type: 'warning',
        message: 'Some bullets are too long (>150 chars)',
        fix: 'Keep bullets concise: 1-2 lines max. Split into multiple points if needed.',
      });
      break;
    }
  }

  // Check for generic phrases
  for (const phrase of genericPhrases) {
    if (text.toLowerCase().includes(phrase)) {
      suggestions.push({
        type: 'warning',
        message: `Avoid generic phrase: "${phrase}"`,
        fix: 'Be specific about what you actually did and the measurable impact',
      });
    }
  }

  // Positive feedback if looks good
  if (suggestions.length === 0 && text.length > 50) {
    suggestions.push({
      type: 'tip',
      message: 'Looking good! Your bullets use strong language.',
    });
  }

  return suggestions.slice(0, 4); // Max 4 suggestions
}

/**
 * Analyze resume summary and return suggestions
 */
export function analyzeSummary(summary: string, skills: string[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  if (!summary.trim()) return suggestions;

  const wordCount = summary.trim().split(/\s+/).length;

  // Length check
  if (wordCount < 20) {
    suggestions.push({
      type: 'warning',
      message: 'Summary is too short',
      fix: 'Aim for 50-100 words. Include: years of experience, key skills, and what you bring to the role.',
    });
  } else if (wordCount > 120) {
    suggestions.push({
      type: 'warning',
      message: 'Summary is too long (>120 words)',
      fix: 'Trim to 50-100 words. Recruiters spend 6 seconds scanning — be concise.',
    });
  }

  // Check for generic phrases
  for (const phrase of genericPhrases) {
    if (summary.toLowerCase().includes(phrase)) {
      suggestions.push({
        type: 'improvement',
        message: `Replace "${phrase}" with something specific`,
        fix: 'Example: Instead of "team player", say "Collaborated with 5 cross-functional teams to deliver..."',
      });
      break; // Only flag one
    }
  }

  // Check if mentions years of experience
  if (!/\d+\s*(years?|yrs?|\+)/i.test(summary)) {
    suggestions.push({
      type: 'tip',
      message: 'Mention your years of experience',
      fix: 'Start with: "X+ years of experience in..." — this is the #1 thing recruiters look for.',
    });
  }

  // Check if mentions skills
  if (skills.length > 0) {
    const mentionsSkill = skills.some(s => summary.toLowerCase().includes(s.toLowerCase()));
    if (!mentionsSkill) {
      suggestions.push({
        type: 'tip',
        message: 'Include 2-3 of your top skills in the summary',
        fix: `Try weaving in: ${skills.slice(0, 3).join(', ')}`,
      });
    }
  }

  // Check for first person
  if (/\bI\b/.test(summary)) {
    suggestions.push({
      type: 'improvement',
      message: 'Avoid first person ("I") in summaries',
      fix: 'Instead of "I managed...", write "Managed..." — resumes use implied first person.',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      type: 'tip',
      message: 'Summary looks strong! Clear, concise, and professional.',
    });
  }

  return suggestions.slice(0, 4);
}

/**
 * Get a random strong action verb
 */
export function getRandomStrongVerb(): string {
  return strongVerbs[Math.floor(Math.random() * strongVerbs.length)];
}

// AI usage tracking
const AI_USAGE_KEY = 'rp_ai_usage';

interface AiUsage {
  resumeBullet: number;
  resumeSummary: number;
  emailTemplate: number;
}

function getAiUsage(): AiUsage {
  try {
    const stored = localStorage.getItem(AI_USAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { resumeBullet: 0, resumeSummary: 0, emailTemplate: 0 };
}

function setAiUsage(usage: AiUsage) {
  localStorage.setItem(AI_USAGE_KEY, JSON.stringify(usage));
}

export function canUseAi(feature: keyof AiUsage): boolean {
  const usage = getAiUsage();
  return usage[feature] < 1;
}

export function recordAiUsage(feature: keyof AiUsage) {
  const usage = getAiUsage();
  usage[feature] += 1;
  setAiUsage(usage);
}

export function getAiUsageCount(feature: keyof AiUsage): number {
  return getAiUsage()[feature];
}

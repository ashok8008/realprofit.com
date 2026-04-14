// Variation engine for Resume & Career pSEO pages
// Generates unique content per page to avoid duplicate content penalties

import type { ResumeRoleEntry, ResumeScoreEntry, ResumeExperienceEntry, ResumeCompanyEntry, ResumeProblemEntry, CareerDecisionEntry } from "./datasets/resumeCareer";

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ═══════════════════════════════════════════════════════════
// RESUME ROLE PAGES
// ═══════════════════════════════════════════════════════════
export function generateRoleContent(entry: ResumeRoleEntry) {
  const h = hash(entry.slug);
  const { role, category, keywords, avgSalary } = entry;
  const kw3 = keywords.slice(0, 3).join(", ");
  const kw5 = keywords.slice(0, 5).join(", ");

  const directAnswer = pick([
    `A strong ${role} resume in 2026 highlights ${kw3} alongside measurable achievements. Recruiters spend 7 seconds scanning — make every line count with ATS-optimized formatting and role-specific keywords.`,
    `To land a ${role} role, your resume must demonstrate proficiency in ${kw3} with quantified results. The average ${role} earns ${avgSalary}, and competition is fierce — a targeted resume is your edge.`,
    `The best ${role} resumes combine technical skills like ${kw3} with clear impact metrics. ATS systems filter 75% of applications before a human sees them — optimization is essential.`,
  ], h);

  const keyTakeaways = [
    `Include ${keywords[0]} and ${keywords[1]} prominently in your skills section`,
    `Quantify achievements with numbers (revenue, users, time saved)`,
    `Use the ${pick(["chronological", "hybrid"], h)} format for ${category} roles`,
    `Tailor your summary to each ${role} job description`,
    `Keep it to ${pick(["1 page", "1-2 pages"], h)} unless you have 10+ years of experience`,
  ];

  const sections = [
    {
      heading: `What Makes a Great ${role} Resume?`,
      content: pick([
        `A great ${role} resume goes beyond listing job duties. It demonstrates impact through metrics — how you improved processes, grew revenue, reduced costs, or led teams. Hiring managers in ${category} look for candidates who can show, not just tell, what they bring to the table. Keywords like ${kw5} should appear naturally throughout your experience and skills sections.`,
        `Top ${role} resumes in 2026 share common traits: a compelling summary, ATS-friendly formatting, and achievement-focused bullet points. With the average role attracting 250+ applicants, your resume needs to pass automated screening and impress a human reviewer in under 10 seconds. Focus on ${kw3} as your core technical foundation.`,
      ], h),
    },
    {
      heading: `Must-Have Skills for ${role}`,
      content: `The most in-demand skills for ${role} positions include: ${keywords.join(", ")}. Place your strongest skills near the top of your skills section, and weave them into your experience bullet points. ATS systems match these keywords against job descriptions, so alignment is critical.`,
    },
    {
      heading: `Common Resume Mistakes for ${role}`,
      content: pick([
        `The biggest mistake ${role} candidates make is writing generic descriptions instead of quantified achievements. "Managed projects" means nothing — "Led 5 cross-functional projects delivering $2M in revenue" tells a story. Other common errors: missing ${keywords[0]} from the skills section, using a non-ATS-friendly format, and writing more than 2 pages.`,
        `Many ${role} applicants fail because they don't tailor their resume to each job posting. Other frequent mistakes: burying ${keywords[0]} deep in the resume, using passive language instead of action verbs, including irrelevant experience, and neglecting the summary section entirely.`,
      ], h + 1),
    },
    {
      heading: `${role} Resume Format & Layout`,
      content: `Use a clean, single-column layout with clear section headings: Summary, Experience, Skills, Education. For ${category} roles, the ${pick(["reverse chronological", "hybrid"], h + 2)} format works best. Keep margins at 0.5-1 inch, use 10-12pt font, and avoid graphics that break ATS parsing.`,
    },
  ];

  const faqs = [
    { q: `What should a ${role} put on their resume?`, a: `Focus on ${kw3}, quantified achievements (revenue, users, cost savings), relevant certifications, and role-specific tools. Tailor each application to the job description.` },
    { q: `How long should a ${role} resume be?`, a: `1 page for less than 10 years of experience, 2 pages for senior ${role}s with extensive accomplishments. Quality over quantity — every line should add value.` },
    { q: `What's the average salary for a ${role}?`, a: `The average ${role} salary in the US is approximately ${avgSalary} in 2026, varying by location, company size, and experience level. Use our Salary Comparison tool for personalized data.` },
    { q: `Is my ${role} resume ATS-friendly?`, a: `Check using our free Resume Score tool — it analyzes ATS compatibility, keyword matching, and formatting across 100+ data points. Most ${role} resumes score below 60/100 on first pass.` },
  ];

  return { directAnswer, keyTakeaways, sections, faqs };
}

// ═══════════════════════════════════════════════════════════
// RESUME SCORE PAGES
// ═══════════════════════════════════════════════════════════
export function generateScoreContent(entry: ResumeScoreEntry) {
  const { score, bucket } = entry;
  const h = hash(entry.slug);

  const bucketLabel = { poor: "Poor", fair: "Needs Work", good: "Good", excellent: "Excellent" }[bucket];
  const emoji = { poor: "below average", fair: "average", good: "above average", excellent: "top-tier" }[bucket];

  const directAnswer = pick([
    `A resume score of ${score}/100 is rated "${bucketLabel}" — meaning your resume is ${emoji} compared to other job seekers. ${score < 60 ? "Significant improvements are needed to pass ATS screening." : score < 80 ? "You're on the right track but targeted fixes can boost your interview rate." : "Your resume is strong — minor optimizations can push you to the top."}`,
    `Scoring ${score} out of 100 places your resume in the "${bucketLabel}" range. ${score < 60 ? "Most ATS systems will likely filter your application before a recruiter sees it." : score < 80 ? "Your resume passes basic screening but misses opportunities for keyword optimization." : "You're outperforming 80%+ of applicants — keep refining for maximum impact."}`,
  ], h);

  const keyTakeaways = bucket === "poor" ? [
    "Your resume likely fails most ATS scans",
    "Missing critical sections or keywords",
    "Formatting may be causing parsing errors",
    "Immediate action needed: use our Resume Builder to restructure",
    "Score improvement of 20+ points is achievable in 15 minutes",
  ] : bucket === "fair" ? [
    "Your resume passes some ATS systems but not all",
    "Key sections exist but need optimization",
    "Adding 5-8 targeted keywords can boost your score significantly",
    "Summary section likely needs strengthening",
    "Use our Tips & Fixes tool to identify quick wins",
  ] : bucket === "good" ? [
    "Your resume passes most ATS screening",
    "Strong foundation — focus on fine-tuning",
    "Quantify more achievements with specific metrics",
    "Ensure keywords match your target job descriptions",
    "A score of 80+ puts you ahead of most applicants",
  ] : [
    "Your resume is in the top tier of applicants",
    "ATS compatibility is excellent",
    "Focus on tailoring for specific companies",
    "Consider running our Premium ATS Check for deeper analysis",
    "Maintain this quality by updating regularly",
  ];

  const comparison = [
    { range: "0-39", label: "Poor", pct: "25%", meaning: "Major rewrites needed. ATS rejection rate: ~80%" },
    { range: "40-59", label: "Fair", pct: "35%", meaning: "Basic structure present but key optimizations missing" },
    { range: "60-79", label: "Good", pct: "25%", meaning: "Solid resume that passes most ATS screening" },
    { range: "80-100", label: "Excellent", pct: "15%", meaning: "Top-tier resume with strong keyword optimization" },
  ];

  const improvementSteps = score < 40 ? [
    "Add a professional summary (2-3 sentences)",
    "Include all essential sections: Header, Experience, Education, Skills",
    "Use standard section headings that ATS can recognize",
    "Add at least 8-10 relevant skills",
    "Quantify at least 3 achievements with numbers",
  ] : score < 60 ? [
    "Strengthen your summary with role-specific keywords",
    "Add 3-5 more quantified achievements",
    "Ensure consistent date formatting throughout",
    "Add missing contact information (LinkedIn, phone)",
    "Use our AI suggestions to rewrite weak bullet points",
  ] : score < 80 ? [
    "Tailor keywords to specific job descriptions",
    "Add industry certifications if applicable",
    "Strengthen action verbs (Led, Built, Increased, Reduced)",
    "Ensure each bullet point has a measurable result",
    "Run Premium ATS Check for company-specific optimization",
  ] : [
    "Customize for each application with job-specific keywords",
    "Keep content fresh — update quarterly",
    "A/B test different summary approaches",
    "Consider adding a portfolio or project links",
    "Use our Job Fit Analyzer for role-specific tailoring",
  ];

  const faqs = [
    { q: `Is a resume score of ${score} good?`, a: `A score of ${score}/100 is rated "${bucketLabel}." ${score >= 70 ? "This is a competitive score that should pass most ATS systems." : "There's room for improvement — targeted changes can significantly boost your chances."}` },
    { q: `How can I improve my resume score from ${score}?`, a: `Focus on: ${improvementSteps.slice(0, 2).join("; ")}. Our Resume Builder provides real-time scoring as you make changes.` },
    { q: "What resume score do I need to get interviews?", a: "Most recruiters' ATS systems have effective thresholds around 60-70. A score of 75+ significantly increases your callback rate. Aim for 80+ for competitive roles." },
    { q: "How is the resume score calculated?", a: "Our scoring engine evaluates 100+ data points across 7 categories: ATS compatibility, keyword density, section completeness, contact info, experience quality, skills relevance, and formatting." },
  ];

  return { directAnswer, keyTakeaways, comparison, improvementSteps, faqs };
}

// ═══════════════════════════════════════════════════════════
// EXPERIENCE LEVEL PAGES
// ═══════════════════════════════════════════════════════════
export function generateExperienceContent(entry: ResumeExperienceEntry) {
  const { level, yearsRange } = entry;
  const h = hash(entry.slug);

  const directAnswer = pick([
    `Writing a resume with ${level.toLowerCase()} requires a strategic approach that emphasizes ${yearsRange === "0 years" || yearsRange === "0-1 years" ? "education, projects, internships, and transferable skills" : yearsRange === "gap" ? "skills-first formatting and confident framing of your career break" : "relevant achievements, progressive responsibility, and industry expertise"}. The right format and focus areas make all the difference.`,
    `A ${level.toLowerCase()} resume succeeds when it ${yearsRange === "0 years" || yearsRange === "0-1 years" ? "leads with potential — academic projects, volunteer work, and relevant coursework can substitute for professional experience" : yearsRange === "gap" ? "addresses the gap honestly while emphasizing continued skill development" : "quantifies impact, shows career progression, and targets specific roles with tailored keywords"}.`,
  ], h);

  const keyTakeaways = [
    `Use the ${yearsRange === "0 years" || yearsRange === "0-1 years" ? "functional or combination" : "reverse chronological"} resume format`,
    yearsRange === "0 years" ? "Lead with Education and Projects sections" : "Lead with a strong professional summary",
    "Include 8-12 skills relevant to your target role",
    "Quantify achievements wherever possible — even volunteer or academic work",
    `Keep resume to ${yearsRange === "10+ years" ? "2 pages max" : "1 page"}`,
  ];

  const faqs = [
    { q: `How do I write a resume with ${level.toLowerCase()}?`, a: `Focus on ${yearsRange === "0 years" || yearsRange === "0-1 years" ? "education, projects, internships, volunteer work, and transferable skills from any context" : "quantified achievements, relevant skills, and progressive career growth"}. Use our Resume Builder for guided, step-by-step creation.` },
    { q: `What format is best for ${level.toLowerCase()}?`, a: `${yearsRange === "0 years" || yearsRange === "0-1 years" ? "Functional or combination format — leads with skills rather than thin work history" : yearsRange === "gap" ? "Combination format — skills section first, then chronological experience with brief gap explanation" : "Reverse chronological — recruiters prefer seeing your most recent, relevant experience first"}.` },
    { q: `How long should my resume be with ${yearsRange} of experience?`, a: `${yearsRange === "10+ years" ? "2 pages maximum — focus on the last 10-15 years of relevant experience" : "1 page — every line should add value. Quality over quantity."}.` },
  ];

  return { directAnswer, keyTakeaways, faqs };
}

// ═══════════════════════════════════════════════════════════
// COMPANY TARGET PAGES
// ═══════════════════════════════════════════════════════════
export function generateCompanyContent(entry: ResumeCompanyEntry) {
  const { company, industry } = entry;
  const h = hash(entry.slug);

  const directAnswer = pick([
    `Getting hired at ${company} requires a resume that speaks their language. ${company}'s recruiters in ${industry} prioritize quantified impact, cultural alignment, and role-specific keywords. Their ATS systems are sophisticated — generic resumes get filtered out immediately.`,
    `A resume targeting ${company} must demonstrate both technical competence and cultural fit. As a leading ${industry} company, ${company} values data-driven achievements, innovation, and collaborative problem-solving. Tailor every section to their specific job posting.`,
  ], h);

  const keyTakeaways = [
    `Research ${company}'s values and weave them into your summary`,
    "Mirror exact keywords from the job description",
    "Quantify achievements (revenue, scale, efficiency gains)",
    `Highlight ${industry}-relevant technical skills prominently`,
    `Keep formatting clean — ${company}'s ATS is strict on parsing`,
  ];

  const faqs = [
    { q: `How do I get my resume noticed at ${company}?`, a: `Use exact keywords from the ${company} job posting, quantify all achievements, and include a tailored summary that reflects ${company}'s mission. Employee referrals also significantly increase visibility.` },
    { q: `What does ${company} look for in a resume?`, a: `${company} prioritizes: quantified impact metrics, relevant technical skills, cultural alignment with their values, and clear progression in your career. Format should be clean and ATS-parseable.` },
    { q: `Should I customize my resume for ${company}?`, a: `Absolutely. Generic resumes have a ~3% callback rate. A resume tailored to ${company}'s specific job description can increase callbacks to 15-25%. Use our Resume Builder to tailor efficiently.` },
  ];

  return { directAnswer, keyTakeaways, faqs };
}

// ═══════════════════════════════════════════════════════════
// PROBLEM-BASED PAGES
// ═══════════════════════════════════════════════════════════
export function generateProblemContent(entry: ResumeProblemEntry) {
  const { problem } = entry;
  const h = hash(entry.slug);

  const directAnswer = pick([
    `If your resume is ${problem}, you're not alone — this is one of the most common challenges job seekers face. The solution combines ATS optimization, strategic keyword placement, and formatting fixes that most candidates overlook.`,
    `Dealing with ${problem} on your resume? This is fixable. Most issues stem from poor ATS compatibility, missing keywords, or formatting that doesn't match what modern recruiting software expects.`,
  ], h);

  const keyTakeaways = [
    "Run your resume through an ATS scanner (our tool is free)",
    "Match keywords from the job description exactly",
    "Use standard section headings (Experience, Education, Skills)",
    "Quantify achievements with specific numbers",
    "Keep formatting simple — avoid tables, graphics, and columns",
  ];

  return { directAnswer, keyTakeaways };
}

// ═══════════════════════════════════════════════════════════
// CAREER DECISION PAGES
// ═══════════════════════════════════════════════════════════
export function generateDecisionContent(entry: CareerDecisionEntry) {
  const { topic } = entry;
  const h = hash(entry.slug);

  const directAnswer = pick([
    `Making a decision about ${topic} requires weighing financial, career, and personal factors. Use data — not just gut feeling — to evaluate your options. Our free tools can help you compare salary, cost of living, and career trajectory before you commit.`,
    `The question of ${topic} comes down to numbers and priorities. Calculate the financial impact using our tools, assess your career growth potential, and consider lifestyle factors. Most people who use data-driven frameworks make decisions they don't regret.`,
  ], h);

  const keyTakeaways = [
    "Use real salary data, not assumptions",
    "Factor in cost of living differences",
    "Consider total compensation, not just base pay",
    "Evaluate long-term career trajectory, not just immediate gain",
    "Use our free tools to run the numbers before deciding",
  ];

  return { directAnswer, keyTakeaways };
}

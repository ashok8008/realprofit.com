// Resume pSEO datasets — role-based, score-based, experience-based, company-based, problem-based

export interface ResumeRoleEntry {
  slug: string;
  title: string;
  type: "resume-role";
  role: string;
  category: string;
  keywords: string[];
  avgSalary: string;
}

export interface ResumeScoreEntry {
  slug: string;
  title: string;
  type: "resume-score";
  score: number;
  bucket: "poor" | "fair" | "good" | "excellent";
}

export interface ResumeExperienceEntry {
  slug: string;
  title: string;
  type: "resume-experience";
  level: string;
  yearsRange: string;
}

export interface ResumeCompanyEntry {
  slug: string;
  title: string;
  type: "resume-company";
  company: string;
  industry: string;
}

export interface ResumeProblemEntry {
  slug: string;
  title: string;
  type: "resume-problem";
  problem: string;
}

// ─── JOB ROLES (50+ roles) ──────────────────────────────────
const ROLES: { role: string; category: string; keywords: string[]; avgSalary: string }[] = [
  { role: "Software Engineer", category: "Technology", keywords: ["Python", "JavaScript", "React", "AWS", "Git", "CI/CD", "Agile"], avgSalary: "$120K" },
  { role: "Product Manager", category: "Technology", keywords: ["roadmap", "user research", "A/B testing", "Agile", "stakeholder management", "PRD"], avgSalary: "$135K" },
  { role: "Data Scientist", category: "Technology", keywords: ["Python", "SQL", "machine learning", "TensorFlow", "statistics", "data visualization"], avgSalary: "$130K" },
  { role: "Data Analyst", category: "Technology", keywords: ["SQL", "Excel", "Tableau", "Python", "data visualization", "reporting"], avgSalary: "$75K" },
  { role: "UX Designer", category: "Design", keywords: ["Figma", "user research", "wireframing", "prototyping", "usability testing", "design systems"], avgSalary: "$105K" },
  { role: "Frontend Developer", category: "Technology", keywords: ["React", "TypeScript", "CSS", "HTML", "Next.js", "responsive design"], avgSalary: "$110K" },
  { role: "Backend Developer", category: "Technology", keywords: ["Node.js", "Python", "APIs", "databases", "microservices", "Docker"], avgSalary: "$115K" },
  { role: "Full Stack Developer", category: "Technology", keywords: ["React", "Node.js", "MongoDB", "TypeScript", "REST APIs", "Docker"], avgSalary: "$118K" },
  { role: "DevOps Engineer", category: "Technology", keywords: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "monitoring"], avgSalary: "$125K" },
  { role: "Machine Learning Engineer", category: "Technology", keywords: ["Python", "TensorFlow", "PyTorch", "MLOps", "deep learning", "NLP"], avgSalary: "$145K" },
  { role: "Project Manager", category: "Management", keywords: ["PMP", "Agile", "Scrum", "budgeting", "risk management", "stakeholder communication"], avgSalary: "$95K" },
  { role: "Marketing Manager", category: "Marketing", keywords: ["SEO", "content strategy", "Google Analytics", "social media", "campaign management"], avgSalary: "$85K" },
  { role: "Sales Representative", category: "Sales", keywords: ["CRM", "lead generation", "cold calling", "negotiation", "pipeline management"], avgSalary: "$65K" },
  { role: "Graphic Designer", category: "Design", keywords: ["Adobe Creative Suite", "Figma", "typography", "branding", "layout design"], avgSalary: "$60K" },
  { role: "Financial Analyst", category: "Finance", keywords: ["financial modeling", "Excel", "forecasting", "budgeting", "valuation", "SQL"], avgSalary: "$80K" },
  { role: "Accountant", category: "Finance", keywords: ["GAAP", "QuickBooks", "tax preparation", "audit", "reconciliation", "Excel"], avgSalary: "$65K" },
  { role: "Registered Nurse", category: "Healthcare", keywords: ["patient care", "EMR", "medication administration", "vital signs", "BLS/ACLS"], avgSalary: "$80K" },
  { role: "Medical Assistant", category: "Healthcare", keywords: ["patient intake", "vitals", "EHR", "phlebotomy", "scheduling"], avgSalary: "$38K" },
  { role: "Teacher", category: "Education", keywords: ["curriculum development", "classroom management", "differentiated instruction", "assessment"], avgSalary: "$55K" },
  { role: "HR Generalist", category: "Human Resources", keywords: ["recruiting", "onboarding", "employee relations", "HRIS", "compliance", "benefits"], avgSalary: "$65K" },
  { role: "Customer Service Representative", category: "Support", keywords: ["CRM", "conflict resolution", "ticketing systems", "communication", "problem-solving"], avgSalary: "$38K" },
  { role: "Operations Manager", category: "Management", keywords: ["process improvement", "supply chain", "budgeting", "KPIs", "team leadership"], avgSalary: "$85K" },
  { role: "Business Analyst", category: "Technology", keywords: ["requirements gathering", "SQL", "Jira", "process mapping", "stakeholder management"], avgSalary: "$85K" },
  { role: "Content Marketing Manager", category: "Marketing", keywords: ["content strategy", "SEO", "copywriting", "analytics", "editorial calendar"], avgSalary: "$80K" },
  { role: "Digital Marketing Manager", category: "Marketing", keywords: ["PPC", "SEO", "social media", "Google Ads", "email marketing", "analytics"], avgSalary: "$78K" },
  { role: "Recruiter", category: "Human Resources", keywords: ["sourcing", "ATS", "interviewing", "employer branding", "LinkedIn Recruiter"], avgSalary: "$65K" },
  { role: "Construction Manager", category: "Construction", keywords: ["project scheduling", "budgeting", "OSHA", "blueprint reading", "subcontractor management"], avgSalary: "$95K" },
  { role: "Electrician", category: "Trades", keywords: ["NEC code", "troubleshooting", "wiring", "blueprints", "safety protocols"], avgSalary: "$60K" },
  { role: "Store Manager", category: "Retail", keywords: ["inventory management", "P&L", "team leadership", "customer service", "visual merchandising"], avgSalary: "$55K" },
  { role: "QA Engineer", category: "Technology", keywords: ["test automation", "Selenium", "Cypress", "API testing", "bug tracking", "CI/CD"], avgSalary: "$95K" },
  { role: "Mobile Developer", category: "Technology", keywords: ["React Native", "Swift", "Kotlin", "iOS", "Android", "app deployment"], avgSalary: "$115K" },
  { role: "Product Designer", category: "Design", keywords: ["Figma", "user flows", "design systems", "prototyping", "user testing"], avgSalary: "$115K" },
  { role: "Data Engineer", category: "Technology", keywords: ["ETL", "Spark", "Airflow", "SQL", "data warehousing", "Python"], avgSalary: "$130K" },
  { role: "Cybersecurity Analyst", category: "Technology", keywords: ["SIEM", "threat detection", "incident response", "firewalls", "penetration testing"], avgSalary: "$105K" },
  { role: "Cloud Architect", category: "Technology", keywords: ["AWS", "Azure", "GCP", "infrastructure design", "serverless", "cost optimization"], avgSalary: "$155K" },
  { role: "Technical Writer", category: "Technology", keywords: ["documentation", "API docs", "Markdown", "user guides", "content management"], avgSalary: "$75K" },
  { role: "Pharmacy Technician", category: "Healthcare", keywords: ["prescription processing", "inventory", "patient counseling", "compounding"], avgSalary: "$38K" },
  { role: "Real Estate Agent", category: "Sales", keywords: ["MLS", "property listings", "client management", "negotiation", "market analysis"], avgSalary: "$50K" },
  { role: "Logistics Coordinator", category: "Operations", keywords: ["supply chain", "shipping", "inventory management", "ERP", "vendor management"], avgSalary: "$50K" },
  { role: "Executive Assistant", category: "Administration", keywords: ["calendar management", "travel coordination", "Microsoft Office", "communication"], avgSalary: "$55K" },
  { role: "Social Media Manager", category: "Marketing", keywords: ["content creation", "analytics", "community management", "scheduling tools", "engagement"], avgSalary: "$58K" },
  { role: "Dental Hygienist", category: "Healthcare", keywords: ["patient care", "periodontal assessment", "X-rays", "oral health education"], avgSalary: "$80K" },
  { role: "Mechanical Engineer", category: "Engineering", keywords: ["CAD", "SolidWorks", "thermodynamics", "prototyping", "manufacturing"], avgSalary: "$90K" },
  { role: "Civil Engineer", category: "Engineering", keywords: ["AutoCAD", "structural analysis", "project management", "surveying", "environmental compliance"], avgSalary: "$85K" },
  { role: "Web Developer", category: "Technology", keywords: ["HTML", "CSS", "JavaScript", "WordPress", "responsive design", "SEO"], avgSalary: "$75K" },
  { role: "Paralegal", category: "Legal", keywords: ["legal research", "document drafting", "case management", "litigation support", "compliance"], avgSalary: "$55K" },
  { role: "Insurance Agent", category: "Finance", keywords: ["policy analysis", "underwriting", "client relations", "risk assessment", "claims"], avgSalary: "$55K" },
  { role: "Chef", category: "Hospitality", keywords: ["menu development", "food safety", "kitchen management", "inventory control", "team leadership"], avgSalary: "$55K" },
  { role: "Veterinary Technician", category: "Healthcare", keywords: ["animal care", "lab work", "anesthesia monitoring", "client education"], avgSalary: "$38K" },
  { role: "Supply Chain Manager", category: "Operations", keywords: ["procurement", "logistics", "ERP", "vendor management", "cost reduction", "forecasting"], avgSalary: "$95K" },
];

export const resumeRoleEntries: ResumeRoleEntry[] = ROLES.map(r => ({
  slug: `resume-for-${r.role.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  title: `Resume for ${r.role} — 2026 Guide + ATS Tips`,
  type: "resume-role" as const,
  role: r.role,
  category: r.category,
  keywords: r.keywords,
  avgSalary: r.avgSalary,
}));

// ─── RESUME SCORES ──────────────────────────────────────────
const SCORES = [20, 30, 40, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
function scoreBucket(s: number): "poor" | "fair" | "good" | "excellent" {
  if (s < 40) return "poor";
  if (s < 60) return "fair";
  if (s < 80) return "good";
  return "excellent";
}

export const resumeScoreEntries: ResumeScoreEntry[] = SCORES.map(s => ({
  slug: `resume-score-${s}`,
  title: `Resume Score ${s}/100 — What It Means & How to Improve`,
  type: "resume-score" as const,
  score: s,
  bucket: scoreBucket(s),
}));

// ─── EXPERIENCE LEVELS ──────────────────────────────────────
const EXPERIENCE_LEVELS: { level: string; yearsRange: string; slug: string }[] = [
  { level: "No Experience", yearsRange: "0 years", slug: "resume-with-no-experience" },
  { level: "Freshers", yearsRange: "0-1 years", slug: "resume-for-freshers" },
  { level: "1 Year Experience", yearsRange: "1 year", slug: "resume-for-1-year-experience" },
  { level: "2 Years Experience", yearsRange: "2 years", slug: "resume-for-2-years-experience" },
  { level: "3 Years Experience", yearsRange: "3 years", slug: "resume-for-3-years-experience" },
  { level: "5 Years Experience", yearsRange: "5 years", slug: "resume-for-5-years-experience" },
  { level: "10 Years Experience", yearsRange: "10+ years", slug: "resume-for-10-years-experience" },
  { level: "Career Change", yearsRange: "varies", slug: "resume-for-career-change" },
  { level: "Return to Work", yearsRange: "gap", slug: "resume-after-career-gap" },
];

export const resumeExperienceEntries: ResumeExperienceEntry[] = EXPERIENCE_LEVELS.map(e => ({
  slug: e.slug,
  title: `Resume for ${e.level} — Tips, Templates & Examples (2026)`,
  type: "resume-experience" as const,
  level: e.level,
  yearsRange: e.yearsRange,
}));

// ─── TARGET COMPANIES ───────────────────────────────────────
const COMPANIES: { company: string; industry: string }[] = [
  { company: "Google", industry: "Technology" },
  { company: "Amazon", industry: "Technology" },
  { company: "Apple", industry: "Technology" },
  { company: "Microsoft", industry: "Technology" },
  { company: "Meta", industry: "Technology" },
  { company: "Netflix", industry: "Entertainment" },
  { company: "Tesla", industry: "Automotive" },
  { company: "Goldman Sachs", industry: "Finance" },
  { company: "JPMorgan", industry: "Finance" },
  { company: "McKinsey", industry: "Consulting" },
  { company: "Deloitte", industry: "Consulting" },
  { company: "Accenture", industry: "Consulting" },
  { company: "Nvidia", industry: "Technology" },
  { company: "Salesforce", industry: "Technology" },
  { company: "Adobe", industry: "Technology" },
  { company: "Uber", industry: "Technology" },
  { company: "Airbnb", industry: "Technology" },
  { company: "Stripe", industry: "Fintech" },
  { company: "SpaceX", industry: "Aerospace" },
  { company: "Johnson & Johnson", industry: "Healthcare" },
];

export const resumeCompanyEntries: ResumeCompanyEntry[] = COMPANIES.map(c => ({
  slug: `resume-for-${c.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-job`,
  title: `Resume for ${c.company} — What Recruiters Look For (2026)`,
  type: "resume-company" as const,
  company: c.company,
  industry: c.industry,
}));

// ─── PROBLEM-BASED PAGES ────────────────────────────────────
const PROBLEMS: { slug: string; problem: string; title: string }[] = [
  { slug: "why-my-resume-is-not-getting-calls", problem: "not getting calls", title: "Why Your Resume Isn't Getting Calls — 7 Fixes That Work" },
  { slug: "how-to-improve-resume-fast", problem: "improve quickly", title: "How to Improve Your Resume Fast — Quick Wins in 15 Minutes" },
  { slug: "resume-ats-rejected", problem: "ATS rejection", title: "Resume Keeps Getting Rejected by ATS? Here's Why & How to Fix It" },
  { slug: "resume-too-long", problem: "too long", title: "Is Your Resume Too Long? Here's the Ideal Length (2026)" },
  { slug: "resume-gaps-explained", problem: "employment gaps", title: "How to Explain Resume Gaps — Templates & Examples" },
  { slug: "resume-no-work-experience", problem: "no experience", title: "How to Write a Resume with No Work Experience" },
  { slug: "resume-keywords-missing", problem: "missing keywords", title: "Missing Keywords on Your Resume? How to Find & Add Them" },
  { slug: "resume-weak-summary", problem: "weak summary", title: "Your Resume Summary Is Weak — Here's How to Fix It" },
  { slug: "resume-vs-cv-difference", problem: "resume vs CV", title: "Resume vs CV — What's the Difference & Which Do You Need?" },
  { slug: "how-to-tailor-resume-for-job", problem: "tailoring", title: "How to Tailor Your Resume for Each Job Application" },
  { slug: "resume-format-best-2026", problem: "format choice", title: "Best Resume Format for 2026 — Chronological vs Functional vs Hybrid" },
  { slug: "how-many-pages-should-resume-be", problem: "page count", title: "How Many Pages Should Your Resume Be? (Definitive Answer)" },
  { slug: "resume-skills-section-guide", problem: "skills section", title: "Resume Skills Section — What to Include & What to Skip" },
  { slug: "resume-action-verbs-list", problem: "action verbs", title: "200+ Resume Action Verbs That Get Interviews (Categorized)" },
  { slug: "should-i-include-photo-on-resume", problem: "photo on resume", title: "Should You Put a Photo on Your Resume? (2026 Guide)" },
];

export const resumeProblemEntries: ResumeProblemEntry[] = PROBLEMS.map(p => ({
  slug: p.slug,
  title: p.title,
  type: "resume-problem" as const,
  problem: p.problem,
}));

// ─── CAREER DECISION PAGES ──────────────────────────────────
export interface CareerDecisionEntry {
  slug: string;
  title: string;
  type: "career-decision";
  topic: string;
}

const DECISIONS: { slug: string; title: string; topic: string }[] = [
  { slug: "should-i-change-jobs", topic: "changing jobs", title: "Should I Change Jobs? A Data-Driven Framework to Decide" },
  { slug: "is-my-salary-good", topic: "salary evaluation", title: "Is My Salary Good? How to Know If You're Paid Fairly" },
  { slug: "should-i-negotiate-salary", topic: "salary negotiation", title: "Should I Negotiate My Salary? (Yes — Here's How)" },
  { slug: "should-i-move-for-a-job", topic: "relocation", title: "Should I Relocate for a Job? Cost-of-Living Calculator" },
  { slug: "should-i-take-a-pay-cut", topic: "pay cut", title: "Should I Take a Pay Cut for a Better Job? Decision Guide" },
  { slug: "is-remote-work-worth-less-pay", topic: "remote work tradeoff", title: "Is Remote Work Worth Less Pay? The Real Math" },
  { slug: "when-to-leave-your-job", topic: "leaving job", title: "When to Leave Your Job — 10 Signs It's Time" },
  { slug: "should-i-go-freelance", topic: "freelancing", title: "Should I Go Freelance? Income, Tax & Lifestyle Comparison" },
  { slug: "how-to-ask-for-a-raise", topic: "asking for raise", title: "How to Ask for a Raise — Script, Timing & Data to Use" },
  { slug: "startup-vs-big-company", topic: "company size", title: "Startup vs Big Company — Which Is Better for Your Career?" },
];

export const careerDecisionEntries: CareerDecisionEntry[] = DECISIONS.map(d => ({
  slug: d.slug,
  title: d.title,
  type: "career-decision" as const,
  topic: d.topic,
}));

// ─── ALL ENTRIES ─────────────────────────────────────────────
export type ResumeCareerEntry = ResumeRoleEntry | ResumeScoreEntry | ResumeExperienceEntry | ResumeCompanyEntry | ResumeProblemEntry | CareerDecisionEntry;

export const allResumeCareerEntries: ResumeCareerEntry[] = [
  ...resumeRoleEntries,
  ...resumeScoreEntries,
  ...resumeExperienceEntries,
  ...resumeCompanyEntries,
  ...resumeProblemEntries,
  ...careerDecisionEntries,
];

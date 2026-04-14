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
const ROLES: { role: string; category: string; keywords: string[]; avgSalary: string; title: string }[] = [
  { role: "Software Engineer", category: "Technology", keywords: ["Python", "JavaScript", "React", "AWS", "Git", "CI/CD", "Agile"], avgSalary: "$120K", title: "Resume for Software Engineers (2026 Guide + ATS Tips)" },
  { role: "Product Manager", category: "Technology", keywords: ["roadmap", "user research", "A/B testing", "Agile", "stakeholder management", "PRD"], avgSalary: "$135K", title: "Resume for Product Managers — What Actually Gets Interviews" },
  { role: "Data Scientist", category: "Technology", keywords: ["Python", "SQL", "machine learning", "TensorFlow", "statistics", "data visualization"], avgSalary: "$130K", title: "Data Scientist Resume That Passes ATS (2026 Template)" },
  { role: "Data Analyst", category: "Technology", keywords: ["SQL", "Excel", "Tableau", "Python", "data visualization", "reporting"], avgSalary: "$75K", title: "Data Analyst Resume — Skills, Keywords & Examples" },
  { role: "UX Designer", category: "Design", keywords: ["Figma", "user research", "wireframing", "prototyping", "usability testing", "design systems"], avgSalary: "$105K", title: "UX Designer Resume That Stands Out (Portfolio + Keywords)" },
  { role: "Frontend Developer", category: "Technology", keywords: ["React", "TypeScript", "CSS", "HTML", "Next.js", "responsive design"], avgSalary: "$110K", title: "Frontend Developer Resume — React, TypeScript & More" },
  { role: "Backend Developer", category: "Technology", keywords: ["Node.js", "Python", "APIs", "databases", "microservices", "Docker"], avgSalary: "$115K", title: "Backend Developer Resume — APIs, Python & System Design" },
  { role: "Full Stack Developer", category: "Technology", keywords: ["React", "Node.js", "MongoDB", "TypeScript", "REST APIs", "Docker"], avgSalary: "$118K", title: "Full Stack Developer Resume (What Recruiters Actually Want)" },
  { role: "DevOps Engineer", category: "Technology", keywords: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "monitoring"], avgSalary: "$125K", title: "DevOps Engineer Resume — Cloud, CI/CD & Infrastructure" },
  { role: "Machine Learning Engineer", category: "Technology", keywords: ["Python", "TensorFlow", "PyTorch", "MLOps", "deep learning", "NLP"], avgSalary: "$145K", title: "ML Engineer Resume — Models, MLOps & Real Impact" },
  { role: "Project Manager", category: "Management", keywords: ["PMP", "Agile", "Scrum", "budgeting", "risk management", "stakeholder communication"], avgSalary: "$95K", title: "Project Manager Resume — PMP, Agile & Leadership" },
  { role: "Marketing Manager", category: "Marketing", keywords: ["SEO", "content strategy", "Google Analytics", "social media", "campaign management"], avgSalary: "$85K", title: "Marketing Manager Resume That Gets Callbacks (2026)" },
  { role: "Sales Representative", category: "Sales", keywords: ["CRM", "lead generation", "cold calling", "negotiation", "pipeline management"], avgSalary: "$65K", title: "Sales Rep Resume — Quota, CRM & Closing Skills" },
  { role: "Graphic Designer", category: "Design", keywords: ["Adobe Creative Suite", "Figma", "typography", "branding", "layout design"], avgSalary: "$60K", title: "Graphic Designer Resume — Portfolio, Tools & Layout Tips" },
  { role: "Financial Analyst", category: "Finance", keywords: ["financial modeling", "Excel", "forecasting", "budgeting", "valuation", "SQL"], avgSalary: "$80K", title: "Financial Analyst Resume — Modeling, Excel & Valuation" },
  { role: "Accountant", category: "Finance", keywords: ["GAAP", "QuickBooks", "tax preparation", "audit", "reconciliation", "Excel"], avgSalary: "$65K", title: "Accountant Resume — GAAP, CPA & Tax Experience" },
  { role: "Registered Nurse", category: "Healthcare", keywords: ["patient care", "EMR", "medication administration", "vital signs", "BLS/ACLS"], avgSalary: "$80K", title: "Registered Nurse Resume — Clinical Skills & Certifications" },
  { role: "Medical Assistant", category: "Healthcare", keywords: ["patient intake", "vitals", "EHR", "phlebotomy", "scheduling"], avgSalary: "$38K", title: "Medical Assistant Resume — Clinical + Admin Skills" },
  { role: "Teacher", category: "Education", keywords: ["curriculum development", "classroom management", "differentiated instruction", "assessment"], avgSalary: "$55K", title: "Teacher Resume That Gets You Hired (K-12 & Beyond)" },
  { role: "HR Generalist", category: "Human Resources", keywords: ["recruiting", "onboarding", "employee relations", "HRIS", "compliance", "benefits"], avgSalary: "$65K", title: "HR Generalist Resume — Recruiting, Compliance & HRIS" },
  { role: "Customer Service Representative", category: "Support", keywords: ["CRM", "conflict resolution", "ticketing systems", "communication", "problem-solving"], avgSalary: "$38K", title: "Customer Service Resume — Communication & Problem-Solving" },
  { role: "Operations Manager", category: "Management", keywords: ["process improvement", "supply chain", "budgeting", "KPIs", "team leadership"], avgSalary: "$85K", title: "Operations Manager Resume — KPIs, Process & Leadership" },
  { role: "Business Analyst", category: "Technology", keywords: ["requirements gathering", "SQL", "Jira", "process mapping", "stakeholder management"], avgSalary: "$85K", title: "Business Analyst Resume — Requirements, SQL & Stakeholders" },
  { role: "Content Marketing Manager", category: "Marketing", keywords: ["content strategy", "SEO", "copywriting", "analytics", "editorial calendar"], avgSalary: "$80K", title: "Content Marketing Resume — SEO, Strategy & Analytics" },
  { role: "Digital Marketing Manager", category: "Marketing", keywords: ["PPC", "SEO", "social media", "Google Ads", "email marketing", "analytics"], avgSalary: "$78K", title: "Digital Marketing Resume — PPC, SEO & Conversion" },
  { role: "Recruiter", category: "Human Resources", keywords: ["sourcing", "ATS", "interviewing", "employer branding", "LinkedIn Recruiter"], avgSalary: "$65K", title: "Recruiter Resume — Sourcing, ATS & Employer Branding" },
  { role: "Construction Manager", category: "Construction", keywords: ["project scheduling", "budgeting", "OSHA", "blueprint reading", "subcontractor management"], avgSalary: "$95K", title: "Construction Manager Resume — OSHA, Scheduling & Budgets" },
  { role: "Electrician", category: "Trades", keywords: ["NEC code", "troubleshooting", "wiring", "blueprints", "safety protocols"], avgSalary: "$60K", title: "Electrician Resume — NEC Code, Troubleshooting & Safety" },
  { role: "Store Manager", category: "Retail", keywords: ["inventory management", "P&L", "team leadership", "customer service", "visual merchandising"], avgSalary: "$55K", title: "Store Manager Resume — P&L, Inventory & Team Leadership" },
  { role: "QA Engineer", category: "Technology", keywords: ["test automation", "Selenium", "Cypress", "API testing", "bug tracking", "CI/CD"], avgSalary: "$95K", title: "QA Engineer Resume — Automation, Cypress & API Testing" },
  { role: "Mobile Developer", category: "Technology", keywords: ["React Native", "Swift", "Kotlin", "iOS", "Android", "app deployment"], avgSalary: "$115K", title: "Mobile Developer Resume — iOS, Android & React Native" },
  { role: "Product Designer", category: "Design", keywords: ["Figma", "user flows", "design systems", "prototyping", "user testing"], avgSalary: "$115K", title: "Product Designer Resume — Figma, Systems & User Research" },
  { role: "Data Engineer", category: "Technology", keywords: ["ETL", "Spark", "Airflow", "SQL", "data warehousing", "Python"], avgSalary: "$130K", title: "Data Engineer Resume — ETL, Spark & Data Pipelines" },
  { role: "Cybersecurity Analyst", category: "Technology", keywords: ["SIEM", "threat detection", "incident response", "firewalls", "penetration testing"], avgSalary: "$105K", title: "Cybersecurity Resume — SIEM, Incident Response & Compliance" },
  { role: "Cloud Architect", category: "Technology", keywords: ["AWS", "Azure", "GCP", "infrastructure design", "serverless", "cost optimization"], avgSalary: "$155K", title: "Cloud Architect Resume — AWS, Azure & Infrastructure Design" },
  { role: "Technical Writer", category: "Technology", keywords: ["documentation", "API docs", "Markdown", "user guides", "content management"], avgSalary: "$75K", title: "Technical Writer Resume — API Docs, Guides & Content" },
  { role: "Pharmacy Technician", category: "Healthcare", keywords: ["prescription processing", "inventory", "patient counseling", "compounding"], avgSalary: "$38K", title: "Pharmacy Tech Resume — Prescriptions, Inventory & Compliance" },
  { role: "Real Estate Agent", category: "Sales", keywords: ["MLS", "property listings", "client management", "negotiation", "market analysis"], avgSalary: "$50K", title: "Real Estate Agent Resume — Listings, Sales & Negotiation" },
  { role: "Logistics Coordinator", category: "Operations", keywords: ["supply chain", "shipping", "inventory management", "ERP", "vendor management"], avgSalary: "$50K", title: "Logistics Resume — Supply Chain, ERP & Vendor Management" },
  { role: "Executive Assistant", category: "Administration", keywords: ["calendar management", "travel coordination", "Microsoft Office", "communication"], avgSalary: "$55K", title: "Executive Assistant Resume — Organization & Communication" },
  { role: "Social Media Manager", category: "Marketing", keywords: ["content creation", "analytics", "community management", "scheduling tools", "engagement"], avgSalary: "$58K", title: "Social Media Manager Resume — Content, Analytics & Growth" },
  { role: "Dental Hygienist", category: "Healthcare", keywords: ["patient care", "periodontal assessment", "X-rays", "oral health education"], avgSalary: "$80K", title: "Dental Hygienist Resume — Clinical Skills & Patient Care" },
  { role: "Mechanical Engineer", category: "Engineering", keywords: ["CAD", "SolidWorks", "thermodynamics", "prototyping", "manufacturing"], avgSalary: "$90K", title: "Mechanical Engineer Resume — CAD, SolidWorks & Design" },
  { role: "Civil Engineer", category: "Engineering", keywords: ["AutoCAD", "structural analysis", "project management", "surveying", "environmental compliance"], avgSalary: "$85K", title: "Civil Engineer Resume — AutoCAD, Structural & Compliance" },
  { role: "Web Developer", category: "Technology", keywords: ["HTML", "CSS", "JavaScript", "WordPress", "responsive design", "SEO"], avgSalary: "$75K", title: "Web Developer Resume — HTML, CSS, JS & Responsive Design" },
  { role: "Paralegal", category: "Legal", keywords: ["legal research", "document drafting", "case management", "litigation support", "compliance"], avgSalary: "$55K", title: "Paralegal Resume — Legal Research, Drafting & Litigation" },
  { role: "Insurance Agent", category: "Finance", keywords: ["policy analysis", "underwriting", "client relations", "risk assessment", "claims"], avgSalary: "$55K", title: "Insurance Agent Resume — Policies, Underwriting & Claims" },
  { role: "Chef", category: "Hospitality", keywords: ["menu development", "food safety", "kitchen management", "inventory control", "team leadership"], avgSalary: "$55K", title: "Chef Resume — Menu Development, Kitchen Ops & Safety" },
  { role: "Veterinary Technician", category: "Healthcare", keywords: ["animal care", "lab work", "anesthesia monitoring", "client education"], avgSalary: "$38K", title: "Vet Tech Resume — Animal Care, Lab Work & Monitoring" },
  { role: "Supply Chain Manager", category: "Operations", keywords: ["procurement", "logistics", "ERP", "vendor management", "cost reduction", "forecasting"], avgSalary: "$95K", title: "Supply Chain Manager Resume — Procurement, ERP & Cost Savings" },
];

export const resumeRoleEntries: ResumeRoleEntry[] = ROLES.map(r => ({
  slug: `resume-for-${r.role.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  title: r.title,
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

function scoreTitle(s: number): string {
  if (s <= 30) return `Resume Score ${s}/100 — Why Recruiters Aren't Calling`;
  if (s <= 50) return `Resume Score ${s} — Good or Bad? (Honest Breakdown)`;
  if (s === 55) return `Resume Score 55 — Almost There. Here's What's Missing`;
  if (s === 60) return `Resume Score 60 — Is It Enough? (Real Answer)`;
  if (s === 65) return `Resume Score 65 — Close to Good. Quick Fixes Inside`;
  if (s === 70) return `Is a Resume Score of 70 Good? (70 vs 90 Explained)`;
  if (s === 75) return `Resume Score 75 — Above Average but Not Great Yet`;
  if (s === 80) return `Resume Score 80 — You're Ahead of 80% of Applicants`;
  if (s === 85) return `Resume Score 85/100 — Strong. Here's How to Hit 90+`;
  if (s === 90) return `Resume Score 90 — You're in the Top 10% (Keep It There)`;
  return `Resume Score ${s}/100 — What It Really Means`;
}

export const resumeScoreEntries: ResumeScoreEntry[] = SCORES.map(s => ({
  slug: `resume-score-${s}`,
  title: scoreTitle(s),
  type: "resume-score" as const,
  score: s,
  bucket: scoreBucket(s),
}));

// ─── EXPERIENCE LEVELS ──────────────────────────────────────
const EXPERIENCE_LEVELS: { level: string; yearsRange: string; slug: string; title: string }[] = [
  { level: "No Experience", yearsRange: "0 years", slug: "resume-with-no-experience", title: "How to Write a Resume with No Experience (It's Possible)" },
  { level: "Freshers", yearsRange: "0-1 years", slug: "resume-for-freshers", title: "Resume for Freshers — First Job? Start Here" },
  { level: "1 Year Experience", yearsRange: "1 year", slug: "resume-for-1-year-experience", title: "Resume with 1 Year Experience — What to Highlight" },
  { level: "2 Years Experience", yearsRange: "2 years", slug: "resume-for-2-years-experience", title: "Resume with 2 Years Experience — Beyond Entry Level" },
  { level: "3 Years Experience", yearsRange: "3 years", slug: "resume-for-3-years-experience", title: "Resume with 3 Years Experience — Show Growth, Not Just Tasks" },
  { level: "5 Years Experience", yearsRange: "5 years", slug: "resume-for-5-years-experience", title: "Resume with 5 Years Experience — Mid-Career Power Moves" },
  { level: "10 Years Experience", yearsRange: "10+ years", slug: "resume-for-10-years-experience", title: "Resume with 10+ Years — What to Keep, What to Cut" },
  { level: "Career Change", yearsRange: "varies", slug: "resume-for-career-change", title: "Career Change Resume — How to Reframe Your Experience" },
  { level: "Return to Work", yearsRange: "gap", slug: "resume-after-career-gap", title: "Resume After a Career Gap — How to Explain It (Confidently)" },
];

export const resumeExperienceEntries: ResumeExperienceEntry[] = EXPERIENCE_LEVELS.map(e => ({
  slug: e.slug,
  title: e.title,
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
  title: `Resume for ${c.company} — What Their Recruiters Actually Look For`,
  type: "resume-company" as const,
  company: c.company,
  industry: c.industry,
}));

// ─── PROBLEM-BASED PAGES ────────────────────────────────────
const PROBLEMS: { slug: string; problem: string; title: string }[] = [
  { slug: "why-my-resume-is-not-getting-calls", problem: "not getting calls", title: "Why Your Resume Isn't Getting Interviews (Fix in 10 Minutes)" },
  { slug: "how-to-improve-resume-fast", problem: "improve quickly", title: "How to Fix Your Resume Fast (Free Tool Inside)" },
  { slug: "resume-ats-rejected", problem: "ATS rejection", title: "Resume Not Passing ATS? Here's the Real Fix" },
  { slug: "resume-too-long", problem: "too long", title: "Is Your Resume Too Long? The Honest Page Count Answer" },
  { slug: "resume-gaps-explained", problem: "employment gaps", title: "How to Explain Resume Gaps (Without Killing Your Chances)" },
  { slug: "resume-no-work-experience", problem: "no experience", title: "Resume with Zero Experience — Yes, You Can Still Get Hired" },
  { slug: "resume-keywords-missing", problem: "missing keywords", title: "Missing Resume Keywords? How to Find & Add the Right Ones" },
  { slug: "resume-weak-summary", problem: "weak summary", title: "Your Resume Summary Is Costing You Interviews — Fix It Now" },
  { slug: "resume-vs-cv-difference", problem: "resume vs CV", title: "Resume vs CV — Which One Do You Actually Need?" },
  { slug: "how-to-tailor-resume-for-job", problem: "tailoring", title: "How to Match Your Resume to a Job Description (Step-by-Step)" },
  { slug: "resume-format-best-2026", problem: "format choice", title: "Best Resume Format for 2026 — The Definitive Comparison" },
  { slug: "how-many-pages-should-resume-be", problem: "page count", title: "How Many Pages Should Your Resume Be? (Definitive Answer)" },
  { slug: "resume-skills-section-guide", problem: "skills section", title: "Resume Skills Section — What to Include & What to Skip" },
  { slug: "resume-action-verbs-list", problem: "action verbs", title: "200+ Resume Action Verbs That Actually Get Interviews" },
  { slug: "should-i-include-photo-on-resume", problem: "photo on resume", title: "Photo on Resume — Yes or No? (The Real Answer for 2026)" },
  { slug: "resume-not-shortlisted", problem: "not shortlisted", title: "Resume Not Getting Shortlisted? 7 Reasons & Quick Fixes" },
  { slug: "resume-mistakes-to-avoid", problem: "common mistakes", title: "Resume Mistakes That Kill Your Application (Avoid These)" },
  { slug: "bad-resume-vs-good-resume", problem: "bad vs good", title: "Bad Resume vs Good Resume — See the Difference (Examples)" },
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
  { slug: "should-i-change-jobs", topic: "changing jobs", title: "Should You Change Jobs for More Salary? (Real Answer)" },
  { slug: "is-my-salary-good", topic: "salary evaluation", title: "Is My Salary Good? How to Know in 30 Seconds" },
  { slug: "should-i-negotiate-salary", topic: "salary negotiation", title: "Should I Negotiate My Salary? (Yes — Here's the Script)" },
  { slug: "should-i-move-for-a-job", topic: "relocation", title: "Is It Worth Moving for a Job? (Calculator Inside)" },
  { slug: "should-i-take-a-pay-cut", topic: "pay cut", title: "Should You Take a Pay Cut? The Smart Way to Decide" },
  { slug: "is-remote-work-worth-less-pay", topic: "remote work tradeoff", title: "Is Remote Work Worth Less Pay? (The Real Math)" },
  { slug: "when-to-leave-your-job", topic: "leaving job", title: "When to Leave Your Job — 10 Signs It's Time" },
  { slug: "should-i-go-freelance", topic: "freelancing", title: "Should I Go Freelance? Income, Tax & Lifestyle Compared" },
  { slug: "how-to-ask-for-a-raise", topic: "asking for raise", title: "How to Ask for a Raise — Timing, Script & Data to Use" },
  { slug: "startup-vs-big-company", topic: "company size", title: "Startup vs Big Company — Which Is Actually Better?" },
  { slug: "how-much-salary-is-enough", topic: "salary sufficiency", title: "How Much Salary Is Enough? (Truth Explained by Numbers)" },
  { slug: "job-offer-comparison", topic: "comparing offers", title: "Comparing Two Job Offers? Here's a Framework That Works" },
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

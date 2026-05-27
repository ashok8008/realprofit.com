// Top 20 priority job titles (per pSEO plan §3) with BLS occupation codes.
export interface JobTitle {
  slug: string;
  title: string;
  /** BLS Standard Occupational Classification code */
  socCode: string;
  category: "tech" | "healthcare" | "creative" | "business" | "trades" | "education" | "legal" | "finance";
  description: string;
  /** Years of education typically required */
  educationYears: number;
  /** BLS-projected 10-year growth percentage (e.g. 22 = +22%) */
  growthPct: number;
  /** Plain-language entry path */
  entryPath: string;
  /** Daily activities — used in career guide template */
  dailyTasks: string[];
}

export const JOBS: JobTitle[] = [
  {
    slug: "software-engineer", title: "Software Engineer", socCode: "15-1252",
    category: "tech", educationYears: 4, growthPct: 25,
    description: "Software engineers design, build and maintain the software applications that power modern businesses — from web platforms to mobile apps to internal tools.",
    entryPath: "Most software engineers hold a bachelor's degree in computer science. Bootcamps and self-taught paths are increasingly accepted for junior roles.",
    dailyTasks: ["Write and review code", "Design system architecture", "Debug production issues", "Collaborate with product and design", "Run code reviews"],
  },
  {
    slug: "registered-nurse", title: "Registered Nurse", socCode: "29-1141",
    category: "healthcare", educationYears: 4, growthPct: 6,
    description: "Registered nurses provide direct patient care, administer treatments, and coordinate with doctors across hospitals, clinics, and home-health settings.",
    entryPath: "RNs typically hold either an Associate's Degree in Nursing (ADN) or a Bachelor of Science in Nursing (BSN), plus state licensure via the NCLEX-RN exam.",
    dailyTasks: ["Administer medications", "Monitor patient vitals", "Document patient care", "Coordinate with physicians", "Educate patients on conditions"],
  },
  {
    slug: "teacher", title: "Teacher", socCode: "25-2021",
    category: "education", educationYears: 4, growthPct: 1,
    description: "K-12 teachers educate students in core subjects, develop lesson plans, and prepare the next generation for high school, college and careers.",
    entryPath: "A bachelor's degree plus state teaching certification is required. Many states also require a master's degree within 5 years.",
    dailyTasks: ["Plan and deliver lessons", "Grade assignments", "Meet with parents", "Attend faculty meetings", "Develop curriculum"],
  },
  {
    slug: "accountant", title: "Accountant", socCode: "13-2011",
    category: "finance", educationYears: 4, growthPct: 4,
    description: "Accountants prepare and review financial records, ensure tax compliance, and advise businesses on financial planning.",
    entryPath: "A bachelor's in accounting is standard. Becoming a CPA requires additional credit hours and a state licensing exam.",
    dailyTasks: ["Prepare financial statements", "File tax returns", "Audit accounts", "Reconcile records", "Advise on tax strategy"],
  },
  {
    slug: "marketing-manager", title: "Marketing Manager", socCode: "11-2021",
    category: "business", educationYears: 4, growthPct: 10,
    description: "Marketing managers create strategies to grow customer acquisition, oversee campaigns, and lead brand positioning.",
    entryPath: "A bachelor's in marketing, business, or communications is standard. Most managers have 5+ years of marketing experience.",
    dailyTasks: ["Develop marketing strategy", "Manage campaign budgets", "Analyze performance metrics", "Lead marketing team", "Brief creative agencies"],
  },
  {
    slug: "data-analyst", title: "Data Analyst", socCode: "15-2051",
    category: "tech", educationYears: 4, growthPct: 23,
    description: "Data analysts collect, clean and interpret data to help businesses make smarter decisions across product, marketing, finance and operations.",
    entryPath: "A bachelor's in statistics, computer science, math or economics is most common. Bootcamps and self-taught paths via SQL + Python are viable.",
    dailyTasks: ["Build SQL queries", "Create dashboards", "Run A/B tests", "Present findings to stakeholders", "Clean and validate data"],
  },
  {
    slug: "product-manager", title: "Product Manager", socCode: "11-2021",
    category: "business", educationYears: 4, growthPct: 15,
    description: "Product managers define what gets built, why, and for whom — sitting at the intersection of engineering, design, and business.",
    entryPath: "There's no fixed path. Many PMs come from engineering, design, consulting or marketing backgrounds. An MBA helps but isn't required.",
    dailyTasks: ["Write product requirements", "Run user interviews", "Prioritize roadmap", "Coordinate with engineering and design", "Track product metrics"],
  },
  {
    slug: "graphic-designer", title: "Graphic Designer", socCode: "27-1024",
    category: "creative", educationYears: 4, growthPct: 3,
    description: "Graphic designers create visual content for print, web, and brand identity — from logos to social media to marketing materials.",
    entryPath: "A bachelor's in graphic design or related field is common. A strong portfolio matters more than a degree for many employers.",
    dailyTasks: ["Design layouts and graphics", "Develop brand guidelines", "Collaborate with marketing teams", "Refine designs based on feedback", "Prepare files for print/web"],
  },
  {
    slug: "financial-advisor", title: "Financial Advisor", socCode: "13-2052",
    category: "finance", educationYears: 4, growthPct: 13,
    description: "Financial advisors help individuals plan for retirement, manage investments, and make tax-efficient financial decisions.",
    entryPath: "A bachelor's in finance, economics or business is standard. Most advisors hold Series 7 / Series 65 licenses and many pursue the CFP certification.",
    dailyTasks: ["Meet with clients", "Build financial plans", "Review portfolios", "Research investment options", "Maintain client records"],
  },
  {
    slug: "sales-manager", title: "Sales Manager", socCode: "11-2022",
    category: "business", educationYears: 4, growthPct: 4,
    description: "Sales managers lead sales teams, set quotas, and own revenue performance.",
    entryPath: "Most sales managers worked their way up as individual contributors. A bachelor's in business or related field is typical.",
    dailyTasks: ["Coach reps", "Forecast pipeline", "Review deals", "Set quotas", "Report to executive leadership"],
  },
  {
    slug: "project-manager", title: "Project Manager", socCode: "13-1082",
    category: "business", educationYears: 4, growthPct: 7,
    description: "Project managers coordinate timelines, budgets and teams to deliver complex initiatives on time and on budget.",
    entryPath: "A bachelor's degree plus PMP certification is the most common path. Industry-specific experience helps significantly.",
    dailyTasks: ["Run standups", "Track project budgets", "Manage stakeholders", "Identify risks", "Document project status"],
  },
  {
    slug: "ux-designer", title: "UX Designer", socCode: "27-1024",
    category: "creative", educationYears: 4, growthPct: 8,
    description: "UX designers research user needs and design digital products that are easy and enjoyable to use.",
    entryPath: "A bachelor's in design or HCI is common. Strong portfolio + UX bootcamp completions are widely accepted.",
    dailyTasks: ["Conduct user research", "Build wireframes and prototypes", "Run usability tests", "Collaborate with engineering", "Define design systems"],
  },
  {
    slug: "dentist", title: "Dentist", socCode: "29-1021",
    category: "healthcare", educationYears: 8, growthPct: 5,
    description: "Dentists diagnose and treat oral health issues, perform procedures, and educate patients on preventive care.",
    entryPath: "Requires a bachelor's degree plus 4 years of dental school and state licensure.",
    dailyTasks: ["Perform exams and cleanings", "Diagnose oral conditions", "Perform procedures", "Educate patients", "Manage dental practice"],
  },
  {
    slug: "pharmacist", title: "Pharmacist", socCode: "29-1051",
    category: "healthcare", educationYears: 8, growthPct: 3,
    description: "Pharmacists dispense prescription medications, counsel patients, and ensure drug safety.",
    entryPath: "Requires a Doctor of Pharmacy (PharmD) degree (6–8 years post-high-school) and state licensure.",
    dailyTasks: ["Verify and dispense prescriptions", "Counsel patients", "Check drug interactions", "Manage pharmacy inventory", "Administer immunizations"],
  },
  {
    slug: "civil-engineer", title: "Civil Engineer", socCode: "17-2051",
    category: "tech", educationYears: 4, growthPct: 5,
    description: "Civil engineers design and oversee construction of roads, bridges, buildings, and other infrastructure.",
    entryPath: "Requires a bachelor's in civil engineering and an engineer-in-training (EIT) credential, then PE license after experience.",
    dailyTasks: ["Design infrastructure", "Review construction plans", "Conduct site inspections", "Calculate load and stress", "Prepare cost estimates"],
  },
  {
    slug: "electrician", title: "Electrician", socCode: "47-2111",
    category: "trades", educationYears: 2, growthPct: 11,
    description: "Electricians install, maintain, and repair electrical systems in homes, businesses and industrial sites.",
    entryPath: "Most electricians complete a 4–5 year apprenticeship combining classroom and on-the-job training. State licensure is required.",
    dailyTasks: ["Install wiring and outlets", "Troubleshoot electrical issues", "Read blueprints", "Ensure code compliance", "Repair existing systems"],
  },
  {
    slug: "plumber", title: "Plumber", socCode: "47-2152",
    category: "trades", educationYears: 2, growthPct: 6,
    description: "Plumbers install and repair water, drainage and gas piping systems in residential and commercial buildings.",
    entryPath: "Most plumbers complete a 4–5 year apprenticeship. State licensure required to operate independently.",
    dailyTasks: ["Install pipes and fixtures", "Diagnose leaks", "Repair plumbing systems", "Read blueprints", "Estimate jobs"],
  },
  {
    slug: "real-estate-agent", title: "Real Estate Agent", socCode: "41-9022",
    category: "business", educationYears: 1, growthPct: 3,
    description: "Real estate agents help clients buy, sell and rent residential and commercial properties.",
    entryPath: "Requires completion of pre-licensing coursework and passing the state real estate exam. No college degree required.",
    dailyTasks: ["List properties", "Show homes", "Negotiate offers", "Prepare contracts", "Market listings online"],
  },
  {
    slug: "freelance-writer", title: "Freelance Writer", socCode: "27-3043",
    category: "creative", educationYears: 4, growthPct: 4,
    description: "Freelance writers create content for blogs, magazines, brands and publications on a contract basis.",
    entryPath: "No formal requirements — a strong portfolio and consistent client outreach matter most. Many writers have backgrounds in journalism or English.",
    dailyTasks: ["Research and write articles", "Pitch new clients", "Edit and revise drafts", "Invoice clients", "Manage editorial calendars"],
  },
  {
    slug: "hr-manager", title: "HR Manager", socCode: "11-3121",
    category: "business", educationYears: 4, growthPct: 5,
    description: "HR managers oversee hiring, employee relations, compensation, and compliance for an organization.",
    entryPath: "A bachelor's in HR, business or psychology is typical. SHRM-CP or PHR certification is increasingly expected.",
    dailyTasks: ["Lead hiring efforts", "Handle employee relations", "Run performance reviews", "Manage benefits programs", "Ensure HR compliance"],
  },
];

export const getJob = (slug: string) => JOBS.find((j) => j.slug === slug);

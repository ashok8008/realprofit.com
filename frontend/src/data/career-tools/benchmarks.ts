// Expanded Salary Benchmark Data
// Sources: BLS, Glassdoor, LinkedIn Salary Insights, Levels.fyi, Payscale (aggregated estimates)

export interface SalaryBenchmark {
  role: string;
  keywords: string[];
  entryRange: [number, number];
  midRange: [number, number];
  seniorRange: [number, number];
  category: string;
}

export interface LocationMultiplier {
  state: string;
  multiplier: number;
  costOfLiving: number; // Index where 100 = national average
}

export const salaryBenchmarks: SalaryBenchmark[] = [
  // ==================== SOFTWARE & TECHNOLOGY ====================
  { role: "Software Engineer", keywords: ["software", "developer", "programmer", "engineer", "coding", "swe"], entryRange: [75000, 100000], midRange: [110000, 150000], seniorRange: [160000, 230000], category: "tech" },
  { role: "Frontend Developer", keywords: ["frontend", "front-end", "react", "angular", "vue", "ui developer"], entryRange: [65000, 90000], midRange: [95000, 135000], seniorRange: [145000, 195000], category: "tech" },
  { role: "Backend Developer", keywords: ["backend", "back-end", "api", "server", "node", "python", "java", "golang"], entryRange: [70000, 95000], midRange: [100000, 140000], seniorRange: [150000, 210000], category: "tech" },
  { role: "Full Stack Developer", keywords: ["full stack", "fullstack", "full-stack"], entryRange: [70000, 95000], midRange: [100000, 145000], seniorRange: [155000, 220000], category: "tech" },
  { role: "Mobile Developer", keywords: ["mobile", "ios", "android", "swift", "kotlin", "react native", "flutter"], entryRange: [70000, 95000], midRange: [100000, 145000], seniorRange: [155000, 215000], category: "tech" },
  { role: "Data Scientist", keywords: ["data scientist", "machine learning", "ml", "ai", "data science", "ml engineer"], entryRange: [85000, 115000], midRange: [125000, 170000], seniorRange: [180000, 260000], category: "tech" },
  { role: "Data Engineer", keywords: ["data engineer", "etl", "data pipeline", "spark", "airflow"], entryRange: [80000, 110000], midRange: [120000, 160000], seniorRange: [170000, 240000], category: "tech" },
  { role: "Data Analyst", keywords: ["data analyst", "analytics", "sql", "tableau", "power bi", "business intelligence", "bi analyst"], entryRange: [55000, 75000], midRange: [80000, 115000], seniorRange: [120000, 160000], category: "tech" },
  { role: "Machine Learning Engineer", keywords: ["machine learning engineer", "ml engineer", "deep learning"], entryRange: [95000, 125000], midRange: [135000, 180000], seniorRange: [190000, 280000], category: "tech" },
  { role: "Product Manager", keywords: ["product manager", "pm", "product owner", "product lead"], entryRange: [90000, 120000], midRange: [130000, 170000], seniorRange: [180000, 260000], category: "tech" },
  { role: "Technical Product Manager", keywords: ["technical product manager", "technical pm", "tpm"], entryRange: [100000, 130000], midRange: [140000, 185000], seniorRange: [195000, 280000], category: "tech" },
  { role: "UX Designer", keywords: ["ux", "user experience", "ui/ux", "ux designer", "product designer"], entryRange: [65000, 90000], midRange: [95000, 130000], seniorRange: [140000, 185000], category: "tech" },
  { role: "UI Designer", keywords: ["ui designer", "visual designer", "interface designer"], entryRange: [60000, 85000], midRange: [90000, 125000], seniorRange: [135000, 175000], category: "tech" },
  { role: "UX Researcher", keywords: ["ux researcher", "user researcher", "usability"], entryRange: [70000, 95000], midRange: [100000, 140000], seniorRange: [150000, 195000], category: "tech" },
  { role: "DevOps Engineer", keywords: ["devops", "site reliability", "sre", "infrastructure", "cloud", "platform engineer"], entryRange: [80000, 110000], midRange: [120000, 160000], seniorRange: [170000, 240000], category: "tech" },
  { role: "Cloud Engineer", keywords: ["cloud engineer", "aws", "azure", "gcp", "cloud architect"], entryRange: [85000, 115000], midRange: [125000, 165000], seniorRange: [175000, 250000], category: "tech" },
  { role: "Security Engineer", keywords: ["security engineer", "cybersecurity", "infosec", "application security"], entryRange: [85000, 115000], midRange: [125000, 165000], seniorRange: [175000, 250000], category: "tech" },
  { role: "QA Engineer", keywords: ["qa", "quality assurance", "testing", "test engineer", "sdet", "automation"], entryRange: [55000, 80000], midRange: [85000, 120000], seniorRange: [125000, 165000], category: "tech" },
  { role: "Technical Writer", keywords: ["technical writer", "documentation", "tech writer"], entryRange: [55000, 75000], midRange: [80000, 110000], seniorRange: [115000, 150000], category: "tech" },
  { role: "Engineering Manager", keywords: ["engineering manager", "dev manager", "tech lead manager"], entryRange: [130000, 170000], midRange: [180000, 230000], seniorRange: [240000, 350000], category: "tech" },
  { role: "Solutions Architect", keywords: ["solutions architect", "technical architect", "enterprise architect"], entryRange: [110000, 145000], midRange: [155000, 200000], seniorRange: [210000, 300000], category: "tech" },
  { role: "Database Administrator", keywords: ["dba", "database administrator", "database engineer"], entryRange: [65000, 90000], midRange: [95000, 130000], seniorRange: [140000, 185000], category: "tech" },
  { role: "Network Engineer", keywords: ["network engineer", "network administrator", "cisco"], entryRange: [60000, 85000], midRange: [90000, 125000], seniorRange: [135000, 175000], category: "tech" },
  { role: "Systems Administrator", keywords: ["sysadmin", "systems administrator", "it administrator"], entryRange: [55000, 75000], midRange: [80000, 110000], seniorRange: [115000, 150000], category: "tech" },
  { role: "IT Support Specialist", keywords: ["it support", "help desk", "technical support", "desktop support"], entryRange: [40000, 55000], midRange: [58000, 78000], seniorRange: [82000, 105000], category: "tech" },
  { role: "Scrum Master", keywords: ["scrum master", "agile coach", "agile"], entryRange: [75000, 100000], midRange: [105000, 140000], seniorRange: [145000, 190000], category: "tech" },
  
  // ==================== BUSINESS & FINANCE ====================
  { role: "Financial Analyst", keywords: ["financial analyst", "finance", "fp&a", "financial planning"], entryRange: [60000, 80000], midRange: [85000, 120000], seniorRange: [130000, 180000], category: "finance" },
  { role: "Investment Banking Analyst", keywords: ["investment banking", "ib analyst", "ibd"], entryRange: [100000, 130000], midRange: [150000, 250000], seniorRange: [300000, 500000], category: "finance" },
  { role: "Private Equity Associate", keywords: ["private equity", "pe", "buyout"], entryRange: [120000, 180000], midRange: [200000, 350000], seniorRange: [400000, 700000], category: "finance" },
  { role: "Venture Capital Associate", keywords: ["venture capital", "vc", "startup investing"], entryRange: [100000, 150000], midRange: [160000, 250000], seniorRange: [280000, 450000], category: "finance" },
  { role: "Accountant", keywords: ["accountant", "accounting", "cpa", "bookkeeper", "staff accountant"], entryRange: [50000, 68000], midRange: [72000, 98000], seniorRange: [105000, 145000], category: "finance" },
  { role: "Senior Accountant", keywords: ["senior accountant", "accounting supervisor"], entryRange: [65000, 85000], midRange: [90000, 115000], seniorRange: [120000, 155000], category: "finance" },
  { role: "Controller", keywords: ["controller", "financial controller", "assistant controller"], entryRange: [90000, 120000], midRange: [130000, 175000], seniorRange: [185000, 260000], category: "finance" },
  { role: "CFO", keywords: ["cfo", "chief financial officer"], entryRange: [150000, 220000], midRange: [250000, 400000], seniorRange: [450000, 800000], category: "finance" },
  { role: "Auditor", keywords: ["auditor", "internal auditor", "external auditor"], entryRange: [52000, 70000], midRange: [75000, 105000], seniorRange: [115000, 160000], category: "finance" },
  { role: "Tax Accountant", keywords: ["tax accountant", "tax specialist", "tax analyst"], entryRange: [55000, 75000], midRange: [80000, 110000], seniorRange: [120000, 165000], category: "finance" },
  { role: "Actuary", keywords: ["actuary", "actuarial"], entryRange: [70000, 95000], midRange: [105000, 150000], seniorRange: [165000, 250000], category: "finance" },
  { role: "Financial Advisor", keywords: ["financial advisor", "wealth manager", "financial planner"], entryRange: [50000, 75000], midRange: [85000, 140000], seniorRange: [160000, 300000], category: "finance" },
  { role: "Risk Analyst", keywords: ["risk analyst", "risk management", "credit risk"], entryRange: [60000, 85000], midRange: [90000, 130000], seniorRange: [140000, 200000], category: "finance" },
  { role: "Compliance Officer", keywords: ["compliance officer", "compliance analyst", "regulatory"], entryRange: [60000, 85000], midRange: [90000, 130000], seniorRange: [145000, 210000], category: "finance" },
  
  // ==================== MARKETING & SALES ====================
  { role: "Marketing Manager", keywords: ["marketing manager", "marketing director", "brand manager"], entryRange: [60000, 82000], midRange: [88000, 125000], seniorRange: [135000, 185000], category: "business" },
  { role: "Digital Marketing Manager", keywords: ["digital marketing", "online marketing", "growth marketing"], entryRange: [55000, 78000], midRange: [85000, 120000], seniorRange: [130000, 175000], category: "business" },
  { role: "SEO Specialist", keywords: ["seo", "search engine optimization", "organic search"], entryRange: [45000, 65000], midRange: [70000, 95000], seniorRange: [100000, 140000], category: "business" },
  { role: "Content Marketing Manager", keywords: ["content marketing", "content strategy", "content manager"], entryRange: [55000, 75000], midRange: [80000, 110000], seniorRange: [120000, 160000], category: "business" },
  { role: "Social Media Manager", keywords: ["social media", "social media manager", "community manager"], entryRange: [42000, 58000], midRange: [62000, 85000], seniorRange: [90000, 125000], category: "business" },
  { role: "Product Marketing Manager", keywords: ["product marketing", "pmm", "go-to-market"], entryRange: [80000, 110000], midRange: [120000, 160000], seniorRange: [170000, 230000], category: "business" },
  { role: "Sales Representative", keywords: ["sales", "account executive", "sales rep", "bdr", "sdr", "inside sales"], entryRange: [45000, 70000], midRange: [75000, 120000], seniorRange: [130000, 200000], category: "business" },
  { role: "Enterprise Sales", keywords: ["enterprise sales", "enterprise account executive", "strategic sales"], entryRange: [90000, 140000], midRange: [160000, 250000], seniorRange: [280000, 450000], category: "business" },
  { role: "Sales Manager", keywords: ["sales manager", "sales director", "regional sales"], entryRange: [80000, 115000], midRange: [125000, 175000], seniorRange: [185000, 280000], category: "business" },
  { role: "Customer Success Manager", keywords: ["customer success", "csm", "client success", "account manager"], entryRange: [55000, 78000], midRange: [82000, 115000], seniorRange: [120000, 165000], category: "business" },
  { role: "Business Development", keywords: ["business development", "biz dev", "partnerships"], entryRange: [60000, 90000], midRange: [100000, 150000], seniorRange: [165000, 250000], category: "business" },
  
  // ==================== OPERATIONS & MANAGEMENT ====================
  { role: "Project Manager", keywords: ["project manager", "pmo", "program manager"], entryRange: [65000, 88000], midRange: [95000, 130000], seniorRange: [140000, 190000], category: "business" },
  { role: "Operations Manager", keywords: ["operations", "ops manager", "logistics", "supply chain"], entryRange: [60000, 82000], midRange: [88000, 125000], seniorRange: [135000, 185000], category: "business" },
  { role: "Business Analyst", keywords: ["business analyst", "ba", "requirements analyst"], entryRange: [60000, 80000], midRange: [85000, 115000], seniorRange: [125000, 165000], category: "business" },
  { role: "Management Consultant", keywords: ["management consultant", "strategy consultant", "consulting"], entryRange: [80000, 115000], midRange: [130000, 200000], seniorRange: [230000, 400000], category: "business" },
  { role: "General Manager", keywords: ["general manager", "gm", "site manager"], entryRange: [70000, 100000], midRange: [110000, 160000], seniorRange: [175000, 280000], category: "business" },
  { role: "COO", keywords: ["coo", "chief operating officer", "operations executive"], entryRange: [140000, 200000], midRange: [230000, 380000], seniorRange: [420000, 700000], category: "business" },
  { role: "CEO", keywords: ["ceo", "chief executive officer", "president"], entryRange: [150000, 250000], midRange: [300000, 550000], seniorRange: [650000, 2000000], category: "business" },
  
  // ==================== HUMAN RESOURCES ====================
  { role: "HR Coordinator", keywords: ["hr coordinator", "hr assistant", "human resources coordinator"], entryRange: [42000, 55000], midRange: [58000, 72000], seniorRange: [75000, 92000], category: "business" },
  { role: "HR Generalist", keywords: ["hr generalist", "human resources generalist"], entryRange: [50000, 68000], midRange: [72000, 95000], seniorRange: [100000, 130000], category: "business" },
  { role: "HR Manager", keywords: ["hr manager", "human resources manager"], entryRange: [70000, 95000], midRange: [100000, 135000], seniorRange: [145000, 195000], category: "business" },
  { role: "Recruiter", keywords: ["recruiter", "talent acquisition", "ta"], entryRange: [50000, 68000], midRange: [72000, 100000], seniorRange: [110000, 155000], category: "business" },
  { role: "Technical Recruiter", keywords: ["technical recruiter", "tech recruiter", "engineering recruiter"], entryRange: [60000, 82000], midRange: [88000, 125000], seniorRange: [135000, 180000], category: "business" },
  { role: "Compensation Analyst", keywords: ["compensation analyst", "comp analyst", "total rewards"], entryRange: [60000, 82000], midRange: [88000, 120000], seniorRange: [130000, 175000], category: "business" },
  { role: "CHRO", keywords: ["chro", "chief human resources officer", "chief people officer"], entryRange: [150000, 220000], midRange: [250000, 380000], seniorRange: [420000, 650000], category: "business" },
  
  // ==================== HEALTHCARE ====================
  { role: "Registered Nurse", keywords: ["nurse", "rn", "registered nurse", "nursing"], entryRange: [58000, 75000], midRange: [80000, 105000], seniorRange: [110000, 145000], category: "healthcare" },
  { role: "Nurse Practitioner", keywords: ["nurse practitioner", "np", "aprn"], entryRange: [95000, 115000], midRange: [120000, 145000], seniorRange: [150000, 190000], category: "healthcare" },
  { role: "Physician Assistant", keywords: ["physician assistant", "pa", "pa-c"], entryRange: [100000, 120000], midRange: [125000, 150000], seniorRange: [155000, 195000], category: "healthcare" },
  { role: "Medical Assistant", keywords: ["medical assistant", "clinical assistant", "ma"], entryRange: [32000, 42000], midRange: [44000, 55000], seniorRange: [58000, 72000], category: "healthcare" },
  { role: "Pharmacist", keywords: ["pharmacist", "pharmacy", "rph"], entryRange: [115000, 130000], midRange: [135000, 150000], seniorRange: [155000, 180000], category: "healthcare" },
  { role: "Physical Therapist", keywords: ["physical therapist", "pt", "physiotherapist"], entryRange: [70000, 85000], midRange: [88000, 105000], seniorRange: [110000, 135000], category: "healthcare" },
  { role: "Occupational Therapist", keywords: ["occupational therapist", "ot"], entryRange: [68000, 82000], midRange: [85000, 100000], seniorRange: [105000, 130000], category: "healthcare" },
  { role: "Physician", keywords: ["physician", "doctor", "md", "attending"], entryRange: [180000, 250000], midRange: [270000, 380000], seniorRange: [400000, 650000], category: "healthcare" },
  { role: "Dentist", keywords: ["dentist", "dds", "dental"], entryRange: [130000, 170000], midRange: [180000, 230000], seniorRange: [250000, 400000], category: "healthcare" },
  { role: "Healthcare Administrator", keywords: ["healthcare administrator", "hospital administrator", "health admin"], entryRange: [65000, 90000], midRange: [100000, 145000], seniorRange: [160000, 250000], category: "healthcare" },
  
  // ==================== EDUCATION ====================
  { role: "Teacher", keywords: ["teacher", "educator", "instructor", "teaching", "k-12"], entryRange: [42000, 52000], midRange: [55000, 70000], seniorRange: [75000, 98000], category: "education" },
  { role: "Professor", keywords: ["professor", "lecturer", "academic", "faculty"], entryRange: [65000, 90000], midRange: [95000, 130000], seniorRange: [140000, 200000], category: "education" },
  { role: "School Principal", keywords: ["principal", "school administrator", "head of school"], entryRange: [85000, 110000], midRange: [115000, 145000], seniorRange: [150000, 195000], category: "education" },
  { role: "Instructional Designer", keywords: ["instructional designer", "learning designer", "curriculum"], entryRange: [55000, 72000], midRange: [78000, 100000], seniorRange: [108000, 140000], category: "education" },
  { role: "Academic Advisor", keywords: ["academic advisor", "student advisor", "counselor"], entryRange: [42000, 55000], midRange: [58000, 75000], seniorRange: [78000, 100000], category: "education" },
  
  // ==================== LEGAL ====================
  { role: "Paralegal", keywords: ["paralegal", "legal assistant"], entryRange: [45000, 58000], midRange: [62000, 82000], seniorRange: [88000, 115000], category: "legal" },
  { role: "Attorney", keywords: ["attorney", "lawyer", "counsel", "associate attorney"], entryRange: [75000, 115000], midRange: [130000, 200000], seniorRange: [230000, 450000], category: "legal" },
  { role: "Corporate Counsel", keywords: ["corporate counsel", "in-house counsel", "general counsel"], entryRange: [120000, 170000], midRange: [190000, 280000], seniorRange: [320000, 550000], category: "legal" },
  { role: "Legal Operations", keywords: ["legal operations", "legal ops", "legal project manager"], entryRange: [70000, 95000], midRange: [105000, 145000], seniorRange: [160000, 220000], category: "legal" },
  
  // ==================== CREATIVE & DESIGN ====================
  { role: "Graphic Designer", keywords: ["graphic designer", "visual designer", "design"], entryRange: [45000, 60000], midRange: [65000, 88000], seniorRange: [95000, 130000], category: "creative" },
  { role: "Art Director", keywords: ["art director", "creative director"], entryRange: [75000, 100000], midRange: [110000, 150000], seniorRange: [165000, 230000], category: "creative" },
  { role: "Content Writer", keywords: ["content writer", "copywriter", "writer", "content"], entryRange: [45000, 60000], midRange: [65000, 88000], seniorRange: [95000, 130000], category: "creative" },
  { role: "Video Editor", keywords: ["video editor", "editor", "post production", "motion graphics"], entryRange: [45000, 62000], midRange: [68000, 95000], seniorRange: [105000, 145000], category: "creative" },
  { role: "Photographer", keywords: ["photographer", "photography"], entryRange: [35000, 50000], midRange: [55000, 78000], seniorRange: [85000, 125000], category: "creative" },
  { role: "Brand Designer", keywords: ["brand designer", "branding", "identity designer"], entryRange: [55000, 75000], midRange: [82000, 115000], seniorRange: [125000, 170000], category: "creative" },
  
  // ==================== CONSTRUCTION & TRADES ====================
  { role: "Construction Manager", keywords: ["construction manager", "site manager", "project superintendent"], entryRange: [70000, 95000], midRange: [105000, 145000], seniorRange: [160000, 220000], category: "trades" },
  { role: "Civil Engineer", keywords: ["civil engineer", "structural engineer"], entryRange: [62000, 82000], midRange: [88000, 120000], seniorRange: [130000, 175000], category: "trades" },
  { role: "Electrician", keywords: ["electrician", "electrical"], entryRange: [45000, 60000], midRange: [65000, 85000], seniorRange: [90000, 125000], category: "trades" },
  { role: "Plumber", keywords: ["plumber", "plumbing"], entryRange: [42000, 58000], midRange: [62000, 82000], seniorRange: [88000, 120000], category: "trades" },
  { role: "HVAC Technician", keywords: ["hvac", "hvac technician", "heating cooling"], entryRange: [42000, 58000], midRange: [62000, 82000], seniorRange: [88000, 115000], category: "trades" },
  { role: "Architect", keywords: ["architect", "architecture"], entryRange: [58000, 78000], midRange: [85000, 120000], seniorRange: [130000, 185000], category: "trades" },
  
  // ==================== GENERAL / ADMINISTRATIVE ====================
  { role: "Administrative Assistant", keywords: ["administrative", "admin", "assistant", "secretary", "office manager"], entryRange: [35000, 45000], midRange: [48000, 62000], seniorRange: [65000, 82000], category: "general" },
  { role: "Executive Assistant", keywords: ["executive assistant", "ea", "c-suite assistant"], entryRange: [55000, 72000], midRange: [78000, 100000], seniorRange: [108000, 145000], category: "general" },
  { role: "Customer Service", keywords: ["customer service", "support", "customer success"], entryRange: [35000, 45000], midRange: [48000, 62000], seniorRange: [65000, 85000], category: "general" },
  { role: "Receptionist", keywords: ["receptionist", "front desk"], entryRange: [30000, 38000], midRange: [40000, 48000], seniorRange: [50000, 60000], category: "general" },
  { role: "Office Manager", keywords: ["office manager", "facilities manager"], entryRange: [48000, 62000], midRange: [68000, 88000], seniorRange: [95000, 125000], category: "general" },
];

export const locationMultipliers: LocationMultiplier[] = [
  // High cost states
  { state: "California", multiplier: 1.28, costOfLiving: 142 },
  { state: "New York", multiplier: 1.22, costOfLiving: 139 },
  { state: "Massachusetts", multiplier: 1.18, costOfLiving: 135 },
  { state: "Washington", multiplier: 1.15, costOfLiving: 118 },
  { state: "New Jersey", multiplier: 1.12, costOfLiving: 121 },
  { state: "Connecticut", multiplier: 1.10, costOfLiving: 118 },
  { state: "Maryland", multiplier: 1.08, costOfLiving: 112 },
  { state: "Hawaii", multiplier: 1.05, costOfLiving: 193 },
  { state: "Alaska", multiplier: 1.05, costOfLiving: 127 },
  
  // Moderate-high cost states
  { state: "Colorado", multiplier: 1.08, costOfLiving: 108 },
  { state: "Virginia", multiplier: 1.06, costOfLiving: 103 },
  { state: "Oregon", multiplier: 1.05, costOfLiving: 111 },
  { state: "Illinois", multiplier: 1.03, costOfLiving: 101 },
  { state: "Minnesota", multiplier: 1.02, costOfLiving: 102 },
  { state: "Rhode Island", multiplier: 1.02, costOfLiving: 108 },
  { state: "Delaware", multiplier: 1.02, costOfLiving: 102 },
  { state: "New Hampshire", multiplier: 1.02, costOfLiving: 106 },
  
  // Average cost states
  { state: "Pennsylvania", multiplier: 0.98, costOfLiving: 98 },
  { state: "Texas", multiplier: 1.00, costOfLiving: 93 },
  { state: "Florida", multiplier: 0.97, costOfLiving: 100 },
  { state: "Arizona", multiplier: 0.98, costOfLiving: 102 },
  { state: "Georgia", multiplier: 0.96, costOfLiving: 93 },
  { state: "North Carolina", multiplier: 0.95, costOfLiving: 95 },
  { state: "Nevada", multiplier: 0.98, costOfLiving: 104 },
  { state: "Utah", multiplier: 0.98, costOfLiving: 101 },
  { state: "Wisconsin", multiplier: 0.94, costOfLiving: 93 },
  { state: "Michigan", multiplier: 0.93, costOfLiving: 91 },
  
  // Lower cost states
  { state: "Tennessee", multiplier: 0.92, costOfLiving: 90 },
  { state: "Ohio", multiplier: 0.92, costOfLiving: 90 },
  { state: "Indiana", multiplier: 0.90, costOfLiving: 90 },
  { state: "Missouri", multiplier: 0.90, costOfLiving: 89 },
  { state: "South Carolina", multiplier: 0.90, costOfLiving: 92 },
  { state: "Kentucky", multiplier: 0.88, costOfLiving: 87 },
  { state: "Alabama", multiplier: 0.88, costOfLiving: 88 },
  { state: "Louisiana", multiplier: 0.88, costOfLiving: 91 },
  { state: "Oklahoma", multiplier: 0.87, costOfLiving: 87 },
  { state: "Arkansas", multiplier: 0.86, costOfLiving: 86 },
  { state: "Kansas", multiplier: 0.88, costOfLiving: 89 },
  { state: "Iowa", multiplier: 0.88, costOfLiving: 90 },
  { state: "Nebraska", multiplier: 0.90, costOfLiving: 92 },
  { state: "West Virginia", multiplier: 0.85, costOfLiving: 84 },
  { state: "Mississippi", multiplier: 0.84, costOfLiving: 83 },
  
  // Special
  { state: "Remote", multiplier: 1.00, costOfLiving: 100 },
  { state: "Washington DC", multiplier: 1.20, costOfLiving: 130 },
  { state: "Other", multiplier: 0.95, costOfLiving: 95 },
];

export function findBenchmark(jobTitle: string): SalaryBenchmark | null {
  const normalizedTitle = jobTitle.toLowerCase().trim();
  
  // First try exact match
  const exactMatch = salaryBenchmarks.find(b => 
    b.role.toLowerCase() === normalizedTitle
  );
  if (exactMatch) return exactMatch;
  
  // Then try keyword match (prioritize longer keyword matches)
  let bestMatch: SalaryBenchmark | null = null;
  let bestMatchLength = 0;
  
  for (const b of salaryBenchmarks) {
    for (const kw of b.keywords) {
      if (normalizedTitle.includes(kw) && kw.length > bestMatchLength) {
        bestMatch = b;
        bestMatchLength = kw.length;
      }
    }
  }
  if (bestMatch) return bestMatch;
  
  // Finally try partial word match
  const partialMatch = salaryBenchmarks.find(b =>
    b.role.toLowerCase().split(' ').some(word => 
      word.length > 3 && normalizedTitle.includes(word)
    ) ||
    normalizedTitle.split(' ').some(word => 
      word.length > 3 && b.role.toLowerCase().includes(word)
    )
  );
  
  return partialMatch || null;
}

export function getLocationMultiplier(state: string): number {
  const found = locationMultipliers.find(l => 
    l.state.toLowerCase() === state.toLowerCase()
  );
  return found?.multiplier || 0.95;
}

export function getCostOfLiving(state: string): number {
  const found = locationMultipliers.find(l => 
    l.state.toLowerCase() === state.toLowerCase()
  );
  return found?.costOfLiving || 100;
}

export function getSalaryRange(
  benchmark: SalaryBenchmark, 
  yearsExperience: number, 
  location: string
): { min: number; mid: number; max: number; level: string } {
  const multiplier = getLocationMultiplier(location);
  
  let range: [number, number];
  let level: string;
  
  if (yearsExperience < 3) {
    range = benchmark.entryRange;
    level = "Entry Level";
  } else if (yearsExperience < 7) {
    range = benchmark.midRange;
    level = "Mid Level";
  } else {
    range = benchmark.seniorRange;
    level = "Senior Level";
  }
  
  return {
    min: Math.round(range[0] * multiplier),
    mid: Math.round(((range[0] + range[1]) / 2) * multiplier),
    max: Math.round(range[1] * multiplier),
    level
  };
}

export function assessSalary(
  salary: number,
  benchmark: SalaryBenchmark,
  yearsExperience: number,
  location: string
): { status: 'underpaid' | 'fair' | 'above'; gap: number; percentile: number; range: ReturnType<typeof getSalaryRange> } {
  const range = getSalaryRange(benchmark, yearsExperience, location);
  
  let status: 'underpaid' | 'fair' | 'above';
  let percentile: number;
  
  if (salary < range.min) {
    status = 'underpaid';
    percentile = Math.round((salary / range.min) * 25);
  } else if (salary > range.max) {
    status = 'above';
    percentile = Math.min(99, 75 + Math.round(((salary - range.max) / range.max) * 25));
  } else {
    status = 'fair';
    percentile = 25 + Math.round(((salary - range.min) / (range.max - range.min)) * 50);
  }
  
  const gap = salary - range.mid;
  
  return { status, gap, percentile, range };
}

// Get all available job titles for autocomplete
export function getAllJobTitles(): string[] {
  return salaryBenchmarks.map(b => b.role).sort();
}

// Get benchmarks by category
export function getBenchmarksByCategory(category: string): SalaryBenchmark[] {
  return salaryBenchmarks.filter(b => b.category === category);
}

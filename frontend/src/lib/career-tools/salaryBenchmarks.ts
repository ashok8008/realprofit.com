// Reusable Salary Benchmark Dataset System
// Powers: Salary Comparison Tool, Am I Underpaid Tool, Salary Negotiation Helper
// Designed to be: structured, scalable, replaceable with real data later

export type ExperienceLevel = 'entry' | 'mid' | 'senior';
export type LocationCostType = 'lowCost' | 'average' | 'highCost';

export interface SalaryRange {
  min: number;
  mid: number;
  max: number;
}

export interface LocationMultiplier {
  lowCost: number;
  average: number;
  highCost: number;
}

export interface SalaryBenchmark {
  jobFamily: string;
  jobTitle: string;
  level: ExperienceLevel;
  experienceRange: string;
  baseRange: SalaryRange;
  locationMultiplier: LocationMultiplier;
  keywords: string[];
}

// ============================================================
// SALARY BENCHMARK DATASET
// ============================================================

export const salaryBenchmarks: SalaryBenchmark[] = [
  // ==================== SOFTWARE ENGINEERING ====================
  { jobFamily: "Software Engineering", jobTitle: "Software Engineer", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 70000, mid: 90000, max: 115000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.28 },
    keywords: ["software", "developer", "programmer", "swe", "coding"] },
  { jobFamily: "Software Engineering", jobTitle: "Software Engineer", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 100000, mid: 130000, max: 165000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.32 },
    keywords: ["software", "developer", "programmer", "swe"] },
  { jobFamily: "Software Engineering", jobTitle: "Software Engineer", level: "senior", experienceRange: "6+", 
    baseRange: { min: 145000, mid: 185000, max: 240000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.38 },
    keywords: ["senior software", "staff engineer", "principal"] },
  
  { jobFamily: "Software Engineering", jobTitle: "Frontend Developer", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 60000, mid: 78000, max: 95000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.25 },
    keywords: ["frontend", "front-end", "react", "vue", "angular", "ui developer"] },
  { jobFamily: "Software Engineering", jobTitle: "Frontend Developer", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 90000, mid: 115000, max: 145000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.30 },
    keywords: ["frontend", "front-end", "react developer"] },
  { jobFamily: "Software Engineering", jobTitle: "Frontend Developer", level: "senior", experienceRange: "6+", 
    baseRange: { min: 130000, mid: 165000, max: 205000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.35 },
    keywords: ["senior frontend", "lead frontend"] },
  
  { jobFamily: "Software Engineering", jobTitle: "Backend Developer", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 65000, mid: 82000, max: 100000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.26 },
    keywords: ["backend", "back-end", "api", "server", "node", "python", "java", "golang"] },
  { jobFamily: "Software Engineering", jobTitle: "Backend Developer", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 95000, mid: 120000, max: 150000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.32 },
    keywords: ["backend developer", "api developer"] },
  { jobFamily: "Software Engineering", jobTitle: "Backend Developer", level: "senior", experienceRange: "6+", 
    baseRange: { min: 140000, mid: 175000, max: 220000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.36 },
    keywords: ["senior backend", "lead backend"] },
  
  { jobFamily: "Software Engineering", jobTitle: "Full Stack Developer", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 65000, mid: 85000, max: 105000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.26 },
    keywords: ["full stack", "fullstack", "full-stack"] },
  { jobFamily: "Software Engineering", jobTitle: "Full Stack Developer", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 100000, mid: 128000, max: 160000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.32 },
    keywords: ["full stack developer"] },
  { jobFamily: "Software Engineering", jobTitle: "Full Stack Developer", level: "senior", experienceRange: "6+", 
    baseRange: { min: 145000, mid: 180000, max: 230000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.36 },
    keywords: ["senior full stack"] },
  
  { jobFamily: "Software Engineering", jobTitle: "Mobile Developer", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 65000, mid: 82000, max: 100000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.25 },
    keywords: ["mobile", "ios", "android", "swift", "kotlin", "react native", "flutter"] },
  { jobFamily: "Software Engineering", jobTitle: "Mobile Developer", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 95000, mid: 120000, max: 150000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.30 },
    keywords: ["mobile developer", "ios developer", "android developer"] },
  { jobFamily: "Software Engineering", jobTitle: "Mobile Developer", level: "senior", experienceRange: "6+", 
    baseRange: { min: 135000, mid: 170000, max: 215000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.35 },
    keywords: ["senior mobile", "lead mobile"] },
  
  { jobFamily: "Software Engineering", jobTitle: "DevOps Engineer", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 72000, mid: 90000, max: 112000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.28 },
    keywords: ["devops", "site reliability", "sre", "infrastructure", "platform"] },
  { jobFamily: "Software Engineering", jobTitle: "DevOps Engineer", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 110000, mid: 138000, max: 170000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.32 },
    keywords: ["devops engineer", "sre engineer"] },
  { jobFamily: "Software Engineering", jobTitle: "DevOps Engineer", level: "senior", experienceRange: "6+", 
    baseRange: { min: 155000, mid: 190000, max: 245000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.38 },
    keywords: ["senior devops", "staff sre"] },
  
  { jobFamily: "Software Engineering", jobTitle: "QA Engineer", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 52000, mid: 68000, max: 85000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.22 },
    keywords: ["qa", "quality assurance", "testing", "test engineer", "sdet"] },
  { jobFamily: "Software Engineering", jobTitle: "QA Engineer", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 78000, mid: 98000, max: 122000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.28 },
    keywords: ["qa engineer", "test automation"] },
  { jobFamily: "Software Engineering", jobTitle: "QA Engineer", level: "senior", experienceRange: "6+", 
    baseRange: { min: 110000, mid: 138000, max: 175000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.32 },
    keywords: ["senior qa", "qa lead"] },
  
  // ==================== DATA SCIENCE ====================
  { jobFamily: "Data Science", jobTitle: "Data Scientist", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 80000, mid: 100000, max: 125000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.30 },
    keywords: ["data scientist", "machine learning", "ml", "ai", "data science"] },
  { jobFamily: "Data Science", jobTitle: "Data Scientist", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 120000, mid: 150000, max: 185000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.35 },
    keywords: ["data scientist", "ml scientist"] },
  { jobFamily: "Data Science", jobTitle: "Data Scientist", level: "senior", experienceRange: "6+", 
    baseRange: { min: 165000, mid: 210000, max: 275000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.40 },
    keywords: ["senior data scientist", "principal data scientist"] },
  
  { jobFamily: "Data Science", jobTitle: "Data Analyst", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 52000, mid: 65000, max: 80000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.22 },
    keywords: ["data analyst", "analytics", "sql", "tableau", "power bi", "bi analyst"] },
  { jobFamily: "Data Science", jobTitle: "Data Analyst", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 75000, mid: 95000, max: 118000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.28 },
    keywords: ["data analyst", "senior analyst"] },
  { jobFamily: "Data Science", jobTitle: "Data Analyst", level: "senior", experienceRange: "6+", 
    baseRange: { min: 105000, mid: 132000, max: 165000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.32 },
    keywords: ["senior data analyst", "lead analyst"] },
  
  { jobFamily: "Data Science", jobTitle: "Data Engineer", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 75000, mid: 95000, max: 118000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.28 },
    keywords: ["data engineer", "etl", "data pipeline", "spark", "airflow"] },
  { jobFamily: "Data Science", jobTitle: "Data Engineer", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 115000, mid: 142000, max: 175000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.32 },
    keywords: ["data engineer"] },
  { jobFamily: "Data Science", jobTitle: "Data Engineer", level: "senior", experienceRange: "6+", 
    baseRange: { min: 155000, mid: 195000, max: 250000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.38 },
    keywords: ["senior data engineer", "staff data engineer"] },
  
  { jobFamily: "Data Science", jobTitle: "Machine Learning Engineer", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 90000, mid: 115000, max: 140000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.32 },
    keywords: ["machine learning engineer", "ml engineer", "deep learning"] },
  { jobFamily: "Data Science", jobTitle: "Machine Learning Engineer", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 135000, mid: 170000, max: 210000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.38 },
    keywords: ["ml engineer", "mlops"] },
  { jobFamily: "Data Science", jobTitle: "Machine Learning Engineer", level: "senior", experienceRange: "6+", 
    baseRange: { min: 185000, mid: 235000, max: 310000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.42 },
    keywords: ["senior ml engineer", "staff ml engineer"] },
  
  // ==================== PRODUCT MANAGEMENT ====================
  { jobFamily: "Product Management", jobTitle: "Product Manager", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 85000, mid: 105000, max: 130000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.28 },
    keywords: ["product manager", "pm", "associate pm", "apm"] },
  { jobFamily: "Product Management", jobTitle: "Product Manager", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 125000, mid: 155000, max: 190000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.35 },
    keywords: ["product manager", "pm"] },
  { jobFamily: "Product Management", jobTitle: "Product Manager", level: "senior", experienceRange: "6+", 
    baseRange: { min: 170000, mid: 215000, max: 275000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.40 },
    keywords: ["senior pm", "group pm", "director of product"] },
  
  { jobFamily: "Product Management", jobTitle: "Technical Product Manager", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 95000, mid: 118000, max: 145000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.30 },
    keywords: ["technical product manager", "tpm"] },
  { jobFamily: "Product Management", jobTitle: "Technical Product Manager", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 140000, mid: 172000, max: 210000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.36 },
    keywords: ["technical pm", "tpm"] },
  { jobFamily: "Product Management", jobTitle: "Technical Product Manager", level: "senior", experienceRange: "6+", 
    baseRange: { min: 185000, mid: 235000, max: 300000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.42 },
    keywords: ["senior tpm", "principal tpm"] },
  
  // ==================== DESIGN (UI/UX) ====================
  { jobFamily: "Design", jobTitle: "UX Designer", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 58000, mid: 75000, max: 92000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.25 },
    keywords: ["ux", "user experience", "ux designer"] },
  { jobFamily: "Design", jobTitle: "UX Designer", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 88000, mid: 112000, max: 140000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.30 },
    keywords: ["ux designer", "product designer"] },
  { jobFamily: "Design", jobTitle: "UX Designer", level: "senior", experienceRange: "6+", 
    baseRange: { min: 130000, mid: 162000, max: 205000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.35 },
    keywords: ["senior ux", "lead ux designer"] },
  
  { jobFamily: "Design", jobTitle: "UI Designer", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 52000, mid: 68000, max: 85000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.22 },
    keywords: ["ui", "ui designer", "visual designer", "interface"] },
  { jobFamily: "Design", jobTitle: "UI Designer", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 80000, mid: 102000, max: 128000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.28 },
    keywords: ["ui designer", "visual designer"] },
  { jobFamily: "Design", jobTitle: "UI Designer", level: "senior", experienceRange: "6+", 
    baseRange: { min: 115000, mid: 145000, max: 185000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.32 },
    keywords: ["senior ui designer", "lead designer"] },
  
  { jobFamily: "Design", jobTitle: "Product Designer", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 62000, mid: 80000, max: 100000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.26 },
    keywords: ["product designer", "ui/ux"] },
  { jobFamily: "Design", jobTitle: "Product Designer", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 95000, mid: 122000, max: 155000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.32 },
    keywords: ["product designer"] },
  { jobFamily: "Design", jobTitle: "Product Designer", level: "senior", experienceRange: "6+", 
    baseRange: { min: 140000, mid: 175000, max: 225000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.38 },
    keywords: ["senior product designer", "staff designer"] },
  
  { jobFamily: "Design", jobTitle: "Graphic Designer", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 40000, mid: 52000, max: 65000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.18 },
    keywords: ["graphic designer", "graphic design"] },
  { jobFamily: "Design", jobTitle: "Graphic Designer", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 58000, mid: 75000, max: 95000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.22 },
    keywords: ["graphic designer"] },
  { jobFamily: "Design", jobTitle: "Graphic Designer", level: "senior", experienceRange: "6+", 
    baseRange: { min: 85000, mid: 108000, max: 138000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.28 },
    keywords: ["senior graphic designer", "art director"] },
  
  // ==================== MARKETING ====================
  { jobFamily: "Marketing", jobTitle: "Marketing Manager", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 52000, mid: 68000, max: 85000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.22 },
    keywords: ["marketing manager", "marketing coordinator"] },
  { jobFamily: "Marketing", jobTitle: "Marketing Manager", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 78000, mid: 100000, max: 128000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.28 },
    keywords: ["marketing manager", "brand manager"] },
  { jobFamily: "Marketing", jobTitle: "Marketing Manager", level: "senior", experienceRange: "6+", 
    baseRange: { min: 115000, mid: 148000, max: 190000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.32 },
    keywords: ["senior marketing", "director of marketing"] },
  
  { jobFamily: "Marketing", jobTitle: "Digital Marketing Manager", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 48000, mid: 62000, max: 78000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.20 },
    keywords: ["digital marketing", "online marketing", "growth marketing"] },
  { jobFamily: "Marketing", jobTitle: "Digital Marketing Manager", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 72000, mid: 92000, max: 118000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.26 },
    keywords: ["digital marketing manager", "growth manager"] },
  { jobFamily: "Marketing", jobTitle: "Digital Marketing Manager", level: "senior", experienceRange: "6+", 
    baseRange: { min: 105000, mid: 135000, max: 175000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.30 },
    keywords: ["senior digital marketing", "head of growth"] },
  
  { jobFamily: "Marketing", jobTitle: "Content Marketing Manager", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 45000, mid: 58000, max: 72000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.18 },
    keywords: ["content marketing", "content manager", "content writer"] },
  { jobFamily: "Marketing", jobTitle: "Content Marketing Manager", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 68000, mid: 88000, max: 112000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.25 },
    keywords: ["content marketing manager", "content strategist"] },
  { jobFamily: "Marketing", jobTitle: "Content Marketing Manager", level: "senior", experienceRange: "6+", 
    baseRange: { min: 100000, mid: 128000, max: 165000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.30 },
    keywords: ["senior content", "head of content"] },
  
  { jobFamily: "Marketing", jobTitle: "Product Marketing Manager", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 72000, mid: 92000, max: 115000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.26 },
    keywords: ["product marketing", "pmm"] },
  { jobFamily: "Marketing", jobTitle: "Product Marketing Manager", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 110000, mid: 138000, max: 172000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.32 },
    keywords: ["product marketing manager", "pmm"] },
  { jobFamily: "Marketing", jobTitle: "Product Marketing Manager", level: "senior", experienceRange: "6+", 
    baseRange: { min: 155000, mid: 195000, max: 250000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.38 },
    keywords: ["senior pmm", "director pmm"] },
  
  // ==================== SALES ====================
  { jobFamily: "Sales", jobTitle: "Sales Representative", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 42000, mid: 55000, max: 72000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.18 },
    keywords: ["sales", "sales rep", "bdr", "sdr", "inside sales"] },
  { jobFamily: "Sales", jobTitle: "Sales Representative", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 65000, mid: 88000, max: 120000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.25 },
    keywords: ["account executive", "ae", "sales rep"] },
  { jobFamily: "Sales", jobTitle: "Sales Representative", level: "senior", experienceRange: "6+", 
    baseRange: { min: 100000, mid: 140000, max: 200000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.32 },
    keywords: ["senior ae", "enterprise sales"] },
  
  { jobFamily: "Sales", jobTitle: "Sales Manager", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 65000, mid: 85000, max: 108000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.22 },
    keywords: ["sales manager", "team lead sales"] },
  { jobFamily: "Sales", jobTitle: "Sales Manager", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 95000, mid: 125000, max: 162000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.28 },
    keywords: ["sales manager", "regional sales"] },
  { jobFamily: "Sales", jobTitle: "Sales Manager", level: "senior", experienceRange: "6+", 
    baseRange: { min: 140000, mid: 185000, max: 250000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.35 },
    keywords: ["senior sales manager", "director of sales", "vp sales"] },
  
  // ==================== CUSTOMER SUPPORT ====================
  { jobFamily: "Customer Support", jobTitle: "Customer Service Representative", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 32000, mid: 40000, max: 50000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.15 },
    keywords: ["customer service", "support", "customer support"] },
  { jobFamily: "Customer Support", jobTitle: "Customer Service Representative", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 45000, mid: 56000, max: 70000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.18 },
    keywords: ["customer service rep", "support specialist"] },
  { jobFamily: "Customer Support", jobTitle: "Customer Service Representative", level: "senior", experienceRange: "6+", 
    baseRange: { min: 58000, mid: 72000, max: 92000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.22 },
    keywords: ["senior support", "support lead"] },
  
  { jobFamily: "Customer Support", jobTitle: "Customer Success Manager", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 52000, mid: 68000, max: 85000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.22 },
    keywords: ["customer success", "csm", "client success"] },
  { jobFamily: "Customer Support", jobTitle: "Customer Success Manager", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 78000, mid: 100000, max: 128000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.28 },
    keywords: ["customer success manager", "account manager"] },
  { jobFamily: "Customer Support", jobTitle: "Customer Success Manager", level: "senior", experienceRange: "6+", 
    baseRange: { min: 115000, mid: 145000, max: 188000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.32 },
    keywords: ["senior csm", "director of cs"] },
  
  // ==================== FINANCE / ACCOUNTING ====================
  { jobFamily: "Finance", jobTitle: "Financial Analyst", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 55000, mid: 70000, max: 88000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.25 },
    keywords: ["financial analyst", "finance", "fp&a"] },
  { jobFamily: "Finance", jobTitle: "Financial Analyst", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 82000, mid: 105000, max: 135000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.30 },
    keywords: ["financial analyst", "senior analyst"] },
  { jobFamily: "Finance", jobTitle: "Financial Analyst", level: "senior", experienceRange: "6+", 
    baseRange: { min: 120000, mid: 155000, max: 200000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.35 },
    keywords: ["senior financial analyst", "finance manager"] },
  
  { jobFamily: "Finance", jobTitle: "Accountant", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 48000, mid: 58000, max: 72000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.18 },
    keywords: ["accountant", "staff accountant", "cpa", "bookkeeper"] },
  { jobFamily: "Finance", jobTitle: "Accountant", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 68000, mid: 85000, max: 108000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.22 },
    keywords: ["senior accountant", "accountant"] },
  { jobFamily: "Finance", jobTitle: "Accountant", level: "senior", experienceRange: "6+", 
    baseRange: { min: 95000, mid: 122000, max: 158000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.28 },
    keywords: ["accounting manager", "controller"] },
  
  // ==================== HUMAN RESOURCES ====================
  { jobFamily: "Human Resources", jobTitle: "HR Generalist", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 45000, mid: 58000, max: 72000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.18 },
    keywords: ["hr", "human resources", "hr generalist", "hr coordinator"] },
  { jobFamily: "Human Resources", jobTitle: "HR Generalist", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 68000, mid: 85000, max: 108000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.22 },
    keywords: ["hr generalist", "human resources"] },
  { jobFamily: "Human Resources", jobTitle: "HR Generalist", level: "senior", experienceRange: "6+", 
    baseRange: { min: 95000, mid: 120000, max: 155000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.28 },
    keywords: ["senior hr", "hr manager"] },
  
  { jobFamily: "Human Resources", jobTitle: "Recruiter", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 48000, mid: 60000, max: 75000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.20 },
    keywords: ["recruiter", "talent acquisition", "ta"] },
  { jobFamily: "Human Resources", jobTitle: "Recruiter", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 72000, mid: 92000, max: 118000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.26 },
    keywords: ["recruiter", "senior recruiter"] },
  { jobFamily: "Human Resources", jobTitle: "Recruiter", level: "senior", experienceRange: "6+", 
    baseRange: { min: 105000, mid: 135000, max: 175000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.32 },
    keywords: ["lead recruiter", "recruiting manager"] },
  
  // ==================== OPERATIONS ====================
  { jobFamily: "Operations", jobTitle: "Operations Manager", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 52000, mid: 68000, max: 85000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.20 },
    keywords: ["operations", "ops manager", "operations coordinator"] },
  { jobFamily: "Operations", jobTitle: "Operations Manager", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 78000, mid: 100000, max: 128000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.25 },
    keywords: ["operations manager", "ops manager"] },
  { jobFamily: "Operations", jobTitle: "Operations Manager", level: "senior", experienceRange: "6+", 
    baseRange: { min: 115000, mid: 148000, max: 195000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.30 },
    keywords: ["senior ops", "director of operations"] },
  
  // ==================== BUSINESS ANALYST ====================
  { jobFamily: "Business Analysis", jobTitle: "Business Analyst", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 55000, mid: 70000, max: 88000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.22 },
    keywords: ["business analyst", "ba", "requirements analyst"] },
  { jobFamily: "Business Analysis", jobTitle: "Business Analyst", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 82000, mid: 105000, max: 135000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.28 },
    keywords: ["business analyst", "senior ba"] },
  { jobFamily: "Business Analysis", jobTitle: "Business Analyst", level: "senior", experienceRange: "6+", 
    baseRange: { min: 120000, mid: 152000, max: 195000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.32 },
    keywords: ["senior business analyst", "lead ba"] },
  
  // ==================== PROJECT MANAGER ====================
  { jobFamily: "Project Management", jobTitle: "Project Manager", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 58000, mid: 75000, max: 95000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.22 },
    keywords: ["project manager", "pm", "project coordinator"] },
  { jobFamily: "Project Management", jobTitle: "Project Manager", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 88000, mid: 112000, max: 142000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.28 },
    keywords: ["project manager", "program manager"] },
  { jobFamily: "Project Management", jobTitle: "Project Manager", level: "senior", experienceRange: "6+", 
    baseRange: { min: 130000, mid: 165000, max: 215000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.35 },
    keywords: ["senior pm", "program director"] },
  
  // ==================== HEALTHCARE ====================
  { jobFamily: "Healthcare", jobTitle: "Registered Nurse", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 55000, mid: 68000, max: 82000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.25 },
    keywords: ["nurse", "rn", "registered nurse"] },
  { jobFamily: "Healthcare", jobTitle: "Registered Nurse", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 75000, mid: 92000, max: 112000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.28 },
    keywords: ["registered nurse", "rn"] },
  { jobFamily: "Healthcare", jobTitle: "Registered Nurse", level: "senior", experienceRange: "6+", 
    baseRange: { min: 98000, mid: 120000, max: 148000 }, locationMultiplier: { lowCost: 0.90, average: 1.0, highCost: 1.32 },
    keywords: ["senior nurse", "charge nurse", "nurse manager"] },
  
  { jobFamily: "Healthcare", jobTitle: "Medical Assistant", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 32000, mid: 38000, max: 46000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.15 },
    keywords: ["medical assistant", "ma", "clinical assistant"] },
  { jobFamily: "Healthcare", jobTitle: "Medical Assistant", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 42000, mid: 52000, max: 62000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.18 },
    keywords: ["medical assistant"] },
  { jobFamily: "Healthcare", jobTitle: "Medical Assistant", level: "senior", experienceRange: "6+", 
    baseRange: { min: 55000, mid: 68000, max: 82000 }, locationMultiplier: { lowCost: 0.90, average: 1.0, highCost: 1.22 },
    keywords: ["senior medical assistant", "lead ma"] },
  
  { jobFamily: "Healthcare", jobTitle: "Healthcare Administrator", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 55000, mid: 72000, max: 92000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.22 },
    keywords: ["healthcare administrator", "health admin", "hospital admin"] },
  { jobFamily: "Healthcare", jobTitle: "Healthcare Administrator", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 88000, mid: 115000, max: 148000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.28 },
    keywords: ["healthcare administrator"] },
  { jobFamily: "Healthcare", jobTitle: "Healthcare Administrator", level: "senior", experienceRange: "6+", 
    baseRange: { min: 135000, mid: 175000, max: 230000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.35 },
    keywords: ["senior healthcare admin", "hospital director"] },
  
  // ==================== EDUCATION ====================
  { jobFamily: "Education", jobTitle: "Teacher", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 40000, mid: 48000, max: 58000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.20 },
    keywords: ["teacher", "educator", "instructor", "k-12"] },
  { jobFamily: "Education", jobTitle: "Teacher", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 52000, mid: 62000, max: 75000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.22 },
    keywords: ["teacher", "educator"] },
  { jobFamily: "Education", jobTitle: "Teacher", level: "senior", experienceRange: "6+", 
    baseRange: { min: 68000, mid: 82000, max: 100000 }, locationMultiplier: { lowCost: 0.90, average: 1.0, highCost: 1.25 },
    keywords: ["senior teacher", "department head"] },
  
  { jobFamily: "Education", jobTitle: "Instructional Designer", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 50000, mid: 62000, max: 78000 }, locationMultiplier: { lowCost: 0.82, average: 1.0, highCost: 1.20 },
    keywords: ["instructional designer", "learning designer", "curriculum"] },
  { jobFamily: "Education", jobTitle: "Instructional Designer", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 72000, mid: 90000, max: 115000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.25 },
    keywords: ["instructional designer"] },
  { jobFamily: "Education", jobTitle: "Instructional Designer", level: "senior", experienceRange: "6+", 
    baseRange: { min: 100000, mid: 128000, max: 165000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.30 },
    keywords: ["senior instructional designer", "learning lead"] },
  
  // ==================== RETAIL / HOSPITALITY ====================
  { jobFamily: "Retail", jobTitle: "Store Manager", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 38000, mid: 48000, max: 60000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.15 },
    keywords: ["store manager", "retail manager", "assistant manager"] },
  { jobFamily: "Retail", jobTitle: "Store Manager", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 55000, mid: 70000, max: 88000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.18 },
    keywords: ["store manager", "retail manager"] },
  { jobFamily: "Retail", jobTitle: "Store Manager", level: "senior", experienceRange: "6+", 
    baseRange: { min: 78000, mid: 98000, max: 125000 }, locationMultiplier: { lowCost: 0.90, average: 1.0, highCost: 1.22 },
    keywords: ["district manager", "regional manager"] },
  
  // ==================== CONSTRUCTION / TRADES ====================
  { jobFamily: "Construction", jobTitle: "Construction Manager", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 58000, mid: 72000, max: 90000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.20 },
    keywords: ["construction manager", "site manager", "project superintendent"] },
  { jobFamily: "Construction", jobTitle: "Construction Manager", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 85000, mid: 108000, max: 138000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.25 },
    keywords: ["construction manager"] },
  { jobFamily: "Construction", jobTitle: "Construction Manager", level: "senior", experienceRange: "6+", 
    baseRange: { min: 125000, mid: 160000, max: 210000 }, locationMultiplier: { lowCost: 0.90, average: 1.0, highCost: 1.30 },
    keywords: ["senior construction manager", "director of construction"] },
  
  { jobFamily: "Construction", jobTitle: "Electrician", level: "entry", experienceRange: "0-2", 
    baseRange: { min: 38000, mid: 48000, max: 60000 }, locationMultiplier: { lowCost: 0.85, average: 1.0, highCost: 1.20 },
    keywords: ["electrician", "electrical", "apprentice electrician"] },
  { jobFamily: "Construction", jobTitle: "Electrician", level: "mid", experienceRange: "3-5", 
    baseRange: { min: 55000, mid: 70000, max: 88000 }, locationMultiplier: { lowCost: 0.88, average: 1.0, highCost: 1.25 },
    keywords: ["electrician", "journeyman electrician"] },
  { jobFamily: "Construction", jobTitle: "Electrician", level: "senior", experienceRange: "6+", 
    baseRange: { min: 78000, mid: 98000, max: 125000 }, locationMultiplier: { lowCost: 0.90, average: 1.0, highCost: 1.28 },
    keywords: ["master electrician", "electrical foreman"] },
];

// ============================================================
// LOCATION MAPPING
// ============================================================

const highCostLocations = [
  'san francisco', 'new york', 'nyc', 'seattle', 'boston', 'los angeles', 'la',
  'washington dc', 'dc', 'san jose', 'silicon valley', 'manhattan', 'brooklyn',
  'palo alto', 'san diego', 'denver', 'austin', 'miami', 'chicago',
  'california', 'new york state', 'massachusetts', 'washington'
];

const lowCostLocations = [
  'midwest', 'ohio', 'indiana', 'michigan', 'iowa', 'kansas', 'nebraska',
  'oklahoma', 'arkansas', 'mississippi', 'alabama', 'louisiana', 'kentucky',
  'tennessee', 'west virginia', 'south carolina', 'north dakota', 'south dakota',
  'montana', 'wyoming', 'idaho', 'new mexico', 'boise', 'omaha', 'tulsa',
  'memphis', 'louisville', 'birmingham', 'little rock', 'des moines'
];

export function getLocationType(location: string): LocationCostType {
  const normalized = location.toLowerCase().trim();
  
  if (highCostLocations.some(loc => normalized.includes(loc))) {
    return 'highCost';
  }
  if (lowCostLocations.some(loc => normalized.includes(loc))) {
    return 'lowCost';
  }
  return 'average';
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Maps years of experience to experience level
 */
export function mapExperienceToLevel(yearsOfExperience: number): ExperienceLevel {
  if (yearsOfExperience < 3) return 'entry';
  if (yearsOfExperience < 6) return 'mid';
  return 'senior';
}

/**
 * Finds the best matching benchmark for a job title and experience
 */
export function findBenchmark(jobTitle: string, yearsOfExperience: number): SalaryBenchmark | null {
  const normalizedTitle = jobTitle.toLowerCase().trim();
  const level = mapExperienceToLevel(yearsOfExperience);
  
  // First: exact job title + level match
  let match = salaryBenchmarks.find(b => 
    b.jobTitle.toLowerCase() === normalizedTitle && b.level === level
  );
  if (match) return match;
  
  // Second: keyword match + level
  match = salaryBenchmarks.find(b => 
    b.level === level && b.keywords.some(kw => normalizedTitle.includes(kw))
  );
  if (match) return match;
  
  // Third: partial match + level
  match = salaryBenchmarks.find(b => 
    b.level === level && (
      b.jobTitle.toLowerCase().split(' ').some(word => word.length > 3 && normalizedTitle.includes(word)) ||
      normalizedTitle.split(' ').some(word => word.length > 3 && b.jobTitle.toLowerCase().includes(word))
    )
  );
  if (match) return match;
  
  // Fourth: any level match (fallback)
  match = salaryBenchmarks.find(b => 
    b.keywords.some(kw => normalizedTitle.includes(kw))
  );
  
  return match || null;
}

/**
 * Adjusts salary range based on location
 */
export function adjustForLocation(baseRange: SalaryRange, locationType: LocationCostType, multiplier: LocationMultiplier): SalaryRange {
  const mult = multiplier[locationType];
  return {
    min: Math.round(baseRange.min * mult),
    mid: Math.round(baseRange.mid * mult),
    max: Math.round(baseRange.max * mult)
  };
}

/**
 * Determines if user's salary is below, within, or above the range
 */
export function getSalaryPosition(userSalary: number, adjustedRange: SalaryRange): 'below' | 'within' | 'above' {
  if (userSalary < adjustedRange.min) return 'below';
  if (userSalary > adjustedRange.max) return 'above';
  return 'within';
}

/**
 * Calculates the gap between user's salary and the range midpoint
 */
export function calculateGap(userSalary: number, adjustedRange: SalaryRange): {
  differenceFromMid: number;
  percentageDifference: number;
  position: 'below' | 'within' | 'above';
} {
  const differenceFromMid = userSalary - adjustedRange.mid;
  const percentageDifference = (differenceFromMid / adjustedRange.mid) * 100;
  const position = getSalaryPosition(userSalary, adjustedRange);
  
  return {
    differenceFromMid,
    percentageDifference: Math.round(percentageDifference * 10) / 10,
    position
  };
}

/**
 * Gets full salary analysis for a user
 */
export function analyzeSalary(
  jobTitle: string, 
  yearsOfExperience: number, 
  userSalary: number, 
  location: string
): {
  benchmark: SalaryBenchmark | null;
  adjustedRange: SalaryRange | null;
  gap: ReturnType<typeof calculateGap> | null;
  locationType: LocationCostType;
} {
  const benchmark = findBenchmark(jobTitle, yearsOfExperience);
  const locationType = getLocationType(location);
  
  if (!benchmark) {
    return { benchmark: null, adjustedRange: null, gap: null, locationType };
  }
  
  const adjustedRange = adjustForLocation(benchmark.baseRange, locationType, benchmark.locationMultiplier);
  const gap = calculateGap(userSalary, adjustedRange);
  
  return { benchmark, adjustedRange, gap, locationType };
}

/**
 * Gets all unique job families
 */
export function getJobFamilies(): string[] {
  return [...new Set(salaryBenchmarks.map(b => b.jobFamily))].sort();
}

/**
 * Gets all job titles in a family
 */
export function getJobTitlesByFamily(family: string): string[] {
  return [...new Set(
    salaryBenchmarks
      .filter(b => b.jobFamily === family)
      .map(b => b.jobTitle)
  )].sort();
}

/**
 * Gets all unique job titles for autocomplete
 */
export function getAllJobTitles(): string[] {
  return [...new Set(salaryBenchmarks.map(b => b.jobTitle))].sort();
}

// Salary Benchmark Data
// This is sample data that can be expanded with real market data

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
}

export const salaryBenchmarks: SalaryBenchmark[] = [
  // Software & Tech
  { role: "Software Engineer", keywords: ["software", "developer", "programmer", "engineer", "coding"], entryRange: [70000, 95000], midRange: [100000, 140000], seniorRange: [150000, 220000], category: "tech" },
  { role: "Frontend Developer", keywords: ["frontend", "front-end", "react", "angular", "vue", "ui"], entryRange: [60000, 85000], midRange: [90000, 130000], seniorRange: [140000, 190000], category: "tech" },
  { role: "Backend Developer", keywords: ["backend", "back-end", "api", "server", "node", "python", "java"], entryRange: [65000, 90000], midRange: [95000, 135000], seniorRange: [145000, 200000], category: "tech" },
  { role: "Data Scientist", keywords: ["data scientist", "machine learning", "ml", "ai", "data science"], entryRange: [80000, 110000], midRange: [120000, 160000], seniorRange: [170000, 250000], category: "tech" },
  { role: "Data Analyst", keywords: ["data analyst", "analytics", "sql", "tableau", "power bi"], entryRange: [55000, 75000], midRange: [80000, 110000], seniorRange: [115000, 150000], category: "tech" },
  { role: "Product Manager", keywords: ["product manager", "pm", "product owner"], entryRange: [85000, 115000], midRange: [120000, 160000], seniorRange: [170000, 240000], category: "tech" },
  { role: "UX Designer", keywords: ["ux", "user experience", "ui/ux", "designer"], entryRange: [60000, 85000], midRange: [90000, 125000], seniorRange: [130000, 175000], category: "tech" },
  { role: "DevOps Engineer", keywords: ["devops", "site reliability", "sre", "infrastructure", "cloud"], entryRange: [75000, 100000], midRange: [110000, 150000], seniorRange: [160000, 220000], category: "tech" },
  { role: "QA Engineer", keywords: ["qa", "quality assurance", "testing", "test engineer"], entryRange: [55000, 75000], midRange: [80000, 110000], seniorRange: [115000, 150000], category: "tech" },
  
  // Business & Finance
  { role: "Financial Analyst", keywords: ["financial analyst", "finance", "fp&a", "financial planning"], entryRange: [55000, 75000], midRange: [80000, 110000], seniorRange: [120000, 170000], category: "finance" },
  { role: "Accountant", keywords: ["accountant", "accounting", "cpa", "bookkeeper"], entryRange: [50000, 65000], midRange: [70000, 95000], seniorRange: [100000, 140000], category: "finance" },
  { role: "Marketing Manager", keywords: ["marketing manager", "marketing director", "brand manager"], entryRange: [55000, 75000], midRange: [80000, 115000], seniorRange: [120000, 170000], category: "business" },
  { role: "Sales Representative", keywords: ["sales", "account executive", "sales rep", "bdr", "sdr"], entryRange: [45000, 65000], midRange: [70000, 100000], seniorRange: [110000, 180000], category: "business" },
  { role: "Project Manager", keywords: ["project manager", "pmo", "scrum master"], entryRange: [60000, 80000], midRange: [85000, 115000], seniorRange: [120000, 160000], category: "business" },
  { role: "Human Resources", keywords: ["hr", "human resources", "recruiter", "talent acquisition"], entryRange: [45000, 60000], midRange: [65000, 90000], seniorRange: [95000, 140000], category: "business" },
  { role: "Operations Manager", keywords: ["operations", "ops manager", "logistics"], entryRange: [55000, 75000], midRange: [80000, 110000], seniorRange: [115000, 160000], category: "business" },
  
  // Healthcare
  { role: "Registered Nurse", keywords: ["nurse", "rn", "registered nurse", "nursing"], entryRange: [55000, 70000], midRange: [75000, 95000], seniorRange: [100000, 130000], category: "healthcare" },
  { role: "Medical Assistant", keywords: ["medical assistant", "clinical assistant"], entryRange: [32000, 42000], midRange: [45000, 55000], seniorRange: [58000, 70000], category: "healthcare" },
  { role: "Pharmacist", keywords: ["pharmacist", "pharmacy"], entryRange: [110000, 125000], midRange: [130000, 145000], seniorRange: [150000, 175000], category: "healthcare" },
  
  // Education
  { role: "Teacher", keywords: ["teacher", "educator", "instructor", "teaching"], entryRange: [40000, 50000], midRange: [52000, 65000], seniorRange: [68000, 90000], category: "education" },
  { role: "Professor", keywords: ["professor", "lecturer", "academic"], entryRange: [60000, 80000], midRange: [85000, 110000], seniorRange: [115000, 160000], category: "education" },
  
  // Creative
  { role: "Graphic Designer", keywords: ["graphic designer", "visual designer", "design"], entryRange: [42000, 55000], midRange: [58000, 78000], seniorRange: [82000, 110000], category: "creative" },
  { role: "Content Writer", keywords: ["content writer", "copywriter", "writer", "content"], entryRange: [40000, 55000], midRange: [58000, 78000], seniorRange: [82000, 110000], category: "creative" },
  { role: "Video Editor", keywords: ["video editor", "editor", "post production"], entryRange: [40000, 55000], midRange: [58000, 80000], seniorRange: [85000, 120000], category: "creative" },
  
  // General
  { role: "Administrative Assistant", keywords: ["administrative", "admin", "assistant", "secretary"], entryRange: [32000, 42000], midRange: [45000, 55000], seniorRange: [58000, 72000], category: "general" },
  { role: "Customer Service", keywords: ["customer service", "support", "customer success"], entryRange: [32000, 42000], midRange: [45000, 58000], seniorRange: [60000, 78000], category: "general" },
];

export const locationMultipliers: LocationMultiplier[] = [
  { state: "California", multiplier: 1.25 },
  { state: "New York", multiplier: 1.20 },
  { state: "Washington", multiplier: 1.15 },
  { state: "Massachusetts", multiplier: 1.15 },
  { state: "Colorado", multiplier: 1.08 },
  { state: "Texas", multiplier: 1.00 },
  { state: "Illinois", multiplier: 1.02 },
  { state: "Florida", multiplier: 0.95 },
  { state: "Georgia", multiplier: 0.95 },
  { state: "North Carolina", multiplier: 0.92 },
  { state: "Ohio", multiplier: 0.90 },
  { state: "Pennsylvania", multiplier: 0.95 },
  { state: "Michigan", multiplier: 0.90 },
  { state: "Arizona", multiplier: 0.95 },
  { state: "Virginia", multiplier: 1.05 },
  { state: "Remote", multiplier: 1.00 },
  { state: "Other", multiplier: 0.95 },
];

export function findBenchmark(jobTitle: string): SalaryBenchmark | null {
  const normalizedTitle = jobTitle.toLowerCase().trim();
  
  // First try exact match
  const exactMatch = salaryBenchmarks.find(b => 
    b.role.toLowerCase() === normalizedTitle
  );
  if (exactMatch) return exactMatch;
  
  // Then try keyword match
  const keywordMatch = salaryBenchmarks.find(b =>
    b.keywords.some(kw => normalizedTitle.includes(kw))
  );
  if (keywordMatch) return keywordMatch;
  
  // Finally try partial match
  const partialMatch = salaryBenchmarks.find(b =>
    b.role.toLowerCase().split(' ').some(word => normalizedTitle.includes(word)) ||
    normalizedTitle.split(' ').some(word => b.role.toLowerCase().includes(word))
  );
  
  return partialMatch || null;
}

export function getLocationMultiplier(state: string): number {
  const found = locationMultipliers.find(l => 
    l.state.toLowerCase() === state.toLowerCase()
  );
  return found?.multiplier || 0.95;
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

// Career Tools Data Definitions
export interface CareerToolDef {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: 'active' | 'coming-soon';
}

export const careerTools: CareerToolDef[] = [
  { 
    id: "resume-builder", 
    name: "Resume Builder", 
    slug: "resume-builder", 
    description: "Create a clean, ATS-friendly resume and download it as PDF.", 
    category: "documents",
    status: 'active'
  },
  { 
    id: "cover-letter-generator", 
    name: "Cover Letter Generator", 
    slug: "cover-letter-generator", 
    description: "Generate structured, professional cover letters quickly.", 
    category: "documents",
    status: 'active'
  },
  { 
    id: "salary-comparison", 
    name: "Salary Comparison Tool", 
    slug: "salary-comparison", 
    description: "Compare your salary against market benchmarks.", 
    category: "salary",
    status: 'active'
  },
  { 
    id: "am-i-underpaid", 
    name: "Am I Underpaid?", 
    slug: "am-i-underpaid", 
    description: "Find out if your compensation is below market.", 
    category: "salary",
    status: 'active'
  },
  { 
    id: "resume-score", 
    name: "Resume Score", 
    slug: "resume-score", 
    description: "Evaluate your resume's completeness and readability.", 
    category: "assessment",
    status: 'active'
  },
  { 
    id: "job-readiness-score", 
    name: "Job Readiness Score", 
    slug: "job-readiness-score", 
    description: "Get a snapshot of your overall job search readiness.", 
    category: "assessment",
    status: 'active'
  },
  { 
    id: "offer-comparison", 
    name: "Offer Comparison Tool", 
    slug: "offer-comparison", 
    description: "Compare multiple job offers side by side with total compensation.", 
    category: "salary",
    status: 'active'
  },
  { 
    id: "salary-negotiation", 
    name: "Salary Negotiation Helper", 
    slug: "salary-negotiation", 
    description: "Prepare for salary negotiations with data and scripts.", 
    category: "salary",
    status: 'active'
  },
  { 
    id: "interview-prep", 
    name: "Interview Prep Tool", 
    slug: "interview-prep", 
    description: "Organize questions, practice answers, and track interviews.", 
    category: "assessment",
    status: 'active'
  },
  { 
    id: "email-templates", 
    name: "Email Templates", 
    slug: "email-templates", 
    description: "Generate professional follow-up, thank you, and negotiation emails with AI.", 
    category: "documents",
    status: 'active'
  },
];

export const careerToolCategories = [
  { id: "documents", name: "Documents & Applications" },
  { id: "salary", name: "Salary & Compensation" },
  { id: "assessment", name: "Self Assessment" }
];

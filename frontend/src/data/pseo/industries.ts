// 20 industries used as the second segment of /contract-template/[type]/[industry].
// Each industry has specific trait tags that drive deterministic variation copy
// (e.g. "regulated", "B2C-heavy") and a list of common clauses worth highlighting.
export interface Industry {
  slug: string;
  name: string;
  /** Plural noun for headings */
  plural: string;
  /** One-sentence description for cards */
  shortDesc: string;
  /** Industry traits — used to inject specific copy into pages */
  traits: ("regulated" | "creative" | "technical" | "service" | "b2c" | "b2b" | "trades" | "professional" | "high-risk")[];
  /** Industry-specific clauses or considerations worth flagging on contract pages */
  considerations: string[];
  /** Industry-specific examples to use in pricing / scope examples */
  pricingExample: string;
}

export const INDUSTRIES: Industry[] = [
  {
    slug: "freelancers", name: "Freelancers", plural: "Freelancers",
    shortDesc: "Independent contractors and solo creatives.",
    traits: ["service", "b2b"],
    considerations: ["1099 classification (vs W-2 employee)", "Late payment fees (1.5%/mo standard)", "Kill fee on cancellation", "IP transfer on final payment only"],
    pricingExample: "Hourly $50–$200 or project flat fee.",
  },
  {
    slug: "photographers", name: "Photographers", plural: "Photographers",
    shortDesc: "Wedding, portrait, commercial, and event photographers.",
    traits: ["creative", "service", "b2c"],
    considerations: ["Print release and usage rights", "Cancellation/reschedule policy (weddings)", "Retainer (typically 25–50% non-refundable)", "Force majeure (weather, illness)"],
    pricingExample: "Half-day $600, full-day $1,200, wedding $3,500+.",
  },
  {
    slug: "videographers", name: "Videographers", plural: "Videographers",
    shortDesc: "Wedding, corporate, and content videographers.",
    traits: ["creative", "service", "technical"],
    considerations: ["Music licensing responsibility", "Raw footage ownership", "Drone permits and FAA Part 107", "Editing turnaround (4–8 weeks typical)"],
    pricingExample: "Shoot day $1,500 + editing $100/hr.",
  },
  {
    slug: "web-developers", name: "Web Developers", plural: "Web Developers",
    shortDesc: "Front-end, back-end, and full-stack developers.",
    traits: ["technical", "service", "b2b"],
    considerations: ["Source code ownership at final payment", "Third-party plugin and library licensing", "Hosting and domain responsibility", "Browser/device support scope"],
    pricingExample: "$75–$250/hr or $5K–$50K per site.",
  },
  {
    slug: "graphic-designers", name: "Graphic Designers", plural: "Graphic Designers",
    shortDesc: "Logo, branding, print and digital designers.",
    traits: ["creative", "service"],
    considerations: ["Revision rounds (3 standard)", "File formats delivered (AI, EPS, SVG)", "Designer portfolio rights", "Stock photo and font licensing"],
    pricingExample: "Logo $500–$5,000, brand identity $2,500–$15,000.",
  },
  {
    slug: "consultants", name: "Consultants", plural: "Consultants",
    shortDesc: "Strategy, management, and industry consultants.",
    traits: ["service", "professional", "b2b"],
    considerations: ["Conflict of interest disclosure", "Out-of-pocket expense policy", "Non-solicit of client employees", "Deliverable IP ownership"],
    pricingExample: "$200–$600/hr or $5K–$50K/month retainer.",
  },
  {
    slug: "coaches", name: "Coaches", plural: "Coaches",
    shortDesc: "Life, business, executive, and wellness coaches.",
    traits: ["service", "b2c", "professional"],
    considerations: ["Disclaimer: not therapy/legal/financial advice", "Refund and cancellation policy", "Confidentiality of coaching content", "Outcomes not guaranteed"],
    pricingExample: "Sessions $150–$500, packages $1,500–$15,000.",
  },
  {
    slug: "real-estate-agents", name: "Real Estate Agents", plural: "Real Estate Agents",
    shortDesc: "Licensed agents and brokers.",
    traits: ["regulated", "service", "professional"],
    considerations: ["State licensing disclosure", "Commission split disclosure", "Agency relationship (buyer's vs seller's agent)", "Dual agency consent if applicable"],
    pricingExample: "Typically commission-based (5–6% on residential).",
  },
  {
    slug: "contractors", name: "General Contractors", plural: "General Contractors",
    shortDesc: "Construction, remodeling, and trades contractors.",
    traits: ["trades", "high-risk", "regulated"],
    considerations: ["Workers' comp and liability insurance", "Permits and code compliance", "Lien waivers from subs", "Change order process and pricing"],
    pricingExample: "Cost-plus 15–25% or fixed bid.",
  },
  {
    slug: "musicians", name: "Musicians", plural: "Musicians",
    shortDesc: "Solo artists, bands, DJs, and session musicians.",
    traits: ["creative", "service", "b2c"],
    considerations: ["Performance rights (PRO licensing)", "Recording ownership (masters vs publishing)", "Sample clearances", "Cancellation due to illness"],
    pricingExample: "Gig $300–$3,000, recording $50–$200/hr.",
  },
  {
    slug: "writers", name: "Writers", plural: "Writers",
    shortDesc: "Copywriters, journalists, ghostwriters, technical writers.",
    traits: ["creative", "service"],
    considerations: ["Byline credit (or ghostwriting)", "Kill fee on rejected work (25–50%)", "Rights granted (first serial, all-rights, etc.)", "Revision rounds"],
    pricingExample: "$0.10–$2/word or $300–$5,000/article.",
  },
  {
    slug: "accountants", name: "Accountants", plural: "Accountants",
    shortDesc: "CPAs, bookkeepers, and tax professionals.",
    traits: ["regulated", "professional", "service"],
    considerations: ["Engagement letter requirement (AICPA)", "Privileged communication (not as protected as attorney-client)", "Tax position disclosure", "Document retention (7+ years)"],
    pricingExample: "$150–$500/hr or fixed-fee tax returns.",
  },
  {
    slug: "lawyers", name: "Lawyers", plural: "Lawyers",
    shortDesc: "Solo practitioners and small firms.",
    traits: ["regulated", "professional", "high-risk"],
    considerations: ["Bar ethics rules on fee arrangements", "Conflict of interest waivers", "Attorney-client privilege scope", "Trust account (IOLTA) handling"],
    pricingExample: "$200–$1,000/hr, contingency, or flat fee.",
  },
  {
    slug: "personal-trainers", name: "Personal Trainers", plural: "Personal Trainers",
    shortDesc: "Fitness coaches and personal trainers.",
    traits: ["service", "b2c", "high-risk"],
    considerations: ["Liability waiver and assumption of risk", "Health questionnaire (PAR-Q)", "Certification disclosure", "Refund and pause policy"],
    pricingExample: "Sessions $50–$175, packages $400–$2,500.",
  },
  {
    slug: "small-businesses", name: "Small Businesses", plural: "Small Businesses",
    shortDesc: "Small business owners — services, retail, e-commerce.",
    traits: ["b2b", "service"],
    considerations: ["EIN vs SSN on contracts", "Insurance requirements (general liability)", "State-specific labor laws", "Late payment terms (Net 14–30)"],
    pricingExample: "Varies widely by industry.",
  },
  {
    slug: "startups", name: "Startups", plural: "Startups",
    shortDesc: "Early-stage and venture-backed companies.",
    traits: ["b2b", "technical"],
    considerations: ["Equity grants and 83(b) elections", "IP assignment from all contractors", "Investor approval rights on key contracts", "Confidentiality (pre-launch products)"],
    pricingExample: "Cash, equity, or both — early-stage rates lower than corporate.",
  },
  {
    slug: "ecommerce", name: "E-commerce", plural: "E-commerce Businesses",
    shortDesc: "Online retailers and DTC brands.",
    traits: ["b2c", "technical"],
    considerations: ["Privacy policy and GDPR/CCPA compliance", "Payment processor compliance (PCI)", "Return and refund policy", "Inventory and supply-chain risk"],
    pricingExample: "Project pricing varies; SaaS tools often subscription.",
  },
  {
    slug: "agencies", name: "Marketing Agencies", plural: "Marketing Agencies",
    shortDesc: "Marketing, advertising, and digital agencies.",
    traits: ["b2b", "service", "creative"],
    considerations: ["Retainer vs project pricing", "Performance metrics and reporting cadence", "Right to terminate on notice", "Client approval on creative deliverables"],
    pricingExample: "Retainer $2K–$25K/month or project-based.",
  },
  {
    slug: "tutors", name: "Tutors", plural: "Tutors",
    shortDesc: "Academic, test-prep, and language tutors.",
    traits: ["service", "b2c"],
    considerations: ["Working with minors (background check)", "Cancellation window (24-hour notice)", "Outcomes not guaranteed (test scores, grades)", "Confidentiality of student work"],
    pricingExample: "$30–$150/hr or package pricing.",
  },
  {
    slug: "event-planners", name: "Event Planners", plural: "Event Planners",
    shortDesc: "Wedding, corporate, and private event planners.",
    traits: ["service", "b2c"],
    considerations: ["Vendor coordination liability", "Force majeure (weather, pandemic)", "Cancellation and rebooking fees", "Insurance requirements"],
    pricingExample: "Day-of $1,500, full planning $5,000–$25,000.",
  },
];

export const getIndustry = (slug: string) => INDUSTRIES.find((i) => i.slug === slug);

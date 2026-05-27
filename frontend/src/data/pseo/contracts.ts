// 30 contract types mapped to 12 hand-crafted base templates.
// Each contract type has search-intent keywords, default duration, and
// the SHORT plain-English summary that drives the page intro.
export type BaseTemplateId =
  | "nda"
  | "msa"
  | "service-agreement"
  | "independent-contractor"
  | "photography"
  | "web-design"
  | "consulting"
  | "non-compete"
  | "license"
  | "employment-offer"
  | "partnership"
  | "sales";

export interface ContractType {
  slug: string;
  name: string;
  /** Plural noun for headings */
  plural: string;
  /** The base template this contract type maps to */
  baseTemplate: BaseTemplateId;
  /** Short blurb (1 sentence) shown in cards + meta description */
  shortDesc: string;
  /** Longer 2–3 sentence intro for the page hero */
  longDesc: string;
  /** Default term length, e.g. "Project-based", "12 months", "Indefinite" */
  defaultTerm: string;
  /** Whether this contract is typically B2B or B2C (drives variation copy) */
  audience: "b2b" | "b2c" | "either";
  /** Key clauses (plain English) — used as a bullet list */
  keyClauses: string[];
  /** Search-volume rank (1 = highest) — used to sort the hub */
  rank: number;
}

export const CONTRACT_TYPES: ContractType[] = [
  // === NDA family (1) ===
  {
    slug: "nda", name: "Non-Disclosure Agreement", plural: "Non-Disclosure Agreements",
    baseTemplate: "nda", audience: "either", rank: 1, defaultTerm: "2 years from disclosure",
    shortDesc: "Protects confidential information shared between parties.",
    longDesc: "A Non-Disclosure Agreement (NDA) keeps sensitive business information confidential. It's the first document signed before sharing trade secrets, financials, product roadmaps, or client lists.",
    keyClauses: ["Definition of 'Confidential Information'", "Permitted uses & exceptions", "Duration of confidentiality (typically 2–5 years)", "Return or destruction of materials", "Remedies for breach (injunction + damages)"],
  },
  {
    slug: "mutual-nda", name: "Mutual NDA", plural: "Mutual NDAs",
    baseTemplate: "nda", audience: "b2b", rank: 2, defaultTerm: "3 years",
    shortDesc: "Two-way NDA where both parties exchange confidential information.",
    longDesc: "A Mutual Non-Disclosure Agreement protects both parties when sensitive information flows in both directions — common during M&A discussions, partnerships, joint ventures, and supplier negotiations.",
    keyClauses: ["Bilateral confidentiality (both parties protected)", "Definition of Confidential Information", "Exclusions (publicly known, independently developed)", "Term and survival", "Return of materials on request"],
  },
  {
    slug: "one-way-nda", name: "One-Way NDA", plural: "One-Way NDAs",
    baseTemplate: "nda", audience: "b2b", rank: 9, defaultTerm: "2 years",
    shortDesc: "One-way NDA protecting only the disclosing party.",
    longDesc: "A One-Way NDA is used when only one party is sharing confidential information — for example, when interviewing contractors, talking to investors, or hiring an employee who'll see your IP.",
    keyClauses: ["Unilateral confidentiality obligations", "Defined Confidential Information", "No license granted", "Term and survival", "Equitable remedies for breach"],
  },

  // === Service / contractor family ===
  {
    slug: "service-agreement", name: "Service Agreement", plural: "Service Agreements",
    baseTemplate: "service-agreement", audience: "b2b", rank: 3, defaultTerm: "Project-based",
    shortDesc: "Defines services, deliverables, timelines, and payment terms.",
    longDesc: "A Service Agreement spells out exactly what work will be performed, when it will be delivered, and how much it costs. It protects both client and service provider from scope creep, late payments, and miscommunication.",
    keyClauses: ["Scope of services (Statement of Work)", "Payment terms and milestones", "Timeline and deliverables", "Revisions and change orders", "Termination and refund policy", "Ownership of work product"],
  },
  {
    slug: "master-services-agreement", name: "Master Services Agreement", plural: "Master Services Agreements",
    baseTemplate: "msa", audience: "b2b", rank: 5, defaultTerm: "12 months, auto-renewing",
    shortDesc: "Umbrella contract covering multiple future SOWs with one client.",
    longDesc: "A Master Services Agreement (MSA) is the umbrella contract for ongoing work — it sets the general terms once, then individual Statements of Work (SOWs) handle the per-project scope and pricing.",
    keyClauses: ["General terms and definitions", "How Statements of Work attach", "Invoicing and net payment terms", "Liability caps and indemnification", "Confidentiality and IP ownership", "Term, renewal and termination"],
  },
  {
    slug: "independent-contractor-agreement", name: "Independent Contractor Agreement", plural: "Independent Contractor Agreements",
    baseTemplate: "independent-contractor", audience: "b2b", rank: 4, defaultTerm: "Project-based or 1099-year",
    shortDesc: "Defines the worker as 1099, not W-2 — critical for tax & labor classification.",
    longDesc: "An Independent Contractor Agreement is what businesses sign with 1099 freelancers. The most important section isn't the rate — it's the clauses that establish the worker as a contractor (not an employee) under IRS and state rules.",
    keyClauses: ["1099 classification (control, tools, schedule)", "Scope and deliverables", "Payment terms and invoicing", "Confidentiality and work-product ownership", "Termination", "No employee benefits / employer taxes"],
  },
  {
    slug: "freelance-contract", name: "Freelance Contract", plural: "Freelance Contracts",
    baseTemplate: "independent-contractor", audience: "b2b", rank: 6, defaultTerm: "Project-based",
    shortDesc: "Lighter-weight freelance agreement for one-off creative or technical projects.",
    longDesc: "A Freelance Contract is what most independent creators send before kicking off a project. It's shorter and faster to sign than a full MSA, while still covering scope, payment, and IP.",
    keyClauses: ["Scope and deliverables", "Pricing and payment schedule", "Revision rounds included", "Late payment fees (1.5%/mo standard)", "Kill fee on cancellation", "IP transfer on final payment"],
  },
  {
    slug: "subcontractor-agreement", name: "Subcontractor Agreement", plural: "Subcontractor Agreements",
    baseTemplate: "independent-contractor", audience: "b2b", rank: 22, defaultTerm: "Project-based",
    shortDesc: "Used when one contractor hires another to perform part of a job.",
    longDesc: "A Subcontractor Agreement is used when the primary contractor on a project brings in another contractor to handle specific work — common in trades, construction, and agency work.",
    keyClauses: ["Specific scope assigned to subcontractor", "Coordination with primary contractor", "Insurance and indemnification", "Payment terms (often net 30 from primary)", "Non-solicitation of primary's client"],
  },

  // === Photography / creative family ===
  {
    slug: "photography-contract", name: "Photography Contract", plural: "Photography Contracts",
    baseTemplate: "photography", audience: "either", rank: 8, defaultTerm: "Event-based",
    shortDesc: "Wedding, portrait, commercial photography service contract.",
    longDesc: "A Photography Contract protects both photographer and client — covering shoot day, deliverables, usage rights, and cancellation policy. Especially critical for weddings and events where rescheduling is common.",
    keyClauses: ["Shoot date, location, and hours", "Deliverables (number of edited photos)", "Usage rights and print release", "Cancellation and reschedule policy", "Retainer and final payment", "Force majeure (weather, illness)"],
  },
  {
    slug: "videography-contract", name: "Videography Contract", plural: "Videography Contracts",
    baseTemplate: "photography", audience: "either", rank: 12, defaultTerm: "Event-based",
    shortDesc: "Wedding, commercial, or corporate videography contract.",
    longDesc: "A Videography Contract covers shoot day, editing turnaround, deliverable format, and usage rights. Includes specific clauses for drone footage, music licensing, and raw footage ownership.",
    keyClauses: ["Shoot details and duration", "Editing timeline (typically 4–8 weeks)", "Delivery format (mp4, 4K, etc.)", "Music licensing responsibility", "Raw footage ownership", "Usage rights (personal vs commercial)"],
  },
  {
    slug: "model-release", name: "Model Release", plural: "Model Releases",
    baseTemplate: "photography", audience: "either", rank: 20, defaultTerm: "Perpetual",
    shortDesc: "Subject's consent to use their image in photos or video.",
    longDesc: "A Model Release is a written consent from a person appearing in a photo or video, granting the creator the right to use their likeness commercially. Required for any image that will be sold, licensed, or used in advertising.",
    keyClauses: ["Identification of subject", "Identification of photographer/videographer", "Specific rights granted (commercial, editorial)", "Geographic and time scope", "Compensation (paid or unpaid)", "Minor consent (parent/guardian)"],
  },

  // === Web / design / IP family ===
  {
    slug: "web-design-agreement", name: "Web Design Agreement", plural: "Web Design Agreements",
    baseTemplate: "web-design", audience: "b2b", rank: 10, defaultTerm: "Project-based",
    shortDesc: "Web design + development contract: scope, milestones, IP ownership.",
    longDesc: "A Web Design Agreement is the standard contract between a web designer/developer and client. Key clauses cover ownership of the final site, third-party plugin licensing, ongoing maintenance, and what happens if the client doesn't pay.",
    keyClauses: ["Scope: pages, features, integrations", "Design revision rounds (typically 2)", "Payment milestones (50% deposit standard)", "Hosting and domain responsibility", "Site ownership transfer on final payment", "Post-launch maintenance terms"],
  },
  {
    slug: "graphic-design-contract", name: "Graphic Design Contract", plural: "Graphic Design Contracts",
    baseTemplate: "web-design", audience: "b2b", rank: 11, defaultTerm: "Project-based",
    shortDesc: "Logo, branding, or graphic design service contract.",
    longDesc: "A Graphic Design Contract covers logo, brand identity, print, and digital design work. The most important clauses define revision rounds, file delivery format, and when IP rights transfer.",
    keyClauses: ["Scope and deliverables", "Revision rounds (3 standard)", "File formats delivered (AI, EPS, PNG)", "Kill fee on cancellation", "Designer portfolio rights", "IP transfer on final payment"],
  },
  {
    slug: "copyright-assignment", name: "Copyright Assignment", plural: "Copyright Assignments",
    baseTemplate: "license", audience: "either", rank: 25, defaultTerm: "Perpetual",
    shortDesc: "Full transfer of copyright ownership from creator to buyer.",
    longDesc: "A Copyright Assignment fully transfers ownership of a creative work from the original creator to the buyer. Unlike a license, the original creator retains no rights after assignment.",
    keyClauses: ["Identification of the work", "Effective date of transfer", "Consideration (payment)", "Warranties of original authorship", "Moral rights waiver where applicable", "Governing law"],
  },
  {
    slug: "licensing-agreement", name: "Licensing Agreement", plural: "Licensing Agreements",
    baseTemplate: "license", audience: "b2b", rank: 14, defaultTerm: "1–10 years",
    shortDesc: "Grants permission to use IP without transferring ownership.",
    longDesc: "A Licensing Agreement lets a buyer use IP (software, music, brand, patent, etc.) without buying full ownership. Includes territory, exclusivity, and royalty terms.",
    keyClauses: ["License scope (what is being licensed)", "Exclusive vs non-exclusive", "Territory and duration", "Royalty rate and payment schedule", "Quality control and approval rights", "Termination triggers"],
  },

  // === Consulting / advisory family ===
  {
    slug: "consulting-agreement", name: "Consulting Agreement", plural: "Consulting Agreements",
    baseTemplate: "consulting", audience: "b2b", rank: 7, defaultTerm: "3–12 months",
    shortDesc: "Engages a consultant for advisory or specialist work.",
    longDesc: "A Consulting Agreement engages an expert to provide advisory services — typically billed hourly, daily, or monthly. The most important clauses cover IP ownership of consultant work product and conflicts of interest.",
    keyClauses: ["Scope of consulting services", "Compensation (hourly/retainer/project)", "Expense reimbursement policy", "Confidentiality and IP", "Non-solicitation of client team", "Termination on notice"],
  },
  {
    slug: "coaching-agreement", name: "Coaching Agreement", plural: "Coaching Agreements",
    baseTemplate: "consulting", audience: "b2c", rank: 17, defaultTerm: "3–12 months",
    shortDesc: "1:1 coaching contract (life, business, executive).",
    longDesc: "A Coaching Agreement is the standard contract between a coach and client. The most important clauses are the 'no professional advice' disclaimer (you're a coach, not a therapist/lawyer/financial advisor) and the refund/cancellation policy.",
    keyClauses: ["Number and length of sessions", "Payment and refund policy", "Confidentiality of coaching content", "Disclaimer (not therapy, legal, financial advice)", "Client responsibility and outcomes", "Cancellation and rescheduling"],
  },
  {
    slug: "advisor-agreement", name: "Advisor Agreement", plural: "Advisor Agreements",
    baseTemplate: "consulting", audience: "b2b", rank: 19, defaultTerm: "24 months",
    shortDesc: "Startup advisor agreement, typically with equity grants.",
    longDesc: "An Advisor Agreement (sometimes called an Advisory Board Agreement) is what startups sign with formal advisors. The key difference vs a consulting agreement is the equity component — typically 0.25–1% over 24 months.",
    keyClauses: ["Time commitment (hrs per month)", "Equity grant and vesting schedule", "Confidentiality", "No conflict with current employer", "IP ownership (created in advisor capacity)", "Term and termination"],
  },

  // === Restrictive covenants ===
  {
    slug: "non-compete", name: "Non-Compete Agreement", plural: "Non-Compete Agreements",
    baseTemplate: "non-compete", audience: "b2b", rank: 13, defaultTerm: "6–24 months post-departure",
    shortDesc: "Restricts working with competitors for a defined period.",
    longDesc: "A Non-Compete Agreement restricts a former employee, contractor, or business partner from working with direct competitors. Enforceability varies wildly by state — California, North Dakota, and Oklahoma generally prohibit non-competes; the FTC has signaled future federal restrictions.",
    keyClauses: ["Defined 'competitor' and 'competing activity'", "Duration (6–24 months typical)", "Geographic scope (must be reasonable)", "Carve-outs for general industry knowledge", "Consideration (what is being given in exchange)", "Severability clause"],
  },
  {
    slug: "non-solicitation", name: "Non-Solicitation Agreement", plural: "Non-Solicitation Agreements",
    baseTemplate: "non-compete", audience: "b2b", rank: 18, defaultTerm: "12–24 months",
    shortDesc: "Restricts poaching of employees, contractors, or clients.",
    longDesc: "A Non-Solicitation Agreement prevents a departing person from poaching the company's employees, contractors, or customers. These are generally more enforceable than full non-competes because they're narrower.",
    keyClauses: ["Definition of 'solicit' (active vs passive)", "Protected parties (employees, contractors, clients)", "Duration (1–2 years typical)", "Carve-out for general advertising", "Severability and modifications"],
  },

  // === Employment family ===
  {
    slug: "employment-offer-letter", name: "Employment Offer Letter", plural: "Employment Offer Letters",
    baseTemplate: "employment-offer", audience: "b2b", rank: 15, defaultTerm: "At-will / fixed-term",
    shortDesc: "Formal job offer with role, compensation, and start date.",
    longDesc: "An Employment Offer Letter is the formal extension of a job offer. It documents the role, compensation, start date, and at-will status. Critically, it usually references but doesn't replace a full employment agreement.",
    keyClauses: ["Role and reporting structure", "Compensation (salary, bonus, equity)", "Start date and onboarding", "At-will employment statement", "Confidentiality and IP assignment reference", "Contingencies (background check, references)"],
  },
  {
    slug: "internship-agreement", name: "Internship Agreement", plural: "Internship Agreements",
    baseTemplate: "employment-offer", audience: "b2b", rank: 26, defaultTerm: "3–6 months",
    shortDesc: "Defines paid/unpaid intern relationship and expectations.",
    longDesc: "An Internship Agreement defines the relationship between a company and an intern. For US unpaid internships, it must satisfy the Department of Labor's 7-factor 'primary beneficiary' test or the intern must be paid minimum wage.",
    keyClauses: ["Duration and schedule", "Paid vs unpaid (DOL test for unpaid)", "Educational objectives", "Mentorship and learning outcomes", "Confidentiality and IP", "Not a guarantee of full-time employment"],
  },
  {
    slug: "severance-agreement", name: "Severance Agreement", plural: "Severance Agreements",
    baseTemplate: "employment-offer", audience: "b2b", rank: 24, defaultTerm: "One-time",
    shortDesc: "Settles the terms of an employee departure in exchange for release.",
    longDesc: "A Severance Agreement is offered when an employee is laid off or terminated. In exchange for severance pay, the employee signs a release of claims against the company. For employees 40+, the OWBPA requires specific waiver language.",
    keyClauses: ["Severance amount and payment timing", "Release of claims against employer", "Continued benefits (COBRA)", "Return of company property", "Non-disparagement (mutual or one-way)", "ADEA waiver if employee is 40+"],
  },

  // === Partnership / equity ===
  {
    slug: "partnership-agreement", name: "Partnership Agreement", plural: "Partnership Agreements",
    baseTemplate: "partnership", audience: "b2b", rank: 16, defaultTerm: "Indefinite",
    shortDesc: "Governs the formation and operation of a business partnership.",
    longDesc: "A Partnership Agreement governs a general or limited partnership — who contributes what, who decides what, how profits are split, and what happens when someone wants out. Without one, your partnership defaults to your state's UPA rules, which usually aren't what anyone wants.",
    keyClauses: ["Capital contributions of each partner", "Profit/loss allocation", "Management and decision rights", "Partner draws and distributions", "Admission of new partners", "Dissolution and buyout terms"],
  },
  {
    slug: "operating-agreement", name: "LLC Operating Agreement", plural: "LLC Operating Agreements",
    baseTemplate: "partnership", audience: "b2b", rank: 21, defaultTerm: "Indefinite",
    shortDesc: "Governs a Limited Liability Company's internal operations.",
    longDesc: "An LLC Operating Agreement is the LLC equivalent of a partnership agreement. It governs ownership percentages, voting rights, profit distributions, and what happens when a member wants out. Many states don't legally require it — but going without one is malpractice.",
    keyClauses: ["Member ownership percentages", "Capital contributions and additional calls", "Profit/loss allocation and distributions", "Manager-managed vs member-managed", "Transfer restrictions on membership interest", "Dissolution and winding up"],
  },
  {
    slug: "shareholder-agreement", name: "Shareholder Agreement", plural: "Shareholder Agreements",
    baseTemplate: "partnership", audience: "b2b", rank: 27, defaultTerm: "Until exit",
    shortDesc: "Governs the rights and obligations of corporate shareholders.",
    longDesc: "A Shareholder Agreement supplements a corporation's bylaws by governing the specific rights of shareholders — transfer restrictions, drag-along/tag-along, ROFR, board representation, and exit triggers.",
    keyClauses: ["Share classes and ownership", "Transfer restrictions and ROFR", "Drag-along and tag-along rights", "Board composition", "Distributions and dividends", "Buyout on death, disability, or departure"],
  },

  // === Sales / commercial ===
  {
    slug: "sales-contract", name: "Sales Contract", plural: "Sales Contracts",
    baseTemplate: "sales", audience: "either", rank: 23, defaultTerm: "Transactional",
    shortDesc: "Governs the sale of goods or services.",
    longDesc: "A Sales Contract documents the sale of goods or services — what's being sold, for how much, when delivery happens, and who bears the risk of loss. For goods over $500 in the US, the Uniform Commercial Code (UCC) requires a written contract.",
    keyClauses: ["Description of goods/services", "Price and payment terms", "Delivery date and shipping terms (FOB)", "Warranties (express and implied)", "Risk of loss transfer", "Remedies for breach and dispute resolution"],
  },
  {
    slug: "purchase-agreement", name: "Purchase Agreement", plural: "Purchase Agreements",
    baseTemplate: "sales", audience: "either", rank: 28, defaultTerm: "One-time",
    shortDesc: "Defines the terms of a purchase between buyer and seller.",
    longDesc: "A Purchase Agreement is a contract for the sale of a specific item — real estate, a business, vehicles, equipment, or other significant assets. It's longer than a basic sales contract because it includes due diligence, closing conditions, and reps & warranties.",
    keyClauses: ["Description of asset being purchased", "Purchase price and payment structure", "Due diligence period", "Reps and warranties of seller", "Closing conditions and date", "Indemnification post-closing"],
  },
  {
    slug: "lease-agreement", name: "Lease Agreement", plural: "Lease Agreements",
    baseTemplate: "sales", audience: "either", rank: 29, defaultTerm: "12 months",
    shortDesc: "Governs the rental of property, equipment, or vehicles.",
    longDesc: "A Lease Agreement documents the rental of property, equipment, or vehicles. Residential leases are heavily regulated by state landlord-tenant law; commercial leases have far more flexibility (and complexity).",
    keyClauses: ["Description of leased property", "Lease term and renewal options", "Rent amount and payment schedule", "Security deposit terms", "Maintenance and repair responsibilities", "Default and eviction procedures"],
  },
  {
    slug: "bill-of-sale", name: "Bill of Sale", plural: "Bills of Sale",
    baseTemplate: "sales", audience: "either", rank: 30, defaultTerm: "One-time",
    shortDesc: "Records the transfer of ownership of personal property.",
    longDesc: "A Bill of Sale is a simple document that records the transfer of ownership of personal property — most commonly used for vehicles, boats, equipment, livestock, and used goods. Many states require it to register vehicles.",
    keyClauses: ["Seller and buyer identification", "Description of item sold", "Sale price and date", "'As-is' or warranty status", "Acknowledgment that ownership has transferred", "Signatures of both parties (notarized if required)"],
  },
];

export const getContractType = (slug: string) => CONTRACT_TYPES.find((c) => c.slug === slug);

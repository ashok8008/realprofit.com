// 12 hand-crafted base contract templates.
// Each template returns plain-English placeholder text. NOT legal advice.
// `{{INDUSTRY}}` and `{{CONTRACT_NAME}}` are simple string substitutions
// performed at render time by /contract-template/[type]/[industry] pages.
import type { BaseTemplateId } from "./contracts";

export interface BaseTemplate {
  id: BaseTemplateId;
  /** Section headings + body paragraphs that show in the preview block */
  sections: { heading: string; body: string }[];
}

export const BASE_TEMPLATES: Record<BaseTemplateId, BaseTemplate> = {
  nda: {
    id: "nda",
    sections: [
      { heading: "1. Parties", body: "This Non-Disclosure Agreement ('Agreement') is entered into on [DATE] between [DISCLOSING PARTY] and [RECEIVING PARTY] for the purpose of discussing potential business in {{INDUSTRY}}." },
      { heading: "2. Confidential Information", body: "'Confidential Information' means all non-public business, technical, financial and operational information disclosed by one party to the other, in any form, that is marked confidential or that a reasonable person would understand to be confidential." },
      { heading: "3. Obligations", body: "The Receiving Party agrees to: (a) keep Confidential Information strictly confidential, (b) use it only to evaluate the contemplated business relationship, (c) limit access to employees and advisors with a need to know, and (d) not reverse engineer or analyze any disclosed materials." },
      { heading: "4. Exclusions", body: "These obligations do not apply to information that is publicly known, independently developed without reference to Confidential Information, or required to be disclosed by law (with prior notice where lawful)." },
      { heading: "5. Term", body: "This Agreement remains in effect for two (2) years from the date of signature, with confidentiality obligations surviving for an additional three (3) years thereafter." },
      { heading: "6. Remedies", body: "The parties agree that monetary damages alone may be inadequate for breach of this Agreement, and the disclosing party may seek injunctive relief in addition to any other remedies available." },
    ],
  },
  msa: {
    id: "msa",
    sections: [
      { heading: "1. Master Terms", body: "This Master Services Agreement ('MSA') governs all services provided by [SERVICE PROVIDER] to [CLIENT] under one or more Statements of Work ('SOW') executed during the term of this MSA, applicable to projects in {{INDUSTRY}}." },
      { heading: "2. Statements of Work", body: "Each SOW will reference this MSA and specify: (a) scope of services, (b) deliverables and milestones, (c) timeline, (d) fees and invoicing schedule, and (e) any project-specific terms. In conflict, the SOW controls over this MSA only for project-specific matters." },
      { heading: "3. Invoicing & Payment", body: "Service Provider will invoice Client according to the SOW. All invoices are payable within thirty (30) days. Past-due amounts accrue interest at 1.5% per month or the maximum allowed by law, whichever is less." },
      { heading: "4. Confidentiality", body: "Each party will treat the other's non-public information as confidential and use it only to perform under this MSA. Obligations survive for three (3) years after termination." },
      { heading: "5. IP Ownership", body: "Upon full payment, Client owns the final deliverables. Service Provider retains its pre-existing IP and the right to use general know-how, techniques, and skills in other engagements." },
      { heading: "6. Liability & Indemnification", body: "Service Provider's total liability under this MSA is capped at fees paid in the twelve (12) months preceding the claim. Neither party is liable for indirect, consequential or punitive damages." },
      { heading: "7. Term & Termination", body: "Initial term: twelve (12) months, automatically renewing for successive one-year periods unless either party gives sixty (60) days written notice. Either party may terminate for material breach with thirty (30) days notice if uncured." },
    ],
  },
  "service-agreement": {
    id: "service-agreement",
    sections: [
      { heading: "1. Services", body: "[SERVICE PROVIDER] will perform the services described in Exhibit A ('Services') for [CLIENT] in the field of {{INDUSTRY}}. Any changes to Services require a written change order signed by both parties." },
      { heading: "2. Timeline", body: "Services will commence on [START DATE] and be completed by [END DATE], subject to timely Client review and approvals. Delays caused by Client extend the timeline day-for-day." },
      { heading: "3. Fees & Payment", body: "Client agrees to pay total fees of $[AMOUNT] according to the milestone schedule in Exhibit B. A non-refundable deposit of [DEPOSIT %] is due upon signing. Final payment is due upon delivery of final deliverables." },
      { heading: "4. Revisions", body: "Fees include [NUMBER] rounds of revisions per deliverable. Additional revisions are billed at $[HOURLY]/hr." },
      { heading: "5. Ownership", body: "Upon full payment, Client owns all final deliverables free and clear. Service Provider retains the right to display deliverables in its portfolio unless otherwise agreed in writing." },
      { heading: "6. Termination", body: "Either party may terminate this Agreement with fifteen (15) days written notice. Client will pay for all work completed through the termination date." },
      { heading: "7. Independent Contractor", body: "Service Provider is an independent contractor, not an employee. Service Provider is responsible for all taxes, insurance and benefits." },
    ],
  },
  "independent-contractor": {
    id: "independent-contractor",
    sections: [
      { heading: "1. Engagement", body: "[COMPANY] engages [CONTRACTOR] as an independent contractor to provide services in {{INDUSTRY}}. Contractor is not an employee, partner, agent or joint venturer of Company." },
      { heading: "2. Scope of Work", body: "Contractor will provide the services described in Exhibit A. Contractor controls the method, manner and means of performing the services, and may engage assistants at Contractor's expense." },
      { heading: "3. Compensation", body: "Company will pay Contractor $[RATE] per [hour / project / milestone] within fifteen (15) days of receiving an invoice. Contractor is responsible for all taxes, including self-employment tax." },
      { heading: "4. No Benefits", body: "Contractor is not entitled to any employee benefits, including health insurance, retirement contributions, paid time off, or workers' compensation coverage." },
      { heading: "5. Equipment & Expenses", body: "Contractor will provide its own equipment, tools and workspace. Contractor is responsible for ordinary business expenses unless approved in advance by Company." },
      { heading: "6. Confidentiality & IP", body: "Contractor will keep Company information confidential. Work product specifically created for Company under this Agreement is owned by Company upon payment; pre-existing IP remains Contractor's." },
      { heading: "7. Termination", body: "Either party may terminate with [NUMBER] days written notice. Sections on Confidentiality, IP and Indemnification survive termination." },
      { heading: "8. Independent Contractor Status", body: "The parties intend that Contractor is an independent contractor under all applicable laws, including the IRS 20-factor test and applicable state ABC tests. Contractor agrees to defend this classification if challenged." },
    ],
  },
  photography: {
    id: "photography",
    sections: [
      { heading: "1. Services", body: "[PHOTOGRAPHER] will provide photography services for [CLIENT]'s {{INDUSTRY}} engagement on [DATE] at [LOCATION] for a coverage period of [HOURS] hours." },
      { heading: "2. Deliverables", body: "Photographer will deliver no fewer than [NUMBER] professionally edited high-resolution digital photographs via online gallery within [WEEKS] weeks of the shoot date." },
      { heading: "3. Fees & Payment", body: "Total fee: $[AMOUNT]. A non-refundable retainer of $[RETAINER] is due upon signing to reserve the date. Balance is due [DAYS] days before the shoot." },
      { heading: "4. Usage Rights", body: "Client receives a personal print release for the delivered photographs. Commercial use requires a separate written license. Photographer retains copyright and the right to use photographs for portfolio and marketing." },
      { heading: "5. Cancellation & Reschedule", body: "If Client cancels, the retainer is non-refundable. Client may reschedule once at no additional charge if requested at least [DAYS] days before the original shoot date, subject to Photographer's availability." },
      { heading: "6. Force Majeure", body: "If Photographer cannot perform due to illness, weather, or other circumstances beyond Photographer's reasonable control, Photographer will reschedule or provide a qualified substitute. Photographer's liability is limited to the fees paid." },
      { heading: "7. Editing Style", body: "Photographer's editing style is reflected in the portfolio reviewed by Client. Client agrees that editing is a creative judgment, and re-editing to a different style is at Photographer's discretion." },
    ],
  },
  "web-design": {
    id: "web-design",
    sections: [
      { heading: "1. Services", body: "[DEVELOPER] will design and build a website for [CLIENT] in the {{INDUSTRY}} industry. The scope includes [NUMBER] page templates, [features], and basic responsive design for desktop, tablet and mobile." },
      { heading: "2. Timeline & Milestones", body: "Milestone 1: Discovery & wireframes — [WEEKS] weeks. Milestone 2: Visual design — [WEEKS] weeks. Milestone 3: Development & content integration — [WEEKS] weeks. Milestone 4: QA & launch — [WEEKS] weeks." },
      { heading: "3. Revisions", body: "Fees include two (2) rounds of revisions per milestone. Additional revisions and out-of-scope work are billed at $[HOURLY]/hr." },
      { heading: "4. Fees & Payment", body: "Total: $[AMOUNT]. 50% deposit due upon signing; 25% at design approval; 25% at launch. Past-due amounts pause work and accrue interest at 1.5%/month." },
      { heading: "5. Hosting & Domain", body: "Client is responsible for hosting and domain purchase and ongoing fees. Developer can recommend providers but does not control or guarantee third-party services." },
      { heading: "6. Ownership", body: "Upon full payment, Client owns all custom code, design files, and content rights for the final site. Third-party plugins, themes and libraries remain governed by their original licenses." },
      { heading: "7. Post-Launch Support", body: "Developer provides 30 days of bug fix support after launch at no charge. Ongoing maintenance and content updates require a separate retainer or are billed hourly." },
    ],
  },
  consulting: {
    id: "consulting",
    sections: [
      { heading: "1. Engagement", body: "[CLIENT] engages [CONSULTANT] to provide consulting services in the field of {{INDUSTRY}}. Consultant will deliver the services described in Exhibit A using its professional judgment, skill and experience." },
      { heading: "2. Compensation", body: "Consultant's fee is $[RATE] per hour, billed monthly. Approved travel and out-of-pocket expenses will be reimbursed at cost upon submission of receipts." },
      { heading: "3. Term & Termination", body: "This Agreement runs for [MONTHS] months from the effective date and may be terminated by either party with thirty (30) days written notice. Client will pay for all services performed through the termination date." },
      { heading: "4. Confidentiality", body: "Consultant will treat all non-public Client information as strictly confidential and will not use it for any purpose other than providing services under this Agreement. Obligations survive for three (3) years after termination." },
      { heading: "5. Conflicts of Interest", body: "Consultant will disclose in writing any actual or potential conflicts of interest, including current or contemplated engagements with Client's direct competitors. Client may require Consultant to decline or modify conflicting engagements." },
      { heading: "6. IP Ownership", body: "All work product specifically created for Client under this Agreement is owned by Client upon payment. Consultant retains rights to its pre-existing IP, methodologies, and general know-how." },
      { heading: "7. Non-Solicitation", body: "For twelve (12) months after termination, Consultant will not solicit Client's employees or contractors for hire without Client's prior written consent." },
    ],
  },
  "non-compete": {
    id: "non-compete",
    sections: [
      { heading: "1. Background", body: "In connection with [EMPLOYEE / CONTRACTOR / SELLER]'s relationship with [COMPANY] in the {{INDUSTRY}} industry, and in exchange for [consideration: employment, equity, sale proceeds, etc.], the parties agree to the restrictions below." },
      { heading: "2. Restricted Activity", body: "For a period of [MONTHS] months following the end of the relationship, [PARTY] will not, directly or indirectly, engage in any business that directly competes with Company within [GEOGRAPHIC SCOPE]." },
      { heading: "3. Reasonable Scope", body: "The parties agree that the duration, geographic scope and activity restrictions are reasonable and necessary to protect Company's legitimate business interests, including trade secrets, customer relationships and goodwill." },
      { heading: "4. Carve-Outs", body: "Nothing in this Agreement prevents [PARTY] from: (a) owning less than 1% of a publicly traded company, (b) accepting a passive investment role, or (c) working in roles or geographies expressly carved out below." },
      { heading: "5. Severability & Reformation", body: "If any court finds any part of this Agreement unenforceable as written, the court may modify the duration, geographic scope or restricted activities to the minimum extent necessary to make it enforceable, and the remainder will continue in full force." },
      { heading: "6. State-Specific Notice", body: "This Agreement is governed by [STATE] law. Non-compete agreements are unenforceable in California, North Dakota, Oklahoma and Minnesota (effective 2023); residents of those states should disregard the non-compete clause but remain bound by the confidentiality and non-solicitation provisions." },
    ],
  },
  license: {
    id: "license",
    sections: [
      { heading: "1. Grant", body: "[LICENSOR] grants [LICENSEE] a [exclusive / non-exclusive] license to use [DESCRIPTION OF IP] solely in connection with [USE CASE] within the {{INDUSTRY}} industry." },
      { heading: "2. Territory & Term", body: "The license is valid in [TERRITORY] for a term of [YEARS] years, beginning [START DATE], unless earlier terminated as provided in this Agreement." },
      { heading: "3. Royalties & Payment", body: "Licensee will pay Licensor a royalty of [%] of [NET REVENUE / GROSS REVENUE / UNITS SOLD], payable quarterly with detailed reporting within thirty (30) days of each calendar quarter end." },
      { heading: "4. Quality Control", body: "Licensee will maintain quality standards equal to or exceeding those of Licensor's own use of the IP. Licensor may inspect samples and audit Licensee's books with reasonable notice." },
      { heading: "5. Ownership", body: "All right, title and interest in the IP remains with Licensor. Licensee acquires no ownership in the IP and will not contest Licensor's ownership during or after the term." },
      { heading: "6. Termination", body: "Licensor may terminate this Agreement immediately for material breach, including non-payment of royalties for more than thirty (30) days. Upon termination, Licensee will cease all use of the IP." },
      { heading: "7. Indemnification", body: "Licensor warrants that, to its knowledge, the IP does not infringe third-party rights. Licensor will defend Licensee against IP infringement claims arising from authorized use under this Agreement." },
    ],
  },
  "employment-offer": {
    id: "employment-offer",
    sections: [
      { heading: "1. Position", body: "[COMPANY] is pleased to offer [CANDIDATE] the position of [TITLE], reporting to [MANAGER]. The role focuses on [responsibilities] within Company's {{INDUSTRY}} operations." },
      { heading: "2. Start Date & Location", body: "Anticipated start date: [DATE]. Primary work location: [LOCATION / REMOTE]. Any change in location requires mutual agreement." },
      { heading: "3. Compensation", body: "Base salary: $[AMOUNT] per year, paid on Company's regular payroll schedule. Eligible for [bonus / commission] up to [%] of base, paid [annually / quarterly] based on performance criteria established by Company." },
      { heading: "4. Equity", body: "Subject to Board approval, you will receive a grant of [SHARES] shares of Company common stock or options at the then-current fair market value, vesting over four (4) years with a one-year cliff." },
      { heading: "5. Benefits", body: "You will be eligible for Company's standard benefits, which currently include medical, dental, vision, 401(k), and paid time off, subject to plan terms and eligibility requirements." },
      { heading: "6. At-Will Employment", body: "Your employment is at-will. Either you or Company may terminate the employment relationship at any time, with or without cause or notice. This offer letter does not create a contract of employment for any specific duration." },
      { heading: "7. Contingencies", body: "This offer is contingent on: (a) satisfactory completion of a background check, (b) verification of your right to work in the United States, and (c) your signature on Company's standard Confidentiality and IP Assignment Agreement." },
    ],
  },
  partnership: {
    id: "partnership",
    sections: [
      { heading: "1. Formation", body: "The undersigned partners hereby form a general partnership under the laws of [STATE] for the purpose of operating a business in the {{INDUSTRY}} industry under the name [PARTNERSHIP NAME]." },
      { heading: "2. Capital Contributions", body: "Each partner's initial capital contribution and ownership percentage is set forth in Schedule A. Additional capital calls require unanimous consent unless otherwise specified." },
      { heading: "3. Profit & Loss Allocation", body: "Profits and losses will be allocated to partners in proportion to their ownership percentages, subject to any special allocations required by tax law." },
      { heading: "4. Management & Decisions", body: "Day-to-day management is handled by [Managing Partner / all partners equally]. Major decisions — including incurring debt over $[AMOUNT], hiring/firing senior staff, and admitting new partners — require approval of partners holding at least [%] of ownership." },
      { heading: "5. Draws & Distributions", body: "Partners may take periodic draws as approved by majority vote. Final profit distributions occur [annually / quarterly], net of reserves established by the partners." },
      { heading: "6. Transfer Restrictions", body: "No partner may transfer, sell or pledge their partnership interest without first offering it to the other partners under the right of first refusal set forth in Schedule B." },
      { heading: "7. Dissolution & Buyout", body: "On the death, disability, withdrawal or bankruptcy of any partner, the remaining partners may buy out the affected partner's interest at fair market value determined by an independent appraiser within ninety (90) days." },
    ],
  },
  sales: {
    id: "sales",
    sections: [
      { heading: "1. Goods/Services", body: "[SELLER] agrees to sell and [BUYER] agrees to purchase the goods or services described in Exhibit A ('Items') for use in {{INDUSTRY}} operations." },
      { heading: "2. Price & Payment", body: "Total purchase price: $[AMOUNT]. Payment terms: [Net 30 / due on delivery / installment schedule]. Buyer is responsible for applicable sales tax unless a valid exemption certificate is provided." },
      { heading: "3. Delivery", body: "Seller will deliver the Items by [DATE] to [LOCATION]. Delivery terms are [FOB origin / FOB destination] under UCC §2-319. Risk of loss transfers to Buyer upon [tender of delivery / receipt at destination]." },
      { heading: "4. Warranties", body: "Seller warrants that the Items conform to the description in Exhibit A and are free from material defects for a period of [WARRANTY PERIOD]. EXCEPT AS EXPRESSLY STATED, SELLER DISCLAIMS ALL OTHER WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE." },
      { heading: "5. Inspection & Acceptance", body: "Buyer has [DAYS] days from delivery to inspect and reject non-conforming Items. Failure to reject within this period constitutes acceptance." },
      { heading: "6. Limitation of Liability", body: "Seller's total liability under this Agreement is limited to the purchase price of the Items. In no event will Seller be liable for indirect, incidental, consequential or punitive damages." },
      { heading: "7. Governing Law", body: "This Agreement is governed by the laws of [STATE], excluding its conflict-of-laws principles. Disputes will be resolved in [VENUE] courts." },
    ],
  },
};

export const getBaseTemplate = (id: BaseTemplateId) => BASE_TEMPLATES[id];

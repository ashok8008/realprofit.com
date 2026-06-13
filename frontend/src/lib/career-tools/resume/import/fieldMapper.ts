// Field mapper — maps detected sections and raw text into structured ResumeData

import type { ResumeData } from "@/lib/career-tools/pdf-export";
import type { ParsedSection } from "./types";
import { classifySectionHeading } from "./sectionDetector";
import { normalizeDate, isPresentDate } from "../dateNormalize";

/**
 * Strip natural-language preambles users sometimes type into a "Title" field
 * or that the PDF parser pulls into a heading. Returns a clean job title.
 *
 *   "Working as Project Manager in Echidna..." → "Project Manager"
 *   "Worked as Senior Engineer at Acme..."      → "Senior Engineer"
 *   "Responsible for sales operations"          → "Sales Operations"
 */
function cleanJobTitle(raw: string): string {
  if (!raw) return "";
  let s = raw.trim();
  // "Working as X in Y since Z" → keep just X
  const workingAs = s.match(/^(?:Working|Worked)\s+(?:as\s+)?(.+?)\s+(?:in|for|at)\s+/i);
  if (workingAs) s = workingAs[1];
  // "Responsible for X" → keep X (title-cased on first letter)
  const responsibleFor = s.match(/^Responsible\s+for\s+(.+)$/i);
  if (responsibleFor) {
    s = responsibleFor[1];
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }
  // Trim trailing role / date noise
  s = s.replace(/\s*[,/]\s*$/, "")
    .replace(/\s+since\s+.*$/i, "")
    .replace(/\s+till\s+.*$/i, "")
    .replace(/\s+from\s+.*$/i, "")
    .trim();
  return s;
}

/** Normalize a company name for deduplication (lowercase + strip suffixes). */
function dedupKey(company: string, title: string): string {
  const c = (company || "")
    .toLowerCase()
    .replace(/\b(pvt|private|ltd|limited|llc|inc|incorporated|corp|corporation|co|company|gmbh|plc)\.?\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const t = cleanJobTitle(title || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return `${c}::${t}`;
}

/**
 * Pick the most distinctive single token from an entry — used as the
 * dedup anchor. Strips out role words, dates, common cities, and corporate
 * suffixes so what's left is the company brand name.
 *
 * "Echidna Software Pvt Ltd Bangalore" + "Project Manager"     → "echidna"
 * "Echidna Software Pvt Ltd"           + "Till date"           → "echidna"
 * "Connex Info Systems"                + "Aug 2014"            → "connex"
 */
const KNOWN_TITLE_TOKENS = new Set<string>([
  "manager", "analyst", "engineer", "developer", "designer", "architect",
  "consultant", "specialist", "lead", "director", "head", "officer",
  "senior", "junior", "associate", "principal", "staff", "intern",
  "executive", "coordinator", "administrator", "supervisor", "owner",
  "project", "product", "program", "business", "technical", "data",
  "software", "systems", "operations", "marketing", "sales", "finance",
  "hr", "human", "resources", "qa", "quality", "test", "devops",
  "info", "solutions", "services", "consulting", "technologies", "tech",
]);
const STOPWORDS = new Set<string>([
  ...KNOWN_TITLE_TOKENS,
  // date tokens
  "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "sept",
  "oct", "nov", "dec", "january", "february", "march", "april", "june",
  "july", "august", "september", "october", "november", "december",
  "till", "date", "now", "present", "current", "currently", "today",
  "since", "from", "to", "until",
  // suffixes
  "pvt", "private", "ltd", "limited", "llc", "inc", "incorporated", "corp",
  "corporation", "co", "company", "gmbh", "plc",
  // cities
  "bangalore", "mumbai", "delhi", "hyderabad", "pune", "chennai", "kolkata",
  "new", "york", "san", "francisco", "london", "paris", "berlin", "remote",
  "the", "and", "of", "in", "at", "for",
]);
function anchorToken(company: string, title: string): string {
  const blob = `${company} ${title}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\b\d+\b/g, " ") // strip years
    .trim();
  const tokens = blob.split(/\s+/).filter((w) => w.length > 1 && !STOPWORDS.has(w));
  if (tokens.length === 0) return "";
  // Prefer the longest token (usually the brand). If tied, the first.
  tokens.sort((a, b) => b.length - a.length);
  return tokens[0];
}

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(?:\+?1[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-]+/i;
const PORTFOLIO_RE = /(?:https?:\/\/)?(?:www\.)?(?:github\.com|behance\.net|dribbble\.com|[\w\-]+\.(?:com|io|dev|me|co))(?:\/[\w\-]*)?/i;
const LOCATION_RE = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s*(?:[A-Z]{2}|[A-Z][a-z]+)\b/;
const DATE_RE = /(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\d{1,2}\/\d{4}|\d{4})/gi;
const DEGREE_RE = /\b(B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|M\.?B\.?A\.?|Ph\.?D\.?|Bachelor|Master|Associate|Doctor|Diploma|Certificate)\b/i;

function extractPersonalInfo(rawText: string): ResumeData["personalDetails"] {
  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
  const email = rawText.match(EMAIL_RE)?.[0] || "";
  const phone = rawText.match(PHONE_RE)?.[0] || "";
  const linkedin = rawText.match(LINKEDIN_RE)?.[0] || "";
  const location = rawText.match(LOCATION_RE)?.[0] || "";

  let portfolio = "";
  const urls = rawText.match(/https?:\/\/[^\s]+/g) || [];
  for (const url of urls) {
    if (!url.includes("linkedin.com")) { portfolio = url; break; }
  }

  let fullName = "";
  const SECTION_HEADINGS = /^(career\s+objective|summary|experience|education|skills|certifications?|work\s+history|professional\s+(?:summary|experience|profile)|academic|technical)/i;
  for (const line of lines.slice(0, 10)) {
    // Skip lines that are clearly not names
    if (EMAIL_RE.test(line) || PHONE_RE.test(line) || /https?:\/\//.test(line)) continue;
    if (SECTION_HEADINGS.test(line)) continue;
    if (/^mobile:|^phone:|^email:|^address:|^contact/i.test(line)) continue;
    if (line.length > 80 || /\d{4}/.test(line)) continue;
    // Skip lines that look like a date range or bullet
    if (/^[•\-*]/.test(line)) continue;
    if (/^\d/.test(line) && !/^\d+\s+[A-Z]/i.test(line)) continue;
    // Strip suffixes like "PMP, CSM, MBA" to get the actual name
    const cleaned = line
      .replace(/,?\s*\b(PMP|CSM|MBA|PhD|CPA|PE|CFA|CISSP|AWS|ITIL|CCNA|CCNP|Jr\.|Sr\.|III|II|IV)\b/gi, "")
      .replace(/,\s*$/, "")
      .replace(/\|.*/g, "") // Strip everything after pipe
      .trim();
    const words = cleaned.split(/\s+/);
    // Accept 1-6 word names, must start with a letter, and be at least 3 chars
    if (words.length >= 1 && words.length <= 6 && /^[A-Za-z]/.test(words[0]) && cleaned.length > 2) {
      // Preserve original casing from the line (handles "ASHOK KUMAR" or "Ashok Kumar")
      fullName = cleaned;
      break;
    }
  }

  return { fullName, email, phone, location, linkedin, portfolio };
}

interface RawEntry {
  title: string; company: string; location: string;
  startDate: string; endDate: string; current: boolean; description: string;
}

function parseExperienceEntries(content: string): RawEntry[] {
  const entries: RawEntry[] = [];
  const lines = content.split("\n");
  let currentEntry: Partial<RawEntry> | null = null;
  let descLines: string[] = [];

  const flushEntry = () => {
    if (currentEntry) {
      // Clean job title (strip "Working as X in Y" preambles, etc.) +
      // normalize dates so display + PDF stay consistent.
      const cleanedTitle = cleanJobTitle(currentEntry.title || "");
      const start = normalizeDate(currentEntry.startDate || "");
      const rawEnd = currentEntry.endDate || "";
      const current = currentEntry.current || isPresentDate(rawEnd);
      const end = current ? "Present" : normalizeDate(rawEnd);
      entries.push({
        title: cleanedTitle,
        company: (currentEntry.company || "").trim(),
        location: (currentEntry.location || "").trim(),
        startDate: start,
        endDate: end,
        current,
        description: descLines.join("\n").trim(),
      });
    }
    currentEntry = null;
    descLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const dates = line.match(DATE_RE);
    const isBullet = /^[•\-*]\s/.test(line);

    // Pattern: "Working as {Title} in {Company} {Location} since {Date} to {Date}"
    const workingAsMatch = line.match(/^(?:Working|Worked)\s+(?:as\s+)?(.+?)\s+(?:in|for|at)\s+(.+?)(?:\s+since\s+|\s+from\s+)(.+?)(?:\s+to\s+)(.+?)$/i);
    if (workingAsMatch) {
      flushEntry();
      const title = workingAsMatch[1].replace(/\s*[,/]\s*$/, "").trim();
      const company = workingAsMatch[2].replace(/\s*,?\s*(?:since|from).*$/i, "").trim();
      const startDate = workingAsMatch[3].trim();
      const endDate = workingAsMatch[4].replace(/\.$/, "").trim();
      currentEntry = {
        title, company, location: "",
        startDate, endDate,
        current: /present|current|now|till\s*date/i.test(endDate),
      };
      continue;
    }

    if (!isBullet && dates && dates.length >= 1 && line.length < 120) {
      flushEntry();
      const textWithoutDates = line.replace(DATE_RE, "").replace(/[\-–—|,]+/g, " | ").trim();
      const parts = textWithoutDates.split(/\s*\|\s*/).filter(Boolean);
      currentEntry = {
        title: parts[0] || "", company: parts[1] || "", location: parts[2] || "",
        startDate: dates[0] || "", endDate: dates[1] || "", current: /present|current|now/i.test(line),
      };
      continue;
    }

    if (!currentEntry && !isBullet && line.length < 80 && !/^[a-z]/.test(line)) {
      flushEntry();
      currentEntry = { title: line };
      continue;
    }

    if (currentEntry && !currentEntry.company && !isBullet && !dates) {
      // Heuristic — only treat the line as a company name if:
      //   (a) it looks like a proper noun (TitleCase or all caps)
      //   (b) it doesn't end with a period (sentences/bullets do)
      //   (c) it doesn't start with a typical action verb
      //   (d) it's not too long for a company line
      const startsWithActionVerb = /^(built|led|developed|delivered|reduced|increased|managed|created|owned|drove|launched|designed|implemented|spearheaded|coordinated|facilitated|negotiated|achieved)\b/i.test(line);
      const looksLikeProperNoun = /^[A-Z]/.test(line) && !/^[A-Z]+\s+[a-z]/.test(line);
      const endsInSentence = /[.!?]$/.test(line);
      const ROLE_PREFIX_RE = /^role\s*[:\-]\s*(.+)$/i;
      const roleMatch = line.match(ROLE_PREFIX_RE);
      // "Role: Project Manager" → backfill the title rather than the company
      if (roleMatch && !cleanJobTitle(currentEntry.title || "")) {
        currentEntry.title = roleMatch[1].trim();
        continue;
      }
      if (
        looksLikeProperNoun &&
        !startsWithActionVerb &&
        !endsInSentence &&
        line.length < 80
      ) {
        const parts = line.split(/\s*[|,]\s*/);
        currentEntry.company = parts[0] || line;
        if (parts[1]) currentEntry.location = parts[1];
        continue;
      }
      // Otherwise treat as description text
    }

    descLines.push(lines[i]);
  }
  flushEntry();

  // Deduplicate: when a resume lists a job in BOTH a "Career Summary" form
  // ("Working as X in Y since Z") AND a "Project Details" form
  // ("Y, Sep 2014 – Till date, Role: X"), parseExperienceEntries used to
  // produce two entries. Now we collapse them on (company, title) and keep
  // the entry with the richest description.
  const byKey = new Map<string, RawEntry>();
  for (const e of entries) {
    const key = anchorToken(e.company, e.title);
    if (!key) {
      // Can't safely match — keep as a separate entry (rare edge case)
      byKey.set(`__unmergeable_${byKey.size}`, e);
      continue;
    }
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, e);
    } else {
      // Merge: prefer the entry with the longer description, but fill any
      // empty fields from the other entry.
      const merged: RawEntry = {
        title: existing.title || e.title,
        company: existing.company || e.company,
        location: existing.location || e.location,
        startDate: existing.startDate || e.startDate,
        endDate: existing.endDate || e.endDate,
        current: existing.current || e.current,
        description:
          (existing.description.length >= e.description.length
            ? existing.description
            : e.description) || "",
      };
      byKey.set(key, merged);
    }
  }
  return Array.from(byKey.values());
}

function parseEducationEntries(content: string) {
  const entries: Array<{ school: string; degree: string; field: string; startDate: string; endDate: string }> = [];
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  let current: (typeof entries)[0] | null = null;

  for (const line of lines) {
    if (/^[•\-*]/.test(line)) continue;
    const hasDegree = DEGREE_RE.test(line);
    const dates = line.match(DATE_RE);

    if (hasDegree || (dates && dates.length >= 1 && line.length < 100)) {
      if (current) entries.push(current);
      const degreeMatch = line.match(DEGREE_RE);
      const fieldMatch = line.match(/(?:in|of)\s+(.+?)(?:\s*[-–—|,]|$)/i);
      const withoutDegreeAndDates = line.replace(DEGREE_RE, "").replace(DATE_RE, "")
        .replace(/(?:in|of)\s+.+?(?:\s*[-–—|,]|$)/i, "").replace(/[-–—|,]+/g, " ").trim();
      current = {
        degree: degreeMatch?.[0] || "", field: fieldMatch?.[1]?.trim() || "",
        school: withoutDegreeAndDates.length > 2 ? withoutDegreeAndDates : "",
        startDate: dates?.[0] || "", endDate: dates?.[1] || dates?.[0] || "",
      };
    } else if (current && !current.school) {
      current.school = line.replace(DATE_RE, "").replace(/[-–—|,]+$/, "").trim();
    }
  }
  if (current) entries.push(current);
  return entries;
}

/**
 * Parse a "Certifications" section into structured, deduped display strings.
 *
 * Handles the common pattern where a single cert spans 3 lines:
 *   "PMP (Project Management Professional) Certification from PMI"
 *   "PMI Member ID: 2036651"
 *   "PMP ID: 1451526"
 * → ONE display string: "PMP — Project Management Professional · PMI · ID: 1451526"
 *
 * Detection: a NEW certification starts when a line contains a known cert
 * acronym (PMP, CSM, AWS, CPA, CFA, CISSP, PRINCE2, ITIL, etc.) OR is followed
 * by "Certification from" / "Certified". Subsequent "Member ID:" / "ID:" /
 * "Credential ID:" lines attach to the most recent cert.
 */
const CERT_ACRONYM_RE =
  /\b(PMP|CSM|CSPO|PSM|AWS|CCNA|CCNP|CCSP|CISSP|CISA|CISM|CPA|CFA|CFP|PE|EIT|ITIL|PRINCE2|TOGAF|SAFe|MCSE|MCSD|RHCE|RHCSA|PHR|SPHR|SHRM|Six\s*Sigma|Lean|Green\s*Belt|Black\s*Belt)\b/i;

function parseCertifications(content: string): string[] {
  const lines = content
    .split("\n")
    .map((l) => l.replace(/^[•\-*]\s*/, "").trim())
    .filter((l) => l.length > 1);

  // Each "group" = [headerLine, ...extraLines]
  const groups: { header: string; extras: string[] }[] = [];
  for (const line of lines) {
    const looksLikeHeader = CERT_ACRONYM_RE.test(line) || /Certification\s+from/i.test(line);
    const looksLikeAttachment =
      /^(PMI\s+)?(Member\s+ID|Cert(?:ification)?\s+ID|Credential\s+ID|ID|License\s+(?:no|number)|License)\s*[:#]/i.test(line) ||
      /^[A-Z]{3,4}\s+ID\s*[:#]/i.test(line); // "PMP ID: 1451526", "CSM ID: 171267"
    if (looksLikeHeader && !looksLikeAttachment) {
      groups.push({ header: line, extras: [] });
    } else if (groups.length > 0) {
      groups[groups.length - 1].extras.push(line);
    } else {
      // Orphan line before any header — keep as a standalone entry
      groups.push({ header: line, extras: [] });
    }
  }

  return groups.map((g) => formatCertification(g.header, g.extras));
}

function formatCertification(header: string, extras: string[]): string {
  // Pull out a clean "Name" + optional "Issuer" + "ID" from the lines.
  // Header example: "PMP (Project Management Professional) Certification from PMI (Project Management Institute, Inc.)"
  const issuerMatch = header.match(/(?:Certification\s+from|Issued\s+by|from)\s+(.+?)(?:\s*\(|$)/i);
  const acronymMatch = header.match(CERT_ACRONYM_RE);
  const longMatch = header.match(/\(([^)]+)\)/);
  // Build display name: "PMP — Project Management Professional"
  let name = header
    .replace(/\s*Certification\s+from.+$/i, "")
    .replace(/\s*Issued\s+by.+$/i, "")
    .replace(/\s*\(([^)]+)\)\s*$/, "") // strip trailing parens
    .replace(/\s*Certification\b/gi, "") // drop the word "Certification"
    .trim();
  if (acronymMatch && longMatch) {
    name = `${acronymMatch[0].toUpperCase()} — ${longMatch[1].trim()}`;
  }
  // Pull primary credential ID from extras (e.g. "PMP ID: 1451526")
  let credId = "";
  for (const e of extras) {
    const m = e.match(/(?:Cert(?:ification)?\s+ID|Credential\s+ID|^[A-Z]{3,4}\s+ID|^\s*ID)\s*[:#]\s*(\S+)/i);
    if (m) { credId = m[1].replace(/[.,]$/, ""); break; }
  }
  const issuer = issuerMatch
    ? issuerMatch[1].replace(/[.,]$/, "").trim()
    : "";
  const parts: string[] = [name];
  if (issuer) parts.push(issuer);
  if (credId) parts.push(`ID: ${credId}`);
  return parts.join(" · ");
}

function parseSkills(content: string): string[] {
  const skills: Set<string> = new Set();
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    let cleaned = line.replace(/^[•\-*]\s*/, "").trim();
    // Strip label prefixes like "Cloud Platforms:" or "Database Systems:"
    cleaned = cleaned.replace(/^[A-Za-z\s/&]+\s*:\s*/, "").trim();
    if (cleaned.includes(",")) {
      cleaned.split(",").forEach(s => { const t = s.trim(); if (t.length > 1 && t.length < 50) skills.add(t); });
    } else if (/[|/]/.test(cleaned)) {
      cleaned.split(/[|/]/).forEach(s => { const t = s.trim(); if (t.length > 1 && t.length < 50) skills.add(t); });
    } else if (cleaned.length > 1 && cleaned.length < 50) {
      skills.add(cleaned);
    }
  }
  return Array.from(skills).slice(0, 30);
}

export function mapSectionsToResumeData(sections: ParsedSection[], rawText: string): ResumeData {
  const personal = extractPersonalInfo(rawText);
  let summary = "";
  const experiences: ResumeData["experience"] = [];
  const educations: ResumeData["education"] = [];
  let skills: string[] = [];
  const certifications: string[] = [];
  const noSections = sections.length <= 1 && !sections[0]?.heading;

  for (const section of sections) {
    const type = section.heading ? classifySectionHeading(section.heading) : "unknown";
    switch (type) {
      case "summary":
        summary = section.content.trim();
        break;
      case "experience":
        parseExperienceEntries(section.content).forEach((e, i) => {
          experiences.push({ id: `imp-exp-${Date.now()}-${i}`, ...e });
        });
        break;
      case "education":
        parseEducationEntries(section.content).forEach((e, i) => {
          educations.push({ id: `imp-edu-${Date.now()}-${i}`, ...e });
        });
        break;
      case "skills":
        skills = parseSkills(section.content);
        break;
      case "certifications": case "awards": case "projects":
      case "languages": case "volunteer": case "interests":
        if (type === "certifications") {
          // Structured cert parser — merge follow-up "Member ID: ..." / "ID: ..."
          // lines into the preceding cert's display string so users see ONE
          // card per cert (e.g. PMP + CSM = 2 cards, not 6 line items).
          parseCertifications(section.content).forEach((c) => certifications.push(c));
        } else {
          section.content.split("\n").map(l => l.replace(/^[•\-*]\s*/, "").trim())
            .filter(l => l.length > 1).forEach(l => certifications.push(l));
        }
        break;
      default:
        if (!section.heading && sections.indexOf(section) === 0) {
          const nonPersonalLines = section.content.split("\n").filter(l => {
            const t = l.trim();
            return t.length > 20 && !EMAIL_RE.test(t) && !PHONE_RE.test(t) && !LINKEDIN_RE.test(t) && t !== personal.fullName;
          });
          if (nonPersonalLines.length > 0 && !summary) {
            summary = nonPersonalLines.join(" ").trim().slice(0, 500);
          }
        }
        break;
    }
  }

  if (noSections && experiences.length === 0) {
    parseExperienceEntries(rawText).forEach((e, i) => {
      experiences.push({ id: `imp-exp-${Date.now()}-${i}`, ...e });
    });
  }

  // Cross-section dedup: a single job often appears in both a "Career Summary"
  // section AND a "Project Details" section. Merge by company fingerprint so
  // the user sees ONE card per job — even when one section has the company
  // name in `title` and the other has it in `company`.
  const seen = new Map<string, ResumeData["experience"][number]>();
  for (const exp of experiences) {
    const key = anchorToken(exp.company, exp.title);
    if (!key) {
      seen.set(`__unmergeable_${seen.size}`, exp);
      continue;
    }
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, exp);
    } else {
      // Prefer cleaner data:
      //  - title: the entry whose title contains a role token (Manager, Engineer,
      //    Analyst…) wins. If both or neither do, keep the existing entry's title.
      //  - company: the entry with a real (non-date) company string wins.
      //  - description: the entry with the longer description wins.
      const looksLikeRole = (t: string) => {
        const s = (t || "").toLowerCase();
        return Array.from(KNOWN_TITLE_TOKENS).some((tok) => s.includes(tok));
      };
      const looksLikeCompany = (t: string) =>
        /\b(pvt|ltd|inc|llc|corp|gmbh|plc|systems|software|technologies|solutions|services|consulting|info)\b/i.test(
          t || "",
        );
      const looksLikeDate = (t: string) =>
        /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|present|till|date|now|current)\b/i.test(
          t || "",
        );
      // Pick best title
      let preferTitle = existing.title;
      const a = looksLikeRole(existing.title);
      const b = looksLikeRole(exp.title);
      if (b && !a) preferTitle = exp.title;
      // Pick best company
      let preferCompany = existing.company;
      const aGood = existing.company && !looksLikeDate(existing.company);
      const bGood = exp.company && !looksLikeDate(exp.company);
      if (!aGood && bGood) preferCompany = exp.company;
      else if (aGood && bGood && looksLikeCompany(exp.company) && !looksLikeCompany(existing.company)) {
        preferCompany = exp.company;
      }
      seen.set(key, {
        ...existing,
        title: preferTitle || existing.title || exp.title,
        company: preferCompany || existing.company || exp.company,
        location: existing.location || exp.location,
        startDate: existing.startDate || exp.startDate,
        endDate: existing.endDate || exp.endDate,
        current: existing.current || exp.current,
        description:
          (existing.description?.length || 0) >= (exp.description?.length || 0)
            ? existing.description
            : exp.description,
      });
    }
  }
  const dedupedExperiences = Array.from(seen.values());

  // Fallback: if no location was found in personal details, pull from the most recent experience
  if (!personal.location && dedupedExperiences.length > 0) {
    for (const exp of dedupedExperiences) {
      if (exp.location && exp.location.trim()) {
        personal.location = exp.location.trim();
        break;
      }
    }
  }

  return { personalDetails: personal, summary, experience: dedupedExperiences, education: educations, skills, certifications };
}

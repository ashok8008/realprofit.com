// Field mapper — maps detected sections and raw text into structured ResumeData

import type { ResumeData } from "@/lib/career-tools/pdf-export";
import type { ParsedSection } from "./types";
import { classifySectionHeading } from "./sectionDetector";

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(?:\+?1[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-]+/i;
const PORTFOLIO_RE = /(?:https?:\/\/)?(?:www\.)?(?:github\.com|behance\.net|dribbble\.com|[\w\-]+\.(?:com|io|dev|me|co))(?:\/[\w\-]*)?/i;
const LOCATION_RE = /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s*[A-Z]{2}\b/;
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
  for (const line of lines.slice(0, 5)) {
    if (EMAIL_RE.test(line) || PHONE_RE.test(line) || /https?:\/\//.test(line)) continue;
    if (line.length > 80 || /\d{4}/.test(line)) continue;
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && /^[A-Z]/.test(words[0])) { fullName = line; break; }
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
      entries.push({
        title: currentEntry.title || "", company: currentEntry.company || "",
        location: currentEntry.location || "", startDate: currentEntry.startDate || "",
        endDate: currentEntry.endDate || "", current: currentEntry.current || false,
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
      const parts = line.split(/\s*[|,]\s*/);
      currentEntry.company = parts[0] || line;
      if (parts[1]) currentEntry.location = parts[1];
      continue;
    }

    descLines.push(lines[i]);
  }
  flushEntry();
  return entries;
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

function parseSkills(content: string): string[] {
  const skills: Set<string> = new Set();
  const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const cleaned = line.replace(/^[•\-*]\s*/, "").trim();
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
        section.content.split("\n").map(l => l.replace(/^[•\-*]\s*/, "").trim())
          .filter(l => l.length > 1).forEach(l => certifications.push(l));
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

  return { personalDetails: personal, summary, experience: experiences, education: educations, skills, certifications };
}

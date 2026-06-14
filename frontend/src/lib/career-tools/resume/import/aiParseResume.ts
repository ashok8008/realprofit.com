// AI-powered resume parser using Gemini 2.5 Flash via the Emergent LLM key.
// Replaces the regex-based mapping for the import flow; falls back to the
// regex parser if the endpoint returns 4xx / 5xx or invalid JSON.

import type { ResumeData } from "@/lib/career-tools/pdf-export";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface GeminiPersonal {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  title?: string;
}
interface GeminiExp {
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}
interface GeminiEdu {
  degree?: string;
  school?: string;
  location?: string;
  startYear?: string;
  endYear?: string;
}
interface GeminiPayload {
  personalDetails?: GeminiPersonal;
  summary?: string;
  experience?: GeminiExp[];
  education?: GeminiEdu[];
  skills?: string[];
  certifications?: string[];
}

function makeId(prefix: string, i: number): string {
  return `${prefix}-${Date.now()}-${i}`;
}

/** Adapt Gemini's shape → frontend ResumeData (adds stable IDs, defaults). */
function adapt(p: GeminiPayload): ResumeData {
  const personal = p.personalDetails || {};
  return {
    personalDetails: {
      fullName: personal.name || "",
      email: personal.email || "",
      phone: personal.phone || "",
      location: personal.location || "",
      linkedin: personal.linkedin || "",
      portfolio: personal.website || "",
    },
    summary: (p.summary || "").trim(),
    experience: (p.experience || []).map((e, i) => ({
      id: makeId("exp", i),
      title: e.title || "",
      company: e.company || "",
      location: e.location || "",
      startDate: e.startDate || "",
      endDate: e.endDate || "",
      current: Boolean(e.current),
      description: e.description || "",
    })),
    education: (p.education || []).map((e, i) => ({
      id: makeId("edu", i),
      school: e.school || "",
      degree: e.degree || "",
      field: "",
      startDate: e.startYear || "",
      endDate: e.endYear || "",
    })),
    skills: (p.skills || []).filter((s) => (s || "").trim().length > 0),
    certifications: (p.certifications || []).filter((s) => (s || "").trim().length > 0),
  };
}

/**
 * Parse a resume via the Gemini-backed `/api/career-tools/parse-resume`
 * endpoint. Throws on any failure so the caller can fall back to the regex
 * parser.
 */
export async function aiParseResume(rawText: string): Promise<ResumeData> {
  const text = (rawText || "").trim();
  if (!text) throw new Error("empty resume text");
  const res = await fetch(`${API_BASE}/api/career-tools/parse-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    credentials: "include",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini parser ${res.status}: ${detail.slice(0, 120)}`);
  }
  const body = (await res.json()) as { data?: GeminiPayload; source?: string };
  if (!body?.data) throw new Error("Gemini returned empty data");
  return adapt(body.data);
}

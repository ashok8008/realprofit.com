import type { MetadataRoute } from "next";
import { getAllSlugs, getAllResumeCareerSlugs } from "@/lib/pseo/datasets";
import { calculators } from "@/data/calculators";
import { tools } from "@/data/tools";
import { careerTools } from "@/data/career-tools";
import { articles } from "@/data/articles";
import { taxTools } from "@/data/tax-tools";
import { PROFESSIONS } from "@/data/pseo/professions";
import { JOBS } from "@/data/pseo/jobs";
import { CITIES } from "@/data/pseo/cities";

// Force static generation at build time
export const dynamic = "force-static";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://realprofits.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const allSlugs = getAllSlugs();
  const resumeCareerSlugs = getAllResumeCareerSlugs();

  const urls: MetadataRoute.Sitemap = [
    // Static pages
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/calculators`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/tools/esign`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/verify`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/career-tools`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/tax-tools`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/learn`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/what-if`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Calculators
  for (const c of calculators) {
    urls.push({ url: `${BASE}/calculators/${c.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 });
  }

  // Tools
  for (const t of tools) {
    urls.push({ url: `${BASE}/tools/${t.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 });
  }

  // Career tools
  for (const ct of careerTools) {
    urls.push({ url: `${BASE}/career-tools/${ct.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 });
  }

  // Tax tools (non-calculator section tools have their own pages)
  for (const tt of taxTools) {
    if (tt.section !== "calculators") {
      urls.push({ url: `${BASE}/tax-tools/${tt.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 });
    }
  }

  // Articles
  for (const a of articles) {
    urls.push({ url: `${BASE}/articles/${a.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
  }

  // All pSEO guides (salary, tax, savings, mortgage, debt, freelancer, location-salary)
  for (const slug of allSlugs) {
    urls.push({ url: `${BASE}/guides/${slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 });
  }

  // Resume & Career pSEO pages (role, score, experience, company, problem, decision)
  for (const slug of resumeCareerSlugs) {
    urls.push({ url: `${BASE}/learn/${slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 });
  }

  // Invoice templates by profession (Phase 1a pSEO)
  urls.push({ url: `${BASE}/invoice-template`, lastModified: now, changeFrequency: "weekly", priority: 0.9 });
  for (const p of PROFESSIONS) {
    urls.push({ url: `${BASE}/invoice-template/${p.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
  }

  // Salary pages: hub + job hub + city hub + leaf (Phase 2a + 3a pSEO)
  urls.push({ url: `${BASE}/salary`, lastModified: now, changeFrequency: "weekly", priority: 0.9 });
  for (const j of JOBS) {
    urls.push({ url: `${BASE}/salary/${j.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 });
    for (const c of CITIES) {
      urls.push({ url: `${BASE}/salary/${j.slug}/${c.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
    }
  }
  for (const c of CITIES) {
    urls.push({ url: `${BASE}/salary/in/${c.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.7 });
  }

  return urls;
}

// Centralised sitemap data + per-section priority/changefreq config.
// Used by /sitemap.xml (index) and the six sub-sitemap route handlers.
import { getAllSlugs, getAllResumeCareerSlugs } from "@/lib/pseo/datasets";
import { calculators } from "@/data/calculators";
import { tools } from "@/data/tools";
import { careerTools } from "@/data/career-tools";
import { articles } from "@/data/articles";
import { taxTools } from "@/data/tax-tools";
import { PROFESSIONS } from "@/data/pseo/professions";
import { JOBS } from "@/data/pseo/jobs";
import { CITIES } from "@/data/pseo/cities";
import { CONTRACT_TYPES } from "@/data/pseo/contracts";
import { INDUSTRIES } from "@/data/pseo/industries";

export const SITEMAP_BASE: string =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://www.realprofits.com";

export type ChangeFreq =
  | "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: ChangeFreq;
  priority: number;
}

export type SitemapId =
  | "core"
  | "guides"
  | "salary"
  | "invoice-templates"
  | "contract-templates"
  | "articles"
  | "tax"
  | "calculators"
  | "state-tools";

export interface SitemapSectionMeta {
  id: SitemapId;
  defaultChangefreq: ChangeFreq;
  defaultPriority: number;
}

// Section defaults — match the SEO playbook agreed with the user.
export const SITEMAP_SECTIONS: SitemapSectionMeta[] = [
  { id: "core",               defaultChangefreq: "daily",   defaultPriority: 1.0 },
  { id: "salary",             defaultChangefreq: "monthly", defaultPriority: 0.8 },
  { id: "invoice-templates",  defaultChangefreq: "monthly", defaultPriority: 0.8 },
  { id: "contract-templates", defaultChangefreq: "monthly", defaultPriority: 0.8 },
  { id: "guides",             defaultChangefreq: "weekly",  defaultPriority: 0.7 },
  { id: "articles",           defaultChangefreq: "weekly",  defaultPriority: 0.6 },
  { id: "tax",                defaultChangefreq: "monthly", defaultPriority: 0.7 },
  { id: "calculators",        defaultChangefreq: "monthly", defaultPriority: 0.8 },
  { id: "state-tools",        defaultChangefreq: "monthly", defaultPriority: 0.7 },
];

function nowIso(): string {
  return new Date().toISOString();
}

function entry(path: string, section: SitemapSectionMeta, opts?: Partial<SitemapEntry>): SitemapEntry {
  return {
    loc: `${SITEMAP_BASE}${path}`,
    lastmod: opts?.lastmod ?? nowIso(),
    changefreq: opts?.changefreq ?? section.defaultChangefreq,
    priority: opts?.priority ?? section.defaultPriority,
  };
}

function meta(id: SitemapId): SitemapSectionMeta {
  return SITEMAP_SECTIONS.find((s) => s.id === id)!;
}

/** Core: homepage, hubs, auth-free static pages. */
export function getCoreEntries(): SitemapEntry[] {
  const m = meta("core");
  const out: SitemapEntry[] = [
    entry("", m, { priority: 1.0 }),
    entry("/calculators", m, { priority: 0.9 }),
    entry("/tools", m, { priority: 0.9 }),
    entry("/tools/esign", m, { changefreq: "monthly", priority: 0.9 }),
    entry("/tools/invoice", m, { changefreq: "monthly", priority: 0.9 }),
    entry("/pricing", m, { changefreq: "monthly", priority: 0.8 }),
    entry("/verify", m, { changefreq: "monthly", priority: 0.7 }),
    entry("/career-tools", m, { priority: 0.9 }),
    entry("/tax-tools", m, { priority: 0.9 }),
    entry("/guides", m, { priority: 0.9 }),
    entry("/learn", m, { priority: 0.9 }),
    entry("/invoice-template", m, { priority: 0.9 }),
    entry("/salary", m, { priority: 0.9 }),
    entry("/contract-template", m, { priority: 0.9 }),
    entry("/what-if", m, { changefreq: "monthly", priority: 0.8 }),
    entry("/search", m, { changefreq: "monthly", priority: 0.5 }),
    entry("/about", m, { changefreq: "monthly", priority: 0.4 }),
    entry("/contact", m, { changefreq: "monthly", priority: 0.4 }),
    entry("/privacy", m, { changefreq: "yearly", priority: 0.2 }),
    entry("/terms", m, { changefreq: "yearly", priority: 0.2 }),
  ];
  for (const c of calculators) out.push(entry(`/calculators/${c.slug}`, m, { changefreq: "monthly", priority: 0.8 }));
  for (const t of tools) out.push(entry(`/tools/${t.slug}`, m, { changefreq: "monthly", priority: 0.8 }));
  for (const ct of careerTools) out.push(entry(`/career-tools/${ct.slug}`, m, { changefreq: "monthly", priority: 0.8 }));
  return out;
}

/** Guides + Learn pSEO bundle. */
export function getGuidesEntries(): SitemapEntry[] {
  const m = meta("guides");
  const out: SitemapEntry[] = [];
  for (const slug of getAllSlugs()) out.push(entry(`/guides/${slug}`, m));
  for (const slug of getAllResumeCareerSlugs()) out.push(entry(`/learn/${slug}`, m));
  return out;
}

/** Salary pSEO (hub + 20 job hubs + 200 leaf + 10 city hubs). */
export function getSalaryEntries(): SitemapEntry[] {
  const m = meta("salary");
  const out: SitemapEntry[] = [];
  for (const j of JOBS) {
    out.push(entry(`/salary/${j.slug}`, m));
    for (const c of CITIES) {
      out.push(entry(`/salary/${j.slug}/${c.slug}`, m, { priority: 0.7 }));
    }
  }
  for (const c of CITIES) {
    out.push(entry(`/salary/in/${c.slug}`, m));
  }
  return out;
}

/** Invoice templates by profession (250). */
export function getInvoiceTemplateEntries(): SitemapEntry[] {
  const m = meta("invoice-templates");
  return PROFESSIONS.map((p) => entry(`/invoice-template/${p.slug}`, m));
}

/** Contract templates: type hubs (30) + leaf (30 x 20 = 600). */
export function getContractTemplateEntries(): SitemapEntry[] {
  const m = meta("contract-templates");
  const out: SitemapEntry[] = [];
  for (const c of CONTRACT_TYPES) {
    out.push(entry(`/contract-template/${c.slug}`, m));
    for (const i of INDUSTRIES) {
      out.push(entry(`/contract-template/${c.slug}/${i.slug}`, m, { priority: 0.7 }));
    }
  }
  return out;
}

/** Editorial articles. */
export function getArticlesEntries(): SitemapEntry[] {
  const m = meta("articles");
  return articles.map((a) => entry(`/articles/${a.slug}`, m));
}

/** Tax-tools section pages (non-calculator). */
export function getTaxEntries(): SitemapEntry[] {
  const m = meta("tax");
  return taxTools
    .filter((tt) => tt.section !== "calculators")
    .map((tt) => entry(`/tax-tools/${tt.slug}`, m));
}

export function getCalculatorEntries(): SitemapEntry[] {
  const m = meta("calculators");
  // calculators data file ships 40 entries; one URL per slug
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { calculators } = require("@/data/calculators") as { calculators: { slug: string }[] };
  return calculators.map((c) => entry(`/calculators/${c.slug}`, m));
}

export function getStateToolEntries(): SitemapEntry[] {
  const m = meta("state-tools");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { US_STATES } = require("@/data/pseo/us-states") as { US_STATES: { slug: string }[] };
  return taxTools
    .filter((tt) => tt.section !== "calculators")
    .flatMap((tt) =>
      US_STATES.map((s) => entry(`/tax-tools/${s.slug}/${tt.slug}`, m)),
    );
}

export const SECTION_LOADERS: Record<SitemapId, () => SitemapEntry[]> = {
  core: getCoreEntries,
  guides: getGuidesEntries,
  salary: getSalaryEntries,
  "invoice-templates": getInvoiceTemplateEntries,
  "contract-templates": getContractTemplateEntries,
  articles: getArticlesEntries,
  tax: getTaxEntries,
  calculators: getCalculatorEntries,
  "state-tools": getStateToolEntries,
};

/** Sub-sitemap URLs (used by the index). */
export function getSitemapIndexEntries(): { loc: string; lastmod: string }[] {
  const lastmod = nowIso();
  return SITEMAP_SECTIONS.map((s) => ({
    loc: `${SITEMAP_BASE}/sitemap-${s.id}.xml`,
    lastmod,
  }));
}

// XML helpers ────────────────────────────────────────────────────────────

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function renderUrlset(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${escapeXml(e.loc)}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function renderSitemapIndex(entries: { loc: string; lastmod: string }[]): string {
  const items = entries
    .map(
      (e) =>
        `  <sitemap>\n    <loc>${escapeXml(e.loc)}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n  </sitemap>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
}

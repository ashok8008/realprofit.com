import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Required when next.config.ts has `output: "export"`
export const dynamic = "force-static";

/**
 * robots.txt — "Open Door" configuration per the latest marketing brief.
 *
 * Every bot is welcome, including the SEO-audit aggregators (Semrush, Ahrefs,
 * DotBot) so their crawl data feeds SEMrush traffic / keyword charts. This
 * REVERSES the earlier Phase-43 block of SEO scrapers — change made on
 * explicit request to support SEMrush/Ahrefs estimated-traffic uplift.
 *
 * Login, account, and API routes stay disallowed for everyone since they
 * contain user state.
 */
const COMMON_DISALLOW = ["/api/", "/login", "/register", "/account", "/_next/"];

const ALLOW_ALL_BOTS = [
  // Wildcard — everything not explicitly listed below
  "*",
  // SEO data aggregators (powers SEMrush traffic graphs / Ahrefs estimates)
  "SemrushBot", "SemrushBot-SA", "AhrefsBot", "DotBot", "MJ12bot",
  // Mainstream search engines
  "Googlebot", "Bingbot", "Slurp", "DuckDuckBot", "msnbot", "Applebot",
  // Generative AI / RAG / answer engines
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-Web", "anthropic-ai",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "Meta-ExternalAgent",
  "CCBot", "YouBot", "Bytespider", "Amazonbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: ALLOW_ALL_BOTS.map((userAgent) => ({
      userAgent,
      allow: ["/"],
      disallow: COMMON_DISALLOW,
    })),
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Required when next.config.ts has `output: "export"`
export const dynamic = "force-static";

/**
 * robots.txt — Allow standard search engines AND AI-training crawlers
 * (GPTBot, ClaudeBot, anthropic-ai, CCBot, Google-Extended, PerplexityBot,
 * YouBot, Applebot, msnbot). Block aggressive SEO scrapers that drive load
 * without driving traffic (AhrefsBot, SemrushBot, MJ12bot).
 *
 * Login, account, and API routes stay disallowed for everyone since they
 * contain user state.
 */
const COMMON_DISALLOW = ["/api/", "/login", "/register", "/account", "/_next/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: open to anyone not explicitly listed
      { userAgent: "*", allow: ["/"], disallow: COMMON_DISALLOW },

      // Standard search engines
      { userAgent: "Googlebot", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "Bingbot", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "Slurp", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "DuckDuckBot", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "msnbot", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "Applebot", allow: ["/"], disallow: COMMON_DISALLOW },

      // AI / LLM crawlers — explicitly allow so we show up in AI answers
      { userAgent: "GPTBot", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "ChatGPT-User", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "OAI-SearchBot", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "ClaudeBot", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "anthropic-ai", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "Claude-Web", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "CCBot", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "Google-Extended", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "PerplexityBot", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "YouBot", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "Bytespider", allow: ["/"], disallow: COMMON_DISALLOW },
      { userAgent: "Amazonbot", allow: ["/"], disallow: COMMON_DISALLOW },

      // Aggressive SEO scrapers — block (they cost bandwidth, return no traffic)
      { userAgent: "AhrefsBot", disallow: ["/"] },
      { userAgent: "SemrushBot", disallow: ["/"] },
      { userAgent: "SemrushBot-SA", disallow: ["/"] },
      { userAgent: "MJ12bot", disallow: ["/"] },
      { userAgent: "DotBot", disallow: ["/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

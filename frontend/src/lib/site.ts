/**
 * Canonical site URL used by structured data, robots.txt, llms.txt, sitemap and
 * Open Graph tags. We do NOT use NEXT_PUBLIC_BACKEND_URL here because that
 * points to the preview environment in non-prod. Override at build time via
 * NEXT_PUBLIC_SITE_URL if the canonical domain ever changes.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.realprofits.com";

export const SITE_NAME = "RealProfits";

export const SITE_DESCRIPTION =
  "Free financial tools, calculators, and productivity tools for freelancers, small business owners, and individuals. No signup required.";

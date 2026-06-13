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

/** Single source of truth for contact / NAP. Referenced by footer, Contact
 *  page, mailto links, schema.org Organization, llms.txt, and email metadata. */
export const CONTACT = {
  email: "hello@realprofits.com",
  address: {
    streetAddress: "641 Lexington Avenue, 14th Floor",
    addressLocality: "New York",
    addressRegion: "NY",
    postalCode: "10022",
    addressCountry: "US",
    /** One-line human-readable form for the footer / Contact page. */
    full: "641 Lexington Avenue, 14th Floor, New York, NY 10022, US",
  },
} as const;

/** Public social profiles for schema.org `sameAs`. Add real URLs once accounts
 *  are claimed. Keep array shape so JSON-LD is always valid. */
export const SOCIAL = [
  "https://twitter.com/realprofits",
  "https://linkedin.com/company/realprofits",
] as const;

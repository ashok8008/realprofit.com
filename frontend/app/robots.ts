import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://realprofits.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/calculators/",
          "/tools/",
          "/career-tools/",
          "/tax-tools/",
          "/guides/",
          "/learn/",
          "/articles/",
          "/about",
          "/contact",
        ],
        disallow: [
          "/api/",
          "/login",
          "/register",
          "/account",
          "/account/*",
          "/_next/",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}

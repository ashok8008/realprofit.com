import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://realprofits.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
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
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: ["/api/", "/login", "/register", "/account", "/_next/"],
      },
      {
        userAgent: "Bingbot",
        allow: ["/"],
        disallow: ["/api/", "/login", "/register", "/account", "/_next/"],
      },
      {
        userAgent: "SemrushBot",
        allow: ["/"],
        disallow: ["/api/", "/login", "/register", "/account", "/_next/"],
      },
      {
        userAgent: "SemrushBot-SA",
        allow: ["/"],
        disallow: ["/api/", "/login", "/register", "/account", "/_next/"],
      },
      {
        userAgent: "AhrefsBot",
        allow: ["/"],
        disallow: ["/api/", "/login", "/register", "/account", "/_next/"],
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

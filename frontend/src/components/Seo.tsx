"use client";

// Re-export schema builders for client components
export {
  buildArticleSchema,
  buildFAQSchema,
  buildSoftwareAppSchema,
  buildHowToSchema,
  buildBreadcrumbSchema,
} from "@/lib/schemas";

interface SeoProps {
  title: string;
  description: string;
  keywords?: string;
  type?: string;
  path?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

// Seo component handles JSON-LD and document title for client pages
export function Seo({ title, jsonLd }: SeoProps) {
  const schemas = jsonLd
    ? Array.isArray(jsonLd) ? jsonLd : [jsonLd]
    : [];

  // Update document title for client-side navigation
  if (typeof document !== "undefined") {
    document.title = `${title} | RealProfits`;
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

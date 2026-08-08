import type { Metadata } from "next";
import ToolDetail from "@/views/ToolDetail";
import { ToolSchema } from "@/components/seo/ToolSchema";
import { tools } from "@/data/tools";
import { SITE_URL } from "@/lib/site";

/**
 * Every tool on this route shipped the layout's default title, so six working
 * tools were invisible for the terms people actually search -- "paycheck
 * calculator", "net worth calculator", "bill split". The page already emitted
 * ToolSchema, so the structured data described a page whose <title> did not.
 *
 * The copy comes from tools.ts rather than a second list here: one registry
 * already names and describes each tool, and a second would drift from it.
 *
 * SITE_URL, not NEXT_PUBLIC_BACKEND_URL. Some older pages canonicalise against
 * the backend URL, which is the API origin rather than the site, and they emit
 * a different host to this one as a result.
 */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const t = tools.find((x) => x.slug === slug);

  // An unknown slug still renders -- ToolDetail decides what to show -- so fall
  // back to the layout default rather than claiming a tool that is not there.
  if (!t) return {};

  // The layout appends " | RealProfits" via its title template, so leaving the
  // brand out here keeps it from appearing twice.
  const title = /^free\b/i.test(t.name) ? t.name : `Free ${t.name}`;
  const description = `${t.description} Free to use, no signup required.`;
  const url = `${SITE_URL}/tools/${t.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "RealProfits" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = tools.find((x: { slug: string }) => x.slug === slug);
  return (
    <>
      {t && (
        <ToolSchema
          path={`/tools/${t.slug}`}
          name={(t as { name: string }).name}
          description={(t as { description?: string }).description || `Free ${(t as { name: string }).name} from RealProfits — no signup required.`}
        />
      )}
      <ToolDetail />
    </>
  );
}

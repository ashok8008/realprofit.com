import { SECTION_LOADERS, renderUrlset } from "@/lib/sitemap-data";

export const dynamic = "force-static";

export function GET() {
  const xml = renderUrlset(SECTION_LOADERS.salary());
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

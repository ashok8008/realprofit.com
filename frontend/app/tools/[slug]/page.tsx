import ToolDetail from "@/views/ToolDetail";
import { ToolSchema } from "@/components/seo/ToolSchema";
import { tools } from "@/data/tools";

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

import CalculatorDetail from "@/views/CalculatorDetail";
import { ToolSchema } from "@/components/seo/ToolSchema";
import { calculators } from "@/data/calculators";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = calculators.find((x) => x.slug === slug);
  return (
    <>
      {c && (
        <ToolSchema
          path={`/calculators/${c.slug}`}
          name={c.name}
          description={c.description}
        />
      )}
      <CalculatorDetail />
    </>
  );
}

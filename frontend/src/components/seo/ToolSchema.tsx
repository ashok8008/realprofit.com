import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

interface Props {
  /** URL path beneath the domain, e.g. "/calculators/compound-interest-calculator" */
  path: string;
  name: string;
  description: string;
  /** Optional — additional input fields the tool accepts, used by CalculateAction */
  inputs?: string[];
  /** Optional — what the tool outputs, used by CalculateAction `result` */
  output?: string;
  /** Optional FAQ pairs to emit FAQPage schema alongside */
  faq?: { q: string; a: string }[];
}

/**
 * Emits a triple-schema JSON-LD block for any calculator / financial tool:
 *   1. FinancialProduct — anchors the tool as a financial offering
 *   2. SoftwareApplication — registers it as a free web tool
 *   3. CalculateAction (nested) — declares the computation contract
 *   4. FAQPage — optional, when `faq` is supplied
 *
 * Mount in any tool / calculator / tax-tool page:
 *   <ToolSchema path="/calculators/foo" name="Foo" description="..." />
 */
export function ToolSchema({ path, name, description, inputs = [], output, faq }: Props) {
  const url = `${SITE_URL}${path}`;
  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `RealProfits ${name}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web Browser",
    url,
    description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    potentialAction: {
      "@type": "CalculateAction",
      name: `Calculate with ${name}`,
      target: url,
      ...(inputs.length > 0 && {
        object: inputs.map((i) => ({ "@type": "PropertyValue", name: i })),
      }),
      ...(output && {
        result: { "@type": "StructuredValue", description: output },
      }),
    },
  };
  const financialProduct = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name,
    url,
    description,
    provider: { "@type": "Organization", name: "RealProfits", url: SITE_URL },
    feesAndCommissionsSpecification: "Free to use — no fees, no account required.",
  };
  const schemas: object[] = [softwareApp, financialProduct];
  if (faq && faq.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return <JsonLd data={schemas} />;
}

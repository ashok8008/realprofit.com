"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FileText, X } from "lucide-react";
import { useState } from "react";
import { EsignWizard } from "@/components/esign/EsignWizard";
import { getContractType } from "@/data/pseo/contracts";
import { getIndustry } from "@/data/pseo/industries";

function ContractBanner() {
  const sp = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  if (sp.get("from") !== "contract") return null;

  const c = getContractType(sp.get("type") || "");
  const i = getIndustry(sp.get("industry") || "");
  if (!c) return null;

  const contractUrl = i
    ? `/contract-template/${c.slug}/${i.slug}`
    : `/contract-template/${c.slug}`;

  return (
    <div className="bg-[#FAF5EE] border-b border-[#C8A96E]/40">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-start gap-3">
        <FileText className="w-5 h-5 text-[#C8A96E] mt-0.5 flex-shrink-0" />
        <div className="flex-1 text-sm text-stone-800">
          <strong className="text-stone-900">Using our {c.name}{i ? ` template for ${i.plural}` : " template"}?</strong>{" "}
          Upload your customized contract PDF below.{" "}
          <Link href={contractUrl} data-testid="contract-banner-back-link"
                className="font-semibold text-[#0B3D3D] hover:underline">
            View the template again →
          </Link>
        </div>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss"
                data-testid="contract-banner-dismiss"
                className="text-stone-500 hover:text-stone-800">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function NewEsignDocumentPage() {
  return (
    <>
      <Suspense fallback={null}>
        <ContractBanner />
      </Suspense>
      <EsignWizard />
    </>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EsignWizard } from "@/components/esign/EsignWizard";
import { esignApi, type DocumentDetail } from "@/components/esign/api";
import { useAuth } from "@/contexts/AuthContext";

export default function EditEsignDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const id = String(params?.id || "");

  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/tools/esign/edit/${id}`);
      return;
    }
    if (!user || !id) return;
    let active = true;
    esignApi
      .get(id)
      .then((d) => {
        if (!active) return;
        if (d.status !== "draft") {
          // Only drafts can be edited; bounce back to dashboard.
          router.replace("/tools/esign/dashboard");
          return;
        }
        setDoc(d);
      })
      .catch((e: any) => {
        if (e.message === "AUTH_REQUIRED") {
          router.push(`/login?redirect=/tools/esign/edit/${id}`);
          return;
        }
        setError(e.message || "Could not load document");
      });
    return () => {
      active = false;
    };
  }, [id, user, authLoading, router]);

  if (authLoading || (!doc && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE]">
        <div className="animate-spin w-8 h-8 border-4 border-[#0B3D3D] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE]">
        <div className="bg-white border border-stone-200 rounded-xl p-8 max-w-md text-center">
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Couldn&apos;t open this draft</h2>
          <p className="text-sm text-stone-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/tools/esign/dashboard")}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#0B3D3D] rounded-md"
            data-testid="edit-error-back-btn"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return <EsignWizard initialDoc={doc!} />;
}

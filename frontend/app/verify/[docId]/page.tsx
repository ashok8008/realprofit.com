"use client";
import { use, useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";
import { signApi } from "@/components/esign/api";

export default function VerifyPage({ params }: { params: Promise<{ docId: string }> }) {
  const { docId } = use(params);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    signApi.verify(docId).then(setData).catch((e) => setError(e.message));
  }, [docId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE] px-6">
        <div className="bg-white border border-stone-200 rounded-xl p-10 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-[#B53D2F] mb-4" />
          <h1 className="text-xl font-semibold text-stone-900 mb-2">Document not found</h1>
          <p className="text-sm text-stone-600">
            We couldn't locate this document. The link may be incorrect or the document
            has been deleted by its owner.
          </p>
        </div>
      </div>
    );
  }
  if (!data) return <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE]">Verifying…</div>;

  return (
    <div className="min-h-screen bg-[#F5F3EE]">
      <header className="bg-[#0B3D3D] text-white">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="text-[10px] tracking-[0.3em] text-[#C8A96E] uppercase font-medium">
            RealProfits eSign · Verification
          </div>
          <h1 className="text-2xl font-bold mt-1">Document Verification</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white border border-stone-200 rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            {data.status === "completed" ? (
              <>
                <CheckCircle2 className="w-8 h-8 text-[#2A6B45]" />
                <div>
                  <div className="text-lg font-bold text-stone-900">Verified — Signed</div>
                  <div className="text-xs text-stone-500">This document was fully signed via RealProfits eSign.</div>
                </div>
              </>
            ) : (
              <>
                <ShieldCheck className="w-8 h-8 text-[#A0621A]" />
                <div>
                  <div className="text-lg font-bold text-stone-900">Status: {data.status}</div>
                  <div className="text-xs text-stone-500">This document is currently {data.status}.</div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-500">Title</span>
              <span className="font-medium text-stone-900">{data.title}</span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-500">Document ID</span>
              <span className="font-mono text-xs text-stone-700">{data.document_id}</span>
            </div>
            {data.completed_at && (
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="text-stone-500">Completed</span>
                <span className="text-stone-900">{new Date(data.completed_at).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-stone-100 pb-2 gap-3">
              <span className="text-stone-500 flex-shrink-0">SHA-256</span>
              <span className="font-mono text-[10px] text-stone-600 break-all text-right">{data.doc_hash}</span>
            </div>
          </div>

          <h3 className="font-semibold text-stone-900 mt-6 mb-3">Signers</h3>
          <div className="space-y-2">
            {data.signers.map((s: any) => (
              <div key={s.signer_id} className="border border-stone-200 rounded-md p-3 text-sm">
                <div className="font-medium text-stone-900">{s.name}</div>
                <div className="text-xs text-stone-500">{s.email_masked} · {s.status}</div>
                {s.signed_at && (
                  <div className="text-xs text-stone-500 mt-1">Signed {new Date(s.signed_at).toLocaleString()}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

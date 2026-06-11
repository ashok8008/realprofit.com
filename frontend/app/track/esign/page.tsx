"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";

interface Status {
  document_id: string;
  title: string;
  status: string;
  signer_status: string;
  signed_at: string | null;
  completed_at: string | null;
}

function GuestTrackInner() {
  const sp = useSearchParams();
  const docId = sp.get("d") || "";
  const claim = sp.get("c") || "";
  const [data, setData] = useState<Status | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId || !claim) {
      setError("Missing tracking parameters.");
      setLoading(false);
      return;
    }
    const fetcher = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/esign/guest/documents/${docId}/status?claim=${encodeURIComponent(claim)}`
        );
        if (!res.ok) throw new Error(await res.text());
        setData(await res.json());
        setError("");
      } catch (e: any) {
        setError(e.message || "Could not load status");
      } finally {
        setLoading(false);
      }
    };
    fetcher();
    const id = setInterval(fetcher, 30_000);
    return () => clearInterval(id);
  }, [docId, claim]);

  return (
    <div className="min-h-screen bg-[#F5F3EE] py-12 px-4">
      <div className="max-w-lg mx-auto bg-white border border-stone-200 rounded-xl shadow-sm p-8" data-testid="guest-track-page">
        <div className="text-[10px] tracking-[0.2em] text-[#C8A96E] uppercase font-medium mb-1">RealProfits eSign</div>
        <h1 className="text-2xl font-semibold text-stone-900 mb-4">Track your document</h1>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading status…
          </div>
        )}
        {error && !loading && (
          <div className="text-sm text-[#B53D2F]" data-testid="guest-track-error">{error}</div>
        )}
        {data && !loading && (
          <>
            <div className="border border-stone-200 rounded-md p-4 mb-4">
              <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">Document</div>
              <div className="text-base font-semibold text-stone-900 mb-3">{data.title}</div>
              <div className="text-xs uppercase tracking-wider text-stone-500 mb-1">Status</div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                {data.status === "completed" ? (
                  <><CheckCircle2 className="w-4 h-4 text-[#2A6B45]" /> <span className="text-[#2A6B45]">Completed</span></>
                ) : data.signer_status === "signed" ? (
                  <><CheckCircle2 className="w-4 h-4 text-[#2A6B45]" /> <span className="text-[#2A6B45]">Signed</span></>
                ) : (
                  <><Clock className="w-4 h-4 text-[#A0621A]" /> <span className="text-[#A0621A]">Awaiting signature</span></>
                )}
              </div>
              {data.signed_at && (
                <div className="text-xs text-stone-500 mt-1">Signed {new Date(data.signed_at).toLocaleString()}</div>
              )}
              {data.completed_at && (
                <div className="text-xs text-stone-500 mt-1">Completed {new Date(data.completed_at).toLocaleString()}</div>
              )}
            </div>
            <div className="text-xs text-stone-500 mb-2">Want notifications + a dashboard?</div>
            <Link
              href="/register"
              data-testid="guest-track-signup-link"
              className="block w-full text-center px-5 py-2.5 text-sm font-semibold text-white bg-[#0B3D3D] rounded-md hover:bg-[#165252]"
            >
              Sign up free — we&apos;ll auto-attach this doc to your account
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function GuestTrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EE]">
        <Loader2 className="w-6 h-6 animate-spin text-[#0B3D3D]" />
      </div>
    }>
      <GuestTrackInner />
    </Suspense>
  );
}

"use client";
import { Suspense } from "react";
import { BillingPage } from "@/components/billing/BillingPage";

export default function BillingRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-stone-600">Loading…</div>}>
      <BillingPage />
    </Suspense>
  );
}

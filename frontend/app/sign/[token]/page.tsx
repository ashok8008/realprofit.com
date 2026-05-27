"use client";
import { use } from "react";
import { SigningPage } from "@/components/esign/SigningPage";

export default function PublicSignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <SigningPage token={token} />;
}

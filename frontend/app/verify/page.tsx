import { VerifySearchLanding } from "@/components/esign/VerifySearchLanding";

export const metadata = {
  title: "Verify an e-signed document — RealProfits eSign",
  description: "Verify any document signed with RealProfits eSign. Confirm signers, signing timestamps, and tamper-proof SHA-256 document hash.",
  keywords: "verify e-signature, verify document, electronic signature verification, esign authenticity check",
};

export default function VerifyIndexPage() {
  return <VerifySearchLanding />;
}

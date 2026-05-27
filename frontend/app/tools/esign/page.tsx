import { EsignLanding } from "@/components/esign/EsignLanding";

export const metadata = {
  title: "Free eSign Tool — Sign PDF Documents Online | RealProfits",
  description: "Sign PDF documents online for free. Add up to 5 signers, audit trail, UUID verification and QR code. No account needed. Better than DocuSign — and completely free.",
  keywords: "free esign tool, free docusign alternative, sign pdf online free, electronic signature free, esign documents free, free online signature, esign tool, pdf signer",
  openGraph: {
    title: "Free eSign Tool — Sign PDF Documents Online",
    description: "Better than DocuSign. Free forever. 5 signers, audit trail, QR verification.",
    type: "website",
  },
};

export default function EsignLandingPage() {
  return <EsignLanding />;
}

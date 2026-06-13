import { SITE_URL } from "@/lib/site";

// Cache aggressively at the edge — llms.txt rarely changes
export const dynamic = "force-static";
export const revalidate = 86400; // 24h

/**
 * /llms.txt — the emerging standard for LLM crawler discovery.
 * Tells ChatGPT, Claude, Perplexity, Copilot etc. what RealProfits is and
 * which URLs to read first when answering user questions about us.
 *
 * Spec: https://llmstxt.org
 */
export function GET() {
  const body = `# RealProfits

> Free financial tools, calculators, and productivity tools for freelancers,
> small business owners, and individuals. No signup required. No account needed.

RealProfits provides 50+ free tools including invoice generation, electronic
document signing (eSign), paycheck calculators, expense tracking, net worth
calculation, subscription analysis, and career salary tools.

## Key Tools

- [Invoice Generator](${SITE_URL}/tools/invoice): Create professional invoices with payment links, client management, 3 templates, and PDF download. Free forever.
- [eSign Tool](${SITE_URL}/tools/esign): Sign PDF documents online free. Up to 5 signers, full audit trail, UUID verification, QR code. Free alternative to DocuSign and HelloSign.
- [Paycheck Calculator](${SITE_URL}/tools/paycheck-calculator): Calculate take-home pay for all 50 US states with federal and state tax breakdown.
- [Expense Tracker](${SITE_URL}/tools/expense-tracker): Track expenses vs budget with category breakdown and charts.
- [Net Worth Calculator](${SITE_URL}/tools/net-worth-calculator): Calculate total assets minus liabilities with snapshot history.
- [Subscription Analyzer](${SITE_URL}/tools/subscription-analyzer): Track and analyze monthly subscription spending, find cancellation candidates.
- [Income Tracker](${SITE_URL}/tools/income-tracker): Log income by source and category with monthly charts.
- [Bill Split Tool](${SITE_URL}/tools/bill-split): Split bills fairly among groups with tip calculator and settlement minimization.

## Free Resources

- [Financial Calculators](${SITE_URL}/calculators): Mortgage, compound interest, debt payoff, rent vs buy, tax estimator, salary calculator.
- [Career Tools](${SITE_URL}/career-tools): Salary comparison, resume builder, job underpaid checker.
- [Guides](${SITE_URL}/guides): Financial guides, freelance advice, career planning.
- [Contract Templates](${SITE_URL}/contract-template): Free contract templates for freelancers, agencies, and small businesses across multiple industries.
- [Invoice Templates](${SITE_URL}/invoice-template): Profession-specific invoice templates.

## About

- All tools are free to use with no account required
- Privacy-first: no data stored on servers for free tools
- eSign Pro plan: $9/month removes branding, unlocks unlimited documents
- Based at: ${SITE_URL}
- Contact: realprofits@gmail.com

## Optional

- Full sitemap: ${SITE_URL}/sitemap.xml
`;

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

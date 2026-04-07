"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;
const AI_TAX_KEY = "realprofits_career_tax_ai_used";
const FREE_LIMIT = 1;

function getUsed(): number {
  try { return JSON.parse(localStorage.getItem(AI_TAX_KEY) || "0"); } catch { return 0; }
}
function markUsed() {
  localStorage.setItem(AI_TAX_KEY, JSON.stringify(getUsed() + 1));
}

export function useTaxAI() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canUseAI = typeof window !== "undefined" && getUsed() < FREE_LIMIT;

  const explain = async (prompt: string) => {
    if (!canUseAI) {
      setError("Free AI explanation used. Sign in for more.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/tax-tools/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      setResult(data.explanation);
      markUsed();
    } catch {
      setError("AI is unavailable. See the rule-based explanation below.");
    } finally {
      setLoading(false);
    }
  };

  return { explain, result, loading, error, canUseAI };
}

// ── Rule-based fallbacks ──

export function getRuleBasedTaxExplanation(params: {
  income: number; federalTax: number; stateTax: number; totalTax: number;
  effectiveRate: number; takeHome: number; marginalRate: number;
}): string {
  const { income, federalTax, stateTax, totalTax, effectiveRate, takeHome, marginalRate } = params;
  const lines: string[] = [];
  lines.push(`On a gross income of $${income.toLocaleString()}, your estimated total tax is $${Math.round(totalTax).toLocaleString()} (${effectiveRate.toFixed(1)}% effective rate).`);
  lines.push(`Your federal tax is $${Math.round(federalTax).toLocaleString()} and state tax is $${Math.round(stateTax).toLocaleString()}.`);
  lines.push(`Your marginal tax bracket is ${marginalRate}%, meaning each additional dollar of income is taxed at that rate.`);
  if (effectiveRate < 15) lines.push("Your effective rate is relatively low. Consider maximizing retirement contributions (401k/IRA) to keep it that way.");
  else if (effectiveRate < 25) lines.push("Your effective rate is moderate. Look into tax-advantaged accounts and deductions to reduce your liability.");
  else lines.push("Your effective rate is high. Consider consulting a tax professional about deduction strategies, retirement contributions, or business structuring.");
  lines.push(`Your estimated take-home is $${Math.round(takeHome).toLocaleString()} per year ($${Math.round(takeHome / 12).toLocaleString()} per month).`);
  return lines.join("\n\n");
}

export function getRuleBasedSEExplanation(params: {
  netIncome: number; seTax: number; deductibleHalf: number; netAfterSE: number;
}): string {
  const { netIncome, seTax, deductibleHalf, netAfterSE } = params;
  const lines: string[] = [];
  lines.push(`As a self-employed individual earning $${netIncome.toLocaleString()}, you owe an estimated $${Math.round(seTax).toLocaleString()} in self-employment tax (Social Security + Medicare).`);
  lines.push(`The SE tax is 15.3% of 92.35% of your net income. The 92.35% adjustment simulates the employer-side deduction.`);
  lines.push(`You can deduct $${Math.round(deductibleHalf).toLocaleString()} (half of SE tax) from your income taxes, which lowers your taxable income.`);
  lines.push(`After SE tax, you have $${Math.round(netAfterSE).toLocaleString()} before standard income tax.`);
  if (netIncome > 100000) lines.push("At your income level, consider an S-Corp election to potentially reduce SE tax through reasonable salary + distributions.");
  return lines.join("\n\n");
}

export function getRuleBasedPlanningExplanation(params: {
  annualIncome: number; annualExpenses: number; annualNet: number;
  estimatedTax: number; quarterlyAmount: number;
}): string {
  const { annualIncome, annualExpenses, annualNet, estimatedTax, quarterlyAmount } = params;
  const lines: string[] = [];
  lines.push(`Your annual gross is $${annualIncome.toLocaleString()} with $${annualExpenses.toLocaleString()} in expenses, leaving $${annualNet.toLocaleString()} net income.`);
  lines.push(`Set aside approximately $${Math.round(estimatedTax).toLocaleString()} for taxes this year ($${Math.round(quarterlyAmount).toLocaleString()} per quarter).`);
  if (annualExpenses / annualIncome < 0.2) lines.push("Your expense ratio is low. Make sure you're tracking all deductible business expenses (home office, software, travel, equipment).");
  lines.push("Pay quarterly estimated taxes to avoid underpayment penalties. Due dates: April 15, June 15, September 15, January 15.");
  return lines.join("\n\n");
}

export function getRuleBasedIRSPrepExplanation(params: {
  totalIncome: number; totalDeductions: number; estimatedTax: number;
}): string {
  const { totalIncome, totalDeductions, estimatedTax } = params;
  const lines: string[] = [];
  lines.push(`Based on your inputs, your total income is $${totalIncome.toLocaleString()} with $${totalDeductions.toLocaleString()} in deductions.`);
  lines.push(`Your estimated tax liability is $${Math.round(estimatedTax).toLocaleString()}.`);
  lines.push("This is a prep summary only — you'll file these figures with your actual tax return. Double-check all numbers against your official documents (W-2s, 1099s, receipts).");
  lines.push("Consider keeping this summary alongside your tax documents for your accountant or when using filing software.");
  return lines.join("\n\n");
}

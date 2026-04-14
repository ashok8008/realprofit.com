"use client";
import React from "react";
import { AlertTriangle, CheckCircle, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UnderpaidResult {
  status: "underpaid" | "fair" | "above";
  gap: number;
  percentile: number;
  range: { min: number; mid: number; max: number };
  jobTitle: string;
}

interface UnderpaidResultsProps {
  result: UnderpaidResult;
  salary: number;
}

export function UnderpaidResults({ result, salary }: UnderpaidResultsProps) {
  const message = (() => {
    if (result.status === "underpaid") {
      return {
        headline: "You May Be Underpaid",
        subtext: "Based on your experience and location, your salary appears to be below the typical market range.",
        suggestion: `Consider researching more salary data and, if appropriate, preparing for a salary negotiation. The gap suggests you could potentially earn $${Math.abs(result.gap).toLocaleString()} more.`,
        color: "red" as const,
      };
    } else if (result.status === "above") {
      return {
        headline: "You're Earning Above Market",
        subtext: "Your salary is above the typical range for this role and experience level.",
        suggestion: "Great job negotiating! Continue to build skills and take on responsibilities to maintain your competitive position.",
        color: "emerald" as const,
      };
    } else {
      return {
        headline: "Your Pay Is Fair",
        subtext: "Your salary falls within the expected range for this role and experience level.",
        suggestion: "You're being compensated fairly. To increase your earnings, consider gaining new skills, certifications, or taking on additional responsibilities.",
        color: "blue" as const,
      };
    }
  })();

  const colorClasses = {
    red: { bg: "bg-red-50 border-2 border-red-200", icon: "bg-red-100", text: "text-red-800", sub: "text-red-700", salary: "text-red-600" },
    emerald: { bg: "bg-emerald-50 border-2 border-emerald-200", icon: "bg-emerald-100", text: "text-emerald-800", sub: "text-emerald-700", salary: "text-emerald-600" },
    blue: { bg: "bg-blue-50 border-2 border-blue-200", icon: "bg-blue-100", text: "text-blue-800", sub: "text-blue-700", salary: "text-blue-600" },
  };
  const cc = colorClasses[message.color];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Main Indicator */}
      <div className={`rounded-2xl p-8 text-center ${cc.bg}`}>
        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${cc.icon}`}>
          {message.color === "red" ? <AlertTriangle className="w-10 h-10 text-red-600" /> :
           message.color === "emerald" ? <TrendingUp className="w-10 h-10 text-emerald-600" /> :
           <CheckCircle className="w-10 h-10 text-blue-600" />}
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${cc.text}`}>{message.headline}</h2>
        <p className={`text-lg mb-4 ${cc.sub}`}>{message.subtext}</p>
      </div>

      {/* Gauge / Range Visualization */}
      <div className="bg-card border rounded-xl p-6">
        <h4 className="font-semibold mb-4 text-center">Where You Stand</h4>
        <div className="relative h-12 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-red-200" />
          <div className="absolute inset-y-0 left-1/3 w-1/3 bg-blue-200" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-emerald-200" />
          <div className="absolute top-1 bottom-1 w-2 bg-gray-800 rounded-full shadow-lg transition-all" style={{ left: `${Math.min(95, Math.max(5, result.percentile))}%`, marginLeft: "-4px" }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Underpaid</span><span>Fair</span><span>Above Market</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 text-center">
          <div>
            <div className="text-sm text-muted-foreground">Market Low</div>
            <div className="text-lg font-bold">${result.range.min.toLocaleString()}</div>
          </div>
          <div className="border-x">
            <div className="text-sm text-muted-foreground">Your Salary</div>
            <div className={`text-lg font-bold ${cc.salary}`}>${salary.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Market High</div>
            <div className="text-lg font-bold">${result.range.max.toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center">
          <div className="text-sm text-muted-foreground">Gap from Market Midpoint</div>
          <div className={`text-2xl font-bold ${result.gap >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {result.gap >= 0 ? "+" : ""}{result.gap.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            ({((result.gap / result.range.mid) * 100).toFixed(1)}% {result.gap >= 0 ? "above" : "below"})
          </div>
        </div>
      </div>

      {/* Suggestion */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h4 className="font-semibold mb-2">What This Means</h4>
        <p className="text-amber-800">{message.suggestion}</p>
      </div>

      {/* Next Steps */}
      <div className="bg-card border rounded-xl p-6">
        <h4 className="font-semibold mb-4">Suggested Next Steps</h4>
        <ul className="space-y-3">
          {result.status === "underpaid" ? (
            <>
              <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" /><span>Research more salary data specific to your company and industry</span></li>
              <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" /><span>Document your achievements and value you bring to the role</span></li>
              <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" /><span>Consider scheduling a conversation with your manager about compensation</span></li>
            </>
          ) : result.status === "above" ? (
            <>
              <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" /><span>Continue developing skills to maintain your competitive position</span></li>
              <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" /><span>Consider total compensation (equity, benefits, bonus) not just base salary</span></li>
            </>
          ) : (
            <>
              <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" /><span>Focus on skill development to move toward the upper range</span></li>
              <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" /><span>Track your achievements for your next performance review</span></li>
            </>
          )}
        </ul>
      </div>

      {/* Related Links */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/career-tools/salary-comparison" className="text-teal-600 hover:underline flex items-center gap-1">
          <ArrowRight className="w-4 h-4" /> Detailed Salary Comparison
        </Link>
        <Link href="/career-tools/resume-builder" className="text-teal-600 hover:underline flex items-center gap-1">
          <ArrowRight className="w-4 h-4" /> Update Your Resume
        </Link>
      </div>
    </div>
  );
}

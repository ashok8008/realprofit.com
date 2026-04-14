import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Target, Building2, AlertCircle, Compass, BarChart3, ChevronRight } from "lucide-react";
import {
  resumeRoleEntries, resumeScoreEntries, resumeExperienceEntries,
  resumeCompanyEntries, resumeProblemEntries, careerDecisionEntries,
} from "@/lib/pseo/datasets/resumeCareer";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://realprofits.com";

export const metadata: Metadata = {
  title: "Resume & Career Guides — Free Expert Tips | RealProfits",
  description: "Free resume guides for 50+ job roles, score explanations, company-specific tips, and career decision frameworks. ATS-optimized templates and expert advice.",
  alternates: { canonical: `${BASE}/learn` },
  openGraph: { title: "Resume & Career Guides", description: "Free guides for every career stage — from first resume to senior executive.", url: `${BASE}/learn`, siteName: "RealProfits" },
};

const categories = [
  { title: "Resume by Job Role", desc: "Role-specific tips, keywords & templates", icon: FileText, entries: resumeRoleEntries.slice(0, 12), total: resumeRoleEntries.length, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { title: "Resume Score Explained", desc: "What your score means & how to improve", icon: Target, entries: resumeScoreEntries, total: resumeScoreEntries.length, color: "text-teal-600 bg-teal-50 border-teal-200" },
  { title: "Resume by Experience", desc: "Guides for every career stage", icon: BarChart3, entries: resumeExperienceEntries, total: resumeExperienceEntries.length, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { title: "Resume for Companies", desc: "What top companies look for", icon: Building2, entries: resumeCompanyEntries.slice(0, 10), total: resumeCompanyEntries.length, color: "text-violet-600 bg-violet-50 border-violet-200" },
  { title: "Resume Problems & Fixes", desc: "Common issues and how to solve them", icon: AlertCircle, entries: resumeProblemEntries.slice(0, 8), total: resumeProblemEntries.length, color: "text-rose-600 bg-rose-50 border-rose-200" },
  { title: "Career Decisions", desc: "Data-driven frameworks for big moves", icon: Compass, entries: careerDecisionEntries, total: careerDecisionEntries.length, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
];

export default function LearnHub() {
  const totalPages = categories.reduce((s, c) => s + c.total, 0);

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 md:py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <span className="inline-block bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-5">
            {totalPages}+ Free Guides
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Resume & Career Guides
          </h1>
          <p className="text-gray-400 text-base max-w-2xl mx-auto leading-relaxed mb-8">
            Expert tips for every job role, experience level, and career stage. ATS-optimized advice, company-specific strategies, and data-driven decision frameworks — all free.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/career-tools/resume-builder" className="bg-[#f5c542] text-gray-900 hover:bg-[#e5b732] rounded-lg px-7 py-3 font-bold text-sm transition-colors">
              Build Your Resume
            </Link>
            <Link href="/career-tools/salary-comparison" className="border-2 border-teal-500/50 text-teal-400 hover:bg-teal-500/10 rounded-lg px-7 py-3 font-bold text-sm transition-colors">
              Compare Your Salary
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="container mx-auto px-4 max-w-6xl py-12 space-y-12">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <section key={cat.title}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-900">{cat.title}</h2>
                    <p className="text-sm text-gray-500">{cat.desc}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded">{cat.total} guides</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.entries.map((entry) => (
                  <Link key={entry.slug} href={`/learn/${entry.slug}`} className="group flex items-center gap-2 p-4 border border-gray-200 rounded-xl bg-white hover:border-teal-400 hover:shadow-sm transition-all">
                    <span className="text-sm font-medium text-gray-800 group-hover:text-teal-700 flex-1 line-clamp-1">{entry.title.split("—")[0].trim()}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 flex-shrink-0" />
                  </Link>
                ))}
              </div>
              {cat.entries.length < cat.total && (
                <p className="text-sm text-gray-500 mt-3">+ {cat.total - cat.entries.length} more guides</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

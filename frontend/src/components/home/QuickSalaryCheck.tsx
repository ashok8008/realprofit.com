"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronRight, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { analyzeSalary, getAllJobTitles } from "@/lib/career-tools/salaryBenchmarks";

export function QuickSalaryCheck() {
  const [jobTitle, setJobTitle] = useState("");
  const [salary, setSalary] = useState("");
  const allTitles = useMemo(() => getAllJobTitles(), []);
  
  const salaryNum = parseInt(salary.replace(/[^0-9]/g, '')) || 0;
  const analysis = jobTitle.trim() && salaryNum > 0
    ? analyzeSalary(jobTitle, 3, salaryNum, "National Average")
    : null;
  
  const hasResult = analysis?.benchmark && analysis?.gap;
  const position = analysis?.gap?.position;
  
  const formatSalary = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return '';
    return '$' + parseInt(num).toLocaleString();
  };
  
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 max-w-md" data-testid="quick-salary-check">
      <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Search className="w-3.5 h-3.5" /> Quick Salary Check
      </div>
      <div className="flex gap-2 mb-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Job title..."
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            list="hero-job-titles"
            className="w-full rounded-lg bg-white/90 text-gray-900 text-sm px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f5c542]"
            data-testid="quick-salary-job-input"
          />
          <datalist id="hero-job-titles">
            {allTitles.map(t => <option key={t} value={t} />)}
          </datalist>
        </div>
        <div className="w-36">
          <input
            type="text"
            placeholder="Salary..."
            value={salary}
            onChange={e => setSalary(formatSalary(e.target.value))}
            className="w-full rounded-lg bg-white/90 text-gray-900 text-sm px-3 py-2.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f5c542]"
            data-testid="quick-salary-amount-input"
          />
        </div>
      </div>
      
      {hasResult ? (
        <div className={`rounded-lg px-4 py-3 flex items-center justify-between ${
          position === 'below' ? 'bg-red-500/20 border border-red-400/30' :
          position === 'above' ? 'bg-emerald-500/20 border border-emerald-400/30' :
          'bg-blue-500/20 border border-blue-400/30'
        }`} data-testid="quick-salary-result">
          <div className="flex items-center gap-2">
            {position === 'below' ? <TrendingDown className="w-4 h-4 text-red-300" /> :
             position === 'above' ? <TrendingUp className="w-4 h-4 text-emerald-300" /> :
             <Minus className="w-4 h-4 text-blue-300" />}
            <span className={`text-sm font-bold ${
              position === 'below' ? 'text-red-200' :
              position === 'above' ? 'text-emerald-200' : 'text-blue-200'
            }`}>
              {position === 'below' ? 'Below Market' : position === 'above' ? 'Above Market' : 'At Market'}
            </span>
          </div>
          <Link href="/career-tools/salary-comparison" className="text-xs text-white/70 hover:text-white flex items-center gap-0.5 transition-colors">
            Full analysis <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="text-[11px] text-white/50">
          {jobTitle && salaryNum === 0 ? 'Enter your salary' : 
           !jobTitle ? 'Try: Software Engineer, Data Analyst, Product Manager...' :
           'No data for this role. Try a different title.'}
        </div>
      )}
    </div>
  );
}

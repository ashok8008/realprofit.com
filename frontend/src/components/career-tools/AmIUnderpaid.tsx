"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { saveToStorage, loadFromStorage } from "@/lib/career-tools/storage";
import { analyzeSalary, getAllJobTitles } from "@/lib/career-tools/salaryBenchmarks";
import { locationMultipliers } from "@/data/career-tools/benchmarks";
import { UnderpaidResults } from "./underpaid/UnderpaidResults";

const STORAGE_KEY = 'am_i_underpaid';

interface UnderpaidData {
  jobTitle: string;
  salary: string;
  yearsExperience: string;
  location: string;
  isManager: boolean;
}

const defaultData: UnderpaidData = {
  jobTitle: '',
  salary: '',
  yearsExperience: '3',
  location: 'Other',
  isManager: false,
};

export function AmIUnderpaid() {
  const [data, setData] = useState<UnderpaidData>(() => 
    loadFromStorage(STORAGE_KEY, defaultData)
  );

  // Auto-save
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveToStorage(STORAGE_KEY, data);
    }, 500);
    return () => clearTimeout(timeout);
  }, [data]);

  const handleUpdate = (field: keyof UnderpaidData, value: string | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const allTitles = getAllJobTitles();
  const salary = parseInt(data.salary.replace(/[^0-9]/g, '')) || 0;
  const years = parseInt(data.yearsExperience) || 0;

  let result: { status: 'underpaid' | 'fair' | 'above'; gap: number; percentile: number; range: { min: number; mid: number; max: number }; jobTitle: string } | null = null;
  
  if (data.jobTitle.trim() && salary > 0) {
    const analysis = analyzeSalary(data.jobTitle, years, salary, data.location);
    if (analysis.benchmark && analysis.adjustedRange && analysis.gap) {
      let adjRange = { ...analysis.adjustedRange };
      
      // Manager adjustment
      if (data.isManager) {
        adjRange = {
          min: Math.round(adjRange.min * 1.15),
          mid: Math.round(adjRange.mid * 1.15),
          max: Math.round(adjRange.max * 1.15),
        };
      }
      
      let status: 'underpaid' | 'fair' | 'above';
      let percentile: number;
      
      if (salary < adjRange.min) {
        status = 'underpaid';
        percentile = Math.max(1, Math.round((salary / adjRange.min) * 25));
      } else if (salary > adjRange.max) {
        status = 'above';
        percentile = Math.min(99, 75 + Math.round(((salary - adjRange.max) / adjRange.max) * 25));
      } else {
        status = 'fair';
        percentile = 25 + Math.round(((salary - adjRange.min) / (adjRange.max - adjRange.min)) * 50);
      }
      
      result = {
        status,
        gap: salary - adjRange.mid,
        percentile,
        range: adjRange,
        jobTitle: analysis.benchmark.jobTitle,
      };
    }
  }

  const getMessage = () => {
    if (!result) return null;
    return result;
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Job Title *</Label>
            <Input 
              placeholder="Software Engineer"
              value={data.jobTitle}
              onChange={e => handleUpdate('jobTitle', e.target.value)}
              list="job-titles-underpaid"
            />
            <datalist id="job-titles-underpaid">
              {allTitles.map(title => (
                <option key={title} value={title} />
              ))}
            </datalist>
          </div>
          <div>
            <Label>Your Salary ($) *</Label>
            <Input 
              placeholder="85,000"
              value={data.salary}
              onChange={e => handleUpdate('salary', e.target.value)}
            />
          </div>
          <div>
            <Label>Years of Experience</Label>
            <Select value={data.yearsExperience} onValueChange={v => handleUpdate('yearsExperience', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0,1,2,3,4,5,6,7,8,9,10,15,20].map(y => (
                  <SelectItem key={y} value={y.toString()}>{y} {y === 1 ? 'year' : 'years'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Location</Label>
            <Select value={data.location} onValueChange={v => handleUpdate('location', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locationMultipliers.map(l => (
                  <SelectItem key={l.state} value={l.state}>{l.state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch 
              checked={data.isManager}
              onCheckedChange={v => handleUpdate('isManager', v)}
            />
            <Label>Manager / Leadership Role</Label>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && <UnderpaidResults result={result} salary={salary} />}

      {/* Empty State */}
      {!result && (
        <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed max-w-2xl mx-auto">
          <p className="text-muted-foreground">
            {!data.jobTitle ? 'Enter your job title and salary to find out if you\'re underpaid' :
             salary === 0 ? 'Enter your salary to see results' :
             `No benchmark data for "${data.jobTitle}". Try: Software Engineer, Data Analyst, etc.`}
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="max-w-2xl mx-auto">
        <p className="text-xs text-muted-foreground text-center">
          This tool provides estimates based on general market data. Actual salaries vary by company, 
          industry, specific skills, and negotiation. Use this as one data point among many when 
          evaluating your compensation.
        </p>
      </div>
    </div>
  );
}

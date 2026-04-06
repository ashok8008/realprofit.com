import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "wouter";
import { saveToStorage, loadFromStorage } from "@/lib/career-tools/storage";
import { findBenchmark, getSalaryRange, locationMultipliers, salaryBenchmarks } from "@/data/career-tools/benchmarks";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine, Legend } from "recharts";

const STORAGE_KEY = 'salary_comparison';

interface SalaryData {
  jobTitle: string;
  currentSalary: string;
  location: string;
  yearsExperience: string;
}

const defaultData: SalaryData = {
  jobTitle: '',
  currentSalary: '',
  location: 'Other',
  yearsExperience: '3',
};

export function SalaryComparison() {
  const [data, setData] = useState<SalaryData>(() => 
    loadFromStorage(STORAGE_KEY, defaultData)
  );

  // Auto-save
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveToStorage(STORAGE_KEY, data);
    }, 500);
    return () => clearTimeout(timeout);
  }, [data]);

  const handleUpdate = (field: keyof SalaryData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const benchmark = findBenchmark(data.jobTitle);
  const salary = parseInt(data.currentSalary.replace(/[^0-9]/g, '')) || 0;
  const years = parseInt(data.yearsExperience) || 0;
  
  let range = null;
  let assessment: 'below' | 'average' | 'above' = 'average';
  let gap = 0;
  let percentile = 50;

  if (benchmark && salary > 0) {
    range = getSalaryRange(benchmark, years, data.location);
    
    if (salary < range.min) {
      assessment = 'below';
      percentile = Math.round((salary / range.min) * 25);
      gap = range.min - salary;
    } else if (salary > range.max) {
      assessment = 'above';
      percentile = Math.min(99, 75 + Math.round(((salary - range.max) / range.max) * 25));
      gap = salary - range.max;
    } else {
      assessment = 'average';
      percentile = 25 + Math.round(((salary - range.min) / (range.max - range.min)) * 50);
      gap = salary - range.mid;
    }
  }

  const chartData = range ? [
    { name: 'Your Salary', value: salary, fill: assessment === 'below' ? '#ef4444' : assessment === 'above' ? '#22c55e' : '#3b82f6' },
    { name: 'Market Low', value: range.min, fill: '#d1d5db' },
    { name: 'Market Mid', value: range.mid, fill: '#9ca3af' },
    { name: 'Market High', value: range.max, fill: '#6b7280' },
  ] : [];

  // Calculate take-home (simplified)
  const estimateTakeHome = (gross: number) => {
    const fedTax = gross * 0.18; // Simplified
    const stateTax = gross * 0.05;
    const fica = gross * 0.0765;
    return gross - fedTax - stateTax - fica;
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label>Job Title *</Label>
          <Input 
            placeholder="Software Engineer"
            value={data.jobTitle}
            onChange={e => handleUpdate('jobTitle', e.target.value)}
            list="job-titles"
          />
          <datalist id="job-titles">
            {salaryBenchmarks.map(b => (
              <option key={b.role} value={b.role} />
            ))}
          </datalist>
        </div>
        <div>
          <Label>Current Salary ($) *</Label>
          <Input 
            placeholder="85,000"
            value={data.currentSalary}
            onChange={e => handleUpdate('currentSalary', e.target.value)}
          />
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
      </div>

      {/* Results */}
      {benchmark && salary > 0 && range && (
        <div className="space-y-6">
          {/* Assessment Card */}
          <div className={`rounded-xl p-6 ${
            assessment === 'below' ? 'bg-red-50 border border-red-200' :
            assessment === 'above' ? 'bg-emerald-50 border border-emerald-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                assessment === 'below' ? 'bg-red-100 text-red-600' :
                assessment === 'above' ? 'bg-emerald-100 text-emerald-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {assessment === 'below' ? <TrendingDown className="w-6 h-6" /> :
                 assessment === 'above' ? <TrendingUp className="w-6 h-6" /> :
                 <Minus className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${
                  assessment === 'below' ? 'text-red-800' :
                  assessment === 'above' ? 'text-emerald-800' :
                  'text-blue-800'
                }`}>
                  {assessment === 'below' ? 'Below Average' :
                   assessment === 'above' ? 'Above Average' :
                   'Within Average Range'}
                </h3>
                <p className={`${
                  assessment === 'below' ? 'text-red-700' :
                  assessment === 'above' ? 'text-emerald-700' :
                  'text-blue-700'
                }`}>
                  {assessment === 'below' 
                    ? `Your salary is ${Math.abs(gap).toLocaleString()} below the typical range for ${benchmark.role} with ${years} years of experience in ${data.location}.`
                    : assessment === 'above'
                    ? `Your salary is ${Math.abs(gap).toLocaleString()} above the typical range for ${benchmark.role} with ${years} years of experience in ${data.location}.`
                    : `Your salary is within the expected range for ${benchmark.role} with ${years} years of experience in ${data.location}.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Your Salary</div>
              <div className="text-2xl font-bold">${salary.toLocaleString()}</div>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Market Midpoint</div>
              <div className="text-2xl font-bold">${range.mid.toLocaleString()}</div>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Gap from Mid</div>
              <div className={`text-2xl font-bold ${gap >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {gap >= 0 ? '+' : ''}{gap.toLocaleString()}
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Percentile</div>
              <div className="text-2xl font-bold">{percentile}th</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-card border rounded-xl p-6">
            <h4 className="font-semibold mb-4">Salary Comparison</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <XAxis type="number" tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Take-Home Estimate */}
          <div className="bg-card border rounded-xl p-6">
            <h4 className="font-semibold mb-4">Estimated Take-Home Pay</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Annual (after tax)</div>
                <div className="text-xl font-bold text-emerald-600">
                  ${Math.round(estimateTakeHome(salary)).toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Monthly</div>
                <div className="text-xl font-bold">
                  ${Math.round(estimateTakeHome(salary) / 12).toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Biweekly</div>
                <div className="text-xl font-bold">
                  ${Math.round(estimateTakeHome(salary) / 26).toLocaleString()}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 flex items-start gap-1">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              Estimate based on simplified federal, state, and FICA taxes. Actual may vary.
            </p>
          </div>

          {/* Market Range */}
          <div className="bg-card border rounded-xl p-6">
            <h4 className="font-semibold mb-4">Market Range for {benchmark.role} ({range.level})</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Low</div>
                <div className="text-xl font-bold">${range.min.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Midpoint</div>
                <div className="text-xl font-bold text-teal-600">${range.mid.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">High</div>
                <div className="text-xl font-bold">${range.max.toLocaleString()}</div>
              </div>
            </div>
            
            {/* Range bar */}
            <div className="mt-4 relative h-8">
              <div className="absolute inset-x-0 top-3 h-2 bg-gray-200 rounded-full"></div>
              <div 
                className="absolute top-3 h-2 bg-gradient-to-r from-teal-300 to-teal-500 rounded-full"
                style={{ left: '0%', width: '100%' }}
              ></div>
              <div 
                className="absolute top-1 w-4 h-6 bg-blue-600 rounded shadow"
                style={{ left: `${Math.min(100, Math.max(0, ((salary - range.min * 0.8) / (range.max * 1.2 - range.min * 0.8)) * 100))}%`, marginLeft: '-8px' }}
              >
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap">You</div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Salary benchmarks are estimates based on industry averages. 
              Actual salaries vary by company size, specific skills, negotiation, and market conditions. 
              Use this as a reference point, not a guarantee.
            </p>
          </div>

          {/* Related Links */}
          <div className="flex flex-wrap gap-3">
            <Link href="/career-tools/am-i-underpaid" className="text-sm text-teal-600 hover:underline">
              → Am I Underpaid Tool
            </Link>
            <Link href="/tools/paycheck-calculator" className="text-sm text-teal-600 hover:underline">
              → Paycheck Calculator
            </Link>
            <Link href="/guides" className="text-sm text-teal-600 hover:underline">
              → Salary Guides
            </Link>
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!benchmark || salary === 0) && (
        <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
          <p className="text-muted-foreground">
            {!data.jobTitle ? 'Enter a job title to see salary comparisons' :
             !benchmark ? `No benchmark data found for "${data.jobTitle}". Try a different role.` :
             'Enter your current salary to see the comparison'}
          </p>
          {!benchmark && data.jobTitle && (
            <p className="text-sm text-muted-foreground mt-2">
              Try: Software Engineer, Data Analyst, Product Manager, Marketing Manager, etc.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

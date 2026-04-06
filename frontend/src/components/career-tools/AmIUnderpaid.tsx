import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, CheckCircle, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { saveToStorage, loadFromStorage } from "@/lib/career-tools/storage";
import { findBenchmark, getSalaryRange, assessSalary, locationMultipliers, salaryBenchmarks } from "@/data/career-tools/benchmarks";

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

  const benchmark = findBenchmark(data.jobTitle);
  const salary = parseInt(data.salary.replace(/[^0-9]/g, '')) || 0;
  const years = parseInt(data.yearsExperience) || 0;

  let result = null;
  if (benchmark && salary > 0) {
    const assessment = assessSalary(salary, benchmark, years, data.location);
    // Manager adjustment
    if (data.isManager) {
      assessment.range.min = Math.round(assessment.range.min * 1.15);
      assessment.range.mid = Math.round(assessment.range.mid * 1.15);
      assessment.range.max = Math.round(assessment.range.max * 1.15);
      // Recalculate status
      if (salary < assessment.range.min) {
        assessment.status = 'underpaid';
        assessment.gap = salary - assessment.range.min;
      } else if (salary > assessment.range.max) {
        assessment.status = 'above';
        assessment.gap = salary - assessment.range.max;
      } else {
        assessment.status = 'fair';
        assessment.gap = salary - assessment.range.mid;
      }
    }
    result = assessment;
  }

  const getMessage = () => {
    if (!result) return null;
    
    if (result.status === 'underpaid') {
      return {
        headline: "You May Be Underpaid",
        subtext: `Based on your experience and location, your salary appears to be below the typical market range.`,
        suggestion: `Consider researching more salary data and, if appropriate, preparing for a salary negotiation. The gap suggests you could potentially earn $${Math.abs(result.gap).toLocaleString()} more.`,
        color: 'red',
      };
    } else if (result.status === 'above') {
      return {
        headline: "You're Earning Above Market",
        subtext: `Your salary is above the typical range for this role and experience level.`,
        suggestion: `Great job negotiating! Continue to build skills and take on responsibilities to maintain your competitive position.`,
        color: 'emerald',
      };
    } else {
      return {
        headline: "Your Pay Is Fair",
        subtext: `Your salary falls within the expected range for this role and experience level.`,
        suggestion: `You're being compensated fairly. To increase your earnings, consider gaining new skills, certifications, or taking on additional responsibilities.`,
        color: 'blue',
      };
    }
  };

  const message = getMessage();

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
              {salaryBenchmarks.map(b => (
                <option key={b.role} value={b.role} />
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
      {result && message && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Main Indicator */}
          <div className={`rounded-2xl p-8 text-center ${
            message.color === 'red' ? 'bg-red-50 border-2 border-red-200' :
            message.color === 'emerald' ? 'bg-emerald-50 border-2 border-emerald-200' :
            'bg-blue-50 border-2 border-blue-200'
          }`}>
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              message.color === 'red' ? 'bg-red-100' :
              message.color === 'emerald' ? 'bg-emerald-100' :
              'bg-blue-100'
            }`}>
              {message.color === 'red' ? <AlertTriangle className="w-10 h-10 text-red-600" /> :
               message.color === 'emerald' ? <TrendingUp className="w-10 h-10 text-emerald-600" /> :
               <CheckCircle className="w-10 h-10 text-blue-600" />}
            </div>
            
            <h2 className={`text-3xl font-bold mb-2 ${
              message.color === 'red' ? 'text-red-800' :
              message.color === 'emerald' ? 'text-emerald-800' :
              'text-blue-800'
            }`}>
              {message.headline}
            </h2>
            
            <p className={`text-lg mb-4 ${
              message.color === 'red' ? 'text-red-700' :
              message.color === 'emerald' ? 'text-emerald-700' :
              'text-blue-700'
            }`}>
              {message.subtext}
            </p>
          </div>

          {/* Gauge / Range Visualization */}
          <div className="bg-card border rounded-xl p-6">
            <h4 className="font-semibold mb-4 text-center">Where You Stand</h4>
            
            {/* Visual gauge */}
            <div className="relative h-12 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="absolute inset-y-0 left-0 w-1/3 bg-red-200"></div>
              <div className="absolute inset-y-0 left-1/3 w-1/3 bg-blue-200"></div>
              <div className="absolute inset-y-0 right-0 w-1/3 bg-emerald-200"></div>
              
              {/* Position marker */}
              <div 
                className="absolute top-1 bottom-1 w-2 bg-gray-800 rounded-full shadow-lg transition-all"
                style={{ 
                  left: `${Math.min(95, Math.max(5, result.percentile))}%`,
                  marginLeft: '-4px'
                }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Underpaid</span>
              <span>Fair</span>
              <span>Above Market</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Market Low</div>
                <div className="text-lg font-bold">${result.range.min.toLocaleString()}</div>
              </div>
              <div className="border-x">
                <div className="text-sm text-muted-foreground">Your Salary</div>
                <div className={`text-lg font-bold ${
                  result.status === 'underpaid' ? 'text-red-600' :
                  result.status === 'above' ? 'text-emerald-600' :
                  'text-blue-600'
                }`}>${salary.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Market High</div>
                <div className="text-lg font-bold">${result.range.max.toLocaleString()}</div>
              </div>
            </div>

            {/* Gap */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Gap from Market Midpoint</div>
              <div className={`text-2xl font-bold ${
                result.gap >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {result.gap >= 0 ? '+' : ''}{result.gap.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                ({((result.gap / result.range.mid) * 100).toFixed(1)}% {result.gap >= 0 ? 'above' : 'below'})
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
              {result.status === 'underpaid' ? (
                <>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" />
                    <span>Research more salary data specific to your company and industry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" />
                    <span>Document your achievements and value you bring to the role</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" />
                    <span>Consider scheduling a conversation with your manager about compensation</span>
                  </li>
                </>
              ) : result.status === 'above' ? (
                <>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" />
                    <span>Continue developing skills to maintain your competitive position</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" />
                    <span>Consider total compensation (equity, benefits, bonus) not just base salary</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" />
                    <span>Focus on skill development to move toward the upper range</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" />
                    <span>Track your achievements for your next performance review</span>
                  </li>
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
      )}

      {/* Empty State */}
      {(!benchmark || salary === 0) && (
        <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed max-w-2xl mx-auto">
          <p className="text-muted-foreground">
            {!data.jobTitle ? 'Enter your job title and salary to find out if you\'re underpaid' :
             !benchmark ? `No benchmark data for "${data.jobTitle}". Try: Software Engineer, Data Analyst, etc.` :
             'Enter your salary to see results'}
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

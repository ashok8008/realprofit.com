import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Download, CheckCircle, DollarSign, Target, MessageSquare, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { saveToStorage, loadFromStorage } from "@/lib/career-tools/storage";
import { findBenchmark, getSalaryRange, locationMultipliers, salaryBenchmarks } from "@/data/career-tools/benchmarks";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = 'salary_negotiation';

interface NegotiationData {
  situation: 'new-offer' | 'raise' | 'promotion';
  currentSalary: string;
  offeredSalary: string;
  targetSalary: string;
  jobTitle: string;
  yearsExperience: string;
  location: string;
  achievements: string;
  marketData: string;
  concerns: string;
}

const defaultData: NegotiationData = {
  situation: 'new-offer',
  currentSalary: '',
  offeredSalary: '',
  targetSalary: '',
  jobTitle: '',
  yearsExperience: '3',
  location: 'Other',
  achievements: '',
  marketData: '',
  concerns: '',
};

function generateScript(data: NegotiationData, benchmark: ReturnType<typeof findBenchmark>, range: ReturnType<typeof getSalaryRange> | null): string {
  const offered = parseInt(data.offeredSalary.replace(/[^0-9]/g, '')) || 0;
  const target = parseInt(data.targetSalary.replace(/[^0-9]/g, '')) || 0;
  const current = parseInt(data.currentSalary.replace(/[^0-9]/g, '')) || 0;
  
  let script = '';
  
  if (data.situation === 'new-offer') {
    script = `Thank you for the offer for the ${data.jobTitle || '[Job Title]'} position. I'm very excited about the opportunity to join the team.

After carefully considering the offer and researching market data, I'd like to discuss the base salary. The current offer is $${offered.toLocaleString()}, and based on my experience${data.yearsExperience ? ` of ${data.yearsExperience} years` : ''} and the market rate for this role${range ? ` ($${range.min.toLocaleString()} - $${range.max.toLocaleString()})` : ''}, I believe a salary of $${target.toLocaleString()} would be more aligned with my qualifications.

${data.achievements ? `To support this request, I'd like to highlight:\n${data.achievements}\n` : ''}
${data.marketData ? `Additionally, my research shows:\n${data.marketData}\n` : ''}
I'm confident I can bring significant value to the team and would love to find a number that works for both of us. Is there flexibility in the compensation package?`;
  } else if (data.situation === 'raise') {
    const percentIncrease = current > 0 ? Math.round(((target - current) / current) * 100) : 0;
    script = `I'd like to schedule some time to discuss my compensation. I've been in my role for [time period] and have taken on additional responsibilities that I believe warrant a salary adjustment.

Currently, my salary is $${current.toLocaleString()}. Based on my contributions and market research${range ? ` showing the range for ${data.jobTitle || 'this role'} is $${range.min.toLocaleString()} - $${range.max.toLocaleString()}` : ''}, I'm requesting an increase to $${target.toLocaleString()}${percentIncrease > 0 ? ` (${percentIncrease}% increase)` : ''}.

${data.achievements ? `Key achievements since my last review:\n${data.achievements}\n` : ''}
${data.marketData ? `Market data supporting this request:\n${data.marketData}\n` : ''}
I'm committed to continuing to deliver results and would like to ensure my compensation reflects my contributions. Can we discuss what's possible?`;
  } else {
    script = `Thank you for considering me for the ${data.jobTitle || '[New Role]'} promotion. I'm excited about taking on these new responsibilities.

I'd like to discuss the compensation for this new role. Given the increased scope and my track record${data.yearsExperience ? ` over ${data.yearsExperience} years` : ''}, I believe a salary of $${target.toLocaleString()} is appropriate${range ? `, which aligns with the market range of $${range.min.toLocaleString()} - $${range.max.toLocaleString()} for this level` : ''}.

${data.achievements ? `My accomplishments that qualify me for this promotion:\n${data.achievements}\n` : ''}
I'm confident in my ability to excel in this role and would like to ensure the compensation reflects the new responsibilities. What are your thoughts?`;
  }
  
  return script;
}

export function SalaryNegotiation() {
  const { toast } = useToast();
  const [data, setData] = useState<NegotiationData>(() => 
    loadFromStorage(STORAGE_KEY, defaultData)
  );

  // Auto-save
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveToStorage(STORAGE_KEY, data);
    }, 500);
    return () => clearTimeout(timeout);
  }, [data]);

  const handleUpdate = (field: keyof NegotiationData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const benchmark = findBenchmark(data.jobTitle);
  const years = parseInt(data.yearsExperience) || 0;
  const range = benchmark ? getSalaryRange(benchmark, years, data.location) : null;
  
  const script = generateScript(data, benchmark, range);

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    toast({ title: "Copied to clipboard" });
  };

  const offered = parseInt(data.offeredSalary.replace(/[^0-9]/g, '')) || 0;
  const target = parseInt(data.targetSalary.replace(/[^0-9]/g, '')) || 0;

  // Negotiation strength indicator
  const getStrengthIndicator = () => {
    if (!range || target === 0) return null;
    
    if (target <= range.min) {
      return { level: 'easy', text: 'Very achievable - below market minimum', color: 'text-emerald-600' };
    } else if (target <= range.mid) {
      return { level: 'moderate', text: 'Achievable - within typical range', color: 'text-blue-600' };
    } else if (target <= range.max) {
      return { level: 'stretch', text: 'Stretch goal - near top of range', color: 'text-amber-600' };
    } else {
      return { level: 'aggressive', text: 'Aggressive - above typical range', color: 'text-red-600' };
    }
  };

  const strength = getStrengthIndicator();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Your Negotiation Details</h2>
          
          <div>
            <Label>What's your situation?</Label>
            <Select value={data.situation} onValueChange={v => handleUpdate('situation', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-offer">New Job Offer</SelectItem>
                <SelectItem value="raise">Asking for a Raise</SelectItem>
                <SelectItem value="promotion">Promotion Discussion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Job Title</Label>
              <Input 
                placeholder="Software Engineer"
                value={data.jobTitle}
                onChange={e => handleUpdate('jobTitle', e.target.value)}
                list="job-titles-neg"
              />
              <datalist id="job-titles-neg">
                {salaryBenchmarks.map(b => (
                  <option key={b.role} value={b.role} />
                ))}
              </datalist>
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

          <div className="grid grid-cols-3 gap-4">
            {data.situation !== 'new-offer' && (
              <div>
                <Label>Current Salary</Label>
                <Input 
                  placeholder="85,000"
                  value={data.currentSalary}
                  onChange={e => handleUpdate('currentSalary', e.target.value)}
                />
              </div>
            )}
            {data.situation === 'new-offer' && (
              <div>
                <Label>Offered Salary</Label>
                <Input 
                  placeholder="95,000"
                  value={data.offeredSalary}
                  onChange={e => handleUpdate('offeredSalary', e.target.value)}
                />
              </div>
            )}
            <div className={data.situation === 'new-offer' ? 'col-span-2' : ''}>
              <Label>Target Salary *</Label>
              <Input 
                placeholder="110,000"
                value={data.targetSalary}
                onChange={e => handleUpdate('targetSalary', e.target.value)}
              />
            </div>
          </div>

          {/* Market Range Reference */}
          {range && (
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span className="font-semibold text-sm">Market Range for {benchmark?.role}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="text-muted-foreground">Low</div>
                  <div className="font-bold">${range.min.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Mid</div>
                  <div className="font-bold text-teal-600">${range.mid.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">High</div>
                  <div className="font-bold">${range.max.toLocaleString()}</div>
                </div>
              </div>
              {strength && (
                <div className={`mt-3 text-sm text-center font-medium ${strength.color}`}>
                  {strength.text}
                </div>
              )}
            </div>
          )}

          <div>
            <Label>Key Achievements (one per line)</Label>
            <Textarea 
              placeholder="• Led project that increased revenue by 20%&#10;• Reduced system downtime by 50%&#10;• Mentored 3 junior developers"
              rows={4}
              value={data.achievements}
              onChange={e => handleUpdate('achievements', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Quantify results whenever possible</p>
          </div>

          <div>
            <Label>Supporting Market Data (optional)</Label>
            <Textarea 
              placeholder="• Glassdoor shows median of $X for this role&#10;• Competing offer from Company Y at $X"
              rows={2}
              value={data.marketData}
              onChange={e => handleUpdate('marketData', e.target.value)}
            />
          </div>
        </div>

        {/* Generated Script */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Your Negotiation Script
            </h3>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-1" /> Copy
            </Button>
          </div>

          <div className="border rounded-xl bg-white p-6 min-h-[400px]">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
              {script}
            </pre>
          </div>

          <p className="text-xs text-muted-foreground">
            This script is a starting point. Customize it with your voice and specific details.
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h4 className="font-semibold text-emerald-800">Do</h4>
          </div>
          <ul className="text-sm text-emerald-700 space-y-1">
            <li>• Research market rates thoroughly</li>
            <li>• Quantify your achievements</li>
            <li>• Practice your pitch out loud</li>
            <li>• Be confident but collaborative</li>
            <li>• Consider total compensation</li>
          </ul>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-800">Don't</h4>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Give a range (they'll offer the low end)</li>
            <li>• Reveal your current salary first</li>
            <li>• Accept immediately - ask for time</li>
            <li>• Make ultimatums</li>
            <li>• Focus only on your needs</li>
          </ul>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-800">Negotiate Beyond Base</h4>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Signing bonus</li>
            <li>• Stock/equity</li>
            <li>• Remote work flexibility</li>
            <li>• PTO / vacation days</li>
            <li>• Professional development budget</li>
          </ul>
        </div>
      </div>

      {/* Related Tools */}
      <div className="flex flex-wrap gap-4 justify-center pt-4 border-t">
        <Link href="/career-tools/salary-comparison" className="text-teal-600 hover:underline">
          → Salary Comparison Tool
        </Link>
        <Link href="/career-tools/offer-comparison" className="text-teal-600 hover:underline">
          → Offer Comparison Tool
        </Link>
        <Link href="/career-tools/am-i-underpaid" className="text-teal-600 hover:underline">
          → Am I Underpaid?
        </Link>
      </div>
    </div>
  );
}

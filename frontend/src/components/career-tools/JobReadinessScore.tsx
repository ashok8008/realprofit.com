import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, XCircle, ArrowRight, Target } from "lucide-react";
import { Link } from "wouter";
import { saveToStorage, loadFromStorage } from "@/lib/career-tools/storage";

const STORAGE_KEY = 'job_readiness';

interface ReadinessData {
  hasResume: boolean;
  yearsExperience: string;
  targetRole: string;
  coreSkillsCount: string;
  hasPortfolio: boolean;
  linkedinUpdated: boolean;
  coverLetterReady: boolean;
  interviewPrepLevel: string;
  referencesReady: boolean;
}

const defaultData: ReadinessData = {
  hasResume: false,
  yearsExperience: '0',
  targetRole: '',
  coreSkillsCount: '5',
  hasPortfolio: false,
  linkedinUpdated: false,
  coverLetterReady: false,
  interviewPrepLevel: 'none',
  referencesReady: false,
};

interface ScoreItem {
  name: string;
  complete: boolean;
  points: number;
  maxPoints: number;
  suggestion?: string;
  link?: string;
}

function calculateReadiness(data: ReadinessData): { score: number; items: ScoreItem[]; strengths: string[]; weaknesses: string[] } {
  const items: ScoreItem[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Resume (25 points)
  items.push({
    name: 'Resume Ready',
    complete: data.hasResume,
    points: data.hasResume ? 25 : 0,
    maxPoints: 25,
    suggestion: data.hasResume ? undefined : 'Create or update your resume',
    link: '/career-tools/resume-builder'
  });
  if (data.hasResume) strengths.push('Resume prepared');
  else weaknesses.push('No resume ready');

  // Experience (15 points based on having some)
  const years = parseInt(data.yearsExperience) || 0;
  const expPoints = years >= 5 ? 15 : years >= 2 ? 10 : years >= 1 ? 5 : 0;
  items.push({
    name: 'Work Experience',
    complete: years >= 1,
    points: expPoints,
    maxPoints: 15,
    suggestion: years < 1 ? 'Gain experience through internships, freelance, or volunteer work' : undefined
  });
  if (years >= 2) strengths.push(`${years}+ years experience`);
  else if (years < 1) weaknesses.push('Limited work experience');

  // Skills (15 points)
  const skills = parseInt(data.coreSkillsCount) || 0;
  const skillPoints = skills >= 8 ? 15 : skills >= 5 ? 10 : skills >= 3 ? 5 : 0;
  items.push({
    name: 'Core Skills',
    complete: skills >= 5,
    points: skillPoints,
    maxPoints: 15,
    suggestion: skills < 5 ? 'Identify and develop more relevant skills for your target role' : undefined
  });
  if (skills >= 8) strengths.push('Strong skill set');
  else if (skills < 5) weaknesses.push('Need more relevant skills');

  // Portfolio (10 points)
  items.push({
    name: 'Portfolio / Work Samples',
    complete: data.hasPortfolio,
    points: data.hasPortfolio ? 10 : 0,
    maxPoints: 10,
    suggestion: data.hasPortfolio ? undefined : 'Create a portfolio showcasing your best work'
  });
  if (data.hasPortfolio) strengths.push('Portfolio available');

  // LinkedIn (10 points)
  items.push({
    name: 'LinkedIn Profile Updated',
    complete: data.linkedinUpdated,
    points: data.linkedinUpdated ? 10 : 0,
    maxPoints: 10,
    suggestion: data.linkedinUpdated ? undefined : 'Update your LinkedIn profile with current info and keywords'
  });
  if (!data.linkedinUpdated) weaknesses.push('LinkedIn needs updating');

  // Cover Letter (10 points)
  items.push({
    name: 'Cover Letter Template',
    complete: data.coverLetterReady,
    points: data.coverLetterReady ? 10 : 0,
    maxPoints: 10,
    suggestion: data.coverLetterReady ? undefined : 'Prepare a cover letter template',
    link: '/career-tools/cover-letter-generator'
  });

  // Interview Prep (10 points)
  const interviewPoints = data.interviewPrepLevel === 'high' ? 10 : data.interviewPrepLevel === 'medium' ? 6 : data.interviewPrepLevel === 'low' ? 3 : 0;
  items.push({
    name: 'Interview Preparation',
    complete: data.interviewPrepLevel === 'high' || data.interviewPrepLevel === 'medium',
    points: interviewPoints,
    maxPoints: 10,
    suggestion: interviewPoints < 6 ? 'Practice common interview questions and prepare your stories' : undefined
  });
  if (data.interviewPrepLevel === 'high') strengths.push('Interview-ready');
  else if (data.interviewPrepLevel === 'none' || data.interviewPrepLevel === 'low') weaknesses.push('Need interview practice');

  // References (5 points)
  items.push({
    name: 'References Ready',
    complete: data.referencesReady,
    points: data.referencesReady ? 5 : 0,
    maxPoints: 5,
    suggestion: data.referencesReady ? undefined : 'Identify and contact 2-3 professional references'
  });

  const score = items.reduce((sum, item) => sum + item.points, 0);
  
  return { score, items, strengths, weaknesses };
}

export function JobReadinessScore() {
  const [data, setData] = useState<ReadinessData>(() => 
    loadFromStorage(STORAGE_KEY, defaultData)
  );
  const [showResults, setShowResults] = useState(false);

  // Auto-save
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveToStorage(STORAGE_KEY, data);
    }, 500);
    return () => clearTimeout(timeout);
  }, [data]);

  const handleUpdate = (field: keyof ReadinessData, value: string | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
    setShowResults(false);
  };

  const results = showResults ? calculateReadiness(data) : null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Highly Ready';
    if (score >= 60) return 'Moderately Ready';
    if (score >= 40) return 'Partially Ready';
    return 'Not Ready';
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Input Form */}
      <div className="bg-card border rounded-xl p-6 space-y-6">
        <h3 className="font-semibold mb-4">Answer These Questions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Do you have a resume ready?</Label>
              <Switch 
                checked={data.hasResume}
                onCheckedChange={v => handleUpdate('hasResume', v)}
              />
            </div>
            
            <div>
              <Label>Years of Experience</Label>
              <Select value={data.yearsExperience} onValueChange={v => handleUpdate('yearsExperience', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Less than 1 year</SelectItem>
                  <SelectItem value="1">1-2 years</SelectItem>
                  <SelectItem value="3">3-5 years</SelectItem>
                  <SelectItem value="6">6-10 years</SelectItem>
                  <SelectItem value="11">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Core Skills Count</Label>
              <Select value={data.coreSkillsCount} onValueChange={v => handleUpdate('coreSkillsCount', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1-2 skills</SelectItem>
                  <SelectItem value="3">3-4 skills</SelectItem>
                  <SelectItem value="5">5-7 skills</SelectItem>
                  <SelectItem value="8">8+ skills</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Do you have a portfolio?</Label>
              <Switch 
                checked={data.hasPortfolio}
                onCheckedChange={v => handleUpdate('hasPortfolio', v)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Is your LinkedIn updated?</Label>
              <Switch 
                checked={data.linkedinUpdated}
                onCheckedChange={v => handleUpdate('linkedinUpdated', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Cover letter ready?</Label>
              <Switch 
                checked={data.coverLetterReady}
                onCheckedChange={v => handleUpdate('coverLetterReady', v)}
              />
            </div>

            <div>
              <Label>Interview Prep Level</Label>
              <Select value={data.interviewPrepLevel} onValueChange={v => handleUpdate('interviewPrepLevel', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not started</SelectItem>
                  <SelectItem value="low">Basic prep</SelectItem>
                  <SelectItem value="medium">Moderate prep</SelectItem>
                  <SelectItem value="high">Well prepared</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>References ready?</Label>
              <Switch 
                checked={data.referencesReady}
                onCheckedChange={v => handleUpdate('referencesReady', v)}
              />
            </div>
          </div>
        </div>

        <Button onClick={() => setShowResults(true)} className="w-full">
          Calculate My Readiness Score
        </Button>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-card border rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle 
                    cx="64" cy="64" r="56" 
                    stroke={results.score >= 80 ? '#22c55e' : results.score >= 60 ? '#3b82f6' : results.score >= 40 ? '#f59e0b' : '#ef4444'} 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray={`${(results.score / 100) * 352} 352`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${getScoreColor(results.score)}`}>{results.score}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
            </div>
            <div className={`text-xl font-semibold ${getScoreColor(results.score)}`}>
              {getScoreLabel(results.score)}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <h4 className="font-semibold text-emerald-800 mb-2">Strengths</h4>
              {results.strengths.length > 0 ? (
                <ul className="space-y-1">
                  {results.strengths.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-emerald-700">
                      <CheckCircle className="w-4 h-4" /> {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-emerald-700">Keep building!</p>
              )}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="font-semibold text-amber-800 mb-2">Areas to Improve</h4>
              {results.weaknesses.length > 0 ? (
                <ul className="space-y-1">
                  {results.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-amber-700">
                      <XCircle className="w-4 h-4" /> {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-amber-700">Looking good!</p>
              )}
            </div>
          </div>

          {/* Detailed Checklist */}
          <div className="bg-card border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Readiness Checklist</h3>
            <div className="space-y-4">
              {results.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.complete ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.complete ? <CheckCircle className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={item.complete ? 'font-medium' : 'text-muted-foreground'}>{item.name}</span>
                      <span className="text-sm font-semibold">{item.points}/{item.maxPoints}</span>
                    </div>
                    {item.suggestion && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {item.suggestion}
                        {item.link && (
                          <Link href={item.link} className="text-teal-600 hover:underline ml-1">
                            Get started →
                          </Link>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-card border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Recommended Next Actions</h3>
            <ul className="space-y-2">
              {results.items
                .filter(item => !item.complete)
                .slice(0, 3)
                .map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" />
                    <span>{item.suggestion}</span>
                  </li>
                ))}
              {results.items.every(item => item.complete) && (
                <li className="text-emerald-600 font-medium">
                  You're well prepared! Start applying to jobs with confidence.
                </li>
              )}
            </ul>
          </div>

          {/* Tool Recommendations */}
          <div className="bg-muted/30 rounded-xl p-6">
            <h4 className="font-semibold mb-4">Helpful Career Tools</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!data.hasResume && (
                <Link href="/career-tools/resume-builder" className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h5 className="font-medium text-sm mb-1">Resume Builder</h5>
                  <p className="text-xs text-muted-foreground">Create a professional resume</p>
                </Link>
              )}
              {!data.coverLetterReady && (
                <Link href="/career-tools/cover-letter-generator" className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h5 className="font-medium text-sm mb-1">Cover Letter Generator</h5>
                  <p className="text-xs text-muted-foreground">Generate tailored letters</p>
                </Link>
              )}
              <Link href="/career-tools/salary-comparison" className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h5 className="font-medium text-sm mb-1">Salary Comparison</h5>
                <p className="text-xs text-muted-foreground">Know your worth</p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        This score is based on self-reported information and general job search best practices. 
        Actual readiness depends on your specific industry and target roles.
      </p>
    </div>
  );
}

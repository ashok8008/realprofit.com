import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, AlertCircle, ArrowRight, FileText } from "lucide-react";
import { Link } from "wouter";
import { loadFromStorage } from "@/lib/career-tools/storage";
import type { ResumeData } from "@/lib/career-tools/pdf-export";

interface ScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  status: 'good' | 'warning' | 'poor';
  feedback: string;
}

function analyzeResume(data: ResumeData): { total: number; categories: ScoreCategory[] } {
  const categories: ScoreCategory[] = [];
  
  // Contact Info (15 points)
  const contactScore = [
    data.personalDetails.fullName ? 5 : 0,
    data.personalDetails.email ? 5 : 0,
    data.personalDetails.phone ? 3 : 0,
    data.personalDetails.location ? 2 : 0,
  ].reduce((a, b) => a + b, 0);
  categories.push({
    name: 'Contact Information',
    score: contactScore,
    maxScore: 15,
    status: contactScore >= 13 ? 'good' : contactScore >= 8 ? 'warning' : 'poor',
    feedback: contactScore >= 13 ? 'All essential contact info present' : 
              contactScore >= 8 ? 'Consider adding missing contact details' :
              'Missing critical contact information'
  });

  // Summary (15 points)
  const summaryWords = data.summary.trim().split(/\s+/).filter(Boolean).length;
  const summaryScore = summaryWords >= 50 && summaryWords <= 150 ? 15 :
                       summaryWords >= 30 ? 10 :
                       summaryWords > 0 ? 5 : 0;
  categories.push({
    name: 'Professional Summary',
    score: summaryScore,
    maxScore: 15,
    status: summaryScore >= 12 ? 'good' : summaryScore >= 5 ? 'warning' : 'poor',
    feedback: summaryScore >= 12 ? 'Good summary length and presence' :
              summaryScore >= 5 ? `Summary is ${summaryWords < 50 ? 'too short' : 'too long'} (aim for 50-150 words)` :
              'Missing professional summary - highly recommended'
  });

  // Experience (25 points)
  const expCount = data.experience.length;
  const avgBullets = data.experience.length > 0 
    ? data.experience.map(e => e.description.split('\n').filter(l => l.trim().length > 0).length).reduce((a,b) => a+b, 0) / expCount
    : 0;
  const expScore = Math.min(25, (expCount * 5) + (avgBullets >= 3 ? 10 : avgBullets >= 2 ? 5 : 0));
  categories.push({
    name: 'Work Experience',
    score: Math.round(expScore),
    maxScore: 25,
    status: expScore >= 20 ? 'good' : expScore >= 10 ? 'warning' : 'poor',
    feedback: expScore >= 20 ? 'Good experience section with detailed descriptions' :
              expScore >= 10 ? 'Add more bullet points to describe achievements' :
              expCount === 0 ? 'No work experience listed' : 'Experience descriptions need more detail'
  });

  // Education (15 points)
  const eduCount = data.education.length;
  const eduScore = Math.min(15, eduCount * 8);
  categories.push({
    name: 'Education',
    score: eduScore,
    maxScore: 15,
    status: eduScore >= 8 ? 'good' : eduScore > 0 ? 'warning' : 'poor',
    feedback: eduScore >= 8 ? 'Education section complete' :
              eduScore > 0 ? 'Consider adding more education details' :
              'No education listed'
  });

  // Skills (20 points)
  const skillCount = data.skills.length;
  const skillScore = Math.min(20, skillCount * 2);
  categories.push({
    name: 'Skills',
    score: skillScore,
    maxScore: 20,
    status: skillScore >= 14 ? 'good' : skillScore >= 6 ? 'warning' : 'poor',
    feedback: skillScore >= 14 ? `Good skills coverage (${skillCount} skills)` :
              skillScore >= 6 ? 'Add more relevant skills (aim for 8-12)' :
              'Skills section is weak - add relevant skills'
  });

  // ATS Friendliness (10 points)
  const hasSimpleFormat = true; // Our builder ensures this
  const hasNoImages = true;
  const atsScore = (hasSimpleFormat ? 5 : 0) + (hasNoImages ? 5 : 0);
  categories.push({
    name: 'ATS Compatibility',
    score: atsScore,
    maxScore: 10,
    status: 'good',
    feedback: 'Clean format suitable for ATS systems'
  });

  const total = categories.reduce((sum, cat) => sum + cat.score, 0);
  
  return { total, categories };
}

function analyzeText(text: string): { total: number; categories: ScoreCategory[] } {
  const categories: ScoreCategory[] = [];
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  
  // Length (20 points)
  const lengthScore = words >= 300 && words <= 800 ? 20 : words >= 200 ? 15 : words >= 100 ? 10 : 5;
  categories.push({
    name: 'Content Length',
    score: lengthScore,
    maxScore: 20,
    status: lengthScore >= 15 ? 'good' : lengthScore >= 10 ? 'warning' : 'poor',
    feedback: lengthScore >= 15 ? 'Good content length' : 
              words < 200 ? 'Resume seems short - add more detail' :
              'Resume may be too long - consider trimming'
  });

  // Section Coverage (30 points)
  const hasContact = /email|phone|@|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/i.test(text);
  const hasExperience = /experience|work|employment|job/i.test(text);
  const hasEducation = /education|degree|university|college|school/i.test(text);
  const hasSkills = /skills|technologies|proficient|expertise/i.test(text);
  const hasSummary = /summary|objective|profile|about/i.test(text);
  
  const sectionScore = [hasContact, hasExperience, hasEducation, hasSkills, hasSummary]
    .filter(Boolean).length * 6;
  categories.push({
    name: 'Section Coverage',
    score: sectionScore,
    maxScore: 30,
    status: sectionScore >= 24 ? 'good' : sectionScore >= 12 ? 'warning' : 'poor',
    feedback: sectionScore >= 24 ? 'All major sections detected' :
              `Missing sections: ${[
                !hasContact && 'Contact',
                !hasExperience && 'Experience',
                !hasEducation && 'Education',
                !hasSkills && 'Skills',
                !hasSummary && 'Summary'
              ].filter(Boolean).join(', ')}`
  });

  // Bullet Points (20 points)
  const bulletLines = lines.filter(l => /^[\s]*[-•*]/.test(l) || /^\d+\./.test(l)).length;
  const bulletScore = Math.min(20, bulletLines * 2);
  categories.push({
    name: 'Bullet Point Usage',
    score: bulletScore,
    maxScore: 20,
    status: bulletScore >= 14 ? 'good' : bulletScore >= 6 ? 'warning' : 'poor',
    feedback: bulletScore >= 14 ? 'Good use of bullet points' :
              'Add more bullet points for better readability'
  });

  // Action Verbs (15 points)
  const actionVerbs = ['led', 'developed', 'managed', 'created', 'implemented', 'designed', 'built', 'increased', 'improved', 'achieved', 'delivered', 'launched', 'reduced', 'established', 'coordinated'];
  const actionCount = actionVerbs.filter(v => text.toLowerCase().includes(v)).length;
  const actionScore = Math.min(15, actionCount * 3);
  categories.push({
    name: 'Action Verbs',
    score: actionScore,
    maxScore: 15,
    status: actionScore >= 9 ? 'good' : actionScore >= 3 ? 'warning' : 'poor',
    feedback: actionScore >= 9 ? 'Good use of action verbs' :
              'Start bullet points with strong action verbs (Led, Developed, Managed, etc.)'
  });

  // Quantified Results (15 points)
  const hasNumbers = /\d+%|\$\d+|\d+ (percent|million|thousand|year)/i.test(text);
  const quantScore = hasNumbers ? 15 : 5;
  categories.push({
    name: 'Quantified Results',
    score: quantScore,
    maxScore: 15,
    status: quantScore >= 10 ? 'good' : 'warning',
    feedback: quantScore >= 10 ? 'Good use of quantified achievements' :
              'Add numbers and metrics (%, $, time saved, etc.)'
  });

  const total = categories.reduce((sum, cat) => sum + cat.score, 0);
  return { total, categories };
}

export function ResumeScore() {
  const [mode, setMode] = useState<'builder' | 'paste'>('builder');
  const [pastedText, setPastedText] = useState('');
  const [showResults, setShowResults] = useState(false);

  const builderData = loadFromStorage<ResumeData>('resume_builder', {
    personalDetails: { fullName: '', email: '', phone: '', location: '', linkedin: '', portfolio: '' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
  });

  const hasBuilderData = builderData.personalDetails.fullName || builderData.experience.length > 0;

  const getResults = () => {
    if (mode === 'builder') {
      return analyzeResume(builderData);
    } else {
      return analyzeText(pastedText);
    }
  };

  const results = showResults ? getResults() : null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Tabs value={mode} onValueChange={(v) => { setMode(v as 'builder' | 'paste'); setShowResults(false); }}>
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="builder">Score Resume Builder Data</TabsTrigger>
          <TabsTrigger value="paste">Paste Resume Text</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-6">
          {hasBuilderData ? (
            <div className="bg-muted/30 rounded-xl p-6 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-teal-600" />
              <h3 className="font-semibold mb-2">Resume Builder Data Found</h3>
              <p className="text-muted-foreground mb-4">
                We found data from your Resume Builder. Click below to analyze it.
              </p>
              <Button onClick={() => setShowResults(true)}>
                Analyze My Resume
              </Button>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-xl p-6 text-center">
              <p className="text-muted-foreground mb-4">
                No resume data found. Create a resume first or paste your existing resume.
              </p>
              <Link href="/career-tools/resume-builder">
                <Button>Go to Resume Builder</Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="paste" className="mt-6 space-y-4">
          <div>
            <Label>Paste Your Resume Text</Label>
            <Textarea 
              placeholder="Copy and paste the text content of your resume here..."
              rows={12}
              value={pastedText}
              onChange={e => { setPastedText(e.target.value); setShowResults(false); }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Plain text works best. Formatting will not be analyzed.
            </p>
          </div>
          <Button 
            onClick={() => setShowResults(true)} 
            disabled={pastedText.trim().length < 50}
          >
            Analyze Resume
          </Button>
        </TabsContent>
      </Tabs>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-card border rounded-2xl p-8 text-center">
            <div className="text-sm text-muted-foreground mb-2">Your Resume Score</div>
            <div className={`text-6xl font-bold ${getScoreColor(results.total)}`}>
              {results.total}
            </div>
            <div className="text-lg text-muted-foreground">out of 100</div>
            <div className={`mt-2 text-lg font-semibold ${getScoreColor(results.total)}`}>
              {getScoreLabel(results.total)}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-card border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Score Breakdown</h3>
            <div className="space-y-4">
              {results.categories.map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {cat.status === 'good' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> :
                       cat.status === 'warning' ? <AlertCircle className="w-4 h-4 text-amber-500" /> :
                       <XCircle className="w-4 h-4 text-red-500" />}
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{cat.score}/{cat.maxScore}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        cat.status === 'good' ? 'bg-emerald-500' :
                        cat.status === 'warning' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">{cat.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Checklist */}
          <div className="bg-card border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Improvement Checklist</h3>
            <ul className="space-y-2">
              {results.categories
                .filter(c => c.status !== 'good')
                .map((cat, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-teal-600 flex-shrink-0" />
                    <span>{cat.feedback}</span>
                  </li>
                ))}
              {results.categories.every(c => c.status === 'good') && (
                <li className="text-emerald-600 font-medium">Great job! Your resume covers all the basics.</li>
              )}
            </ul>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/career-tools/resume-builder">
              <Button variant="outline">Edit in Resume Builder</Button>
            </Link>
            <Link href="/career-tools/job-readiness-score">
              <Button>Check Job Readiness</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        This score is based on structural analysis and general best practices. 
        Content quality and relevance to specific jobs require human review.
      </p>
    </div>
  );
}

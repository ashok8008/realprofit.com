"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Copy, RotateCcw, RefreshCw, Printer } from "lucide-react";
import { saveToStorage, loadFromStorage, clearStorage } from "@/lib/career-tools/storage";
import { generateCoverLetterPDF } from "@/lib/career-tools/pdf-export";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = 'cover_letter';

interface CoverLetterData {
  applicantName: string;
  jobTitle: string;
  companyName: string;
  yearsExperience: string;
  keySkills: string;
  tone: 'formal' | 'confident' | 'simple';
  length: 'concise' | 'standard';
  jobDescription: string;
  whyCompany: string;
}

const defaultData: CoverLetterData = {
  applicantName: '',
  jobTitle: '',
  companyName: '',
  yearsExperience: '',
  keySkills: '',
  tone: 'confident',
  length: 'standard',
  jobDescription: '',
  whyCompany: '',
};

function generateLetter(data: CoverLetterData): string {
  const { applicantName, jobTitle, companyName, yearsExperience, keySkills, tone, length, whyCompany } = data;
  
  const name = applicantName || '[Your Name]';
  const job = jobTitle || '[Job Title]';
  const company = companyName || '[Company Name]';
  const years = yearsExperience || 'several';
  const skills = keySkills ? keySkills.split(',').map(s => s.trim()).filter(Boolean) : ['relevant skills'];
  
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  // Greeting variations
  const greetings = {
    formal: `Dear Hiring Manager,`,
    confident: `Hello,`,
    simple: `Hi there,`,
  };
  
  // Intro variations
  const intros = {
    formal: `I am writing to express my strong interest in the ${job} position at ${company}. With ${years} years of experience in this field, I am confident that my background aligns well with your requirements.`,
    confident: `I'm excited to apply for the ${job} role at ${company}. With ${years} years of hands-on experience, I bring exactly the skills and drive your team needs.`,
    simple: `I'd like to apply for the ${job} position at ${company}. I have ${years} years of experience that I believe make me a great fit.`,
  };
  
  // Skills paragraph
  const skillsList = skills.slice(0, 3).join(', ');
  const skillsParas = {
    formal: `Throughout my career, I have developed strong expertise in ${skillsList}. These competencies have enabled me to deliver consistent results and contribute meaningfully to organizational objectives.`,
    confident: `My core strengths include ${skillsList}. I've used these skills to drive real results — and I'm eager to bring that same impact to ${company}.`,
    simple: `I'm skilled in ${skillsList}. I've used these abilities successfully in past roles and would bring the same dedication here.`,
  };
  
  // Company fit paragraph
  const fitParas = {
    formal: whyCompany 
      ? `I am particularly drawn to ${company} because ${whyCompany}. I believe my values and professional goals are well-aligned with your organization's mission.`
      : `I have long admired ${company}'s reputation and would welcome the opportunity to contribute to your continued success.`,
    confident: whyCompany 
      ? `What excites me most about ${company}? ${whyCompany}. That's the kind of environment where I do my best work.`
      : `${company}'s reputation for excellence is exactly why I want to be part of your team.`,
    simple: whyCompany 
      ? `I'm interested in ${company} because ${whyCompany}.`
      : `I've followed ${company}'s work and would enjoy being part of it.`,
  };
  
  // Closing
  const closings = {
    formal: `Thank you for considering my application. I would welcome the opportunity to discuss how my experience and skills would benefit ${company}. I look forward to hearing from you.

Sincerely,
${name}`,
    confident: `I'd love to chat about how I can contribute to ${company}. Let's connect — I'm confident I can make an immediate impact.

Best regards,
${name}`,
    simple: `Thanks for your time. I'd be happy to discuss further.

Best,
${name}`,
  };
  
  // Assemble
  let letter = `${today}\n\n${greetings[tone]}\n\n${intros[tone]}\n\n${skillsParas[tone]}\n\n${fitParas[tone]}\n\n${closings[tone]}`;
  
  // Shorten for concise
  if (length === 'concise') {
    letter = `${today}\n\n${greetings[tone]}\n\n${intros[tone]}\n\nMy key strengths include ${skillsList}. ${fitParas[tone].split('.')[0]}.\n\n${closings[tone].split('\n\n')[0]}\n\n${closings[tone].split('\n\n')[1]}`;
  }
  
  return letter;
}

export function CoverLetterGenerator() {
  const { toast } = useToast();
  const [data, setData] = useState<CoverLetterData>(() => 
    loadFromStorage(STORAGE_KEY, defaultData)
  );
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Auto-save
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveToStorage(STORAGE_KEY, data);
    }, 500);
    return () => clearTimeout(timeout);
  }, [data]);

  // Generate on data change
  useEffect(() => {
    if (!isEditing) {
      setGeneratedLetter(generateLetter(data));
    }
  }, [data, isEditing]);

  const handleUpdate = (field: keyof CoverLetterData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    setIsEditing(false);
  };

  const handleRegenerate = () => {
    setIsEditing(false);
    setGeneratedLetter(generateLetter(data));
    toast({ title: "Letter regenerated" });
  };

  const handleReset = () => {
    if (confirm('Clear all inputs and start over?')) {
      setData(defaultData);
      setGeneratedLetter('');
      clearStorage(STORAGE_KEY);
      toast({ title: "Form cleared" });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    toast({ title: "Copied to clipboard" });
  };

  const handleDownloadPDF = () => {
    const pdf = generateCoverLetterPDF(
      generatedLetter,
      data.applicantName,
      new Date().toLocaleDateString()
    );
    pdf.save(`cover_letter_${data.companyName || 'draft'}.pdf`.replace(/\s+/g, '_'));
    toast({ title: "PDF Downloaded" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Details</h2>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Your Name *</Label>
            <Input 
              placeholder="John Smith"
              value={data.applicantName}
              onChange={e => handleUpdate('applicantName', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Job Title *</Label>
              <Input 
                placeholder="Software Engineer"
                value={data.jobTitle}
                onChange={e => handleUpdate('jobTitle', e.target.value)}
              />
            </div>
            <div>
              <Label>Company Name *</Label>
              <Input 
                placeholder="Acme Corp"
                value={data.companyName}
                onChange={e => handleUpdate('companyName', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Years of Experience</Label>
            <Input 
              placeholder="5"
              value={data.yearsExperience}
              onChange={e => handleUpdate('yearsExperience', e.target.value)}
            />
          </div>

          <div>
            <Label>Key Skills (comma-separated)</Label>
            <Input 
              placeholder="JavaScript, React, Team Leadership"
              value={data.keySkills}
              onChange={e => handleUpdate('keySkills', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">List 3-5 skills relevant to the role</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tone / Style</Label>
              <Select value={data.tone} onValueChange={v => handleUpdate('tone', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="confident">Confident</SelectItem>
                  <SelectItem value="simple">Simple</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Length</Label>
              <Select value={data.length} onValueChange={v => handleUpdate('length', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Why This Company? (Optional)</Label>
            <Textarea 
              placeholder="I'm drawn to your mission of..."
              rows={2}
              value={data.whyCompany}
              onChange={e => handleUpdate('whyCompany', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">What excites you about this company?</p>
          </div>

          <div>
            <Label>Job Description (Optional)</Label>
            <Textarea 
              placeholder="Paste the job description here for reference..."
              rows={3}
              value={data.jobDescription}
              onChange={e => handleUpdate('jobDescription', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Reference only — helps you tailor your letter</p>
          </div>
        </div>
      </div>

      {/* Generated Letter */}
      <div className="lg:sticky lg:top-24 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Generated Cover Letter</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRegenerate}>
              <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
            </Button>
          </div>
        </div>

        <div className="border rounded-xl bg-white shadow-lg overflow-hidden">
          <div className="p-6">
            <Textarea 
              className="min-h-[400px] text-sm leading-relaxed border-0 focus-visible:ring-0 resize-none bg-transparent"
              value={generatedLetter}
              onChange={e => {
                setIsEditing(true);
                setGeneratedLetter(e.target.value);
              }}
              placeholder="Fill in the form to generate your cover letter..."
            />
          </div>
          
          <div className="border-t bg-muted/30 p-4 flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-1" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-1" /> Print
            </Button>
            <Button size="sm" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 mr-1" /> Download PDF
            </Button>
          </div>
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>Tip:</strong> After generating, click inside the letter to make direct edits. 
            Personalize it further before sending!
          </p>
        </div>
      </div>
    </div>
  );
}

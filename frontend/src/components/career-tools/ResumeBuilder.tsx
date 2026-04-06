import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Plus, Trash2, GripVertical, RotateCcw, Printer, Eye, Sparkles, Loader2, Check, X, Lightbulb, AlertTriangle, Info, Wand2 } from "lucide-react";
import { saveToStorage, loadFromStorage, clearStorage } from "@/lib/career-tools/storage";
import { generateResumePDF, ResumeData } from "@/lib/career-tools/pdf-export";
import { useToast } from "@/hooks/use-toast";
import { analyzeBulletPoints, analyzeSummary, smartRewriteBullets, smartRewriteSummary, canUseAi, recordAiUsage, getAiRemaining, AI_FREE_TOTAL } from "@/lib/career-tools/smartSuggestions";
import { calculateResumeScore, type ScoreSuggestion } from "@/lib/career-tools/resumeScore";

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

const STORAGE_KEY = 'resume_builder';

const defaultResumeData: ResumeData = {
  personalDetails: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
};

const templates = [
  { id: 'clean', name: 'Clean', desc: 'Simple ATS-friendly', premium: false },
  { id: 'professional', name: 'Professional', desc: 'Traditional business', premium: false },
  { id: 'minimal', name: 'Minimal', desc: 'Maximum whitespace', premium: false },
  { id: 'executive', name: 'Executive', desc: 'Bold header with accent', premium: true },
  { id: 'modern', name: 'Modern', desc: 'Two-column layout', premium: true },
];

export function ResumeBuilder() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [template, setTemplate] = useState('clean');
  const [data, setData] = useState<ResumeData>(() => 
    loadFromStorage(STORAGE_KEY, defaultResumeData)
  );
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');

  // Auto-save
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveToStorage(STORAGE_KEY, data);
    }, 500);
    return () => clearTimeout(timeout);
  }, [data]);

  const updatePersonal = (field: keyof ResumeData['personalDetails'], value: string) => {
    setData(prev => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, [field]: value }
    }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
    };
    setData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !data.skills.includes(skillInput.trim())) {
      setData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addCertification = () => {
    if (certInput.trim() && !data.certifications.includes(certInput.trim())) {
      setData(prev => ({
        ...prev,
        certifications: [...prev.certifications, certInput.trim()]
      }));
      setCertInput('');
    }
  };

  const removeCertification = (cert: string) => {
    setData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }));
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all resume data?')) {
      setData(defaultResumeData);
      clearStorage(STORAGE_KEY);
      toast({ title: "Resume cleared", description: "All data has been reset." });
    }
  };

  const handleDownloadPDF = () => {
    const pdf = generateResumePDF(data, template);
    const filename = `${data.personalDetails.fullName || 'resume'}_resume.pdf`.replace(/\s+/g, '_');
    pdf.save(filename);
    toast({ title: "PDF Downloaded", description: "Your resume has been saved." });
  };

  const handlePrint = () => {
    window.print();
  };

  // AI Enhancement State
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{ id: string; original: string; improved: string; suggestions?: string[] } | null>(null);
  const [aiRemaining, setAiRemaining] = useState(getAiRemaining());

  // Smart suggestions (Grammarly-style, always free)
  const bulletSuggestions = useMemo(() => {
    const map: Record<string, ReturnType<typeof analyzeBulletPoints>> = {};
    data.experience.forEach(exp => {
      if (exp.description.trim()) {
        map[exp.id] = analyzeBulletPoints(exp.description);
      }
    });
    return map;
  }, [data.experience]);

  const summarySuggestions = useMemo(() => {
    return data.summary.trim() ? analyzeSummary(data.summary, data.skills) : [];
  }, [data.summary, data.skills]);

  // Smart Improve (free, rule-based rewrite)
  const smartImproveBullet = (expId: string, text: string) => {
    if (!text.trim()) return;
    const improved = smartRewriteBullets(text);
    if (improved !== text) {
      updateExperience(expId, 'description', improved);
      toast({ title: "Smart Improve applied!", description: "Text improved using writing rules." });
    } else {
      toast({ title: "Already looks good!", description: "No changes needed — try adding more detail." });
    }
  };

  const smartImproveSummaryAction = () => {
    if (!data.summary.trim()) return;
    const improved = smartRewriteSummary(data.summary, data.skills);
    if (improved !== data.summary) {
      setData(prev => ({ ...prev, summary: improved }));
      toast({ title: "Smart Improve applied!", description: "Summary improved using writing rules." });
    } else {
      toast({ title: "Already looks good!", description: "No changes needed — try adding more detail." });
    }
  };

  // AI Improve (limited, calls API)
  const aiImproveBullet = async (expId: string, bulletText: string, jobTitle: string) => {
    if (!bulletText.trim()) {
      toast({ title: "Empty field", description: "Write bullet points first." });
      return;
    }
    if (!canUseAi()) {
      toast({ title: "AI limit reached", description: "Use Smart Improve instead — it's free and unlimited!" });
      return;
    }
    setAiLoading(`bullet-${expId}`);
    setAiSuggestion(null);
    try {
      const res = await fetch('/api/career-tools/improve-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet_point: bulletText, job_title: jobTitle }),
      });
      if (!res.ok) throw new Error('AI service unavailable');
      const result = await res.json();
      recordAiUsage();
      setAiRemaining(getAiRemaining());
      setAiSuggestion({ id: `bullet-${expId}`, original: bulletText, improved: result.improved, suggestions: result.suggestions });
    } catch {
      toast({ title: "AI Error", description: "Could not reach AI. Try Smart Improve instead.", variant: "destructive" });
    } finally {
      setAiLoading(null);
    }
  };

  const aiImproveSummaryAction = async () => {
    if (!data.summary.trim()) {
      toast({ title: "Empty summary", description: "Write a summary first." });
      return;
    }
    if (!canUseAi()) {
      toast({ title: "AI limit reached", description: "Use Smart Improve instead — it's free and unlimited!" });
      return;
    }
    setAiLoading('summary');
    setAiSuggestion(null);
    try {
      const res = await fetch('/api/career-tools/improve-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_summary: data.summary,
          job_title: data.experience[0]?.title || '',
          skills: data.skills.slice(0, 5),
        }),
      });
      if (!res.ok) throw new Error('AI service unavailable');
      const result = await res.json();
      recordAiUsage();
      setAiRemaining(getAiRemaining());
      setAiSuggestion({ id: 'summary', original: data.summary, improved: result.improved });
    } catch {
      toast({ title: "AI Error", description: "Could not reach AI. Try Smart Improve instead.", variant: "destructive" });
    } finally {
      setAiLoading(null);
    }
  };

  const acceptAiSuggestion = () => {
    if (!aiSuggestion) return;
    if (aiSuggestion.id === 'summary') {
      setData(prev => ({ ...prev, summary: aiSuggestion.improved }));
    } else {
      const expId = aiSuggestion.id.replace('bullet-', '');
      updateExperience(expId, 'description', aiSuggestion.improved);
    }
    toast({ title: "Applied!", description: "AI suggestion has been applied." });
    setAiSuggestion(null);
  };

  const dismissAiSuggestion = () => setAiSuggestion(null);

  const summaryWordCount = data.summary.trim().split(/\s+/).filter(Boolean).length;

  // Resume Score (real-time, deterministic, no AI)
  const score = useMemo(() => calculateResumeScore(data), [data]);

  const handleFixAction = (action: ScoreSuggestion['fixAction']) => {
    if (!action) return;
    switch (action) {
      case 'add-summary': setActiveTab('personal'); break;
      case 'add-experience': setActiveTab('experience'); addExperience(); break;
      case 'add-skills': setActiveTab('skills'); break;
      case 'add-education': setActiveTab('education'); addEducation(); break;
      case 'improve-bullets': setActiveTab('experience'); break;
      case 'add-metrics': setActiveTab('experience'); break;
      case 'trim-bullets': setActiveTab('experience'); break;
    }
  };

  const categoryLabels: Record<string, string> = {
    completeness: 'Completeness',
    quality: 'Content Quality',
    impact: 'Impact',
    structure: 'Structure',
    ats: 'ATS Safety',
  };

  const categoryColors: Record<string, string> = {
    completeness: '#0d9488',
    quality: '#3b82f6',
    impact: '#8b5cf6',
    structure: '#d97706',
    ats: '#059669',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Build Your Resume</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
          </div>
        </div>

        {/* Template Selection */}
        <div className="bg-muted/30 rounded-lg p-4">
          <Label className="text-sm font-semibold mb-3 block">Choose Template</Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`p-2.5 rounded-lg border text-left transition-all relative ${
                  template === t.id 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {t.premium && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">PRO</span>
                )}
                <div className="text-xs font-semibold">{t.name}</div>
                <div className="text-[10px] text-muted-foreground">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="personal" className="text-xs">Personal</TabsTrigger>
            <TabsTrigger value="experience" className="text-xs">Experience</TabsTrigger>
            <TabsTrigger value="education" className="text-xs">Education</TabsTrigger>
            <TabsTrigger value="skills" className="text-xs">Skills</TabsTrigger>
            <TabsTrigger value="extras" className="text-xs">Extras</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Full Name *</Label>
                <Input 
                  placeholder="John Smith"
                  value={data.personalDetails.fullName}
                  onChange={e => updatePersonal('fullName', e.target.value)}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input 
                  type="email"
                  placeholder="john@email.com"
                  value={data.personalDetails.email}
                  onChange={e => updatePersonal('email', e.target.value)}
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input 
                  placeholder="(555) 123-4567"
                  value={data.personalDetails.phone}
                  onChange={e => updatePersonal('phone', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Location</Label>
                <Input 
                  placeholder="San Francisco, CA"
                  value={data.personalDetails.location}
                  onChange={e => updatePersonal('location', e.target.value)}
                />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input 
                  placeholder="linkedin.com/in/johnsmith"
                  value={data.personalDetails.linkedin}
                  onChange={e => updatePersonal('linkedin', e.target.value)}
                />
              </div>
              <div>
                <Label>Portfolio URL</Label>
                <Input 
                  placeholder="johnsmith.com"
                  value={data.personalDetails.portfolio}
                  onChange={e => updatePersonal('portfolio', e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <Label>Professional Summary</Label>
                <span className={`text-xs ${summaryWordCount > 50 && summaryWordCount <= 100 ? 'text-emerald-600' : summaryWordCount > 100 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {summaryWordCount} words (aim for 50-100)
                </span>
              </div>
              <Textarea 
                placeholder="Experienced professional with..."
                rows={4}
                value={data.summary}
                onChange={e => setData(prev => ({ ...prev, summary: e.target.value }))}
              />
              <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                <p className="text-xs text-muted-foreground">A strong summary highlights your key value in 2-3 sentences.</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={smartImproveSummaryAction}
                    disabled={!data.summary.trim()}
                    className="text-xs gap-1.5 border-teal-300 text-teal-700 hover:bg-teal-50"
                    data-testid="smart-improve-summary-btn"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Smart Improve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={aiImproveSummaryAction}
                    disabled={aiLoading === 'summary' || !data.summary.trim() || aiRemaining <= 0}
                    className="text-xs gap-1.5 border-violet-300 text-violet-700 hover:bg-violet-50"
                    data-testid="ai-improve-summary-btn"
                  >
                    {aiLoading === 'summary' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    AI Improve
                  </Button>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${aiRemaining > 0 ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-400'}`} data-testid="ai-remaining-summary">
                    {aiRemaining}/{AI_FREE_TOTAL}
                  </span>
                </div>
              </div>
              {aiRemaining <= 0 && (
                <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500" data-testid="ai-limit-message-summary">
                  AI uses reached — <strong>Smart Improve</strong> is free and unlimited!
                </div>
              )}
              {aiSuggestion?.id === 'summary' && (
                <div className="mt-3 bg-violet-50 border border-violet-200 rounded-lg p-4" data-testid="ai-summary-suggestion">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-violet-700 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Suggestion</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-emerald-600 hover:bg-emerald-50" onClick={acceptAiSuggestion} data-testid="ai-accept-summary"><Check className="w-3.5 h-3.5 mr-1" /> Accept</Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-600 hover:bg-red-50" onClick={dismissAiSuggestion} data-testid="ai-dismiss-summary"><X className="w-3.5 h-3.5 mr-1" /> Dismiss</Button>
                    </div>
                  </div>
                  <p className="text-sm text-violet-900 whitespace-pre-line">{aiSuggestion.improved}</p>
                </div>
              )}
              {/* Smart Suggestions (always free) */}
              {summarySuggestions.length > 0 && data.summary.trim() && (
                <div className="mt-3 space-y-1.5" data-testid="smart-summary-suggestions">
                  {summarySuggestions.map((s, i) => (
                    <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${
                      s.type === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-800' :
                      s.type === 'improvement' ? 'bg-blue-50 border border-blue-200 text-blue-800' :
                      'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    }`}>
                      {s.type === 'warning' ? <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> :
                       s.type === 'improvement' ? <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> :
                       <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
                      <div>
                        <span className="font-semibold">{s.message}</span>
                        {s.fix && <span className="block text-[11px] mt-0.5 opacity-80">{s.fix}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="experience" className="space-y-4 mt-4">
            {data.experience.map((exp, idx) => (
              <div key={exp.id} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">Experience {idx + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Job Title *</Label>
                    <Input 
                      placeholder="Software Engineer"
                      value={exp.title}
                      onChange={e => updateExperience(exp.id, 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Company *</Label>
                    <Input 
                      placeholder="Acme Corp"
                      value={exp.company}
                      onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Location</Label>
                    <Input 
                      placeholder="New York, NY"
                      value={exp.location}
                      onChange={e => updateExperience(exp.id, 'location', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={exp.current}
                        onCheckedChange={v => updateExperience(exp.id, 'current', v)}
                      />
                      <Label className="text-xs">Current Role</Label>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input 
                      placeholder="Jan 2020"
                      value={exp.startDate}
                      onChange={e => updateExperience(exp.id, 'startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Input 
                      placeholder={exp.current ? "Present" : "Dec 2023"}
                      value={exp.current ? "Present" : exp.endDate}
                      onChange={e => updateExperience(exp.id, 'endDate', e.target.value)}
                      disabled={exp.current}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Description / Achievements</Label>
                  <Textarea 
                    placeholder="• Led a team of 5 engineers...&#10;• Increased conversion by 25%..."
                    rows={4}
                    value={exp.description}
                    onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                  />
                  <div className="flex items-center justify-between mt-1.5 flex-wrap gap-2">
                    <p className="text-xs text-muted-foreground">Use bullet points starting with action verbs</p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => smartImproveBullet(exp.id, exp.description)}
                        disabled={!exp.description.trim()}
                        className="text-xs gap-1.5 border-teal-300 text-teal-700 hover:bg-teal-50"
                        data-testid={`smart-improve-bullet-${idx}`}
                      >
                        <Wand2 className="w-3.5 h-3.5" /> Smart Improve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => aiImproveBullet(exp.id, exp.description, exp.title)}
                        disabled={aiLoading === `bullet-${exp.id}` || !exp.description.trim() || aiRemaining <= 0}
                        className="text-xs gap-1.5 border-violet-300 text-violet-700 hover:bg-violet-50"
                        data-testid={`ai-improve-bullet-${idx}`}
                      >
                        {aiLoading === `bullet-${exp.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        AI Improve
                      </Button>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${aiRemaining > 0 ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-400'}`} data-testid={`ai-remaining-bullet-${idx}`}>
                        {aiRemaining}/{AI_FREE_TOTAL}
                      </span>
                    </div>
                  </div>
                  {aiRemaining <= 0 && idx === 0 && (
                    <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500" data-testid="ai-limit-message-bullet">
                      AI uses reached — <strong>Smart Improve</strong> is free and unlimited!
                    </div>
                  )}
                  {aiSuggestion?.id === `bullet-${exp.id}` && (
                    <div className="mt-3 bg-violet-50 border border-violet-200 rounded-lg p-4" data-testid={`ai-bullet-suggestion-${idx}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-violet-700 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Suggestion</span>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-emerald-600 hover:bg-emerald-50" onClick={acceptAiSuggestion} data-testid={`ai-accept-bullet-${idx}`}><Check className="w-3.5 h-3.5 mr-1" /> Accept</Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-red-600 hover:bg-red-50" onClick={dismissAiSuggestion} data-testid={`ai-dismiss-bullet-${idx}`}><X className="w-3.5 h-3.5 mr-1" /> Dismiss</Button>
                        </div>
                      </div>
                      <p className="text-sm text-violet-900 whitespace-pre-line">{aiSuggestion.improved}</p>
                      {aiSuggestion.suggestions && aiSuggestion.suggestions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-violet-200">
                          <span className="text-xs font-semibold text-violet-600">Tips:</span>
                          <ul className="mt-1 space-y-0.5">
                            {aiSuggestion.suggestions.map((tip, i) => (
                              <li key={i} className="text-xs text-violet-700">• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Smart Suggestions (always free, Grammarly-style) */}
                  {bulletSuggestions[exp.id] && bulletSuggestions[exp.id].length > 0 && (
                    <div className="mt-2 space-y-1.5" data-testid={`smart-bullet-suggestions-${idx}`}>
                      {bulletSuggestions[exp.id].map((s, i) => (
                        <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${
                          s.type === 'warning' ? 'bg-amber-50 border border-amber-200 text-amber-800' :
                          s.type === 'improvement' ? 'bg-blue-50 border border-blue-200 text-blue-800' :
                          'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        }`}>
                          {s.type === 'warning' ? <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> :
                           s.type === 'improvement' ? <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> :
                           <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />}
                          <div>
                            <span className="font-semibold">{s.message}</span>
                            {s.fix && <span className="block text-[11px] mt-0.5 opacity-80">{s.fix}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addExperience} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Add Experience
            </Button>
          </TabsContent>

          <TabsContent value="education" className="space-y-4 mt-4">
            {data.education.map((edu, idx) => (
              <div key={edu.id} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">Education {idx + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs">School / University *</Label>
                    <Input 
                      placeholder="University of California"
                      value={edu.school}
                      onChange={e => updateEducation(edu.id, 'school', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Degree</Label>
                    <Input 
                      placeholder="Bachelor of Science"
                      value={edu.degree}
                      onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Field of Study</Label>
                    <Input 
                      placeholder="Computer Science"
                      value={edu.field}
                      onChange={e => updateEducation(edu.id, 'field', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Start Year</Label>
                    <Input 
                      placeholder="2016"
                      value={edu.startDate}
                      onChange={e => updateEducation(edu.id, 'startDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Year</Label>
                    <Input 
                      placeholder="2020"
                      value={edu.endDate}
                      onChange={e => updateEducation(edu.id, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addEducation} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Add Education
            </Button>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4 mt-4">
            <div>
              <Label>Add Skills</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="JavaScript, React, Project Management..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button onClick={addSkill}>Add</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Press Enter or click Add for each skill</p>
            </div>
            
            {data.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.skills.map(skill => (
                  <span 
                    key={skill} 
                    className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-teal-600">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="bg-muted/30 rounded-lg p-4 mt-4">
              <p className="text-sm font-semibold mb-2">Skill Suggestions</p>
              <p className="text-xs text-muted-foreground">
                Include both technical skills (programming languages, tools) and soft skills (leadership, communication).
                Tailor skills to match the job description.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="extras" className="space-y-4 mt-4">
            <div>
              <Label>Certifications & Awards</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="AWS Certified, PMP, Google Analytics..."
                  value={certInput}
                  onChange={e => setCertInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                />
                <Button onClick={addCertification}>Add</Button>
              </div>
            </div>
            
            {data.certifications.length > 0 && (
              <div className="space-y-2">
                {data.certifications.map(cert => (
                  <div 
                    key={cert} 
                    className="bg-muted/30 px-4 py-2 rounded-lg flex items-center justify-between"
                  >
                    <span className="text-sm">{cert}</span>
                    <button onClick={() => removeCertification(cert)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Column: Score + Preview */}
      <div className="space-y-6">
        {/* ── Resume Score Panel ── */}
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden" data-testid="resume-score-panel">
          <div className="p-5 border-b">
            <div className="flex items-center gap-5">
              {/* Circular Score */}
              <div className="relative w-20 h-20 flex-shrink-0" data-testid="resume-score-circle">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={score.color} strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${score.total * 2.64} 264`}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: score.color }} data-testid="resume-score-number">{score.total}</span>
                  <span className="text-[9px] text-gray-400 font-medium">/100</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-sm" style={{ color: score.color }}>{score.label}</span>
                </div>
                {/* Category bars */}
                <div className="space-y-1.5">
                  {(Object.entries(score.breakdown) as [string, { score: number; max: number }][]).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 w-16 truncate">{categoryLabels[key]}</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(val.score / val.max) * 100}%`, backgroundColor: categoryColors[key] }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-600 w-8 text-right">{val.score}/{val.max}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {score.suggestions.length > 0 && (
            <div className="p-4 max-h-52 overflow-y-auto" data-testid="resume-score-suggestions">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Improve your score ({score.suggestions.length} suggestions)
              </div>
              <div className="space-y-1.5">
                {score.suggestions.map((s, i) => (
                  <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                    s.severity === 'critical' ? 'bg-red-50 border border-red-200 text-red-800' :
                    s.severity === 'high' ? 'bg-amber-50 border border-amber-200 text-amber-800' :
                    s.severity === 'medium' ? 'bg-blue-50 border border-blue-200 text-blue-800' :
                    'bg-gray-50 border border-gray-200 text-gray-700'
                  }`} data-testid={`score-suggestion-${i}`}>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold">{s.message}</span>
                      {s.fix && <span className="block text-[11px] mt-0.5 opacity-75">{s.fix}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[9px] font-bold opacity-50">+{s.points}pts</span>
                      {s.fixAction && (
                        <button
                          onClick={() => handleFixAction(s.fixAction)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                            s.severity === 'critical' ? 'bg-red-200 hover:bg-red-300 text-red-900' :
                            s.severity === 'high' ? 'bg-amber-200 hover:bg-amber-300 text-amber-900' :
                            'bg-blue-200 hover:bg-blue-300 text-blue-900'
                          }`}
                          data-testid={`fix-action-${i}`}
                        >
                          Fix
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {score.suggestions.length === 0 && (
            <div className="p-4 text-center text-emerald-600 text-xs font-semibold" data-testid="score-all-clear">
              Your resume is looking strong!
            </div>
          )}
        </div>

        {/* ── Live Preview ── */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4" /> Live Preview
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" /> Print
              </Button>
              <Button size="sm" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-1" /> Download PDF
              </Button>
            </div>
          </div>

        <div className="border rounded-xl bg-white shadow-lg overflow-hidden" style={{ minHeight: '600px' }}>
          <div className="p-8 text-sm" id="resume-preview">
            {/* Name */}
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
              {data.personalDetails.fullName || 'Your Name'}
            </h1>
            
            {/* Contact */}
            <div className="text-center text-gray-600 text-xs mb-1">
              {[data.personalDetails.email, data.personalDetails.phone, data.personalDetails.location]
                .filter(Boolean)
                .join(' | ') || 'email@example.com | (555) 123-4567'}
            </div>
            {(data.personalDetails.linkedin || data.personalDetails.portfolio) && (
              <div className="text-center text-gray-500 text-xs mb-4">
                {[data.personalDetails.linkedin, data.personalDetails.portfolio].filter(Boolean).join(' | ')}
              </div>
            )}

            {/* Summary */}
            {data.summary && (
              <div className="mb-4">
                <div className="border-b border-gray-300 mb-2 pb-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Professional Summary</h2>
                </div>
                <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-line">{data.summary}</p>
              </div>
            )}

            {/* Experience */}
            {data.experience.length > 0 && (
              <div className="mb-4">
                <div className="border-b border-gray-300 mb-2 pb-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Experience</h2>
                </div>
                {data.experience.map(exp => (
                  <div key={exp.id} className="mb-3">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-gray-900">{exp.title || 'Job Title'}</span>
                      <span className="text-gray-500 text-xs">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-gray-600 text-xs">
                      {exp.company}{exp.location && `, ${exp.location}`}
                    </div>
                    {exp.description && (
                      <p className="text-gray-700 text-xs mt-1 whitespace-pre-line leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {data.education.length > 0 && (
              <div className="mb-4">
                <div className="border-b border-gray-300 mb-2 pb-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Education</h2>
                </div>
                {data.education.map(edu => (
                  <div key={edu.id} className="mb-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-gray-900">
                        {edu.degree}{edu.field && ` in ${edu.field}`}
                      </span>
                      <span className="text-gray-500 text-xs">{edu.startDate} - {edu.endDate}</span>
                    </div>
                    <div className="text-gray-600 text-xs">{edu.school}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {data.skills.length > 0 && (
              <div className="mb-4">
                <div className="border-b border-gray-300 mb-2 pb-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Skills</h2>
                </div>
                <p className="text-gray-700 text-xs">{data.skills.join(' • ')}</p>
              </div>
            )}

            {/* Certifications */}
            {data.certifications.length > 0 && (
              <div>
                <div className="border-b border-gray-300 mb-2 pb-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Certifications</h2>
                </div>
                <ul className="text-gray-700 text-xs">
                  {data.certifications.map(cert => (
                    <li key={cert}>• {cert}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empty state */}
            {!data.summary && data.experience.length === 0 && data.education.length === 0 && data.skills.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                <p>Start filling in your details to see the preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

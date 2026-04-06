import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Loader2, Mail, RefreshCw, CheckCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { canUseAi, recordAiUsage } from "@/lib/career-tools/smartSuggestions";
import { generateStaticEmail } from "@/lib/career-tools/staticEmailTemplates";

const templateTypes = [
  { type: "thank_you", name: "Thank You Email", description: "Send after an interview to express gratitude" },
  { type: "follow_up", name: "Follow Up Email", description: "Check on your application status" },
  { type: "negotiation", name: "Salary Negotiation Email", description: "Negotiate salary or offer terms professionally" },
  { type: "accept", name: "Accept Offer Email", description: "Formally accept a job offer" },
  { type: "decline", name: "Decline Offer Email", description: "Politely decline an offer while preserving the relationship" },
];

interface FormData {
  templateType: string;
  companyName: string;
  jobTitle: string;
  interviewerName: string;
  interviewDate: string;
  specificPoints: string;
}

const defaultForm: FormData = {
  templateType: "thank_you",
  companyName: "",
  jobTitle: "",
  interviewerName: "",
  interviewDate: "",
  specificPoints: "",
};

interface GeneratedEmail {
  subject: string;
  body: string;
  templateType: string;
}

export function EmailTemplates() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<GeneratedEmail | null>(null);
  const [copied, setCopied] = useState(false);
  const [aiUsed, setAiUsed] = useState(!canUseAi('emailTemplate'));
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  const update = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const generateWithAi = async () => {
    setLoading(true);
    setEmail(null);
    setIsAiGenerated(true);
    try {
      const res = await fetch("/api/career-tools/email-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_type: form.templateType,
          company_name: form.companyName,
          job_title: form.jobTitle,
          interviewer_name: form.interviewerName || undefined,
          interview_date: form.interviewDate || undefined,
          specific_points: form.specificPoints || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const result: GeneratedEmail = await res.json();
      recordAiUsage('emailTemplate');
      setAiUsed(true);
      setEmail(result);
    } catch {
      // Fallback to static template on AI failure
      const fallback = generateStaticEmail(form.templateType, {
        companyName: form.companyName,
        jobTitle: form.jobTitle,
        interviewerName: form.interviewerName,
        interviewDate: form.interviewDate,
        specificPoints: form.specificPoints,
      });
      setEmail({ subject: fallback.subject, body: fallback.body, templateType: form.templateType });
      setIsAiGenerated(false);
      toast({ title: "Using smart template", description: "AI unavailable — generated a polished template instead." });
    } finally {
      setLoading(false);
    }
  };

  const generateStatic = () => {
    const result = generateStaticEmail(form.templateType, {
      companyName: form.companyName,
      jobTitle: form.jobTitle,
      interviewerName: form.interviewerName,
      interviewDate: form.interviewDate,
      specificPoints: form.specificPoints,
    });
    setEmail({ subject: result.subject, body: result.body, templateType: form.templateType });
    setIsAiGenerated(false);
  };

  const handleGenerate = () => {
    if (!form.companyName.trim() || !form.jobTitle.trim()) {
      toast({ title: "Missing info", description: "Please enter company name and job title.", variant: "destructive" });
      return;
    }
    if (!aiUsed && canUseAi('emailTemplate')) {
      generateWithAi();
    } else {
      generateStatic();
    }
  };

  const handleCopy = () => {
    if (!email) return;
    const text = `Subject: ${email.subject}\n\n${email.body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied!", description: "Email copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (!form.companyName.trim() || !form.jobTitle.trim()) return;
    generateStatic(); // Regenerate always uses static to save AI credits
  };

  const selectedTemplate = templateTypes.find(t => t.type === form.templateType);

  return (
    <div className="space-y-8">
      {/* Template Type Selection */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Choose Email Type</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {templateTypes.map(t => (
            <button
              key={t.type}
              onClick={() => { update("templateType", t.type); setEmail(null); }}
              className={`p-3 rounded-lg border text-left transition-all ${
                form.templateType === t.type
                  ? "border-teal-500 bg-teal-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              data-testid={`email-type-${t.type}`}
            >
              <div className="text-xs font-semibold">{t.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        <div>
          <Label>Company Name *</Label>
          <Input
            placeholder="Google"
            value={form.companyName}
            onChange={e => update("companyName", e.target.value)}
            data-testid="email-company-input"
          />
        </div>
        <div>
          <Label>Job Title / Position *</Label>
          <Input
            placeholder="Senior Software Engineer"
            value={form.jobTitle}
            onChange={e => update("jobTitle", e.target.value)}
            data-testid="email-job-title-input"
          />
        </div>
        <div>
          <Label>Interviewer Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Input
            placeholder="Sarah Johnson"
            value={form.interviewerName}
            onChange={e => update("interviewerName", e.target.value)}
            data-testid="email-interviewer-input"
          />
        </div>
        <div>
          <Label>Interview Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Input
            placeholder="January 15, 2026"
            value={form.interviewDate}
            onChange={e => update("interviewDate", e.target.value)}
            data-testid="email-date-input"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Specific Points to Mention <span className="text-muted-foreground text-xs">(optional)</span></Label>
          <Textarea
            placeholder="Discussed the new product launch, interested in the team culture..."
            rows={3}
            value={form.specificPoints}
            onChange={e => update("specificPoints", e.target.value)}
            data-testid="email-specific-points-input"
          />
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleGenerate}
          disabled={loading || !form.companyName.trim() || !form.jobTitle.trim()}
          className="bg-teal-600 hover:bg-teal-700 text-white px-8"
          data-testid="email-generate-btn"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
          ) : !aiUsed ? (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate with AI (1 free)</>
          ) : (
            <><Mail className="w-4 h-4 mr-2" /> Generate {selectedTemplate?.name}</>
          )}
        </Button>
        {aiUsed && (
          <span className="text-xs text-gray-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Free AI try used — using smart templates</span>
        )}
      </div>

      {/* Generated Email */}
      {email && (
        <div className="max-w-3xl space-y-4" data-testid="email-result">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">Generated Email</h3>
              {isAiGenerated ? (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700 px-2 py-0.5 rounded">AI Generated</span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-700 px-2 py-0.5 rounded">Smart Template</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={loading} data-testid="email-regenerate-btn">
                <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy} data-testid="email-copy-btn">
                {copied ? <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-600" /> : <Copy className="w-4 h-4 mr-1.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b px-6 py-3">
              <div className="text-xs text-muted-foreground mb-0.5">Subject</div>
              <div className="font-semibold text-sm" data-testid="email-subject">{email.subject}</div>
            </div>
            <div className="px-6 py-5">
              <div className="text-sm whitespace-pre-line leading-relaxed text-gray-800" data-testid="email-body">
                {email.body}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Tip:</strong> Personalize this template before sending. Replace any placeholder names, 
              add specific details from your interview, and adjust the tone to match your voice.
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!email && !loading && (
        <div className="text-center py-8 bg-muted/20 rounded-xl border border-dashed max-w-3xl">
          <Mail className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground text-sm">
            Select an email type, fill in the details, and click Generate to create a professional email template.
          </p>
        </div>
      )}
    </div>
  );
}

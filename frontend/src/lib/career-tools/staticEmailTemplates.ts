// Pre-written email templates — zero API cost

interface TemplateVars {
  companyName: string;
  jobTitle: string;
  interviewerName?: string;
  interviewDate?: string;
  specificPoints?: string;
}

interface GeneratedTemplate {
  subject: string;
  body: string;
}

function nameOrFallback(name?: string): string {
  return name?.trim() || '[Hiring Manager]';
}

function dateOrFallback(date?: string): string {
  return date?.trim() || '[Interview Date]';
}

function pointsOrFallback(points?: string): string {
  return points?.trim() || 'the role and team';
}

const templates: Record<string, (v: TemplateVars) => GeneratedTemplate> = {
  thank_you: (v) => ({
    subject: `Thank You — ${v.jobTitle} Interview at ${v.companyName}`,
    body: `Dear ${nameOrFallback(v.interviewerName)},

Thank you for taking the time to meet with me on ${dateOrFallback(v.interviewDate)} to discuss the ${v.jobTitle} position at ${v.companyName}.

I truly enjoyed learning more about ${pointsOrFallback(v.specificPoints)}. Our conversation reinforced my enthusiasm for the role and my confidence that my skills and experience would be a strong fit for your team.

I was particularly excited about the opportunity to contribute to ${v.companyName}'s goals, and I'm eager to bring my expertise to the team.

Please don't hesitate to reach out if you need any additional information. I look forward to hearing about the next steps.

Best regards,
[Your Name]
[Your Phone]
[Your Email]`
  }),

  follow_up: (v) => ({
    subject: `Following Up — ${v.jobTitle} Application at ${v.companyName}`,
    body: `Dear ${nameOrFallback(v.interviewerName)},

I hope this message finds you well. I'm writing to follow up on my application for the ${v.jobTitle} position at ${v.companyName}.

I interviewed on ${dateOrFallback(v.interviewDate)} and remain very enthusiastic about the opportunity. I believe my experience aligns well with what you're looking for, particularly regarding ${pointsOrFallback(v.specificPoints)}.

I understand you're likely evaluating many candidates, and I appreciate the time and care that goes into making the right hire. I'd welcome any updates you're able to share about the timeline or next steps.

Thank you again for considering my candidacy. I'm looking forward to hearing from you.

Best regards,
[Your Name]
[Your Phone]
[Your Email]`
  }),

  negotiation: (v) => ({
    subject: `Re: ${v.jobTitle} Offer — ${v.companyName}`,
    body: `Dear ${nameOrFallback(v.interviewerName)},

Thank you so much for extending the offer for the ${v.jobTitle} position at ${v.companyName}. I'm thrilled about the opportunity and excited to potentially join the team.

After carefully reviewing the offer details, I'd like to discuss the compensation package. Based on my research of market rates for this role and my ${pointsOrFallback(v.specificPoints)}, I was hoping we could explore a base salary in the range of [Your Target Range].

I want to emphasize that I'm genuinely enthusiastic about ${v.companyName} and the chance to contribute to the team. I'm confident we can find an arrangement that works well for both of us.

I'm happy to discuss this further at your convenience. Thank you for your consideration.

Best regards,
[Your Name]
[Your Phone]
[Your Email]`
  }),

  accept: (v) => ({
    subject: `Offer Acceptance — ${v.jobTitle} at ${v.companyName}`,
    body: `Dear ${nameOrFallback(v.interviewerName)},

I'm delighted to formally accept the offer for the ${v.jobTitle} position at ${v.companyName}. Thank you for this wonderful opportunity.

I'm excited to join the team and contribute to ${pointsOrFallback(v.specificPoints)}. I'm committed to making a meaningful impact from day one.

As discussed, I understand my start date will be [Start Date] and the agreed-upon compensation is [Compensation Details]. Please let me know if there are any documents I need to complete or any onboarding steps I should prepare for before my first day.

Thank you again for your confidence in me. I look forward to a successful journey together at ${v.companyName}.

Best regards,
[Your Name]
[Your Phone]
[Your Email]`
  }),

  decline: (v) => ({
    subject: `Re: ${v.jobTitle} Offer — ${v.companyName}`,
    body: `Dear ${nameOrFallback(v.interviewerName)},

Thank you very much for offering me the ${v.jobTitle} position at ${v.companyName}. I genuinely appreciate the time you and the team invested in the interview process.

After careful consideration, I've decided to pursue a different opportunity that more closely aligns with my current career goals. This was not an easy decision — I was very impressed by ${pointsOrFallback(v.specificPoints)} and the talented team at ${v.companyName}.

I hope our paths cross again in the future, and I wish you and the team continued success.

Thank you again for the opportunity and your understanding.

Best regards,
[Your Name]
[Your Phone]
[Your Email]`
  }),
};

export function generateStaticEmail(
  templateType: string,
  vars: TemplateVars
): GeneratedTemplate {
  const generator = templates[templateType];
  if (!generator) {
    return templates['thank_you'](vars);
  }
  return generator(vars);
}

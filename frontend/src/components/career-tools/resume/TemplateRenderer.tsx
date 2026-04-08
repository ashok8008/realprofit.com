import React from "react";
import type { ResumeData } from "@/lib/career-tools/pdf-export";

interface TemplateProps {
  data: ResumeData;
  scale?: "full" | "thumb";
}

/* ════════════════════════════════════════════════════════════
   CLEAN — Classic single-column, centered header, thin rules
   ════════════════════════════════════════════════════════════ */
function CleanTemplate({ data, scale = "full" }: TemplateProps) {
  const s = scale === "thumb";
  const name = data.personalDetails.fullName || "Your Name";
  const contact = [data.personalDetails.email, data.personalDetails.phone, data.personalDetails.location].filter(Boolean);
  const links = [data.personalDetails.linkedin, data.personalDetails.portfolio].filter(Boolean);

  return (
    <div className={`font-[Georgia,serif] text-zinc-800 ${s ? "p-2" : "p-6"}`} data-testid="template-clean">
      {/* Header */}
      <h1 className={`text-center font-bold tracking-wide ${s ? "text-[7px] mb-0.5" : "text-lg mb-0.5"}`}>{name}</h1>
      {contact.length > 0 && (
        <p className={`text-center text-zinc-500 ${s ? "text-[4px] mb-0.5" : "text-[10px] mb-0.5"}`}>{contact.join("  |  ")}</p>
      )}
      {links.length > 0 && (
        <p className={`text-center text-zinc-400 ${s ? "text-[4px] mb-1" : "text-[10px] mb-3"}`}>{links.join("  |  ")}</p>
      )}

      {/* Summary */}
      {data.summary && (
        <div className={s ? "mb-1" : "mb-3"}>
          <div className={`border-b border-zinc-300 ${s ? "mb-0.5 pb-0" : "mb-1.5 pb-0.5"}`}>
            <h2 className={`font-bold uppercase tracking-widest text-zinc-600 ${s ? "text-[4px]" : "text-[10px]"}`}>Professional Summary</h2>
          </div>
          <p className={`text-zinc-600 leading-relaxed whitespace-pre-line ${s ? "text-[4px]" : "text-[10px]"}`}>{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className={s ? "mb-1" : "mb-3"}>
          <div className={`border-b border-zinc-300 ${s ? "mb-0.5 pb-0" : "mb-1.5 pb-0.5"}`}>
            <h2 className={`font-bold uppercase tracking-widest text-zinc-600 ${s ? "text-[4px]" : "text-[10px]"}`}>Experience</h2>
          </div>
          {data.experience.map((exp, i) => (
            <div key={exp.id || i} className={s ? "mb-1" : "mb-2.5"}>
              <div className="flex justify-between items-baseline">
                <span className={`font-semibold text-zinc-900 ${s ? "text-[5px]" : "text-[11px]"}`}>{exp.title}</span>
                <span className={`text-zinc-400 ${s ? "text-[3px]" : "text-[9px]"}`}>{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
              </div>
              <div className={`text-zinc-500 ${s ? "text-[3px]" : "text-[9px]"}`}>{exp.company}{exp.location && `, ${exp.location}`}</div>
              {exp.description && <p className={`text-zinc-600 mt-0.5 whitespace-pre-line leading-relaxed ${s ? "text-[3px]" : "text-[10px]"}`}>{s ? exp.description.substring(0, 80) : exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className={s ? "mb-1" : "mb-3"}>
          <div className={`border-b border-zinc-300 ${s ? "mb-0.5 pb-0" : "mb-1.5 pb-0.5"}`}>
            <h2 className={`font-bold uppercase tracking-widest text-zinc-600 ${s ? "text-[4px]" : "text-[10px]"}`}>Education</h2>
          </div>
          {data.education.map((edu, i) => (
            <div key={edu.id || i} className={s ? "mb-0.5" : "mb-1.5"}>
              <div className="flex justify-between items-baseline">
                <span className={`font-semibold text-zinc-900 ${s ? "text-[5px]" : "text-[11px]"}`}>{edu.degree}{edu.field && ` in ${edu.field}`}</span>
                <span className={`text-zinc-400 ${s ? "text-[3px]" : "text-[9px]"}`}>{edu.startDate} - {edu.endDate}</span>
              </div>
              <div className={`text-zinc-500 ${s ? "text-[3px]" : "text-[9px]"}`}>{edu.school}</div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className={s ? "mb-1" : "mb-3"}>
          <div className={`border-b border-zinc-300 ${s ? "mb-0.5 pb-0" : "mb-1.5 pb-0.5"}`}>
            <h2 className={`font-bold uppercase tracking-widest text-zinc-600 ${s ? "text-[4px]" : "text-[10px]"}`}>Skills</h2>
          </div>
          <p className={`text-zinc-600 ${s ? "text-[4px]" : "text-[10px]"}`}>{data.skills.join(" \u2022 ")}</p>
        </div>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <div>
          <div className={`border-b border-zinc-300 ${s ? "mb-0.5 pb-0" : "mb-1.5 pb-0.5"}`}>
            <h2 className={`font-bold uppercase tracking-widest text-zinc-600 ${s ? "text-[4px]" : "text-[10px]"}`}>Certifications</h2>
          </div>
          {data.certifications.map(c => (
            <p key={c} className={`text-zinc-600 ${s ? "text-[4px]" : "text-[10px]"}`}>&bull; {c}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PROFESSIONAL — Double-rule header, italic subheadings
   ════════════════════════════════════════════════════════════ */
function ProfessionalTemplate({ data, scale = "full" }: TemplateProps) {
  const s = scale === "thumb";
  const name = data.personalDetails.fullName || "Your Name";
  const contactLine1 = [data.personalDetails.email, data.personalDetails.phone].filter(Boolean).join(" | ");
  const contactLine2 = [data.personalDetails.location, data.personalDetails.linkedin].filter(Boolean).join(" | ");

  return (
    <div className={`font-[Cambria,Georgia,serif] text-zinc-800 ${s ? "p-2" : "p-6"}`} data-testid="template-professional">
      {/* Double-rule header */}
      <div className={`border-t-2 border-b-2 border-zinc-800 ${s ? "py-0.5 mb-1" : "py-2 mb-4"}`}>
        <h1 className={`text-center font-bold tracking-wide text-zinc-900 ${s ? "text-[8px]" : "text-xl"}`}>{name}</h1>
        {contactLine1 && <p className={`text-center text-zinc-500 ${s ? "text-[3px]" : "text-[10px]"}`}>{contactLine1}</p>}
        {contactLine2 && <p className={`text-center text-zinc-500 ${s ? "text-[3px]" : "text-[10px]"}`}>{contactLine2}</p>}
      </div>

      {/* Summary */}
      {data.summary && (
        <div className={s ? "mb-1" : "mb-4"}>
          <h2 className={`font-bold text-zinc-800 border-b border-zinc-300 ${s ? "text-[5px] pb-0 mb-0.5" : "text-xs pb-1 mb-2"}`}>PROFESSIONAL SUMMARY</h2>
          <p className={`text-zinc-600 leading-relaxed whitespace-pre-line ${s ? "text-[3px]" : "text-[10px]"}`}>{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className={s ? "mb-1" : "mb-4"}>
          <h2 className={`font-bold text-zinc-800 border-b border-zinc-300 ${s ? "text-[5px] pb-0 mb-0.5" : "text-xs pb-1 mb-2"}`}>PROFESSIONAL EXPERIENCE</h2>
          {data.experience.map((exp, i) => (
            <div key={exp.id || i} className={s ? "mb-1" : "mb-3"}>
              <div className="flex justify-between items-baseline">
                <span className={`font-bold text-zinc-900 ${s ? "text-[5px]" : "text-[11px]"}`}>{exp.title}</span>
                <span className={`text-zinc-500 ${s ? "text-[3px]" : "text-[9px]"}`}>{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
              </div>
              <div className={`italic text-zinc-600 ${s ? "text-[3px]" : "text-[10px]"}`}>{exp.company}{exp.location && `, ${exp.location}`}</div>
              {exp.description && <p className={`text-zinc-600 mt-0.5 whitespace-pre-line ${s ? "text-[3px]" : "text-[10px]"}`}>{s ? exp.description.substring(0, 80) : exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className={s ? "mb-1" : "mb-4"}>
          <h2 className={`font-bold text-zinc-800 border-b border-zinc-300 ${s ? "text-[5px] pb-0 mb-0.5" : "text-xs pb-1 mb-2"}`}>EDUCATION</h2>
          {data.education.map((edu, i) => (
            <div key={edu.id || i} className={s ? "mb-0.5" : "mb-2"}>
              <div className="flex justify-between items-baseline">
                <span className={`font-bold text-zinc-900 ${s ? "text-[5px]" : "text-[11px]"}`}>{edu.degree}{edu.field && ` in ${edu.field}`}</span>
                <span className={`text-zinc-500 ${s ? "text-[3px]" : "text-[9px]"}`}>{edu.startDate} - {edu.endDate}</span>
              </div>
              <div className={`italic text-zinc-600 ${s ? "text-[3px]" : "text-[10px]"}`}>{edu.school}</div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className={s ? "mb-1" : "mb-3"}>
          <h2 className={`font-bold text-zinc-800 border-b border-zinc-300 ${s ? "text-[5px] pb-0 mb-0.5" : "text-xs pb-1 mb-2"}`}>SKILLS & COMPETENCIES</h2>
          <p className={`text-zinc-600 ${s ? "text-[3px]" : "text-[10px]"}`}>{data.skills.join("  \u2022  ")}</p>
        </div>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <div>
          <h2 className={`font-bold text-zinc-800 border-b border-zinc-300 ${s ? "text-[5px] pb-0 mb-0.5" : "text-xs pb-1 mb-2"}`}>CERTIFICATIONS</h2>
          {data.certifications.map(c => (
            <p key={c} className={`text-zinc-600 ${s ? "text-[3px]" : "text-[10px]"}`}>&bull; {c}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MINIMAL — Left-aligned, generous whitespace, ultra-light headers
   ════════════════════════════════════════════════════════════ */
function MinimalTemplate({ data, scale = "full" }: TemplateProps) {
  const s = scale === "thumb";
  const name = data.personalDetails.fullName || "Your Name";
  const contact = [data.personalDetails.email, data.personalDetails.phone, data.personalDetails.location].filter(Boolean);

  return (
    <div className={`font-[system-ui,sans-serif] text-zinc-700 ${s ? "p-2" : "p-7"}`} data-testid="template-minimal">
      {/* Header — left-aligned, big name */}
      <h1 className={`font-light tracking-tight text-zinc-900 ${s ? "text-[9px] mb-0.5" : "text-2xl mb-1"}`}>{name}</h1>
      {contact.length > 0 && (
        <p className={`text-zinc-400 ${s ? "text-[3px] mb-2" : "text-[9px] mb-5"}`}>{contact.join("   ")}</p>
      )}

      {/* Summary */}
      {data.summary && (
        <div className={s ? "mb-2" : "mb-6"}>
          <p className={`text-zinc-600 leading-relaxed whitespace-pre-line ${s ? "text-[4px]" : "text-[10px]"}`}>{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className={s ? "mb-2" : "mb-6"}>
          <h2 className={`font-normal uppercase tracking-[0.25em] text-zinc-400 ${s ? "text-[3px] mb-1" : "text-[8px] mb-3"}`}>Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={exp.id || i} className={s ? "mb-1.5" : "mb-4"}>
              <p className={`font-medium text-zinc-900 ${s ? "text-[5px]" : "text-[11px]"}`}>{exp.title}</p>
              <p className={`text-zinc-400 ${s ? "text-[3px]" : "text-[9px]"}`}>{exp.company}  &middot;  {exp.startDate} &ndash; {exp.current ? "Present" : exp.endDate}</p>
              {exp.description && <p className={`text-zinc-500 whitespace-pre-line leading-relaxed ${s ? "text-[3px] mt-0.5" : "text-[10px] mt-1"}`}>{s ? exp.description.substring(0, 80) : exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className={s ? "mb-2" : "mb-6"}>
          <h2 className={`font-normal uppercase tracking-[0.25em] text-zinc-400 ${s ? "text-[3px] mb-1" : "text-[8px] mb-3"}`}>Education</h2>
          {data.education.map((edu, i) => (
            <div key={edu.id || i} className={s ? "mb-1" : "mb-2"}>
              <p className={`font-medium text-zinc-900 ${s ? "text-[5px]" : "text-[11px]"}`}>{edu.degree}{edu.field && `, ${edu.field}`}</p>
              <p className={`text-zinc-400 ${s ? "text-[3px]" : "text-[9px]"}`}>{edu.school}  &middot;  {edu.startDate} &ndash; {edu.endDate}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className={s ? "mb-1" : "mb-4"}>
          <h2 className={`font-normal uppercase tracking-[0.25em] text-zinc-400 ${s ? "text-[3px] mb-1" : "text-[8px] mb-3"}`}>Skills</h2>
          <p className={`text-zinc-500 ${s ? "text-[4px]" : "text-[10px]"}`}>{data.skills.join("   \u00B7   ")}</p>
        </div>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <div>
          <h2 className={`font-normal uppercase tracking-[0.25em] text-zinc-400 ${s ? "text-[3px] mb-1" : "text-[8px] mb-3"}`}>Certifications</h2>
          {data.certifications.map(c => (
            <p key={c} className={`text-zinc-500 ${s ? "text-[3px]" : "text-[10px]"}`}>{c}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   EXECUTIVE — Dark header banner, bold authority
   ════════════════════════════════════════════════════════════ */
function ExecutiveTemplate({ data, scale = "full" }: TemplateProps) {
  const s = scale === "thumb";
  const name = data.personalDetails.fullName || "Your Name";
  const contact = [data.personalDetails.email, data.personalDetails.phone, data.personalDetails.location].filter(Boolean);
  const links = [data.personalDetails.linkedin, data.personalDetails.portfolio].filter(Boolean);

  return (
    <div className="font-[Georgia,serif]" data-testid="template-executive">
      {/* Dark header banner */}
      <div className={`bg-slate-800 text-white ${s ? "px-2 py-1.5" : "px-6 py-5"}`}>
        <h1 className={`font-bold tracking-wide ${s ? "text-[8px] mb-0.5" : "text-xl mb-1"}`}>{name}</h1>
        {contact.length > 0 && <p className={`text-slate-300 ${s ? "text-[3px]" : "text-[9px]"}`}>{contact.join("  |  ")}</p>}
        {links.length > 0 && <p className={`text-slate-400 ${s ? "text-[3px]" : "text-[9px]"}`}>{links.join("  |  ")}</p>}
      </div>

      {/* Gold accent line */}
      <div className={`bg-amber-500 ${s ? "h-[1px]" : "h-[3px]"}`} />

      <div className={s ? "p-2" : "p-6"}>
        {/* Summary */}
        {data.summary && (
          <div className={s ? "mb-1.5" : "mb-4"}>
            <h2 className={`font-bold text-slate-800 uppercase tracking-wider ${s ? "text-[4px] mb-0.5" : "text-[10px] mb-1.5"}`}>Executive Summary</h2>
            <p className={`text-zinc-600 leading-relaxed whitespace-pre-line ${s ? "text-[3px]" : "text-[10px]"}`}>{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div className={s ? "mb-1.5" : "mb-4"}>
            <h2 className={`font-bold text-slate-800 uppercase tracking-wider ${s ? "text-[4px] mb-0.5" : "text-[10px] mb-1.5"}`}>Professional Experience</h2>
            {data.experience.map((exp, i) => (
              <div key={exp.id || i} className={`${s ? "mb-1 pl-1.5" : "mb-3 pl-3"} border-l-2 border-amber-500`}>
                <div className="flex justify-between items-baseline">
                  <span className={`font-bold text-zinc-900 ${s ? "text-[5px]" : "text-[11px]"}`}>{exp.title}</span>
                  <span className={`text-zinc-400 ${s ? "text-[3px]" : "text-[9px]"}`}>{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <div className={`font-semibold text-slate-700 ${s ? "text-[3px]" : "text-[10px]"}`}>{exp.company}{exp.location && `, ${exp.location}`}</div>
                {exp.description && <p className={`text-zinc-600 mt-0.5 whitespace-pre-line ${s ? "text-[3px]" : "text-[10px]"}`}>{s ? exp.description.substring(0, 80) : exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className={s ? "mb-1.5" : "mb-4"}>
            <h2 className={`font-bold text-slate-800 uppercase tracking-wider ${s ? "text-[4px] mb-0.5" : "text-[10px] mb-1.5"}`}>Education</h2>
            {data.education.map((edu, i) => (
              <div key={edu.id || i} className={s ? "mb-0.5" : "mb-2"}>
                <div className="flex justify-between items-baseline">
                  <span className={`font-bold text-zinc-900 ${s ? "text-[5px]" : "text-[11px]"}`}>{edu.degree}{edu.field && ` in ${edu.field}`}</span>
                  <span className={`text-zinc-400 ${s ? "text-[3px]" : "text-[9px]"}`}>{edu.startDate} - {edu.endDate}</span>
                </div>
                <div className={`text-zinc-600 ${s ? "text-[3px]" : "text-[10px]"}`}>{edu.school}</div>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className={s ? "mb-1" : "mb-3"}>
            <h2 className={`font-bold text-slate-800 uppercase tracking-wider ${s ? "text-[4px] mb-0.5" : "text-[10px] mb-1.5"}`}>Core Competencies</h2>
            <div className={`flex flex-wrap ${s ? "gap-0.5" : "gap-1.5"}`}>
              {data.skills.map(sk => (
                <span key={sk} className={`bg-slate-100 text-slate-700 font-medium ${s ? "text-[3px] px-1 py-0 rounded" : "text-[9px] px-2 py-0.5 rounded"}`}>{sk}</span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div>
            <h2 className={`font-bold text-slate-800 uppercase tracking-wider ${s ? "text-[4px] mb-0.5" : "text-[10px] mb-1.5"}`}>Certifications</h2>
            {data.certifications.map(c => (
              <p key={c} className={`text-zinc-600 ${s ? "text-[3px]" : "text-[10px]"}`}>&bull; {c}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MODERN — Two-column: dark sidebar (contact + skills), main content
   ════════════════════════════════════════════════════════════ */
function ModernTemplate({ data, scale = "full" }: TemplateProps) {
  const s = scale === "thumb";
  const name = data.personalDetails.fullName || "Your Name";

  return (
    <div className="flex min-h-0 font-[system-ui,sans-serif]" data-testid="template-modern">
      {/* Sidebar */}
      <div className={`bg-slate-800 text-white flex-shrink-0 ${s ? "w-[30%] p-1.5" : "w-[32%] p-5"}`}>
        <h1 className={`font-bold leading-tight ${s ? "text-[6px] mb-1" : "text-base mb-3"}`}>{name}</h1>

        {/* Contact */}
        <div className={s ? "mb-1.5" : "mb-4"}>
          <h3 className={`font-bold uppercase tracking-wider text-teal-400 ${s ? "text-[3px] mb-0.5" : "text-[8px] mb-1"}`}>Contact</h3>
          {data.personalDetails.email && <p className={`text-slate-300 ${s ? "text-[3px]" : "text-[8px] mb-0.5"}`}>{data.personalDetails.email}</p>}
          {data.personalDetails.phone && <p className={`text-slate-300 ${s ? "text-[3px]" : "text-[8px] mb-0.5"}`}>{data.personalDetails.phone}</p>}
          {data.personalDetails.location && <p className={`text-slate-300 ${s ? "text-[3px]" : "text-[8px] mb-0.5"}`}>{data.personalDetails.location}</p>}
          {data.personalDetails.linkedin && <p className={`text-slate-400 ${s ? "text-[3px]" : "text-[8px] mb-0.5"}`}>{data.personalDetails.linkedin}</p>}
        </div>

        {/* Skills in sidebar */}
        {data.skills.length > 0 && (
          <div className={s ? "mb-1.5" : "mb-4"}>
            <h3 className={`font-bold uppercase tracking-wider text-teal-400 ${s ? "text-[3px] mb-0.5" : "text-[8px] mb-1"}`}>Skills</h3>
            {data.skills.map(sk => (
              <div key={sk} className={`flex items-center ${s ? "mb-0 gap-0.5" : "mb-1 gap-1.5"}`}>
                <div className={`rounded-full bg-teal-500 ${s ? "w-[2px] h-[2px]" : "w-1 h-1"}`} />
                <span className={`text-slate-300 ${s ? "text-[3px]" : "text-[8px]"}`}>{sk}</span>
              </div>
            ))}
          </div>
        )}

        {/* Certifications in sidebar */}
        {data.certifications.length > 0 && (
          <div>
            <h3 className={`font-bold uppercase tracking-wider text-teal-400 ${s ? "text-[3px] mb-0.5" : "text-[8px] mb-1"}`}>Certifications</h3>
            {data.certifications.map(c => (
              <p key={c} className={`text-slate-300 ${s ? "text-[3px]" : "text-[8px] mb-0.5"}`}>{c}</p>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className={`flex-1 ${s ? "p-1.5" : "p-5"}`}>
        {/* Summary */}
        {data.summary && (
          <div className={s ? "mb-1.5" : "mb-4"}>
            <h2 className={`font-bold text-slate-800 uppercase tracking-wider ${s ? "text-[4px] mb-0.5" : "text-[9px] mb-1"}`}>Profile</h2>
            <p className={`text-zinc-600 leading-relaxed whitespace-pre-line ${s ? "text-[3px]" : "text-[10px]"}`}>{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div className={s ? "mb-1.5" : "mb-4"}>
            <h2 className={`font-bold text-slate-800 uppercase tracking-wider ${s ? "text-[4px] mb-0.5" : "text-[9px] mb-1"}`}>Experience</h2>
            {data.experience.map((exp, i) => (
              <div key={exp.id || i} className={s ? "mb-1" : "mb-3"}>
                <p className={`font-bold text-zinc-900 ${s ? "text-[5px]" : "text-[11px]"}`}>{exp.title}</p>
                <p className={`text-teal-700 ${s ? "text-[3px]" : "text-[9px]"}`}>{exp.company} | {exp.startDate} - {exp.current ? "Present" : exp.endDate}</p>
                {exp.description && <p className={`text-zinc-600 whitespace-pre-line ${s ? "text-[3px] mt-0" : "text-[10px] mt-1"}`}>{s ? exp.description.substring(0, 80) : exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <h2 className={`font-bold text-slate-800 uppercase tracking-wider ${s ? "text-[4px] mb-0.5" : "text-[9px] mb-1"}`}>Education</h2>
            {data.education.map((edu, i) => (
              <div key={edu.id || i} className={s ? "mb-0.5" : "mb-2"}>
                <p className={`font-bold text-zinc-900 ${s ? "text-[5px]" : "text-[11px]"}`}>{edu.degree}{edu.field && ` in ${edu.field}`}</p>
                <p className={`text-zinc-500 ${s ? "text-[3px]" : "text-[9px]"}`}>{edu.school} | {edu.startDate} - {edu.endDate}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN EXPORT — renders the correct template by ID
   ════════════════════════════════════════════════════════════ */
export function TemplateRenderer({ data, templateId, scale = "full" }: { data: ResumeData; templateId: string; scale?: "full" | "thumb" }) {
  switch (templateId) {
    case "professional": return <ProfessionalTemplate data={data} scale={scale} />;
    case "minimal": return <MinimalTemplate data={data} scale={scale} />;
    case "executive": return <ExecutiveTemplate data={data} scale={scale} />;
    case "modern": return <ModernTemplate data={data} scale={scale} />;
    default: return <CleanTemplate data={data} scale={scale} />;
  }
}

/* Empty state */
export function EmptyPreview({ scale = "full" }: { scale?: "full" | "thumb" }) {
  const s = scale === "thumb";
  return (
    <div className={`flex flex-col items-center justify-center text-zinc-300 ${s ? "py-4" : "py-12"}`}>
      <p className={s ? "text-[5px]" : "text-xs"}>Fill in your details to see the preview</p>
    </div>
  );
}

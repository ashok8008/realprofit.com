import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Printer, Download } from "lucide-react";
import type { ResumeData } from "./types";

interface Props {
  data: ResumeData;
  onPrint: () => void;
  onDownloadPDF: () => void;
}

export function ResumePreview({ data, onPrint, onDownloadPDF }: Props) {
  const isEmpty = !data.summary && data.experience.length === 0 && data.education.length === 0 && data.skills.length === 0;

  return (
    <div data-testid="resume-preview">
      {/* Header with export actions */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-400" /> Live Preview
        </h3>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" onClick={onPrint} className="h-8 text-xs px-3 text-gray-500 hover:text-gray-700" data-testid="resume-print-btn">
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
          </Button>
          <Button size="sm" onClick={onDownloadPDF} className="h-8 text-xs px-3 bg-gray-900 hover:bg-gray-800 text-white" data-testid="resume-download-btn">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Preview card */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden" style={{ minHeight: isEmpty ? "240px" : "400px" }}>
        <div className="p-6 text-sm" id="resume-preview">
          <h1 className="text-xl font-bold text-center text-gray-900 mb-0.5">
            {data.personalDetails.fullName || "Your Name"}
          </h1>

          <div className="text-center text-gray-500 text-[11px] mb-0.5">
            {[data.personalDetails.email, data.personalDetails.phone, data.personalDetails.location]
              .filter(Boolean)
              .join("  |  ") || "email@example.com | (555) 123-4567"}
          </div>
          {(data.personalDetails.linkedin || data.personalDetails.portfolio) && (
            <div className="text-center text-gray-400 text-[11px] mb-3">
              {[data.personalDetails.linkedin, data.personalDetails.portfolio].filter(Boolean).join("  |  ")}
            </div>
          )}

          {data.summary && (
            <div className="mb-3">
              <div className="border-b border-gray-200 mb-1.5 pb-0.5">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Professional Summary</h2>
              </div>
              <p className="text-gray-600 text-[11px] leading-relaxed whitespace-pre-line">{data.summary}</p>
            </div>
          )}

          {data.experience.length > 0 && (
            <div className="mb-3">
              <div className="border-b border-gray-200 mb-1.5 pb-0.5">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Experience</h2>
              </div>
              {data.experience.map((exp, i) => (
                <div key={exp.id || i} className="mb-2.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900 text-xs">{exp.title || "Job Title"}</span>
                    <span className="text-gray-400 text-[10px]">
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <div className="text-gray-500 text-[10px]">
                    {exp.company}{exp.location && `, ${exp.location}`}
                  </div>
                  {exp.description && (
                    <p className="text-gray-600 text-[11px] mt-0.5 whitespace-pre-line leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.education.length > 0 && (
            <div className="mb-3">
              <div className="border-b border-gray-200 mb-1.5 pb-0.5">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Education</h2>
              </div>
              {data.education.map((edu, i) => (
                <div key={edu.id || i} className="mb-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900 text-xs">
                      {edu.degree}{edu.field && ` in ${edu.field}`}
                    </span>
                    <span className="text-gray-400 text-[10px]">{edu.startDate} - {edu.endDate}</span>
                  </div>
                  <div className="text-gray-500 text-[10px]">{edu.school}</div>
                </div>
              ))}
            </div>
          )}

          {data.skills.length > 0 && (
            <div className="mb-3">
              <div className="border-b border-gray-200 mb-1.5 pb-0.5">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Skills</h2>
              </div>
              <p className="text-gray-600 text-[11px]">{data.skills.join(" \u2022 ")}</p>
            </div>
          )}

          {data.certifications.length > 0 && (
            <div>
              <div className="border-b border-gray-200 mb-1.5 pb-0.5">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Certifications</h2>
              </div>
              <ul className="text-gray-600 text-[11px]">
                {data.certifications.map(cert => (
                  <li key={cert}>&bull; {cert}</li>
                ))}
              </ul>
            </div>
          )}

          {isEmpty && (
            <div className="text-center text-gray-300 py-16">
              <p className="text-sm">Start filling in your details to see the preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

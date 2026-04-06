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
  return (
    <div className="lg:sticky lg:top-24 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Eye className="w-4 h-4" /> Live Preview
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPrint} data-testid="resume-print-btn">
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
          <Button size="sm" onClick={onDownloadPDF} data-testid="resume-download-btn">
            <Download className="w-4 h-4 mr-1" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="border rounded-xl bg-white shadow-lg overflow-hidden" style={{ minHeight: "600px" }}>
        <div className="p-8 text-sm" id="resume-preview">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
            {data.personalDetails.fullName || "Your Name"}
          </h1>

          <div className="text-center text-gray-600 text-xs mb-1">
            {[data.personalDetails.email, data.personalDetails.phone, data.personalDetails.location]
              .filter(Boolean)
              .join(" | ") || "email@example.com | (555) 123-4567"}
          </div>
          {(data.personalDetails.linkedin || data.personalDetails.portfolio) && (
            <div className="text-center text-gray-500 text-xs mb-4">
              {[data.personalDetails.linkedin, data.personalDetails.portfolio].filter(Boolean).join(" | ")}
            </div>
          )}

          {data.summary && (
            <div className="mb-4">
              <div className="border-b border-gray-300 mb-2 pb-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Professional Summary</h2>
              </div>
              <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-line">{data.summary}</p>
            </div>
          )}

          {data.experience.length > 0 && (
            <div className="mb-4">
              <div className="border-b border-gray-300 mb-2 pb-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Experience</h2>
              </div>
              {data.experience.map((exp, i) => (
                <div key={exp.id || i} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900">{exp.title || "Job Title"}</span>
                    <span className="text-gray-500 text-xs">
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
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

          {data.education.length > 0 && (
            <div className="mb-4">
              <div className="border-b border-gray-300 mb-2 pb-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Education</h2>
              </div>
              {data.education.map((edu, i) => (
                <div key={edu.id || i} className="mb-2">
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

          {data.skills.length > 0 && (
            <div className="mb-4">
              <div className="border-b border-gray-300 mb-2 pb-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Skills</h2>
              </div>
              <p className="text-gray-700 text-xs">{data.skills.join(" \u2022 ")}</p>
            </div>
          )}

          {data.certifications.length > 0 && (
            <div>
              <div className="border-b border-gray-300 mb-2 pb-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Certifications</h2>
              </div>
              <ul className="text-gray-700 text-xs">
                {data.certifications.map(cert => (
                  <li key={cert}>&bull; {cert}</li>
                ))}
              </ul>
            </div>
          )}

          {!data.summary && data.experience.length === 0 && data.education.length === 0 && data.skills.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              <p>Start filling in your details to see the preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

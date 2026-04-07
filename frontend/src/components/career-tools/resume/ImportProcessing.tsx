"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

const STEPS = [
  "Extracting personal details",
  "Detecting section headings",
  "Parsing work experience",
  "Identifying education",
  "Identifying skills",
  "Preparing editable structure",
];

interface Props {
  source: "docx" | "pdf" | "text";
  onComplete: () => void;
}

export function ImportProcessing({ source, onComplete }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= STEPS.length) {
      const timeout = setTimeout(onComplete, 400);
      return () => clearTimeout(timeout);
    }
    const delay = current === 0 ? 500 : 300 + Math.random() * 400;
    const timeout = setTimeout(() => setCurrent(c => c + 1), delay);
    return () => clearTimeout(timeout);
  }, [current, onComplete]);

  const sourceLabel = source === "docx" ? "DOCX file" : source === "pdf" ? "PDF file" : "pasted text";

  return (
    <div className="flex flex-col items-center justify-center py-12" data-testid="import-processing">
      <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-6">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
      <h2 className="font-serif text-2xl font-bold mb-2">Analyzing your resume...</h2>
      <p className="text-sm text-muted-foreground mb-8">Processing your {sourceLabel}</p>

      <div className="space-y-3 w-full max-w-sm">
        {STEPS.map((step, i) => (
          <div key={step} className={`flex items-center gap-3 transition-all duration-300 ${i <= current ? "opacity-100" : "opacity-30"}`}>
            {i < current ? (
              <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
            ) : i === current ? (
              <Loader2 className="w-5 h-5 text-teal-500 flex-shrink-0 animate-spin" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
            )}
            <span className={`text-sm ${i < current ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

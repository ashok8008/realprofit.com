"use client";
import React, { useRef, useState, useCallback } from "react";
import { Upload, FileText, Clipboard, Linkedin, ArrowRight, Shield, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  onFileImport: (file: File) => void;
  onTextImport: (text: string) => void;
  onStartScratch: () => void;
}

export function ImportEntry({ onFileImport, onTextImport, onStartScratch }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"choose" | "paste">("choose");
  const [pasteText, setPasteText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (file: File): boolean => {
    setError("");
    const ext = file.name.toLowerCase();
    if (!ext.endsWith(".docx") && !ext.endsWith(".pdf")) {
      setError("Only .docx and .pdf files are supported");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size is 5 MB.");
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) onFileImport(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) onFileImport(file);
  }, [onFileImport]);

  const handlePasteSubmit = () => {
    if (pasteText.trim().length < 50) {
      setError("Please paste at least 50 characters of resume text");
      return;
    }
    onTextImport(pasteText.trim());
  };

  if (mode === "paste") {
    return (
      <div className="space-y-5" data-testid="import-paste-mode">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold">Paste Your Resume Text</h2>
            <p className="text-sm text-muted-foreground mt-1">Copy and paste your resume content below</p>
          </div>
          <button onClick={() => setMode("choose")} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <X className="w-4 h-4" /> Back
          </button>
        </div>
        <Textarea
          className="min-h-[280px] font-mono text-sm leading-relaxed"
          placeholder={"John Doe\njohn@email.com | (555) 123-4567 | San Francisco, CA\n\nPROFESSIONAL SUMMARY\nExperienced software engineer with 5+ years...\n\nEXPERIENCE\nSenior Software Engineer | Acme Corp | Jan 2021 - Present\n- Led migration of monolith to microservices..."}
          value={pasteText}
          onChange={e => { setPasteText(e.target.value); setError(""); }}
          data-testid="paste-textarea"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={handlePasteSubmit}
            disabled={pasteText.trim().length < 50}
            className="bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg px-6 py-2.5 font-bold text-sm transition-colors inline-flex items-center gap-2"
            data-testid="parse-paste-btn"
          >
            Parse Resume <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="import-entry">
      <div className="text-center">
        <h2 className="font-serif text-3xl font-bold mb-2">Start Your Resume Your Way</h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Upload an existing resume, paste your text, or build from scratch. We'll organize everything into a clean, ATS-friendly format.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Upload Resume */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:border-teal-400 hover:bg-teal-50/50 ${dragging ? "border-teal-500 bg-teal-50 scale-[1.02]" : "border-gray-200"}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          data-testid="upload-drop-zone"
        >
          <input ref={fileRef} type="file" accept=".docx,.pdf" className="hidden" onChange={handleFileChange} />
          <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm mb-1">Upload Resume</h3>
          <p className="text-xs text-muted-foreground mb-2">Drag & drop or click to browse</p>
          <div className="flex justify-center gap-2">
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">.DOCX</span>
            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">.PDF</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Max 5 MB</p>
        </div>

        {/* Paste Text */}
        <div
          className="border rounded-xl p-6 text-center cursor-pointer transition-all hover:border-teal-400 hover:bg-teal-50/50"
          onClick={() => { setMode("paste"); setError(""); }}
          data-testid="paste-option"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-3">
            <Clipboard className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm mb-1">Paste Resume Text</h3>
          <p className="text-xs text-muted-foreground">Copy-paste from any document</p>
        </div>

        {/* Start from Scratch */}
        <div
          className="border rounded-xl p-6 text-center cursor-pointer transition-all hover:border-teal-400 hover:bg-teal-50/50"
          onClick={onStartScratch}
          data-testid="scratch-option"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm mb-1">Start From Scratch</h3>
          <p className="text-xs text-muted-foreground">Build your resume manually</p>
        </div>

        {/* LinkedIn (Placeholder) */}
        <div
          className="border rounded-xl p-6 text-center cursor-not-allowed opacity-50 relative"
          data-testid="linkedin-option"
        >
          <span className="absolute top-2 right-2 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Coming soon</span>
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Linkedin className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm mb-1">LinkedIn Import</h3>
          <p className="text-xs text-muted-foreground">Import from LinkedIn profile</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg text-center" data-testid="import-error">
          {error}
        </div>
      )}

      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> All processing happens in your browser</div>
        <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Best results with text-based DOCX files</div>
      </div>
    </div>
  );
}

"use client";
import React, { useRef, useState, useCallback } from "react";
import { Upload, FileText, Clipboard, ArrowRight, Shield, X, Sparkles, CheckCircle2 } from "lucide-react";
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

  // Paste mode — full screen
  if (mode === "paste") {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center px-4" data-testid="import-paste-mode">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Paste Your Resume</h2>
              <p className="text-sm text-gray-500 mt-1">Copy and paste your resume content below</p>
            </div>
            <button onClick={() => setMode("choose")} className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
              <X className="w-4 h-4" /> Back
            </button>
          </div>
          <Textarea
            className="min-h-[320px] font-mono text-sm leading-relaxed bg-white border-gray-200 rounded-xl"
            placeholder={"John Doe\njohn@email.com | (555) 123-4567 | San Francisco, CA\n\nPROFESSIONAL SUMMARY\nExperienced software engineer with 5+ years...\n\nEXPERIENCE\nSenior Software Engineer | Acme Corp | Jan 2021 - Present\n- Led migration of monolith to microservices..."}
            value={pasteText}
            onChange={e => { setPasteText(e.target.value); setError(""); }}
            data-testid="paste-textarea"
          />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePasteSubmit}
              disabled={pasteText.trim().length < 50}
              className="bg-[#1a2b5e] text-white hover:bg-[#15224d] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-8 py-3 font-semibold text-sm transition-colors inline-flex items-center gap-2"
              data-testid="parse-paste-btn"
            >
              Parse Resume <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main entry — full-screen hero
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col" data-testid="import-entry">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#e8f0fd] to-white flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-xs font-medium text-gray-500 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            AI-Powered Resume Builder
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Build a resume that<br />
            <span className="text-[#1a2b5e]">gets you hired</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">
            Create a professional, ATS-optimized resume in minutes. Import your existing resume or start fresh.
          </p>
        </div>

        {/* Two main paths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full mx-auto">
          {/* Create from scratch */}
          <div
            className="group bg-white rounded-2xl border border-gray-200 p-8 cursor-pointer transition-all hover:shadow-xl hover:border-[#1a2b5e]/20 hover:-translate-y-1"
            onClick={onStartScratch}
            data-testid="scratch-option"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#1a2b5e] text-white flex items-center justify-center mb-5">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Create My Resume</h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Start from a blank canvas. Choose a template and fill in your details step by step.
            </p>
            <div className="flex items-center text-[#1a2b5e] font-semibold text-sm group-hover:gap-3 gap-2 transition-all">
              Get Started <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Import existing */}
          <div
            className={`group bg-white rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 ${
              dragging ? "border-[#1a2b5e] bg-blue-50/50 scale-[1.02]" : "border-gray-200 hover:border-[#1a2b5e]/30"
            }`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            data-testid="upload-drop-zone"
          >
            <input ref={fileRef} type="file" accept=".docx,.pdf" className="hidden" onChange={handleFileChange} />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-[#1a2b5e] flex items-center justify-center mb-5 border border-blue-100">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Import Your Resume</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Upload your existing resume and we'll parse it automatically.
            </p>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">.DOCX</span>
              <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">.PDF</span>
              <span className="text-xs text-gray-400">Max 5 MB</span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setMode("paste"); setError(""); }}
              className="text-xs text-gray-400 hover:text-[#1a2b5e] transition-colors flex items-center gap-1"
              data-testid="paste-option"
            >
              <Clipboard className="w-3 h-3" /> Or paste resume text
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg text-center mt-6 max-w-lg" data-testid="import-error">
            {error}
          </div>
        )}

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-gray-400 mt-12">
          <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> 100% private — processed in your browser</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> ATS-optimized templates</div>
          <div className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI-powered improvements</div>
        </div>
      </div>
    </div>
  );
}

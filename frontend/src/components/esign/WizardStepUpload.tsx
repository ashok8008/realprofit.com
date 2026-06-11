"use client";
import { FileText } from "lucide-react";

interface Props {
  title: string;
  setTitle: (v: string) => void;
  file: File | null;
  onFile: (f: File | null) => void;
}

/**
 * Step 1 of the eSign wizard: upload PDF + name it.
 * Pure JSX — all state lives in the parent EsignWizard.
 */
export function WizardStepUpload({ title, setTitle, file, onFile }: Props) {
  return (
    <section data-testid="step-1-upload" className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-stone-900 mb-1">Upload your document</h2>
      <p className="text-sm text-stone-600 mb-6">PDF only, up to 25 MB on the free plan.</p>

      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-medium text-stone-700 mb-1">Document title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Freelance Contract Q2"
          data-testid="doc-title-input"
          className="w-full px-3 py-2 border border-stone-300 rounded-md text-base focus:outline-none focus:border-[#0B3D3D] mb-4"
        />

        <label
          htmlFor="pdf-upload"
          data-testid="pdf-upload-zone"
          className="block border-2 border-dashed border-stone-300 rounded-lg p-10 text-center cursor-pointer hover:border-[#0B3D3D] transition-colors bg-stone-50/50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files?.[0] || null);
          }}
        >
          <FileText className="w-10 h-10 mx-auto text-[#0B3D3D] mb-3" />
          <div className="text-base font-medium text-stone-800">
            {file ? file.name : "Drag & drop your PDF here"}
          </div>
          <div className="text-sm text-stone-500 mt-1">
            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or click to choose a file"}
          </div>
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
            className="hidden"
            data-testid="pdf-upload-input"
          />
        </label>
      </div>
    </section>
  );
}

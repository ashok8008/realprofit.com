"use client";
import React from "react";
import { Download, Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";

interface TaxPDFExportProps {
  title: string;
  sections: { heading: string; rows: { label: string; value: string }[] }[];
  notes?: string[];
  fileName?: string;
}

export function TaxPDFExport({ title, sections, notes, fileName }: TaxPDFExportProps) {
  const { toast } = useToast();

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const lm = 20;
    const pw = 170;

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, lm, y);
    y += 8;

    // Disclaimer bar
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text("Prepared for filing reference only. This is NOT an official IRS document.", lm, y);
    doc.setTextColor(0);
    y += 4;

    doc.setDrawColor(200);
    doc.line(lm, y, lm + pw, y);
    y += 8;

    // Date
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, lm, y);
    y += 10;

    for (const section of sections) {
      if (y > 260) { doc.addPage(); y = 20; }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(section.heading, lm, y);
      y += 7;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      for (const row of section.rows) {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(row.label, lm, y);
        doc.text(row.value, lm + pw - doc.getTextWidth(row.value), y);
        y += 6;
      }
      y += 4;
      doc.setDrawColor(230);
      doc.line(lm, y, lm + pw, y);
      y += 8;
    }

    if (notes && notes.length > 0) {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100);
      for (const note of notes) {
        const lines = doc.splitTextToSize(note, pw);
        doc.text(lines, lm, y);
        y += lines.length * 5 + 3;
      }
      doc.setTextColor(0);
    }

    // Footer disclaimer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text("RealProfits.com — Informational tax prep only. Not a substitute for professional tax advice.", lm, 290);
    }

    const name = fileName || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    doc.save(`${name}.pdf`);
    toast({ title: "PDF downloaded", description: `${title} saved successfully.` });
  };

  return (
    <div className="flex gap-2" data-testid="tax-pdf-export">
      <button
        onClick={generatePDF}
        className="inline-flex items-center gap-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg px-4 py-2 text-sm font-bold transition-colors"
        data-testid="download-pdf-btn"
      >
        <Download className="w-4 h-4" /> Download PDF
      </button>
      <button
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2 text-sm font-bold transition-colors"
        data-testid="print-btn"
      >
        <Printer className="w-4 h-4" /> Print
      </button>
    </div>
  );
}

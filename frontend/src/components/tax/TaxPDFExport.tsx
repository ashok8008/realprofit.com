"use client";
import React from "react";
import { Download, Printer } from "lucide-react";
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
    const { jsPDF } = require("jspdf");
    const { drawHeader, drawFooter, drawSectionHeading, drawKVRow, drawRule, BRAND, LM, PW, PAGE_W, PAGE_H } = require("@/lib/pdf-brand");
    const doc = new jsPDF();

    let y = drawHeader(doc, title, "Tax filing reference document");

    // Disclaimer bar
    doc.setFillColor(255, 243, 205);
    doc.roundedRect(LM, y, PW, 12, 2, 2, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120, 80, 0);
    doc.text("This is NOT an official IRS document. Prepared for filing reference only.", LM + 4, y + 5);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, LM + 4, y + 10);
    doc.setTextColor(0, 0, 0);
    y += 18;

    for (const section of sections) {
      if (y > PAGE_H - 40) { doc.addPage(); y = 15; }

      y = drawSectionHeading(doc, section.heading, y);

      for (const row of section.rows) {
        if (y > PAGE_H - 20) { doc.addPage(); y = 15; }
        const isTotal = row.label.toLowerCase().includes("total") || row.label.toLowerCase().includes("net");
        y = drawKVRow(doc, row.label, row.value, y, {
          bold: isTotal,
          color: isTotal ? BRAND.accent : BRAND.dark,
          size: isTotal ? 11 : 9,
        });
      }
      y += 2;
      y = drawRule(doc, y);
    }

    if (notes && notes.length > 0) {
      if (y > PAGE_H - 40) { doc.addPage(); y = 15; }
      y = drawSectionHeading(doc, "Notes", y);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...BRAND.muted);
      for (const note of notes) {
        const lines = doc.splitTextToSize(note, PW);
        doc.text(lines, LM + 4, y);
        y += lines.length * 4 + 3;
      }
      doc.setTextColor(0, 0, 0);
    }

    drawFooter(doc);
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

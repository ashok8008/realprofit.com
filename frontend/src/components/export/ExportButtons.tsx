"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Printer, Share2, Image } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";

interface ExportProps {
  elementId: string;
  title: string;
  data?: any;
}

async function convertSVGsToCanvas(container: HTMLElement): Promise<() => void> {
  const svgs = container.querySelectorAll("svg");
  const restoreFns: (() => void)[] = [];
  const loadPromises: Promise<void>[] = [];

  svgs.forEach((svg) => {
    try {
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const canvas = document.createElement("canvas");
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(2, 2);

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new window.Image();

      const parent = svg.parentNode;
      if (!parent) return;

      const loadPromise = new Promise<void>((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
      });
      loadPromises.push(loadPromise);
      img.src = url;

      parent.insertBefore(canvas, svg);
      svg.style.display = "none";

      restoreFns.push(() => {
        svg.style.display = "";
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      });
    } catch {}
  });

  await Promise.all(loadPromises);
  return () => restoreFns.forEach((fn) => fn());
}

async function captureElement(element: HTMLElement): Promise<HTMLCanvasElement> {
  const restore = await convertSVGsToCanvas(element);

  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    logging: false,
    allowTaint: true,
    removeContainer: true,
  });

  restore();
  return canvas;
}

function extractCleanText(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("svg, canvas, .recharts-wrapper, .recharts-responsive-container, button, [role='img']").forEach((el) => el.remove());

  const text = clone.innerText || clone.textContent || "";
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

export function ExportToPDFButton({ elementId, title }: ExportProps) {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        toast({ title: "Export Failed", description: "Could not find the content to export.", variant: "destructive" });
        return;
      }

      const { drawHeader, drawFooter, BRAND, LM, PW, PAGE_W, PAGE_H } = require("@/lib/pdf-brand");
      const doc = new jsPDF("p", "mm", "a4");

      // Branded header
      let y = drawHeader(doc, title);

      // Try html2canvas screenshot of calculator
      let usedImage = false;
      try {
        const canvas = await captureElement(element);
        const imgData = canvas.toDataURL("image/jpeg", 0.85);
        const imgWidth = PW;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const maxFirstPage = PAGE_H - y - 20; // leave room for footer

        if (imgHeight <= maxFirstPage) {
          doc.addImage(imgData, "JPEG", LM, y, imgWidth, imgHeight);
        } else {
          // Multi-page: slice the image across pages
          const totalPages = Math.ceil(imgHeight / (PAGE_H - 30));
          for (let p = 0; p < totalPages; p++) {
            if (p > 0) {
              doc.addPage();
              y = drawHeader(doc, title);
            }
            // Use clip offset to simulate page slicing
            const offsetY = p === 0 ? y : y;
            const srcY = p === 0 ? 0 : (maxFirstPage + (p - 1) * (PAGE_H - 50));
            const srcH = p === 0 ? maxFirstPage : Math.min(PAGE_H - 50, imgHeight - srcY);
            
            // For simplicity, add the full image offset per page
            doc.addImage(imgData, "JPEG", LM, offsetY - (p === 0 ? 0 : (maxFirstPage + (p - 1) * (PAGE_H - 50))), imgWidth, imgHeight);
          }
        }
        usedImage = true;
      } catch (imgErr) {
        console.warn("html2canvas failed, using text fallback:", imgErr);
      }

      // Text fallback with branded formatting
      if (!usedImage) {
        const textContent = extractCleanText(element);
        const lines = doc.splitTextToSize(textContent, PW);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(BRAND.dark[0], BRAND.dark[1], BRAND.dark[2]);
        for (const line of lines) {
          if (y > PAGE_H - 25) {
            doc.addPage();
            y = drawHeader(doc, title);
          }
          doc.text(line, LM, y);
          y += 4.5;
        }
      }

      // Branded footer on all pages
      drawFooter(doc);

      doc.save(`${title.replace(/\s+/g, "-").toLowerCase()}-results.pdf`);
      toast({ title: "PDF Downloaded", description: "Your results have been saved as a PDF." });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({ title: "Export Failed", description: "Could not generate PDF.", variant: "destructive" });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
      <Download className="w-4 h-4" /> PDF
    </Button>
  );
}

export function DownloadPNGButton({ elementId, title }: ExportProps) {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        toast({ title: "Export Failed", description: "Could not find the content.", variant: "destructive" });
        return;
      }

      const canvas = await captureElement(element);
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-results.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "Image Downloaded", description: "Your results have been saved as a PNG." });
    } catch (err) {
      console.error("PNG export error:", err);
      toast({ title: "Export Failed", description: "Could not generate image.", variant: "destructive" });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
      <Image className="w-4 h-4" /> PNG
    </Button>
  );
}

export function ExportToCSVButton({ data, title }: { data: any[]; title: string }) {
  const { toast } = useToast();

  const escapeCSV = (val: unknown): string => {
    const str = val == null ? "" : String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleExport = () => {
    try {
      if (!data || !data.length) {
        toast({ title: "No Data", description: "There is no data to export." });
        return;
      }

      const headers = Object.keys(data[0]);
      const csvLines = [headers.map(escapeCSV).join(","), ...data.map((row) => headers.map((h) => escapeCSV(row[h])).join(","))];
      const csvString = csvLines.join("\n");

      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: "CSV Downloaded", description: "Your data has been saved as a CSV file." });
    } catch (err) {
      console.error("CSV export error:", err);
      toast({ title: "Export Failed", description: "Could not generate CSV.", variant: "destructive" });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
      <Download className="w-4 h-4" /> CSV
    </Button>
  );
}

export function PrintResultsButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-2">
      <Printer className="w-4 h-4" /> Print
    </Button>
  );
}

export function ShareResultsButton() {
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied", description: "You can now share your results with this link." });
    } catch {
      toast({ title: "Error", description: "Failed to copy link." });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2">
      <Share2 className="w-4 h-4" /> Share
    </Button>
  );
}

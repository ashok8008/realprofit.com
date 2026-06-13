"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, Share2, Image as ImageIcon } from "lucide-react";
import { jsPDF } from "jspdf";
import { drawHeader, drawFooter, BRAND, LM, PW, PAGE_H } from "@/lib/pdf-brand";
import { useToast } from "@/hooks/use-toast";

interface ExportProps {
  elementId: string;
  title: string;
  data?: any;
}

/**
 * Capture a DOM element to a canvas using html2canvas-pro (the maintained fork
 * that natively understands modern CSS colors like `oklch()` — the stock
 * html2canvas library returns black bars for any Tailwind v4 / Recharts color
 * because it can't parse oklch).
 *
 * The `onclone` hook below ALSO mirrors each live form field's `.value` into
 * its `value` attribute on the clone, so user-entered numbers actually appear
 * in the exported image (without this, the screenshot shows empty inputs).
 */
async function captureElement(element: HTMLElement): Promise<HTMLCanvasElement> {
  // Dynamic import keeps the heavy lib out of the initial bundle.
  const html2canvas = (await import("html2canvas-pro")).default;

  return html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    logging: false,
    allowTaint: true,
    removeContainer: true,
    onclone: (_clonedDoc, clonedEl) => {
      // Copy live values from the live DOM into the cloned DOM, otherwise
      // controlled React inputs render empty in the screenshot.
      const liveInputs = element.querySelectorAll<HTMLInputElement>("input, textarea, select");
      const clonedInputs = clonedEl.querySelectorAll<HTMLInputElement>("input, textarea, select");
      liveInputs.forEach((live, i) => {
        const clone = clonedInputs[i];
        if (!clone) return;
        if (live instanceof HTMLSelectElement && clone instanceof HTMLSelectElement) {
          clone.value = live.value;
          // Also reflect on <option selected> so it persists in the static render
          Array.from(clone.options).forEach((opt) => {
            opt.removeAttribute("selected");
            if (opt.value === live.value) opt.setAttribute("selected", "selected");
          });
        } else if (live instanceof HTMLTextAreaElement && clone instanceof HTMLTextAreaElement) {
          clone.textContent = live.value;
          clone.value = live.value;
        } else if (live instanceof HTMLInputElement && clone instanceof HTMLInputElement) {
          if (live.type === "checkbox" || live.type === "radio") {
            if (live.checked) clone.setAttribute("checked", "checked");
            else clone.removeAttribute("checked");
          } else {
            clone.setAttribute("value", live.value);
            clone.value = live.value;
          }
        }
      });
    },
  });
}

/** Strip non-text content for the text-fallback path. */
function extractCleanText(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll("svg, canvas, .recharts-wrapper, .recharts-responsive-container, button, [role='img']")
    .forEach((el) => el.remove());

  const text = clone.innerText || clone.textContent || "";
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

/**
 * Slice a tall source canvas into per-page-height chunks and add each chunk to
 * jsPDF as its own page. Replaces the prior broken implementation that drew
 * the full image with a negative Y offset (jsPDF doesn't clip JPEG addImage,
 * so pages 2+ came out blank or repeated).
 *
 * @param doc          jsPDF instance
 * @param source       Source canvas captured by html2canvas-pro
 * @param firstPageTop Top Y on page 1 (after the branded header)
 * @param title        Title used for the branded header on subsequent pages
 */
function addCanvasAsMultipagePdf(
  doc: jsPDF,
  source: HTMLCanvasElement,
  firstPageTop: number,
  title: string,
) {
  const PAGE_BOTTOM_MARGIN = 20; // room for footer
  const SUBSEQUENT_PAGE_TOP = 18; // room for header reprinted on later pages

  // mm height available on each page
  const firstPageMm = PAGE_H - firstPageTop - PAGE_BOTTOM_MARGIN;
  const otherPagesMm = PAGE_H - SUBSEQUENT_PAGE_TOP - PAGE_BOTTOM_MARGIN;

  // Total image height in mm at the target PDF width
  const mmPerPx = PW / source.width;
  const totalMm = source.height * mmPerPx;

  // Single page — short-circuit
  if (totalMm <= firstPageMm) {
    const imgData = source.toDataURL("image/jpeg", 0.9);
    doc.addImage(imgData, "JPEG", LM, firstPageTop, PW, totalMm);
    return;
  }

  let consumedMm = 0;
  let pageIdx = 0;

  while (consumedMm < totalMm) {
    const top = pageIdx === 0 ? firstPageTop : SUBSEQUENT_PAGE_TOP;
    const pageBudgetMm = pageIdx === 0 ? firstPageMm : otherPagesMm;
    const sliceMm = Math.min(pageBudgetMm, totalMm - consumedMm);

    // Convert mm slice into px on the source canvas
    const srcY = Math.floor(consumedMm / mmPerPx);
    const srcH = Math.floor(sliceMm / mmPerPx);

    // Draw the slice onto a temp canvas, then add to PDF.
    const tmp = document.createElement("canvas");
    tmp.width = source.width;
    tmp.height = srcH;
    const ctx = tmp.getContext("2d");
    if (!ctx) break;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, tmp.width, tmp.height);
    ctx.drawImage(source, 0, srcY, source.width, srcH, 0, 0, source.width, srcH);

    const sliceData = tmp.toDataURL("image/jpeg", 0.9);

    if (pageIdx > 0) {
      doc.addPage();
      drawHeader(doc, title);
    }
    doc.addImage(sliceData, "JPEG", LM, top, PW, sliceMm);

    consumedMm += sliceMm;
    pageIdx += 1;

    // Safety valve — never produce more than 50 pages
    if (pageIdx > 50) break;
  }
}

export function ExportToPDFButton({ elementId, title }: ExportProps) {
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        toast({
          title: "Export Failed",
          description: "Could not find the content to export.",
          variant: "destructive",
        });
        return;
      }

      const doc = new jsPDF("p", "mm", "a4");
      const headerBottomY = drawHeader(doc, title);

      try {
        const canvas = await captureElement(element);
        addCanvasAsMultipagePdf(doc, canvas, headerBottomY, title);
      } catch (imgErr) {
        // Text fallback if html2canvas-pro still fails (very rare with the
        // oklch-aware fork — usually only happens for cross-origin tainted canvases).
        console.warn("html2canvas-pro failed, falling back to text:", imgErr);
        let y = headerBottomY;
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

      drawFooter(doc);
      doc.save(`${title.replace(/\s+/g, "-").toLowerCase()}-results.pdf`);
      toast({ title: "PDF Downloaded", description: "Your results have been saved as a PDF." });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({ title: "Export Failed", description: "Could not generate PDF.", variant: "destructive" });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2" data-testid="export-pdf-btn">
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
        toast({
          title: "Export Failed",
          description: "Could not find the content.",
          variant: "destructive",
        });
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
    <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2" data-testid="export-png-btn">
      <ImageIcon className="w-4 h-4" /> PNG
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
      const csvLines = [
        headers.map(escapeCSV).join(","),
        ...data.map((row) => headers.map((h) => escapeCSV(row[h])).join(",")),
      ];
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
    <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2" data-testid="export-csv-btn">
      <Download className="w-4 h-4" /> CSV
    </Button>
  );
}

export function PrintResultsButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-2" data-testid="print-btn">
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
    <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-2" data-testid="share-btn">
      <Share2 className="w-4 h-4" /> Share
    </Button>
  );
}

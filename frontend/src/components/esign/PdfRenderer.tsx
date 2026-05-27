"use client";
// PDF.js page renderer — renders all pages of a PDF as <canvas> elements stacked vertically.
// Used by both the field-placement step (owner) and the signing page (signer).
import { useEffect, useRef, useState } from "react";

// pdfjs worker is loaded via CDN to avoid bundler config friction.
const PDFJS_VERSION = "5.6.205";
const PDFJS_WORKER = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

export interface PageRenderInfo {
  pageNumber: number;
  width: number;   // rendered px
  height: number;
  canvas: HTMLCanvasElement;
}

export function usePdfRenderer(src: string | null, scale: number = 1.4) {
  const [pages, setPages] = useState<PageRenderInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPages([]);

    (async () => {
      try {
        const pdfjsLib: any = await import("pdfjs-dist");
        // Use the CDN worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

        const loadingTask = pdfjsLib.getDocument({
          url: src,
          withCredentials: src.startsWith(process.env.NEXT_PUBLIC_BACKEND_URL || ""),
        });
        const pdf = await loadingTask.promise;
        const rendered: PageRenderInfo[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          rendered.push({
            pageNumber: i,
            width: viewport.width,
            height: viewport.height,
            canvas,
          });
          if (cancelled) return;
        }
        if (!cancelled) setPages(rendered);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load PDF");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [src, scale]);

  return { pages, loading, error };
}

export function PageCanvas({ info, children, onClick }: {
  info: PageRenderInfo;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = containerRef.current?.querySelector("canvas");
    if (c && c !== info.canvas) {
      containerRef.current?.replaceChild(info.canvas, c);
    } else if (!c && containerRef.current) {
      containerRef.current.insertBefore(info.canvas, containerRef.current.firstChild);
    }
    // Style canvas
    info.canvas.style.display = "block";
    info.canvas.style.width = "100%";
    info.canvas.style.height = "auto";
  }, [info]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      data-testid={`pdf-page-${info.pageNumber}`}
      className="relative bg-white shadow-lg rounded-md overflow-hidden border border-stone-200"
      style={{ aspectRatio: `${info.width} / ${info.height}` }}
    >
      {children}
    </div>
  );
}

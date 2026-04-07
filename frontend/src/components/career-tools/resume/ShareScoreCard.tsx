"use client";
import React, { useCallback, useRef, useState } from "react";
import { Share2, Download, X, Twitter, Linkedin, Link2, Check } from "lucide-react";
import type { ResumeScoreResult } from "@/lib/career-tools/resume/score";

interface ShareScoreModalProps {
  result: ResumeScoreResult;
  groups: Array<{ key: string; label: string; score: number; max: number }>;
  scoreLabel: string;
  onClose: () => void;
}

function drawScoreCard(
  canvas: HTMLCanvasElement,
  result: ResumeScoreResult,
  groups: Array<{ key: string; label: string; score: number; max: number }>,
  scoreLabel: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = 1200;
  const H = 630;
  canvas.width = W;
  canvas.height = H;

  // Background
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, W, H);

  // Subtle grid dots
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let x = 0; x < W; x += 24) {
    for (let y = 0; y < H; y += 24) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Top-left branding
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("RealProfits.", 48, 52);

  // Divider line
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(48, 72);
  ctx.lineTo(W - 48, 72);
  ctx.stroke();

  // Score circle - centered left area
  const cx = 240;
  const cy = 320;
  const radius = 110;

  // Ring background
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.lineWidth = 10;
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.stroke();

  // Ring foreground
  const scoreColor =
    result.total >= 80 ? "#10b981" : result.total >= 60 ? "#14b8a6" : result.total >= 40 ? "#f59e0b" : "#ef4444";
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (result.total / 100) * Math.PI * 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.lineWidth = 10;
  ctx.strokeStyle = scoreColor;
  ctx.lineCap = "round";
  ctx.stroke();

  // Score number
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 72px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(String(result.total), cx, cy + 14);

  // "of 100"
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "400 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("of 100", cx, cy + 42);

  // Score label below ring
  ctx.fillStyle = scoreColor;
  ctx.font = "600 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText(scoreLabel, cx, cy + radius + 44);

  // Right side — category breakdown
  const rightX = 460;
  let rowY = 140;

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "500 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillText("RESUME SCORE BREAKDOWN", rightX, rowY);
  rowY += 40;

  groups.forEach((g) => {
    const pct = g.max > 0 ? g.score / g.max : 0;
    const barW = 480;
    const barH = 8;
    const barColor =
      pct >= 0.8 ? "#10b981" : pct >= 0.6 ? "#14b8a6" : pct >= 0.4 ? "#f59e0b" : "#ef4444";

    // Label
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(g.label, rightX, rowY);

    // Score text
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "400 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${g.score}/${g.max}`, rightX + barW, rowY);
    ctx.textAlign = "left";
    rowY += 16;

    // Bar background
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.roundRect(rightX, rowY, barW, barH, 4);
    ctx.fill();

    // Bar fill
    if (pct > 0) {
      ctx.fillStyle = barColor;
      ctx.beginPath();
      ctx.roundRect(rightX, rowY, barW * pct, barH, 4);
      ctx.fill();
    }

    rowY += 52;
  });

  // Bottom tagline
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "400 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Built with RealProfits Resume Builder  \u2022  realprofits.com/career-tools/resume-builder", W / 2, H - 36);
}

export function ShareScoreModal({ result, groups, scoreLabel, onClose }: ShareScoreModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateImage = useCallback(() => {
    if (!canvasRef.current) return;
    drawScoreCard(canvasRef.current, result, groups, scoreLabel);
    const url = canvasRef.current.toDataURL("image/png");
    setImageUrl(url);
  }, [result, groups, scoreLabel]);

  // Generate on mount
  React.useEffect(() => {
    generateImage();
  }, [generateImage]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `resume-score-${result.total}.png`;
    a.click();
  };

  const shareText = `My resume score: ${result.total}/100 (${scoreLabel})! Built with RealProfits Resume Builder.`;
  const shareUrl = "https://realprofits.com/career-tools/resume-builder";

  const handleTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const handleLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const handleCopyLink = async () => {
    const text = `${shareText}\n${shareUrl}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback: textarea copy
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose} data-testid="share-score-modal">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Share Your Score</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" data-testid="share-modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas preview */}
        <div className="px-5 py-4">
          <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            <canvas ref={canvasRef} className="w-full h-auto" style={{ aspectRatio: "1200/630" }} />
          </div>
        </div>

        {/* Share actions */}
        <div className="px-5 pb-5 space-y-3">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
            data-testid="share-download-btn"
          >
            <Download className="w-4 h-4" /> Download Scorecard
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleTwitter}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors"
              data-testid="share-twitter-btn"
            >
              <Twitter className="w-4 h-4" /> Twitter
            </button>
            <button
              onClick={handleLinkedIn}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors"
              data-testid="share-linkedin-btn"
            >
              <Linkedin className="w-4 h-4" /> LinkedIn
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors"
              data-testid="share-copy-btn"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <p className="text-[11px] text-gray-400 text-center pt-1">
            Your resume data is never included in the shared image.
          </p>
        </div>
      </div>
    </div>
  );
}

interface ShareButtonProps {
  result: ResumeScoreResult;
  groups: Array<{ key: string; label: string; score: number; max: number }>;
  scoreLabel: string;
}

export function ShareScoreButton({ result, groups, scoreLabel }: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-gray-400 hover:text-gray-600 inline-flex items-center gap-1.5 transition-colors"
        data-testid="share-score-btn"
      >
        <Share2 className="w-3.5 h-3.5" /> Share
      </button>
      {open && (
        <ShareScoreModal
          result={result}
          groups={groups}
          scoreLabel={scoreLabel}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

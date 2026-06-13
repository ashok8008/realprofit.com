"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Props {
  /** Pixels of vertical scroll before the bar shows. */
  showAfter?: number;
  href: string;
  label: string;
  ctaLabel?: string;
}

/**
 * Slim sticky bar that fades in once the user has scrolled past `showAfter`px,
 * and fades out again when they scroll back to the top. Designed for paid-traffic
 * landing pages where a persistent CTA lifts conversion.
 */
export function StickyCtaBar({
  showAfter = 250,
  href,
  label,
  ctaLabel = "Sign a Document Free →",
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    onScroll(); // sync on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  return (
    <div
      data-testid="esign-sticky-cta"
      aria-hidden={!visible}
      className={`fixed top-0 inset-x-0 z-50 h-12 bg-[#0B3D3D] text-white shadow-lg transition-opacity duration-300 ${
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{ height: "48px" }}
    >
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold truncate">{label}</div>
        <Link
          href={href}
          data-testid="esign-sticky-cta-btn"
          className="inline-flex items-center gap-1 px-4 py-1.5 text-sm font-bold text-[#0B3D3D] bg-[#C8A96E] rounded-md hover:bg-[#D4B780] transition-colors whitespace-nowrap"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

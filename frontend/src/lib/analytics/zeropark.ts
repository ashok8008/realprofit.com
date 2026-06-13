"use client";
import { useEffect } from "react";

/**
 * Zeropark / paid-traffic UTM capture.
 *
 * Reads ?source / ?campaign / ?cost / ?utm_source / ?utm_campaign from the
 * landing URL and stashes them in sessionStorage so they survive cross-page
 * navigation until the user closes the tab. Downstream analytics calls read
 * them via `getZeroparkContext()` below.
 *
 * Stored keys:
 *   zp_source    — Zeropark `source` (sub-source ID)
 *   zp_campaign  — Zeropark `campaign` ID
 *   zp_cost      — Zeropark `cost` (per-visit cost)
 *   zp_utm_source / zp_utm_campaign / zp_utm_medium — Google-style fallbacks
 *   zp_landing   — first landing path (for funnel attribution)
 *   zp_captured  — ISO timestamp of first capture
 */
const KEYS: Record<string, string> = {
  source: "zp_source",
  campaign: "zp_campaign",
  cost: "zp_cost",
  utm_source: "zp_utm_source",
  utm_campaign: "zp_utm_campaign",
  utm_medium: "zp_utm_medium",
  utm_content: "zp_utm_content",
  utm_term: "zp_utm_term",
};

/** One-time landing capture. Mount once near the top of any paid-traffic page. */
export function ZeroparkUtmCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      let captured = false;
      for (const [param, storageKey] of Object.entries(KEYS)) {
        const v = url.searchParams.get(param);
        if (v) {
          window.sessionStorage.setItem(storageKey, v);
          captured = true;
        }
      }
      if (captured) {
        if (!window.sessionStorage.getItem("zp_captured")) {
          window.sessionStorage.setItem("zp_captured", new Date().toISOString());
          window.sessionStorage.setItem("zp_landing", url.pathname);
        }
        // Fire a landing event so the funnel begins at the ad click
        if (typeof (window as any).gtag === "function") {
          (window as any).gtag("event", "tool_landed", {
            source: window.sessionStorage.getItem("zp_source") || undefined,
            campaign: window.sessionStorage.getItem("zp_campaign") || undefined,
            cost: window.sessionStorage.getItem("zp_cost") || undefined,
            utm_source: window.sessionStorage.getItem("zp_utm_source") || undefined,
            utm_campaign: window.sessionStorage.getItem("zp_utm_campaign") || undefined,
            tool: deriveToolFromPath(url.pathname),
          });
        }
      }
    } catch {
      // sessionStorage can throw in private mode — silent no-op is fine
    }
  }, []);
  return null;
}

function deriveToolFromPath(p: string): string | undefined {
  if (p.startsWith("/tools/esign")) return "esign";
  if (p.startsWith("/tools/invoice")) return "invoice";
  if (p.startsWith("/tools/")) return p.split("/")[2];
  if (p.startsWith("/calculators/")) return "calculator";
  return undefined;
}

/** Snapshot of the captured Zeropark context — pass to gtag/analytics events. */
export function getZeroparkContext(): Record<string, string | undefined> {
  if (typeof window === "undefined") return {};
  const out: Record<string, string | undefined> = {};
  for (const storageKey of Object.values(KEYS)) {
    const v = window.sessionStorage.getItem(storageKey);
    if (v) out[storageKey.replace(/^zp_/, "")] = v;
  }
  const landing = window.sessionStorage.getItem("zp_landing");
  if (landing) out.landing = landing;
  return out;
}

/**
 * Fire a gtag event with the captured Zeropark context auto-attached.
 * Safe to call on every conversion step (tool_started, doc_created, doc_sent).
 *
 *   trackZeroparkEvent("tool_started", { tool: "esign" });
 */
export function trackZeroparkEvent(name: string, extra: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const ctx = getZeroparkContext();
  // Only fire if gtag is present (i.e. GA loaded)
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", name, { ...ctx, ...extra });
  }
}

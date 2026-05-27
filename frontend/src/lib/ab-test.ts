"use client";
// Tiny localStorage-backed A/B test client.
// - Each experiment assigns a stable variant per browser (so user sees the same UI on reloads).
// - Auto-fires an 'impression' event the first time a variant is rendered.
// - Caller wires up `track` for click and convert events.
import { useEffect, useState, useRef } from "react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;
const SESSION_KEY = "rp_ab_session";
const ASSIGN_PREFIX = "rp_ab_";

function getOrCreateSession(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function pickVariant(experiment: string, variants: string[]): string {
  if (typeof window === "undefined") return variants[0];
  const key = ASSIGN_PREFIX + experiment;
  const existing = localStorage.getItem(key);
  if (existing && variants.includes(existing)) return existing;
  const picked = variants[Math.floor(Math.random() * variants.length)];
  localStorage.setItem(key, picked);
  return picked;
}

async function sendEvent(payload: {
  experiment: string;
  variant: string;
  event: "impression" | "click" | "convert";
  path?: string;
  meta?: Record<string, unknown>;
}) {
  try {
    await fetch(`${API}/api/analytics/event`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, session_id: getOrCreateSession() }),
      keepalive: true,
    });
  } catch {
    // best-effort
  }
}

export function useABTest(experiment: string, variants: string[]) {
  const [variant, setVariant] = useState<string>(variants[0]);
  const impressionFired = useRef(false);

  useEffect(() => {
    const v = pickVariant(experiment, variants);
    setVariant(v);
    if (!impressionFired.current) {
      impressionFired.current = true;
      sendEvent({
        experiment,
        variant: v,
        event: "impression",
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experiment]);

  const track = (event: "click" | "convert", meta?: Record<string, unknown>) => {
    sendEvent({
      experiment,
      variant,
      event,
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
      meta,
    });
  };

  return { variant, track };
}

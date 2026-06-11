"use client";
import { useEffect, useRef } from "react";

/**
 * useAutosave — generic two-tier autosave hook.
 *
 *  - Writes a serialised snapshot of `data` to localStorage on every change
 *    (debounced to `localDebounceMs`, default 5s). Survives crashes, tab
 *    close, lost network — but is per-device.
 *
 *  - Optionally calls `remoteSave(data)` on a longer cadence (`remoteIntervalMs`,
 *    default 30s) when `enableRemote` is true. Use for logged-in users so
 *    the draft is also durable across devices.
 *
 *  - Safe across unmounts: the effect cleans timers but always flushes the
 *    local snapshot synchronously on `beforeunload` and `visibilitychange`.
 *
 *  - `key` is the localStorage key — namespace by feature, e.g.
 *    `"rp-autosave:invoice:new"` or `"rp-autosave:esign:wizard"`.
 *
 *  - `restore` is meant to be called once at component mount to read the
 *    previous draft (returns null if nothing saved). See helper at bottom.
 */
export interface AutosaveOptions<T> {
  key: string;
  data: T;
  enabled: boolean;
  localDebounceMs?: number;
  remoteIntervalMs?: number;
  enableRemote?: boolean;
  remoteSave?: (data: T) => Promise<void> | void;
}

export function useAutosave<T>(opts: AutosaveOptions<T>) {
  const {
    key, data, enabled,
    localDebounceMs = 5000,
    remoteIntervalMs = 30_000,
    enableRemote = false,
    remoteSave,
  } = opts;

  const dataRef = useRef(data);
  dataRef.current = data;

  const localTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remoteTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastRemoteSavedJson = useRef<string>("");

  // Flush local snapshot synchronously.
  const writeLocal = () => {
    if (typeof window === "undefined") return;
    try {
      const payload = { v: 1, ts: Date.now(), data: dataRef.current };
      window.localStorage.setItem(key, JSON.stringify(payload));
    } catch { /* quota / private mode — best-effort only */ }
  };

  // Save to server (skipped if data is identical to last successful save).
  const writeRemote = async () => {
    if (!enableRemote || !remoteSave) return;
    try {
      const json = JSON.stringify(dataRef.current);
      if (json === lastRemoteSavedJson.current) return;
      await remoteSave(dataRef.current);
      lastRemoteSavedJson.current = json;
    } catch { /* swallow — next tick retries */ }
  };

  // Local debounce.
  useEffect(() => {
    if (!enabled) return;
    if (localTimer.current) clearTimeout(localTimer.current);
    localTimer.current = setTimeout(writeLocal, localDebounceMs);
    return () => {
      if (localTimer.current) clearTimeout(localTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, enabled, key, localDebounceMs]);

  // Remote interval.
  useEffect(() => {
    if (!enabled || !enableRemote || !remoteSave) return;
    if (remoteTimer.current) clearInterval(remoteTimer.current);
    remoteTimer.current = setInterval(writeRemote, remoteIntervalMs);
    return () => {
      if (remoteTimer.current) clearInterval(remoteTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, enableRemote, remoteIntervalMs, key]);

  // Synchronous flush on tab close / hide.
  useEffect(() => {
    if (!enabled) return;
    const flush = () => { writeLocal(); /* fire-and-forget remote */ void writeRemote(); };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", flush);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key]);
}

/** Read a previously-saved draft from localStorage. Returns null on miss / parse error. */
export function readAutosave<T>(key: string): { ts: number; data: T } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return { ts: parsed.ts || 0, data: parsed.data as T };
  } catch {
    return null;
  }
}

/** Clear a draft (after user discards or after a successful Save). */
export function clearAutosave(key: string) {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(key); } catch { /* noop */ }
}

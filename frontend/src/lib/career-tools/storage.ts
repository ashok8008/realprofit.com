// localStorage utilities for Career Tools with optional server sync
// When a user is authenticated, data syncs to the backend.
// Anonymous users still get localStorage.

const STORAGE_PREFIX = 'realprofits_career_';
const API = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_BACKEND_URL : '';

// ---------- Server sync helpers ----------

async function serverSave(toolKey: string, data: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/user-data/${toolKey}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ tool_key: toolKey, data }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function serverLoad<T>(toolKey: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}/api/user-data/${toolKey}`, { credentials: "include" });
    if (!res.ok) return null;
    const result = await res.json();
    return result.data as T;
  } catch {
    return null;
  }
}

async function serverDelete(toolKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/user-data/${toolKey}`, { method: "DELETE", credentials: "include" });
    return res.ok;
  } catch {
    return false;
  }
}

async function isAuthenticated(): Promise<boolean> {
  try {
    const res = await fetch(`${API}/api/auth/me`, { credentials: "include" });
    return res.ok;
  } catch {
    return false;
  }
}

// ---------- Hybrid save/load ----------

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
  // Fire-and-forget server sync
  serverSave(key, data);
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }
  return defaultValue;
}

/**
 * Load data with server fallback. Tries localStorage first for instant UX,
 * then checks server for latest data (if authenticated).
 */
export async function loadFromStorageAsync<T>(key: string, defaultValue: T): Promise<T> {
  // Instant local read
  let local: T = defaultValue;
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (stored) local = JSON.parse(stored) as T;
  } catch (e) {
    console.warn("loadFromStorageAsync: localStorage read failed", e);
  }

  // Try server
  const serverData = await serverLoad<T>(key);
  if (serverData !== null) {
    // Server has data — update localStorage too
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(serverData));
    } catch (e) {
      console.warn("loadFromStorageAsync: localStorage write failed", e);
    }
    return serverData;
  }

  return local;
}

export function clearStorage(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (e) {
    console.warn('Failed to clear localStorage:', e);
  }
  serverDelete(key);
}

export function clearAllCareerStorage(): void {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.warn('Failed to clear all career storage:', e);
  }
}

/**
 * Sync all localStorage career data to server (called after login).
 */
export async function syncLocalToServer(): Promise<void> {
  const authed = await isAuthenticated();
  if (!authed) return;

  const items: { tool_key: string; data: unknown }[] = [];
  try {
    for (const fullKey of Object.keys(localStorage)) {
      if (fullKey.startsWith(STORAGE_PREFIX)) {
        const key = fullKey.slice(STORAGE_PREFIX.length);
        const raw = localStorage.getItem(fullKey);
        if (raw) {
          items.push({ tool_key: key, data: JSON.parse(raw) });
        }
      }
    }
  } catch (e) {
    console.warn("syncLocalToServer: failed to read localStorage", e);
  }

  if (items.length > 0) {
    try {
      await fetch(`${API}/api/user-data/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items }),
      });
    } catch (e) {
      console.warn("syncLocalToServer: bulk upload failed", e);
    }
  }
}

// ---------- Auto-save hook ----------

import { useEffect, useRef } from 'react';

export function useAutoSave<T>(key: string, data: T, delay: number = 1000): void {
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      saveToStorage(key, data);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, data, delay]);
}

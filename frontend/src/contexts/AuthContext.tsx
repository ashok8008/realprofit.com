"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { syncLocalToServer } from "@/lib/career-tools/storage";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

function formatApiError(detail: unknown): string {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e: Record<string, string>) => e?.msg || JSON.stringify(e)).filter(Boolean).join(" ");
  if (typeof detail === "object" && "msg" in (detail as Record<string, string>)) return (detail as Record<string, string>).msg;
  return String(detail);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/auth/me`, { credentials: "include" });
      if (res.ok) {
        setUser(await res.json());
      } else {
        // Try refreshing the token
        const refresh = await fetch(`${API}/api/auth/refresh`, { method: "POST", credentials: "include" });
        if (refresh.ok) {
          const meRes = await fetch(`${API}/api/auth/me`, { credentials: "include" });
          if (meRes.ok) setUser(await meRes.json());
        }
      }
    } catch (e) {
      console.warn("AuthContext: session check failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Background sliding refresh: while the user is logged in AND the tab is
  // visible, ping /api/auth/refresh every 10 minutes so the 60-min access
  // token (and 30-day refresh token) keep rolling forward. This prevents
  // active users from being kicked out mid-task.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      try {
        await fetch(`${API}/api/auth/refresh`, { method: "POST", credentials: "include" });
      } catch { /* silent — next tick will retry */ }
    };
    const id = setInterval(tick, 10 * 60 * 1000); // 10 minutes
    const onVis = () => { if (document.visibilityState === "visible") tick(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [user]);

  // Global listener: when API clients dispatch "auth:expired" (401 response),
  // clear local user and redirect to login preserving the current path.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onExpired = () => {
      setUser(null);
      const path = window.location.pathname + window.location.search;
      // Avoid redirect loops on public/auth pages.
      if (path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/forgot-password")) return;
      window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
    };
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(formatApiError(data.detail));
    }
    setUser(await res.json());
    syncLocalToServer(); // Sync existing localStorage data to server
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(formatApiError(data.detail));
    }
    setUser(await res.json());
    syncLocalToServer(); // Sync existing localStorage data to server
  };

  const logout = async () => {
    await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

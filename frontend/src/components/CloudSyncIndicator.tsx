"use client";
import React from "react";
import { Cloud, CloudOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function CloudSyncIndicator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-3 py-1 text-xs font-medium" data-testid="cloud-sync-indicator-on">
        <Cloud className="w-3.5 h-3.5" />
        <span>Synced to cloud</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-500 rounded-full px-3 py-1 text-xs font-medium" data-testid="cloud-sync-indicator-off">
      <CloudOff className="w-3.5 h-3.5" />
      <a href="/login" className="hover:text-teal-600 transition-colors">Sign in to sync</a>
    </div>
  );
}

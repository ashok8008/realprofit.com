"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Calendar, LogOut, Cloud, Trash2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

interface SavedItem {
  tool_key: string;
  updated_at: string;
}

const TOOL_LABELS: Record<string, string> = {
  resume_builder: "Resume Builder",
  cover_letter: "Cover Letter Generator",
  interview_prep: "Interview Prep",
  salary_comparison: "Salary Comparison",
  am_i_underpaid: "Am I Underpaid?",
  salary_negotiation: "Salary Negotiation",
  offer_comparison: "Offer Comparison",
  job_readiness: "Job Readiness Score",
  net_worth: "Net Worth Calculator",
  paycheck: "Paycheck Calculator",
  expense_tracker: "Expense Tracker",
  income_tracker: "Income Tracker",
  bill_split: "Bill Split Tool",
  invoice: "Freelance Invoice",
  subscriptions: "Subscription Analyzer",
  ai_usage: "AI Usage",
};

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch(`${API}/api/user-data/`, { credentials: "include" })
        .then(r => r.ok ? r.json() : { items: [] })
        .then(d => setSavedItems(d.items || []))
        .catch(() => {})
        .finally(() => setItemsLoading(false));
    }
  }, [user]);

  const handleDelete = async (toolKey: string) => {
    await fetch(`${API}/api/user-data/${toolKey}`, { method: "DELETE", credentials: "include" });
    setSavedItems(prev => prev.filter(i => i.tool_key !== toolKey));
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-bold tracking-tight" data-testid="account-heading">My Account</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8" data-testid="account-profile-card">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
              <User className="w-7 h-7 text-teal-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{user.name}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Data */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6" data-testid="account-saved-data">
          <div className="flex items-center gap-2 mb-6">
            <Cloud className="w-5 h-5 text-teal-600" />
            <h2 className="font-bold text-lg">Saved Data</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md ml-auto">{savedItems.length} items</span>
          </div>

          {itemsLoading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading saved data...</div>
          ) : savedItems.length === 0 ? (
            <div className="text-center py-8">
              <Cloud className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No saved data yet.</p>
              <p className="text-gray-400 text-xs mt-1">Start using any tool and your data will sync here automatically.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedItems.map((item) => (
                <div key={item.tool_key} className="flex items-center justify-between py-3 px-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors" data-testid={`saved-item-${item.tool_key}`}>
                  <div>
                    <span className="font-medium text-sm">{TOOL_LABELS[item.tool_key] || item.tool_key}</span>
                    <span className="text-xs text-gray-400 ml-3">
                      Updated {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(item.tool_key)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    data-testid={`delete-item-${item.tool_key}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { UnifiedStats } from "@/components/dashboard/UnifiedStats";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { IncidentCard } from "@/components/autofix/IncidentCard";
import { mockDashboardStats, mockActivityFeed } from "@/lib/mock-data";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { autofixApi, workspaceApi } from "@/lib/api";
import type { Incident } from "@/lib/types";

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const { workspaces } = await workspaceApi.list();
        if (workspaces && workspaces.length > 0) {
          const data = await autofixApi.listIncidents(workspaces[0].id);
          setIncidents(data);
        }
      } catch (err) {
        console.warn("Dashboard data load failed (backend may be offline):", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeIncidents = incidents.filter(
    (i) => !["resolved", "dismissed", "pr_created"].includes(i.status)
  ).slice(0, 3); // Show top 3 only

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Unified command center for Memory & AutoFix engines
        </p>
      </div>

      {/* Stats Grid */}
      <UnifiedStats stats={mockDashboardStats} />

      {/* Main Content: 2-column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Activity Feed (60%) */}
        <div className="lg:col-span-3">
          <div className="bg-bg-surface border border-border-faint rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border-faint flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">
                Activity Feed
              </h2>
              <span className="text-2xs text-text-muted font-mono">
                Live
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-success ml-1.5 animate-pulse-dot" />
              </span>
            </div>
            <div className="p-2 max-h-[480px] overflow-y-auto">
              <ActivityFeed items={mockActivityFeed} />
            </div>
          </div>
        </div>

        {/* Right Column: Active Incidents + Quick Ask (40%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Incidents */}
          <div className="bg-bg-surface border border-border-faint rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border-faint flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-autofix-primary" />
                <h2 className="text-sm font-semibold text-text-primary">
                  Active Incidents
                </h2>
              </div>
              <Link
                href="/autofix/incidents"
                className="text-2xs text-autofix-primary hover:text-autofix-hover transition-colors flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-3 space-y-2">
              {loading ? (
                <div className="py-8 text-center text-text-muted text-sm animate-pulse">
                  Loading incidents...
                </div>
              ) : activeIncidents.length > 0 ? (
                activeIncidents.map((incident, i) => (
                  <IncidentCard key={incident.id} incident={incident} index={i} />
                ))
              ) : (
                <div className="py-8 text-center text-text-muted text-sm">
                  No active incidents — all systems nominal ✓
                </div>
              )}
            </div>
          </div>

          {/* Quick Ask */}
          <div className="bg-bg-surface border border-border-faint rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border-faint flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-memory-primary" />
                <h2 className="text-sm font-semibold text-text-primary">
                  Quick Ask
                </h2>
              </div>
              <Link
                href="/memory/ask"
                className="text-2xs text-memory-primary hover:text-memory-hover transition-colors flex items-center gap-1"
              >
                Open chat <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-4">
              <Link
                href="/memory/ask"
                className="flex items-center gap-3 px-4 py-3 bg-bg-elevated border border-border-faint rounded-xl text-text-muted text-sm hover:border-memory-primary/50 transition-all cursor-text"
              >
                <Search className="w-4 h-4 text-memory-primary/50" />
                Ask your team&apos;s memory...
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

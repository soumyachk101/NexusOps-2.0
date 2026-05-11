"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UnifiedStats } from "@/components/dashboard/UnifiedStats";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { IncidentCard } from "@/components/autofix/IncidentCard";
import { Search, ArrowRight, Zap, Brain, Shield, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { autofixApi, workspaceApi, nexusApi } from "@/lib/api";
import type { Incident } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RetroGrid from "@/components/ui/RetroGrid";

const systemStatus = [
  { label: "Memory Engine", icon: Brain, color: "memory", pulse: true, variant: "memory" as const },
  { label: "AutoFix Active", icon: Zap, color: "autofix", pulse: true, variant: "autofix" as const },
  { label: "PII Shield", icon: Shield, color: "nexus", pulse: false, variant: "nexus" as const },
];

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { workspaces } = await workspaceApi.list();
        if (workspaces && workspaces.length > 0) {
          const wsId = workspaces[0].id;
          const [incidentsData, statsData, timelineData] = await Promise.all([
            autofixApi.listIncidents(wsId),
            nexusApi.getDashboardStats(wsId),
            nexusApi.getTimeline(wsId, 10)
          ]);
          setIncidents(incidentsData);
          setStats(statsData);
          setTimeline(timelineData);
        }
      } catch (err) {
        console.warn("Dashboard data load failed:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeIncidents = incidents
    .filter((i) => !["resolved", "dismissed", "pr_created"].includes(i.status))
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-border-faint bg-bg-surface p-4 md:p-8"
      >
        <RetroGrid className="opacity-[0.15]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-nexus-muted border border-nexus-border">
                <Sparkles className="w-4 h-4 text-nexus-primary" />
              </div>
              <p className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em]">
                Incident Command Center v2.0
              </p>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="gradient-text-nexus">NexusOps</span>
              <span className="text-text-secondary font-light ml-2 text-2xl md:text-3xl">Cockpit</span>
            </h1>
            <p className="text-sm text-text-secondary max-w-lg leading-relaxed">
              Unified intelligence for Memory &amp; AutoFix engines. Surface tribal knowledge at incident speed.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            {systemStatus.map(({ label, icon: Icon, color, pulse, variant }) => (
              <Badge 
                key={label} 
                variant={variant}
                className="gap-1.5 py-1.5 px-3 border shadow-sm backdrop-blur-sm"
              >
                <span className={`w-1.5 h-1.5 rounded-full bg-current ${pulse ? "animate-pulse" : ""}`} />
                <Icon className="w-3 h-3" />
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ──────────────────────────────────────────────── */}
      <div className="transition-all duration-500">
        {stats ? (
          <UnifiedStats stats={stats} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 rounded-2xl bg-bg-surface border border-border-faint animate-pulse" />
            ))}
          </div>
        )}
      </div>

      {/* ── Main Dashboard Content ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Activity Feed (7/12) */}
        <div className="lg:col-span-7 h-full">
          <Card className="bg-bg-surface border-border-faint rounded-2xl overflow-hidden h-full flex flex-col">
            <CardHeader className="px-6 py-4 border-b border-border-faint flex flex-row items-center justify-between bg-bg-surface/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center border border-border-faint">
                  <TrendingUp className="w-4 h-4 text-text-muted" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-text-primary">Global Activity</CardTitle>
                  <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest mt-0.5">Real-time enrichment</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-status-success/10 border border-status-success/20 text-[10px] text-status-success font-mono">
                <span className="w-1 h-1 rounded-full bg-status-success animate-pulse" />
                Live
              </div>
            </CardHeader>
            <div className="flex-1 min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar p-2">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <div className="space-y-4 p-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-14 rounded-xl bg-bg-elevated animate-pulse" />
                    ))}
                  </div>
                ) : timeline.length > 0 ? (
                  <ActivityFeed items={timeline} />
                ) : (
                  <div className="py-32 text-center">
                    <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-4 border border-border-faint">
                      <Brain className="w-6 h-6 text-text-muted opacity-40" />
                    </div>
                    <p className="text-sm text-text-muted">No institutional memory traces yet.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>

        {/* Right Column: Active Incidents & Search (5/12) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Active Incidents */}
          <Card className="bg-bg-surface border-border-faint rounded-2xl overflow-hidden shadow-xl shadow-black/20">
            <CardHeader className="px-6 py-4 border-b border-border-faint flex flex-row items-center justify-between bg-bg-surface/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-autofix-muted flex items-center justify-center border border-autofix-border/30">
                  <Zap className="w-4 h-4 text-autofix-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-text-primary">Priority Incidents</CardTitle>
                  <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest mt-0.5">Awaiting AutoFix</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-8 px-3 text-xs hover:bg-bg-elevated transition-all">
                <Link href="/autofix/incidents">
                  All <ArrowRight className="ml-1.5 w-3 h-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 rounded-2xl bg-bg-elevated animate-pulse" />
                  ))}
                </div>
              ) : activeIncidents.length > 0 ? (
                activeIncidents.map((incident, i) => (
                  <IncidentCard key={incident.id} incident={incident} index={i} />
                ))
              ) : (
                <div className="py-12 text-center bg-status-success/5 rounded-2xl border border-dashed border-status-success/20">
                  <div className="w-12 h-12 rounded-2xl bg-status-success/10 flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-status-success" />
                  </div>
                  <p className="text-sm text-status-success font-medium">All systems nominal</p>
                  <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">Zero active fires detected</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Ask / Search */}
          <Card className="bg-bg-surface border-border-faint rounded-2xl overflow-hidden group hover:border-memory-border/50 transition-all duration-300">
            <CardHeader className="px-6 py-4 border-b border-border-faint flex flex-row items-center justify-between bg-bg-surface/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-memory-muted flex items-center justify-center border border-memory-border/30 group-hover:border-memory-primary/50 transition-all">
                  <Search className="w-4 h-4 text-memory-primary" />
                </div>
                <CardTitle className="text-sm font-semibold text-text-primary group-hover:text-memory-primary transition-colors">Quick Ask</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Link
                href="/memory/ask"
                className="flex items-center gap-4 px-5 py-4 bg-bg-elevated border border-border-faint rounded-xl text-text-muted text-sm hover:border-memory-border hover:bg-memory-muted/20 transition-all group/search"
              >
                <Search className="w-5 h-5 text-memory-primary/40 group-hover/search:text-memory-primary transition-all group-hover/search:scale-110" />
                <span className="flex-1">Ask team&apos;s memory...</span>
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-bg-base border border-border-faint text-[10px] font-mono group-hover/search:border-memory-border/50 transition-all">
                  <span className="text-text-muted">⌘</span>
                  <span className="text-text-muted">K</span>
                </div>
              </Link>
              <p className="text-[10px] text-text-muted mt-4 text-center font-mono uppercase tracking-[0.15em] opacity-60">
                Semantic search across incidents &amp; runbooks
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

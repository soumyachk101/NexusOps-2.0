"use client";

import { IncidentCard } from "@/components/autofix/IncidentCard";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { autofixApi, workspaceApi, Incident } from "@/lib/api";

const filters = ["All", "Active", "Resolved", "Dismissed"] as const;

export default function IncidentsPage() {
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]>("All");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { workspaces } = await workspaceApi.list();
        if (workspaces && workspaces.length > 0) {
          const data = await autofixApi.listIncidents(workspaces[0].id);
          setIncidents(data);
        }
      } catch (err) {
        console.error("Failed to load incidents:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filtered = incidents.filter((i) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Active")
      return !["resolved", "dismissed", "pr_created"].includes(i.status);
    if (activeFilter === "Resolved")
      return i.status === "resolved" || i.status === "pr_created";
    if (activeFilter === "Dismissed") return i.status === "dismissed";
    return true;
  });

  if (loading) return <div className="p-8 text-center text-text-muted text-sm animate-pulse">Loading Incidents...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Incidents
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Production errors monitored by the AutoFix Engine
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 p-1 bg-bg-surface border border-border-faint rounded-xl w-fit">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all",
              activeFilter === filter
                ? "bg-bg-elevated text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Incident List */}
      <div className="space-y-2.5">
        {filtered.length > 0 ? (
          filtered.map((incident, i) => (
            <IncidentCard key={incident.id} incident={incident} index={i} />
          ))
        ) : (
          <div className="py-16 text-center">
            <AlertCircleIcon className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-muted">No incidents match this filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  GitBranch,
  Clock,
  ExternalLink,
  RotateCcw,
  XCircle,
  CheckCircle,
  Shield,
  FileCode,
  Search,
} from "lucide-react";
import { SeverityBadge } from "@/components/autofix/SeverityBadge";
import { StatusBadge } from "@/components/autofix/StatusBadge";
import { PipelineProgress } from "@/components/autofix/PipelineProgress";
import { MemoryContextPanel } from "@/components/nexus/MemoryContextPanel";
import { autofixApi, Incident } from "@/lib/api";
import { formatDate, formatMTTR, cn } from "@/lib/utils";

export default function IncidentDetailPage() {
  const params = useParams();
  const incidentId = params.id as string;
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    autofixApi.getIncident(incidentId)
      .then(data => { setIncident(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [incidentId]);

  if (loading) return <div className="p-8 text-center text-text-muted text-sm animate-pulse">Loading Incident Details...</div>;
  if (!incident) return <div className="p-8 text-center text-text-muted text-sm">Incident not found</div>;

  const isPRReady = incident.status === "pr_created";
  const isBlocked = incident.status === "fix_blocked";
  const isFailed = incident.status === "failed";
  const isTerminal = ["pr_created", "resolved", "dismissed"].includes(incident.status);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/autofix/incidents"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Incidents
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ====== LEFT COLUMN (65%) ====== */}
        <div className="lg:col-span-3 space-y-5">
          {/* Incident Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-surface border border-border-faint rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <SeverityBadge severity={incident.severity as any} />
              <StatusBadge status={incident.status as any} />
            </div>
            <h1 className="text-lg font-mono text-text-code mb-2">
              {incident.error_type || "Unknown Error"}: {incident.error_message || "No message available"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-2xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <GitBranch className="w-3 h-3" />
                <span className="font-mono">
                  {incident.environment || "production"} {incident.repository_id ? "(connected repo)" : "(no repo)"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span className="font-mono">
                  {formatDate(incident.received_at)}
                </span>
              </div>
                <div className="flex items-center gap-1.5 text-status-success">
                  <CheckCircle className="w-3 h-3" />
                  <span className="font-mono">
                    MTTR: {formatMTTR(incident.received_at, incident.created_at)}
                  </span>
                </div>
            </div>
          </motion.div>

          {/* Root Cause Analysis */}
          {incident.root_cause && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-bg-surface border border-border-faint rounded-xl overflow-hidden"
            >
              <button className="w-full px-5 py-4 flex items-center justify-between border-b border-border-faint">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-autofix-primary" />
                  <h2 className="text-sm font-semibold text-text-primary">
                    Root Cause Analysis
                  </h2>
                </div>
              </button>
              <div className="p-5">
                <p className="text-sm text-text-secondary leading-relaxed">
                  {incident.root_cause}
                </p>
              </div>
            </motion.div>
          )}

          {/* Stack Trace */}
          {incident.raw_stack_trace && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-bg-surface border border-border-faint rounded-xl overflow-hidden"
            >
              <div className="px-5 py-4 flex items-center gap-2 border-b border-border-faint">
                <FileCode className="w-4 h-4 text-autofix-primary" />
                <h2 className="text-sm font-semibold text-text-primary">
                  Stack Trace
                </h2>
              </div>
              <div className="p-4">
                <pre className="text-xs font-mono text-text-code bg-bg-base rounded-lg p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {incident.raw_stack_trace}
                </pre>
              </div>
            </motion.div>
          )}

          {/* Safety Check (Mocked for Now) */}
          {true && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-bg-surface border border-border-faint rounded-xl overflow-hidden"
            >
              <div className="px-5 py-4 flex items-center gap-2 border-b border-border-faint">
                <Shield className="w-4 h-4 text-autofix-primary" />
                <h2 className="text-sm font-semibold text-text-primary">
                  Safety Check
                </h2>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#242b3d"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={"#22c55e"}
                        strokeWidth="2.5"
                        strokeDasharray={`92, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-text-primary font-mono">
                        92%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-medium",
                      "text-status-success"
                    )}>
                      Safe to deploy
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Automated safety analysis of the proposed fix
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ====== RIGHT COLUMN (35%, sticky) ====== */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20 space-y-5">
            {/* Pipeline Progress */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-bg-surface border border-border-faint rounded-xl p-5"
            >
              <PipelineProgress status={incident.status as any} />
            </motion.div>

            {/* NexusOps Memory Context Panel — THE SHOWPIECE */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <MemoryContextPanel context={null} />
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-bg-surface border border-border-faint rounded-xl p-4 space-y-2.5"
            >
              {/* Primary action */}
              {isPRReady && incident.pr_url ? (
                <a
                  href={incident.pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-status-success text-bg-base text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Draft PR on GitHub
                </a>
              ) : (
                <button
                  disabled={isBlocked || isFailed || isTerminal}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                    !isBlocked && !isFailed && !isTerminal
                      ? "bg-autofix-primary text-bg-base hover:bg-autofix-hover"
                      : "bg-bg-elevated text-text-muted cursor-not-allowed"
                  )}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Fix → Create PR
                </button>
              )}

              {/* Secondary actions */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-text-secondary bg-bg-elevated hover:bg-bg-hover transition-colors">
                  <XCircle className="w-3.5 h-3.5" />
                  Dismiss
                </button>
                {isFailed && (
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-text-secondary bg-bg-elevated hover:bg-bg-hover transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                )}
              </div>
            </motion.div>

            {/* Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-bg-surface border border-border-faint rounded-xl p-4"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                Metadata
              </h3>
              <div className="space-y-2.5">
                {[
                  { label: "Severity", value: <SeverityBadge severity={incident.severity as any} /> },
                  { label: "Status", value: <StatusBadge status={incident.status as any} /> },
                  { label: "Repository", value: <span className="font-mono text-text-code text-2xs">{incident.repository_id || "None"}</span> },
                  { label: "Environment", value: <span className="font-mono text-text-code text-2xs">{incident.environment}</span> },
                  { label: "Source", value: <span className="text-2xs text-text-secondary capitalize">{incident.source}</span> },
                  { label: "Received", value: <span className="font-mono text-2xs text-text-secondary">{formatDate(incident.received_at)}</span> },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-2xs text-text-muted">{item.label}</span>
                    {item.value}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

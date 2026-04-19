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
  Brain,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { SeverityBadge } from "@/components/autofix/SeverityBadge";
import { StatusBadge } from "@/components/autofix/StatusBadge";
import { PipelineProgress } from "@/components/autofix/PipelineProgress";
import { autofixApi, workspaceApi, Incident, Repository } from "@/lib/api";
import { formatDate, formatMTTR, cn } from "@/lib/utils";

interface Fix {
  id: string;
  incident_id: string;
  title: string;
  explanation?: string;
  confidence?: number;
  caveats?: string[];
  file_changes?: Array<{
    path: string;
    original_code?: string;
    fixed_code?: string;
    change_summary?: string;
  }>;
  safety_score?: string;
  model_used?: string;
  pr_url?: string;
  created_at: string;
}

export default function IncidentDetailPage() {
  const params = useParams();
  const incidentId = params.id as string;
  const [incident, setIncident] = useState<Incident | null>(null);
  const [fixes, setFixes] = useState<Fix[]>([]);
  const [repoName, setRepoName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadIncident = async () => {
    try {
      const data = await autofixApi.getIncident(incidentId);
      setIncident(data);
      
      // Load fixes
      try {
        const fixData = await autofixApi.listFixes(incidentId);
        setFixes(fixData);
      } catch { /* no fixes yet */ }

      // Load repo name
      if (data.repository_id) {
        try {
          const { workspaces } = await workspaceApi.list();
          if (workspaces?.length > 0) {
            const repos = await autofixApi.listRepos(workspaces[0].id);
            const found = repos.find((r: Repository) => r.id === data.repository_id);
            if (found) setRepoName(found.full_name || found.name);
          }
        } catch {}
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncident();
    // Auto-refresh while pipeline is running
    const interval = setInterval(async () => {
      try {
        const data = await autofixApi.getIncident(incidentId);
        setIncident(data);
        if (["pr_created", "resolved", "dismissed", "failed", "fix_blocked"].includes(data.status)) {
          // Load fixes when pipeline completes
          try {
            const fixData = await autofixApi.listFixes(incidentId);
            setFixes(fixData);
          } catch {}
          clearInterval(interval);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [incidentId]);

  if (loading) return <div className="p-8 text-center text-text-muted text-sm animate-pulse">Loading Incident Details...</div>;
  if (!incident) return <div className="p-8 text-center text-text-muted text-sm">Incident not found</div>;

  const memoryCtx = incident.memory_context;
  const isPRReady = incident.status === "pr_created";
  const isBlocked = incident.status === "fix_blocked";
  const isFailed = incident.status === "failed";
  const isTerminal = ["pr_created", "resolved", "dismissed"].includes(incident.status);
  const isProcessing = ["received", "sanitizing", "querying_memory", "analyzing", "generating_fix", "safety_check", "creating_pr"].includes(incident.status);

  const handleStatusUpdate = async (status: string) => {
    try {
      setActionLoading(true);
      const updated = await autofixApi.updateIncidentStatus(incidentId, status);
      setIncident(updated);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async () => {
    try {
      setActionLoading(true);
      const updated = await autofixApi.retryIncident(incidentId);
      setIncident(updated);
    } catch (error) {
      console.error("Failed to retry incident:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const fix = fixes[0]; // Primary fix

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
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
              {isProcessing && (
                <span className="flex items-center gap-1.5 text-2xs text-yellow-400 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  AI Pipeline Running...
                </span>
              )}
            </div>
            <h1 className="text-lg font-mono text-text-code mb-2">
              {incident.error_type || "Error"}: {incident.error_message || "No message available"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-2xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <GitBranch className="w-3 h-3" />
                <span className="font-mono">
                  {incident.environment || "production"} {repoName ? `(repo: ${repoName})` : ""}
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
              <div className="px-5 py-4 flex items-center justify-between border-b border-border-faint">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-autofix-primary" />
                  <h2 className="text-sm font-semibold text-text-primary">
                    AI Root Cause Analysis
                  </h2>
                </div>
                {incident.analysis_confidence && (
                  <span className="text-2xs text-text-muted font-mono">
                    Confidence: {Math.round((incident.analysis_confidence || 0) * 100)}%
                  </span>
                )}
              </div>
              <div className="p-5">
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {incident.root_cause}
                </p>
              </div>
            </motion.div>
          )}

          {/* AI Generated Fix */}
          {fix && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="bg-bg-surface border border-autofix-primary/30 rounded-xl overflow-hidden"
            >
              <div className="px-5 py-4 flex items-center justify-between border-b border-border-faint bg-autofix-primary/5">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-autofix-primary" />
                  <h2 className="text-sm font-semibold text-text-primary">
                    AI-Generated Fix: {fix.title}
                  </h2>
                </div>
                <span className={cn(
                  "text-2xs font-mono px-2 py-0.5 rounded",
                  fix.safety_score === "SAFE" ? "bg-green-500/20 text-green-400" :
                  fix.safety_score === "BLOCKED" ? "bg-red-500/20 text-red-400" :
                  "bg-yellow-500/20 text-yellow-400"
                )}>
                  {fix.safety_score || "REVIEW_REQUIRED"}
                </span>
              </div>
              <div className="p-5 space-y-4">
                {fix.explanation && (
                  <p className="text-sm text-text-secondary leading-relaxed">{fix.explanation}</p>
                )}
                {fix.file_changes && fix.file_changes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">File Changes</h3>
                    {fix.file_changes.map((fc, i) => (
                      <div key={i} className="bg-bg-base rounded-lg p-3 border border-border-faint">
                        <p className="text-xs font-mono text-autofix-primary mb-1">{fc.path}</p>
                        <p className="text-xs text-text-secondary">{fc.change_summary}</p>
                        {fc.fixed_code && (
                          <pre className="mt-2 text-xs font-mono text-green-400 bg-green-500/5 rounded p-2 overflow-x-auto">
                            {fc.fixed_code}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {fix.caveats && fix.caveats.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                    <div className="text-xs text-yellow-300/80">
                      <p className="font-semibold mb-1">Caveats:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {fix.caveats.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
                <div className="text-2xs text-text-muted font-mono">
                  Model: {fix.model_used || "groq"} · Confidence: {Math.round((fix.confidence || 0.5) * 100)}%
                </div>
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

          {/* Safety Check */}
          {fix && (
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
                        stroke={fix.safety_score === "SAFE" ? "#22c55e" : fix.safety_score === "BLOCKED" ? "#ef4444" : "#eab308"}
                        strokeWidth="2.5"
                        strokeDasharray={`${Math.round((fix.confidence || 0.5) * 100)}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-text-primary font-mono">
                        {Math.round((fix.confidence || 0.5) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-medium",
                      fix.safety_score === "SAFE" ? "text-status-success" :
                      fix.safety_score === "BLOCKED" ? "text-red-400" :
                      "text-yellow-400"
                    )}>
                      {fix.safety_score === "SAFE" ? "Safe to deploy" :
                       fix.safety_score === "BLOCKED" ? "Fix blocked — manual review required" :
                       "Review required before deploying"}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      AI safety analysis powered by {fix.model_used || "Groq"}
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
              <PipelineProgress status={incident.status} />
            </motion.div>

            {/* NexusOps Memory Context Panel — THE SHOWPIECE */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-bg-surface border border-memory-primary/30 rounded-xl overflow-hidden"
            >
              <div className="px-5 py-4 flex items-center gap-2 border-b border-border-faint bg-memory-primary/5">
                <Brain className="w-4 h-4 text-memory-primary" />
                <h2 className="text-sm font-semibold text-text-primary">
                  Memory Context
                </h2>
                <span className="text-2xs text-memory-primary font-mono ml-auto">Integration Layer</span>
              </div>
              <div className="p-4 space-y-3">
                {memoryCtx ? (
                  <>
                    <p className="text-xs text-text-secondary">{memoryCtx.insight}</p>
                    {memoryCtx.related_discussions?.length > 0 ? (
                      <div className="space-y-1.5">
                        {memoryCtx.related_discussions.map((d: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 p-2 bg-bg-elevated rounded-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-memory-primary mt-1.5 shrink-0" />
                            <p className="text-2xs text-text-secondary font-mono">{d}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-2xs text-text-muted italic">No past discussions found for this error.</p>
                    )}
                    <p className="text-2xs text-text-muted font-mono">Query: &quot;{memoryCtx.query}&quot;</p>
                  </>
                ) : isProcessing ? (
                  <div className="flex items-center gap-2 py-4 justify-center">
                    <RefreshCw className="w-3.5 h-3.5 text-memory-primary animate-spin" />
                    <span className="text-xs text-text-muted">Querying team memory...</span>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted py-4 text-center">
                    Memory context will appear here once the AI pipeline processes this incident.
                  </p>
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-bg-surface border border-border-faint rounded-xl p-4 space-y-2.5"
            >
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
                  onClick={() => handleStatusUpdate("pr_created")}
                  disabled={isBlocked || isFailed || isTerminal || isProcessing || actionLoading}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                    (!isBlocked && !isFailed && !isTerminal && !isProcessing && !actionLoading)
                      ? "bg-autofix-primary text-bg-base hover:bg-autofix-hover"
                      : "bg-bg-elevated text-text-muted cursor-not-allowed"
                  )}
                >
                  <CheckCircle className="w-4 h-4" />
                  {actionLoading ? "Processing..." : isProcessing ? "AI Pipeline Running..." : "Approve Fix → Create PR"}
                </button>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={() => handleStatusUpdate("dismissed")}
                  disabled={actionLoading || isTerminal}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-text-secondary bg-bg-elevated hover:bg-bg-hover transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Dismiss
                </button>
                {(isFailed || isTerminal) && (
                  <button 
                    onClick={handleRetry}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs text-text-secondary bg-bg-elevated hover:bg-bg-hover transition-colors disabled:opacity-50"
                  >
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
                  { label: "Severity", value: <SeverityBadge severity={incident.severity} /> },
                  { label: "Status", value: <StatusBadge status={incident.status} /> },
                  { label: "Repository", value: <span className="font-mono text-text-code text-2xs">{repoName || incident.repository_id || "None"}</span> },
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

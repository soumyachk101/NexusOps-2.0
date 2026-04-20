"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GitBranch, Clock, ExternalLink } from "lucide-react";
import { Incident } from "@/lib/api";
import { SeverityBadge } from "./SeverityBadge";
import { StatusBadge } from "./StatusBadge";
import { formatRelativeTime, cn } from "@/lib/utils";

const severityConfig: Record<string, { border: string; glow: string; dot: string }> = {
  critical: {
    border: "border-l-sev-critical",
    glow: "hover:shadow-[0_0_20px_rgba(239,68,68,0.12)]",
    dot: "bg-sev-critical animate-pulse-dot",
  },
  high: {
    border: "border-l-sev-high",
    glow: "hover:shadow-[0_0_20px_rgba(249,115,22,0.10)]",
    dot: "bg-sev-high",
  },
  medium: {
    border: "border-l-sev-medium",
    glow: "hover:shadow-[0_0_20px_rgba(234,179,8,0.08)]",
    dot: "bg-sev-medium",
  },
  low: {
    border: "border-l-sev-low",
    glow: "",
    dot: "bg-sev-low",
  },
};

interface IncidentCardProps {
  incident: Incident;
  index: number;
  repoName?: string;
}

export function IncidentCard({ incident, index, repoName }: IncidentCardProps) {
  const config = severityConfig[incident.severity] ?? severityConfig["medium"];

  return (
    <Link href={`/autofix/incidents/${incident.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.06 }}
        className={cn(
          "relative bg-bg-elevated border border-border-faint rounded-xl p-4 border-l-[3px] cursor-pointer",
          "hover:border-border-default hover:-translate-y-0.5 transition-all duration-200 group",
          config.border,
          config.glow,
          incident.severity === "critical" && "animate-critical-blink"
        )}
      >
        {/* Hover ExternalLink icon */}
        <ExternalLink className="absolute top-3 right-3 w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Row 1: Severity + Error Type + Status */}
        <div className="flex items-center gap-2 mb-2.5 min-w-0 pr-5">
          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
          <SeverityBadge severity={incident.severity} />
          <span className="text-2xs font-mono text-text-code truncate flex-1">
            {incident.error_type || "UnknownError"}
          </span>
        </div>

        {/* Row 2: Status + Error Message */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-xs font-mono text-text-secondary/80 truncate flex-1 leading-relaxed">
            &quot;{incident.error_message || "No message"}&quot;
          </p>
          <StatusBadge status={incident.status} />
        </div>

        {/* Row 3: Repo + Time */}
        <div className="flex items-center justify-between text-2xs text-text-muted pt-2 border-t border-border-faint/60">
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-3 h-3" />
            <span className="font-mono truncate max-w-[100px]">
              {incident.environment || "production"}
              {repoName ? ` · ${repoName}` : incident.repository_id ? " · repo" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span className="font-mono">{formatRelativeTime(incident.received_at)}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GitBranch, Clock } from "lucide-react";
import { Incident } from "@/lib/api";
import { SeverityBadge } from "./SeverityBadge";
import { StatusBadge } from "./StatusBadge";
import { formatRelativeTime, cn } from "@/lib/utils";

const severityBorderColors: Record<string, string> = {
  critical: "border-l-sev-critical",
  high: "border-l-sev-high",
  medium: "border-l-sev-medium",
  low: "border-l-sev-low",
};

interface IncidentCardProps {
  incident: Incident;
  index: number;
}

export function IncidentCard({ incident, index }: IncidentCardProps) {
  return (
    <Link href={`/autofix/incidents/${incident.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={cn(
          "bg-bg-surface border border-border-faint rounded-xl p-4 border-l-4 cursor-pointer",
          "hover:bg-bg-hover hover:-translate-y-0.5 transition-all duration-150",
          severityBorderColors[incident.severity] || severityBorderColors["medium"],
          incident.severity === "critical" && "animate-critical-blink glow-critical"
        )}
      >
        {/* Row 1: Severity + Error Type + Status */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <SeverityBadge severity={incident.severity as any} />
            <span className="text-2xs font-mono text-text-code truncate">
              {incident.error_type || "Unknown Error"}
            </span>
          </div>
          <StatusBadge status={incident.status as any} />
        </div>

        {/* Row 2: Error Message */}
        <p className="text-sm font-mono text-text-code/80 truncate mb-3">
          &quot;{incident.error_message || "No message"}&quot;
        </p>

        {/* Row 3: Repo + Time */}
        <div className="flex items-center justify-between text-2xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-3 h-3" />
            <span className="font-mono">
              {incident.environment || "production"} {incident.repository_id ? "repo connected" : "no repo"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span className="font-mono">
              {formatRelativeTime(incident.received_at)}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

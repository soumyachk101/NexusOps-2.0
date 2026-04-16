"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatRelativeTime, cn } from "@/lib/utils";
import {
  MessageCircle,
  Mic,
  FileText,
  Edit3,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
} from "lucide-react";
import { memoryApi, workspaceApi, Source } from "@/lib/api";

const typeIcons: Record<string, React.ElementType> = {
  telegram_message: MessageCircle,
  voice_note: Mic,
  document: FileText,
  manual: Edit3,
  incident_fix: CheckCircle,
};

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  processed: { icon: CheckCircle, color: "text-status-success", label: "Processed" },
  active: { icon: CheckCircle, color: "text-status-success", label: "Active" },
  processing: { icon: Loader2, color: "text-autofix-primary", label: "Processing" },
  syncing: { icon: Loader2, color: "text-autofix-primary", label: "Syncing" },
  pending: { icon: Loader2, color: "text-autofix-primary", label: "Pending" },
  failed: { icon: AlertCircle, color: "text-status-error", label: "Error" },
  error: { icon: AlertCircle, color: "text-status-error", label: "Error" },
};

export default function MemorySourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSources() {
      try {
        const { workspaces } = await workspaceApi.list();
        if (workspaces.length > 0) {
          const data = await memoryApi.listSources(workspaces[0].id);
          setSources(data);
        }
      } catch (error) {
        console.error("Failed to load sources:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSources();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Sources
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Connected data sources feeding into team memory
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-memory-primary text-bg-base rounded-lg text-sm font-medium hover:bg-memory-hover transition-colors">
          <Upload className="w-4 h-4" />
          Add Source
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-bg-surface border border-border-faint rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sources.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border-default rounded-2xl">
          <FileText className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No sources connected yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((source, index) => {
            const TypeIcon = typeIcons[source.source_type] || FileText;
            const status = statusConfig[source.status] || statusConfig.pending;
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-bg-surface border border-border-faint rounded-xl p-5 hover:border-memory-border transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-memory-muted border border-memory-border flex items-center justify-center">
                    <TypeIcon className="w-5 h-5 text-memory-primary" />
                  </div>
                  <div className={cn("flex items-center gap-1.5", status.color)}>
                    <StatusIcon className={cn("w-3.5 h-3.5", (source.status === "syncing" || source.status === "processing") && "animate-spin")} />
                    <span className="text-2xs font-medium">{status.label}</span>
                  </div>
                </div>

                <h3 className="text-sm font-medium text-text-primary group-hover:text-memory-primary transition-colors">
                  {source.name || source.source_type}
                </h3>

                <div className="mt-3 flex items-center justify-between text-2xs text-text-muted">
                  <span className="font-mono text-nexus-primary/70">
                    {source.source_type}
                  </span>
                  <span className="font-mono">
                    {formatRelativeTime(source.created_at)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1 bg-bg-base rounded-full overflow-hidden">
                  <div className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    source.status === "processed" || source.status === "active" ? "bg-status-success w-full" : "bg-memory-primary/40 w-1/2"
                  )} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

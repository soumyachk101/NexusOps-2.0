"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface MemoryContextData {
  related_discussions: string[];
  query: string;
  matches_found: number;
  insight: string;
}

interface MemoryContextPanelProps {
  context: MemoryContextData | null | undefined;
  loading?: boolean;
}

function SkeletonPanel() {
  return (
    <div className="bg-nexus-muted border border-nexus-border rounded-xl p-5 border-l-[3px] border-l-nexus-primary">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 rounded bg-nexus-primary/20 animate-pulse" />
        <div className="h-4 w-36 rounded bg-nexus-primary/10 animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-nexus-primary/5 animate-pulse" />
        <div className="h-3 w-4/5 rounded bg-nexus-primary/5 animate-pulse" />
        <div className="h-3 w-3/5 rounded bg-nexus-primary/5 animate-pulse" />
      </div>
    </div>
  );
}

export function MemoryContextPanel({ context, loading }: MemoryContextPanelProps) {
  if (loading) return <SkeletonPanel />;

  if (!context || context.matches_found === 0) {
    return (
      <div className="border border-border-faint rounded-xl p-4">
        <div className="flex items-center gap-2 text-text-muted">
          <Brain className="w-4 h-4" />
          <span className="text-xs">No related team discussions found in memory.</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-nexus-muted border border-nexus-border rounded-xl p-5 border-l-[3px] border-l-nexus-primary"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-nexus-primary/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-nexus-primary" />
          </div>
          <h3 className="text-sm font-semibold text-nexus-primary">
            Team Memory Context
          </h3>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold text-nexus-primary bg-nexus-primary/10 border border-nexus-border">
          NexusOps
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-text-primary/90 leading-relaxed mb-4">
        {context.insight}
      </p>

      {/* Memory Chunks */}
      <div className="space-y-2.5">
        {context.related_discussions.map((discussion: string, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
            className="bg-bg-elevated border border-border-faint rounded-lg p-3.5"
          >
            <p className="text-sm text-text-primary/80 leading-relaxed">
              {discussion}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

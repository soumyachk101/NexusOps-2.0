"use client";

import { motion } from "framer-motion";

import { formatRelativeTime, cn } from "@/lib/utils";
import {
  ArrowUpCircle,
  ArrowRightCircle,
  ArrowDownCircle,
  ExternalLink,
} from "lucide-react";

const priorityConfig = {
  high: { icon: ArrowUpCircle, color: "text-sev-high", label: "High" },
  medium: { icon: ArrowRightCircle, color: "text-sev-medium", label: "Medium" },
  low: { icon: ArrowDownCircle, color: "text-sev-low", label: "Low" },
};

const statusConfig = {
  detected: { color: "bg-autofix-primary/10 text-autofix-primary border-autofix-border", label: "Detected" },
  confirmed: { color: "bg-memory-primary/10 text-memory-primary border-memory-border", label: "Confirmed" },
  synced_to_jira: { color: "bg-nexus-primary/10 text-nexus-primary border-nexus-border", label: "Synced to Jira" },
  dismissed: { color: "bg-status-neutral/10 text-status-neutral border-border-default", label: "Dismissed" },
};

import { useEffect, useState } from "react";
import { memoryApi, workspaceApi, Task } from "@/lib/api";

export default function MemoryTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { workspaces } = await workspaceApi.list();
        if (workspaces && workspaces.length > 0) {
          const data = await memoryApi.listTasks(workspaces[0].id);
          setTasks(data);
        }
      } catch (err) {
        console.error("Failed to load tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center text-text-muted text-sm animate-pulse">Loading Tasks...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Detected Tasks
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Tasks automatically detected from team conversations
        </p>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task, index) => {
          const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
          const PriorityIcon = priority.icon;
          const status = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.detected;

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-bg-surface border border-border-faint rounded-xl p-5 hover:border-border-default transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <PriorityIcon className={cn("w-5 h-5 shrink-0 mt-0.5", priority.color)} />
                  <div>
                    <h3 className="text-sm font-medium text-text-primary">
                      {task.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      {task.description}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-medium border shrink-0",
                    status.color
                  )}
                >
                  {status.label}
                </span>
              </div>

              {/* Source message */}
              <div className="ml-8 bg-bg-elevated rounded-lg p-3 border border-border-faint">
                <p className="text-xs text-text-secondary italic font-mono leading-relaxed">
                  &ldquo;{task.source_preview}&rdquo;
                </p>
              </div>

              {/* Footer */}
              <div className="ml-8 mt-3 flex items-center justify-between text-2xs text-text-muted">
                <div className="flex items-center gap-3">
                  {task.assignee_hint && (
                    <span>Assignee: <span className="text-text-secondary">{task.assignee_hint}</span></span>
                  )}
                  <span className="font-mono">
                    Detected {formatRelativeTime(task.detected_at)}
                  </span>
                </div>
                {task.jira_ticket_key && (
                  <span className="flex items-center gap-1 text-nexus-primary font-mono">
                    <ExternalLink className="w-3 h-3" />
                    {task.jira_ticket_key}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, MessageCircle } from "lucide-react";
import { memoryApi, workspaceApi, Problem } from "@/lib/api";

const severityColors = {
  high: "border-l-sev-high text-sev-high",
  medium: "border-l-sev-medium text-sev-medium",
  low: "border-l-sev-low text-sev-low",
};

export default function MemoryProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { workspaces } = await workspaceApi.list();
        if (workspaces && workspaces.length > 0) {
          const data = await memoryApi.listProblems(workspaces[0].id);
          setProblems(data);
        }
      } catch (err) {
        console.error("Failed to load problems:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center text-text-muted text-sm animate-pulse">Loading Problems...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Detected Problems
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Recurring issues identified across team discussions
        </p>
      </div>

      <div className="space-y-3">
        {problems.map((problem, index) => {
          const sev = (problem.severity || 'medium') as keyof typeof severityColors;
          return (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`bg-bg-surface border border-border-faint rounded-xl p-5 border-l-4 ${severityColors[sev].split(" ")[0]}`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${severityColors[sev].split(" ")[1]}`} />
                  <h3 className="text-sm font-medium text-text-primary">{problem.title}</h3>
                </div>
              <div className="flex items-center gap-1.5 text-2xs text-text-muted shrink-0">
                <MessageCircle className="w-3 h-3" />
                {problem.frequency} mentions
              </div>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed ml-6">
              {problem.description}
            </p>
          </motion.div>
          );
        })}
      </div>
    </div>
  );
}

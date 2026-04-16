"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { autofixApi, workspaceApi, Repository } from "@/lib/api";

const langColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  Python: "bg-yellow-500",
  Go: "bg-cyan-500",
  JavaScript: "bg-yellow-400",
  Rust: "bg-orange-500",
};

export default function ReposPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { workspaces } = await workspaceApi.list();
        if (workspaces && workspaces.length > 0) {
          const data = await autofixApi.listRepos(workspaces[0].id);
          setRepos(data);
        }
      } catch (err) {
        console.error("Failed to load repositories:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center text-text-muted text-sm animate-pulse">Loading Repositories...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Repositories
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Connected repositories monitored by AutoFix
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repos.map((repo, index) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-bg-surface border border-border-faint rounded-xl p-5 hover:border-autofix-border transition-all group cursor-pointer"
          >
            {/* Repo name */}
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="w-4 h-4 text-text-muted" />
              <span className="text-sm font-mono font-medium text-text-primary group-hover:text-autofix-primary transition-colors">
                {repo.name}
              </span>
            </div>

            {/* Language + Branch */}
            <div className="flex items-center gap-3 mb-4 text-2xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <div className={cn("w-2.5 h-2.5 rounded-full", "bg-blue-500")} />
                TypeScript
              </div>
              <span className="font-mono">{repo.default_branch}</span>
              <span className="font-mono">{repo.is_active ? "Active" : "Inactive"}</span>
            </div>

            {/* Integration status */}
            <div className="flex items-center gap-4 text-2xs">
              <div className={cn("flex items-center gap-1", "text-status-success")}>
                <CheckCircle className="w-3 h-3" />
                GitHub
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
